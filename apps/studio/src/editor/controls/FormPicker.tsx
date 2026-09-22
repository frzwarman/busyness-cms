import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditor } from '../EditorProvider';
import { formsQuery } from '../site/site-queries';

const NONE = '__none__';

/** Choose which form a form section shows. Forms are built in the Forms tool. */
export function FormPicker({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const { siteId } = useEditor();
  const { data: forms } = useQuery(formsQuery(siteId));
  return (
    <div className="grid gap-1.5">
      <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
        <SelectTrigger id={id} className="w-full" aria-label="Form">
          <SelectValue placeholder="Choose a form" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>No form</SelectItem>
          {(forms ?? []).map((f) => (
            <SelectItem key={f.id} value={f.id}>
              {f.name} <span className="text-muted-foreground">· {f.fields.length} fields</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-muted-foreground">
        {forms?.length
          ? 'Edit fields and read submissions in the Forms tool.'
          : 'No forms yet. Create one in the Forms tool, then pick it here.'}
      </p>
    </div>
  );
}
