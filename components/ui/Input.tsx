import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "h-11 w-full rounded-lg border bg-white px-3 text-sm text-ink md:h-10 md:text-base";

function fieldBorder(hasError?: boolean) {
  return hasError
    ? "border-laterite text-laterite focus:border-laterite"
    : "border-paper-dim text-ink focus:border-backwater";
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  invalid?: boolean;
};

export function Input({
  id,
  label,
  error,
  invalid,
  className,
  ...props
}: InputProps) {
  const hasError = Boolean(error) || invalid;
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={cn("mt-2", controlClass, fieldBorder(hasError), className)}
        aria-invalid={hasError ? true : undefined}
      />
      {error ? (
        <p className="mt-1 text-sm font-medium text-laterite">{error}</p>
      ) : null}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: ReactNode;
};

export function Select({
  id,
  label,
  error,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        {...props}
        className={cn("mt-2", controlClass, fieldBorder(Boolean(error)), className)}
        aria-invalid={error ? true : undefined}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-sm font-medium text-laterite">{error}</p>
      ) : null}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  invalid?: boolean;
};

export function Textarea({
  id,
  label,
  error,
  invalid,
  className,
  ...props
}: TextareaProps) {
  const hasError = Boolean(error) || invalid;
  const textareaClass = "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink md:text-base";
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        {...props}
        className={cn("mt-2", textareaClass, fieldBorder(hasError), className)}
        aria-invalid={hasError ? true : undefined}
      />
      {error ? (
        <p className="mt-1 text-sm font-medium text-laterite">{error}</p>
      ) : null}
    </div>
  );
}
