// UAFSAIDA — NextAuth API Route
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force dynamic rendering for NextAuth route
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
