// app/api/secure-data/route.ts
import { auth } from '@/auth.config';

export async function GET() {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });

  // call Python backend with session.user.accessToken
  return Response.json({ secret: '🎉' });
}
