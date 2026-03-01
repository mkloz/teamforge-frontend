import { Card, CardContent, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function StoryCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="md:col-span-8"
    >
      <Card
        className={cn(
          "p-8 md:p-10 border-border bg-white hover:border-forge-teal/50 hover:shadow-[0_8px_32px_rgba(13,148,136,0.08)] transition-all duration-300 h-full",
        )}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-forge-teal/10 flex items-center justify-center">
            <Users size={18} className="text-forge-teal" aria-hidden="true" />
          </div>
          <CardTitle className="font-sans font-semibold text-ink text-lg">
            Our story
          </CardTitle>
        </div>
        <CardContent className="p-0 space-y-4 font-sans text-[15px] text-slate-muted leading-relaxed">
          <p>
            Social media promised to connect everyone. Event platforms listed
            thousands of activities. Dating-style apps tried to cross over into
            friendships. Yet the core problem remained: you still had to browse,
            scroll, message, and hope someone would show up.
          </p>
          <p>
            We wanted something different – a system that understands your
            personality, knows your interests, respects your social circle, and
            hands you a ready-made compatible group in seconds.
          </p>
          <p className="font-medium text-ink">
            So we built TeamForge. The system suggests, you show up.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
