import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Section from "@/components/layout/Section";
import { Surface } from "@/components/ui/primitives";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const Auth = () => {
  usePageTitle("Sign in", "Sign in to CivicCare to track bills and save care facilities.");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSocialSignIn = async (provider: "google") => {
    setOauthLoading(provider);
    setFormError(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    setOauthLoading(null);

    if (result.error) {
      setFormError("Could not start sign-in. Please try again.");
      return;
    }

    if (result.redirected) return;

    // Session set in place - continue into the app.
    navigate("/care");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setFormError(error.message);
      else navigate("/care");
    } else {
      const { error } = await signUp(email, password);
      if (error) setFormError(error.message);
      else toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
    }
    setLoading(false);
  };

  return (
    <Section>
      <Surface padding="lg" className="mx-auto max-w-md">
        <h1 className="text-2xl tracking-tight text-foreground">{isLogin ? "Welcome back" : "Create an account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin ? "Sign in to track bills and save care facilities." : "Sign up to track bills and save care facilities."}
        </p>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => handleSocialSignIn("google")}
            disabled={oauthLoading !== null || loading}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
            </svg>
            {oauthLoading === "google" ? "Connecting…" : "Continue with Google"}
          </Button>

          <div className="flex items-center gap-3 py-1" aria-hidden="true">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p role="alert" className="rounded-md border border-destructive/40 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormError(null);
            }}
            className="text-accent hover:text-foreground"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </p>
      </Surface>
    </Section>
  );
};

export default Auth;
