import { Migration } from "@mikro-orm/migrations";

export class Migration20260921090000 extends Migration {
  async up(): Promise<void> {
    // The seeded singleton pinned allow_guest_wishlist to false, which silently
    // overrode the allowGuestWishlist plugin option on upgrade. Drop the row
    // where an admin has never saved settings; getSettings() falls back to the
    // option when it is absent, and updateSettings() recreates it on save.
    this.addSql(
      `delete from "wishlist_settings"
       where "id" = 'wls_singleton' and "updated_at" = "created_at";`
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `insert into "wishlist_settings" ("id", "allow_guest_wishlist", "allow_multiple_wishlists")
       values ('wls_singleton', false, false)
       on conflict ("id") do nothing;`
    );
  }
}
