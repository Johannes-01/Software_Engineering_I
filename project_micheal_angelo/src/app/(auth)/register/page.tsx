"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from "react";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [, startTransition] = useTransition();
    const router = useRouter();

    const validateFields = (): boolean => {
        const newErrors = {
            email: "",
            password: "",
            confirmPassword: "",
        };

        if (!email) newErrors.email = "E-Mail ist erforderlich.";
        if (!password) newErrors.password = "Passwort ist erforderlich.";
        if (!confirmPassword) newErrors.confirmPassword = "Bitte bestätigen Sie ihr Passwort.";
        if(password !== confirmPassword) newErrors.confirmPassword = "Passwörter stimmen nicht überein.";

        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error === "");
    }



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

        const errorText = await result.text();

        if (!result.ok) {

            //  Fehlermeldungen je nach Backend-Fehler
            if (errorText.includes("E-Mail ist erforderlich")) {
                setErrors((prev) => ({...prev, email: "Dieses Feld ist Pflicht"}));
            } else if(errorText.includes("E-Mail ist bereits registriert")) {
                setErrors((prev) => ({...prev, email: "E-Mail ist bereits registriert"}));
            } else if(errorText.includes("Passwort muss mindestens")) {
                setErrors((prev) => ({...prev, password: errorText}));
            } else {
                setErrors((prev) => ({...prev, general: "Ein Fehler ist aufgetreten"}));
            }
            return;
        }


        if (result.ok) {
            router.replace('/gallery');
        }

        return;
    }
    return (
        <div className="flex justify-center items-center size-full min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md w-[370px] border border-gray-300">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (validateFields()) {
                            startTransition(() => signup(email, password));
                        }

                    }}
                >
                <div className="grid gap-6">
                    <div className="grid gap-2 ">
                        <h1 className="text-2xl font-bold">Register</h1>
                        <p className="text-sm text-muted-foreground">
                            Create a new account to get started
                        </p>
                    </div>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-white hover:text-black hover:border"
                            // onClick={() => startTransition(() => signup(email, password))}
                        >
                            Register
                        </Button>
                    </div>
                    <div className="my-1.5 border-t border-gray-200"></div>
                    <div className="text-sm text-center text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="underline"
                        >
                            <Button
                                type="submit"
                                className="w-full mt-2 bg-white text-black border hover:text-white hover:bg-black"
                                // onClick={() => startTransition(() => signup(email, password))}
                            >
                                Log in
                            </Button>
                        </Link>
                    </div>
                </div>
                </form>
            </div>
        </div>
    );
}
