<?php

/*
    ARCHIVO: app/Http/Controllers/Auth/RegisteredUserController.php
    ROL: Gestiona el registro de nuevos usuarios con email y contraseña.
    DESCRIPCIÓN:
      - Muestra el formulario de registro.
      - Crea el usuario en la base de datos.
      - Inicia la sesión web y genera un JWT.
      - Redirige al catálogo con el token.
*/

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class RegisteredUserController extends Controller
{
    /*
        MOSTRAR FORMULARIO DE REGISTRO
    */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /*
        PROCESAR REGISTRO
        1. Valida los datos del formulario.
        2. Crea el usuario en la base de datos.
        3. Dispara el evento Registered (para verificación de email si se activa).
        4. Inicia sesión web (cookies).
        5. Genera JWT para las llamadas API.
        6. Redirige al catálogo con el token.
    */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Iniciar sesión web
        Auth::login($user);

        // Generar token JWT para que el frontend lo use en las llamadas API
        $token = JWTAuth::fromUser($user);

        return redirect("/catalogo?token={$token}");
    }
}
