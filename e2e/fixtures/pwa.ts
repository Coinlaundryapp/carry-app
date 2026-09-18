import { test, expect } from '@playwright/test';

/**
 * 설치형 PWA 검증 묶음 — 해당 project의 baseURL(앱)에 대해 manifest·아이콘·문서 head 메타를 단언한다.
 * `page.request` 기반 **read-only**라 인증·사가 라이브 상태에 무관(어떤 UI project에서도 호출 가능).
 *
 * ⚠️ 서비스 워커는 e2e가 `next dev`로 띄우는데 ServiceWorkerRegister가 **prod-only 등록**이라 dev에선
 * 동작하지 않는다. 따라서 등록(navigator.serviceWorker)은 검증하지 않고 `/sw.js` 정적 서빙(200)만 확인한다.
 */
export function registerPwaTests(appLabel: string) {
  test.describe(`${appLabel} PWA`, () => {
    test('manifest가 설치형(standalone) 메타로 서빙된다', async ({ page }) => {
      const res = await page.request.get('/manifest.webmanifest');
      expect(res.status()).toBe(200);
      const manifest = await res.json();
      expect(manifest.display).toBe('standalone');
      expect(manifest.theme_color).toBe('#13c2c2');
      const icons = (manifest.icons ?? []) as Array<{ sizes?: string; purpose?: string }>;
      expect(icons.some((i) => i.sizes === '512x512')).toBeTruthy();
      expect(icons.some((i) => i.purpose === 'maskable')).toBeTruthy();
    });

    test('아이콘·서비스워커 정적 파일이 서빙된다', async ({ page }) => {
      for (const iconPath of ['/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon-180.png']) {
        const r = await page.request.get(iconPath);
        expect(r.status(), iconPath).toBe(200);
        expect(r.headers()['content-type'] ?? '').toContain('image/png');
      }
      expect((await page.request.get('/sw.js')).status()).toBe(200);
    });

    test('문서 head에 manifest·theme-color·apple-touch-icon이 포함된다', async ({ page }) => {
      const html = await (await page.request.get('/')).text();
      expect(html).toContain('manifest.webmanifest');
      expect(html).toContain('#13c2c2');
      expect(html).toContain('apple-touch-icon');
    });
  });
}
