import { currentStaffRestaurant } from '@/lib/auth';
import { updateSettings } from '../actions';
import { LANGUAGES } from '@/lib/i18n.mjs';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const restaurant = await currentStaffRestaurant();

  return (
    <main className="wrap" style={{ paddingBottom: 60, maxWidth: 720 }}>
      <h1 style={{ fontSize: 24, marginBottom: 0 }}>Settings</h1>
      <p className="muted tiny" style={{ marginTop: 4, marginBottom: 24 }}>
        The accent colour themes the guest menu, so it can match the restaurant&apos;s branding.
      </p>

      <form action={updateSettings} className="card" style={{ padding: 22 }}>
        <div style={{ marginBottom: 16 }}>
          <label className="lbl" htmlFor="name">
            Restaurant name
          </label>
          <input id="name" className="field" name="name" defaultValue={restaurant.name} required />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="lbl" htmlFor="tagline">
            Tagline
          </label>
          <input
            id="tagline"
            className="field"
            name="tagline"
            defaultValue={restaurant.tagline}
            placeholder="Shown under the name on the guest menu"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="lbl" htmlFor="language">
            Interface language
          </label>
          <select
            id="language"
            className="field"
            name="language"
            defaultValue={restaurant.language}
            style={{ maxWidth: 240 }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <p className="tiny muted" style={{ marginBottom: 0 }}>
            Changes the buttons guests and staff see, and the text printed on the QR cards.
            Dish names stay exactly as you typed them.
          </p>
        </div>

        <div className="row" style={{ marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 130px' }}>
            <label className="lbl" htmlFor="accent">
              Accent colour
            </label>
            <input
              id="accent"
              className="field"
              name="accent"
              type="color"
              defaultValue={restaurant.accent}
              style={{ height: 44, padding: 4 }}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label className="lbl" htmlFor="currencySymbol">
              Currency label
            </label>
            <input
              id="currencySymbol"
              className="field"
              name="currencySymbol"
              defaultValue={restaurant.currency_symbol}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label className="lbl" htmlFor="serviceCharge">
              Service charge (%)
            </label>
            <input
              id="serviceCharge"
              className="field"
              name="serviceCharge"
              type="number"
              min="0"
              max="100"
              step="0.5"
              defaultValue={restaurant.service_charge_pct}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label className="lbl" htmlFor="staffPin">
            Staff PIN
          </label>
          <input
            id="staffPin"
            className="field"
            name="staffPin"
            inputMode="numeric"
            pattern="\d{4,8}"
            defaultValue={restaurant.staff_pin}
            style={{ maxWidth: 180 }}
          />
          <p className="tiny muted" style={{ marginBottom: 0 }}>
            4–8 digits. Everyone who opens the staff screen uses this. Changing it signs out any
            other device that is already logged in.
          </p>
        </div>

        <button className="btn" type="submit">
          Save settings
        </button>
      </form>
    </main>
  );
}
