// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';
import { Textarea } from './textarea';

describe('native Japanese text control', () => {
  for (const Control of [Input, Textarea]) {
    it(`preserves native composition and blocks commands in ${Control.displayName}`, async () => {
      const host = document.createElement('div');
      document.body.append(host);
      const root = createRoot(host);
      const command = vi.fn();
      const start = vi.fn();
      const end = vi.fn();
      await act(async () => root.render(<Control onKeyDown={command} onCompositionStart={start} onCompositionEnd={end} />));
      const field = host.querySelector('input, textarea');
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) throw new Error('Missing input');
      await act(async () => {
        field.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: 'に' }));
        field.value = 'にほんご';
        field.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true, data: 'ご' }));
        field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', isComposing: true }));
      });
      expect(field.value).toBe('にほんご');
      expect(command).not.toHaveBeenCalled();
      await act(async () => {
        field.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'にほんご' }));
        field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      });
      expect(start).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledTimes(1);
      expect(command).toHaveBeenCalledTimes(1);
      await act(async () => root.unmount());
      host.remove();
    });
  }
});