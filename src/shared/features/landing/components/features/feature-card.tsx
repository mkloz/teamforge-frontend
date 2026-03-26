import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  pill: string;
  pillColor: "teal" | "amber";
  index: number;
  hero?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  pill,
  pillColor,
  index,
  hero,
}: FeatureCardProps) {
  if (hero) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: index * 0.1 }}
        className="col-span-full h-full"
      >
        <Card
          className={cn(
            "group relative flex flex-col md:flex-row gap-8 bg-white border-border hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-[border-color,box-shadow] duration-300 overflow-hidden",
            "p-8 md:p-10 h-full",
          )}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.06)_0%,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-forge-teal/10">
                <Icon
                  size={24}
                  className="text-forge-teal"
                  aria-hidden="true"
                />
              </div>
              <Badge variant={pillColor}>{pill}</Badge>
            </div>
            <CardTitle className="font-sans font-bold text-ink text-2xl mb-3">
              {title}
            </CardTitle>
            <p className="font-sans text-base text-slate-muted leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          <div
            className="shrink-0 w-full md:w-56 self-center z-10"
            aria-hidden="true"
          >
            <p className="font-sans text-[10px] font-semibold uppercase tracking-widest text-forge-teal/60 mb-3">
              Example vector
            </p>
            <div className="space-y-2.5">
              {[
                { a: "E", b: "I", fill: 80 },
                { a: "N", b: "S", fill: 60 },
                { a: "T", b: "F", fill: 70 },
                { a: "J", b: "P", fill: 55 },
              ].map(({ a, b, fill }) => (
                <div key={a} className="flex items-center gap-2">
                  <span className="font-sans text-[10px] font-bold text-forge-teal w-3">
                    {a}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-forge-teal/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-forge-teal to-forge-teal-light"
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                  <span className="font-sans text-[10px] text-slate-muted w-3 text-right">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      className="h-full"
    >
      <Card
        className={cn(
          "group flex flex-col border-border hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-[border-color,box-shadow] duration-300",
          "h-full",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-forge-teal/10">
            <Icon size={20} className="text-forge-teal" aria-hidden="true" />
          </div>
          <Badge variant={pillColor}>{pill}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col flex-1">
          <CardTitle className="font-sans font-semibold text-ink text-base mb-2">
            {title}
          </CardTitle>
          <p className="font-sans text-sm text-slate-muted leading-relaxed flex-1">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
