"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
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
    <PageContainer>
      <div className="mx-auto w-full max-w-2xl">
        <PageTitle>{t.signup}</PageTitle>
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
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <label className="flex min-h-11 items-center gap-2 text-sm md:text-base">
                <input
                  type="radio"
                  name="role"
                  checked={role === "citizen"}
                  onChange={() => setRole("citizen")}
                />
                {t.citizen}
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm md:text-base">
                <input
                  type="radio"
                  name="role"
                  checked={role === "shopkeeper"}
                  onChange={() => setRole("shopkeeper")}
                />
                {t.shopkeeper}
              </label>
            </div>
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
          <Button type="submit" fullWidth>
            {t.signup}
          </Button>
        </form>
        <p className="mt-6">
          <TextLink href="/login">{t.login}</TextLink>
        </p>
      </div>
    </PageContainer>
  );
}
