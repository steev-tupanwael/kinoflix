import { z } from 'zod';

export const MovieSchema = z.object({
  movieId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  genre: z.array(z.string()),
  thumbnailUrl: z.string().url(),
  videoUrl: z.string().url(),
  category: z.enum(["Movie", "Series"]),
  isLocked: z.boolean().default(true), // Default terkunci untuk keamanan
});

export type Movie = z.infer<typeof MovieSchema>;
