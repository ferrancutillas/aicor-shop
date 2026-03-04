import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
// 1. Conexión con el Almacén Global
import { useCart } from '@/Contexts/CartContext'; 

export default function Products() {
    // Lista de productos del servidor (Estado local de esta página)
    const [products, setProducts] = useState([]);
    
    // 2. Extraemos las herramientas de la "mochila" global
    // Ya no creamos el carrito aquí, lo pedimos fuera.
    const { cart, addToCart, decreaseQuantity, removeFromCart, setCart } = useCart();

    // 3. Petición a la API de Laravel para ver los productos
    useEffect(() => {
        axios.get('/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error al traer los productos", error);
            });
    }, []);

    // Cálculo del total usando los datos del carrito global
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 4. Función para confirmar compra
    const handleCheckout = () => {
        if (cart.length === 0) return alert("Tu cesta está vacía");

        axios.post('/orders', {
            cart: cart,
            total: total
        })
        .then(response => {
            alert("¡Compra confirmada! Tu pedido número #" + response.data.order_id + " está en camino.");
            setCart([]); // Vaciamos el estado global tras la compra
        })
        .catch(error => {
            if (error.response && error.response.status === 401) {
                alert("Por favor, identifícate para finalizar la compra.");
            } else {
                console.error(error);
                alert("Error al procesar tu compra.");
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Catálogo de Productos</h2>}
        >
            <Head title="Productos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Parrilla de productos [cite: 43] */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div key={product.id} className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-40 w-full object-cover rounded-md mb-4"
                                />
                                <h3 className="text-lg font-bold">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-semibold text-indigo-600">
                                        {product.price}€
                                    </span>
                                    <button 
                                        onClick={() => addToCart(product)} 
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                    >
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sección del Carrito (Solo se ve si hay algo en la mochila) [cite: 48] */}
                    {cart.length > 0 && (
                        <div className="mt-10 p-4 border rounded bg-gray-50">
                            <h3 className="font-bold">Tu Cesta:</h3>
                            
                            <ul>
                                {cart.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 border-b">
                                        <div className="flex items-center">
                                            <span className="font-bold text-indigo-600 w-8">x{item.quantity}</span> 
                                            <span className="ml-2">{item.name}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => decreaseQuantity(item.id)}
                                                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors"
                                            >
                                                -
                                            </button>

                                            <button 
                                                onClick={() => addToCart(item)}
                                                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors"
                                            >
                                                +
                                            </button>

                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors"
                                                title="Eliminar todo"
                                            >
                                                🚫
                                            </button>

                                            <span className="ml-4 w-20 text-right">
                                                {(item.price * item.quantity).toFixed(2)}€
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 text-right font-bold text-xl">
                                Total: {total.toFixed(2)}€
                            </div>

                            <button 
                                onClick={handleCheckout} 
                                className="mt-6 w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 shadow-lg transition"
                            >
                                Finalizar Compra ✅
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}