import type { Asset } from '@siteos/db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AssetLibrary } from './AssetLibrary';

export function AssetPickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (a: Asset) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-5 py-3">
          <DialogTitle>Choose an image</DialogTitle>
          <DialogDescription>
            Pick from your library or upload new files. Double-click an image to use it.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1">
          <AssetLibrary
            onPick={(a) => {
              onPick(a);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
