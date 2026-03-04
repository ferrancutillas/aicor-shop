<?php

/*
    ARCHIVO: routes/api.php
    ROL: Pasarela de datos y lógica de negocio (Backend).
    DESCRIPCIÓN: Este archivo define los puntos de acceso (endpoints) que devuelven datos en formato JSON para ser consumidos por React.
 */

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

/*
    1. RUTAS PÚBLICAS
    Define los puntos de acceso que no requieren que el usuario esté identificado.
    Permite que el catálogo de productos sea visible para cualquier visitante.
*/
Route::get('/products', [ProductController::class, 'index']);


/*
    2. RUTAS PROTEGIDAS (Middleware auth:api)
    Agrupa las rutas que exigen un Token JWT válido para ser ejecutadas.
    El servidor verifica la identidad del usuario antes de permitir el acceso.
*/
Route::middleware('auth:api')->group(function () {
    
    /*
        OBTENER DATOS DEL USUARIO
        Retorna el objeto del usuario autenticado (nombre, email, etc.).
        Es esencial para que el Layout de la aplicación muestre la información del perfil.
    */
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
        CREACIÓN DE PEDIDOS (Checkout)
        Recibe los datos de la compra desde el frontend y los registra en la base de datos.
        Incluye la lógica de validación de productos y persistencia del pedido.
    */
    Route::post('/orders', [OrderController::class, 'store']);

    /*
        HISTORIAL DE PEDIDOS PERSONALIZADO
        Recupera la lista de compras realizadas exclusivamente por el usuario logueado.
        Esta información se utiliza para rellenar la vista de 'Mis Pedidos'.
    */
    Route::get('/my-orders', [OrderController::class, 'index']);

});