import assert from "node:assert/strict";
import test from "node:test";
import { benefits, information } from "../src/content.js";

test("portfolio copy does not attribute unverified client history to the author", () => {
  const copy = benefits.map((item) => item.description).join(" ");
  assert.doesNotMatch(copy, /decades|partnered with clients|no templates|latest frameworks/i);
  assert.match(information["Terms of Service"], /non-commercial portfolio/i);
});
