import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ForgeHero } from "./components/forge-hero";

const STARTER_EXAMPLES = [
  {
    title: "Low-pressure",
    items: [
      "Coffee between classes",
      "A walk after work",
      "Board games Friday",
    ],
  },
  {
    title: "Active",
    items: ["Beginner climbing", "Five-a-side football", "Sunday cycle"],
  },
  {
    title: "Focused",
    items: ["Exam revision block", "Portfolio review", "Hack session"],
  },
] as const;

const FORGE_OUTCOMES = [
  ["Group", "A small set of people who fit the activity."],
  ["Invites", "Automatic search or manual picks, depending on how you start."],
  ["Chat", "A shared thread with the plan already attached."],
] as const;

interface ForgePageShellProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

interface ForgeIntroContentProps {
  onForgeClick: () => void;
}

export function ForgePageShell({
  children,
  isOpen = false,
}: ForgePageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full flex-col md:pb-12",
        isOpen
          ? "w-full max-w-none gap-0 px-0"
          : "w-full max-w-5xl gap-8 px-4 md:px-8",
      )}
    >
      {children}
    </div>
  );
}

export function ForgeIntroContent({ onForgeClick }: ForgeIntroContentProps) {
  return (
    <motion.div
      key="forge-introduction"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col gap-8 py-6 md:py-10"
    >
      <ForgeHero onForgeClick={onForgeClick} />

      <section
        aria-labelledby="starter-examples-title"
        className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(32rem,1.2fr)]"
      >
        <div>
          <p className="font-black text-muted-foreground text-sm uppercase">
            Good starts
          </p>
          <h2
            id="starter-examples-title"
            className="mt-2 text-balance font-black text-2xl text-foreground leading-tight"
          >
            Start with the kind of plan someone can answer quickly.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-0">
          {STARTER_EXAMPLES.map(({ title, items }) => (
            <article
              key={title}
              className="rounded-xl border border-border bg-card p-4"
            >
              <h3 className="font-black text-foreground text-sm">{title}</h3>
              <ul className="mt-3 grid gap-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="border-border border-t pt-2 font-medium text-muted-foreground text-sm leading-relaxed first:border-t-0 first:pt-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="forge-next-title"
        className="rounded-xl border border-border bg-canvas p-5 md:p-6"
      >
        <div className="lg:main-action-grid grid gap-6 lg:items-end">
          <div>
            <p className="font-black text-muted-foreground text-sm uppercase">
              After you start
            </p>
            <h2
              id="forge-next-title"
              className="mt-2 max-w-2xl text-balance font-black text-2xl text-foreground leading-tight"
            >
              Forge turns the rough plan into a group space.
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {FORGE_OUTCOMES.map(([title, body]) => (
                <div
                  key={title}
                  className="border-border border-t pt-4 first:border-t-0 first:pt-0 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 first:sm:border-l-0 first:sm:pl-0"
                >
                  <p className="font-black text-foreground text-sm">{title}</p>
                  <p className="mt-1 font-medium text-muted-foreground text-sm leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onForgeClick}
            variant="primary"
            size="lg"
            className="w-full lg:w-auto"
            aria-label="Forge my group"
          >
            <Plus size={18} />
            Forge my group
          </Button>
        </div>
      </section>
    </motion.div>
  );
}
