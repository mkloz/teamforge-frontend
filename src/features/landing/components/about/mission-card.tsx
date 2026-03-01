import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

export function MissionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="md:col-span-4"
    >
      <Card
        className={cn(
          "h-full p-8 md:p-10 flex flex-col justify-between relative border-2  overflow-hidden bg-forge-teal hover:border-spark-amber hover:shadow-[0_8px_32px_rgba(245,158,11,0.08)] transition-all duration-300",
          "outline-none text-white",
        )}
      >
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <CardContent className="relative z-10 p-0">
          <blockquote className="font-sans text-xl md:text-2xl font-semibold leading-snug text-balance mb-6">
            "We are not a dating app. We are not a corporate tool. We are the
            forge – and every spark is a real connection."
          </blockquote>
          <p className="font-sans text-sm text-white/60">
            TeamForge brand credo
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
