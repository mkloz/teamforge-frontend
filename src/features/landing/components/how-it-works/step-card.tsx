import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export interface StepCardProps {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent: React.ReactNode;
  index: number;
}

export function StepCard({
  number,
  icon: Icon,
  title,
  description,
  accent,
  index,
}: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative flex flex-col bg-white border-border hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-all duration-300",
          "p-6 h-full",
        )}
      >
        <span
          className="absolute top-4 right-5 font-sans font-bold text-slate-100 select-none pointer-events-none text-[3.5rem] leading-none"
          aria-hidden="true"
        >
          {number}
        </span>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-forge-teal/10">
          <Icon size={22} className="text-forge-teal" aria-hidden="true" />
        </div>

        <CardContent className="p-0 flex flex-col flex-1">
          <h3 className="font-sans font-semibold text-ink text-lg mb-2">
            {title}
          </h3>
          <p className="font-sans text-sm text-slate-muted leading-relaxed flex-1">
            {description}
          </p>
          {accent}
        </CardContent>
      </Card>
    </motion.div>
  );
}
