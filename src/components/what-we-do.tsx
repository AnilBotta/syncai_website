import { Search, Code2, Rocket } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

const steps = [
  {
    number: "01",
    title: "Understand",
    description: "We audit your business, customer journey, and operations to find where AI creates the most value.",
    icon: Search,
  },
  {
    number: "02",
    title: "Build",
    description: "We design and build the right AI system — website, agent, or automation — tailored to your workflow.",
    icon: Code2,
  },
  {
    number: "03",
    title: "Deploy",
    description: "We launch, connect to your lead flow, and optimize for real results and measurable ROI.",
    icon: Rocket,
  },
];

export function WhatWeDo() {
  return (
    <section id="what-we-do" className="bg-[#f8f9fc] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[.25em] text-[#4B0082]">What we do</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#161616] sm:text-5xl">
            AI strategy, built and deployed
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Most businesses do not need random AI tools. They need a practical system designed around their
            customer journey, team capacity, and revenue goals.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <TiltCard className="h-full rounded-[2rem]">
                <div className="group h-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm transition hover:border-[#4B0082]/20 hover:shadow-md">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-[#4B0082]/10 text-[#4B0082]">
                    <step.icon className="size-6" />
                  </span>
                  <p className="mt-6 text-sm font-black text-[#9400D3]">Step {step.number}</p>
                  <h3 className="mt-2 text-xl font-black text-[#161616]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
