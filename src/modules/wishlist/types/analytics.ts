export type WishlistAnalyticsParams = {
  /** ISO date string; defaults to 30 days before `to`. */
  from?: string;
  /** ISO date string; defaults to now. */
  to?: string;
  /** Restrict all metrics to a single sales channel. */
  sales_channel_id?: string;
};

export type Delta = {
  value: number;
  previous: number;
  /** Percent change vs the previous equal-length period, rounded to 1 decimal. */
  delta_pct: number;
};

export type WishlistAnalyticsView = {
  range: { from: string; to: string };
  kpis: {
    total_wishlists: Delta;
    total_items: Delta;
    avg_items_per_wishlist: Delta;
    active_wishlists: number;
    empty_wishlists: number;
    guest_wishlists: number;
    registered_wishlists: number;
    unique_customers: Delta;
  };
  trend: Array<{ date: string; wishlists: number; items: number }>;
  top_products: Array<{ product_id: string; wishlist_count: number; item_count: number }>;
  top_variants: Array<{ product_variant_id: string; product_id: string; wishlist_count: number }>;
};
