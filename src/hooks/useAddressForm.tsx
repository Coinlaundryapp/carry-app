'use client';
import { useState, useEffect } from 'react';

export const useAddressForm = (initialStep: number, reverseSteps: boolean = false) => {
  const [step, setStep] = useState(initialStep);
  const [address, setAddress] = useState({ main: '', detail: '' });
  const [selectedValue, setSelectedValue] = useState({ value: '1', text: '' });
  const [selectedRequest, setSelectedRequest] = useState({ value: '1', requestText: '' });
  const [isValid, setIsValid] = useState<boolean>(false);
  const [allStepsValid, setAllStepsValid] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  const validateForm = () => {
    let valid = true;
    switch (step) {
      case 1:
        valid = formData.name.trim() !== '';
        break;
      case 2:
        valid = address.main.trim() !== '' && address.detail.trim() !== '';
        break;
      case 3:
        if (selectedValue.value === '1' || selectedValue.value === '5') {
          valid = selectedValue.text.trim() !== '';
        } else {
          valid = selectedValue.value.trim() !== '';
        }
        break;
      case 4:
        if (selectedRequest.value === '4') {
          valid = selectedRequest.requestText.trim() !== '';
        } else {
          valid = selectedRequest.value.trim() !== '';
        }
        break;
      case 5:
        valid = /^01[0-9]{8,9}$/.test(formData.phone);
        break;
      default:
        valid = true;
    }
    setIsValid(valid);
  };

  const validateAllSteps = () => {
    const allValid =
      formData.name.trim() !== '' &&
      address.main.trim() !== '' &&
      address.detail.trim() !== '' &&
      (selectedValue.value === '1' || selectedValue.value === '5'
        ? selectedValue.text.trim() !== ''
        : selectedValue.value.trim() !== '') &&
      (selectedRequest.value === '4'
        ? selectedRequest.requestText.trim() !== ''
        : selectedRequest.value.trim() !== '') &&
      /^01[0-9]{8,9}$/.test(formData.phone);
    setAllStepsValid(allValid);
  };

  useEffect(() => {
    validateForm();
    validateAllSteps();
  }, [step, formData, address, selectedValue, selectedRequest]);

  const handleNext = () => {
    if (isValid) {
      setStep((prevStep) => (reverseSteps ? prevStep - 1 : prevStep + 1));
    }
  };

  const handleBack = () => {
    if (step > 1 && !reverseSteps) {
      setStep((prevStep) => prevStep - 1);
    } else if (step < 5 && reverseSteps) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  return {
    step,
    setStep,
    address,
    setAddress,
    selectedValue,
    setSelectedValue,
    selectedRequest,
    setSelectedRequest,
    isValid,
    allStepsValid,
    formData,
    setFormData,
    handleNext,
    handleBack,
  };
};
