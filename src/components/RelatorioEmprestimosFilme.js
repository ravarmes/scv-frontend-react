import React, { useState } from 'react';
import api from '../api';
import { FaSearch, FaCalendarAlt, FaFilm } from 'react-icons/fa';

const RelatorioEmprestimosFilme = () => {
    const [dadosFilmes, setDadosFilmes] = useState([]);
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
                `/emprestimos/findQuantidadesEmprestimosOfFilmesByPeriodo/${filters.dataInicio}/${filters.dataTermino}`
            );
            setDadosFilmes(response.data);
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

    const getQuantidade = (item) => item.quantidade || item.total || 0;
    const getNome = (item, index) => item.filme || item.nome || item.titulo || `Filme ${index + 1}`;

    const maxQuantidade = Math.max(...dadosFilmes.map(getQuantidade), 1);
    const totalQuantidade = dadosFilmes.reduce((sum, d) => sum + getQuantidade(d), 0);

    return (
        <div>
            <div className="form-panel">
                <h3>Quantidade de Empréstimos por Filme</h3>
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
                        <FaFilm /> Resultados
                        {filters.dataInicio && filters.dataTermino && (
                            <span className="text-muted" style={{ fontSize: '0.8em' }}>
                                {' '}({formatDate(filters.dataInicio)} a {formatDate(filters.dataTermino)})
                            </span>
                        )}
                    </h3>

                    {dadosFilmes.length > 0 ? (
                        <>
                            <div className="bairro-chart">
                                {dadosFilmes.map((item, index) => (
                                    <div key={index} className="bairro-chart-row">
                                        <div className="bairro-name">{getNome(item, index)}</div>
                                        <div className="bairro-bar-container">
                                            <div
                                                className="bairro-bar"
                                                style={{
                                                    width: `${(getQuantidade(item) / maxQuantidade) * 100}%`,
                                                    backgroundColor: `hsl(${340 + index * 25}, 65%, 50%)`
                                                }}
                                            >
                                                <span className="bairro-value">{getQuantidade(item)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <table className="table mt-4">
                                <thead>
                                    <tr>
                                        <th>Filme</th>
                                        <th>Quantidade de Empréstimos</th>
                                        <th>Percentual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosFilmes.map((item, index) => {
                                        const percentual = totalQuantidade > 0
                                            ? ((getQuantidade(item) / totalQuantidade) * 100).toFixed(1)
                                            : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{getNome(item, index)}</td>
                                                <td>{getQuantidade(item)}</td>
                                                <td>{percentual}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="table-info">
                                        <td><strong>Total</strong></td>
                                        <td><strong>{totalQuantidade}</strong></td>
                                        <td><strong>100%</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    ) : (
                        <p className="text-center text-muted">Nenhum dado encontrado para o período selecionado</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RelatorioEmprestimosFilme;
