import { PaginatedOutput } from "../api/store/wishlists/types";

export const defaultResponse: PaginatedOutput<any> = {
  data: [],
  count: 0,
  skip: 0,
  take: 0,
  totalPages: 0,
};
