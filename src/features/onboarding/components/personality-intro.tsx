import { Brain, Lock, RefreshCcw, ArrowRight } from "lucide-react";
import { TeamForgeLogo } from "../../../assets/logo";

interface PersonalityIntroProps {
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Brain,
    text: "Based on the IPIP — one of the most widely validated personality frameworks in academic psychology.",
  },
  {
    icon: Lock,
    text: "Your results are only used to find compatible people. They are never sold or shared.",
  },
  {
    icon: RefreshCcw,
    text: "You can retake or update your assessment at any time from your profile.",
  },
];

export function PersonalityIntro({ onStart }: PersonalityIntroProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto w-full gap-0">
      {/* Logo */}
      <TeamForgeLogo className="w-10 h-10 mb-6" showBackground={false} />

      {/* Overline */}
      <p
        className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-4"
        style={{ color: "#0D9488" }}
      >
        Personality Assessment
      </p>

      {/* Headline */}
      <h1
        className="font-sans text-[2rem] font-extrabold leading-tight text-balance mb-4"
        style={{ color: "#1C1C1A" }}
      >
        What makes you, you?
      </h1>

      {/* Body */}
      <p
        className="font-sans text-sm leading-relaxed text-pretty mb-2"
        style={{ color: "#6B7280" }}
      >
        Before we build your group, we want to understand how your mind works —
        not your job title, not your hobbies, not your mood today.
      </p>
      <p
        className="font-sans text-sm leading-relaxed text-pretty mb-6"
        style={{ color: "#6B7280" }}
      >
        This is the{" "}
        <span style={{ color: "#1C1C1A", fontWeight: 500 }}>
          International Personality Item Pool (IPIP)
        </span>{" "}
        — a scientifically validated assessment used in peer-reviewed psychology research worldwide.
        Your scores place you in a five-dimensional personality space. The result shapes every group
        you will ever be matched into, and gives you a framework for understanding yourself that
        goes far beyond a label.
      </p>

      {/* Divider */}
      <div
        className="w-full mb-6"
        style={{ height: 1, background: "rgba(107,114,128,0.15)" }}
      />

      {/* Benefits */}
      <div className="flex flex-col gap-3 w-full mb-8 text-left">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3">
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5"
              style={{
                width: 28,
                height: 28,
                background: "rgba(13,148,136,0.08)",
              }}
            >
              <Icon size={14} strokeWidth={2} style={{ color: "#0D9488" }} />
            </div>
            <p
              className="font-sans text-sm leading-relaxed"
              style={{ color: "#6B7280" }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
        style={{
          height: 52,
          background: "#0D9488",
          color: "#FFFFFF",
        }}
      >
        Let's find out
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
