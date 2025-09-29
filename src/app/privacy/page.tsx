
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StaffPrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Staff Privacy Policy</CardTitle>
                     <CardDescription>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground prose dark:prose-invert">
                    <p className="lead">
                        This is a placeholder for the Staff Privacy Policy. This document should detail how you handle and protect the personal data of your employees in accordance with legal requirements like GDPR, CCPA, or local data protection laws.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                    <p>
                        In the course of your employment and use of this portal, we may collect personal information including, but not limited to, your name, email address, contact information, performance data, and location data for features like attendance check-in.
                    </p>

                    <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                    <p>
                        Your data is used strictly for legitimate business purposes, such as:
                    </p>
                    <ul>
                        <li>Managing payroll and human resources.</li>
                        <li>Operating and securing our internal systems.</li>
                        <li>Facilitating communication and collaboration.</li>
                        <li>Complying with legal obligations.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-foreground">3. Data Storage and Security</h2>
                    <p>
                        We are committed to ensuring that your information is secure. We use trusted third-party services like Google Firebase and Cloudinary to store and process data, and we implement appropriate technical measures to prevent unauthorized access or disclosure.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">4. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or request the deletion of your personal data, subject to legal and contractual obligations. Please contact HR for any such requests.
                    </p>
                     <p>
                        [This policy must be reviewed by a legal professional to ensure it complies with all applicable laws and regulations.]
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
