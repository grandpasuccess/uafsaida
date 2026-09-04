// UAFSAIDA — Main App Layout
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UAFSAIDA — Universal AI Software Development',
  description: 'Build software applications using natural language. No coding required.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
