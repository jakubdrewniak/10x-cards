<architecture_analysis>
1. Komponenty wymienione w dokumentach:
   - Strony Astro: Strona Rejestracji (/register), Strona Logowania (/login), Strona Reset Hasła (/password-reset).
   - Layouty: Wspólny layout z logiką ukrywania elementów (dla niezalogowanych) oraz widoczne elementy dla zalogowanych użytkowników.
   - Komponenty React: RegistrationForm, LoginForm, PasswordResetForm - komponenty obsługujące interaktywne formularze.
   - Backend API: Endpointy /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/password-reset.
   - Supabase Client: Klient znajdujący się w src/db/supabase.client.ts wykorzystywany do operacji autentykacyjnych.
   - Middleware: Mechanizm weryfikacji sesji przed renderowaniem stron chronionych.

2. Główne strony i odpowiadające im komponenty:
   - /register: Strona Astro zawierająca RegistrationForm.
   - /login: Strona Astro zawierająca LoginForm.
   - /password-reset: Strona Astro zawierająca PasswordResetForm.

3. Przepływ danych między komponentami:
   - Użytkownik wprowadza dane w formularzach (RegistrationForm, LoginForm, PasswordResetForm) -> komponenty React wykonują walidację i wysyłają dane do odpowiednich backend endpointów.
   - Endpointy API przetwarzają żądania, komunikują się z Supabase Client, a wyniki (sukces/błąd) przekazywane są do komponentów.
   - Middleware w Astro przed renderowaniem stron chronionych weryfikuje stan sesji.

4. Opis funkcjonalności:
   - RegistrationForm: Walidacja danych rejestracyjnych i wysyłka do /api/auth/register.
   - LoginForm: Walidacja danych logowania i wysyłka do /api/auth/login.
   - PasswordResetForm: Walidacja adresu email i inicjacja procedury resetu hasła poprzez /api/auth/password-reset.
   - Middleware: Sprawdza stan sesji użytkownika przed renderowaniem stron.
   - API Endpoints: Obsługa operacji rejestracji, logowania, wylogowywania i resetowania hasła.
   - Supabase Client: Komunikacja z usługą Supabase Auth.
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
    %% Moduł Frontend
    subgraph "Moduł Frontend"
        subgraph "Strony Astro"
            A["Strona Rejestracji (/register)"]
            B["Strona Logowania (/login)"]
            C["Strona Reset Hasła (/password-reset)"]
            D[(Middleware - Weryfikacja Sesji)]
            A --> D
            B --> D
            C --> D
        end
        subgraph "Komponenty React (Formularze)"
            E["RegistrationForm"]
            F["LoginForm"]
            G["PasswordResetForm"]
            A --> E
            B --> F
            C --> G
        end
    end

    %% API Endpoints
    subgraph "API Endpoints"
        H["Auth Register (/api/auth/register)"]
        I["Auth Login (/api/auth/login)"]
        J["Auth Logout (/api/auth/logout)"]
        K["Password Reset (/api/auth/password-reset)"]
    end

    %% Supabase Integracja
    subgraph "Supabase Integracja"
        L["Supabase Client"]
    end

    %% Przepływ danych
    E -- "Dane rejestracji" --> H
    F -- "Dane logowania" --> I
    G -- "Email do resetu" --> K
    H -- "Operacje rejestracji" --> L
    I -- "Operacje logowania" --> L
    K -- "Operacje resetu hasła" --> L

    %% Middleware i weryfikacja sesji
    D -- "Weryfikuje sesję" --- A
    D -- "Weryfikuje sesję" --- B
    D -- "Weryfikuje sesję" --- C

    %% Dodatkowe połączenia
    H -- "Potwierdzenie rejestracji" --> D
    I -- "Weryfikacja sesji" --> D

    %% Stylizacja autentykacji
    classDef authStyle fill:#f96,stroke:#333,stroke-width:2px;
    class E,F,G,H,I,K,L authStyle;
``` 
</mermaid_diagram> 