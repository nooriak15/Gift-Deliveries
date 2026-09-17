/**
 * Email fallback channel, using Apps Script's built-in MailApp — no
 * external account or credentials needed. Meant for piloting the workflow
 * with staff before committing to Twilio/SMS; see getNotificationChannel()
 * in Config.gs for the switch between this and Twilio.gs's sendSms().
 */
function sendCoordinatorEmail(toAddress, subject, body) {
  MailApp.sendEmail({
    to: toAddress,
    subject: subject,
    body: body
  });
  Logger.log('Email sent to ' + toAddress);
}
