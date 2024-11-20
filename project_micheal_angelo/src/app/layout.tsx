import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "../components/app-sidebar";
import { SidebarProvider } from "../components/ui/sidebar";

export const metadata: Metadata = {
    title: "Project Micheal Angelo",
    description: "Online Atelier",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
            <SidebarProvider>
            <AppSidebar/>
            <main className="w-full">
            {children}
            </main>
            </SidebarProvider>
        </body>
        </html>
    );
}
