import { Toaster, toast } from "sonner";

export function ToastProvider() {
  return <Toaster richColors position="top-right" />;
}

interface ToastOptions {
  title?: string;
  description: string;
  variant?: "default" | "destructive";
}

export function useNotify() {
  const notify = {
    success: ({ title, description }: ToastOptions) => {
      if (title) {
        toast.success(title, {
          description,
        });
      } else {
        toast.success(description);
      }
    },
    error: ({ title, description }: ToastOptions) => {
      if (title) {
        toast.error(title, {
          description,
        });
      } else {
        toast.error(description);
      }
    },
  };

  return notify;
}
