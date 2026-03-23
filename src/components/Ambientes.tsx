import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Ambient {
  id: number;
  name: string;
  state: string;
  usability: string;
  capacity: number;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  x?: number;
  y?: number;
}

// Ancho de referencia fijo del mapa. DEBE ser el mismo en MapConfigurator.tsx
const MAP_MIN_WIDTH = 1400; // px

export default function Ambientes() {
    const [ambientes, setAmbientes] = useState<Ambient[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeAmbientId, setActiveAmbientId] = useState<number | null>(null);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await api.get('/ambients');
                setAmbientes(data);
            } catch (err: unknown) {
                console.error("Error fetching ambients:", err);
                setError("Ocurrió un error al cargar los ambientes.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAmbientes();
    }, []);

    // Fallback temporal: distribuye los puntos en grid si no tienen coordenadas asignadas
    const getCoordinates = (index: number, total: number) => {
        const cols = Math.ceil(Math.sqrt(total)) || 1;
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
            x: 20 + (col * (60 / Math.max(cols - 1, 1))),
            y: 30 + (row * (50 / Math.max(Math.ceil(total / cols) - 1, 1)))
        };
    };

    return (
        // Wrapper exterior: ocupa la pantalla y permite scroll horizontal en resoluciones pequeñas
        <div className="relative w-full h-full min-h-screen overflow-x-auto">

            {/* Contenedor del mapa con ancho mínimo fijo — mismo valor que MapConfigurator */}
            <div
                className="relative h-full min-h-screen bg-cover bg-center bg-no-repeat transition-[background-image] duration-700 ease-in-out dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')]"
                style={{ minWidth: `${MAP_MIN_WIDTH}px` }}
            >

                {/* Overlay */}
                <div className="absolute inset-0 bg-white/10 dark:bg-black/40 pointer-events-none"></div>

                {/* Estado de carga */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-background/80 backdrop-blur px-6 py-3 rounded-xl shadow-lg border border-border flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-foreground font-medium">Cargando ambientes...</span>
                        </div>
                    </div>
                )}

                {/* Estado de error */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-destructive/10 backdrop-blur px-6 py-3 rounded-xl shadow-lg border border-destructive/20 text-destructive font-medium">
                            {error}
                        </div>
                    </div>
                )}

                {/* Hotspots */}
                {!isLoading && !error && ambientes.map((ambiente, index) => {
                    const coords = (ambiente.x !== undefined && ambiente.y !== undefined)
                        ? { x: ambiente.x, y: ambiente.y }
                        : getCoordinates(index, ambientes.length);

                    return (
                        <div
                            key={ambiente.id}
                            // Elevamos todo el contenedor del hotspot al frente cuando hacemos hover
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                                activeAmbientId === ambiente.id ? 'z-50' : 'z-10'
                            }`}
                            style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                            onMouseEnter={() => setActiveAmbientId(ambiente.id)}
                            onMouseLeave={() => setActiveAmbientId(null)}
                        >
                            {/* Tooltip — z-20 para que quede por encima de otros puntos */}
                            <div
                                className={`absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-background/95 backdrop-blur-md border border-border p-4 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom pointer-events-none
                                    ${activeAmbientId === ambiente.id ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
                            >
                                <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="font-plus font-bold text-foreground text-base leading-tight line-clamp-2">
                                        {ambiente.name}
                                    </h3>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full shrink-0 ${
                                        ambiente.state === 'Activo'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                        {ambiente.state}
                                    </span>
                                </div>

                                <div className="space-y-1 mt-2">
                                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                                        <span className="font-medium">Uso:</span>
                                        <span className="truncate ml-2">{ambiente.usability || 'N/A'}</span>
                                    </p>
                                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                                        <span className="font-medium">Capacidad:</span>
                                        <span>{ambiente.capacity > 0 ? `${ambiente.capacity} pax` : 'No definida'}</span>
                                    </p>
                                    <p className="text-muted-foreground text-sm flex items-center justify-between">
                                        <span className="font-medium">Disponibilidad:</span>
                                        <span className={ambiente.isOccupied
                                            ? 'text-orange-600 dark:text-orange-400 font-medium'
                                            : 'text-green-600 dark:text-green-400 font-medium'}>
                                            {ambiente.isOccupied ? 'Ocupado' : 'Disponible'}
                                        </span>
                                    </p>
                                </div>

                                {/* Triángulo apuntando hacia abajo */}
                                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-background border-b border-r border-border rotate-45"></div>
                            </div>

                            {/* Punto pulsante — z-10 base */}
                            <button className="relative z-10 flex h-8 w-8 items-center justify-center cursor-crosshair hover:scale-110 transition-transform">
                                {ambiente.state === 'Activo' && (
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${ambiente.isOccupied ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                                    ambiente.state === 'Activo'
                                        ? ambiente.isOccupied ? 'bg-orange-500' : 'bg-green-500'
                                        : 'bg-gray-500'
                                }`}></span>
                            </button>
                        </div>
                    );
                })}

                {/* Etiqueta flotante inferior */}
                {!isLoading && !error && ambientes.length > 0 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-background/80 backdrop-blur border border-border rounded-full shadow-lg pointer-events-none">
                        <p className="text-sm font-medium text-foreground">
                            Pasa el cursor sobre los {ambientes.length} ambientes para explorar
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
