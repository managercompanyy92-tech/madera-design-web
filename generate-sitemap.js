// scripts/generate-sitemap.js
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://madera-dushanbe.vercel.app";

// Все маршруты сайта (ТОЛЬКО реально существующие URL)
const paths = [
  "/",            // Главная
  "/catalog",     // Каталог
  "/order",       // Заказ / калькулятор
  "/profile",     // Личный кабинет
  "/more",        // Раздел "Ещё"

  // Ниже допиши свои реальные страницы из раздела "Ещё"
  // "/more/materials",
  // "/more/timing",
  // "/more/services",
  // "/more/status",
  // "/more/actions",
  // "/more/faq",
  // "/more/portfolio",
  // "/more/documents",
  // "/more/partners",
  // "/more/contacts",
  // "/more/design",
];

function generateSitemap() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const urls = paths
    .map((p, index) => {
      // Простая логика приоритета:
      let priority = 0.7;
      if (p === "/") priority = 1.0;
      else if (p === "/catalog" || p === "/order") priority = 0.9;
      else if (p === "/profile") priority = 0.4;

      return `
  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  // Кладём sitemap в папку public, чтобы он отдавался по /sitemap.xml
  const outPath = path.join(__dirname, "..", "public", "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log("Sitemap generated:", outPath);
}

generateSitemap();
