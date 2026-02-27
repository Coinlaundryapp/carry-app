# Storybook 품질 전면 개선 기록

## 배경

Storybook 25개 스토리 파일(62개 개별 스토리)에 대한 품질 감사를 수행한 결과, 점수 **6.2/10**으로 평가되었다. 스토리가 "스크린샷 문서화" 수준에 머물러 있었고, 실제 테스트 도구로서의 역할을 하지 못하고 있었다.

## 발견된 문제

### P0 Critical — args 직접 변이 안티패턴

`Input.stories.tsx`와 `Dropdown.stories.tsx`에서 Storybook의 `args` 객체를 직접 변이(mutate)하고 있었다:

```tsx
// ❌ Before — args를 직접 변이
const render = (args: InputProps) => {
  const [value, setValue] = useState(args.value);
  args.value = value;                    // 공유 객체 직접 변이
  args.onClear = fn(() => setValue('')); // 매 렌더마다 새 fn() 생성
  args.onChange = fn((e) => setValue(e.target.value));
  return <Input {...args} />;
};
```

**문제점:**
- `args`는 Storybook이 스토리 간 공유하는 참조 객체
- 직접 변이하면 다른 스토리에 상태가 누출될 수 있음
- `fn()`을 렌더 함수 내에서 생성하면 Actions 패널에서 추적이 깨짐
- React 규칙 위반: 렌더 중 외부 상태 변이

```tsx
// ✅ After — spread + local state 패턴
const render = (args: InputProps) => {
  const [value, setValue] = useState(args.value ?? '');
  return (
    <Input
      {...args}
      value={value}
      onClear={() => setValue('')}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
```

### P1 — 접근성 테스트 부재

- `@storybook/addon-a11y` 미설치 → 접근성 점수 0/10
- axe-core 기반의 자동 a11y 검사가 전혀 없음

### P1 — CVA variant 스토리 누락

9개 컴포넌트에서 CVA(class-variance-authority)로 정의된 variant 중 일부가 스토리에 반영되지 않았다:

| 컴포넌트 | 누락 variant |
|---------|-------------|
| Input | `primary` |
| Dropdown | `time`, `disabled` |
| Button | `full`, `hug`, `disabled` |
| CheckBox | `circle`, `icon` |
| Alert | `error` |
| Toast | `error` |
| Radio | `big` |
| ProgressBar | `blue` |
| Tag | `black` |

### P2 — 일관성 문제

| 문제 | 해당 파일 |
|-----|----------|
| title 케이싱 불일치: `'components/'` vs `'Components/'` | Input, Button |
| 스토리 이름 `Template` (관례상 `Default`를 사용) | ScrollUpButton, Tooltip |
| 오타 `MedumPrimary` → `MediumPrimary` | Button |
| `() => {}` 사용 (fn() 대신) → Actions 패널 미추적 | ScrollUpButton, TopNavigation, Button |
| `tags: ['autodocs']` 누락 → 자동 문서 생성 안 됨 | 13개 파일 |

## 수행한 작업

### 1. @storybook/addon-a11y 설치

```bash
pnpm add -D @storybook/addon-a11y@8.3.2
```

Storybook 8.3.2와 정확히 동일한 버전을 설치하여 peer dependency 경고를 방지했다.

> ⚠️ 처음에 `@storybook/addon-a11y@10.2.13`이 설치되었으나, 이는 Storybook 10.x용이었다.
> `@storybook/addon-a11y@^8.3.0`으로 재설치하여 `8.3.2`가 설치됨.

`.storybook/main.ts`에 등록:

```ts
addons: [
  // ... 기존 애드온
  '@storybook/addon-a11y',  // 추가
],
```

### 2. 글로벌 autodocs 설정

`.storybook/preview.tsx`에 글로벌 태그를 추가하여 모든 스토리에 자동 문서화를 적용:

```tsx
const preview: Preview = {
  tags: ['autodocs'],  // 추가
  // ...
};
```

이로써 개별 스토리 파일에 `tags: ['autodocs']`를 누락해도 문서가 생성된다.
명시성을 위해 각 파일에도 개별적으로 태그를 추가했다.

### 3. args 변이 안티패턴 수정 (Input, Dropdown)

위 "P0 Critical" 섹션의 수정 패턴 적용.
추가로 Dropdown의 반복된 placeholder 텍스트도 수정:

```diff
- placeholder: '카드사를 선택해 주세요카드사를 선택해 주세요카드사를 선택해 주세요',
+ placeholder: '카드사를 선택해 주세요',
```

### 4. 누락 CVA variant 스토리 13개 추가

총 13개의 새 스토리 export를 추가하여 모든 CVA variant가 최소 1개의 스토리를 갖도록 보장:

- **Input**: `Primary` (status: 'primary')
- **Dropdown**: `Time` (type: 'time'), `Disabled` (disabled: true)
- **Button**: `FullWidth` (size: 'full'), `HugSize` (size: 'hug'), `Disabled` (state: 'disabled')
- **CheckBox**: `Circle`, `CircleChecked`, `Icon`, `IconChecked`
- **Alert**: `Error` (status: 'error')
- **Toast**: `Error` (type: 'error')
- **Radio**: `Big` (size: 'big')
- **ProgressBar**: `Blue` (color: 'blue')
- **Tag**: `Black` (color: 'black')

### 5. P2 일관성 수정

- **title 통일**: 모든 스토리의 title을 `'Components/...'` (대문자 C)로 통일
- **네이밍**: `Template` → `Default`, `MedumPrimary` → `MediumPrimary`
- **fn() 교체**: 3개 파일에서 `() => {}` → `fn()` (from `@storybook/test`)
- **autodocs 태그**: 13개 파일에 명시적 `tags: ['autodocs']` 추가

## 수정 파일 목록 (23개)

| 파일 | 수정 유형 |
|-----|----------|
| `.storybook/main.ts` | a11y 애드온 등록 |
| `.storybook/preview.tsx` | 글로벌 autodocs 태그 |
| `package.json` / `pnpm-lock.yaml` | a11y 의존성 |
| `Input/Input.stories.tsx` | args 변이 수정 + primary variant + title 케이싱 |
| `Dropdown/Dropdown.stories.tsx` | args 변이 수정 + time/disabled variant |
| `Button/Button.stories.ts` | 전면 재작성 (fn, autodocs, full/hug/disabled, 오타) |
| `CheckBox/checkBox.stories.tsx` | circle/icon variant 추가 |
| `Alert/Alert.stories.tsx` | error variant 추가 |
| `Toast/Toast.stories.tsx` | error variant + autodocs |
| `Radio/radio.stories.tsx` | big variant + autodocs |
| `ProgressBar/ProgressBar.stories.tsx` | blue variant + color argType |
| `Tag/Tag.stories.tsx` | black variant |
| `ScrollUpButton/ScrollUpButton.stories.tsx` | Template→Default, fn(), autodocs |
| `TopNavigation/TopNavigation.stories.tsx` | fn() 교체 |
| `Tooltip/Tooltip.stories.tsx` | Template→Default |
| `Modal/Modal.stories.tsx` | autodocs |
| `BottomNavigation/bottomNavigation.stories.tsx` | autodocs + layout + decorator |
| `CollapsiblePanel/CollapsiblePanel.stories.tsx` | autodocs |
| `FunnelHeader/FunnelHeader.stories.tsx` | autodocs |
| `Avatar/avatar.stories.tsx` | autodocs |
| `Separator/Separator.stories.tsx` | autodocs |
| `Tab/Tab.stories.tsx` | autodocs |

## 검증 결과

```
✅ pnpm exec tsc --noEmit   — 타입 에러 0건
✅ pnpm test                 — 58개 테스트 전부 통과
✅ pnpm lint                 — ESLint 경고/에러 0건
✅ lint-staged + prettier    — 커밋 시 자동 포맷 통과
```

## 개선 전후 비교

| 항목 | Before | After |
|-----|--------|-------|
| args 변이 안티패턴 | 2개 파일 | 0개 |
| a11y 테스트 | 미설치 | addon-a11y 활성 |
| autodocs 적용률 | ~48% (12/25) | 100% (글로벌 + 개별) |
| CVA variant 커버리지 | ~70% | 100% |
| fn() 사용률 (이벤트 핸들러) | ~60% | 100% |
| title 케이싱 일관성 | 불일치 2건 | 전부 `'Components/'` |
| 네이밍 컨벤션 | Template 2건 | 전부 Default |
| 총 스토리 수 | 62개 | 75개 (+13) |
