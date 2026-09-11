import assert from 'node:assert/strict';
import test from 'node:test';
import { validateContact } from '../src/contact.js';

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
