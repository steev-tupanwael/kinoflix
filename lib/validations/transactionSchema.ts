import { z } from 'zod';

const TimestampSchema = z.any();

export const TransactionSchema = z.object({
  transactionId: z.string(), // Dari Midtrans
  orderId: z.string(),       // Generated oleh sistem Anda
  userId: z.string(),        // Referensi ke User.uid
  amount: z.number().positive(),
  status: z.enum(["pending", "settlement", "expire", "deny", "cancel"]),
  createdAt: TimestampSchema,
});

export type Transaction = z.infer<typeof TransactionSchema>;
