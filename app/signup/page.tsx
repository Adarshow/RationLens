"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/types";

type ShopOption = {
  id: string;
  name: string;
};

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [shopId, setShopId] = useState("");
  const [shops, setShops] = useState<ShopOption[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("shops")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        const rows = data ?? [];
        setShops(rows);
        setShopId((current) => current || rows[0]?.id || "");
      });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setPending(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError || !data.user) {
        setError(t.loginError);
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        role,
        shop_id: role === "shopkeeper" ? shopId || null : null,
      });

      if (profileError && data.session) {
        setError(t.loginError);
        return;
      }

      if (!data.session) {
        setNotice(t.checkEmail);
        return;
      }

      if (role === "shopkeeper") {
        router.push("/shopkeeper");
        router.refresh();
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t.loginError);
    } finally {
      setPending(false);
    }
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
          {error ? (
            <Card variant="alert" tone="danger" role="alert">
              <p className="text-laterite">{error}</p>
            </Card>
          ) : null}
          {notice ? (
            <p className="text-sm text-ink/70 md:text-base">{notice}</p>
          ) : null}
          <Button type="submit" fullWidth disabled={pending}>
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
