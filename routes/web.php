<?php

/*
    ARCHIVO: routes/web.php
    ROL: Definición de rutas de interfaz (Frontend con Inertia/React).
    DESCRIPCIÓN:
      - Las rutas públicas (Welcome, Google login) no requieren autenticación.
      - Las rutas protegidas (Dashboard, Perfil, Catálogo, Pedidos) 
        usan el middleware 'auth' que verifica la sesión web (cookies).
      - El middleware 'auth' aquí usa el guard 'web' (config/auth.php defaults).
*/

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\OrderController;

/*
    ═══════════════════════════════════
    RUTAS PÚBLICAS (sin login requerido)
    ═══════════════════════════════════
*/

/*
    PÁGINA DE BIENVENIDA
    Carga la vista Welcome.jsx. Si el usuario ya está logueado, 
    muestra un enlace al Dashboard en vez de Login/Register.
*/
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
    AUTENTICACIÓN CON GOOGLE (OAuth)
    Son rutas públicas porque el usuario necesita acceder a ellas 
    ANTES de estar autenticado.
    - /auth/google         → Redirige a Google
    - /auth/google/callback → Google nos devuelve aquí
*/
Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

/*
    ═══════════════════════════════════════════
    RUTAS PROTEGIDAS (requieren sesión iniciada)
    ═══════════════════════════════════════════
    El middleware 'auth' verifica que el usuario tenga una sesión activa (cookie).
    Si no la tiene, lo redirige automáticamente a la página de login.
*/
Route::middleware('auth')->group(function () {

    /*
        DASHBOARD
        Página principal del usuario logueado.
    */
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    /*
        GESTIÓN DE PERFIL
        Permite al usuario ver, editar y eliminar su cuenta.
    */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /*
        CATÁLOGO DE PRODUCTOS
        Muestra los productos disponibles para comprar.
    */
    Route::get('/catalogo', function () {
        return Inertia::render('Products');
    })->name('catalogo');

    /*
        HISTORIAL DE PEDIDOS
        El usuario puede ver sus compras realizadas.
    */
    Route::get('/my-orders', function () {
        return Inertia::render('MyOrders');
    })->name('orders.index');
});

/*
    RUTAS DE AUTENTICACIÓN (Breeze)
    Carga login, registro y recuperación de contraseña.
    Están definidas en auth.php.
*/
require __DIR__.'/auth.php';