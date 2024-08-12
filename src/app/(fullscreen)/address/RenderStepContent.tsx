'use client';
import React from 'react';
import AddressForm from '@/components/address/AddressForm';
import EntrancePassword from '@/components/address/EntrancePassword';
import { Input } from '@/components/share/Input';
import AddressRequest from '@/components/address/AddressRequest';

interface RenderStepContentProps {
  step: number;
  formData: any;
  setFormData: (data: any) => void;
  address: any;
  setAddress: (data: any) => void;
  selectedValue: any;
  handleChange: (value: string) => void;
  handleExtraInfoChange: (text: string) => void;
  selectedRequest: { value: string; requestText: string };
  handleChangeRequest: (value: string) => void;
  renderSteps: number[];
  renderAllAtOnce?: boolean; // 모든 단계를 한 번에 렌더링할지 여부
  onChangeRequestText: (text: string) => void;
  setSelectedRequest: any;
}

const RenderStepContent: React.FC<RenderStepContentProps> = ({
  step,
  formData,
  setFormData,
  address,
  setAddress,
  selectedValue,
  handleChange,
  handleExtraInfoChange,
  selectedRequest,
  handleChangeRequest,
  renderSteps,
  setSelectedRequest,

  renderAllAtOnce = false,
}) => {
  const renderComponents = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <Input
            key={1}
            className="mb-4"
            status="primary"
            type="text"
            title="받는 분"
            fontStyle="font_headline_1 font-bold"
            placeholder="받는 분 성함을 입력해주세요."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        );
      case 2:
        return <AddressForm key={2} address={address} setAddress={setAddress} />;
      case 3:
        return (
          <EntrancePassword
            key={3}
            onChange={handleChange}
            entranceValue={selectedValue}
            onExtraInfoChange={handleExtraInfoChange}
          />
        );
      case 4:
        return (
          <AddressRequest
            key={4}
            handleChangeRequest={handleChangeRequest}
            setSelectedRequest={setSelectedRequest}
            selectedRequest={selectedRequest}
          />
        );
      case 5:
        return (
          <Input
            key={5}
            className="mb-4"
            status="primary"
            type="text"
            title="전화번호"
            fontStyle="font_headline_1 font-bold"
            placeholder="전화번호를 입력해주세요."
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        );
      default:
        return null;
    }
  };

  if (renderAllAtOnce) {
    return (
      <>
        {renderSteps
          .slice()
          .sort((a, b) => b - a)
          .map((currentStep) => renderComponents(currentStep))}
      </>
    );
  }

  // 단계별로 렌더링: 주어진 단계까지만 렌더링, 새로운 단계가 위로 쌓임
  return (
    <>
      {renderSteps
        .filter((currentStep) => step >= currentStep)
        .reverse()
        .map((currentStep) => renderComponents(currentStep))}
    </>
  );
};

export default RenderStepContent;
