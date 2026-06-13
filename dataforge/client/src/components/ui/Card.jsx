export function Card({ children, className = '', hover = false, glass = false, padding = 'lg' }) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      className={`
        bg-white dark:bg-dark-card rounded-xl card-shadow
        ${hover ? 'hover:card-shadow-lg hover:-translate-y-0.5 transition-all duration-200' : ''}
        ${glass ? 'glass' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      <div>
        <h3 className="text-display-sm text-ink dark:text-dark-text">{title}</h3>
        {description && <p className="text-sm text-mute mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
