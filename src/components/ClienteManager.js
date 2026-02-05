import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaPhone } from 'react-icons/fa';

const API_URL = '/clientes';
const BAIRROS_API_URL = '/bairros';

const ClienteManager = () => {
  const [clientes, setClientes] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    cpf: '',
    rua: '',
    numero: '',
    debito: '0',
    nascimento: '',
    bairroId: ''
  });

  // State for phones
  const [telefones, setTelefones] = useState([]);
  const [telefoneToAdd, setTelefoneToAdd] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchBairros();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await api.get(API_URL);
      setClientes(response.data);
    } catch (err) {
      setError('Erro ao carregar clientes');
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

  // Phone management
  const handleAddTelefone = () => {
    if (!telefoneToAdd.trim()) {
      setError('Digite um número de telefone');
      return;
    }
    // Validate phone format (NN) NNNNN-NNNN or (NN) NNNN-NNNN
    const phoneRegex = /^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/;
    if (!phoneRegex.test(telefoneToAdd.trim())) {
      setError('Telefone deve seguir o padrão (NN) NNNNN-NNNN');
      return;
    }
    setTelefones([...telefones, { numero: telefoneToAdd.trim() }]);
    setTelefoneToAdd('');
    setError('');
  };

  const handleRemoveTelefone = (index) => {
    setTelefones(telefones.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      nome: '',
      cpf: '',
      rua: '',
      numero: '',
      debito: '0',
      nascimento: '',
      bairroId: ''
    });
    setTelefones([]);
    setTelefoneToAdd('');
    setIsEditing(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (telefones.length === 0) {
      setError('Adicione pelo menos um telefone');
      return;
    }

    try {
      const dataToSend = {
        id: formData.id,
        nome: formData.nome,
        cpf: formData.cpf,
        rua: formData.rua,
        numero: parseInt(formData.numero),
        debito: parseFloat(formData.debito),
        nascimento: formData.nascimento,
        bairro: { id: parseInt(formData.bairroId) },
        telefones: telefones
      };
      if (isEditing) {
        await api.put(`${API_URL}/${formData.id}`, dataToSend);
      } else {
        await api.post(API_URL, dataToSend);
      }
      resetForm();
      fetchClientes();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar cliente');
      console.error(err);
    }
  };

  const handleEdit = (cliente) => {
    setFormData({
      id: cliente.id,
      nome: cliente.nome,
      cpf: cliente.cpf,
      rua: cliente.rua || '',
      numero: cliente.numero || '',
      debito: cliente.debito || '0',
      nascimento: cliente.nascimento,
      bairroId: cliente.bairroId || cliente.bairro?.id || ''
    });
    // Load phones
    if (cliente.telefones && cliente.telefones.length > 0) {
      setTelefones(cliente.telefones.map(t => ({ numero: t.numero })));
    } else {
      setTelefones([]);
    }
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`${API_URL}/${id}`);
        fetchClientes();
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao excluir cliente');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getBairroNome = (bairroId) => {
    const bairro = bairros.find(b => b.id === bairroId);
    return bairro ? bairro.nome : '-';
  };

  const formatTelefones = (telefonesArr) => {
    if (!telefonesArr || telefonesArr.length === 0) return '-';
    return telefonesArr.map(t => t.numero).join(', ');
  };

  return (
    <div>
      <div className="form-panel">
        <h3>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="nome" className="form-label">Nome *</label>
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
              <label htmlFor="cpf" className="form-label">CPF *</label>
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
              <label htmlFor="nascimento" className="form-label">Data de Nascimento *</label>
              <input
                type="date"
                className="form-control"
                id="nascimento"
                name="nascimento"
                value={formData.nascimento}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="rua" className="form-label">Rua *</label>
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
              <label htmlFor="numero" className="form-label">Número *</label>
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
              <label htmlFor="bairroId" className="form-label">Bairro *</label>
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
            <div className="col-md-3">
              <label htmlFor="debito" className="form-label">Débito (R$)</label>
              <input
                type="number"
                className="form-control"
                id="debito"
                name="debito"
                placeholder="0.00"
                value={formData.debito}
                onChange={handleInputChange}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Phones Section */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Telefones *</label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="(00) 00000-0000"
                  value={telefoneToAdd}
                  onChange={(e) => setTelefoneToAdd(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTelefone}
                >
                  <FaPlus />
                </button>
              </div>
              {telefones.length > 0 && (
                <div className="mt-2">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th><FaPhone /> Telefone</th>
                        <th style={{ width: '60px' }}>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {telefones.map((tel, index) => (
                        <tr key={index}>
                          <td>{tel.numero}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveTelefone(index)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
        <h3>Lista de Clientes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefones</th>
              <th>Bairro</th>
              <th>Débito</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(cliente => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{formatTelefones(cliente.telefones)}</td>
                <td>{cliente.bairro?.nome || getBairroNome(cliente.bairroId)}</td>
                <td>{formatCurrency(cliente.debito)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(cliente)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">Nenhum cliente cadastrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClienteManager;