"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { shops } from "@/lib/mockData";
import type { UserRole } from "@/lib/types";

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
    if (role === "shopkeeper") {
      router.push("/shopkeeper");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <PageShell>
      <h1 className="text-title font-extrabold text-ink">{t.signup}</h1>
      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <Input
          id="name"
          label={t.name}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          id="email"
          label={t.email}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          id="password"
          label={t.password}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <fieldset>
          <legend className="text-sm font-semibold text-ink">{t.role}</legend>
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
          <Select
            id="shop"
            label={t.assignedShop}
            value={shopId}
            onChange={(event) => setShopId(event.target.value)}
          >
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </Select>
        ) : null}
        <Button type="submit">{t.signup}</Button>
      </form>
      <p className="mt-6">
        <TextLink href="/login">{t.login}</TextLink>
      </p>
    </PageShell>
  );
}
