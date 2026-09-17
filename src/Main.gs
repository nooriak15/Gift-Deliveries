/**
 * Phase 1 entry point: installed as an onFormSubmit trigger (see
 * FormSetup.SETUP_createGiftDeliveryForm, which installs it automatically).
 *
 * Flow: Google Form -> Google Sheet (new row) -> this trigger fires ->
 * build the coordinator message -> email the director.
 *
 * TWILIO/SMS DISABLED FOR NOW — see Twilio.gs and Config.gs. Once Twilio
 * is set up and ready, uncomment those files and swap the sendCoordinatorEmail
 * call below for:
 *   if (getNotificationChannel() === 'SMS') {
 *     sendSms(getCoordinatorPhoneNumber(), message);
 *   } else {
 *     sendCoordinatorEmail(getCoordinatorEmail(), 'Gift Delivery Request for ' + fields.childName, message);
 *   }
 */
function onFormSubmit(e) {
  try {
    var namedValues = e && e.namedValues;
    if (!namedValues) {
      throw new Error('onFormSubmit fired without e.namedValues — check the trigger is an installable "On form submit" trigger.');
    }

    var fields = normalizeFormResponse(namedValues);
    var message = buildCoordinatorMessage(fields, isEmojiStyleEnabled());
    sendCoordinatorEmail(getCoordinatorEmail(), 'Gift Delivery Request for ' + fields.childName, message);
  } catch (err) {
    Logger.log('onFormSubmit failed: ' + err);
    throw err;
  }
}
