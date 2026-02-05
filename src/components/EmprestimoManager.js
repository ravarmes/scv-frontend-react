import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const API_URL = '/emprestimos';
const CLIENTES_API_URL = '/clientes';
const FILMES_API_URL = '/filmes';

const EmprestimoManager = () => {
    const [emprestimos, setEmprestimos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [filmes, setFilmes] = useState([]);
    const [fitasDisponiveis, setFitasDisponiveis] = useState([]);

    const [formData, setFormData] = useState({
        id: null,
        data: '',
        valor: 0,
        clienteId: ''
    });

    // State for loan items
    const [itensEmprestimo, setItensEmprestimo] = useState([]);
    const [filmeToAdd, setFilmeToAdd] = useState('');
    const [fitaToAdd, setFitaToAdd] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmprestimos();
        fetchClientes();
        fetchFilmes();
    }, []);

    const fetchEmprestimos = async () => {
        try {
            const response = await api.get(API_URL);
            setEmprestimos(response.data);
        } catch (err) {
            setError('Erro ao carregar empréstimos');
            console.error(err);
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await api.get(CLIENTES_API_URL);
            setClientes(response.data);
        } catch (err) {
            console.error('Erro ao carregar clientes', err);
        }
    };

    const fetchFilmes = async () => {
        try {
            const response = await api.get(FILMES_API_URL);
            setFilmes(response.data);
        } catch (err) {
            console.error('Erro ao carregar filmes', err);
        }
    };

    const fetchFitasByFilme = async (filmeId) => {
        if (!filmeId) {
            setFitasDisponiveis([]);
            return;
        }
        try {
            // Use the endpoint to get available fitas (not damaged, available)
            const response = await api.get(`/fitas/findByFilme/${filmeId}`);
            // Filter only available fitas
            const available = response.data.filter(f => f.disponivel && !f.danificada);
            setFitasDisponiveis(available);
        } catch (err) {
            console.error('Erro ao carregar fitas', err);
            setFitasDisponiveis([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFilmeChange = (e) => {
        const filmeId = e.target.value;
        setFilmeToAdd(filmeId);
        setFitaToAdd('');
        fetchFitasByFilme(filmeId);
    };

    // Calculate delivery date based on tipoDeFilme prazo
    const calculateEntrega = (fita) => {
        const dataEmprestimo = formData.data || new Date().toISOString().split('T')[0];
        const filme = filmes.find(f => f.id === fita.filmeId);
        if (filme && filme.tipoDeFilme) {
            const prazo = filme.tipoDeFilme.prazo || 3;
            const date = new Date(dataEmprestimo);
            date.setDate(date.getDate() + prazo);
            return date.toISOString().split('T')[0];
        }
        // Default prazo if not found
        const date = new Date(dataEmprestimo);
        date.setDate(date.getDate() + 3);
        return date.toISOString().split('T')[0];
    };

    // Calculate valor based on tipoDeFilme preco
    const calculateValor = (fita) => {
        const filme = filmes.find(f => f.id === fita.filmeId);
        if (filme && filme.tipoDeFilme) {
            return filme.tipoDeFilme.preco || 5.0;
        }
        return 5.0; // Default price
    };

    // Add loan item
    const handleAddItem = () => {
        if (!fitaToAdd) {
            setError('Selecione uma fita para adicionar');
            return;
        }

        const fita = fitasDisponiveis.find(f => f.id === parseInt(fitaToAdd));
        if (!fita) {
            setError('Fita não encontrada');
            return;
        }

        // Check if fita already added
        if (itensEmprestimo.find(item => item.fita.id === fita.id)) {
            setError('Esta fita já foi adicionada');
            return;
        }

        const filme = filmes.find(f => f.id === fita.filmeId);
        const valorItem = calculateValor(fita);
        const entregaItem = calculateEntrega(fita);

        const novoItem = {
            fita: { id: fita.id, numero: fita.numero || fita.id },
            filme: filme,
            valor: valorItem,
            entrega: entregaItem
        };

        const novosItens = [...itensEmprestimo, novoItem];
        setItensEmprestimo(novosItens);

        // Recalculate total value
        const totalValor = novosItens.reduce((sum, item) => sum + item.valor, 0);
        setFormData({ ...formData, valor: totalValor });

        setFilmeToAdd('');
        setFitaToAdd('');
        setFitasDisponiveis([]);
        setError('');
    };

    const handleRemoveItem = (fitaId) => {
        const novosItens = itensEmprestimo.filter(item => item.fita.id !== fitaId);
        setItensEmprestimo(novosItens);

        // Recalculate total value
        const totalValor = novosItens.reduce((sum, item) => sum + item.valor, 0);
        setFormData({ ...formData, valor: totalValor });
    };

    const resetForm = () => {
        setFormData({
            id: null,
            data: '',
            valor: 0,
            clienteId: ''
        });
        setItensEmprestimo([]);
        setFilmeToAdd('');
        setFitaToAdd('');
        setFitasDisponiveis([]);
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clienteId) {
            setError('Selecione um cliente');
            return;
        }
        if (itensEmprestimo.length === 0) {
            setError('Adicione pelo menos uma fita ao empréstimo');
            return;
        }

        try {
            const cliente = clientes.find(c => c.id === parseInt(formData.clienteId));
            const dataToSend = {
                data: formData.data,
                valor: formData.valor,
                cliente: { id: cliente.id },
                itens: itensEmprestimo.map(item => ({
                    fita: { id: item.fita.id },
                    valor: item.valor,
                    entrega: item.entrega
                }))
            };

            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchEmprestimos();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar empréstimo');
            console.error(err);
        }
    };

    const handleEdit = (emprestimo) => {
        setFormData({
            id: emprestimo.id,
            data: emprestimo.data,
            valor: emprestimo.valor,
            clienteId: emprestimo.clienteId || emprestimo.cliente?.id || ''
        });

        // Load loan items
        if (emprestimo.itens) {
            const itens = emprestimo.itens.map(item => {
                const fita = item.fita || { id: item.fitaId };
                const filme = filmes.find(f => f.id === fita.filmeId) || item.fita?.filme;
                return {
                    fita: { id: fita.id, numero: fita.numero || fita.id },
                    filme: filme,
                    valor: item.valor,
                    entrega: item.entrega
                };
            });
            setItensEmprestimo(itens);
        } else {
            setItensEmprestimo([]);
        }

        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este empréstimo?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchEmprestimos();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir empréstimo');
                console.error(err);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const getClienteNome = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Basic Info Row */}
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="clienteId" className="form-label">Cliente *</label>
                            <select
                                className="form-select"
                                id="clienteId"
                                name="clienteId"
                                value={formData.clienteId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="data" className="form-label">Data *</label>
                            <input
                                type="date"
                                className="form-control"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="valor" className="form-label">Valor Total (R$)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="valor"
                                name="valor"
                                value={formData.valor}
                                readOnly
                                style={{ backgroundColor: '#e9ecef' }}
                            />
                        </div>
                    </div>

                    {/* Add Item Section */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <label className="form-label">Adicionar Fita ao Empréstimo</label>
                            <div className="d-flex gap-2">
                                <select
                                    className="form-select"
                                    value={filmeToAdd}
                                    onChange={handleFilmeChange}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">Selecione um filme</option>
                                    {filmes.map(filme => (
                                        <option key={filme.id} value={filme.id}>
                                            {filme.titulo}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="form-select"
                                    value={fitaToAdd}
                                    onChange={(e) => setFitaToAdd(e.target.value)}
                                    disabled={!filmeToAdd}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">Selecione uma fita</option>
                                    {fitasDisponiveis
                                        .filter(f => !itensEmprestimo.find(item => item.fita.id === f.id))
                                        .map(fita => (
                                            <option key={fita.id} value={fita.id}>
                                                Fita #{fita.numero || fita.id} {fita.danificada ? '(Danificada)' : ''}
                                            </option>
                                        ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddItem}
                                    disabled={!fitaToAdd}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    {itensEmprestimo.length > 0 && (
                        <div className="row mb-3">
                            <div className="col-12">
                                <h5>Itens de Empréstimo</h5>
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Filme</th>
                                            <th>Fita</th>
                                            <th>Valor</th>
                                            <th>Entrega</th>
                                            <th style={{ width: '60px' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itensEmprestimo.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.filme?.titulo || 'N/A'}</td>
                                                <td>#{item.fita.numero || item.fita.id}</td>
                                                <td>{formatCurrency(item.valor)}</td>
                                                <td>{formatDate(item.entrega)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveItem(item.fita.id)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2" className="text-end"><strong>Total:</strong></td>
                                            <td colSpan="3"><strong>{formatCurrency(formData.valor)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={resetForm}>
                            <FaTimes /> Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <FaSave /> Salvar
                        </button>
                    </div>
                </form>
            </div>

            <div className="table-container">
                <h3>Lista de Empréstimos</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Valor</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {emprestimos.map(emprestimo => (
                            <tr key={emprestimo.id}>
                                <td>{emprestimo.id}</td>
                                <td>{formatDate(emprestimo.data)}</td>
                                <td>{emprestimo.cliente?.nome || getClienteNome(emprestimo.clienteId)}</td>
                                <td>{formatCurrency(emprestimo.valor)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleEdit(emprestimo)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(emprestimo.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {emprestimos.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">Nenhum empréstimo cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmprestimoManager;
