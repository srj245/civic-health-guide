import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import PageHero from "@/components/sections/PageHero";
import Section from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const NotFound = () => {
  const location = useLocation();
  usePageTitle("Page not found", "That page does not exist.");

  useEffect(() => {
    console.error("404: no route for", location.pathname);
  }, [location.pathname]);

  return (
    <div>
      <PageHero badge="Error 404" title="Page not found" subtitle="The link may be out of date, or the page may have moved." />
      <Section first width="prose" className="text-center">
        <p className="text-sm text-muted-foreground">
          There is nothing at{" "}
          <code className="rounded-md border border-border bg-card px-1.5 py-0.5 text-foreground">{location.pathname}</code>.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to home</Link>
        </Button>
      </Section>
    </div>
  );
};

export default NotFound;
