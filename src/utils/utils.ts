import { RemoteQueryFunctionReturnPagination } from "@medusajs/framework/types";

export const getPagination = (opts?: RemoteQueryFunctionReturnPagination) => {
  const { count = 0, take = 10, skip = 0 } = opts || {};

  const totalPages = Math.max(Math.ceil(count / take), 1);
  const currentPage = skip / take + 1;
  const nextPage = Math.min(currentPage + 1, totalPages);
  const prevPage = Math.max(currentPage - 1, 1);

  return { count, nextPage, currentPage, prevPage, totalPages };
};

export const defaultFields = ["id", "name", "customer_id", "sales_channel_id"];

export const defaultItemsFields = [
  "id",
  "wishlist_id",
  "product_variant.id",
  "product_variant.title",
  "product_variant.product.id",
  "product_variant.product.handle",
  "product_variant.product.thumbnail",
];
