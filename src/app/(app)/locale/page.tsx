'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LocalePage = () => {
  const rotuer = useRouter();
  const [isServiceActive, setIsServiceActive] = useState<boolean>(true);

  return (
    <div>
      <button
        // 위치 허용 O
        onClick={() => {
          if (isServiceActive) {
            // 서비스 가능 지역
            rotuer.push('locale/allow');
          } else {
            // 서비스 불가 지역
            // FIXME: 모달 변경
            alert('서비스 불가 지역이에요!');
          }
        }}
      >
        허용하기
      </button>
      <button
        // 위치 허용 X
        onClick={() => {
          // FIXME: 모달 변경
          alert('서비스를 이용 할 수 없어요');
        }}
      >
        나중에하기
      </button>
    </div>
  );
};

export default LocalePage;
