
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export interface WebsiteImage {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
}

const defaultImages: WebsiteImage[] = [
    {
      "id": "hero-background",
      "description": "A beautiful, lush background of green leaves.",
      "imageUrl": "https://images.unsplash.com/photo-1542601906-8c4134694469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsb3ZlbHklMjBsZWF2ZXN8ZW58MHx8fHwxNzU5MTQ4NTc3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "lush leaves"
    },
    {
      "id": "products-hero",
      "description": "A wide shot of various products on display.",
      "imageUrl": "https://images.unsplash.com/photo-1711779323778-fe89eef8f580?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxwcm9kdWN0cyUyMGRpc3BsYXl8ZW58MHx8fHwxNzU5MTQ5NjY4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "products display"
    },
    {
      "id": "category-shower-gel",
      "description": "A dynamic product shot that showcases a collection of Luna shower gels.",
      "imageUrl": "https://images.unsplash.com/photo-1629095691238-d693895a9477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzaG93ZXIlMjBnZWx8ZW58MHx8fHwxNzU5MTQ4OTI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "shower gel"
    },
    {
      "id": "category-fabric-softener",
      "description": "A still-life composition that communicates comfort and softness.",
      "imageUrl": "https://images.unsplash.com/photo-1582735689369-079e53995b45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxzb2Z0JTIwZmFicmljfGVufDB8fHx8MTc1OTE0ODk2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "soft fabric"
    },
    {
      "id": "category-dish-wash",
      "description": "A bright and energetic shot that focuses on cleanliness and efficacy.",
      "imageUrl": "https://images.unsplash.com/photo-1583795231979-37e8c61a5c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjbGVhbiUyMGRpc2hlc3xlbnwwfHx8fDE3NTkxNDkwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "clean dishes"
    }
];

class WebsiteImageService {

    private async seedDefaultImages(): Promise<void> {
        const promises = defaultImages.map(image => setDoc(doc(db, 'websiteImages', image.id), image));
        await Promise.all(promises);
    }
    
    async getWebsiteImages(): Promise<WebsiteImage[]> {
        try {
            const querySnapshot = await getDocs(collection(db, 'websiteImages'));
            if (querySnapshot.empty) {
                await this.seedDefaultImages();
                return defaultImages;
            }
            const images: WebsiteImage[] = [];
            querySnapshot.forEach(doc => {
                images.push(doc.data() as WebsiteImage);
            });
            // Ensure all default images are present, add if missing
            for (const defaultImage of defaultImages) {
                if (!images.some(img => img.id === defaultImage.id)) {
                    await setDoc(doc(db, 'websiteImages', defaultImage.id), defaultImage);
                    images.push(defaultImage);
                }
            }
            return images;
        } catch (error) {
            console.error("Error fetching website images: ", error);
            return defaultImages; // Fallback to defaults
        }
    }
    
    async getWebsiteImageById(id: string): Promise<WebsiteImage | null> {
        try {
            const docRef = doc(db, 'websiteImages', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as WebsiteImage;
            } else {
                // If it doesn't exist, check if it's a default one and seed it.
                const defaultImage = defaultImages.find(img => img.id === id);
                if (defaultImage) {
                    await setDoc(doc(db, 'websiteImages', id), defaultImage);
                    return defaultImage;
                }
            }
            return null;
        } catch (error) {
            console.error("Error fetching website image by ID:", error);
            return null;
        }
    }

    async updateWebsiteImage(id: string, newUrl: string): Promise<void> {
        try {
            const docRef = doc(db, 'websiteImages', id);
            await updateDoc(docRef, { imageUrl: newUrl });
        } catch (error) {
            console.error("Error updating website image:", error);
            throw new Error('Could not update image URL in the database.');
        }
    }
}

export const websiteImageService = new WebsiteImageService();
