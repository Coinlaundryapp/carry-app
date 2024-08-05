import { signIn } from '@/auth';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  await signIn('credentials', { code });
  return redirect('/login');
}
