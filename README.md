# Miles Caton

Unofficial fan site. Every word, photo, link, video and award is editable at `/admin` (Decap CMS) without touching code. Same setup as happy's: content in `/content`, one build script, no site generator.

## How it's laid out

| Folder | What's in it |
|---|---|
| `content/` | One JSON file per page plus `site.json`. This is what the editor changes |
| `templates/` | The page templates (Nunjucks), with `layouts/` and `partials/` |
| `assets/` | CSS, JavaScript, fonts, favicon |
| `img/` | Photos. CMS uploads land in `img/uploads/` |
| `admin/` | The editor (`config.yml` defines every field) |
| `scripts/build.mjs` | Reads `content/`, renders `templates/`, resizes photos, writes `dist/` |

## Pages

| URL | What's on it |
|---|---|
| `/` | Hero with the playable guitar strings, the Overture, *Now playing* (latest single, plays in place), the chapter index, honors ticker |
| `/story/` | The year-by-year timeline (scrolls sideways) |
| `/sinners/` | The role, the sunset, the numbers, the soundtrack |
| `/music/` | Every single. Tap one and it plays right there |
| `/watch/` | The Screening Room. Pick a reel and it plays inside the projector |
| `/portraits/` | The contact-sheet film strip, plus a grid with a full-screen viewer |
| `/honors/` | Every win and nomination |
| `/press/` | Interviews, features and performances, newest first, filterable by type. Featured stories sit on top |

Every page ends with a big *Next chapter* link, so the site reads front to back.

## Put it online

1. **Netlify → Add new site → Import from Git →** pick `bkknerd/milescaton`. Netlify reads `netlify.toml` (`npm run build`, publish `dist`). Deploy.
2. **Turn on the editor login.** The editor signs in with GitHub, so anyone who edits needs write access to the repo.
   - On GitHub: Settings → Developer settings → OAuth Apps → **New OAuth App**. Homepage URL: your Netlify URL. Callback URL: `https://api.netlify.com/auth/done`. Copy the Client ID and generate a Client secret.
   - On Netlify: Site configuration → Access & security → **OAuth** → Install provider → GitHub, paste both.
3. **Set your address:** in the editor go to *Site settings → Live site address* and enter the Netlify URL (or your custom domain). This fixes share previews and the sitemap. Also update `site_url` in `admin/config.yml`.
4. **Corrections form:** the "Spotted something out of date?" form in the footer uses Netlify Forms. Submissions show up under *Forms* in Netlify. Turn the form off in *Site settings → Footer* if you don't want it.

## Editing

Go to `https://YOUR-SITE/admin/` and log in with GitHub.

- **Site settings:** name, menu order, intro loader, footer text, links, disclaimer.
- **Homepage:** every section can be **switched off** (Overture, Now playing, Chapters, Honors ticker). The Overture is built from blocks: add text, drop a small inline photo between sentences, reorder by dragging.
- **Pages:** Story years, Sinners, Music singles, Watch reels, Portraits, Honors, Press (add a story: outlet, headline, date, type, link; tick *Feature at the top* to promote it). All lists are drag-to-reorder.

Formatting in text fields: `*single asterisks*` = italic, `**double asterisks**` = the condensed caps style.

**YouTube:** paste only the ID. For `https://www.youtube.com/watch?v=TPvGrWa3iWA` the ID is `TPvGrWa3iWA`. For a playlist link `...playlist?list=OLAK5uy_...` paste the part after `list=` into the playlist field.

**Photos:** upload in the editor. Every photo is automatically resized and converted to AVIF/WebP on each build, so big originals are fine and pages stay fast. Always fill in the *description (alt text)* field.

Saving in the editor commits to GitHub; Netlify rebuilds and the change is live in about a minute.

## Work on it locally

```bash
npm install
npm start           # builds, serves http://localhost:8080 and rebuilds when you save a file
npm run cms         # in a second terminal: edit at http://localhost:8080/admin/ without logging in
```

## Photo rights

The photos currently on the site were supplied for a fan tribute and are not licensed. Before sharing widely or submitting to awards sites, clear them with the photographers or his team, or swap them for press-kit images in the editor.
