
export interface ReferralLink {
    id: string; // The unique short code
    destinationUrl: string;
    shortUrl: string;
    campaignName?: string;
    marketerId: string;
    marketerName: string;
    clickCount: number;
    createdAt: any; // Firebase Timestamp
}
