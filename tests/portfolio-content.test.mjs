import assert from "node:assert/strict";
import test from "node:test";
import { benefits, information } from "../src/content.js";

test("portfolio copy does not attribute unverified client history to the author", () => {
  const copy = benefits.map((item) => item.description).join(" ");
  assert.doesNotMatch(copy, /decades|partnered with clients|no templates|latest frameworks/i);
  assert.match(information["Terms of Service"], /non-commercial portfolio/i);
});
test("published discovery links consistently use the verified Pages host", async () => {
  const { readFile } = await import("node:fs/promises");
  const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const html = await read("index.html");
  assert.match(html, /rel="canonical" href="https:\/\/nexus-anton\.pages\.dev\/"/);
  assert.match(html, /property="og:url" content="https:\/\/nexus-anton\.pages\.dev\/"/);
  for (const path of ["index.html", "public/robots.txt", "public/sitemap.xml", "README.md"]) {
    const text = await read(path);
    assert.ok(text.includes("https://nexus-anton.pages.dev/"), `${path} must publish the Pages URL`);
    assert.ok(!text.includes("chatgpt.site"), `${path} must not publish the retired hostname`);
  }
});
test("search and share metadata describe the independent portfolio, not an agency", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const key of ["description", "og:description"]) {
    const description = html.match(new RegExp(`(?:name|property)="${key}" content="([^"]+)"`))?.[1];
    assert.ok(description, `${key} is present`);
    assert.match(description, /independent non-commercial portfolio/i);
    assert.match(description, /not a commercial agency/i);
  }
  assert.match(html, /<title>NEXUS — Non-Commercial Portfolio Demo<\/title>/);
});
