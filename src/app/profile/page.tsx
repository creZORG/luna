import ProfileClient from "./_components/profile-client";

export default function ProfilePage() {

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-headline font-bold">My Account</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here you can manage your orders and personal information.
                </p>
            </div>
            <ProfileClient />
        </div>
    )
}
