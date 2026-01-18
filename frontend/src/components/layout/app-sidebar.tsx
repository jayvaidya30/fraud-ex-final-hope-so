"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboardIcon,
    FolderOpenIcon,
    TrendingUpIcon,
    NetworkIcon,
    BellIcon,
    SettingsIcon,
    UploadIcon,
    BarChart3Icon,
    UsersIcon,
    ShieldAlertIcon,
    Building2Icon,
    LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNavItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboardIcon,
    },
    {
        title: "Cases",
        url: "/cases",
        icon: FolderOpenIcon,
    },
    {
        title: "Upload",
        url: "/cases/new",
        icon: UploadIcon,
    },
];

const analyticsNavItems = [
    {
        title: "Overview",
        url: "/analytics",
        icon: BarChart3Icon,
    },
    {
        title: "Risk Trends",
        url: "/analytics/risk-trends",
        icon: TrendingUpIcon,
    },
    {
        title: "Signals",
        url: "/analytics/signals",
        icon: ShieldAlertIcon,
    },
    {
        title: "Vendors",
        url: "/analytics/vendors",
        icon: Building2Icon,
    },
];

const investigationNavItems = [
    {
        title: "Entity Graph",
        url: "/entities",
        icon: NetworkIcon,
    },
    {
        title: "Alerts",
        url: "/alerts",
        icon: BellIcon,
    },
];

const settingsNavItems = [
    {
        title: "Settings",
        url: "/settings",
        icon: SettingsIcon,
    },
    {
        title: "Team",
        url: "/settings/team",
        icon: UsersIcon,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const userEmail = user?.email || "User";
    const userInitials = userEmail.substring(0, 2).toUpperCase();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg">
                                    F
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">FraudEx</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Intelligence Platform
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Main</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Analytics Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Analytics</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {analyticsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Investigation Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel>Investigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {investigationNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Settings Navigation */}
                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src="/avatars/analyst.jpg" alt="Analyst" />
                                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{userEmail.split('@')[0]}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {userEmail}
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="/avatars/analyst.jpg" alt="Analyst" />
                                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{userEmail.split('@')[0]}</span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {userEmail}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <SettingsIcon className="mr-2 h-4 w-4" />
                                    Account Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                                    <LogOutIcon className="mr-2 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
