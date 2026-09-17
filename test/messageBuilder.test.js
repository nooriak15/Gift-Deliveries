'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGasModules } = require('./loadGas');

const sandbox = loadGasModules(['Constants.gs', 'MessageBuilder.gs']);
const { normalizeFormResponse, buildCoordinatorMessage, FIELDS, CHOICES } = sandbox;

function namedValues(overrides) {
  const base = {
    [FIELDS.CHILD_NAME]: ['Ari'],
    [FIELDS.CHILD_AGE]: ['7'],
    [FIELDS.CLIENT_TYPE]: ['Client'],
    [FIELDS.DELIVERY_WINDOW]: ['Anytime Friday, birthday is 9/20'],
    [FIELDS.PARENT_NAME_PHONE]: ['Dina Cohen (555-123-4567)'],
    [FIELDS.DELIVERY_LOCATION]: ['Home'],
    [FIELDS.HOME_ADDRESS]: ['123 Main St, Los Angeles, CA'],
    [FIELDS.GIFT_REQUEST_DETAILS]: ['LEGO set, nothing Disney'],
    [FIELDS.NEEDS_PACKING]: [CHOICES.NEEDS_PACKING.ALREADY_PACKED],
    [FIELDS.ADDITIONAL_NOTES]: ['']
  };
  return Object.assign(base, overrides);
}

test('normalizeFormResponse resolves the Home branch', () => {
  const fields = normalizeFormResponse(namedValues());
  assert.equal(fields.deliveryLocationType, 'Home');
  assert.equal(fields.address, '123 Main St, Los Angeles, CA');
});

test('normalizeFormResponse resolves the Hospital branch', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.DELIVERY_LOCATION]: ['Hospital'],
    [FIELDS.HOSPITAL_NAME]: ['Cedars-Sinai'],
    [FIELDS.HOSPITAL_ROOM]: ['4B-12'],
    [FIELDS.HOSPITAL_LEGAL_NAME]: ['Ariel Cohen']
  }));
  assert.equal(fields.deliveryLocationType, 'Hospital');
  assert.equal(fields.address, 'Cedars-Sinai, Room/Unit 4B-12');
  assert.equal(fields.hospitalLegalName, 'Ariel Cohen');
});

test('normalizeFormResponse resolves the Other branch', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.DELIVERY_LOCATION]: ['Other'],
    [FIELDS.OTHER_ADDRESS]: ['456 Side St']
  }));
  assert.equal(fields.deliveryLocationType, 'Other');
  assert.equal(fields.address, '456 Side St');
});

test('normalizeFormResponse resolves the "yes, needs packing" choice', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.NEEDS_PACKING]: [CHOICES.NEEDS_PACKING.YES]
  }));
  assert.equal(fields.packingStatus, CHOICES.NEEDS_PACKING.YES);
});

test('normalizeFormResponse resolves the "already packed in office" choice', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.NEEDS_PACKING]: [CHOICES.NEEDS_PACKING.ALREADY_PACKED]
  }));
  assert.equal(fields.packingStatus, CHOICES.NEEDS_PACKING.ALREADY_PACKED);
});

test('normalizeFormResponse resolves the "packing not needed" choice', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.NEEDS_PACKING]: [CHOICES.NEEDS_PACKING.NOT_NEEDED]
  }));
  assert.equal(fields.packingStatus, CHOICES.NEEDS_PACKING.NOT_NEEDED);
});

test('normalizeFormResponse defaults empty notes to (none)', () => {
  const fields = normalizeFormResponse(namedValues({ [FIELDS.ADDITIONAL_NOTES]: [''] }));
  assert.equal(fields.additionalNotes, '(none)');
});

test('buildCoordinatorMessage renders the emoji template by default', () => {
  const fields = normalizeFormResponse(namedValues());
  const message = buildCoordinatorMessage(fields);
  assert.match(message, /^🎁 NEW GIFT REQUEST/);
  assert.match(message, /Child: Ari, age 7 — Client/);
  assert.match(message, /📅 WHEN: Anytime Friday, birthday is 9\/20/);
  assert.match(message, /📍 DELIVER TO: Home — 123 Main St, Los Angeles, CA/);
  assert.match(message, /PARENT: Dina Cohen \(555-123-4567\)/);
  assert.match(message, /GIFT: LEGO set, nothing Disney/);
  assert.match(message, /PACKING: No, it's already packed in office/);
  assert.match(message, /NOTES: \(none\)/);
});

test('buildCoordinatorMessage renders a plain-text style when emoji disabled', () => {
  const fields = normalizeFormResponse(namedValues());
  const message = buildCoordinatorMessage(fields, false);
  assert.match(message, /^NEW GIFT REQUEST/);
  assert.doesNotMatch(message, /[\u{1F300}-\u{1FAFF}]/u);
});

test('buildCoordinatorMessage reflects the Hospital + packing-needed combination end to end', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.DELIVERY_LOCATION]: ['Hospital'],
    [FIELDS.HOSPITAL_NAME]: ['Cedars-Sinai'],
    [FIELDS.HOSPITAL_ROOM]: ['4B-12'],
    [FIELDS.HOSPITAL_LEGAL_NAME]: ['Ari'],
    [FIELDS.NEEDS_PACKING]: [CHOICES.NEEDS_PACKING.YES],
    [FIELDS.ADDITIONAL_NOTES]: ['Call security desk on arrival']
  }));
  const message = buildCoordinatorMessage(fields);
  assert.match(message, /📍 DELIVER TO: Hospital — Cedars-Sinai, Room\/Unit 4B-12/);
  assert.match(message, /LEGAL NAME \(for check-in\): Ari$/m);
  assert.match(message, /PACKING: Yes, it needs to be packed/);
  assert.match(message, /NOTES: Call security desk on arrival/);
});

test('buildCoordinatorMessage flags a hospital legal name that differs from the Child name', () => {
  const fields = normalizeFormResponse(namedValues({
    [FIELDS.CHILD_NAME]: ['Ari'],
    [FIELDS.DELIVERY_LOCATION]: ['Hospital'],
    [FIELDS.HOSPITAL_NAME]: ['Cedars-Sinai'],
    [FIELDS.HOSPITAL_ROOM]: ['4B-12'],
    [FIELDS.HOSPITAL_LEGAL_NAME]: ['Ariel Cohen']
  }));
  const message = buildCoordinatorMessage(fields);
  assert.match(message, /LEGAL NAME \(for check-in\): Ariel Cohen \(differs from Child name above\)/);
});

test('buildCoordinatorMessage omits the legal-name line for non-hospital deliveries', () => {
  const fields = normalizeFormResponse(namedValues());
  const message = buildCoordinatorMessage(fields);
  assert.doesNotMatch(message, /LEGAL NAME/);
});
