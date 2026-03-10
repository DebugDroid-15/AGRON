import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AGRON - Smart Agriculture IoT Dashboard',
  description: 'Premium real-time control dashboard for intelligent farming systems',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
