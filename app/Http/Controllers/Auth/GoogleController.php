<?php

/*
    ARCHIVO: app/Http/Controllers/Auth/GoogleController.php
    ROL: Gestor de Autenticación Social (OAuth 2.0 con Google).
    DESCRIPCIÓN: 
      - Redirige al usuario a Google para que inicie sesión.
      - Recibe la respuesta de Google con los datos del usuario.
      - Crea el usuario en la base de datos si no existía.
      - Inicia la sesión web (cookies) para que Inertia funcione.
      - Genera un token JWT para que React lo use en las llamadas a la API.
*/

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;
use Exception;

class GoogleController extends Controller
{
    /*
        PASO 1: REDIRECCIÓN A GOOGLE
        Envía al usuario a la página de login de Google.
        Socialite se encarga de construir la URL con los scopes y credenciales
        que están definidos en config/services.php.
    */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /*
        PASO 2: CALLBACK — Google nos devuelve aquí tras el login exitoso
        Aquí recibimos los datos del usuario (nombre, email, id de Google).
    */
    public function handleGoogleCallback()
    {
        try {
            // Pedir a Google los datos del usuario autenticado
            $googleUser = Socialite::driver('google')->user();

            // Buscar si ya existe un usuario con ese email en nuestra base de datos
            $user = User::where('email', $googleUser->getEmail())->first();

            /*
                PASO 3: REGISTRO AUTOMÁTICO
                Si el usuario no existe, lo creamos con los datos de Google.
                La contraseña es aleatoria porque no la necesita (entra por Google).
            */
            if (!$user) {
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password'  => bcrypt(str()->random(16)),
                ]);
            }

            /*
                PASO 4: INICIAR SESIÓN WEB (guard 'web' = cookies/sesión)
                Esto es FUNDAMENTAL. Sin esto, Inertia no sabe quién es el usuario
                y redirige al login en cada página.
                Auth::login() crea la cookie de sesión en el navegador.
            */
            Auth::guard('web')->login($user);

            /*
                PASO 5: GENERAR TOKEN JWT (guard 'api')
                Este token se usa SOLO para las llamadas a la API (/api/user, 
                /api/orders, etc.) que React hace con axios.
                Lo pasamos por la URL para que el frontend lo capture y lo guarde
                en localStorage.
            */
            $token = JWTAuth::fromUser($user);

            /*
                PASO 6: REDIRIGIR AL CATÁLOGO CON EL TOKEN EN LA URL
                El componente Products.jsx capturará el '?token=xxx' de la URL,
                lo guardará en localStorage y limpiará la URL.
            */
            return redirect()->intended("/catalogo?token={$token}");

        } catch (Exception $e) {
            // Si falla la comunicación con Google, volvemos al login con un mensaje
            return redirect('/login')->with('error', 'Error en la autenticación con Google');
        }
    }
}