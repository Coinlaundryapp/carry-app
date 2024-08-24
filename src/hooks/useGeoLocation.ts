'use client';

import { useState } from 'react';

type LocationType = {
  latitude: number;
  longitude: number;
};

export const useGeoLocation = () => {
  // const [location, setLocation] = useState<LocationType>();
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getLocation = async (): Promise<LocationType | null> => {
    if (!navigator.geolocation) {
      setErrorMsg('해당 브라우저에서는 위치정보가 지원되지 않습니다.');
    }

    setErrorMsg('');

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve(location);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setErrorMsg('사용자가 위치 정보를 제공허는 것을 거부했습니다. ');
              break;
            case error.POSITION_UNAVAILABLE:
              setErrorMsg('위치 정보를 사용할 수 없습니다.');
              break;
            case error.TIMEOUT:
              setErrorMsg('위치 정보를 가져오는 요청이 시간 초과되었습니다.');
              break;
            default:
              setErrorMsg('알 수 없는 오류가 발생했습니다.');
              break;
          }

          resolve(null);
        },
      );
    });
  };

  return {
    getLocation,
    errorMsg,
  };
};
