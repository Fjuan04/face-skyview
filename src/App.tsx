import "./tailwind.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Router from './Router';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import ChatbotWidget from "./components/ChatbotWidget";

function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="sena-theme">
      <AuthProvider>
        <BrowserRouter>
          <>
            <Router/>
            <ChatbotWidget />
          </>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
