
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
import { Copy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralLinksClientProps {
    initialLinks: ReferralLink[];
}

export default function ReferralLinksClient({ initialLinks }: ReferralLinksClientProps) {
    const { toast } = useToast();

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: 'Link Copied!', description: 'The shortlink has been copied to your clipboard.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Referral Links</CardTitle>
                <CardDescription>A list of all shortlinks you have created and their click stats.</CardDescription>
            </CardHeader>
            <CardContent>
                 {initialLinks.length === 0 ? (
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
                        {initialLinks.map((link) => (
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

