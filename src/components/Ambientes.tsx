import { useState } from 'react';

interface Hotspot {
    id: string;
    x: number; // Porcentaje de 0 a 100 (eje horizontal)
    y: number; // Porcentaje de 0 a 100 (eje vertical)
    title: string;
    description: string;
}

// Puntos de ejemplo. Puedes agregar más aquí con sus respectivas coordenadas (x,y) 
// para posicionarlos sobre el background mapa.
const hotspots: Hotspot[] = [
    { id: '1', x: 42.2, y: 40, title: 'Sistemas 3', description: 'Laboratorio equipado para desarrollo de software e innovación técnica.' },
    { id: '2', x: 60, y: 35, title: 'Auditorio Principal', description: 'Espacio para conferencias, talleres y eventos de integración.' },
    { id: '3', x: 45, y: 70, title: 'Cafetería y Zonas Verdes', description: 'Eje principal de descanso, alimentación y recreación.' },
    { id: '4', x: 80, y: 60, title: 'Administración', description: 'Oficinas principales de gestión y coordinación académica.' },
];

export default function Ambientes() {
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full min-h-screen bg-cover bg-center bg-no-repeat transition-[background-image] duration-700 ease-in-out dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')]">

            {/* Overlay opcional para oscurecer/aclarar ligeramente el mapa y resaltar los puntos */}
            {/* En modo claro casi no se nota, en modo oscuro da un ligero tinte */}
            <div className="absolute inset-0 bg-white/10 dark:bg-black/40 pointer-events-none"></div>

            {/* Contenedor de "puntos calientes" */}
            {hotspots.map((hotspot) => (
                <div
                    key={hotspot.id}
                    className="absolute z-10"
                    style={{ top: `${hotspot.y}%`, left: `${hotspot.x}%` }}
                    onMouseEnter={() => setActiveHotspot(hotspot.id)}
                    onMouseLeave={() => setActiveHotspot(null)}
                >
                    {/* Punto pulsante */}
                    {/* translate-x e translate-y centran el punto respecto a las coordenadas */}
                    <button className="relative flex h-8 w-8 items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-crosshair hover:scale-110 transition-transform">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-70"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"></span>
                    </button>

                    {/* Tarjeta de Información (Tooltip) */}
                    {/* Se oculta o muestra dependiendo de si el cursor está sobre este punto */}
                    <div
                        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 md:w-80 bg-background/95 backdrop-blur-md border border-border p-5 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom 
            ${activeHotspot === hotspot.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}
                    >
                        <h3 className="font-plus font-bold text-foreground text-lg mb-2 leading-tight">{hotspot.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{hotspot.description}</p>

                        {/* Triángulo apuntando hacia el punto */}
                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-background border-b border-r border-border rotate-45 transform mt-[-1px]"></div>
                    </div>
                </div>
            ))}

            {/* Etiqueta flotante inferior para dar contexto al usuario */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-background/80 backdrop-blur border border-border rounded-full shadow-lg pointer-events-none">
                <p className="text-sm font-medium text-foreground">
                    Pasa el cursor sobre los puntos para explorar
                </p>
            </div>

        </div>
    );
}
