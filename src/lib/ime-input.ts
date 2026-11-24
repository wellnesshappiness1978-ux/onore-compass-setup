/** Safari can report keyCode 229 even when isComposing is false. */
export function isImeInput(event: { isComposing?: boolean; keyCode?: number }, composing = false) {
  return composing || event.isComposing === true || event.keyCode === 229;
}