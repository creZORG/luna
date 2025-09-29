
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StaffTermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Staff Terms of Service</CardTitle>
                    <CardDescription>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground prose dark:prose-invert">
                    <p className="lead">
                        This is a placeholder document for the Staff Terms of Service. It is essential to replace this content with your company's official internal policies regarding the use of company software, data handling, and employee conduct.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                    <p>
                        Welcome to the Luna Essentials staff portal. These terms outline the rules and regulations for the use of Luna Essentials' internal software and systems. By accessing this portal, you agree to comply with these terms.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">2. Use of Portal</h2>
                    <p>
                        The staff portal is for authorized business purposes only. Usage may be monitored to ensure compliance with company policies. Unauthorized access or use of this system is strictly prohibited.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">3. Confidentiality</h2>
                    <p>
                        All information within this portal, including but not limited to sales data, customer information, and internal communications, is considered confidential. You are obligated to protect this information and not disclose it to any third parties without explicit authorization.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                    <p>
                        You are responsible for maintaining the security of your account credentials. Do not share your password with anyone. Report any suspected security breaches to the IT department immediately.
                    </p>

                    <p>
                        [This section should be expanded with your specific legal and HR policies.]
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
