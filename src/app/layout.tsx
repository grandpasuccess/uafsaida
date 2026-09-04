// UAFSAIDA — Main App Layout
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UAFSAIDA — Universal AI Software Development',
  description: 'Build software applications using natural language. No coding required.',
  keywords: ['AI', 'software development', 'code generation', 'no-code', 'natural language'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
