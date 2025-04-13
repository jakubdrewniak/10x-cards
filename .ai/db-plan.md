Schemat bazy danych dla aplikacji 10x-cards

1. Tabele oraz ich kolumny, typy danych i ograniczenia

---

### Tabela: users

- **id**: UUID lub BIGSERIAL PRIMARY KEY
- **email**: VARCHAR NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **encrypted_password**: TEXT NOT NULL
- **confirmed_at**: TIMESTAMPTZ

> Uwaga: Tabela `users` jest zarządzana przez Supabase i stanowi centralny punkt uwierzytelniania.

---

### Tabela: generations

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **generated_count**: INTEGER NOT NULL
- **accepted_unedited_count**: INTEGER NULLABLE
- **accepted_edited_count**: INTEGER NULLABLE
- **source_text_hash**: TEXT NOT NULL
- **source_text_length**: INTEGER NOT NULL
- **generation_duration**: INTEGER NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

---

### Tabela: flashcards

- **id**: BIGSERIAL PRIMARY KEY
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **source**: VARCHAR NOT NULL CHECK (source IN ('ai-full', 'ai-edited', 'manual'))
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()
- **generation_id**: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- **user_id**: UUID NOT NULL REFERENCES users(id)

**Triggery:**
Automatycznie aktualizuj kolumnę `updated_at` przy aktualizacji rekordu. 

**Row Level Security (RLS):**
- RLS zapewnia, że użytkownik ma dostęp tylko do swoich fiszek. Przykładowa polityka:

```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY flashcards_rls_policy ON flashcards
  USING (user_id = current_setting('supabase.user_id')::uuid);
```

---

### Tabela: generation_error_logs

- **id**: BIGSERIAL PRIMARY KEY
- **user_id**: UUID NOT NULL REFERENCES users(id)
- **model**: VARCHAR NOT NULL
- **source_text_hash**: VARCHAR NOT NULL
- **source_text_length**: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- **error_code**: VARCHAR(100) NOT NULL
- **error_message**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT NOW()

---

2. Relacje między tabelami

- Każdy użytkownik (`users`) może mieć wiele wpisów w tabelach `generations`, `flashcards` oraz `generation_error_logs`.
- Tabela `flashcards` posiada obowiązkowy klucz obcy `generation_id` odnoszący się do `generations(id)` oraz `user_id` odnoszący się do `users(id)`.
- Tabela `generations` ma klucz obcy `user_id` odnoszący się do `users(id)`.
- Tabela `generation_error_logs` ma klucz obcy `user_id` odnoszący się do `users(id)`.

---

3. Indeksy

W tabeli `flashcards`:
- indeks na kolumnie `user_id`.
- indeks na kolumnie `generation_id`.
W tabeli `generations`:
- indeks na kolumnie `user_id`
W tabeli `generation_error_logs`:
- indeks na kolumnie `user_id`

---

4. Zasady PostgreSQL (RLS)

W tabeli `flashcards`, `generations` i `generation_error_logs` wdrożyć mechanizm RLS, aby zapewnić, że każdy użytkownik widzi tylko te rekordy które odpowiadają plu user_id użytkowanika z Supabase Auth (np. auth.uid() = user_id)

---

5. Dodatkowe uwagi

- Dla tabeli `flashcards` warto rozważyć zastosowanie wyzwalacza aktualizującego kolumnę `updated_at` przy modyfikacji rekordu.
