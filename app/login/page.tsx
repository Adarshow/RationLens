"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { DemoAccountsCard } from "@/components/DemoAccountsCard";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError(t.loginError);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "shopkeeper") {
        router.push("/shopkeeper");
        router.refresh();
        return;
      }
      if (profile?.role === "citizen") {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (profile?.role === "admin") {
        router.push("/admin/shopkeepers");
        router.refresh();
        return;
      }

      setError(t.loginError);
    } catch {
      setError(t.loginError);
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-lg">
        <PageTitle>{t.login}</PageTitle>
        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            id="email"
            label={t.email}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            invalid={Boolean(error)}
          />
          <Input
            id="password"
            label={t.password}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            invalid={Boolean(error)}
          />
          {error ? (
            <Card variant="alert" tone="danger" role="alert">
              <p className="text-laterite">{error}</p>
            </Card>
          ) : null}
          <Button type="submit" fullWidth disabled={pending}>
            {t.login}
          </Button>
        </form>
        <p className="mt-6">
          <TextLink href="/signup">{t.signup}</TextLink>
        </p>
        <DemoAccountsCard
          onSelect={(demoEmail, demoPassword) => {
            setEmail(demoEmail);
            setPassword(demoPassword);
          }}
        />
      </div>
    </PageContainer>
  );
}
