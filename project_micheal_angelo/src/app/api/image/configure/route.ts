'use server';

import { NextResponse } from "next/server";
import { handlerWithPreconditions, MiddlewareContext, requireUser, validateBody } from "@utils/custom-middleware";

export const GET = handlerWithPreconditions(
    [requireUser],
    async () => {
        return NextResponse.json(
            {
                strip: ["20mm Gold", "50mm Gold"],
                pallet:  ["White", "Black"],
            }
        )
    }
)