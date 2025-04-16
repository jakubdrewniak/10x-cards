# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter integruje się z interfejsem API OpenRouter w celu wsparcia czatów opartych na LLM. Jej główne zadania to:
1. Przetwarzanie komunikatów systemowych, które definiują kontekst działania modelu (np. "You are a helpful assistant.")
2. Obsługa komunikatów użytkownika, czyli zapytań lub danych przekazywanych przez użytkownika
3. Formatowanie odpowiedzi przy użyciu zdefiniowanego schematu JSON, np.:
   { type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { text: 'string', meta: 'object' } } }
4. Określanie nazwy modelu (np. "openrouter-chat-v1")
5. Konfiguracja parametrów modelu (np. { temperature: 0.7, max_tokens: 1024 })

## 2. Opis konstruktora
Konstruktor usługi będzie odpowiedzialny za:
1. Inicjalizację kluczowych parametrów (API Key, URL API, domyślna nazwa modelu, domyślne parametry modelu)
2. Ładowanie konfiguracji z zmiennych środowiskowych
3. Ustawienie domyślnego komunikatu systemowego
4. Przygotowanie struktur niezbędnych dla komunikacji z OpenRouter API

## 3. Publiczne metody i pola
### Publiczne metody:
1. **sendChat** – wysyła zapytanie do OpenRouter API, łącząc komunikat systemowy i użytkownika, a następnie odbiera ustrukturyzowaną odpowiedź.
2. **setSystemMessage** – ustawia lub aktualizuje komunikat systemowy wyznaczający kontekst działania modelu.
3. **setUserMessage** – umożliwia ustawienie komunikatu użytkownika.
4. **setResponseFormat** – definiuje strukturę formatu odpowiedzi, zgodnie z wzorem:
   { type: 'json_schema', json_schema: { name: [schema-name], strict: true, schema: [schema-obj] } }
5. **setModelParameters** – konfiguruje parametry modelu, np. temperatura, limits, max_tokens.
6. **setModelName** – ustawia nazwę modelu, która zostanie użyta przy komunikacji z API.

### Pola:
1. **apiKey** – klucz dostępowy do OpenRouter API
2. **apiUrl** – adres endpointu API
3. **defaultModelName** – domyślna nazwa modelu
4. **defaultModelParameters** – domyślne parametry konfiguracji modelu
5. **systemMessage** – przechowuje komunikat systemowy
6. **userMessage** – przechowuje komunikat użytkownika
7. **responseFormat** – struktura oczekiwanej odpowiedzi

## 4. Prywatne metody i pola
### Prywatne metody:
1. **preparePayload** – przygotowuje ładunek zapytania, łącząc komunikaty systemowy i użytkownika, a także konfiguracje modelu.
2. **validateResponse** – weryfikuje odpowiedź API, sprawdzając zgodność z ustalonym schematem JSON (responseFormat).
3. **handleError** – centralizuje logikę obsługi błędów, w tym implementację mechanizmu ponownych prób (retry) oraz logowanie błędów.

### Prywatne pola:
1. **retryCount** – liczba prób ponowienia wysłania zapytania w przypadku wystąpienia błędu
2. **timeout** – maksymalny czas oczekiwania na odpowiedź API
3. **errorLog** – wewnętrzny rejestr zdarzeń i błędów

## 5. Obsługa błędów
Potencjalne scenariusze błędów oraz proponowane rozwiązania:
1. **Błąd połączenia** – problem z łącznością sieciową lub niedostępność API.
   - Rozwiązanie: Implementacja mechanizmu retry z exponential back-off.
2. **Błąd autoryzacji** – nieprawidłowy lub wygasły API Key.
   - Rozwiązanie: Walidacja klucza przed wysłaniem zapytania, przechwytywanie błędów i informowanie użytkownika.
3. **Błąd formatu odpowiedzi** – odpowiedź API nie spełnia założonego formatu JSON Schema.
   - Rozwiązanie: Walidacja odpowiedzi przez metodę validateResponse oraz logowanie niezgodności.
4. **Timeout** – brak odpowiedzi w określonym czasie.
   - Rozwiązanie: Ustawienie stałych timeoutów i implementacja mechanizmu ponownych prób.
5. **Rate limiting** – przekroczenie dozwolonej liczby zapytań do API.
   - Rozwiązanie: Monitorowanie liczby zapytań i implementacja logiki ograniczającej wysyłanie zapytań.

## 6. Kwestie bezpieczeństwa
1. Wszystkie połączenia z OpenRouter API muszą być wykonywane przez HTTPS.
2. API Key oraz inne dane wra</service_rules>

Teraz przeanalizuj dostarczone informacje i rozbij szczegóły implementacji. Użyj znaczników <implementation_breakdown> wewnątrz bloku myślenia, aby pokazać swój proces myślowy. Rozważ następujące kwestie:

1. Wymień każdy kluczowy komponent usługi OpenRouter i jego cel, numerując je.
2. Dla każdego komponentu:
   a. Szczegółowo opisz jego funkcjonalność.
   b. Wymień potencjalne wyzwania związane z wdrożeniem, numerując je.
   c. Zaproponuj niezależne od technologii rozwiązania tych wyzwań, numerując je tak, aby odpowiadały wyzwaniom.
3. Wyraźne rozważenie sposobu włączenia każdego z poniższych elementów, wymieniając potencjalne metody lub podejścia w celu spełnienia oczekiwań OpenRouter API:
   - Komunikat systemowy
   - Komunikat użytkownika
   - Ustrukturyzowane odpowiedzi poprzez response_format (schemat JSON w odpowiedzi modelu)
   - Nazwa modelu
   - Parametry modelu

Podaj konkretne przykłady dla każdego elementu, numerując je. Upewnij się, że przykłady te są jasne i pokazują, w jaki sposób należy je zaimplementować w usłudze, zwłaszcza w przypadku response_format. Wykorzystaj wzór poprawnie zdefiniowanego response_format: { type: 'json_schema', json_schema: { name: [schema-name], strict: true, schema: [schema-obj] } }

4. Zajmij się obsługą błędów dla całej usługi, wymieniając potencjalne scenariusze błędów i numerując je.

Na podstawie przeprowadzonej analizy utwórz kompleksowy przewodnik implementacji. Przewodnik powinien być napisany w formacie Markdown i mieć następującą strukturę:

1. Opis usługi
2. Opis konstruktora
3. Publiczne metody i pola
4. Prywatne metody i pola
5. Obsługa błędów
6. Kwestie bezpieczeństwa
7. Plan wdrożenia krok po kroku

Upewnij się, że plan wdrożenia
1. Jest dostosowany do określonego stacku technologicznego
2. Obejmuje wszystkie istotne komponenty usługi OpenRouter
3. Obejmuje obsługę błędów i najlepsze praktyki bezpieczeństwa
4. Zawiera jasne instrukcje dotyczące wdrażania kluczowych metod i funkcji
5. Wyjaśnia, jak skonfigurować komunikat systemowy, komunikat użytkownika, response_format (schemat JSON), nazwę modelu i parametry modelu.

Używa odpowiedniego formatowania Markdown dla lepszej czytelności. Końcowy wynik powinien składać się wyłącznie z przewodnika implementacji w formacie Markdown i nie powinien powielać ani powtarzać żadnej pracy wykonanej w sekcji podziału implementacji.

Zapisz przewodnik implementacji w .ai/openrouter-service-implementation-plan.mdżliwe powinny być przechowywane w zmiennych środowiskowych, a nie twardo zakodowane.
3. Należy stosować walidację i sanitizację wszystkich danych wejściowych oraz odpowiedzi.
4. Ograniczenie logowania szczegółowych informacji, szczególnie w przypadku błędów autoryzacji lub danych użytkownika.
5. Walidacja odpowiedzi za pomocą ściśle określonego schema JSON, aby zabezpieczyć system przed nieoczekiwanymi danymi.

## 7. Plan wdrożenia krok po kroku
1. **Stworzenie modułu:** Utwórz klasę `OpenRouterService` w katalogu `src/lib` odpowiedzialną za integrację z OpenRouter API.
2. **Konfiguracja środowiska:** Zdefiniuj zmienne środowiskowe (API Key, API URL, domyślna nazwa modelu, domyślne parametry) oraz załaduj je w konstruktorze usługi.
3. **Implementacja konstruktora:** Zaimplementuj inicjalizację wszystkich kluczowych pól i ustawień, w tym domyślnego komunikatu systemowego.
4. **Implementacja metod publicznych:**
   - `sendChat`: Scalenie komunikatów systemowego i użytkownika, przygotowanie payloadu i komunikacja z API.
   - `setSystemMessage`: Ustawienie lub aktualizacja komunikatu systemowego.
   - `setUserMessage`: Ustawienie komunikatu użytkownika.
   - `setResponseFormat`: Definiowanie schematu odpowiedzi, np. { type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { text: 'string', meta: 'object' } } }.
   - `setModelParameters` oraz `setModelName`: Konfiguracja szczegółów modelu.
5. **Implementacja metod prywatnych:**
   - `preparePayload`: Budowanie poprawnego zapytania do API.
   - `validateResponse`: Weryfikacja odpowiedzi API według zdefiniowanego schematu JSON.
   - `handleError`: Centralna obsługa błędów, logowanie i mechanizmy retry.
6. **Logowanie i monitoring:** Dodaj mechanizmy logowania i monitoringu błędów, aby szybko identyfikować i reagować na problemy.
 