// App.js
import { Outlet } from "react-router-dom";
import './index.css';

function App() {
  return (
    <div>
      {/* Layout global (Header, Footer, etc. si besoin) */}
      <Outlet /> {/* Rend les routes enfants ici */}
    </div>
  );
}

export default App;
