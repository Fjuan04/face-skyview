import { useEffect, useState } from 'react';
import ShinyText from './text/ShinyText';
import { useTheme } from './ThemeProvider';
import { FiSun, FiMoon } from 'react-icons/fi';

const NAV_ITEMS = [
    { label: 'Home', href: '#home' },
    { label: 'Acerca De', href: '#acerca-de' },
    { label: 'Ambientes', href: '#ambientes' },
    { label: 'Collab', href: '#collab' },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const handleScroll = () => {
            // Cambia el background del nav cuando el scroll pasa gran parte del hero
            setScrolled(window.scrollY > window.innerHeight * 0.85);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (href === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Lógica de colores dinámica según scroll y tema
    const textColor = scrolled ? (isDark ? 'text-white' : 'text-slate-900') : 'text-white';
    const bgColor = scrolled
        ? (isDark ? 'bg-[#0F172A]/90 shadow-md' : 'bg-white/90 shadow-sm')
        : 'bg-none';
    const btnClasses = scrolled
        ? (isDark
            ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900')
        : 'bg-white/10 hover:bg-white/20 border-white/20 text-white';

    return (
        <nav id="navbar" className={`fixed top-0 left-0 right-0 z-50 h-20 px-6 md:px-12 flex justify-between items-center transition-all duration-300  ${bgColor}`}>

            {/* Logo */}
            <div className={`transition-colors duration-300 ${textColor}`}>
                <ShinyText text="face" className="font-plus text-[40px] md:text-[48px] font-light cursor-pointer" />
            </div>

            {/* Links Center */}
            <ul className={`hidden md:flex gap-8 list-none m-0 p-0 font-plus font-medium text-[15px] transition-colors duration-300 ${textColor}`}>
                {NAV_ITEMS.map(item => (
                    <li key={item.label}>
                        <a
                            href={item.href}
                            onClick={(e) => handleClick(e, item.href)}
                            className="relative hover:opacity-60 flex flex-col items-center transition-all before:content-[''] hover:before:w-[100%] before:w-0 before:h-0.5 before:bg-current before:absolute before:top-[100%] before:left-0 before:transition-all before:duration-300 "
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>

            {/* Right side: Toggle + SENA Logo */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${btnClasses}`}
                    aria-label="Toggle theme"
                >
                    {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                </button>

                <a href="#" className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    <img className="object-cover w-full h-full scale-[1] -translate-x-[1px]" src="/logo-sena.png" alt="Logo SENA" />
                </a>
            </div>
        </nav>
    );
}
