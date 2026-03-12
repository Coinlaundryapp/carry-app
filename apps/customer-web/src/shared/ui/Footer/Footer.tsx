import {
  ADDRESS,
  BUSINESS_NUMBER,
  BUSINESS_REGISTRATION,
  COPYRIGHT,
  CUSTOMER_SERVICE,
  EMAIL,
  REPRESENTATIVE,
} from '@shared/constants/business-info';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex flex-col gap-5 bg-white px-5 pt-10">
      <p className="font-label-1-reading font-bold">캐리</p>
      <div className="text-label-assistive font-caption-1 flex flex-col gap-2 font-medium">
        <p>사업자 등록번호 : {BUSINESS_NUMBER}</p>
        <p>대표 : {REPRESENTATIVE}</p>
        <p>주소 : {ADDRESS}</p>
        <p>이메일 : {EMAIL}</p>
        <p>통신판매업신고 : {BUSINESS_REGISTRATION}</p>
        <p>고객센터 : {CUSTOMER_SERVICE}</p>
        <p>{COPYRIGHT}</p>
      </div>
      <div className="text-label-assistive font-caption-1 flex items-center gap-2 font-medium">
        <Link href="#">이용약관</Link>
        <div className="bg-label-assistive h-3 w-[1px]" />
        <Link href="#">개인정보 처리방침</Link>
      </div>
    </footer>
  );
}
