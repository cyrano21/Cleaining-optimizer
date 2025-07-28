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
  { params }: { params: Promise<{ templateName: string }> }
) {
  const param = await params;
  const templateName = param.templateName;

  if (!templateName) {
    return Response.json({ error: "Missing template name" }, { status: 400 });
  }

  // Map template name to template key
  const templateKeyMap: Record<string, keyof typeof templatePaths> = {
    'nextjs-new': 'NEXTJS',
    'react-ts': 'REACT',
    'express-simple': 'EXPRESS',
    'vue': 'VUE',
    'hono-nodejs-starter': 'HONO',
    'angular': 'ANGULAR'
  };

  const templateKey = templateKeyMap[templateName];
  if (!templateKey) {
    return Response.json({ error: "Invalid template name" }, { status: 404 });
  }

  const templatePath = templatePaths[templateKey];
  if (!templatePath) {
    return Response.json({ error: "Template path not found" }, { status: 404 });
  }

  try {
    const inputPath = path.join(process.cwd(), templatePath);

    console.log("Template Name:", templateName);
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