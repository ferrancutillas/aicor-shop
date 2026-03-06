/*
    ARCHIVO: resources/js/Pages/Products.jsx
    ROL: Vista del Catálogo y Gestión de Compras.
    DESCRIPCIÓN: Renderiza los productos, gestiona el carrito de la compra y 
    Administra la persistencia del Token JWT en el almacenamiento local.
 */

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useCart } from '@/Contexts/CartContext'; 

export default function Products() {
    /* 
        1. ESTADOS LOCALES Y CONTEXTO
        - products: Almacena el listado de artículos traídos de la base de datos.
        - authUser: Almacena los datos del usuario tras validar el token.
        - useCart: Acceso a las funciones globales del carrito (Context API).
    */
    const [products, setProducts] = useState([]);
    const [authUser, setAuthUser] = useState(null);
    const { cart, addToCart, decreaseQuantity, removeFromCart, setCart } = useCart();

    /* 
        2. PERSISTENCIA DEL TOKEN JWT
        Tras el login con Google, el token viaja en la URL. 
        Este efecto lo captura, lo guarda en localStorage para futuras visitas 
        y limpia la URL para mejorar la estética y seguridad.
    */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('auth_token', token);
            setTimeout(() => {
                window.history.replaceState({}, '', window.location.pathname);
            }, 100);
        }
    }, []);

    /* 
        3. CARGA DE PRODUCTOS
        Realiza una petición pública a la API para obtener el catálogo.
    */
    useEffect(() => {
        axios.get('/api/products')
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => console.error("Error al traer productos:", error));
    }, []);

    /* 
        4. VALIDACIÓN DE IDENTIDAD (JWT)
        Si existe un token, pedimos al backend los datos del usuario.
        Esto permite que el 'AuthenticatedLayout' muestre el nombre real del usuario.
    */
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.get('/api/user', { 
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                setAuthUser(res.data);
            })
            .catch(err => {
                console.log("Token inválido o expirado. Acceso como Invitado.");
            });
        }
    }, []);

    // Cálculo del importe total acumulado en el carrito
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    /* 
        5. PROCESO DE PAGO (CHECKOUT)
        Envía los datos del carrito al servidor. Es obligatorio adjuntar el 
        Token JWT en las cabeceras (Bearer) para que Laravel autorice la creación del pedido.
    */
    const handleCheckout = () => {
        if (cart.length === 0) return alert("Tu cesta está vacía");

        const token = localStorage.getItem('auth_token');

        axios.post('/api/orders', {
            cart: cart,
            total: total
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            alert("¡Compra confirmada! Pedido #" + response.data.order_id);
            setCart([]); // Limpieza del estado global tras finalizar la compra
        })
        .catch(error => {
            // 1. Extraemos la información del error que viene de Laravel
            const status = error.response?.status;
            const mensajeServidor = error.response?.data?.error || error.response?.data?.message;

            console.error("Detalles del error:", error.response?.data); // Para verlo técnico en la consola (F12)

            if (status === 401) {
                alert("🚨 SESIÓN INVÁLIDA: El token JWT no existe o ha expirado. Reidentifícate.");
            } else if (status === 422) {
                // Aquí es donde Laravel te dirá "Stock insuficiente para X" o "El ID no existe"
                alert("⚠️ ERROR DE VALIDACIÓN: " + mensajeServidor);
            } else if (status === 500) {
                alert("🔥 ERROR DEL SERVIDOR: Hay un fallo en el código PHP. Revisa los logs.");
            } else {
                alert("❓ ERROR DESCONOCIDO: " + (mensajeServidor || "No se pudo conectar con el servidor"));
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={authUser} 
            header={<h2 className="text-xl font-semibold text-gray-800 leading-tight">Catálogo de Productos</h2>}
        >
            <Head title="Productos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* PARRILLA DE PRODUCTOS: Renderizado dinámico del catálogo */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <div key={product.id} className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6 border border-gray-100 flex flex-col">
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-40 w-full object-cover rounded-md mb-4 shadow-inner"
                                />
                                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{product.description}</p>
                                
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-xl font-bold text-indigo-600">
                                        {Number(product.price).toFixed(2)}€
                                    </span>
                                    <button 
                                        onClick={() => addToCart(product)} 
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors"
                                    >
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* VISTA DEL CARRITO: Gestión de cantidades y cierre de pedido */}
                    {cart.length > 0 && (
                        <div className="mt-12 p-6 border-2 border-indigo-100 rounded-2xl bg-white shadow-xl">
                            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                                <span className="mr-2">🛒</span> Tu Cesta de la Compra
                            </h3>
                            
                            <ul className="divide-y divide-gray-100">
                                {cart.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center py-4">
                                        <div className="flex items-center">
                                            <span className="flex items-center justify-center bg-indigo-100 text-indigo-800 font-bold rounded-full w-8 h-8 text-sm">
                                                {item.quantity}
                                            </span> 
                                            <span className="ml-4 font-medium text-gray-700">{item.name}</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button onClick={() => decreaseQuantity(item.id)} className="bg-gray-100 hover:bg-red-100 hover:text-red-600 w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all">-</button>
                                            <button onClick={() => addToCart(item)} className="bg-gray-100 hover:bg-green-100 hover:text-green-600 w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all">+</button>
                                            <button onClick={() => removeFromCart(item.id)} className="ml-2 text-gray-400 hover:text-red-500 transition-colors">🗑️</button>
                                            <span className="ml-6 w-24 text-right font-mono font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)}€</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-500 font-medium">Subtotal de la compra</span>
                                    <span className="text-3xl font-black text-indigo-600">{total.toFixed(2)}€</span>
                                </div>

                                <button 
                                    onClick={handleCheckout} 
                                    className="w-full bg-green-500 text-white py-4 rounded-xl font-black text-xl hover:bg-green-600 shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center"
                                >
                                    FINALIZAR COMPRA ✅
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}