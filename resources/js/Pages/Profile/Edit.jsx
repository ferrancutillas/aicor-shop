/*
    ARCHIVO: resources/js/Pages/Profile/Edit.jsx
    ROL: Vista de Perfil de Usuario.
    DESCRIPCIÓN: Muestra la información personal del usuario autenticado recuperada mediante JWT.
 */

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

export default function Edit() {
    /* 1. ESTADOS LOCALES
        - usuario: Almacena el objeto del perfil (nombre y email).
        - cargando: Define si la petición asíncrona a la API ha finalizado.
    */
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    /* 2. GESTIÓN DE AUTENTICACIÓN Y CARGA
        Este efecto se dispara al cargar la página. Verifica la existencia del 
        token JWT en el almacenamiento local para autorizar la vista.
    */
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        
        // Si no hay token, se fuerza la redirección al Login
        if (!token) { 
            window.location.href = '/login'; 
            return; 
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Petición a la API para obtener los datos del usuario identificado por el token
        axios.get('/api/user', { headers })
            .then(res => setUsuario(res.data))
            .catch(err => {
                // En caso de error (token expirado), se limpia el storage y se redirige
                console.error("Error al cargar usuario. Token inválido.", err);
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            })
            .finally(() => setCargando(false));
    }, []);

    return (
        <AuthenticatedLayout
            user={usuario}
            header={<h2 className="text-2xl font-bold text-gray-900 tracking-tight">Mi Perfil</h2>}
        >
            <Head title="Perfil" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    
                    {/* 3. CONTROL DE RENDERIZADO ASÍNCRONO
                        Muestra un estado de carga visual mientras se espera la respuesta de la API.
                    */}
                    {cargando ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="text-gray-500 font-medium animate-pulse">Cargando tus datos...</span>
                        </div>
                    ) : (
                        /* 4. VISUALIZACIÓN DE DATOS DE CUENTA
                           Muestra la información de identidad del usuario actual.
                        */
                        <div className="bg-white p-8 shadow-sm border border-gray-200 rounded-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Datos de tu cuenta
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Bloque de Nombre de Usuario */}
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</span>
                                    <span className="text-lg font-medium text-gray-900">{usuario?.name}</span>
                                </div>
                                
                                {/* Bloque de Email de Usuario */}
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</span>
                                    <span className="text-lg font-medium text-gray-900">{usuario?.email}</span>
                                </div>
                            </div>

                            {/* Aviso informativo sobre el estado del componente */}
                            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <p className="text-sm text-indigo-800">
                                    <strong>Nota técnica:</strong> Los formularios de edición de perfil y contraseña se encuentran deshabilitados para garantizar la integridad de la sesión mediante el sistema de tokens.
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}