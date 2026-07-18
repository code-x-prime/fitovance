import React from "react";
import { useRouter } from "next/navigation";

const SupplementStoreUI = () => {
  const router = useRouter();

  return (
    <div className="py-8 md:py-14 px-4 bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div
          className="relative cursor-pointer overflow-hidden group"
          onClick={() => router.push("/products")}
        >
          {/* Mobile image */}
          <img
            src="/collection-Banner.png"
            alt="Collection Banner"
            className="block md:hidden w-full object-cover aspect-[9/14]"
          />
          {/* Desktop image */}
          <img
            src="/collection-banner.png"
            alt="Collection Banner"
            className="hidden md:block w-full object-cover aspect-[16/6] transition-transform duration-700 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

          {/* Text */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-xl">
            <p
              className="text-xs md:text-sm tracking-[0.3em] uppercase mb-3 font-jost"
              style={{ color: "#FFFFFF" }}
            >
              PREMIUM SPORTS NUTRITION
            </p>
            <h2
              className="text-3xl md:text-5xl font-light font-jost tracking-widest uppercase leading-tight mb-4 text-white"
            >
              FUEL YOUR<br />PERFORMANCE
            </h2>
            <p className="text-white/80 text-sm md:text-base font-roboto mb-6 max-w-xs">
              Handmade protein bars and pre-workout formulas crafted for real results.
            </p>
            <button
              className="self-start border border-white text-white text-xs font-jost tracking-widest uppercase px-6 py-3 hover:bg-white transition-all duration-300"
              style={{ color: "white" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#000000"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "white"; }}
            >
              EXPLORE PRODUCTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplementStoreUI;
