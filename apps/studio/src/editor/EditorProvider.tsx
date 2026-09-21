import { DraftConflictError } from '@siteos/db';
import {
  createEditorReducer,
  createEditorState,
  type EditorAction,
  type EditorState,
  selectors,
} from '@siteos/editor-core';
import type { PageDocument, PageSummary, ThemeTokens } from '@siteos/schemas';
import { registry } from '@siteos/sections';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useDebouncedEffect } from '@/lib/use-debounced-effect';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict';

/** How the editor persists. Injected so the Studio can back it with Supabase and tests with fakes. */
export type EditorPersistence = {
  initialRevision: number;
  /** Resolve with the new revision; throw DraftConflictError (or any error) to surface a failure. */
  savePage: (document: PageDocument, expectedRevision: number) => Promise<number>;
  saveTheme: (theme: ThemeTokens) => Promise<void>;
};
export type Device = 'desktop' | 'tablet' | 'mobile';
export type FocusRequest = { sectionId: string; fieldPath: string | null; nonce: number };

type EditorContextValue = {
  state: EditorState;
  dispatch: (action: EditorAction) => void;
  theme: ThemeTokens;
  setTheme: (theme: ThemeTokens) => void;
  pages: PageSummary[];
  siteName: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  saveNow: () => void;
  siteId: string;
  canEdit: boolean;
  device: Device;
  setDevice: (d: Device) => void;
  focusRequest: FocusRequest | null;
  requestFocus: (sectionId: string, fieldPath: string | null) => void;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);
const reducer = createEditorReducer(registry);

export function EditorProvider({
  page,
  theme: initialTheme,
  pages,
  siteName,
  siteId,
  persistence,
  canEdit = true,
  children,
}: {
  page: PageDocument;
  theme: ThemeTokens;
  pages: PageSummary[];
  siteName: string;
  siteId: string;
  persistence: EditorPersistence;
  canEdit?: boolean;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, page, createEditorState);
  const [theme, setThemeState] = useState(initialTheme);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [device, setDevice] = useState<Device>('desktop');
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const inflight = useRef<PageDocument | null>(null);
  const revision = useRef(persistence.initialRevision);

  // Reload when navigating to another page id.
  useEffect(() => {
    dispatch({ type: 'load', document: page });
  }, [page]);

  const save = useCallback(async () => {
    const doc = state.document;
    if (!canEdit || inflight.current === doc || saveStatus === 'conflict') return;
    inflight.current = doc;
    setSaveStatus('saving');
    try {
      const next = await persistence.savePage(doc, revision.current);
      revision.current = next;
      // Only mark saved if nothing changed while the request was in flight (no out-of-order overwrite).
      if (inflight.current === doc) {
        dispatch({ type: 'markSaved' });
        setSaveStatus('saved');
        setSaveError(null);
        void queryClient.invalidateQueries({ queryKey: ['pages', siteId] });
      }
    } catch (err) {
      if (err instanceof DraftConflictError) {
        // Never last-write-wins: stop autosaving and ask the user to reload.
        setSaveStatus('conflict');
        setSaveError(err.message);
      } else {
        setSaveStatus('error');
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
      }
    } finally {
      if (inflight.current === doc) inflight.current = null;
    }
  }, [state.document, queryClient, persistence, siteId, canEdit, saveStatus]);

  useEffect(() => {
    if (state.dirty && saveStatus !== 'saving' && saveStatus !== 'conflict')
      setSaveStatus('unsaved');
  }, [state.dirty, saveStatus]);

  useDebouncedEffect(
    () => {
      if (state.dirty) void save();
    },
    [state.document, state.dirty],
    1000,
  );

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (state.dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [state.dirty]);

  const setTheme = useCallback((t: ThemeTokens) => {
    setThemeState(t);
  }, []);
  useDebouncedEffect(
    () => {
      if (theme !== initialTheme && canEdit)
        void persistence
          .saveTheme(theme)
          .then(() => queryClient.invalidateQueries({ queryKey: ['sites'] }))
          .catch((err: unknown) =>
            setSaveError(err instanceof Error ? err.message : 'Failed to save brand settings'),
          );
    },
    [theme],
    600,
  );

  // Keyboard shortcuts. Native browser shortcuts are left alone except the ones we own.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        void save();
      } else if (key === 'z') {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? 'redo' : 'undo' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const requestFocus = useCallback((sectionId: string, fieldPath: string | null) => {
    dispatch({ type: 'select', sectionId });
    setFocusRequest({ sectionId, fieldPath, nonce: Date.now() });
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      theme,
      setTheme,
      pages,
      siteName,
      saveStatus,
      saveError,
      saveNow: () => void save(),
      siteId,
      canEdit,
      device,
      setDevice,
      focusRequest,
      requestFocus,
      pickerOpen,
      setPickerOpen,
    }),
    [
      state,
      theme,
      setTheme,
      pages,
      siteName,
      saveStatus,
      saveError,
      save,
      siteId,
      canEdit,
      device,
      focusRequest,
      requestFocus,
      pickerOpen,
    ],
  );
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}

export function useSelectedSection() {
  const { state } = useEditor();
  return selectors.selectedSection(state);
}
