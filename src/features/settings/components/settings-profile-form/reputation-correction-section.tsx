import { useReputationCorrection } from "@/features/settings/hooks/use-reputation-correction";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

export function ReputationCorrectionSection() {
  const correction = useReputationCorrection();

  return (
    <section aria-labelledby="reputation-correction-heading">
      <div className="px-1">
        <h2
          id="reputation-correction-heading"
          className="font-bold text-ink text-xl"
        >
          Participation reputation
        </h2>
        <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
          Your public number reflects eligible plan follow-through. It is not a
          safety check, identity verification, character judgment, or
          compatibility prediction.
        </p>
      </div>

      {correction.hasOpenCorrection ? (
        <Notice className="mt-5" role="status" tone="info" statusIcon>
          <p>Your correction request is under review.</p>
        </Notice>
      ) : (
        <Form {...correction.form}>
          <form
            className="mt-5 rounded-xl bg-card p-4 sm:p-5"
            onSubmit={correction.onSubmit}
          >
            <FormField
              control={correction.form.control}
              name="inputId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence to review</FormLabel>
                  <Select
                    disabled={
                      correction.isSubmitting || correction.isLoadingEvidence
                    }
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            correction.isLoadingEvidence
                              ? "Loading evidence…"
                              : "Choose a plan or history entry"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {correction.evidence
                        .filter((item) => item.status === "VALID")
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {formatEvidenceLabel(item)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-slate-muted text-xs leading-relaxed">
                    Entries are delayed and do not identify who contributed them
                    or reveal their private response.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={correction.form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What looks wrong?</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={correction.isSubmitting}
                      placeholder="Describe the plan or evidence you want us to review."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {correction.submitError ? (
              <Notice className="mt-4" role="alert" tone="danger" statusIcon>
                <p>{correction.submitError}</p>
              </Notice>
            ) : null}

            <div className="mt-4 flex justify-end">
              <Button
                disabled={
                  !correction.isOnline ||
                  !correction.evidence.some((item) => item.status === "VALID")
                }
                loading={correction.isSubmitting}
                type="submit"
                variant="outline"
              >
                Request a correction
              </Button>
            </div>
          </form>
        </Form>
      )}

      {correction.latestResolvedDispute ? (
        <Notice className="mt-4" role="status" tone="neutral" statusIcon>
          <p className="font-semibold">
            Latest correction:{" "}
            {correction.latestResolvedDispute.status.toLowerCase()}
          </p>
          {correction.latestResolvedDispute.decision ? (
            <p className="mt-1">{correction.latestResolvedDispute.decision}</p>
          ) : null}
        </Notice>
      ) : null}
    </section>
  );
}

function formatEvidenceLabel(item: {
  evidenceType:
    | "FOLLOW_THROUGH"
    | "ATTENDANCE"
    | "ADJUSTMENT"
    | "LEGACY_BASELINE";
  occurredAt: string;
  planTitle: string | null;
}) {
  if (item.planTitle)
    return `${item.planTitle} · ${formatDate(item.occurredAt)}`;
  if (item.evidenceType === "LEGACY_BASELINE")
    return "Earlier participation history";
  return `Participation history · ${formatDate(item.occurredAt)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
