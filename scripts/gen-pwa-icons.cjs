/**
 * PWA 아이콘 생성 — apps/customer-web/public/assets/icons/logo.svg(Carry 워드마크)를
 * 정사각 흰 배경 캔버스에 중앙 배치해 customer-web·carrier-web의 public/icons에 PNG로 굽는다.
 *
 * 로고는 다크 워드마크+틸 액센트라 흰 배경이 가독성에 맞다. maskable은 세이프존을 위해 더 작게 배치.
 * sharp는 직접 의존성이 아니라 pnpm 스토어에서 NODE_PATH로 끌어 쓴다(의존성 추가 회피):
 *   NODE_PATH="node_modules/.pnpm/sharp@0.33.5/node_modules" node scripts/gen-pwa-icons.cjs
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const LOGO = path.join(ROOT, 'apps/customer-web/public/assets/icons/logo.svg');
const BG = { r: 255, g: 255, b: 255, alpha: 1 };
const APPS = ['customer-web', 'carrier-web'];

async function square(size, coverage, file, outDir) {
  const svg = fs.readFileSync(LOGO);
  const logoWidth = Math.round(size * coverage);
  const logo = await sharp(svg, { density: 384 }).resize({ width: logoWidth }).png().toBuffer();
  const meta = await sharp(logo).metadata();
  const top = Math.round((size - meta.height) / 2);
  const left = Math.round((size - meta.width) / 2);
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, top, left }])
    .png()
    .toFile(path.join(outDir, file));
}

(async () => {
  for (const app of APPS) {
    const outDir = path.join(ROOT, 'apps', app, 'public/icons');
    fs.mkdirSync(outDir, { recursive: true });
    await square(192, 0.64, 'icon-192.png', outDir);
    await square(512, 0.64, 'icon-512.png', outDir);
    await square(512, 0.5, 'icon-512-maskable.png', outDir); // 세이프존(중앙 ~80%) 안에 들도록 축소
    await square(180, 0.64, 'apple-touch-icon-180.png', outDir);
    console.log('✓ icons generated →', app);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
