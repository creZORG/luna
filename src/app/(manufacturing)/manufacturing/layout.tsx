import AdminLayout from "@/app/(admin)/admin/layout";

export default function ManufacturingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}
