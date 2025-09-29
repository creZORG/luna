
import { partnerService } from '@/services/partner.service';
import PartnerRequestClient from './_components/partner-request-client';

export default async function PartnerRequestsPage() {
    const requests = await partnerService.getApplications();

    return (
        <div className="grid gap-6">
            <div>
                <h1 className="text-3xl font-bold">Partner Requests</h1>
                <p className="text-muted-foreground">
                    Review and approve new partnership applications.
                </p>
            </div>
            <PartnerRequestClient initialRequests={requests} />
        </div>
    );
}
