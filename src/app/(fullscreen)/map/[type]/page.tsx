'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getLaundromats } from '@features/map/api/mapApi';
import { useNaverMap } from '@features/map/lib/useNaverMap';
import Loading from '@/app/loading';
import ImageView from '@features/map/ui/ImageView';
import MapBottomPanel from '@features/map/ui/MapBottomPanel';
import MapControlOverlay from '@features/map/ui/MapControlOverlay';

type TImages = {
  mediaUrl: string;
  extension: string;
};

export default function MapPage() {
  const { type } = useParams();

  // ── 이미지 뷰 상태 ──
  const [isImageView, setIsImageView] = useState(false);
  const [selectedImages, setSelectedImages] = useState<TImages[]>([]);
  const wasImageViewRef = useRef(false);

  // ── 맵 컨트롤러 (data는 아래 useEffect에서 주입) ──
  const map = useNaverMap({ type: type as string });

  // ── 세탁소 데이터 조회 ──
  const { data, isLoading } = useQuery({
    queryKey: ['laundromats', map.currentCenter],
    queryFn: () => getLaundromats(map.currentCenter),
    enabled: !!map.currentCenter,
  });

  // ── data가 로드되면 맵에 주입 ──
  useEffect(() => {
    map.setData(data);
  }, [data, map.setData]);

  // ── 이미지 뷰에서 복귀 시 맵 재초기화 (DOM 업데이트 후 실행) ──
  useEffect(() => {
    if (wasImageViewRef.current && !isImageView) {
      map.initMap();
    }
    wasImageViewRef.current = isImageView;
  }, [isImageView, map.initMap]);

  // ── 이미지 핸들러 ──
  const handleImageClick = (e: React.MouseEvent, addressId: number) => {
    e.stopPropagation();
    if (data) {
      const images = data.find((item) => item.id === addressId);
      if (images) setSelectedImages(images.mediaResources);
      setIsImageView(true);
    }
  };

  const handleCloseImageView = () => {
    setIsImageView(false);
    // initMap은 위 useEffect에서 DOM 업데이트 후 호출됨
  };

  // ── 로딩/이미지뷰 분기 ──
  if (!map.currentCenter || (isLoading && !data)) {
    return <Loading />;
  }

  if (isImageView) {
    return <ImageView images={selectedImages} onCloseImageView={handleCloseImageView} />;
  }

  return (
    <div className="h-full w-full">
      <div id="map" className="relative h-[55vh] w-full">
        <MapControlOverlay
          isUserMarkerVisible={map.isUserMarkerVisible}
          isOffsetMarkerVisible={map.isOffsetMarkerVisible}
          onBackClick={map.handleBackClick}
          onReturnToUserLocation={map.handleReturnToUserLocation}
          onReturnToAddressLocation={map.handleReturnToAddressLocation}
        />
      </div>
      <MapBottomPanel
        open={map.open}
        selectedItem={map.selectedItem}
        data={data}
        onSelectedAddress={map.handleMarkerClick}
        onImageClick={handleImageClick}
      />
    </div>
  );
}
