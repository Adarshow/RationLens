import type { ReactNode } from "react";

type Props = {
  title: string;
  body?: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 py-8 text-center">
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
      <p className="text-sm font-semibold text-ink md:text-base">{title}</p>
      {body ? (
        <p className="text-sm text-ink/70 md:text-base">{body}</p>
      ) : null}
      {action ? <div className="w-full">{action}</div> : null}
    </div>
  );
}
