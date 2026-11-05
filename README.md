# Miles Caton — a fan record

An unofficial fan site built with **Eleventy** (static site generator) and **Decap CMS** (the open-source successor to Netlify CMS). Every word, photo, link, video and award on the site is editable at `/admin` without touching code.

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

## Put it online (about 10 minutes)

1. **Make a GitHub repo** and push this folder to it (branch `main`).
2. **Netlify → Add new site → Import from Git →** pick the repo. Netlify reads `netlify.toml`, so the build settings fill themselves in (`npm run build`, publish `_site`). Deploy.
3. **Turn on the editor login:** Site configuration → **Identity** → Enable. Under *Registration* choose **Invite only**. Under *Services* → **Enable Git Gateway**.
4. **Invite yourself:** Identity → Invite users → your email. Open the email, set a password. You land in the editor.
5. **Set your address:** in the editor go to *Site settings → Live site address* and enter the Netlify URL (or your custom domain). This fixes share previews and the sitemap. Also update `site_url` in `src/admin/config.yml` if you want the editor's "view live" button to point there.
6. **Corrections form:** the "Spotted something out of date?" form in the footer uses Netlify Forms. Submissions show up under *Forms* in Netlify. You can set up email notifications there. Turn the form off in *Site settings → Footer* if you don't want it.

## Editing

Go to `https://YOUR-SITE/admin/` and log in.

- **Site settings:** name, menu order, intro loader, footer text, links, disclaimer.
- **Homepage:** every section can be **switched off** (Overture, Now playing, Chapters, Honors ticker). The Overture is built from blocks: add text, drop a small inline photo between sentences, reorder by dragging.
- **Pages:** Story years, Sinners, Music singles, Watch reels, Portraits, Honors, Press (add a story: outlet, headline, date, type, link; tick *Feature at the top* to promote it). All lists are drag-to-reorder.

Formatting in text fields: `*single asterisks*` = italic, `**double asterisks**` = the condensed caps style.

**YouTube:** paste only the ID. For `https://www.youtube.com/watch?v=TPvGrWa3iWA` the ID is `TPvGrWa3iWA`. For a playlist link `...playlist?list=OLAK5uy_...` paste the part after `list=` into the playlist field.

**Photos:** upload in the editor. Every photo is automatically resized and converted to AVIF/WebP on each deploy, so big originals are fine and pages stay fast. Always fill in the *description (alt text)* field.

Saving in the editor commits to GitHub; Netlify rebuilds and the change is live in about a minute.

## Work on it locally

```bash
npm install
npm start           # site at http://localhost:8080
npm run cms         # in a second terminal: edit at http://localhost:8080/admin/ without logging in
```

## Photo rights

The photos currently on the site were supplied for a fan tribute and are not licensed. Before sharing widely or submitting to awards sites, clear them with the photographers or his team, or swap them for press-kit images in the editor.
