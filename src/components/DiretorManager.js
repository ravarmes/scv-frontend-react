import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/diretores';

const DiretorManager = () => {
    const [diretores, setDiretores] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDiretores();
    }, []);

    const fetchDiretores = async () => {
        try {
            const response = await api.get(API_URL);
            setDiretores(response.data);
        } catch (err) {
            setError('Erro ao carregar diretores');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const resetForm = () => {
        setFormData({
            id: null,
            nome: ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, formData);
            } else {
                await api.post(API_URL, formData);
            }
            resetForm();
            fetchDiretores();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar diretor');
            console.error(err);
        }
    };

    const handleEdit = (diretor) => {
        setFormData({
            id: diretor.id,
            nome: diretor.nome
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este diretor?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchDiretores();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir diretor');
                console.error(err);
            }
        }
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Diretor' : 'Novo Diretor'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-12">
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                name="nome"
                                placeholder="Digite o nome do diretor"
                                value={formData.nome}
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
                <h3>Lista de Diretores</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {diretores.map(diretor => (
                            <tr key={diretor.id}>
                                <td>{diretor.id}</td>
                                <td>{diretor.nome}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(diretor)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(diretor.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {diretores.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center">Nenhum diretor cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiretorManager;
