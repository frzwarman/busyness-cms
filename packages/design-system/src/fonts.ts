import type { FontId } from '@siteos/schemas';

/** System stacks only: zero network cost, known licensing. Self-hosted families are a later, opt-in step. */
export const fontStacks: Record<FontId, { label: string; stack: string }> = {
  'system-sans': {
    label: 'System Sans',
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  'system-serif': {
    label: 'System Serif',
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  'system-rounded': {
    label: 'Rounded',
    stack: 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif',
  },
  'system-mono': {
    label: 'Mono',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  },
  humanist: {
    label: 'Humanist',
    stack: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif',
  },
  geometric: {
    label: 'Geometric',
    stack: 'Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif',
  },
};
