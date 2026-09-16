/**
 * Thin wrapper around the Twilio Messages API using Apps Script's built-in
 * UrlFetchApp — no external library/dependency needed.
 */
function sendSms(toNumber, body) {
  var accountSid = getTwilioAccountSid();
  var authToken = getTwilioAuthToken();
  var fromNumber = getTwilioFromNumber();

  var url = 'https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json';
  var payload = {
    To: toNumber,
    From: fromNumber,
    Body: body
  };

  var response = UrlFetchApp.fetch(url, {
    method: 'post',
    payload: payload,
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(accountSid + ':' + authToken)
    },
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(
      'Twilio send to ' + toNumber + ' failed with status ' + status + ': ' + response.getContentText()
    );
  }

  Logger.log('SMS sent to ' + toNumber + ' (Twilio status ' + status + ')');
  return response;
}
