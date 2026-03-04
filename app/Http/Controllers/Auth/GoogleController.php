<?php

/*
    ARCHIVO: app/Http/Controllers/Auth/GoogleController.php
    ROL: Gestor de Autenticación Social (OAuth 2.0).
    DESCRIPCIÓN: Administra el flujo de inicio de sesión con Google, la creación de usuarios automáticos en la base de datos y la generación del Token JWT para la sesión de React.
 */

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleController extends Controller
{
    /*
        1. REDIRECCIÓN A GOOGLE
        Envía al usuario a la página oficial de Google para que introduzca sus credenciales.
        Utiliza el driver de Socialite configurado en 'config/services.php'.
    */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /*
        2. GESTIÓN DE LA RESPUESTA (Callback)
        Recibe los datos del usuario desde Google tras una autenticación exitosa.
        Se encarga de identificar al usuario en nuestro sistema o registrarlo si es nuevo.
    */
    public function handleGoogleCallback()
    {
        try {
            // Recuperación de los datos proporcionados por Google
            $googleUser = Socialite::driver('google')->user();
            
            // Búsqueda del usuario en nuestra base de datos local por correo electrónico
            $user = User::where('email', $googleUser->email)->first();

            /*
                3. REGISTRO AUTOMÁTICO
                Si el usuario no existe en nuestra base de datos, lo creamos en el momento.
                Le asignamos una contraseña provisional técnica para cumplir con los requisitos del modelo.
            */
            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => bcrypt('password-provisional-123'),
                ]);
            }

            /*
                4. GENERACIÓN DEL TOKEN JWT
                Mediante el guardia de autenticación 'api', logueamos al usuario y 
                generamos el token firmado que servirá como llave maestra en el frontend.
            */
            $token = auth()->login($user);

            /*
                5. ENTREGA DEL TOKEN AL FRONTEND
                Redirigimos al componente 'Products.jsx' inyectando el token en la URL.
                React capturará este parámetro y lo almacenará de forma persistente.
            */
            return redirect()->to('/catalogo?token=' . $token);

        } catch (Exception $e) {
            // En caso de fallo en la comunicación con Google, devolvemos al usuario al Login
            return redirect('/login')->with('error', 'Error en la autenticación con Google');
        }
    }
}