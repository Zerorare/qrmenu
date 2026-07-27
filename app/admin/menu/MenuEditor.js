'use client';

import { useState, useTransition } from 'react';
import {
  addCategory,
  addItem,
  deleteCategory,
  deleteItem,
  toggleItem,
  updateItem,
} from '../actions';

/** Stored minor units → the string an owner expects to see in the input. */
function priceValue(price, restaurant) {
  const decimals = restaurant.currency_decimals ?? 0;
  return decimals > 0 ? (price / 10 ** decimals).toFixed(decimals) : String(price);
}

function AvailabilitySwitch({ item }) {
  const [available, setAvailable] = useState(Boolean(item.available));
  const [, startTransition] = useTransition();

  return (
    <label className="switch" title={available ? 'Showing on the menu' : 'Hidden from guests'}>
      <input
        type="checkbox"
        checked={available}
        onChange={(event) => {
          const next = event.target.checked;
          setAvailable(next);
          startTransition(() => toggleItem(item.id, next));
        }}
      />
      <span className="track" />
    </label>
  );
}

function ItemRow({ item, restaurant }) {
  return (
    <tr style={{ opacity: item.available ? 1 : 0.55 }}>
      <td style={{ width: 52 }}>
        <AvailabilitySwitch item={item} />
      </td>
      <td colSpan={4} style={{ padding: 0 }}>
        <form action={updateItem}>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="imageUrl" value={item.image_url} />
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
            <input
              className="editable"
              name="name"
              defaultValue={item.name}
              aria-label="Item name"
              style={{ flex: '2 1 180px', fontWeight: 600 }}
            />
            <input
              className="editable"
              name="description"
              defaultValue={item.description}
              placeholder="Short description"
              aria-label="Description"
              style={{ flex: '3 1 220px' }}
            />
            <input
              className="editable"
              name="price"
              defaultValue={priceValue(item.price, restaurant)}
              inputMode="decimal"
              aria-label="Price"
              style={{ flex: '0 0 110px', textAlign: 'right' }}
            />
            <button className="btn ghost sm" type="submit">
              Save
            </button>
          </div>
        </form>
      </td>
      <td style={{ width: 44 }}>
        <form action={deleteItem}>
          <input type="hidden" name="id" value={item.id} />
          <button className="btn ghost sm" type="submit" aria-label={`Delete ${item.name}`}>
            ✕
          </button>
        </form>
      </td>
    </tr>
  );
}

export default function MenuEditor({ restaurant, menu }) {
  return (
    <main className="wrap" style={{ paddingBottom: 60 }}>
      <h1 style={{ fontSize: 24, marginBottom: 0 }}>Menu</h1>
      <p className="muted tiny" style={{ marginTop: 4, marginBottom: 24 }}>
        Edits go live the moment you save — no reprinting. Use the switch to hide anything
        you&apos;ve run out of; guests stop seeing it immediately.
      </p>

      {menu.length === 0 && (
        <div className="empty" style={{ marginBottom: 24 }}>
          No categories yet. Add your first one below — for example “Main dishes”.
        </div>
      )}

      {menu.map((category) => (
        <section key={category.id} style={{ marginBottom: 30 }}>
          <div className="spread" style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>
              {category.name}{' '}
              <span className="tiny muted" style={{ fontWeight: 400 }}>
                · {category.items.length} items
              </span>
            </h2>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <button className="btn ghost sm" type="submit">
                Delete category
              </button>
            </form>
          </div>

          <div className="card" style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <tbody>
                {category.items.map((item) => (
                  <ItemRow key={item.id} item={item} restaurant={restaurant} />
                ))}

                <tr>
                  <td colSpan={6} style={{ background: 'var(--surface-2)' }}>
                    <form action={addItem} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input
                        className="field"
                        name="name"
                        placeholder="New dish name"
                        required
                        style={{ flex: '2 1 180px' }}
                      />
                      <input
                        className="field"
                        name="description"
                        placeholder="Description (optional)"
                        style={{ flex: '3 1 220px' }}
                      />
                      <input
                        className="field"
                        name="price"
                        placeholder={`Price (${restaurant.currency_symbol})`}
                        inputMode="decimal"
                        required
                        style={{ flex: '0 0 140px' }}
                      />
                      <button className="btn sm" type="submit">
                        Add
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="card" style={{ padding: 18 }}>
        <form action={addCategory} className="row">
          <input
            className="field grow"
            name="name"
            placeholder="New category — e.g. Desserts"
            required
          />
          <button className="btn" type="submit">
            Add category
          </button>
        </form>
      </div>
    </main>
  );
}
