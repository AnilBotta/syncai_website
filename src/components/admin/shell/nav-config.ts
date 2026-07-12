import {
  CalendarClock,
  Columns3,
  Crosshair,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Radar,
  SendHorizonal,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type View =
  | "overview"
  | "manager"
  | "pipeline"
  | "leads"
  | "approvals"
  | "targeting"
  | "prospects"
  | "sequences"
  | "finance"
  | "appointments"
  | "tasks";

export type NavItem = { view: View; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

/** Single source of truth for admin navigation (sidebar + quick-jump). */
export const navGroups: NavGroup[] = [
  {
    label: "Home",
    items: [
      { view: "overview", label: "Overview", icon: LayoutDashboard },
      { view: "manager", label: "AI Manager", icon: Sparkles },
    ],
  },
  {
    label: "Sales",
    items: [
      { view: "pipeline", label: "Pipeline", icon: Columns3 },
      { view: "leads", label: "Leads", icon: Users },
      { view: "approvals", label: "Approvals", icon: Inbox },
    ],
  },
  {
    label: "Growth",
    items: [
      { view: "targeting", label: "Targeting", icon: Crosshair },
      { view: "prospects", label: "Prospects", icon: Radar },
      { view: "sequences", label: "Sequences", icon: SendHorizonal },
    ],
  },
  {
    label: "Operations",
    items: [
      { view: "finance", label: "Finance", icon: Wallet },
      { view: "appointments", label: "Appointments", icon: CalendarClock },
      { view: "tasks", label: "Tasks", icon: ListChecks },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

/** H1 shown in the topbar per view. */
export const viewTitles: Record<View, string> = {
  overview: "Overview",
  manager: "AI Manager",
  pipeline: "Pipeline",
  leads: "Leads",
  approvals: "Approval Inbox",
  targeting: "Targeting",
  prospects: "Prospects",
  sequences: "Sequences",
  finance: "Finance",
  appointments: "Appointments",
  tasks: "Tasks",
};
