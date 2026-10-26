import { useState, type FormEvent } from 'react';
import { FolderPlus, Pencil, Save, X } from 'lucide-react';
import type { CategoryDto } from '../../api/types';
import Button from '../ui/Button';

interface CategoryPanelProps {
  categories: CategoryDto[];
  onCreate: (name: string) => Promise<boolean>;
  onRename: (id: number, name: string) => Promise<boolean>;
  onClose: () => void;
}

export default function CategoryPanel({ categories, onCreate, onRename, onClose }: CategoryPanelProps) {
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim()) return;

    setIsSaving(true);
    const wasCreated = await onCreate(newName);
    setIsSaving(false);

    if (wasCreated) onClose();
  };
  const startRename = (category: CategoryDto) => {
    setEditing(category.id);
    setName(category.name);
  };
  const rename = async (event: FormEvent) => {
    event.preventDefault();
    if (editing === null || !name.trim()) return;
    setIsSaving(true);
    if (await onRename(editing, name)) setEditing(null);
    setIsSaving(false);
  };

  return (
    <aside className="panel" aria-label="Manage categories">
      <header className="panel__header">
        <div className="panel__icon"><FolderPlus size={20} /></div>
        <div><h2>Manage Categories</h2><p>Create and organize your personal categories</p></div>
        <Button variant="icon" className="panel__close" aria-label="Close panel" onClick={onClose}><X size={18} /></Button>
      </header>

      <form className="category-create" onSubmit={create}>
        <label htmlFor="new-category">New category</label>
        <div><input id="new-category" className="input" maxLength={50} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Learning" /><Button type="submit" disabled={!newName.trim()} isLoading={isSaving} loadingLabel="Adding…"><FolderPlus size={16} /> Add</Button></div>
      </form>

      <div className="category-list">
        <h3>Available categories</h3>
        {categories.map((category) => editing === category.id ? (
          <form className="category-row category-row--edit" key={category.id} onSubmit={rename}>
            <input className="input" maxLength={50} value={name} onChange={(event) => setName(event.target.value)} autoFocus />
            <Button variant="icon" type="submit" aria-label="Save category" isLoading={isSaving}><Save size={16} /></Button>
            <Button variant="icon" type="button" aria-label="Cancel rename" onClick={() => setEditing(null)}><X size={16} /></Button>
          </form>
        ) : (
          <div className="category-row" key={category.id}>
            <div><strong>{category.name}</strong><span>{category.isSystem ? 'System category' : 'Personal category'}</span></div>
            {!category.isSystem && <Button variant="icon" aria-label={`Rename ${category.name}`} onClick={() => startRename(category)}><Pencil size={16} /></Button>}
          </div>
        ))}
      </div>
    </aside>
  );
}
