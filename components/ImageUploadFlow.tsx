"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { mockImageDetection } from "@/lib/mockData";
import type { ExtractedStockItem } from "@/lib/types";

type Step = "idle" | "loading" | "review" | "published";

export function ImageUploadFlow() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [rows, setRows] = useState<ExtractedStockItem[]>(mockImageDetection.items);

  function startRead() {
    setStep("loading");
    window.setTimeout(() => {
      setRows(mockImageDetection.items.map((item) => ({ ...item })));
      setStep("review");
    }, 1200);
  }

  function updateRow(index: number, patch: Partial<ExtractedStockItem>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  if (step === "published") {
    return (
      <Card variant="alert" tone="success">
        <p className="text-body">{t.published}</p>
        <Button href="/shopkeeper" className="mt-4">
          {t.back}
        </Button>
      </Card>
    );
  }

  if (step === "loading") {
    return (
      <Card variant="browse">
        <p className="text-body">{t.reading}</p>
      </Card>
    );
  }

  if (step === "review") {
    return (
      <Card variant="browse">
        <SectionHeading>{t.weDetected}</SectionHeading>
        <p className="mt-2 text-body text-ink/70">{t.checkNumbers}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row, index) => (
            <li key={row.item}>
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
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="button"
            onClick={() => {
              setStep("published");
            }}
          >
            {t.confirmPublish}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setStep("idle")}>
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
      <p className="text-body">{t.choosePhoto}</p>
      <label className="mt-4 block">
        <span className="sr-only">{t.uploadImage}</span>
        <input
          type="file"
          accept="image/*"
          className="block w-full text-body"
          onChange={() => startRead()}
        />
      </label>
      <div className="mt-4">
        <Button type="button" onClick={startRead}>
          {t.uploadImage}
        </Button>
      </div>
    </Card>
  );
}
