import { useState } from 'react';
import "./tailwind.css";
import Home from "./pages/Home";
import Loader from "./components/Loader";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  const [ready, setReady] = useState(false);

  return (
    <ThemeProvider defaultTheme="light" storageKey="sena-theme">
      <Loader onComplete={() => setReady(true)} />
      <Home startAnimation={ready} />
    </ThemeProvider>
  );
}

export default App;
