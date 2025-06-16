import { Migration } from '@mikro-orm/migrations';

export class Migration20250613153609 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "wishlist" add column if not exists "name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "wishlist" drop column if exists "name";`);
  }

}
