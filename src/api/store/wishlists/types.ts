import {
  PriceDTO,
  ProductDTO,
  ProductVariantDTO,
  RemoteQueryFunctionReturnPagination,
} from "@medusajs/types";

export interface PaginatedOutputMeta
  extends RemoteQueryFunctionReturnPagination {
  totalPages: number;
  currentPage: number;
  nextPage: number;
  prevPage: number;
}

export interface PaginatedOutput<T> extends PaginatedOutputMeta {
  data: T[];
}

export interface WishlistItem {
  id: string;
  product_variant_id: string;
  wishlist_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product_variant:
    | (Omit<ProductVariantDTO, "product"> & {
        product: Pick<ProductDTO, "id" | "thumbnail">;
        prices: PriceDTO[];
      })
    | null;
}

export interface Wishlist {
  id: string;
  customer_id: string | null;
  sales_channel_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at: Date | string | null;
  items: WishlistItem[];
}
