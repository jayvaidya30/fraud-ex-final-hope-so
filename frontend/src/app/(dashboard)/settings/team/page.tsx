"use client";

import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusIcon, MailIcon, TrashIcon } from "lucide-react";

const teamMembers = [
    {
        id: "1",
        name: "John Analyst",
        email: "john@fraudex.io",
        role: "admin",
        avatar: null,
        initials: "JA",
    },
    {
        id: "2",
        name: "Sarah Investigator",
        email: "sarah@fraudex.io",
        role: "analyst",
        avatar: null,
        initials: "SI",
    },
    {
        id: "3",
        name: "Mike Reviewer",
        email: "mike@fraudex.io",
        role: "analyst",
        avatar: null,
        initials: "MR",
    },
    {
        id: "4",
        name: "Lisa Auditor",
        email: "lisa@fraudex.io",
        role: "citizen",
        avatar: null,
        initials: "LA",
    },
];

const roleBadgeColors = {
    admin: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    analyst: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    citizen: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export default function TeamPage() {
    return (
        <>
            <Header
                title="Team Management"
                description="Manage team members and permissions"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Invite Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invite Team Member</CardTitle>
                        <CardDescription>
                            Send an invitation to join your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    className="max-w-md"
                                />
                            </div>
                            <Select defaultValue="analyst">
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="analyst">Analyst</SelectItem>
                                    <SelectItem value="citizen">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button>
                                <MailIcon className="mr-2 h-4 w-4" />
                                Send Invite
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            {teamMembers.length} members in your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={member.avatar || undefined} />
                                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                {member.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant="outline"
                                            className={roleBadgeColors[member.role as keyof typeof roleBadgeColors]}
                                        >
                                            {member.role}
                                        </Badge>
                                        <Select defaultValue={member.role}>
                                            <SelectTrigger className="w-28">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="analyst">Analyst</SelectItem>
                                                <SelectItem value="citizen">Viewer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Role Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>
                            What each role can access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-purple-500">Admin</h4>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• Full access to all features</li>
                                    <li>• Manage team members</li>
                                    <li>• Configure alert rules</li>
                                    <li>• Export and delete data</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-blue-500">Analyst</h4>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• Upload and analyze cases</li>
                                    <li>• View all analytics</li>
                                    <li>• Acknowledge alerts</li>
                                    <li>• Export reports</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h4 className="font-semibold text-slate-500">Viewer</h4>
                                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    <li>• View dashboard</li>
                                    <li>• View case results</li>
                                    <li>• Read-only access</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
