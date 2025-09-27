import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OperationsDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Operations Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Operations Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder for the operations portal. Features like cross-department dashboards, task assignments, and alerts will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
