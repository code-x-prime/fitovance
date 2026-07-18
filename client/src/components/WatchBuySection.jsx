"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi } from "@/lib/utils";
import ReelModal from "@/components/ReelModal";

function ReelCard({ reel, onClick }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isInView) {
      vid.play().catch(() => { });
    } else {
      vid.pause();
    }
  }, [isInView]);

  const product = reel.product;
  const discount =
    product?.originalPrice != null &&
      product.price != null &&
      product.originalPrice > product.price
      ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
      : 0;

  return (
    <div className="flex-shrink-0 w-44 sm:w-48 md:w-52 snap-start">
      {/* Video card */}
      <button
        ref={cardRef}
        onClick={onClick}
        className="relative w-full aspect-[9/14]  overflow-hidden group bg-black cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
      >
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : reel.thumbnailUrl ? (
          <img
            src={reel.thumbnailUrl}
            alt={product?.name || "Reel"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <span className="text-gray-500 text-sm">No media</span>
          </div>
        )}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <svg
              className="w-5 h-5 text-gray-900 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>

      {/* Product info BELOW card */}
      {product && (
        <div className="mt-2.5 px-0.5">
          <div className="flex items-start gap-2">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-10 h-10 rounded-md object-cover border flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                {product.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {product.price != null && (
                  <span className="text-sm font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                )}
                {product.originalPrice != null &&
                  product.originalPrice > product.price && (
                    <span className="text-[11px] text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                {discount > 0 && (
                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WatchBuySection() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const res = await fetchApi("/public/reels");
        if (res?.success) {
          setReels(res.data?.reels || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const openModal = useCallback((index) => {
    setActiveReelIndex(index);
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setActiveReelIndex(null);
    document.body.style.overflow = "";
  }, []);

  const goNext = useCallback(() => {
    if (activeReelIndex === null || reels.length === 0) return;
    setActiveReelIndex((prev) => (prev + 1) % reels.length);
  }, [activeReelIndex, reels.length]);

  const goPrev = useCallback(() => {
    if (activeReelIndex === null || reels.length === 0) return;
    setActiveReelIndex((prev) => (prev - 1 + reels.length) % reels.length);
  }, [activeReelIndex, reels.length]);

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  if (loading || reels.length === 0) return null;

  return (
    <>
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase font-jost mb-2 text-gray-500">
              Trending Now
            </p>
            <h2 className="text-2xl md:text-4xl font-light font-jost tracking-widest uppercase text-gray-900">
              Watch & Buy
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-jost">
              Tap a reel to watch & shop instantly
            </p>
            <div className="w-12 h-px mx-auto mt-4 bg-gray-900" />
          </div>

          <div className="relative">
            {/* Scroll buttons */}
            <button
              onClick={() => scroll(-1)}
              className="absolute left-0 top-[30%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors -ml-2 border border-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-0 top-[30%] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors -mr-2 border border-gray-200"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-1"
            >
              {reels.map((reel, i) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  onClick={() => openModal(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {activeReelIndex !== null && (
        <ReelModal
          reel={reels[activeReelIndex]}
          onClose={closeModal}
          onNext={goNext}
          onPrev={goPrev}
          hasNext={reels.length > 1}
        />
      )}
    </>
  );
}
