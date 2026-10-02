import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { getInitials } from '../../lib/initials';
import './AccountMenu.css';

type AccountMenuProps = {
  name: string;
  onLogout: () => void;
};

export function AccountMenu({ name, onLogout }: AccountMenuProps) {
  const initials = getInitials(name);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLAnchorElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    profileRef.current?.focus();

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!initials) {
    return null;
  }

  function handleToggle() {
    setIsOpen((current) => !current);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-menu__trigger"
        aria-label={`Account menu for ${name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
      >
        <span aria-hidden="true">{initials}</span>
      </button>
      {isOpen ? (
        <div id={menuId} className="account-menu__panel" role="menu" aria-label="Account">
          <Link ref={profileRef} role="menuitem" className="account-menu__item" to="/account" onClick={handleClose}>
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="account-menu__item"
            onClick={() => {
              handleClose();
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
