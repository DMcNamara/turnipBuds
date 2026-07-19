# Manual Smoke Test

Run this **full** checklist at every modernization phase boundary and after **any**
package replacement. It is the manual verification gate that backs up the automated
test suite — automated tests cover pure logic, this list exercises the end-to-end app.

## Setup

1. `yarn dev` — starts the functions TS watcher, the Firebase emulators
   (Firestore/Functions/RTDB, seeded from `fsData`), and the Expo dev server.
2. Open the app in the iOS/Android simulator or a device (`i` / `a` in the Expo CLI).
   Because `__DEV__` is true, the client talks to the local emulators automatically.

## Checklist

- [ ] **1. Log in.** Sign in and reach the main tabs. Note which auth methods work
      against the local emulators (email/password via the Auth emulator; Google
      Sign-In generally does **not** work locally without extra config — record what
      you observe).
- [ ] **2. Enter prices.** For the current week, enter a buy (Sunday) price and
      several AM/PM sell prices.
- [ ] **3. Predictions & chart render.** On Home, the predictions and price chart
      render. The summary table shows sensible min/max ranges for the entered prices.
- [ ] **4. Share link.** The turnipprophet.io share link is correct — open it and
      confirm the prices/pattern match what was entered.
- [ ] **5. Add a friend by email.** Add both an **existing** user and a
      **non-existing** user by email. A toast confirms each add (the non-existing
      case is stored pending and backfilled when that user later signs up).
- [ ] **6. Friend list renders and sorts.** The friend list renders; toggle sorting
      **by name** and **by pattern** and confirm the order changes.
- [ ] **7. Open a friend's week.** Tap into a friend to view their week / prices.
- [ ] **8. Island timezone.** Set the island timezone in Settings; reload the app and
      confirm the setting persists (redux-persist / AsyncStorage).
- [ ] **9. Toast lifecycle.** Trigger a toast and confirm it both dismisses via the
      **OK** button and auto-dismisses on timeout.
