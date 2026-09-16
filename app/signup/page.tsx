"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { shops } from "@/lib/mockData";
import type { UserRole } from "@/lib/types";
import { fieldClassName } from "@/lib/ui";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [shopId, setShopId] = useState(shops[0]?.id ?? "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    // TODO: replace with real Supabase query
    if (role === "shopkeeper") {
      router.push("/shopkeeper");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <PageShell>
      <h1 className="font-serif text-title">{t.signup}</h1>
      <form className="mt-6" onSubmit={onSubmit}>
        <label className="font-semibold" htmlFor="name">
          {t.name}
        </label>
        <input
          id="name"
          className={`mt-2 ${fieldClassName}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <label className="mt-4 block font-semibold" htmlFor="email">
          {t.email}
        </label>
        <input
          id="email"
          type="email"
          className={`mt-2 ${fieldClassName}`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
          required
        />
        <fieldset className="mt-4">
          <legend className="font-semibold">{t.role}</legend>
          <label className="mt-2 flex min-h-tap items-center gap-2 text-body">
            <input
              type="radio"
              name="role"
              checked={role === "citizen"}
              onChange={() => setRole("citizen")}
            />
            {t.citizen}
          </label>
          <label className="flex min-h-tap items-center gap-2 text-body">
            <input
              type="radio"
              name="role"
              checked={role === "shopkeeper"}
              onChange={() => setRole("shopkeeper")}
            />
            {t.shopkeeper}
          </label>
        </fieldset>
        {role === "shopkeeper" ? (
          <>
            <label className="mt-4 block font-semibold" htmlFor="shop">
              {t.assignedShop}
            </label>
            <select
              id="shop"
              className={`mt-2 ${fieldClassName}`}
              value={shopId}
              onChange={(event) => setShopId(event.target.value)}
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </>
        ) : null}
        <div className="mt-6">
          <PrimaryButton type="submit">{t.signup}</PrimaryButton>
        </div>
      </form>
      <p className="mt-6">
        <TextLink href="/login">{t.login}</TextLink>
      </p>
    </PageShell>
  );
}
