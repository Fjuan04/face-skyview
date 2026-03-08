// 
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div> 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;