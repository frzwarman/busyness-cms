import {
  isTrustedOrigin,
  type PreviewToStudioMessage,
  previewToStudioMessageSchema,
  type StudioToPreviewMessage,
} from '@siteos/schemas';
import { type RefObject, useCallback, useEffect } from 'react';

export const PREVIEW_ORIGIN = import.meta.env.VITE_PREVIEW_ORIGIN ?? 'http://localhost:4321';
export const PREVIEW_URL = `${PREVIEW_ORIGIN}/preview`;

/** Studio side of the preview protocol: origin-checked, schema-validated, no eval. */
export function usePreviewBridge(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  onMessage: (msg: PreviewToStudioMessage) => void,
) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (!isTrustedOrigin(event.origin, PREVIEW_ORIGIN)) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const parsed = previewToStudioMessageSchema.safeParse(event.data);
      if (parsed.success) onMessage(parsed.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [iframeRef, onMessage]);

  return useCallback(
    (msg: StudioToPreviewMessage) => {
      iframeRef.current?.contentWindow?.postMessage(msg, PREVIEW_ORIGIN);
    },
    [iframeRef],
  );
}
