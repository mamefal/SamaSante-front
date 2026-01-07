import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl"
    colored?: boolean
}

export function Logo({ size = "md", colored = true, className, ...props }: LogoProps) {
    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20",
        xl: "w-28 h-28"
    }

    const imageSizes = {
        sm: 48,
        md: 64,
        lg: 80,
        xl: 112
    }

    return (
        <div
            className={cn(
                "relative flex items-center justify-center transform transition-transform group-hover:scale-110",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            <Image
                src="/assets/logos/amina-logo.png"
                alt="AMINA by Ayra"
                width={imageSizes[size]}
                height={imageSizes[size]}
                className="object-contain"
                priority
            />
        </div>
    )
}
