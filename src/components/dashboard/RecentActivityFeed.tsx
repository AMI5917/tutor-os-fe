"use client";

import React, { useState } from "react";
import { RecentActivity } from "@/types/roles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Activity,
  CreditCard,
  UserCheck,
  Award,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export function RecentActivityFeed({ activities }: { activities: RecentActivity[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = activities.filter((act) => {
    if (filter === "ALL") return true;
    return act.type === filter;
  });

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Live Audit Stream
          </CardTitle>
          <CardDescription>
            Recent financial transactions, attendance marks, and batch changes.
          </CardDescription>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1 text-xs">
          {["ALL", "PAYMENT", "ATTENDANCE", "EXAM"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-md px-2 py-1 font-medium transition-all ${
                filter === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ALL" ? "All Activity" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {filtered.map((item) => {
          let Icon = Activity;
          let iconColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50";

          if (item.type === "PAYMENT") {
            Icon = CreditCard;
            iconColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50";
          } else if (item.type === "ATTENDANCE") {
            Icon = UserCheck;
            iconColor = "text-blue-600 bg-blue-50 dark:bg-blue-950/50";
          } else if (item.type === "EXAM") {
            Icon = Award;
            iconColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/50";
          }

          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-border/70 p-3 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </p>
                    {item.amount && (
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(item.amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 pl-3">
                {item.statusBadge && (
                  <Badge
                    variant={item.statusVariant || "default"}
                    className="text-[10px] font-bold"
                  >
                    {item.statusBadge}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {item.timeAgo}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
