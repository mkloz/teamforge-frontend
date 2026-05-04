import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Globe,
  Handshake,
  Home,
  Info,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  Search,
  Settings2,
  Sparkles,
  Unlock,
  User,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Avatar } from "@/shared/components/common/avatar";
import {
  FileDropzone,
  FilePreviewList,
} from "@/shared/components/common/file-dropzone";
import { Image } from "@/shared/components/common/image";
import {
  AddressAutocomplete,
  type LocationValue,
} from "@/shared/components/maps/address-autocomplete";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { DateInput } from "@/shared/components/ui/date-input";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NumberInput } from "@/shared/components/ui/number-input";
import { Progress } from "@/shared/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { TimeInput } from "@/shared/components/ui/time-input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Toggle } from "@/shared/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const actionVariants = [
  { label: "Primary", variant: "primary", icon: Zap },
  { label: "Secondary", variant: "secondary", icon: Sparkles },
  { label: "Outline", variant: "outline", icon: Settings2 },
  { label: "Ghost", variant: "ghost", icon: User },
] as const;

const colorTokens = [
  {
    name: "Forge Teal",
    token: "bg-forge-teal",
    value: "#0D9488",
    use: "Primary actions, active states, trust-building accents.",
  },
  {
    name: "Spark Amber",
    token: "bg-spark-amber",
    value: "#F59E0B",
    use: "Highlights, notifications, warm secondary action moments.",
  },
  {
    name: "Canvas",
    token: "bg-canvas",
    value: "#FAFAF8",
    use: "Primary app surface and calm empty space.",
  },
  {
    name: "Ink",
    token: "bg-ink",
    value: "#1C1C1A",
    use: "Headings, dark sections, high-emphasis borders.",
  },
  {
    name: "Slate Muted",
    token: "bg-slate-muted",
    value: "#6B7280",
    use: "Secondary copy, metadata, low-emphasis icons.",
  },
] as const;

const navigationItems = [
  { label: "Home", icon: Zap, active: false },
  { label: "Forge", icon: Sparkles, active: true },
  { label: "Activity", icon: MessageCircle, active: false },
  { label: "Profile", icon: User, active: false },
] as const;

const categoryFilters = [
  "All",
  "Tech",
  "Sports",
  "Arts",
  "Social",
  "Outdoors",
  "Learning",
  "Music",
  "Food",
  "Gaming",
  "Wellness",
  "Travel",
  "Other",
] as const;

const locationFilters = [
  { id: "ALL", label: "Any", icon: Globe, active: true },
  { id: "LOCAL", label: "Local", icon: MapPin, active: false },
  { id: "ONLINE", label: "Online", icon: Laptop, active: false },
] as const;

const accessFilters = [
  { id: "ALL", label: "Any", icon: Users, active: true },
  { id: "OPEN", label: "Open", icon: Unlock, active: false },
  { id: "REQUEST", label: "Req", icon: Handshake, active: false },
] as const;

const statusItems = [
  {
    title: "Success",
    body: "Your group is ready.",
    icon: CheckCircle2,
    className: "border-forge-teal/25 bg-forge-teal/8 text-forge-teal",
  },
  {
    title: "Info",
    body: "Exact coordinates stay private.",
    icon: Info,
    className: "border-border bg-muted/40 text-slate-muted",
  },
  {
    title: "Needs attention",
    body: "Add a title before continuing.",
    icon: AlertCircle,
    className: "border-spark-amber/35 bg-spark-amber/10 text-ink",
  },
] as const;

const locationTypeOptions = [
  {
    id: "IN_PERSON",
    label: "In person",
    sub: "Specific address",
    icon: Home,
    selected: true,
  },
  {
    id: "TBD",
    label: "To be decided",
    sub: "Confirm later",
    icon: Globe,
    selected: false,
  },
  {
    id: "ONLINE",
    label: "Virtual",
    sub: "Online meeting",
    icon: Monitor,
    selected: false,
  },
] as const;

const implementationPicks = [
  ["Actions", "shared/ui/button"],
  ["Fields", "shared/ui/input + label"],
  ["Choices", "shared/ui/select + radio + toggle"],
  ["Feedback", "shared/ui/progress + skeleton"],
  ["Surfaces", "shared/ui/card + dialogs"],
  ["Media", "shared/common/avatar + image + dropzone"],
] as const;

const sharedPrimitiveRows = [
  {
    primitive: "Button",
    source: "@/shared/components/ui/button",
    baseline: "All commands use this for size, loading, focus, and hierarchy.",
    featureChrome:
      "Feature screens may adjust label, icon, and surrounding layout only.",
  },
  {
    primitive: "Input + Label",
    source: "@/shared/components/ui/input, label",
    baseline:
      "All text fields share height, border, focus, disabled, and error behavior.",
    featureChrome:
      "Forge/Auth can wrap the input, but the core field must feel identical.",
  },
  {
    primitive: "Select / Radio / Toggle",
    source: "@/shared/components/ui/select, radio-group, toggle",
    baseline:
      "All choices share keyboard behavior, focus rings, and selected states.",
    featureChrome:
      "Use visual cards only for explained product choices, not regular form fields.",
  },
  {
    primitive: "Card / Feedback",
    source: "@/shared/components/ui/card, progress, skeleton",
    baseline:
      "Shared surfaces define border, radius, loading, and progress states.",
    featureChrome:
      "Feature cards can adjust density and media; operational panels stay quieter.",
  },
] as const;

function Section({
  id,
  title,
  eyebrow,
  description,
  children,
}: {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-5">
      <div className="grid gap-3 border-b border-border pb-4 lg:grid-cols-[18rem_1fr]">
        <div>
          <p className="text-nano font-black uppercase tracking-widest text-forge-teal">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-normal text-ink">
            {title}
          </h2>
        </div>
        <p className="max-w-3xl text-sm font-medium leading-6 text-slate-muted">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function RuleCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs">
      <p className="text-xs font-black uppercase tracking-widest text-slate-muted">
        {title}
      </p>
      <div className="mt-3 text-sm font-medium leading-6 text-ink">
        {children}
      </div>
    </div>
  );
}

function PickNote({ label, source }: { label: string; source: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2.5 py-1 text-micro font-black uppercase tracking-wider text-forge-teal">
      <Check className="size-3" />
      {label}: {source}
    </span>
  );
}

function ComponentFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl border-border/70 shadow-xs hover:shadow-sm">
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm font-black">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs leading-5">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function PrimitiveContract() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs">
      <div className="grid border-b border-border/70 bg-muted/25 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-muted md:grid-cols-[8rem_14rem_1fr_1fr]">
        <span>Primitive</span>
        <span>Source</span>
        <span>Baseline contract</span>
        <span>Allowed feature chrome</span>
      </div>
      {sharedPrimitiveRows.map((row) => (
        <div
          key={row.primitive}
          className="grid gap-2 border-b border-border/60 px-4 py-3 text-sm last:border-b-0 md:grid-cols-[8rem_14rem_1fr_1fr]"
        >
          <span className="font-black text-ink">{row.primitive}</span>
          <code className="text-micro font-bold text-forge-teal">
            {row.source}
          </code>
          <span className="font-medium leading-5 text-slate-muted">
            {row.baseline}
          </span>
          <span className="font-medium leading-5 text-slate-muted">
            {row.featureChrome}
          </span>
        </div>
      ))}
    </div>
  );
}

function IconTile({
  icon: Icon,
  label,
  active,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-[background-color,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/40",
        active
          ? "bg-forge-teal text-white"
          : "border border-border bg-card text-slate-muted hover:border-forge-teal/25 hover:bg-forge-teal/5 hover:text-ink",
      )}
    >
      <Icon size={17} strokeWidth={1.8} />
      <span>{label}</span>
    </Button>
  );
}

function LocationChoiceCard({
  label,
  sub,
  icon: Icon,
  selected,
}: {
  label: string;
  sub: string;
  icon: LucideIcon;
  selected: boolean;
}) {
  return (
    <Button
      type="button"
      aria-pressed={selected}
      variant="ghost"
      className={cn(
        "group h-auto justify-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-150 focus-visible:ring-forge-teal/35",
        selected
          ? "border-forge-teal/30 bg-forge-teal/8 ring-1 ring-forge-teal/20"
          : "border-border/50 bg-background/40 hover:border-forge-teal/20 hover:bg-forge-teal/4",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
          selected
            ? "bg-forge-teal text-white shadow-sm shadow-forge-teal/20"
            : "bg-muted/60 text-slate-muted group-hover:bg-forge-teal/10 group-hover:text-forge-teal",
        )}
      >
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-xs font-semibold leading-tight",
            selected ? "text-forge-teal" : "text-ink",
          )}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-micro leading-tight text-slate-muted/70">
          {sub}
        </span>
      </span>
    </Button>
  );
}

function CategoryChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className={cn(
        "h-auto rounded-full border-2 px-3 py-1 text-[10px] transition-[transform,border-color,background-color,color,box-shadow] duration-150",
        active
          ? "border-button-primary-border bg-forge-teal text-white shadow-button-primary -translate-y-0.5"
          : "border-border bg-background text-slate-muted hover:border-forge-teal/50 hover:text-ink",
      )}
    >
      {label}
    </Button>
  );
}

function SegmentedFilter({
  items,
}: {
  items: ReadonlyArray<{
    label: string;
    icon: LucideIcon;
    active: boolean;
  }>;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-border/40 bg-muted/20 p-1">
      {items.map(({ label, icon: Icon, active }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          className={cn(
            "relative h-auto flex-1 gap-2 rounded-lg py-2 text-xs transition-[transform,background-color,color,box-shadow] duration-200 focus-visible:ring-forge-teal/45",
            active
              ? "bg-background text-ink shadow-sm ring-1 ring-border/20"
              : "text-slate-muted/70 hover:bg-muted/40 hover:text-ink active:scale-95",
          )}
        >
          <Icon
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              active ? "text-forge-teal" : "opacity-70",
            )}
          />
          <span className="whitespace-nowrap tracking-tight">{label}</span>
        </Button>
      ))}
    </div>
  );
}

function SwitchRow({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-4 text-left transition-colors",
        checked
          ? "border-forge-teal/25 bg-forge-teal/8"
          : "border-border/70 bg-canvas",
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-slate-muted">
          {description}
        </span>
      </span>
      <Switch checked={checked} aria-label={title} />
    </div>
  );
}

function SliderExample({
  accent = "teal",
  range = false,
}: {
  accent?: "teal" | "amber";
  range?: boolean;
}) {
  return (
    <Slider
      className={cn(
        "h-10",
        accent === "amber" &&
          "[&_[data-slot=slider-range]]:bg-spark-amber [&_[data-slot=slider-thumb]]:border-spark-amber",
      )}
      defaultValue={range ? [3, 7] : [5]}
      min={2}
      max={8}
      step={1}
      minStepsBetweenThumbs={range ? 1 : undefined}
      aria-label={range ? "Group size range" : "Group size"}
    />
  );
}

function DateTile() {
  return (
    <div
      className="flex w-13 shrink-0 flex-col items-center overflow-hidden rounded-lg border border-border/50 bg-background shadow-xs"
      aria-hidden="true"
    >
      <div className="w-full border-b border-border/50 bg-muted py-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-muted">
        Mar
      </div>
      <div className="flex w-full flex-col items-center py-1.5">
        <span className="text-xl font-black leading-none text-ink">14</span>
        <span className="mt-0.5 text-[10px] font-bold text-slate-muted">
          Sat
        </span>
      </div>
    </div>
  );
}

function StatusCallout({
  title,
  body,
  icon: Icon,
  className,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  className: string;
}) {
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="text-sm font-black text-ink">{title}</p>
        <p className="mt-0.5 text-xs font-medium leading-5 text-slate-muted">
          {body}
        </p>
      </div>
    </div>
  );
}

export function DesignSystemPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [demoLocation, setDemoLocation] = useState<LocationValue | null>(null);
  const [demoCost, setDemoCost] = useState("12.50");
  const [demoDate, setDemoDate] = useState("2026-03-14");
  const [demoTime, setDemoTime] = useState("18:30");

  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-forge-teal/20">
      <div className="mx-auto flex max-w-360 gap-8 px-5 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 rounded-xl border border-border/70 bg-card p-3 shadow-xs lg:block">
          <p className="px-3 py-2 text-nano font-black uppercase tracking-widest text-slate-muted">
            System
          </p>
          <nav className="grid gap-1">
            {[
              ["Foundations", "#foundations"],
              ["Actions", "#actions"],
              ["Forms", "#forms"],
              ["Selection", "#selection"],
              ["Search", "#search-location"],
              ["Surfaces", "#surfaces"],
              ["Feedback", "#feedback"],
              ["Media", "#media"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-muted transition-colors hover:bg-forge-teal/8 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-12 pb-20">
          <header className="rounded-xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-nano font-black uppercase tracking-widest text-forge-teal">
                  TeamForge Design System
                </p>
                <h1 className="mt-2 text-display-md font-black tracking-normal text-ink">
                  Universal UI agreement
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-muted">
                  This page sets the shared component contract first. Feature
                  screens can keep their personality, but common elements should
                  behave and feel the same across Auth, Forge, Settings,
                  Activity, and Explore.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {implementationPicks.map(([label, source]) => (
                    <PickNote key={label} label={label} source={source} />
                  ))}
                </div>
              </div>
              <div className="grid gap-2 text-xs font-bold text-slate-muted sm:grid-cols-3 lg:w-96">
                <div className="rounded-lg border border-border/70 bg-canvas p-3">
                  <span className="block text-ink">Density</span>
                  Operational
                </div>
                <div className="rounded-lg border border-border/70 bg-canvas p-3">
                  <span className="block text-ink">Tone</span>
                  Clear, warm
                </div>
                <div className="rounded-lg border border-border/70 bg-canvas p-3">
                  <span className="block text-ink">Motion</span>
                  150-300ms
                </div>
              </div>
            </div>
          </header>

          <Section
            id="foundations"
            eyebrow="01 / Foundations"
            title="Tokens before components"
            description="The app does not need a redesign. It needs agreement on the primitives that appear everywhere, then restrained feature chrome around them."
          >
            <PrimitiveContract />

            <div className="grid gap-4 lg:grid-cols-5">
              {colorTokens.map((color) => (
                <div
                  key={color.name}
                  className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs"
                >
                  <div className={cn("h-18", color.token)} />
                  <div className="space-y-2 p-4">
                    <p className="text-sm font-black">{color.name}</p>
                    <p className="text-micro font-bold text-slate-muted">
                      {color.value}
                    </p>
                    <p className="text-xs font-medium leading-5 text-slate-muted">
                      {color.use}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <RuleCard title="Typography">
                <p>
                  Use one sans family, no negative letter spacing, and reserve
                  display sizes for page headers. Compact panels use 12-16px
                  text with clear weight changes.
                </p>
              </RuleCard>
              <RuleCard title="Radius">
                <p>
                  Core panels use <code>rounded-xl</code>. Rich product cards
                  can use <code>rounded-2xl</code> when the image or object
                  needs a softer frame. Inputs and compact controls use{" "}
                  <code>rounded-lg</code>. Avatars and pills stay fully rounded.
                </p>
              </RuleCard>
              <RuleCard title="Motion">
                <p>
                  Prefer explicit transitions like border, color, shadow, and
                  transform. Avoid broad <code>transition-all</code> for shared
                  components.
                </p>
              </RuleCard>
            </div>
          </Section>

          <Section
            id="actions"
            eyebrow="02 / Actions"
            title="Buttons and commands"
            description="Canonical pick: the shared Button V2. Keep mechanical press physics, clear hierarchy, and explicit loading/disabled states."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <ComponentFrame
                title="Button variants"
                description="Primary for the page action, secondary for warm emphasis, outline for neutral action, ghost for low-emphasis utilities."
              >
                <div className="flex flex-wrap items-center gap-3">
                  {actionVariants.map(({ label, variant, icon: Icon }) => (
                    <Button key={variant} variant={variant}>
                      <Icon className="size-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Sizes"
                description="Use only when hierarchy or available space changes, not for visual novelty."
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">XS</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </ComponentFrame>

              <ComponentFrame title="Action states and icons">
                <div className="flex flex-wrap items-center gap-3">
                  <Button loading>Forging</Button>
                  <Button disabled>Disabled</Button>
                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <AlertCircle className="size-4" />
                    Danger
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Settings">
                    <Settings2 className="size-4" />
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Alerts"
                        >
                          <Bell className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Notification settings</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="forms"
            eyebrow="03 / Forms"
            title="Inputs, labels, and help"
            description="Canonical pick: shared Input and Label own behavior. Forge/Auth/Search can add icons or compact layout, but focus, disabled, error, and height should come from the same contract."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <ComponentFrame
                title="Shared field baseline"
                description="Use this shape everywhere first. Feature-specific fields should extend it, not replace it."
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ds-title">Plan title</Label>
                    <Input id="ds-title" placeholder="Wednesday basketball" />
                    <p className="text-xs font-medium text-slate-muted">
                      Same label, height, placeholder, focus, and disabled
                      treatment across Auth, Forge, Settings, and dialogs.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ds-cost">Cost estimate</Label>
                    <NumberInput
                      id="ds-cost"
                      allowDecimal
                      min={0}
                      step={0.01}
                      value={demoCost}
                      onValueChange={setDemoCost}
                      placeholder="12.50"
                    />
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Feature chrome around shared input"
                description="Icons and compact sizing are allowed, but the inner control remains the shared input."
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="ds-search">Search</Label>
                    <Input
                      id="ds-search"
                      leftIcon={<Search className="size-4" />}
                      placeholder="Find your next group activity..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ds-description">Description</Label>
                    <div className="rounded-lg border border-border/60 bg-background/60 transition-colors duration-150 focus-within:border-forge-teal/60 focus-within:ring-2 focus-within:ring-forge-teal/12">
                      <Textarea
                        id="ds-description"
                        className="min-h-24 resize-none rounded-lg border-0 bg-transparent px-3 py-3 text-sm font-medium text-ink shadow-none placeholder:text-slate-muted/55 focus-visible:ring-0"
                        placeholder="Add context people need before joining."
                      />
                    </div>
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Validation states"
                description="Use compact copy near the field. Do not change layout height on hover."
              >
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="ds-location">Location</Label>
                    <Input
                      id="ds-location"
                      aria-invalid
                      leftIcon={<MapPin className="size-4" />}
                      placeholder="Search venue or city"
                    />
                    <p className="flex items-center gap-2 text-xs font-medium text-destructive">
                      <AlertCircle className="size-3.5" />
                      Choose a result or keep location as TBD.
                    </p>
                  </div>
                  <div className="rounded-xl border border-forge-teal/20 bg-forge-teal/8 p-3">
                    <div className="flex items-center gap-2 text-sm font-black text-ink">
                      <Check className="size-4 text-forge-teal" />
                      Looks good
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-muted">
                      This field is ready to submit.
                    </p>
                  </div>
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="search-location"
            eyebrow="04 / Common App Inputs"
            title="Search, categories, and location"
            description="These are used constantly across Explore, Forge, onboarding, and settings. They should keep the app's current personality while sharing predictable input behavior."
          >
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <ComponentFrame
                title="Search"
                description="Use shared input behavior with the compact Explore chrome for search-heavy views."
              >
                <div className="grid gap-4">
                  <Input
                    leftIcon={<Search className="size-3.5" />}
                    placeholder="Find your next group activity..."
                  />
                  <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                    {categoryFilters.map((category) => (
                      <CategoryChip
                        key={category}
                        label={category}
                        active={category === "All"}
                      />
                    ))}
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Location autocomplete"
                description="Use the real shared maps component. It owns loading, fallback, clear action, and privacy helper copy."
              >
                <AddressAutocomplete
                  value={demoLocation}
                  onLocationSelect={setDemoLocation}
                  label="Address or venue"
                  badge="City stays public"
                  hint="Exact point is used for matching only. Other members see your city."
                  placeholder="Search address or venue name..."
                />
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="selection"
            eyebrow="05 / Selection"
            title="Choices and filters"
            description="Canonical pick: shared Select, RadioGroup, Toggle, and consistent Radix slider styling. Visual cards and settings rows are product wrappers around those decisions."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <ComponentFrame
                title="Visual choice cards"
                description="Best for 2-4 choices that need explanation."
              >
                <div className="grid gap-2 md:grid-cols-3">
                  {locationTypeOptions.map((option) => (
                    <LocationChoiceCard
                      key={option.id}
                      label={option.label}
                      sub={option.sub}
                      icon={option.icon}
                      selected={option.selected}
                    />
                  ))}
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Dropdown select"
                description="Use Select as a standalone dropdown control, not as a list item substitute."
              >
                <div className="grid max-w-sm gap-2">
                  <Label>Activity category</Label>
                  <Select defaultValue="gaming">
                    <SelectTrigger>
                      <SelectValue placeholder="Activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaming">Gaming and tech</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="coffee">Coffee meetup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ComponentFrame>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <ComponentFrame
                title="Radio rows"
                description="Use when the native radio affordance matters."
              >
                <RadioGroup defaultValue="friends" className="gap-3">
                  {[
                    ["public", "Public", "Visible to everyone"],
                    ["friends", "Friends", "Known network first"],
                    ["invite", "Invite", "Private group"],
                  ].map(([value, label, helper]) => (
                    <Label
                      key={value}
                      className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3"
                    >
                      <RadioGroupItem value={value} className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-black text-ink">
                          {label}
                        </span>
                        <span className="text-xs font-medium text-slate-muted">
                          {helper}
                        </span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </ComponentFrame>

              <ComponentFrame title="Fixed slider with presets">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-muted">
                      Manual group capacity
                    </span>
                    <span className="rounded-lg border border-spark-amber/20 bg-spark-amber/10 px-2.5 py-1 text-xs font-black text-spark-amber">
                      5 members
                    </span>
                  </div>
                  <SliderExample accent="amber" />
                  <div className="flex flex-wrap gap-2">
                    {["Open", "Balanced 70%", "Strong 80%", "Strict 90%"].map(
                      (preset, index) => (
                        <Button
                          key={preset}
                          type="button"
                          variant={index === 1 ? "primary" : "outline"}
                          size="sm"
                        >
                          {preset}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame title="Toggle rows">
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Toggle pressed variant="outline" aria-label="Bold filter">
                      Selected
                    </Toggle>
                    <Toggle variant="outline" aria-label="Muted filter">
                      Default
                    </Toggle>
                  </div>
                  <SwitchRow
                    title="Automatic matching"
                    description="Allow TeamForge to include you in suitable groups."
                    checked
                  />
                  <SwitchRow
                    title="Push notifications"
                    description="Notify me about invites and plan changes."
                    checked={false}
                  />
                </div>
              </ComponentFrame>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ComponentFrame
                title="Explore location and access filters"
                description="These keep the current segmented look, but should share one underlying filter component."
              >
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <h4 className="pl-1 text-sm font-bold tracking-tight text-ink">
                      Location
                    </h4>
                    <SegmentedFilter items={locationFilters} />
                    <div className="space-y-4 px-1 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-muted">
                          <MapPin className="size-3.5" />
                          Max distance
                        </span>
                        <span className="text-xs font-black tabular-nums tracking-tight text-forge-teal">
                          15 km
                        </span>
                      </div>
                      <SliderExample />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <h4 className="pl-1 text-sm font-bold tracking-tight text-ink">
                      Access mode
                    </h4>
                    <SegmentedFilter items={accessFilters} />
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Group size range"
                description="Amber range sliders are a valid product accent for capacity and cost-related controls."
              >
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-ink">Group size</h4>
                    <span className="rounded-md bg-spark-amber/10 px-2 py-0.5 text-[10px] font-black tabular-nums text-spark-amber">
                      3-8
                    </span>
                  </div>
                  <SliderExample accent="amber" range />
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-muted/60">
                    <span>Intimate</span>
                    <span>Massive</span>
                  </div>
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="surfaces"
            eyebrow="06 / Surfaces"
            title="Cards, lists, and navigation"
            description="Canonical pick: shared Card owns the base surface. Feature cards can vary by density and media, but border/radius/shadow should stay recognisably related."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <ComponentFrame title="Navigation items">
                <div className="grid gap-2">
                  {navigationItems.map((item) => (
                    <IconTile key={item.label} {...item} />
                  ))}
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Section card"
                description="Best for a form section: icon, title, guidance, then controls."
              >
                <div className="relative overflow-hidden rounded-xl border border-forge-teal/20 bg-card shadow-xs shadow-forge-teal/5">
                  <div className="space-y-4 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-ink">
                          Date and time
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-slate-muted">
                          When are you planning to meet up?
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DateInput value={demoDate} onValueChange={setDemoDate} />
                      <TimeInput value={demoTime} onValueChange={setDemoTime} />
                    </div>
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Object card"
                description="Best for plans and groups: date tile, primary text, metadata, people, one command."
              >
                <div className="group flex cursor-pointer flex-row items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-ink hover:shadow-button-outline">
                  <DateTile />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-snug text-ink transition-colors group-hover:text-forge-teal">
                      Co-op strategy night
                    </p>
                    <p className="truncate text-xs font-medium text-slate-muted">
                      Gaming and Tech Crew
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-muted">
                        <Clock className="size-3" />
                        6:30 PM
                      </span>
                      <Badge variant="teal" className="gap-1">
                        <CheckCircle2 className="size-3" />
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {["Maya Chen", "Alex Rivers"].map((name) => (
                      <Avatar
                        key={name}
                        name={name}
                        className="size-8 border-2 border-card text-sm"
                      />
                    ))}
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame
                title="Selectable list row"
                description="Best for inbox/sidebar rows: full-width button with active left rail."
              >
                <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                  {[
                    ["Forge Crew", "Sam sent a plan update", true],
                    ["Direct chat", "Nora: sounds good to me", false],
                  ].map(([title, message, active]) => (
                    <Button
                      key={title as string}
                      type="button"
                      aria-selected={Boolean(active)}
                      className={cn(
                        "relative h-auto w-full justify-start gap-3.5 px-4 py-3.5 text-left transition-colors duration-200",
                        active ? "bg-forge-teal/8" : "hover:bg-muted/30",
                      )}
                      contentClassName="items-center justify-start gap-3.5"
                    >
                      <Avatar
                        name={title as string}
                        className="size-10 text-sm"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">
                          {title as string}
                        </span>
                        <span className="block truncate text-xs font-medium text-slate-muted">
                          {message as string}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="feedback"
            eyebrow="07 / Feedback"
            title="Progress, status, and empty states"
            description="Feedback should be direct and calm. Use status color sparingly, keep copy specific, and avoid placeholder stats that look live."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {statusItems.map((item) => (
                <StatusCallout key={item.title} {...item} />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <ComponentFrame title="Progress">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-muted">
                    <span>Forge readiness</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} />
                  <div className="grid gap-2 pt-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame title="Empty state">
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
                    <Sparkles size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-ink">No groups yet</p>
                    <p className="text-xs font-medium leading-5 text-slate-muted">
                      Forge your first group when you are ready.
                    </p>
                  </div>
                  <Button size="sm">Forge</Button>
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <Section
            id="media"
            eyebrow="08 / Media"
            title="Avatars, images, and uploads"
            description="Canonical picks: common Avatar, common Image, and FileDropzone. These handle missing assets, loading, fallback, drag state, and upload variants."
          >
            <div className="grid gap-4 xl:grid-cols-3">
              <ComponentFrame title="Avatar states">
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar
                      name="Maya Chen"
                      className="size-12 text-base"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80"
                    />
                    <Avatar name="Jordan Lee" className="size-12 text-base" />
                    <Avatar
                      name="Project Crew"
                      shape="rounded"
                      className="size-12 text-base"
                    />
                  </div>
                  <div className="flex -space-x-2.5">
                    {["Nora Patel", "Sam Ford", "Iris Kim"].map((name) => (
                      <Avatar
                        key={name}
                        name={name}
                        className="size-9 border-2 border-card text-sm shadow-xs"
                      />
                    ))}
                    <div className="flex size-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-extrabold text-slate-muted shadow-xs">
                      +4
                    </div>
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame title="Image states">
                <div className="grid gap-3">
                  <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                      alt="Plan cover"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="aspect-3/1 overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                    <Image
                      src=""
                      alt="Missing plan cover placeholder"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="aspect-3/1 overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
                    <Image
                      src="https://teamforge.invalid/missing-cover.jpg"
                      alt="Failed plan cover"
                      className="h-full w-full object-cover"
                      fallbackComponent={
                        <div className="flex h-full w-full items-center justify-center gap-2 text-xs font-bold text-destructive">
                          <AlertCircle className="size-4" />
                          Image failed to load
                        </div>
                      }
                    />
                  </div>
                </div>
              </ComponentFrame>

              <ComponentFrame title="Dropzone variants">
                <div className="grid gap-3">
                  <FileDropzone
                    title="Replace cover"
                    description="Preview stays visible while choosing a new image"
                    actionLabel="Change"
                    accept="image/*"
                    onFiles={(files) =>
                      setUploadedFiles((current) =>
                        [...current, ...files].slice(0, 3),
                      )
                    }
                    preview={
                      <Image
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80"
                        alt="Current cover preview"
                        className="h-full w-full object-cover"
                      />
                    }
                    variant="cover"
                  />
                  <FileDropzone
                    title="Upload cover"
                    description="PNG, JPG, or WebP"
                    actionLabel="Choose"
                    accept="image/*"
                    multiple
                    maxFiles={3}
                    onFiles={(files) =>
                      setUploadedFiles((current) =>
                        [...current, ...files].slice(0, 3),
                      )
                    }
                    variant="compact"
                  />
                  <FileDropzone
                    title="Replace avatar"
                    description="Square images work best"
                    actionLabel="Browse"
                    accept="image/*"
                    onFiles={(files) =>
                      setUploadedFiles((current) =>
                        [...current, ...files].slice(0, 3),
                      )
                    }
                    variant="avatar"
                  />
                  <FilePreviewList
                    files={uploadedFiles}
                    onRemove={(index) =>
                      setUploadedFiles((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  />
                </div>
              </ComponentFrame>
            </div>
          </Section>

          <footer className="border-t border-border pt-6 text-xs font-bold leading-5 text-slate-muted">
            Proposed baseline: tokens, buttons, fields, selection controls,
            cards, feedback, navigation, avatars, images, uploads, search, and
            location controls all use shared primitives first.
          </footer>
        </main>
      </div>
    </div>
  );
}
