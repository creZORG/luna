
import { redirect } from 'next/navigation';

// This page is now deprecated and replaced by /campaigns.
// We redirect to ensure old bookmarks or links still work.
export default function DigitalMarketingDashboard() {
    redirect('/campaigns');
}
