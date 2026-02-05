import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaEdit, FaTrash, FaSave, FaTimes, FaImage, FaPlus } from 'react-icons/fa';

const API_URL = '/filmes';
const TIPOS_API_URL = '/tiposdefilme';
const DIRETORES_API_URL = '/diretores';
const ARTISTAS_API_URL = '/artistas';

const FilmeManager = () => {
    const [filmes, setFilmes] = useState([]);
    const [tiposDeFilme, setTiposDeFilme] = useState([]);
    const [diretoresDisponiveis, setDiretoresDisponiveis] = useState([]);
    const [artistasDisponiveis, setArtistasDisponiveis] = useState([]);

    const [formData, setFormData] = useState({
        id: null,
        titulo: '',
        genero: '',
        duracao: '',
        imagem: '',
        tipoDeFilmeId: ''
    });

    // State for directors and participations
    const [selectedDiretores, setSelectedDiretores] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);
    const [diretorToAdd, setDiretorToAdd] = useState('');
    const [artistaToAdd, setArtistaToAdd] = useState('');
    const [personagemToAdd, setPersonagemToAdd] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchFilmes();
        fetchTiposDeFilme();
        fetchDiretores();
        fetchArtistas();
    }, []);

    const fetchFilmes = async () => {
        try {
            const response = await api.get(API_URL);
            setFilmes(response.data);
        } catch (err) {
            setError('Erro ao carregar filmes');
            console.error(err);
        }
    };

    const fetchTiposDeFilme = async () => {
        try {
            const response = await api.get(TIPOS_API_URL);
            setTiposDeFilme(response.data);
        } catch (err) {
            console.error('Erro ao carregar tipos de filme', err);
        }
    };

    const fetchDiretores = async () => {
        try {
            const response = await api.get(DIRETORES_API_URL);
            setDiretoresDisponiveis(response.data);
        } catch (err) {
            console.error('Erro ao carregar diretores', err);
        }
    };

    const fetchArtistas = async () => {
        try {
            const response = await api.get(ARTISTAS_API_URL);
            setArtistasDisponiveis(response.data);
        } catch (err) {
            console.error('Erro ao carregar artistas', err);
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

    // Directors management
    const handleAddDiretor = () => {
        if (!diretorToAdd) return;
        const diretor = diretoresDisponiveis.find(d => d.id === parseInt(diretorToAdd));
        if (diretor && !selectedDiretores.find(d => d.id === diretor.id)) {
            setSelectedDiretores([...selectedDiretores, diretor]);
        }
        setDiretorToAdd('');
    };

    const handleRemoveDiretor = (diretorId) => {
        setSelectedDiretores(selectedDiretores.filter(d => d.id !== diretorId));
    };

    // Participations management
    const handleAddParticipacao = () => {
        if (!artistaToAdd || !personagemToAdd.trim()) {
            setError('Selecione um artista e informe o personagem');
            return;
        }
        const artista = artistasDisponiveis.find(a => a.id === parseInt(artistaToAdd));
        if (artista) {
            const novaParticipacao = {
                artista: { id: artista.id, nome: artista.nome },
                personagem: personagemToAdd.trim()
            };
            setParticipacoes([...participacoes, novaParticipacao]);
            setArtistaToAdd('');
            setPersonagemToAdd('');
            setError('');
        }
    };

    const handleRemoveParticipacao = (index) => {
        setParticipacoes(participacoes.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData({
            id: null,
            titulo: '',
            genero: '',
            duracao: '',
            imagem: '',
            tipoDeFilmeId: ''
        });
        setSelectedDiretores([]);
        setParticipacoes([]);
        setDiretorToAdd('');
        setArtistaToAdd('');
        setPersonagemToAdd('');
        setIsEditing(false);
        setError('');
        setPreviewImage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedDiretores.length === 0) {
            setError('Adicione pelo menos um diretor');
            return;
        }
        if (participacoes.length === 0) {
            setError('Adicione pelo menos uma participação (artista/personagem)');
            return;
        }

        try {
            const tipoDeFilme = tiposDeFilme.find(t => t.id === parseInt(formData.tipoDeFilmeId));
            const dataToSend = {
                titulo: formData.titulo,
                genero: formData.genero,
                duracao: formData.duracao,
                imagem: formData.imagem,
                tipoDeFilme: tipoDeFilme,
                diretores: selectedDiretores,
                participacoes: participacoes
            };

            if (isEditing) {
                await api.put(`${API_URL}/${formData.id}`, dataToSend);
            } else {
                await api.post(API_URL, dataToSend);
            }
            resetForm();
            fetchFilmes();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.err || 'Erro ao salvar filme');
            console.error(err);
        }
    };

    const handleEdit = (filme) => {
        setFormData({
            id: filme.id,
            titulo: filme.titulo,
            genero: filme.genero,
            duracao: filme.duracao,
            imagem: filme.imagem || '',
            tipoDeFilmeId: filme.tipoDeFilmeId || filme.tipoDeFilme?.id || ''
        });

        // Load directors
        if (filme.diretores) {
            setSelectedDiretores(filme.diretores);
        } else {
            setSelectedDiretores([]);
        }

        // Load participations
        if (filme.participacoes) {
            setParticipacoes(filme.participacoes.map(p => ({
                artista: p.artista || { id: p.artistaId },
                personagem: p.personagem
            })));
        } else {
            setParticipacoes([]);
        }

        const imgPreview = filme.imagem ?
            (filme.imagem.startsWith('data:') ? filme.imagem : 'data:image/png;base64,' + filme.imagem) : '';
        setPreviewImage(imgPreview);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este filme?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchFilmes();
            } catch (err) {
                setError(err.response?.data?.message || 'Erro ao excluir filme');
                console.error(err);
            }
        }
    };

    const getTipoNome = (tipoId) => {
        const tipo = tiposDeFilme.find(t => t.id === tipoId);
        return tipo ? tipo.nome : '-';
    };

    return (
        <div>
            <div className="form-panel">
                <h3>{isEditing ? 'Editar Filme' : 'Novo Filme'}</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {/* Basic Info Row */}
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="titulo" className="form-label">Título *</label>
                            <input
                                type="text"
                                className="form-control"
                                id="titulo"
                                name="titulo"
                                placeholder="Digite o título do filme"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="genero" className="form-label">Gênero *</label>
                            <input
                                type="text"
                                className="form-control"
                                id="genero"
                                name="genero"
                                placeholder="Ex: Ação, Comédia, Drama"
                                value={formData.genero}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="duracao" className="form-label">Duração (hh:mm) *</label>
                            <input
                                type="text"
                                className="form-control"
                                id="duracao"
                                name="duracao"
                                placeholder="Ex: 02:30"
                                value={formData.duracao}
                                onChange={handleInputChange}
                                pattern="[0-9]{2}:[0-9]{2}"
                                required
                            />
                        </div>
                    </div>

                    {/* Type and Image Row */}
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label htmlFor="tipoDeFilmeId" className="form-label">Tipo de Filme *</label>
                            <select
                                className="form-select"
                                id="tipoDeFilmeId"
                                name="tipoDeFilmeId"
                                value={formData.tipoDeFilmeId}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione um tipo</option>
                                {tiposDeFilme.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nome} (R$ {tipo.preco?.toFixed(2)} - {tipo.prazo} dias)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="imagem" className="form-label">Imagem (Capa) *</label>
                            <input
                                type="file"
                                className="form-control"
                                id="imagem"
                                name="imagem"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <div className="col-md-4">
                            {previewImage && (
                                <div>
                                    <label className="form-label">Preview:</label>
                                    <div>
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '5px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Directors Section */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Diretores *</label>
                            <div className="d-flex gap-2">
                                <select
                                    className="form-select"
                                    value={diretorToAdd}
                                    onChange={(e) => setDiretorToAdd(e.target.value)}
                                >
                                    <option value="">Selecione um diretor</option>
                                    {diretoresDisponiveis
                                        .filter(d => !selectedDiretores.find(sd => sd.id === d.id))
                                        .map(diretor => (
                                            <option key={diretor.id} value={diretor.id}>
                                                {diretor.nome}
                                            </option>
                                        ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddDiretor}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                            {selectedDiretores.length > 0 && (
                                <div className="mt-2">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Diretor</th>
                                                <th style={{ width: '60px' }}>Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedDiretores.map(diretor => (
                                                <tr key={diretor.id}>
                                                    <td>{diretor.nome}</td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleRemoveDiretor(diretor.id)}
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

                        {/* Participations Section */}
                        <div className="col-md-6">
                            <label className="form-label">Participações (Artistas) *</label>
                            <div className="d-flex gap-2 mb-2">
                                <select
                                    className="form-select"
                                    value={artistaToAdd}
                                    onChange={(e) => setArtistaToAdd(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">Selecione um artista</option>
                                    {artistasDisponiveis.map(artista => (
                                        <option key={artista.id} value={artista.id}>
                                            {artista.nome}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Personagem"
                                    value={personagemToAdd}
                                    onChange={(e) => setPersonagemToAdd(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAddParticipacao}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                            {participacoes.length > 0 && (
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Artista</th>
                                            <th>Personagem</th>
                                            <th style={{ width: '60px' }}>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participacoes.map((p, index) => (
                                            <tr key={index}>
                                                <td>{p.artista.nome || artistasDisponiveis.find(a => a.id === p.artista.id)?.nome}</td>
                                                <td>{p.personagem}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleRemoveParticipacao(index)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                <h3>Lista de Filmes</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Capa</th>
                            <th>Título</th>
                            <th>Gênero</th>
                            <th>Duração</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filmes.map(filme => (
                            <tr key={filme.id}>
                                <td>{filme.id}</td>
                                <td>
                                    {filme.imagem ? (
                                        <img
                                            src={filme.imagem.startsWith('data:') ? filme.imagem : 'data:image/png;base64,' + filme.imagem}
                                            alt={filme.titulo}
                                            style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '3px' }}
                                        />
                                    ) : (
                                        <FaImage style={{ fontSize: '30px', color: '#ccc' }} />
                                    )}
                                </td>
                                <td>{filme.titulo}</td>
                                <td>{filme.genero}</td>
                                <td>{filme.duracao}</td>
                                <td>{getTipoNome(filme.tipoDeFilmeId)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() => handleEdit(filme)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(filme.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filmes.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center">Nenhum filme cadastrado</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FilmeManager;
