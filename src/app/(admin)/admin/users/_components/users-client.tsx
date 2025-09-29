
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/services/user.service"
import { Button } from "@/components/ui/button";
import { Edit, Mail } from "lucide-react";
import { useState } from "react";
import { EditRolesModal } from "./edit-roles-modal";
import { EmailUserModal } from "./email-user-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ALL_ROLES = ['admin', 'sales', 'operations', 'finance', 'manufacturing', 'digital-marketing'];

const getRoleBadge = (role: UserProfile['roles'][number]) => {
    const variant = {
      admin: "default",
      sales: "secondary",
      operations: "secondary",
      finance: "secondary",
      manufacturing: "secondary",
      "digital-marketing": "secondary",
    }[role]  || 'outline'
    
    return <Badge key={role} variant={variant as any} className="capitalize">{role.replace(/-/g, ' ')}</Badge>
}

export default function UsersClient({ initialUsers }: { initialUsers: UserProfile[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    const handleOpenRolesModal = (user: UserProfile) => {
        setSelectedUser(user);
        setIsRolesModalOpen(true);
    }
    
    const handleOpenEmailModal = (user: UserProfile) => {
        setSelectedUser(user);
        setIsEmailModalOpen(true);
    }

    const handleRolesUpdated = (uid: string, newRoles: UserProfile['roles']) => {
        setUsers(currentUsers => 
            currentUsers.map(u => u.uid === uid ? { ...u, roles: newRoles } : u)
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                    <TableRow key={user.uid}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.photoURL || `https://i.pravatar.cc/40?u=${user.uid}`} alt={user.displayName} />
                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{user.displayName}</div>
                            </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                        <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 
                            ? user.roles.map(role => getRoleBadge(role))
                            : <Badge variant="destructive">No Roles</Badge>
                            }
                        </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleOpenRolesModal(user)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit Roles</span>
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleOpenEmailModal(user)}>
                                    <Mail className="h-4 w-4" />
                                    <span className="sr-only">Send Email</span>
                                </Button>
                           </div>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
            
            {selectedUser && (
                <>
                    <EditRolesModal 
                        isOpen={isRolesModalOpen}
                        onClose={() => setIsRolesModalOpen(false)}
                        user={selectedUser}
                        allRoles={ALL_ROLES}
                        onRolesUpdated={handleRolesUpdated}
                    />
                    <EmailUserModal
                        isOpen={isEmailModalOpen}
                        onClose={() => setIsEmailModalOpen(false)}
                        user={selectedUser}
                    />
                </>
            )}
        </>
    )
}
