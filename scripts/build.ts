import { spawnSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  mkdirSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { join } from "node:path";
const profile = process.argv[2] || "chapter";
if (!["chapter", "preview", "embed-test"].includes(profile))
  throw new Error("Unknown build profile");
const digest = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
const coverage = JSON.parse(
  readFileSync("artifacts/rocq-coverage.json", "utf8"),
);
for (const [path, hash] of Object.entries(coverage.sources ?? {})) {
  if (digest(readFileSync(path)) !== hash)
    throw new Error(
      `${path} changed after verification. Run npm run test:rocq.`,
    );
}
if (!coverage.sources)
  throw new Error("Verification evidence is outdated. Run npm run test:rocq.");
if (coverage.sha256 !== digest(readFileSync("src/content/dungeon.json")))
  throw new Error(
    "Content is not verified. Run npm run test:rocq before building.",
  );
const run = (cmd: string, args: string[]) => {
  const p = spawnSync(cmd, args, { stdio: "inherit" });
  if (p.status !== 0) process.exit(p.status ?? 1);
};
run("node", ["node_modules/vite/bin/vite.js", "build", "--mode", profile]);
const out = `dist/${profile}`;
run("python3", ["scripts/poster.py", `${out}/poster.png`, profile]);
const base = new URL(
  process.env.SITE_URL || "https://clarus.github.io/pstack-game-proof/",
);
if (base.protocol !== "https:") throw new Error("SITE_URL must be HTTPS");
if (!base.pathname.endsWith("/")) base.pathname += "/";
const title =
  profile === "embed-test"
    ? "Interactive card test"
    : "Proof Quest · The Proof Dungeon";
const entryHtml = readFileSync(`${out}/index.html`, "utf8");
const pages = [
  "index.html",
  "embed.html",
  "chapter-1.html",
  ...(profile === "chapter" ? ["chapter-2.html"] : []),
];
if (profile === "chapter")
  run("python3", [
    "scripts/poster.py",
    `${out}/workshop-poster.png`,
    "workshop",
  ]);
for (const file of pages) {
  const workshop = file === "chapter-2.html";
  const chapterPage = /^chapter-/.test(file);
  let html = chapterPage ? entryHtml : readFileSync(`${out}/${file}`, "utf8");
  const pageTitle = workshop ? "Proof Quest · The Proof Workshop" : title;
  html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);
  const player = new URL("embed.html", base);
  if (chapterPage) player.searchParams.set("chapter", workshop ? "2" : "1");
  const tags = [
    ["twitter:card", "player"],
    ["twitter:title", pageTitle],
    [
      "twitter:description",
      workshop
        ? "Repair six workshop stations with witnesses, rules, and proofs."
        : profile === "embed-test"
          ? "One room for testing an interactive card."
          : "Learn to build proofs, one dungeon room at a time.",
    ],
    [
      "twitter:image",
      new URL(workshop ? "workshop-poster.png" : "poster.png", base).href,
    ],
    ["twitter:player", player.href],
    ["twitter:player:width", "560"],
    ["twitter:player:height", "315"],
  ];
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  html = html.replace(
    "</head>",
    tags
      .map(
        ([name, content]) =>
          `<meta name="${name}" content="${escape(content)}">`,
      )
      .join("") + "</head>",
  );
  writeFileSync(`${out}/${file}`, html);
}
writeFileSync(`${out}/.nojekyll`, "");
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) =>
    statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : [join(dir, n)],
  );
}
const payload = files(out).filter((p) => !p.endsWith("/embed.html"));
const total = payload.reduce(
  (sum, p) => sum + gzipSync(readFileSync(p)).length,
  0,
);
if (total > 150 * 1024)
  throw new Error(`First-load upper bound exceeds 150 KiB: ${total}`);
if (files(out).some((p) => /\.(v|py|ts)$/.test(p) || p.includes("skills/")))
  throw new Error("Development files leaked");
const report = {
  profile,
  siteUrl: base.href,
  contentSha256: coverage.sha256,
  workshopSha256:
    profile === "chapter"
      ? digest(readFileSync("src/content/workshop.json"))
      : null,
  levels: profile === "chapter" ? 13 : profile === "preview" ? 6 : 1,
  gzipBytesUpperBound: total,
  files: files(out).map((p) => ({
    path: p.slice(out.length + 1),
    sha256: digest(readFileSync(p)),
  })),
};
mkdirSync("artifacts", { recursive: true });
writeFileSync(
  `artifacts/build-${profile}.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `${profile}: ${(total / 1024).toFixed(1)} KiB gzip upper bound (all assets, including poster).`,
);
