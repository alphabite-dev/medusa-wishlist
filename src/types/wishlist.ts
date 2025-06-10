import { BaseProduct } from "@medusajs/types/dist/http/product/common";

export interface WishlistOutput {
  wishlist: {
    id: string;
    customer_id: string;
    sales_channel_id: string;
    items: WishlistItem[];
    created_at: string;
    updated_at: string;
  };
}

export interface WishlistItem {
  id: string;
  product_id: string;
  wishlist_id: string;
  created_at: string;
  updated_at: string;
  variants: BaseProduct["variants"];
  product: BaseProduct;
}
