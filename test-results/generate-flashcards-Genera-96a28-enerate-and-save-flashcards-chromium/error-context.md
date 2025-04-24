# Test info

- Name: Generate Flashcards Page >> should generate and save flashcards
- Location: /home/kuba/code/10x-cards3/e2e/generate-flashcards.spec.ts:19:3

# Error details

```
Error: locator.waitFor: Test ended.
Call log:
  - waiting for getByText(/Successfully (saved|copied)/) to be visible

    at GenerateFlashcardsPage.checkSuccessToast (/home/kuba/code/10x-cards3/e2e/page-objects/generate-flashcards.page.ts:183:62)
    at /home/kuba/code/10x-cards3/e2e/generate-flashcards.spec.ts:57:18
```

# Page snapshot

```yaml
- link "10x Cards":
  - /url: /
- link "Zaloguj się":
  - /url: /login
- main:
  - main:
    - heading "Generate Flashcards" [level=1]
    - textbox "Paste your text here (1,000 - 10,000 characters)": React Hooks Documentation useState is a Hook that lets you add React state to function components. useEffect is a Hook that lets you perform side effects in function components. useContext is a Hook that lets you subscribe to React context without introducing nesting. useReducer is a Hook that lets you manage local state of complex components with a reducer. useCallback is a Hook that lets you prevent unnecessary re-renders by memoizing functions. useMemo is similar to useCallback but for memoizing values instead of functions. useRef is a Hook that lets you create a mutable reference that persists across re-renders. useImperativeHandle is a Hook that lets you customize the instance value exposed to parent components. useLayoutEffect is similar to useEffect but fires synchronously after all DOM mutations. useDebugValue is a Hook that lets you add a label to custom hooks in React DevTools. React Hooks Documentation useState is a Hook that lets you add React state to function components. useEffect is a Hook that lets you perform side effects in function components. useContext is a Hook that lets you subscribe to React context without introducing nesting. useReducer is a Hook that lets you manage local state of complex components with a reducer. useCallback is a Hook that lets you prevent unnecessary re-renders by memoizing functions. useMemo is similar to useCallback but for memoizing values instead of functions. useRef is a Hook that lets you create a mutable reference that persists across re-renders. useImperativeHandle is a Hook that lets you customize the instance value exposed to parent components. useLayoutEffect is similar to useEffect but fires synchronously after all DOM mutations. useDebugValue is a Hook that lets you add a label to custom hooks in React DevTools.
    - text: 2,084 / 10,000 characters
    - button "Generate Flashcards"
    - button "Accept All (10)"
    - button "Copy to Clipboard"
    - heading "Generated Flashcards (10)" [level=2]
    - list:
      - listitem:
        - heading "Front" [level=3]
        - paragraph: What does the useState Hook do in React function components?
        - heading "Back" [level=3]
        - paragraph: useState is a Hook that lets you add and manage state within function components by returning a state variable and a setter function.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: When and why would you use the useEffect Hook in React?
        - heading "Back" [level=3]
        - paragraph: useEffect is used to perform side effects (such as data fetching, subscriptions, or manually changing the DOM) in function components. It runs after the component renders and can be configured to run only when specified dependencies change.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: How does the useContext Hook simplify context consumption in React?
        - heading "Back" [level=3]
        - paragraph: useContext lets you subscribe to a React context directly within a function component without wrapping it in a Consumer component, avoiding extra nesting and boilerplate.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: What problem does the useReducer Hook solve, and how does it work?
        - heading "Back" [level=3]
        - paragraph: useReducer helps manage complex local state logic by providing a reducer function and an initial state. It returns the current state and a dispatch function to update state based on action objects.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: How does useCallback help optimize React components?
        - heading "Back" [level=3]
        - paragraph: useCallback memoizes a callback function, returning the same function instance between renders unless its dependencies change, which prevents unnecessary re-renders of child components that depend on that function.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: In what way is useMemo similar to useCallback, and when should you use it?
        - heading "Back" [level=3]
        - paragraph: useMemo memoizes the result of a computation (value) instead of a function. You use it to avoid expensive recalculations on every render by specifying dependencies that trigger recomputation.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: What is the purpose of the useRef Hook in React?
        - heading "Back" [level=3]
        - paragraph: useRef returns a mutable ref object whose .current property persists across renders. It's commonly used to access DOM elements directly or to store mutable values without causing re-renders.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: How does useImperativeHandle customize a component's instance value for parent components?
        - heading "Back" [level=3]
        - paragraph: useImperativeHandle allows a function component to customize the value exposed to parent refs by specifying which methods or properties should be accessible, effectively controlling the imperative API.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: What distinguishes useLayoutEffect from useEffect in React?
        - heading "Back" [level=3]
        - paragraph: useLayoutEffect fires synchronously after all DOM mutations but before the browser has painted, allowing you to perform DOM measurements or synchronous updates. useEffect runs asynchronously after painting.
        - button "Reject"
        - button "Edit"
        - button "Accept"
      - listitem:
        - heading "Front" [level=3]
        - paragraph: How does the useDebugValue Hook assist with custom hooks in React DevTools?
        - heading "Back" [level=3]
        - paragraph: useDebugValue lets you display a label or formatted value for a custom hook in React DevTools, making it easier to inspect hook state and debug complex logic.
        - button "Reject"
        - button "Edit"
        - button "Accept"
    - button "Copy to Clipboard"
- region "Notifications alt+T"
```

# Test source

```ts
   83 |     await this.cancelEditButton.click();
   84 |   }
   85 | }
   86 |
   87 | /**
   88 |  * Page Object Model for the Generate Flashcards page
   89 |  * Represents the page where users can generate, review and save flashcards
   90 |  */
   91 | export class GenerateFlashcardsPage {
   92 |   readonly page: Page;
   93 |
   94 |   constructor(page: Page) {
   95 |     this.page = page;
   96 |   }
   97 |
   98 |   // Input section
   99 |   private get inputTextArea(): Locator {
  100 |     return this.page.getByTestId('generate-input-text');
  101 |   }
  102 |
  103 |   private get generateButton(): Locator {
  104 |     return this.page.getByTestId('generate-flashcards-button');
  105 |   }
  106 |
  107 |   // Loading state
  108 |   private get loadingIndicator(): Locator {
  109 |     return this.page.getByTestId('loading-indicator');
  110 |   }
  111 |
  112 |   // Flashcards management
  113 |   private get acceptAllButton(): Locator {
  114 |     return this.page.getByTestId('accept-all-flashcards-button');
  115 |   }
  116 |
  117 |   private get saveButton(): Locator {
  118 |     return this.page.getByTestId('save-flashcards-button');
  119 |   }
  120 |
  121 |   private get flashcardsList(): Locator {
  122 |     return this.page.getByRole('list');
  123 |   }
  124 |
  125 |   /**
  126 |    * Navigate to the generate flashcards page
  127 |    */
  128 |   async goto() {
  129 |     await this.page.goto('/generate');
  130 |     // Wait for the main input area to be ready
  131 |     await this.inputTextArea.waitFor({ state: 'visible' });
  132 |   }
  133 |
  134 |   /**
  135 |    * Enter text into the input area
  136 |    */
  137 |   async enterText(text: string) {
  138 |     // Wait for the input area to be ready and enabled
  139 |     await this.inputTextArea.waitFor({ state: 'visible' });
  140 |     await expect(this.inputTextArea).toBeEnabled();
  141 |     await this.inputTextArea.fill(text);
  142 |   }
  143 |
  144 |   /**
  145 |    * Click generate button and wait for results
  146 |    */
  147 |   async generateFlashcards() {
  148 |     await this.generateButton.click();
  149 |     await this.waitForGeneration();
  150 |   }
  151 |
  152 |   /**
  153 |    * Wait for the generation process to complete
  154 |    */
  155 |   private async waitForGeneration() {
  156 |     // Wait for loading indicator to appear
  157 |     await this.loadingIndicator.waitFor({ state: 'visible' });
  158 |     // Wait for loading indicator to disappear
  159 |     await this.loadingIndicator.waitFor({ state: 'hidden' });
  160 |     // Wait for flashcards list to be visible
  161 |     await this.flashcardsList.waitFor({ state: 'visible' });
  162 |   }
  163 |
  164 |   /**
  165 |    * Accept all generated flashcards
  166 |    */
  167 |   async acceptAllFlashcards() {
  168 |     await this.acceptAllButton.click();
  169 |   }
  170 |
  171 |   /**
  172 |    * Save or copy flashcards based on login state
  173 |    */
  174 |   async saveFlashcards() {
  175 |     await this.saveButton.click();
  176 |   }
  177 |
  178 |   /**
  179 |    * Check if success toast is visible
  180 |    */
  181 |   async checkSuccessToast() {
  182 |     // Wait for toast with success message
> 183 |     await this.page.getByText(/Successfully (saved|copied)/).waitFor({ state: 'visible' });
      |                                                              ^ Error: locator.waitFor: Test ended.
  184 |   }
  185 |
  186 |   /**
  187 |    * Get individual flashcard by index
  188 |    */
  189 |   getFlashcard(index: number) {
  190 |     return new FlashcardItem(this.page, index);
  191 |   }
  192 | } 
```