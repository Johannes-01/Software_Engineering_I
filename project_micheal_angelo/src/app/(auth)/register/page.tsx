"use client";

import { Button } from "@components/button";
import { Input } from "@components/input";
import { Label } from "@components/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from "react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [, startTransition] = useTransition();
    const router = useRouter();

    const signup = async (email: string, password: string): Promise<void> => {

        const result = await fetch('/api/register', {
            method: "POST",
            body: JSON.stringify(
                {
                    email,
                    password,
                },
            ),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (result.status === 500) {
            // todo handle error
        }

        if (result.ok) {
            router.replace('/gallery');
        }

        return;
    }
    return (
        <div className="flex justify-center items-center size-full lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Register</h1>
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
                            onClick={() => startTransition(() => signup(email, password))}
                        >
                            SignUp
                        </Button>
                    </div>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="underline"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
