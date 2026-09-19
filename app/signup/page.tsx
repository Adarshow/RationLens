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
import type { UserRole } from "@/lib/types";

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (role === "shopkeeper" && (!licenseNumber || !phone || !proofImageFile)) {
      setError("Please fill out all shopkeeper fields and upload a license photo.");
      return;
    }
    
    if (role === "shopkeeper" && proofImageFile && proofImageFile.size > 5 * 1024 * 1024) {
      setError("Please choose a license photo smaller than 5 MB.");
      return;
    }

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

      let proofImagePath = null;
      if (role === "shopkeeper" && proofImageFile) {
        const ext = proofImageFile.name.split(".").pop() || "jpg";
        const path = `${data.user.id}/proof.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("shopkeeper-proofs")
          .upload(path, proofImageFile, { upsert: true });
        
        if (uploadError) {
          setError("Failed to upload proof image. Please try again.");
          return;
        }
        proofImagePath = path;
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        role,
        shop_id: null,
        verification_status: role === "citizen" ? "approved" : "pending",
        license_number: role === "shopkeeper" ? licenseNumber : null,
        phone: role === "shopkeeper" ? phone : null,
        proof_image_path: proofImagePath,
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
        setNotice(t.applicationSubmitted);
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
            <div className="flex flex-col gap-4 border-t border-paper-dim pt-4 mt-2">
              <Input
                id="license"
                label={t.licenseNumber}
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                required
              />
              <Input
                id="phone"
                label={t.phoneNumber}
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-ink" htmlFor="proof">
                  {t.uploadLicensePhoto}
                </label>
                <input
                  id="proof"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm mt-1"
                  onChange={(event) => {
                    setProofImageFile(event.target.files?.[0] || null);
                  }}
                  required
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <Card variant="alert" tone="danger" role="alert">
              <p className="text-laterite">{error}</p>
            </Card>
          ) : null}
          {notice ? (
            <Card variant="alert" tone="success" role="status">
              <p className="text-sm md:text-base">{notice}</p>
              {role === "shopkeeper" ? (
                <Button href="/dashboard" className="mt-4" fullWidth={false} variant="secondary">
                  Go to Dashboard
                </Button>
              ) : null}
            </Card>
          ) : null}
          
          {!notice || role !== "shopkeeper" ? (
            <Button type="submit" fullWidth disabled={pending}>
              {t.signup}
            </Button>
          ) : null}
        </form>
        <p className="mt-6">
          <TextLink href="/login">{t.login}</TextLink>
        </p>
      </div>
    </PageContainer>
  );
}
