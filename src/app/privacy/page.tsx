
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
                        This document outlines how Luna Essentials ("we", "us", "our") collects, uses, and protects the personal data of our employees, contractors, and partners ("staff", "you") in relation to the use of our internal company portals and systems.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                    <p>
                        In the course of your employment and use of this portal, we may collect personal information including, but not limited to:
                    </p>
                    <ul>
                        <li>**Identification Data:** Your name, email address, and contact information.</li>
                        <li>**Professional Data:** Your role, department, and qualifications.</li>
                        <li>**Performance Data:** Sales logs, production records, and other data related to your work duties.</li>
                        <li>**Location Data:** Your geographic location (latitude and longitude) at the time of specific actions, such as attendance check-in and check-out, for verification purposes.</li>
                        <li>**Technical Data:** IP addresses, browser type, and usage data related to the portal for security and operational purposes.</li>
                    </ul>


                    <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                    <p>
                        Your data is used strictly for legitimate business purposes, which include:
                    </p>
                    <ul>
                        <li>Managing human resources, including payroll and performance reviews.</li>
                        <li>Operating, maintaining, and securing our internal systems.</li>
                        <li>Managing attendance, including verifying presence at company premises for check-in and check-out.</li>
                        <li>Facilitating internal communication and collaboration.</li>
                        <li>Fulfilling legal and contractual obligations.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-foreground">3. Data Storage and Security</h2>
                    <p>
                        We are committed to ensuring that your information is secure. We use trusted third-party cloud services like Google Firebase and Cloudinary, which provide industry-standard security measures, to store and process data. We implement appropriate technical and organizational measures to prevent unauthorized access, use, or disclosure of your personal data.
                    </p>
                    
                    <h2 className="text-xl font-semibold text-foreground">4. Your Rights</h2>
                    <p>
                        Subject to applicable laws, you have the right to access, correct, or request the deletion of your personal data. Please contact the Human Resources department for any such requests. Note that some data must be retained for legal and operational reasons for the duration of your employment and for a specific period thereafter.
                    </p>
                     <p>
                        <strong>Note:</strong> This policy is a general guideline and must be interpreted in conjunction with your employment contract and local labor laws. This policy may be updated from time to time.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
