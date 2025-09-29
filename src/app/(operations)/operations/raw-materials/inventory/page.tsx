
import { redirect } from 'next/navigation';

// This page is now deprecated and replaced by /manage.
// We redirect to ensure old bookmarks or links still work.
export default function RawMaterialsInventoryPage() {
    redirect('/operations/raw-materials/manage');
}
