'use client'
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useState, useEffect } from 'react';

const features = [
    { title: "Privacy Cut", desc: "Kernel-level redaction stripping PII before LLM processing." },
    { title: "Intent Velocity", desc: "Keystrokes vs Scrolls ratio determines Deep Work vs Doomscrolling." },
    { title: "Resumption Anchors", desc: "Context caching allows one-click restoration of abandoned projects." },
    { title: "Temporal Weighting", desc: "Action taken in the last 30 minutes is weighted 3x over morning goals." },
];

export default function Manifesto() {
    const { isMobile } = useIsMobile();
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        // Check for reduced motion preference on client only
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduceMotion(mediaQuery.matches);

        const handleChange = () => setReduceMotion(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <section
            className="text-swiss-cream py-24 px-4 md:px-12 relative overflow-hidden"
            style={{ backgroundColor: 'rgb(48, 39, 34)' }}
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-8 border-t border-swiss-cream pt-8">
                <div className="col-span-12 md:col-span-4">
                    <h2 className="font-stirus text-6xl md:text-8xl leading-[0.9] text-swiss-orange">
                        ZERO<br />DATA<br />LEAK
                    </h2>
                </div>

                <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((item, i) => {
                        const shouldAnimate = !isMobile && !reduceMotion;
                        return (
                            <motion.div
                                key={i}
                                initial={shouldAnimate ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
                                whileInView={shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                transition={shouldAnimate ? { delay: i * 0.03, duration: 0.3 } : undefined}
                                viewport={{ once: true, amount: 0.3 }}
                                className="border-l border-swiss-cream pl-6 flex flex-col justify-between min-h-[150px] group hover:bg-swiss-cream/5 transition-colors duration-300 p-4"
                                style={{ willChange: 'opacity, transform' }}
                            >
                                <h4 className="font-stirus text-2xl mb-4 text-swiss-cream group-hover:text-swiss-orange transition-colors">{item.title}</h4>
                                <p className="font-harmond text-lg text-swiss-cream opacity-80">{item.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Big Graphic Footer Element */}
            <div className="mt-32 border-y border-swiss-cream py-12">
                <div className="flex flex-wrap gap-4 justify-center items-center font-stirus text-4xl md:text-7xl uppercase text-center leading-none">
                    <span className="text-swiss-gold">Local</span>
                    <span>—</span>
                    <span className="italic">First</span>
                    <span>—</span>
                    <span className="text-swiss-orange">Agentic</span>
                    <span>—</span>
                    <span>OS</span>
                </div>
            </div>
        </section>
    );
}