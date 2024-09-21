'use client';

import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useEffect, useRef, useState } from 'react';
import { markerIconHtml, selectedMarkerIconHtml, homeMarkerIconHtml } from './marker';
import { MapBackIcon, UserCurrentMarkerIcon } from '@assets/icons';
import CoinlaundryDefault from '@/components/map/CoinlaundryDefault';
import { Drawer, DrawerContent } from '@/components/share/ui/drawer';

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
  const [open, setOpen] = useState(true);

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

  const handleReturnToUserLocation = () => {
    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current);
    }
  };
  const handleReturnToAddressLocation = () => {};

  useEffect(() => {
    initMap();
  }, [selectedMarkerId]);

  return (
    <div className="w-full">
      <div id="map" className="h-[100vh] w-full"></div>

      {/* <div className="absolute bottom-0 left-0 z-50 w-full bg-red-400"> */}
      <div className="relative">
        <Drawer
          open={open}
          onOpenChange={setOpen}
          scrollLockTimeout={3000}
          shouldShowOverlay={false}
          closable={false}
        >
          <DrawerContent showIndicator={false} className="max-h-[52vh]">
            <button onClick={handleReturnToUserLocation} className="absolute left-4 top-[-56px]">
              <UserCurrentMarkerIcon />
            </button>
            <button
              onClick={handleReturnToAddressLocation}
              className="font_label_1_normal absolute left-1/2 top-[-53px] flex -translate-x-1/2 transform items-center gap-2 rounded-xl bg-white p-2"
            >
              <MapBackIcon /> 배송지로 이동하기
            </button>

            <CoinlaundryDefault open={open} type="all" />
          </DrawerContent>
        </Drawer>
      </div>

      {/* </div> */}
    </div>
  );
}
