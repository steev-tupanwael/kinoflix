import { z } from 'zod';

const TimestampSchema = z.any();

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  isPremium: z.boolean().default(false),
  subscriptionType: z.enum(["None", "Basic", "Premium"]).default("None"),
  expiryDate: TimestampSchema.nullable(), // Bisa null jika belum pernah langganan
  myList: z.array(z.string()), // Berisi array movieId
});

export type User = z.infer<typeof UserSchema>;
