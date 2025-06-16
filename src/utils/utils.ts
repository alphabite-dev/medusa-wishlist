import { RemoteQueryFunctionReturnPagination } from "@medusajs/framework/types";

export const getPagination = ({ count, take, skip }: RemoteQueryFunctionReturnPagination) => {
  const totalPages = Math.max(Math.ceil(count / take), 1);
  const currentPage = skip / take + 1;
  const nextPage = Math.min(currentPage + 1, totalPages);
  const prevPage = Math.max(currentPage - 1, 1);

  return { count, nextPage, currentPage, prevPage, totalPages };
};
