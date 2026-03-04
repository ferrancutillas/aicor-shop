<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        // 1. VALIDACIÓN DE FORMATO
        $validated = $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        $cart = $validated['cart'];

        // 2. INICIO DE TRANSACCIÓN (Todo o nada)
        try {
            return DB::transaction(function () use ($cart) {
                $serverTotal = 0;
                $itemsParaGuardar = [];

                // 3. PRIMER BUCLE: Comprobar Stock y Calcular Precio Real
                foreach ($cart as $item) {
                    // lockForUpdate evita que otro proceso toque el producto mientras calculamos
                    $product = Product::lockForUpdate()->find($item['id']);

                    // VALIDACIÓN DE STOCK REAL
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stock insuficiente para: {$product->name}");
                    }

                    // Calculamos el total nosotros mismos (Seguridad total)
                    $serverTotal += ($product->price * $item['quantity']);

                    // Guardamos los datos listos para insertar después
                    $itemsParaGuardar[] = [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'price' => $product->price // Precio actual de la DB
                    ];
                }

                // 4. CREAR EL PEDIDO (Con el total calculado por nosotros)
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'total_price' => $serverTotal,
                    'status' => 'completed',
                ]);

                // 5. SEGUNDO BUCLE: Guardar líneas de pedido y restar stock
                foreach ($itemsParaGuardar as $data) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $data['product']->id,
                        'quantity' => $data['quantity'],
                        'price' => $data['price'],
                    ]);

                    // Restamos el stock al modelo que ya tenemos bloqueado
                    $data['product']->decrement('stock', $data['quantity']);
                }

                return response()->json([
                    'message' => '¡Compra segura realizada con éxito!',
                    'order_id' => $order->id,
                    'total' => $serverTotal
                ]);
            });
        } catch (\Exception $e) {
            // Si algo falla (como el stock), devolvemos el error al usuario
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function index()
    {
        return Order::where('user_id', auth()->id())
            ->with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();
    }
}