"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { TEST_LOGINS } from "@/lib/mockData";
import { fieldClassName } from "@/lib/ui";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    // TODO: replace with real Supabase query
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
      <h1 className="font-serif text-title">{t.login}</h1>
      <p className="mt-3 text-body text-muted">{t.demoHint}</p>
      <form className="mt-6" onSubmit={onSubmit}>
        <label className="font-semibold" htmlFor="email">
          {t.email}
        </label>
        <input
          id="email"
          type="email"
          className={`mt-2 ${fieldClassName}`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
        />
        <label className="mt-4 block font-semibold" htmlFor="password">
          {t.password}
        </label>
        <input
          id="password"
          type="password"
          className={`mt-2 ${fieldClassName}`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="mt-4 border border-out bg-out-bg p-4 text-out" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6">
          <PrimaryButton type="submit">{t.login}</PrimaryButton>
        </div>
      </form>
      <p className="mt-6">
        <TextLink href="/signup">{t.signup}</TextLink>
      </p>
    </PageShell>
  );
}
