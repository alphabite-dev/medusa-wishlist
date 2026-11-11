import { Migration } from "@mikro-orm/migrations";

// The model cascades item deletes (`cascades({ delete: ["items"] })`), but the
// original FK was created without ON DELETE CASCADE, so hard-deleting a
// wishlist that still has items failed with a FK violation.
export class Migration20261018090000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" drop constraint if exists "wishlist_item_wishlist_id_foreign";`
    );
    this.addSql(
      `alter table if exists "wishlist_item" add constraint "wishlist_item_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade on delete cascade;`
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" drop constraint if exists "wishlist_item_wishlist_id_foreign";`
    );
    this.addSql(
      `alter table if exists "wishlist_item" add constraint "wishlist_item_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade;`
    );
  }
}
