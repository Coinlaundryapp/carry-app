import React from 'react';
import { Radio } from '../share/Radio';
import { Input } from '../share/Input';
import { InformationCircleRed } from '@assets/icons';

type TProps = {
  entranceValue: { value: string; text: string };
  onChange: (value: string) => void;
  onExtraInfoChange: (text: string) => void;
};

const ENTRANCE_PASSWORD = [
  { value: 'PASSWORD', label: '공동현관 비밀번호' },
  { value: 'FREE_ACCESS', label: '자유출입 가능(공동현관 없음)' },
  { value: 'SECURITY_CALL', label: '경비실 호출' },
  { value: 'HOUSEHOLD_CALL', label: '세대 호출' },
  { value: 'OTHER', label: '기타' },
];

const EntrancePassword: React.FC<TProps> = ({ entranceValue, onChange, onExtraInfoChange }) => {
  const { value, text } = entranceValue;

  const handleChange = (value: string | number | null) => {
    if (typeof value === 'string') {
      onExtraInfoChange('');
      onChange(value);
    }
  };
  return (
    <div className="mb-6 w-full">
      <div className="font_headline_1 font-semibold mb-3">공동현관 출입 방법</div>
      <p className="font_label_2 mb-[20px]  text-label-alternative">
        입력된 공동현관 비밀번호는 새벽 배송을 위해 필요한 정보로,
        <br />
        <span className="text-primary-normal font-semibold">서비스 이용 후 파기됨</span>을 약속드립니다.
      </p>
      <Radio.Group value={value} onChange={handleChange} size="big">
        {ENTRANCE_PASSWORD.map((item) => (
          <div key={item.value} className="flex flex-col space-y-3">
            <label className="flex items-center space-x-2 ">
              <Radio.Button value={item.value} />
              <span  className={`font-normal font-body-2-normal ${
    value === item.value ? 'text-black' : 'text-cool-neutral-80'
  }`}>{item.label}</span>
            </label>
            <div className="ml-6">
              {item.value === 'PASSWORD' && value === 'PASSWORD' && (
                <>
                  <Input
                    type="text"
                    status="primary"
                    placeholder="비밀번호를 입력하세요"
                    value={text}
                    className="mb-2"
                    onChange={(e) => onExtraInfoChange(e.target.value)}
                  />
                  <p className="mb-3 flex items-center justify-start gap-1 text-xs">
                    <InformationCircleRed />
                    <span>입력한 방법으로 출입이 불가능한 경우, 수거/배송이 어렵습니다.</span>
                  </p>
                </>
              )}
              {item.value === 'OTHER' && value === 'OTHER' && (
                <>
                  <Input
                    type="text"
                    status="primary"
                    placeholder="예) 뒤쪽 문은 항상 열려있습니다"
                    value={text}
                    className="mb-2"
                    onChange={(e) => onExtraInfoChange(e.target.value)}
                  />
                  <p className="mb-3 flex items-center justify-start gap-1 text-xs">
                    <InformationCircleRed />
                    <span>입력한 방법으로 출입이 불가능한 경우, 수거/배송이 어렵습니다.</span>
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </Radio.Group>
    </div>
  );
};

export default EntrancePassword;
