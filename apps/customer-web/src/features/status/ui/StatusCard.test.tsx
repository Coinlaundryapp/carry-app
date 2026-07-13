import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OrderDetailRes } from '@shared/types/api-types';
import type { PaymentBadge } from '@features/status/lib/status-mappers';
import StatusCard from './StatusCard';

// StatusCard는 `@assets/icons` 배럴이 아니라 개별 .svg 파일을 직접 import한다
// (import Seperate from '@assets/icons/separateWash.svg' 등). 워크스페이스 절대경로에
// `[projects]` 대괄호가 섞여 있어 setup.ts의 `vi.mock('*.svg')` glob이 매칭되지 않으므로
// (F6 교훈), 이 컴포넌트가 실제로 import하는 세 경로를 명시 스텁으로 둔다.
vi.mock('@assets/icons/separateWash.svg', () => ({
  default: (props: Record<string, unknown>) => <svg data-testid="icon-separate" {...props} />,
}));
vi.mock('@assets/icons/economiWash.svg', () => ({
  default: (props: Record<string, unknown>) => <svg data-testid="icon-economic" {...props} />,
}));
vi.mock('@assets/icons/information-circle-red.svg', () => ({
  default: (props: Record<string, unknown>) => <svg data-testid="icon-info" {...props} />,
}));

// next/link는 App Router context 없이 렌더되면 prefetch 관련 동작이 얽힐 수 있어
// 단순 앵커로 스텁한다 — href만 검증하면 충분하다.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href as string} {...rest}>
      {children}
    </a>
  ),
}));

function makeInfo(overrides: Partial<OrderDetailRes> = {}): OrderDetailRes {
  return {
    id: 123,
    status: 'ORDER_COMPLETED',
    orderContent: {
      orderUnitType: 'SOLO',
      orderRequestType: 'NEW',
      laundryItemType: 'REGULAR',
      laundrySpecs: [],
      washOption: '',
      dryOption: '',
      additonalOption: [],
    },
    laundromatName: '동네 세탁소',
    shippingAddress: {
      addressLabel: '',
      recipientPhone: '',
      recipientName: '',
      baseAddress: '',
      detailAddress: '',
      deliveryNotes: '',
      entranceType: '',
      entranceDetail: '',
    },
    orderShedule: {
      desiredPickupDateTime: '',
      desiredDeliveryDate: '',
    },
    paymentDetails: {
      estimatedPayment: { discounts: { laundryDiscounts: [], deliveryDiscounts: [] } },
      charges: { laundryPrice: 0, deliveryFee: 0, serviceFee: 0 },
      netAmount: 0,
    },
    confirmedPayment: null,
    ...overrides,
  };
}

const paidBadge: PaymentBadge = {
  label: '결제 완료',
  tone: 'success',
  amount: 24500,
  needsAction: false,
};

const overdueBadge: PaymentBadge = {
  label: '연체',
  tone: 'danger',
  needsAction: true,
};

describe('StatusCard', () => {
  it('detail + PAID 배지 → "결제 완료"와 실금액을 렌더한다', () => {
    render(
      <StatusCard
        variant="detail"
        orderStatus="COMPLETED"
        paymentBadge={paidBadge}
        info={makeInfo()}
        hasButton={false}
      />,
    );

    expect(screen.getByText('결제 완료')).toBeInTheDocument();
    expect(screen.getByText('24,500원')).toBeInTheDocument();
  });

  it('detail + needsAction 배지(연체) → "카드 확인 필요" 배너와 /my/payment 링크를 렌더한다', () => {
    render(
      <StatusCard
        variant="detail"
        orderStatus="IN_PROGRESS"
        paymentBadge={overdueBadge}
        info={makeInfo()}
        hasButton={false}
      />,
    );

    expect(screen.getByText('카드 확인 필요')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: '카드 확인하기' });
    expect(link).toHaveAttribute('href', '/my/payment');
  });

  it('list variant는 paymentBadge를 넘겨도 결제 배지를 렌더하지 않는다', () => {
    render(
      <StatusCard
        variant="list"
        orderStatus="COMPLETED"
        paymentBadge={paidBadge}
        info={makeInfo()}
        hasButton
      />,
    );

    expect(screen.queryByText('결제 완료')).not.toBeInTheDocument();
    expect(screen.queryByText('24,500원')).not.toBeInTheDocument();
  });

  it('CANCELLED 주문 상태 → "취소"를 렌더한다', () => {
    render(
      <StatusCard
        variant="detail"
        orderStatus="CANCELLED"
        paymentBadge={null}
        info={makeInfo()}
        hasButton={false}
      />,
    );

    expect(screen.getByText('취소')).toBeInTheDocument();
  });
});
