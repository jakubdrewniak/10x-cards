import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for individual flashcard items
 * Represents a single flashcard in the list with its content and actions
 */
export class FlashcardItem {
  readonly page: Page;
  readonly index: number;

  // Content locators
  readonly frontContent: Locator;
  readonly backContent: Locator;
  readonly status: Locator;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;

    // Initialize locators using test IDs
    this.frontContent = page.getByTestId(`flashcard-${index}-front`);
    this.backContent = page.getByTestId(`flashcard-${index}-back`);
    this.status = page.getByTestId(`flashcard-${index}-status`);
  }

  /**
   * Get the front content of the flashcard
   */
  async getFrontContent(): Promise<string> {
    return this.frontContent.textContent() || '';
  }

  /**
   * Get the back content of the flashcard
   */
  async getBackContent(): Promise<string> {
    return this.backContent.textContent() || '';
  }

  /**
   * Get the current status of the flashcard
   */
  async getStatus(): Promise<string> {
    return this.status.textContent() || '';
  }

  /**
   * Check if the flashcard is in edit mode
   */
  async isInEditMode(): Promise<boolean> {
    const editFront = this.page.getByTestId(`edit-front-${this.index}`);
    return editFront.isVisible();
  }

  /**
   * Edit the flashcard content
   */
  async edit(front: string, back: string) {
    const editFront = this.page.getByTestId(`edit-front-${this.index}`);
    const editBack = this.page.getByTestId(`edit-back-${this.index}`);
    
    await editFront.fill(front);
    await editBack.fill(back);
  }
} 