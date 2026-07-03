export function shouldRenderAttentionSquare(index: number) {
  return index < 2 || index >= 4;
}

export function shouldRenderAttentionBadge(index: number) {
  return index < 4;
}

export function getAttentionSquareTone(index: number) {
  return index >= 4 ? "amber" : "teal";
}

export function getAttentionAvatarTone(index: number) {
  return index < 2 ? "teal" : "default";
}

export function getAttentionButtonTone(index: number) {
  return index >= 4 ? "default" : "teal";
}

export function getAttentionTextWidths(index: number) {
  return index >= 4 ? ["w-56"] : index < 2 ? ["w-72"] : ["w-56"];
}

export function getFirstItemTone(index: number) {
  return index === 0 ? "teal" : "default";
}

export function getGroupRowTextWidths(index: number) {
  return index % 2 === 0 ? ["w-32", "w-44", "w-16"] : ["w-36", "w-40", "w-20"];
}
