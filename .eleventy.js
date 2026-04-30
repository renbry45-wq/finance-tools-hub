// Eleventy 3.x config (ESM)
// - Templates: Nunjucks (.njk)
// - Source:    src/
// - Output:    dist/
// - URLs:      preserved as .html (no permalinks rewriting)
// - Passthrough: assets/, favicon, icons, manifest, sw.js, robots.txt

export default function (eleventyConfig) {
  // Static asset passthroughs — copied as-is to dist/
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static/favicon.png": "favicon.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/icon-192.png": "icon-192.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/icon-512.png": "icon-512.png" });
  eleventyConfig.addPassthroughCopy({ "src/static/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/static/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/static/robots.txt": "robots.txt" });

  // Use Nunjucks for HTML files so {% include %} / {% extends %} work in .html templates
  eleventyConfig.setTemplateFormats(["njk", "11ty.js"]);

  // Filter: ISO date helper for sitemap.xml
  eleventyConfig.addFilter("isoDate", (d) => {
    const dt = d ? new Date(d) : new Date();
    return dt.toISOString().slice(0, 10);
  });

  // Filter: long human date for article hero ("May 5, 2026")
  eleventyConfig.addFilter("longDate", (d) => {
    const dt = d ? new Date(d) : new Date();
    return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
