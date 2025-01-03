import type { Metadata } from "next";
import "./global.css";

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
            {children}
        </body>
        </html>
    );
}
