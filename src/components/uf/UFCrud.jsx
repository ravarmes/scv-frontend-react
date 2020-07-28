import React, { Component } from 'react'
import axios from 'axios'
import Main from '../template/Main'

const headerProps = {
    icon: 'map',
    title: 'UFs',
    subtitle: 'Cadastro de ufs: Incluir, Listar, Alterar e Excluir!'
}

const baseUrl = 'http://localhost:8080/ufs'

//const baseUrl = 'https://scv-backend-spring.herokuapp.com/ufs'

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

    clear() {
        this.setState({ uf: initialState.uf })
    }

    save() {
        const uf = this.state.uf
        const method = uf.id ? 'put' : 'post'
        const url = uf.id ? `${baseUrl}/${uf.id}` : baseUrl
        axios[method](url, uf)
            .then(resp => {
                const list = this.getUpdatedList(resp.data)
                this.setState({ uf: initialState.uf, list })
            })
    }

    getUpdatedList(uf, add = true) {
        const list = this.state.list.filter(u => u.id !== uf.id)
        if (add) list.unshift(uf)
        return list
    }

    updateField(event) {
        const uf = { ...this.state.uf }
        uf[event.target.name] = event.target.value
        this.setState({ uf })
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

    load(uf) {
        this.setState({ uf })
    }

    remove(uf) {
        axios.delete(`${baseUrl}/${uf.id}`).then(resp => {
            const list = this.getUpdatedList(uf, false)
            this.setState({ list })
        })
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
                            onClick={() => this.load(uf)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(uf)}>
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