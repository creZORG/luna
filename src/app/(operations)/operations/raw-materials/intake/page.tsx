
import { rawMaterialService } from "@/services/raw-material.service";
import IntakeFormClient from "./_components/intake-form-client";

export default async function RawMaterialIntakePage() {
    const rawMaterials = await rawMaterialService.getRawMaterials();

    return (
        <div className="grid gap-6">
             <div>
                <h1 className="text-3xl font-bold">Raw Material Intake</h1>
                <p className="text-muted-foreground">Log a new delivery of raw materials and perform quality checks.</p>
            </div>
            <IntakeFormClient rawMaterials={rawMaterials} />
        </div>
    )
}
