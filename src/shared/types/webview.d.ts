/**
 * Android WebView JS Bridge 타입 선언
 *
 * Android 네이티브에서 @JavascriptInterface로 노출하는 메서드들의 타입을 정의합니다.
 * 네이티브 측과 인터페이스 협의 후 메서드를 추가/수정합니다.
 */

/** 네트워크 상태 정보 (getNetworkStatus JSON 파싱 결과) */
export interface NetworkStatus {
  type: 'wifi' | 'cellular' | 'none';
  isConnected: boolean;
}

/** 앱 업데이트 정보 (onAppUpdateResult 콜백 JSON 파싱 결과) */
export interface AppUpdateResult {
  updateAvailable: boolean;
  latestVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
}

export interface AndroidBridge {
  /** 디바이스 정보 요청 (OS 버전, 앱 버전 등) */
  getDeviceInfo(): string;

  /** 네이티브 FCM 토큰 요청 */
  getFCMToken(): string;

  /** 네이티브 로그인 요청 (카카오 OAuth를 네이티브에서 처리) */
  requestLogin(): void;

  /** 푸시 알림 권한 요청 */
  requestNotificationPermission(): void;

  /** 외부 URL을 네이티브 브라우저(Custom Tab)로 열기 */
  openExternalBrowser(url: string): void;

  /** 앱 종료 요청 */
  closeApp(): void;

  // --- 신규 동기 메서드 ---

  /** 네트워크 상태 조회 (JSON string 반환 → NetworkStatus) */
  getNetworkStatus(): string;

  /** 보안 토큰 저장 (Android Keystore) */
  saveSecureToken(key: string, value: string): void;

  /** 보안 토큰 조회 (Android Keystore) */
  getSecureToken(key: string): string;

  /** 보안 토큰 삭제 (Android Keystore) */
  removeSecureToken(key: string): void;

  // --- 신규 비동기 메서드 ---

  /** 앱 업데이트 확인 요청 (결과는 onAppUpdateResult 콜백으로 수신) */
  checkAppUpdate(): void;

  /** 카메라 촬영 요청 (결과는 onCameraResult 콜백으로 수신) */
  requestCamera(): void;

  /** 갤러리 열기 (결과는 onGalleryResult 콜백으로 수신) */
  openGallery(): void;
}

/**
 * 네이티브 → 웹 콜백 함수 타입
 * Android에서 evaluateJavascript로 호출하는 함수들입니다.
 */
export interface WebViewCallbacks {
  /** 네이티브 로그인 완료 콜백 (카카오 accessToken 전달) */
  onLoginComplete(accessToken: string): void;

  /** 뒤로가기 버튼 콜백 */
  onNativeBackPressed(): void;

  /** FCM 푸시 수신 콜백 */
  onPushNotification(data: string): void;

  /** 앱 포그라운드 복귀 콜백 */
  onAppResume(): void;

  // --- 신규 콜백 ---

  /** 앱 업데이트 확인 결과 콜백 (JSON string → AppUpdateResult) */
  onAppUpdateResult(data: string): void;

  /** 네트워크 연결 상태 변경 콜백 (JSON string → NetworkStatus) */
  onConnectivityChanged(data: string): void;

  /** 카메라 촬영 결과 콜백 */
  onCameraResult(data: string): void;

  /** 갤러리 선택 결과 콜백 */
  onGalleryResult(data: string): void;
}

declare global {
  interface Window {
    AndroidBridge?: AndroidBridge;
    onLoginComplete?: WebViewCallbacks['onLoginComplete'];
    onNativeBackPressed?: WebViewCallbacks['onNativeBackPressed'];
    onPushNotification?: WebViewCallbacks['onPushNotification'];
    onAppResume?: WebViewCallbacks['onAppResume'];
    onAppUpdateResult?: WebViewCallbacks['onAppUpdateResult'];
    onConnectivityChanged?: WebViewCallbacks['onConnectivityChanged'];
    onCameraResult?: WebViewCallbacks['onCameraResult'];
    onGalleryResult?: WebViewCallbacks['onGalleryResult'];
  }
}
