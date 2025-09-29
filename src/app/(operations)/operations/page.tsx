
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, Warehouse, Package, MapPin } from "lucide-react";
import Link from "next/link";

export default function OperationsDashboard() {
    
    return (
       <Card>
           <CardHeader>
               <CardTitle>Welcome to the Operations Dashboard</CardTitle>
               <CardDescription>Select a tab above to manage products, inventory, or logistics.</CardDescription>
           </CardHeader>
           <CardContent>
                <p>This is your central hub for all operational tasks.</p>
           </CardContent>
       </Card>
    );
}
