import { NavLink } from 'react-router-dom';

import './AdminNav.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users', end: false },
  { to: '/admin/interests', label: 'Interests', end: false },
  { to: '/admin/visits', label: 'Visits', end: false },
  { to: '/admin/settings', label: 'Settings', end: false },
] as const;

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `admin-nav__link${isActive ? ' is-active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
