import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/multas';
const EMPRESTIMOS_API_URL = '/emprestimos';
const FITAS_API_URL = '/fitas';

const MultaManager = () => {
    const [multas, setMultas] = useState([]);
    const [emprestimos, setEmprestimos] = useState([]);
    const [fitas, setFitas] = useState([]);
    const [formData, setFormData] = useState({
        emprestimoId: '',
        fitaId: '',
        valor: '',
        pago: false
    });
    const [originalKeys, setOriginalKeys] = useState({ emprestimoId: '', fitaId: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMultas();
        fetchEmprestimos();
        fetchFitas();
    }, []);

    const fetchMultas = async () => {
        try {
            const response = await api.get(API_URL);
            setMultas(response.data);
        } catch (err) {
            setError('Erro ao carregar multas');
            console.error(err);
        }
    };

    const fetchEmprestimos = async () => {
        try {
            const response = await api.get(EMPRESTIMOS_API_URL);
            setEmprestimos(response.data);
        } catch (err) {
            console.error('Erro ao carregar empréstimos', err);
        }
    };

    const fetchFitas = async () => {
        try {
            const response = await api.get(FITAS_API_URL);
            setFitas(response.data);
        } catch (err) {
            console.error('Erro ao carregar fitas', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            emprestimoId: '',
            fitaId: '',
            valor: '',
            pago: false
        });
        setOriginalKeys({ emprestimoId: '', fitaId: '' });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                valor: parseFloat(formData.valor)
            };
            if (isEditing) {
                await api.put(`${API_URL}/${originalKeys.emprestimoId}/${originalKeys.fitaId}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchMultas();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar multa');
            console.error(err);
        }
    };

    const handleEdit = (multa) => {
        setFormData({
            emprestimoId: multa.emprestimoId,
            fitaId: multa.fitaId,
            valor: multa.valor,
            pago: multa.pago
        });
        setOriginalKeys({
            emprestimoId: multa.emprestimoId,
            fitaId: multa.fitaId
        });
        setIsEditing(true);
    };

    const handleDelete = async (emprestimoId, fitaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta multa?')) {
            try {
                await api.delete(`${API_URL}/${emprestimoId}/${fitaId}`);
                fetchMultas();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir multa');
                console.error(err);
            }
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const getEmprestimoInfo = (emprestimoId) => {
        const emprestimo = emprestimos.find(e => e.id === emprestimoId);
        return emprestimo ? `Empréstimo ${emprestimo.id} - ${formatDate(emprestimo.data)}` : '-';
    };

    const getFitaInfo = (fitaId) => {
        const fita = fitas.find(f => f.id === fitaId);
        return fita ? `Fita ${fita.id}` : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Multa' : 'Nova Multa'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label htmlFor="emprestimoId" className="form-label">Empréstimo</label>
                            <select
                                className="form-select"
                                id="emprestimoId"
                                name="emprestimoId"
                                value={formData.emprestimoId}
                                onChange={handleInputChange}
                                disabled={isEditing}
                                required
                            >
                                <option value="">Selecione um empréstimo</option>
                                {emprestimos.map(emprestimo => (
                                    <option key={emprestimo.id} value={emprestimo.id}>
                                        Empréstimo {emprestimo.id} - {formatDate(emprestimo.data)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="fitaId" className="form-label">Fita</label>
                            <select
                                className="form-select"
                                id="fitaId"
                                name="fitaId"
                                value={formData.fitaId}
                                onChange={handleInputChange}
                                disabled={isEditing}
                                required
                            >
                                <option value="">Selecione uma fita</option>
                                {fitas.map(fita => (
                                    <option key={fita.id} value={fita.id}>
                                        Fita {fita.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="valor" className="form-label">Valor (R$)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="valor"
                                name="valor"
                                placeholder="0.00"
                                value={formData.valor}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label d-block">Pago</label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="pago"
                                    name="pago"
                                    checked={formData.pago}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="pago">
                                    {formData.pago ? 'Sim' : 'Não'}
                                </label>
                            </div>
                        </div>
                    </div>
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
                <h3>Lista de Multas</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Empréstimo</th>
                            <th>Fita</th>
                            <th>Valor</th>
                            <th>Pago</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {multas.map(multa => (
                            <tr key={`${multa.emprestimoId}-${multa.fitaId}`}>
                                <td>{getEmprestimoInfo(multa.emprestimoId)}</td>
                                <td>{getFitaInfo(multa.fitaId)}</td>
                                <td>{formatCurrency(multa.valor)}</td>
                                <td>
                                    <span className={`badge ${multa.pago ? 'bg-success' : 'bg-danger'}`}>
                                        {multa.pago ? 'Sim' : 'Não'}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(multa)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(multa.emprestimoId, multa.fitaId)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {multas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">Nenhuma multa cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MultaManager;
