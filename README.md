# 🧞‍♂️ Wishlist Plugin for Medusa

The **Alphabite Wishlist Plugin** is the most feature-complete wishlist system for [MedusaJS](https://medusajs.com). It supports both authenticated and guest users, multiple wishlists per user, and a full-featured SDK client for frontend integration.

This plugin ships with:
- 🔌 A fully typed JS SDK plugin
- 📭 A Postman collection
- ✅ Support for guest & authenticated customers

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🔧 Plugin Options](#-plugin-options)
- [📦 API Endpoints](#-api-endpoints)
- [🧑‍💻 SDK Usage](#-sdk-usage)
- [🧪 Guest Wishlist Flow](#-guest-wishlist-flow)
- [🧩 Requirements](#-requirements)
- [📭 Postman Collection](#-postman-collection)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

- ✅ Multiple wishlists per customer  
- ✅ Add/remove items to/from any wishlist  
- ✅ Guest wishlist supported + transfer when registered 
- ✅ Fully typed Medusa JS SDK integration with our SDK client 
- ✅ Pagination and filtering built-in  

---

## 📦 Installation

Install the plugin via npm:

```bash
npm install @alphabite/medusa-wishlist
```

In your `medusa-config.js`, register the plugin:

```js
const plugins = [
  {
    resolve: '@alphabite/medusa-wishlist',
    options: {
      // all are optional, read bellow about default values
      wishlistFields: [],
      wishlistItemsFields: [],
      includeWishlistItems: true,
      includeWishlistItemsTake: 5,
      allowGuestWishlist: true,
    },
  },
]
```

---

## 🔧 Plugin Options

| Option                    | Type       | Default | Description                                                              |
|---------------------------|------------|---------|--------------------------------------------------------------------------|
| `wishlistFields`                 | `string[]` | `["items.*", "items.product_variant.*", "items.product_variant.prices.*", "items.product_variant.product.thumbnail", "items.product_variant.product.id"]`    | Selectively include Medusa product or product variant fields on wishlist list/retrieve endpoints that have wishlist items included             |
| `wishlistItemsFields`                 | `string[]` | `["id", "product_id", "wishlist_id", "created_at", "wishlist.customer_id", "updated_at", "deleted_at", "product_variant.*", "product_variant.prices.*", "product_variant.calculated_price", "product_variant.product.thumbnail",]`    | Selectively include Medusa product or product variant fields on wishlist items list/retrieve endpoints             |
| `includeWishlistItems`  | `boolean`  | `false` | Automatically populate wishlist items in `GET /store/wishlists`          |
| `includeWishlistItemsTake` | `number` | `5`     | Limit number of items if `includeWishlistItems` is true                  |
| `allowGuestWishlist`     | `boolean`  | `false` | Enables wishlist creation & usage without authentication (cookie-based)  |

---

## 📦 API Endpoints

All endpoints are available under `/store/wishlists`.

| Method | Endpoint                                   | Auth           | Description                             |
|--------|--------------------------------------------|----------------|-----------------------------------------|
| GET    | `/store/wishlists`                         | ✅              | List wishlists for the current customer |
| POST   | `/store/wishlists`                         | ➖ (optional)   | Create a new wishlist                   |
| GET    | `/store/wishlists/:id`                     | ➖ (optional)   | Retrieve a wishlist by ID               |
| PUT    | `/store/wishlists/:id`                     | ✅              | Update wishlist metadata                |
| DELETE | `/store/wishlists/:id`                     | ✅              | Delete a wishlist                       |
| POST   | `/store/wishlists/:id/transfer`            | ✅              | Transfer guest wishlist to logged-in user |
| GET    | `/store/wishlists/:id/items`               | ➖ (optional)   | Get items in a wishlist                 |
| POST   | `/store/wishlists/:id/add-item`            | ➖ (optional)   | Add an item to the wishlist             |
| DELETE | `/store/wishlists/:id/items/:item_id`      | ➖ (optional)   | Remove an item from the wishlist        |

---

## 🧑‍💻 SDK Usage

❗❗❗[Read more about our Medusa compatible SDK here](https://github.com/alphabite-dev/medusa-client/tree/main)

```ts
import { AlphabiteMedusaClient, wishlistPlugin } from '@alphabite/sdk'

const sdk = new AlphabiteMedusaClient({
  {
    baseUrl,
    debug: process.env.NODE_ENV === "development",
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  },
  [wishlistPlugin],
  {
    getAuthHeader: () => { return { authorization: `Bearer ${customerJwt}` } },
  }
})

// Create wishlist
await sdk.alphabite.wishlist.create({ name: 'My Sneakers' })

// Add item
await sdk.alphabite.wishlist.addItem({
  id: 'wishlist_id',
  product_variant_id: 'variant_id',
})

// List items
const { data } = await sdk.alphabite.wishlist.listItems({ id: 'wishlist_id' })
```


---

## 🧪 Guest Wishlist Flow

Guest wishlists work like guest carts:

1. Create a wishlist (no auth required)
2. Save the `id` in a cookie
3. Use that ID for listing/adding/removing items
4. When the user signs up or logs in, call the `transfer` endpoint to associate it:

```ts
await medusa.alphabite.wishlist.transfer({ id: wishlistId })
```

After that, the cookie is no longer needed.

---

## 🧩 Requirements

- Medusa v2.5.0+
- Works with both `@medusajs/types` and `@medusajs/framework`

---

## 📭 Postman Collection

You’ll find the ready-to-import Postman collection at:

```
docs/postman/WishlistPlugin.postman_collection.json
```

Use it to explore and test all endpoints interactively.

---

## 🤝 Contributing

We welcome issues, feedback, and PRs. Fork it, build it, improve it.

Let’s make commerce more personalized 🛍️
