import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap hero center">
      <h1 style={{ fontSize: 28 }}>That table doesn&apos;t exist</h1>
      <p className="lede" style={{ margin: '0 auto 24px' }}>
        The QR code may be out of date, or the table was renamed. Please ask a staff member for
        the current code.
      </p>
      <Link className="btn" href="/">
        Go to the start
      </Link>
    </main>
  );
}
