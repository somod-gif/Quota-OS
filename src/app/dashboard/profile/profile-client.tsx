"use client";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, UserRound, CalendarDays, ShieldCheck } from "lucide-react";

interface ProfileClientProps {
  fullName: string;
  email: string;
  initials: string;
  memberSince: string;
  userId: string;
}

export function ProfileClient({ fullName, email, initials, memberSince, userId }: ProfileClientProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold">{fullName || "Unnamed user"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Account Information</CardTitle>
          <CardDescription>Details from your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Full name</p>
              <p className="text-sm font-medium">{fullName || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{email || "—"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium">{memberSince}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="text-sm font-mono">{userId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
