'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireUser, validateBody } from "@utils/custom-middleware";

export const GET = handlerWithPreconditions(
    [requireUser],
    async () => {
        return NextResponse.json(
            {
                strip: ["Alu 30mm", "Gold 30mm", "Alu 50mm", "Gold 50mm", "Holz 30mm", "Holz 50mm", "Holz 100mm"],
                pallet:  ["Gold", "Schwarz", "Rot", "Silber"],
            }
        )
    }
)