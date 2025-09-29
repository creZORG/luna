
export type ProductFeature = 'vegan' | 'paraben-free' | 'microplastic-free' | 'natural-fragrance' | 'recycled-packaging';
export type ScentProfile = 'citrus' | 'floral' | 'fruity' | 'minty' | 'warm-earthy';
export type ProductCategory = 'shower-gel' | 'fabric-softener' | 'dish-wash';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  sizes: { 
    size: string; 
    price: number;
    wholesalePrice?: number;
  }[];
  description: string;
  keyBenefits: string[];
  ingredients: string[];
  directions: string;
  cautions: string;
  imageUrl: string;
  galleryImageUrls?: string[];
  shortDescription: string;
  wholesaleDiscountPercentage?: number;
  wholesaleMoq?: number;
  platformFee?: number;
  rating: number;
  reviewCount: number;
};

export const products: Product[] = [
  
];

export const ALL_CATEGORIES: ProductCategory[] = ['shower-gel', 'fabric-softener', 'dish-wash'];
export const ALL_SIZES = Array.from(new Set(products.flatMap(p => p.sizes.map(s => s.size))));
