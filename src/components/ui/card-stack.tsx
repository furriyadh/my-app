"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

let interval: any;

type Card = {
  id: number;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
  className,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
  className?: string;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    if (items && items.length > 0) {
      setCards(items);
    }
  }, [items]);

  useEffect(() => {
    if (cards.length > 0) {
      startFlipping();
    }

    return () => clearInterval(interval);
  }, [cards.length]);

  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        if (!prevCards || prevCards.length === 0) return prevCards;
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  // Default dimensions
  const defaultContainerClass = "h-64 w-96 md:h-80 md:w-[600px]";
  const containerClass = className || defaultContainerClass;

  return (
    <div className={`relative ${containerClass}`}>
      {cards.map((card, index) => {
        if (!card || !card.content) return null;

        return (
          <motion.div
            key={card.id}
            className={`absolute dark:bg-black bg-white ${containerClass} rounded-3xl p-0 shadow-xl border border-neutral-200 dark:border-white/[0.1] shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col overflow-hidden`}
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            <div className="font-normal text-neutral-700 dark:text-neutral-200 h-full">
              {card.content}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
