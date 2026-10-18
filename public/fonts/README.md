# Local font assets

Downloaded on 18 October 2026 from official Google Fonts services. These assets are served locally by the dashboard; no Google Fonts request is needed at runtime.

| Local file | Font family | Style | Variable weight range | Character subset |
| --- | --- | --- | --- | --- |
| `dm-sans-latin-variable.woff2` | DM Sans | normal | 100–1000 | Latin |
| `manrope-latin-variable.woff2` | Manrope | normal | 200–800 | Latin |

The WOFF2 files are unchanged downloads of the Latin variable-font renditions returned by this official stylesheet request:

<https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&family=Manrope:wght@200..800&display=swap>

Both families are licensed under the SIL Open Font License 1.1. The complete upstream license and copyright notices are preserved separately in `DM-Sans-OFL.txt` and `Manrope-OFL.txt`. Each font remains under its supplied license. The Latin subsets include English text, Australian dollar signs, punctuation, arrows and minus signs; characters outside those subsets use the application's system-font fallback.

## Source URLs and SHA-256 checksums

- `dm-sans-latin-variable.woff2`
  - Source: <https://fonts.gstatic.com/s/dmsans/v17/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2>
  - SHA-256: `9fea608a947e67020c33cad9a6fe3d60c54119dfb8cff87768a8117a15ed7543`
- `manrope-latin-variable.woff2`
  - Source: <https://fonts.gstatic.com/s/manrope/v20/xn7gYHE41ni1AdIRggexSg.woff2>
  - SHA-256: `a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972`
- `DM-Sans-OFL.txt`
  - Source: <https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt>
  - SHA-256: `9af36190332437f5ecd09974de43c1f7c77a310a996cdd8ceb25628b458840e1`
- `Manrope-OFL.txt`
  - Source: <https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt>
  - SHA-256: `58172e0c0fac2cda8a37b348164bb55e44b0e69051e557e92b1d3f6910141f7b`

## CSS integration

Use `font-style: normal`, `font-display: swap`, `font-weight: 100 1000` for DM Sans and `font-weight: 200 800` for Manrope. Reference `/fonts/dm-sans-latin-variable.woff2` and `/fonts/manrope-latin-variable.woff2` with `format('woff2')` in local `@font-face` declarations.
