/*
API Endpoint Implementation Plan: Generate Flashcards via AI

## 1. Przegląd punktu końcowego
Endpoint ma na celu przyjmowanie długiego tekstu źródłowego i generowanie propozycji fiszek przy użyciu serwisu AI. Podczas wywołania tworzony jest rekord generacji w bazie danych, a wygenerowane fiszki są  zwracane jako propozycje. 

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /generations
- Parametry:
  - Wymagane: 
    - source_text: string (1000-10000 znaków)
- Request Body: JSON, np.:
  {
    "source_text": "..."
  }

## 3. Wykorzystywane typy
- DTO:
  - GenerateFlashcardsResponseDTO
  - AIFlashcardProposalDTO
  - GenerationDTO
- Command Model:
  - GenerateFlashcardsCommand

## 4. Szczegóły odpowiedzi
- Sukces: 
  - Kody: 200 OK lub 201 Created
  - Body:
    {
      "generation_id": number,
      "flashcardsProposals": [
         { "front": "string", "back": "string", "source": "ai-full" }
      ],
      "generatedCount": number
    }
- Błędy:
  - 400 Bad Request dla nieprawidłowych danych wejściowych
  - 500 Internal Server Error dla błędów wewnętrznych (logowane w tabeli generation_error_logs)

## 5. Przepływ danych
1. Walidacja danych wejściowych przy użyciu Zod (sprawdzenie długości source_text oraz obecności modelu)
2. Autentykacja użytkownika poprzez kontekst Supabase (context.locals)
3. Utworzenie rekordu w tabeli generations z odpowiednimi danymi (w tym model, source_text_hash, długość tekstu, itp.)
4. Wywołanie usługi AI do generowania fiszek
5. Przetworzenie zwróconych propozycji fiszek
6. Zwrócenie odpowiedzi zawierającej generation_id, listę propozycji fiszek oraz liczbę wygenerowanych wyników

## 6. Względy bezpieczeństwa
- Autentykacja i autoryzacja: Użycie sesji Supabase; walidacja tokena i zastosowanie RLS
- Walidacja danych: Sprawdzenie poprawności i długości inputów
- Sanitizacja danych wejściowych, aby zapobiec atakom SQL injection

## 7. Obsługa błędów
- Walidacja danych wejściowych: Zwracanie 400 Bad Request przy błędach walidacji
- Błędy podczas operacji na bazie danych lub wywołania serwisu AI: Zwracanie 500 Internal Server Error
- Logowanie błędów w tabeli generation_error_logs z odpowiednimi informacjami, takimi jak error_code i error_message

## 8. Rozważania dotyczące wydajności
- Timeout dla wywołania AI- 60 sekund
- Użycie indeksów w tabelach (np. kolumny user_id, generation_id) dla szybkich operacji
- Optymalizacja zapytań do bazy danych
- Ewentualne ograniczenia i rate limiting przy wywołaniu usługi AI

## 9. Etapy wdrożenia
1. Implementacja walidacji wejściowych z użyciem Zod oraz rozszerzenie schematu GenerateFlashcardsCommand o pole "model".
2. Utworzenie endpointu w katalogu src/pages/api za pomocą Astro (serwerowy endpoint) z ustawieniem export const prerender = false.
3. Uwierzytelnienie użytkownika przy użyciu kontekstu Supabase (context.locals) i sprawdzenie RLS.
4. Utworzenie nowego rekordu w tabeli generations z wymaganymi danymi.
5. Wywołanie serwisu AI w celu generowania fiszek (integracja z Openrouter.ai lub innym dostawcą).
6. Przetworzenie odpowiedzi serwisu AI i utworzenie propozycji fiszek (AIFlashcardProposalDTO).
7. Opcjonalne zapisanie wygenerowanych fiszek w bazie danych (tabela flashcards) lub zwrócenie ich w odpowiedzi.
*/ 