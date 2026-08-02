import { useMutation, useQuery } from "@tanstack/react-query";
import { Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { GroupPlanDetailCommands } from "@/features/group-plan-detail/api/group-plan-detail-commands";
import { groupPlanDetailQueries } from "@/features/group-plan-detail/api/group-plan-detail-queries";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type {
  PlanAccommodationRequest,
  PlanAccommodationStatus,
} from "@/features/group-plan-detail/schemas/plan-accommodation.schema";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Notice } from "@/shared/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const MEMBER_RELATIONSHIPS = new Set(["ADMIN", "MEMBER", "MODERATOR"]);

export function PrivateAccommodationDialog({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const [open, setOpen] = useState(false);
  const plan = detail.plan;
  if (
    !plan ||
    !MEMBER_RELATIONSHIPS.has(detail.viewer.relationship) ||
    ["CANCELLED", "COMPLETED"].includes(plan.status)
  ) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-forge-teal/20 bg-forge-teal/5 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-bold text-ink text-sm">
            <ShieldCheck className="size-4 text-forge-teal" aria-hidden />
            Need something to take part?
          </p>
          <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
            Ask privately and choose exactly who should respond.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <LockKeyhole className="size-4" aria-hidden />
              Private request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
            <DialogHeader className="text-left">
              <DialogTitle>Private participation request</DialogTitle>
              <DialogDescription>
                Describe what you need to do, not a diagnosis. Only you and the
                named responder can see it; an escalation responder sees it only
                after you escalate.
              </DialogDescription>
            </DialogHeader>
            <AccommodationWorkspace detail={detail} enabled={open} />
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function AccommodationWorkspace({
  detail,
  enabled,
}: {
  detail: GroupPlanDetail;
  enabled: boolean;
}) {
  const planId = detail.plan?.id ?? "";
  const query = useQuery(
    groupPlanDetailQueries.accommodationRequests(planId, enabled),
  );

  return (
    <div className="grid gap-6">
      <Notice size="sm" tone="neutral">
        These requests stay out of chat, calendars, archives, matching, and
        reputation. They are automatically deleted after the displayed date.
      </Notice>
      {query.isLoading ? (
        <p className="text-muted-foreground text-sm">
          Loading private requests…
        </p>
      ) : query.isError ? (
        <Notice role="alert" tone="warning">
          We couldn&apos;t load your private requests. Please try again.
        </Notice>
      ) : query.data?.length ? (
        <div className="grid gap-3">
          <h3 className="font-bold text-ink text-sm">Requests involving you</h3>
          {query.data.map((request) => (
            <AccommodationRequestCard
              key={request.id}
              detail={detail}
              request={request}
            />
          ))}
        </div>
      ) : null}
      <CreateAccommodationRequest detail={detail} />
    </div>
  );
}

function CreateAccommodationRequest({ detail }: { detail: GroupPlanDetail }) {
  const planId = detail.plan?.id ?? "";
  const candidates = useMemo(
    () =>
      detail.members.filter(({ userId }) => userId !== detail.viewer.userId),
    [detail.members, detail.viewer.userId],
  );
  const [functionalRequirement, setFunctionalRequirement] = useState("");
  const [responderId, setResponderId] = useState("");
  const [escalationResponderId, setEscalationResponderId] = useState("NONE");
  const [responseDueAt, setResponseDueAt] = useState(defaultDueValue);
  const mutation = useMutation({
    mutationKey: ["private-accommodation", "create", planId],
    mutationFn: () =>
      GroupPlanDetailCommands.createAccommodationRequest({
        escalationResponderId:
          escalationResponderId === "NONE" ? undefined : escalationResponderId,
        functionalRequirement,
        planId,
        responderId,
        responseDueAt: new Date(responseDueAt).toISOString(),
      }),
    onSuccess: () => {
      setFunctionalRequirement("");
      setResponderId("");
      setEscalationResponderId("NONE");
      setResponseDueAt(defaultDueValue());
    },
    meta: {
      errorToastMessage: "We couldn't create your private request.",
      telemetryName: "plan_accommodation_request_create",
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      functionalRequirement.trim().length < 10 ||
      !responderId ||
      !responseDueAt
    ) {
      return;
    }
    mutation.mutate();
  }

  return (
    <form
      className="grid gap-4 border-border/60 border-t pt-5"
      onSubmit={submit}
    >
      <div>
        <h3 className="font-bold text-ink text-sm">Make a new request</h3>
        <p className="mt-1 text-muted-foreground text-xs">
          State the practical change or support that would let you participate.
        </p>
      </div>
      <label
        className="grid gap-1.5 font-semibold text-ink text-xs"
        htmlFor="accommodation-functional-requirement"
      >
        What do you need?
        <Textarea
          id="accommodation-functional-requirement"
          maxLength={1000}
          minLength={10}
          onChange={(event) => setFunctionalRequirement(event.target.value)}
          placeholder="For example: I need a seat near the exit and a short break each hour."
          required
          value={functionalRequirement}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <MemberSelect
          candidates={candidates}
          label="Named responder"
          onChange={setResponderId}
          value={responderId}
        />
        <MemberSelect
          allowNone
          candidates={candidates.filter(({ userId }) => userId !== responderId)}
          label="Escalation responder (optional)"
          onChange={setEscalationResponderId}
          value={escalationResponderId}
        />
      </div>
      <label
        className="grid gap-1.5 font-semibold text-ink text-xs"
        htmlFor="accommodation-response-due-at"
      >
        Response expected by
        <Input
          id="accommodation-response-due-at"
          max={toLocalDateTime(new Date(Date.now() + 30 * 86_400_000))}
          min={toLocalDateTime(new Date(Date.now() + 60_000))}
          onChange={(event) => setResponseDueAt(event.target.value)}
          required
          type="datetime-local"
          value={responseDueAt}
        />
      </label>
      <Button
        className="justify-self-start"
        disabled={mutation.isPending}
        type="submit"
      >
        {mutation.isPending ? "Sending…" : "Send private request"}
      </Button>
    </form>
  );
}

function MemberSelect({
  allowNone = false,
  candidates,
  label,
  onChange,
  value,
}: {
  allowNone?: boolean;
  candidates: GroupPlanDetail["members"];
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid gap-1.5 font-semibold text-ink text-xs">
      <span>{label}</span>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger aria-label={label}>
          <SelectValue placeholder="Choose a member" />
        </SelectTrigger>
        <SelectContent>
          {allowNone ? (
            <SelectItem value="NONE">No escalation</SelectItem>
          ) : null}
          {candidates.map((member) => (
            <SelectItem key={member.userId} value={member.userId}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function AccommodationRequestCard({
  detail,
  request,
}: {
  detail: GroupPlanDetail;
  request: PlanAccommodationRequest;
}) {
  const nameById = new Map(
    detail.members.map(({ name, userId }) => [userId, name]),
  );
  const viewerId = detail.viewer.userId;
  const isRequester = request.requesterId === viewerId;
  const canRespond =
    request.responderId === viewerId ||
    (Boolean(request.escalatedAt) &&
      request.escalationResponderId === viewerId);

  return (
    <article className="grid gap-3 rounded-xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-muted px-2.5 py-1 font-bold text-[11px] text-ink">
          {statusLabel(request.status)}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock3 className="size-3.5" aria-hidden />
          Response by {formatDateTime(request.responseDueAt)}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-ink text-sm leading-relaxed">
        {request.functionalRequirement}
      </p>
      <dl className="grid gap-1 text-muted-foreground text-xs">
        <div>
          <dt className="inline font-semibold text-ink">Requester: </dt>
          <dd className="inline">
            {nameById.get(request.requesterId) ?? "Member"}
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Responder: </dt>
          <dd className="inline">
            {nameById.get(request.responderId) ?? "Member"}
          </dd>
        </div>
      </dl>
      {request.responseMessage ? (
        <p className="rounded-lg bg-muted/70 px-3 py-2 text-ink text-xs">
          {request.responseMessage}
        </p>
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        Automatically deleted after {formatDateTime(request.retentionDeleteAt)}.
      </p>
      <AccommodationActions
        canRespond={canRespond}
        isRequester={isRequester}
        request={request}
      />
    </article>
  );
}

function AccommodationActions({
  canRespond,
  isRequester,
  request,
}: {
  canRespond: boolean;
  isRequester: boolean;
  request: PlanAccommodationRequest;
}) {
  const [message, setMessage] = useState("");
  const [clarification, setClarification] = useState(
    request.functionalRequirement,
  );
  const response = useMutation({
    mutationFn: (status: PlanAccommodationStatus) =>
      GroupPlanDetailCommands.respondAccommodationRequest({
        planId: request.planId,
        requestId: request.id,
        responseMessage: message || undefined,
        status,
      }),
    meta: {
      errorToastMessage: "We couldn't save this response.",
      telemetryName: "plan_accommodation_request_respond",
    },
  });
  const clarify = useMutation({
    mutationFn: () =>
      GroupPlanDetailCommands.clarifyAccommodationRequest({
        functionalRequirement: clarification,
        planId: request.planId,
        requestId: request.id,
      }),
    meta: {
      errorToastMessage: "We couldn't send that clarification.",
      telemetryName: "plan_accommodation_request_clarify",
    },
  });
  const action = useMutation({
    mutationFn: (value: "cancel" | "escalate") =>
      GroupPlanDetailCommands.runAccommodationAction({
        action: value,
        planId: request.planId,
        requestId: request.id,
      }),
    meta: {
      errorToastMessage: "We couldn't update this private request.",
      telemetryName: "plan_accommodation_request_action",
    },
  });
  const actionable = ["OPEN", "NEEDS_CLARIFICATION"].includes(request.status);

  if (canRespond && actionable) {
    return (
      <div className="grid gap-2 border-border/60 border-t pt-3">
        <Textarea
          aria-label="Private response details"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Add details for cannot meet or needs clarification"
          value={message}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={response.isPending}
            onClick={() => response.mutate("ACCEPTED")}
            size="sm"
          >
            Accept
          </Button>
          <Button
            disabled={!message.trim() || response.isPending}
            onClick={() => response.mutate("NEEDS_CLARIFICATION")}
            size="sm"
            variant="outline"
          >
            Ask for clarity
          </Button>
          <Button
            disabled={!message.trim() || response.isPending}
            onClick={() => response.mutate("CANNOT_MEET")}
            size="sm"
            variant="outline"
          >
            Cannot meet
          </Button>
        </div>
      </div>
    );
  }

  if (isRequester && request.status === "NEEDS_CLARIFICATION") {
    return (
      <div className="grid gap-2 border-border/60 border-t pt-3">
        <Textarea
          aria-label="Clarified functional requirement"
          minLength={10}
          onChange={(event) => setClarification(event.target.value)}
          value={clarification}
        />
        <Button
          className="justify-self-start"
          disabled={clarification.trim().length < 10 || clarify.isPending}
          onClick={() => clarify.mutate()}
          size="sm"
        >
          Send clarification
        </Button>
      </div>
    );
  }

  if (isRequester && request.status === "OPEN") {
    const overdue = new Date(request.responseDueAt).getTime() <= Date.now();
    return (
      <div className="flex flex-wrap gap-2 border-border/60 border-t pt-3">
        {overdue && request.escalationResponderId && !request.escalatedAt ? (
          <Button
            disabled={action.isPending}
            onClick={() => action.mutate("escalate")}
            size="sm"
            variant="outline"
          >
            Escalate overdue request
          </Button>
        ) : null}
        <Button
          disabled={action.isPending}
          onClick={() => action.mutate("cancel")}
          size="sm"
          variant="ghost"
        >
          Cancel request
        </Button>
      </div>
    );
  }

  return null;
}

function defaultDueValue() {
  return toLocalDateTime(new Date(Date.now() + 48 * 60 * 60 * 1000));
}

function toLocalDateTime(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(status: PlanAccommodationStatus) {
  return {
    ACCEPTED: "Accepted",
    CANCELLED: "Cancelled",
    CANNOT_MEET: "Cannot meet",
    NEEDS_CLARIFICATION: "Needs clarification",
    OPEN: "Awaiting response",
  }[status];
}
