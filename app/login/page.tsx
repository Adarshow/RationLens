"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { TEST_LOGINS } from "@/lib/mockData";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const citizen =
      email === TEST_LOGINS.citizen.email &&
      password === TEST_LOGINS.citizen.password;
    const shopkeeper =
      email === TEST_LOGINS.shopkeeper.email &&
      password === TEST_LOGINS.shopkeeper.password;

    if (shopkeeper) {
      router.push("/shopkeeper");
      return;
    }
    if (citizen) {
      router.push("/dashboard");
      return;
    }
    setError(t.loginError);
  }

  return (
    <PageShell>
      <h1 className="text-title font-extrabold text-ink">{t.login}</h1>
      <p className="mt-3 text-body text-ink/70">{t.demoHint}</p>
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
        <Button type="submit">{t.login}</Button>
      </form>
      <p className="mt-6">
        <TextLink href="/signup">{t.signup}</TextLink>
      </p>
    </PageShell>
  );
}
