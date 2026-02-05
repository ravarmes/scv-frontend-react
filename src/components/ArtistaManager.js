import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa';

const API_URL = '/artistas';

const ArtistaManager = () => {
    const [artistas, setArtistas] = useState([]);
    const [formData, setFormData] = useState({
        id: null,
        nome: '',
        imagem: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchArtistas();
    }, []);

    const fetchArtistas = async () => {
        try {
            const response = await api.get(API_URL);
            setArtistas(response.data);
        } catch (err) {
            setError('Erro ao carregar artistas');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setFormData({ ...formData, imagem: base64String });
                setPreviewImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            nome: '',
            imagem: ''
        });
        setIsEditing(false);
        setError('');
        setPreviewImage('');
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
            fetchArtistas();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar artista');
            console.error(err);
        }
    };

    const handleEdit = (artista) => {
        setFormData({
            id: artista.id,
            nome: artista.nome,
            imagem: artista.imagem || ''
        });
        // Add base64 prefix if image exists and doesn't already have it
        const imgPreview = artista.imagem ?
            (artista.imagem.startsWith('data:') ? artista.imagem : 'data:image/png;base64,' + artista.imagem) : '';
        setPreviewImage(imgPreview);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este artista?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchArtistas();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir artista');
                console.error(err);
            }
        }
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Artista' : 'Novo Artista'}</h3>
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
                                placeholder="Digite o nome do artista"
                                value={formData.nome}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="imagem" className="form-label">Imagem</label>
                            <input
                                type="file"
                                className="form-control"
                                id="imagem"
                                name="imagem"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                    {previewImage && (
                        <div className="row mb-3">
                            <div className="col-md-12">
                                <label className="form-label">Preview:</label>
                                <div>
                                    <img
                                        src={previewImage}
                                        alt="Preview"
                                        style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '5px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
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
                <h3>Lista de Artistas</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Imagem</th>
                            <th>Nome</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {artistas.map(artista => (
                            <tr key={artista.id}>
                                <td>{artista.id}</td>
                                <td>
                                    {artista.imagem ? (
                                        <img
                                            src={artista.imagem.startsWith('data:') ? artista.imagem : 'data:image/png;base64,' + artista.imagem}
                                            alt={artista.nome}
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                                        />
                                    ) : (
                                        <FaImage style={{ fontSize: '30px', color: '#ccc' }} />
                                    )}
                                </td>
                                <td>{artista.nome}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleEdit(artista)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(artista.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {artistas.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">Nenhum artista cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ArtistaManager;
