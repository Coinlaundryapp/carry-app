'use client';

import Button from '@/components/share/Button/Button';
import { TopNavigation } from '@/components/share/TopNavigation';
import { useModalStore } from '@/store/modal-store';
import { useReviewStore } from '@/store/review-store';
import { useRouter } from 'next/navigation';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { text } = useReviewStore();
  const { openModal } = useModalStore();
  const isValidReview = text.length >= 10 && text.length <= 300;

  const handleClick = () => {};

  return (
    <div className="relative h-full overflow-scroll">
      <TopNavigation type="back" title="리뷰 작성" leftClick={() => router.back()} />
      <div>{children}</div>
      <div className="absolute bottom-0 w-full border-t border-gray-200 bg-white p-6">
        <Button
          className=""
          state={isValidReview ? 'fillPrimary' : 'fillSecondary'}
          size="full"
          onClick={handleClick}
          disabled={!isValidReview}
        >
          등록하기
        </Button>
      </div>
    </div>
  );
}
