<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product; // IMPORTANTE: Importamos el modelo para poder usarlo

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Producto 1
        Product::create([
            'name' => 'Camiseta AICOR Edition',
            'description' => 'Camiseta de algodón 100% con el logo del proyecto.',
            'price' => 19.99,
            'image' => 'https://via.placeholder.com/150',
            'stock' => 50,
        ]);

        // Producto 2
        Product::create([
            'name' => 'Sudadera Programador',
            'description' => 'Ideal para noches largas de Laravel y React.',
            'price' => 35.50,
            'image' => 'https://via.placeholder.com/150',
            'stock' => 20,
        ]);

        // Puedes añadir más siguiendo esta estructura...
    }
}
