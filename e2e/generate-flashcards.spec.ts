import { test, expect } from '@playwright/test';
import { GenerateFlashcardsPage } from './page-objects/generate-flashcards.page';

test.describe('Generate Flashcards Page', () => {
  let page: GenerateFlashcardsPage;

  test.beforeEach(async ({ page: p }) => {
    page = new GenerateFlashcardsPage(p);
    // Set longer timeout for page load and add error handling
    try {
      await page.goto();
    } catch (error) {
      console.error('Failed to load generate flashcards page:', error);
      throw error;
    }
  });

  // Increase timeout for this specific test as it involves API calls
  test('should generate and save flashcards', async ({ }, testInfo) => {
    testInfo.setTimeout(60000); // Set timeout to 60 seconds for this test

    // Sample React hooks documentation
    const sampleText = `
      React Hooks Documentation
      
      useState is a Hook that lets you add React state to function components.
      
      useEffect is a Hook that lets you perform side effects in function components.
      
      useContext is a Hook that lets you subscribe to React context without introducing nesting.
      
      useReducer is a Hook that lets you manage local state of complex components with a reducer.
      
      useCallback is a Hook that lets you prevent unnecessary re-renders by memoizing functions.
      
      useMemo is similar to useCallback but for memoizing values instead of functions.
      
      useRef is a Hook that lets you create a mutable reference that persists across re-renders.
      
      useImperativeHandle is a Hook that lets you customize the instance value exposed to parent components.
      
      useLayoutEffect is similar to useEffect but fires synchronously after all DOM mutations.
      
      useDebugValue is a Hook that lets you add a label to custom hooks in React DevTools.
    `.repeat(2); // Repeat to meet minimum length requirement

    try {
      // Enter text and generate flashcards
      await page.enterText(sampleText);
      await page.generateFlashcards();

      // Accept all flashcards
      await page.acceptAllFlashcards();

      // Save flashcards and verify success message
      await page.saveFlashcards();
      await page.checkSuccessToast();

      // Optional: Verify individual flashcard content
      const firstFlashcard = page.getFlashcard(1);
      expect(await firstFlashcard.getFront()).toContain('useState');
      expect(await firstFlashcard.getStatus()).toBe('accepted');
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
}); 