import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SectionInstance } from '@siteos/schemas';
import { registry } from '@siteos/sections';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useEditor } from './EditorProvider';

export function Navigator() {
  const { state, dispatch, setPickerOpen, requestFocus } = useEditor();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const sections = state.document.sections;

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const toIndex = sections.findIndex((s) => s.id === over.id);
    dispatch({ type: 'moveSection', sectionId: String(active.id), toIndex });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sections
        </h2>
        <Button size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
          <Plus data-icon="inline-start" /> Add section
        </Button>
      </div>
      {sections.length === 0 ? (
        <div className="m-3 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          <p className="mb-3">
            This page has no sections yet. Start with a Hero so visitors know where they are.
          </p>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Plus data-icon="inline-start" /> Add your first section
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ol
              className="flex-1 space-y-0.5 overflow-auto px-2 pb-3"
              aria-label="Page sections. Use the drag handle or the section menu to reorder."
            >
              {sections.map((s, i) => (
                <NavigatorItem
                  key={s.id}
                  section={s}
                  index={i}
                  count={sections.length}
                  selected={s.id === state.selectedSectionId}
                  onSelect={() => dispatch({ type: 'select', sectionId: s.id })}
                  onFocusGroup={(path) => requestFocus(s.id, path)}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function NavigatorItem({
  section,
  index,
  count,
  selected,
  onSelect,
  onFocusGroup,
}: {
  section: SectionInstance;
  index: number;
  count: number;
  selected: boolean;
  onSelect: () => void;
  onFocusGroup: (path: string) => void;
}) {
  const { dispatch } = useEditor();
  const def = registry.get(section.type);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });
  const title = def?.title ?? section.type;
  const subtitle =
    typeof section.props.heading === 'string'
      ? section.props.heading
      : def?.variants.find((v) => v.value === section.props.variant)?.label;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group rounded-md', isDragging && 'z-10 opacity-80 shadow-lg')}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-md pr-1 hover:bg-muted',
          selected && 'bg-muted ring-1 ring-border',
        )}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground opacity-60 hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          aria-label={`Reorder ${title}. Press space, then use arrow keys.`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          onClick={onSelect}
          aria-current={selected ? 'true' : undefined}
          className={cn(
            'flex min-w-0 flex-1 flex-col items-start py-1.5 text-left text-sm',
            section.hidden && 'opacity-50',
          )}
        >
          <span className="flex items-center gap-1.5 font-medium">
            {title}
            {section.hidden && (
              <EyeOff className="size-3 text-muted-foreground" aria-label="Hidden" />
            )}
          </span>
          {subtitle && (
            <span className="w-full truncate text-xs text-muted-foreground">{subtitle}</span>
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              aria-label={`${title} actions`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={index === 0}
              onSelect={() =>
                dispatch({ type: 'moveSection', sectionId: section.id, toIndex: index - 1 })
              }
            >
              <ArrowUp /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === count - 1}
              onSelect={() =>
                dispatch({ type: 'moveSection', sectionId: section.id, toIndex: index + 1 })
              }
            >
              <ArrowDown /> Move down
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => dispatch({ type: 'duplicateSection', sectionId: section.id })}
            >
              <Copy /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => dispatch({ type: 'toggleHidden', sectionId: section.id })}
            >
              {section.hidden ? <Eye /> : <EyeOff />} {section.hidden ? 'Show' : 'Hide'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => dispatch({ type: 'removeSection', sectionId: section.id })}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {selected && def && def.inspector.length > 0 && (
        <ul className="ml-7 border-l py-1 pl-2">
          {def.inspector.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => onFocusGroup(g.fields[0]?.path ?? '')}
                className="w-full rounded px-1.5 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {g.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
