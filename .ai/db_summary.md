<conversation_summary>
<decisions>

1. Użytkownik może posiadać wiele fiszek, a fiszki nie są współdzielone między użytkownikami.
2. Encja flashcards zawiera: id (bigserial), front (VARCHAR(200)), back (VARCHAR(500)), source (ENUM: 'ai-full', 'ai-edited', 'manual'), created_at, updated_at, generation_id (FK do generations), user_id (FK do users).
3. Encja generations zawiera: id (bigserial), user_id (FK do users), model (TEXT), generated_count, accepted_unedited_count, accepted_edited_count, source_text_hash, source_text_length, generation_time.
4. Encja generation_error_logs zawiera: id (bigserial), user_id (FK do users), model (TEXT), source_text_hash, source_text_length, error_code, error_message.
5. Tabela users jest zarządzana przez Supabase (pola: id, email, created_at, encrypted_password, confirmed_at).
6. Ustalono, że generation_id w flashcards jest obowiązkowe.
7. Kluczowe indeksy: indeks na flashcards.user_id, kompozytowy indeks na (user_id, created_at) oraz indeks na generation_id.
8. RLS: Polityka bezpieczeństwa na poziomie wierszy w tabeli flashcards zapewnia, że użytkownik widzi tylko swoje fiszki (flashcards.user_id odpowiada identyfikatorowi aktualnie zalogowanego użytkownika wg Supabase Auth).
   </decisions>

<matched_recommendations>

1. Utworzenie tabel z odpowiednimi typami i ograniczeniami, włącznie z definicją ENUM dla pola source w flashcards.
2. Zapewnienie relacji 1:n między użytkownikami a fiszkami, oraz między użytkownikami a generacjami i logami błędów.
3. Zastosowanie indeksów na kolumnach kluczowych, takich jak user_id i created_at dla optymalizacji zapytań.
4. Wdrożenie mechanizmu RLS, aby ograniczyć dostęp do danych tylko do rekordów powiązanych z zalogowanym użytkownikiem.
5. Użycie standardowego modelu danych użytkowników z Supabase, z polami: id, email, created_at, encrypted_password, confirmed_at.
   </matched_recommendations>

<database_planning_summary>
Główne wymagania dotyczące schematu bazy danych obejmują zarządzanie fiszkami użytkownika, rejestrowanie generacji generowania fiszek oraz logowanie błędów. Kluczowe encje to:

- flashcards: zawiera dane dotyczące fiszek z ograniczeniami długości oraz pole source jako ENUM, które określa, czy fiszka została wygenerowana przez AI (w pełni lub edytowana) lub dodana manualnie.
- generations: rejestruje szczegóły generowania fiszek, takie jak liczba wygenerowanych fiszek oraz statystyki dotyczące akceptacji.
- generation_error_logs: przechowuje logi błędów związanych z procesem generacji fiszek.
- users: przechowywane i zarządzane przez Supabase, przechowujące dane użytkowników.
  Relacje między encjami:
- Każdy użytkownik (users) może mieć wiele fiszek (flashcards), generacji (generations) oraz logów błędów (generation_error_logs).
- flashcards posiada obowiązkowy klucz obcy generation_id, który wskazuje na rekord w tabeli generations.
  Bezpieczeństwo i skalowalność:
- RLS w flashcards zapewnia, że użytkownik ma dostęp tylko do swoich danych zgodnie z autoryzacją w Supabase.
- Indeksy na user_id, composite (user_id, created_at) oraz generation_id zwiększają wydajność zapytań.
- Brak partycjonowania upraszcza schemat dla MVP, przy zachowaniu odpowiedniego modelu indeksowania dla optymalnej wydajności.
  </database_planning_summary>

<unresolved_issues>
Brak nierozwiązanych kwestii – wszystkie decyzje zostały potwierdzone w rozmowie.
</unresolved_issues>
</conversation_summary>
