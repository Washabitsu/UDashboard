import * as React from "react"

import { cn } from "@/lib/utils"

// One look for every text control. Also used for <select> and <textarea> through `controlClassName`.
const controlClassName =
  "h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlClassName,
        "file:mr-3 file:h-full file:border-0 file:border-r file:border-input file:bg-muted file:px-3 file:text-sm file:font-medium file:text-foreground",
        type === "file" && "px-0",
        className
      )}
      {...props}
    />
  )
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn(controlClassName, "pr-8", className)} {...props} />
}

export { Input, Select }
