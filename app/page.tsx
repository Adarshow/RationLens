import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-serif text-title">RationLens</h1>
      <p className="mt-3 text-body text-muted">
        Design tokens are ready. Open the swatch page to review the look before
        real screens are built.
      </p>
      <Link
        href="/design-preview"
        className="mt-8 inline-flex min-h-tap items-center justify-center border-2 border-stamp bg-stamp px-5 text-base font-semibold text-white"
      >
        Open design preview
      </Link>
    </main>
  );
}
