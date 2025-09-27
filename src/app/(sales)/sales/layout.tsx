import AdminLayout from "@/app/(admin)/admin/layout";

export default function SalesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
