import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LoaderProps {
    onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
    const loaderRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const MIN_DURATION = 1500; // ms — minimum loader visibility
        const start = Date.now();

        /* ── Entrance animations ── */
        // Solo anima la línea; el texto aparece plano de inmediato
        gsap.fromTo(lineRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }
        );

        /* ── Progress bar fills over MIN_DURATION ── */
        gsap.fromTo(
            progressRef.current,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: MIN_DURATION / 1000,
                ease: 'power1.inOut',
                transformOrigin: 'left center',
            }
        );

        /* ── Exit: slides the whole panel upward ── */
        const exit = () => {
            gsap.to(loaderRef.current, {
                y: '-100%',
                duration: 0.9,
                ease: 'power4.in',
                onComplete,
            });
        };

        const handleLoad = () => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, MIN_DURATION + 200 - elapsed);
            setTimeout(exit, remaining);
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad, { once: true });
            return () => window.removeEventListener('load', handleLoad);
        }
    }, [onComplete]);

    return (
        <div
            ref={loaderRef}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Logo text */}
            <div ref={textRef} className="flex items-baseline gap-3 select-none">
                <span
                    className="font-plus text-white font-light tracking-tight"
                    style={{ fontSize: 'clamp(52px, 9vw, 96px)' }}
                >
                    face
                </span>
                <span
                    className="font-plus text-white/35 font-light tracking-tight"
                    style={{ fontSize: 'clamp(52px, 9vw, 96px)' }}
                >
                    skyview
                </span>
            </div>

            {/* Progress bar */}
            <div
                ref={lineRef}
                className="absolute bottom-10 left-12 right-12 opacity-0"
            >
                {/* Track */}
                <div className="w-full h-px bg-white/10 relative overflow-hidden">
                    {/* Fill */}
                    <div
                        ref={progressRef}
                        className="absolute inset-0 bg-white origin-left"
                        style={{ scaleX: 0 }}
                    />
                </div>
                {/* Label */}
                <p className="text-white/25 text-xs font-plus mt-3 tracking-widest uppercase">
                    Cargando…
                </p>
            </div>
        </div>
    );
}
