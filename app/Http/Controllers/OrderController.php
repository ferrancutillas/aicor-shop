<?php

/*
    ARCHIVO: app/Http/Controllers/OrderController.php
    ROL: Motor de Procesamiento de Pedidos (Backend).
    DESCRIPCIÓN: Gestiona la lógica de negocio para la creación de órdenes, validación de stock, cálculos financieros de seguridad y recuperación del historial de compras.
 */

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /*
        PROCESAMIENTO DE COMPRA (Checkout)
        Este método recibe el carrito desde React y realiza una serie de validaciones
        críticas antes de persistir la compra en la base de datos.
    */
    public function store(Request $request)
    {
        /*
            1. VALIDACIÓN DE ENTRADA
            Asegura que el carrito enviado contenga datos válidos y que los productos
            existan realmente en la base de datos antes de empezar el proceso.
        */
        $validated = $request->validate([
            'cart' => 'required|array',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        // Recuperación del usuario autenticado mediante el Token JWT
        $user = auth()->user(); 
        $cart = $validated['cart'];

        /*
            2. TRANSACCIÓN DE BASE DE DATOS
            Iniciamos un bloque 'transaction' para garantizar la integridad de los datos.
            Si algo falla durante el proceso, se deshacen todos los cambios (rollback).
        */
        try {
            return DB::transaction(function () use ($cart, $user) {
                $serverTotal = 0;
                $itemsParaGuardar = [];

                /*
                    3. VALIDACIÓN DE STOCK Y CÁLCULO DE PRECIO REAL
                    No confiamos en el precio que envía el frontend. Consultamos la DB directamente.
                    'lockForUpdate' bloquea el registro del producto para evitar compras simultáneas 
                    que agoten el stock erróneamente.
                */
                foreach ($cart as $item) {
                    $product = Product::lockForUpdate()->find($item['id']);

                    // Comprobación de disponibilidad física
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stock insuficiente para: {$product->name}");
                    }

                    // Cálculo del total basado exclusivamente en precios del servidor (Seguridad)
                    $serverTotal += ($product->price * $item['quantity']);

                    // Estructura temporal para la inserción masiva posterior
                    $itemsParaGuardar[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'price' => $product->price 
                    ];
                }

                /*
                    4. CREACIÓN DE LA CABECERA DEL PEDIDO
                    Registramos la orden principal asociada al usuario con el total final.
                */
                $order = Order::create([
                    'user_id' => $user->id,
                    'total_price' => $serverTotal,
                    'status' => 'completed',
                ]);

                /*
                    5. REGISTRO DE DETALLES Y ACTUALIZACIÓN DE INVENTARIO
                    Insertamos cada línea del pedido y restamos las unidades del stock del producto.
                */
                foreach ($itemsParaGuardar as $data) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $data['product']->id,
                        'quantity' => $data['quantity'],
                        'price' => $data['price'],
                    ]);

                    // Actualización del stock remanente
                    $data['product']->decrement('stock', $data['quantity']);
                }

                // Respuesta de éxito con los datos del pedido generado
                return response()->json([
                    'message' => '¡Compra segura realizada con éxito!',
                    'order_id' => $order->id,
                    'total' => $serverTotal
                ]);
            });
        } catch (\Exception $e) {
            /*
                GESTIÓN DE ERRORES
                Si ocurre una excepción (ej. falta de stock), retornamos el mensaje al frontend
                con un código de estado 422 (Unprocessable Entity).
            */
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /*
        RECUPERACIÓN DEL HISTORIAL DE PEDIDOS
        Devuelve todas las compras del usuario logueado, cargando mediante 'Eager Loading'
        los artículos y los datos de los productos para optimizar la consulta.
    */
    public function index()
    {
        return Order::where('user_id', auth()->id())
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}