import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const API_URL = '/gerentes';
const BAIRROS_API_URL = '/bairros';

const GerenteManager = () => {
    const [gerentes, setGerentes] = useState([]);
    const [bairros, setBairros] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        cpf: '',
        rua: '',
        numero: '',
        login: '',
        senha: '',
        bairroId: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchGerentes();
        fetchBairros();
    }, []);

    const fetchGerentes = async () => {
        try {
            const response = await api.get(API_URL);
            setGerentes(response.data);
        } catch (err) {
            setError('Erro ao carregar gerentes');
            console.error(err);
        }
    };

    const fetchBairros = async () => {
        try {
            const response = await api.get(BAIRROS_API_URL);
            setBairros(response.data);
        } catch (err) {
            console.error('Erro ao carregar bairros', err);
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
            cpf: '',
            rua: '',
            numero: '',
            login: '',
            senha: '',
            bairroId: ''
        });
        setIsEditing(false);
        setError('');
        setShowPassword(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                id: formData.id,
                nome: formData.nome,
                cpf: formData.cpf,
                rua: formData.rua,
                numero: parseInt(formData.numero),
                login: formData.login,
                senha: formData.senha,
                bairro: { id: parseInt(formData.bairroId) }
            };
            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchGerentes();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar gerente');
            console.error(err);
        }
    };

    const handleEdit = (gerente) => {
        setFormData({
            id: gerente.id,
            nome: gerente.nome,
            cpf: gerente.cpf,
            rua: gerente.rua || '',
            numero: gerente.numero || '',
            login: gerente.login,
            senha: gerente.senha,
            bairroId: gerente.bairroId || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este gerente?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchGerentes();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir gerente');
                console.error(err);
            }
        }
    };

    const getBairroNome = (bairroId) => {
        const bairro = bairros.find(b => b.id === bairroId);
        return bairro ? bairro.nome : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Gerente' : 'Novo Gerente'}</h3>
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
                                placeholder="Digite o nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="cpf" className="form-label">CPF</label>
                            <input
                                type="text"
                                className="form-control"
                                id="cpf"
                                name="cpf"
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="bairroId" className="form-label">Bairro</label>
                            <select
                                className="form-select"
                                id="bairroId"
                                name="bairroId"
                                value={formData.bairroId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um bairro</option>
                                {bairros.map(bairro => (
                                    <option key={bairro.id} value={bairro.id}>
                                        {bairro.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="rua" className="form-label">Rua</label>
                            <input
                                type="text"
                                className="form-control"
                                id="rua"
                                name="rua"
                                placeholder="Nome da rua"
                                value={formData.rua}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <label htmlFor="numero" className="form-label">Número</label>
                            <input
                                type="number"
                                className="form-control"
                                id="numero"
                                name="numero"
                                placeholder="Nº"
                                value={formData.numero}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="login" className="form-label">Login</label>
                            <input
                                type="text"
                                className="form-control"
                                id="login"
                                name="login"
                                placeholder="Nome de usuário"
                                value={formData.login}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="senha" className="form-label">Senha</label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    id="senha"
                                    name="senha"
                                    placeholder="Senha (6-10 caracteres)"
                                    value={formData.senha}
                                    onChange={handleInputChange}
                                    minLength={6}
                                    maxLength={10}
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
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
                <h3>Lista de Gerentes</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Endereço</th>
                            <th>Bairro</th>
                            <th>Login</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gerentes.map(gerente => (
                            <tr key={gerente.id}>
                                <td>{gerente.id}</td>
                                <td>{gerente.nome}</td>
                                <td>{gerente.cpf}</td>
                                <td>{gerente.rua}, {gerente.numero}</td>
                                <td>{getBairroNome(gerente.bairroId)}</td>
                                <td>{gerente.login}</td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(gerente)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(gerente.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {gerentes.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center">Nenhum gerente cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GerenteManager;
