/**
 * Pure message-building logic (no Google services touched here) so it can
 * be unit tested directly — see test/messageBuilder.test.js.
 */

function firstValue_(namedValues, key) {
  var values = namedValues[key];
  if (!values || !values.length) return '';
  return String(values[0]).trim();
}

/**
 * Converts the onFormSubmit event's e.namedValues (question title -> [answer])
 * into a flat object, resolving the delivery-location branch (Home / Hospital
 * / Other) to whichever columns the form actually populated, and pulling in
 * the gift-kind follow-up only when the packing question's answer is
 * CHOICES.NEEDS_PACKING.YES.
 */
function normalizeFormResponse(namedValues) {
  var deliveryLocationType = firstValue_(namedValues, FIELDS.DELIVERY_LOCATION);

  var address;
  if (deliveryLocationType === 'Hospital') {
    var hospitalName = firstValue_(namedValues, FIELDS.HOSPITAL_NAME);
    var room = firstValue_(namedValues, FIELDS.HOSPITAL_ROOM);
    address = hospitalName + (room ? ', Room/Unit ' + room : '');
  } else if (deliveryLocationType === 'Home') {
    address = firstValue_(namedValues, FIELDS.HOME_ADDRESS);
  } else {
    address = firstValue_(namedValues, FIELDS.OTHER_ADDRESS);
  }

  var needsPacking = firstValue_(namedValues, FIELDS.NEEDS_PACKING);
  var packingStatus;
  if (needsPacking === CHOICES.NEEDS_PACKING.YES) {
    var giftKind = firstValue_(namedValues, FIELDS.PACKING_GIFT_KIND);
    packingStatus = 'Needs wrapping' + (giftKind ? ' — ' + giftKind : '');
  } else {
    packingStatus = needsPacking || CHOICES.NEEDS_PACKING.NOT_NEEDED;
  }

  return {
    childName: firstValue_(namedValues, FIELDS.CHILD_NAME),
    childAge: firstValue_(namedValues, FIELDS.CHILD_AGE),
    clientType: firstValue_(namedValues, FIELDS.CLIENT_TYPE),
    deliveryWindow: firstValue_(namedValues, FIELDS.DELIVERY_WINDOW),
    parentNameAndPhone: firstValue_(namedValues, FIELDS.PARENT_NAME_PHONE),
    deliveryLocationType: deliveryLocationType,
    address: address,
    giftRequestDetails: firstValue_(namedValues, FIELDS.GIFT_REQUEST_DETAILS),
    packingStatus: packingStatus,
    additionalNotes: firstValue_(namedValues, FIELDS.ADDITIONAL_NOTES) || '(none)'
  };
}

/**
 * Builds the Phase 1 coordinator SMS (full detail, sent to the director).
 * `fields` is the normalized object from normalizeFormResponse().
 * `emojiStyle` defaults to true, matching the PRD's template; pass false
 * for the plain-text/all-caps fallback if the org's SMS style requires it.
 */
function buildCoordinatorMessage(fields, emojiStyle) {
  var useEmoji = emojiStyle !== false;
  var giftLabel = useEmoji ? '🎁 NEW GIFT REQUEST' : 'NEW GIFT REQUEST';
  var whenLabel = useEmoji ? '📅 WHEN' : 'WHEN';
  var deliverToLabel = useEmoji ? '📍 DELIVER TO' : 'DELIVER TO';

  return [
    giftLabel,
    '',
    'Child: ' + fields.childName + ', age ' + fields.childAge + ' — ' + fields.clientType,
    '',
    whenLabel + ': ' + fields.deliveryWindow,
    deliverToLabel + ': ' + fields.deliveryLocationType + ' — ' + fields.address,
    '',
    'PARENT: ' + fields.parentNameAndPhone,
    '',
    'GIFT: ' + fields.giftRequestDetails,
    'PACKING: ' + fields.packingStatus,
    '',
    'NOTES: ' + fields.additionalNotes
  ].join('\n');
}

if (typeof module !== 'undefined') {
  module.exports = {
    firstValue_: firstValue_,
    normalizeFormResponse: normalizeFormResponse,
    buildCoordinatorMessage: buildCoordinatorMessage
  };
}
