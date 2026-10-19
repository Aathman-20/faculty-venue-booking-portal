# Faculty Venue Booking Portal — Node.js Debug Backend

Development-only Express server for demonstrating Node.js debugging in Chrome DevTools.

**The AngularJS frontend is completely unaffected by this backend.**
All existing LocalStorage functionality, page routing, and UI remain unchanged.

---

## Directory Structure

```
server/
├── package.json
├── server.js                       ← Entry point, middleware, error handling
├── routes/
│   ├── bookingRoutes.js            ← Production-style API routes
│   ├── asyncDebugRoute.js          ← async/await breakpoint demonstration ← KEY FILE
│   └── debugStatusRoute.js         ← HTTP status code bug/fix demonstration
└── services/
    └── bookingService.js           ← Data + async service functions ← KEY FILE
```

---

## Step 1 — Install dependencies

Open a terminal, navigate to the `server/` folder, and run:

```bash
cd "Combined App/server"
npm install
```

Expected output: `added 68 packages, and audited 69 packages`

---

## Step 2 — Start the server in debug mode

```bash
npm run debug
```

This runs `node --inspect server.js`.

Expected terminal output:

```
Debugger listening on ws://127.0.0.1:9229/...
For help, see: https://nodejs.org/en/docs/inspector

==============================================
  Faculty Venue Booking — Debug API Server
==============================================
  Status  : RUNNING
  Port    : 3000
  Base URL: https://faculty-venue-booking-portal.onrender.com/
  ...
==============================================
```

> **Tip:** Use `npm start` for a normal run without the inspector.

---

## Step 3 — Open Chrome DevTools

1. Open **Google Chrome**.
2. In the address bar, type exactly:

   ```
   chrome://inspect
   ```

3. Press **Enter**.

---

## Step 4 — Open the Node.js Inspector interface

1. Under **Devices**, look for the **Remote Target** section.
2. You should see an entry similar to:

   ```
   server.js
   file:///...Combined App/server/server.js
   ```

3. Click **inspect** below the target entry.

4. A new **Chrome DevTools** window opens — this is the Node.js debugger.

> **If no target appears:** Make sure `npm run debug` is running in the terminal and refresh `chrome://inspect`.

---

## Step 5 — Set breakpoints in the source files

In the DevTools window that opened:

### Open the source files

1. Click the **Sources** tab at the top of DevTools.
2. In the left-hand file tree, expand the `server/` folder.
3. Open these two files:

   | File | Why |
   |---|---|
   | `routes/asyncDebugRoute.js` | Contains the route handler with all 4 BREAKPOINT comments |
   | `services/bookingService.js` | Contains `processBooking()` and `findBookingById()` |

### Set breakpoints in `asyncDebugRoute.js`

Click the **line number gutter** (left side of the code panel) to set a breakpoint.
A **blue marker** appears when a breakpoint is active.

Set breakpoints at these lines (search for the comments):

```
// BREAKPOINT 1: Route received
```
→ Click the line with `const bookingId = req.params.id;`

```
// BREAKPOINT 2: Before await
```
→ Click the line with `const result = await bookingService.processBooking(bookingId);`

```
// BREAKPOINT 3: After await
```
→ Click the line with `console.log('[DEBUG] BREAKPOINT 3 ...')`

```
// BREAKPOINT 4: Before response
```
→ Click the line with `return res.status(200).json({`

### Set breakpoints in `bookingService.js`

Also set breakpoints inside `processBooking()`:

```js
console.log('[DEBUG] Start processing:', bookingId);    // ← breakpoint
const result = await findBookingById(bookingId);         // ← breakpoint
console.log('[DEBUG] Booking retrieved:', result.booking); // ← breakpoint
return result;                                           // ← breakpoint
```

---

## Step 6 — Send a request to trigger the breakpoints

Open a **new browser tab** (keep the DevTools tab open) and navigate to:

```
https://faculty-venue-booking-portal.onrender.com//api/debug/async/BK-1001
```

The browser will appear to hang — this means execution has **paused at BREAKPOINT 1**.

Switch back to the **DevTools window** to start stepping.

---

## Step 7 — Step through the asynchronous execution

Use the DevTools debugger controls (top-right of the Sources panel):

| Button | Keyboard | Action |
|--------|----------|--------|
| ▶ Resume | `F8` | Continue to the next breakpoint |
| ↷ Step over | `F10` | Execute the current line; don't enter function calls |
| ↓ Step into | `F11` | Enter the function call on the current line |
| ↑ Step out | `Shift+F11` | Run to the end of the current function |

### Recommended step sequence

1. **BREAKPOINT 1 — Route received**
   - Hover over `req.params` in the editor → see `{ id: 'BK-1001' }`
   - Check the **Scope** panel (right side) → `bookingId = 'BK-1001'`
   - Press `F8` to continue to BREAKPOINT 2.

2. **BREAKPOINT 2 — Before await processBooking()**
   - Execution is about to call `processBooking()` asynchronously.
   - Press `F11` (**Step into**) to follow execution **inside** `processBooking()` in `bookingService.js`.
   - DevTools jumps to `console.log('[DEBUG] Start processing:', bookingId)`.

3. **Inside processBooking() — before await findBookingById()**
   - Hover over `bookingId` → `'BK-1001'`
   - Press `F11` to step into `findBookingById()`.
   - DevTools jumps into the lookup function.
   - Press `F10` to step over the `await new Promise(...)` delay.
   - Watch the **Call Stack** panel update as each `await` suspends and resumes.

4. **BREAKPOINT 3 — After await**
   - Back in the route handler. `result` is now resolved.
   - Hover over `result` → `{ found: true, booking: { id: 'BK-1001', venue: '...', ... } }`
   - Expand `result.booking` in the **Scope** panel to inspect all fields.

5. **BREAKPOINT 4 — Before response**
   - The 200 response is about to be sent.
   - Press `F8` to resume → the browser tab receives the JSON response.

---

## API Reference — All Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/health` | Server liveness check → 200 |
| `GET` | `/api/bookings` | All sample bookings (async) → 200 |
| `GET` | `/api/bookings/:id` | Single booking by ID → 200 / 404 |
| `GET` | `/api/debug` | Timestamp + server info → 200 |
| `GET` | `/api/debug/async/:id` | **Async/await breakpoint demo** → 200 / 404 |
| `GET` | `/api/debug/status?id=BK-1001` | HTTP status code FIX → 200 |
| `GET` | `/api/debug/status?id=INVALID` | HTTP status code FIX → 404 |
| `GET` | `/api/debug/status` | HTTP status code FIX → 400 |
| `GET` | `/api/debug/status?id=INVALID&mode=bug` | HTTP status code BUG → 200 (intentional) |
| `GET` | `/api/bookings/error` | Async rejection demo → 500 |

### Valid booking IDs (sample data)

| ID | Venue | Status |
|----|-------|--------|
| `BK-1001` | KS Auditorium | pending |
| `BK-1002` | IT Seminar Hall | approved |
| `BK-1003` | Alan Turing Auditorium | rejected |

---

## npm Scripts

```bash
npm start        # node server.js         — normal run, no inspector
npm run debug    # node --inspect server.js — enables Chrome DevTools
```

---

## Console Log Guide

Every key action produces a labelled console log:

```
[DEBUG] ...   Normal debugging information
[ERROR] ...   Caught errors forwarded to error middleware
[FATAL] ...   Process-level uncaught exceptions / rejections
```

---

## Notes

- The server runs on **port 3000** by default. Set `PORT=3001 npm start` to use a different port.
- The inspector listens on **port 9229** by default.
- No frontend file, LocalStorage value, or AngularJS module has been modified.
