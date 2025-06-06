import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";
import type { User, UserState } from "@/lib/stores/userStore";

interface TopBarProps {
  initialUser: User | null;
}

export function TopBar({ initialUser }: TopBarProps) {
  const user = useUserStore((state: UserState) => state.user);
  const setUser = useUserStore((state: UserState) => state.setUser);
  const clearUser = useUserStore((state: UserState) => state.clearUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Wystąpił błąd podczas wylogowywania");
      }

      clearUser();
      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      console.error("Błąd wylogowania:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col">
        <div className="flex h-14 items-center justify-between">
          <div className="flex gap-6 md:gap-10">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-4xl font-bold ml-8">10x Cards</span>
            </a>
          </div>
          <div className="flex items-center gap-4 relative">
            {error && <span className="text-sm text-destructive absolute -bottom-8 right-0">{error}</span>}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Zalogowany jako: <span className="font-medium text-foreground">{user.email}</span>
                </span>
                <Button variant="outline" onClick={handleLogout} disabled={isLoading}>
                  {isLoading ? "Wylogowywanie..." : "Wyloguj"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild>
                <a href="/login">Zaloguj się</a>
              </Button>
            )}
          </div>
        </div>
        <div className="h-[1px] bg-border"></div>
        <div className="h-12 flex items-center">
          <nav className="flex items-center gap-6 ml-8">
            <a
              href="/generate"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Generuj
            </a>
            <a
              href="/flashcards"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Fiszki
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
}
