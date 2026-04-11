import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';

interface Ambient {
  id: number;
  name: string;
  state: string;
  usability: string;
  x?: number;
  y?: number;
}

// DEBE coincidir con el valor definido en Ambientes.tsx
const MAP_MIN_WIDTH = 1400; // px

export default function MapConfigurator() {
    const [ambientes, setAmbientes] = useState<Ambient[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedAmbientId, setSelectedAmbientId] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Referencia al contenedor del mapa (el de ancho fijo) para calcular (x,y) correctamente
    const mapRef = useRef<HTMLDivElement>(null);

    const fetchAmbientes = async () => {
        try {
            setIsLoading(true);
            const data = await api.get('/ambients');
            // New structure: { stats: ..., ambients: [] }
            setAmbientes(data.ambients || []);
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Error al obtener los ambientes");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAmbientes();
    }, []);

    // Tecla ESC para cancelar selección
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedAmbientId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedAmbientId) return;
        if (!mapRef.current) return;

        // Calculamos el % relativo al contenedor fijo (mapRef), no al evento
        const bounds = mapRef.current.getBoundingClientRect();
        let x = ((e.clientX - bounds.left) / bounds.width) * 100;
        let y = ((e.clientY - bounds.top) / bounds.height) * 100;

        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;

        try {
            await api.post('/ambient-settings', {
                ambient_id: selectedAmbientId,
                x,
                y
            });

            setSuccessMsg(`¡Guardado en (${x}%, ${y}%)!`);
            setTimeout(() => setSuccessMsg(null), 3000);

            // Auto-deseleccionar después de ubicar
            setSelectedAmbientId(null);
            fetchAmbientes();
        } catch (err: unknown) {
            console.error(err);
            setErrorMsg("Error al guardar las coordenadas.");
            setTimeout(() => setErrorMsg(null), 3000);
        }
    };

    const selectedAmbient = ambientes.find(a => a.id === selectedAmbientId);

    return (
        <div className="flex w-full h-[calc(100vh-5rem)] bg-background text-foreground overflow-hidden">

            {/* Panel Izquierdo */}
            <aside className="w-80 border-r border-border bg-card overflow-y-auto flex flex-col p-4 z-20 shadow-xl relative shrink-0">
                <h2 className="text-xl font-bold font-plus mb-2">Asignar Coordenadas</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    1. Selecciona un ambiente.<br/>
                    2. Haz clic en el plano.<br/>
                    <em className="text-xs opacity-70 mt-1 block">
                        Presiona <kbd className="bg-muted px-1.5 py-0.5 rounded border text-xs">ESC</kbd> para cancelar.
                    </em>
                </p>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-2 flex-1">
                        {ambientes.map(amb => {
                            const hasCoords = amb.x !== undefined && amb.y !== undefined;
                            const isSelected = selectedAmbientId === amb.id;

                            return (
                                <button
                                    key={amb.id}
                                    onClick={() => setSelectedAmbientId(amb.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                            : 'bg-background hover:bg-muted border-border'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-sm leading-tight line-clamp-2 pr-2">
                                            {amb.name}
                                        </span>
                                        <span
                                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${hasCoords ? 'bg-green-500' : 'bg-destructive'}`}
                                            title={hasCoords ? 'Tiene coordenadas' : 'Sin asignar'}
                                        ></span>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                        {hasCoords ? `(x: ${amb.x}%, y: ${amb.y}%)` : 'Sin asignar'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </aside>

            {/* Panel Derecho: Contenedor principal sin scroll para que los indicadores queden fijos */}
            <main className="flex-1 relative bg-neutral-900 overflow-hidden">

                {/* Indicador superior */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-background/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border border-border flex items-center gap-2.5">
                        {selectedAmbient ? (
                            <>
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="font-medium text-sm">
                                    Ubicando: <strong>{selectedAmbient.name}</strong>
                                </span>
                            </>
                        ) : (
                            <span className="font-medium text-sm text-muted-foreground">
                                Selecciona un ambiente del panel izquierdo
                            </span>
                        )}
                    </div>
                </div>

                {/* Toast */}
                {(successMsg || errorMsg) && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                        <div className={`px-6 py-3 rounded-xl shadow-xl border font-medium text-sm ${
                            successMsg
                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
                                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
                        }`}>
                            {successMsg || errorMsg}
                        </div>
                    </div>
                )}

                {/* Contenedor del mapa con scroll independiente */}
                <div className="w-full h-full overflow-auto">
                    {/* Mapa con ancho fijo — ref para calcular coordenadas correctamente */}
                    <div
                    ref={mapRef}
                    className={`relative h-full min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-300 dark:bg-[url('/sena-noche.png')] bg-[url('/sena-dia.png')] border-4 ${
                        selectedAmbientId ? 'cursor-crosshair border-primary/50' : 'cursor-default border-transparent opacity-70'
                    }`}
                    style={{ minWidth: `${MAP_MIN_WIDTH}px` }}
                    onClick={handleMapClick}
                >
                    <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

                    {/* Puntos ya asignados */}
                    {ambientes.filter(a => a.x !== undefined && a.y !== undefined).map(amb => (
                        <div
                            key={amb.id}
                            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                            style={{ top: `${amb.y}%`, left: `${amb.x}%` }}
                        >
                            <span className={`relative inline-flex rounded-full border-2 shadow-lg ${
                                selectedAmbientId === amb.id
                                    ? 'w-6 h-6 border-primary bg-primary animate-bounce'
                                    : 'w-4 h-4 border-white bg-green-500'
                            }`}></span>
                            <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                                selectedAmbientId === amb.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background/80 text-foreground'
                            }`}>
                                {amb.name}
                            </span>
                        </div>
                    ))}
                </div>
                </div>
            </main>
        </div>
    );
}
