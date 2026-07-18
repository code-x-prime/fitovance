"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Star, ShoppingCart, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, Plus, Minus, Truck,
} from "lucide-react";
import { useAddVariantToCart } from "@/lib/cart-utils";
import AddonSvgIcon from "@/components/AddonSvgIcon";
import { toast } from "sonner";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function ProductQuickView({ product, open, onOpenChange }) {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [effectivePriceInfo, setEffectivePriceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addVariantToCart } = useAddVariantToCart();
  const [productDetails, setProductDetails] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [priceVisibilitySettings, setPriceVisibilitySettings] = useState(null);
  const [addonServices, setAddonServices] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) {
      setSelectedAttributes({});
      setSelectedVariant(null);
      setQuantity(1);
      setError(null);
      setSuccess(false);
      setProductDetails(null);
      setImgSrc("");
      setAvailableCombinations([]);
      setInitialLoading(true);
      setAddonServices([]);
      setSelectedAddonIds([]);
      return;
    }
    if (product) setImgSrc(product.image || "/placeholder.png");
  }, [product, open]);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const res = await fetchApi("/public/price-visibility-settings");
        if (res?.data) setPriceVisibilitySettings(res.data);
      } catch (_) { }
    };
    fetchVisibility();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!product || !open) { setProductDetails(null); return; }
      setLoading(true); setInitialLoading(true); setError(null);
      try {
        const res = await fetchApi(`/public/products/${product.slug}`);
        if (res?.data?.product) {
          const pd = res.data.product;
          setProductDetails(pd);
          if (pd.id) {
            fetchApi(`/public/products/${pd.id}/addons`)
              .then((r) => setAddonServices(r?.data?.data?.addons || []))
              .catch(() => { });
          }
          if (pd.images?.length > 0) {
            const first = pd.images.find((i) => i.isPrimary) || pd.images[0];
            setImgSrc(getImageUrl(first.url) || "/placeholder.png");
          } else if (pd.image) {
            setImgSrc(getImageUrl(pd.image) || "/placeholder.png");
          }
          if (pd.variants?.length > 0) {
            const combos = pd.variants
              .filter((v) => v.isActive !== false && (v.quantity > 0 || v.quantity === undefined))
              .map((v) => {
                const map = {};
                v.attributes?.forEach((a) => {
                  const opt = pd.attributeOptions?.find((o) => o.name === a.attribute);
                  if (opt) map[opt.id] = a.attributeValueId;
                });
                return {
                  attributeMap: map,
                  variant: {
                    ...v,
                    price: typeof v.price === "string" ? parseFloat(v.price) : v.price,
                    salePrice: v.salePrice ? (typeof v.salePrice === "string" ? parseFloat(v.salePrice) : v.salePrice) : null,
                  },
                };
              });
            setAvailableCombinations(combos);
            if (combos.length > 0) {
              const first = combos[0];
              setSelectedAttributes(first.attributeMap);
              setSelectedVariant(first.variant);
              const moq = first.variant.moq || 1;
              setQuantity(moq);
              setEffectivePriceInfo(getEffectivePrice(first.variant, moq));
            }
          }
        } else {
          setError("Product details not available");
        }
      } catch (err) {
        setError(err?.message || "Failed to load product details");
      } finally {
        setLoading(false); setInitialLoading(false);
      }
    };
    fetchDetails();
  }, [product?.slug, product?.id, open]);

  const handleAttributeSelect = useCallback((attrId, valueId) => {
    const newAttrs = { ...selectedAttributes, [attrId]: valueId };
    setSelectedAttributes(newAttrs);
    const match = availableCombinations.find((c) =>
      Object.entries(newAttrs).every(([aid, vid]) => c.attributeMap[aid] === vid)
    );
    if (match) {
      setSelectedVariant(match.variant);
      const moq = match.variant.moq || 1;
      const newQty = quantity < moq ? moq : quantity;
      if (quantity < moq) setQuantity(newQty);
      setEffectivePriceInfo(getEffectivePrice(match.variant, newQty));
    }
  }, [selectedAttributes, availableCombinations, quantity]);

  const isAttrValueAvailable = useCallback((attrId, valueId) => {
    const test = { ...selectedAttributes, [attrId]: valueId };
    return availableCombinations.some((c) =>
      Object.entries(test).every(([aid, vid]) => c.attributeMap[aid] === undefined || c.attributeMap[aid] === vid)
    );
  }, [selectedAttributes, availableCombinations]);

  const handleAddToCart = async () => {
    setAddingToCart(true); setError(null); setSuccess(false);
    let variant = selectedVariant || productDetails?.variants?.[0];
    if (!variant) { setError("No product variant available"); setAddingToCart(false); return; }
    try {
      const result = await addVariantToCart(variant, quantity, productDetails?.name || product?.name, selectedAddonIds);
      if (result.success) { setSuccess(true); setTimeout(() => onOpenChange(false), 2000); }
      else setError("Failed to add to cart. Please try again.");
    } catch (_) { setError("Failed to add to cart. Please try again."); }
    finally { setAddingToCart(false); }
  };

  const parsePrice = (p) => {
    if (!p) return 0;
    if (typeof p === "number") return p;
    if (typeof p === "string") return parseFloat(p) || 0;
    return 0;
  };

  const getEffectivePrice = (variant, qty) => {
    if (!variant) return null;
    const baseSale = parsePrice(variant.salePrice);
    const base = parsePrice(variant.price);
    const orig = baseSale > 0 && baseSale < base ? baseSale : base;
    if (variant.pricingSlabs?.length > 0) {
      const sorted = [...variant.pricingSlabs].sort((a, b) => b.minQty - a.minQty);
      for (const slab of sorted) {
        if (qty >= slab.minQty && (slab.maxQty === null || qty <= slab.maxQty)) {
          return { price: slab.price, originalPrice: orig, source: "SLAB", slab };
        }
      }
    }
    return { price: orig, originalPrice: orig, source: "DEFAULT", slab: null };
  };

  const getPriceData = () => {
    if (initialLoading || loading) return { loading: true };
    if (selectedVariant) {
      const info = effectivePriceInfo || getEffectivePrice(selectedVariant, quantity);
      if (info) {
        const baseSale = parsePrice(selectedVariant.salePrice);
        const base = parsePrice(selectedVariant.price);
        return {
          currentPrice: info.price,
          originalPrice: info.source === "SLAB" && info.originalPrice > info.price
            ? info.originalPrice
            : (baseSale > 0 && baseSale < base ? base : null),
          loading: false, isSlabPrice: info.source === "SLAB",
        };
      }
      const sale = parsePrice(selectedVariant.salePrice);
      const pr = parsePrice(selectedVariant.price);
      return { currentPrice: sale > 0 && sale < pr ? sale : pr, originalPrice: sale > 0 && sale < pr ? pr : null, loading: false };
    }
    if (productDetails) {
      const bp = parsePrice(productDetails.basePrice);
      const rp = parsePrice(productDetails.regularPrice);
      const hs = productDetails.hasSale && bp > 0 && rp > bp;
      return { currentPrice: bp, originalPrice: hs ? rp : null, loading: false };
    }
    if (product) {
      const bp = parsePrice(product.basePrice);
      const rp = parsePrice(product.regularPrice);
      const hs = product.hasSale && bp > 0 && rp > bp;
      return { currentPrice: bp, originalPrice: hs ? rp : null, loading: false };
    }
    return { loading: false, currentPrice: 0, originalPrice: null };
  };

  const allImages = useMemo(() => {
    if (!product) return [];
    const dp = productDetails || product;
    const imgs = [];
    const add = (url) => { const u = getImageUrl(url); if (u && !imgs.includes(u)) imgs.push(u); };

    selectedVariant?.images?.sort((a, b) => (a.isPrimary && !b.isPrimary ? -1 : !a.isPrimary && b.isPrimary ? 1 : (a.order || 0) - (b.order || 0)))
      ?.forEach((img) => add(img.url));

    dp?.images?.sort((a, b) => (a.isPrimary && !b.isPrimary ? -1 : !a.isPrimary && b.isPrimary ? 1 : (a.order || 0) - (b.order || 0)))
      ?.forEach((img) => add(img.url));

    if (imgs.length === 0 && dp?.variants?.length > 0) {
      for (const v of dp.variants) {
        if (v.images?.length > 0) { v.images.forEach((img) => add(img.url)); break; }
      }
    }

    if (imgs.length === 0) {
      if (dp?.image) add(dp.image);
      else if (imgSrc) imgs.push(imgSrc);
      else imgs.push("/placeholder.png");
    }
    return imgs;
  }, [productDetails, selectedVariant, product, imgSrc]);

  useEffect(() => { setCurrentImageIndex(0); }, [selectedVariant?.id, productDetails?.id, product?.id]);

  if (!product) return null;
  const dp = productDetails || product;

  const priceData = getPriceData();
  const discountPct = priceData.originalPrice && priceData.originalPrice > priceData.currentPrice
    ? Math.round(((priceData.originalPrice - priceData.currentPrice) / priceData.originalPrice) * 100) : null;

  const stock = selectedVariant?.stock ?? selectedVariant?.quantity ?? 0;
  const isInStock = stock > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-[12px] border border-[#ECECEC]">
        {loading && !productDetails ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 max-h-[90vh]">

            {/* ─── Left: Image Gallery ────────────────────────────── */}
            <div className="relative bg-[#F9F9F9] flex flex-col lg:flex-row">
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="hidden lg:flex flex-col gap-2 p-4 overflow-y-auto max-h-[500px]">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-[6px] overflow-hidden border-2 transition-all flex-shrink-0 ${currentImageIndex === idx ? "border-[#111111]" : "border-transparent hover:border-[#CCCCCC]"
                        }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                <Image
                  src={allImages[currentImageIndex] || "/placeholder.png"}
                  alt={dp.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {/* Nav Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((p) => p === 0 ? allImages.length - 1 : p - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#E5E5E5] flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                    >
                      <ChevronLeft className="h-4 w-4 text-[#111111]" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((p) => p === allImages.length - 1 ? 0 : p + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#E5E5E5] flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
                    >
                      <ChevronRight className="h-4 w-4 text-[#111111]" />
                    </button>
                  </>
                )}

                {/* Discount Badge */}
                {discountPct > 0 && (
                  <span className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#111111] rounded-full">
                    -{discountPct}%
                  </span>
                )}

                {/* Mobile Dots */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden">
                    {allImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-5 bg-[#111111]" : "w-1.5 bg-[#CCCCCC]"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right: Product Details ─────────────────────────── */}
            <div className="flex flex-col p-6 lg:p-8 overflow-y-auto">
              {/* Success */}
              {success && (
                <div className="mb-4 p-3 bg-[#F0FDF4] text-[#16A34A] text-sm rounded-[8px] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Item added to cart successfully
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-[#FEF2F2] text-[#DC2626] text-sm rounded-[8px] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* Category */}
              {(dp.category?.name || dp.categories?.[0]?.category?.name) && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999999] mb-2"
                  style={{ fontFamily: "var(--font-jost)" }}>
                  {dp.category?.name || dp.categories?.[0]?.category?.name}
                </p>
              )}

              {/* Name */}
              <h2 className="text-[22px] lg:text-[26px] font-bold text-[#111111] leading-tight mb-3"
                style={{ fontFamily: "var(--font-jost)" }}>
                {dp.name}
              </h2>

              {/* Rating */}
              {dp.avgRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(dp.avgRating) ? "text-[#FBBF24] fill-[#FBBF24]" : "text-[#E5E5E5]"}`} />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#666666]" style={{ fontFamily: "var(--font-roboto)" }}>
                    ({dp.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                {priceVisibilitySettings?.hidePricesForGuests && !isAuthenticated ? (
                  <div>
                    <span className="text-[20px] font-bold text-[#999999]" style={{ fontFamily: "var(--font-jost)" }}>
                      Login to view price
                    </span>
                    <p className="text-[13px] text-[#999999] mt-1" style={{ fontFamily: "var(--font-roboto)" }}>
                      Please log in to see pricing information
                    </p>
                  </div>
                ) : priceVisibilitySettings === null ? (
                  <div className="h-8 w-32 bg-[#F5F5F5] animate-pulse rounded-[4px]" />
                ) : (
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-[24px] font-bold text-[#111111]" style={{ fontFamily: "var(--font-jost)" }}>
                      {formatCurrency(priceData.currentPrice || 0)}
                    </span>
                    {priceData.originalPrice && priceData.originalPrice > priceData.currentPrice && (
                      <span className="text-[16px] text-[#BBBBBB] line-through" style={{ fontFamily: "var(--font-jost)" }}>
                        {formatCurrency(priceData.originalPrice)}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-[11px] font-bold text-white bg-[#111111] px-2 py-0.5 rounded-full">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>
                )}
                {priceData.isSlabPrice && (
                  <p className="text-[12px] text-[#16A34A] font-medium mt-1">
                    Bulk pricing applied for {quantity} units
                  </p>
                )}
                <p className="text-[12px] text-[#999999] mt-1" style={{ fontFamily: "var(--font-roboto)" }}>
                  Inclusive of all taxes
                </p>
              </div>

              {/* Attribute Selectors */}
              {productDetails?.attributeOptions?.length > 0 && productDetails.attributeOptions.map((attr) => {
                if (!attr.values?.length) return null;
                return (
                  <div key={attr.id} className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666] mb-2"
                      style={{ fontFamily: "var(--font-jost)" }}>
                      {attr.name}
                      {selectedAttributes[attr.id] && (() => {
                        const sel = attr.values.find((v) => v.id === selectedAttributes[attr.id]);
                        return sel ? <span className="ml-1.5 font-normal text-[#111111] normal-case tracking-normal">{sel.value}</span> : null;
                      })()}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => {
                        const isSel = selectedAttributes[attr.id] === val.id;
                        const isAvail = isAttrValueAvailable(attr.id, val.id);
                        if (val.image) {
                          return (
                            <button key={val.id} type="button"
                              onClick={() => handleAttributeSelect(attr.id, val.id)}
                              disabled={!isAvail}
                              className={`relative flex flex-col items-center gap-1 transition-all ${!isAvail ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <div className={`w-12 h-12 rounded-[6px] overflow-hidden border-2 transition-all ${isSel ? "border-[#111111] ring-1 ring-[#111111] ring-offset-1" : "border-[#E5E5E5] hover:border-[#111111]"}`}>
                                <img src={val.image} alt={val.value} className="w-full h-full object-cover" />
                              </div>
                              {isSel && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#111111] rounded-full flex items-center justify-center"><CheckCircle className="w-2.5 h-2.5 text-white" /></span>}
                            </button>
                          );
                        }
                        if (val.hexCode) {
                          return (
                            <button key={val.id} type="button"
                              onClick={() => handleAttributeSelect(attr.id, val.id)}
                              disabled={!isAvail}
                              className={`relative flex flex-col items-center gap-1 transition-all ${!isAvail ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <div className={`w-8 h-8 rounded-full border-2 transition-all ${isSel ? "border-[#111111] shadow-md scale-110" : "border-[#E5E5E5] hover:border-[#999999]"}`}
                                style={{ backgroundColor: val.hexCode }} />
                              <span className={`text-[10px] font-medium ${isSel ? "text-[#111111]" : "text-[#999999]"}`}>{val.value}</span>
                            </button>
                          );
                        }
                        return (
                          <button key={val.id} type="button"
                            onClick={() => handleAttributeSelect(attr.id, val.id)}
                            disabled={!isAvail}
                            className={`h-9 px-3 rounded-[6px] border text-[12px] font-medium transition-all ${isSel ? "border-[#111111] bg-[#111111] text-white"
                                : isAvail ? "border-[#E5E5E5] text-[#666666] hover:border-[#111111]"
                                  : "border-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed"
                              }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Stock */}
              {selectedVariant && (
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${isInStock ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
                    {isInStock ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> In Stock </>
                    ) : (
                      <><AlertCircle className="h-3.5 w-3.5" /> Out of Stock</>
                    )}
                  </span>
                </div>
              )}

              {/* Pricing Slabs */}
              {selectedVariant?.pricingSlabs?.length > 0 && (
                <div className="mb-4 p-3 bg-[#F9F9F9] border border-[#ECECEC] rounded-[8px]">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666] mb-2" style={{ fontFamily: "var(--font-jost)" }}>
                    Bulk Pricing
                  </h4>
                  <div className="space-y-1">
                    {selectedVariant.pricingSlabs.map((slab, i) => (
                      <div key={i} className="flex justify-between text-[12px]">
                        <span className="text-[#666666]">{slab.minQty}{slab.maxQty ? ` - ${slab.maxQty}` : "+"} units</span>
                        <span className="font-semibold text-[#111111]">{formatCurrency(slab.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {addonServices.length > 0 && (
                <div className="mb-4 border-t border-[#ECECEC] pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666] mb-2" style={{ fontFamily: "var(--font-jost)" }}>
                    Add-on Services
                  </p>
                  <div className="space-y-1.5">
                    {addonServices.map((addon) => {
                      const isSel = selectedAddonIds.includes(addon.id);
                      return (
                        <label key={addon.id}
                          className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-[6px] cursor-pointer transition-all ${isSel ? "border-[#111111] bg-[#F9F9F9]" : "border-[#ECECEC] hover:border-[#CCCCCC]"}`}
                        >
                          <input type="checkbox" checked={isSel}
                            onChange={() => setSelectedAddonIds((p) => isSel ? p.filter((id) => id !== addon.id) : [...p, addon.id])}
                            className="h-3.5 w-3.5 accent-[#111111] flex-shrink-0" />
                          <AddonSvgIcon icon={addon.icon} size={16} className="text-[#666666]" />
                          <span className="flex-1 text-[12px] font-medium text-[#111111] truncate">{addon.name}</span>
                          <span className="text-[12px] font-semibold text-[#111111] flex-shrink-0">
                            +{typeof addon.price === "number" ? `₹${addon.price.toLocaleString("en-IN")}` : `₹${parseFloat(addon.price).toLocaleString("en-IN")}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666]" style={{ fontFamily: "var(--font-jost)" }}>
                    Quantity
                  </label>
                  {selectedVariant?.moq > 1 && (
                    <span className="text-[12px] text-[#999999]">Min. order: {selectedVariant.moq}</span>
                  )}
                </div>
                <div className="inline-flex items-center border border-[#E5E5E5] rounded-[8px] overflow-hidden">
                  <button type="button"
                    onClick={() => {
                      const moq = selectedVariant?.moq || 1;
                      if (quantity > moq) {
                        const nq = quantity - 1;
                        setQuantity(nq);
                        if (selectedVariant) setEffectivePriceInfo(getEffectivePrice(selectedVariant, nq));
                      }
                    }}
                    disabled={quantity <= (selectedVariant?.moq || 1) || addingToCart}
                    className="w-10 h-10 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-[14px] font-semibold text-[#111111] border-x border-[#E5E5E5]">
                    {quantity}
                  </span>
                  <button type="button"
                    onClick={() => {
                      const s = selectedVariant?.stock || selectedVariant?.quantity;
                      if (!s || quantity < s) {
                        const nq = quantity + 1;
                        setQuantity(nq);
                        if (selectedVariant) setEffectivePriceInfo(getEffectivePrice(selectedVariant, nq));
                      }
                    }}
                    disabled={addingToCart || (selectedVariant && isInStock && quantity >= stock)}
                    className="w-10 h-10 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-auto space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={loading || addingToCart || (!selectedVariant && !productDetails?.variants?.length) || (selectedVariant && !isInStock)}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-[#111111] text-white text-[13px] font-bold uppercase tracking-wider rounded-[8px] transition-all hover:bg-[#333333] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--font-jost)" }}
                >
                  {addingToCart ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <Link href={`/products/${dp.slug}`} className="flex-1">
                    <button className="w-full h-10 flex items-center justify-center gap-1.5 border border-[#E5E5E5] text-[#111111] text-[12px] font-semibold uppercase tracking-wider rounded-[8px] hover:bg-[#F5F5F5] transition-colors"
                      style={{ fontFamily: "var(--font-jost)" }}>
                      View Full Details
                    </button>
                  </Link>
                </div>

                {/* Shipping */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#ECECEC]">
                  <Truck className="h-4 w-4 text-[#999999]" />
                  <span className="text-[12px] text-[#999999]" style={{ fontFamily: "var(--font-roboto)" }}>
                    Free shipping on orders above ₹999
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
