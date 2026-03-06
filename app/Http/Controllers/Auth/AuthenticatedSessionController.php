<?php

/*
    ARCHIVO: app/Http/Controllers/Auth/AuthenticatedSessionController.php
    ROL: Gestiona el login y logout con email/contraseña (formulario tradicional).
    DESCRIPCIÓN:
      - Muestra el formulario de login.
      - Valida las credenciales y crea la sesión web.
      - Genera un token JWT para que React lo use en las llamadas API.
      - Limpia la sesión al hacer logout.
*/

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthenticatedSessionController extends Controller
{
    /*
        MOSTRAR FORMULARIO DE LOGIN
        Renderiza el componente Auth/Login.jsx vía Inertia.
    */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /*
        PROCESAR LOGIN
        1. Valida email y contraseña (LoginRequest->authenticate).
        2. Regenera la sesión para evitar ataques de fijación de sesión.
        3. Genera un token JWT para el frontend.
        4. Redirige al catálogo con el token en la URL.
    */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Esto valida las credenciales y crea la sesión web automáticamente
        $request->authenticate();

        // Regenerar la ID de sesión por seguridad
        $request->session()->regenerate();

        // Generar token JWT para que React lo use en las llamadas API
        $token = JWTAuth::fromUser(Auth::user());

        // Redirigir al catálogo con el token JWT
        return redirect()->intended("/catalogo?token={$token}");
    }

    /*
        CERRAR SESIÓN
        Destruye la sesión web y regenera el token CSRF.
    */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
