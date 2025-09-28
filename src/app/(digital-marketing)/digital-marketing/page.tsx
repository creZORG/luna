
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StoreItem } from "@/lib/store-items.data";
import { storeItemService } from "@/services/store-item.service";
import EquipmentRequestClient from "./_components/equipment-request-client";

export default async function DigitalMarketingDashboard() {
    const storeItems: StoreItem[] = await storeItemService.getStoreItems();

    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold">Digital Marketing Portal</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to the Digital Marketing Portal</CardTitle>
                    <CardDescription>This is your dashboard for social media analytics, campaign planning, and ad spend tracking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Feature content for the digital marketing portal will be available here.</p>
                </CardContent>
            </Card>

            <EquipmentRequestClient items={storeItems} />
        </div>
    );
}
