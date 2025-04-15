// src/react-app/components/layout/Navigation.tsx
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Package } from 'lucide-react';
import { cn } from '@/react-app/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Recipes',
    href: '/recipes',
    icon: BookOpen,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
  },
];

export function Navigation() {
  return (
    <nav className="flex w-full border-b bg-background">
      <div className="container flex h-14 items-center px-4 md:px-6">
        <div className="font-semibold">Kitchen Manager</div>
        <div className="ml-auto flex items-center gap-4 md:gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline-block">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}