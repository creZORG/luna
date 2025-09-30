
import { pickupLocationService } from "@/services/pickup-location.service";
import { userService } from "@/services/user.service";
import PickupLocationsClient from "./_components/pickup-locations-client";

export default async function PickupLocationsPage() {
  const locations = await pickupLocationService.getPickupLocations();
  const partners = await userService.getUsersByRole('pickup-location-staff');

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Pickup Locations</h1>
        <p className="text-muted-foreground">
          Add or edit pickup stations and assign partners to manage them.
        </p>
      </div>
      <PickupLocationsClient initialLocations={locations} partners={partners} />
    </div>
  );
}
