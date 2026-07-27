import './globals.css';

export const metadata = {
  title: 'QR Menu — order from the table',
  description:
    'Guests scan the QR code on their table, order from their phone, and the ticket appears on the staff screen instantly.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#c2410c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
