---
name: cypress-pom-automator
description: Use when test cases (a test-cases/*.md file from test-case-fetcher, a pasted list, or a TC-XXX list) need to be automated as Cypress + TypeScript tests in this repo using the Page Object Model. Inspects the live site for real selectors, writes/extends page objects in cypress/pages and specs in cypress/e2e, runs them, and fixes failures until they pass or a real product bug is confirmed.
---

You automate test cases in this repo as Cypress + TypeScript tests using the Page Object Model (POM). Match the existing code. Read `cypress/pages/LoginPage.ts` and `cypress/e2e/login.cy.ts` first; they are the reference style.

## Project facts

- Cypress 16, TypeScript, `baseUrl` = `https://ecommerce-playground.lambdatest.io` (an OpenCart demo site, shared by the public).
- Credentials: read them with `cy.env(['USER_EMAIL', 'USER_PASSWORD']).then((env) => ...)` (Cypress 16 removed `Cypress.env()`). They come from `.env` locally and GitHub secrets in CI. Never hard-code credentials.
- Tests that need a logged-in user call `cy.login()` (in `cypress/support/commands.ts`, uses `cy.session`) instead of logging in through the form.
- Test data goes in `cypress/fixtures/*.json`. Expected messages go in the page object as class properties (e.g. `noMatchError = '...'`), not in fixtures or specs.
- No comments in page objects or specs unless the user asks.
- **API tests** (Restful Booker, `cypress/api/*.cy.ts`, config `cypress.api.config.ts`, run with `npm run test:api`) are plain: call `cy.request()` directly in the spec. No page objects, service classes, custom commands, fixtures or shared `beforeEach` setup for API tests: write the request data inline so each test reads on its own.
- UI fixtures live in `cypress/fixtures/ui/` (load with `cy.fixture('ui/<name>')`).
- Allure reporting is wired in `cypress.config.ts`, and labels (epic, feature, test ID link, browser) are added in `cypress/support/e2e.ts`. For a main happy-path test, add `allure.severity('critical')` (from `allure-js-commons`) as the first line. Don't change reporting or the GitHub workflow unless asked.

## 1. Read the test cases

Take the input file or list. Keep each test's ID and title exactly. If a case can't be automated (captcha, real email inbox, real payment), skip it and say why.

## 2. Inspect the real page before writing selectors

Never guess selectors. Fetch the page and grep for the elements:

```bash
curl -sL -A "Mozilla/5.0" 'https://ecommerce-playground.lambdatest.io/index.php?route=<route>' -o <scratch>/page.html
grep -oE 'id="input-[^"]*"|name="[^"]*"|<h1[^>]*>[^<]*|alert-[a-z]+' <scratch>/page.html | sort -u
```

For behaviour after a form submit (error messages, result counts), check it with curl too (`-F field=value` or query params) so you assert the site's real text.

Selector preference: `#id` > `[name=...]` > a stable class scoped to the page container (e.g. `#account-login .alert-danger`) > `cy.contains(tag, text)`. Avoid long nth-child chains and auto-generated ids like `entry_217844` or `mz-fss-0--1`.

## 3. Page objects: `cypress/pages/<PageName>.ts`

- One class per page (`LoginPage`, `AccountPage`, `CartPage`, `ProductPage`), PascalCase file and class name. Name pages after the page, not the feature.
- **Reuse existing page objects first.** Check `cypress/pages/` and add methods to an existing class rather than creating a duplicate. The header search lives in `HomePage`, search results in `SearchPage`.
- Structure, in this order:
  1. **Getters for elements**, returning `cy.get(...)`: `get emailInput() { return cy.get('#input-email') }`
  2. **`open()`**, which visits the route and waits for a stable element to be visible
  3. **Action methods** with typed params: `login(email: string, password: string)`, `searchFor(term: string)`
  4. **Check methods** starting with `verify...`: `verifyNoMatchError()`, `verifyLoaded(term: string)`
- `export default new <ClassName>()` at the bottom.
- Typed params (`string`, `number`), never `any`. Use `.clear().type()` for inputs. Pass `{ log: false }` when typing passwords.
- Hidden custom checkboxes/radios (`custom-control-input`): `.check({ force: true })` with a one-line comment explaining why.

## 4. Specs: `cypress/e2e/<feature>.cy.ts`

```ts
import loginPage from '../pages/LoginPage'

describe('Login', () => {
  beforeEach(() => {
    loginPage.open()
  })

  it('TC-LOGIN-01: logs in with a valid email and password', () => {
    loginPage.login(email, password)

    accountPage.verifyLoaded()
  })
})
```

- `describe('<Feature>')`, `it('<ID>: <title>')`, exactly as in the test case.
- **No `cy.get` in specs.** Every selector lives in a page object. One-off assertions on a page-object getter are fine.
- Arrange / act / assert separated by blank lines.
- Each test is independent: no test relies on another test having run.
- **No `cy.wait(<ms>)`.** Use `.should(...)`, which retries.
- No `it.only` / `describe.only` left in the final code.
- Shared expected text goes in a `const` at the top of the spec.

## 5. Known gotchas on this site

- **Login lockout:** OpenCart locks an email for 1 hour after 5 failed logins. For negative tests use unique data (`` `not.registered.${Date.now()}@example.com` ``). An empty email is shared by everyone, so it may already be locked; accept either the "No match" or the "exceeded allowed number of login attempts" message there.
- **URL encoding:** some links encode routes (`route=product%2Fsearch`) and some don't. Compare with `decodeURIComponent(url)` inside `cy.url().should((url) => ...)`.
- **Duplicate elements:** header widgets (search, cart) exist twice (desktop and mobile). Scope to `#main-header` or the page container.
- **Category filter in search doesn't narrow results** on this demo. Don't assert filtering; see step 7.

## 6. Run and fix

```bash
npx tsc --noEmit -p .
npm run lint
env -u ELECTRON_RUN_AS_NODE npx cypress run --browser chrome --spec cypress/e2e/<feature>.cy.ts
```

(`ELECTRON_RUN_AS_NODE` is set inside VS Code's terminal and breaks Cypress, so always unset it. If the run is blocked by a sandbox, rerun with the sandbox disabled.)

When a test fails, read the error and the screenshot in `cypress/screenshots/`, then decide:

- **Test bug** (wrong selector, timing, wrong expected text): fix the test and rerun.
- **Product bug** (the site really behaves wrong vs. the expected result): do NOT weaken the assertion to make it pass silently. Either keep it failing, or if the caller wants a green suite, assert actual behaviour with a `// Note:` comment saying what the expected behaviour should be. Always list it in your report.

Rerun until every test passes or each failure is explained. Run the whole suite once at the end (`env -u ELECTRON_RUN_AS_NODE npm test`), then `npm run lint` and `npm run format:check` (fix with `npm run lint:fix` / `npm run format`) to check nothing else broke.

## 7. Report back

- Files created or changed (page objects and specs)
- Pass/fail per test ID, from the actual run output
- Product bugs found: test ID, steps, expected vs. actual
- Test cases skipped and why
- Don't commit or push. Leave that to the user.
