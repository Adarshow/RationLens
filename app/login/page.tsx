"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
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
    <PageContainer>
      <div className="mx-auto w-full max-w-lg">
        <PageTitle>{t.login}</PageTitle>
        <p className="mt-3 text-sm text-ink/70 md:text-base">{t.demoHint}</p>
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
          <Button type="submit" fullWidth>
            {t.login}
          </Button>
        </form>
        <p className="mt-6">
          <TextLink href="/signup">{t.signup}</TextLink>
        </p>
      </div>
    </PageContainer>
  );
}
