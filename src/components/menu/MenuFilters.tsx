'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'newest';
export type CategoryFilter = 'all' | 'signature-shakes' | 'cold-coffee';

interface MenuFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: CategoryFilter;
  onCategoryChange: (value: CategoryFilter) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
}

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Drinks' },
  { value: 'signature-shakes', label: 'Signature Shakes' },
  { value: 'cold-coffee', label: 'Cold Coffee' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Sort: Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export function MenuFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}: MenuFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tbc-cream-dim"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search drinks..."
          aria-label="Search menu"
          className="w-full rounded-full border border-tbc-charcoal-border bg-tbc-charcoal-light py-2.5 pl-10 pr-4 text-sm text-tbc-cream placeholder:text-tbc-cream-dim focus:border-tbc-gold-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              aria-pressed={category === c.value}
              onClick={() => onCategoryChange(c.value)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                category === c.value
                  ? 'border-tbc-gold-400 bg-tbc-gold-400 text-black'
                  : 'border-tbc-charcoal-border text-tbc-cream-muted hover:border-tbc-gold-400/50'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="menu-sort">
          Sort menu
        </label>
        <select
          id="menu-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-full border border-tbc-charcoal-border bg-tbc-charcoal-light px-4 py-2.5 text-sm text-tbc-cream focus:border-tbc-gold-400"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
