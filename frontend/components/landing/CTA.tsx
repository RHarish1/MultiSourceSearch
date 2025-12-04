import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-6 md:px-8 py-32 md:py-48 max-w-2xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-8 text-foreground text-balance">
        Ready to Secure Your Memories?
      </h2>
      <p className="text-muted-foreground mb-12 text-lg leading-relaxed">
        Join thousands who trust PhotoVault with their most precious moments.
      </p>
      <Link href="/signup">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
          Create Your Free Account
        </Button>
      </Link>
    </section>
  );
}
