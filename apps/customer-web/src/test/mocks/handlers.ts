import { http, HttpResponse } from 'msw';

// ── 성공 응답 헬퍼 ──

const authSuccessBody = {
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  },
  status: 200,
  message: 'success',
};

// ── Mock 데이터 ──

const mockAddressList = [
  { addressId: 1, addressLabel: '집', fullAddress: '서울시 강남구 테헤란로 123', isDefault: true },
  {
    addressId: 2,
    addressLabel: '회사',
    fullAddress: '서울시 서초구 서초대로 456',
    isDefault: false,
  },
];

const mockAddressDetail = {
  id: 1,
  userId: 100,
  addressLabel: '집',
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  baseAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  deliveryNotes: '문 앞에 놓아주세요',
  entranceType: 'PASSWORD',
  entranceDetail: '1234',
  isDefaultAddress: false,
};

const mockAddressSearchResult = {
  content: [
    {
      addressName: '서울시 강남구 테헤란로 123',
      addressType: 'ROAD',
      regionAddress: { addressName: '서울시 강남구 역삼동 123-45' },
      roadAddress: '서울시 강남구 테헤란로 123',
    },
  ],
  pagination: {
    hasNext: false,
    pageNumber: 1,
    pageSize: 5,
    totalElements: 1,
    totalPages: 1,
  },
};

const mockDefaultAddress = {
  id: 1,
  userId: 100,
  isDefaultAddress: true,
  addressLabel: '집',
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  baseAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  latitude: 37.5065,
  longitude: 127.0536,
  deliveryNotes: '문 앞에 놓아주세요',
  entranceType: 'PASSWORD',
  entranceDetail: '1234',
};

const mockPriceData = {
  washOption: {
    standard: { selectable: true, price: 5000 },
    hotWater: { selectable: true, price: 7000 },
  },
  dryOption: {
    lowHeat: { selectable: true, price: 3000 },
    highHeat: { selectable: true, price: 5000 },
  },
  additionalOption: {
    foldLaundry: { selectable: true, price: 2000 },
    addSoftener: { selectable: true, price: 1000 },
  },
};

const mockOrderResponse = {
  id: 1,
  status: 'ORDER_COMPLETED' as const,
  orderUnitType: 'SOLO' as const,
  orderRequestType: 'NEW' as const,
  laundryItemType: 'REGULAR' as const,
  laundromatName: '깨끗한 빨래방',
  orderedAt: '2024-01-15T10:00:00',
  estimatedAmount: 15000,
};

const mockOrderList = [
  {
    id: 1,
    orderedAt: '2024-01-15T10:00:00',
    status: 'ORDER_COMPLETED' as const,
    orderContent: {
      orderUnitType: 'SOLO' as const,
      orderRequestType: 'NEW',
      laundryItemType: 'REGULAR' as const,
    },
    laundromatName: '깨끗한 빨래방',
    paymentDetails: {
      estimatedPayment: {
        discounts: { laundryDiscounts: [], deliveryDiscounts: [] },
        charges: { laundryPrice: 10000, deliveryFee: 3000, serviceFee: 2000 },
        netAmount: 15000,
      },
    },
    confirmedPayment: null,
  },
];

const mockOrderDetail = {
  id: 1,
  status: 'ORDER_COMPLETED' as const,
  orderContent: {
    orderUnitType: 'SOLO' as const,
    orderRequestType: 'NEW',
    laundryItemType: 'REGULAR' as const,
    laundrySpecs: [],
    washOption: 'STANDARD',
    dryOption: 'LOW_HEAT',
    additonalOption: [],
  },
  laundromatName: '깨끗한 빨래방',
  shippingAddress: {
    addressLabel: '집',
    recipientPhone: '010-1234-5678',
    recipientName: '홍길동',
    baseAddress: '서울시 강남구 테헤란로 123',
    detailAddress: '101동 202호',
    deliveryNotes: '문 앞에 놓아주세요',
    entranceType: 'PASSWORD',
    entranceDetail: '1234',
  },
  orderShedule: {
    desiredPickupDateTime: '2024-01-15 10:00:00 Mon',
    desiredDeliveryDate: '2024-01-16 18:00:00 Tue',
  },
  paymentDetails: {
    estimatedPayment: {
      discounts: { laundryDiscounts: [], deliveryDiscounts: [] },
    },
    charges: { laundryPrice: 10000, deliveryFee: 3000, serviceFee: 2000 },
    netAmount: 15000,
  },
  confirmedPayment: null,
};

const mockLaundromats = [
  {
    id: 1,
    name: '깨끗한 빨래방',
    address: '서울시 강남구 테헤란로 100',
    distance: 500,
    groupDeliveryFee: 3000,
    latitude: 37.5065,
    longitude: 127.0536,
    mediaResources: [],
    options: ['WASHING_MACHINE' as const, 'DRYER' as const],
    reviewAverageRating: 4.5,
    reviewCount: 100,
  },
];

const mockServiceRegions = [
  {
    city: 'SEOUL_SI' as const,
    district: '강남구',
    latitude: 37.5172,
    longitude: 127.0473,
  },
  {
    city: 'SEOUL_SI' as const,
    district: '서초구',
    latitude: 37.4837,
    longitude: 127.0324,
  },
];

// ── 핸들러 ──

export const handlers = [
  // Kakao 로그인 (v2 — kakaoAccessToken 서버 검증)
  http.post('*/api/v2/auth/login', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.kakaoAccessToken) {
      return HttpResponse.json(
        {
          data: {
            status: 'REGISTERED',
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
          status: 200,
          code: 'SUCCESS',
          message: 'success',
        },
        { status: 200 },
      );
    }
    return HttpResponse.json(
      { status: 400, code: 'INVALID_INPUT', message: 'kakaoAccessToken required' },
      { status: 400 },
    );
  }),

  // dev-login (v2 — 역할별 토큰)
  http.post('*/api/v2/auth/dev-login', () => {
    return HttpResponse.json(
      {
        data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' },
        status: 200,
        code: 'SUCCESS',
        message: 'success',
      },
      { status: 200 },
    );
  }),

  // 토큰 회전 (v2)
  http.post('*/api/v2/auth/refresh', () => {
    return HttpResponse.json(
      {
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
        status: 200,
        code: 'SUCCESS',
        message: 'success',
      },
      { status: 200 },
    );
  }),

  // ── 주소 API ──

  // 기본 주소 설정 (가장 구체적인 경로 우선)
  http.patch('*/api/v1/users/me/shipping-addresses/:id/default', () => {
    return HttpResponse.json({ data: null, status: 200, message: 'success' }, { status: 200 });
  }),

  // 주소 상세 조회
  http.get('*/api/v1/users/me/shipping-addresses/:id', () => {
    return HttpResponse.json(
      { data: mockAddressDetail, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 주소 수정
  http.put('*/api/v1/users/me/shipping-addresses/:id', () => {
    return HttpResponse.json({ data: null, status: 200, message: 'success' }, { status: 200 });
  }),

  // 주소 삭제
  http.delete('*/api/v1/users/me/shipping-addresses/:id', () => {
    return HttpResponse.json({ data: null, status: 200, message: 'success' }, { status: 200 });
  }),

  // 주소 목록 조회
  http.get('*/api/v1/users/me/shipping-addresses', () => {
    return HttpResponse.json(
      { data: mockAddressList, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 주소 생성
  http.post('*/api/v1/users/me/shipping-addresses', () => {
    return HttpResponse.json({ data: null, status: 201, message: 'created' }, { status: 201 });
  }),

  // 기본 주소 조회 (사용자 정보)
  http.get('*/api/v1/users/me', () => {
    return HttpResponse.json(
      { data: mockDefaultAddress, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 주소 검색
  http.get('*/api/v1/addresses', () => {
    return HttpResponse.json(
      { data: mockAddressSearchResult, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // ── 가격 + 주문 API ──

  // 가격 조회
  http.get('*/api/v1/prices', () => {
    return HttpResponse.json(
      { data: mockPriceData, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 주문 생성
  http.post('*/api/v1/orders', () => {
    return HttpResponse.json(
      { data: mockOrderResponse, status: 201, message: 'created' },
      { status: 201 },
    );
  }),

  // 주문 상세 (더 구체적인 경로 우선)
  http.get('*/api/v1/orders/:id/details', () => {
    return HttpResponse.json(
      { data: mockOrderDetail, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 주문 목록
  http.get('*/api/v1/orders', () => {
    return HttpResponse.json(
      { data: mockOrderList, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // ── 세탁소 + 서비스 지역 ──

  // 세탁소 목록
  http.get('*/api/v1/laundromats', () => {
    return HttpResponse.json(
      { data: mockLaundromats, status: 200, message: 'success' },
      { status: 200 },
    );
  }),

  // 서비스 가능 지역
  http.get('*/api/v1/service-availability/regions', () => {
    return HttpResponse.json(
      { data: mockServiceRegions, status: 200, message: 'success' },
      { status: 200 },
    );
  }),
];

// ── 테스트에서 사용할 mock 데이터 export ──

export const mockData = {
  addressList: mockAddressList,
  addressDetail: mockAddressDetail,
  addressSearchResult: mockAddressSearchResult,
  defaultAddress: mockDefaultAddress,
  priceData: mockPriceData,
  orderResponse: mockOrderResponse,
  orderList: mockOrderList,
  orderDetail: mockOrderDetail,
  laundromats: mockLaundromats,
  serviceRegions: mockServiceRegions,
};
