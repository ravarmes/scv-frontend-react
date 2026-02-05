import React, { useState } from 'react';
import {
  FaHome, FaDatabase, FaCogs, FaChartLine,
  FaUser, FaMapMarkerAlt, FaCity, FaFilm, FaCompactDisc,
  FaUserTie, FaUserCog, FaTheaterMasks, FaListAlt, FaMap,
  FaUndo, FaHandHolding, FaMoneyBillWave, FaCalendarCheck,
  FaFileAlt, FaSignInAlt, FaChevronDown, FaChevronRight
} from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import ClienteManager from './components/ClienteManager';
import UfManager from './components/UfManager';
import CidadeManager from './components/CidadeManager';
import BairroManager from './components/BairroManager';
import TipoDeFilmeManager from './components/TipoDeFilmeManager';
import FuncionarioManager from './components/FuncionarioManager';
import GerenteManager from './components/GerenteManager';
import DiretorManager from './components/DiretorManager';
import ArtistaManager from './components/ArtistaManager';
import FilmeManager from './components/FilmeManager';
import FitaManager from './components/FitaManager';
import ReservaManager from './components/ReservaManager';
import EmprestimoManager from './components/EmprestimoManager';
import DevolucaoManager from './components/DevolucaoManager';
import MultaManager from './components/MultaManager';
import RelatorioEmprestimosCliente from './components/RelatorioEmprestimosCliente';
import RelatorioEmprestimosBairro from './components/RelatorioEmprestimosBairro';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [expandedMenus, setExpandedMenus] = useState({
    cadastros: false,
    processos: false,
    relatorios: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      // Cadastros
      case 'artistas': return <ArtistaManager />;
      case 'bairros': return <BairroManager />;
      case 'cidades': return <CidadeManager />;
      case 'clientes': return <ClienteManager />;
      case 'diretores': return <DiretorManager />;
      case 'filmes': return <FilmeManager />;
      case 'fitas': return <FitaManager />;
      case 'funcionarios': return <FuncionarioManager />;
      case 'gerentes': return <GerenteManager />;
      case 'tiposdefilme': return <TipoDeFilmeManager />;
      case 'ufs': return <UfManager />;
      // Processos
      case 'devolucoes': return <DevolucaoManager />;
      case 'emprestimos': return <EmprestimoManager />;
      case 'multas': return <MultaManager />;
      case 'reservas': return <ReservaManager />;
      // Relatórios
      case 'relatorio-emprestimos-cliente': return <RelatorioEmprestimosCliente />;
      case 'relatorio-emprestimos-bairro': return <RelatorioEmprestimosBairro />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="top-header">
        <div className="logo-container">
          <span className="logo-text">RVM</span>
        </div>
        <div className="header-spacer"></div>
        <div className="header-right">
          <FaSignInAlt />
        </div>
      </div>

      <div className="main-wrapper">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="user-profile">
            <div className="user-avatar">
              <img src={`${process.env.PUBLIC_URL}/assets/scv.png`} alt="SCV Logo" />
            </div>
            <div className="user-info">
              <span className="user-role">Sistema de Controle da Videolocadora</span>
            </div>
          </div>

          {/* Dashboard */}
          <div
            className={`menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handlePageChange('dashboard')}
          >
            <FaHome /> Dashboard
          </div>

          {/* Cadastros */}
          <div className="menu-section" onClick={() => toggleMenu('cadastros')}>
            <span className="menu-section-title">
              <FaDatabase /> <span className="menu-text">Cadastros</span>
              <span className="menu-chevron">{expandedMenus.cadastros ? <FaChevronDown /> : <FaChevronRight />}</span>
            </span>
          </div>
          {expandedMenus.cadastros && (
            <div className="submenu">
              <div className={`menu-item submenu-item ${currentPage === 'artistas' ? 'active' : ''}`} onClick={() => handlePageChange('artistas')}>
                <FaTheaterMasks /> Artistas
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'bairros' ? 'active' : ''}`} onClick={() => handlePageChange('bairros')}>
                <FaMapMarkerAlt /> Bairros
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'cidades' ? 'active' : ''}`} onClick={() => handlePageChange('cidades')}>
                <FaCity /> Cidades
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'clientes' ? 'active' : ''}`} onClick={() => handlePageChange('clientes')}>
                <FaUser /> Clientes
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'diretores' ? 'active' : ''}`} onClick={() => handlePageChange('diretores')}>
                <FaTheaterMasks /> Diretores
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'filmes' ? 'active' : ''}`} onClick={() => handlePageChange('filmes')}>
                <FaFilm /> Filmes
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'fitas' ? 'active' : ''}`} onClick={() => handlePageChange('fitas')}>
                <FaCompactDisc /> Fitas
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'funcionarios' ? 'active' : ''}`} onClick={() => handlePageChange('funcionarios')}>
                <FaUserTie /> Funcionários
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'gerentes' ? 'active' : ''}`} onClick={() => handlePageChange('gerentes')}>
                <FaUserCog /> Gerentes
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'tiposdefilme' ? 'active' : ''}`} onClick={() => handlePageChange('tiposdefilme')}>
                <FaListAlt /> Tipo de Filme
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'ufs' ? 'active' : ''}`} onClick={() => handlePageChange('ufs')}>
                <FaMap /> UFs
              </div>
            </div>
          )}

          {/* Processos */}
          <div className="menu-section" onClick={() => toggleMenu('processos')}>
            <span className="menu-section-title">
              <FaCogs /> <span className="menu-text">Processos</span>
              <span className="menu-chevron">{expandedMenus.processos ? <FaChevronDown /> : <FaChevronRight />}</span>
            </span>
          </div>
          {expandedMenus.processos && (
            <div className="submenu">
              <div className={`menu-item submenu-item ${currentPage === 'devolucoes' ? 'active' : ''}`} onClick={() => handlePageChange('devolucoes')}>
                <FaUndo /> Devolução
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'emprestimos' ? 'active' : ''}`} onClick={() => handlePageChange('emprestimos')}>
                <FaHandHolding /> Empréstimo
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'multas' ? 'active' : ''}`} onClick={() => handlePageChange('multas')}>
                <FaMoneyBillWave /> Multa
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'reservas' ? 'active' : ''}`} onClick={() => handlePageChange('reservas')}>
                <FaCalendarCheck /> Reserva
              </div>
            </div>
          )}

          {/* Relatórios */}
          <div className="menu-section" onClick={() => toggleMenu('relatorios')}>
            <span className="menu-section-title">
              <FaChartLine /> <span className="menu-text">Relatórios</span>
              <span className="menu-chevron">{expandedMenus.relatorios ? <FaChevronDown /> : <FaChevronRight />}</span>
            </span>
          </div>
          {expandedMenus.relatorios && (
            <div className="submenu">
              <div className={`menu-item submenu-item ${currentPage === 'relatorio-emprestimos-cliente' ? 'active' : ''}`} onClick={() => handlePageChange('relatorio-emprestimos-cliente')}>
                <FaFileAlt /> Empréstimos por Cliente
              </div>
              <div className={`menu-item submenu-item ${currentPage === 'relatorio-emprestimos-bairro' ? 'active' : ''}`} onClick={() => handlePageChange('relatorio-emprestimos-bairro')}>
                <FaFileAlt /> Empréstimos por Bairro
              </div>
            </div>
          )}

          {/* Login */}
          <div className="menu-item">
            <FaSignInAlt /> Login
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;