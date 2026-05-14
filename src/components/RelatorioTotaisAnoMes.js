import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaChartBar } from 'react-icons/fa';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const RelatorioTotaisAnoMes = () => {
    const [dados, setDados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTotais();
    }, []);

    const fetchTotais = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/emprestimos/findTotaisAnoMes');
            setDados(response.data);
        } catch (err) {
            setError('Erro ao buscar dados');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const getAno = (item) => item.ano || item.year || '';
    const getMes = (item) => item.mes || item.month || 0;
    const getQuantidade = (item) => item.quantidade || item.qtd || 0;
    const getValorTotal = (item) => parseFloat(item.total || item.valorTotal || item.valor || 0);

    const formatMes = (mes) => {
        const m = parseInt(mes);
        if (m >= 1 && m <= 12) return MESES[m - 1];
        return mes;
    };

    const maxValor = Math.max(...dados.map(getValorTotal), 1);
    const totalQuantidade = dados.reduce((sum, d) => sum + getQuantidade(d), 0);
    const totalValor = dados.reduce((sum, d) => sum + getValorTotal(d), 0);

    return (
        <div>
            <div className="form-panel">
                <h3>Totais de Empréstimos por Ano/Mês</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                {loading && <p className="text-center">Carregando...</p>}
            </div>

            {!loading && (
                <div className="table-container">
                    <h3><FaChartBar /> Resultados</h3>

                    {dados.length > 0 ? (
                        <>
                            <div className="bairro-chart">
                                {dados.map((item, index) => (
                                    <div key={index} className="bairro-chart-row">
                                        <div className="bairro-name">
                                            {formatMes(getMes(item))}/{getAno(item)}
                                        </div>
                                        <div className="bairro-bar-container">
                                            <div
                                                className="bairro-bar"
                                                style={{
                                                    width: `${(getValorTotal(item) / maxValor) * 100}%`,
                                                    backgroundColor: `hsl(${150 + index * 20}, 60%, 45%)`
                                                }}
                                            >
                                                <span className="bairro-value">{formatCurrency(getValorTotal(item))}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <table className="table mt-4">
                                <thead>
                                    <tr>
                                        <th>Ano</th>
                                        <th>Mês</th>
                                        <th>Quantidade</th>
                                        <th>Valor Total (R$)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dados.map((item, index) => (
                                        <tr key={index}>
                                            <td>{getAno(item)}</td>
                                            <td>{formatMes(getMes(item))}</td>
                                            <td>{getQuantidade(item)}</td>
                                            <td>{formatCurrency(getValorTotal(item))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="table-info">
                                        <td colSpan="2"><strong>Total</strong></td>
                                        <td><strong>{totalQuantidade}</strong></td>
                                        <td><strong>{formatCurrency(totalValor)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    ) : (
                        <p className="text-center text-muted">Nenhum dado encontrado</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RelatorioTotaisAnoMes;
