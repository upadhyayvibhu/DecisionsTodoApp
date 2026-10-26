import { AlertTriangle, X } from 'lucide-react';
import type { Todo } from '../../types/todo';
import Button from '../ui/Button';

interface DeleteTodoDialogProps {
  todo: Todo;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteTodoDialog({ todo, isDeleting, onConfirm, onClose }: DeleteTodoDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog__icon"><AlertTriangle size={22} /></div>
        <Button variant="icon" className="dialog__close" aria-label="Close delete dialog" onClick={onClose} disabled={isDeleting}><X size={18} /></Button>
        <h2 id="delete-dialog-title">Delete this todo?</h2>
        <p id="delete-dialog-description">Are you sure you want to delete <strong>“{todo.title}”</strong>? This action cannot be undone.</p>
        <div className="dialog__actions">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button className="btn--danger" onClick={onConfirm} isLoading={isDeleting} loadingLabel="Deleting…">Delete Todo</Button>
        </div>
      </section>
    </div>
  );
}
