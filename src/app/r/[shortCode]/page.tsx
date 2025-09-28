
import { referralService } from "@/services/referral.service";
import { notFound, redirect } from "next/navigation";

type Props = {
    params: { shortCode: string };
};

export default async function ShortLinkRedirectPage({ params }: Props) {
    const { shortCode } = params;

    if (!shortCode) {
        notFound();
    }
    
    const referral = await referralService.getAndTrackReferral(shortCode);

    if (!referral) {
        notFound();
    }

    // Perform the redirect on the server side
    redirect(referral.destinationUrl);

    // This part will not be rendered because of the redirect.
    // It's here as a fallback.
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Redirecting...</p>
        </div>
    );
}

