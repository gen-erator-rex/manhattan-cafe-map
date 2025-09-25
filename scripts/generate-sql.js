// scripts/generate-seed-sql.js
// Converts cafes.json -> SQL INSERTs for Supabase

const fs = require('fs');
const path = require('path');

const INPUT = path.join(process.cwd(), 'cafes.json');
const OUTPUT = path.join(process.cwd(), 'seed_cafes.sql');

function escStr(v) {
  if (v == null || v === '') return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}
function escInt(v) {
  if (v == null || v === '') return 'NULL';
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : 'NULL';
}
function tagsToArray(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return "ARRAY[]::text[]";
  return "ARRAY[" + tags.map(t => "'" + String(t).replace(/'/g, "''") + "'").join(",") + "]";
}

function main() {
  const raw = fs.readFileSync(INPUT, 'utf8');
  const cafes = JSON.parse(raw);

  if (!Array.isArray(cafes)) {
    throw new Error('cafes.json must be an array of cafe objects.');
  }

  const rows = cafes.map((c, i) => {
    // Expecting coords: [lon, lat]
    const lon = c.coords && c.coords.length === 2 ? Number(c.coords[0]) : null;
    const lat = c.coords && c.coords.length === 2 ? Number(c.coords[1]) : null;

    return `(${[
      escStr(c.name),                               // name
      escStr(c.address || null),                    // address
      lon ?? 'NULL',                                // lon
      lat ?? 'NULL',                                // lat
      escStr(c.founderReview || null),              // founder_review
      escInt(c.rating),                             // rating
      tagsToArray(c.tags),                          // tags
      escStr(c.logo || null)                        // logo
    ].join(', ')})`;
  });

  const sql =
`insert into public.cafes
  (name, address, lon, lat, founder_review, rating, tags, logo)
values
${rows.join(',\n')}
;`;

  fs.writeFileSync(OUTPUT, sql, 'utf8');
  console.log(`✅ Wrote ${cafes.length} rows to ${OUTPUT}`);
}

main();
