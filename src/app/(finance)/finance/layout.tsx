import AdminLayout from "@/app/(admin)/admin/layout";

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
