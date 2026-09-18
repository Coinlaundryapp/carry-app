import type { MetadataRoute } from 'next';

// Next App Router가 /manifest.webmanifest로 서빙한다. 설치형 PWA(standalone) 메타.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Carry 배달원',
    short_name: 'Carry 배달',
    description: 'Carry 배달원용 앱',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#13c2c2',
    background_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
