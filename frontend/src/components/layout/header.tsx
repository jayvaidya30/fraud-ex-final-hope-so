"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BellIcon, SearchIcon } from "lucide-react";

interface HeaderProps {
    title?: string;
    description?: string;
}

export function Header({ title, description }: HeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                {title && (
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold leading-none">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-2">
                {/* Search Button */}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SearchIcon className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <BellIcon className="h-4 w-4" />
                    <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px] flex items-center justify-center"
                    >
                        3
                    </Badge>
                    <span className="sr-only">Notifications</span>
                </Button>
            </div>
        </header>
    );
}
