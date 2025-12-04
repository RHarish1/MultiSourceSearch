import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="px-6 md:px-8 py-24 text-center max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold mb-10 text-foreground leading-tight text-balance">
        Your Memories, Your Control
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-16 leading-relaxed max-w-2xl mx-auto">
        PhotoVault is your private sanctuary for organizing and discovering
        photos. End-to-end encryption, semantic search, and complete
        privacy—because your memories deserve protection.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
        <Link href="/signup">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto px-8"
          >
            Start Your Journey
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          className="border-border text-primary hover:bg-primary/5 bg-transparent w-full sm:w-auto px-8"
        >
          Learn More
        </Button>
      </div>

      {/* Trust Badge */}
      <div className="inline-block px-6 py-3 rounded-full bg-card border border-border/50 hover:border-border transition-colors">
        <p className="text-sm text-muted-foreground">
          ✓ Zero-Knowledge Architecture &nbsp; • &nbsp; ✓ Your Data, Your
          Privacy &nbsp; • &nbsp; ✓ Semantic Search
        </p>
      </div>
    </section>
  );
}
