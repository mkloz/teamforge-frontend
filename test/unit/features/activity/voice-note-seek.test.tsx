// @vitest-environment jsdom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceNote } from "@/features/activity/components/conversation-workspace/message-timeline/message-item/voice-note";
import {
  clampVoiceNoteSeconds,
  getValidVoiceNoteDuration,
  getVoiceNoteKeyboardSeekTarget,
  getVoiceNoteValueText,
} from "@/features/activity/components/conversation-workspace/message-timeline/message-item/voice-note-waveform-utils";
import { useAudioPlayer } from "@/features/activity/hooks/use-audio-player";

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];

  throwOnCurrentTimeReset = false;
  duration = Number.NaN;
  paused = true;
  playbackRate = 1;
  preload = "none";
  sourceAssignedAfterErrorListener = false;
  private errorListenerAttached = false;
  private sourceValue = "";
  private timeValue = 0;
  load = vi.fn<() => void>();
  play = vi.fn<() => Promise<void>>(async () => {
    this.paused = false;
    this.dispatchEvent(new Event("play"));
  });
  pause = vi.fn<() => void>(() => {
    this.paused = true;
    this.dispatchEvent(new Event("pause"));
  });

  constructor(src = "") {
    super();
    this.src = src;
    FakeAudio.instances.push(this);
  }

  get src() {
    return this.sourceValue;
  }

  get currentTime() {
    return this.timeValue;
  }

  set currentTime(value: number) {
    if (this.throwOnCurrentTimeReset && value === 0) {
      throw new Error("currentTime reset rejected");
    }
    this.timeValue = value;
  }

  set src(value: string) {
    this.sourceValue = value;
    if (value) {
      this.sourceAssignedAfterErrorListener = this.errorListenerAttached;
    }
  }

  override addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ) {
    if (type === "error") {
      this.errorListenerAttached = true;
    }
    super.addEventListener(type, callback, options);
  }

  resolveMetadata(duration: number) {
    this.duration = duration;
    this.dispatchEvent(new Event("loadedmetadata"));
  }

  fail() {
    this.dispatchEvent(new Event("error"));
  }
}

function keyboardEvent(
  key: string,
  overrides: Partial<{
    altKey: boolean;
    ctrlKey: boolean;
    isComposing: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  }> = {},
) {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key,
    metaKey: false,
    shiftKey: false,
    ...overrides,
  };
}

describe("voice-note seek helpers", () => {
  it("validates durations, clamps seconds, and formats honest spoken values", () => {
    expect(getValidVoiceNoteDuration(undefined)).toBeNull();
    expect(getValidVoiceNoteDuration(0)).toBeNull();
    expect(getValidVoiceNoteDuration(-1)).toBeNull();
    expect(getValidVoiceNoteDuration(Number.NaN)).toBeNull();
    expect(getValidVoiceNoteDuration(Number.POSITIVE_INFINITY)).toBeNull();
    expect(getValidVoiceNoteDuration(65)).toBe(65);
    expect(clampVoiceNoteSeconds(-2, 65)).toBe(0);
    expect(clampVoiceNoteSeconds(90, 65)).toBe(65);
    expect(getVoiceNoteValueText(0, 65)).toBe(
      "0 seconds of 1 minute 5 seconds",
    );
    expect(getVoiceNoteValueText(1, 1)).toBe("1 second of 1 second");
  });

  it("defines deterministic Arrow, Page, Home, End, and modifier behavior", () => {
    const target = (key: string, overrides = {}) =>
      getVoiceNoteKeyboardSeekTarget({
        currentSeconds: 20,
        durationSeconds: 65,
        event: keyboardEvent(key, overrides),
      });

    expect(target("ArrowRight")).toBe(21);
    expect(target("ArrowUp")).toBe(21);
    expect(target("ArrowLeft")).toBe(19);
    expect(target("ArrowDown")).toBe(19);
    expect(target("ArrowRight", { shiftKey: true })).toBe(30);
    expect(target("PageUp")).toBe(30);
    expect(target("PageDown")).toBe(10);
    expect(target("Home")).toBe(0);
    expect(target("End")).toBe(65);
    expect(target("ArrowRight", { ctrlKey: true })).toBeNull();
    expect(target("ArrowRight", { isComposing: true })).toBeNull();
    expect(target("Enter")).toBeNull();
  });
});

describe("useAudioPlayer semantic seeking", () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads one audio after seek intent, applies the latest pending seek, and never autoplays", async () => {
    const { result } = renderHook(() => useAudioPlayer("voice.wav", 60));
    expect(FakeAudio.instances).toHaveLength(0);

    await act(() => result.current.seek(10));
    await act(() => result.current.seek(40));
    expect(FakeAudio.instances).toHaveLength(1);
    const audio = FakeAudio.instances[0];
    expect(audio.sourceAssignedAfterErrorListener).toBe(true);
    expect(audio.load).toHaveBeenCalledTimes(1);
    expect(audio.play).not.toHaveBeenCalled();
    expect(result.current.currentTimeSeconds).toBe(40);

    act(() => {
      audio.resolveMetadata(30);
    });
    expect(audio.currentTime).toBe(20);
    expect(result.current.currentTimeSeconds).toBe(20);
    expect(result.current.totalDurationSeconds).toBe(30);
    expect(result.current.isPlaying).toBe(false);
  });

  it("waits for metadata before playing a pending seek and requires a fresh Play action", async () => {
    const { result } = renderHook(() => useAudioPlayer("voice.wav", 60));

    await act(() => result.current.seek(40));
    const audio = FakeAudio.instances[0];
    await act(() => result.current.togglePlay());
    expect(audio.play).not.toHaveBeenCalled();

    act(() => {
      audio.resolveMetadata(30);
    });
    expect(audio.currentTime).toBe(20);
    expect(result.current.currentTimeSeconds).toBe(20);
    expect(result.current.isLoadingMetadata).toBe(false);

    await act(() => result.current.togglePlay());
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(true);
  });

  it("restarts an end seek at zero and resets position truthfully after an error", async () => {
    const { result } = renderHook(() => useAudioPlayer("voice.wav", 60));

    await act(() => result.current.seek(60));
    const firstAudio = FakeAudio.instances[0];
    act(() => {
      firstAudio.resolveMetadata(30);
    });
    expect(result.current.currentTimeSeconds).toBe(30);

    await act(() => result.current.togglePlay());
    expect(firstAudio.currentTime).toBe(0);
    expect(firstAudio.play).toHaveBeenCalledTimes(1);

    act(() => firstAudio.fail());
    expect(result.current.currentTimeSeconds).toBe(0);
    expect(result.current.hasError).toBe(true);

    await act(() => result.current.togglePlay());
    expect(FakeAudio.instances).toHaveLength(2);
    expect(FakeAudio.instances[1].currentTime).toBe(0);
    expect(FakeAudio.instances[1].play).toHaveBeenCalledTimes(1);
  });

  it("resets the visible position when playback rejects before Retry", async () => {
    const { result } = renderHook(() => useAudioPlayer("voice.wav", 60));

    await act(() => result.current.seek(20));
    const firstAudio = FakeAudio.instances[0];
    act(() => {
      firstAudio.resolveMetadata(60);
    });
    expect(result.current.currentTimeSeconds).toBe(20);
    firstAudio.play.mockRejectedValueOnce(new Error("playback rejected"));

    await act(async () => result.current.togglePlay());
    expect(result.current.hasError).toBe(true);
    expect(result.current.currentTimeSeconds).toBe(0);
    expect(firstAudio.currentTime).toBe(0);

    await act(async () => result.current.togglePlay());
    expect(FakeAudio.instances).toHaveLength(2);
    expect(FakeAudio.instances[1].currentTime).toBe(0);
    expect(FakeAudio.instances[1].play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(true);
  });

  it("still exposes truthful failure state when a broken element rejects a time reset", async () => {
    const { result } = renderHook(() => useAudioPlayer("voice.wav", 60));

    await act(() => result.current.seek(20));
    const audio = FakeAudio.instances[0];
    act(() => {
      audio.resolveMetadata(60);
    });
    audio.throwOnCurrentTimeReset = true;
    act(() => audio.fail());

    expect(result.current.hasError).toBe(true);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentTimeSeconds).toBe(0);
    expect(audio.currentTime).toBe(20);
  });

  it("ignores a rejected Play promise from an audio element replaced by a URL change", async () => {
    const { result, rerender } = renderHook(
      ({ url }) => useAudioPlayer(url, 60),
      { initialProps: { url: "first.wav" } },
    );

    await act(async () => result.current.togglePlay());
    const firstAudio = FakeAudio.instances[0];
    await act(async () => result.current.togglePlay());
    let rejectStalePlay: ((reason: Error) => void) | undefined;
    firstAudio.play.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectStalePlay = reject;
        }),
    );
    await act(async () => result.current.togglePlay());

    rerender({ url: "second.wav" });
    await act(async () => result.current.togglePlay());
    expect(FakeAudio.instances).toHaveLength(2);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.hasError).toBe(false);

    await act(async () => rejectStalePlay?.(new Error("stale rejection")));
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.hasError).toBe(false);
    expect(result.current.currentTimeSeconds).toBe(0);
  });

  it("keeps speed and playback state while seeking and cleans up on URL change", async () => {
    const { result, rerender } = renderHook(
      ({ url }) => useAudioPlayer(url, 60),
      { initialProps: { url: "first.wav" } },
    );

    await act(async () => result.current.togglePlay());
    const firstAudio = FakeAudio.instances[0];
    expect(result.current.isPlaying).toBe(true);

    await act(() => result.current.toggleSpeed());
    expect(firstAudio.playbackRate).toBe(1.5);
    act(() => {
      firstAudio.resolveMetadata(60);
    });
    await act(() => result.current.seek(25));
    expect(firstAudio.currentTime).toBe(25);
    expect(result.current.isPlaying).toBe(true);

    rerender({ url: "second.wav" });
    expect(firstAudio.pause).toHaveBeenCalled();
    expect(firstAudio.src).toBe("");
    expect(result.current.currentTimeSeconds).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });
});

describe("VoiceNote semantic controls", () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders one named range, updates through keys, and keeps truthful control labels", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <VoiceNote url="voice.wav" duration={65} isOwn={false} />,
    );
    const slider = screen.getByRole("slider", {
      name: "Voice note position",
    });

    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "65");
    expect(slider).toHaveValue("0");
    expect(slider).toHaveAttribute(
      "aria-valuetext",
      "0 seconds of 1 minute 5 seconds",
    );
    expect(slider).toHaveClass("h-11");
    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider).toHaveValue("1");
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(slider).toHaveValue("11");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider).toHaveValue("65");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider).toHaveValue("0");

    const loadingPlayButton = screen.getByRole("button", {
      name: "Play voice note",
    });
    expect(loadingPlayButton).toBeDisabled();
    act(() => {
      FakeAudio.instances[0].resolveMetadata(65);
    });
    await user.click(screen.getByRole("button", { name: "Play voice note" }));
    expect(
      screen.getByRole("button", { name: "Pause voice note" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", {
        name: "Voice note playback speed 1 times; change speed",
      }),
    );
    expect(
      screen.getByRole("button", {
        name: "Voice note playback speed 1.5 times; change speed",
      }),
    ).toBeInTheDocument();
  });

  it("offers Retry after failure and omits a false slider when duration is unknown", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<VoiceNote url="voice.wav" />);
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play voice note" }));
    act(() => FakeAudio.instances[0].fail());
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Voice note unavailable",
    );
    const retry = screen.getByRole("button", { name: "Retry voice note" });
    expect(retry).toHaveAttribute("aria-describedby");
    await user.click(retry);
    expect(FakeAudio.instances).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Pause voice note" }),
    ).toBeInTheDocument();

    rerender(<VoiceNote url="known.wav" duration={12} />);
    expect(screen.getByRole("slider")).toHaveAttribute("max", "12");
  });

  it("keeps every control distinguishable when a message has multiple voice notes", async () => {
    const user = userEvent.setup();
    render(
      <>
        <VoiceNote
          accessibleLabel="Voice note 1 of 2"
          duration={12}
          url="first.wav"
        />
        <VoiceNote
          accessibleLabel="Voice note 2 of 2"
          duration={18}
          url="second.wav"
        />
      </>,
    );

    expect(
      screen.getByRole("slider", { name: "Voice note 1 of 2 position" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Voice note 2 of 2 position" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play voice note 1 of 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play voice note 2 of 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Voice note 1 of 2 playback speed 1 times; change speed",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Voice note 2 of 2 playback speed 1 times; change speed",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Play voice note 1 of 2" }),
    );
    expect(
      screen.getByRole("button", { name: "Pause voice note 1 of 2" }),
    ).toBeInTheDocument();
    act(() => FakeAudio.instances[0].fail());
    expect(
      screen.getByRole("button", { name: "Retry voice note 1 of 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play voice note 2 of 2" }),
    ).toBeInTheDocument();
  });
});
