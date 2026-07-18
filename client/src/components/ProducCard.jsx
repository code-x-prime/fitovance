"use client";

import { formatCurrency, fetchApi } from "@/lib/utils";
import { Eye, Heart } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductQuickView from "./ProductQuickView";

const getImageUrl = (image) => {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

const calculateDiscount = (original, sale) => {
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

const ProductCard = memo(function ProductCard({ product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlistItems, setWishlistItems] = useState({});
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [priceVisibilitySettings, setPriceVisibilitySettings] = useState(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const productLink = product.variantId
    ? `/products/${product.slug}?variant=${product.variantId}`
    : `/products/${product.slug}`;

  const actualProductId = product.productId || product.id;

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated || typeof window === "undefined") return;
      try {
        const res = await fetchApi("/users/wishlist", { credentials: "include" });
        const map = {};
        res.data?.wishlistItems?.forEach((item) => { map[item.productId] = true; });
        setWishlistItems(map);
      } catch (_) {}
    };
    fetchWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const res = await fetchApi("/public/price-visibility-settings");
        if (res.success) setPriceVisibilitySettings(res.data);
      } catch (_) {
        setPriceVisibilitySettings({ hidePricesForGuests: false });
      }
    };
    fetchVisibility();
  }, []);

  const allImages = useMemo(() => {
    const imgs = [];
    const seen = new Set();

    const addImg = (url) => {
      const full = getImageUrl(url);
      if (full && !seen.has(full)) { seen.add(full); imgs.push(full); }
    };

    if (product.variantId && product.variants) {
      const v = product.variants.find((x) => x.id === product.variantId);
      v?.images?.forEach((img) => addImg(img?.url || img));
    }

    if (imgs.length === 0 && product.variants?.length > 0) {
      product.variants.forEach((v) => v.images?.forEach((img) => addImg(img?.url || img)));
    }

    if (product.images?.length > 0) {
      product.images.forEach((img) => addImg(img?.url || img));
    }

    if (imgs.length === 0 && product.image) addImg(product.image);
    if (imgs.length === 0) imgs.push("/placeholder.png");
    return imgs;
  }, [product]);

  useEffect(() => {
    if (!isHovered || allImages.length <= 1) { setCurrentImageIndex(0); return; }
    const iv = setInterval(() => setCurrentImageIndex((p) => (p + 1) % allImages.length), 2500);
    return () => clearInterval(iv);
  }, [isHovered, allImages.length]);

  useEffect(() => { if (!isHovered) setCurrentImageIndex(0); }, [isHovered]);

  const variantInfo = useMemo(() => {
    const v = product.variants?.[0];
    if (!v) return null;
    let color = null, size = null, hexCode = null;
    if (v.attributes?.length) {
      v.attributes.forEach((a) => {
        if (a.attribute === "Color") {
          color = a.value;
          const opt = product.attributeOptions?.find((o) => o.name === "Color");
          hexCode = opt?.values?.find((x) => x.id === a.attributeValueId)?.hexCode || null;
        } else if (a.attribute === "Size") size = a.value;
      });
    }
    if (!color) color = v.color?.name;
    if (!size) size = v.size?.name;
    if (!hexCode) hexCode = v.color?.hexCode;
    return { color, size, hexCode };
  }, [product]);

  const parsePrice = (v) => {
    if (v === null || v === undefined) return null;
    const p = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(p) ? null : p;
  };

  const basePriceField = parsePrice(product.basePrice);
  const regularPriceField = parsePrice(product.regularPrice);
  const priceField = parsePrice(product.price);
  const salePriceField = parsePrice(product.salePrice);

  let hasSale = product.hasSale != null ? Boolean(product.hasSale) : false;
  if (!hasSale && salePriceField && salePriceField > 0) {
    if ((regularPriceField && salePriceField < regularPriceField) ||
        (priceField && salePriceField < priceField) ||
        (basePriceField && regularPriceField && salePriceField < regularPriceField)) {
      hasSale = true;
    }
  }

  let originalPrice = null, currentPrice = 0;

  if (basePriceField !== null && regularPriceField !== null) {
    if (hasSale && basePriceField < regularPriceField) {
      currentPrice = basePriceField; originalPrice = regularPriceField;
    } else {
      currentPrice = basePriceField;
    }
  } else if (salePriceField !== null && (priceField !== null || basePriceField !== null)) {
    if (hasSale && salePriceField) {
      currentPrice = salePriceField;
      if (priceField && priceField > salePriceField) originalPrice = priceField;
      else if (basePriceField && basePriceField > salePriceField) originalPrice = basePriceField;
      else if (regularPriceField && regularPriceField > salePriceField) originalPrice = regularPriceField;
    } else {
      currentPrice = priceField || basePriceField || regularPriceField || 0;
    }
  } else {
    if (hasSale && salePriceField) {
      currentPrice = salePriceField;
      originalPrice = regularPriceField || priceField || basePriceField || null;
    } else {
      currentPrice = basePriceField || regularPriceField || priceField || salePriceField || 0;
    }
  }

  if (currentPrice == null || isNaN(currentPrice)) currentPrice = 0;
  const discountPercent = hasSale && originalPrice && currentPrice ? calculateDiscount(originalPrice, currentPrice) : 0;

  const stock = product.variants?.[0]?.stock ?? product.variants?.[0]?.quantity ?? 0;
  const isOutOfStock = product.variants?.length > 0 && stock === 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push(`/auth?redirect=${encodeURIComponent(productLink)}`); return; }
    setIsAddingToWishlist(true);
    try {
      if (wishlistItems[actualProductId]) {
        const res = await fetchApi("/users/wishlist", { credentials: "include" });
        const item = res.data?.wishlistItems?.find((x) => x.productId === actualProductId);
        if (item) {
          await fetchApi(`/users/wishlist/${item.id}`, { method: "DELETE", credentials: "include" });
          setWishlistItems((p) => ({ ...p, [actualProductId]: false }));
          toast.success("Removed from wishlist");
        }
      } else {
        await fetchApi("/users/wishlist", {
          method: "POST", credentials: "include",
          body: JSON.stringify({ productId: actualProductId }),
        });
        setWishlistItems((p) => ({ ...p, [actualProductId]: true }));
        toast.success("Added to wishlist");
      }
    } catch (_) { toast.error("Failed to update wishlist"); }
    finally { setIsAddingToWishlist(false); }
  };

  return (
    <div
      className="group relative bg-white border border-[#ECECEC] rounded-[8px] overflow-hidden transition-shadow duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <Link href={productLink} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F9F9F9]">
          {/* Images */}
          {allImages.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`${product.name} - Image ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-contain p-2 transition-all duration-500 ${
                idx === currentImageIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-[0.98] absolute inset-0"
              } group-hover:scale-[1.03]`}
              onLoad={() => setImageLoaded(true)}
            />
          ))}

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[#F5F5F5] animate-pulse" />
          )}

          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {hasSale && discountPercent > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#111111] rounded-full">
                -{discountPercent}%
              </span>
            )}
            {product.isNew && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#111111] rounded-full">
                New
              </span>
            )}
            {isOutOfStock && (
              <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#DC2626] rounded-full">
                Sold Out
              </span>
            )}
          </div>

          {/* Wishlist - Top Right */}
          <button
            onClick={handleWishlist}
            disabled={isAddingToWishlist}
            className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110 ${
              wishlistItems[actualProductId] ? "text-[#DC2626]" : "text-[#999999] hover:text-[#111111]"
            }`}
            aria-label={wishlistItems[actualProductId] ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 ${wishlistItems[actualProductId] ? "fill-current" : ""}`}
              strokeWidth={1.5}
            />
          </button>

          {/* Quick Actions - Hover */}
          <div className={`absolute bottom-3 left-3 right-3 z-10 flex gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewProduct(product);
                setQuickViewOpen(true);
              }}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-wider rounded-[6px] transition-colors hover:bg-[#333333]"
            >
              <Eye className="h-3.5 w-3.5" />
              Quick View
            </button>
          </div>

          {/* Image Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? "w-5 bg-[#111111]" : "w-1.5 bg-[#CCCCCC] hover:bg-[#999999]"
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={productLink} className="block">
          {/* Category */}
          {(product.category?.name || product.categories?.[0]?.category?.name) && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999999] mb-1.5"
               style={{ fontFamily: "var(--font-jost)" }}>
              {product.category?.name || product.categories?.[0]?.category?.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-[15px] font-bold text-[#111111] leading-tight line-clamp-2 mb-1"
              style={{ fontFamily: "var(--font-jost)" }}>
            {product.name}
          </h3>

          {/* Variant Info */}
          {variantInfo && (variantInfo.color || variantInfo.size) && (
            <p className="text-[12px] text-[#999999] mb-2" style={{ fontFamily: "var(--font-roboto)" }}>
              {[variantInfo.color, variantInfo.size].filter(Boolean).join(" / ")}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            {priceVisibilitySettings?.hidePricesForGuests && !isAuthenticated ? (
              <span className="text-[13px] text-[#999999]" style={{ fontFamily: "var(--font-jost)" }}>
                Login to view price
              </span>
            ) : priceVisibilitySettings === null ? (
              <span className="text-[13px] text-[#999999]" style={{ fontFamily: "var(--font-jost)" }}>
                Login to view price
              </span>
            ) : (
              <>
                <span className="text-[16px] font-bold text-[#111111]" style={{ fontFamily: "var(--font-jost)" }}>
                  {formatCurrency(currentPrice)}
                </span>
                {hasSale && originalPrice && currentPrice < originalPrice && (
                  <span className="text-[13px] text-[#BBBBBB] line-through" style={{ fontFamily: "var(--font-jost)" }}>
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>
        </Link>
      </div>

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </div>
  );
});

export default ProductCard;
