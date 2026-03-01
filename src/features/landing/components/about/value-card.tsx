import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
  index: number;
}

export function ValueCard({
  icon: Icon,
  title,
  description,
  colorClass,
  index,
}: ValueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: 0.3 + index * 0.1 }}
      className="md:col-span-3 h-full"
    >
      <Card
        className={cn(
          "p-6 h-full bg-white border-border group hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-all duration-300",
        )}
      >
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110 shrink-0",
                colorClass,
              )}
            >
              <Icon size={20} aria-hidden="true" />
            </div>
            <CardTitle className="font-sans font-semibold text-ink text-[15px]">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <p className="font-sans text-sm text-slate-muted leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
