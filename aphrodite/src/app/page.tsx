import Hero from "@/components/Hero";
import Fates from "@/components/Fates";
import Manifesto from "@/components/Manifesto";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <div className="h-20 md:h-32 flex items-center justify-center font-harmond text-swiss-orange uppercase text-xs md:text-sm animate-pulse">
        ( Scroll to Weave )
      </div>
      <Fates />
      <Manifesto />

      <footer
        className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 text-swiss-cream font-harmond text-xs uppercase border-t border-swiss-cream"
        style={{ backgroundColor: 'rgb(48, 39, 34)' }}
      >
        <div className="flex flex-col md:text-2xl">
          <span>Agentic OS</span>
          <span>2026</span>
        </div>
        <div className="text-left md:text-right md:text-2xl">
          <p>Moirai Project</p>
          <p>Clotho / Lachesis / Atropos</p>
        </div>
      </footer>
    </main>
  );
}