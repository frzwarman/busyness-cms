import {
  PREVIEW_PROTOCOL_VERSION,
  type PreviewToStudioMessage,
  type StudioToPreviewMessage,
} from '@siteos/schemas';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PREVIEW_URL, usePreviewBridge } from '@/lib/preview-bridge';
import { useDebouncedEffect } from '@/lib/use-debounced-effect';
import { cn } from '@/lib/utils';
import { useResolvedDocument } from './content/content-queries';
import { useEditor } from './EditorProvider';

const widths = { desktop: undefined, tablet: 820, mobile: 390 } as const;

export function Preview() {
  const { state, theme, pages, device, requestFocus, setPageWeight } = useEditor();
  const { resolved } = useResolvedDocument();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Latest payload lives in a ref so a (re)loaded iframe can be rendered immediately on 'ready'.
  const payloadRef = useRef({
    page: resolved,
    theme,
    pages,
    selectedSectionId: state.selectedSectionId,
  });
  payloadRef.current = { page: resolved, theme, pages, selectedSectionId: state.selectedSectionId };

  const sendRef = useRef<(msg: StudioToPreviewMessage) => void>(() => {});
  const onMessage = useCallback(
    (msg: PreviewToStudioMessage) => {
      if (msg.type === 'siteos:ready') {
        // Fires on first load AND whenever the iframe reloads (dev HMR, crash recovery): always re-render.
        setReady(true);
        setError(null);
        sendRef.current({
          v: PREVIEW_PROTOCOL_VERSION,
          type: 'siteos:render',
          payload: payloadRef.current,
        });
      } else if (msg.type === 'siteos:rendered') {
        setError(msg.ok ? null : (msg.error ?? 'Unknown error'));
        if (msg.ok && msg.weight) setPageWeight(msg.weight);
      } else if (msg.type === 'siteos:selected') requestFocus(msg.sectionId, msg.fieldPath);
    },
    [requestFocus, setPageWeight],
  );
  const send = usePreviewBridge(iframeRef, onMessage);
  sendRef.current = send;

  // Full render on content/theme change (debounced so typing stays smooth)…
  useDebouncedEffect(
    () => {
      if (ready)
        send({ v: PREVIEW_PROTOCOL_VERSION, type: 'siteos:render', payload: payloadRef.current });
    },
    [resolved, theme, pages, ready],
    120,
  );
  // …but selection changes are instant and don't re-render.
  useEffect(() => {
    if (ready)
      send({
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'siteos:select',
        sectionId: state.selectedSectionId,
      });
  }, [ready, send, state.selectedSectionId]);

  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [ready]);
  const retry = () => {
    setReady(false);
    setTimedOut(false);
    setReloadKey((k) => k + 1);
  };

  const width = widths[device];
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4 lg:p-6">
        <div
          className={cn(
            'mx-auto h-full min-h-[600px] overflow-hidden rounded-lg border bg-white shadow-sm',
            device === 'desktop' ? 'w-full max-w-[1440px]' : 'w-fit',
          )}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            title="Live preview of the page"
            src={PREVIEW_URL}
            className="block h-full transition-[width] duration-200"
            style={{ width: width ?? '100%' }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
      {(!ready || error) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <div
            className={cn(
              'pointer-events-auto flex items-center gap-3 rounded-md border bg-background/95 px-3 py-2 text-xs shadow-md',
              error && 'border-destructive/40',
            )}
          >
            {error ? (
              <>
                <AlertTriangle className="size-4 text-destructive" />
                <span>The preview failed to render: {error}. Your draft is still safe.</span>
              </>
            ) : timedOut ? (
              <>
                <AlertTriangle className="size-4 text-amber-500" />
                <span>
                  The preview failed to load. Is the renderer running at {PREVIEW_URL}? Your draft
                  content is still safe.
                </span>
                <Button size="xs" variant="outline" onClick={retry}>
                  <RefreshCw /> Retry
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground">Connecting to preview…</span>
            )}
          </div>
        </div>
      )}
      <output aria-live="polite" className="sr-only">
        {device === 'desktop'
          ? 'Desktop preview'
          : device === 'tablet'
            ? 'Tablet preview, 820 pixels wide'
            : 'Mobile preview, 390 pixels wide'}
      </output>
    </div>
  );
}
