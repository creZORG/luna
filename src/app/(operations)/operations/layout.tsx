import AdminLayout from "@/app/(admin)/admin/layout";

export default function OperationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
