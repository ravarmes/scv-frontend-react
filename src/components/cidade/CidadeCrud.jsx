import React, { Component } from 'react'
import consts from '../../consts'
import axios from 'axios'
import Main from '../template/Main'
import { toast } from 'react-toastify'

const headerProps = {
    icon: 'map',
    title: 'Cidades',
    subtitle: 'Cadastro de cidades: Incluir, Listar, Alterar e Excluir!'
}

const baseUrlCidades = `${consts.API_URL}/cidades`
const baseUrlUfs = `${consts.API_URL}/ufs`

const initialState = {
    cidade: { nome: '', uf: { id: 0, sigla: '', nome: '' } },
    list_cidades: [],
    list_ufs: [],
}

export default class CidadeCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrlCidades).then(resp => {
            this.setState({ list_cidades: resp.data })
        })
        axios(baseUrlUfs).then(resp => {
            this.setState({ list_ufs: resp.data })
        })
    }

    findAllCidades(){
        axios(baseUrlCidades).then(resp => {
            this.setState({ list_cidades: resp.data })
        })
    }

    handleButtonSalvar() {
        const cidade = { ...this.state.cidade }
        const method = cidade.id ? 'put' : 'post'
        const url = cidade.id ? `${baseUrlCidades}/${cidade.id}` : baseUrlCidades
        axios[method](url, cidade)
            .then(resp => {
                this.findAllCidades();
                this.setState({ cidade: initialState.cidade })
                toast.success('Cidade cadastrada/alterada com sucesso!')
            }).catch(error => {
                const stringError = error.response.data;
                toast.error(stringError['message'])
            })
    }

    handleButtonCancelar() {
        this.setState({ cidade: initialState.cidade })
    }

    handleButtonAlterar(cidade) {
        this.setState({ cidade })
    }

    handleButtonRemover(cidade) {
        axios.delete(`${baseUrlCidades}/${cidade.id}`).then(resp => {
            this.findAllCidades()
        })
    }

    updateField(event) {
        const cidade = { ...this.state.cidade }
        cidade[event.target.name] = event.target.value
        this.setState({ cidade })
    }

    handleSelectUf(event) {
        var select = document.getElementById('selectufs');
        const cidade = { ...this.state.cidade };
        cidade['uf'] = this.state.list_ufs[select.selectedIndex];
        this.setState({ cidade });
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" className="form-control"
                                name="nome"
                                value={this.state.cidade.nome}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome..." />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>UF</label>
                            <select className="form-control"
                                id="selectufs"
                                value={this.state.cidade.uf.id}
                                name="uf"
                                onChange={e => this.handleSelectUf(e)}
                                placeholder="Escolha a UF...">
                                {this.renderOptions()}
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
        return this.state.list_cidades.map(cidade => {
            return (
                <tr key={cidade.id}>
                    <td>{cidade.id}</td>
                    <td>{cidade.nome}</td>
                    <td>{cidade.uf.nome}</td>
                    <td>
                        <button className="btn btn-warning"
                            onClick={() => this.handleButtonAlterar(cidade)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.handleButtonRemover(cidade)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
            )
        })
    }

    renderOptions() {
        return this.state.list_ufs.map((uf, i = 0) => {
            return (
                //<option key={i} value={uf.id} selected={(uf.id === this.state.cidade.uf.id) ? 'true' : 'false'} >{uf.sigla}</option>
                <option key={i} value={uf.id}> {uf.sigla} </option>
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