import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormLogin.css';
import img from "../assets/img.png"; 

export function FormLogin({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(null);

        const response = await fetch('http://localhost:8000/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('access_token', data.access);
            if (onLoginSuccess) onLoginSuccess();
            navigate('/');
        } else {
            setErro('Usuário ou senha inválidos');
        }
    };

    return (
        <div className="login-container">
            <div className="image-section">
                <img src={img} alt="Smart City" />
            </div>
            <div className="form-section">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <label>Username</label>
                    <input
                        type="text"
                        placeholder="Digite seu username:"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label>Senha</label>
                    <input
                        type="password"
                        placeholder="Digite sua senha:"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Logar</button>
                    {erro && <p className="erro">{erro}</p>}
                </form>
            </div>
        </div>
    );
}