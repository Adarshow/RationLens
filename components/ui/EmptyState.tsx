import type { ReactNode } from "react";

type Props = {
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="flex flex-col items-start gap-3 py-6 text-left">
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-paper-dim text-ink"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect
            x="4"
            y="5"
            width="16"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M8 10h8M8 14h5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      {body ? <p className="text-body text-ink/70">{body}</p> : null}
      {action ? <div className="w-full">{action}</div> : null}
    </div>
  );
}
