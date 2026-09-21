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
import { savePageDraft, saveThemeDraft } from '@/lib/draft-store';
import { useDebouncedEffect } from '@/lib/use-debounced-effect';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';
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
  saveNow: () => void;
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
  children,
}: {
  page: PageDocument;
  theme: ThemeTokens;
  pages: PageSummary[];
  siteName: string;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, page, createEditorState);
  const [theme, setThemeState] = useState(initialTheme);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [device, setDevice] = useState<Device>('desktop');
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const queryClient = useQueryClient();
  const inflight = useRef<PageDocument | null>(null);

  // Reload when navigating to another page id.
  useEffect(() => {
    dispatch({ type: 'load', document: page });
  }, [page]);

  const save = useCallback(async () => {
    const doc = state.document;
    if (inflight.current === doc) return;
    inflight.current = doc;
    setSaveStatus('saving');
    try {
      await savePageDraft(doc);
      // Only mark saved if nothing changed while the request was in flight (no out-of-order overwrite).
      if (inflight.current === doc) {
        dispatch({ type: 'markSaved' });
        setSaveStatus('saved');
        void queryClient.invalidateQueries({ queryKey: ['site'] });
      }
    } catch {
      setSaveStatus('error');
    } finally {
      if (inflight.current === doc) inflight.current = null;
    }
  }, [state.document, queryClient]);

  useEffect(() => {
    if (state.dirty && saveStatus !== 'saving') setSaveStatus('unsaved');
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
      if (theme !== initialTheme)
        void saveThemeDraft(theme).then(() =>
          queryClient.invalidateQueries({ queryKey: ['site'] }),
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
      saveNow: () => void save(),
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
      save,
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
