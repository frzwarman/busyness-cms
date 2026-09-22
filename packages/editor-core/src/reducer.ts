import type { PageDocument, SectionInstance } from '@siteos/schemas';
import { createId } from '@siteos/schemas';
import type { SectionRegistry } from '@siteos/sections';
import { setPath } from './path.ts';

export type EditorState = {
  document: PageDocument;
  selectedSectionId: string | null;
  /** Local undo/redo: seconds and minutes of work. Not version history. */
  past: PageDocument[];
  future: PageDocument[];
  /** True when the document differs from the last saved snapshot. */
  dirty: boolean;
  /** For coalescing rapid edits to the same field into one undo step. */
  lastEdit: { key: string; at: number } | null;
};

export type EditorAction =
  | { type: 'load'; document: PageDocument }
  | { type: 'select'; sectionId: string | null }
  | { type: 'addSection'; sectionType: string; index?: number; overrides?: Record<string, unknown> }
  | { type: 'removeSection'; sectionId: string }
  | { type: 'duplicateSection'; sectionId: string }
  | { type: 'moveSection'; sectionId: string; toIndex: number }
  | { type: 'toggleHidden'; sectionId: string }
  | { type: 'updateProps'; sectionId: string; path: string; value: unknown; at?: number }
  | { type: 'setVariant'; sectionId: string; variant: string }
  /** Turn a section into a placeholder for a global (globalId set) or detach it into a local copy (globalId cleared, content given). */
  | { type: 'linkGlobal'; sectionId: string; globalId: string }
  | {
      type: 'detachGlobal';
      sectionId: string;
      content: { type: string; schemaVersion: number; props: Record<string, unknown> };
    }
  | {
      type: 'insertGlobal';
      globalId: string;
      content: { type: string; schemaVersion: number; props: Record<string, unknown> };
      index?: number;
    }
  | { type: 'renamePage'; title: string }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'markSaved' };

export const COALESCE_WINDOW_MS = 800;
const HISTORY_LIMIT = 100;

export function createEditorState(document: PageDocument): EditorState {
  return {
    document,
    selectedSectionId: document.sections[0]?.id ?? null,
    past: [],
    future: [],
    dirty: false,
    lastEdit: null,
  };
}

function commit(
  state: EditorState,
  document: PageDocument,
  coalesceKey?: string,
  at = 0,
): EditorState {
  const coalesce =
    coalesceKey !== undefined &&
    state.lastEdit !== null &&
    state.lastEdit.key === coalesceKey &&
    at - state.lastEdit.at < COALESCE_WINDOW_MS;
  const past = coalesce ? state.past : [...state.past, state.document].slice(-HISTORY_LIMIT);
  return {
    ...state,
    document,
    past,
    future: [],
    dirty: true,
    lastEdit: coalesceKey !== undefined ? { key: coalesceKey, at } : null,
  };
}

function replaceSection(
  doc: PageDocument,
  id: string,
  fn: (s: SectionInstance) => SectionInstance,
): PageDocument {
  return { ...doc, sections: doc.sections.map((s) => (s.id === id ? fn(s) : s)) };
}

export function createEditorReducer(registry: SectionRegistry) {
  return function reduce(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
      case 'load':
        return createEditorState(action.document);

      case 'select':
        return state.selectedSectionId === action.sectionId
          ? state
          : { ...state, selectedSectionId: action.sectionId };

      case 'addSection': {
        const section = registry.create(action.sectionType, action.overrides);
        const sections = [...state.document.sections];
        const index = Math.min(Math.max(action.index ?? sections.length, 0), sections.length);
        sections.splice(index, 0, section);
        return { ...commit(state, { ...state.document, sections }), selectedSectionId: section.id };
      }

      case 'removeSection': {
        const idx = state.document.sections.findIndex((s) => s.id === action.sectionId);
        if (idx === -1) return state;
        const sections = state.document.sections.filter((s) => s.id !== action.sectionId);
        const next = commit(state, { ...state.document, sections });
        const neighbour = sections[Math.min(idx, sections.length - 1)]?.id ?? null;
        return {
          ...next,
          selectedSectionId:
            state.selectedSectionId === action.sectionId ? neighbour : state.selectedSectionId,
        };
      }

      case 'duplicateSection': {
        const idx = state.document.sections.findIndex((s) => s.id === action.sectionId);
        const source = state.document.sections[idx];
        if (!source) return state;
        const copy: SectionInstance = { ...structuredClone(source), id: createId('sec') };
        const sections = [...state.document.sections];
        sections.splice(idx + 1, 0, copy);
        return { ...commit(state, { ...state.document, sections }), selectedSectionId: copy.id };
      }

      case 'moveSection': {
        const from = state.document.sections.findIndex((s) => s.id === action.sectionId);
        if (from === -1) return state;
        const to = Math.min(Math.max(action.toIndex, 0), state.document.sections.length - 1);
        if (from === to) return state;
        const sections = [...state.document.sections];
        const [moved] = sections.splice(from, 1);
        sections.splice(to, 0, moved as SectionInstance);
        return commit(state, { ...state.document, sections });
      }

      case 'toggleHidden':
        return commit(
          state,
          replaceSection(state.document, action.sectionId, (s) => ({ ...s, hidden: !s.hidden })),
        );

      case 'updateProps': {
        if (!state.document.sections.some((s) => s.id === action.sectionId)) return state;
        const doc = replaceSection(state.document, action.sectionId, (s) => ({
          ...s,
          props: setPath(s.props, action.path, action.value),
        }));
        return commit(state, doc, `${action.sectionId}:${action.path}`, action.at ?? Date.now());
      }

      case 'setVariant':
        return commit(
          state,
          replaceSection(state.document, action.sectionId, (s) => ({
            ...s,
            props: { ...s.props, variant: action.variant },
          })),
        );

      case 'linkGlobal':
        return commit(
          state,
          replaceSection(state.document, action.sectionId, (s) => ({
            ...s,
            globalId: action.globalId,
          })),
        );

      case 'detachGlobal':
        return commit(
          state,
          replaceSection(state.document, action.sectionId, (s) => {
            const { globalId: _drop, ...rest } = s;
            return {
              ...rest,
              type: action.content.type,
              schemaVersion: action.content.schemaVersion,
              props: structuredClone(action.content.props),
            };
          }),
        );

      case 'insertGlobal': {
        const section: SectionInstance = {
          id: createId('sec'),
          type: action.content.type,
          schemaVersion: action.content.schemaVersion,
          hidden: false,
          globalId: action.globalId,
          props: structuredClone(action.content.props),
        };
        const sections = [...state.document.sections];
        const index = Math.min(Math.max(action.index ?? sections.length, 0), sections.length);
        sections.splice(index, 0, section);
        return { ...commit(state, { ...state.document, sections }), selectedSectionId: section.id };
      }

      case 'renamePage':
        return commit(state, { ...state.document, title: action.title });

      case 'undo': {
        const previous = state.past.at(-1);
        if (!previous) return state;
        return {
          ...state,
          document: previous,
          past: state.past.slice(0, -1),
          future: [state.document, ...state.future],
          dirty: true,
          lastEdit: null,
        };
      }

      case 'redo': {
        const [next, ...rest] = state.future;
        if (!next) return state;
        return {
          ...state,
          document: next,
          past: [...state.past, state.document],
          future: rest,
          dirty: true,
          lastEdit: null,
        };
      }

      case 'markSaved':
        return state.dirty ? { ...state, dirty: false } : state;
    }
  };
}

export const selectors = {
  selectedSection: (s: EditorState): SectionInstance | undefined =>
    s.document.sections.find((x) => x.id === s.selectedSectionId),
  canUndo: (s: EditorState) => s.past.length > 0,
  canRedo: (s: EditorState) => s.future.length > 0,
};
