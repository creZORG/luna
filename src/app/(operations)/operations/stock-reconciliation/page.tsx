
import { storeItemService } from "@/services/store-item.service";
import { userService } from "@/services/user.service";
import ReconciliationClient from "./_components/reconciliation-client";

export default async function StockReconciliationPage() {
    // 1. Get all finished goods that can be assigned
    const allStoreItems = await storeItemService.getStoreItems();
    const finishedGoods = allStoreItems.filter(item => item.category === 'Finished Goods');

    // 2. Get all salespeople who can be assigned stock
    const allUsers = await userService.getUsers();
    const salespeople = allUsers.filter(user => user.roles.includes('sales'));
    
    return (
        <div className="grid gap-6">
             <div>
                <h1 className="text-3xl font-bold">Salesperson Stock Reconciliation</h1>
                <p className="text-muted-foreground">
                    Log stock issued to and returned from salespeople. The system will calculate sales automatically.
                </p>
            </div>
            <ReconciliationClient 
                assignableStock={finishedGoods}
                salespeople={salespeople}
            />
        </div>
    )
}

    