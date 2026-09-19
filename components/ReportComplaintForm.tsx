"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Props = {
  shopId: string;
};

export function ReportComplaintForm({ shopId }: Props) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("overcharging");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    
    try {
      const res = await fetch("/api/complaints/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, category, description }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to submit report. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) {
    return (
      <Button 
        type="button" 
        variant="secondary" 
        fullWidth 
        onClick={() => setIsOpen(true)}
        className="mt-4"
      >
        {t.reportIssue}
      </Button>
    );
  }

  if (success) {
    return (
      <Card variant="alert" tone="success" className="mt-4">
        <p className="text-sm font-semibold">{t.complaintSubmitted}</p>
        <Button 
          type="button" 
          variant="ghost" 
          fullWidth={false}
          className="mt-2"
          onClick={() => {
            setIsOpen(false);
            setSuccess(false);
            setDescription("");
            setCategory("overcharging");
          }}
        >
          {t.dismiss}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-4 border border-paper-dim shadow-sm">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h3 className="font-bold text-ink">{t.reportIssue}</h3>
        
        <Select
          id="category"
          label={t.complaintCategory}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="overcharging">{t.categoryOvercharging}</option>
          <option value="wrong_stock">{t.categoryWrongStock}</option>
          <option value="behavior">{t.categoryBehavior}</option>
          <option value="other">{t.categoryOther}</option>
        </Select>

        <Textarea
          id="description"
          label={t.complaintDescription}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {error ? (
          <p className="text-sm text-laterite font-medium">{error}</p>
        ) : null}

        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            fullWidth={false}
            onClick={() => setIsOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" fullWidth={false} disabled={pending}>
            {t.submitComplaint}
          </Button>
        </div>
      </form>
    </Card>
  );
}
