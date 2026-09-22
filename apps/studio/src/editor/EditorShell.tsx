import {
  FileText,
  HeartPulse,
  Images,
  Inbox,
  Layers,
  LibraryBig,
  Palette,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/lib/use-media-query';
import { cn } from '@/lib/utils';
import { AssetLibrary } from './assets/AssetLibrary';
import { BrandPanel } from './BrandPanel';
import { ContentPanel } from './content/ContentPanel';
import { FormsPanel } from './forms/FormsPanel';
import { HealthPanel } from './health/HealthPanel';
import { Inspector } from './Inspector';
import { Navigator } from './Navigator';
import { PagesPanel } from './PagesPanel';
import { Preview } from './Preview';
import { SectionPicker } from './SectionPicker';
import { SettingsPanel } from './site/SettingsPanel';
import { TopBar } from './TopBar';

type Tool = 'pages' | 'sections' | 'assets' | 'content' | 'forms' | 'brand' | 'health' | 'settings';
const tools: Array<{ id: Tool; label: string; icon: typeof Layers }> = [
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'assets', label: 'Assets', icon: Images },
  { id: 'content', label: 'Content', icon: LibraryBig },
  { id: 'forms', label: 'Forms', icon: Inbox },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'health', label: 'Website health', icon: HeartPulse },
  { id: 'settings', label: 'Site settings', icon: Settings },
];

function ToolPanel({ tool, setTool }: { tool: Tool; setTool: (t: Tool) => void }) {
  switch (tool) {
    case 'pages':
      return <PagesPanel />;
    case 'sections':
      return <Navigator />;
    case 'assets':
      return <AssetLibrary compact />;
    case 'content':
      return <ContentPanel />;
    case 'forms':
      return <FormsPanel />;
    case 'brand':
      return <BrandPanel />;
    case 'health':
      return <HealthPanel onOpenTool={setTool} />;
    case 'settings':
      return <SettingsPanel />;
  }
}

/** Icon rail + panel on the left, live preview in the middle, inspector on the right. Panels become sheets under lg. */
function LeftPanel({ tool, setTool }: { tool: Tool; setTool: (t: Tool) => void }) {
  return (
    <div className="flex h-full min-h-0">
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r py-2"
        aria-label="Tools"
      >
        {tools.map((t) => (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTool(t.id)}
                aria-label={t.label}
                aria-pressed={tool === t.id}
                className={cn(
                  'grid size-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground',
                  tool === t.id && 'bg-muted text-foreground',
                )}
              >
                <t.icon className="size-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
      <div
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
        role="tabpanel"
        aria-label={tools.find((t) => t.id === tool)?.label}
      >
        <div className="h-full overflow-auto">
          <ToolPanel tool={tool} setTool={setTool} />
        </div>
      </div>
    </div>
  );
}

export function EditorShell() {
  const [tool, setTool] = useState<Tool>('sections');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  // Tailwind `lg`. Each panel is mounted once (inline or as a sheet) so field ids and labels stay unique.
  const desktop = useMediaQuery('(min-width: 64rem)');
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <TopBar onOpenLeft={() => setLeftOpen(true)} onOpenRight={() => setRightOpen(true)} />
      <div className="flex min-h-0 flex-1">
        {desktop && (
          <aside className="w-[22rem] shrink-0 border-r" aria-label="Site tools">
            <LeftPanel tool={tool} setTool={setTool} />
          </aside>
        )}
        <main className="min-w-0 flex-1 bg-muted/40">
          <Preview />
        </main>
        {desktop && (
          <aside className="w-80 shrink-0 border-l" aria-label="Section settings">
            <Inspector />
          </aside>
        )}
      </div>
      {!desktop && (
        <>
          <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
            <SheetContent side="left" className="w-[22rem] p-0">
              <SheetTitle className="sr-only">Site tools</SheetTitle>
              <LeftPanel tool={tool} setTool={setTool} />
            </SheetContent>
          </Sheet>
          <Sheet open={rightOpen} onOpenChange={setRightOpen}>
            <SheetContent side="right" className="w-80 p-0">
              <SheetTitle className="sr-only">Section settings</SheetTitle>
              <Inspector />
            </SheetContent>
          </Sheet>
        </>
      )}
      <SectionPicker />
    </div>
  );
}
