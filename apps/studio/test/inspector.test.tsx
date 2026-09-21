import { registry } from '@siteos/sections';
import { demoHomePage, demoPages, demoTheme } from '@siteos/sections/fixtures';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { EditorProvider } from '@/editor/EditorProvider';
import { Inspector } from '@/editor/Inspector';
import { Thumbnail } from '@/editor/Thumbnail';

function wrap(children: ReactNode) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <EditorProvider
        page={structuredClone(demoHomePage)}
        theme={demoTheme}
        pages={demoPages}
        siteName="Test"
        siteId="site_test"
        persistence={{
          initialRevision: 1,
          savePage: async (_d, rev) => rev + 1,
          saveTheme: async () => {},
        }}
      >
        {children}
      </EditorProvider>
    </QueryClientProvider>
  );
}

describe('Inspector', () => {
  it('generates controls from the registry definition of the selected section', () => {
    render(wrap(<Inspector />));
    const hero = registry.require('hero');
    expect(screen.getByRole('heading', { name: hero.title })).toBeInTheDocument();
    for (const group of hero.inspector)
      expect(screen.getByRole('heading', { name: group.label })).toBeInTheDocument();
    for (const v of hero.variants)
      expect(screen.getByRole('button', { name: v.label })).toBeInTheDocument();
    expect(screen.getByLabelText('Heading')).toHaveValue('Coffee worth slowing down for');
    expect(screen.getByLabelText('Eyebrow')).toHaveValue('Bogor · Since 2019');
  });

  it('writes field edits into section props', () => {
    render(wrap(<Inspector />));
    fireEvent.change(screen.getByLabelText('Heading'), { target: { value: 'New heading' } });
    expect(screen.getByLabelText('Heading')).toHaveValue('New heading');
  });

  it('shows a nullable button as an add affordance and can remove it', () => {
    render(wrap(<Inspector />));
    // The demo hero has both buttons; removing the second one turns it into an "Add" affordance.
    expect(screen.getAllByRole('button', { name: /Remove button/i })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: /Remove button/i })[1] as HTMLElement);
    expect(screen.getByRole('button', { name: /Add secondary button/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Remove button/i })).toHaveLength(1);
  });
});

describe('Thumbnail', () => {
  it('renders one column per DSL column and marks background rows', () => {
    const { container } = render(<Thumbnail wire={['E H T B | M', '*M H']} />);
    const rows = container.firstElementChild?.children ?? [];
    expect(rows).toHaveLength(2);
    expect(rows[0]?.children).toHaveLength(2);
    expect(rows[1]?.className).toMatch(/bg-muted-foreground/);
  });
});
