
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Factory } from "lucide-react";

export default function ManufacturingDashboard() {
    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold">Manufacturing Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Manufacturing Portal</CardTitle>
                    <CardDescription>This is your dashboard for logging production runs and managing manufacturing processes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-muted-foreground">Log a new production run to update your inventory, converting raw materials into finished goods.</p>
                     <Button asChild>
                        <Link href="/manufacturing/production-runs">
                            <Factory className="mr-2 h-4 w-4" />
                            Go to Production Runs
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
