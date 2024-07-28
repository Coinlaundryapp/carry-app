import React from 'react';

export type TBasicModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
};

const BasicModal: React.FC<TBasicModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[318px] h-[219px] p-4 rounded shadow-md flex flex-col items-center justify-between">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold mb-2">{title}</h2>
          <p className="mb-4 text-center">{content}</p>
        </div>
        <div className="flex space-x-2 w-full justify-end">
          <button
            className="bg-white p-2 rounded w-[129px] h-[52px] shadow-md"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="w-[129px] h-[52px] bg-primary-normal text-white p-2 rounded"
            onClick={onConfirm}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicModal;
