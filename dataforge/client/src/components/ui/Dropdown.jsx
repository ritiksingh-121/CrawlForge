import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`
            absolute z-50 mt-1.5 min-w-[12rem] bg-white dark:bg-dark-card
            rounded-xl card-shadow-xl border border-hairline dark:border-dark-border
            py-1 animate-in
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, icon: Icon, danger, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors
        ${danger
          ? 'text-error hover:bg-error-soft'
          : 'text-body hover:bg-gray-50 dark:hover:bg-dark-surface dark:text-dark-text'
        }
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
