import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/ufs';

const UfManager = () => {
    const [ufs, setUfs] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        sigla: '',
        nome: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUfs();
    }, []);

    const fetchUfs = async () => {
        try {
            const response = await api.get(API_URL);
            setUfs(response.data);
        } catch (err) {
            setError('Erro ao carregar UFs');
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
            sigla: '',
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
            fetchUfs();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar UF');
            console.error(err);
        }
    };

    const handleEdit = (uf) => {
        setFormData({
            id: uf.id,
            sigla: uf.sigla,
            nome: uf.nome
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta UF?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchUfs();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir UF');
                console.error(err);
            }
        }
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar UF' : 'Nova UF'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="sigla" className="form-label">Sigla</label>
                            <input
                                type="text"
                                className="form-control"
                                id="sigla"
                                name="sigla"
                                placeholder="Ex: MG"
                                value={formData.sigla}
                                onChange={handleInputChange}
                                maxLength={2}
                                required
                            />
                        </div>
                        <div className="col-md-8">
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                name="nome"
                                placeholder="Ex: Minas Gerais"
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
                <h3>Lista de UFs</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sigla</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ufs.map(uf => (
                            <tr key={uf.id}>
                                <td>{uf.id}</td>
                                <td>{uf.sigla}</td>
                                <td>{uf.nome}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(uf)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(uf.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {ufs.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Nenhuma UF cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UfManager;
