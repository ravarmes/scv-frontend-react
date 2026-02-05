import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/tiposdefilme';

const TipoDeFilmeManager = () => {
    const [tiposDeFilme, setTiposDeFilme] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        prazo: '',
        preco: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTiposDeFilme();
    }, []);

    const fetchTiposDeFilme = async () => {
        try {
            const response = await api.get(API_URL);
            setTiposDeFilme(response.data);
        } catch (err) {
            setError('Erro ao carregar tipos de filme');
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
            nome: '',
            prazo: '',
            preco: ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                prazo: parseInt(formData.prazo),
                preco: parseFloat(formData.preco)
            };
            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchTiposDeFilme();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar tipo de filme');
            console.error(err);
        }
    };

    const handleEdit = (tipo) => {
        setFormData({
            id: tipo.id,
            nome: tipo.nome,
            prazo: tipo.prazo,
            preco: tipo.preco
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este tipo de filme?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchTiposDeFilme();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir tipo de filme');
                console.error(err);
            }
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Tipo de Filme' : 'Novo Tipo de Filme'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                name="nome"
                                placeholder="Ex: Lançamento, Catálogo"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="prazo" className="form-label">Prazo (dias)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="prazo"
                                name="prazo"
                                placeholder="Ex: 3"
                                value={formData.prazo}
                                onChange={handleInputChange}
                                min="1"
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="preco" className="form-label">Preço (R$)</label>
                            <input
                                type="number"
                                className="form-control"
                                id="preco"
                                name="preco"
                                placeholder="Ex: 9.90"
                                value={formData.preco}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
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
                <h3>Lista de Tipos de Filme</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Prazo (dias)</th>
                            <th>Preço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiposDeFilme.map(tipo => (
                            <tr key={tipo.id}>
                                <td>{tipo.id}</td>
                                <td>{tipo.nome}</td>
                                <td>{tipo.prazo}</td>
                                <td>{formatCurrency(tipo.preco)}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(tipo)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(tipo.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tiposDeFilme.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center">Nenhum tipo de filme cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TipoDeFilmeManager;
