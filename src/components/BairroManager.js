import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/bairros';
const CIDADES_API_URL = '/cidades';

const BairroManager = () => {
    const [bairros, setBairros] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        cidadeId: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBairros();
        fetchCidades();
    }, []);

    const fetchBairros = async () => {
        try {
            const response = await api.get(API_URL);
            setBairros(response.data);
        } catch (err) {
            setError('Erro ao carregar bairros');
            console.error(err);
        }
    };

    const fetchCidades = async () => {
        try {
            const response = await api.get(CIDADES_API_URL);
            setCidades(response.data);
        } catch (err) {
            console.error('Erro ao carregar cidades', err);
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
            cidadeId: ''
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
            fetchBairros();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar bairro');
            console.error(err);
        }
    };

    const handleEdit = (bairro) => {
        setFormData({
            id: bairro.id,
            nome: bairro.nome,
            cidadeId: bairro.cidadeId
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este bairro?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchBairros();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir bairro');
                console.error(err);
            }
        }
    };

    const getCidadeNome = (cidadeId) => {
        const cidade = cidades.find(c => c.id === cidadeId);
        return cidade ? cidade.nome : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Bairro' : 'Novo Bairro'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                name="nome"
                                placeholder="Digite o nome do bairro"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="cidadeId" className="form-label">Cidade</label>
                            <select
                                className="form-select"
                                id="cidadeId"
                                name="cidadeId"
                                value={formData.cidadeId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione uma cidade</option>
                                {cidades.map(cidade => (
                                    <option key={cidade.id} value={cidade.id}>
                                        {cidade.nome}
                                    </option>
                                ))}
                            </select>
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
                <h3>Lista de Bairros</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Cidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bairros.map(bairro => (
                            <tr key={bairro.id}>
                                <td>{bairro.id}</td>
                                <td>{bairro.nome}</td>
                                <td>{getCidadeNome(bairro.cidadeId)}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(bairro)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(bairro.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {bairros.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Nenhum bairro cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BairroManager;
