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
                disabled={!correction.isOnline}
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
    </section>
  );
}
