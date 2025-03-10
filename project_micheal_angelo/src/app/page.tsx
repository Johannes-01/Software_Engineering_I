import React from "react";

import Link from "next/link";
import { Inter } from 'next/font/google';
import { Button } from "../components/ui/button";

const inter = Inter({ subsets: ['latin'] });

export default function HomePage() {
    return (
        <main className={`${inter.className} grid items-center min-h-screen bg-gradient-to-br from-gray-100 to-white`}>
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-5xl font-bold mb-4">Michelangelo</h1>
                <p className="text-lg mb-8">Experience the Renaissance</p>
                <Link href={"/gallery"}>
                    <Button>Dive into the Artwork</Button>
                </Link>
            </div>
        </main>
    );
}
