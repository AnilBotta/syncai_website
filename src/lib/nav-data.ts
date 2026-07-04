export type DropdownItem = {
  number: string;
  label: string;
  href: string;
};

export const servicesDropdown: DropdownItem[] = [
  { number: "01", label: "AI Voice Bots & Chatbots", href: "/services/ai-voice-bots-and-chatbots" },
  { number: "02", label: "AI Automation & Workflows", href: "/services/ai-automation-and-workflows" },
  { number: "03", label: "AI Marketing & Growth", href: "/services/ai-marketing-and-growth" },
  { number: "04", label: "AI Strategy Consulting", href: "/services/ai-strategy-consulting" },
  { number: "05", label: "AI Training & Enablement", href: "/services/ai-training-and-enablement" },
  { number: "06", label: "Premium Website Development", href: "/services/premium-website-development" },
];

export const toolsDropdown: DropdownItem[] = [
  { number: "01", label: "ROI Calculator", href: "/tools/roi-calculator" },
  { number: "02", label: "AI Readiness Assessment", href: "/tools/ai-readiness" },
  { number: "03", label: "Chatbot Cost Calculator", href: "/tools/chatbot-cost-calculator" },
  { number: "04", label: "Conversion Audit", href: "/tools/conversion-audit" },
];

/** Flat nav links (dropdowns are interleaved by the header at render time). */
export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  // Services dropdown slots here
  { label: "Results", href: "/case-studies" },
  // Tools dropdown slots here
  { label: "Blog", href: "/blog" },
  { label: "Book a call", href: "/book" },
  { label: "Contact", href: "/contact" },
];
