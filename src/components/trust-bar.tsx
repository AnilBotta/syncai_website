export function TrustBar() {
  const logos = [
    "Shopify",
    "HubSpot",
    "Stripe",
    "Twilio",
    "Zapier",
    "OpenAI",
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[.2em] text-slate-400">
          Built on the platforms you already use
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-bold text-slate-300 transition hover:text-slate-400"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
