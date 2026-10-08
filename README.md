# E-commerce Test Automation

Automated tests written in **Cypress + TypeScript**, with **Allure** reports published to one **GitHub Pages** dashboard:

- **UI tests** for the [LambdaTest E-commerce Playground](https://ecommerce-playground.lambdatest.io) (an OpenCart demo store), using the **Page Object Model**
- **API tests** for [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) (a public booking API), written as plain `cy.request()` calls

**Test results dashboard:** https://parasoli.github.io/ecommerce--test-automation/

- UI report: https://parasoli.github.io/ecommerce--test-automation/ui/
- API report: https://parasoli.github.io/ecommerce--test-automation/api/

**Test cases sheet:** https://docs.google.com/spreadsheets/d/1H_uBYgXPTL0s3cx396A-W7VRnHUprfkR2sP5Vly19nw/edit?pli=1&gid=1588861163#gid=1588861163

## What's covered

### UI

| Feature        | Spec                                                                 | Test cases                                                                                                                       |
| -------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Login          | [`cypress/e2e/login.cy.ts`](cypress/e2e/login.cy.ts)                 | TC-LOGIN-01 to 07: valid login, wrong password, unregistered email, empty fields, invalid email format, password masking, logout |
| Product search | [`cypress/e2e/productSearch.cy.ts`](cypress/e2e/productSearch.cy.ts) | TC-SEARCH-01 to 05: header search, search page, search within a category, search in descriptions, no results                     |
| Checkout       | [`cypress/e2e/checkout.cy.ts`](cypress/e2e/checkout.cy.ts)           | TC-CHECKOUT-01 to 04: empty cart, guest order, empty guest details, Terms & Conditions not accepted                              |

UI tests run in **Chrome** in CI. Firefox and phone-size runs are available locally with `npm run test:firefox` and `npm run test:mobile`.

### API

| Area    | Spec                                                     | Test cases                                                                                                                                                                |
| ------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth    | [`cypress/api/auth.cy.ts`](cypress/api/auth.cy.ts)       | TC-AUTH-01 to 02: token for valid credentials, wrong password                                                                                                             |
| Booking | [`cypress/api/booking.cy.ts`](cypress/api/booking.cy.ts) | TC-BOOKING-01 to 10: health check, create, get by id, find by name, full update, partial update, update without token, delete, booking not found, missing required fields |

Everything for the API tests lives in these two spec files: no support files, helpers, fixtures or custom commands. Each booking test creates the booking it needs, with a unique last name.

## Tech stack

- [Cypress 16](https://www.cypress.io/) with TypeScript
- Page Object Model for UI (`cypress/pages/`), plain `cy.request()` specs for API, fixtures for test data (`cypress/fixtures/`)
- [Allure](https://allurereport.org/) reports via `allure-cypress`, with feature, severity and test case labels
- ESLint + Prettier for code style
- GitHub Actions (one workflow for UI, one for API) + a GitHub Pages dashboard

## Project structure

```
.
├── cypress/
│   ├── e2e/                  # UI specs (one file per feature)
│   │   ├── checkout.cy.ts
│   │   ├── login.cy.ts
│   │   └── productSearch.cy.ts
│   ├── api/                  # API specs
│   │   ├── auth.cy.ts
│   │   └── booking.cy.ts
│   ├── fixtures/             # Test data
│   │   └── ui/               # guest.json, products.json
│   ├── pages/                # Page objects (selectors + actions + checks + expected messages)
│   │   ├── AccountPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── ConfirmOrderPage.ts
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── LogoutPage.ts
│   │   ├── OrderSuccessPage.ts
│   │   └── SearchPage.ts
│   └── support/
│       ├── commands.ts       # cy.login() with cy.session
│       └── e2e.ts            # UI: Allure setup and labels
├── dashboard/
│   └── index.html            # Results dashboard (GitHub Pages home page)
├── test-cases/               # Manual test cases (one .md per feature) + their source
├── .github/
│   ├── workflows/
│   │   ├── ui-tests.yml      # Lint, UI tests in Chrome, publish to /ui/
│   │   └── api-tests.yml     # Lint, API tests, publish to /api/
│   └── actions/publish-report/  # Shared step that updates the dashboard
├── .claude/agents/           # Claude Code agents (see below)
├── cypress.config.ts         # UI: base URL, env vars, retries, timeouts, Allure
├── cypress.api.config.ts     # API: base URL, retries, Allure
├── eslint.config.mjs         # ESLint rules
├── .prettierrc.json          # Prettier rules
├── .env.example              # Template for local credentials
└── package.json
```

## Getting started

**Requirements:** Node.js 22+ (needed by Cypress 16) and Java 8+ (only needed to build the Allure report).

```bash
# 1. Install dependencies
npm install

# 2. Add your login credentials
cp .env.example .env
# then edit .env and set USER_EMAIL and USER_PASSWORD
```

`USER_EMAIL` and `USER_PASSWORD` must be an account registered on the [playground site](https://ecommerce-playground.lambdatest.io/index.php?route=account/register). `.env` is git-ignored, so never commit real credentials.

The API tests use Restful Booker's public demo login (`admin` / `password123`, from its documentation), written in the specs. They need no setup.

## Running tests

```bash
npm test                                                     # UI specs in Chrome
npm run test:firefox                                         # UI specs in Firefox
npm run test:mobile                                          # UI specs in Chrome at phone size
npm run test:api                                             # API specs
npx cypress run --browser chrome --spec cypress/e2e/login.cy.ts   # one UI spec
npx cypress open                                             # open the Cypress UI (UI tests)
npx cypress open --config-file cypress.api.config.ts         # open the Cypress UI (API tests)
```

Failed tests are retried once in `cypress run` (not in `cypress open`), because both demo sites are public and can be slow.

> **Running from VS Code's terminal?** VS Code sets `ELECTRON_RUN_AS_NODE`, which stops Cypress from starting. Prefix the command with `env -u ELECTRON_RUN_AS_NODE`, for example `env -u ELECTRON_RUN_AS_NODE npm test`.

## Code style

```bash
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier: format every file
npm run format:check  # Prettier: check only
```

CI fails if lint, formatting or the TypeScript type check fails.

## Allure report

```bash
npm test                        # UI: writes results to allure-results/
npm run allure:generate         # builds the UI report in allure-report/
npm run allure:open             # opens it in your browser

npm run test:api                # API: writes results to allure-results-api/
npm run allure:generate:api     # builds the API report in allure-report-api/
npm run allure:open:api         # opens it in your browser
```

Delete the results folder before a run if you only want that run's results in the report.

Each test in the report has:

- **Epic / feature:** `E-commerce UI` → `Login`, `Product Search`, `Checkout`, or `Restful Booker API` → `Auth`, `Booking`
- **Severity:** `critical` for the main happy paths (valid login, header search, guest order), `normal` for the rest
- **Test ID:** the TC ID as a label. UI test IDs also link to the test cases sheet.
- **Parameters (UI):** browser and viewport, so results from different browsers or screen sizes show separately

## CI: GitHub Actions + dashboard

There are two workflows. Both run **only when started manually**, not on push or merge.

| Workflow  | File                                                                 | Publishes to |
| --------- | -------------------------------------------------------------------- | ------------ |
| UI Tests  | [`.github/workflows/ui-tests.yml`](.github/workflows/ui-tests.yml)   | `/ui/`       |
| API Tests | [`.github/workflows/api-tests.yml`](.github/workflows/api-tests.yml) | `/api/`      |

**To run one:** go to **Actions** → **UI Tests** or **API Tests** → **Run workflow**, then pick a branch.

**UI Tests** jobs:

1. **lint**: ESLint, Prettier check and TypeScript type check
2. **test (chrome)**: runs all UI specs in Chrome and uploads the results and any failure screenshots
3. **report**: builds the Allure report and publishes it to `/ui/`

**API Tests** jobs:

1. **lint**: same checks as above
2. **test**: runs all API specs, builds the Allure report and publishes it to `/api/`

**The dashboard** ([`dashboard/index.html`](dashboard/index.html)) is the GitHub Pages home page. It shows one card each for UI and API: pass rate, passed, failed, broken and skipped counts, when the run finished, how long it took, the branch and commit, and links to the full Allure report and the GitHub Actions run.

Each workflow replaces **only its own report** (the previous UI or API report is removed), keeps the other one, and refreshes the dashboard. A run is marked as failed if lint fails or any test fails, but the report is still published so failures are visible.

**One-time setup** (already done for this repo):

1. **Settings → Secrets and variables → Actions**: add `USER_EMAIL` and `USER_PASSWORD`
2. **Settings → Actions → General**: set Workflow permissions to **Read and write**
3. Run a workflow once, then **Settings → Pages**: Source **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`

## Writing tests

Each page gets one class in `cypress/pages/`. It holds the page's selectors, the actions a user can take, the checks for that page and the messages it expects. Specs only call page methods and never use `cy.get` directly. Test data that changes between tests goes in `cypress/fixtures/`.

```ts
// cypress/pages/LoginPage.ts
class LoginPage {
  noMatchError = 'Warning: No match for E-Mail Address and/or Password.'

  get emailInput() {
    return cy.get('#input-email')
  }

  get passwordInput() {
    return cy.get('#input-password')
  }

  get loginButton() {
    return cy.get('input[type="submit"][value="Login"]')
  }

  get errorAlert() {
    return cy.get('#account-login .alert-danger')
  }

  open() {
    cy.visit('/index.php?route=account/login')
  }

  login(email: string, password: string) {
    this.emailInput.clear().type(email)
    this.passwordInput.clear().type(password, { log: false })
    this.loginButton.click()
  }

  verifyNoMatchError() {
    this.errorAlert.should('be.visible').and('contain.text', this.noMatchError)
  }
}

export default new LoginPage()
```

```ts
// cypress/e2e/login.cy.ts
import loginPage from '../pages/LoginPage'

describe('Login', () => {
  it('TC-LOGIN-02: shows an error for a wrong password', () => {
    loginPage.open()

    loginPage.login('user@example.com', 'WrongPassword!123')

    loginPage.verifyNoMatchError()
  })
})
```

**Logging in once:** tests that need a logged-in user call `cy.login()`. It uses `cy.session`, so the login happens once and is reused across tests and specs.

```ts
cy.login()
accountPage.open()
```

**Credentials:** Cypress 16 reads them with `cy.env()`, not `Cypress.env()`:

```ts
cy.env(['USER_EMAIL', 'USER_PASSWORD']).then((env) => {
  loginPage.login(env.USER_EMAIL, env.USER_PASSWORD)
})
```

**API tests** are plain and self-contained: everything is in `cypress/api/auth.cy.ts` and `cypress/api/booking.cy.ts`. Each test calls `cy.request()` directly and checks the status code and body. There are no page objects, custom commands, helper files, fixtures or support files. The only extra line is `import 'allure-cypress'` at the top of each spec, which sends the results to the Allure report.

**How the token is reused:** `booking.cy.ts` requests `/auth` once in a `before()` hook and saves the token in a `token` variable. Every test in the file that needs it (update, partial update, delete) uses that same variable, so there's one `/auth` request per run of the spec.

```ts
let token: string

before(() => {
  cy.request('POST', '/auth', { username: 'admin', password: 'password123' }).then((response) => {
    token = response.body.token
  })
})
```

```ts
// cypress/api/booking.cy.ts
it('TC-BOOKING-09: returns 404 for a booking that does not exist', () => {
  cy.request({ url: '/booking/999999999', failOnStatusCode: false }).then((response) => {
    expect(response.status).to.eq(404)
    expect(response.body).to.eq('Not Found')
  })
})
```

**Conventions**

- Page files and classes are named after the **page** (`LoginPage`). Spec files are named after the **feature** (`login.cy.ts`).
- Test titles use the format `TC-<FEATURE>-NN: <what it checks>`.
- Check methods start with `verify` (`verifyLoaded()`, `verifyNoResults()`).
- No hard waits (`cy.wait(5000)`). Use `.should(...)`, which retries automatically. ESLint blocks hard waits.
- Each test sets up its own state and doesn't depend on another test.
- Use unique data for negative tests (`` `user.${Date.now()}@example.com` ``).

## Claude Code agents

This repo includes three [Claude Code](https://claude.com/claude-code) agents in [`.claude/agents/`](.claude/agents/) that know this project's conventions:

| Agent                   | What it does                                                                                                                                       | Example request                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `test-case-fetcher`     | Reads test cases from a URL (Google Sheet, Doc, GitHub file, web page) or pasted text, and saves them as a clean list in `test-cases/<feature>.md` | "Get the test cases from &lt;sheet URL&gt;" |
| `cypress-pom-automator` | Turns test cases into page objects and specs, checks the live site for real selectors, runs the tests and fixes them                               | "Automate test-cases/cart.md"               |
| `flaky-test-fixer`      | Reruns a test many times to measure flakiness, finds the root cause, fixes it and proves the fix with repeated green runs                          | "TC-SEARCH-03 is flaky, fix it"             |

The simplest way to use them is to ask Claude Code: _"Automate the test cases in &lt;URL&gt;"_. It runs the fetcher, then the automator. The test cases sheet is saved in [`test-cases/README.md`](test-cases/README.md), so _"Fetch the test cases from the sheet in test-cases/README.md"_ also works. Google Sheets must be readable through the Google Drive connector or shared as "Anyone with the link can view".

## Known issues

### E-commerce Playground

- **Login lockout:** an email is locked for 1 hour after 5 failed logins. Negative tests use unique emails. The empty-email test accepts the lockout message, because everyone using the public site shares that "account".
- **Category filter:** searching within a category does not narrow results (for example "iphone" in _Software_ still returns the iPhone). TC-SEARCH-03 checks that the category is applied but can't check filtering.
- **No email format validation:** an invalid email format shows the generic "No match" error, not a format error.
- **Search URLs:** the header search encodes the route as `product%2Fsearch`; the search page form doesn't. Tests decode the URL before comparing.
- **Empty checkout form:** pressing Continue with every checkout field empty makes the server return a PHP notice before its JSON, so the page shows a "not valid JSON" error and no field errors. TC-CHECKOUT-03 fills the address so only the four personal fields are empty.
- **Mobile header:** on small screens the desktop header search is hidden and a second search box is shown. `HomePage` uses whichever one is visible.
- **Shared public site:** the site can be slow or change data while tests run, so `cypress run` retries a failed test once and commands wait up to 8 seconds.

### Restful Booker API

- **Bad login returns 200:** a wrong password returns `200` with `{"reason": "Bad credentials"}`, not `401`. This matches the API's documentation, so TC-AUTH-02 checks for it.
- **DELETE returns 201 Created:** documented by the API, so TC-BOOKING-08 checks for `201`. Deleting the same booking twice returns `405`, not `404`.
- **Missing fields cause a server error:** creating a booking without the required fields returns `500 Internal Server Error`, not `400`. TC-BOOKING-10 only checks that the booking is rejected.
- **No input validation:** the API accepts a negative price and a checkout date before the check-in date.
- **Shared data:** anyone can create or delete bookings, and the API resets itself regularly. Tests create their own bookings with a unique last name, so they don't depend on existing data.
