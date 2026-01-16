const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCXuOhPTHQub1JmHu_u6U-_nx08RUpsjmo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to access client? No, need direct list.
    // Actually the SDK doesn't expose listModels directly on the client instance in some versions?
    // Let's try the direct API call if SDK fails, but SDK usually has it on the Module or similar.
    // Wait, typical usage:
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // There isn't a top level listModels on genAI instance in all versions.
    // But let's try a simple fetch against the API itself to be raw and sure.

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("=== MODELOS DISPONIBLES ===");
    if (data.models) {
      data.models.forEach((m) => {
        if (
          m.supportedGenerationMethods &&
          m.supportedGenerationMethods.includes("generateContent")
        ) {
          console.log(`✅ ${m.name.replace("models/", "")}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
