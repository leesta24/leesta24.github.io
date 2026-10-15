# Topic selection crash investigation

The user reported that clicking the topic select-all checkbox crashed the embedded browser. The desktop log records `browser sidebar render process gone`, `reason=crashed`, `exitCode=5`, at 2026-10-15T09:09:48.117Z, on the knowledge page. Crashpad metadata identifies renderer version 154.0.8037.57. No native stack trace was available.

The original click did not reproduce the crash in standalone Chrome 147 or installed Chrome 155, including repeated select-all toggles. Therefore the exact native crash cause remains unconfirmed; passing standalone tests does not establish that the embedded renderer is fixed.

Compatibility mitigation: replace the native details/summary menu with an explicit disclosure button and hidden panel, replace the native select-all checkbox with idempotent Select all and Clear buttons, keep button focus when either action becomes unavailable, and defer state rendering until the current input/focus event has finished. Avoid writing unchanged hidden states. Preserve filtering and URL behavior.

Regression: an opt-in real-browser test uses native pointer actions for twenty clear/select-all cycles, repeated select-all clicks, focus preservation, individual topic changes, same-frame consecutive actions, Escape and outside-click closing. Run with `npm run test:browser`; choose the executable with `KNOWLEDGE_BROWSER_EXECUTABLE`. No document text is changed.
