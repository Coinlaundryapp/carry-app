/**
 * 숫자를 세 자리마다 쉼표로 구분하여 문자열로 반환합니다.
 * @param {number} number - 형식을 지정할 숫자
 * @returns {string} 쉼표가 포함된 형식의 숫자 문자열
 */
export function formatNumberWithCommas(number: number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
