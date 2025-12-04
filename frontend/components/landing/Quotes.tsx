const quotes = [
  {
    quote: "\"Photography is the story I fail to put into words.\" — Destin Sparks",
    description:
      "Your photos are your story. PhotoVault ensures that story remains yours alone—protected and private.",
  },
  {
    quote: "\"The right to privacy is more important than ever in the digital age.\"",
    description:
      "We believe your personal moments deserve encryption, not exposure. That's the PhotoVault difference.",
  },
];

export function Quotes() {
  return (
    <section className="px-6 md:px-8 py-32 md:py-48 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-20 text-foreground">
        Trust Matters
      </h2>
      <div className="space-y-8 md:space-y-10">
        {quotes.map((item, index) => (
          <div
            key={index}
            className="p-10 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all"
          >
            <p className="text-lg mb-4 text-foreground leading-relaxed italic">
              {item.quote}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
