/*
    ARCHIVO: resources/js/Pages/MyOrders.jsx
    ROL: Vista del Historial de Pedidos.
    DESCRIPCIÓN: Recupera y muestra las compras realizadas por el usuario autenticado.
    CONEXIÓN: Consulta los endpoints protegidos de 'routes/api.php' enviando el Token JWT.
 */

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function MyOrders() {
    /* 
        1. ESTADOS INICIALES
        - pedidos: Almacena el array de objetos con las compras del usuario.
        - cargando: Controla el estado de la interfaz mientras llega la respuesta de la API.
        - usuario: Almacena los datos del perfil para el Layout.
    */
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState(null);

    /* 
        2. EFECTO DE CARGA DE DATOS (JWT)
        Al montar el componente, recuperamos el token del almacenamiento local.
        Si no existe, redirigimos al login. Si existe, realizamos dos peticiones 
        paralelas para identificar al usuario y obtener sus pedidos.
    */
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        
        // Si no hay token JWT, no podemos llamar a la API protegida
        // pero la sesión web sigue activa (el middleware 'auth' de web.php ya protege esta ruta)
        if (!token) { 
            console.warn("No hay token JWT en localStorage. Las llamadas API no funcionarán.");
            setCargando(false);
            return; 
        }

        // Configuración de cabeceras de autorización para las peticiones API
        const headers = { Authorization: `Bearer ${token}` };

        // Petición A: Validar identidad del usuario para mostrar su nombre en el Layout
        axios.get('/api/user', { headers })
            .then(res => setUsuario(res.data))
            .catch(() => console.error("Error al cargar usuario"));

        // Petición B: Obtener historial de compras desde la base de datos
        axios.get('/api/my-orders', { headers })
            .then(res => setPedidos(res.data))
            .catch(err => console.error("Error al cargar pedidos:", err))
            .finally(() => setCargando(false));
    }, []);

    /* 
        3. UTILIDADES DE FORMATO
        Convierte fechas de formato ISO (DB) a un formato legible en español.
    */
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            user={usuario}
            header={<h2 className="text-2xl font-bold text-gray-900 tracking-tight">Historial de Compras</h2>}
        >
            <Head title="Mis Pedidos" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">

                    {/* 
                        4. GESTIÓN DE ESTADOS DE VISTA
                        Controlamos tres estados: Carga, Lista vacía o Listado de pedidos.
                    */}
                    {cargando ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="text-gray-500 font-medium animate-pulse">Cargando tus pedidos...</span>
                        </div>
                    ) : pedidos.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes pedidos</h3>
                            <p className="text-gray-500 mb-6">Tu historial de compras está vacío.</p>
                            <a href="/catalogo" className="bg-gray-900 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition">
                                Ir al catálogo
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 
                                5. RENDERIZADO DE TARJETAS DE PEDIDO
                                Iteramos sobre el array de pedidos recuperado de la API.
                            */}
                            {pedidos.map(pedido => (
                                <div key={pedido.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                                    
                                    {/* SECCIÓN IZQUIERDA: RESUMEN FINANCIERO Y FECHA */}
                                    <div className="p-8 md:w-1/2 flex flex-col justify-center space-y-4 bg-white">
                                        <div className="flex items-center">
                                            <span className="w-32 text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido:</span>
                                            <span className="text-lg font-black text-gray-900">#{pedido.id}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-32 text-xs font-bold text-gray-400 uppercase tracking-wider">Fecha:</span>
                                            <span className="text-base text-gray-700 font-medium">{formatearFecha(pedido.created_at)}</span>
                                        </div>
                                        <div className="h-2"></div>
                                        <div className="flex items-center">
                                            <span className="w-32 text-xs font-bold text-gray-400 uppercase tracking-wider">Total pagado:</span>
                                            <span className="text-2xl font-black text-indigo-600">{Number(pedido.total_price).toFixed(2)} €</span>
                                        </div>
                                    </div>

                                    {/* SECCIÓN DERECHA: DESGLOSE DE ARTÍCULOS */}
                                    <div className="p-8 md:w-1/2 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100">
                                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Artículos incluidos:</span>
                                        <ul className="space-y-3">
                                            {pedido.items && pedido.items.length > 0 ? (
                                                pedido.items.map(articulo => (
                                                    <li key={articulo.id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                        <img 
                                                            src={articulo.product?.image || 'https://placehold.co/100x100?text=Foto'} 
                                                            alt="Producto" 
                                                            className="w-12 h-12 rounded object-cover border border-gray-100" 
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">
                                                                <span className="text-indigo-600 mr-1">{articulo.quantity}x</span> 
                                                                {articulo.product?.name || 'Producto descatalogado'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{Number(articulo.price).toFixed(2)} € / ud</p>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic text-sm">Sin detalles de artículos</span>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}