/*
API Endpoint Implementation Plan: Create Flashcard(s)

## 1. Przegląd punktu końcowego
Endpoint umożliwia tworzenie jednej lub wielu fiszek. Obsługuje zarówno tworzenie ręczne, jak i generowanie fiszek przez AI. Dodatkowo, korzysta z mechanizmów zabezpieczeń Supabase, w tym RLS, oraz walidacji danych wejściowych przy użyciu Zod.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /flashcards
- Parametry:
  - Wymagane:
    - flashcards: tablica obiektów, gdzie każdy obiekt musi zawierać:
      - front: string (maksymalnie 200 znaków)
      - back: string (maksymalnie 500 znaków)
      - source: wartość "manual", "ai-full" lub "ai-edited"
  - Opcjonalne:
    - generation_id: liczba lub null, w zależności od źródła fiszki
- Request Body: JSON, np.:
  {
    "flashcards": [
      {
        "front": "Przykładowa treść przodu",
        "back": "Przykładowa treść tyłu",
        "source": "manual",
        "generation_id": null
      }
    ]
  }

## 3. Wykorzystywane typy
- Wejściowe DTO/Command:
  - CreateFlashcardsCommand (zawiera tablicę flashcards typu CreateFlashcardDTO)
  - CreateFlashcardDTO (pola: front, back, source, generation_id (opcjonalne))
- Wyjściowe DTO:
  - FlashcardDTO (pola: id, front, back, source, generation_id, created_at, updated_at)

## 4. Szczegóły odpowiedzi
- Sukces:
  - Kody: 201 Created
  - Body:
  {
    "flashcards": [
      {
        "id": 1,
        "front": "Przykładowa treść przodu",
        "back": "Przykładowa treść tyłu",
        "source": "manual",
        "generation_id": null,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
      }
    ]
  }
- Błędy:
  - 400 Bad Request dla nieprawidłowych danych wejściowych
  - 401 Unauthorized, jeśli użytkownik nie jest autoryzowany
  - 500 Internal Server Error dla błędów po stronie serwera

## 5. Przepływ danych
1. Klient wysyła żądanie do endpointu /flashcards zawierające dane fiszek.
2. Endpoint (Astro API route) waliduje dane wejściowe przy użyciu Zod.
3. Po pozytywnej walidacji dane są przekazywane do warstwy serwisowej odpowiedzialnej za logikę biznesową.
4. Usługa wykorzystuje klienta Supabase (pobrany z context.locals.supabase) do wykonania zbiorczego wstawienia danych do tabeli flashcards.
5. Baza danych, dzięki wyzwalaczom, automatycznie ustawia pola created_at i updated_at oraz stosuje polityki RLS.
6. Po udanym zapisie dane nowo utworzonych fiszek są zwracane do klienta w odpowiedzi JSON.

## 6. Względy bezpieczeństwa
- Autoryzacja i uwierzytelnianie: Wykorzystanie sesji Supabase i polityk RLS.
- Walidacja danych: Dane wejściowe walidowane przy użyciu Zod, weryfikacja ograniczeń długości oraz poprawności pól.
- Bezpieczeństwo bazy: Korzystanie ze zabezpieczonych zapytań Supabase minimalizujących ryzyko SQL Injection.

## 7. Obsługa błędów
- Walidacja wejścia: Zwracany jest kod 400 Bad Request przy nieprawidłowych danych.
- Autoryzacja: W przypadku braku autoryzacji zwracany jest kod 401 Unauthorized.
- Błędy serwera: W przypadku błędów wewnętrznych zwracany jest kod 500 Internal Server Error. Błędy są logowane.

## 8. Rozważania dotyczące wydajności
- Wsparcie operacji wsadowych: Umożliwia tworzenie wielu fiszek jednocześnie, co zmniejsza liczbę zapytań do bazy.
- Optymalizacja zapytań: Użycie zbiorczego wstawienia i wyzwalaczy w bazie danych usprawnia operację.
- Monitorowanie wydajności: Pomiar czasu operacji i ewentualne wdrożenie mechanizmów optymalizacyjnych.

## 9. Etapy wdrożenia
1. Implementacja walidacji wejściowych przy użyciu Zod (aktualizacja schematu CreateFlashcardsCommand).
2. Utworzenie endpointu w katalogu src/pages/api (np. flashcards.ts) z obsługą metody POST.
3. Integracja z Supabase: pobranie klienta z context.locals.supabase i wstawienie danych do tabeli flashcards z RLS.
4. Wyodrębnienie logiki biznesowej do serwisu operacji na fiszkach.
5. Implementacja mechanizmów przechwytywania błędów i ich logowanie.
*/ 