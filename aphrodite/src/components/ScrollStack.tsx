"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

export interface ScrollStackCard {
    title: string;
    subtitle?: string;
    badge?: string;
    backgroundImage?: string;
    content?: React.ReactNode;
    // New properties to support old styling
    className?: string;
    style?: React.CSSProperties;
}

interface ScrollStackProps {
    cards: ScrollStackCard[];
    cardHeight?: string;
    sectionHeightMultiplier?: number;
    className?: string;
    pageTitle?: React.ReactNode;
    backgroundColors?: string[];
    titleColors?: string[];
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    cards,
    cardHeight = "60vh",
    sectionHeightMultiplier = 4,
    className = "",
    pageTitle,
    backgroundColors = ["rgb(250, 243, 225)", "rgb(34, 34, 34)", "rgb(250, 129, 18)", "rgb(48, 39, 34)"],
    titleColors = ["rgb(34, 34, 34)", "rgb(250, 243, 225)", "rgb(34, 34, 34)", "rgb(250, 243, 225)"],
}) => {
    // Factor to increase the "pause" or active time of each card
    // We scale the total height and the logical "total" count to spread out the entry points
    // while keeping the entry animation duration (relative to pixels) roughly constant.
    const activationBuffer = 1;

    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Effective values scaling
    const effectiveHeightMultiplier = sectionHeightMultiplier * activationBuffer;

    // Scale the start offset down so we don't have a massive empty space at the top
    const startOffset = 0.2 / activationBuffer;

    // Title opacity: Adjusted to fade out over similar physical distance
    const titleOpacity = useTransform(scrollYProgress, [0, 0.15 / activationBuffer], [1, 0.2]);

    // Adjusted progress for cards
    const cardProgress = useTransform(scrollYProgress, [startOffset, 1], [0, 1]);

    // Calculate dynamic color stops based on card entry to sync with scroll
    const { bgDomain, bgRange, textRange } = React.useMemo(() => {
        // Must match variables defined in component
        // activationBuffer is 3
        const totalPoints = cards.length * activationBuffer;
        const slideDuration = 1 / totalPoints;
        const entryDelay = slideDuration * 0.6; // Matches the 0.6 in CardWrapper

        const domain: number[] = [0];

        // Helper to safely access colors with fallback
        const safeBg = (i: number) => backgroundColors[Math.min(i, backgroundColors.length - 1)] || "#fff";
        const safeTitle = (i: number) => titleColors[Math.min(i, titleColors.length - 1)] || "#000";

        // Start with the first card's color
        const bg: string[] = [safeBg(0)];
        const text: string[] = [safeTitle(0)];

        for (let i = 1; i < cards.length; i++) {
            // Logic must match CardWrapper index distribution
            const cpStart = (i * activationBuffer) / totalPoints;
            const spStart = startOffset + cpStart * (1 - startOffset);

            const cpEnd = cpStart + entryDelay;
            const spEnd = startOffset + cpEnd * (1 - startOffset);

            // 1. Hold previous color until start of new card
            domain.push(spStart);
            bg.push(safeBg(i - 1));
            text.push(safeTitle(i - 1));

            // 2. Transition to new color as card enters
            domain.push(spEnd);
            bg.push(safeBg(i));
            text.push(safeTitle(i));
        }

        // Handle any additional colors (like transitioning to brown at the end)
        if (backgroundColors.length > cards.length) {
            const lastKnownPoint = domain[domain.length - 1];
            // Hold the orange color for longer (increased gap from 0.02 to 0.15)
            const transitionStart = lastKnownPoint + 0.1;
            // Transition to brown right as we reach the very end
            const transitionEnd = 0.98;

            if (transitionStart < transitionEnd) {
                domain.push(transitionStart);
                bg.push(safeBg(cards.length - 1));
                text.push(safeTitle(cards.length - 1));

                domain.push(transitionEnd);
                bg.push(safeBg(backgroundColors.length - 1));
                text.push(safeTitle(backgroundColors.length - 1));
            }
        }

        if (domain[domain.length - 1] < 1) {
            domain.push(1);
            bg.push(safeBg(backgroundColors.length - 1));
            text.push(safeTitle(backgroundColors.length - 1));
        }

        return { bgDomain: domain, bgRange: bg, textRange: text };
    }, [cards.length, activationBuffer, startOffset, backgroundColors, titleColors]);

    // Map scroll progress to background colors
    const backgroundColor = useTransform(scrollYProgress, bgDomain, bgRange);

    // Map scroll progress to title colors
    const titleColor = useTransform(scrollYProgress, bgDomain, textRange);

    return (
        <motion.section
            ref={containerRef}
            className={`relative w-full ${className}`}
            style={{
                height: `${effectiveHeightMultiplier * 100}vh`,
                backgroundColor,
                willChange: "background-color"
            }}
        >
            <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
                {pageTitle && (
                    <motion.div
                        style={{ opacity: titleOpacity, color: titleColor, willChange: "opacity, color" }}
                        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
                    >
                        {pageTitle}
                    </motion.div>
                )}

                <div className="container px-6 lg:px-8 mx-auto h-full flex flex-col justify-center relative z-10">
                    <div
                        className="relative w-full max-w-5xl mx-auto flex-shrink-0"
                        style={{ height: cardHeight }}
                    >
                        {cards.map((card, index) => (
                            <CardWrapper
                                key={index}
                                index={index * activationBuffer}
                                total={cards.length * activationBuffer}
                                progress={cardProgress}
                                card={card}
                                cardHeight={cardHeight}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

interface CardWrapperProps {
    index: number;
    total: number;
    progress: MotionValue<number>;
    card: ScrollStackCard;
    cardHeight: string;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
    index,
    total,
    progress,
    card,
    cardHeight,
}) => {
    // Normalize index range for staggered entry
    const start = index / total;
    const slideDuration = 1 / total; // e.g. 0.33 for 3 cards

    // Define animation window for this card
    // It enters from 'start' and finishes entering by 'start + part of duration'
    const slideEnd = start + (slideDuration * 0.4);

    // Stacking effect
    const translateY = useTransform(
        progress,
        [start, slideEnd], // Logic: At 'start' (0 for card 0), it is at 800. At 'slideEnd', it is at stacked pos.
        [800, 0] // Stack perfectly on top of each other
    );

    // Scale effect
    const scale = useTransform(
        progress,
        [start, 1],
        [1, 1 - (total - 1 - index) * 0.05]
    );

    // Opacity
    const opacity = useTransform(
        progress,
        [start, slideEnd],
        [0, 1]
    );

    // Force first card to be invisible initially if progress is 0
    // useTransform handles this, mapping 0 to 800px Y and 0 opacity if index=0, slideStart=0

    return (
        <motion.div
            style={{
                ...card.style,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: cardHeight,
                maxHeight: "500px",
                y: translateY,
                scale,
                opacity,
                zIndex: 10 + Math.floor(index),
                pointerEvents: "auto",
                willChange: "transform, opacity"
            }}
            className={`overflow-hidden shadow-2xl ${card.className || ""}`}
        >
            {card.backgroundImage && !card.content && (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${card.backgroundImage}')` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            <div className="relative z-10 w-full h-full">
                {card.content || (
                    <div className="p-8 h-full flex flex-col justify-center text-white">
                        <h3 className="text-4xl font-bold mb-2">{card.title}</h3>
                        {card.subtitle && <p className="text-xl opacity-80">{card.subtitle}</p>}
                        {card.badge && (
                            <span className="mt-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm w-fit">
                                {card.badge}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ScrollStack;
