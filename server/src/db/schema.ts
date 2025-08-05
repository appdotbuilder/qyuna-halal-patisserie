
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'completed', 'cancelled']);

// Tables
export const snacksTable = pgTable('snacks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  is_available: boolean('is_available').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const customersTable = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone_number: text('phone_number').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  customer_id: integer('customer_id').notNull().references(() => customersTable.id),
  invoice_number: text('invoice_number').notNull().unique(),
  total_amount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  total_quantity: integer('total_quantity').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  whatsapp_sent: boolean('whatsapp_sent').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull().references(() => ordersTable.id, { onDelete: 'cascade' }),
  snack_id: integer('snack_id').notNull().references(() => snacksTable.id),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const customersRelations = relations(customersTable, ({ many }) => ({
  orders: many(ordersTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [ordersTable.customer_id],
    references: [customersTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  snack: one(snacksTable, {
    fields: [orderItemsTable.snack_id],
    references: [snacksTable.id],
  }),
}));

export const snacksRelations = relations(snacksTable, ({ many }) => ({
  orderItems: many(orderItemsTable),
}));

// TypeScript types for the table schemas
export type Snack = typeof snacksTable.$inferSelect;
export type NewSnack = typeof snacksTable.$inferInsert;
export type Customer = typeof customersTable.$inferSelect;
export type NewCustomer = typeof customersTable.$inferInsert;
export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  snacks: snacksTable,
  customers: customersTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
};
