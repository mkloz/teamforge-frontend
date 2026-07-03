import { BalanceNudge } from "@/features/onboarding/components/interests/interests-browse/balance-nudge";

export function BalanceNudgeSlot({ shouldShow }: { shouldShow: boolean }) {
  return shouldShow ? <BalanceNudge /> : null;
}
