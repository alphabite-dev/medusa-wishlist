// medusa-source/wishlist/src/modules/wishlist/types/settings.ts
export type WishlistSettingsView = {
  allow_guest_wishlist: boolean;
  allow_multiple_wishlists: boolean;
};

export type WishlistSettingsPatch = Partial<WishlistSettingsView>;
