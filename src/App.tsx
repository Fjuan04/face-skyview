import "./tailwind.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Router from './Router';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="sena-theme">
      <AuthProvider>
        <BrowserRouter>
          <Router/>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
