
import { getProductById } from "@/services/product.service";
import { ProductForm } from "../../_components/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await getProductById(params.id);

    if (!product) {
        return notFound();
    }

    return (
        <div>
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-muted-foreground">Update the details for {product.name}.</p>
            </div>
            <ProductForm role="operations" product={product} />
        </div>
    );
}
