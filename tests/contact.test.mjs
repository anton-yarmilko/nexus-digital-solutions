import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContact } from '../src/contact.js';

test('requires a name and email', () => {
  assert.deepEqual(validateContact({ name: '', email: '', message: '' }), {
    name: 'Please enter your name.',
    email: 'Please enter your email address.',
  });
});

test('rejects malformed email addresses', () => {
  assert.deepEqual(validateContact({ name: 'Anton', email: 'invalid', message: '' }), {
    email: 'Please enter a valid email address.',
  });
});

test('accepts a valid contact request', () => {
  assert.deepEqual(validateContact({ name: 'Anton', email: 'anton@example.com', message: 'Hello' }), {});
});

