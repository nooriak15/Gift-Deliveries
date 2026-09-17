/**
 * Phase 1 entry point: installed as an onFormSubmit trigger (see
 * FormSetup.SETUP_createGiftDeliveryForm, which installs it automatically).
 *
 * Flow: Google Form -> Google Sheet (new row) -> this trigger fires ->
 * build the coordinator message -> send it to the director, via email or
 * Twilio SMS depending on the NOTIFICATION_CHANNEL script property (see
 * Config.gs). Email is the default so the workflow can be piloted with
 * staff before committing to Twilio/SMS.
 */
function onFormSubmit(e) {
  try {
    var namedValues = e && e.namedValues;
    if (!namedValues) {
      throw new Error('onFormSubmit fired without e.namedValues — check the trigger is an installable "On form submit" trigger.');
    }

    var fields = normalizeFormResponse(namedValues);
    var message = buildCoordinatorMessage(fields, isEmojiStyleEnabled());

    if (getNotificationChannel() === 'SMS') {
      sendSms(getCoordinatorPhoneNumber(), message);
    } else {
      sendCoordinatorEmail(getCoordinatorEmail(), 'New Gift Delivery Request', message);
    }
  } catch (err) {
    Logger.log('onFormSubmit failed: ' + err);
    throw err;
  }
}
