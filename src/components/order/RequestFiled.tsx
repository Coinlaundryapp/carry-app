export default function RequestField() {
  return (
    <section className="p-5">
      <h2 className="font-semibold text-label-strong font-headline-1">
        배송 요청사항 <span className="text-status-destructive">*</span>
      </h2>
      <div className="mt-6 flex items-center gap-3">
        <p className="font-semibold text-primary-normal font-label-1-normal">배송시 요청사항</p>
        <p className="font-medium text-label-neutral font-label-1-normal">요청사항 없음</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <p className="font-semibold text-primary-normal font-label-1-normal">공동현관 비밀번호</p>
        <p className="font-medium text-label-neutral font-label-1-normal">요청사항 없음</p>
      </div>
    </section>
  );
}
