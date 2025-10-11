import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { getPedidos } from '../services/api';

const Dashboard = () => {
    const { data: pedidos, loading, error, refetch } = useApi(getPedidos);
    const [stats, setStats] = useState({
        pendentes: 0,
        preparo: 0,
        entrega: 0,
        entregues: 0,
        vendasHoje: 0,
        ticketMedio: 0
    });

    useEffect(() => {
        if (pedidos) {
            calculateStats(pedidos);
        }
    }, [pedidos]);

    const calculateStats = (pedidosData) => {
        const lista = Array.isArray(pedidosData) ? pedidosData : [];
        const hojeStr = new Date().toDateString();

        const pedidosHoje = lista.filter((pedido) => {
            const data = pedido.data_pedido || pedido.criado_em;
            if (!data) return false;
            return new Date(data).toDateString() === hojeStr;
        });

        const pendentes = lista.filter(p => p.status === 'pendente').length;
        const preparo = lista.filter(p => p.status === 'preparo').length;
        const entrega = lista.filter(p => p.status === 'entrega').length;
        const entregues = pedidosHoje.filter(p => p.status === 'entregue').length;

        const vendasHoje = pedidosHoje
            .filter(p => p.status === 'entregue')
            .reduce((total, pedido) => total + (parseFloat(pedido.total) || 0), 0);

        const ticketMedio = entregues > 0 ? vendasHoje / entregues : 0;

        setStats({
            pendentes,
            preparo,
            entrega,
            entregues,
            vendasHoje,
            ticketMedio
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const handleRefresh = () => {
        refetch();
    };

    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid">
                <div className="alert alert-danger" role="alert">
                    Erro ao carregar dados: {error}
                    <button className="btn btn-outline-danger btn-sm ml-2" onClick={handleRefresh}>
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            {/* Page Heading */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleRefresh}
                >
                    <i className="fas fa-sync-alt mr-1"></i>
                    Atualizar
                </button>
            </div>

            {/* Content Row */}
            <div className="row">
                {/* Pedidos Pendentes Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Pedidos Pendentes
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.pendentes}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pedidos em Preparo Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Em Preparo
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.preparo}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-fire fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saiu para Entrega Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Saiu para Entrega
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.entrega}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-motorcycle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Entregues Hoje Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Entregues Hoje
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.entregues}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Segunda linha de estatísticas */}
            <div className="row">
                {/* Vendas Hoje Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Vendas Hoje
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(stats.vendasHoje)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ticket Médio Card */}
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Ticket Médio
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatCurrency(stats.ticketMedio)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-chart-line fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card de Ações Rápidas */}
                <div className="col-xl-6 col-md-12 mb-4">
                    <div className="card shadow h-100">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Ações Rápidas</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <a href="/novo-pedido" className="btn btn-primary btn-block">
                                        <i className="fas fa-plus mr-2"></i>
                                        Novo Pedido
                                    </a>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <a href="/pedidos" className="btn btn-info btn-block">
                                        <i className="fas fa-list mr-2"></i>
                                        Ver Pedidos
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;