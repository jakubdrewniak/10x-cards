/_
Plan wdrożenia widoku generowania fiszek
_/

# Plan implementacji widoku generowania fiszek

## 1. Przegląd

Widok ma umożliwić zalogowanemu użytkownikowi wygenerowanie fiszek przy pomocy AI. Użytkownik wkleja tekst (1000-10000 znaków), a system generuje propozycje fiszek. Następnie użytkownik może przejrzeć, zaakceptować, edytować lub odrzucić poszczególne propozycje.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/generate`.

## 3. Struktura komponentów

- **GenerateFlashcardsPage** (strona główna widoku)
  - **TextInputArea** (duże pole tekstowe do wprowadzania tekstu wraz z informacjami o minimalnej i maksymalnej długości)
  - **GenerateButton** (przycisk uruchamiający generowanie fiszek)
  - **LoadingIndicator** (wskaźnik ładowania w formie skeletona)
  - **FlashcardsList** (lista wyświetlająca wygenerowane fiszki)
    - **FlashcardItem** (pojedynczy element listy z opcjami: Zaakceptuj, Edytuj, Odrzuć)
  - **AcceptAllButton** (przycisk do szybkiego zatwierdzenia wszystkich fiszek)
  - **ErrorMessage** (komponent do wyświetlania komunikatów błędów inline)

## 4. Szczegóły komponentów

### GenerateFlashcardsPage

- Opis: Główny kontener widoku, zarządza stanem całego widoku, komunikacją z API i przechowywaniem wyników.
- Główne elementy: pole tekstowe, przycisk generowania, wskaźnik ładowania, lista wyników, przycisk akceptacji wszystkich, strefa komunikatów błędów.
- Obsługiwane interakcje:
  - Wprowadzanie tekstu (onChange, onBlur – walidacja długości)
  - Kliknięcie przycisku "Generuj fiszki" (wywołanie API, ustawienie stanu ładowania)
  - Kliknięcie "Zaakceptuj wszystkie" (przekazanie wszystkich propozycji do API /flashcards)
- Walidacja:
  - Tekst musi mieć od 1000 do 10000 znaków
- Typy:
  - ViewModel zawierający:
    - inputText: string
    - isLoading: boolean
    - errorMessage: string | null
    - flashcardsProposals: Array<{ id: number, front: string, back: string, source: 'ai-full' }>
- Propsy: Brak (główny komponent strony)

### TextInputArea

- Opis: Duże pole tekstowe do wprowadzania tekstu źródłowego.
- Główne elementy: `<textarea>`, licznik znaków, komunikat o ograniczeniach.
- Obsługiwane interakcje: onChange (aktualizacja wartości, walidacja długości)
- Walidacja: Minimalna długość 1000, maksymalna 10000 znaków
- Typy: wartość input jako string
- Propsy:
  - value: string
  - onChange: (value: string) => void
  - error: string | null

### GenerateButton

- Opis: Przycisk inicjujący proces generacji fiszek.
- Główne elementy: `<button>` z tekstem "Generuj fiszki".
- Obsługiwane interakcje: onClick (uruchomienie fetch do endpointu `/generations`)
- Walidacja: Przycisk jest aktywny tylko gdy tekst jest prawidłowy.
- Typy: brak dodatkowych typów
- Propsy:
  - onClick: () => void
  - disabled: boolean

### LoadingIndicator

- Opis: Wizualny wskaźnik działania systemu podczas oczekiwania na odpowiedź API.
- Główne elementy: Komponent skeleton lub spinner.
- Obsługiwane interakcje: Brak interakcji
- Walidacja: Pokazywany gdy isLoading=true
- Typy: brak
- Propsy:
  - isVisible: boolean

### FlashcardsList

- Opis: Lista wyświetlająca wszystkie wygenerowane propozycje fiszek.
- Główne elementy: Lista komponentów FlashcardItem
- Obsługiwane interakcje: Renderowanie listy na podstawie danych
- Walidacja: Dane muszą pochodzić z prawidłowego API
- Typy: Oczekuje tablicę obiektów { id, front, back, source }
- Propsy:
  - proposals: Array<{ id: number, front: string, back: string, source: 'ai-full' }>
  - onAccept: (id: number) => void
  - onEdit: (id: number, newFront: string, newBack: string) => void
  - onReject: (id: number) => void

### FlashcardItem

- Opis: Pojedynczy element listy fiszek z opcjami decyzyjnymi.
- Główne elementy: Wyświetlenie przodu i tyłu fiszki, przyciski: "Zaakceptuj", "Edytuj", "Odrzuć".
- Obsługiwane interakcje: kliknięcia przycisków, obsługa trybu edycji
- Walidacja:
  - Przód: max 200 znaków
  - Tył: max 500 znaków
- Typy:
  - Obiekt: { id: number, front: string, back: string, source: 'ai-full', accepted: boolean, edited: boolean }
- Propsy:
  - flashcard: obiekt fiszki
  - onAccept: () => void
  - onEdit: (newFront: string, newBack: string) => void
  - onReject: () => void

### AcceptAllButton

- Opis: Przycisk akceptacji wszystkich wygenerowanych fiszek.
- Główne elementy: `<button>` z tekstem "Zaakceptuj wszystkie".
- Obsługiwane interakcje: onClick (zbiorcze zatwierdzenie wszystkich propozycji)
- Walidacja: Aktywny tylko gdy lista propozycji nie jest pusta
- Typy: brak
- Propsy:
  - onClick: () => void
  - disabled: boolean

### ErrorMessage

- Opis: Komponent wyświetlający komunikaty błędów inline.
- Główne elementy: Tekst komunikatu
- Obsługiwane interakcje: Brak
- Walidacja: Wyświetlany kiedy errorMessage !== null
- Typy: string
- Propsy:
  - message: string

## 5. Typy

- Nowe typy ViewModel:
  - `GenerateViewModel`: {
    inputText: string,
    isLoading: boolean,
    errorMessage: string | null,
    flashcardsProposals: Array<{ id: number, front: string, back: string, source: 'ai-full' }>
    }
- Wykorzystanie istniejących typów z `types.ts`:
  - `GenerateFlashcardsCommand` (do wywołania endpointu `/generations`),
  - `GenerateFlashcardsResponseDTO` (do odczytu danych z odpowiedzi).
  - `CreateFlashcardsCommand` do zapisu fiszek

## 6. Zarządzanie stanem

Widok użyje Reactowych hooków (`useState`, `useEffect`):

- Stan dla tekstu wejściowego (inputText).
- Stan dla flagi ładowania (isLoading).
- Stan dla błędów (errorMessage).
- Stan przechowujący otrzymane propozycje fiszek (flashcardsProposals).
  Opcjonalnie: customowy hook do obsługi logiki API (useGenerateFlashcards).

## 7. Integracja API

Integracja odbywa się poprzez wywołanie endpointu:

- **POST** `/generations` z ciałem żądania: { source_text: string, model: string } (model może być stałą lub wyborem użytkownika).
- Typ żądania: `GenerateFlashcardsCommand`.
- Odpowiedź otrzymana w formacie `GenerateFlashcardsResponseDTO` zawierająca generation_id oraz listę propozycji fiszek.
- Po zaakceptowaniu wybranych propozycji, należy wywołać endpoint **POST** `/flashcards` dla zapisu akceptowanych fiszek.

## 8. Interakcje użytkownika

- Wprowadzenie tekstu: Użytkownik wkleja lub wpisuje tekst w polu, a system na bieżąco waliduje jego długość.
- Kliknięcie przycisku "Generuj fiszki": System wysyła żądanie do API, wyświetla wskaźnik ładowania, blokuje interakcje.
- Po otrzymaniu odpowiedzi: Wyświetlenie listy wygenerowanych fiszek.
- Dla każdej fiszki: Użytkownik może kliknąć "Zaakceptuj" (dodaje fiszkę bez zmian), "Edytuj" (otwiera formularz edycji) lub "Odrzuć" (usuwa propozycję).
- Kliknięcie "Zaakceptuj wszystkie": Wszystkie propozycje zostają przesłane do API zapisu fiszek.

## 9. Warunki i walidacja

- Walidacja długości tekstu w polu: min 1000 i max 10000 znaków.
- Podczas edycji fiszki:
  - Przód nie przekracza 200 znaków.
  - Tył nie przekracza 500 znaków.
- Przycisk generowania jest aktywny tylko, gdy wejściowy tekst spełnia warunki.
- Walidacja odpowiedzi API: Sprawdzenie statusu 201/200, w razie błędu komunikat błędu inline.

## 10. Obsługa błędów

- Wyświetlanie komunikatów błędów inline przy nieprawidłowych danych wejściowych.
- Obsługa błędów sieciowych: wyświetlenie ogólnego komunikatu o błędzie w widoku.
- Logika try-catch w funkcji wywołującej API, ustawienie errorMessage.

## 11. Kroki implementacji

1. Utworzyć nową stronę pod ścieżką `/generate` (np. `src/pages/generate.astro`).
2. Zaimplementować komponent `GenerateFlashcardsPage` z zarządzaniem stanem.
3. Dodać komponent `TextInputArea` z walidacją długości tekstu.
4. Utworzyć `GenerateButton`, który wywoła funkcję wysyłającą żądanie do `/generations`.
5. Dodać komponent `LoadingIndicator` wyświetlany podczas oczekiwania na odpowiedź API.
6. Utworzyć komponent `FlashcardsList` wraz z `FlashcardItem` pokazującymi szczegóły fiszek i akcje (Zaakceptuj, Edytuj, Odrzuć).
7. Dodać `AcceptAllButton` dla zbiorczego zatwierdzania fiszek.
8. Zaimplementować funkcjonalność wywołania API z odpowiednią obsługą odpowiedzi i błędów.
9. Testować interakcje użytkownika (walidacja danych, ładowanie, akcje na fiszkach).
10. Dopracować UI pod kątem responsywności, dostępności i komunikatów błędów inline.
