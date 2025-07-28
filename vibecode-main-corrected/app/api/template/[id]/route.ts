import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";
import { NextRequest } from "next/server";

// Helper function to ensure valid JSON
function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data)); // Ensures it's serializable
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const param = await params;
  const id = param.id;

  if (!id) {
    return Response.json({ error: "Missing playground ID" }, { status: 400 });
  }

  const playground = await db.playground.findUnique({
    where: { id },
  });

  if (!playground) {
    return Response.json({ error: "Playground not found" }, { status: 404 });
  }

  const templateKey = playground.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey];

  if (!templatePath) {
    return Response.json({ error: "Invalid template" }, { status: 404 });
  }

  try {
    const inputPath = path.join(process.cwd(), templatePath);

    console.log("Template Key:", templateKey);
    console.log("Template Path:", templatePath);
    console.log("Process CWD:", process.cwd());
    console.log("Input Path:", inputPath);

    // Check if the template directory exists
    const fs = await import('fs');
    try {
      const stats = await fs.promises.stat(inputPath);
      console.log("Template directory exists:", stats.isDirectory());
    } catch (statError) {
      console.error("Template directory stat error:", statError);
      return Response.json({ error: `Template directory not found: ${inputPath}` }, { status: 404 });
    }

    // Process template structure directly in memory (no file writing)
    const { scanTemplateDirectory } = await import("@/features/playground/libs/path-to-json");
    const result = await scanTemplateDirectory(inputPath);

    // Validate the JSON structure before returning
    if (!validateJsonStructure(result.items)) {
      return Response.json({ error: "Invalid JSON structure" }, { status: 500 });
    }

    return Response.json({ success: true, templateJson: result }, { status: 200 });
  } catch (error) {
    console.error("Error generating template JSON:", error);
    return Response.json({ error: "Failed to generate template" }, { status: 500 });
  }
}


