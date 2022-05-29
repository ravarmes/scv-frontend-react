import React, { Component } from 'react'
import consts from '../../consts'
import axios from 'axios'
import Main from '../template/Main'
import { toast } from 'react-toastify'


const headerProps = {
    icon: 'map',
    title: 'UFs',
    subtitle: 'Cadastro de ufs: Incluir, Listar, Alterar e Excluir!'
}

const baseUrl = `${consts.API_URL}/ufs`

const initialState = {
    uf: { sigla: '', nome: '' },
    list: []
}

export default class UFCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data })
        })
    }

    findAllUFs(){
        axios(baseUrl).then(resp => {
            this.setState({ list: resp.data })
        })
    }

    updateField(event) {
        const uf = { ...this.state.uf }
        uf[event.target.name] = event.target.value
        this.setState({ uf })
    }

    handleButtonSalvar() {
        const uf = this.state.uf
        const method = uf.id ? 'put' : 'post'
        const url = uf.id ? `${baseUrl}/${uf.id}` : baseUrl
        axios[method](url, uf)
            .then(resp => {
                this.findAllUFs();
                this.setState({ uf: initialState.uf})
                toast.success('UF cadastrada/alterada com sucesso!')
            }).catch(error => {
                const stringError = error.response.data;
                alert(stringError['message'])
                toast.error(stringError['message'])
            })
    }

    handleButtonCancelar() {
        this.setState({ uf: initialState.uf })
    }

    handleButtonAlterar(uf) {
        this.setState({ uf })
    }

    handleButtonRemover(uf) {
        axios.delete(`${baseUrl}/${uf.id}`).then(resp => {
            this.findAllUFs();
        })
    }

    renderForm() {
        return (
            <div className="form">
                <div className="row">
                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Sigla</label>
                            <input type="text" className="form-control"
                                name="sigla"
                                value={this.state.uf.sigla}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite a sigla..." />
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <div className="form-group">
                            <label>Nome</label>
                            <input type="text" className="form-control"
                                name="nome"
                                value={this.state.uf.nome}
                                onChange={e => this.updateField(e)}
                                placeholder="Digite o nome..." />
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
                        <th>Sigla</th>
                        <th>Nome</th>
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
        return this.state.list.map(uf => {
            return (
                <tr key={uf.id}>
                    <td>{uf.id}</td>
                    <td>{uf.sigla}</td>
                    <td>{uf.nome}</td>
                    <td>
                        <button className="btn btn-warning"
                            onClick={() => this.handleButtonAlterar(uf)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.handleButtonRemover(uf)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </td>
                </tr>
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