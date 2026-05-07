import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { FeedbackState } from "@/shared/components/feedback-state";
import { Button } from "@/shared/components/ui/button";

interface NotFoundStateProps {
  fullPage?: boolean;
}

export function NotFoundState({ fullPage = false }: NotFoundStateProps) {
  return (
    <main>
      <FeedbackState
        fullPage={fullPage}
        headingId="not-found-heading"
        icon={<Compass size={22} />}
        iconClassName="bg-forge-teal/10 text-forge-teal"
        containerClassName="bg-canvas"
        title="This page is not here"
        description="The link may be old, or the page may have moved."
        actions={
          <>
            <Button asChild variant="primary">
              <Link to="/home">Go home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Start page</Link>
            </Button>
          </>
        }
      />
    </main>
  );
}
