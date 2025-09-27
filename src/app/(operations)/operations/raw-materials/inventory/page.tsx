
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
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { rawMaterialService } from "@/services/raw-material.service"
import { Badge } from "@/components/ui/badge";

export default async function RawMaterialsInventoryPage() {
    const materials = await rawMaterialService.getRawMaterials();

    const lowStockThreshold = 10; // Define what "low stock" means
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Raw Material Inventory</CardTitle>
                <CardDescription>
                    A real-time view of all raw materials currently in stock.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material Name</TableHead>
                            <TableHead className="text-right">Quantity In Stock</TableHead>
                             <TableHead>Unit</TableHead>
                             <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.map(material => (
                            <TableRow key={material.id}>
                                <TableCell className="font-medium">{material.name}</TableCell>
                                <TableCell className="text-right font-bold">{material.quantity.toLocaleString()}</TableCell>
                                <TableCell>{material.unitOfMeasure}</TableCell>
                                <TableCell>
                                    {material.quantity <= 0 ? (
                                        <Badge variant="destructive">Out of Stock</Badge>
                                    ) : material.quantity < lowStockThreshold ? (
                                        <Badge variant="secondary" className="bg-yellow-500/80 text-white">Low Stock</Badge>
                                    ): (
                                        <Badge className="bg-green-600/80">In Stock</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
