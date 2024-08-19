type ValidationInput = {
  step: number;
  formData: { name: string; phone: string; addressLabel: string };
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
      return formData.addressLabel.trim() !== '';
    case 2:
      return formData.name.trim() !== '';
    case 3:
      return address.main.trim() !== '' && address.detail.trim() !== '';
    case 4:
      if (selectedValue.value === '1' || selectedValue.value === '5') {
        return selectedValue.text.trim() !== '';
      } else {
        return selectedValue.value.trim() !== '';
      }
    case 5:
      if (selectedRequest.value === '4') {
        return selectedRequest.requestText.trim() !== '';
      } else {
        return selectedRequest.value.trim() !== '';
      }
    case 6:
      return /^010-\d{4}-\d{4}$/.test(formData.phone);
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
    /^010-\d{4}-\d{4}$/.test(formData.phone);

  return allValid;
};
