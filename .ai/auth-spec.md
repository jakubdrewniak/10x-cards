# Specyfikacja systemu autentykacji

## 1. Architektura Interfejsu Użytkownika

### 1.1. Struktura widoków i komponentów

- W oparciu o Astro, widoki rejestracji, logowania i odzyskiwania hasła znajdują się w katalogu `src/pages`. Nowe strony (np. `/register`, `/login`, `/password-reset`) zostaną dodane do tego katalogu.
- Layouty dla zalogowanych i niezalogowanych userów są te same, po prostu dla niezalogowanych użytkowników część elementów nie będzie widoczna.
- Interaktywne formularze (rejestracja, logowanie, odzyskiwanie hasła) będą implementowane jako komponenty React umieszczone w `src/components` lub `src/components/ui`, w zależności od koniecznej interaktywności.

### 1.2. Podział logiki między Astro a React

- Strony Astro odpowiadają za statyczne renderowanie strony oraz integrację z backendem (np. pobieranie danych sesji, wykrywanie stanu autoryzacji), a interaktywne komponenty React zajmują się logiką formularzy, walidacją na żywo i obsługą komunikacji asynchronicznej z API.
- Formularze rejestracji, logowania i odzyskiwania hasła wykonują podstawową walidację (np. sprawdzanie formatu email, porównanie hasła i potwierdzenia) zanim prześlą dane do backendu.
- Komunikaty błędów są wyświetlane natychmiast po wykryciu błędnych danych zarówno na poziomie klienta (client-side validation), jak i po otrzymaniu odpowiedzi z API (server-side validation).

### 1.3. Walidacja i obsługa błędów

- Klient-side: Komponenty React dokonują wstępnej walidacji pól (np. imię, email, hasło, potwierdzenie hasła) i pokazują komunikaty takie jak "Błędny format adresu email" lub "Hasła nie są zgodne".
- Server-side: Endpointy API dodatkowo walidują dane wejściowe, a w przypadku wykrycia błędu zwracają zunifikowany format odpowiedzi z informacją o błędzie.
- Użytkownik otrzymuje spójny feedback, zarówno w przypadku błędów walidacyjnych, jak i problemów związanych z operacjami na koncie (np. już zarejestrowany email czy niepoprawne dane logowania).

### 1.4. Przypadki użycia

- **Rejestracja:** Użytkownik wypełnia formularz (imię, email, hasło, potwierdzenie hasła). Po przejściu walidacji dane są wysyłane do `/api/auth/register`. W przypadku sukcesu Supabase tworzy konto, a system automatycznie loguje użytkownika i przekierowuje do części chronionej aplikacji.
- **Logowanie:** Użytkownik wpisuje email i hasło w formularzu, który komunikuje się z endpointem `/api/auth/login`. Przy poprawnych danych następuje utworzenie sesji i przekierowanie na stronę chronioną.
- **Odzyskiwanie hasła:** Użytkownik klika link "Zapomniałem hasła". Formularz w `/password-reset` umożliwia wpisanie adresu email. Po wysłaniu danych, API wywołuje mechanizm wysłania e-maila resetującego hasło. Użytkownik otrzymuje link umożliwiający ustawienie nowego hasła (opcjonalny endpoint `/api/auth/reset-password`).

## 2. Logika Backendowa

### 2.1. Struktura endpointów API

- Endpointy zostaną umieszczone w katalogu `src/pages/api/auth`:
  - `/api/auth/register` – rejestracja użytkownika.
  - `/api/auth/login` – logowanie użytkownika.
  - `/api/auth/logout` – wylogowywanie użytkownika.
  - `/api/auth/password-reset` – inicjowanie procedury odzyskiwania hasła (wysyłka emaila resetującego).

### 2.2. Modele danych

- Wspólny model użytkownika umieszczony w `src/types.ts` lub w dedykowanym module:
  - `id`, `imię`, `email`, `hashedPassword`, `emailVerified`.
- DTO (Data Transfer Object) definiujące strukturę danych wejściowych przy rejestracji, logowaniu i odzyskiwaniu hasła, stosowane przez walidatory.

### 2.3. Walidacja danych wejściowych i obsługa wyjątków

- Wszystkie endpointy wykonują walidację (np. poprawność formatu email, długość hasła min. 8 znaków, zgodność pól hasło/potwierdzenie hasła).
- Middleware lub helpery w `src/lib` służą do jednolitej obsługi błędów oraz logowania wyjątków.
- W razie wystąpienia błędów (zarówno walidacyjnych, jak i wewnętrznych), odpowiedzi API zawierają spójną strukturę komunikatów błędów.

### 2.4. Aktualizacja renderowania stron server-side

- W konfiguracji Astro (`astro.config.mjs`) dołączone zostaną ustawienia middleware, które przed renderowaniem stron chronionych sprawdzają stan sesji użytkownika.
- Strony chronione będą renderowane po weryfikacji autentykacji, w przeciwnym przypadku użytkownik zostanie przekierowany na stronę logowania.

## 3. System Autentykacji

### 3.1. Integracja z Supabase Auth

- Wykorzystamy Supabase Auth do obsługi rejestracji, logowania, wylogowywania oraz odzyskiwania hasła. Klient Supabase zostanie zaimplementowany w `src/db/supabaseClient.ts`.
- API Supabase będzie odpowiedzialne za:
  - Tworzenie użytkowników wraz z walidacją email oraz wysyłką emaila weryfikacyjnego (w zależności od konfiguracji).
  - Weryfikację danych logowania i tworzenie sesji przy pomocy tokenów.
  - Obsługę mechanizmu resetu hasła poprzez wysyłanie emaili resetujących.

### 3.2. Mechanizm obsługi sesji

- Po udanym logowaniu, sesja jest przechowywana po stronie klienta (np. poprzez ciasteczka lub local storage) oraz weryfikowana przez backend przy każdym żądaniu do zasobów chronionych.
- Middleware w Astro sprawdza stan sesji i w razie jej braku lub wygaszenia przekierowuje użytkownika na stronę logowania.

### 3.3. Bezpieczeństwo

- Wszystkie operacje autentykacyjne będą realizowane przy użyciu bezpiecznych połączeń (HTTPS) oraz z uwzględnieniem tokenów anty-CSRF.
- Wrażliwe dane (np. hasła) są przesyłane w postaci zaszyfrowanej, a przed zapisaniem są haszowane.
- Proces resetowania hasła obejmuje weryfikację za pomocą tokenu resetującego o ograniczonej ważności.

## Podsumowanie

Specyfikacja opisuje integrację frontendu z modułem autentykacji opartym na Astro i React, z wyraźnym rozdzieleniem logiki prezentacji (Astro) oraz interakcji (React). Backend API został zaprojektowany w sposób modułowy, z jednolitą walidacją danych wejściowych oraz obsługą wyjątków, co zapewnia spójność i bezpieczeństwo działania systemu. Kluczowym elementem jest integracja z Supabase Auth, która umożliwia realizację rejestracji, logowania, wylogowywania oraz procedury odzyskiwania hasła w sposób zgodny z istniejącą architekturą aplikacji.
