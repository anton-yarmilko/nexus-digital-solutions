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

export async function submitContact(values, signal) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
    signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.message || "We couldn't send your message. Please try again.");
  }
  return data;
}
