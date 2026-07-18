import { Card, CardContent } from "@/components/ui/card";

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 font-jost">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl tracking-widest uppercase font-normal text-black mb-3">
          Shipping &amp; Delivery Policy
        </h1>
        <div className="h-0.5 w-16 bg-black mx-auto mb-6"></div>
        <p className="text-sm text-gray-500 uppercase tracking-widest">
          Last Updated: June 2026
        </p>
      </div>

      <Card className="border border-[#e5e0da] shadow-none bg-white rounded-none">
        <CardContent className="space-y-8 p-8 md:p-12 text-gray-800 leading-relaxed font-roboto">
          <p className="text-base font-jost tracking-wide text-gray-600">
            We take care to package and ship your fresh sports nutrition products securely. Below is everything you need to know about how and when your order will reach you.
          </p>

          <hr className="border-[#e5e0da]" />

          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Order Processing Time
            </h2>
            <p className="text-sm text-gray-600">
              All orders are processed and dispatched within <strong>24&ndash;48 hours</strong> of order confirmation. Since our protein bars are made fresh in small batches, orders are packed immediately to ensure maximum freshness.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Domestic Shipping (India)
            </h2>
            <p className="text-sm text-gray-600">
              We ship across India using leading premium express shipping networks. Estimated delivery time is <strong>2&ndash;5 business days</strong> after dispatch, depending on your location. Tracking details are shared via email and SMS immediately upon shipment.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              International Shipping
            </h2>
            <p className="text-sm text-gray-600">
              Currently, we ship only within India. However, if you are an international buyer seeking bulk distribution or trade partnership, please contact us through our &apos;Partner with Us&apos; page.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Shipping Address
            </h2>
            <p className="text-sm text-gray-600">
              Orders are shipped to the address provided at checkout. Please double-check your delivery details. We are unable to redirect shipments once an order has been dispatched.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Delays &amp; Exceptions
            </h2>
            <p className="text-sm text-gray-600">
              While we do our best to meet estimated delivery windows, delays caused by weather conditions, public holidays, or courier hub congestion are outside our control. We will keep you updated if there is a significant delay on our end.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h2 className="font-jost text-sm font-bold uppercase tracking-widest text-black">
              Damaged in Transit
            </h2>
            <p className="text-sm text-gray-600">
              If your supplement pack or protein bars arrive damaged, please photograph the outer shipping box and the product seal and contact us within <strong>48 hours of delivery</strong>. We will arrange a free replacement immediately.
            </p>
          </div>

          <hr className="border-[#e5e0da]" />

          {/* Contact */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500 font-jost tracking-wide uppercase">
              Questions about your shipment?
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
