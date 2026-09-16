/**
 * Phase 1 entry point: installed as an onFormSubmit trigger (see
 * FormSetup.SETUP_createGiftDeliveryForm, which installs it automatically).
 *
 * Flow: Google Form -> Google Sheet (new row) -> this trigger fires ->
 * build the coordinator message -> send it via Twilio to the director.
 */
function onFormSubmit(e) {
  try {
    var namedValues = e && e.namedValues;
    if (!namedValues) {
      throw new Error('onFormSubmit fired without e.namedValues — check the trigger is an installable "On form submit" trigger.');
    }

    var fields = normalizeFormResponse(namedValues);
    var message = buildCoordinatorMessage(fields, isEmojiStyleEnabled());
    sendSms(getCoordinatorPhoneNumber(), message);
  } catch (err) {
    Logger.log('onFormSubmit failed: ' + err);
    throw err;
  }
}
