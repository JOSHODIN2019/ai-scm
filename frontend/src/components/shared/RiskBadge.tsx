import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const RISK_STYLES: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  High: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function RiskBadge({ level }: { level: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", RISK_STYLES[level])}>
      {level} risk
    </Badge>
  )
}
