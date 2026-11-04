# MzFonts

A tiny, static, Google Fonts-style font CDN. No logging, no tracking, no cookies from the project itself. It runs on Cloudflare Pages, so Cloudflare still handles requests at its edge.

Live: https://mzfonts.pages.dev

## Use it

    <link rel="stylesheet" href="https://mzfonts.pages.dev/roboto/index.css">

Variable fonts use the family name `'Roboto Variable'`. Static fonts keep the plain name, like `'Poppins'`.

## How it works

Font files come from [Fontsource](https://fontsource.org), which packages Google Fonts as npm packages. These scripts only copy `.woff2` files and CSS, so there is nothing to run per request.

- `fonts.txt` lists the fonts, most popular first
- `make-list.mjs` builds that list from Google's popularity ranking
- `build.mjs` downloads each font (variable preferred, static as fallback) into `dist/`
- `gen-index.mjs` writes the landing page at `dist/index.html`

## Build your own

Needs Node 18 or newer.

    node make-list.mjs 300
    node build.mjs
    node gen-index.mjs
    npx wrangler pages deploy dist --project-name your-project

Before deploying, create `dist/_headers` with this content:

    /*
      Access-Control-Allow-Origin: *
      Cache-Control: public, max-age=31536000, immutable
      X-Content-Type-Options: nosniff

Edit the `DOMAIN` line and the email address in `gen-index.mjs` first.

Cloudflare's free plan allows 20,000 files per deployment, and `build.mjs` stops at 19,000.

## Licenses

The scripts in this repo are MIT licensed (see LICENSE). The fonts are not part of this repo and keep their own licenses, mostly the SIL Open Font License 1.1, some Apache 2.0. Each font folder in a build includes its LICENSE file.
EOF
ls
