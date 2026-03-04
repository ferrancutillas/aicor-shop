/*
    ARCHIVO: resources/js/Contexts/CartContext.jsx
    ROL: Gestor de estado global del carrito (React Context API).
    DESCRIPCIÓN: Administra la persistencia de los productos seleccionados, permitiendo que la información sea accesible desde cualquier componente sin necesidad de pasar props manualmente.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Creación del contexto compartido
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    
    /* 
        1. ESTADO INICIAL
        Define el array que contendrá los objetos del carrito.
    */
    const [cart, setCart] = useState([]);

    /* 
        2. PERSISTENCIA DE DATOS (Efectos de ciclo de vida)
        - Lectura: Al cargar la aplicación, recuperamos los datos de 'localStorage' para no perder la compra al refrescar.
        - Escritura: Cada vez que el estado 'cart' cambia, actualizamos automáticamente el almacenamiento del navegador.
    */
    useEffect(() => {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            setCart(JSON.parse(localCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    /* 
        3. LÓGICA DE GESTIÓN DE PRODUCTOS
        Funciones encargadas de manipular el array de productos de forma inmutable.
    */

    // Añadir producto o incrementar cantidad si ya existe
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Reducir cantidad de un producto o eliminarlo si llega a cero
    const decreaseQuantity = (productId) => {
        setCart((prevCart) => {
            const item = prevCart.find(i => i.id === productId);
            if (item && item.quantity === 1) {
                return prevCart.filter(i => i.id !== productId);
            }
            return prevCart.map(i =>
                i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };

    // Eliminación total de una línea de producto independientemente de su cantidad
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    /* 
        4. PROVEEDOR DEL CONTEXTO
        Expone el estado y las funciones de control a todos los componentes hijos (children).
    */
    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            decreaseQuantity, 
            removeFromCart,
            setCart // Permite reseteos globales (útil tras confirmar un pedido)
        }}>
            {children}
        </CartContext.Provider>
    );
};

/* 
    HOOK PERSONALIZADO
    Simplifica la importación y uso del contexto en otros componentes.
*/
export const useCart = () => useContext(CartContext);