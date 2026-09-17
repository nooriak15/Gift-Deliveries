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
  NEEDS_PACKING: 'Does this gift need to be packed?',
  PACKING_GIFT_KIND: 'What kind of gift?',
  ADDITIONAL_NOTES: 'Anything else we should know/keep in mind when organizing delivery?'
};

var CHOICES = {
  CLIENT_TYPE: ['Client', 'Sibling'],
  DELIVERY_LOCATION: ['Home', 'Hospital', 'Other'],
  // A single question with the "no" reason folded directly into the choice
  // text, rather than a separate Yes/No question plus a follow-up "Reason"
  // question. Only NEEDS_PACKING.YES branches to the "What kind of gift?"
  // follow-up page — see FormSetup.gs.
  NEEDS_PACKING: {
    ALREADY_PACKED: "No, it's already packed in office",
    NOT_NEEDED: 'No, packing not needed',
    YES: 'Yes, it needs to be packed'
  }
};

// Script Properties (Project Settings > Script properties) read by Config.gs.
var CONFIG_KEYS = {
  // "EMAIL" (no external account needed, good for piloting with staff) or
  // "SMS" (requires the Twilio properties below). Defaults to EMAIL.
  NOTIFICATION_CHANNEL: 'NOTIFICATION_CHANNEL',
  COORDINATOR_EMAIL: 'COORDINATOR_EMAIL',
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
