# Landing Page Setup Checklist

## 1) Fill required placeholders

Update these values in `index.html`:

- `https://YOUR_DOMAIN_HERE/` in:
  - `canonical`
  - `og:url`
  - `og:image`
  - `twitter:image`
- `G-XXXXXXXXXX` in `window.LANDING_CONFIG.ga4MeasurementId`

## 2) OG image

- Current OG image path: `assets/og-image.png`
- Current size: `1200x630` (recommended for social sharing)

If you need to replace it, keep same ratio and update:

- `og:image`
- `twitter:image`
- optional: `og:image:width` and `og:image:height`

## 3) Deploy options

### Option A: GitHub Pages

1. Push project to GitHub repo.
2. In repo settings, enable Pages from the main branch root.
3. Wait for build and open the published URL.

### Option B: Netlify

1. Create new site from Git.
2. Connect repository.
3. Build command: leave empty (static site).
4. Publish directory: `/` (root).

### Option C: Vercel

1. Import project from Git.
2. Framework preset: `Other`.
3. Build command: none.
4. Output directory: `/`.

## 4) Validate after deploy

1. Open your live URL and submit the form once.
2. Check browser console for `[tracking] generate_lead`.
3. In GA4 Realtime, confirm `generate_lead` event arrives.
4. Re-scrape social preview:
   - Facebook Sharing Debugger
   - WhatsApp link preview (send to yourself)
