'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@shared/ui/Input';
import { AddressSearchNoLIst, CancelIcon, SearchIcon } from '@assets/icons';
import { useAddressStore } from '@features/address/model/address-store';
import { debounce } from 'es-toolkit';
import DefaultSearch from './DefaultSearch';
import { getAddressSearchList } from '@features/address/api/addressApi';
import type { TGetAddressSearchListRes } from '@shared/types/api-types';

type AddressSearchItem = TGetAddressSearchListRes['content'][number];

type TPros = {
  onAddressChange: (value: string) => void;
};

function SearchForm({ onAddressChange }: TPros) {
  const { addressModalOpen, setAddressModalOpen } = useAddressStore();
  const [value, setValue] = useState('');
  const [page, setPage] = useState(1);
  const [addresses, setAddresses] = useState<AddressSearchItem[]>([]);
  const [addressSearchState, setAddressSearchState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  const handleClick = (address: AddressSearchItem) => {
    setValue(address.regionAddress.addressName);
    onAddressChange(address.regionAddress.addressName);
    setAddressModalOpen(false);
    setAddressSearchState(false);
  };
  const debouncedSearch = useRef(
    debounce(async (inputValue: string) => {
      if (inputValue.trim() !== '') {
        setIsLoading(true);
        try {
          const result = await getAddressSearchList(inputValue, 1);
          setAddresses(result.content);
          setPage(1);
          setHasNext(result.pagination.hasNext);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAddressSearchState(false);
        setAddresses([]);
      }
    }, 800),
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);

    setAddressSearchState(true);

    debouncedSearch(inputValue);
  };

  const fetchMoreAddresses = async (page: number) => {
    if (!addressSearchState || !hasNext) return;
    try {
      const result = await getAddressSearchList(value, page);

      setHasNext(result.pagination.hasNext);
    } catch (error) {
      console.error('Error fetching more addresses:', error);
    }
  };

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && addressSearchState && !isLoading && hasNext) {
        setPage((prevPage) => prevPage + 1);
      }
    },
    [addressSearchState, isLoading, hasNext],
  );

  const handleCancelClick = () => {
    setAddressSearchState(false);
    setAddresses([]);
    setValue('');
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [handleObserver]);

  useEffect(() => {
    if (page > 1 && addressSearchState) {
      fetchMoreAddresses(page);
    }
  }, [page]);

  return (
    <div className="relative flex h-full w-full flex-col">
     
      <Input
        leftIcon={<SearchIcon />} 
        status="default"
       onClear={handleCancelClick}
        type="text"
        fontStyle="strong"
        onChange={handleChange}
        value={value}
        placeholder="건물, 지번 또는 도로명 검색"
        className="relative px-6 py-5"
      />
      <div className="h-2 w-full bg-cool-neutral-99" />

      {!addressSearchState ? (
        <DefaultSearch />
      ) : addresses.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          {addresses.map((address, index) => (
            <div
              onClick={() => handleClick(address)}
              key={index}
              className="flex cursor-pointer flex-col gap-2 px-5 "
            >
              <div className="border-b border-cool-neutral-99 pb-4 pt-4 ">
                <p className="font_label_1_norm mb-1 font-medium">{address.addressName}</p>
                <p className="flex items-center justify-start gap-2 text-sm text-gray-500 font-normal">
                  <span className="font_caption_2 rounded-sm border-0.5 border-cool-neutral-96 py-0.5 px-1 text-cool-neutral-80">
                    지번
                  </span>
                  {address.regionAddress.addressName}
                </p>
              </div>
            </div>
          ))}
          <div ref={loader} className="h-4" />
        </div>
      ) : (
        <div className="  pt-[116px] flex items-center justify-center">
          <AddressSearchNoLIst />
        </div>
      )}
    </div>
  );
}

export default SearchForm;
