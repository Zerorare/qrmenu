'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/admin', 'Overview'],
  ['/admin/menu', 'Menu'],
  ['/admin/tables', 'Tables'],
  ['/admin/qr', 'QR codes'],
  ['/admin/settings', 'Settings'],
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
          {label}
        </Link>
      ))}
    </>
  );
}
