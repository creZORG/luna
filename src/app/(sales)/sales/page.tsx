import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Sales Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Sales Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder for the sales portal. Features like client databases, sales targets, and order management will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
