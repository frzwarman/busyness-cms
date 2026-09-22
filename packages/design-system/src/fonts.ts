import type { FontId } from '@siteos/schemas';

/**
 * Font stacks per curated id. Self-hosted families (SIL OFL, via @fontsource-variable in the renderer) list their
 * variable family name first; system stacks cost nothing to load. `serif` steers line-height and measure.
 */
export const fontStacks: Record<
  FontId,
  { label: string; stack: string; serif: boolean; selfHosted: boolean }
> = {
  inter: {
    label: 'Inter',
    stack: '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: false,
    selfHosted: true,
  },
  manrope: {
    label: 'Manrope',
    stack: '"Manrope Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: false,
    selfHosted: true,
  },
  'dm-sans': {
    label: 'DM Sans',
    stack: '"DM Sans Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    serif: false,
    selfHosted: true,
  },
  'space-grotesk': {
    label: 'Space Grotesk',
    stack: '"Space Grotesk Variable", system-ui, -apple-system, "Segoe UI", sans-serif',
    serif: false,
    selfHosted: true,
  },
  fraunces: {
    label: 'Fraunces',
    stack: '"Fraunces Variable", Georgia, "Times New Roman", serif',
    serif: true,
    selfHosted: true,
  },
  'playfair-display': {
    label: 'Playfair Display',
    stack: '"Playfair Display Variable", Georgia, "Times New Roman", serif',
    serif: true,
    selfHosted: true,
  },
  lora: {
    label: 'Lora',
    stack: '"Lora Variable", Georgia, "Times New Roman", serif',
    serif: true,
    selfHosted: true,
  },
  'system-sans': {
    label: 'System sans',
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: false,
    selfHosted: false,
  },
  'system-serif': {
    label: 'System serif',
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    serif: true,
    selfHosted: false,
  },
  'system-rounded': {
    label: 'System rounded',
    stack: 'ui-rounded, "SF Pro Rounded", "Nunito", "Segoe UI", system-ui, sans-serif',
    serif: false,
    selfHosted: false,
  },
  'system-mono': {
    label: 'System mono',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    serif: false,
    selfHosted: false,
  },
};
