import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinanceDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Finance Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Finance Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder for the finance portal. Features like expense logging, payroll, and reporting will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
