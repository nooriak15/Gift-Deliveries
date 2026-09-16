# Gift Delivery Coordination — Google Form + Twilio SMS

Phase 1 implementation of the PRD: a Google Form that case managers fill
out for a gift delivery request, which writes to a linked Google Sheet and
triggers a Google Apps Script that texts the delivery coordinator (the
director) a single, complete SMS via Twilio — no manual relay needed.

Phase 2 (a brief broadcast to the volunteer group chat, and a full-detail
text to whichever volunteer claims the delivery) is **not** built here; the
code is structured so it can be added later without reworking Phase 1 (see
[Phase 2 notes](#phase-2-not-built-yet) below).

## How it works

```
Google Form → Google Sheet (new row) → onFormSubmit trigger →
  build the coordinator message → Twilio API → director's phone
```

- **`src/FormSetup.gs`** — run once. Builds the Google Form (all fields and
  branching from the PRD's field spec), creates its linked response
  Spreadsheet, and installs the `onFormSubmit` installable trigger.
- **`src/Constants.gs`** — the exact form question titles, choice values,
  and script-property keys, shared by the form builder and the message
  builder so they can't drift apart.
- **`src/MessageBuilder.gs`** — pure functions: turn the trigger's raw
  `e.namedValues` into a flat object (resolving the Home/Hospital/Other and
  packing Yes/No branches to whichever columns the sheet populated), then
  render the coordinator SMS text. No Google services touched, so it's
  unit tested directly (`test/messageBuilder.test.js`).
- **`src/Twilio.gs`** — sends the SMS via `UrlFetchApp` against the Twilio
  Messages API (no external library needed).
- **`src/Config.gs`** — reads Twilio credentials and the coordinator's
  phone number from Script Properties, never from source.
- **`src/Main.gs`** — the `onFormSubmit(e)` handler that wires the above
  together.

## One-time setup

1. **Create the Apps Script project.**
   - Easiest: install [`clasp`](https://github.com/google/clasp)
     (`npm install -g @google/clasp`), run `clasp login`, then
     `clasp create --type standalone --title "Gift Delivery Coordination" --rootDir src`
     from the repo root. Copy the generated `.clasp.json`'s `scriptId` into
     your own `.clasp.json` (see `.clasp.json.example`), then
     `clasp push`.
   - Or manually: create a new project at
     [script.google.com](https://script.google.com), and paste the
     contents of each file under `src/` into a matching file in the editor
     (`appsscript.json` is edited via the editor's project manifest view).
2. **Run the form builder once.** In the Apps Script editor, select the
   `SETUP_createGiftDeliveryForm` function and click **Run**. Grant the
   requested permissions (Forms, Sheets, external requests). Check the
   execution log for the form's edit URL, its live URL, and the responses
   spreadsheet URL.
   - This is idempotent: re-running it after it's already created a form
     is a no-op (it checks the `FORM_ID` script property), so the trigger
     never gets installed twice.
3. **Set script properties.** In the editor: **Project Settings > Script
   properties**, add:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` — your Twilio number, e.g. `+15551234567`
   - `COORDINATOR_PHONE_NUMBER` — the director's number, e.g. `+15559876543`
   - `EMOJI_STYLE` (optional) — set to `false` for a plain-text/all-caps
     style instead of the emoji-anchored template; defaults to emoji.
4. **Test end-to-end.** Open the live form URL, submit a test response,
   and confirm the coordinator SMS arrives with the details filled in
   correctly for each branch (Home/Hospital/Other, packing Yes/No).

## Running the unit tests

```
npm test
```

Runs `test/messageBuilder.test.js` against `src/Constants.gs` and
`src/MessageBuilder.gs` using Node's built-in test runner — no
dependencies to install. It covers each delivery-location branch, both
packing branches, the optional-notes default, and both message styles
(emoji / plain text).

## Implementation decisions on PRD open items

- **Director's phone number, Twilio credentials** — kept out of source
  entirely as Script Properties (see setup step 3), so no code change is
  needed to point at a different number or account, and nothing sensitive
  is committed to this repo.
- **Emoji vs. plain text** — the PRD flagged this as unresolved. Rather
  than block on it, `EMOJI_STYLE` is a script property (default: emoji, per
  the PRD's own template) so it can be flipped without a code change once
  the organization decides.
- **Delivery day/time** — the field spec has this as a single free-text
  form question ("Approximate time and day delivery is being requested
  for?"), but the coordinator template shows separate `{deliveryDay}` and
  `{deliveryTime}` placeholders. Since there's only one field to draw from,
  the coordinator SMS's `WHEN:` line uses that field's text as entered,
  consistent with how the PRD says the volunteer broadcast text (Phase 2)
  should use it.
- **Parent name and phone** — likewise specified as one combined form
  field rather than two, so the coordinator SMS's `PARENT:` line uses that
  field's text as entered rather than the template's separate
  name/parentheses-phone format.

## Phase 2 (not built yet)

The PRD's volunteer-facing texts (group-chat broadcast, and the
full-detail text sent once a volunteer claims the delivery) are a later
phase and intentionally not implemented here. When that phase is built:
`Twilio.gs` and `Config.gs` need no changes; `MessageBuilder.gs` would gain
`buildVolunteerBroadcastMessage()` / `buildVolunteerClaimMessage()`
alongside the existing `buildCoordinatorMessage()`, and `Main.gs` would call
them from the same `onFormSubmit` handler once the manual-claim/forward
workflow (director relays messages by hand, per the PRD) is ready to wire
up.
