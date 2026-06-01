const steps = [
  {
    number: "01",
    title: "Discovery",
    description: "We interview the business, review the customer journey, and identify where leads, time, or revenue are leaking.",
    icon: "🔍",
  },
  {
    number: "02",
    title: "Strategy",
    description: "We define the workflow, data needs, guardrails, handoff rules, and success metrics before writing code.",
    icon: "📋",
  },
  {
    number: "03",
    title: "Build",
    description: "You see the agent, automation, or AI website in action early so the solution can be refined around real use cases.",
    icon: "⚙️",
  },
  {
    number: "04",
    title: "Optimize",
    description: "We connect to your lead flow, monitor performance, and improve prompts, automation steps, and conversion points.",
    icon: "📈",
  },
];

export function ProcessSteps() {
  return (
    <section id="process" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#4B0082]">How it works</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
            A clear path from discovery to launch
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#4B0082]/20 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-4xl font-black text-[#4B0082]/10">{step.number}</span>
              </div>
              <h3 className="mt-6 text-xl font-black text-[#161616]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
