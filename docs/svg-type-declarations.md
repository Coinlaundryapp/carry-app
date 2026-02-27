# SVG 모듈 타입 선언 — 왜 필요하고, 왜 없었는가

## 현상

`pnpm exec tsc --noEmit` 실행 시 `.svg` import에서 **TS2307** 에러가 ~100개 발생한다.

```
error TS2307: Cannot find module './arrow-down.svg' or its corresponding type declarations.
```

하지만 `pnpm dev`, `pnpm build`는 정상 동작한다.

## 원인

### Next.js의 빌드 파이프라인과 `tsc`는 별개

| 도구 | SVG 처리 방식 | `.svg` import 인식 |
|------|---------------|-------------------|
| `next dev` / `next build` | webpack → `@svgr/webpack` 플러그인이 변환 | ✅ 정상 |
| `tsc --noEmit` | TypeScript 컴파일러 단독 실행 (webpack 무관) | ❌ 모듈 못 찾음 |

`next.config.mjs`에 SVGR을 등록해도, `tsc`는 webpack 설정을 읽지 않는다.
TypeScript가 `.svg` 파일을 모듈로 인식하려면 **별도의 `*.d.ts` 타입 선언**이 필요하다.

### CRA vs Next.js

- **CRA** (Create React App): `react-app-env.d.ts`에 `.svg` 선언이 **기본 포함**됨
- **Next.js**: `.svg` 선언을 **제공하지 않음** → 개발자가 직접 추가해야 함

이 프로젝트는 Next.js이므로 직접 추가가 필요했으나, 빌드가 정상 동작했기 때문에 누락된 채 개발이 진행되었다.

## 해결 방법

`src/shared/types/assets.d.ts` 파일을 생성한다:

```typescript
// SVG — @svgr/webpack이 React 컴포넌트로 변환
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

// 이미지 — Next.js의 next/image에서 사용
declare module '*.png' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.jpg' {
  const content: import('next/image').StaticImageData;
  export default content;
}
```

### 체크리스트

- [ ] `tsconfig.json`의 `include`에 `**/*.ts`가 있는지 확인 (이미 포함됨 → 별도 설정 불필요)
- [ ] 파일 생성 후 `pnpm exec tsc --noEmit`으로 에러 해소 확인
- [ ] CI 파이프라인에 `tsc --noEmit` 단계 추가 권장

## 참고

- [SVGR + TypeScript 공식 문서](https://react-svgr.com/docs/typescript/)
- Next.js는 `next-env.d.ts`에서 `.css`, `.json` 등의 모듈은 선언하지만 `.svg`는 포함하지 않는다
