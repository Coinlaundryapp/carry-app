'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useLocationStore } from '@/store/location-store';
import {
  markerIconHtml,
  selectedMarkerIconHtml,
  homeMarkerIconHtml,
  userMarkerIconHtml,
} from '@/app/(fullscreen)/map/[type]/marker';
import { TLaundromats } from '@/types/map-type';

interface UseNaverMapOptions {
  /** 'order' | 'map' 등 페이지 타입 */
  type: string;
}

export function useNaverMap({ type }: UseNaverMapOptions) {
  const router = useRouter();
  const { getLocation } = useGeoLocation();
  const { location } = useLocationStore();

  // ── Refs ──
  const mapRef = useRef<naver.maps.Map | null>(null);
  const userPositionRef = useRef<naver.maps.LatLng | null>(null);
  const offsetCenterRef = useRef<naver.maps.LatLng | null>(null);
  const previousSelectedMarkerRef = useRef<naver.maps.Marker | null>(null);
  const markersRef = useRef<{ id: number; marker: naver.maps.Marker }[]>([]);
  const userCircleRef = useRef<naver.maps.Circle | null>(null);
  const offsetCircleRef = useRef<naver.maps.Circle | null>(null);
  const userMarkerRef = useRef<naver.maps.Marker | null>(null);
  const dataRef = useRef<TLaundromats[] | undefined>(undefined);
  const currentCenterRef = useRef<any>(null);
  const isOrderInitRef = useRef(false);

  // ── State ──
  const [selectedMarkerId, setSelectedMarkerId] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<TLaundromats | null>(null);
  const [open, setOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [currentCenter, setCurrentCenter] = useState<any>(null);
  const [isOffsetMarkerVisible, setIsOffsetMarkerVisible] = useState(true);
  const [isUserMarkerVisible, setIsUserMarkerVisible] = useState(false);

  // ── 내부 유틸 ──
  const drawCircleAroundUser = useCallback(() => {
    userCircleRef.current?.setMap(null);
    if (mapRef.current && userPositionRef.current) {
      userCircleRef.current = new naver.maps.Circle({
        map: mapRef.current,
        center: userPositionRef.current,
        radius: 3000,
        strokeColor: '#00B4B2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ADE4E5',
        fillOpacity: 0.5,
      });
    }
  }, []);

  const drawCircleAroundOffset = useCallback(() => {
    offsetCircleRef.current?.setMap(null);
    if (mapRef.current && offsetCenterRef.current) {
      offsetCircleRef.current = new naver.maps.Circle({
        map: mapRef.current,
        center: offsetCenterRef.current,
        radius: 3000,
        strokeColor: '#00B4B2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#ADE4E5',
        fillOpacity: 0.5,
      });
    }
  }, []);

  const addUserMarker = useCallback(() => {
    userMarkerRef.current?.setMap(null);
    if (mapRef.current && userPositionRef.current) {
      userMarkerRef.current = new naver.maps.Marker({
        position: userPositionRef.current,
        map: mapRef.current,
        icon: {
          content: userMarkerIconHtml,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
        zIndex: 50,
      });
    }
  }, []);

  const checkVisibility = useCallback((map: naver.maps.Map) => {
    if (userPositionRef.current) {
      setIsUserMarkerVisible(map.getBounds().hasPoint(userPositionRef.current));
    }
    if (offsetCenterRef.current) {
      setIsOffsetMarkerVisible(map.getBounds().hasPoint(offsetCenterRef.current));
    }
  }, []);

  // ── 마커 클릭 ──
  const handleMarkerClick = useCallback((markerId: number) => {
    const data = dataRef.current;
    const selectedMarkerData = data?.find((item) => item.id === markerId);
    if (!selectedMarkerData) return;

    const selectedMarkerObj = markersRef.current.find((m) => m.id === markerId)?.marker;
    if (!selectedMarkerObj) {
      console.error(`Marker not found for ID: ${markerId}`);
      return;
    }

    setSelectedMarkerId(markerId);
    setSelectedItem(selectedMarkerData);
    setOpen(true);

    if (
      previousSelectedMarkerRef.current &&
      previousSelectedMarkerRef.current !== selectedMarkerObj
    ) {
      previousSelectedMarkerRef.current.setIcon({
        content: markerIconHtml,
        size: new naver.maps.Size(32, 32),
        anchor: new naver.maps.Point(16, 16),
      });
    }

    selectedMarkerObj.setIcon({
      content: selectedMarkerIconHtml,
      size: new naver.maps.Size(32, 32),
      anchor: new naver.maps.Point(16, 16),
    });
    selectedMarkerObj.setZIndex(15);
    previousSelectedMarkerRef.current = selectedMarkerObj;

    mapRef.current?.panTo(selectedMarkerObj.getPosition());
  }, []);

  // ── 지도 초기화 ──
  const initMap = useCallback(() => {
    const data = dataRef.current;
    const center = currentCenterRef.current;
    const savedLocationString = localStorage.getItem('임시설정구역');

    if (type === 'order' && data && !isOrderInitRef.current) {
      setSelectedMarkerId(data[0].id);
      setSelectedItem(data[0]);
      setOpen(true);
      isOrderInitRef.current = true;
    }

    let offsetLocation;
    if (savedLocationString) {
      const savedLocation = JSON.parse(savedLocationString);
      offsetLocation = new naver.maps.LatLng(savedLocation.lat, savedLocation.lng);
      offsetCenterRef.current = offsetLocation;
    } else {
      router.back();
      return;
    }

    // 기존 맵 인스턴스가 있으면 제거 (메모리 누수 방지)
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
    }

    const map = new naver.maps.Map('map', {
      center: center,
      zoom: 12,
      padding: { top: 10, bottom: 10, left: 10, right: 10 },
      maxZoom: 17,
      minZoom: 11,
      mapDataControl: false,
      scaleControl: false,
      scaleControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      mapDataControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      logoControlOptions: { position: naver.maps.Position.RIGHT_CENTER },
    });

    mapRef.current = map;

    naver.maps.Event.addListener(map, 'zoom_changed', () => {
      setZoomLevel(map.getZoom());
    });
    naver.maps.Event.addListener(map, 'dragend', () => {
      checkVisibility(map);
    });

    if (offsetCenterRef.current) {
      drawCircleAroundOffset();
    }

    // 마커 배치
    markersRef.current = [];
    data?.forEach((loc) => {
      const markerPosition = new naver.maps.LatLng(loc.latitude, loc.longitude);
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map,
        icon: {
          content: markerIconHtml,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
        zIndex: 0,
      });
      markersRef.current.push({ id: loc.id, marker });
      naver.maps.Event.addListener(marker, 'click', () => {
        handleMarkerClick(loc.id);
      });
    });

    if (offsetLocation) {
      new naver.maps.Marker({
        position: offsetLocation,
        map,
        icon: {
          content: homeMarkerIconHtml,
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
        zIndex: 50,
      });
    }

    if (userPositionRef.current) {
      addUserMarker();
    }
  }, [type, checkVisibility, drawCircleAroundOffset, addUserMarker, handleMarkerClick, router]);

  // ── 외부에서 data 주입 ──
  const setData = useCallback(
    (data: TLaundromats[] | undefined) => {
      const prevData = dataRef.current;
      dataRef.current = data;

      // data가 처음 로드되었을 때만 initMap 호출
      if (data && !prevData) {
        initMap();
      }
    },
    [initMap],
  );

  // ── 유저 위치로 복귀 ──
  const handleReturnToUserLocation = useCallback(async () => {
    const userlocation = await getLocation();

    if (userlocation && mapRef.current) {
      const userPosition = new naver.maps.LatLng(userlocation.latitude, userlocation.longitude);
      userPositionRef.current = userPosition;

      mapRef.current.setCenter(userPositionRef.current);
      mapRef.current.setZoom(zoomLevel);

      addUserMarker();
      drawCircleAroundUser();

      setIsUserMarkerVisible(true);
      setIsOffsetMarkerVisible(false);
    } else {
      console.warn('위치를 불러오지 못했습니다.');
    }
  }, [getLocation, zoomLevel, addUserMarker, drawCircleAroundUser]);

  // ── 배송지로 복귀 ──
  const handleReturnToAddressLocation = useCallback(() => {
    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current);
      mapRef.current.setZoom(zoomLevel);

      drawCircleAroundOffset();

      setIsUserMarkerVisible(false);
      setIsOffsetMarkerVisible(true);
    }
  }, [zoomLevel, drawCircleAroundOffset]);

  // ── 뒤로가기 ──
  const handleBackClick = useCallback(() => {
    if (type === 'order' || !selectedMarkerId) {
      return router.back();
    }

    setSelectedMarkerId(0);
    setOpen(false);
    setZoomLevel(12);

    markersRef.current.forEach(({ marker }) => {
      marker.setIcon({
        content: markerIconHtml,
        size: new naver.maps.Size(32, 32),
        anchor: new naver.maps.Point(16, 16),
      });
    });

    previousSelectedMarkerRef.current = null;

    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current);
      mapRef.current.setZoom(12);
    }
    if (!isOffsetMarkerVisible) {
      setIsOffsetMarkerVisible(true);
    }
  }, [type, selectedMarkerId, isOffsetMarkerVisible, router]);

  // ── 최초 위치 로드 ──
  useEffect(() => {
    const deliveryLocationString = localStorage.getItem('배송지');

    if (deliveryLocationString) {
      const deliveryLocation = JSON.parse(deliveryLocationString);
      const center = { lat: deliveryLocation.lat, lng: deliveryLocation.lng };
      currentCenterRef.current = center;
      setCurrentCenter(center);
    } else if (location) {
      const temporaryLocation = { lat: 37.6055942215336, lng: 126.920904663729 };
      const center = { lat: temporaryLocation.lat, lng: temporaryLocation.lng };
      currentCenterRef.current = center;
      setCurrentCenter(center);
    }
  }, [location]);

  return {
    // 상태
    selectedMarkerId,
    selectedItem,
    open,
    currentCenter,
    isOffsetMarkerVisible,
    isUserMarkerVisible,

    // data 주입
    setData,

    // 핸들러
    handleMarkerClick,
    handleBackClick,
    handleReturnToUserLocation,
    handleReturnToAddressLocation,
    initMap,
  };
}
