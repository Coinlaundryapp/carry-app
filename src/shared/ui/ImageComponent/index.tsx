import Image from 'next/image';
import { useState } from 'react';
import DummyImage from '@assets/icons/Rectangle 1967.svg';

type TProps = {
  imageUrl: string;
};

const MyImageComponent = ({ imageUrl }: TProps) => {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading && <DummyImage />}
      <Image
        src={imageUrl}
        alt="Actual Image"
        width={500}
        height={500}
        onLoadingComplete={() => setLoading(false)} // 이미지가 로드 완료되면 loading 상태를 false로 변경
      />
    </div>
  );
};

export default MyImageComponent;
