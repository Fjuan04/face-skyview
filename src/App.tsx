import "./tailwind.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Router from './Router';
import { BrowserRouter } from "react-router-dom";
function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="sena-theme">
        <BrowserRouter>
          <Router/>
        </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
