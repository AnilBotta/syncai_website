import { Plus } from "lucide-react";

/**
 * FAQ list built on native <details>/<summary>.
 *
 * No JavaScript owns the open state, so it works before hydration, is keyboard
 * and screen-reader accessible for free, and Ctrl+F can find text inside a
 * closed answer in browsers that support it. Only the icon rotation is CSS.
 */
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-t border-border-subtle">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-border-subtle">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg transition-colors hover:text-brand-glow-text [&::-webkit-details-marker]:hidden">
            <span className="font-serif">{item.question}</span>
            <Plus
              aria-hidden
              className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45"
            />
          </summary>
          <p className="max-w-2xl pb-7 leading-8 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
