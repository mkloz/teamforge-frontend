// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { GalleryItemMedia } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/gallery-item-render-parts";
import { LightboxVideo } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/media-gallery/media-lightbox/lightbox-media";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";

function createVideoAttachment(
  overrides: Partial<UnifiedAttachment> = {},
): UnifiedAttachment {
  return {
    id: "video-1",
    type: "VIDEO",
    url: "https://cdn.example.com/video.mp4",
    name: "Weekend highlights",
    size: 1024,
    mimeType: "video/mp4",
    thumbnailUrl: "https://cdn.example.com/video-poster.jpg",
    duration: 12,
    waveform: [],
    createdAt: "2026-08-10T12:00:00.000Z",
    ...overrides,
  };
}

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn<() => void>(),
  });
});

describe("Activity media caption contract", () => {
  it("does not claim captions for a video without a caption source", () => {
    const { container } = render(
      <LightboxVideo media={createVideoAttachment()} />,
    );

    const video = screen.getByLabelText("Weekend highlights");
    expect(video).toHaveAttribute("controls");
    expect(container.querySelector("track")).toBeNull();
  });

  it("keeps the fallback accessible name without fabricating a track", () => {
    const { container } = render(
      <LightboxVideo media={createVideoAttachment({ name: null })} />,
    );

    expect(screen.getByLabelText("Shared video")).toBeInTheDocument();
    expect(container.querySelector("track")).toBeNull();
  });

  it("requires explicit playback for video-backed GIFs in the lightbox", () => {
    const { container } = render(
      <LightboxVideo
        media={createVideoAttachment({
          id: "gif-lightbox",
          name: "Celebration",
          type: "GIF",
        })}
      />,
    );

    const video = screen.getByLabelText("Celebration");
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveProperty("muted", true);
    expect(container.querySelector("track")).toBeNull();
  });

  it("preserves silent GIF playback behavior without a caption track", () => {
    const { container } = render(
      <GalleryItemMedia
        imageState="loading"
        index={0}
        media={createVideoAttachment({
          id: "gif-1",
          name: "Celebration",
        })}
        onGifError={vi.fn<() => void>()}
        onGifLoaded={vi.fn<() => void>()}
        onImageError={vi.fn<() => void>()}
        onImageLoaded={vi.fn<() => void>()}
        viewState={{
          hasGifLoaded: true,
          isGif: true,
          isVideoBackedGif: true,
          shouldLoadImage: false,
        }}
      />,
    );

    const video = screen.getByLabelText("Celebration");
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveAttribute("playsinline");
    expect(container.querySelector("track")).toBeNull();
  });
});
