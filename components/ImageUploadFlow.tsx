"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import type { ExtractedStockItem } from "@/lib/types";

type Step = "idle" | "loading" | "review" | "published";

type ShopItem = {
  id: string;
  name: string;
};

type Props = {
  shopId: string | null;
  items: ShopItem[];
};

function matchItemId(name: string, items: ShopItem[]) {
  const key = name.trim().toLowerCase();
  return items.find((item) => item.name.trim().toLowerCase() === key)?.id;
}

export function ImageUploadFlow({ shopId, items }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [rows, setRows] = useState<ExtractedStockItem[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [analysisMessage, setAnalysisMessage] = useState("");

  async function startRead(file?: File) {
    setError("");
    setAnalysisMessage("");
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    setStep("loading");
    try {
      const image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("Unable to read image"));
        reader.onerror = () => reject(new Error("Unable to read image"));
        reader.readAsDataURL(file);
      });
      if (shopId) {
        const uploadResponse = await fetch("/api/stock/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop_id: shopId, image }),
        });
        if (!uploadResponse.ok && uploadResponse.status !== 502) {
          const uploadResult = (await uploadResponse.json()) as { error?: string };
          throw new Error(uploadResult.error ?? "The image could not be uploaded.");
        }
      }
      const response = await fetch("/api/stock/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const result = (await response.json()) as {
        items?: ExtractedStockItem[];
        confidence?: string;
        message?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "The image could not be analyzed.");
      setRows(result.items ?? []);
      setAnalysisMessage(
        result.message ??
          (result.confidence === "low"
            ? "Unable to confidently read the stock information. Enter values manually."
            : ""),
      );
      setStep("review");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The image could not be analyzed.");
      setStep("idle");
    }
  }

  function updateRow(index: number, patch: Partial<ExtractedStockItem>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  async function publish() {
    setError("");
    if (!shopId) {
      setError("Couldn't save that update — try again.");
      return;
    }

    const payload = [];
    for (const row of rows) {
      const itemId = matchItemId(row.item, items);
      if (!itemId) {
        setError("Couldn't save that update — try again.");
        return;
      }
      payload.push({ item_id: itemId, quantity: row.quantity });
    }

    setPending(true);
    try {
      const response = await fetch("/api/stock/confirm-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, items: payload, human_confirmed: true }),
      });
      if (!response.ok) {
        setError("Couldn't save that update — try again.");
        return;
      }
      setStep("published");
    } catch {
      setError("Couldn't save that update — try again.");
    } finally {
      setPending(false);
    }
  }

  if (step === "published") {
    return (
      <Card variant="alert" tone="success">
        <p className="text-sm md:text-base">{t.published}</p>
        <Button href="/shopkeeper" className="mt-4" fullWidth>
          {t.back}
        </Button>
      </Card>
    );
  }

  if (step === "loading") {
    return (
      <Card variant="browse">
        <p className="text-sm md:text-base">{t.reading}</p>
      </Card>
    );
  }

  if (step === "review") {
    return (
      <Card variant="browse">
        <SectionHeading>{t.weDetected}</SectionHeading>
        <p className="mt-2 text-sm text-ink/70 md:text-base">{t.checkNumbers}</p>
        {analysisMessage ? (
          <Card variant="alert" tone="warning" className="mt-4" role="status">
            <p className="text-sm text-ink">{analysisMessage}</p>
          </Card>
        ) : null}
        {rows.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, index) => (
              <li key={`${row.item}-${index}`}>
                <Input
                  id={`detected-${index}`}
                  label={row.item}
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(index, { quantity: Number(event.target.value) })
                  }
                />
                <p className="mt-1 text-sm text-ink/70">{row.unit}</p>
              </li>
            ))}
          </ul>
        ) : null}
        {error ? (
          <Card variant="alert" tone="danger" className="mt-4" role="alert">
            <p className="text-laterite">{error}</p>
          </Card>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            fullWidth
            disabled={pending || rows.length === 0}
            onClick={() => {
              void publish();
            }}
          >
            {t.confirmPublish}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setStep("idle")}
          >
            {t.retake}
          </Button>
          <Button href="/shopkeeper" variant="ghost">
            {t.enterManually}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="browse">
      <p className="text-sm md:text-base">{t.choosePhoto}</p>
      <label className="mt-4 block">
        <span className="sr-only">{t.uploadImage}</span>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-sm md:text-base"
          onChange={(event) => {
            void startRead(event.target.files?.[0]);
          }}
        />
      </label>
      <div className="mt-4">
        <Button type="button" onClick={() => setError("Choose an image first.")} fullWidth>
          {t.uploadImage}
        </Button>
      </div>
    </Card>
  );
}
