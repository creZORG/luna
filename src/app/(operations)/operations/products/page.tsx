
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
  import { Edit, Eye, Package, PlusCircle, TrendingUp } from "lucide-react"
  import Link from "next/link"
  import Image from "next/image"
  import { Badge } from "@/components/ui/badge"
  import { getProducts } from "@/services/product.service"
import { Product } from "@/lib/data"

  
  export default async function ProductsPage() {
    const products: Product[] = await getProducts();

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Finished Goods</CardTitle>
                <CardDescription>
                Manage your finished products and view their performance metrics.
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
                <TableHead>Revenue</TableHead>
                <TableHead className="hidden md:table-cell">Orders</TableHead>
                <TableHead className="hidden md:table-cell">Views</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                  return (
                    <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                        {product.imageUrl && <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.imageUrl}
                            width="64"
                        />}
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                          <div className="text-xs text-muted-foreground capitalize">{product.category.replace(/-/g, ' ')}</div>
                        </TableCell>
                         <TableCell>
                          <div className="font-semibold">Ksh {product.totalRevenue?.toLocaleString() ?? 0}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                           <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{product.orderCount ?? 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{product.viewCount?.toLocaleString() ?? 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <Button asChild size="icon" variant="outline">
                             <Link href={`/operations/products/${product.id}/edit`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                           </Button>
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
