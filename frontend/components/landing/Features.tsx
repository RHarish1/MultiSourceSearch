const features = [
  {
    icon: "🔒",
    title: "Complete Privacy",
    description:
      "Your photos never leave your control. Zero-knowledge encryption ensures only you can access your memories.",
  },
  {
    icon: "🔍",
    title: "Semantic Search",
    description:
      'Search like a human. Use natural language queries: "me and my friends on a picnic" to find exactly what you remember.',
  },
  {
    icon: "☁️",
    title: "Multi-Source Support",
    description:
      "Connect Google Drive, Google Photos, or upload directly from your device. All in one secure vault.",
  },
  {
    icon: "🏷️",
    title: "Smart Tagging",
    description:
      "Organize with purpose. Create custom tags and let AI assist in categorizing your photo collection.",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "Instant search results powered by advanced indexing. Find your memories in milliseconds.",
  },
  {
    icon: "🛡️",
    title: "Privacy First",
    description:
      "No ads. No tracking. No selling your data. PhotoVault respects your privacy above all else.",
  },
];

export function Features() {
  return (
    <section className="px-6 md:px-8 py-32 md:py-48 max-w-6xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground text-balance">
        Why PhotoVault?
      </h2>
      <p className="text-center text-muted-foreground mb-20 text-lg leading-relaxed max-w-2xl mx-auto">
        Everything you need to manage your visual memories privately
      </p>

      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="p-8 md:p-10 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:bg-card/80 hover:shadow-lg"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <span className="text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
