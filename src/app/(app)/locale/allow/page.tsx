'use client';

import { useRouter } from 'next/navigation';

const AllowLocationPage = () => {
  const rotuer = useRouter();

  return (
    <div>
      <button onClick={() => rotuer.push('locale/select')}>맞아요</button>
      <button onClick={() => rotuer.push('locale/select')}>아니에요</button>
    </div>
  );
};

export default AllowLocationPage;
