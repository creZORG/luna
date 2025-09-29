
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

export interface CartItem {
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
    imageUrl?: string;
}

class CartService {
    async getCart(userId: string): Promise<CartItem[]> {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
            return cartSnap.data().items || [];
        }
        return [];
    }
    
    async setCart(userId: string, items: CartItem[]): Promise<void> {
        const cartRef = doc(db, 'carts', userId);
        await setDoc(cartRef, { userId, items });
    }

    async addToCart(userId: string, item: Omit<CartItem, 'quantity'> & { quantity: number }): Promise<void> {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const items = cartSnap.data().items || [];
            const existingItemIndex = items.findIndex(
                (i: CartItem) => i.productId === item.productId && i.size === item.size
            );

            if (existingItemIndex > -1) {
                // Item exists, increment quantity
                items[existingItemIndex].quantity += item.quantity;
            } else {
                // Item does not exist, add to array
                items.push(item);
            }
            await updateDoc(cartRef, { items });
        } else {
            // No cart exists, create a new one
            await setDoc(cartRef, { userId, items: [item] });
        }
    }

    async updateCartItemQuantity(userId: string, productId: string, size: string, newQuantity: number): Promise<void> {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const items = cartSnap.data().items || [];
            const itemIndex = items.findIndex(
                (i: CartItem) => i.productId === productId && i.size === size
            );

            if (itemIndex > -1) {
                if (newQuantity > 0) {
                    items[itemIndex].quantity = newQuantity;
                } else {
                    // Remove item if quantity is 0 or less
                    items.splice(itemIndex, 1);
                }
                await updateDoc(cartRef, { items });
            }
        }
    }

    async clearCart(userId: string): Promise<void> {
        const cartRef = doc(db, 'carts', userId);
        await setDoc(cartRef, { items: [] }, { merge: true });
    }
}

export const cartService = new CartService();
