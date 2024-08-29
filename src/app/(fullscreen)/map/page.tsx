'use client';

import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useEffect, useRef } from 'react';

const DUMMY_LOCATION = [
  { lat: 37.442706, lng: 127.135862 },
  { lat: 37.45, lng: 127.14 },
  { lat: 37.44, lng: 127.13 },
  { lat: 37.445, lng: 127.133 },
  { lat: 37.438, lng: 127.138 },
  { lat: 37.4475, lng: 127.1375 },
];

export default function MapPage() {
  const { getLocation } = useGeoLocation();
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userPositionRef = useRef<naver.maps.LatLng | null>(null);
  const offsetCenterRef = useRef<naver.maps.LatLng | null>(null);

  const initMap = async () => {
    const location = await getLocation();

    if (location) {
      const userPosition = new naver.maps.LatLng(location.latitude, location.longitude);
      userPositionRef.current = userPosition; // 사용자 위치를 ref에 저장

      const offsetCenter = new naver.maps.LatLng(location.latitude - 0.04, location.longitude);
      offsetCenterRef.current = offsetCenter;
      const map = new naver.maps.Map('map', {
        center: offsetCenter,
        zoom: 12,
      });

      mapRef.current = map; // 지도 객체를 ref에 저장

      const circle = new naver.maps.Circle({
        map: map,
        center: userPosition,
        radius: 3000,
        strokeColor: '#00B4B2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ADE4E5',
        fillOpacity: 0.5,
      });

      DUMMY_LOCATION.forEach((loc) => {
        new naver.maps.Marker({
          position: new naver.maps.LatLng(loc.lat, loc.lng),
          map: map,
        });
      });

      // 사용자의 위치에 마커를 추가합니다.
      new naver.maps.Marker({
        position: userPosition,
        map: map,
      });
    } else {
      console.error('위치를 가져올 수 없습니다.');
    }
  };

  const handleReturnToLocation = () => {
    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current); // 사용자의 위치로 지도의 중심 이동
    }
  };

  useEffect(() => {
    initMap();
  }, []);

  return (
    <div className="relative w-full">
      <div id="map" className="h-[100vh] w-full"></div>
      <button
        onClick={handleReturnToLocation}
        className="absolute left-4 top-4 rounded bg-blue-500 px-4 py-2 text-white"
      >
        내 위치로 이동
      </button>
    </div>
  );
}
