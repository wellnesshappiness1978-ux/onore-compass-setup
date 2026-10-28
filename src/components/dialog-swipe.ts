import type { TouchEvent } from 'react';

/** Keep Tailwind's individual translate (dialog centering) separate from dragging. */
export function resetDialogDrag(element: HTMLElement) {
  element.style.translate = '';
  element.style.transform = '';
  element.style.transition = '';
}

function scrolledInside(target: EventTarget, dialog: HTMLElement) {
  let element = target instanceof Element ? target : null;
  while (element && dialog.contains(element)) {
    if (element instanceof HTMLElement && element.scrollTop > 0) {
      const overflow = getComputedStyle(element).overflowY;
      if (element === dialog || /auto|scroll|overlay/.test(overflow)) return true;
    }
    if (element === dialog) break;
    element = element.parentElement;
  }
  return dialog.scrollTop > 0;
}

export function createDialogSwipeHandlers(onClose: () => void) {
  let gesture: { x: number; y: number; dragging: boolean; target: EventTarget } | null = null;
  const cancel = (event: TouchEvent<HTMLDivElement>) => {
    gesture = null;
    resetDialogDrag(event.currentTarget);
  };
  return {
    onTouchStart(event: TouchEvent<HTMLDivElement>) {
      cancel(event);
      const point = event.touches[0];
      if (event.touches.length !== 1 || !point || scrolledInside(event.target, event.currentTarget)) return;
      if ((window.visualViewport?.scale ?? 1) > 1) return;
      gesture = { x: point.clientX, y: point.clientY, dragging: false, target: event.target };
    },
    onTouchMove(event: TouchEvent<HTMLDivElement>) {
      const point = event.touches[0];
      if (!gesture) return;
      if (event.touches.length !== 1 || !point || scrolledInside(gesture.target, event.currentTarget) || (window.visualViewport?.scale ?? 1) > 1) {
        cancel(event);
        return;
      }
      const dy = point.clientY - gesture.y;
      const dx = point.clientX - gesture.x;
      if (!gesture.dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        // Once scrolling up or sideways begins, it remains a native gesture.
        if (dy <= 0 || dy <= Math.abs(dx) * 1.5) { cancel(event); return; }
        gesture.dragging = true;
      }
      if (dy <= 0) { cancel(event); return; }
      event.currentTarget.style.transition = 'none';
      event.currentTarget.style.transform = `translate3d(0, ${Math.min(dy, 160)}px, 0)`;
    },
    onTouchEnd(event: TouchEvent<HTMLDivElement>) {
      const point = event.changedTouches[0];
      const close = gesture?.dragging && point && event.touches.length === 0
        && point.clientY - gesture.y > 90
        && !scrolledInside(gesture.target, event.currentTarget)
        && (window.visualViewport?.scale ?? 1) <= 1;
      cancel(event);
      if (close) onClose();
    },
    onTouchCancel: cancel,
  };
}