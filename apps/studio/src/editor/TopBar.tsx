import { selectors } from '@siteos/editor-core';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  History,
  Loader2,
  LogOut,
  Monitor,
  Moon,
  PanelLeft,
  PanelRight,
  Redo2,
  RefreshCw,
  Rocket,
  Settings2,
  Smartphone,
  Sun,
  Tablet,
  Undo2,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { signOut } from '@/lib/auth';
import { PREVIEW_ORIGIN } from '@/lib/preview-bridge';
import { useStudioTheme } from '@/lib/studio-theme';
import { cn } from '@/lib/utils';
import { type Device, useEditor } from './EditorProvider';
import { HistorySheet } from './HistorySheet';
import { PublishDialog } from './PublishDialog';
import { publishStateQuery, relativeTime } from './publish-queries';
import { PageSeoSheet } from './site/PageSeoSheet';

const saveLabels = {
  saved: 'Saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Failed to save',
  conflict: 'Changed elsewhere',
} as const;

export function TopBar({
  onOpenLeft,
  onOpenRight,
}: {
  onOpenLeft: () => void;
  onOpenRight: () => void;
}) {
  const {
    state,
    dispatch,
    saveStatus,
    saveError,
    device,
    setDevice,
    siteName,
    siteSlug,
    canEdit,
    canPublish,
  } = useEditor();
  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const { data: live } = useQuery(publishStateQuery(state.document.id));
  const liveDiffers = live?.publishedDocument
    ? JSON.stringify(live.publishedDocument) !== JSON.stringify(state.document)
    : true;
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
        {canEdit ? (
          <SaveIndicator status={saveStatus} error={saveError} />
        ) : (
          <span className="text-xs text-muted-foreground">Read-only</span>
        )}
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSeoOpen(true)}
              aria-label="Page settings"
            >
              <Settings2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Page settings & SEO</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHistoryOpen(true)}
              aria-label="Version history"
            >
              <History />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Version history</TooltipContent>
        </Tooltip>
        {live?.publishedVersionId ? (
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <a
              href={`${PREVIEW_ORIGIN}/s/${siteSlug}${state.document.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open site <ExternalLink data-icon="inline-end" />
            </a>
          </Button>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                size="sm"
                onClick={() => setPublishOpen(true)}
                disabled={!canPublish}
                className={cn(!liveDiffers && 'opacity-80')}
              >
                <Rocket data-icon="inline-start" />{' '}
                {live?.publishedVersionId ? 'Publish' : 'Publish'}
                {live?.publishedNumber && liveDiffers && (
                  <span
                    className="ml-1 size-1.5 rounded-full bg-amber-400"
                    aria-label="Unpublished changes"
                  />
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {!canPublish
              ? 'Your role can edit but not publish. Ask an owner, admin or publisher.'
              : live?.publishedAt
                ? `Live: v${live.publishedNumber} · ${relativeTime(live.publishedAt)}${liveDiffers ? ' · unpublished changes' : ''}`
                : 'Not published yet'}
          </TooltipContent>
        </Tooltip>
        <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} />
        <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
        <PageSeoSheet open={seoOpen} onOpenChange={setSeoOpen} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account">
              <UserRound />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/new-site">Create another site</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

function SaveIndicator({
  status,
  error,
}: {
  status: keyof typeof saveLabels;
  error: string | null;
}) {
  const Icon =
    status === 'saving'
      ? Loader2
      : status === 'error' || status === 'conflict'
        ? AlertTriangle
        : status === 'saved'
          ? Check
          : null;
  const bad = status === 'error' || status === 'conflict';
  return (
    <output
      aria-live="polite"
      className={cn(
        'hidden items-center gap-1.5 text-xs sm:flex',
        bad ? 'text-destructive' : 'text-muted-foreground',
      )}
      title={error ?? undefined}
    >
      {Icon && <Icon className={cn('size-3.5', status === 'saving' && 'animate-spin')} />}
      {status === 'unsaved' && <span className="size-1.5 rounded-full bg-amber-500" />}
      {saveLabels[status]}
      {status === 'conflict' && (
        <Button size="xs" variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw /> Reload
        </Button>
      )}
    </output>
  );
}
