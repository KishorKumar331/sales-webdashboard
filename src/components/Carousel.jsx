"use client";
import React, { useRef, useEffect, useState } from "react";

const items = [
  { id: 1, title: "Card 1" },
  { id: 2, title: "Card 2" },
  { id: 3, title: "Card 3" },
  { id: 4, title: "Card 4" },
  { id: 5, title: "Card 5" },
  { id: 6, title: "Card 6" },
  { id: 7, title: "Card 7" },
  { id: 8, title: "Card 8" },
];

const ITEMS_PER_VIEW = 1;

const Carousel = () => {
  const scrollRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      const firstCard = scrollRef.current.querySelector(".carousel-item");
      if (firstCard) {
        setCardWidth(firstCard.offsetWidth);
      }
    }
  }, []);

  // Track active slide while scrolling
  const handleScroll = () => {
    const container = scrollRef.current;
    const index = Math.round(container.scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = cardWidth * ITEMS_PER_VIEW;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const goToSlide = (index) => {
    const container = scrollRef.current;
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative max-w-6xl mx-auto w-full">

      {/* Left Button */}
      <button
        disabled={activeIndex === 0}
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black disabled:opacity-30"
      >
        ◀
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-item flex-shrink-0 w-[25rem] snap-start p-3"
          >
            <div className="h-60 bg-indigo-500 rounded-xl text-white flex items-center justify-center text-xl font-semibold">
              {item.title}
            </div>
          </div>
        ))}
      </div>

      {/* Right Button */}
      <button
        disabled={activeIndex >= items.length - 1}
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-full hover:bg-black disabled:opacity-30"
      >
        ▶
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "bg-indigo-600 w-6"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;

