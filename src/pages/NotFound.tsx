import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const NotFound = () => {
  const location = useLocation();
  usePageTitle("Page not found", "That page does not exist.");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="bg-background">
      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Error 404</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Page not found</h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">
            There is nothing at <code className="rounded border border-border bg-card px-1.5 py-0.5 text-sm">{location.pathname}</code>.
            The link may be out of date.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Return to home</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
