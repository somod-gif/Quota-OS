"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { acceptInvitation } from "@/features/workspace/actions";
import { Suspense } from "react";

function AcceptInvitationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing invitation token.");
        return;
      }

      const result = await acceptInvitation(token);

      if (cancelled) return;

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      setStatus("success");
      setMessage("You've joined the workspace!");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {status === "loading" && "Joining workspace..."}
            {status === "success" && "Invitation accepted"}
            {status === "error" && "Invitation failed"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status === "loading" ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Button variant="outline" onClick={() => router.push(status === "success" ? "/dashboard" : "/auth/login")}>
              {status === "success" ? "Go to dashboard" : "Back to sign in"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense>
      <AcceptInvitationInner />
    </Suspense>
  );
}
