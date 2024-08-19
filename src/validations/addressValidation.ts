type ValidationInput = {
  step: number;
  formData: { name: string; phone: string };
  address: { main: string; detail: string };
  selectedValue: { value: string; text: string };
  selectedRequest: { value: string; requestText: string };
};

export const validateForm = ({
  step,
  formData,
  address,
  selectedValue,
  selectedRequest,
}: ValidationInput): boolean => {
  switch (step) {
    case 1:
      return formData.name.trim() !== '';
    case 2:
      return address.main.trim() !== '' && address.detail.trim() !== '';
    case 3:
      if (selectedValue.value === '1' || selectedValue.value === '5') {
        return selectedValue.text.trim() !== '';
      } else {
        return selectedValue.value.trim() !== '';
      }
    case 4:
      if (selectedRequest.value === '4') {
        return selectedRequest.requestText.trim() !== '';
      } else {
        return selectedRequest.value.trim() !== '';
      }
    case 5:
      return /^01[0-9]{8,9}$/.test(formData.phone);
    default:
      return true;
  }
};

export const validateAllSteps = (input: ValidationInput): boolean => {
  const { formData, address, selectedValue, selectedRequest } = input;

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

  return allValid;
};
