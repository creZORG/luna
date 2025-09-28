import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Warehouse, Package } from "lucide-react";
import Link from "next/link";

export default function OperationsDashboard() {
    
    const dashboardCards = [
        {
            title: "Finished Goods",
            description: "View and manage the product catalog.",
            icon: Package,
            href: "/operations/products"
        },
        {
            title: "Raw Material Intake",
            description: "Log new deliveries from suppliers.",
            icon: Truck,
            href: "/operations/raw-materials/intake"
        },
        {
            title: "Material Inventory",
            description: "Check current stock levels of raw materials.",
            icon: Warehouse,
            href: "/operations/raw-materials/inventory"
        }
    ];

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Operations Dashboard</h1>
                <p className="text-muted-foreground">Manage inventory, logistics, and production quality control.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardCards.map(card => (
                    <Link href={card.href} key={card.title}>
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <card.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">{card.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
