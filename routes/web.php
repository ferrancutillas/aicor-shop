<?php

/*
    ARCHIVO: routes/web.php
    ROL: Definición de rutas de interfaz (Frontend).
    DESCRIPCIÓN: Este archivo gestiona la carga de componentes React a través de Inertia.
*/

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\OrderController;

/*
    1. RUTA DE INICIO (Welcome)
    Carga la página de bienvenida del sitio.
    Envía datos de versiones y estados de login al componente 'Welcome.jsx'.
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
    2. PANEL DE CONTROL (Dashboard)
    Renderiza la vista principal del usuario logueado.
*/
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

/*
    3. GESTIÓN DE PERFIL
    Rutas destinadas a la visualización y edición de los datos del usuario.
    Utiliza el ProfileController para manejar la lógica de edición, actualización y borrado.
*/
Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

/*
    4. CATÁLOGO DE PRODUCTOS
    Carga la interfaz de la tienda donde se muestran los productos disponibles.
*/
Route::get('/catalogo', function () {
    return Inertia::render('Products');
})->name('catalogo');

/*
    5. HISTORIAL DE PEDIDOS
    Carga la vista 'MyOrders.jsx' para que el usuario consulte sus compras realizadas.
*/
Route::get('/my-orders', function () {
    return Inertia::render('MyOrders'); 
})->name('orders.index');

/*
    6. AUTENTICACIÓN CON GOOGLE (OAuth)
    redirectToGoogle: Redirige al sistema de cuentas de Google.
    handleGoogleCallback: Procesa la respuesta de Google para validar al usuario.
*/
Route::get('auth/google', [GoogleController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

/*
    RUTAS DE AUTENTICACIÓN BREEZE
    Carga las rutas predefinidas de login, registro y recuperación de contraseña.
 */
require __DIR__.'/auth.php';