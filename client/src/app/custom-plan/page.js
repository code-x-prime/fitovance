"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

const BRAND_BROWN = "#000000";


export default function CustomPlanPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    goal: "Muscle Gain",
    dietaryType: "Non-Vegetarian",
    experience: "Intermediate",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/content/custom-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      toast.success("Your custom consultation request has been received. Our nutrition team will contact you shortly.");
      setFormData({
        name: "", email: "", phone: "", goal: "Muscle Gain", dietaryType: "Non-Vegetarian", experience: "Intermediate", details: ""
      });
    } catch (error) {
      toast.error(error.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-white font-roboto">
      {/* ── HERO SECTION ── */}
      <section className="relative h-[60vh] md:h-[80vh] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/contact.png"
          alt="Custom Fitness Plans by FITOVANCE"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-10">
          <p className="text-white/90 text-sm md:text-base font-jost tracking-[0.2em] uppercase mb-4">
            Custom Consultations
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-jost text-white leading-tight mb-6">
            Your Body, <br className="hidden md:block" />
            <span className="italic font-light">Your Plan</span>
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Get a tailored workout and nutrition regime built for your physiology and lifestyle, crafted by FITOVANCE certified nutritionists and physical trainers.
          </p>
        </div>
      </section>

      {/* ── THE PROCESS ── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-jost" style={{ color: BRAND_BROWN }}>
              How It Works
            </h2>
            <div className="mt-6 w-12 h-px mx-auto bg-black" />
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "Submit Details", desc: "Fill out the consultation form with your fitness goals, dietary restrictions, and training history." },
              { num: "02", title: "Trainer Matching", desc: "We review your details and pair you with a certified sports nutritionist and coach best suited for your goals." },
              { num: "03", title: "Custom Formulation", desc: "Get a comprehensive diet sheet, custom supplement dosing, and specialized daily workout schedule designed for you." },
              { num: "04", title: "Active Coaching", desc: "Receive weekly check-ins, performance tracking, and support to keep you moving towards your goals." }
            ].map((step) => (
              <div key={step.num} className="text-center group">
                <div
                  className="text-5xl font-jost font-light mb-4 transition-colors duration-500 text-gray-300"
                >
                  {step.num}
                </div>
                <h3 className="text-xl font-jost mb-3 text-black font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INQUIRY FORM SECTION ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left: Info */}
          <div>
            <span
              className="text-xs font-jost tracking-[0.2em] uppercase mb-4 block text-black font-semibold"
            >
              Start Your Transformation
            </span>
            <h2 className="text-3xl md:text-5xl font-jost mb-6 leading-tight text-black">
              Request a Custom Plan
            </h2>
            <p className="text-base leading-relaxed mb-10 text-gray-600">
              Fill in the form with your metrics and fitness goals. Our experts review every profile personally to provide a genuine, safe, and highly effective performance plan.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-black text-black font-semibold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-jost text-lg text-black font-semibold">1-on-1 Trainer Access</h4>
                  <p className="text-sm mt-1 text-gray-500">Every plan includes direct chat and review options with your coach, ensuring your form and safety are monitored.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border border-black text-black font-semibold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-jost text-lg text-black font-semibold">Tailored Supplement Integration</h4>
                  <p className="text-sm mt-1 text-gray-500">Learn how to time your pre-workout shots and protein bars to maximize hypertrophy, weight management, or muscle retention.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white border border-[#e8e0d5] p-8 md:p-12 rounded shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                  *Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    *Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    *Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    Primary Fitness Goal
                  </label>
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto bg-white"
                  >
                    <option value="Muscle Gain">Muscle Gain / Bulking</option>
                    <option value="Weight Loss">Weight Loss / Shredding</option>
                    <option value="Endurance">Athletic Endurance</option>
                    <option value="General Fitness">General Fitness &amp; Toning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                    Dietary Preference
                  </label>
                  <select
                    name="dietaryType"
                    value={formData.dietaryType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto bg-white"
                  >
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Eggitarian">Eggitarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                  Training Experience
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto bg-white"
                >
                  <option value="Beginner">Beginner (Under 6 months)</option>
                  <option value="Intermediate">Intermediate (1-2 years)</option>
                  <option value="Advanced">Advanced (3+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-2">
                  Health Conditions / Additional Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black font-roboto resize-none"
                  placeholder="Mention any food allergies, injuries, or target targets..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white hover:bg-neutral-900 transition-all font-jost text-xs tracking-widest uppercase font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Inquiry..." : "Submit Consultation Request"}
              </button>
            </form>
          </div>

        </div>
      </section>
    </main>
  );
}
