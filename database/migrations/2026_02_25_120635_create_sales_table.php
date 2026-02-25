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
        Schema::create('sales', function (Blueprint $table) {
        $table->id();
        // Relación con el usuario que compra
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        // Relación con el producto vendido
        $table->foreignId('product_id')->constrained()->onDelete('cascade');
        
        $table->integer('quantity'); // Cuántos compra
        $table->decimal('total_price', 8, 2); // Cuánto ha pagado en total
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
