import { Link, useNavigate } from 'react-router-dom';
import "./NavBar.css";
import { useEffect, useState } from "react";

export function Navbar() {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Carrega o nome assim que o componente monta
  useEffect(() => {
    const name = localStorage.getItem("username");
    setUsername(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <nav className="containe">
      <ul className="barra">

        <li><Link to="/Estoque">Estoque</Link></li>
        <li><Link to="/Historico">Historico</Link></li>

        {/* Nome do usuário logado */}
        <li className="usuario-logado">
          {username && `Olá, ${username}`}
        </li>

        {/* Botão de logout */}
        <li>
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </li>

      </ul>
    </nav>
  );
}
