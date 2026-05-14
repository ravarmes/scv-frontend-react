import React, { useState } from 'react';
import api from '../api';
import { FaSearch, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const RelatorioTotaisClientes = () => {
    const [dadosClientes, setDadosClientes] = useState([]);
    const [filters, setFilters] = useState({
        dataInicio: '',
        dataTermino: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filters.dataInicio || !filters.dataTermino) {
            setError('Preencha as datas de início e término');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await api.get(
                `/emprestimos/findTotaisAndQuantidadesEmprestimosOfClientesByPeriodo/${filters.dataInicio}/${filters.dataTermino}`
            );
            setDadosClientes(response.data);
        } catch (err) {
            setError('Erro ao buscar dados');
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

    const getQuantidade = (item) => item.quantidade || item.total || 0;
    const getValorTotal = (item) => parseFloat(item.valorTotal || item.totalValor || item.valor || 0);

    const totalQuantidade = dadosClientes.reduce((sum, d) => sum + getQuantidade(d), 0);
    const totalValor = dadosClientes.reduce((sum, d) => sum + getValorTotal(d), 0);

    return (
        <div>
            <div className="form-panel">
                <h3>Totais e Quantidades de Empréstimos por Cliente</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSearch}>
                    <div className="row mb-3">
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                        <div className="col-md-4 d-flex align-items-end">
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
                        <FaUsers /> Resultados
                        {filters.dataInicio && filters.dataTermino && (
                            <span className="text-muted" style={{ fontSize: '0.8em' }}>
                                {' '}({formatDate(filters.dataInicio)} a {formatDate(filters.dataTermino)})
                            </span>
                        )}
                    </h3>

                    {dadosClientes.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Quantidade de Empréstimos</th>
                                    <th>Valor Total (R$)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dadosClientes.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.cliente || item.nome || item.nomeCliente || `Cliente ${index + 1}`}</td>
                                        <td>{getQuantidade(item)}</td>
                                        <td>{formatCurrency(getValorTotal(item))}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="table-info">
                                    <td><strong>Total</strong></td>
                                    <td><strong>{totalQuantidade}</strong></td>
                                    <td><strong>{formatCurrency(totalValor)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    ) : (
                        <p className="text-center text-muted">Nenhum dado encontrado para o período selecionado</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RelatorioTotaisClientes;
