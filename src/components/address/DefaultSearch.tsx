import { SEARCH_TEXT } from '@/constants/address-search';
import React from 'react';

function DefaultSearch() {
  return (
    <div>
      <div className="p-[20px] text-gray-900">
        <p className="font_body_1_normal mb-[20px] font-medium">이렇게 검색해보세요.</p>
        <ul className="list-inside list-disc space-y-2">
          {SEARCH_TEXT.map((item) => (
            <li key={item.main}>
              <span className=" font_label_1_normal font-medium">{item.main}</span>
              <br />
              <span className="font_caption_1 pl-6 text-label-alternative font-normal">예시) {item.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DefaultSearch;
