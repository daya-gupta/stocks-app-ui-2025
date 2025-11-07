'use client';

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { FaUserCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Settings, Mail } from "lucide-react";
import Link from "next/link";

export const UserProfile = () => {
    const { user, signOut, loading } = useAuth();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const getFirstName = (email: string) => {
        return email.split('@')[0].split('.')[0];
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsPopoverOpen(false);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8"></div>
                <div className="animate-pulse bg-gray-200 rounded w-16 h-4"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center space-x-2">
                <FaUserCircle className="text-gray-400" style={{ fontSize: '32px' }} />
                <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                        Sign In
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100">
                        <FaUserCircle style={{ fontSize: '32px' }} className="text-blue-600" />
                        <span className="hidden md:block">
                            Hello, {getFirstName(user.email || '')}
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>User Profile</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <FaUserCircle style={{ fontSize: '48px' }} className="text-blue-600" />
                                <div>
                                    <p className="font-medium">{getFirstName(user.email || '')}</p>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <Mail className="w-3 h-3" />
                                        <span>{user.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => setIsPopoverOpen(false)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Account Settings
                                </Button>
                                
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleSignOut}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>

                            <div className="border-t pt-4 text-xs text-gray-500">
                                <p>Member since {new Date(user.created_at || '').toLocaleDateString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    );
};
