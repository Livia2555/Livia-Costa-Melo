import { useState, useEffect } from 'react';
import './Historico.css';

export default function TabelaHistorico() {
  const [historico, setHistorico] = useState([]);
  const token = localStorage.getItem('access_token');
  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/historico/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setHistorico(data))
      .catch(() => setHistorico([]));
  }, [token]);

  return (
    <div className="historico-container">
      <div className="historico-header">
        <h1 className="historico-titulo">Histórico de Movimentações</h1>
      </div>

      {historico.length === 0 ? (
        <div className="historico-vazio">
          <p>Nenhuma movimentação encontrada</p>
        </div>
      ) : (
        <div className="historico-tabela-wrapper">
          <table className="historico-tabela">
            <thead>
              <tr className="historico-cabecalho">
                <th>Data/Hora</th>
                <th>Responsável</th>
                <th>Produto</th>
                <th>Operação</th>
                <th>Quantidade</th>
              </tr>
            </thead>

            <tbody>
              {historico.map((item, index) => (
                <tr
                  key={item.id}
                  className={`historico-linha ${index % 2 === 0 ? 'linha-par' : 'linha-impar'}`}
                >
                  {/* Data formatada */}
                  <td>{item.data_hora_formatada}</td>

                  {/* Nome do responsável */}
                  <td>
                    <span className="historico-username">{item.responsavel_username}</span>
                  </td>

                  {/* Nome + tipo do produto */}
                  <td>
                    {item.produto_nome} ({item.produto_tipo})
                  </td>

                  {/* Tipo de operação (badge) */}
                  <td>
                    <span className={`historico-badge ${item.tipo_operacao}`}>
                      {item.tipo_operacao_display}
                    </span>
                  </td>

                  {/* Quantidade com cor */}
                  <td>
                    <span className={`historico-quantidade ${item.tipo_operacao}`}>
                      {item.quantidade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      <div className="historico-footer">
        <p>Total de registros: <strong>{historico.length}</strong></p>
      </div>
    </div>
  );
}
