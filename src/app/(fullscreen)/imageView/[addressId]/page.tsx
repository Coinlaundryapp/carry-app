'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

const ImageView = () => {
  const { addressId } = useParams();
  return <div>hi</div>;
};

export default ImageView;
