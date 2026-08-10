const EXCLUDED_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

export const KEYBOARD_VIEWPORT_CSS_VARIABLES = {
  bottomInset: "--keyboard-viewport-bottom-inset",
  height: "--keyboard-viewport-height",
  offsetTop: "--keyboard-viewport-offset-top",
} as const;

export interface KeyboardViewportGeometryInput {
  layoutHeight: number;
  viewport: Pick<VisualViewport, "height" | "offsetTop" | "scale">;
}

export interface KeyboardViewportSnapshot {
  bottomInset: number;
  height: number;
  offsetTop: number;
  scale: number;
}

export function isKeyboardViewportEditable(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  if (tagName === "textarea" || tagName === "select") {
    return !target.hasAttribute("disabled");
  }

  if (tagName === "input") {
    const type = (target.getAttribute("type") || "text").toLowerCase();
    return !target.hasAttribute("disabled") && !EXCLUDED_INPUT_TYPES.has(type);
  }

  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.contentEditable === "true" ||
      target.getAttribute("contenteditable") === "true") &&
    target.getAttribute("aria-disabled") !== "true"
  );
}

export function isKeyboardViewportUnzoomed(scale: number) {
  return Math.abs(scale - 1) < 0.01;
}

export function getKeyboardViewportSnapshot({
  layoutHeight,
  viewport,
}: KeyboardViewportGeometryInput): KeyboardViewportSnapshot {
  const height = Math.max(0, viewport.height);
  const offsetTop = Math.max(0, viewport.offsetTop);

  return {
    bottomInset: Math.max(0, layoutHeight - height - offsetTop),
    height,
    offsetTop,
    scale: viewport.scale,
  };
}

function toCssPixelValue(value: number) {
  return `${Math.round(value * 100) / 100}px`;
}

export function writeKeyboardViewportSnapshot(
  element: HTMLElement,
  snapshot: KeyboardViewportSnapshot,
) {
  const values = {
    [KEYBOARD_VIEWPORT_CSS_VARIABLES.bottomInset]: toCssPixelValue(
      snapshot.bottomInset,
    ),
    [KEYBOARD_VIEWPORT_CSS_VARIABLES.height]: toCssPixelValue(snapshot.height),
    [KEYBOARD_VIEWPORT_CSS_VARIABLES.offsetTop]: toCssPixelValue(
      snapshot.offsetTop,
    ),
  };

  for (const [property, value] of Object.entries(values)) {
    if (element.style.getPropertyValue(property) !== value) {
      element.style.setProperty(property, value);
    }
  }
}

export function clearKeyboardViewportSnapshot(element: HTMLElement) {
  for (const property of Object.values(KEYBOARD_VIEWPORT_CSS_VARIABLES)) {
    element.style.removeProperty(property);
  }
}
