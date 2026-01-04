import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
} from "@repo/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
        <aside className="-mx-4 lg:w-1/5">
           <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 pl-4 lg:pl-0">
             <Button variant="ghost" className="justify-start hover:bg-muted bg-muted">Profile</Button>
             <Button variant="ghost" className="justify-start hover:bg-muted">Account</Button>
             <Button variant="ghost" className="justify-start hover:bg-muted">Appearance</Button>
           </nav>
        </aside>
        
        <div className="flex-1 lg:max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/avatars/01.png" alt="@jdoe" />
                  <AvatarFallback className="text-lg">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="John Doe" defaultValue="John Doe" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="I'm a software engineer based in..." />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
