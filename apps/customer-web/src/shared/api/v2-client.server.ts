import 'server-only';

import { auth } from '@features/auth/api/auth';
import { createV2Client } from '@shared/api/v2-client';

/**
 * 서버(서버 컴포넌트·액션·라우트 핸들러)용 v2 클라이언트. NextAuth `auth()`의 accessToken을 주입한다.
 */
export async function getServerV2Client() {
  const session = await auth();
  return createV2Client({ accessToken: session?.user?.accessToken });
}
