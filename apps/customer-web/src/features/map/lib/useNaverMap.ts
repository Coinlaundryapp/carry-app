'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGeoLocation } from '@features/location/lib/useGeoLocation';
import { useLocationStore } from '@features/location/model/location-store';
import { useMapStore } from '@features/map/model/map-store';
import {
  markerIconHtml,
  selectedMarkerIconHtml,
  homeMarkerIconHtml,
  userMarkerIconHtml,
} from '@/app/(fullscreen)/map/[type]/marker';
import { TLaundromats } from '@features/map/types/map-type';
import { STORAGE_KEYS } from '@features/map/lib/constants';
import {
  createMarkerIconOptions,
  createCircleOptions,
  createMapOptions,
  parseStoredLocation,
} from '@features/map/lib/map-utils';

interface UseNaverMapOptions {
  /** 'order' | 'map' 등 페이지 타입 */
  type: string;
}

export function useNaverMap({ type }: UseNaverMapOptions) {
  const router = useRouter();
  const { getLocation } = useGeoLocation();
  const { location } = useLocationStore();

  // ── Store ──
  const {
    selectedMarkerId,
    setSelectedMarkerId,
    selectedItem,
    setSelectedItem,
    open,
    setOpen,
    zoomLevel,
    setZoomLevel,
    isOffsetMarkerVisible,
    setIsOffsetMarkerVisible,
    isUserMarkerVisible,
    setIsUserMarkerVisible,
  } = useMapStore();

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

  // ── Local State (naver.maps 좌표 의존) ──
  const [currentCenter, setCurrentCenter] = useState<any>(null);

  // ── 내부 유틸 ──
  const drawCircleAroundUser = useCallback(() => {
    userCircleRef.current?.setMap(null);
    if (mapRef.current && userPositionRef.current) {
      const pos = userPositionRef.current;
      const opts = createCircleOptions({ lat: pos.lat(), lng: pos.lng() });
      userCircleRef.current = new naver.maps.Circle({
        map: mapRef.current,
        center: userPositionRef.current,
        radius: opts.radius,
        strokeColor: opts.strokeColor,
        strokeOpacity: opts.strokeOpacity,
        strokeWeight: opts.strokeWeight,
        fillColor: opts.fillColor,
        fillOpacity: opts.fillOpacity,
      });
    }
  }, []);

  const drawCircleAroundOffset = useCallback(() => {
    offsetCircleRef.current?.setMap(null);
    if (mapRef.current && offsetCenterRef.current) {
      const pos = offsetCenterRef.current;
      const opts = createCircleOptions({ lat: pos.lat(), lng: pos.lng() });
      offsetCircleRef.current = new naver.maps.Circle({
        map: mapRef.current,
        center: offsetCenterRef.current,
        radius: opts.radius,
        strokeColor: opts.strokeColor,
        strokeOpacity: opts.strokeOpacity,
        strokeWeight: opts.strokeWeight,
        fillColor: opts.fillColor,
        fillOpacity: opts.fillOpacity,
      });
    }
  }, []);

  const addUserMarker = useCallback(() => {
    userMarkerRef.current?.setMap(null);
    if (mapRef.current && userPositionRef.current) {
      const iconOpts = createMarkerIconOptions(userMarkerIconHtml);
      userMarkerRef.current = new naver.maps.Marker({
        position: userPositionRef.current,
        map: mapRef.current,
        icon: {
          content: iconOpts.content,
          size: new naver.maps.Size(iconOpts.size.w, iconOpts.size.h),
          anchor: new naver.maps.Point(iconOpts.anchor.x, iconOpts.anchor.y),
        },
        zIndex: 50,
      });
    }
  }, []);

  const checkVisibility = useCallback(
    (map: naver.maps.Map) => {
      if (userPositionRef.current) {
        setIsUserMarkerVisible(map.getBounds().hasPoint(userPositionRef.current));
      }
      if (offsetCenterRef.current) {
        setIsOffsetMarkerVisible(map.getBounds().hasPoint(offsetCenterRef.current));
      }
    },
    [setIsUserMarkerVisible, setIsOffsetMarkerVisible],
  );

  // ── 마커 클릭 ──
  const handleMarkerClick = useCallback(
    (markerId: number) => {
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

      const defaultIcon = createMarkerIconOptions(markerIconHtml);
      if (
        previousSelectedMarkerRef.current &&
        previousSelectedMarkerRef.current !== selectedMarkerObj
      ) {
        previousSelectedMarkerRef.current.setIcon({
          content: defaultIcon.content,
          size: new naver.maps.Size(defaultIcon.size.w, defaultIcon.size.h),
          anchor: new naver.maps.Point(defaultIcon.anchor.x, defaultIcon.anchor.y),
        });
      }

      const selectedIcon = createMarkerIconOptions(selectedMarkerIconHtml);
      selectedMarkerObj.setIcon({
        content: selectedIcon.content,
        size: new naver.maps.Size(selectedIcon.size.w, selectedIcon.size.h),
        anchor: new naver.maps.Point(selectedIcon.anchor.x, selectedIcon.anchor.y),
      });
      selectedMarkerObj.setZIndex(15);
      previousSelectedMarkerRef.current = selectedMarkerObj;

      mapRef.current?.panTo(selectedMarkerObj.getPosition());
    },
    [setSelectedMarkerId, setSelectedItem, setOpen],
  );

  // ── 지도 초기화 ──
  const initMap = useCallback(() => {
    const data = dataRef.current;
    const center = currentCenterRef.current;
    const savedLocation = parseStoredLocation(STORAGE_KEYS.TEMP_REGION);

    if (type === 'order' && data && !isOrderInitRef.current) {
      setSelectedMarkerId(data[0].id);
      setSelectedItem(data[0]);
      setOpen(true);
      isOrderInitRef.current = true;
    }

    let offsetLocation;
    if (savedLocation) {
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

    const mapOpts = createMapOptions(center);
    const map = new naver.maps.Map('map', {
      center: center,
      zoom: mapOpts.zoom,
      padding: mapOpts.padding,
      maxZoom: mapOpts.maxZoom,
      minZoom: mapOpts.minZoom,
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
    const defaultIcon = createMarkerIconOptions(markerIconHtml);
    markersRef.current = [];
    data?.forEach((loc) => {
      const markerPosition = new naver.maps.LatLng(loc.latitude, loc.longitude);
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map,
        icon: {
          content: defaultIcon.content,
          size: new naver.maps.Size(defaultIcon.size.w, defaultIcon.size.h),
          anchor: new naver.maps.Point(defaultIcon.anchor.x, defaultIcon.anchor.y),
        },
        zIndex: 0,
      });
      markersRef.current.push({ id: loc.id, marker });
      naver.maps.Event.addListener(marker, 'click', () => {
        handleMarkerClick(loc.id);
      });
    });

    if (offsetLocation) {
      const homeIcon = createMarkerIconOptions(homeMarkerIconHtml);
      new naver.maps.Marker({
        position: offsetLocation,
        map,
        icon: {
          content: homeIcon.content,
          size: new naver.maps.Size(homeIcon.size.w, homeIcon.size.h),
          anchor: new naver.maps.Point(homeIcon.anchor.x, homeIcon.anchor.y),
        },
        zIndex: 50,
      });
    }

    if (userPositionRef.current) {
      addUserMarker();
    }
  }, [
    type,
    checkVisibility,
    drawCircleAroundOffset,
    addUserMarker,
    handleMarkerClick,
    router,
    setSelectedMarkerId,
    setSelectedItem,
    setOpen,
    setZoomLevel,
  ]);

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
  }, [
    getLocation,
    zoomLevel,
    addUserMarker,
    drawCircleAroundUser,
    setIsUserMarkerVisible,
    setIsOffsetMarkerVisible,
  ]);

  // ── 배송지로 복귀 ──
  const handleReturnToAddressLocation = useCallback(() => {
    if (mapRef.current && offsetCenterRef.current) {
      mapRef.current.setCenter(offsetCenterRef.current);
      mapRef.current.setZoom(zoomLevel);

      drawCircleAroundOffset();

      setIsUserMarkerVisible(false);
      setIsOffsetMarkerVisible(true);
    }
  }, [zoomLevel, drawCircleAroundOffset, setIsUserMarkerVisible, setIsOffsetMarkerVisible]);

  // ── 뒤로가기 ──
  const handleBackClick = useCallback(() => {
    if (type === 'order' || !selectedMarkerId) {
      return router.back();
    }

    setSelectedMarkerId(0);
    setOpen(false);
    setZoomLevel(12);

    const defaultIcon = createMarkerIconOptions(markerIconHtml);
    markersRef.current.forEach(({ marker }) => {
      marker.setIcon({
        content: defaultIcon.content,
        size: new naver.maps.Size(defaultIcon.size.w, defaultIcon.size.h),
        anchor: new naver.maps.Point(defaultIcon.anchor.x, defaultIcon.anchor.y),
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
  }, [
    type,
    selectedMarkerId,
    isOffsetMarkerVisible,
    router,
    setSelectedMarkerId,
    setOpen,
    setZoomLevel,
    setIsOffsetMarkerVisible,
  ]);

  // ── 최초 위치 로드 ──
  useEffect(() => {
    const deliveryLocation = parseStoredLocation(STORAGE_KEYS.DELIVERY_ADDRESS);

    if (deliveryLocation) {
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
