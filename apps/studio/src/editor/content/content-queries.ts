import {
  DraftConflictError,
  type GlobalRow,
  listEntries,
  listGlobals,
  saveGlobal,
} from '@siteos/db';
import { getPath, setPath } from '@siteos/editor-core';
import type { PageDocument } from '@siteos/schemas';
import { registry, resolveDocument } from '@siteos/sections';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useEditor } from '../EditorProvider';
import { formsQuery } from '../site/site-queries';

export const entriesQuery = (siteId: string) => ({
  queryKey: ['content', siteId],
  queryFn: () => listEntries(supabase, siteId),
});
export const globalsQuery = (siteId: string) => ({
  queryKey: ['globals', siteId],
  queryFn: () => listGlobals(supabase, siteId),
});

/** The editor's document with library content and globals inlined — what the preview shows and publish stores. */
export function useResolvedDocument(): { resolved: PageDocument; ready: boolean } {
  const { state, siteId } = useEditor();
  const { data: entries } = useQuery(entriesQuery(siteId));
  const { data: globals } = useQuery(globalsQuery(siteId));
  const { data: forms } = useQuery(formsQuery(siteId));
  const resolved = useMemo(
    () =>
      resolveDocument(
        state.document,
        {
          entries: (entries ?? []).map((e) => ({
            id: e.id,
            collection: e.collection,
            data: e.data,
            tags: e.tags,
          })),
          globals: (globals ?? []).map((g) => ({ id: g.id, name: g.name, section: g.section })),
          forms: forms ?? [],
        },
        registry,
      ),
    [state.document, entries, globals, forms],
  );
  return { resolved, ready: entries !== undefined && globals !== undefined };
}

export type GlobalEditStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

/**
 * Editing a global's props from the inspector: local buffer, debounced revision-checked save, no page-level undo
 * (globals are shared; the page's undo stack must not rewrite them).
 */
export function useGlobalEditor(globalId: string | undefined) {
  const { siteId, canEdit } = useEditor();
  const qc = useQueryClient();
  const { data: globals } = useQuery(globalsQuery(siteId));
  const global = globals?.find((g) => g.id === globalId);
  const [buffer, setBuffer] = useState<GlobalRow | null>(null);
  const [status, setStatus] = useState<GlobalEditStatus>('idle');
  const revision = useRef(global?.revision ?? 0);
  useEffect(() => {
    if (global && (!buffer || buffer.id !== global.id)) {
      setBuffer(global);
      revision.current = global.revision;
    }
  }, [global, buffer]);

  const current = buffer ?? global ?? null;
  const dirty = Boolean(
    buffer && global && JSON.stringify(buffer.section) !== JSON.stringify(global.section),
  );

  useEffect(() => {
    if (!dirty || !buffer || !canEdit || status === 'conflict') return;
    setStatus('saving');
    const t = setTimeout(() => {
      saveGlobal(supabase, buffer.id, revision.current, buffer.section)
        .then((rev) => {
          revision.current = rev;
          qc.setQueryData<GlobalRow[]>(['globals', siteId], (old) =>
            old?.map((g) =>
              g.id === buffer.id ? { ...g, section: buffer.section, revision: rev } : g,
            ),
          );
          setStatus('saved');
        })
        .catch((e) => setStatus(e instanceof DraftConflictError ? 'conflict' : 'error'));
    }, 800);
    return () => clearTimeout(t);
  }, [buffer, dirty, canEdit, siteId, qc, status]);

  const update = useCallback((path: string, value: unknown) => {
    setBuffer((b) =>
      b ? { ...b, section: { ...b.section, props: setPath(b.section.props, path, value) } } : b,
    );
  }, []);
  const setVariant = useCallback((variant: string) => update('variant', variant), [update]);

  return {
    global: current,
    props: current?.section.props ?? {},
    update,
    setVariant,
    status,
    getProp: (p: string) => getPath(current?.section.props, p),
  };
}
