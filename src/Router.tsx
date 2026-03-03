import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login';
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
        </Routes>
    );
}

export default Router;