<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    // Importamos el modelo para poder usarlo
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        // 1. Pedimos a la base de datos todos los productos
        $products = Product::all();

        // 2. Los servimos en tipo JSON
        return response()->json($products);
    }
}
