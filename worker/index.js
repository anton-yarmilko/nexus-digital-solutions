const CONTACT_EMAIL = "taboopip@gmail.com";
const MAX_BODY_BYTES = 16_384;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const rateBuckets = new Map();

const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self'",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...securityHeaders,
      ...extraHeaders,
    },
  });
}

function withSecurityHeaders(response) {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) {
    secured.headers.set(name, value);
  }
  return secured;
}

function validateContact(payload) {
  const name = typeof payload?.name === "string" ? payload.name.trim() : "";
  const email = typeof payload?.email === "string" ? payload.email.trim() : "";
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  const company = typeof payload?.company === "string" ? payload.company.trim() : "";

  if (company) return { spam: true };
  if (!name || name.length > 120) return { error: "Please enter a valid name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return { error: "Please enter a valid email address." };
  if (message.length < 10 || message.length > 2000)
    return { error: "Please enter a message between 10 and 2,000 characters." };
  return { value: { name, email, message } };
}

function isRateLimited(request) {
  const key = request.headers.get("cf-connecting-ip");
  if (!key) return false;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT;
}

async function handleContact(request, env) {
  if (request.method !== "POST") {
    return json({ success: false, message: "Method not allowed." }, 405, { Allow: "POST" });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES)
    return json({ success: false, message: "Request is too large." }, 413);
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ success: false, message: "Expected a JSON request." }, 415);
  if (isRateLimited(request))
    return json({ success: false, message: "Too many requests. Please try again later." }, 429, {
      "Retry-After": "600",
    });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ success: false, message: "Invalid request." }, 400);
  }
  const result = validateContact(payload);
  if (result.spam) return json({ success: true, message: "Message accepted." });
  if (result.error) return json({ success: false, message: result.error }, 400);

  const transport = env?.CONTACT_FETCH || fetch;
  let upstream;
  try {
    upstream = await transport(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: new URL(request.url).origin,
        Referer: `${new URL(request.url).origin}/`,
      },
      body: JSON.stringify({
        name: result.value.name,
        email: result.value.email,
        message: result.value.message,
        _replyto: result.value.email,
        _subject: "New NEXUS website inquiry",
        _template: "table",
        _url: new URL(request.url).origin,
        _honey: "",
      }),
    });
  } catch {
    return json(
      { success: false, message: `Delivery is temporarily unavailable. Email us at ${CONTACT_EMAIL}.` },
      502,
    );
  }

  const data = await upstream.json().catch(() => ({}));
  const providerRejected = data.success === false || data.success === "false";
  const activationRequired =
    providerRejected && /activat/i.test(typeof data.message === "string" ? data.message : "");
  if (activationRequired) {
    return json(
      {
        success: false,
        code: "activation_required",
        message: `Contact delivery is awaiting one-time activation. Email us at ${CONTACT_EMAIL}.`,
      },
      503,
    );
  }
  if (!upstream.ok || providerRejected) {
    return json(
      { success: false, message: `We couldn't deliver your message. Email us at ${CONTACT_EMAIL}.` },
      502,
    );
  }
  return json({ success: true, message: "Message sent." });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContact(request, env);

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return withSecurityHeaders(response);
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return withSecurityHeaders(await env.ASSETS.fetch(new Request(indexUrl, request)));
  },
};
