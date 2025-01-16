import * as cheerio from 'cheerio';
import { NextResponse } from "next/server";
import { internalServerError } from "@utils/server-errors";

export async function GET() {
    const apiUrl = 'https://www.whatthecommit.com'; // Ensure this is the correct endpoint

    try {
        // Fetch the HTML content from the WhatTheCommit API
        const response = await fetch(apiUrl, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from WhatTheCommit API. Status: ${response.status}`);
        }

        const html = await response.text();

        // Parse the HTML using Cheerio
        const $ = cheerio.load(html);

        // Extract the commit message from the div with id 'content' and first <p> tag
        const commitMessage = $('#content p').first().text().trim();

        console.log(commitMessage)

        return NextResponse.json({
            commitMessage
        })
    } catch (error) {
        console.error('Error fetching commit message:', (error as Error).message);
        return internalServerError()
    }
}