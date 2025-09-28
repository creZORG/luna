import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ManufacturingDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manufacturing Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Manufacturing Portal</CardTitle>
                    <CardDescription>This is your dashboard for production schedules, stock levels, and quality control.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Feature content for the manufacturing portal will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
