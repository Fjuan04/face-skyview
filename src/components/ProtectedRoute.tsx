import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
    const { isAuthenticated, loading, mustChangePassword } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">Cargando...</div> 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si el usuario debe cambiar la contraseña y no está en esa página, redirigir
    if (mustChangePassword && location.pathname !== "/cambiar-contrasena") {
        return <Navigate to="/cambiar-contrasena" replace />;
    }

    // Si NO debe cambiarla pero intenta entrar a /cambiar-contrasena, mandarlo al inicio
    if (!mustChangePassword && location.pathname === "/cambiar-contrasena") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;