import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GooeyNavItem {
  label: string;
  href: string; // debe ser el ID de la sección, ej: "#home"
}

export interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
}

const COLOR = '#5EB319';

const PARTICLE_COLORS: Record<number, string> = {
  1: '#5EB319',
  2: '#79D125',
  3: '#4A8F14',
  4: '#A3F060',
};

const GooeyNav: React.FC<GooeyNavProps> = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(initialActiveIndex);
  const isClickRef = useRef(false);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const makeParticles = (element: HTMLElement) => {
    const d: [number, number] = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');

        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', PARTICLE_COLORS[p.color] ?? COLOR);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);

        requestAnimationFrame(() => { element.classList.add('active'); });

        setTimeout(() => {
          try { element.removeChild(particle); } catch {}
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  // Función central para activar un índice
  const activateIndex = useCallback((index: number, withParticles = false) => {
    setActiveIndex(index);

    requestAnimationFrame(() => {
      if (!navRef.current) return;
      const liEl = navRef.current.querySelectorAll('li')[index] as HTMLElement;
      if (!liEl) return;

      updateEffectPosition(liEl);

      if (textRef.current) {
        textRef.current.classList.remove('active');
        void textRef.current.offsetWidth;
        textRef.current.classList.add('active');
      }

      if (withParticles && filterRef.current) {
        filterRef.current.querySelectorAll('.particle').forEach((p) =>
          filterRef.current!.removeChild(p)
        );
        makeParticles(filterRef.current);
      }
    });
  }, []);

  // Click manual — activa partículas y hace scroll suave
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault();
    if (activeIndex === index) return;

    isClickRef.current = true;
    activateIndex(index, true);

    const href = items[index].href;
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      target?.scrollIntoView({ behavior: 'smooth' });
    }

    // Después del scroll suave, dejar que el observer actúe de nuevo
    setTimeout(() => { isClickRef.current = false; }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, index);
    }
  };

  // Intersection Observer — detecta automáticamente en qué sección está el usuario
  useEffect(() => {
    const sectionIds = items.map((item) => item.href.replace('#', ''));
    const visibilityMap: Record<string, number> = {};
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visibilityMap[id] = entry.intersectionRatio;
          });

          if (isClickRef.current) return;

          // Activar el ítem cuya sección sea más visible en pantalla
          let maxRatio = 0;
          let maxId = '';
          for (const [sid, ratio] of Object.entries(visibilityMap)) {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = sid;
            }
          }

          if (maxId) {
            const newIndex = sectionIds.indexOf(maxId);
            if (newIndex !== -1) {
              activateIndex(newIndex, false);
            }
          }
        },
        {
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
          rootMargin: '-10% 0px -10% 0px',
        }
      );

      observer.observe(section);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [items, activateIndex]);

  // Posición inicial y resize
  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex] as HTMLElement;
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement;
      if (currentActiveLi) updateEffectPosition(currentActiveLi);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      <style>{`
        .effect {
          position: absolute;
          opacity: 1;
          pointer-events: none;
          display: grid;
          place-items: center;
          z-index: 1;
        }
        .effect.text {
          color: transparent;
          transition: color 0.3s ease;
          font-weight: 600;
        }
        .effect.text.active {
          color: white;
        }
        .effect.filter {
          mix-blend-mode: normal;
        }
        .effect.filter::after {
          content: "";
          position: absolute;
          inset: 0;
          background: ${COLOR};
          transform: scale(0);
          opacity: 0;
          z-index: -1;
          border-radius: 6px;
        }
        .effect.active::after {
          animation: pill 0.3s ease both;
        }
        @keyframes pill {
          to { transform: scale(1); opacity: 1; }
        }
        .particle,
        .point {
          display: block;
          opacity: 0;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          transform-origin: center;
        }
        .particle {
          --time: 5s;
          position: absolute;
          top: calc(50% - 8px);
          left: calc(50% - 8px);
          animation: particle calc(var(--time)) ease 1 -350ms;
        }
        .point {
          background: var(--color);
          opacity: 1;
          animation: point calc(var(--time)) ease 1 -350ms;
        }
        @keyframes particle {
          0% {
            transform: rotate(0deg) translate(var(--start-x), var(--start-y));
            opacity: 1;
            animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
          }
          70% {
            transform: rotate(calc(var(--rotate) * 0.5))
              translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
            opacity: 1;
            animation-timing-function: ease;
          }
          85% {
            transform: rotate(calc(var(--rotate) * 0.66))
              translate(var(--end-x), var(--end-y));
            opacity: 1;
          }
          100% {
            transform: rotate(calc(var(--rotate) * 1.2))
              translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
            opacity: 0;
          }
        }
        @keyframes point {
          0% { transform: scale(0); opacity: 0; animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
          25% { transform: scale(calc(var(--scale) * 0.25)); }
          38% { opacity: 1; }
          65% { transform: scale(var(--scale)); opacity: 1; animation-timing-function: ease; }
          85% { transform: scale(var(--scale)); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        li.gooey-item {
          position: relative;
          cursor: pointer;
          border-radius: 6px;
          transition: color 0.3s ease;
        }
        li.gooey-item::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 6px;
          background: ${COLOR};
          opacity: 0;
          transform: scale(0);
          transition: all 0.3s ease;
          z-index: -1;
        }
        li.gooey-item.active { color: white; }
        li.gooey-item.active::after { opacity: 1; transform: scale(1); }
      `}</style>

      <div className="relative" ref={containerRef}>
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="flex gap-4 list-none p-0 px-2 m-0 relative z-[3]"
            style={{ color: '#1a1a1a' }}
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`gooey-item ${activeIndex === index ? 'active' : ''}`}
              >
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="outline-none py-[0.6em] px-[1.2em] inline-block font-medium"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
    </>
  );
};

export default GooeyNav;