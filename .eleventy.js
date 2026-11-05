const path = require("path");
const markdownIt = require("markdown-it");
const ImageMod = require("@11ty/eleventy-img");
const Image = ImageMod.default || ImageMod.Image || ImageMod;

const md = markdownIt({ html: false, typographer: true, breaks: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addWatchTarget("src/assets");

  // *italic*  **condensed caps**  — used across the CMS text fields
  eleventyConfig.addFilter("mdi", (s) => (s ? md.renderInline(String(s)) : ""));
  eleventyConfig.addFilter("md", (s) => (s ? md.render(String(s)) : ""));
  eleventyConfig.addFilter("nl2br", (s) => (s ? String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\n/g, "<br>") : ""));
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("roman", (n) => ["i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii"][n] || String(n + 1));
  eleventyConfig.addFilter("chars", (s) => String(s || "").split(""));
  eleventyConfig.addFilter("absUrl", (p, base) => { try { return new URL(p, base).href; } catch (e) { return p; } });
  eleventyConfig.addFilter("isCurrent", (url, pageUrl) => url !== "/" && pageUrl && pageUrl.startsWith(url));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  eleventyConfig.addFilter("pressDate", (it) => {
    if (it.display) return it.display;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(it.date || ""); if (!m) return it.date || "";
    return `${MON[+m[2]-1]} ${+m[3]}, ${m[1]}`;
  });
  eleventyConfig.addFilter("pressYear", (it) => String(it.date || "").slice(0, 4));
  eleventyConfig.addFilter("sortPress", (items) => [...(items || [])].sort((a, b) => String(b.date).localeCompare(String(a.date))));
  eleventyConfig.addFilter("uniqKinds", (items) => [...new Set((items || []).map((i) => i.kind).filter(Boolean))]);
  eleventyConfig.addFilter("onlyFeatured", (items) => (items || []).filter((i) => i.featured));
  eleventyConfig.addFilter("take", (arr, n) => (arr || []).slice(0, n));

  // Responsive images: AVIF + WebP + JPEG at several widths, built on every deploy.
  // Works for the original photos and anything uploaded through the CMS.
  eleventyConfig.addAsyncShortcode("img", async function (src, alt = "", cls = "", sizes = "100vw", attrs = "") {
    if (!src) return "";
    const input = path.join("src", src.replace(/^\//, ""));
    let meta;
    try {
      meta = await Image(input, {
        widths: [400, 800, 1200, 1800, "auto"],
        formats: ["avif", "webp", "jpeg"],
        outputDir: "_site/img/r/",
        urlPath: "/img/r/",
        sharpJpegOptions: { quality: 78, progressive: true },
        sharpWebpOptions: { quality: 76 },
        sharpAvifOptions: { quality: 55 },
      });
    } catch (e) {
      console.warn("[img] could not process", src, e.message);
      return `<img src="${src}" alt="${alt}" class="${cls}" loading="lazy" decoding="async" ${attrs}>`;
    }
    const lazy = /fetchpriority="high"/.test(attrs) ? "eager" : "lazy";
    const html = Image.generateHTML(meta, { alt, sizes, loading: lazy, decoding: "async" });
    return html.replace("<img ", `<img class="${cls}" ${attrs} `);
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
  };
};
