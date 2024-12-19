"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Link from "next/link";
import { redirect } from 'next/navigation';
import React, { useState, useTransition } from "react";

interface ErrorState {
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [, startTransition] = useTransition();
    const [errors, setErrors] = useState<ErrorState>({});

    const login = async (email: string, password: string): Promise<void> => {
        setErrors({});

        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Email ist erforderlich" }));
            return;
        }
        if (!password) {
            setErrors((prev) => ({ ...prev, password: "Password ist erforderlich" }));
            return;
        }

        try {
            const result = await fetch('/api/login', {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await result.json();

            if (!result.ok) {
                setErrors({ general: "E-Mail oder Passwort falsch" });
                return;
            }


            localStorage.setItem("authToken", data.token);
            redirect('/gallery');


    } catch (error) {
            setErrors({ general: "Ein unerwarteter Fehler ist aufgetreten" });
            console.log("Login failed:", error);
        }
    }


    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-sm p-6 bg-white shadow-md rounded-md">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    login(email, password);
                }}>
                    <div className="">
                        <div className="w-full max-w-sm ">
                            <h1 className="text-3xl font-bold">Login</h1>
                            <p className="text-m text-muted-foreground mb-3 ">
                                Enter your email below to login to your account
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="mb-1.3">
                                <Label htmlFor="email" className="text-base">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="mb-1">
                                <Label htmlFor="password" className="text-base">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>
                            {errors.general && (
                                <p className="text-red-500 text-center text-sm">{errors.general}</p>
                            )}
                            <Button
                                type="button"
                                className="w-full mb-5"
                                onClick={() => startTransition(() => login(email, password))}
                            >
                                Login
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm text-muted-foreground mb-1.5">
                            Don&apos;t have an account?{" "}
                        </div>
                        <Link href="/register">
                        <Button
                            type="button"
                            className="w-full bg-white text-black border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100"
                            // onClick={() => startTransition(() => login(email, password))}
                        >
                            Register
                        </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
