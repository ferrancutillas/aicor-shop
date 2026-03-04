import React, { useState, useEffect } from 'react'; // Importamos las "herramientas"
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios'; // El mensajero

export default function Products() {
    // 1. La Libreta: Empezamos con una lista vacía []
    const [products, setProducts] = useState([]);
    // La libreta para el carrito
    const [cart, setCart] = useState([]);

    // Función para añadir al carrito
    const addToCart = (product) => {
        setCart((prevCart) => {

            // 1. Buscamos si el producto ya está en la cesta
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // 2. Si ya está, creamos una copia de la cesta y le sumamos 1 a la cantidad
                return prevCart.map(item =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }

        // 3. Si es nuevo, lo añadimos con cantidad 1
        return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const decreaseQuantity = (productId) => {
        setCart((prevCart) => {
            // Buscamos el producto
            const item = prevCart.find(i => i.id === productId);

            // Si solo queda 1, lo borramos directamente usando filter
            if (item.quantity === 1) {
                return prevCart.filter(i => i.id !== productId);
            }

            // Si hay más de 1, restamos uno a la cantidad
            return prevCart.map(i =>
                i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };

    const removeFromCart = (productId) => {
        // El .filter crea una lista nueva donde NO esté el ID que queremos borrar
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    // 2. El Mandado: En cuanto cargue la página, busca los datos
    useEffect(() => {
        axios.get('/api/products')
            .then(response => {
                // Si todo va bien, guardamos los datos en la libreta
                setProducts(response.data);
            })
            .catch(error => {
                console.error("¡Vaya! Algo ha fallado al traer los productos", error);
            });
    }, []); // El [] vacío significa "hazlo solo una vez al cargar"

    const handleCheckout = () => {
        // 1. Verificamos que no nos estén enviando un carrito vacío (por si acaso)
        if (cart.length === 0) return alert("Tu cesta está vacía");

        // 2. Enviamos los datos por POST al "Portero" de Laravel
        axios.post('/orders', {
            cart: cart,
            total: total
        })
        .then(response => {
            // SI TODO VA BIEN:
            alert("¡Compra confirmada! Tu pedido número #" + response.data.order_id + " está en camino.");
            setCart([]); // Vaciamos la cesta (la libreta vuelve a estar en blanco)
        })
        .catch(error => {
            // SI ALGO FALLA (ej: no estás logueado o no hay stock):
            if (error.response && error.response.status === 401) {
                alert("Vaya... parece que tu sesión ha caducado. Por favor, identifícate de nuevo.");
            } else {
                console.error(error);
                alert("Ha ocurrido un error al procesar tu compra. Inténtalo de nuevo.");
            }
        });
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-gray-800">Catálogo de Productos</h2>}
        >
            <Head title="Productos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* 3. El Mapeo: Dibujamos una tarjeta por cada producto */}
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
                                        onClick={() => addToCart(product)} // <--- Llamamos a la función
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                    >
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                        {/* 1. Usamos llaves para preguntar: ¿Hay algo en el carrito? */}
                        {cart.length > 0 && (
                            <div className="mt-10 p-4 border rounded bg-gray-50">
                                <h3 className="font-bold">Tu Cesta:</h3>
                                
                                <ul>
                                    {cart.map((item, index) => (
                                        <li key={index} className="flex justify-between items-center p-2 border-b">
                                            <div className="flex items-center">
                                                {/* Cantidad y nombre */}
                                                <span className="font-bold text-indigo-600 w-8">x{item.quantity}</span> 
                                                <span className="ml-2">{item.name}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Botón Menos (-) */}
                                                <button 
                                                    onClick={() => decreaseQuantity(item.id)}
                                                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors"
                                                >
                                                    -
                                                </button>

                                                {/* Botón Más (+) - Reutilizamos tu addToCart */}
                                                <button 
                                                    onClick={() => addToCart(item)}
                                                    className="bg-gray-200 hover:bg-gray-300 w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors"
                                                >
                                                    +
                                                </button>

                                                {/* Botón Papelera (Eliminar todo) */}
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

                                {/* Mostramos el total acumulado */}
                                <div className="mt-4 text-right font-bold text-xl">
                                    Total: {total.toFixed(2)}€
                                </div>

                                <button 
                                onClick={handleCheckout} // <--- ¡La conexión mágica!
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