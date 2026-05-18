import { Migration } from "@mikro-orm/migrations";

export class Migration20260415155648 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "wishlist_item" add column if not exists "product_id" text;`,
    );

    // Backfill product_id from the variant's product. Guarded against fresh
    // databases where the product module's migrations haven't created
    // product_variant yet — Medusa runs each module's migrations independently
    // with no cross-module ordering guarantee. On a fresh install wishlist_item
    // is empty so the UPDATE would touch zero rows even if the table existed,
    // but Postgres parses the FROM clause before execution and errors on
    // missing relations. The IF EXISTS guard skips cleanly in that case.
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'product_variant'
        ) THEN
          UPDATE "wishlist_item" wi
          SET "product_id" = pv.product_id
          FROM "product_variant" pv
          WHERE wi.product_variant_id = pv.id
            AND wi.product_id IS NULL;
        END IF;
      END $$;
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
