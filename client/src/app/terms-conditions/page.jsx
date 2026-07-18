import { Card, CardContent } from "@/components/ui/card";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 font-jost">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl tracking-widest uppercase font-normal text-black mb-3">
          Terms &amp; Conditions
        </h1>
        <div className="h-0.5 w-16 bg-black mx-auto mb-6"></div>
        <p className="text-sm text-gray-500 uppercase tracking-widest">
          Last Updated: June 2026
        </p>
      </div>

      <Card className="border border-[#e5e0da] shadow-none bg-white rounded-none">
        <CardContent className="space-y-8 p-8 md:p-12 text-gray-800 leading-relaxed font-roboto">
          <p className="text-base font-jost tracking-wide text-gray-600">
            Welcome to FITOVANCE. By using our website or placing an order, you agree to these Terms.
          </p>

          <hr className="border-[#e5e0da]" />

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Product Formulation &amp; Safety
            </h2>
            <p className="text-sm text-gray-600">
              All FITOVANCE products are manufactured in compliance with food safety and standards. Please consume our protein bars and pre-workout shots within the recommended shelf life and check the packaging label for allergen information.
            </p>
            <blockquote className="border-l-2 border-black pl-4 italic text-sm text-gray-500 my-2">
              &ldquo;Fueling active lifestyles with uncompromising quality.&rdquo;
            </blockquote>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Orders &amp; Pricing
            </h2>
            <p className="text-sm text-gray-600">
              We reserve the right to refuse, cancel, or modify any order due to pricing errors, product availability, suspected fraud, or other legitimate business reasons.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Supplements &amp; Health Disclaimer
            </h2>
            <p className="text-sm text-gray-600">
              FITOVANCE products are dietary supplements and are not intended to diagnose, treat, cure, or prevent any medical condition. Please consult your physician before starting any new supplement program.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Shipping
            </h2>
            <p className="text-sm text-gray-600">
              Delivery dates are estimates only. We are not responsible for delays caused by shipping carriers, severe weather conditions, or events beyond our control.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Intellectual Property
            </h2>
            <p className="text-sm text-gray-600">
              All content, images, designs, logos, and product formulations on this website are the property of FITOVANCE and may not be copied, reproduced, or used without permission.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Liability
            </h2>
            <p className="text-sm text-gray-600">
              FITOVANCE shall not be liable for indirect, incidental, or consequential damages arising from the use of our website, products, or services.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Updates
            </h2>
            <p className="text-sm text-gray-600">
              We may update these Terms at any time. Continued use of the website constitutes acceptance of any changes.
            </p>
          </div>

          <hr className="border-[#e5e0da]" />

          {/* Contact */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 font-jost tracking-wide">
              Have questions? Contact Support at
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
