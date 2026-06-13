import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'Get started by creating your first item.',
  action,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-mute" />
      </div>
      <h3 className="text-lg font-semibold text-ink dark:text-dark-text mb-1">{title}</h3>
      <p className="text-sm text-mute max-w-sm text-center mb-5">{description}</p>
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
