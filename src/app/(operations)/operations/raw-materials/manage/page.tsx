
import { rawMaterialService } from "@/services/raw-material.service";
import ManageMaterialsClient from "./_components/manage-materials-client";

export default async function ManageRawMaterialsPage() {
    const materials = await rawMaterialService.getRawMaterials();

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Manage Raw Materials</h1>
                <p className="text-muted-foreground">
                    Add new raw materials to the master list or adjust the inventory levels for existing ones.
                </p>
            </div>
            <ManageMaterialsClient initialMaterials={materials} />
        </div>
    )
}
