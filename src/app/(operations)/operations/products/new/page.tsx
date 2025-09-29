import { ProductForm } from "../_components/product-form";

export default function NewProductPage() {
    return (
        <div>
             <div className="mb-6">
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <p className="text-muted-foreground">Fill in the details below to create a new product in the catalog.</p>
            </div>
            <ProductForm />
        </div>
    )
}
