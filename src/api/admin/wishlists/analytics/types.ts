import type { WishlistAnalyticsView } from "../../../../modules/wishlist/types/analytics";

export type WishlistAnalyticsResponse = Omit<
  WishlistAnalyticsView,
  "top_products" | "top_variants" | "by_sales_channel"
> & {
  top_products: Array<{
    product_id: string;
    title: string;
    thumbnail: string | null;
    wishlist_count: number;
    item_count: number;
  }>;
  top_variants: Array<{
    product_variant_id: string;
    product_id: string;
    title: string;
    wishlist_count: number;
  }>;
  by_sales_channel: Array<{
    sales_channel_id: string;
    name: string;
    wishlist_count: number;
  }>;
};
