# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Ogólny przegląd architektury interfejsu obejmuje wyodrębnienie głównych widoków aplikacji, zaprojektowanie mapy podróży użytkownika między tymi widokami oraz utworzenie intuicyjnej struktury nawigacyjnej. System opiera się na responsywnym designie (Tailwind CSS, standardowe breakpointy sm, md, lg) oraz mechanizmach autoryzacji (Supabase Auth, JWT, RLS) i obsłudze błędów inline. Kluczowe komponenty, takie jak topbar z biblioteki shadcn/ui, formularze, modalne okna edycji oraz listy danych, zapewniają spójność i dostępność interfejsu.

## 2. Lista widoków

1. **Ekran autoryzacji**

   - **Ścieżka widoku:** /login i /register
   - **Główny cel:** Umożliwienie nowym i istniejącym użytkownikom weryfikacji oraz autoryzacji.
   - **Kluczowe informacje:** Formularze logowania, rejestracji, instrukcje dotyczące hasła.
   - **Kluczowe komponenty:** Formularz autoryzacji, elementy walidacji inline, linki do resetowania hasła.
   - **UX, dostępność i bezpieczeństwo:** Intuicyjne formularze z natychmiastową walidacją, wsparcie dla czytników ekranowych i bezpieczne przesyłanie danych (JWT).

2. **Widok generowania fiszek**

   - **Ścieżka widoku:** /generate
   - **Główny cel:** Pozwolenie użytkownikowi na wygenerowanie fiszek za pomocą AI na podstawie wprowadzonego tekstu.
   - **Kluczowe informacje:** Instrukcje dotyczące długości tekstu, pole tekstowe do wprowadzenia zawartości, wynik generowania (lista propozycji fiszek).
   - **Kluczowe komponenty:** Duże pole tekstowe, przycisk generowania, lista wyników z opcjami edycji/akceptacji/odrzucenia. Wskaźnik ładownia skeleton, komunikaty o błędach (inline)
   - **UX, dostępność i bezpieczeństwo:** Jasno komunikowane ograniczenia długości tekstu, responsywne pole tekstowe, natychmiastowa informacja o błędach (inline).

3. **Widok listy fiszek**

   - **Ścieżka widoku:** /flashcards
   - **Główny cel:** Przeglądanie, edycja i usuwanie fiszek.
   - **Kluczowe informacje:** Podgląd fiszek, opcje edycji (modal), przyciski usuwania, paginacja.
   - **Kluczowe komponenty:** Lista kart fiszek, modal do edycji/dodawania, przyciski akcji.
   - **UX, dostępność i bezpieczeństwo:** Intuicyjne akcje edycji z użyciem modalnych okien, potwierdzenia przy usuwaniu, responsywność listy oraz komunikaty o błędach.

4. **Panel użytkownika**

   - **Ścieżka widoku:** /profile
   - **Główny cel:** Prezentacja i edycja podstawowych danych użytkownika.
   - **Kluczowe informacje:** Imię, adres email, opcje edycji hasła.
   - **Kluczowe komponenty:** Formularz edycji profilu, przyciski zapisu i anulowania.
   - **UX, dostępność i bezpieczeństwo:** Prosty interfejs z natychmiastową walidacją, ochrona danych osobowych, zgodność z zasadami dostępności.

5. **Ekran sesji powtórkowych**
   - **Ścieżka widoku:** /study
   - **Główny cel:** Umożliwienie przeprowadzenia sesji nauki z fiszkami przy użyciu algorytmu powtórek rozłożonych w czasie.
   - **Kluczowe informacje:** Prezentacja fiszek (przód/tył), opcje oceny zapamiętania.
   - **Kluczowe komponenty:** Karta fiszki, przyciski do odsłaniania tylu, opcje oceny (np. zapamiętałem/nie zapamiętałem).
   - **UX, dostępność i bezpieczeństwo:** Minimalistyczny interfejs skoncentrowany na nauce, duże i czytelne przyciski, uproszczona interakcja umożliwiająca łatwe korzystanie na urządzeniach mobilnych.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na ekran autoryzacji (/auth) i loguje się (lub rejestruje, jeśli jest nowy).
2. Po autoryzacji użytkownik trafia na widok generowania fiszek (/generate)
3. Po wygenerowaniu fiszek użytkownik przegląda wyniki i dokonuje akceptacji, edycji lub odrzucenia propozycji.
4. Użytkownik przechodzi do widoku listy fiszek (/flashcards), gdzie może edytować poszczególne fiszki za pomocą modalnych okien lub usuwać niepotrzebne fiszki.
5. Użytkownik rozpoczyna sesję nauki (/study), gdzie fiszki są prezentowane w formie interaktywnej sesji powtórkowej.
6. W dowolnym momencie użytkownik odwiedza panel użytkownika (/profile) w celu przeglądania lub aktualizacji swoich danych osobowych.
7. Nawigacja między widokami realizowana jest za pomocą topbaru, który zawiera odnośniki do Generowania fiszek, Listy fiszek, Sesji nauki oraz Panelu użytkownika.

## 4. Układ i struktura nawigacji

- Główna nawigacja dostępna jest w topbarze, widocznym na wszystkich widokach po zalogowaniu.
- Topbar zawiera linki do: Generowanie fiszek, Listy fiszek, Sesja powtórkowa, Panel użytkownika oraz przycisk wylogowania.
- Nawigacja jest responsywna dzięki Tailwind CSS i obsługuje różne rozmiary ekranów (sm, md, lg).
- System nawigacji wspiera nawigację klawiaturową oraz spełnia wymagania dostępności (ARIA, odpowiedni kontrast kolorów).

## 5. Kluczowe komponenty

- **Topbar:** Pasek nawigacyjny dostępny na wszystkich widokach, umożliwiający szybki dostęp do głównych sekcji aplikacji.
- **Formularze autoryzacji i profilu:** Intuicyjne formularze z walidacją inline, uwzględniające zasady bezpieczeństwa i dostępności.
- **Lista fiszek:** Komponent prezentujący karty fiszek z opcjami podglądu, edycji i usuwania, wraz z funkcjami paginacji.
- **Modal:** Okno dialogowe wykorzystywane do edycji lub dodawania fiszek bez konieczności przeładowania widoku.
- **Przyciski i kontenery:** Spójne elementy interfejsu, zgodne z wytycznymi biblioteki Shadcn/ui, umożliwiające intuicyjną interakcję.
- **Komponent sesji nauki:** Minimalistyczny interfejs prezentujący fiszki, umożliwiający odsłonięcie tylu i ocenę przyswojenia materiału.
