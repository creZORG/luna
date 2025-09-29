
import { pickupLocationService } from "@/services/pickup-location.service";
import PickupLocationsClient from "./_components/pickup-locations-client";

export default async function PickupLocationsPage() {
  const locations = await pickupLocationService.getPickupLocations();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Pickup Locations</h1>
        <p className="text-muted-foreground">
          Add or edit the pickup stations available for customer orders.
        </p>
      </div>
      <PickupLocationsClient initialLocations={locations} />
    </div>
  );
}
