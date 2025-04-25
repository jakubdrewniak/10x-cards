import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for individual flashcard items
 */
class FlashcardItem {
  readonly page: Page;
  readonly index: number;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
  }

  private get frontText(): Locator {
    return this.page.getByTestId(`flashcard-${this.index + 1}-front`);
  }

  private get backText(): Locator {
    return this.page.getByTestId(`flashcard-${this.index + 1}-back`);
  }

  private get statusElement(): Locator {
    return this.page.getByTestId(`flashcard-${this.index + 1}-status`);
  }

  private get acceptButton(): Locator {
    return this.page.getByTestId(`accept-flashcard-${this.index + 1}`);
  }

  private get editButton(): Locator {
    return this.page.getByTestId(`edit-flashcard-${this.index + 1}`);
  }

  private get rejectButton(): Locator {
    return this.page.getByTestId(`reject-flashcard-${this.index + 1}`);
  }

  private get frontInput(): Locator {
    return this.page.getByTestId(`edit-front-${this.index + 1}`);
  }

  private get backInput(): Locator {
    return this.page.getByTestId(`edit-back-${this.index + 1}`);
  }

  private get saveEditButton(): Locator {
    return this.page.getByTestId(`save-edit-${this.index + 1}`);
  }

  private get cancelEditButton(): Locator {
    return this.page.getByTestId(`cancel-edit-${this.index + 1}`);
  }

  async getFront(): Promise<string> {
    return (await this.frontText.textContent()) || "";
  }

  async getBack(): Promise<string> {
    return (await this.backText.textContent()) || "";
  }

  async getStatus(): Promise<string> {
    return (await this.statusElement.textContent()) || "";
  }

  async accept(): Promise<void> {
    await this.acceptButton.click();
  }

  async reject(): Promise<void> {
    await this.rejectButton.click();
  }

  async edit(front: string, back: string): Promise<void> {
    await this.editButton.click();
    await this.frontInput.fill(front);
    await this.backInput.fill(back);
    await this.saveEditButton.click();
  }

  async cancelEdit(): Promise<void> {
    await this.cancelEditButton.click();
  }
}

interface SavedFlashcard {
  id: string;
  front: string;
  back: string;
  user_id: string;
}

/**
 * Page Object Model for the Generate Flashcards page
 * Represents the page where users can generate, review and save flashcards
 */
export class GenerateFlashcardsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Login section
  private get emailInput(): Locator {
    return this.page.getByTestId("email-input");
  }

  private get passwordInput(): Locator {
    return this.page.getByTestId("password-input");
  }

  private get loginButton(): Locator {
    return this.page.getByTestId("login-button");
  }

  // Input section
  private get inputTextArea(): Locator {
    return this.page.getByTestId("generate-input-text");
  }

  private get generateButton(): Locator {
    return this.page.getByTestId("generate-flashcards-button");
  }

  // Loading state
  private get loadingIndicator(): Locator {
    return this.page.getByTestId("loading-indicator");
  }

  // Flashcards management
  private get acceptAllButton(): Locator {
    return this.page.getByTestId("accept-all-flashcards-button");
  }

  private get saveButton(): Locator {
    return this.page.getByTestId("save-flashcards-button");
  }

  private get flashcardsList(): Locator {
    return this.page.getByRole("list");
  }

  /**
   * Navigate to the generate flashcards page
   */
  async goto() {
    // Grant clipboard permissions before navigation
    await this.page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await this.page.goto("/generate");
    // Wait for the main input area to be ready
    await this.inputTextArea.waitFor({ state: "visible" });
  }

  /**
   * Login using test credentials from environment variables
   */
  async login() {
    await this.page.goto("/login");

    const username = process.env.E2E_USERNAME || "";
    const password = process.env.E2E_PASSWORD || "";
    const userId = process.env.E2E_USER_ID || "";

    if (!username || !password) {
      console.error("Missing environment variables: E2E_USERNAME or E2E_PASSWORD");
      console.log(
        "Available environment variables:",
        Object.keys(process.env).filter((key) => key.startsWith("E2E_"))
      );
      throw new Error("Test credentials not set in environment variables");
    }

    console.log(`Logging in with test user: ${username}`);

    await this.emailInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // Wait for redirect after successful login
    await this.page.waitForURL("/**");

    // Set user data in localStorage to ensure user_id is available for API calls
    await this.page.evaluate(
      ({ userId, email }: { userId: string; email: string }) => {
        const userData = {
          state: {
            user: {
              id: userId,
              email: email,
            },
            isAuthenticated: true,
          },
          version: 0,
        };
        localStorage.setItem("user-storage", JSON.stringify(userData));
      },
      { userId, email: username }
    );

    // Wait for a moment to ensure localStorage is set
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate to generate page and ensure user is logged in
   */
  async gotoAsLoggedInUser() {
    await this.login();
    await this.goto();
  }

  /**
   * Enter text into the input area
   */
  async enterText(text: string) {
    // Wait for the input area to be ready and enabled
    await this.inputTextArea.waitFor({ state: "visible" });
    await expect(this.inputTextArea).toBeEnabled();
    await this.inputTextArea.fill(text);
  }

  /**
   * Click generate button and wait for results
   */
  async generateFlashcards() {
    await this.generateButton.click();
    await this.waitForGeneration();
  }

  /**
   * Wait for the generation process to complete
   */
  private async waitForGeneration() {
    // Wait for loading indicator to appear
    await this.loadingIndicator.waitFor({ state: "visible" });
    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: "hidden" });
    // Wait for flashcards list to be visible
    await this.flashcardsList.waitFor({ state: "visible" });
  }

  /**
   * Accept all generated flashcards
   */
  async acceptAllFlashcards() {
    await this.acceptAllButton.click();
  }

  /**
   * Save or copy flashcards based on login state
   */
  async saveFlashcards() {
    await this.saveButton.click();
  }

  /**
   * Get clipboard content
   */
  async getClipboardContent(): Promise<string> {
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  /**
   * Check if success toast is visible
   */
  async checkSuccessToast() {
    // Wait for toast with success message
    await this.page.getByText(/Successfully (saved|copied)/).waitFor({ state: "visible" });
  }

  /**
   * Get individual flashcard by index
   */
  getFlashcard(index: number) {
    return new FlashcardItem(this.page, index);
  }

  /**
   * Collect all current flashcards from the UI
   */
  async collectCurrentFlashcards(): Promise<{ front: string; back: string }[]> {
    const count = await this.page.getByTestId(/flashcard-\d+-front/).count();
    const flashcards = [];

    for (let i = 0; i < count; i++) {
      const flashcard = this.getFlashcard(i);
      flashcards.push({
        front: await flashcard.getFront(),
        back: await flashcard.getBack(),
      });
    }

    return flashcards;
  }

  /**
   * Verify if flashcards were properly saved in the database
   * This works by making a direct API call to the backend
   */
  async verifyFlashcardsSaved(expectedFlashcards: { front: string; back: string }[]): Promise<void> {
    // Navigate to the user's flashcards page to trigger data loading
    await this.page.goto("/flashcards");

    // Wait for the page to load the flashcards
    await this.page.waitForSelector('[data-testid^="flashcard-"]');

    // Make an API request to get the user's flashcards
    const response = await this.page.request.get("/api/flashcards");
    const savedFlashcards = await response.json();

    // Verify each expected flashcard is in the saved flashcards
    for (const expected of expectedFlashcards) {
      const found = savedFlashcards.some(
        (saved: SavedFlashcard) =>
          saved.front === expected.front && saved.back === expected.back && saved.user_id === process.env.E2E_USER_ID
      );

      expect(found).toBeTruthy();
    }
  }

  /**
   * Verify if flashcards are displayed correctly on the current page
   */
  async verifyFlashcardsOnPage(expectedFlashcards: { front: string; back: string }[]): Promise<void> {
    const currentFlashcards = await this.collectCurrentFlashcards();

    expect(currentFlashcards.length).toBe(expectedFlashcards.length);

    for (const expected of expectedFlashcards) {
      const found = currentFlashcards.some((card) => card.front === expected.front && card.back === expected.back);

      expect(found).toBeTruthy();
    }
  }

  /**
   * Full test flow: generate, review, save and verify flashcards
   */
  async completeFlashcardFlow(inputText: string) {
    // : Promise<{ front: string; back: string }[]>
    // Ensure we're logged in
    await this.gotoAsLoggedInUser();

    // Generate flashcards
    await this.enterText(inputText);
    await this.generateFlashcards();

    // Accept all generated flashcards
    await this.acceptAllFlashcards();

    // Collect current flashcards before saving
    // const flashcards = await this.collectCurrentFlashcards();

    // Save flashcards
    await this.saveFlashcards();
    await this.checkSuccessToast();
    // Verify flashcards were saved correctly
    // await this.verifyFlashcardsSaved(flashcards);

    // return flashcards;
  }

  /**
   * Debug user authentication state
   */
  async debugAuthState() {
    // Print localStorage content for debugging
    const userStorageData = await this.page.evaluate(() => localStorage.getItem("user-storage"));
    console.log("user-storage content:", userStorageData);

    // Check if isLoggedIn state in component reflects correct state
    const isLoggedInState = await this.page.evaluate(() => {
      // This assumes your app stores this in localStorage or similar
      const storage = localStorage.getItem("user-storage");
      if (storage) {
        try {
          const data = JSON.parse(storage);
          return data?.state?.isAuthenticated || false;
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    console.log("isLoggedIn state:", isLoggedInState);

    return {
      userStorageData,
      isLoggedInState,
    };
  }
}
