"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function HomePage() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [isLogin, setIsLogin] = useState(!inviteToken);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [inviteInfo, setInviteInfo] = useState<{ email: string; role: string } | null>(null);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    if (inviteToken) {
      fetch(`/api/invitations/verify?token=${inviteToken}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setInviteInfo(data);
            setForm((f) => ({ ...f, email: data.email }));
          } else {
            addToast({ title: "Invalid invitation", description: "This invite link is invalid or expired", variant: "destructive" });
          }
        })
        .catch(() => {});
    }
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.error) {
          addToast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else {
          router.push("/dashboard");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          addToast({ title: "Account created", description: "Please sign in" });
          setIsLogin(true);
        } else {
          const data = await res.json();
          addToast({
            title: "Registration failed",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
        }
      }
    } catch {
      addToast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Story Bible</CardTitle>
          <CardDescription>
            {isLogin
              ? "Sign in to manage your story"
              : inviteInfo
                ? `You've been invited as a ${inviteInfo.role}`
                : "Create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                readOnly={!!inviteInfo && !isLogin}
                className={inviteInfo && !isLogin ? "bg-muted" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Register"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
