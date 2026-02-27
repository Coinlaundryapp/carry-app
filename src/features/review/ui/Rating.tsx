import { ReviewStar } from '@assets/icons';
import React from 'react';

const Rating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => {
        const isPartialStar = Math.ceil(rating) === index + 1 && !Number.isInteger(rating);

        if (isPartialStar) {
          return (
            <div key={`star-${index}`} className="relative">
              {/* 회색 배경 별 */}
              <ReviewStar style={{ color: '#EAEBEC' }} />
              {/* 노란색 반 별 */}
              <div className="absolute left-0 top-0 w-1/2 overflow-hidden">
                <ReviewStar style={{ color: '#FADB14' }} />
              </div>
            </div>
          );
        }

        return <ReviewStar key={`star-${index}`} style={{ color: index < rating ? '#FFD700' : '#EAEBEC' }} />;
      })}
    </div>
  );
};

export default Rating;
