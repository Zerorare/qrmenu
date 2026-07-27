import { currentStaffRestaurant } from '@/lib/auth';
import { listActiveOrders, listRecentOrders } from '@/lib/db';
import PinLogin from '@/app/components/PinLogin';
import StaffBoard from './StaffBoard';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Orders — staff screen' };

export default async function StaffPage() {
  const restaurant = await currentStaffRestaurant();

  if (!restaurant) {
    return (
      <PinLogin
        dark
        title="Staff order screen"
        subtitle="Enter the PIN your manager gave you to see incoming table orders."
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
