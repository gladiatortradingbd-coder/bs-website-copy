"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar({
  placeholder = "Search plants...",
  className = "",
  inputClassName = "",
  compact = false,
  submitHref,
  filterHref,
  queryKey = "q",
  filterKey = "category",
  showFilters = true,
  liveResultsEndpoint,
  liveResultsLimit = 5,
  resultsPlacement = "overlay",
  ...inputProps
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultValue, name, onChange, value, ...restInputProps } = inputProps;
  const [internalValue, setInternalValue] = useState(() => {
    if (typeof value === "string") {
      return value;
    }

    if (typeof defaultValue === "string") {
      return defaultValue;
    }

    return submitHref ? searchParams.get(queryKey) ?? "" : "";
  });
  const [debouncedValue, setDebouncedValue] = useState(() => (typeof value === "string" ? value : ""));
  const [suggestions, setSuggestions] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get(filterKey) ?? "");
  const [priceLimit, setPriceLimit] = useState(() => searchParams.get("maxPrice") ?? "");
  const [isLoading, setIsLoading] = useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const normalizedQuery = debouncedValue.trim();

  const shellClasses = [
    "flex min-w-0 items-center border border-gray-300 transition-all duration-300 focus-within:border-[#065f46]",
    compact ? "rounded-xl px-3 py-2" : "rounded-full px-3 py-2",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inputClasses = [
    "min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400",
    compact ? "px-2 text-xs" : "px-2 text-sm",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const initialValue =
    value ?? defaultValue ?? (submitHref ? searchParams.get(queryKey) ?? "" : "");

  useEffect(() => {
    if (isControlled) {
      setInternalValue(typeof value === "string" ? value : "");
    }
  }, [isControlled, value]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(currentValue);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [currentValue]);

  useEffect(() => {
    if (!liveResultsEndpoint || !showFilters) {
      return undefined;
    }

    const controller = new AbortController();

    fetch(`${liveResultsEndpoint}?categories=1`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        const nextCategories = Array.isArray(data?.categories) ? data.categories : [];
        setFilterCategories(nextCategories);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setFilterCategories([]);
        }
      });

    return () => controller.abort();
  }, [liveResultsEndpoint, showFilters]);

  useEffect(() => {
    if (!liveResultsEndpoint) {
      setSuggestions([]);
      return undefined;
    }

    if (!normalizedQuery) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const nextParams = new URLSearchParams({
      search: normalizedQuery,
      limit: String(liveResultsLimit),
    });

    if (activeFilter) {
      nextParams.set("category", activeFilter);
    }

    if (priceLimit.trim()) {
      nextParams.set("maxPrice", priceLimit.trim());
    }

    setIsLoading(true);

    fetch(`${liveResultsEndpoint}?${nextParams.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        setSuggestions(Array.isArray(data?.products) ? data.products : []);
      })
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [activeFilter, liveResultsEndpoint, liveResultsLimit, normalizedQuery, priceLimit]);

  useEffect(() => {
    const nextFilter = searchParams.get(filterKey) ?? "";
    if (nextFilter !== activeFilter) {
      setActiveFilter(nextFilter);
    }
  }, [activeFilter, filterKey, searchParams]);

  useEffect(() => {
    const nextPriceLimit = searchParams.get("maxPrice") ?? "";

    if (nextPriceLimit !== priceLimit) {
      setPriceLimit(nextPriceLimit);
    }
  }, [priceLimit, searchParams]);

  const handleSubmit = (event) => {
    if (!submitHref) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawQuery = String(formData.get(queryKey) ?? "").trim();
    const nextParams = new URLSearchParams();

    if (rawQuery) {
      nextParams.set(queryKey, rawQuery);
    }

    if (activeFilter) {
      nextParams.set(filterKey, activeFilter);
    }

    if (priceLimit.trim()) {
      nextParams.set("maxPrice", priceLimit.trim());
    }

    const targetUrl = nextParams.toString() ? `${submitHref}?${nextParams.toString()}` : submitHref;

    router.push(targetUrl);
  };

  const onInputChange = (event) => {
    if (!isControlled) {
      setInternalValue(event.target.value);
    }

    onChange?.(event);
  };

  const inputPropsToPass = isControlled ? { value } : { defaultValue: initialValue };

  const hasLiveResults = Boolean(liveResultsEndpoint && normalizedQuery);

  const buildResultUrl = (product) => {
    const nextParams = new URLSearchParams();
    const title = String(product?.title ?? "").trim();
    const category = String(product?.category ?? "").trim();

    if (title) {
      nextParams.set(queryKey, title);
    }

    if (category) {
      nextParams.set(filterKey, category);
    }

    if (priceLimit.trim()) {
      nextParams.set("maxPrice", priceLimit.trim());
    }

    return `${submitHref ?? "/shop"}?${nextParams.toString()}`;
  };

  const handleFilterSelect = (filterValue) => {
    setActiveFilter(filterValue);
    setFiltersOpen(false);
  };

  const handlePriceReset = () => {
    setPriceLimit("");
  };

  const hasActivePriceFilter = Boolean(priceLimit.trim());
  const hasActiveCategoryFilter = Boolean(activeFilter);
  const filterButtonActive = hasActiveCategoryFilter || hasActivePriceFilter;

  const searchField = (
    <>
      <Search className="h-4.5 w-4.5 text-muted-foreground" />
      <input
        type="text"
        name={name ?? (submitHref ? queryKey : undefined)}
        placeholder={placeholder}
        className={inputClasses}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : initialValue}
        onChange={onInputChange}
        {...inputPropsToPass}
        {...restInputProps}
      />
      {showFilters ? (
        <button
          type="button"
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${filterButtonActive ? "bg-[#065f46] text-white dark:text-black" : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"}`}
          aria-label={filterHref ? "Go to shop filters" : "Open filters"}
          aria-expanded={filterHref ? undefined : filtersOpen}
          onClick={() => {
            if (filterHref) {
              router.push(filterHref);
              return;
            }

            setFiltersOpen((open) => !open);
          }}
        >
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </button>
      ) : null}
    </>
  );

  const filterPanel = filtersOpen && showFilters && !filterHref ? (
    <div
      className={
        resultsPlacement === "stack"
          ? "mt-2 overflow-hidden rounded-3xl border border-border-color bg-background p-3 shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
          : "absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-3xl border border-border-color bg-background p-3 shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
      }
    >
      <div className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Filter by category</div>
      <div className="flex max-h-72 flex-col gap-2 overflow-auto pr-1">
        <button
          type="button"
          className={`rounded-2xl px-3 py-2 text-left text-sm transition-colors ${activeFilter ? "bg-gray-50 text-foreground hover:bg-gray-100" : "bg-[#065f46] text-white dark:text-black"}`}
          onClick={() => handleFilterSelect("")}
        >
          All products
        </button>
        {filterCategories.map((filter) => (
          <button
            type="button"
            key={filter}
            className={`rounded-2xl px-3 py-2 text-left text-sm transition-colors ${activeFilter === filter ? "bg-[#065f46] text-white dark:text-black" : "bg-gray-50 text-foreground hover:bg-gray-100"}`}
            onClick={() => handleFilterSelect(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Filter by price</div>
        <p className="mt-1 text-xs text-muted-foreground">Minimum starts at ৳0</p>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">Max price</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={priceLimit}
            onChange={(event) => setPriceLimit(event.target.value)}
            placeholder="1000"
            className="h-10 rounded-xl border border-border-color bg-background px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#065f46]"
          />
        </label>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePriceReset}
            className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Reset price
          </button>

          {hasActivePriceFilter ? (
            <span className="text-xs font-medium text-[#065f46]">Price filter active</span>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  const resultsPanel = liveResultsEndpoint && hasLiveResults ? (
    <div
      className={
        resultsPlacement === "stack"
          ? "mt-2 overflow-hidden rounded-3xl border border-border-color bg-background shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
          : "absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-3xl border border-border-color bg-background shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
      }
    >
      <div className="border-b border-gray-100 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {isLoading ? "Searching..." : `${suggestions.length} match${suggestions.length === 1 ? "" : "es"}`}
      </div>

      {suggestions.length > 0 ? (
        <div className="max-h-80 overflow-auto py-2">
          {suggestions.map((product) => (
            <button
              type="button"
              key={product.id}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => router.push(buildResultUrl(product))}
            >
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{product.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{product.category}</div>
              </div>
              {product.price ? <div className="text-xs font-medium text-foreground">Tk {product.price}</div> : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-4 py-5 text-sm text-muted-foreground">No matching products.</div>
      )}
    </div>
  ) : null;

  if (submitHref || liveResultsEndpoint) {
    return (
      <div className={resultsPlacement === "stack" ? "min-w-0" : "relative min-w-0"}>
        <form className={shellClasses} onSubmit={handleSubmit} role="search">
          {searchField}
        </form>
        {showFilters ? filterPanel : null}
        {resultsPanel}
      </div>
    );
  }

  return <div className={shellClasses}>{searchField}</div>;
}