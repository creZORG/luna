
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { userService, UserProfile } from "@/services/user.service"
import { Badge } from "@/components/ui/badge"

export default async function StaffManagementPage() {
  const users = await userService.getUsers();

  const getRoleBadge = (role: UserProfile['roles'][number]) => {
    const variant = {
      admin: "default",
      sales: "secondary",
      operations: "secondary",
      finance: "secondary",
      manufacturing: "secondary",
      "digital-marketing": "secondary",
    }[role]  || 'outline'
    
    return <Badge variant={variant as any} className="capitalize">{role.replace(/-/g, ' ')}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
        <CardDescription>
          View and manage user roles within the organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {user.roles.length > 0 
                      ? user.roles.map(role => getRoleBadge(role))
                      : <Badge variant="destructive">No Roles</Badge>
                    }
                  </div>
                </TableCell>
                <TableCell>
                  {/* Future actions like 'Edit Roles' will go here */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
