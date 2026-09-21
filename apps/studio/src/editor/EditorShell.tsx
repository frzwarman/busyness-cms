import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetLibrary } from './assets/AssetLibrary';
import { BrandPanel } from './BrandPanel';
import { Inspector } from './Inspector';
import { Navigator } from './Navigator';
import { PagesPanel } from './PagesPanel';
import { Preview } from './Preview';
import { SectionPicker } from './SectionPicker';
import { TopBar } from './TopBar';

function LeftPanel() {
  return (
    <Tabs defaultValue="sections" className="flex h-full flex-col gap-0">
      <TabsList className="m-2 grid grid-cols-4">
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="assets">Assets</TabsTrigger>
        <TabsTrigger value="brand">Brand</TabsTrigger>
      </TabsList>
      <TabsContent value="pages" className="min-h-0 flex-1 overflow-auto">
        <PagesPanel />
      </TabsContent>
      <TabsContent value="sections" className="min-h-0 flex-1 overflow-auto">
        <Navigator />
      </TabsContent>
      <TabsContent value="assets" className="min-h-0 flex-1 overflow-hidden">
        <AssetLibrary compact />
      </TabsContent>
      <TabsContent value="brand" className="min-h-0 flex-1 overflow-auto">
        <BrandPanel />
      </TabsContent>
    </Tabs>
  );
}

/** Three-panel desktop layout; side panels become sheets below the lg breakpoint. */
export function EditorShell() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <TopBar onOpenLeft={() => setLeftOpen(true)} onOpenRight={() => setRightOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <aside
          className="hidden w-72 shrink-0 border-r lg:block"
          aria-label="Pages, sections and brand"
        >
          <LeftPanel />
        </aside>
        <main className="min-w-0 flex-1 bg-muted/40">
          <Preview />
        </main>
        <aside className="hidden w-80 shrink-0 border-l lg:block" aria-label="Section settings">
          <Inspector />
        </aside>
      </div>
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Pages, sections and brand</SheetTitle>
          <LeftPanel />
        </SheetContent>
      </Sheet>
      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetContent side="right" className="w-80 p-0">
          <SheetTitle className="sr-only">Section settings</SheetTitle>
          <Inspector />
        </SheetContent>
      </Sheet>
      <SectionPicker />
    </div>
  );
}
