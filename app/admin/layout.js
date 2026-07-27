import Link from 'next/link';
import { currentStaffRestaurant } from '@/lib/auth';
import PinLogin from '@/app/components/PinLogin';
import AdminNav from './AdminNav';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Owner dashboard' };

export default async function AdminLayout({ children }) {
  const restaurant = await currentStaffRestaurant();

  if (!restaurant) {
    return (
      <PinLogin
        title="Owner dashboard"
        subtitle="Sign in to edit your menu, manage tables and print QR codes."
      />
    );
  }

  return (
    <div style={{ '--accent': restaurant.accent }}>
      <div className="admin-nav no-print">
        <div className="wrap">
          <strong style={{ paddingRight: 18, fontSize: 15 }}>{restaurant.name}</strong>
          <AdminNav />
          <span className="grow" />
          <Link className="tiny muted" href="/staff" style={{ padding: '0 10px' }}>
            Staff screen ↗
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
