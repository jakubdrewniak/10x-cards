import { Locator, Page } from "@playwright/test";

export class HomePage {
  private page: Page;
  readonly heading: Locator;
  readonly navLinks: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navLinks = page.getByRole("navigation").getByRole("link");
    this.loginButton = page.getByRole("button", { name: /login/i });
  }

  async goto() {
    await this.page.goto("/");
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async navigateTo(linkText: string) {
    await this.navLinks.filter({ hasText: linkText }).click();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./e2e-screenshots/${name}.png` });
  }
}
