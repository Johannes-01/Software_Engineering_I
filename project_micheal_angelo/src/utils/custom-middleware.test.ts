import { describe, it, vi, expect, afterEach } from "vitest";
import { requireAdmin, requireExists, requireUnique, validateBody } from "./custom-middleware"
import type { MiddlewareContext } from "./custom-middleware"
import * as SupabaseClientHelper from "./supabase-helper"
import { NextResponse } from "next/server";
import z from "zod"

describe("custom middleware", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("test admin middleware", () => {
        it("should return a 401 error if the user is not logged in", async () => {
            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                auth: {
                    getUser: () => ({ data: { user: undefined } })
                }
            } as any)

            const context = { route: "test" }

            const result = await requireAdmin(context)

            expect(result).instanceof(NextResponse)
            expect((result as NextResponse).status).toEqual(401)
        })

        it("should return a 403 error if the user is not an admin", async () => {
            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                auth: {
                    getUser: () => ({ data: { user: { user_metadata: { role: "user" } } } })
                }
            } as any)

            const context = { route: "test" }

            const result = await requireAdmin(context)

            expect(result).instanceof(NextResponse)
            expect((result as NextResponse).status).toEqual(403)
        })

        it("should return the context if the user is an admin", async () => {
            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                auth: {
                    getUser: () => ({ data: { user: { user_metadata: { role: "admin" } } } })
                }
            } as any)

            const context = { route: "test" }

            const result = await requireAdmin(context)

            expect((result as MiddlewareContext).supabaseClient).toBeDefined()
        })
    })

    describe("validateBody", () => {
        it("should not crash is the body was already read", async () => {
            const validator = validateBody({ safeParse: vi.fn().mockReturnValue({ error: undefined }) } as any)
            const result = await validator({ body: {} } as any, { request: () => { throw new Error() } } as any)
            expect((result as MiddlewareContext).body).toEqual({})
        })

        it("should correctly validate the body against a zod schema", async () => {
            const schema = z.object({
                someValue: z.string()
            })

            const result = await (validateBody(schema))(
                { body: { someValue: "this is indeed some value" }} as any,
                {} as any
            )

            expect((result as MiddlewareContext).body!.someValue).toEqual("this is indeed some value")
        })

        it("should correctly return an error when the validation fails", async () => {
            const schema = z.object({
                someValue: z.number()
            })

            const result = await (validateBody(schema))(
                { body: { someValue: "this is not a number" }} as any,
                {} as any
            )

            expect((result as NextResponse).status).toEqual(400)
        })
    })

    describe("requireExists", async () => {
        it("should correctly return an not found error if the specified item was not found", async () => {
            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                from: (table: string) => ({
                    select: (tableKey: string) => ({
                        eq: (key: string, value: any) => ({ data: [], error: undefined })
                    })
                })
            } as any)

            const response = await requireExists("table", { key: "value"})({} as any)

            expect((response as NextResponse).status).toEqual(404)
        })

        it("should correctly return the context if an element was found", async () => {
            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                from: (table: string) => ({
                    select: (tableKey: string) => ({
                        eq: (key: string, value: any) => ({ data: ["non empty array"], error: undefined})
                    })
                })
            } as any)

            const response = await requireExists("table", { key: "value" })({ contextElement: true } as any)

            expect((response as any).contextElement).toBeDefined()
        })
    })

    describe("requireUnique", () => {
        it("should return a 409 if the element already exists", async () => {
            const equalityFunction = (key: string, value: any) => ({ eq: equalityFunction, data: ["non empty array"], error: undefined})

            vi.spyOn(SupabaseClientHelper, "createSupabaseClient").mockReturnValue({
                from: (table: string) => ({
                    select: (tableKey: string) => ({
                        eq: equalityFunction,
                    })
                })
            } as any)

            const result = await requireUnique("table", { key: "value" })({ contextValue: true } as any)

            expect((result as NextResponse).status).toBe(409)


        })
    })
})