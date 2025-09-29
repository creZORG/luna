
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useAuth } from './use-auth';
import { cartService, CartItem } from '@/services/cart.service';

interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    addItem: (item: CartItem) => void;
    updateItemQuantity: (productId: string, size: string, newQuantity: number) => void;
    removeItem: (productId: string, size: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const loadCart = useCallback(async () => {
        if (loading) return; // Don't load until auth state is resolved

        if (user) {
            const firestoreCart = await cartService.getCart(user.uid);
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            // Merge local cart into firestore cart if local cart has items
            if (localCart.length > 0) {
                let mergedCart = [...firestoreCart];
                localCart.forEach((localItem: CartItem) => {
                    const existingIndex = mergedCart.findIndex(
                        (item) => item.productId === localItem.productId && item.size === localItem.size
                    );
                    if (existingIndex > -1) {
                        mergedCart[existingIndex].quantity += localItem.quantity;
                    } else {
                        mergedCart.push(localItem);
                    }
                });
                await cartService.setCart(user.uid, mergedCart);
                setCartItems(mergedCart);
                localStorage.removeItem('cart'); // Clear local cart after merge
            } else {
                setCartItems(firestoreCart);
            }
        } else {
            // Guest user
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(localCart);
        }
    }, [user, loading]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);
    
    // For local storage changes in other tabs
    useEffect(() => {
        const handleStorageChange = () => {
            if (!user) { // Only for guest users
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                setCartItems(localCart);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user]);

    const addItem = async (item: CartItem) => {
        let updatedItems;
        const existingItemIndex = cartItems.findIndex(
            i => i.productId === item.productId && i.size === item.size
        );

        if (existingItemIndex > -1) {
            updatedItems = [...cartItems];
            updatedItems[existingItemIndex].quantity += item.quantity;
        } else {
            updatedItems = [...cartItems, item];
        }

        setCartItems(updatedItems);

        if (user) {
            await cartService.setCart(user.uid, updatedItems);
        } else {
            localStorage.setItem('cart', JSON.stringify(updatedItems));
        }
    };

    const updateItemQuantity = async (productId: string, size: string, newQuantity: number) => {
        let updatedItems;
        if (newQuantity <= 0) {
            updatedItems = cartItems.filter(i => !(i.productId === productId && i.size === size));
        } else {
            updatedItems = cartItems.map(i => 
                i.productId === productId && i.size === size ? { ...i, quantity: newQuantity } : i
            );
        }

        setCartItems(updatedItems);
        
        if (user) {
            await cartService.setCart(user.uid, updatedItems);
        } else {
            localStorage.setItem('cart', JSON.stringify(updatedItems));
        }
    };
    
    const removeItem = (productId: string, size: string) => {
        updateItemQuantity(productId, size, 0);
    }

    const clearCart = async () => {
        setCartItems([]);
        if (user) {
            await cartService.clearCart(user.uid);
        } else {
            localStorage.removeItem('cart');
        }
    }

    return (
        <CartContext.Provider value={{ cartItems, isCartOpen, setIsCartOpen, addItem, updateItemQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
