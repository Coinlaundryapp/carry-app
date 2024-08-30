'use client';

import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useEffect, useRef, useState } from 'react';
import { markerIconHtml, selectedMarkerIconHtml, homeMarkerIconHtml } from './marker';

const DUMMY_LOCATION = [
  { id: 1, lat: 37.442706, lng: 127.135862 },
  { id: 2, lat: 37.45, lng: 127.14 },
  { id: 3, lat: 37.44, lng: 127.13 },
  { id: 4, lat: 37.445, lng: 127.133 },
  { id: 5, lat: 37.438, lng: 127.138 },
  { id: 6, lat: 37.4475, lng: 127.1375 },
];

export default function MapPage() {
  const { getLocation } = useGeoLocation();
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userPositionRef = useRef<naver.maps.LatLng | null>(null);
  const addressPositionRef = useRef<naver.maps.LatLng | null>(null);
  const offsetCenterRef = useRef<naver.maps.LatLng | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null); // 선택된 마커 ID 상태

  const initMap = async () => {
    const location = await getLocation();

    if (location) {
      const userPosition = new naver.maps.LatLng(location.latitude, location.longitude);
      userPositionRef.current = userPosition;

      const offsetCenter = new naver.maps.LatLng(location.latitude - 0.04, location.longitude);
      offsetCenterRef.current = offsetCenter;
      const map = new naver.maps.Map('map', {
        center: offsetCenter,
        zoom: 12,
      });

      mapRef.current = map;

      new naver.maps.Circle({
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
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(loc.lat, loc.lng),
          map: map,
          icon: {
            content: selectedMarkerId === loc.id ? selectedMarkerIconHtml : markerIconHtml,
            size: new naver.maps.Size(32, 32),
            anchor: new naver.maps.Point(16, 16),
          },
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedMarkerId(loc.id);
        });
      });

      new naver.maps.Marker({
        position: userPosition,
        map: map,
        icon: {
          content: homeMarkerIconHtml,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
      });
    } else {
      console.error('위치를 가져올 수 없습니다.');
    }
  };

  const handleReturnToLocation = () => {
    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current);
    }
  };

  useEffect(() => {
    initMap();
  }, [selectedMarkerId]); // 선택된 마커 ID가 변경될 때마다 지도를 업데이트

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
