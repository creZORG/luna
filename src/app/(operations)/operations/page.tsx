import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OperationsDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Operations Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Operations Portal</CardTitle>
                    <CardDescription>This is your dashboard for cross-departmental tasks, alerts, and inventory management.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Feature content for the operations portal will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
