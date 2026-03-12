'use client';

import { useState } from 'react';
import { IndicatorIcon, GuidWashIcon, GuideDrayerIcon, GuideSneakerIcon } from '@assets/icons';
import CoinlaundryDefault from '@features/map/ui/CoinlaundryDefault';
import CoinlaundrySelectedItem from '@features/map/ui/CoinlaundrySelectedItem';
import { TLaundromats } from '@features/map/types/map-type';

interface MapBottomPanelProps {
  open: boolean;
  selectedItem: TLaundromats | null;
  data: TLaundromats[] | undefined;
  onSelectedAddress: (addressId: number) => void;
  onImageClick: (e: React.MouseEvent, addressId: number) => void;
}

export default function MapBottomPanel({
  open,
  selectedItem,
  data,
  onSelectedAddress,
  onImageClick,
}: MapBottomPanelProps) {
  const [startY, setStartY] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedItem && selectedItem.reviewCount !== 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchY = e.touches[0].clientY;

    if (startY - touchY > 40) {
      setExpanded(true);
    }
    if (touchY - startY > 40) {
      setExpanded(false);
    }
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] translate-y-0 rounded-t-3xl bg-white transition-transform duration-500 ease-in-out">
      <div className="h-full overflow-y-auto">
        <div
          className="mx-auto flex items-center justify-center py-1"
          onTouchStart={open ? handleTouchStart : undefined}
          onTouchMove={open ? handleTouchMove : undefined}
        >
          <IndicatorIcon />
        </div>
        <div className="mr-5 flex justify-end gap-2">
          <div className="flex items-center gap-1.5">
            <GuidWashIcon />
            <span className="font_caption_1">세탁기</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GuideDrayerIcon />
            <span className="font_caption_1">건조기</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GuideSneakerIcon />
            <span className="font_caption_1">운동화</span>
          </div>
        </div>
        <div className="mt-1 text-center">
          {open ? (
            <CoinlaundrySelectedItem
              data={selectedItem!}
              expanded={expanded}
              onClickExpended={handleExpandClick}
              onImageClick={onImageClick}
            />
          ) : (
            <CoinlaundryDefault
              onSelectedAddress={onSelectedAddress}
              data={data ?? []}
              onImageClick={onImageClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
