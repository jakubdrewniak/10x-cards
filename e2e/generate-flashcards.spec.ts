import { test, expect } from "@playwright/test";
import { GenerateFlashcardsPage } from "./page-objects/generate-flashcards.page";

test.describe("Generate Flashcards Page", () => {
  let page: GenerateFlashcardsPage;

  test.beforeEach(async ({ page: p }) => {
    page = new GenerateFlashcardsPage(p);
  });

  // Debug the auth state before each test
  test("should verify user authentication state", async () => {
    // Login and check auth state
    await page.gotoAsLoggedInUser();
    const authState = await page.debugAuthState();

    // Verify user is properly authenticated
    expect(authState.isLoggedInState).toBe(true);
    expect(authState.userStorageData).toContain("isAuthenticated");
  });

  // TODO: finish test when flashcards list is implemented
  test("should generate and save flashcards as logged in user", async ({}, testInfo) => {
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
      // Login and verify authentication
      await page.gotoAsLoggedInUser();
      const authState = await page.debugAuthState();
      console.log("Auth state before generation:", authState);

      // Use the complete flow method which handles login, generation, and verification
      const flashcards = await page.completeFlashcardFlow(sampleText);

      // // Additional verification for specific flashcard content
      // expect(flashcards.length).toBeGreaterThan(0);

      // // Find a flashcard related to useState
      // const useStateCard = flashcards.find(
      //   (card) => card.front.toLowerCase().includes("usestate") || card.back.toLowerCase().includes("usestate")
      // );

      // expect(useStateCard).toBeDefined();
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

  test("should verify flashcards are displayed correctly on page", async ({}, testInfo) => {
    testInfo.setTimeout(45000);

    const sampleText = `
      JavaScript Closures
      
      A closure is the combination of a function bundled together with references to its surrounding state.
      
      Closures allow a function to access variables from an outer function even after the outer function has returned.
      
      Closures are created every time a function is created, at function creation time.

      A closure is the combination of a function bundled together with references to its surrounding state.
      
      Closures allow a function to access variables from an outer function even after the outer function has returned.
      
      Closures are created every time a function is created, at function creation time.
    `.repeat(2);

    try {
      // Login and go to generate page
      await page.gotoAsLoggedInUser();

      // Debug auth state
      const authState = await page.debugAuthState();
      console.log("Auth state before flashcard verification:", authState);

      // Generate flashcards
      await page.enterText(sampleText);
      await page.generateFlashcards();

      // Get current flashcards
      const initialFlashcards = await page.collectCurrentFlashcards();

      // Verify flashcards are displayed correctly
      await page.verifyFlashcardsOnPage(initialFlashcards);

      // Edit a flashcard (assuming at least one exists)
      if (initialFlashcards.length > 0) {
        const flashcard = page.getFlashcard(0);
        const newFront = "JavaScript Closures Definition";
        const newBack = "The combination of a function and its lexical environment";

        await flashcard.edit(newFront, newBack);

        // Get updated flashcards and verify the edit took effect
        const updatedFlashcards = await page.collectCurrentFlashcards();
        const editedCard = updatedFlashcards[0];

        expect(editedCard.front).toBe(newFront);
        expect(editedCard.back).toBe(newBack);
      }
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });
});
