import fs from "fs";
import path from "path";

// Ensure any dynamic route under src/pages/posts_blog with brackets
// exports getStaticPaths() that returns an empty array. This prevents
// Astro from attempting to generate dynamic pages and avoids
// "Missing parameter" errors in CI/build.

const pagesDir = path.join(process.cwd(), "src", "pages", "posts_blog");

function ensureFile(filePath) {
  let src = fs.readFileSync(filePath, "utf8");

  // If file already contains a getStaticPaths that returns [] somewhere, skip
  if (
    /export\s+function\s+getStaticPaths\s*\([\s\S]*?return\s*\[\s*\]/m.test(src)
  ) {
    return false;
  }

  // Remove any existing getStaticPaths function body and replace with a safe one.
  if (/export\s+function\s+getStaticPaths\s*\(/m.test(src)) {
    src = src.replace(
      /export\s+function\s+getStaticPaths\s*\([\s\S]*?\)\s*\{[\s\S]*?\}/m,
      "export function getStaticPaths() {\n  return [];\n}"
    );
  } else {
    // If file has frontmatter (---) insert function after it, otherwise prepend
    if (/^---/m.test(src)) {
      src = src.replace(
        /^---([\s\S]*?)---/,
        (m0, m1) =>
          `---${m1}---\n\nexport function getStaticPaths() {\n  return [];\n}`
      );
    } else {
      src = `export function getStaticPaths() {\n  return [];\n}\n\n` + src;
    }
  }

  fs.writeFileSync(filePath, src, "utf8");
  return true;
}

try {
  if (!fs.existsSync(pagesDir)) {
    // Nothing to do
    process.exit(0);
  }

  const files = fs.readdirSync(pagesDir);
  let changed = 0;
  for (const f of files) {
    if (f.includes("[") && f.endsWith(".astro")) {
      const full = path.join(pagesDir, f);
      if (ensureFile(full)) changed++;
    }
  }

  if (changed > 0) {
    console.log(`ensure-posts-dynamic: updated ${changed} file(s)`);
  }
  process.exit(0);
} catch (err) {
  console.error("ensure-posts-dynamic: error", err);
  process.exit(1);
}
