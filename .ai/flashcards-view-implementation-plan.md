# Plan implementacji widoku Fiszek

## 1. Przegląd
Widok fiszek to kluczowy element aplikacji umożliwiający użytkownikom zarządzanie swoimi fiszkami edukacyjnymi. Pozwala na przeglądanie, tworzenie, edycję i usuwanie fiszek, z uwzględnieniem operacji pojedynczych i zbiorczych. Widok zawiera zaawansowane funkcje zarządzania stanem, paginację oraz intuicyjny interfejs użytkownika.

## 2. Routing widoku
- Ścieżka: `/flashcards`
- Komponent strony: `src/pages/flashcards/index.astro`
- Wymagana autoryzacja: Tak

## 3. Struktura komponentów
```
FlashcardsPage (React)
├── PageHeader
│   ├── AddFlashcardButton
│   └── BulkActionsBar
├── FlashcardsList
│   ├── FlashcardItem[]
│   └── Pagination
├── FlashcardModal
└── DeleteConfirmationDialog
```

## 4. Szczegóły komponentów

### FlashcardsPage
- Opis komponentu: Główny kontener widoku, zarządza stanem i logiką biznesową
- Główne elementy: Header, lista fiszek, modalne okna
- Obsługiwane interakcje: Zarządzanie stanem globalnym, obsługa paginacji
- Obsługiwana walidacja: Sprawdzanie autoryzacji
- Typy: `FlashcardsPageProps`, `FlashcardsPageState`
- Propsy: `initialData?: ListFlashcardsResponseDTO`

### PageHeader
- Opis komponentu: Nagłówek strony z akcjami
- Główne elementy: Przycisk dodawania, pasek akcji zbiorczych
- Obsługiwane interakcje: Kliknięcia przycisków akcji
- Typy: `PageHeaderProps`
- Propsy: `onAddClick: () => void, selectedCount: number, onBulkDelete: () => void`

### FlashcardsList
- Opis komponentu: Lista fiszek z paginacją
- Główne elementy: Elementy fiszek, kontrolki paginacji
- Obsługiwane interakcje: Zaznaczanie fiszek, nawigacja paginacji
- Obsługiwana walidacja: Sprawdzanie limitów paginacji
- Typy: `FlashcardsListProps`, `FlashcardViewModel[]`
- Propsy: `flashcards: FlashcardViewModel[], pagination: PaginationDTO, onPageChange: (page: number) => void`

### FlashcardItem
- Opis komponentu: Pojedynczy element fiszki
- Główne elementy: Treść fiszki, przyciski akcji, checkbox
- Obsługiwane interakcje: Edycja, usuwanie, zaznaczanie
- Typy: `FlashcardItemProps`
- Propsy: `flashcard: FlashcardViewModel, onEdit: () => void, onDelete: () => void, onSelect: () => void`

### FlashcardModal
- Opis komponentu: Modal do tworzenia/edycji fiszki
- Główne elementy: Formularz, liczniki znaków, przyciski akcji
- Obsługiwane interakcje: Wprowadzanie tekstu, zapisywanie zmian
- Obsługiwana walidacja: Limity znaków (przód: 200, tył: 500)
- Typy: `FlashcardModalProps`, `FlashcardFormData`
- Propsy: `flashcard?: FlashcardDTO, onSave: (data: FlashcardFormData) => void, onClose: () => void`

### DeleteConfirmationDialog
- Opis komponentu: Dialog potwierdzenia usuwania
- Główne elementy: Komunikat, przyciski potwierdzenia
- Obsługiwane interakcje: Potwierdzenie/anulowanie
- Typy: `DeleteConfirmationDialogProps`
- Propsy: `isOpen: boolean, itemCount: number, onConfirm: () => void, onCancel: () => void`

## 5. Typy

```typescript
interface FlashcardViewModel extends FlashcardDTO {
  isSelected: boolean;
}

interface FlashcardsPageState {
  flashcards: FlashcardViewModel[];
  pagination: PaginationDTO;
  selectedIds: number[];
  isModalOpen: boolean;
  editingFlashcard: FlashcardViewModel | null;
  isDeleteDialogOpen: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface FlashcardFormData {
  front: string;
  back: string;
}

interface FlashcardValidationErrors {
  front?: string;
  back?: string;
}
```

## 6. Zarządzanie stanem

### useFlashcardsStore
Custom hook zarządzający stanem widoku:
```typescript
interface UseFlashcardsStore {
  state: FlashcardsPageState;
  actions: {
    loadFlashcards: (page: number) => Promise<void>;
    createFlashcard: (data: FlashcardFormData) => Promise<void>;
    updateFlashcard: (id: number, data: FlashcardFormData) => Promise<void>;
    deleteFlashcards: (ids: number[]) => Promise<void>;
    toggleSelection: (id: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
  };
}
```

## 7. Integracja API

### Endpoints
- GET `/flashcards` - pobieranie listy
- POST `/flashcards` - tworzenie
- PUT `/flashcards/:id` - aktualizacja
- DELETE `/flashcards` - usuwanie (pojedyncze/zbiorcze)

### Obsługa żądań
- Wykorzystanie klienta HTTP z interceptorami dla autoryzacji
- Mapowanie odpowiedzi na typy ViewModel
- Obsługa błędów i ponownych prób
- Optymistyczne aktualizacje UI

## 8. Interakcje użytkownika

### Tworzenie fiszki
1. Kliknięcie "Dodaj fiszkę"
2. Wypełnienie formularza
3. Walidacja w locie
4. Zapisanie/Anulowanie

### Edycja fiszki
1. Kliknięcie "Edytuj"
2. Modyfikacja w modalu
3. Walidacja w locie
4. Zapisanie/Anulowanie

### Usuwanie fiszek
1. Wybór pojedynczej/wielu fiszek
2. Kliknięcie "Usuń"
3. Potwierdzenie
4. Wykonanie operacji

### Paginacja
1. Nawigacja między stronami
2. Automatyczne odświeżanie listy
3. Zachowanie stanu selekcji

## 9. Warunki i walidacja

### Walidacja formularza
- Przód: wymagane, max 200 znaków
- Tył: wymagane, max 500 znaków
- Walidacja w locie podczas wpisywania
- Blokada przycisku zapisu przy błędach

### Walidacja operacji
- Sprawdzanie autoryzacji
- Weryfikacja uprawnień do edycji/usuwania
- Walidacja parametrów paginacji

## 10. Obsługa błędów

### Typy błędów
- Błędy autoryzacji (401)
- Błędy walidacji (400)
- Błędy serwera (500)
- Błędy sieci
- Błędy konkurencyjnej modyfikacji

### Strategia obsługi
- Wyświetlanie komunikatów użytkownikowi
- Automatyczne ponowne próby dla błędów sieciowych
- Obsługa błędów konkurencyjności
- Fallback UI dla krytycznych błędów

## 11. Kroki implementacji

1. Konfiguracja routingu i podstawowej struktury
   - Utworzenie strony Astro
   - Konfiguracja autoryzacji
   - Podstawowy layout

2. Implementacja komponentów React
   - FlashcardsPage
   - PageHeader
   - FlashcardsList
   - FlashcardItem
   - FlashcardModal
   - DeleteConfirmationDialog

3. Implementacja zarządzania stanem
   - useFlashcardsStore
   - Integracja z komponentami
   - Obsługa paginacji

4. Integracja z API
   - Klient HTTP
   - Interceptory
   - Mapowanie typów

5. Implementacja formularzy
   - Walidacja
   - Obsługa błędów
   - Liczniki znaków

6. Implementacja operacji zbiorczych
   - Logika zaznaczania
   - Akcje zbiorcze
   - Potwierdzenia

7. Implementacja obsługi błędów
   - Komunikaty
   - Fallback UI
   - Retry logic

8. Optymalizacja wydajności
   - Memoizacja
   - Lazy loading
   - Optymistyczne aktualizacje

9. Testy
   - Komponenty
   - Integracja
   - E2E

10. Finalizacja
    - Code review
    - Dokumentacja
    - Optymalizacja dostępności 