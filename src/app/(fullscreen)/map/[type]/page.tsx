'use client';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useEffect, useRef, useState } from 'react';
import {
  markerIconHtml,
  selectedMarkerIconHtml,
  homeMarkerIconHtml,
  userMarkerIconHtml,
} from './marker';
import {
  GuidWashIcon,
  GuideDrayerIcon,
  GuideSneakerIcon,
  IndicatorIcon,
  MapBackIcon,
  UserCurrentMarkerIcon,
} from '@assets/icons';
import CoinlaundryDefault from '@/components/map/CoinlaundryDefault';
import { useQuery } from '@tanstack/react-query';
import { getLaundromats } from '@/api/mapApi';
import { useSession } from 'next-auth/react';
import Loading from '@/app/loading';
import CoinlaundrySelectedItem from '@/components/map/CoinlaundrySelectedItem';
import { useRouter } from 'next/navigation';

export default function MapPage() {
  const { getLocation } = useGeoLocation();
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userPositionRef = useRef<naver.maps.LatLng | null>(null);
  const addressPositionRef = useRef<naver.maps.LatLng | null>(null);
  const offsetCenterRef = useRef<naver.maps.LatLng | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null); // 선택된 마커 ID 상태
  const [open, setOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12); // 줌 레벨 상태
  const [isCurresntUser, setIsCurrentUser] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<naver.maps.LatLng | null | any>(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;

  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['laundromats', currentCenter],
    queryFn: () => getLaundromats(accessToken, currentCenter),
    enabled: !!accessToken && !!currentCenter,
  });

  useEffect(() => {
    const savedLocationString = localStorage.getItem('임시설정구역');
    const deliveryLocationString = localStorage.getItem('배송지');
    let offsetLocation;

    if (deliveryLocationString) {
      const deliveryLocation = JSON.parse(deliveryLocationString);
      offsetLocation = new naver.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng);
      setCurrentCenter({ lat: deliveryLocation.lat, lng: deliveryLocation.lng });
    } else if (savedLocationString) {
      const savedLocation = JSON.parse(savedLocationString);
      offsetLocation = new naver.maps.LatLng(savedLocation.lat, savedLocation.lng);
      setCurrentCenter({ lat: savedLocation.lat, lng: savedLocation.lng });
    }
  }, []);

  const initMap = async () => {
    const location = await getLocation();

    if (location) {
      const userPosition = new naver.maps.LatLng(location.latitude, location.longitude);
      userPositionRef.current = userPosition;

      const savedLocationString = localStorage.getItem('임시설정구역');

      let offsetLocation;
      if (savedLocationString) {
        const savedLocation = JSON.parse(savedLocationString);
        offsetLocation = new naver.maps.LatLng(savedLocation.lat, savedLocation.lng);

        offsetCenterRef.current = offsetLocation;
      } else {
        router.back();
      }

      // 배송지 또는 임시구역 장소
      const map = new naver.maps.Map('map', {
        center: currentCenter,
        zoom: zoomLevel, // 초기 줌 레벨 설정
        maxZoom: 17,
        minZoom: 11,
      });

      map.panBy({ x: 0, y: 200 });

      mapRef.current = map;

      // 줌 레벨 변경을 추적하여 상태에 저장
      naver.maps.Event.addListener(map, 'zoom_changed', () => {
        setZoomLevel(map.getZoom());
        // console.log('map.zoom', map.getZoom());
      });

      // **지도 중심 변경을 추적하여 상태에 저장**
      // naver.maps.Event.addListener(map, 'center_changed', () => {
      //   const newCenter = map.getCenter();

      //   setCurrentCenter({ lat: newCenter.y, lng: newCenter.x });
      // });

      if (offsetLocation) {
        new naver.maps.Circle({
          map: map,
          center: isCurresntUser ? userPosition : offsetLocation,
          radius: 3000,
          strokeColor: '#00B4B2',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#ADE4E5',
          fillOpacity: 0.5,
        });
      }

      data &&
        data.forEach((loc: any) => {
          const markerPosition = new naver.maps.LatLng(loc.latitude, loc.longitude); // 마커 위치 생성

          const marker = new naver.maps.Marker({
            position: markerPosition,
            map: map,
            icon: {
              content: selectedMarkerId === loc.id ? selectedMarkerIconHtml : markerIconHtml,
              size: new naver.maps.Size(32, 32),
              anchor: new naver.maps.Point(16, 16),
            },
            zIndex: 40,
          });

          naver.maps.Event.addListener(marker, 'click', (e) => {
            setSelectedMarkerId(loc.id);
            setOpen(true);
            const selectedMarker = data.find((item: any) => item.id === loc.id);
            setSelectedItem(selectedMarker);
          });
        });

      if (offsetLocation) {
        new naver.maps.Marker({
          position: offsetLocation,
          map: map,
          icon: {
            content: homeMarkerIconHtml,
            size: new naver.maps.Size(32, 32),
            anchor: new naver.maps.Point(16, 16),
          },
          zIndex: 50,
        });
      }

      new naver.maps.Marker({
        position: userPosition,
        map: map,
        icon: {
          content: userMarkerIconHtml,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
        zIndex: 50,
      });
    } else {
      console.error('위치를 가져올 수 없습니다.');
    }
  };

  const handleReturnToUserLocation = () => {
    if (mapRef.current && userPositionRef.current) {
      setCurrentCenter({
        lat: userPositionRef.current.lat(),
        lng: userPositionRef.current.lng(),
      });

      mapRef.current.setZoom(zoomLevel); // 현재 줌 레벨을 유지하면서 위치 변경
    }
    setIsCurrentUser(true);
  };

  const handleReturnToAddressLocation = () => {
    if (mapRef.current && offsetCenterRef.current) {
      setCurrentCenter({
        lat: offsetCenterRef.current.lat(),
        lng: offsetCenterRef.current.lng(),
      });

      mapRef.current.setZoom(zoomLevel); // 현재 줌 레벨을 유지하면서 위치 변경
    }
    setIsCurrentUser(false);
    setOpen(false);
  };

  useEffect(() => {
    // 테스트용으로 해놓음 아직 임시저장 구역이 api가 안되어있음
    const temporaryLocation = {
      lat: 37.6055942215336,
      lng: 126.920904663729,
    };

    // JSON 형태로 좌표를 로컬스토리지에 저장
    localStorage.setItem('임시설정구역', JSON.stringify(temporaryLocation));

    initMap(); // 지도는 처음 로드될 때만 초기화
  }, [selectedMarkerId, isCurresntUser, currentCenter, data]);

  const handleSelectedAddress = (addressId: string) => {
    setSelectedMarkerId(addressId);
    const selectedMarker = data.find((item: any) => item.id === addressId);
    setSelectedItem(selectedMarker);
    setOpen(true);
  };

  if (!currentCenter) {
  }

  if (isLoading && !!data) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <div id="map" className="h-[100vh] w-full"></div>
      <div
        className={`fixed inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-3xl bg-white transition-transform duration-500 ease-in-out ${
          true ? 'translate-y-0' : 'translate-y-full'
        } `}
      >
        <div className="h-full overflow-y-auto">
          <div className="mx-auto flex items-center justify-center py-1">
            <IndicatorIcon />
          </div>
          <div className="mr-5 flex justify-end gap-2">
            <div className="flex items-center gap-0.5">
              <GuidWashIcon />
              <span className="font_caption_1">세탁기</span>
            </div>

            <div className="flex items-center gap-0.5">
              <GuideDrayerIcon />
              <span className="font_caption_1">세탁기</span>
            </div>
            <div className="flex items-center gap-0.5">
              <GuideSneakerIcon />
              <span className="font_caption_1">세탁기</span>
            </div>
          </div>
          <div className="mt-1 text-center">
            <button
              onClick={handleReturnToUserLocation}
              className="z-70 absolute bottom-[100%] left-4"
            >
              <UserCurrentMarkerIcon />
            </button>
            <button
              onClick={handleReturnToAddressLocation}
              className="font_label_1_normal absolute left-1/2 top-[-50px] flex -translate-x-1/2 transform items-center gap-2 rounded-xl bg-white p-2"
            >
              <MapBackIcon /> 배송지로 이동하기
            </button>

            {open ? (
              <CoinlaundrySelectedItem data={selectedItem} />
            ) : (
              <CoinlaundryDefault onSelectedAddress={handleSelectedAddress} data={data} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
