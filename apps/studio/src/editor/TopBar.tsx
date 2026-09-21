import { selectors } from '@siteos/editor-core';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Loader2,
  Monitor,
  Moon,
  PanelLeft,
  PanelRight,
  Redo2,
  Smartphone,
  Sun,
  Tablet,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PREVIEW_ORIGIN } from '@/lib/preview-bridge';
import { useStudioTheme } from '@/lib/studio-theme';
import { cn } from '@/lib/utils';
import { type Device, useEditor } from './EditorProvider';

const saveLabels = {
  saved: 'Saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Failed to save',
} as const;

export function TopBar({
  onOpenLeft,
  onOpenRight,
}: {
  onOpenLeft: () => void;
  onOpenRight: () => void;
}) {
  const { state, dispatch, saveStatus, device, setDevice, siteName } = useEditor();
  const { dark, toggle } = useStudioTheme();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenLeft}
        aria-label="Open pages and sections"
      >
        <PanelLeft />
      </Button>
      <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="grid size-6 place-items-center rounded-md bg-foreground text-[11px] font-bold text-background">
          S
        </span>
        <span className="hidden sm:inline">SiteOS</span>
      </Link>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="hidden truncate text-muted-foreground md:inline">{siteName}</span>
        <span className="hidden text-muted-foreground md:inline">/</span>
        <span className="truncate font-medium">{state.document.title}</span>
      </div>

      <div className="mx-auto hidden items-center gap-1 md:flex">
        <ToggleGroup
          type="single"
          value={device}
          onValueChange={(v) => v && setDevice(v as Device)}
          variant="outline"
          size="sm"
          aria-label="Preview device"
        >
          <ToggleGroupItem value="desktop" aria-label="Desktop preview">
            <Monitor />
          </ToggleGroupItem>
          <ToggleGroupItem value="tablet" aria-label="Tablet preview">
            <Tablet />
          </ToggleGroupItem>
          <ToggleGroupItem value="mobile" aria-label="Mobile preview">
            <Smartphone />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <SaveIndicator status={saveStatus} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!selectors.canUndo(state)}
              onClick={() => dispatch({ type: 'undo' })}
              aria-label="Undo"
            >
              <Undo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!selectors.canRedo(state)}
              onClick={() => dispatch({ type: 'redo' })}
              aria-label="Redo"
            >
              <Redo2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (⇧⌘Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Studio appearance</TooltipContent>
        </Tooltip>
        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
          <a
            href={`${PREVIEW_ORIGIN}${state.document.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open site <ExternalLink data-icon="inline-end" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenRight}
          aria-label="Open section settings"
        >
          <PanelRight />
        </Button>
      </div>
    </header>
  );
}

function SaveIndicator({ status }: { status: keyof typeof saveLabels }) {
  const Icon =
    status === 'saving'
      ? Loader2
      : status === 'error'
        ? AlertTriangle
        : status === 'saved'
          ? Check
          : null;
  return (
    <output
      aria-live="polite"
      className={cn(
        'hidden items-center gap-1.5 text-xs sm:flex',
        status === 'error' ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {Icon && <Icon className={cn('size-3.5', status === 'saving' && 'animate-spin')} />}
      {status === 'unsaved' && <span className="size-1.5 rounded-full bg-amber-500" />}
      {saveLabels[status]}
    </output>
  );
}
