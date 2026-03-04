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
        // Definimos la "Lista de la Compra" (El Array)
        $products = [
            [
                'name' => 'Camiseta AICOR Edition',
                'description' => 'Camiseta de algodón 100% con el logo del proyecto.',
                'price' => 19.99,
                'image' => 'https://picsum.photos/seed/shirt/400/300',
                'stock' => 50,
            ],

            [
                'name' => 'Sudadera Programador',
                'description' => 'Ideal para noches largas de Laravel y React.',
                'price' => 35.50,
                'image' => 'https://picsum.photos/seed/hoodie/400/300',
                'stock' => 20,
            ],

            [
                'name' => 'Monitor Pro 27"',
                'description' => 'Monitor 4K ideal para ver código.',
                'price' => 299.00,
                'image' => 'https://picsum.photos/seed/monitor/400/300',
                'stock' => 10,
            ],

            [
                'name' => 'Teclado Mecánico',
                'description' => 'Switches blue para máxima satisfacción.',
                'price' => 85.00,
                'image' => 'https://picsum.photos/seed/keyboard/400/300',
                'stock' => 15,
            ],

            [
                'name' => 'Ratón Ergonómico',
                'description' => 'Para que no te duela la mano al programar.',
                'price' => 45.99,
                'image' => 'https://picsum.photos/seed/mouse/400/300',
                'stock' => 25,
            ],
        ];


        // Recorre la lista y por cada 'vuelta', crea un producto en la BD
        foreach ($products as $product) {
            Product::create($product);
        }
        
    }
}
