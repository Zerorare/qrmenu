import { currentStaffRestaurant } from '@/lib/auth';
import { getMenu } from '@/lib/db';
import MenuEditor from './MenuEditor';

export const dynamic = 'force-dynamic';

export default async function AdminMenuPage() {
  const restaurant = await currentStaffRestaurant();
  const menu = getMenu(restaurant.id, { includeUnavailable: true });

  return <MenuEditor restaurant={restaurant} menu={menu} />;
}
