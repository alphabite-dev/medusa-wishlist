import { Migration } from "@mikro-orm/migrations";

export class Migration20260527120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "wishlist_settings" (
        "id" text not null,
        "allow_guest_wishlist" boolean not null default false,
        "allow_multiple_wishlists" boolean not null default false,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "wishlist_settings_pkey" primary key ("id")
      );`
    );

    this.addSql(
      `insert into "wishlist_settings" ("id", "allow_guest_wishlist", "allow_multiple_wishlists")
       values ('wls_singleton', false, false)
       on conflict ("id") do nothing;`
    );
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "wishlist_settings" cascade;`);
  }
}
