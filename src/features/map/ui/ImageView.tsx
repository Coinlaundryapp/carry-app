'use client';
import React, { useRef } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { TopNavigation } from '@shared/ui/TopNavigation';
import SwiperCore from 'swiper';
import type { MediaResource } from '@features/map/types/map-type';

type TProps = {
  images: MediaResource[];
  onCloseImageView: () => void;
};
const ImageView = ({ images, onCloseImageView }: TProps) => {
  const swiperRef = useRef<SwiperCore>();

  const handleThumbnailClick = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  return (
    <>
      <TopNavigation type="back" title="이미지 상세보기 " leftClick={onCloseImageView} />

      <div className="flex h-[calc(100vh-52px)] flex-col px-[15px] pb-[70px]">
        <div className="flex flex-1 items-center justify-center">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            loop={true}
            navigation={true}
            pagination={{ clickable: true }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {images &&
              images?.map(({ mediaUrl }: { mediaUrl: string }) => {
                return (
                  <SwiperSlide key={mediaUrl}>
                    <img src={mediaUrl} alt="" className="cursor-pointer rounded-md" />
                  </SwiperSlide>
                );
              })}
          </Swiper>
        </div>

        <div className="flex h-[96px] justify-between gap-2">
          {images &&
            images.map(({ mediaUrl }: { mediaUrl: string }, index: number) => (
              <div key={mediaUrl} className="h-[96px] flex-1 overflow-hidden">
                <img
                  onClick={() => handleThumbnailClick(index)}
                  src={mediaUrl}
                  alt=""
                  className="h-full w-full cursor-pointer rounded-md object-cover"
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default ImageView;
