<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre del producto 
            $table->text('description')->nullable(); // Descripción (opcional) 
            $table->decimal('price', 8, 2); // Precio con 2 decimales 
            $table->string('image')->nullable(); // URL de la imagen 
            $table->integer('stock')->default(0); // Cantidad disponible 
            $table->timestamps(); // Crea 'created_at' y 'updated_at' automáticamente
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
