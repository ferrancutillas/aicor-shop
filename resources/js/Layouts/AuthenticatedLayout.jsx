/**
 * ARCHIVO: resources/js/Layouts/AuthenticatedLayout.jsx
 * ROL: Componente estructural envolvente (Shell).
 * DESCRIPCIÓN: Proporciona la estructura común de la interfaz (navegación, logo y menú de usuario) a todas las páginas protegidas.
 */

import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children, user: propsUser }) {
    /*
        1. GESTIÓN DE IDENTIDAD DEL USUARIO
        Este bloque asegura que el Layout siempre tenga un nombre que mostrar.
        - propsUser: Usuario inyectado manualmente desde páginas con JWT.
        - pageUser: Usuario inyectado por Inertia (sesión tradicional).
        - Fallback: Si todo falla, muestra 'Invitado'.
    */
    const pageUser = usePage().props.auth?.user;
    const user = propsUser || pageUser || { name: 'Invitado', email: '' };

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            
                            {/* Logo: Enlace directo a la raíz de la aplicación */}
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            {/* 2. NAVEGACIÓN PRINCIPAL (Desktop)
                                Define los enlaces principales visibles en pantallas grandes.
                            */}
                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                
                                <NavLink
                                    href="/catalogo"
                                    active={window.location.pathname === '/catalogo'}
                                >
                                    Catálogo
                                </NavLink>

                                <NavLink
                                    href="/my-orders"
                                    active={window.location.pathname === '/my-orders'}
                                >
                                    Mis Pedidos
                                </NavLink>
                            </div>
                        </div>

                        {/* 3. MENÚ DESPLEGABLE DE USUARIO (Desktop)
                            Muestra el nombre del usuario y opciones de cuenta.
                        */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {/* Uso de optional chaining para evitar errores si user es null */}
                                                {user?.name || 'Invitado'}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Cerrar Sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Botón de control para el menú en dispositivos móviles */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. NAVEGACIÓN RESPONSIVE (Móvil)
                */}
                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/catalogo" active={window.location.pathname === '/catalogo'}>
                            Catálogo
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/my-orders" active={window.location.pathname === '/my-orders'}>
                            Mis Pedidos
                        </ResponsiveNavLink>
                    </div>

                    {/* Información de usuario en móvil */}
                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user?.name || 'Invitado'}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user?.email || ''}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Perfil</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Cerrar Sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Cabecera dinámica de la página */}
            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* 5. ÁREA DE CONTENIDO DINÁMICO
                Donde se renderizan los hijos (children) de cada página.
            */}
            <main>{children}</main>
        </div>
    );
}