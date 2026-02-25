<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    // Aquí le decimos a Laravel: "Oye, permito que se rellenen estos campos de una vez"
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'stock',
    ];
}
