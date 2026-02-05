import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/devolucoes';
const EMPRESTIMOS_API_URL = '/emprestimos';
const FITAS_API_URL = '/fitas';

const DevolucaoManager = () => {
    const [devolucoes, setDevolucoes] = useState([]);
    const [emprestimos, setEmprestimos] = useState([]);
    const [fitas, setFitas] = useState([]);
    const [formData, setFormData] = useState({
        emprestimoId: '',
        fitaId: '',
        data: ''
    });
    const [originalKeys, setOriginalKeys] = useState({ emprestimoId: '', fitaId: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDevolucoes();
        fetchEmprestimos();
        fetchFitas();
    }, []);

    const fetchDevolucoes = async () => {
        try {
            const response = await api.get(API_URL);
            setDevolucoes(response.data);
        } catch (err) {
            setError('Erro ao carregar devoluções');
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
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({
            emprestimoId: '',
            fitaId: '',
            data: ''
        });
        setOriginalKeys({ emprestimoId: '', fitaId: '' });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`${API_URL}/${originalKeys.emprestimoId}/${originalKeys.fitaId}`, formData);
            } else {
                await api.post(API_URL, formData);
            }
            resetForm();
            fetchDevolucoes();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar devolução');
            console.error(err);
        }
    };

    const handleEdit = (devolucao) => {
        setFormData({
            emprestimoId: devolucao.emprestimoId,
            fitaId: devolucao.fitaId,
            data: devolucao.data
        });
        setOriginalKeys({
            emprestimoId: devolucao.emprestimoId,
            fitaId: devolucao.fitaId
        });
        setIsEditing(true);
    };

    const handleDelete = async (emprestimoId, fitaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta devolução?')) {
            try {
                await api.delete(`${API_URL}/${emprestimoId}/${fitaId}`);
                fetchDevolucoes();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir devolução');
                console.error(err);
            }
        }
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
                <h3>{isEditing ? 'Editar Devolução' : 'Nova Devolução'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                        <div className="col-md-4">
                            <label htmlFor="data" className="form-label">Data da Devolução</label>
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
                <h3>Lista de Devoluções</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Empréstimo</th>
                            <th>Fita</th>
                            <th>Data</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devolucoes.map(devolucao => (
                            <tr key={`${devolucao.emprestimoId}-${devolucao.fitaId}`}>
                                <td>{getEmprestimoInfo(devolucao.emprestimoId)}</td>
                                <td>{getFitaInfo(devolucao.fitaId)}</td>
                                <td>{formatDate(devolucao.data)}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(devolucao)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(devolucao.emprestimoId, devolucao.fitaId)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {devolucoes.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Nenhuma devolução cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DevolucaoManager;
