import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
});

test("validates and forwards a contact request", async () => {
  let forwarded;
  const response = await worker.fetch(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Anton",
        email: "anton@example.com",
        message: "Please tell me about a new website.",
        company: "",
      }),
    }),
    {
      CONTACT_FETCH: async (url, options) => {
        forwarded = { url, headers: options.headers, payload: JSON.parse(options.body) };
        return Response.json({ success: true });
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, message: "Message sent." });
  assert.equal(forwarded.url, "https://formsubmit.co/ajax/taboopip@gmail.com");
  assert.equal(forwarded.headers.Origin, "https://example.test");
  assert.equal(forwarded.headers.Referer, "https://example.test/");
  assert.equal(forwarded.payload._replyto, "anton@example.com");
  assert.equal(forwarded.payload._url, "https://example.test");
});

test("reports the provider's one-time activation requirement", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Anton",
        email: "anton@example.com",
        message: "This message should be valid.",
      }),
    }),
    {
      CONTACT_FETCH: async () =>
        Response.json({ success: "false", message: "This form needs Activation." }),
    },
  );

  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "activation_required");
});

test("rejects invalid contact data before delivery", async () => {
  let forwards = 0;
  const response = await worker.fetch(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", email: "bad", message: "short" }),
    }),
    { CONTACT_FETCH: async () => { forwards += 1; } },
  );

  assert.equal(response.status, 400);
  assert.equal(forwards, 0);
});

test("silently accepts honeypot spam without forwarding it", async () => {
  let forwards = 0;
  const response = await worker.fetch(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Bot",
        email: "bot@example.com",
        message: "Automated marketing message",
        company: "https://spam.example",
      }),
    }),
    { CONTACT_FETCH: async () => { forwards += 1; } },
  );

  assert.equal(response.status, 200);
  assert.equal(forwards, 0);
});

test("returns a useful error when delivery is unavailable", async () => {
  const response = await worker.fetch(
    new Request("https://example.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Anton",
        email: "anton@example.com",
        message: "This message should be valid.",
      }),
    }),
    { CONTACT_FETCH: async () => new Response("bad gateway", { status: 503 }) },
  );

  assert.equal(response.status, 502);
  assert.match((await response.json()).message, /taboopip@gmail.com/);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
