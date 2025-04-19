"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const resetSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email"),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export function PasswordResetForm() {
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(data: ResetFormValues) {
    setError(null);
    // Form submission will be implemented later
    console.log(data);
    setSuccess(true);
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę</CardTitle>
          <CardDescription>Wysłaliśmy link do resetowania hasła na podany adres email.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
            Wróć do logowania
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-[20px]">Resetuj hasło</CardTitle>
        <CardDescription>Na podany adres email zostanie wysłany link do zresetowania hasła</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="twoj@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Zresetuj hasło
            </Button>
            <div className="text-sm text-center">
              <a href="/login" className="text-primary hover:underline">
                Wróć do logowania
              </a>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
