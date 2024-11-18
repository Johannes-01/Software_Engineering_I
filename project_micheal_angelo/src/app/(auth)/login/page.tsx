"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Link from "next/link";
import { redirect } from 'next/navigation';
import React, { useState, useTransition } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [, startTransition] = useTransition();

    const login = async (email: string, password: string): Promise<void> => {
        const request = {
            email,
            password,
        };

        const result = await fetch('/api/login', {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (result.status === 500) {
            // todo handle error
        }

        if (result.status === 200) {
            redirect('/gallery');
        }

        return;
    }

    return (
        <div className="flex justify-center items-center size-full lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="py-12">
                <form>
                    <div className="mx-auto grid w-[350px] gap-6">
                        <div className="grid gap-2 text-center">
                            <h1 className="text-3xl font-bold">Login</h1>
                            <p className="text-balance text-muted-foreground">
                                Enter your email below to login to your account
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                type="button"
                                className="w-full"
                                onClick={() => startTransition(() => login(email, password))}
                            >
                                Login
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="underline"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
