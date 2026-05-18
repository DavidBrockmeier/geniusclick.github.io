# Genius Click — geniusclick.com

Three-page site (Home, Pricing, Contact) built with Vite + React 19 + Tailwind v4.

## Local development

```bash
npm install
npm run dev
```

Dev server at http://localhost:5173.

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to GitHub Pages

### One-time setup

1. Create a GitHub repo. Public is fine; private requires GitHub Pro for Pages.
2. Initialize the repo and push to `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   git push -u origin main
   ```
3. In GitHub repo Settings → Pages, set source to "Deploy from a branch" → `gh-pages` → `/ (root)`. The first `npm run deploy` will create the branch.
4. After the first deploy, set the custom domain to `geniusclick.com` in Settings → Pages. The `CNAME` file in `public/` ensures every build preserves this.
5. Configure DNS at your registrar. Apex domain needs A records pointing to GitHub Pages:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   If using Cloudflare DNS, set these as A records. Proxy off initially to verify HTTPS provisions on GitHub's side, then turn on the orange cloud if you want Cloudflare in front.

### Deploying changes

```bash
npm run deploy
```

This runs the production build and pushes `dist/` to the `gh-pages` branch.

## Project structure

```
.
├── index.html              # HTML entry, Google Fonts loaded here
├── package.json
├── vite.config.js
├── public/
│   └── CNAME               # geniusclick.com — survives every deploy
└── src/
    ├── App.jsx             # All three pages + configurator
    ├── main.jsx            # React entry
    └── index.css           # Tailwind import + body reset
```

## Where the copy lives

Everything is in `src/App.jsx`:

- `CATEGORIES` — configurator capability options, descriptions, and prices
- `RESPONSE_TIERS` — Standard vs Premium tier definitions
- `PREPAY_OPTIONS` — discount tiers (monthly, quarterly, semiannual, annual)
- `BASE_PRICE` — base per-seat monthly rate (currently $129)
- `CAPABILITIES` — bulleted list on the homepage
- `HomePage` — hero, philosophy section (three principles), capabilities grid, closing CTA
- `PricingPage` — header + configurator
- `ContactPage` — email card linking to hello@geniusclick.com
