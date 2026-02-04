'use client'
import React from 'react';
import ScrollStack, { ScrollStackCard } from './ScrollStack';

const fates = [
  {
    name: "I. CLOTHO",
    role: "The Spinner",
    desc: "The Gasper. High-performance 'Go' backend monitoring raw system data.",
    tech: "Go",
    color: "bg-swiss-cream",
    textColor: "text-swiss-black",
    borderColor: "border-swiss-black",
  },
  {
    name: "II. LACHESIS",
    role: "The Measurer",
    desc: "The Weaver. Processes raw spools into a coherent life narrative using local LLMs.",
    tech: "Groq / Ollama (Future Plans",
    color: "bg-swiss-black",
    textColor: "text-swiss-cream",
    borderColor: "border-swiss-cream",
  },
  {
    name: "III. ATROPOS",
    role: "The Inflexible",
    desc: "The Cutter. The intent dashboard where noise is cut and focus is resumed.",
    tech: "Electron / React",
    color: "bg-swiss-orange",
    textColor: "text-swiss-cream",
    borderColor: "border-swiss-black",
  }
];

export default function Fates() {
  const cards: ScrollStackCard[] = fates.map((fate) => ({
    title: fate.name,
    subtitle: fate.role,
    className: `${fate.color} ${fate.textColor} border-2 ${fate.borderColor} rounded-sm`,
    content: (
      <div className="w-full h-full p-8 md:p-12 flex flex-col justify-between">
        <div className="flex flex-col md:flex-row justify-between border-b border-current pb-4 mb-8">
          <h3 className="font-stirus text-4xl md:text-6xl uppercase">{fate.name}</h3>
          <span className="font-harmond text-xl uppercase tracking-widest">{fate.role}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-2xl md:text-4xl font-harmond leading-tight">
            {fate.desc}
          </div>
          <div className="flex flex-col justify-end items-start md:items-end">
            <p className="font-mono text-sm opacity-70 mb-2">TECHNOLOGY STACK</p>
            <p className="font-stirus text-2xl">{fate.tech}</p>
          </div>
        </div>
      </div>
    )
  }));

  return (
    <div className="relative">
      <ScrollStack
        cards={cards}
        backgroundColors={["rgb(250, 243, 225)", "rgb(34, 34, 34)", "rgb(250, 129, 18)", "rgb(48, 39, 34)"]}
        titleColors={["rgb(100, 100, 100)", "rgb(200, 200, 200)", "rgb(60, 60, 60)", "rgb(180, 180, 180)"]}
        cardHeight="60vh"
        sectionHeightMultiplier={14}
        pageTitle={
          <h2 className="font-stirus text-[15vw] md:text-[15vw] opacity-100 pointer-events-none whitespace-nowrap z-0 uppercase">
            The Fates
          </h2>
        }
      />
    </div>
  );
}
