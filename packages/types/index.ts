// @carry/types — carry-platform 백엔드 v2 API 계약의 TypeScript 타입.
//
// `src/generated/v2.ts`는 OpenAPI 스키마(carry-platform/docs/api/openapi-v2.json)에서
// `pnpm gen:types`로 자동 생성된다. **직접 수정 금지** — 백엔드 변경 시 스키마를 다시 export하고
// (carry-platform: scripts/export-openapi.sh) `pnpm gen:types`로 재생성한다.

export type { paths, components, operations, webhooks } from './src/generated/v2'

import type { components } from './src/generated/v2'

/** 스키마 컴포넌트 단축 접근 — 예: `Schemas['OrderResponse']`. */
export type Schemas = components['schemas']
