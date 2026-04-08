import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Card, CardContent } from "@/components/ui/card"

export function MovieCard({ title, thumbnail }: { title: string, thumbnail: string }) {
  return (
    <div className="w-[200px] shrink-0">
      <Card className="overflow-hidden border-none bg-transparent">
        <AspectRatio ratio={2 / 3}>
          <img
            src={thumbnail}
            alt={title}
            className="object-cover transition-hover hover:scale-105 duration-300"
          />
        </AspectRatio>
      </Card>
      <h3 className="mt-2 text-sm font-medium text-white line-clamp-1">{title}</h3>
    </div>
  )
}
