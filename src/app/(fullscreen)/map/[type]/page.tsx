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
  ArrowLeftIcon,
  GuidWashIcon,
  GuideDrayerIcon,
  GuideSneakerIcon,
  IndicatorIcon,
  MapBackIcon,
  UserCurrentMarkerIcon,
  SelectedCurrentUser,
} from '@assets/icons';
import CoinlaundryDefault from '@/components/map/CoinlaundryDefault';
import { useQuery } from '@tanstack/react-query';
import { getLaundromats } from '@/api/mapApi';
import { useSession } from 'next-auth/react';
import Loading from '@/app/loading';
import CoinlaundrySelectedItem from '@/components/map/CoinlaundrySelectedItem';
import { useParams, useRouter } from 'next/navigation';

export default function MapPage() {
  const { getLocation } = useGeoLocation();
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userPositionRef = useRef<naver.maps.LatLng | null>(null);
  const addressPositionRef = useRef<naver.maps.LatLng | null>(null);
  const offsetCenterRef = useRef<naver.maps.LatLng | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>(''); // 선택된 마커 ID 상태
  const [open, setOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12); // 줌 레벨 상태
  const [currentCenter, setCurrentCenter] = useState<naver.maps.LatLng | null | any>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOffsetMarkerVisible, setIsOffsetMarkerVisible] = useState(true);
  const [isUserMarkerVisible, setIsUserMarkerVisible] = useState(false);

  const session = useSession();
  const accessToken = session.data?.user?.accessToken;
  const { type } = useParams();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['laundromats', currentCenter],
    queryFn: () => getLaundromats(accessToken, currentCenter),
    enabled: !!accessToken && !!currentCenter,
  });

  // 배송지 또는 임시 설정 구역을 가져오는 함수
  const getLocationFromLocalStorage = () => {
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

    return offsetLocation;
  };

  const isMarkerCoveredByBottomSheet = (markerPosition: naver.maps.LatLng, map: naver.maps.Map) => {
    // 지도 projection 객체로 화면 픽셀 좌표로 변환
    const projection = map.getProjection();
    const markerPoint = projection.fromCoordToOffset(markerPosition);

    // 바텀시트의 y축 위치 및 높이 정의 (예시로 50vh 높이 가정)
    const bottomSheetHeight = window.innerHeight * 0.5; // 바텀시트가 50vh일 경우
    const bottomSheetTop = window.innerHeight - bottomSheetHeight;

    // 마커가 바텀시트 영역 아래에 있으면 true 반환
    return markerPoint.y > bottomSheetTop;
  };

  useEffect(() => {
    const offsetLocation = getLocationFromLocalStorage();
  }, []);

  const initMap = async () => {
    const location = await getLocation();

    if (type === 'order' && data) {
      setSelectedMarkerId(data[0].id);
      setSelectedItem(data[0]);
      setOpen(true);
    }

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
      });

      // **지도 중심 변경을 추적하여 상태에 저장**
      // naver.maps.Event.addListener(map, 'center_changed', () => {
      //   const newCenter = map.getCenter();

      //   setCurrentCenter({ lat: newCenter.y, lng: newCenter.x });
      // });

      naver.maps.Event.addListener(map, 'dragend', () => {
        // const newCenter = map.getCenter();
        // // setCurrentCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
        checkOffsetMarkerVisibility(map); // 드래그 후 오프셋 마커의 가시성 체크
      });

      if (offsetLocation) {
        new naver.maps.Circle({
          map: map,
          center: isUserMarkerVisible ? userPosition : offsetLocation,
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
            zIndex: selectedMarkerId === loc.id ? 60 : 0,
          });

          naver.maps.Event.addListener(marker, 'click', (e) => {
            setSelectedMarkerId(loc.id);
            setOpen(true);
            const selectedMarker = data.find((item: any) => item.id === loc.id);
            setSelectedItem(selectedMarker);
          });
        });

      if (offsetLocation) {
        const offsetMarker = new naver.maps.Marker({
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

  const checkOffsetMarkerVisibility = (map: naver.maps.Map) => {
    if (userPositionRef.current) {
      const bounds = map.getBounds();
      const isVisibleUser = bounds.hasPoint(userPositionRef.current);

      setIsUserMarkerVisible(isVisibleUser);
    }

    if (offsetCenterRef.current) {
      const bounds = map.getBounds();
      const isVisible = bounds.hasPoint(offsetCenterRef.current); // offset 마커가 현재 보이는지 체크
      const isCoveredByBottomSheet = isMarkerCoveredByBottomSheet(offsetCenterRef.current, map); // 바텀시트에 의해 가려졌는지 체크

      setIsOffsetMarkerVisible(isVisible); // 가시성 상태 업데이트
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
    setIsUserMarkerVisible(true);
    setIsOffsetMarkerVisible(false);
  };

  const handleReturnToAddressLocation = () => {
    if (mapRef.current && offsetCenterRef.current) {
      setCurrentCenter({
        lat: offsetCenterRef.current.lat(),
        lng: offsetCenterRef.current.lng(),
      });

      mapRef.current.setZoom(zoomLevel); // 현재 줌 레벨을 유지하면서 위치 변경
    }
    setIsUserMarkerVisible(false);
    setIsOffsetMarkerVisible(true);
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
  }, [selectedMarkerId, currentCenter, data]);

  const handleSelectedAddress = (addressId: string) => {
    setSelectedMarkerId(addressId);
    const selectedMarker = data.find((item: any) => item.id === addressId);
    setSelectedItem(selectedMarker);
    setOpen(false);
  };

  const handleBackClick = () => {
    if (type === 'order' || !selectedMarkerId) {
      return router.back();
    }
    if (selectedMarkerId) {
      setSelectedMarkerId('');
      getLocationFromLocalStorage(); // 함수 호출
      setOpen(false);
      setZoomLevel(12);
    }
  };

  if ((isLoading && !!data) || !currentCenter) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <div id="map" className="relative h-[100vh] w-full">
        <div className="absolute left-4 top-4 z-40" onClick={handleBackClick}>
          <ArrowLeftIcon />
        </div>
      </div>
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
              {isUserMarkerVisible ? <SelectedCurrentUser /> : <UserCurrentMarkerIcon />}
            </button>
            {!isOffsetMarkerVisible && (
              <button
                onClick={handleReturnToAddressLocation}
                className="font_label_1_normal absolute left-1/2 top-[-50px] flex -translate-x-1/2 transform items-center gap-2 rounded-xl bg-white p-2"
              >
                <MapBackIcon /> 배송지로 이동하기
              </button>
            )}

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
