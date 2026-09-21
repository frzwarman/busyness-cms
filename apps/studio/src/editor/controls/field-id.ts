export const fieldId = (sectionId: string, path: string) =>
  `f-${sectionId}-${path.replace(/\./g, '-')}`;
