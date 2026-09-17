/**
 * One-time setup script. Run SETUP_createGiftDeliveryForm() once (from the
 * Apps Script editor: select the function, click Run) to create the Google
 * Form with the branching specified in the PRD, create its linked response
 * Spreadsheet, and install the onFormSubmit trigger that drives Main.gs.
 *
 * Safe to re-run: it no-ops if a form was already created (FORM_ID script
 * property is set), so the trigger never gets installed twice.
 */
function SETUP_createGiftDeliveryForm() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty(CONFIG_KEYS.FORM_ID)) {
    Logger.log(
      'A form already exists (FORM_ID script property is set to ' +
      props.getProperty(CONFIG_KEYS.FORM_ID) + '). Delete that property ' +
      'first if you really want to create a new one.'
    );
    return;
  }

  var form = FormApp.create('Gift Delivery Request')
    .setDescription('Use this form to request a gift delivery be organized for a client.')
    .setCollectEmail(false);

  // --- Page 1: common fields ---
  form.addTextItem().setTitle(FIELDS.CHILD_NAME).setRequired(true);
  form.addTextItem().setTitle(FIELDS.CHILD_AGE).setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle(FIELDS.CLIENT_TYPE)
    .setChoiceValues(CHOICES.CLIENT_TYPE)
    .setRequired(true);

  form.addTextItem()
    .setTitle(FIELDS.DELIVERY_WINDOW)
    .setHelpText('e.g. "Anytime Friday, birthday is 9/20"')
    .setRequired(true);

  form.addTextItem().setTitle(FIELDS.PARENT_NAME_PHONE).setRequired(true);

  // Choices are wired up below, once the branch page breaks exist.
  var deliveryLocationItem = form.addMultipleChoiceItem()
    .setTitle(FIELDS.DELIVERY_LOCATION)
    .setRequired(true);

  // --- Branch: Home ---
  var pbHome = form.addPageBreakItem().setTitle('Home Address');
  form.addTextItem().setTitle(FIELDS.HOME_ADDRESS).setRequired(true);

  // --- Branch: Hospital ---
  var pbHospital = form.addPageBreakItem().setTitle('Hospital Details');
  form.addTextItem().setTitle(FIELDS.HOSPITAL_NAME).setRequired(true);
  form.addTextItem().setTitle(FIELDS.HOSPITAL_ROOM).setRequired(true);
  form.addCheckboxItem()
    .setTitle('Confirm full legal name')
    .setChoiceValues([FIELDS.HOSPITAL_LEGAL_NAME_CONFIRM])
    .setRequired(true);

  // --- Branch: Other ---
  var pbOther = form.addPageBreakItem().setTitle('Delivery Address');
  form.addTextItem().setTitle(FIELDS.OTHER_ADDRESS).setRequired(true);

  // --- Converge: gift details + packing branch ---
  var pbGiftPacking = form.addPageBreakItem().setTitle('Gift Details');
  form.addParagraphTextItem()
    .setTitle(FIELDS.GIFT_REQUEST_DETAILS)
    .setHelpText('What gifts, how many, the occasion (e.g. birthday or not), any physical or developmental limitations affecting play, and any religious standards (e.g. no Disney).')
    .setRequired(true);

  // Choices are wired up below, once the packing-needed page break exists.
  // Only the "Yes" choice branches — both "No" choices already carry their
  // reason in the choice text, so they go straight through to the final page.
  var needsPackingItem = form.addMultipleChoiceItem()
    .setTitle(FIELDS.NEEDS_PACKING)
    .setRequired(true);

  // --- Branch: packing needed ---
  var pbPackingYes = form.addPageBreakItem().setTitle('Packing Details');
  form.addParagraphTextItem()
    .setTitle(FIELDS.PACKING_GIFT_KIND)
    .setHelpText('So whoever packs it knows what they\'re wrapping.')
    .setRequired(true);

  // --- Converge: final page ---
  var pbFinal = form.addPageBreakItem().setTitle('Anything Else?');
  form.addParagraphTextItem().setTitle(FIELDS.ADDITIONAL_NOTES).setRequired(false);

  // Wire up branching now that every page break exists.
  deliveryLocationItem.setChoices([
    deliveryLocationItem.createChoice('Home', pbHome),
    deliveryLocationItem.createChoice('Hospital', pbHospital),
    deliveryLocationItem.createChoice('Other', pbOther)
  ]);
  pbHome.setGoToPage(pbGiftPacking);
  pbHospital.setGoToPage(pbGiftPacking);
  pbOther.setGoToPage(pbGiftPacking);

  needsPackingItem.setChoices([
    needsPackingItem.createChoice(CHOICES.NEEDS_PACKING.ALREADY_PACKED, pbFinal),
    needsPackingItem.createChoice(CHOICES.NEEDS_PACKING.NOT_NEEDED, pbFinal),
    needsPackingItem.createChoice(CHOICES.NEEDS_PACKING.YES, pbPackingYes)
  ]);
  pbPackingYes.setGoToPage(pbFinal);

  pbFinal.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  // --- Linked response sheet + trigger ---
  var ss = SpreadsheetApp.create('Gift Delivery Requests (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  props.setProperty(CONFIG_KEYS.FORM_ID, form.getId());
  props.setProperty(CONFIG_KEYS.SHEET_ID, ss.getId());

  Logger.log('Form created. Edit URL: ' + form.getEditUrl());
  Logger.log('Live form URL: ' + form.getPublishedUrl());
  Logger.log('Responses spreadsheet: ' + ss.getUrl());
  Logger.log(
    'Next: set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ' +
    'and COORDINATOR_PHONE_NUMBER as script properties (Project Settings > Script properties).'
  );
}
