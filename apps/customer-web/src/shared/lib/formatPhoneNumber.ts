export function formatPhoneNumber(phoneNumber: string): string {
  let value = phoneNumber.replace(/[^0-9]/g, '');

  if (value.length > 3 && value.length <= 7) {
    value = value.replace(/(\d{3})(\d+)/, '$1-$2');
  } else if (value.length > 7) {
    value = value.replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
  }

  return value;
}
