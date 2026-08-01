import { currentStaffRestaurant } from '@/lib/auth';
import { listActiveOrders, listRecentOrders, getDefaultRestaurant } from '@/lib/db';
import { t } from '@/lib/i18n.mjs';
import PinLogin from '@/app/components/PinLogin';
import StaffBoard from './StaffBoard';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Orders — staff screen' };

export default async function StaffPage() {
  const restaurant = await currentStaffRestaurant();

  if (!restaurant) {
    // Nobody is signed in yet, so fall back to the venue's own language.
    // Only plain strings cross into the client component — the string table
    // also holds formatter functions, which React cannot serialize.
    const L = t(getDefaultRestaurant()?.language);
    return (
      <PinLogin
        dark
        title={L.staffTitle}
        subtitle={L.staffSubtitle}
        strings={{ staffPin: L.staffPin, signIn: L.signIn, checking: L.checking }}
      />
    );
  }

  return (
    <StaffBoard
      restaurant={restaurant}
      initialActive={listActiveOrders(restaurant.id)}
      initialRecent={listRecentOrders(restaurant.id, 15)}
    />
  );
}
