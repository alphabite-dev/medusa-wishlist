import { RemoteQueryFunctionReturnPagination } from "@medusajs/framework/types";

export const getPagination = (opts?: RemoteQueryFunctionReturnPagination) => {
  const { count = 0, take = 10, skip = 0 } = opts || {};

  const totalPages = Math.max(Math.ceil(count / take), 1);
  const currentPage = skip / take + 1;
  const nextPage = Math.min(currentPage + 1, totalPages);
  const prevPage = Math.max(currentPage - 1, 1);

  return { count, nextPage, currentPage, prevPage, totalPages };
};

export const defaultItemsFields = [
  "id",
  "product_id",
  "wishlist_id",
  "created_at",
  "updated_at",
  "deleted_at",
  "product_variant.*",
  "product_variant.prices.*",
  "product_variant.calculated_price",
  "product_variant.product.thumbnail",
];
