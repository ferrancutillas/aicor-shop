import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. PRIMERO definimos el estado (la base de todo)
    const [cart, setCart] = useState([]);

    // 2. SEGUNDO los efectos (que usan ese estado)
    useEffect(() => {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            setCart(JSON.parse(localCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // 3. TERCERO las funciones de lógica
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

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    };

    // 4. CUARTO: Exponemos TODO en el "value" para que el resto de la web lo vea
    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            decreaseQuantity, 
            removeFromCart,
            setCart // Por si necesitas vaciarlo de golpe
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);