/**
 * Script Property accessors. Keeps secrets (Twilio credentials, the
 * coordinator's phone number) out of source: set them once under
 * Project Settings > Script properties, never hardcode them here.
 */

function getRequiredProperty_(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value) {
    throw new Error(
      'Missing required script property "' + key + '". Set it under ' +
      'Project Settings > Script properties before running this script.'
    );
  }
  return value;
}

function getTwilioAccountSid() {
  return getRequiredProperty_(CONFIG_KEYS.TWILIO_ACCOUNT_SID);
}

function getTwilioAuthToken() {
  return getRequiredProperty_(CONFIG_KEYS.TWILIO_AUTH_TOKEN);
}

function getTwilioFromNumber() {
  return getRequiredProperty_(CONFIG_KEYS.TWILIO_FROM_NUMBER);
}

function getCoordinatorPhoneNumber() {
  return getRequiredProperty_(CONFIG_KEYS.COORDINATOR_PHONE_NUMBER);
}

function getCoordinatorEmail() {
  return getRequiredProperty_(CONFIG_KEYS.COORDINATOR_EMAIL);
}

// Defaults to "EMAIL" — no external account setup, good for piloting with
// staff before committing to Twilio/SMS. Set NOTIFICATION_CHANNEL to "SMS"
// as a script property to switch, once Twilio is configured and ready.
function getNotificationChannel() {
  var value = PropertiesService.getScriptProperties().getProperty(CONFIG_KEYS.NOTIFICATION_CHANNEL);
  return value === 'SMS' ? 'SMS' : 'EMAIL';
}

// Defaults to the PRD's emoji template. Set the EMOJI_STYLE script
// property to "false" to switch to a plain-text/all-caps style.
function isEmojiStyleEnabled() {
  var value = PropertiesService.getScriptProperties().getProperty(CONFIG_KEYS.EMOJI_STYLE);
  return value === null ? true : value !== 'false';
}
