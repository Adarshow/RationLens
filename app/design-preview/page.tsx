const colors = [
  { name: "Paper", hex: "#F3F5F2", className: "bg-paper text-ink border-line" },
  { name: "Ink", hex: "#1C2B24", className: "bg-ink text-paper" },
  { name: "Stamp", hex: "#0D6B4F", className: "bg-stamp text-white" },
  { name: "Muted", hex: "#4A5C54", className: "bg-muted text-white" },
  { name: "Line", hex: "#C5CFC8", className: "bg-line text-ink" },
] as const;

const statuses = [
  { word: "Available", className: "bg-available-bg text-available" },
  { word: "Low Stock", className: "bg-low-bg text-low" },
  { word: "Out of Stock", className: "bg-out-bg text-out" },
  { word: "Info may be outdated", className: "bg-outdated-bg text-outdated" },
] as const;

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <p className="text-sm font-medium text-stamp">Step 1 · Design tokens</p>
      <h1 className="mt-2 font-serif text-title">Notice-board civic</h1>
      <p className="mt-3 text-body text-muted">
        Form-paper background, forest stamp for actions, serif titles like a
        public notice. Status always includes a word, not only a colour.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">Colour</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {colors.map((color) => (
            <div
              key={color.name}
              className={`min-h-[88px] border px-3 py-3 ${color.className}`}
            >
              <p className="font-semibold">{color.name}</p>
              <p className="text-sm">{color.hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">Status (colour + word)</h2>
        <div className="mt-4 flex flex-col gap-2">
          {statuses.map((status) => (
            <span
              key={status.word}
              className={`inline-flex min-h-tap w-fit items-center border border-current px-3 text-base font-semibold ${status.className}`}
            >
              {status.word}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">Type</h2>
        <p className="mt-3 font-serif text-2xl font-bold">
          Nearby ration shops
        </p>
        <p className="mt-2 text-body">
          Body text stays at 17px. Malayalam uses the same stack: അരി ലഭ്യമാണ്.
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">12 kg · 2.4 km</p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">Buttons</h2>
        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            className="inline-flex min-h-tap items-center justify-center bg-stamp px-5 text-base font-semibold text-white hover:bg-stamp-dark"
          >
            View shop
          </button>
          <button
            type="button"
            className="inline-flex min-h-tap items-center justify-center border-2 border-ink bg-paper px-5 text-base font-semibold text-ink"
          >
            Show map
          </button>
        </div>
      </section>

      <section className="mt-8 border border-line bg-white p-4">
        <h2 className="font-serif text-xl font-semibold">Shop card sample</h2>
        <p className="mt-1 text-muted">1.2 km away</p>
        <p className="mt-3 text-body">
          Updated 10 minutes ago · Source: Shopkeeper · Verified
        </p>
      </section>
    </main>
  );
}
