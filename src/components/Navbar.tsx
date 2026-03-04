import { useEffect, useState } from 'react';
import ShinyText from './text/ShinyText';
import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/* ─── Types ──────────────────────────────────────────────────── */
export interface NavItem {
  label: string;
  /** Ruta o hash destino */
  href: string;
  /** 'anchor' para scroll/href normal | 'link' para react-router <Link> | 'button' para onClick */
  type?: 'anchor' | 'link' | 'button';
  onClick?: () => void;
  /** Marca este ítem como activo (subrayado) */
  active?: boolean;
}

interface NavbarProps {
  /** Fuerza fondo sólido desde el inicio, sin esperar scroll */
  solidBg?: boolean;
  /** Ítems de navegación. Si no se pasan, usa los de Home por defecto */
  items?: NavItem[];
}

/* ─── Default items (Home) ───────────────────────────────────── */
const HOME_ITEMS: NavItem[] = [
  { label: 'Home',      href: '#home',       type: 'anchor' },
  { label: 'Acerca de', href: '#acerca-de',  type: 'anchor' },
  { label: 'Ambientes', href: '#ambientes',  type: 'anchor' },
];

/* ─── Component ──────────────────────────────────────────────── */
export default function Navbar({ solidBg = false, items }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();

  useEffect(() => {
    if (solidBg) return;
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [solidBg]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive   = solidBg || scrolled;
  const textColor  = isActive ? (isDark ? 'text-white' : 'text-slate-900') : 'text-white';
  const bgColor    = isActive
    ? (isDark ? 'bg-[#0F172A] shadow-md' : 'bg-white shadow-sm')
    : 'bg-none';
  const btnClasses = isActive
    ? (isDark
        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900')
    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white';

  const navItems = items ?? [
    ...HOME_ITEMS,
    // Añade el link de admin si el usuario es admin
    ...(user?.role_id === 1
      ? [{ label: 'Administración', href: '/administracion', type: 'link' as const }]
      : []),
  ];

  const itemClass = (active?: boolean) => `
    relative hover:opacity-60 flex flex-col items-center transition-all
    before:content-[''] before:h-0.5 before:bg-current
    before:absolute before:top-full before:left-0
    before:transition-all before:duration-300
    ${active ? 'before:w-full' : 'before:w-0 hover:before:w-full'}
  `;

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex justify-between items-center transition-all duration-300 ${bgColor}`}
    >
      {/* Logo */}
      <div className={`transition-colors duration-300 ${textColor}`}>
        <ShinyText
          text="face"
          className="font-plus text-[40px] md:text-[48px] font-light cursor-pointer"
        />
      </div>

      {/* Nav items */}
      <ul className={`hidden md:flex gap-8 list-none m-0 p-0 font-plus font-medium text-[15px] transition-colors duration-300 ${textColor}`}>
        {navItems.map(item => (
          <li key={item.label}>
            {item.type === 'link' ? (
              <Link to={item.href} className={itemClass(item.active)}>
                {item.label}
              </Link>
            ) : item.type === 'button' ? (
              <button onClick={item.onClick} className={itemClass(item.active)}>
                {item.label}
              </button>
            ) : (
              <a
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className={itemClass(item.active)}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${btnClasses}`}
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {!user && (
          <Link
            to="/login"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${btnClasses}`}
            title="Iniciar Sesión"
          >
            <User size={18} />
          </Link>
        )}

        <a href="#" className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
          <img
            className="object-cover w-full h-full -translate-x-[1px]"
            src="/logo-sena.png"
            alt="Logo SENA"
          />
        </a>
      </div>
    </nav>
  );
}