'use client';

import { useModalStore } from '@shared/model/modal-store';
import { DeliveryManSadIcon, ModalOkIcon } from '@assets/icons';
import { cva } from 'class-variance-authority';
import { useEffect, useRef } from 'react';

const buttonVariants = cva('w-full h-[52px] text-center rounded-lg', {
  variants: {
    type: {
      confirm: 'bg-static-white font-body-1-normal font-semibold text-static-black shadow-button',
      basic: 'bg-primary-normal font-body-1-reading font-semibold text-static-white',
    },
  },
});
export default function Modal() {
  const {
    isOpen,
    title,
    description,
    confirmText,
    closeText,
    type,
    image,
    onClose,
    onConfirm,
    closeModal,
  } = useModalStore();

  const modalRef = useRef<HTMLDivElement>(null);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }

    closeModal();
  };
  const handleClose = () => {
    onClose && onClose();
    closeModal();
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-9">
      <div
        ref={modalRef}
        className="relative flex h-[220px] w-full flex-col items-center justify-between gap-1 rounded-xl bg-white pb-4 pt-3"
      >
        {image === 'sad' && (
          <div className="absolute -top-[70px] flex w-full justify-center">
            <DeliveryManSadIcon />
          </div>
        )}
        {image === 'check' && (
          <div className="absolute -top-[45px] flex w-full justify-center">
            <ModalOkIcon className="h-[108px] w-[108px]" />
          </div>
        )}

        <div className="mb-1 flex h-full flex-col items-center justify-center gap-2 whitespace-pre-wrap text-center">
          <h3 className="text-label-normal font-headline-1 font-semibold">{title}</h3>
          {description && (
            <p className="text-label-neutral font-body-2-normal font-normal">{description}</p>
          )}
        </div>
        <div className="flex w-full gap-5 px-5">
          <button onClick={handleClose} className={buttonVariants({ type })}>
            {closeText}
          </button>
          {type === 'confirm' && (
            <button onClick={handleConfirm} className={buttonVariants({ type: 'basic' })}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
