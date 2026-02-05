import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const API_URL = '/reservas';
const CLIENTES_API_URL = '/clientes';
const FITAS_API_URL = '/fitas';

const ReservaManager = () => {
    const [reservas, setReservas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [fitas, setFitas] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        data: '',
        status: '0',
        clienteId: '',
        fitaId: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    const statusLabels = {
        '0': 'Aberta',
        '1': 'Fechada (Empréstimo)',
        '2': 'Fechada (Não realizado)'
    };

    useEffect(() => {
        fetchReservas();
        fetchClientes();
        fetchFitas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await api.get(API_URL);
            setReservas(response.data);
        } catch (err) {
            setError('Erro ao carregar reservas');
            console.error(err);
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await api.get(CLIENTES_API_URL);
            setClientes(response.data);
        } catch (err) {
            console.error('Erro ao carregar clientes', err);
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
            id: null,
            data: '',
            status: '0',
            clienteId: '',
            fitaId: ''
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
            fetchReservas();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar reserva');
            console.error(err);
        }
    };

    const handleEdit = (reserva) => {
        setFormData({
            id: reserva.id,
            data: reserva.data,
            status: reserva.status,
            clienteId: reserva.clienteId,
            fitaId: reserva.fitaId
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchReservas();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir reserva');
                console.error(err);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const getClienteNome = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : '-';
    };

    const getFitaInfo = (fitaId) => {
        const fita = fitas.find(f => f.id === fitaId);
        return fita ? `Fita ${fita.id}` : '-';
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case '0': return 'bg-primary';
            case '1': return 'bg-success';
            case '2': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Reserva' : 'Nova Reserva'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label htmlFor="data" className="form-label">Data</label>
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
                        <div className="col-md-3">
                            <label htmlFor="status" className="form-label">Status</label>
                            <select
                                className="form-select"
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="0">Aberta</option>
                                <option value="1">Fechada (Empréstimo)</option>
                                <option value="2">Fechada (Não realizado)</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="clienteId" className="form-label">Cliente</label>
                            <select
                                className="form-select"
                                id="clienteId"
                                name="clienteId"
                                value={formData.clienteId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
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
                                required
                            >
                                <option value="">Selecione uma fita</option>
                                {fitas.map(fita => (
                                    <option key={fita.id} value={fita.id}>
                                        Fita {fita.id} {fita.disponivel ? '(Disponível)' : '(Indisponível)'}
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
                <h3>Lista de Reservas</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Fita</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(reserva => (
                            <tr key={reserva.id}>
                                <td>{reserva.id}</td>
                                <td>{formatDate(reserva.data)}</td>
                                <td>{getClienteNome(reserva.clienteId)}</td>
                                <td>{getFitaInfo(reserva.fitaId)}</td>
                                <td>
                                    <span className={`badge ${getStatusBadgeClass(reserva.status)}`}>
                                        {statusLabels[reserva.status]}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleEdit(reserva)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(reserva.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {reservas.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center">Nenhuma reserva cadastrada</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReservaManager;
