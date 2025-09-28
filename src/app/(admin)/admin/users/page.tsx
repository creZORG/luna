
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { userService } from "@/services/user.service"
import UsersClient from "./_components/users-client"

export default async function StaffManagementPage() {
  const users = await userService.getUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Management</CardTitle>
        <CardDescription>
          View, edit roles, and communicate with users across the organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UsersClient initialUsers={users} />
      </CardContent>
    </Card>
  )
}
