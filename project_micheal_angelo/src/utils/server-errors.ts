import { NextResponse } from "next/server";

export function unauthorizedError() {
    return NextResponse.json({ message: "Could not authenticate" }, { status: 401 });
}

export function forbiddenError() {
    return NextResponse.json({ message: "No access to this ressource" }, { status: 403 });
}

export function internalServerError() {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
}

export function badRequestError(failedValidationMessage: string) {
    return NextResponse.json({ message: failedValidationMessage }, { status: 400 });
}

export function conflictError() {
    return NextResponse.json({ message: "Resource does already exist" }, { status: 409 });
}
