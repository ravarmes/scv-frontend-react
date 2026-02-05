import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/cidades';
const UFS_API_URL = '/ufs';

const CidadeManager = () => {
    const [cidades, setCidades] = useState([]);
    const [ufs, setUfs] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        ufId: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCidades();
        fetchUfs();
    }, []);

    const fetchCidades = async () => {
        try {
            const response = await api.get(API_URL);
            setCidades(response.data);
        } catch (err) {
            setError('Erro ao carregar cidades');
            console.error(err);
        }
    };

    const fetchUfs = async () => {
        try {
            const response = await api.get(UFS_API_URL);
            setUfs(response.data);
        } catch (err) {
            console.error('Erro ao carregar UFs', err);
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
            ufId: ''
        });
        setIsEditing(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                id: formData.id,
                nome: formData.nome,
                uf: { id: parseInt(formData.ufId) }
            };
            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchCidades();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar cidade');
            console.error(err);
        }
    };

    const handleEdit = (cidade) => {
        setFormData({
            id: cidade.id,
            nome: cidade.nome,
            ufId: cidade.ufId
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta cidade?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchCidades();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir cidade');
                console.error(err);
            }
        }
    };

    const getUfNome = (ufId) => {
        const uf = ufs.find(u => u.id === ufId);
        return uf ? `${uf.sigla} - ${uf.nome}` : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Cidade' : 'Nova Cidade'}</h3>
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
                                placeholder="Digite o nome da cidade"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="ufId" className="form-label">UF</label>
                            <select
                                className="form-select"
                                id="ufId"
                                name="ufId"
                                value={formData.ufId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf.id} value={uf.id}>
                                        {uf.sigla} - {uf.nome}
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
                <h3>Lista de Cidades</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>UF</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cidades.map(cidade => (
                            <tr key={cidade.id}>
                                <td>{cidade.id}</td>
                                <td>{cidade.nome}</td>
                                <td>{getUfNome(cidade.ufId)}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(cidade)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(cidade.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {cidades.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Nenhuma cidade cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CidadeManager;
