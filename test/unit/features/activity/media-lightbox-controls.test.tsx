// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { MediaLightbox } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox";
import { LightboxImage } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox/lightbox-media";
import { LightboxStage } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox/lightbox-stage";
import { ThumbnailStrip } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox/thumbnail-strip";
import { useLightboxNavigation } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox/use-lightbox-navigation";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";

function createAttachment(
  id: string,
  type: UnifiedAttachment["type"],
  overrides: Partial<UnifiedAttachment> = {},
): UnifiedAttachment {
  return {
    id,
    type,
    url: `https://cdn.example.com/${id}`,
    name: `${id} file`,
    size: 1024,
    mimeType: type === "VIDEO" ? "video/mp4" : "image/jpeg",
    thumbnailUrl: null,
    duration: null,
    waveform: [],
    createdAt: "2026-08-10T12:00:00.000Z",
    ...overrides,
  };
}

const attachments = [
  createAttachment("first.jpg", "IMAGE"),
  createAttachment("second.mp4", "VIDEO"),
  createAttachment("third.gif", "GIF", { mimeType: "image/gif" }),
];

beforeAll(() => {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn<(options?: boolean | ScrollIntoViewOptions) => void>(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn<() => void>(),
  });
});

function NavigationHarness({ isOpen = true }: { isOpen?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const navigation = useLightboxNavigation({
    attachments,
    isOpen,
    selectedIndex,
    setSelectedIndex,
  });

  return (
    <div data-testid="navigation">
      <output>{navigation.currentIndex}</output>
      <span>{navigation.announcement}</span>
      <button
        type="button"
        disabled={navigation.isPreviousDisabled}
        onClick={navigation.goPrevious}
      >
        Previous
      </button>
      <button
        type="button"
        disabled={navigation.isNextDisabled}
        onClick={navigation.goNext}
      >
        Next
      </button>
    </div>
  );
}

describe("Activity media lightbox controls", () => {
  it("uses finite navigation and announces only committed changes", async () => {
    const user = userEvent.setup();
    render(<NavigationHarness />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByText("0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByText("Video 2 of 3: second.mp4 file"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("clears the prior announcement before a closed viewer is reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NavigationHarness />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(
      screen.getByText("Video 2 of 3: second.mp4 file"),
    ).toBeInTheDocument();

    rerender(<NavigationHarness isOpen={false} />);
    expect(
      screen.queryByText("Video 2 of 3: second.mp4 file"),
    ).not.toBeInTheDocument();

    rerender(<NavigationHarness />);
    expect(
      screen.queryByText("Video 2 of 3: second.mp4 file"),
    ).not.toBeInTheDocument();
  });

  it("renders static, uniquely named thumbnails without adjacent video sources", () => {
    const distinctThumbnail = "https://cdn.example.com/second-thumb.jpg";
    const items = [
      attachments[0],
      { ...attachments[1], thumbnailUrl: distinctThumbnail },
      { ...attachments[2], thumbnailUrl: attachments[2].url },
    ];
    const { container } = render(
      <ThumbnailStrip
        attachments={items}
        selectedIndex={0}
        onSelect={vi.fn<(index: number) => void>()}
      />,
    );

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      distinctThumbnail,
    );
    expect(container.innerHTML).not.toContain(attachments[2].url);
    expect(
      screen.getByRole("button", {
        name: "Show image 1 of 3: first.jpg file",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Show video 2 of 3: second.mp4 file",
      }),
    ).toHaveAttribute("tabindex", "-1");
    expect(
      screen.getByRole("button", {
        name: "Show GIF 3 of 3: third.gif file",
      }),
    ).toBeInTheDocument();
  });

  it("keeps compact arrows visible at phone widths and disables real boundaries", () => {
    render(
      <LightboxStage
        count={3}
        currentMedia={attachments[0]}
        direction={0}
        isNextDisabled={false}
        isPreviousDisabled
        onNext={vi.fn<() => void>()}
        onPrevious={vi.fn<() => void>()}
      />,
    );

    const previous = screen.getByRole("button", { name: "Previous media" });
    const next = screen.getByRole("button", { name: "Next media" });

    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(previous).toHaveClass("size-11");
    expect(previous.className).not.toContain("hidden");
  });

  it("keeps image GIFs static until Play and restores the static preview on Pause", async () => {
    const user = userEvent.setup();
    const media = createAttachment("celebration.gif", "GIF", {
      mimeType: "image/gif",
      thumbnailUrl: "https://cdn.example.com/celebration-poster.jpg",
    });
    const { container } = render(<LightboxImage media={media} />);

    expect(container.innerHTML).toContain("celebration-poster.jpg");
    expect(container.innerHTML).not.toContain(media.url);
    expect(
      screen.getByRole("img", { name: "celebration.gif file preview" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play GIF" }));
    expect(container.innerHTML).toContain(media.url);

    await user.click(screen.getByRole("button", { name: "Pause GIF" }));
    expect(container.innerHTML).not.toContain(media.url);
    expect(container.innerHTML).toContain("celebration-poster.jpg");
  });

  it("describes the initial item and restores focus to the exact opener", async () => {
    const user = userEvent.setup();

    function DialogHarness() {
      const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
      const focusFallbackRef = useRef<HTMLFieldSetElement>(null);
      const returnFocusTargetRef = useRef<HTMLElement | null>(null);

      return (
        <main id="main-content" tabIndex={-1}>
          <fieldset
            ref={focusFallbackRef}
            data-media-gallery-focus-fallback
            tabIndex={-1}
          >
            <legend className="sr-only">Message media gallery</legend>
            <button
              type="button"
              onClick={(event) => {
                returnFocusTargetRef.current = event.currentTarget;
                event.currentTarget.blur();
                setSelectedIndex(0);
              }}
            >
              Open gallery
            </button>
          </fieldset>
          <MediaLightbox
            attachments={attachments}
            isOpen={selectedIndex !== null}
            onOpenChange={(open) => !open && setSelectedIndex(null)}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            focusFallbackRef={focusFallbackRef}
            returnFocusTargetRef={returnFocusTargetRef}
          />
        </main>
      );
    }

    render(<DialogHarness />);
    const opener = screen.getByRole("button", { name: "Open gallery" });
    await user.click(opener);

    const dialog = await screen.findByRole("dialog", { name: "Media preview" });
    expect(dialog).toHaveAccessibleDescription(
      "Viewing Image 1 of 3: first.jpg file. Use the visible controls to move between attachments.",
    );
    const closeButton = screen.getByRole("button", { name: "Close gallery" });
    expect(closeButton).toHaveFocus();
    expect(closeButton).toHaveClass("size-11");
    expect(closeButton.firstElementChild).toHaveClass("size-10");

    fireEvent.keyDown(closeButton, {
      key: "ArrowRight",
    });
    expect(dialog).toHaveAccessibleDescription(
      "Viewing Image 1 of 3: first.jpg file. Use the visible controls to move between attachments.",
    );

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(dialog).toHaveAccessibleDescription(
      "Viewing Video 2 of 3: second.mp4 file. Use the visible controls to move between attachments.",
    );

    fireEvent.keyDown(await screen.findByLabelText("second.mp4 file"), {
      key: "ArrowRight",
    });
    expect(dialog).toHaveAccessibleDescription(
      "Viewing Video 2 of 3: second.mp4 file. Use the visible controls to move between attachments.",
    );

    await user.keyboard("{Escape}");
    expect(opener).toHaveFocus();
  });
});
