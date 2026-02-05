import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/fitas';
const FILMES_API_URL = '/filmes';

const FitaManager = () => {
    const [fitas, setFitas] = useState([]);
    const [filmes, setFilmes] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        danificada: false,
        disponivel: true,
        filmeId: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchFitas();
        fetchFilmes();
    }, []);

    const fetchFitas = async () => {
        try {
            const response = await api.get(API_URL);
            setFitas(response.data);
        } catch (err) {
            setError('Erro ao carregar fitas');
            console.error(err);
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            id: null,
            danificada: false,
            disponivel: true,
            filmeId: ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                id: formData.id,
                danificada: formData.danificada,
                disponivel: formData.disponivel,
                filme: { id: parseInt(formData.filmeId) }
            };
            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchFitas();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar fita');
            console.error(err);
        }
    };

    const handleEdit = (fita) => {
        setFormData({
            id: fita.id,
            danificada: fita.danificada,
            disponivel: fita.disponivel,
            filmeId: fita.filmeId
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta fita?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchFitas();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir fita');
                console.error(err);
            }
        }
    };

    const getFilmeTitulo = (filmeId) => {
        const filme = filmes.find(f => f.id === filmeId);
        return filme ? filme.titulo : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Fita' : 'Nova Fita'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label htmlFor="filmeId" className="form-label">Filme</label>
                            <select
                                className="form-select"
                                id="filmeId"
                                name="filmeId"
                                value={formData.filmeId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um filme</option>
                                {filmes.map(filme => (
                                    <option key={filme.id} value={filme.id}>
                                        {filme.titulo}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label d-block">Danificada</label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="danificada"
                                    name="danificada"
                                    checked={formData.danificada}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="danificada">
                                    {formData.danificada ? 'Sim' : 'Não'}
                                </label>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label d-block">Disponível</label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="disponivel"
                                    name="disponivel"
                                    checked={formData.disponivel}
                                    onChange={handleInputChange}
                                />
                                <label className="form-check-label" htmlFor="disponivel">
                                    {formData.disponivel ? 'Sim' : 'Não'}
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
                <h3>Lista de Fitas</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Filme</th>
                            <th>Danificada</th>
                            <th>Disponível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fitas.map(fita => (
                            <tr key={fita.id}>
                                <td>{fita.id}</td>
                                <td>{getFilmeTitulo(fita.filmeId)}</td>
                                <td>
                                    <span className={`badge ${fita.danificada ? 'bg-danger' : 'bg-success'}`}>
                                        {fita.danificada ? 'Sim' : 'Não'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${fita.disponivel ? 'bg-success' : 'bg-warning'}`}>
                                        {fita.disponivel ? 'Sim' : 'Não'}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(fita)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(fita.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {fitas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">Nenhuma fita cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FitaManager;
