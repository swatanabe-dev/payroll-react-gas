# Payroll App (Demo)

A payroll processing web application for a small business. Handles daily work hours entry, payroll calculation, and PDF payslip generation.

---

## Demo

- [App overview](https://drive.google.com/file/d/1KZZIPlQP6IAp817E0gA-rP0nmaL1tdoY/view?usp=sharing) (2:30)
- [Generating PDF in batches](https://drive.google.com/file/d/1-kTAGNA82oHG1_XSF8gfEW4h_rcHP6gM/view?usp=sharing) (1:26)
- [Generating PDF](https://drive.google.com/file/d/1Mmg0H2FeHKS1qhoLz2LX3SbIMMGFD2qk/view?usp=sharing) (1:50)

---

## Tech Stack

- **Frontend:**
  - React 18
  - React Router v7
  - TanStack Query v5
- **Forms & PDF:**
  - React Hook Form
  - React PDF
  - fflate
  - React Hot Toast
- **Integration & Utilities:**
  - `gas-client` – Wrapper for Google Apps Script server functions
  - `vite-plugin-node-polyfills` – Node.js module polyfills for Vite

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│    (Vite, TanStack Query, React Hook Form, HashRouter)  │
└───────────────────────────┬─────────────────────────────┘
                            │  gas-client / google.script.run
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Google Apps Script Backend                 │
│         (Serverless Controller Layer / CLASP)           │
└───────────────────────────┬─────────────────────────────┘
                            │  SpreadsheetApp API
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Google Sheets Database                  │
│             (Normalized Relational Sheets)              │
└─────────────────────────────────────────────────────────┘
```

### Core Components

- **Frontend:**

  Built with React, TanStack Query, and React Hook Form. Uses `HashRouter` to manage client-side routing within the sandboxed `iframe` environment built in Google Apps Script Web App deployments.
  <br/>

- **Backend:**

  Serverless Google Apps Script endpoints act as an API controller layer, managed and deployed locally using Google's `clasp` CLI.
  <br/>

- **Data store:**

  Google Sheets serves as a relational datastore per instance, queried directly using the native `SpreadsheetApp` API. Ensure to read [GAS-Specific Gotchas](#gas-specific-gotchas-read-before-touching-backend-code) for important notes on the native functions/methods.
  <br/>

- **Performance & Caching:**

  Google Apps Script’s `CacheService` was considered to mitigate API execution limits and optimize latency for heavy payload reads (such as paginated worklog queries). See [Considered Alternatives](#considered-alternatives) for details.

## Why this stack

### The Issue:

The client used an existing Google Sheets template to manage its human resource operations, which frequently forced them to fix accidental overrides (e.g., cell values and formulas) made by staff. To eliminate these frequent and time-consuming template repair tasks, they were considering a web app built from this template that would require no additional overhead costs.

### Pros/Advantages

Deployed within the GAS environment, the app requires no server to host or maintain, achieving zero infrastructure cost. The most noteworthy benefit of using spreadsheets as a backend is that they are familiar tools the client already trusts. In the rare event that they need to handle data differently, they can simply make a copy and do whatever they need. While this flexibility would be heavily frowned upon in conventional software development, supercharging a spreadsheet allows them to do even more with total comfort.

> 🔒 **Security & Data Privacy Notice:**
>
> Because this application processes sensitive employee salary data, the web app execution `access` configuration in `.appsscript.json` is set to `"MYSELF"`. Ensure that access to the underlying Google Sheet and any Drive folders storing generated payslips is strictly restricted to authorized administrative personnel.
>
> Read [appsscript.json](#appsscriptjson) section for more details.

### Cons/Trade-off

While the CRUD operations are considered fast enough given the client's app usage, the request processing speed (one roundtrip) tends to be slower than conventional web apps. So **batching** matters more here than in a typical backend.<br/>

Also, GAS has quota and execution limits (e.g., 6 min/execution). Details on quota limits are found in the [official documentation](https://developers.google.com/apps-script/guides/services/quotas).

---

## Local Development

This guide walks you through setting up the project locally, linking it to Google Apps Script using `clasp`, running development builds, and deploying updates.

### Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (comes bundled with Node.js)
- **Google Account**: Required to manage and deploy Google Apps Script projects
- **clasp**: `v2.5.0` or higher

```bash
# Install `clasp` globally
npm install -g @google/clasp

# Check version
clasp --version

```

#### 1. Repository Setup

1-1. **Clone the repository**

```bash
# Get a copy of the repo
git clone <repository-url>

cd <repo>

npm install

```

#### 2. Google Apps Script Authentication with `clasp`

This project uses `@google/clasp` (Command Line Apps Script Projects) to manage serverless Google Apps Script code locally.

2-1. **Enable the Google Apps Script API**

- Go to your [Google Apps Script User Settings](https://script.google.com/home/usersettings).
- Ensure Google Apps Script API is switched to `ON`.

2-2. **Log in to `clasp`**

```bash
# Log out
# This step is option in case you've been working on a GAS app via clasp.
clasp logout

# Log in
# This command will automatically open a browser requesting permission to access your Google account. Log in with the Google accounting hosting your script.
clasp login

```

#### 3. Initialize a new Apps Script project

3-1. **Create a sheet file that hosts the app (Apps Script)**

The following command creates a new Google Sheets instance and should automatically create `.clasp.json` in the project folder.

```bash
# Create a new Google Sheets file
clasp create --title "my-sheet-title" --type sheets

```

3-2. **Set up `.clasp.json` file**

In VS Code, open .clasp.json and ensure that it's been set up as shown below.

```json
{
  "scriptId": "SCRIPT_ID",
  "rootDir": "./gas",
  "parentId": ["SHEET_ID"]
}
```

**Where to find these IDs?**

In your browser, log into your private Google account and create a brand new Google Sheet.

- Look at the URL and copy the `Sheet ID` (the long string of characters between /d/ and /edit).

- Click Extensions > Apps Script to create a bound script.

- In the Apps Script editor, click the Project Settings (gear icon) on the left sidebar and copy the Script ID.
  Deploy commands:

#### 4. Push the backend code

```bash
# Push code
clasp push

# OR with -f flag, it ensures the local files overwrite the default code.gs that Google
# automatically creates in new projects.
clasp push -f

```

#### 5. Staging & Deployment

**Testing deployments locally**

Before deploying to production, verify your build.

```bash
# Build
npm run build

# Push local code to the backend
clasp push

# OR run together
npm run build && clasp push

# As you see in the `package.json,` to open the 'test deployment' in Chrome
npm run test-ui

```

#### 6. Deploy to "Production"

- **6-1. List existing deployments**

  Review current deployment IDs and versions.

```bash
# List existing deployments
clasp deployments

```

- **Hint**

  `clasp deployments` shows two types: @HEAD and @_Version Number_ (e.g. @1, @14). The ID with `@HEAD` reflects the latest push for the test deployment (URL ending with /dev). The numbered version is for production (URL ending with /exec).
  <br/>

- **6-2 Deploy to an ID**

  Deploy your updated build to your live production deployment ID.

```bash
# Deploy a new version for an existing production
clasp deploy -i <"deployment ID"> -d "Description of change"


```

- **6-3 (if applicable)**

```bash

# If you need a separate Web App URL
clasp deploy -d "Another build"

```

---

## `.appsscript.json`

Below is an example of `.appsscript.json`. Check `oauthScopes` and configure as shown. This is needed to enable the archiving feature (when creating a file copy).

```json
// Note that the "timeZone" has been changed from the original.

{
  "timeZone": "America/Edmonton",
  "dependencies": {},
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets"
  ]
}
```

**`access` and `executeAs` options**

Ensure to check the [official document](https://developers.google.com/apps-script/manifest/web-app-api-executable)

- **`access`**

  Web app execution permission levels. Valid settings include:
  - **MYSELF**: Only the deploying user can run the app.
  - **DOMAIN**: Only users in the same domain as the deployer can run it.
  - **ANYONE**: Any logged-in user.
  - **ANYONE_ANONYMOUS**: Any user, even if not logged in.
    <br/>

- **`executeAs`**

  The identity under which the web app executes. Valid settings include:
  - **USER_ACCESSING**: The web app runs as the user accessing it.
  - **USER_DEPLOYING**: The web app runs as the user who deployed it.

### Security & Data Privacy Note

Since this payroll application handles sensitive employee compensation data, strict access control and privacy practices must be enforced:

- **Web App Execution (`access`):**

  Set to `"MYSELF"` in `.appsscript.json` to ensure only the account owner/deployer can execute the application endpoint.
  <br/>

- **Spreadsheet & Drive Access:**

  Restrict Google Sheet permissions and generated PDF output folders exclusively to authorized HR/payroll personnel. **Avoid setting link sharing to "Anyone with the link"**.
  <br/>

- **OAuth Scopes:**

  Keep scopes **minimal** (`https://www.googleapis.com/auth/drive` and `https://www.googleapis.com/auth/spreadsheets`). If scope requirements change, update `.appsscript.json` and re-deploy.

---

## GAS-Specific Gotchas (read before touching backend code)

These are runtime/platform quirks specific to Apps Script + Sheets that aren't obvious coming from a normal Node/Express backend.
<br/>

**1. Batch reads and writes — NEVER read/write inside a loop**

Think of `SpreadsheetApp` methods (e.g. .getValue(), getLastRow(), and etc...) as **network requests**.

Even though Apps Script lets you write code that looks like standard line-by-line synchronous JavaScript, it hides a massive bottleneck.

Every single `.getValue()` or `.setValue()`, for instance, is a hidden API request (RPC) traveling across a network to Google’s database. Calling these inside a for loop forces your script to stop, send a network request, wait for a response, and unfreeze for every single iteration. To avoid hitting execution timeouts, always use `.getValues()` and `.setValues()` to batch your reads and writes into a single network trip before and after your loops.

```javascript
// ❌ Avoid — one round trip per row
for (let i = 0; i < rows.length; i++) {
  sheet.getRange(i + 1, 1).setValue(rows[i].value);
}

// ✅ Preferred — read/write the whole range once
const range = sheet.getRange(1, 1, rows.length, 1);
const values = rows.map((r) => [r.value]);
range.setValues(values);
```

Same applies to reads: pull the full range with `.getDataRange().getValues()` (or a scoped range if you don't need the whole sheet) once, then work with the in-memory array. Don't call `.getRange(...).getValue()` per cell.

Although I haven't tested how fast `.getDataRange().getValues()` is, the most online resources recommends to use this combination.
<br/>

**2. Date format mismatch (Date Shift): React Hook Form ↔ GAS**

GAS returns `Date` objects (or Sheets' internal date serials) from `getValues()`. React Hook Form's date inputs expect ISO strings (`yyyy-MM-dd`) or `Date` objects depending on how the field is registered. Serializing a GAS `Date` straight into JSON and expecting the frontend to parse it correctly is a common source of off-by-one-day bugs (usually timezone-related — GAS dates are in the script's timezone, not necessarily the client's).

Convention used in this project: for the GAS side code, I created a helper function `formatDataNative_(value)` in `util.gs`.

```javascript
/**
 * IMPORTANT FUNCTION - this avoids "date shift" problem
 *
 * Formats a native JS Date object into a 'yyyy-MM-dd' string using native methods.
 * If the input is not a valid Date, it safely returns the value as-is.
 *
 * @param {any} value - The cell value to check and format.
 * @return {string|any} The formatted date string or the original value.
 */
function formatDateNative_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  }
  return value;
}
```

NOTE that `Utilities.formatDate(date, scriptTimeZone, "yyyy-MM-dd")`) on the GAS side before returning to the client can be used, but again, **this function can be very slow when used in a loop.**
<br/>

**3. getValues() vs getDisplayValues()**

Check the [official methods](https://developers.google.com/apps-script/reference/spreadsheet/range) as well.

| Method               | Return type  | Brief description                                                |
| :------------------- | :----------- | :--------------------------------------------------------------- |
| `getDisplayValues()` | `String[][]` | Returns the rectangular grid of displayed values for this range. |
| `getValues()`        | `Object[][]` | Returns the rectangular grid of values for this range.           |

<br/>

**4. The trailing underscore\_() rules**

In Google Apps Script, adding a trailing underscore to a function name (e.g., syncRewards\_) tells Google to make that function private.
<br/>

**5. Deal concurrency**

For all GAS side mutation functions, ensure to wrap with the `withScriptLock_()` function in the `util.gs` file. It tries to deal with a racing condition using the GAS native `LockService.getScriptLock()`.

**6. Handling an empty sheet returned by `getValues()`**

`getValues()` returns `[[""]]` when the sheet is empty. In Javascript, `[[""]].length` is **1**.

---

## Other Notes

**1. TanStack Query `staleTime` vs `gcTime`.**

`staleTime` controls when data is considered stale and eligible for a background refetch; `gcTime` controls when unused cached data is garbage-collected. Confusing the two caused unexpected refetches in this project — if a query seems to refetch more (or less) often than expected, check `staleTime` first, not `gcTime`. The app sets these two globally in App.jsx as well as in local query Hook. I set `gcTime` slightly longer than `staleTime`, or can be equal durations.

**2. Separates headers and data rows when reading an entire sheet**

```javascript
const ws = gs.getSheetById(SHEET_IDS.PAYSLIPS);
const data = ws.getDataRange().getValues();

// Option 1: `shift()` -> Said to be the most memory efficient approach
const headers = data.shift(); // In-place mutation

// Option 2: [headers, ..rows]
const [headers, ...rows] = data; // new array in memory
```

**3. `gas-client` local dev setting not working**

Unfortunately, the localhost dev env setups didn't work out after having tested a few different approaches.
So, stick with "npm run build && clasp push"

```javascript
// Below (+ a couple other ways) did not work
export const { serverFunctions } = new GASClient({
  allowedDevelopmentDomains: (origin) =>
    /https:\/\/.*\.googleusercontent\.com$/.test(origin),
});

const { serverFunctions } = new GASClient({
  allowedDevelopmentDomains: "https://localhost:5173",
});
```

---

## Considered Alternatives

This section should serve as a note for future improvements/implementations. These would come in handy if the client's use changes down the road. Below are some alternative approaches that were considered or tested in the current project, but it was decided otherwise.

**1. CacheService ~100KB per-key limit.**

Large datasets (e.g. full worklogs history) will silently fail or truncate if you try to cache them under a single key. Chunk into multiple keys or paginate at the source instead of caching the full dataset.

This was considered in an attempt to make pagination calls faster. After considering the actual usage flow with the current 100 rows per page, I concluded the speed would be fast enough and implementing this approach would simply add unnecessary complexity.

**2. `window.location.reload()` breaks inside the GAS iframe sandbox.**

GAS serves the app inside a sandboxed iframe. A plain `window.location.reload()` reloads the iframe in a broken state (blank page). Use `window.top.location.reload()`, or prefer `queryClient.resetQueries()` from TanStack Query to refresh data without a full page reload.

I considered this approach, since quite a few `queryKey` data needed to be invalidated and refetched after the previous fiscal year data were archived. To ensure that all local data, which need to be fresh, are fresh, I initially tried to programmatically reload a browser, and noticed that the conventional `window.location.reload()` would not work due to a sandbox iframe environment.

Browser's `window.top.location.reload()` and Tanstack Query's `queryClient.resetQueries()` would properly fix this issue. However, given the use of Tanstack Query throughout, I decided to go for `queryClient.resetQueries()` this time.

---

## Known Issues / Backlog

**1. Chrome multi-account session bug → PDF generation freezes.**

- If a user is signed into multiple Google accounts in the same Chrome profile, the GAS iframe sandbox can seem to pick the wrong session, causing PDF generation (`DriveApp`/`Utilities.newBlob` flows) to hang indefinitely with no error thrown.
  <br/>

  **Workaround: One Google account per Chrome profile when using this app.**
  <br/>

**2. Browser hang during bulk PDF generation (15+ pages)**

- **Status: Fixed** (Temporary)

  _This PDF generation issue has been taken care of. The app correctly generates PDF files for any batch size. However, further investigation would be necessary if it resurfaces._
  <br/>

- **Symptom:**

  The PDF generation feature built with `@react-pdf/renderer` was initially working fine, but the issue suddenly surfaced on August 3, 2026. During bulk PDF generation (roughly 15+ pages), the browser tab became unresponsive for a period and then reloaded on its own. After this, the "Save File" prompted and the contents of the generated PDF were accurate. When generating less than 15 pages, the process was noticeably slow but generated without being unresponsive.
  <br/>

- **Context:**

  PDFs are generated client-side and the app runs inside a sandboxed iframe. `@react-pdf/renderer` does not support Japanese fonts out of the box.
  <br/>

- **Observations:**
  - No errors (messages) were generated on both the client and the GAS sides.
  - The issues persisted on a different browser (Firefox).
  - Old deployments that were previously working now showed the same symptom.
  - Reviewing the related code could not reveal possible causes, but made a minor modifications, such as adding a value fallback, which didn't resolve the issue.
  - The DevTools Network tab showed rapidly continuously piling up `204 ping` requests util the "Save File" window prompted.
  - When the `204 ping` requests reached 100K or more, the browser reloaded on its own.
  - The hang and the flooding ping occurred together.
  - This behavior was the same with DevTools open and closed.
  - After batching the PDF generation (10 pages per PDF file) with a 1.5s interval, the issue no longer occurred.
    <br/>

- **Inference:**

  Unfortunately, the exact causes or mechanisms could not be identified. However, the most likely explanation is that a certain request relating to the PDF generation process were sent faster and more than the main thread could process, eventually starving the event loop and causing the hang. The reload was most likely triggered by the browser (or possibly by the hosting env) reacting to the unresponsive/memory-chocking tab. The fact that the app runs inside a Google Apps Script sandboxed iframe would be something for us to keep in mind when developing and debugging.
  <br/>

- **Fix / Workaround:**

  Mitigated by batching at 10 pages per PDF file with a 1.5 second interval. The exact mechanism is not fully confirmed. The fix/workaround was implemented based on observed behavior and inference.
  <br/>

- **If this resurfaces:**

  If freezing returns even with batching (e.g. after the office's staff count grows significantly, or per-payslip content becomes denser), try lowering MAX_PAYSLIPS_PER_FILE in generatePayslipsPDF.jsx before assuming something else broke. One thing worth checking is if there's a more appropriate way to integrate Japanese font in generating PDFs with `@react-pdf/renderer`.

- **Update:**

  Removing Japanese font imports improved the PDF generation speed significantly.

---

## Support

For bugs, contact Sho at shotaro.d.watanabe [at] gmail [dot] com.
