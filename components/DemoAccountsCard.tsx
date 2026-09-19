"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";

type DemoAccount = {
  email: string;
  password: string;
  roleLabel: string;
  shopLabel?: string;
  features: string[];
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "citizen@gmail.com",
    password: "citizen123",
    roleLabel: "Citizen",
    features: [
      "Search nearby shops by voice or text, list/map view",
      "View live stock with trust badges and update history",
      "Know Your Rights — ration card entitlement lookup with read-aloud",
      "Get notified when an out-of-stock item comes back",
      "Report overcharging or other shop issues",
    ],
  },
  {
    email: "shopkeeper@gmail.com",
    password: "shopkeeper",
    roleLabel: "Shopkeeper",
    shopLabel: "Shop A/B (Kozhikode)",
    features: [
      "Update stock manually or via photo (AI-assisted read, human-confirmed before publish)",
      "View update history / audit log",
      "View citizen restock requests",
    ],
  },
  {
    email: "supplycothrikkakkara@gmail.com",
    password: "demo123",
    roleLabel: "Shopkeeper",
    shopLabel: "Supplyco Thrikkakara (Kochi)",
    features: [
      "Update stock manually or via photo (AI-assisted read, human-confirmed before publish)",
      "View update history / audit log",
      "View citizen restock requests",
    ],
  },
  {
    email: "supplycokangarappady@gmail.com",
    password: "demo123",
    roleLabel: "Shopkeeper",
    shopLabel: "Supplyco Kangarappady (Kochi)",
    features: [
      "Update stock manually or via photo (AI-assisted read, human-confirmed before publish)",
      "View update history / audit log",
      "View citizen restock requests",
    ],
  },
  {
    email: "supplycothengod@gmail.com",
    password: "demo123",
    roleLabel: "Shopkeeper",
    shopLabel: "Supplyco Thengod (Kochi)",
    features: [
      "Update stock manually or via photo (AI-assisted read, human-confirmed before publish)",
      "View update history / audit log",
      "View citizen restock requests",
    ],
  },
  {
    email: "shopc@gmail.com",
    password: "demo123",
    roleLabel: "Shopkeeper",
    shopLabel: "Shop C (Kozhikode)",
    features: [
      "Update stock manually or via photo (AI-assisted read, human-confirmed before publish)",
      "View update history / audit log",
      "View citizen restock requests",
    ],
  },
  {
    email: "admin@gmail.com",
    password: "admin123",
    roleLabel: "Admin",
    features: [
      "Review and approve/reject shopkeeper identity verification requests",
      "Review and resolve citizen-reported complaints",
    ],
  },
];

export function DemoAccountsCard({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold text-ink">Demo accounts (for judges)</span>
        <span className="text-xs text-ink/60">{open ? "Hide" : "Show"}</span>
      </button>
      <p className="mt-1 text-xs text-ink/60">
        These login details are provided for easy access during judging. Tap an account to autofill the form above.
      </p>
      {open ? (
        <div className="mt-3 flex flex-col gap-3">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelect(acc.email, acc.password)}
              className="rounded-lg border border-paper-dim p-3 text-left hover:bg-paper-dim transition-colors"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-bold text-backwater">{acc.roleLabel}</span>
                {acc.shopLabel ? (
                  <span className="text-xs text-ink/60">{acc.shopLabel}</span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs font-mono text-ink/80">
                {acc.email} / {acc.password}
              </p>
              <ul className="mt-2 list-disc pl-4 text-xs text-ink/70 leading-relaxed">
                {acc.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
