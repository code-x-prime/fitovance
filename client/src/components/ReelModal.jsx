"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Play, ChevronLeft, ChevronRight, ShoppingCart, } from "lucide-react";

import Link from "next/link";

export default function ReelModal({ reel, onClose, onNext, onPrev, hasNext }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const touchStart = useRef(null);


  // Set URL hash when modal opens, remove on close
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.location.hash = "#video-shopping";
    return () => {
      if (window.location.hash === "#video-shopping") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
  }, []);

  // Play on open
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.play().then(() => setIsPlaying(true)).catch(() => { });
    return () => {
      vid.pause();
      vid.currentTime = 0;
    };
  }, [reel?.videoUrl]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (showShareMenu) setShowShareMenu(false);
        else onClose();
      }
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasNext) onPrev();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev, hasNext, showShareMenu]);

  // Touch swipe
  const handleTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -80 && hasNext) onNext();
      if (dx > 80 && hasNext) onPrev();
    }
    touchStart.current = null;
  };

  const togglePlay = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setIsPlaying(true)).catch(() => { });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, []);


  // Progress tracking
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onTime = () => {
      if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100);
    };
    vid.addEventListener("timeupdate", onTime);
    return () => vid.removeEventListener("timeupdate", onTime);
  }, []);





  const productUrl = reel?.product?.slug
    ? `/products/${reel.product.slug}${reel.variant?.id ? `?variant=${reel.variant.id}` : ""}`
    : "#";

  if (!reel) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        // Close if clicking the backdrop (not the video card or buttons)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation arrows - desktop */}
      {hasNext && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Main content - centered card */}
      <div className="relative w-full max-w-sm h-[85vh] mx-auto overflow-hidden bg-black shadow-2xl">
        {/* Video */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          onClick={togglePlay}
        />

        {/* Tap to play/pause overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-7 w-7 text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}



        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20 z-20">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>


        {/* Bottom product card */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          {reel.product?.slug ? (
            <Link
              href={productUrl}
              onClick={onClose}
              className="bg-white p-3 flex items-center gap-3 shadow-2xl cursor-pointer hover:bg-gray-50 transition-colors rounded-lg flex w-full"
            >
              {reel.product?.imageUrl && (
                <img
                  src={reel.product.imageUrl}
                  alt={reel.product.name}
                  className="w-14 h-14 rounded-lg object-cover border flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {reel.product?.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {reel.product?.price != null && (
                    <span className="text-base font-bold text-gray-900">
                      ₹{reel.product.price}
                    </span>
                  )}
                  {reel.product?.originalPrice != null && reel.product.originalPrice > reel.product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{reel.product.originalPrice}
                    </span>
                  )}
                  {reel.product?.hasSale && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      {Math.round(((reel.product.originalPrice - reel.product.price) / reel.product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                {reel.variant && (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {reel.variant.attributes?.map(a => a.value).filter(Boolean).join(" / ")}
                  </p>
                )}
              </div>
              <span
                className="flex-shrink-0 h-10 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Buy Now
              </span>
            </Link>
          ) : null}

          {hasNext && (
            <p className="text-center text-white/50 text-[11px] mt-3">
              Swipe or use arrows to browse
            </p>
          )}
        </div>
      </div>

      {/* Click outside share menu to close */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}
