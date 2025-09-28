import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FinanceDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Finance Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Finance Portal</CardTitle>
                    <CardDescription>This is your dashboard for expense logging, payroll, and financial reporting.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Feature content for the finance portal will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
