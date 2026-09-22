import { AlertTriangle } from 'lucide-react';
import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/** Last line of defence: a rendering error must never take the draft with it. Drafts are already on the server. */
export class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidCatch(error: Error) {
    console.error('Editor crashed', error);
  }
  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="grid min-h-dvh place-items-center bg-muted/40 p-6">
        <div
          className="max-w-md rounded-lg border bg-background p-6 text-sm shadow-sm"
          role="alert"
        >
          <h1 className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="size-4 text-amber-500" /> Something went wrong in the editor
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your saved draft is safe on the server. Changes from the last second or two may not have
            been saved.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded bg-muted p-2 text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => window.location.reload()}>Reload the editor</Button>
            <Button variant="ghost" onClick={() => window.location.assign('/')}>
              Back to your sites
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
