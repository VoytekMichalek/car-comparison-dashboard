# Hosting and deployments

The dashboard is a Vite static build: no database, functions or runtime API secrets are needed.

## Live deployment

Published on 18 October 2026 at **https://car-comparison-dashboard.pages.dev** using Cloudflare Pages' free static hosting.

- Source: [VoytekMichalek/car-comparison-dashboard](https://github.com/VoytekMichalek/car-comparison-dashboard).
- Production branch: `main`. Each push triggers an automatic build and deployment.
- Build command: `npm run build`; output directory: `dist`; root: repository root.
- Build environment: `NODE_VERSION=22` (Cloudflare used Node 22.22.0 for the initial deployment).
- No custom domain, paid add-on or Pages Functions is configured.

Personal notebook data and cost overrides stay in each visitor's browser. To move your localhost notebook to the live site, export it locally and import that backup on the live hostname.

## Cloudflare Pages

Cloudflare's current documentation says requests to static assets are free and unlimited when they do not invoke Functions: [Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/). Free-plan build and project limits still apply. A purchased custom domain is optional; the provided `pages.dev` address is enough to share the dashboard.

### Git integration

1. Push changes to the GitHub repository above, or connect a different GitHub or GitLab repository for another installation.
2. In Cloudflare, create a Pages project and connect that repository.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Select Node.js 22.12 or later (22.23.3 was used for validation). Commit `package-lock.json` so installs are reproducible.
5. Deploy. Open the returned URL and test a comparison link, images/fonts, notebook save/reload and backup export/import.

### Direct upload

Run these locally, then use Pages' Direct Upload flow to upload **the contents of `dist/`**:

```bash
npm ci
npm test
npm run build
```

References: [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Vite static deployment](https://vite.dev/guide/static-deploy.html).

## URL and asset behavior

The Vite base is relative (`./`). Navigation uses hash state, such as `/#view=compare&cars=model-y-rwd-2022%2Cev6-air-2022`, so it needs no server-side route rewrites. Public image/font paths are rewritten by Vite for the built CSS and resolved against `import.meta.env.BASE_URL` for vehicle photographs. This also supports serving the build from a subdirectory.

The catalogue and reusable photographs are included in the public bundle. Personal notes and listings are saved independently by each visitor's browser. A newly published hostname has separate local storage from localhost; export/import your notebook to transfer it. Sharing the URL includes scoring weights but does not transfer local quotes, notes or fit confirmations, or create shared editing. Scores using private assumptions can differ for recipients.

Keep the image attribution/license links and the bundled font licenses when redistributing. No telemetry is configured.
