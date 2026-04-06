import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login';
import Administracion from './pages/Administracion';
import Clases from './pages/Clases';
import MisFichas from './pages/MisFichas';
import ChangePassword from '@/pages/ChangePassword';
import { useState } from 'react';
import Loader from "./components/Loader";
import ProtectedRoute from './components/ProtectedRoute';

function Router(){
    const [ready, setReady] = useState(false);
    
    if (!ready) {
        return <Loader onComplete={() => setReady(true)} />;
    }

    return (
        <Routes>
            {/* Wrap Home in ProtectedRoute to ensure mandatory password change applies to / */}
            <Route path="/" element={
                 <ProtectedRoute>
                    <Home startAnimation={ready}/>
                 </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/clases" element={
                <ProtectedRoute>
                    <Clases />
                </ProtectedRoute>
            } />
            <Route path='/administracion' element={
                <ProtectedRoute>
                    <Administracion/>
                </ProtectedRoute>
            }/>
            <Route path='/mis-fichas' element={
                <ProtectedRoute>
                    <MisFichas />
                </ProtectedRoute>
            }/>
            <Route path='/cambiar-contrasena' element={
                <ProtectedRoute>
                    <ChangePassword />
                </ProtectedRoute>
            }/>
        </Routes>
    );
}

export default Router;