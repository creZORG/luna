
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { activityService, ActivityLog } from "@/services/activity.service"
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function RecentActivitiesPage() {
  const activities: ActivityLog[] = await activityService.getRecentActivities(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Staff Activities</CardTitle>
        <CardDescription>
          A log of the most recent activities across all staff portals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {activities.map((activity) => (
                    <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.description}</TableCell>
                        <TableCell>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://i.pravatar.cc/32?u=${activity.userId}`} alt={activity.userName} />
                                    <AvatarFallback>{activity.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{activity.userName}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                            {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
