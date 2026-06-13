import { Plus, Trash2, GripVertical } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function FieldSelector({ fields = [], onChange }) {
  const addField = () => {
    onChange([...fields, { name: '', selector: '', attribute: '', multiple: false }]);
  };

  const removeField = (index) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, updates) => {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-body dark:text-dark-text">
          Data Fields
        </label>
        <Button variant="secondary" size="sm" icon={Plus} onClick={addField}>
          Add Field
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 bg-gray-50 dark:bg-dark-surface rounded-lg border border-dashed border-hairline dark:border-dark-border">
          <p className="text-sm text-mute">
            No fields added yet. Click "Add Field" to define what data to scrape.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-3 bg-white dark:bg-dark-card rounded-lg border border-hairline dark:border-dark-border"
          >
            <div className="pt-2 text-mute cursor-move">
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                placeholder="Field name (e.g. title)"
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
              />
              <Input
                placeholder="CSS Selector (e.g. .title)"
                value={field.selector}
                onChange={(e) => updateField(index, { selector: e.target.value })}
              />
              <Input
                placeholder="Attribute (e.g. href, src)"
                value={field.attribute}
                onChange={(e) => updateField(index, { attribute: e.target.value })}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-sm text-body cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.multiple}
                    onChange={(e) => updateField(index, { multiple: e.target.checked })}
                    className="rounded border-hairline text-indigo-600 focus:ring-indigo-500"
                  />
                  Multiple
                </label>
                <button
                  onClick={() => removeField(index)}
                  className="p-1.5 text-mute hover:text-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
