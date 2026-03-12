/* eslint-disable @next/next/no-img-element -- 스텁 페이지, 추후 next/image로 전환 예정 */
'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';

const ImageView = () => {
  const { addressId } = useParams();

  return (
    <div className="p-[15px]">
      <Swiper spaceBetween={50} slidesPerView={1}>
        <SwiperSlide>
          <img src="/path-to-image1.jpg" alt="Image 1" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/path-to-image2.jpg" alt="Image 2" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/path-to-image3.jpg" alt="Image 3" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ImageView;
