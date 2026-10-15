import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
