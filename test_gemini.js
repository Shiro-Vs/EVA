const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCXuOhPTHQub1JmHu_u6U-_nx08RUpsjmo";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testConnection() {
  console.log("1. Configurando cliente para gemini-2.0-flash-lite...");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

  try {
    console.log("2. Enviando solicitud de prueba...");
    const result = await model.generateContent("Di 'Hola EVA' si me escuchas");
    const response = await result.response;
    const text = response.text();
    console.log("✅ ¡ÉXITO! Respuesta:", text);
  } catch (error) {
    console.error("❌ ERROR FATAL:");
    console.error(error);
  }
}

testConnection();
