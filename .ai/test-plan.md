# Plan Testów

## 1. Wprowadzenie
- **Cel planu testów:**  
  Zapewnienie wysokiej jakości aplikacji przez kompleksowe przetestowanie kluczowych funkcji, komponentów interfejsu, integracji między frontendem a backendem oraz poprawności działania logiki biznesowej.

- **Zakres testów:**  
  - Testy jednostkowe (funkcje, metody, komponenty React)  
  - Testy integracyjne (weryfikacja współdziałania komponentów, API, middleware i modułów logiki biznesowej)  
  - Testy systemowe/end-to-end (sprawdzenie pełnego przepływu użytkownika, interakcji z bazą danych Supabase, renderowania stron)  
  - Testy regresji (automatyzacja powtórnych testów po wprowadzonych zmianach)  
  - Testy manualne w obszarach wymagających weryfikacji wizualnej lub nieujętych w automatyce

## 2. Strategia testowania
- **Typy testów do przeprowadzenia:**
  - **Testy jednostkowe:**  
    Skoncentrowane na pojedynczych funkcjach i komponentach, głównie w obrębie logiki aplikacji, komponentów React oraz helperów i serwisów.
    
  - **Testy integracyjne:**  
    Weryfikacja komunikacji między front-endem (Astro, React, Tailwind, Shadcn/ui) a backendem (API, Supabase, middleware).
    
  - **Testy end-to-end:**  
    Automatyczne symulacje przepływu użytkownika przy użyciu Playwright, sprawdzające pełną ścieżkę od renderowania strony, poprzez interakcję, aż do komunikacji z bazą danych.
    
  - **Testy manualne:**  
    Kontrola UI, responsywności oraz testy wizualne komponentów Shadcn/ui i stylów Tailwind.

  - **Testy wizualne komponentów:**
    Weryfikacja komponentów UI za pomocą Storybook, zapewniająca spójność wizualną i dokumentację komponentów.

- **Priorytety testowania:**
  - **Najwyższy priorytet:**  
    Testowanie krytycznych punktów systemu, tj. API endpoints, middleware i integracja z Supabase.
    
  - **Średni priorytet:**  
    Testowanie komponentów interfejsu użytkownika (Astro/React) oraz logiki aplikacji w helperach i serwisach.
    
  - **Niższy priorytet:**  
    Testy niefunkcjonalne, takie jak testy wizualne responsywności i zgodności stylów.

- **Narzędzia i technologie:**
  - **Frameworki testowe:** 
    - Vitest (jako główny framework dla testów jednostkowych i integracyjnych)
    - React Testing Library (dla komponentów React)
    - Testing Library dla Astro (dla komponentów Astro)
    - Playwright Test (dla zaawansowanych testów integracyjnych)
  - **Testy end-to-end:** Playwright
  - **Testy wizualne:** Storybook
  - **Testy statyczne:** ESLint, TypeScript, Prettier
  - **Testy wydajnościowe:** Lighthouse CI
  - **Narzędzia do raportowania błędów:** Jira, GitHub Issues
  - **CI/CD:** GitHub Actions

## 3. Środowisko testowe
- **Wymagania sprzętowe i programowe:**
  - Komputery/serwery z systemami kompatybilnymi z Node.js oraz przeglądarkami wspierającymi nowoczesne technologie webowe
  - Zainstalowany Node.js w odpowiedniej wersji (zgodne z wymaganiami projektu)
  - Dostęp do testowej instancji Supabase oraz ewentualnych serwerów API

- **Konfiguracja środowiska:**
  - Oddzielne środowisko testowe (sandbox) dla API, aby nie zakłócać produkcyjnych danych
  - Konfiguracja GitHub Actions uruchamiająca automatyczne testy przy każdym commicie lub pull requeście
  - Symulacja middleware i środowisk lokalnych w celu pełnej weryfikacji przepływu żądań

## 4. Przypadki testowe
- **Renderowanie stron i routing:**  
  Sprawdzenie, czy wszystkie strony generowane przez Astro renderują się poprawnie i czy routing działa zgodnie z oczekiwaniami.

- **Testy komponentów React i Astro:**  
  Weryfikacja działania interaktywnych elementów, wywołań eventów oraz zarządzania stanem komponentów, szczególnie tych opartych na Shadcn/ui.

- **API i komunikacja z Supabase:**  
  Testy integracyjne sprawdzające:
  - Poprawność działania endpointów API w katalogu `src/pages/api`
  - Bezpieczną i spójną komunikację z bazą danych Supabase
  - Obsługę błędów i walidację danych wejściowych

- **Middleware:**  
  Testy poprawności działania logiki w `./src/middleware/index.ts` oraz mechanizmu obsługi żądań w celu zapewnienia odpowiedniego bezpieczeństwa i routingu.

- **Testy UI i responsywności:**  
  Sprawdzenie, czy komponenty UI tworzone za pomocą Tailwind oraz Shadcn/ui odpowiadają projektowi graficznemu i działają poprawnie na różnych rozdzielczościach.

- **Testy helperów i modułów logiki biznesowej:**  
  Zapewnienie, że funkcje umieszczone w `./src/lib` oraz logika bazowa w `./src/db` i innych modułach działają zgodnie z zamierzeniami.

- **Testy wydajnościowe:**
  Weryfikacja wydajności frontendu z wykorzystaniem Lighthouse CI, sprawdzająca czas ładowania, dostępność i inne metryki wydajnościowe.

## 5. Harmonogram testów
- **Faza przygotowawcza:**  
  - Analiza kodu i konfiguracja środowiska testowego (1-2 dni)
  
- **Testy jednostkowe i integracyjne:**  
  - Opracowanie i uruchomienie automatycznych testów (3-5 dni)
  
- **Testy end-to-end:**  
  - Pisanie scenariuszy testowych oraz konfiguracja Playwright (3 dni)
  
- **Testy wizualne i dokumentacja komponentów:**
  - Konfiguracja Storybook i tworzenie dokumentacji komponentów (2 dni)
  
- **Testy manualne:**  
  - Weryfikacja interfejsu oraz przypadki brzegowe (2 dni)
  
- **Testy wydajnościowe:**
  - Konfiguracja i uruchomienie Lighthouse CI (1 dzień)
  
- **Faza przeglądu i raportowania:**  
  - Analiza wyników, raportowanie wykrytych błędów, rewizja testów w razie potrzeby (1-2 dni)

## 6. Raportowanie i śledzenie błędów
- **Proces raportowania błędów:**  
  - Automatyczne generowanie raportów przez GitHub Actions
  - Ręczne zgłaszanie błędów przez testerów w systemie do śledzenia błędów (np. Jira)
  - Codzienne/okresowe spotkania w celu omówienia statusu testów i znalezionych problemów

- **Narzędzia do śledzenia błędów:**  
  - Jira, GitHub Issues lub inny wybrany system do zarządzania problemami
  - Dashboardy do monitorowania pokrycia testowego i statusu testów

## 7. Kryteria akceptacji i zakończenia testów
- Minimalne pokrycie kodu testami (np. 80% pokrycia automatycznymi testami)
- Wszystkie krytyczne i blokujące błędy muszą być usunięte przed wdrożeniem
- Pozytywne przejście testów end-to-end i akceptacja wyników przez zespół QA oraz developerków
- Finalna weryfikacja jakości przez managera QA
- Wszystkie komponenty Shadcn/ui muszą być udokumentowane w Storybook

## 8. Role i odpowiedzialności w procesie testowania
- **Tester QA:**  
  Planowanie i wykonanie testów, raportowanie błędów, dokumentacja wyników
- **Programiści/Developers:**  
  Napisanie kodu testowego, szybkie reagowanie na zgłoszone błędy, wsparcie przy debugowaniu i naprawie usterek
- **DevOps/Administratorzy CI/CD:**  
  Konfiguracja środowiska testowego, zarządzanie pipeline'ami automatycznych testów oraz monitorowanie środowiska

## 9. Ryzyka i plany awaryjne
- **Potencjalne ryzyka:**  
  - Niezgodność wersji technologii (TypeScript, biblioteki React, Tailwind) mogąca skutkować błędami
  - Problemy w integracji między Astro, React i Supabase
  - Błędy związane z middleware i routingiem, mogące wpłynąć na dostępność części systemu
  - Ograniczenia środowiska testowego, np. brak izolacji danych produkcyjnych

- **Plany awaryjne:**  
  - Wdrożenie testów regresyjnych przy każdej istotnej zmianie
  - Utrzymywanie kopii zapasowej środowiska testowego oraz bazy danych
  - Regularne aktualizacje narzędzi i bibliotek wykorzystywanych w testach
  - Organizacja dodatkowych sesji testowych w razie wykrycia krytycznych usterek

---

Ten plan testów zapewnia kompleksową strategię weryfikacji jakości całego systemu, uwzględniając specyfikę stosu technologicznego oraz strukturę repozytorium, co pozwala na skuteczne wykrywanie i eliminację potencjalnych problemów na kolejnych etapach rozwoju projektu.