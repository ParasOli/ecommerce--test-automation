# E-commerce Test Automation

End-to-end UI tests for the [LambdaTest E-commerce Playground](https://ecommerce-playground.lambdatest.io) (an OpenCart demo store), written in **Cypress + TypeScript** using the **Page Object Model**, with **Allure** reports published to **GitHub Pages**.

**Latest test report:** https://parasoli.github.io/ecommerce--test-automation/

**Test cases sheet:** https://docs.google.com/spreadsheets/d/1H_uBYgXPTL0s3cx396A-W7VRnHUprfkR2sP5Vly19nw/edit?pli=1&gid=1588861163#gid=1588861163

## What's covered

| Feature        | Spec                                                                  | Test cases                                                                                                                       |
| -------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Login          | [`cypress/e2e/login.cy.ts`](cypress/e2e/login.cy.ts)                 | TC-LOGIN-01 to 07: valid login, wrong password, unregistered email, empty fields, invalid email format, password masking, logout |
| Product search | [`cypress/e2e/productSearch.cy.ts`](cypress/e2e/productSearch.cy.ts) | TC-SEARCH-01 to 05: header search, search page, search within a category, search in descriptions, no results                     |

## Tech stack

- [Cypress 14](https://www.cypress.io/) with TypeScript
- Page Object Model (`cypress/pages/`)
- [Allure](https://allurereport.org/) reports via `allure-cypress`
- GitHub Actions + GitHub Pages for CI and report hosting

## Project structure

```
.
├── cypress/
│   ├── e2e/                  # Test specs (one file per feature)
│   │   ├── login.cy.ts
│   │   └── productSearch.cy.ts
│   ├── pages/                # Page objects (selectors + actions + checks)
│   │   ├── LoginPage.ts
│   │   ├── AccountPage.ts
│   │   ├── LogoutPage.ts
│   │   └── productSearch.ts
│   └── support/              # Cypress support files (Allure is loaded here)
├── test-cases/               # Manual test cases (one .md per feature) + their sources
│   └── README.md             # Source links (Google Sheet) and fetch status
├── .github/workflows/
│   └── cypress-allure.yml    # Run tests + publish Allure report
├── .claude/agents/           # Claude Code agents (see below)
├── cypress.config.js         # Base URL, env vars, Allure reporter
├── .env.example              # Template for local credentials
└── package.json
```

## Getting started

**Requirements:** Node.js 18+ and Java 8+ (Java is only needed to build the Allure report).

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
npm test                                            # run all specs headless
npx cypress run --spec cypress/e2e/login.cy.ts      # run one spec
npx cypress open                                    # open the Cypress UI
```

> **Running from VS Code's terminal?** VS Code sets `ELECTRON_RUN_AS_NODE`, which stops Cypress from starting. Prefix the command with `env -u ELECTRON_RUN_AS_NODE`, for example `env -u ELECTRON_RUN_AS_NODE npx cypress run`.

## Allure report

```bash
npm test                    # writes results to allure-results/
npm run allure:generate     # builds the HTML report in allure-report/
npm run allure:open         # opens it in your browser
```

Delete `allure-results/` before a run if you only want that run's results in the report.

## CI: GitHub Actions + GitHub Pages

The workflow [`.github/workflows/cypress-allure.yml`](.github/workflows/cypress-allure.yml) runs **only when started manually**, not on push or merge.

**To run it:** go to **Actions** → **Cypress Tests + Allure Report** → **Run workflow**, then pick a branch.

Each run:

1. installs dependencies and runs all specs in Chrome
2. builds the Allure report (even if tests fail, so failures are visible)
3. uploads the report and any failure screenshots as run artifacts
4. publishes the report to GitHub Pages, **replacing the previous report**
5. marks the run as failed if any test failed

**One-time setup** (already done for this repo):

1. **Settings → Secrets and variables → Actions**: add `USER_EMAIL` and `USER_PASSWORD`
2. **Settings → Actions → General**: set Workflow permissions to **Read and write**
3. Run the workflow once, then **Settings → Pages**: Source **Deploy from a branch**, branch `gh-pages`, folder `/ (root)`

## Writing tests: Page Object Model

Each page gets one class in `cypress/pages/`. It holds the page's selectors, the actions a user can take, and the checks for that page. Specs only call page methods and never use `cy.get` directly.

```ts
// cypress/pages/LoginPage.ts
class LoginPage {
  get emailInput() { return cy.get('#input-email') }
  get passwordInput() { return cy.get('#input-password') }
  get loginButton() { return cy.get('input[type="submit"][value="Login"]') }

  open() {
    cy.visit('/index.php?route=account/login')
  }

  login(email: string, password: string) {
    this.emailInput.clear().type(email)
    this.passwordInput.clear().type(password, { log: false })
    this.loginButton.click()
  }
}

export default new LoginPage()
```

```ts
// cypress/e2e/login.cy.ts
import loginPage from '../pages/LoginPage'
import accountPage from '../pages/AccountPage'

describe('Login', () => {
  it('TC-LOGIN-01: logs in with a valid email and password', () => {
    loginPage.open()

    loginPage.login(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'))

    accountPage.verifyLoaded()
  })
})
```

**Conventions**

- Page files and classes are named after the **page** (`LoginPage`). Spec files are named after the **feature** (`login.cy.ts`).
- Test titles use the format `TC-<FEATURE>-NN: <what it checks>`.
- No hard waits (`cy.wait(5000)`). Use `.should(...)`, which retries automatically.
- Each test sets up its own state and doesn't depend on another test.
- Use unique data for negative tests (`` `user.${Date.now()}@example.com` ``).

## Claude Code agents

This repo includes three [Claude Code](https://claude.com/claude-code) agents in [`.claude/agents/`](.claude/agents/) that know this project's conventions:

| Agent                     | What it does                                                                                                                                        | Example request                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `test-case-fetcher`     | Reads test cases from a URL (Google Sheet, Doc, GitHub file, web page) or pasted text, and saves them as a clean list in`test-cases/<feature>.md` | "Get the test cases from&lt;sheet URL&gt;" |
| `cypress-pom-automator` | Turns test cases into page objects and specs, checks the live site for real selectors, runs the tests and fixes them                                | "Automate test-cases/cart.md"              |
| `flaky-test-fixer`      | Reruns a test many times to measure flakiness, finds the root cause, fixes it and proves the fix with repeated green runs                           | "TC-SEARCH-03 is flaky, fix it"            |

The simplest way to use them is to ask Claude Code: *"Automate the test cases in &lt;URL&gt;"*. It runs the fetcher, then the automator. Saved source links live in [`test-cases/README.md`](test-cases/README.md), so *"Fetch the test cases from the sheet in test-cases/README.md"* also works. Google Sheets must be readable through the Google Drive connector or shared as "Anyone with the link can view".

## Known issues on the demo site

- **Login lockout:** an email is locked for 1 hour after 5 failed logins. Negative tests use unique emails. The empty-email test accepts the lockout message, because everyone using the public site shares that "account".
- **Category filter:** searching within a category does not narrow results (for example "iphone" in *Software* still returns the iPhone). TC-SEARCH-03 checks that the category is applied but can't check filtering.
- **No email format validation:** an invalid email format shows the generic "No match" error, not a format error.
- **Search URLs:** the header search encodes the route as `product%2Fsearch`; the search page form doesn't. Tests decode the URL before comparing.
