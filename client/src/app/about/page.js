"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame, Shield, Leaf, Target, Heart, Award } from "lucide-react";

const values = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Quality First",
    desc: "Every product is tested for purity, potency, and safety. No shortcuts, no compromises.",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Clean Ingredients",
    desc: "We use science-backed, clean ingredients. No fillers, no artificial junk.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Results Driven",
    desc: "Formulated to deliver real results. Every scoop, every bite, every serving counts.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Customer obsessed",
    desc: "Your goals are our mission. We listen, we innovate, we deliver.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Trusted Brand",
    desc: "Thousands of athletes and fitness enthusiasts trust FITOVANCE daily.",
  },
  {
    icon: <Flame className="h-6 w-6" />,
    title: "Always Innovating",
    desc: "We continuously push boundaries to bring you the best in sports nutrition.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative w-full h-[40vh] md:h-[60vh] bg-black overflow-hidden">
        <Image
          src="/about-us.png"
          alt="About FITOVANCE"
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-6 text-center">
          <p className="text-[10px] md:text-xs font-jost font-bold tracking-[0.3em] text-white/70 uppercase mb-3">
            True Potential
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-jost font-bold text-white uppercase tracking-tight leading-none mb-4">
            About FITOVANCE
          </h1>
          <p className="text-sm md:text-base font-roboto text-white/70 max-w-lg">
            Premium sports nutrition for those who demand more from their body.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <p className="text-[10px] font-jost font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
              Our Story
            </p>
            <h2 className="text-3xl md:text-4xl font-jost font-bold text-black uppercase tracking-tight mb-6">
              Born From <br />A Real Problem
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed text-gray-600 font-roboto">
              <p>
                FITOVANCE was founded with a simple belief: healthy nutrition should be
                accessible, convenient, and uncompromising in quality.
              </p>
              <p>
                Our journey began with a real-world challenge. While working closely with
                fitness enthusiasts and operating a healthy food cafe, we saw that many
                people struggled to find nutritious products that were both trustworthy
                and practical for their busy lifestyles.
              </p>
              <p>
                Most options in the market either compromised on quality, contained
                unnecessary ingredients, or were simply not convenient enough for everyday
                use.
              </p>
              <p>
                This inspired us to build FITOVANCE — a brand focused on creating clean,
                functional, and delicious nutrition products that support healthier living
                without sacrificing taste or convenience.
              </p>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-100">
            <Image
              src="/about-us.png"
              alt="FITOVANCE Story"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <p className="text-[10px] font-jost font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
                Our Mission
              </p>
              <h2 className="text-2xl md:text-3xl font-jost font-bold text-black uppercase tracking-tight mb-6">
                Fuel Every Goal
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-gray-600 font-roboto">
                To revolutionize India&apos;s protein consumption by transforming everyday
                snacks and meals into delicious, high-protein foods. We aim to make
                healthy nutrition a natural part of daily life while building FITOVANCE
                into India&apos;s complete fitness destination — offering nutritious foods,
                healthy meal solutions, sports nutrition, gym accessories, and everything
                people need for a healthier lifestyle, all under one brand.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-jost font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
                Our Vision
              </p>
              <h2 className="text-2xl md:text-3xl font-jost font-bold text-black uppercase tracking-tight mb-6">
                A Healthier Future
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-gray-600 font-roboto">
                To become one of India&apos;s most trusted health and nutrition brands by
                making premium, innovative, and convenient nutrition products accessible
                to millions of people, while inspiring a healthier future through
                continuous innovation, quality, and customer trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-[10px] font-jost font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">
            What We Stand For
          </p>
          <h2 className="text-3xl md:text-4xl font-jost font-bold text-black uppercase tracking-tight">
            Our Values
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-black hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mb-4 text-gray-600 group-hover:bg-black group-hover:text-white transition-all">
                {v.icon}
              </div>
              <h3 className="text-sm font-jost font-bold text-black uppercase tracking-wider mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-gray-500 font-roboto leading-relaxed">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Promise */}
      <section className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <p className="text-[10px] font-jost font-bold tracking-[0.3em] text-white/50 uppercase mb-3">
              Our Promise
            </p>
            <h2 className="text-3xl md:text-4xl font-jost font-bold uppercase tracking-tight">
              What We Deliver
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              "Premium-quality ingredients",
              "Honest & transparent nutrition",
              "Great taste with real functionality",
              "Customer-first innovation",
              "Continuous improvement",
            ].map((item) => (
              <div
                key={item}
                className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:bg-white/10 transition-colors"
              >
                <p className="text-sm font-roboto text-white/80">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-lg md:text-xl font-jost font-semibold text-white/90 mb-8">
              We&apos;re not just building products — we&apos;re building a healthier future,
              one step at a time.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-jost font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
