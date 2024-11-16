const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getMimeType(filename) {
    const extension = path.extname(filename).toLowerCase();
    switch (extension) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        case ".svg":
            return "image/svg+xml";
        default:
            return "application/octet-stream";
    }
}

(async () => {
    const files = fs.readdirSync("seeding-data");

    for (const file of files) {
        const filePath = path.join("seeding-data", file);
        const fileContent = fs.readFileSync(filePath);
        const mimeType = getMimeType(file);

        const { error } = await supabase.storage
            .from("images")
            .upload(file, fileContent, {
                upsert: true,
                contentType: mimeType,
            });

        if (error) {
            console.error(error.message);
        }
    }
})();
