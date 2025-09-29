
export type PartnerType = 'influencer' | 'delivery-partner' | 'pickup-location';

export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    partnerType: PartnerType;
    message: string;
    status: PartnerApplicationStatus;
    createdAt: any; // Firebase Timestamp
}
