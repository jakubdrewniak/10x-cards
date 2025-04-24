import { type Page, type Locator, expect } from '@playwright/test';

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
    return this.page.getByTestId(`flashcard-${this.index}-front`);
  }

  private get backText(): Locator {
    return this.page.getByTestId(`flashcard-${this.index}-back`);
  }

  private get statusElement(): Locator {
    return this.page.getByTestId(`flashcard-${this.index}-status`);
  }

  private get acceptButton(): Locator {
    return this.page.getByTestId(`accept-flashcard-${this.index}`);
  }

  private get editButton(): Locator {
    return this.page.getByTestId(`edit-flashcard-${this.index}`);
  }

  private get rejectButton(): Locator {
    return this.page.getByTestId(`reject-flashcard-${this.index}`);
  }

  private get frontInput(): Locator {
    return this.page.getByTestId(`edit-front-${this.index}`);
  }

  private get backInput(): Locator {
    return this.page.getByTestId(`edit-back-${this.index}`);
  }

  private get saveEditButton(): Locator {
    return this.page.getByTestId(`save-edit-${this.index}`);
  }

  private get cancelEditButton(): Locator {
    return this.page.getByTestId(`cancel-edit-${this.index}`);
  }

  async getFront(): Promise<string> {
    return await this.frontText.textContent() || '';
  }

  async getBack(): Promise<string> {
    return await this.backText.textContent() || '';
  }

  async getStatus(): Promise<string> {
    return await this.statusElement.textContent() || '';
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

/**
 * Page Object Model for the Generate Flashcards page
 * Represents the page where users can generate, review and save flashcards
 */
export class GenerateFlashcardsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Input section
  private get inputTextArea(): Locator {
    return this.page.getByTestId('generate-input-text');
  }

  private get generateButton(): Locator {
    return this.page.getByTestId('generate-flashcards-button');
  }

  // Loading state
  private get loadingIndicator(): Locator {
    return this.page.getByTestId('loading-indicator');
  }

  // Flashcards management
  private get acceptAllButton(): Locator {
    return this.page.getByTestId('accept-all-flashcards-button');
  }

  private get saveButton(): Locator {
    return this.page.getByTestId('save-flashcards-button');
  }

  private get flashcardsList(): Locator {
    return this.page.getByRole('list');
  }

  /**
   * Navigate to the generate flashcards page
   */
  async goto() {
    await this.page.goto('/generate');
    // Wait for the main input area to be ready
    await this.inputTextArea.waitFor({ state: 'visible' });
  }

  /**
   * Enter text into the input area
   */
  async enterText(text: string) {
    // Wait for the input area to be ready and enabled
    await this.inputTextArea.waitFor({ state: 'visible' });
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
    await this.loadingIndicator.waitFor({ state: 'visible' });
    // Wait for loading indicator to disappear
    await this.loadingIndicator.waitFor({ state: 'hidden' });
    // Wait for flashcards list to be visible
    await this.flashcardsList.waitFor({ state: 'visible' });
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
   * Check if success toast is visible
   */
  async checkSuccessToast() {
    // Wait for toast with success message
    await this.page.getByText(/Successfully (saved|copied)/).waitFor({ state: 'visible' });
  }

  /**
   * Get individual flashcard by index
   */
  getFlashcard(index: number) {
    return new FlashcardItem(this.page, index);
  }
} 