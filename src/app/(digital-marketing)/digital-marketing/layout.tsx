
import AdminLayout from "@/app/(admin)/admin/layout";

export default function DigitalMarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
