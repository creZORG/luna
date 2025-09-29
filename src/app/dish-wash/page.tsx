
import { getProducts } from "@/services/product.service";
import { ProductCard } from "@/app/products/_components/product-card";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Dish Wash | Luna Essentials',
    description: 'Discover our powerful and delightfully scented dish washing liquids.',
};

export default async function DishWashPage() {
    const allProducts = await getProducts();
    const dishWashProducts = allProducts.filter(p => p.category === 'dish-wash');

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">Dish Wash</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Experience the power of our dish wash liquids, leaving your dishes sparkling clean with fresh, natural scents.
                </p>
            </div>

            {dishWashProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {dishWashProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">No Dish Wash Products Available</h2>
                    <p className="text-muted-foreground mt-2">Please check back later for our collection of dish wash liquids.</p>
                </div>
            )}
        </div>
    )
}
