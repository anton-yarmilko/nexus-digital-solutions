export function validateContact(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (!values.message.trim()) errors.message = "Please tell us about your project.";
  else if (values.message.trim().length < 10)
    errors.message = "Please add a little more detail (at least 10 characters).";
  return errors;
}

export async function submitContact(values, signal, transport = fetch) {
  const response = await transport("https://formsubmit.co/ajax/taboopip@gmail.com", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
      _replyto: values.email.trim(),
      _subject: "New NEXUS website inquiry",
      _template: "table",
      _url: typeof window === "undefined" ? "https://example.test" : window.location.origin,
      _honey: values.company,
    }),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  const providerRejected = data.success === false || data.success === "false";
  if (providerRejected && /activat/i.test(data.message || "")) {
    throw new Error(
      "Contact delivery is awaiting one-time activation. Email us at taboopip@gmail.com.",
    );
  }
  if (!response.ok || providerRejected || !data.success) {
    throw new Error(data.message || "We couldn't send your message. Please try again.");
  }
  return data;
}
