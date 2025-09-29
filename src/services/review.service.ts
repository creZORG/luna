
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  runTransaction,
  increment,
} from 'firebase/firestore';

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoUrl: string;
  rating: number;
  comment: string;
  createdAt: any; // Firebase Timestamp
}

class ReviewService {
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const productRef = doc(db, 'products', reviewData.productId);
    const reviewRef = doc(collection(db, 'reviews'));

    try {
      await runTransaction(db, async (transaction) => {
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw new Error('Product not found!');
        }

        // Add the new review
        const newReview = {
          ...reviewData,
          createdAt: serverTimestamp(),
        };
        transaction.set(reviewRef, newReview);

        // Update the product's average rating and review count
        const productData = productDoc.data();
        const newReviewCount = (productData.reviewCount || 0) + 1;
        const oldTotalRating = (productData.rating || 0) * (productData.reviewCount || 0);
        const newAverageRating = (oldTotalRating + reviewData.rating) / newReviewCount;
        
        transaction.update(productRef, {
          reviewCount: increment(1),
          rating: newAverageRating,
        });
      });
      
      return { id: reviewRef.id, createdAt: new Date(), ...reviewData }; // Return optimistic data
      
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Could not submit review.');
    }
  }

  async getReviews(productId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Could not fetch reviews.');
    }
  }
}

export const reviewService = new ReviewService();
