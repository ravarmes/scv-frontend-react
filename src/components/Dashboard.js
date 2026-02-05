import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaUsers, FaFilm, FaCompactDisc, FaHandHolding, FaChartBar, FaSpinner } from 'react-icons/fa';

const Dashboard = () => {
    const [stats, setStats] = useState({
        clientes: 0,
        filmes: 0,
        fitas: 0,
        emprestimos: 0
    });
    const [emprestimosAnoMes, setEmprestimosAnoMes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchStats();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [clientesRes, filmesRes, fitasRes, emprestimosRes, totaisRes] = await Promise.all([
                api.get('/clientes'),
                api.get('/filmes'),
                api.get('/fitas'),
                api.get('/emprestimos'),
                api.get('/emprestimos/findTotaisAnoMes').catch(() => ({ data: [] }))
            ]);

            setStats({
                clientes: clientesRes.data.length,
                filmes: filmesRes.data.length,
                fitas: fitasRes.data.length,
                emprestimos: emprestimosRes.data.length
            });

            setEmprestimosAnoMes(totaisRes.data || []);
        } catch (err) {
            console.error('Erro ao carregar estatísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatRecTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className="camera-viewfinder">
            {/* Camera frame corners */}
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>

            {/* REC indicator */}
            <div className="rec-indicator">
                <span className="rec-dot"></span>
                REC
            </div>

            {/* Timestamp */}
            <div className="camera-timestamp">
                {formatRecTime(currentTime)}
            </div>

            {/* Main content */}
            <div className="camera-content">
                <div className="welcome-header">
                    <h1>Bem Vindo ao</h1>
                    <h2>Sistema de Controle da Videolocadora</h2>
                    <div className="film-icon">🎬</div>
                    <p className="author-name">Rafael Vargas Mesquita</p>
                    <p className="author-title">Professor do Instituto Federal do Espírito Santo</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <FaSpinner className="spinner" />
                        <p>Conectando ao servidor...</p>
                    </div>
                ) : (
                    <div className="stats-container">
                        <div className="stat-card stat-clientes">
                            <FaUsers className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{stats.clientes}</span>
                                <span className="stat-label">Clientes</span>
                            </div>
                        </div>

                        <div className="stat-card stat-filmes">
                            <FaFilm className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{stats.filmes}</span>
                                <span className="stat-label">Filmes</span>
                            </div>
                        </div>

                        <div className="stat-card stat-fitas">
                            <FaCompactDisc className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{stats.fitas}</span>
                                <span className="stat-label">Fitas</span>
                            </div>
                        </div>

                        <div className="stat-card stat-emprestimos">
                            <FaHandHolding className="stat-icon" />
                            <div className="stat-info">
                                <span className="stat-number">{stats.emprestimos}</span>
                                <span className="stat-label">Empréstimos</span>
                            </div>
                        </div>
                    </div>
                )}

                {emprestimosAnoMes.length > 0 && (
                    <div className="chart-container">
                        <h3><FaChartBar /> Empréstimos por Período</h3>
                        <div className="simple-chart">
                            {emprestimosAnoMes.slice(0, 6).map((item, index) => (
                                <div key={index} className="chart-bar-container">
                                    <div
                                        className="chart-bar"
                                        style={{ height: `${Math.min(100, (item.total || item.quantidade || 0) * 10)}px` }}
                                    ></div>
                                    <span className="chart-label">{item.mes || item.ano_mes || ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="camera-footer">
                <p>© Rafael Vargas Mesquita. 2026</p>
                <p>Aplicação Front-End utilizando React - Back-End em Node.js + Sequelize</p>
            </div>
        </div>
    );
};

export default Dashboard;
