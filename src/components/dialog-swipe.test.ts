// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TouchEvent } from 'react';
import { createDialogSwipeHandlers } from './dialog-swipe';

function setup() {
  const dialog = document.createElement('div');
  dialog.style.overflowY = 'auto';
  const child = document.createElement('div');
  dialog.append(child);
  document.body.append(dialog);
  const close = vi.fn();
  const handlers = createDialogSwipeHandlers(close);
  const event = (y: number, count = 1, target: HTMLElement = child, x = 20) => ({
    currentTarget: dialog, target,
    touches: Array.from({ length: count }, () => ({ clientX: x, clientY: y })),
    changedTouches: [{ clientX: x, clientY: y }],
  } as unknown as TouchEvent<HTMLDivElement>);
  const clean = () => {
    expect(dialog.style.translate).toBe('');
    expect(dialog.style.transform).toBe('');
    expect(dialog.style.transition).toBe('');
  };
  return { dialog, child, close, handlers, event, clean };
}

afterEach(() => document.body.replaceChildren());

describe('Dashboard dialog touch gestures', () => {
  it('moves downward from scrollTop 0 independently of centering and closes beyond 90px', () => {
    const s = setup();
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(200));
    expect(s.dialog.style.transform).toBe('translate3d(0, 100px, 0)');
    expect(s.dialog.style.translate).toBe('');
    s.handlers.onTouchEnd(s.event(200, 0));
    expect(s.close).toHaveBeenCalledTimes(1);
    s.clean();
  });
  it('prioritizes internal scrolling when scrollTop is above zero, even if it reaches the top', () => {
    const s = setup();
    s.dialog.scrollTop = 30;
    s.handlers.onTouchStart(s.event(100));
    s.dialog.scrollTop = 0;
    s.handlers.onTouchMove(s.event(240));
    s.handlers.onTouchEnd(s.event(240, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
  it('respects nested scrollable content and mid-gesture scrolling', () => {
    const s = setup();
    s.child.style.overflowY = 'auto';
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(120));
    s.child.scrollTop = 12;
    s.handlers.onTouchMove(s.event(220));
    s.handlers.onTouchEnd(s.event(220, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
  it.each([0, 4, 90])('cleans taps and short swipes of %ipx without closing', (distance) => {
    const s = setup();
    s.dialog.style.translate = '0 0';
    s.dialog.style.transform = 'translateY(20px)';
    s.dialog.style.transition = 'all 1s';
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(100 + distance));
    s.handlers.onTouchEnd(s.event(100 + distance, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
  it('cancels a long swipe without dismissing or leaving inline styles', () => {
    const s = setup();
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(300));
    expect(s.dialog.style.transform).toBe('translate3d(0, 160px, 0)');
    s.handlers.onTouchCancel(s.event(300, 0));
    s.handlers.onTouchEnd(s.event(300, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
  it('cancels multi-touch and cannot resume until a fresh start', () => {
    const s = setup();
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(130));
    s.handlers.onTouchMove(s.event(150, 2));
    s.handlers.onTouchMove(s.event(300));
    s.handlers.onTouchEnd(s.event(300, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
  it.each(['up', 'horizontal'])('never turns a native %s gesture into dismiss', (axis) => {
    const s = setup();
    s.handlers.onTouchStart(s.event(100));
    s.handlers.onTouchMove(s.event(axis === 'up' ? 80 : 110, 1, s.child, axis === 'up' ? 20 : 100));
    s.handlers.onTouchMove(s.event(300));
    s.handlers.onTouchEnd(s.event(300, 0));
    expect(s.close).not.toHaveBeenCalled();
    s.clean();
  });
});