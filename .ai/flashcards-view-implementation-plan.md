# API Endpoint Implementation Plan: Flashcards REST API

## 1. Przegląd punktu końcowego
Zestaw endpointów REST API do zarządzania fiszkami użytkownika, obejmujący operacje CRUD (Create, Read, Update, Delete). Endpointy zapewniają paginację, sortowanie i filtrowanie listy fiszek oraz operacje na pojedynczych i wielu fiszkach jednocześnie.

## 2. Szczegóły żądania

### List Flashcards (GET /flashcards)
- Query Parameters:
  - `page`: number (default: 1)
  - `limit`: number (default: 10)

### Get Flashcard (GET /flashcards/:id)
- Path Parameters:
  - `id`: number (required)

### Update Flashcard (PUT /flashcards/:id)
- Path Parameters:
  - `id`: number (required)
- Request Body:
  ```typescript
  {
    front: string; // max 200 chars
    back: string;  // max 500 chars
  }
  ```

### Delete Flashcard (DELETE /flashcards/:id)
- Path Parameters:
  - `id`: number (required)

### Bulk Delete Flashcards (DELETE /flashcards)
- Request Body:
  ```typescript
  {
    ids: number[];
  }
  ```

## 3. Wykorzystywane typy

```typescript
// Existing types from types.ts
import {
  FlashcardDTO,
  PaginationDTO,
  ListFlashcardsResponseDTO,
  UpdateFlashcardCommand,
  BulkDeleteFlashcardsCommand,
  MessageResponseDTO
} from '../types';

// New types to be added
interface FlashcardsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// Zod schemas for validation
const flashcardsQuerySchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

const updateFlashcardSchema = z.object({
  front: z.string().max(200),
  back: z.string().max(500)
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.number()).min(1)
});
```

## 4. Przepływ danych

### Service Layer (src/lib/services/flashcard.service.ts)
```typescript
export class FlashcardService {
  constructor(private supabase: SupabaseClient) {}

  async listFlashcards(params: FlashcardsQueryParams): Promise<ListFlashcardsResponseDTO>;
  async getFlashcardById(id: number): Promise<FlashcardDTO>;
  async updateFlashcard(id: number, data: UpdateFlashcardCommand): Promise<void>;
  async deleteFlashcard(id: number): Promise<void>;
  async bulkDeleteFlashcards(ids: number[]): Promise<void>;
}
```

### Route Handlers (src/pages/api/flashcards/[...].ts)
1. Walidacja danych wejściowych (Zod)
2. Wywołanie odpowiedniej metody serwisu
3. Obsługa błędów
4. Zwrócenie odpowiedzi

## 5. Względy bezpieczeństwa

1. Autentykacja
   - Wykorzystanie middleware Supabase do weryfikacji tokenu JWT
   - Dostęp tylko dla zalogowanych użytkowników

2. Autoryzacja
   - RLS policies na poziomie bazy danych
   - Weryfikacja właściciela fiszki przed modyfikacją

3. Walidacja danych
   - Sanityzacja danych wejściowych
   - Walidacja długości pól
   - Walidacja typów danych
   - Walidacja parametrów paginacji

4. Rate Limiting
   - Implementacja limitu requestów na endpoint
   - Osobne limity dla różnych operacji

## 6. Obsługa błędów

### Kody błędów
- 400 Bad Request
  - Nieprawidłowe parametry paginacji
  - Nieprawidłowa długość pól
  - Nieprawidłowy format ID
  - Pusta lista ID przy bulk delete
- 401 Unauthorized
  - Brak tokenu JWT
  - Nieważny token
- 404 Not Found
  - Fiszka o podanym ID nie istnieje
- 500 Internal Server Error
  - Błędy bazy danych
  - Nieoczekiwane błędy serwera

### Format odpowiedzi błędów
```typescript
interface ErrorResponse {
  message: string;
  details?: Record<string, string[]>;
}
```

## 7. Etapy wdrożenia

1. Przygotowanie struktury
   ```
   src/
     lib/
       services/
         flashcard.service.ts
       schemas/
         flashcard.schema.ts
     pages/
       api/
         flashcards/
           index.ts        # GET (list), DELETE (bulk)
           [id].ts         # GET, PUT, DELETE
   ```

2. Implementacja walidacji
   - Utworzenie schematów Zod
   - Implementacja middleware walidacyjnego

3. Implementacja serwisu
   - Metody CRUD
   - Obsługa paginacji
   - Obsługa sortowania i filtrowania

4. Implementacja endpointów
   - Route handlers
   - Integracja z serwisem
   - Obsługa błędów
