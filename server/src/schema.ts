
import { z } from 'zod';

// Snack schema
export const snackSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  price: z.number(), // Price in Rupiah
  is_available: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Snack = z.infer<typeof snackSchema>;

// Customer schema
export const customerSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone_number: z.string(),
  created_at: z.coerce.date()
});

export type Customer = z.infer<typeof customerSchema>;

// Order schema
export const orderSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  invoice_number: z.string(),
  total_amount: z.number(), // Total in Rupiah
  total_quantity: z.number(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  whatsapp_sent: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Order = z.infer<typeof orderSchema>;

// Order item schema
export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  snack_id: z.number(),
  quantity: z.number().int().positive(),
  unit_price: z.number(), // Price per unit at time of order
  subtotal: z.number(), // quantity * unit_price
  created_at: z.coerce.date()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

// Cart item schema (for frontend use)
export const cartItemSchema = z.object({
  snack_id: z.number(),
  quantity: z.number().int().positive()
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Input schemas
export const createCustomerInputSchema = z.object({
  name: z.string().min(1),
  phone_number: z.string().min(1)
});

export type CreateCustomerInput = z.infer<typeof createCustomerInputSchema>;

export const createOrderInputSchema = z.object({
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  cart_items: z.array(cartItemSchema).min(1)
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const updateOrderStatusInputSchema = z.object({
  order_id: z.number(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'])
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusInputSchema>;

// Response schemas
export const orderWithDetailsSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  customer_name: z.string(),
  customer_phone: z.string(),
  invoice_number: z.string(),
  total_amount: z.number(),
  total_quantity: z.number(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  whatsapp_sent: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  items: z.array(z.object({
    id: z.number(),
    snack_id: z.number(),
    snack_name: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    subtotal: z.number()
  }))
});

export type OrderWithDetails = z.infer<typeof orderWithDetailsSchema>;

export const invoiceDataSchema = z.object({
  invoice_number: z.string(),
  customer_name: z.string(),
  customer_phone: z.string(),
  order_date: z.coerce.date(),
  items: z.array(z.object({
    snack_name: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    subtotal: z.number()
  })),
  total_quantity: z.number(),
  total_amount: z.number()
});

export type InvoiceData = z.infer<typeof invoiceDataSchema>;
