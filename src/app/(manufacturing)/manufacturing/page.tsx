import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManufacturingDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manufacturing Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Manufacturing Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a placeholder for the manufacturing portal. Features like production schedules, stock levels, and quality control checklists will be available here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
