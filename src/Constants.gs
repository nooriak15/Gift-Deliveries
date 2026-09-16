/**
 * Single source of truth for Google Form question titles, choice values,
 * and Script Property keys. FormSetup.gs (which builds the form) and
 * MessageBuilder.gs (which reads onFormSubmit's e.namedValues, keyed by
 * question title) both read from here so the two never drift apart.
 */

var FIELDS = {
  CHILD_NAME: 'Child name',
  CHILD_AGE: 'Child age',
  CLIENT_TYPE: 'Client, Sibling, or Parent',
  DELIVERY_WINDOW: 'Approximate time and day delivery is being requested for?',
  PARENT_NAME_PHONE: 'Parent name and phone number',
  DELIVERY_LOCATION: 'Delivery location',
  HOME_ADDRESS: 'Home address',
  HOSPITAL_NAME: 'Hospital name',
  HOSPITAL_ROOM: 'Room/unit number',
  HOSPITAL_LEGAL_NAME_CONFIRM: "I confirm the child's name entered above is their full legal name, as required for hospital visitor check-in.",
  OTHER_ADDRESS: 'Address',
  GIFT_REQUEST_DETAILS: 'Gift/delivery requests',
  NEEDS_PACKING: 'Do any of the gifts need to be packed?',
  PACKING_GIFT_KIND: 'What kind of gift?',
  PACKING_NOT_NEEDED_REASON: 'Reason',
  ADDITIONAL_NOTES: 'Anything else we should know/keep in mind when organizing delivery?'
};

var CHOICES = {
  CLIENT_TYPE: ['Client', 'Sibling', 'Parent'],
  DELIVERY_LOCATION: ['Home', 'Hospital', 'Other'],
  YES_NO: ['Yes', 'No'],
  PACKING_NOT_NEEDED_REASON: ['Already packed', "Doesn't need packing"]
};

// Script Properties (Project Settings > Script properties) read by Config.gs.
var CONFIG_KEYS = {
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  TWILIO_FROM_NUMBER: 'TWILIO_FROM_NUMBER',
  COORDINATOR_PHONE_NUMBER: 'COORDINATOR_PHONE_NUMBER',
  // Open item from the PRD ("emoji vs. plain text"): defaults to the emoji
  // style from the PRD's template. Set to "false" as a script property to
  // switch to a plain-text/all-caps style with no code change.
  EMOJI_STYLE: 'EMOJI_STYLE',
  // Populated by FormSetup.SETUP_createGiftDeliveryForm() and read by it on
  // re-runs so the setup function stays idempotent.
  FORM_ID: 'FORM_ID',
  SHEET_ID: 'SHEET_ID'
};

if (typeof module !== 'undefined') {
  module.exports = { FIELDS: FIELDS, CHOICES: CHOICES, CONFIG_KEYS: CONFIG_KEYS };
}
