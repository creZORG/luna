
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { ProductForm } from "@/app/(operations)/operations/products/_components/product-form";
  
  export default async function ProductsAdminPage() {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Product Pricing</h1>
          <p className="text-muted-foreground">Set and update the prices for different product sizes. This section is for administrators.</p>
        </div>
        <ProductForm role="admin" />
      </div>
    )
  }
  
