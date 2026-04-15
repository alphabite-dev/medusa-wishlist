import { Migration } from "@mikro-orm/migrations";

export class Migration20260415155648 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" add column if not exists "product_id" text;`,
    );

    this.addSql(`
      UPDATE "wishlist_item" wi 
      SET "product_id" = pv.product_id 
      FROM "product_variant" pv 
      WHERE wi.product_variant_id = pv.id 
      AND wi.product_id IS NULL;
    `);

    this.addSql(
      `update "wishlist_item" set "product_id" = 'orphaned_product' where "product_id" is null;`,
    );

    this.addSql(
      `alter table if exists "wishlist_item" alter column "product_id" set not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" drop column if exists "product_id";`,
    );
  }
}
