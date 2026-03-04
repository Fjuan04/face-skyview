import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login';
import Administracion from './pages/Administracion';
import { useState } from 'react';
import Loader from "./components/Loader";

function Router(){
    const [ready, setReady] = useState(false);
    
    if (!ready) {
        return <Loader onComplete={() => setReady(true)} />;
    }

    return (
        <Routes>
            <Route path="/" element={<Home startAnimation={ready}/>} />
            <Route path="/login" element={<Login />} />
            <Route path='/administracion' element={<Administracion/>}/>
        </Routes>
    );
}

export default Router;