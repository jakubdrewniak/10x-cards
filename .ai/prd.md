# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu

10x-cards to aplikacja webowa umożliwiająca efektywne tworzenie i naukę przy pomocy fiszek edukacyjnych. Główną cechą wyróżniającą aplikację jest wykorzystanie sztucznej inteligencji do automatycznego generowania wysokiej jakości fiszek na podstawie wprowadzonego tekstu, co znacząco przyspiesza proces przygotowania materiałów do nauki.

Aplikacja nie jest ukierunkowana na konkretną dziedzinę wiedzy - stanowi elastyczne narzędzie dla osób uczących się w różnych obszarach. Interfejs jest zaprojektowany tak, aby był intuicyjny i prosty w obsłudze dla wszystkich użytkowników.

Podstawowa koncepcja aplikacji opiera się na pokonaniu głównej bariery w korzystaniu z metody powtórek rozłożonych w czasie (spaced repetition) - czasochłonnego procesu tworzenia fiszek. Dzięki automatyzacji tego procesu, użytkownicy mogą skupić się bezpośrednio na nauce.

Aplikacja tworzona jest na potrzeby edukacyjne, bez bieżących planów komercjalizacji.

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest procesem czasochłonnym, co zniechęca wielu potencjalnych użytkowników do korzystania z efektywnej metody nauki, jaką jest powtarzanie rozłożone w czasie (spaced repetition).

Typowy proces tworzenia fiszek wymaga:
1. Analizy materiału źródłowego
2. Identyfikacji kluczowych informacji
3. Przekształcenia ich w format pytanie-odpowiedź lub pojęcie-definicja
4. Ręcznego wprowadzenia każdej fiszki do systemu

Ten czasochłonny proces często powoduje, że uczący się:
- Rezygnują z tworzenia fiszek, mimo świadomości ich skuteczności
- Tworzą ich zbyt mało w stosunku do materiału, który chcieliby przyswoić
- Tworzą fiszki niskiej jakości, skupiając się na ilości kosztem jakości

10x-cards rozwiązuje ten problem, automatyzując proces tworzenia fiszek przy pomocy AI, co pozwala użytkownikom na:
- Szybkie generowanie zestawów fiszek z dowolnego tekstu
- Skupienie się na nauce, zamiast na przygotowaniu materiałów
- Utrzymanie wysokiej jakości fiszek bez dodatkowego nakładu pracy

## 3. Wymagania funkcjonalne

### 3.1. Generowanie fiszek przez AI

- Użytkownik może wprowadzić tekst o długości od 1000 do 10000 znaków określając tematykę, treść do nauki oraz stopień trudności (lub swój stopień zaawansowania w danym temacie)
- System generuje fiszki w formacie "przód-tył" na podstawie wprowadzonego tekstu
- Generowanie fiszek odbywa się natychmiastowo (w jednej odpowiedzi od AI)
- Każda fiszka ma limit 200 znaków dla przodu i 500 znaków dla tyłu
- Po wygenerowaniu fiszek użytkownik może:
  - Zaakceptować fiszkę bez zmian
  - Edytować i zaakceptować fiszkę
  - Odrzucić fiszkę
  - Zaakceptować wszystkie fiszki jednocześnie
- System obsługuje generowanie fiszek w dowolnym języku
- Brak ograniczeń w ilości zapytań do AI

### 3.2. Manualne tworzenie fiszek

- Użytkownik może manualnie utworzyć fiszkę w formacie "przód-tył"
- Interfejs dodawania fiszek jest prosty i intuicyjny
- Limit 200 znaków dla przodu i 500 znaków dla tyłu fiszki
- Możliwość zapisania lub anulowania tworzenia fiszki

### 3.3. Zarządzanie fiszkami

- Użytkownik może przeglądać listę wszystkich swoich fiszek
- Lista fiszek jest paginowana
- Dla każdej fiszki użytkownik może:
  - Wyświetlić pełną treść
  - Edytować treść
  - Usunąć fiszkę
- Możliwość zbiorczego zarządzania fiszkami:
  - Wybór wielu fiszek
  - Usuwanie wielu fiszek jednocześnie

### 3.4. System kont użytkowników

- Rejestracja użytkownika wymaga podania:
  - Imienia
  - Adresu email (służącego jako login)
  - Hasła
- Logowanie przy pomocy emaila i hasła
- Profil użytkownika zawierający podstawowe informacje
- Wszystkie fiszki są przypisane do konta użytkownika, który je utworzył
- Brak ograniczeń ilościowych dla użytkowników (liczba fiszek, zapytań do AI)

### 3.5. Nauka z fiszkami

- Integracja z gotowym algorytmem powtórek rozłożonych w czasie (spaced repetition)
- Wskaźnik postępu nauki
- Prezentacja fiszek użytkownikowi zgodnie z harmonogramem wyznaczonym przez algorytm

## 4. Granice produktu

Następujące funkcjonalności NIE wchodzą w zakres MVP aplikacji 10x-cards:

### 4.1. Algorytm powtórek
- Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
- Aplikacja będzie korzystać z gotowego, zewnętrznego algorytmu

### 4.2. Import i eksport danych
- Import wielu formatów (PDF, DOCX, itp.)
- Eksport fiszek do innych systemów lub formatów

### 4.3. Funkcje społecznościowe
- Współdzielenie zestawów fiszek między użytkownikami
- Publiczne zestawy fiszek
- Funkcje komentowania, oceniania fiszek

### 4.4. Integracje zewnętrzne
- Integracje z innymi platformami edukacyjnymi
- API dla zewnętrznych aplikacji

### 4.5. Platforma
- Aplikacje mobilne (na początek tylko web)
- Wersje offline

### 4.6. Organizacja fiszek
- Grupowanie fiszek w kategorie/zestawy
- Zaawansowane sortowanie i filtrowanie fiszek

## 5. Historyjki użytkowników

### US-001: Rejestracja nowego użytkownika
**Tytuł:** Rejestracja nowego użytkownika w systemie

**Opis:** Jako nowy użytkownik, chcę utworzyć konto w aplikacji 10x-cards, aby móc tworzyć, przechowywać i uczyć się z własnych fiszek.

**Kryteria akceptacji:**
1. Formularz rejestracji zawiera pola: imię, email, hasło i potwierdzenie hasła
2. System weryfikuje poprawność formatu adresu email
3. Hasło musi zawierać minimum 8 znaków
4. System informuje o błędach walidacji w czasie rzeczywistym
5. Po poprawnym wypełnieniu formularza i kliknięciu przycisku "Zarejestruj", system tworzy nowe konto
6. System wyświetla komunikat o pomyślnej rejestracji
7. System automatycznie loguje użytkownika po rejestracji

### US-002: Logowanie użytkownika
**Tytuł:** Logowanie do systemu

**Opis:** Jako zarejestrowany użytkownik, chcę zalogować się do aplikacji, aby uzyskać dostęp do moich fiszek i kontynuować naukę.

**Kryteria akceptacji:**
1. Formularz logowania zawiera pola: email i hasło
2. Po wprowadzeniu poprawnych danych i kliknięciu przycisku "Zaloguj", system loguje użytkownika
3. System przekierowuje zalogowanego użytkownika do głównego widoku aplikacji
4. W przypadku błędnych danych, system wyświetla komunikat o błędzie
5. Formularz zawiera link do odzyskiwania hasła

### US-003: Wylogowanie użytkownika
**Tytuł:** Wylogowanie z systemu

**Opis:** Jako zalogowany użytkownik, chcę wylogować się z aplikacji, aby zabezpieczyć swoje konto przed nieautoryzowanym dostępem.

**Kryteria akceptacji:**
1. Przycisk wylogowania jest widoczny w interfejsie dla zalogowanego użytkownika
2. Po kliknięciu przycisku "Wyloguj", system kończy sesję użytkownika
3. System przekierowuje użytkownika do strony logowania
4. System wyświetla komunikat o pomyślnym wylogowaniu

### US-004: Generowanie fiszek przez AI
**Tytuł:** Generowanie fiszek przy pomocy sztucznej inteligencji

**Opis:** Jako zalogowany użytkownik, chcę wkleić tekst do nauki i wygenerować z niego fiszki za pomocą AI, aby zaoszczędzić czas.

**Kryteria akceptacji:**
1. Interfejs zawiera pole tekstowe do wprowadzenia tekstu (1000-10000 znaków)
2. System informuje o minimalnej i maksymalnej długości tekstu
3. Użytkownik może wybrać poziom trudności/zaawansowania fiszek w tekscie
4. System generuje fiszki natychmiastowo po kliknięciu przycisku "Generuj fiszki"
5. Wygenerowane fiszki są prezentowane użytkownikowi do przeglądu
6. Każda fiszka ma format "przód-tył" z limitem 200 znaków dla przodu i 500 znaków dla tyłu
7. System obsługuje generowanie fiszek w języku wprowadzonego tekstu

### US-005: Ocena wygenerowanych fiszek
**Tytuł:** Ocena i akceptacja wygenerowanych fiszek

**Opis:** Jako użytkownik, po wygenerowaniu fiszek przez AI, chcę przejrzeć je i zdecydować, które zaakceptować, edytować lub odrzucić.

**Kryteria akceptacji:**
1. Dla każdej wygenerowanej fiszki widoczne są przyciski: "Zaakceptuj", "Edytuj", "Odrzuć"
2. Kliknięcie "Zaakceptuj" dodaje fiszkę do kolekcji użytkownika bez zmian
3. Kliknięcie "Edytuj" otwiera edytor fiszki, umożliwiający modyfikację zawartości
4. Po edycji, użytkownik może zaakceptować lub anulować zmiany
5. Kliknięcie "Odrzuć" usuwa fiszkę z listy wygenerowanych
6. Interfejs zawiera przycisk "Zaakceptuj wszystkie" dla szybkiej akceptacji wszystkich wygenerowanych fiszek
7. System informuje o liczbie zaakceptowanych, edytowanych i odrzuconych fiszek

### US-006: Manualne tworzenie fiszki
**Tytuł:** Manualne dodawanie nowej fiszki

**Opis:** Jako zalogowany użytkownik, chcę manualnie utworzyć nową fiszkę, aby dostosować jej zawartość dokładnie do moich potrzeb.

**Kryteria akceptacji:**
1. Interfejs zawiera przycisk "Dodaj fiszkę"
2. Po kliknięciu przycisku, system wyświetla formularz z polami "Przód" i "Tył"
3. Oba pola są ograniczone odpowiednimi limitami znaków (200 dla przodu, 500 dla tyłu)
4. System wyświetla licznik pozostałych znaków
5. Formularz zawiera przyciski "Zapisz" i "Anuluj"
6. Po kliknięciu "Zapisz", system dodaje fiszkę do kolekcji użytkownika
7. Kliknięcie "Anuluj" zamyka formularz bez zapisywania zmian

### US-007: Przeglądanie listy fiszek
**Tytuł:** Przeglądanie własnych fiszek

**Opis:** Jako zalogowany użytkownik, chcę przeglądać listę wszystkich moich fiszek, aby mieć przegląd zgromadzonych materiałów do nauki.

**Kryteria akceptacji:**
1. System wyświetla listę fiszek użytkownika
2. Lista zawiera podgląd treści przodu każdej fiszki
3. Lista jest paginowana, gdy liczba fiszek przekracza limit na stronę
4. Interfejs zawiera kontrolki nawigacji między stronami
5. Dla każdej fiszki dostępne są opcje: "Podgląd", "Edytuj", "Usuń"
6. System wyświetla łączną liczbę fiszek użytkownika

### US-008: Edycja fiszki
**Tytuł:** Edycja istniejącej fiszki

**Opis:** Jako zalogowany użytkownik, chcę edytować treść mojej fiszki, aby poprawić błędy lub zaktualizować informacje.

**Kryteria akceptacji:**
1. Po kliknięciu "Edytuj" przy fiszce, system wyświetla formularz edycji
2. Formularz jest wypełniony aktualną treścią fiszki
3. Użytkownik może modyfikować pola "Przód" i "Tył" z zachowaniem limitów znaków
4. Formularz zawiera przyciski "Zapisz zmiany" i "Anuluj"
5. Po kliknięciu "Zapisz zmiany", system aktualizuje fiszkę w bazie danych
6. Kliknięcie "Anuluj" zamyka formularz bez zapisywania zmian
7. System potwierdza zapisanie zmian odpowiednim komunikatem

### US-009: Usuwanie fiszki
**Tytuł:** Usuwanie fiszki

**Opis:** Jako zalogowany użytkownik, chcę usunąć fiszkę, której już nie potrzebuję.

**Kryteria akceptacji:**
1. Po kliknięciu "Usuń" przy fiszce, system wyświetla prośbę o potwierdzenie
2. Prośba o potwierdzenie zawiera przyciski "Tak, usuń" i "Anuluj"
3. Kliknięcie "Tak, usuń" powoduje trwałe usunięcie fiszki z systemu
4. Kliknięcie "Anuluj" zamyka prośbę o potwierdzenie bez usuwania fiszki
5. System potwierdza usunięcie fiszki odpowiednim komunikatem

### US-010: Zbiorcze zarządzanie fiszkami
**Tytuł:** Zbiorcze zarządzanie fiszkami

**Opis:** Jako zalogowany użytkownik, chcę wybierać wiele fiszek jednocześnie, aby efektywnie zarządzać większą ich liczbą.

**Kryteria akceptacji:**
1. Lista fiszek zawiera pole wyboru (checkbox) przy każdej fiszce
2. Interfejs zawiera przycisk "Zaznacz wszystkie" / "Odznacz wszystkie"
3. Gdy wybrane są fiszki, aktywny staje się przycisk "Usuń wybrane"
4. Po kliknięciu "Usuń wybrane", system wyświetla prośbę o potwierdzenie
5. Prośba o potwierdzenie zawiera informację o liczbie fiszek do usunięcia
6. Kliknięcie "Tak, usuń" powoduje trwałe usunięcie wszystkich wybranych fiszek
7. System potwierdza usunięcie fiszek odpowiednim komunikatem

### US-011: Nauka z fiszkami ?
**Tytuł:** Sesja nauki z algorytmem powtórek

**Opis:** Jako zalogowany użytkownik chcę, aby dodane fiszki były dostępne w widoku "Sesja nauki" opartym na zewnętrznym algorytmie, aby móc efektywnie się uczyć (spaced repetition).

**Kryteria akceptacji:**
1. W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesję nauki fiszek
2. Na start wyświetlany jest przód fiszki, poprzez interakcję użytkownik wyświetla jej tył
3. Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił fiszkę
4. Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki

### US-012: Odzyskiwanie hasła
**Tytuł:** Odzyskiwanie zapomnianego hasła

**Opis:** Jako użytkownik, który zapomniał hasła, chcę zresetować je, aby odzyskać dostęp do mojego konta.

**Kryteria akceptacji:**
1. Strona logowania zawiera link "Zapomniałem hasła"
2. Po kliknięciu linku, system wyświetla formularz z polem na adres email
3. Po wprowadzeniu adresu email i kliknięciu "Resetuj hasło", system weryfikuje istnienie konta
4. System wysyła email z linkiem do resetowania hasła (lub kodem weryfikacyjnym)
5. Link prowadzi do formularza zmiany hasła
6. Po poprawnym zresetowaniu hasła, system wyświetla komunikat o sukcesie
7. Użytkownik może zalogować się nowym hasłem

### US-013: Edycja profilu użytkownika
**Tytuł:** Edycja danych profilowych

**Opis:** Jako zalogowany użytkownik, chcę edytować informacje w moim profilu, aby utrzymać aktualne dane.

**Kryteria akceptacji:**
1. Interfejs zawiera sekcję "Mój profil"
2. Profil wyświetla aktualne dane użytkownika: imię i email
3. Użytkownik może edytować swoje imię
4. Użytkownik może zmienić hasło (wymagane podanie obecnego hasła)
5. Formularz zawiera przyciski "Zapisz zmiany" i "Anuluj"
6. System potwierdza zapisanie zmian odpowiednim komunikatem

### US-014: Obsługa błędów generowania fiszek
**Tytuł:** Obsługa niepowodzeń podczas generowania fiszek

**Opis:** Jako użytkownik, chcę otrzymać jasną informację, gdy generowanie fiszek nie powiedzie się, aby wiedzieć, jak postąpić dalej.

**Kryteria akceptacji:**
1. System wykrywa błędy podczas generowania fiszek (np. problemy z usługą AI, niewłaściwy format tekstu)
2. System wyświetla zrozumiały komunikat o błędzie z informacją o przyczynie
3. Komunikat zawiera sugestie rozwiązania problemu
4. Użytkownik ma możliwość ponowienia próby
5. System zachowuje wprowadzony przez użytkownika tekst

## 6. Metryki sukcesu

### 6.1. Efektywność AI w generowaniu fiszek
- **Cel:** 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika bez edycji
- **Pomiar:** Stosunek liczby fiszek zaakceptowanych bez edycji do wszystkich wygenerowanych fiszek
- **Śledzenie:** System zapisuje dla każdej wygenerowanej fiszki, czy została zaakceptowana bez zmian, edytowana, czy odrzucona

### 6.2. Preferencje tworzenia fiszek
- **Cel:** Użytkownicy tworzą co najmniej 75% fiszek z wykorzystaniem AI (w porównaniu do manualnego tworzenia)
- **Pomiar:** Stosunek liczby fiszek utworzonych przy pomocy AI do całkowitej liczby fiszek w systemie
- **Śledzenie:** System zapisuje metodę utworzenia każdej fiszki (AI vs. manualnie)

### 6.3. Jakość generowanych fiszek
- **Pomiar rozszerzony:**
  - Procent fiszek zaakceptowanych bez zmian
  - Procent fiszek zaakceptowanych po edycji
  - Procent odrzuconych fiszek
- **Analiza:** Identyfikacja wzorców w odrzucanych lub często edytowanych fiszkach w celu poprawy algorytmu generowania