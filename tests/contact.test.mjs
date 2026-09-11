import assert from 'node:assert/strict';
import test from 'node:test';
import { submitContact, validateContact } from '../src/contact.js';

test('requires a name and email', () => {
  assert.deepEqual(validateContact({ name: '', email: '', message: '' }), {
    name: 'Please enter your name.',
    email: 'Please enter your email address.',
    message: 'Please tell us about your project.',
  });
});

test('rejects malformed email addresses', () => {
  assert.deepEqual(validateContact({ name: 'Anton', email: 'invalid', message: 'A valid project message' }), {
    email: 'Please enter a valid email address.',
  });
});

test('requires a useful message', () => {
  assert.deepEqual(validateContact({ name: 'Anton', email: 'anton@example.com', message: 'Hello' }), {
    message: 'Please add a little more detail (at least 10 characters).',
  });
});

test('accepts a valid contact request', () => {
  assert.deepEqual(validateContact({ name: 'Anton', email: 'anton@example.com', message: 'Hello there' }), {});
});

test('submits normalized contact data to the configured inbox', async () => {
  let sent;
  const result = await submitContact(
    { name: ' Anton ', email: ' anton@example.com ', message: ' Hello there ', company: '' },
    undefined,
    async (url, options) => {
      sent = { url, payload: JSON.parse(options.body) };
      return Response.json({ success: 'true', message: 'sent' });
    },
  );

  assert.equal(result.success, 'true');
  assert.equal(sent.url, 'https://formsubmit.co/ajax/taboopip@gmail.com');
  assert.equal(sent.payload.name, 'Anton');
  assert.equal(sent.payload._replyto, 'anton@example.com');
  assert.equal(sent.payload._honey, '');
});

test('reports one-time provider activation truthfully', async () => {
  await assert.rejects(
    submitContact(
      { name: 'Anton', email: 'anton@example.com', message: 'Hello there', company: '' },
      undefined,
      async () => Response.json({ success: 'false', message: 'This form needs Activation.' }),
    ),
    /awaiting one-time activation/,
  );
});
