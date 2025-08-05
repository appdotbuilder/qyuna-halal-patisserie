
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createOrderInputSchema, 
  updateOrderStatusInputSchema 
} from './schema';

// Import handlers
import { getSnacks } from './handlers/get_snacks';
import { getSnackById } from './handlers/get_snack_by_id';
import { createOrder } from './handlers/create_order';
import { getOrderById } from './handlers/get_order_by_id';
import { getOrders } from './handlers/get_orders';
import { updateOrderStatus } from './handlers/update_order_status';
import { sendWhatsAppNotification } from './handlers/send_whatsapp_notification';
import { markWhatsAppSent } from './handlers/mark_whatsapp_sent';
import { generateExcelInvoice } from './handlers/generate_excel_invoice';
import { getInvoiceData } from './handlers/get_invoice_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Snack routes
  getSnacks: publicProcedure
    .query(() => getSnacks()),

  getSnackById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getSnackById(input.id)),

  // Order routes
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ input }) => {
      const order = await createOrder(input);
      // Attempt to send WhatsApp notification
      const whatsappSent = await sendWhatsAppNotification(order);
      if (whatsappSent) {
        await markWhatsAppSent(order.id);
      }
      return order;
    }),

  getOrderById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getOrderById(input.id)),

  getOrders: publicProcedure
    .query(() => getOrders()),

  updateOrderStatus: publicProcedure
    .input(updateOrderStatusInputSchema)
    .mutation(({ input }) => updateOrderStatus(input)),

  // Invoice routes
  getInvoiceData: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(({ input }) => getInvoiceData(input.orderId)),

  generateInvoice: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const invoiceData = await getInvoiceData(input.orderId);
      if (!invoiceData) {
        throw new Error('Order not found');
      }
      const excelBuffer = await generateExcelInvoice(invoiceData);
      // Convert buffer to base64 for JSON transmission
      return {
        filename: `invoice-${invoiceData.invoice_number}.xlsx`,
        data: excelBuffer.toString('base64')
      };
    }),

  // WhatsApp notification routes
  sendWhatsAppNotification: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      const sent = await sendWhatsAppNotification(order);
      if (sent) {
        await markWhatsAppSent(order.id);
      }
      return { sent };
    }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
