import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/stores/userStore";

interface TopBarProps {
  initialUser: { id: string; email: string | null } | null;
}

export function TopBar({ initialUser }: TopBarProps) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  console.log(user);
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser, setUser]);

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <span className="font-bold">10x Cards</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Button variant="outline">Wyloguj</Button>
          ) : (
            <Button variant="outline" asChild>
              <a href="/login">Zaloguj się</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
