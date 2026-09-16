"use client";

import { useState } from "react";
import Link from "next/link";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useLanguage } from "@/components/LanguageProvider";
import { mockImageDetection } from "@/lib/mockData";
import type { ExtractedStockItem } from "@/lib/types";
import { fieldClassName } from "@/lib/ui";

type Step = "idle" | "loading" | "review" | "published";

export function ImageUploadFlow() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("idle");
  const [rows, setRows] = useState<ExtractedStockItem[]>(mockImageDetection.items);

  function startRead() {
    setStep("loading");
    window.setTimeout(() => {
      // TODO: replace with real AI image analysis route
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
      <div className="border border-line bg-paper p-4">
        <p className="text-body">{t.published}</p>
        <Link href="/shopkeeper" className="mt-4 block">
          <PrimaryButton type="button">{t.back}</PrimaryButton>
        </Link>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="border border-line bg-paper p-4">
        <p className="text-body">{t.reading}</p>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="border border-line bg-paper p-4">
        <h2 className="font-serif text-xl font-semibold">{t.weDetected}</h2>
        <p className="mt-2 text-body text-muted">{t.checkNumbers}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row, index) => (
            <li key={row.item} className="border border-line bg-paper p-4">
              <label className="font-semibold" htmlFor={`detected-${index}`}>
                {row.item}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={`detected-${index}`}
                  className={fieldClassName}
                  type="number"
                  min={0}
                  value={row.quantity}
                  onChange={(event) =>
                    updateRow(index, { quantity: Number(event.target.value) })
                  }
                />
                <span className="flex min-h-tap items-center text-body text-muted">
                  {row.unit}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton
            type="button"
            onClick={() => {
              // TODO: replace with real confirm-analysis API
              setStep("published");
            }}
          >
            {t.confirmPublish}
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => setStep("idle")}>
            {t.retake}
          </SecondaryButton>
          <Link href="/shopkeeper" className="block">
            <SecondaryButton type="button">{t.enterManually}</SecondaryButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-line bg-paper p-4">
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
        <PrimaryButton type="button" onClick={startRead}>
          {t.uploadImage}
        </PrimaryButton>
      </div>
    </div>
  );
}
