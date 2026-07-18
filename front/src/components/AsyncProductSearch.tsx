import { useState, useEffect, useRef, useCallback } from "react";
import { products as productsApi } from "@/api/adminService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  images?: { url: string }[];
  variants?: {
    id: string;
    price: number;
    salePrice?: number;
    sku?: string;
    attributes?: {
      attributeValue?: { value: string };
    }[];
  }[];
  categories?: { category?: { name: string } }[];
  primaryCategory?: { id: string; name: string; slug: string } | null;
}

interface AsyncProductSearchProps {
  value: string;
  onChange: (query: string) => void;
  onSelect: (product: Product) => void;
  selectedProduct?: Product | null;
  onClear: () => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function AsyncProductSearch({
  value,
  onChange,
  onSelect,
  selectedProduct,
  onClear,
  label = "Product",
  required = false,
  placeholder = "Search by name, SKU, or slug...",
  disabled = false,
}: AsyncProductSearchProps) {
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const res = await productsApi.getProducts({
        search: query,
        limit: 20,
      });
      const items = res.data.data?.products || res.data.products || [];
      setResults(items);
      setIsOpen(items.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
      setHighlightIndex(-1);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        searchProducts(val);
      }, 300);
    },
    [onChange, searchProducts]
  );

  const handleSelect = useCallback(
    (product: Product) => {
      onSelect(product);
      setIsOpen(false);
      setResults([]);
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    onClear();
    setResults([]);
    setIsOpen(false);
    setHighlightIndex(-1);
    inputRef.current?.focus();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        );
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(results[highlightIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    },
    [isOpen, results, highlightIndex, handleSelect]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      debounceRef.current && clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  if (selectedProduct) {
    return (
      <div className="space-y-2">
        {label && (
          <Label>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-[var(--bg-secondary)]">
          {selectedProduct.images?.[0]?.url && (
            <img
              src={selectedProduct.images[0].url}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {selectedProduct.name}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {selectedProduct.variants?.length || 0} variant(s)
              {selectedProduct.primaryCategory?.name &&
                ` · ${selectedProduct.primaryCategory.name}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 relative">
      {label && (
        <Label>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="pl-9 pr-8"
          disabled={disabled}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--text-secondary)]" />
        )}
        {!isLoading && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-[var(--bg-secondary)]"
          >
            <X className="h-3 w-3 text-[var(--text-secondary)]" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((product, i) => (
            <button
              key={product.id}
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                i === highlightIndex
                  ? "bg-[var(--bg-secondary)]"
                  : "hover:bg-[var(--bg-secondary)]"
              }`}
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover border flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-[var(--text-secondary)]">N/A</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{product.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {product.variants?.[0]?.sku && `SKU: ${product.variants[0].sku}`}
                  {product.primaryCategory?.name && ` · ${product.primaryCategory.name}`}
                </p>
              </div>
              {product.variants?.[0] && (
                <span className="text-xs font-medium text-[var(--text-secondary)] flex-shrink-0">
                  ₹{product.variants[0].salePrice || product.variants[0].price}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
