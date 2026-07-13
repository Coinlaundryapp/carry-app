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

// v2 ShippingAddressResponse 원형 — addressApi가 앱 형태로 매핑한다.
const mockV2Address = {
  id: 1,
  alias: '집',
  roadAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  zipCode: '06234',
  latitude: 37.5065,
  longitude: 127.0536,
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  entranceInfo: '비밀번호 1234#',
  areaCode: 'GANGNAM',
  isDefault: true,
};

const mockV2AddressList = [
  mockV2Address,
  {
    id: 2,
    alias: '회사',
    roadAddress: '서울시 서초구 서초대로 456',
    detailAddress: '',
    zipCode: '06789',
    latitude: 37.4837,
    longitude: 127.0324,
    recipientName: '홍길동',
    recipientPhone: '010-1234-5678',
    entranceInfo: null,
    areaCode: 'GANGNAM',
    isDefault: false,
  },
];

// v2 GeocodingResponse 원형 — geocode 검색 결과.
const mockV2Geocode = [
  {
    jibunAddress: '서울시 강남구 역삼동 123-45',
    roadAddress: '서울시 강남구 테헤란로 123',
    latitude: 37.5065,
    longitude: 127.0536,
    sido: '서울특별시',
    sigungu: '강남구',
    dongmyun: '역삼동',
    postalCode: '06234',
  },
];

// 앱이 기대하는 중첩 가격 구조(매핑 결과) — 테스트 기대값.
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

// v2 PricePolicyResponse 원형 — getPrices가 위 중첩 구조로 매핑한다.
const mockV2PricePolicy = {
  id: 1,
  orderUnitType: 'SOLO',
  orderRequestType: 'NEW',
  laundryItemType: 'REGULAR',
  optionPrices: [
    { optionType: 'WASH', subOptionType: 'STANDARD', price: 5000, selectable: true },
    { optionType: 'WASH', subOptionType: 'HOT_WATER', price: 7000, selectable: true },
    { optionType: 'DRY', subOptionType: 'LOW_HEAT', price: 3000, selectable: true },
    { optionType: 'DRY', subOptionType: 'HIGH_HEAT', price: 5000, selectable: true },
    { optionType: 'ADDITIONAL', subOptionType: 'FOLD_LAUNDRY', price: 2000, selectable: true },
    { optionType: 'ADDITIONAL', subOptionType: 'ADD_SOFTENER', price: 1000, selectable: true },
  ],
};

// v2 OrderResponse 원형 — 주문 생성 응답. 화면은 id만 사용(상태 페이지 이동).
const mockOrderResponse = {
  id: 1,
  customerId: 100,
  status: 'ORDER_COMPLETED',
  laundromatId: 1,
  laundryItemType: 'REGULAR',
  selectedOptions: [
    { optionType: 'WASH', subOptionType: 'STANDARD' },
    { optionType: 'DRY', subOptionType: 'LOW_HEAT' },
  ],
  roadAddress: '서울시 강남구 테헤란로 123',
  detailAddress: '101동 202호',
  recipientName: '홍길동',
  recipientPhone: '010-1234-5678',
  desiredPickupAt: '2024-01-15T10:00:00Z',
  desiredDeliveryAt: '2024-01-16T18:00:00Z',
  carrierId: null,
};

// v2 주문 목록 — getMyOrders는 OrderResponse[]. 상세(getOrder)도 동일 OrderResponse를 쓴다.
const mockV2OrderList = [mockOrderResponse];

// v2 InvoiceResponse 원형 — getPaymentInfo가 앱 PaymentInfo로 매핑(chargeType 버킷팅).
const mockV2Invoice = {
  id: 10,
  orderId: 1,
  customerId: 100,
  status: 'ISSUED',
  lineItems: [
    { chargeType: 'LAUNDRY_PRICE', description: '세탁 비용 (5kg)', amount: 10500 },
    { chargeType: 'DELIVERY_FEE', description: '배달비', amount: 4000 },
    { chargeType: 'SERVICE_FEE', description: '서비스 수수료', amount: 1050 },
  ],
  weight: 5,
  totalAmount: 15550,
  createdAt: '2024-09-23T14:35:20Z',
};

// v2 NearbyLaundromatResponse 원형 — getLaundromats가 앱 TLaundromats로 매핑한다.
const mockV2Nearby = [
  {
    laundromat: {
      id: 1,
      name: '깨끗한 빨래방',
      roadAddress: '서울시 강남구 테헤란로 100',
      detailAddress: null,
      zipCode: null,
      latitude: 37.5065,
      longitude: 127.0536,
      options: ['WASHING_MACHINE' as const, 'DRYER' as const],
      mediaResources: [],
    },
    distanceMeters: 500,
  },
];

// 매핑 결과(앱 TLaundromats) — 테스트 기대값. v2 미제공 필드(배송비·리뷰)는 0.
const mockLaundromats = [
  {
    id: 1,
    name: '깨끗한 빨래방',
    address: '서울시 강남구 테헤란로 100',
    distance: 500,
    latitude: 37.5065,
    longitude: 127.0536,
    options: ['WASHING_MACHINE' as const, 'DRYER' as const],
    mediaResources: [],
    groupDeliveryFee: 0,
    reviewAverageRating: 0,
    reviewCount: 0,
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

  // ── 주소 API (v2) ──

  // 기본 배송지 설정 (가장 구체적인 경로 우선) — v2는 PUT …/default
  http.put('*/api/v2/shipping-addresses/:id/default', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // 배송지 상세 조회
  http.get('*/api/v2/shipping-addresses/:id', () => {
    return HttpResponse.json(
      { data: mockV2Address, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 배송지 수정
  http.put('*/api/v2/shipping-addresses/:id', () => {
    return HttpResponse.json(
      { data: mockV2Address, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 배송지 삭제 — v2는 204 No Content
  http.delete('*/api/v2/shipping-addresses/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // 배송지 목록 조회
  http.get('*/api/v2/shipping-addresses', () => {
    return HttpResponse.json(
      { data: mockV2AddressList, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 배송지 생성 — v2는 201
  http.post('*/api/v2/shipping-addresses', () => {
    return HttpResponse.json(
      { data: mockV2Address, status: 201, code: 'SUCCESS', message: 'created' },
      { status: 201 },
    );
  }),

  // 주소 검색 — v2 geocode
  http.get('*/api/v2/geo/geocode', () => {
    return HttpResponse.json(
      { data: mockV2Geocode, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // ── 가격 + 주문 API ──

  // 가격 정책 조회 (v2) — 평면 optionPrices, getPrices가 중첩 구조로 매핑
  http.get('*/api/v2/prices', () => {
    return HttpResponse.json(
      { data: mockV2PricePolicy, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 주문 생성 (v2) — Idempotency-Key 멱등
  http.post('*/api/v2/orders', () => {
    return HttpResponse.json(
      { data: mockOrderResponse, status: 201, code: 'SUCCESS', message: 'created' },
      { status: 201 },
    );
  }),

  // 청구서 조회 (v2) — getPaymentInfo가 PaymentInfo로 매핑
  http.get('*/api/v2/payments/:orderId/invoice', () => {
    return HttpResponse.json(
      { data: mockV2Invoice, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 내 주문 목록 (v2) — 'my'를 :orderId보다 먼저 등록해야 매칭됨
  http.get('*/api/v2/orders/my', () => {
    return HttpResponse.json(
      { data: mockV2OrderList, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // 주문 상세 (v2)
  http.get('*/api/v2/orders/:orderId', () => {
    return HttpResponse.json(
      { data: mockOrderResponse, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),

  // ── 세탁소 ──

  // 주변 세탁소 검색 (v2 findNearby) — NearbyLaundromatResponse[]
  http.get('*/api/v2/laundromats', () => {
    return HttpResponse.json(
      { data: mockV2Nearby, status: 200, code: 'SUCCESS', message: 'success' },
      { status: 200 },
    );
  }),
];

// ── 테스트에서 사용할 mock 데이터 export ──

export const mockData = {
  v2Address: mockV2Address,
  v2AddressList: mockV2AddressList,
  v2Geocode: mockV2Geocode,
  priceData: mockPriceData,
  v2PricePolicy: mockV2PricePolicy,
  orderResponse: mockOrderResponse,
  v2Invoice: mockV2Invoice,
  v2OrderList: mockV2OrderList,
  laundromats: mockLaundromats,
  v2Nearby: mockV2Nearby,
};
