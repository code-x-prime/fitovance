"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Maximize2, Award, Maximize, Calendar } from "lucide-react";

export default function NutritionServicesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pincode: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTermsSection, setActiveTermsSection] = useState(null);
  const [openFaqs, setOpenFaqs] = useState({});
  const [showAmcModal, setShowAmcModal] = useState(false);
  const [amcTab, setAmcTab] = useState("residential");

  const detailsFormRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScrollToForm = () => {
    detailsFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/content/nutrition-services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.ok ? await response.json() : null;

      toast.success("Thank you! Our fitness consultants will contact you shortly.");
      setFormData({ name: "", email: "", phone: "", pincode: "", description: "" });
    } catch (err) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTermsSection = (section) => {
    setActiveTermsSection((prev) => (prev === section ? null : section));
  };

  const toggleFaq = (idx) => {
    setOpenFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-roboto">
      {/* ── HERO BANNER ── */}
      <section
        className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.65)), url('/h2.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
          <p className="text-white/90 text-sm md:text-base font-jost tracking-[0.2em] uppercase mb-4">
            Professional Guidance
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-jost text-white leading-tight mb-6">
            FITOVANCE Coaching <br className="hidden md:block" />
            <span className="italic font-light">&amp; Consultations</span>
          </h1>
          <button
            onClick={handleScrollToForm}
            className="px-8 py-3.5 bg-white text-black hover:bg-black hover:text-white transition-all duration-300 font-jost text-xs tracking-widest uppercase font-semibold border border-white"
          >
            Book a Consultation
          </button>
        </div>
      </section>

      {/* ── WHY FITOVANCE COACHING ── */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24">
        <div className="mb-12 max-w-4xl">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light font-jost tracking-wide text-black mb-6">
            Why Train with Us?
          </h2>
          <p className="text-gray-600 text-sm md:text-base font-roboto leading-relaxed">
            Unlocking physical performance requires more than just high-quality supplements. Our specialized diet planners, fitness trainers, and consultants work side-by-side with you to structure safe daily routines and meal timings built around real food, our protein bars, and training programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Certified Experts",
              desc: "Work with certified sports nutritionists and active physique trainers who understand functional muscle gain and clean fat loss.",
            },
            {
              title: "Tailored Meal Plans",
              desc: "No crash diets. Get customizable grocery lists, daily caloric targets, and macronutrient distributions customized to your lifestyle.",
            },
            {
              title: "Performance Tracking",
              desc: "Periodic body composition updates, workout load changes, and active guidance to break plateaus and get sustainable results.",
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#e8e0d5] p-8 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-jost text-base md:text-lg font-medium text-black mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs font-roboto leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING STRUCTURE ── */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24 border-t border-[#e8e0d5]">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-light font-jost tracking-wide text-black mb-3">
            Consultation Packages &amp; Pricing
          </h2>
          <p className="text-gray-500 text-xs tracking-wider uppercase font-jost mb-8">
            Choose a plan that fits your transformation schedule
          </p>

          <div className="overflow-x-auto max-w-4xl mx-auto border border-[#e8e0d5] rounded bg-white shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black text-white font-jost text-xs tracking-wider uppercase">
                  <th className="py-4 px-6 font-semibold">Program Level</th>
                  <th className="py-4 px-6 font-semibold text-center">Duration</th>
                  <th className="py-4 px-6 font-semibold text-center">Consultations Included</th>
                  <th className="py-4 px-6 font-semibold text-center">Pricing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d5] font-roboto text-xs md:text-sm text-gray-700">
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-black">Starter Guidance</td>
                  <td className="py-4 px-6 text-center">1 Month</td>
                  <td className="py-4 px-6 text-center">2 Calls</td>
                  <td className="py-4 px-6 text-center font-semibold text-emerald-700">₹1,999</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-black">Active Transformation</td>
                  <td className="py-4 px-6 text-center">3 Months</td>
                  <td className="py-4 px-6 text-center">6 Calls + Chat Support</td>
                  <td className="py-4 px-6 text-center font-semibold text-emerald-700">₹4,999</td>
                </tr>
                <tr className="hover:bg-neutral-50 transition-colors">
                  <td className="py-4 px-6 font-medium text-black">Elite Athlete Support</td>
                  <td className="py-4 px-6 text-center">6 Months</td>
                  <td className="py-4 px-6 text-center">Weekly Reviews + Priority Support</td>
                  <td className="py-4 px-6 text-center font-semibold text-emerald-700">₹8,999</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CONSULTATION INQUIRY FORM ── */}
      <section ref={detailsFormRef} className="max-w-4xl mx-auto px-6 py-16 md:py-24 border-t border-[#e8e0d5]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-light font-jost text-black tracking-wide">
            Book Your Session
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Share your goals and details below to start your specialized fitness journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                *Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                *Mobile No.
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                placeholder="Phone Number"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                *Pin code
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                placeholder="Postal Pincode"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
              Explain your health goals / target fitness levels
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto resize-none"
              placeholder="e.g., muscle definition, fat loss, pre-workout timing advice..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-black text-white hover:bg-neutral-900 transition-all font-jost text-xs tracking-widest uppercase font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Sending Request..." : "Request Call-back"}
          </button>
        </form>
      </section>
    </div>
  );
}
