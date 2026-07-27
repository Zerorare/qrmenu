import { notFound } from 'next/navigation';
import { getRestaurantBySlug, getTable, getMenu } from '@/lib/db';
import MenuClient from './MenuClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  return {
    title: restaurant ? `${restaurant.name} — Menu` : 'Menu',
    themeColor: restaurant?.accent ?? '#c2410c',
  };
}

export default async function TableMenuPage({ params }) {
  const { slug, table: tableCode } = await params;

  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const table = getTable(restaurant.id, tableCode);
  if (!table) notFound();

  const menu = getMenu(restaurant.id).filter((category) => category.items.length > 0);

  return <MenuClient restaurant={restaurant} table={table} menu={menu} />;
}
