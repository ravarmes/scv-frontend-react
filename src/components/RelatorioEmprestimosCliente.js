import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

const RelatorioEmprestimosCliente = () => {
    const [clientes, setClientes] = useState([]);
    const [emprestimos, setEmprestimos] = useState([]);
    const [filters, setFilters] = useState({
        clienteId: '',
        dataInicio: '',
        dataTermino: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (err) {
            console.error('Erro ao carregar clientes', err);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filters.clienteId || !filters.dataInicio || !filters.dataTermino) {
            setError('Preencha todos os filtros');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await api.get(
                `/emprestimos/findByClienteAndPeriodo/${filters.clienteId}/${filters.dataInicio}/${filters.dataTermino}`
            );
            setEmprestimos(response.data);
        } catch (err) {
            setError('Erro ao buscar empréstimos');
            console.error(err);
        } finally {
            setLoading(false);
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

    const getClienteNome = () => {
        const cliente = clientes.find(c => c.id === parseInt(filters.clienteId));
        return cliente ? cliente.nome : '';
    };

    const totalValor = emprestimos.reduce((sum, emp) => sum + (parseFloat(emp.valor) || 0), 0);

    return (
        <div>
            <div className="form-panel">
                <h3>Listagem de Empréstimos (Por Cliente, Início e Término)</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSearch}>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="clienteId" className="form-label">Selecione o Cliente</label>
                            <select
                                className="form-select"
                                id="clienteId"
                                name="clienteId"
                                value={filters.clienteId}
                                onChange={handleFilterChange}
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
                        <div className="col-md-3">
                            <label htmlFor="dataInicio" className="form-label">Selecione a Data Início</label>
                            <div className="input-group">
                                <input
                                    type="date"
                                    className="form-control"
                                    id="dataInicio"
                                    name="dataInicio"
                                    value={filters.dataInicio}
                                    onChange={handleFilterChange}
                                    required
                                />
                                <span className="input-group-text"><FaCalendarAlt /></span>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="dataTermino" className="form-label">Selecione a Data Término</label>
                            <div className="input-group">
                                <input
                                    type="date"
                                    className="form-control"
                                    id="dataTermino"
                                    name="dataTermino"
                                    value={filters.dataTermino}
                                    onChange={handleFilterChange}
                                    required
                                />
                                <span className="input-group-text"><FaCalendarAlt /></span>
                            </div>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                <FaSearch /> {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {searched && (
                <div className="table-container">
                    <h3>
                        Empréstimos de {getClienteNome()}
                        {filters.dataInicio && filters.dataTermino && (
                            <span className="text-muted" style={{ fontSize: '0.8em' }}>
                                {' '}({formatDate(filters.dataInicio)} a {formatDate(filters.dataTermino)})
                            </span>
                        )}
                    </h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Valor (R$)</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emprestimos.map(emprestimo => (
                                <tr key={emprestimo.id}>
                                    <td>{emprestimo.id}</td>
                                    <td>{formatCurrency(emprestimo.valor)}</td>
                                    <td>{formatDate(emprestimo.data)}</td>
                                </tr>
                            ))}
                            {emprestimos.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center">Nenhum empréstimo encontrado no período</td>
                                </tr>
                            )}
                        </tbody>
                        {emprestimos.length > 0 && (
                            <tfoot>
                                <tr className="table-info">
                                    <td><strong>Total</strong></td>
                                    <td><strong>{formatCurrency(totalValor)}</strong></td>
                                    <td><strong>{emprestimos.length} empréstimo(s)</strong></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
};

export default RelatorioEmprestimosCliente;
