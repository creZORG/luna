
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReferralLink } from "@/lib/referrals.data";
import { format } from "date-fns";
import { Copy, Loader, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { referralService } from "@/services/referral.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReferralLinksClient() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [links, setLinks] = useState<ReferralLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            referralService.getReferralLinksByMarketer(user.uid)
                .then(setLinks)
                .finally(() => setIsLoading(false));
        }
    }, [user]);


    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'The shortlink has been copied to your clipboard.' });
    };

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Your Referral Links</CardTitle>
                    <CardDescription>A list of all shortlinks you have created and their click stats.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Referral Links</CardTitle>
                <CardDescription>A list of all shortlinks you have created and their click stats.</CardDescription>
            </CardHeader>
            <CardContent>
                 {links.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">You haven't created any referral links yet.</p>
                    </div>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shortlink</TableHead>
                            <TableHead className="hidden md:table-cell">Campaign</TableHead>
                            <TableHead className="hidden lg:table-cell">Destination</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {links.map((link) => (
                            <TableRow key={link.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{link.shortUrl}</a>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(link.shortUrl)}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="text-xs text-muted-foreground lg:hidden truncate">{link.destinationUrl}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{link.campaignName || 'N/A'}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <span className="text-muted-foreground truncate">{link.destinationUrl}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="font-bold">{link.clickCount}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
    );
}
