import React, { Component } from 'react'
import consts from '../../consts'
import axios from 'axios'
import Main from '../template/Main'
import { toast } from 'react-toastify'

const headerProps = {
    icon: 'map',
    title: 'Filmes',
    subtitle: 'Cadastro de filmes: Incluir, Listar, Alterar e Excluir!'
}

const baseUrlFilmes = `${consts.API_URL}/filmes`
const baseUrlTiposDeFilme = `${consts.API_URL}/tiposdefilme`
const baseUrlDiretores = `${consts.API_URL}/diretores`
const baseUrlArtistas = `${consts.API_URL}/artistas`


const initialState = {
    filme: { id: 0, titulo: '', genero: '', duracao: '', tipoDeFilme: {'id': 0}, imagem: '', diretores: [], participacoes: [] },
    list_tiposdefilme: [],
    list_diretores: [],
    list_artistas: [],
    list_participacoes: [],
    list_filmes: [],
    idDiretor: 0,
    idArtista: 0
}

export default class FilmeCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrlTiposDeFilme).then(resp => {
            this.setState({ list_tiposdefilme: resp.data })
        })
        axios(baseUrlDiretores).then(resp => {
            this.setState({ list_diretores: resp.data });
        })
        axios(baseUrlArtistas).then(resp => {
            this.setState({ list_artistas: resp.data });
        })
        axios(baseUrlFilmes).then(resp => {
            this.setState({ list_filmes: resp.data })
        })
    }

    load(filme) {
        this.setState({ filme });
    }


    clear() {
        this.setState({ filme: initialState.filme });
        this.setState({ list_tiposdefilme: initialState.list_tiposdefilme });
        this.setState({ list_diretores: initialState.list_diretores });
        this.setState({ list_artistas: initialState.list_artistas });
    }

    save() {
        const filme = this.state.filme
        const method = filme.id ? 'put' : 'post'
        const url = filme.id ? `${baseUrlFilmes}/${filme.id}` : baseUrlFilmes
        axios[method](url, filme)
            .then(resp => {
                this.findAll();
                this.setState({ filme: initialState.filme})
                toast.success('Filme cadastrado/alterado com sucesso!')
            }).catch(error => {
                const stringError = error.response.data;
                toast.error(stringError['message'])
            })
        const inputFile = document.getElementById('imagem');
        inputFile.value = ""
    }

    delete(filme) {
        axios.delete(`${baseUrlFilmes}/${filme.id}`).then(resp => {
            //const list_filmes = this.getUpdatedList(filme, false)
            //this.setState({ list_filmes })
            this.findAll();
        })
    }

    getUpdatedList(filme, add = true) {
        const list_filmes = this.state.list_filmes.filter(f => f.id !== filme.id)
        if (add) list_filmes.unshift(filme)
        return list_filmes
    }

    findAll(){
        axios(baseUrlFilmes).then(resp => {
            this.setState({ list_filmes: resp.data })
        })
    }


    handleInputText(event) {
        console.log("handleInputText")
        const filme = { ...this.state.filme }
        console.log("filme: ", filme)
        filme[event.target.name] = event.target.value
        this.setState({ filme })
    }

    handleInputFile(event) {
        const filme = this.state.filme;
        var strBase64;
        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onloadend = function () {
            strBase64 = reader.result;
            if (strBase64.indexOf("png") > -1) {
                strBase64 = strBase64.slice(22); //removendo: "data:image/png;base64,"
            } else if (strBase64.indexOf("jpeg") > -1) {
                strBase64 = strBase64.slice(23); //removendo: "data:image/jpeg;base64,"
            } else {
                alert("A imagem não é válida!");
            }
            filme['imagem'] = strBase64;
        }
        
        reader.readAsDataURL(file);
    }

    handleSelectTipoDeFilme(event) {
        const select = document.getElementById('select_tiposdefilme');
        const tipoDeFilme = this.state.list_tiposdefilme[select.selectedIndex];
        this.setStateTipoDeFilme(tipoDeFilme);
    }

    handleButtonAdicionarDiretor = (event) => {
        const select = document.getElementById('select_diretores');
        const diretor = this.state.list_diretores[select.selectedIndex];
        this.setStateDiretores([...this.state.filme.diretores, diretor]);
    }

    handleButtonRemoverDiretor(d) {
        const diretores = this.state.filme.diretores.filter(diretor => diretor !== d)
        this.setStateDiretores(diretores);
    }

    handleButtonAdicionarParticipacao = (event) => {
        const inputs = document.getElementsByName('personagem');
        const personagem = inputs[0].value;
        inputs[0].value = "";
        const select = document.getElementById('select_artistas');
        const artista = this.state.list_artistas[select.selectedIndex];

        var participacao = {personagem: '', artista: null};
        participacao['personagem'] = personagem
        participacao['artista'] = artista
        this.setStateParticipacoes([...this.state.filme.participacoes, participacao]);
    }

    handleButtonRemoverParticipacao(p) {
        //const participacoes = this.state.filme.participacoes.filter(participacao => participacao.id !== p.id)
        const participacoes = this.state.filme.participacoes.filter(participacao => participacao !== p)
        this.setStateParticipacoes(participacoes);
    }

    setStateTipoDeFilme(tipoDeFilme) {
        this.setState((state) => {
            const filme = { ...state.filme };
            filme['tipoDeFilme'] = tipoDeFilme;
            return { filme: filme }
        });
    }

    setStateDiretores(diretores) {
        this.setState((state) => {
            const filme = { ...state.filme };
            filme['diretores'] = diretores;
            return { filme: filme }
        });
    }

    setStateParticipacoes(participacoes) {
        this.setState((state) => {
            const filme = { ...state.filme };
            filme['participacoes'] = participacoes;
            return { filme: filme }
        });
    }

    setStateImagem(imagem) {
        this.setState((state) => {
            const filme = { ...state.filme };
            filme['imagem'] = imagem;
            return { filme: filme }
        });
    }


    /*

    addSelectDiretores(event) {
        var select = document.getElementById('select_diretores');
        const diretor = this.state.list_diretores[select.selectedIndex];
        this.setStateDiretores(diretor);
    }

    handleButtonAdicionarDiretores = (event) => {
        if (idDiretor !== '') {
          const filme = this.state.filme;
          const diretor = this.state.list_diretores.find(element => element.id === idDiretor);
          filme.diretores = [...filme.diretores, diretor];
        }
    }

    updateSelectCidade(event) {
        var select = document.getElementById('select_cidades');
        const cidade = this.state.list_cidades[select.selectedIndex];
        this.setStateCidade(cidade);
    }

    setStateCidade(cidade) {
        this.setState((state) => {
            const bairro = { ...state.bairro };
            bairro['cidade'] = cidade;
            return { bairro: bairro }
        });
    }

    setStateDiretor(diretor) {
        this.setState((state) => {
            const filme = { ...state.filme };
            bairro.cidade['uf'] = uf;
            return { bairro: bairro }
        });
    }

    */
   
    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Título</label>
                            <input type="text" className="form-control"
                                name="titulo"
                                value={this.state.filme.titulo}
                                onChange={e => this.handleInputText(e)}
                                placeholder="Digite o título..." />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Tipo de Filme</label>
                            <select className="form-control"
                                id="select_tiposdefilme"
                                name="tipoDeFilme"
                                value={this.state.filme.tipoDeFilme.id}
                                onChange={e => this.handleSelectTipoDeFilme(e)}
                                placeholder="Escolha a Tipo de Filme...">
                                {this.renderOptionsTiposDeFilme()}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Gênero</label>
                            <input type="text" className="form-control"
                                name="genero"
                                value={this.state.filme.genero}
                                onChange={e => this.handleInputText(e)}
                                placeholder="Digite o gênero..." />
                        </div>
                    </div>
                    <div className="col-12 col-md-2">
                        <div className="form-group">
                            <label>Duração</label>
                            <input type="text" className="form-control"
                                name="duracao"
                                value={this.state.filme.duracao}
                                onChange={e => this.handleInputText(e)}
                                placeholder="hh:mm" />
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="form-group">
                            <label>Imagem</label>
                            <input type="file" className="form-control"
                                id="imagem"
                                accept="image/*"
                                name="imagem"
                                src={'data:image/png;base64,' + this.state.filme.imagem}
                                //value={'data:image/png;base64,'}
                                onChange={e => this.handleInputFile(e)}
                             />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-3">
                        <div className="form-group">
                            <label>Diretor</label>
                            <select className="form-control"
                                id="select_diretores"
                                name="diretores"
                                placeholder="Escolha o Diretor...">
                                {this.renderOptionsDiretores()}
                            </select>
                        </div>
                    </div>
                    <div className="col-12 col-md-1 d-flex">
                        <div className="form-group">
                            <button  
                                onClick={e => this.handleButtonAdicionarDiretor(e)}>
                                +
                            </button>
                        </div>
                    </div>
                    <div className="col-12 col-md-3">
                        <div className="form-group">
                            <label>Artista</label>
                            <select className="form-control"
                                id="select_artistas"
                                name="artistas"
                                placeholder="Escolha o Artista...">
                                {this.renderOptionsArtirtas()}
                            </select>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="form-group">
                            <label>Personagem</label>
                            <input type="text" className="form-control"
                                name="personagem"
                                onChange={e => this.handleInputText(e)}
                                placeholder="Digite o personagem..." />
                        </div>
                    </div>
                    <div className="col-12 col-md-1">
                        <div className="form-group vertical-center">
                            <button 
                                onClick={e => this.handleButtonAdicionarParticipacao(e)}>
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-md-4">
                        <div className="form-group">
                            {this.renderTableDiretores()}
                        </div>
                    </div>
                    <div className="col-12 col-md-8">
                        <div className="form-group">
                            {this.renderTableParticipacoes()}
                        </div>
                    </div>
                </div>
                
                <hr />
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-primary"
                            onClick={e => this.save(e)}>
                            Salvar
                        </button>

                        <button className="btn btn-secondary ml-2"
                            onClick={e => this.clear(e)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    
    renderTableFilmes() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Gênero</th>
                        <th>Duração</th>
                        <th>Tipo de Filme</th>
                        <th>Imagem</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderTableFilmesRows()}
                </tbody>
            </table>
        )
    }

    renderTableFilmesRows() {
        return this.state.list_filmes.map(filme => {
            return (
                <tr key={filme.id}>
                    <td>{filme.id}</td>
                    <td>{filme.titulo}</td>
                    <td>{filme.genero}</td>
                    <td>{filme.duracao}</td>
                    <td>{filme.tipoDeFilme.nome}</td>
                    <td><img src={'data:image/png;base64,' + filme.imagem} width="35px" height="50px"/></td>
                    <td>
                        <button className="btn btn-warning"
                            onClick={() => this.load(filme)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.delete(filme)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }

    renderTableDiretores() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th>Diretores</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderTableDiretoresRows()}
                </tbody>
            </table>
        )
    }

    renderTableDiretoresRows() {
        return this.state.filme.diretores.map(diretor => {
            return (
                <tr key={diretor.id}>
                    <td>{diretor.nome}</td>
                    <td>
                        <button onClick={() => this.handleButtonRemoverDiretor(diretor)}>-</button>
                    </td>
                </tr>
            )
        })
    }

    renderTableParticipacoes() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th>Participações</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderTableParticipacoesRows()}
                </tbody>
            </table>
        )
    }

    renderTableParticipacoesRows() {
        return this.state.filme.participacoes.map(participacao => {
            return (
                <tr key={participacao.id}>
                    <td>{participacao.artista.nome}</td>
                    <td>{participacao.personagem}</td>
                    <td >
                        <button onClick={() => this.handleButtonRemoverParticipacao(participacao)} justify-content='left'>-</button>
                    </td>
                </tr>
            )
        })
    }
    
    renderOptionsTiposDeFilme() {
        return this.state.list_tiposdefilme.map((tipoDeFilme, i = 0) => {
            return (
                <option key={i} value={tipoDeFilme.id} selected={(tipoDeFilme.id === this.state.filme.tipoDeFilme.id) ? 'true' : 'false'} >{tipoDeFilme.nome}</option>
            )
        })
    }

    renderOptionsDiretores() {
        return this.state.list_diretores.map((diretor, i = 0) => {
            return (
                <option key={i} value={diretor.id} >{diretor.nome}</option>
            )
        })
    }

    renderOptionsArtirtas() {
        return this.state.list_artistas.map((artista, i = 0) => {
            return (
                <option key={i} value={artista.id} >{artista.nome}</option>
            )
        })
    }

    render() {
        return (
            <Main {...headerProps}>
                {this.renderForm()}
                {this.renderTableFilmes()}
            </Main>
        )
    }
}