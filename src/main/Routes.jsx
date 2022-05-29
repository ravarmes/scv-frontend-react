import React from 'react'
import { Switch, Route, Redirect } from 'react-router'

import Home from '../components/home/Home'
import UFCrud from '../components/uf/UFCrud'
import CidadeCrud from '../components/cidade/CidadeCrud'
import BairroCrud from '../components/bairro/BairroCrud'
import FilmeCrud from '../components/filme/FilmeCrud'

export default props => 
    <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/ufs' component={UFCrud} />
        <Route path='/cidades' component={CidadeCrud} />
        <Route path='/bairros' component={BairroCrud} />
        <Route path='/filmes' component={FilmeCrud} />
        <Redirect from='*' to='/' />
    </Switch>