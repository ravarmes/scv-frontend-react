import React, { Component } from 'react'
import axios from 'axios'
import Main from '../template/Main'

const headerProps = {
    icon: 'map',
    title: 'Cidades',
    subtitle: 'Cadastro de cidades: Incluir, Listar, Alterar e Excluir!'
}

const baseUrl = 'http://localhost:8080/cidades'
const baseUrlUfs = 'http://localhost:8080/ufs'

//const baseUrl = 'https://scv-backend-spring.herokuapp.com/cidades'
//const baseUrlUfs = 'https://scv-backend-spring.herokuapp.com/ufs'

const initialState = {
    cidade: { nome: '', uf: { id: 0, sigla: '', nome: '' } },
    list_cidades: [],
    list_ufs: [],
}

export default class CidadeCrud extends Component {

    state = { ...initialState }

    componentWillMount() {
        axios(baseUrl).then(resp => {
            this.setState({ list_cidades: resp.data })
        })
        axios(baseUrlUfs).then(resp => {
            this.setState({ list_ufs: resp.data })
        })
    }

    clear() {
        this.setState({ cidade: initialState.cidade })
    }

    save() {
        console.log('save(): cidade: ', JSON.stringify(this.state.cidade));
        const cidade = { ...this.state.cidade }
        const method = cidade.id ? 'put' : 'post'
        const url = cidade.id ? `${baseUrl}/${cidade.id}` : baseUrl
        axios[method](url, cidade)
            .then(resp => {
                const list_cidades = this.getUpdatedList(resp.data)
                this.setState({ cidade: initialState.cidade, list_cidades })
            })
    }

    getUpdatedList(cidade, add = true) {
        const list_cidades = this.state.list_cidades.filter(c => c.id !== cidade.id)
        if (add) list_cidades.unshift(cidade)
        return list_cidades
    }

    updateField(event) {
        const cidade = { ...this.state.cidade }
        cidade[event.target.name] = event.target.value
        this.setState({ cidade })
    }

    updateSelectUf(event) {
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
                                onChange={e => this.updateSelectUf(e)}
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

    load(cidade) {
        this.setState({ cidade });
    }

    remove(cidade) {
        axios.delete(`${baseUrl}/${cidade.id}`).then(resp => {
            const list_cidades = this.getUpdatedList(cidade, false)
            this.setState({ list_cidades })
        })
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
                            onClick={() => this.load(cidade)}>
                            <i className="fa fa-pencil"></i>
                        </button>
                        <button className="btn btn-danger ml-2"
                            onClick={() => this.remove(cidade)}>
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
                <option key={i} value={uf.id} selected={(uf.id === this.state.cidade.uf.id) ? 'true' : 'false'} >{uf.sigla}</option>
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