import { useReviewStore } from '@features/review/model/review-store';

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;
function ReviewTextarea() {
  const { text, setText } = useReviewStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    setText(inputText);
  };

  return (
    <div className="">
      <textarea
        value={text}
        onChange={handleChange}
        className="h-[160px] w-full resize-none rounded-lg border border-gray-200 p-5 outline-none transition-colors focus:border-gray-300"
        placeholder="최소 10자 이상 작성해주세요. 서비스에 대한 좋았던 점, 아쉬웠던 점을 솔직하게 작성해 주시면 많은 도움이 됩니다:)"
        maxLength={MAX_LENGTH}
      />
      <div className="pr-1 text-end text-sm text-gray-400">
        {text.length}/{MAX_LENGTH}
      </div>
    </div>
  );
}

export default ReviewTextarea;
