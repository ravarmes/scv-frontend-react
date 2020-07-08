import './Nav.css'
import React from 'react'
import { Link } from 'react-router-dom'

export default props =>
    <aside className="menu-area">
        <nav className="menu">
            <Link to="/">
                <i className="fa fa-home"></i> Início
            </Link>
            <Link to="/ufs">
                <i className="fa fa-map"></i> UFs
            </Link>
            <Link to="/cidades">
                <i className="fa fa-map"></i> Cidades
            </Link>
            <Link to="/bairros">
                <i className="fa fa-map"></i> Bairros
            </Link>
        </nav>
    </aside>