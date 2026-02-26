/**
 * Android WebView JS Bridge 타입 선언
 *
 * Android 네이티브에서 @JavascriptInterface로 노출하는 메서드들의 타입을 정의합니다.
 * 네이티브 측과 인터페이스 협의 후 메서드를 추가/수정합니다.
 */

export interface AndroidBridge {
  /** 디바이스 정보 요청 (OS 버전, 앱 버전 등) */
  getDeviceInfo(): string;

  /** 네이티브 FCM 토큰 요청 */
  getFCMToken(): string;

  /** 네이티브 로그인 요청 (카카오 OAuth를 네이티브에서 처리할 경우) */
  requestLogin(): void;

  /** 푸시 알림 권한 요청 */
  requestNotificationPermission(): void;

  /** 외부 URL을 네이티브 브라우저(Custom Tab)로 열기 */
  openExternalBrowser(url: string): void;

  /** 앱 종료 요청 */
  closeApp(): void;
}

/**
 * 네이티브 → 웹 콜백 함수 타입
 * Android에서 evaluateJavascript로 호출하는 함수들입니다.
 */
export interface WebViewCallbacks {
  /** 네이티브 로그인 완료 콜백 */
  onLoginComplete(token: string): void;

  /** 뒤로가기 버튼 콜백 */
  onNativeBackPressed(): void;

  /** FCM 푸시 수신 콜백 */
  onPushNotification(data: string): void;

  /** 앱 포그라운드 복귀 콜백 */
  onAppResume(): void;
}

declare global {
  interface Window {
    AndroidBridge?: AndroidBridge;
    onLoginComplete?: WebViewCallbacks['onLoginComplete'];
    onNativeBackPressed?: WebViewCallbacks['onNativeBackPressed'];
    onPushNotification?: WebViewCallbacks['onPushNotification'];
    onAppResume?: WebViewCallbacks['onAppResume'];
  }
}
