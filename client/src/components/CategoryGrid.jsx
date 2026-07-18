"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const getImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const formatCategoryName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const CategoryCard = ({ category }) => {
  const imageUrl = getImageUrl(category.image);
  const displayName = formatCategoryName(category.name);

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden rounded-[10px] h-[260px] sm:h-[420px] border border-[#EAEAEA] hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer w-full">
      {/* Image container (approx 68% height) */}
      <div className="relative h-[160px] sm:h-[285px] w-full overflow-hidden bg-[#FAFAFA]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayName || "Category"}
            fill
            className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          /* Premium soft gradient placeholder */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F7] via-[#ECECEF] to-[#E2E2E6] p-4 overflow-hidden">
            {/* Subtle background circle design for premium texture */}
            <div className="absolute w-24 h-24 rounded-full bg-white/20 blur-xl -top-6 -left-6 pointer-events-none" />
            <div className="absolute w-24 h-24 rounded-full bg-white/20 blur-xl -bottom-6 -right-6 pointer-events-none" />

            <ImageIcon className="w-6 h-6 sm:w-9 sm:h-9 text-gray-400 stroke-[1.2] mb-2 sm:mb-3 relative z-10" />
            <span className="text-[#1D1D1F] font-jost text-xs sm:text-sm uppercase tracking-[0.15em] font-medium mb-1 relative z-10 text-center truncate w-full">
              {displayName || "Collection"}
            </span>
            <span className="text-gray-500 font-roboto text-[10px] sm:text-xs font-light relative z-10">Coming Soon</span>
          </div>
        )}
      </div>

      {/* Bottom Content (approx 32% height) */}
      <div className="h-[100px] sm:h-[135px] w-full p-3 sm:p-5 flex flex-col justify-between bg-white border-t border-[#EAEAEA]">
        <div className="space-y-0.5 sm:space-y-1">
          <h3 className="text-sm sm:text-[22px] font-medium font-jost text-gray-900 tracking-tight leading-tight group-hover:text-black transition-colors truncate">
            {displayName}
          </h3>
          <p className="text-[11px] sm:text-[15px] text-gray-500 line-clamp-1 sm:line-clamp-2 font-roboto font-normal leading-snug">
            {category.description || "Premium collection."}
          </p>
        </div>
        <div className="mt-1 sm:mt-2">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-6 sm:py-2.5 bg-black hover:bg-neutral-900 text-white text-[10px] sm:text-sm font-medium rounded-[6px] sm:rounded-[8px] transition-colors duration-300">
            <span>Explore Collection</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="grid grid-cols-2 gap-3 sm:gap-[32px] max-w-[1400px] mx-auto">
    {[...Array(2)].map((_, index) => (
      <div
        key={index}
        className="bg-gray-100 rounded-[10px] h-[260px] sm:h-[420px] animate-pulse w-full"
      />
    ))}
  </div>
);

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApi("/public/categories");
        if (response.success && response.data?.categories) {
          setCategories(response.data.categories);
        } else {
          setError(response.message || "Failed to fetch categories");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <section className="py-20 md:py-24 bg-[#FAFAFA]">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xl md:text-2xl font-bold font-jost text-gray-900 tracking-wider uppercase mb-2">
              SHOP BY CATEGORY
            </h2>
            <p className="text-sm text-gray-500 font-roboto">
              Choose products based on your fitness goals.
            </p>
          </div>
          <SkeletonLoader />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 md:py-24 bg-[#FAFAFA]">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4 font-roboto">Error: {error}</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors rounded-full font-jost text-sm font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-20 md:py-24 bg-[#FAFAFA]">
        <div className="container max-w-[1400px] mx-auto px-6">
          <div className="text-center py-12">
            <p className="text-gray-500 font-roboto">
              No categories available at the moment
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isSlider = categories.length >= 3;

  return (
    <section className="py-20 md:py-24 bg-[#FAFAFA] border-y border-gray-100 overflow-hidden">
      <div className="container max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-xl md:text-2xl font-medium font-jost text-gray-900 tracking-[4px] uppercase mb-2">
            SHOP BY CATEGORY
          </h2>
          <p className="text-sm md:text-base text-gray-500 font-roboto font-light">
            Choose products based on your fitness goals.
          </p>
        </div>

        {/* Dynamic Layout Wrapper */}
        {!isSlider ? (
          /* Premium 2-Column Grid for exactly 2 categories */
          <div className="grid grid-cols-2 gap-3 sm:gap-[32px] w-full">
            {categories.map((category, index) => (
              <div
                key={category.id || index}
                className="w-full"
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="block w-full"
                >
                  <CategoryCard category={category} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Responsive Carousel showing exactly 2 cards per view on Desktop and Tablet, 2 cards on Mobile */
          <div className="relative max-w-[1400px] mx-auto px-2 md:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 sm:-ml-6">
                {categories.map((category, index) => (
                  <CarouselItem
                    key={category.id || index}
                    className="pl-3 sm:pl-6 basis-1/2 lg:basis-1/2"
                  >
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="block w-full"
                    >
                      <CategoryCard category={category} />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Carousel Arrows */}
              <CarouselPrevious className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-100 hover:bg-gray-50 text-gray-700 z-10 flex items-center justify-center transition-all" />
              <CarouselNext className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-lg border border-gray-100 hover:bg-gray-50 text-gray-700 z-10 flex items-center justify-center transition-all" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
