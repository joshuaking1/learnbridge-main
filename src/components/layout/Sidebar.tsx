// frontend/src/components/layout/Sidebar.tsx
"use client"; // Needed for hooks like usePathname

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // For combining class names
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore"; // To get user role
import { useState, useEffect } from "react"; // For managing sidebar state
import { ChevronLeft, ChevronRight } from "lucide-react"; // For collapse/expand icons

// Import icons from lucide-react
import {
    BookOpen
} from "lucide-react";

// Import icons from lucide-react
import {
    LayoutDashboard, // Dashboard icon
    BookOpenCheck, // My Plans/Assessments
    FileText,      // Lesson Planner
    ClipboardCheck, // Assessment Creator
    ListChecks,    // ToS Builder
    Scaling,       // Rubric Generator
    LogOut,        // Logout
    Bot,           // AI Assistant (Chat)
    Menu,          // Menu icon for mobile toggle
    X,             // Close icon for mobile toggle
    User,          // Profile icon
    Calendar,      // Calendar icon for Daily Quizzes
    GraduationCap, // Learning Hub icon
    Users,         // User Management icon
    BarChart3,     // Usage Limits icon
    CheckSquare
} from "lucide-react";

import {
    MessageSquare   // Discussion icon
} from "lucide-react";

// Other icons that might be used later
// import { UploadCloud } from "lucide-react";

// Define navigation items structure
interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType; // Component type for the icon
    roles?: ('teacher' | 'student' | 'admin')[]; // Optional roles that can see this link
}

interface SidebarProps {
    collapseEventName?: string; // Optional event name for collapse state changes
}

export function Sidebar({ collapseEventName }: SidebarProps) {
    const pathname = usePathname(); // Get current URL path
    const { user, clearAuth } = useAuthStore(); // Get user role and logout action
    const router = useRouter(); // For programmatic navigation on logout
    const [isOpen, setIsOpen] = useState(false); // State for mobile sidebar
    const [isCollapsed, setIsCollapsed] = useState(false); // State for desktop sidebar collapse

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Dispatch custom event when collapse state changes
    useEffect(() => {
        if (collapseEventName) {
            const event = new CustomEvent(collapseEventName, { detail: { isCollapsed } });
            window.dispatchEvent(event);
        }
    }, [isCollapsed, collapseEventName]);

    // Define navigation links based on roles
    const navItems: NavItem[] = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['teacher', 'student', 'admin'] }, // All roles see dashboard
        
        // --- Teacher Tools ---
        { href: "/dashboard/lesson-planner", label: "Lesson Planner", icon: FileText, roles: ['teacher', 'admin'] },
        { href: "/dashboard/assessment-creator", label: "Assessment Creator", icon: ClipboardCheck, roles: ['teacher', 'admin'] },
        { href: "/dashboard/tos-builder", label: "ToS Builder", icon: ListChecks, roles: ['teacher', 'admin'] },
        { href: "/dashboard/rubric-generator", label: "Rubric Generator", icon: Scaling, roles: ['teacher', 'admin'] },
        { href: "/dashboard/my-lessons", label: "My Lesson Plans", icon: BookOpenCheck, roles: ['teacher', 'admin'] },
        { href: "/dashboard/my-assessments", label: "My Assessments", icon: BookOpenCheck, roles: ['teacher', 'admin'] },
        
        // --- Student Tools ---
        { href: "/dashboard/student-maintenance", label: "Student Portal", icon: GraduationCap, roles: ['student'] },
        { href: "/dashboard/student-hub/daily-quizzes", label: "Daily Quizzes", icon: Calendar, roles: ['student'] },
        { href: "/dashboard/student-hub/quizzes", label: "Quizzes", icon: CheckSquare, roles: ['student'] },
        { href: "/dashboard/student-hub/my-progress", label: "My Progress", icon: BarChart3, roles: ['student'] },
        { href: "/dashboard/student-hub/discussion", label: "Discussion", icon: MessageSquare, roles: ['student'] },
        
        // --- Admin Tools ---
        { href: "/dashboard/admin/users", label: "User Management", icon: Users, roles: ['admin'] },
        { href: "/dashboard/admin/daily-quizzes", label: "Manage Daily Quizzes", icon: Calendar, roles: ['admin'] },
        // --- Community (Placeholder) ---
        // { href: "/dashboard/plc", label: "PLC", icon: Users, roles: ['teacher', 'admin'] },
        // --- AI Assistant ---
        { href: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot, roles: ['teacher', 'student', 'admin'] },
        // --- Usage Limits ---
        { href: "/dashboard/usage-limits", label: "Usage Limits", icon: BarChart3, roles: ['teacher', 'student', 'admin'] },
        // --- Profile ---
        { href: "/dashboard/profile", label: "Profile", icon: User, roles: ['teacher', 'student', 'admin'] },
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item =>
        !item.roles || (user?.role && item.roles.includes(user.role as 'teacher' | 'student' | 'admin'))
    );

    // Handle logout
    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-brand-darkblue text-white hover:bg-white/10"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen bg-brand-darkblue border-r border-white/10 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64", // Width changes based on collapse state
                    "transform",
                    "md:translate-x-0", // Always visible on desktop
                    isOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
                )}
                // Remove automatic hover behavior to make it more stable
            >
                <div className="flex h-full flex-col">
                    {/* Logo/Brand */}
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            {isCollapsed ? (
                                <span className="text-xl font-arvo font-bold text-white">L</span>
                            ) : (
                                <span className="text-xl font-arvo font-bold text-white">
                                    LearnBridge<span className="text-brand-orange">Edu</span>
                                </span>
                            )}
                        </Link>

                        {/* Collapse/Expand Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-brand-orange/20 hover:text-brand-orange"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-2">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                buttonVariants({ variant: "ghost" }),
                                                "w-full justify-start text-white hover:bg-brand-orange/20 hover:text-brand-orange transition-colors",
                                                isActive && "bg-brand-orange/10 text-brand-orange",
                                                isCollapsed && "px-2 justify-center"
                                            )}
                                            title={isCollapsed ? item.label : undefined} // Show tooltip on hover when collapsed
                                        >
                                            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                                            {!isCollapsed && (
                                                <span>{item.label}</span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* User Info & Logout */}
                    <div className="border-t border-white/10 p-4">
                        <div className={cn("mb-4 flex", isCollapsed ? "justify-center" : "items-center")}>
                            <Avatar className={cn("border-2 border-white/20", isCollapsed ? "h-8 w-8" : "h-10 w-10 mr-3")}>
                                <AvatarImage src={user?.profile_image_url} alt={user?.first_name || 'User'} />
                                <AvatarFallback className="bg-brand-orange text-white">
                                    {(user?.firstName || user?.first_name || 'U').charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            {!isCollapsed && (
                                <div>
                                    <p className="text-sm font-arvo font-medium text-white">
                                        {user?.firstName || user?.first_name || 'User'} {user?.surname || ''}
                                    </p>
                                    <p className="text-xs text-white/70 capitalize">{user?.role}</p>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full text-white hover:bg-brand-orange/20 hover:text-brand-orange transition-colors",
                                isCollapsed ? "justify-center px-2" : "justify-start"
                            )}
                            onClick={handleLogout}
                            title={isCollapsed ? "Logout" : undefined}
                        >
                            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
                            {!isCollapsed && (
                                <span>Logout</span>
                            )}
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}