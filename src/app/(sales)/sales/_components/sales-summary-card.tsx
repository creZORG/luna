import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SalesSummaryCardProps {
    title: string;
    value: string;
    description: string;
    variant?: 'default' | 'destructive';
}

export default function SalesSummaryCard({ title, value, description, variant = 'default' }: SalesSummaryCardProps) {
    return (
        <Card className={cn(variant === 'destructive' && 'bg-destructive/10 border-destructive')}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className={cn("text-4xl", variant === 'destructive' && 'text-destructive')}>
                    {value}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
