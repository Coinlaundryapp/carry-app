'use client';

import {
  ArrowLeftIcon,
  MapBackIcon,
  UserCurrentMarkerIcon,
  SelectedCurrentUser,
} from '@assets/icons';

interface MapControlOverlayProps {
  isUserMarkerVisible: boolean;
  isOffsetMarkerVisible: boolean;
  onBackClick: () => void;
  onReturnToUserLocation: () => void;
  onReturnToAddressLocation: () => void;
}

export default function MapControlOverlay({
  isUserMarkerVisible,
  isOffsetMarkerVisible,
  onBackClick,
  onReturnToUserLocation,
  onReturnToAddressLocation,
}: MapControlOverlayProps) {
  return (
    <>
      {/* 뒤로가기 버튼 */}
      <div className="absolute left-4 top-4 z-40" onClick={onBackClick}>
        <ArrowLeftIcon />
      </div>

      {/* 내 위치 버튼 */}
      <button
        onClick={onReturnToUserLocation}
        className="z-70 absolute bottom-0 left-4"
      >
        {isUserMarkerVisible ? <SelectedCurrentUser /> : <UserCurrentMarkerIcon />}
      </button>

      {/* 서비스 지역으로 이동 */}
      {!isOffsetMarkerVisible && (
        <button
          onClick={onReturnToAddressLocation}
          className="font_label_1_normal absolute left-1/2 top-[-50px] flex -translate-x-1/2 transform items-center gap-2 rounded-xl bg-white p-2"
        >
          <MapBackIcon /> 서비스지역으로 이동하기
        </button>
      )}
    </>
  );
}
