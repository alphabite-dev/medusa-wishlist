import { PaginatedOutput } from "../api/store/wishlists/types";

export const defaultResponse: PaginatedOutput<any> = {
  data: [],
  count: 0,
  skip: 0,
  take: 0,
  totalPages: 1,
  currentPage: 1,
  nextPage: 1,
  prevPage: 1,
};
