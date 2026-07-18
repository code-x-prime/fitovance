import { Card, CardContent } from "@/components/ui/card";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 font-jost">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl tracking-widest uppercase font-normal text-black mb-3">
          Cancellation, Return &amp; Refund Policy
        </h1>
        <div className="h-0.5 w-16 bg-black mx-auto mb-6"></div>
        <p className="text-sm text-gray-500 uppercase tracking-widest">
          Last Updated: June 2026
        </p>
      </div>

      <Card className="border border-[#e5e0da] shadow-none bg-white rounded-none">
        <CardContent className="space-y-8 p-8 md:p-12 text-gray-800 leading-relaxed font-roboto">
          <p className="text-base font-jost tracking-wide text-gray-600">
            At FITOVANCE, we make all our protein bars and performance nutrition fresh under strict safety standards. Due to the consumable nature of our products, we do not accept returns or exchanges once a product has been opened or consumed.
          </p>

          <hr className="border-[#e5e0da]" />

          {/* Section 1: Safety & Hygiene Policy */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Safety &amp; Hygiene Policy
            </h2>
            <blockquote className="border-l-2 border-black pl-4 italic text-sm text-gray-500 my-2 font-jost">
              &ldquo;Clean nutrition, crafted with uncompromising standards.&rdquo;
            </blockquote>
            <p className="text-sm text-gray-600">
              To preserve the health and safety of our customers, we are unable to accept returns or offer refunds for items that have been unsealed, opened, or consumed after delivery.
            </p>
          </div>

          {/* Section 2: Order Cancellation */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Order Cancellation
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
              <li>Orders may be cancelled within 12 hours of purchase or before dispatch, whichever is earlier.</li>
              <li>Once the order has been dispatched from our facility, cancellation is no longer possible.</li>
              <li>Subscription orders must be cancelled at least 24 hours prior to the scheduled billing date.</li>
            </ul>
          </div>

          {/* Section 3: Returns */}
          <div className="space-y-4">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Replacements &amp; Damaged Items
            </h2>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-black">Replacements are provided only if:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>The wrong product flavor or item is delivered.</li>
                <li>The product outer seal is damaged or ruptured upon delivery.</li>
                <li>The product packaging has a manufacturing defect.</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-semibold text-black">Returns/Replacements are not accepted for:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                <li>Personal flavor or taste preferences.</li>
                <li>Incorrect product selection during checkout.</li>
                <li>Opened or partially consumed supplements.</li>
                <li>Products stored incorrectly after delivery.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Return Request */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Replacement Request Process
            </h2>
            <p className="text-sm text-gray-600">
              All replacement requests must be submitted to support@fitovance.com within 48 hours of delivery with clear photographs of the shipping label, packaging box, and the affected product showing the batch number.
            </p>
          </div>

          {/* Section 5: Refunds */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Refunds &amp; Resolutions
            </h2>
            <p className="text-sm text-gray-600">
              Following validation of a damaged or incorrect order, we will issue:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>A free brand replacement shipped immediately.</li>
              <li>Store credit for a future order.</li>
              <li>A refund to the original payment method.</li>
            </ul>
            <p className="text-sm text-gray-600 pt-1">
              Approved refunds are processed to your original payment method within 5&ndash;7 business days.
            </p>
          </div>

          {/* Section 6: Bulk Orders */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Bulk Orders
            </h2>
            <p className="text-sm text-gray-600">
              Bulk and B2B orders are governed by their respective purchase agreements. Please contact our corporate sales team for bulk terms.
            </p>
          </div>

          <hr className="border-[#e5e0da]" />

          {/* Contact */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 font-jost tracking-wide uppercase">
              Contact Us
            </p>
            <p className="text-base font-semibold text-black font-jost mt-1">
              FITOVANCE
            </p>
            <a
              href="mailto:support@fitovance.com"
              className="text-base font-semibold text-black hover:underline transition-colors font-jost mt-1 inline-block"
            >
              support@fitovance.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
