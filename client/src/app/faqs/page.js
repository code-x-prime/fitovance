"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const STATIC_FAQS = [
  {
    id: 1,
    question: "What ingredients are used in FITOVANCE products?",
    answer: "We use only premium, clean ingredients in all our formulations. Our protein bars contain high-quality whey protein isolate, real nuts, seeds, and natural cocoa, with zero artificial preservatives or trans fats. Our pre-workout shots use certified amino acids, caffeine, and natural energy boosters to optimize performance safely.",
    category: "products",
    order: 1
  },
  {
    id: 2,
    question: "Are FITOVANCE supplements safe for daily use?",
    answer: "Yes, our products are formulated to be safe for daily consumption when used according to the package directions. All batches undergo strict quality control and safety checks. However, if you have any pre-existing health conditions or are pregnant, we recommend consulting your healthcare provider first.",
    category: "safety",
    order: 2
  },
  {
    id: 3,
    question: "How should I store FITOVANCE protein bars?",
    answer: "Because we make our protein bars fresh without artificial preservatives, we recommend storing them in a cool, dry place away from direct sunlight. For the best taste and texture, they can be refrigerated, especially in warmer climates.",
    category: "products",
    order: 3
  },
  {
    id: 4,
    question: "What is the shelf life of the protein bars and pre-workout shots?",
    answer: "Our handcrafted protein bars have a shelf life of 3 months from the date of manufacture. FITOVANCE pre-workout shots have a shelf life of 6 months. Always check the manufacturing and expiry date printed on the packaging.",
    category: "products",
    order: 4
  },
  {
    id: 5,
    question: "What are your shipping timelines and charges?",
    answer: "We offer flat-rate shipping across India, with free shipping on all orders above ₹499. Orders are typically processed within 24 hours and delivered within 2 to 5 business days depending on your location. Tracking details are sent via email and SMS as soon as the order is shipped.",
    category: "shipping",
    order: 5
  },
  {
    id: 6,
    question: "Is Cash on Delivery (COD) available?",
    answer: "Yes, we offer Cash on Delivery (COD) for most pin codes across India for a nominal fee of ₹40. You can select the COD option during checkout.",
    category: "orders",
    order: 6
  },
  {
    id: 7,
    question: "Can I return a product if the seal is opened?",
    answer: "Due to safety, hygiene, and the consumable nature of fitness supplements, we do not accept returns or refunds for products that have been opened or consumed. If you receive a damaged or incorrect item, please notify us within 48 hours of delivery with photos of the package, and we will issue a free replacement.",
    category: "returns",
    order: 7
  },
  {
    id: 8,
    question: "How and when should I consume the pre-workout shot?",
    answer: "For optimal performance, consume one FITOVANCE pre-workout shot 15 to 30 minutes before your training session. We recommend starting with a half serving to assess your tolerance if you are sensitive to caffeine.",
    category: "products",
    order: 8
  }
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState(["all", "products", "safety", "shipping", "orders", "returns"]);

  useEffect(() => {
    async function fetchFAQs() {
      setLoading(true);
      try {
        const response = await fetchApi("/faqs");

        // Handle various possible response formats
        let faqsData = [];
        if (response?.data?.faqs && Array.isArray(response.data.faqs)) {
          // Format: { data: { faqs: [...] } }
          faqsData = response.data.faqs;
        } else if (Array.isArray(response?.data)) {
          // Format: { data: [...] }
          faqsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          // Format: { statusCode, data: [...], message, success }
          faqsData = response.data.data;
        }

        if (!faqsData || faqsData.length === 0) {
          faqsData = STATIC_FAQS;
        }

        setFaqs(faqsData);
        setFilteredFaqs(faqsData);

        // Fetch categories
        const categoriesResponse = await fetchApi("/faqs/categories");

        // Handle categories response format
        let categoriesData = [];
        if (categoriesResponse?.data?.categories) {
          categoriesData = categoriesResponse.data.categories;
        } else if (Array.isArray(categoriesResponse?.data)) {
          categoriesData = categoriesResponse.data;
        } else if (
          categoriesResponse?.data?.data &&
          Array.isArray(categoriesResponse.data.data)
        ) {
          categoriesData = categoriesResponse.data.data;
        }

        if (categoriesData.length) {
          setCategories(["all", ...categoriesData.map((cat) => cat.name)]);
        } else {
          setCategories(["all", "products", "safety", "shipping", "orders", "returns"]);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
        setFaqs(STATIC_FAQS);
        setFilteredFaqs(STATIC_FAQS);
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, []);

  // Filter FAQs based on search query and category
  useEffect(() => {
    if (!faqs.length) return;

    let filtered = faqs;

    // Filter by category if not "all"
    if (activeCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    // Sort by order (ascending)
    filtered = [...filtered].sort((a, b) => a.order - b.order);

    setFilteredFaqs(filtered);
  }, [searchQuery, activeCategory, faqs]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Switch category
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/2 mx-auto mb-6" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4 mb-10 mx-auto" />

          <Skeleton className="h-12 w-full mb-8" />

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-md p-2">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="py-10 md:py-12 ">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 font-jost" style={{ color: "#000000" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-center mb-12 max-w-2xl mx-auto font-roboto" style={{ color: "#000000" }}>
            Find answers to common questions about our products, ingredients,
            shipping, and order management.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto mb-8">
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 focus:border-primary focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {category === "all" ? "All Questions" : category}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Accordion */}
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id.toString()}
                  className="border rounded-md px-2"
                >
                  <AccordionTrigger className="text-lg font-medium py-4 px-2 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-4 pt-1 text-gray-600">
                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg font-medium mb-2">
                No FAQs found for &quot;{searchQuery}&quot;
              </p>
              <span className="text-gray-600">
                Try a different search term or{" "}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="text-primary hover:underline"
                >
                  view all FAQs
                </button>
              </span>
            </div>
          )}

          {/* Contact section */}
          <div className="mt-16 p-8 border border-black text-center bg-white">
            <h2 className="text-xl font-bold mb-3 font-jost" style={{ color: "#000000" }}>Still have questions?</h2>
            <p className="mb-6 font-roboto" style={{ color: "#000000" }}>
              Can&apos;t find the answer you&apos;re looking for? Please contact
              our support team.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-none hover:bg-black/90 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="mailto:connect.fitovanceco@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 border rounded-none transition-colors font-jost"
                style={{ borderColor: "#000000", color: "#000000" }}
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
