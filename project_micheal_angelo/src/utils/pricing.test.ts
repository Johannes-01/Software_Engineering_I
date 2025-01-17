import { calculatePrice } from "@utils/pricing";
import { describe, expect, it } from "vitest";

describe("Calculate Pricing", () => {
    it("should calculate pricing when no pallet is configured", () => {
        const result = calculatePrice({
            pallet: undefined,
            image: {
                price: 10000,
            }
        } as any)

        expect(result).toBe(100)
    });

    it("should calculate pricing when pallet is configured", () => {
        const result = calculatePrice({
            pallet: "yes",
            image: {
                price: 10000,
            }
        } as any)

        expect(result).toBe(115)
    })
})