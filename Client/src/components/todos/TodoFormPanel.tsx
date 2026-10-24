import { useState, type FormEvent } from 'react';
import { ChevronDown, Plus, Save, X } from 'lucide-react';
import Button from '../ui/Button';
import { CATEGORIES, PRIORITIES, type Todo, type TodoFormValues } from '../../types/todo';

interface TodoFormPanelProps {
  /** When provided the panel edits this todo, otherwise it creates a new one. */
  todo?: Todo;
  onSubmit: (values: TodoFormValues) => Promise<void>;
  onClose: () => void;
}

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 500;

const EMPTY_FORM: TodoFormValues = {
  title: '',
  description: '',
  category: 'Work',
  priority: 'Medium',
  isCompleted: false,
};

const toFormValues = (todo: Todo): TodoFormValues => ({
  title: todo.title,
  description: todo.description ?? '',
  category: todo.category,
  priority: todo.priority,
  isCompleted: todo.isCompleted,
});

export default function TodoFormPanel({ todo, onSubmit, onClose }: TodoFormPanelProps) {
  const isEdit = Boolean(todo);
  const [values, setValues] = useState<TodoFormValues>(() => (todo ? toFormValues(todo) : EMPTY_FORM));
  const [showErrors, setShowErrors] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const titleError = values.title.trim() ? null : 'Title is required.';
  const set = <K extends keyof TodoFormValues>(key: K, value: TodoFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    if (titleError) return;

    setIsSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="panel" aria-label={isEdit ? 'Edit todo' : 'Create todo'}>
      <header className="panel__header">
        <div className="panel__icon">{isEdit ? <Save size={20} /> : <Plus size={20} />}</div>
        <div>
          <h2>{isEdit ? 'Edit Todo' : 'Create New Todo'}</h2>
          <p>{isEdit ? 'Update the details of this task' : 'Add a new task to your list'}</p>
        </div>
        <Button variant="icon" className="panel__close" aria-label="Close panel" onClick={onClose}>
          <X size={18} />
        </Button>
      </header>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="title">
            Title <span className="field__required">*</span>
          </label>
          <input
            id="title"
            className={`input ${showErrors && titleError ? 'input--error' : ''}`}
            placeholder="Enter todo title"
            maxLength={TITLE_MAX}
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            autoFocus
          />
          <div className="field__meta">
            <span className="field__error">{showErrors ? titleError : ''}</span>
            <span>
              {values.title.length}/{TITLE_MAX}
            </span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="input"
            placeholder="Enter description (optional)"
            maxLength={DESCRIPTION_MAX}
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
          />
          <div className="field__meta">
            <span />
            <span>
              {values.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
        </div>

        <div className="form__row">
          <div className="field">
            <label htmlFor="category">
              Category <span className="field__required">*</span>
            </label>
            <div className="select">
              <select id="category" className="input" value={values.category} onChange={(e) => set('category', e.target.value as TodoFormValues['category'])}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select__chevron" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="priority">
              Priority <span className="field__required">*</span>
            </label>
            <div className="select">
              <select id="priority" className="input" value={values.priority} onChange={(e) => set('priority', e.target.value as TodoFormValues['priority'])}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select__chevron" />
            </div>
          </div>
        </div>

        <div className="field">
          <span className="field__label">Status</span>
          <label className="switch">
            <input type="checkbox" checked={values.isCompleted} onChange={(e) => set('isCompleted', e.target.checked)} />
            <span className="switch__track" />
            Mark as completed
          </label>
        </div>

        <Button type="submit" fullWidth disabled={isSaving}>
          {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Todo'}
        </Button>
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </form>
    </aside>
  );
}
