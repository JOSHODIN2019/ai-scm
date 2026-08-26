import { Badge } from "@/components/ui/badge"

export function ChangeTypeBadge({ type }: { type: string }) {
  return <Badge variant="secondary">{type}</Badge>
}
