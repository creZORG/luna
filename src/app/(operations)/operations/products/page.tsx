import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { PlusCircle } from "lucide-react"
  import Link from "next/link"
  import Image from "next/image"
  import { PlaceHolderImages } from "@/lib/placeholder-images"
  import { Badge } from "@/components/ui/badge"
  import { productService } from "@/services/product.service"
import { Product } from "@/lib/data"

  
  export default async function ProductsPage() {
    const products: Product[] = await productService.getProducts();

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                Manage your products. Add new products and view existing ones.
                </CardDescription>
            </div>
            <Button asChild size="sm" className="gap-1">
                <Link href="/operations/products/new">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Product
                    </span>
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">
                  Price
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                  const productImage = PlaceHolderImages.find(img => img.id === product.imageId);
                  return (
                    <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                        {productImage && <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={productImage.imageUrl}
                            width="64"
                        />}
                        </TableCell>
                        <TableCell className="font-medium">
                        {product.name}
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{product.category.replace(/-/g, ' ')}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                        {product.sizes[0].price > 0 ? `KShs ${product.sizes[0].price.toFixed(2)}` : 'Not Set'}
                        </TableCell>
                        <TableCell>
                           {/* Add actions here, e.g., Edit, Delete */}
                        </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong>{" "}
            products
          </div>
        </CardFooter>
      </Card>
    )
  }
  
