import React, { Component } from 'react'
import consts from '../../consts'
import axios from 'axios'
import Main from '../template/Main'
import { toast } from 'react-toastify'

const headerProps = {
    icon: 'map',
    title: 'Bairros',
    subtitle: 'Cadastro de bairros: Incluir, Listar, Alterar e Excluir!'
}

const baseUrlBairros = `${consts.API_URL}/bairros`
const baseUrlUfs = `${consts.API_URL}/ufs`
const baseUrlCidades = `${consts.API_URL}/cidades`


const initialState = {
    bairro: { nome: '', cidade: { id: 0, nome: '', uf: { id: 0, sigla: '', nome: '' } } },
    list_bairros: [],
    list_cidades: [],
    list_ufs: []
}

export default class CidadeCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrlBairros).then(resp => {
            this.setState({ list_bairros: resp.data })
        })
        axios(baseUrlUfs).then(resp => {
            this.setState({ list_ufs: resp.data });
        })
    }

    findAllBairros(){
        axios(baseUrlBairros).then(resp => {
            this.setState({ list_bairros: resp.data })
        })
    }

    findCidadesByUf(uf) {
        axios(`${baseUrlCidades}/findByUf/${uf.id}`).then(resp => {
            this.setState({ list_cidades: resp.data });
        })
    }

    handleButtonSalvar() {
        const bairro = this.state.bairro
        const method = bairro.id ? 'put' : 'post'
        const url = bairro.id ? `${baseUrlBairros}/${bairro.id}` : baseUrlBairros
        axios[method](url, bairro)
            .then(resp => {
                this.findAllBairros();
                this.setState({ bairro: initialState.bairro })
                toast.success('Bairro cadastrado/alterado com sucesso!')
            }).catch(error => {
                const stringError = error.response.data;
                toast.error(stringError['message'])
            })
    }

    handleButtonCancelar() {
        this.setState({ bairro: initialState.bairro });
        this.setState({ list_cidades: initialState.list_cidades });
    }

    handleButtonAlterar(bairro) {
        this.setState({ bairro });
        this.findCidadesByUf(bairro.cidade.uf);
    }

    handleButtonRemover(bairro) {
        axios.delete(`${baseUrlBairros}/${bairro.id}`).then(resp => {
            this.findAllBairros()
        })
    }

    updateField(event) {
        const bairro = { ...this.state.bairro }
        bairro[event.target.name] = event.target.value
        this.setState({ bairro })
    }

    handleSelectUfs(event) {
        var select = document.getElementById('select_ufs');
        const uf = this.state.list_ufs[select.selectedIndex];
        this.setStateUF(uf);
        this.findCidadesByUf(uf);
    }

    handleSelectCidades(event) {
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

    setStateUF(uf) {
        this.setState((state) => {
            const bairro = { ...state.bairro };
            bairro.cidade['uf'] = uf;
            return { bairro: bairro }
        });
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-md-12">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" className="form-control"
                                name="nome"
                                value={this.state.bairro.nome}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome..." />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>UF</label>
                            <select className="form-control"
                                id="select_ufs"
                                name="uf"
                                value={this.state.bairro.cidade.uf.id}
                                onChange={e => this.handleSelectUfs(e)}
                                placeholder="Escolha a UF...">
                                {this.renderOptionsUfs()}
                            </select>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Cidade</label>
                            <select className="form-control"
                                id="select_cidades"
                                name="cidade"
                                value={this.state.bairro.cidade.id}
                                onChange={e => this.handleSelectCidades(e)}
                                placeholder="Escolha a Cidade...">
                                {this.renderOptionsCidades()}
                            </select>
                        </div>
                    </div>
                </div>

                <hr />
                <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                        <button className="btn btn-primary"
                            onClick={e => this.handleButtonSalvar(e)}>
                            Salvar
                        </button>

                        <button className="btn btn-secondary ml-2"
                            onClick={e => this.handleButtonCancelar(e)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    renderTable() {
        return (
            <table className="table mt-4">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cidade</th>
                        <th>UF</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderRows()}
                </tbody>
            </table>
        )
    }

    renderRows() {
        return this.state.list_bairros.map(bairro => {
            return (
                <tr key={bairro.id}>
                    <td>{bairro.id}</td>
                    <td>{bairro.nome}</td>
                    <td>{bairro.cidade.nome}</td>
                    <td>{bairro.cidade.uf.nome}</td>
                    <td>
                        <button className="btn btn-warning"
                            onClick={() => this.handleButtonAlterar(bairro)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.handleButtonRemover(bairro)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }

    renderOptionsUfs() {
        return this.state.list_ufs.map((uf, i = 0) => {
            return (
                <option key={i} value={uf.id} selected={(uf.id === this.state.bairro.cidade.uf.id) ? 'true' : 'false'} >{uf.sigla}</option>
            )
        })
    }

    renderOptionsCidades() {
        return this.state.list_cidades.map((cidade, i = 0) => {
            return (
                <option key={i} value={cidade.id} selected={(cidade.id === this.state.bairro.cidade.id) ? 'true' : 'false'} >{cidade.nome}</option>
            )
        })
    }

    render() {
        return (
            <Main {...headerProps}>
                {this.renderForm()}
                {this.renderTable()}
            </Main>
        )
    }
}