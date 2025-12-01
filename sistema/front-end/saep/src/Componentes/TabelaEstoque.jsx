import { useState, useEffect } from 'react';
import "./Estoque.css";

export function TabelaEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [exibirModalCriar, setExibirModalCriar] = useState(false);
  const [exibirModalEditar, setExibirModalEditar] = useState(false);
  const [exibirModalExcluir, setExibirModalExcluir] = useState(false);
  const [exibirModalEntrada, setExibirModalEntrada] = useState(false);
  const [exibirModalSaida, setExibirModalSaida] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidade, setQuantidade] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  const token = localStorage.getItem('access_token') || 'demo_token';
  const API_URL = 'http://localhost:8000/api';

  const TIPOS = ['smartphones', 'notebooks', 'smart TVs'];

  const [formulario, setFormulario] = useState({
    id: null,
    nome: '',
    tipo: '',
    tensao: '',
    dimencoes: '',
    resolucao: '',
    capacidade: '',
    conectividade: '',
    quantidade: ''
  });

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/estoque/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(() => setProdutos([]));
  }, [token]);

  const atualizarFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const limparFormulario = () => {
    setFormulario({
      id: null,
      nome: '',
      tipo: '',
      tensao: '',
      dimencoes: '',
      resolucao: '',
      capacidade: '',
      conectividade: '',
      quantidade: ''
    });
  };

  const enviarFormulario = async () => {
    const corpo = {
      nome: formulario.nome,
      tipo: formulario.tipo,
      tensao: parseInt(formulario.tensao),
      dimencoes: formulario.dimencoes,
      resolucao: formulario.resolucao,
      capacidade: parseInt(formulario.capacidade),
      conectividade: formulario.conectividade,
      quantidade: parseInt(formulario.quantidade)
    };

    const url = formulario.id
      ? `${API_URL}/estoque/${formulario.id}/`
      : `${API_URL}/estoque/`;

    const metodo = formulario.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(corpo)
      });

      if (response.ok) {
        const data = await response.json();

        if (formulario.id) {
          setProdutos(prev => prev.map(p => p.id === data.id ? data : p));
          setExibirModalEditar(false);
          alert('Produto atualizado!');
        } else {
          setProdutos(prev => [data, ...prev]);
          setExibirModalCriar(false);
          alert('Produto criado!');
        }

        limparFormulario();
      } else {
        alert('Erro ao salvar produto');
      }
    } catch (error) {
      alert('Erro ao salvar produto: ' + error.message);
    }
  };

  const confirmarExclusao = async () => {
    try {
      const response = await fetch(`${API_URL}/estoque/${produtoSelecionado.id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok || response.status === 204) {
        setProdutos(prev => prev.filter(p => p.id !== produtoSelecionado.id));
        setExibirModalExcluir(false);
        alert('Produto excluído!');
      }
    } catch {
      alert('Erro ao excluir produto');
    }
  };

  const confirmarEntrada = async () => {
    if (!quantidade || parseInt(quantidade) <= 0) {
      alert('Digite uma quantidade válida');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/estoque/${produtoSelecionado.id}/entrada/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantidade: parseInt(quantidade) })
      });

      if (response.ok) {
        const data = await response.json();
        setProdutos(prev => prev.map(p =>
          p.id === produtoSelecionado.id
            ? { ...p, quantidade: data.novo_total }
            : p
        ));
        setExibirModalEntrada(false);
        setQuantidade('');
        alert('Entrada registrada com sucesso!');
      }
    } catch {
      alert('Erro ao registrar entrada');
    }
  };

  const confirmarSaida = async () => {
    if (!quantidade || parseInt(quantidade) <= 0) {
      alert('Digite uma quantidade válida');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/estoque/${produtoSelecionado.id}/saida/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantidade: parseInt(quantidade) })
      });

      if (response.ok) {
        const data = await response.json();
        setProdutos(prev => prev.map(p =>
          p.id === produtoSelecionado.id
            ? { ...p, quantidade: data.novo_total }
            : p
        ));
        setExibirModalSaida(false);
        setQuantidade('');
        alert('Saída registrada com sucesso!');
      } else {
        const erro = await response.json();
        alert(erro.erro || 'Erro ao registrar saída');
      }
    } catch {
      alert('Erro ao registrar saída');
    }
  };

  // 🔎 FILTRO POR NOME
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(filtroNome.toLowerCase())
  );

  // ⚠️ Lista produtos com estoque baixo
  const produtosBaixoEstoque = produtos.filter(p => p.quantidade < 10);

  return (
    <main className="estoque-container">
      <h1 className="estoque-titulo">Gerenciamento de Estoque</h1>

      <div className="estoque-actions-row">

        {/* 🔎 CAMPO DE FILTRO POR NOME */}
        <input
          type="text"
          className="estoque-filtro"
          placeholder="Filtrar por nome..."
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />

        {token && (
          <button
            onClick={() => {
              limparFormulario();
              setExibirModalCriar(true);
            }}
            className="btn-criar"
          >
            Adicionar Produto
          </button>
        )}
      </div>

      {/* ⚠️ AVISO DE ESTOQUE BAIXO COM NOMES */}
      {produtosBaixoEstoque.length > 0 && (
        <div className="alerta-estoque-global">
          ⚠️ Produtos com estoque baixo:
          <ul>
            {produtosBaixoEstoque.map((p) => (
              <li key={p.id}>{p.nome} — {p.quantidade} unidades</li>
            ))}
          </ul>
        </div>
      )}

      {/* === Modais (crud, entrada, saída etc) permanecem iguais === */}
      {/* === Não removi nada, apenas mantive tudo funcionando === */}

      {/* Modal Criar/Editar */}
      {(exibirModalCriar || exibirModalEditar) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-titulo">
              {exibirModalCriar ? 'Adicionar Novo' : 'Editar'} Produto
            </h2>

            <div className="formulario">

              {/* NOME */}
              <input
                name="nome"
                placeholder="Nome do Produto"
                value={formulario.nome}
                onChange={atualizarFormulario}
                className="input"
              />

              {/* TIPO */}
              <select
                name="tipo"
                value={formulario.tipo}
                onChange={atualizarFormulario}
                className="input"
              >
                <option value="">Selecione o tipo</option>
                {TIPOS.map((tipo, i) => (
                  <option key={i} value={tipo}>{tipo}</option>
                ))}
              </select>

              {/* RESTANTE DOS CAMPOS */}
              <input
                name="tensao"
                type="number"
                placeholder="Tensão (V)"
                value={formulario.tensao}
                onChange={atualizarFormulario}
                className="input"
              />

              <input
                name="dimencoes"
                placeholder="Dimensões"
                value={formulario.dimencoes}
                onChange={atualizarFormulario}
                className="input"
              />

              <input
                name="resolucao"
                placeholder="Resolução"
                value={formulario.resolucao}
                onChange={atualizarFormulario}
                className="input"
              />

              <input
                name="capacidade"
                type="number"
                placeholder="Capacidade (GB)"
                value={formulario.capacidade}
                onChange={atualizarFormulario}
                className="input"
              />

              <input
                name="conectividade"
                placeholder="Conectividade"
                value={formulario.conectividade}
                onChange={atualizarFormulario}
                className="input"
              />

              <input
                name="quantidade"
                type="number"
                placeholder="Quantidade"
                value={formulario.quantidade}
                onChange={atualizarFormulario}
                className="input"
              />

              <div className="modal-botoes">
                <button onClick={enviarFormulario} className="btn-salvar">Salvar</button>
                <button
                  onClick={() =>
                    exibirModalCriar ? setExibirModalCriar(false) : setExibirModalEditar(false)
                  }
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Excluir */}
      {exibirModalExcluir && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <h3 className="modal-titulo">Confirmar Exclusão</h3>
            <p className="modal-texto">
              Tem certeza que deseja excluir <strong>{produtoSelecionado?.nome}</strong>?
            </p>
            <div className="modal-botoes">
              <button onClick={confirmarExclusao} className="btn-excluir">Excluir</button>
              <button onClick={() => setExibirModalExcluir(false)} className="btn-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Entrada */}
      {exibirModalEntrada && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <h3 className="modal-titulo">Entrada de Produto</h3>
            <p className="modal-texto">Produto: {produtoSelecionado?.nome}</p>
            <input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="input"
              min="1"
            />
            <div className="modal-botoes">
              <button onClick={confirmarEntrada} className="btn-salvar">Adicionar</button>
              <button
                onClick={() => {
                  setExibirModalEntrada(false);
                  setQuantidade('');
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Saída */}
      {exibirModalSaida && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <h3 className="modal-titulo">Saída de Produto</h3>
            <p className="modal-texto">Produto: {produtoSelecionado?.nome}</p>
            <input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="input"
              min="1"
            />
            <div className="modal-botoes">
              <button onClick={confirmarSaida} className="btn-excluir">Remover</button>
              <button
                onClick={() => {
                  setExibirModalSaida(false);
                  setQuantidade('');
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="tabela-container">
        <table className="tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Tensão</th>
              <th>Dimensões</th>
              <th>Resolução</th>
              <th>Capacidade</th>
              <th>Conectividade</th>
              <th>QTD</th>
              {token && <th>Entrada</th>}
              {token && <th>Saída</th>}
              {token && <th>Editar</th>}
              {token && <th>Excluir</th>}
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto) => (
              <tr key={produto.id}>

                <td>{produto.nome}</td>
                <td>{produto.tipo}</td>
                <td>{produto.tensao}V</td>
                <td>{produto.dimencoes}</td>
                <td>{produto.resolucao}</td>
                <td>{produto.capacidade}GB</td>
                <td>{produto.conectividade}</td>
                <td>{produto.quantidade}</td>

                {token && (
                  <td>
                    <button
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setExibirModalEntrada(true);
                      }}
                      className="btn-add"
                    >
                      +
                    </button>
                  </td>
                )}

                {token && (
                  <td>
                    <button
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setExibirModalSaida(true);
                      }}
                      className="btn-remover"
                    >
                      -
                    </button>
                  </td>
                )}

                {token && (
                  <td>
                    <button
                      onClick={() => {
                        setFormulario({
                          id: produto.id,
                          nome: produto.nome,
                          tipo: produto.tipo,
                          tensao: produto.tensao.toString(),
                          dimencoes: produto.dimencoes,
                          resolucao: produto.resolucao,
                          capacidade: produto.capacidade.toString(),
                          conectividade: produto.conectividade,
                          quantidade: produto.quantidade.toString()
                        });
                        setExibirModalEditar(true);
                      }}
                      className="btn-editar"
                    >
                      ✏️
                    </button>
                  </td>
                )}

                {token && (
                  <td>
                    <button
                      onClick={() => {
                        setProdutoSelecionado(produto);
                        setExibirModalExcluir(true);
                      }}
                      className="btn-excluir-tabela"
                    >
                      🗑️
                    </button>
                  </td>
                )}

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </main>
  );
}
