# E-commerce Test Automation

End-to-end UI tests for the [LambdaTest E-commerce Playground](https://ecommerce-playground.lambdatest.io) (an OpenCart demo store), written in **Cypress + TypeScript** using the **Page Object Model**, with **Allure** reports published to **GitHub Pages**.

**Latest test report:** https://parasoli.github.io/ecommerce--test-automation/

**Test cases sheet:** https://docs.google.com/spreadsheets/d/1H_uBYgXPTL0s3cx396A-W7VRnHUprfkR2sP5Vly19nw/edit?pli=1&gid=1588861163#gid=1588861163

## What's covered

| Feature        | Spec                                                                 | Test cases                                                                                                                       |
| -------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Login          | [`cypress/e2e/login.cy.ts`](cypress/e2e/login.cy.ts)                 | TC-LOGIN-01 to 07: valid login, wrong password, unregistered email, empty fields, invalid email format, password masking, logout |
| Product search | [`cypress/e2e/productSearch.cy.ts`](cypress/e2e/productSearch.cy.ts) | TC-SEARCH-01 to 05: header search, search page, search within a category, search in descriptions, no results                     |
| Checkout       | [`cypress/e2e/checkout.cy.ts`](cypress/e2e/checkout.cy.ts)           | TC-CHECKOUT-01 to 04: empty cart, guest order, empty guest details, Terms & Conditions not accepted                              |

Every test runs in **Chrome**, **Firefox** and **Chrome at phone size (375×812)** in CI.

## Tech stack

- [Cypress 16](https://www.cypress.io/) with TypeScript
- Page Object Model (`cypress/pages/`) and fixtures for test data (`cypress/fixtures/`)
- [Allure](https://allurereport.org/) reports via `allure-cypress`, with feature, severity and test case labels
- ESLint + Prettier for code style
- GitHub Actions + GitHub Pages for CI and report hosting

## Project structure

```
.
├── cypress/
│   ├── e2e/                  # Test specs (one file per feature)
│   │   ├── checkout.cy.ts
│   │   ├── login.cy.ts
│   │   └── productSearch.cy.ts
│   ├── fixtures/             # Test data
│   │   ├── guest.json
│   │   └── products.json
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
│       └── e2e.ts            # Allure setup and labels
├── test-cases/               # Manual test cases (one .md per feature) + their source
├── .github/workflows/
│   └── cypress-allure.yml    # Lint, run tests on 3 browsers, publish Allure report
├── .claude/agents/           # Claude Code agents (see below)
├── cypress.config.ts         # Base URL, env vars, retries, timeouts, Allure reporter
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

## Running tests

```bash
npm test                                                     # all specs in Chrome
npm run test:firefox                                         # all specs in Firefox
npm run test:mobile                                          # all specs in Chrome at phone size
npx cypress run --browser chrome --spec cypress/e2e/login.cy.ts   # one spec
npx cypress open                                             # open the Cypress UI
```

Failed tests are retried once in `cypress run` (not in `cypress open`), because the demo site is public and can be slow.

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
npm test                    # writes results to allure-results/
npm run allure:generate     # builds the HTML report in allure-report/
npm run allure:open         # opens it in your browser
```

Delete `allure-results/` before a run if you only want that run's results in the report.

Each test in the report has:

- **Epic / feature:** `E-commerce UI` → `Login`, `Product Search` or `Checkout`
- **Severity:** `critical` for the main happy paths (valid login, header search, guest order), `normal` for the rest
- **Test case link:** the TC ID links to the test cases sheet
- **Parameters:** browser and viewport, so the Chrome, Firefox and mobile results show separately

## CI: GitHub Actions + GitHub Pages

The workflow [`.github/workflows/cypress-allure.yml`](.github/workflows/cypress-allure.yml) runs **only when started manually**, not on push or merge.

**To run it:** go to **Actions** → **Cypress Tests + Allure Report** → **Run workflow**, then pick a branch.

Each run has these jobs:

1. **lint**: ESLint, Prettier check and TypeScript type check
2. **test (chrome)**, **test (firefox)**, **test (mobile)**: run all specs in parallel and upload their results and any failure screenshots
3. **report**: merges the results from all three into one Allure report, uploads it as an artifact and publishes it to GitHub Pages, **replacing the previous report**

The run is marked as failed if lint fails or any test fails, but the report is still published so failures are visible.

**One-time setup** (already done for this repo):

1. **Settings → Secrets and variables → Actions**: add `USER_EMAIL` and `USER_PASSWORD`
2. **Settings → Actions → General**: set Workflow permissions to **Read and write**
3. Run the workflow once, then **Settings → Pages**: Source **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`

## Writing tests: Page Object Model

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

## Known issues on the demo site

- **Login lockout:** an email is locked for 1 hour after 5 failed logins. Negative tests use unique emails. The empty-email test accepts the lockout message, because everyone using the public site shares that "account".
- **Category filter:** searching within a category does not narrow results (for example "iphone" in _Software_ still returns the iPhone). TC-SEARCH-03 checks that the category is applied but can't check filtering.
- **No email format validation:** an invalid email format shows the generic "No match" error, not a format error.
- **Search URLs:** the header search encodes the route as `product%2Fsearch`; the search page form doesn't. Tests decode the URL before comparing.
- **Empty checkout form:** pressing Continue with every checkout field empty makes the server return a PHP notice before its JSON, so the page shows a "not valid JSON" error and no field errors. TC-CHECKOUT-03 fills the address so only the four personal fields are empty.
- **Mobile header:** on small screens the desktop header search is hidden and a second search box is shown. `HomePage` uses whichever one is visible.
- **Shared public site:** the site can be slow or change data while tests run, so `cypress run` retries a failed test once and commands wait up to 8 seconds.
