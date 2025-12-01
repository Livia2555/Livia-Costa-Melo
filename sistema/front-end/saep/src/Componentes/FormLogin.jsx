import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FormLogin.css';

export function FormLogin({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erro, setErro] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(null);

        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Salva token
            localStorage.setItem('access_token', data.access);

            // Salva o nome e id do usuário
            localStorage.setItem('username', data.usuario.username);
            localStorage.setItem('user_id', data.usuario.id);

            if (onLoginSuccess) onLoginSuccess();
            navigate('/Estoque');
        } else {
            setErro('Usuário ou senha inválidos');
        }
    };

    return (
        <div className="login-container">
            <div className="image-section"></div>

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
