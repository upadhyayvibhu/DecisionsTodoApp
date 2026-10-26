import { FolderCog, LogOut, UserRound, X } from 'lucide-react';
import Button from '../ui/Button';

interface SettingsPanelProps {
  fullName: string;
  email: string;
  onManageCategories: () => void;
  onSignOut: () => void;
  onClose: () => void;
}

export default function SettingsPanel({ fullName, email, onManageCategories, onSignOut, onClose }: SettingsPanelProps) {
  const initials = fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="panel settings-panel" aria-label="Settings">
      <header className="panel__header">
        <div className="panel__icon"><UserRound size={20} /></div>
        <div><h2>Settings</h2><p>Manage your profile and workspace</p></div>
        <Button variant="icon" className="panel__close" aria-label="Close settings" onClick={onClose}><X size={18} /></Button>
      </header>

      <section className="settings-section" aria-labelledby="profile-settings">
        <h3 id="profile-settings">Profile</h3>
        <div className="settings-profile"><span className="avatar">{initials}</span><div><strong>{fullName}</strong><span>{email}</span></div></div>
      </section>

      <section className="settings-section" aria-labelledby="category-settings">
        <h3 id="category-settings">Categories</h3>
        <p>Create and rename the personal categories used by your todos.</p>
        <Button variant="secondary" fullWidth onClick={onManageCategories}><FolderCog size={17} /> Manage Categories</Button>
      </section>

      <section className="settings-section" aria-labelledby="account-settings">
        <h3 id="account-settings">Account</h3>
        <p>End your current TodoPro session on this device.</p>
        <Button className="btn--danger" fullWidth onClick={onSignOut}><LogOut size={17} /> Log out</Button>
      </section>
    </aside>
  );
}
