import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedPrompts = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultPrompts = [
      {
        key: "extractPRD",
        name: "Extracción de PRD",
        description: "Analiza el texto de descripción y extrae nombre, audiencia y problema.",
        content: `Analiza el siguiente texto (PRD o descripción de producto) y extrae la información estructurada en JSON.
  Responde SIEMPRE en español.
  Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
  {
      "name": "Nombre del producto",
      "description": "Descripción corta",
      "targetAudience": "Público objetivo",
      "problemSolved": "Problema que resuelve"
  }
  
  Texto: "{prdText}"`
      },
      {
        key: "generateMonthlyPlan",
        name: "Plan Mensual",
        description: "Genera el calendario de 20 ideas para las 4 semanas.",
        content: `Actúa como LaunchKit, un estratega de contenido experto. Genera un plan de contenido mensual (4 semanas) para el siguiente producto:
  
  Nombre: {project.name}
  Descripción: {project.description}
  Audiencia: {project.targetAudience}
  Problema que resuelve: {project.problemSolved}

  {searchContext}
  
  Estructura del plan (4 semanas, EXACTAMENTE 5 ideas por semana):
  - Semana 1 (5 ideas variadas)
  - Semana 2 (5 ideas variadas)
  - Semana 3 (5 ideas variadas)
  - Semana 4 (5 ideas variadas)

  Genera un total de 20 items. 
  
  Tipos de contenido permitidos ÚNICAMENTE:
  - "Post X"
  - "Post LinkedIn"
  - "Post Instagram"
  - "Email"
  
  REGLAS DE DISTRIBUCIÓN (IMPORTANTE):
  1. MEZCLA los tipos de contenido en TODAS las semanas de forma aleatoria y equilibrada.
  2. NO crees semanas temáticas ni sigas fases.
  3. Cada semana DEBE tener una mezcla de los 4 tipos.
  
  IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido que contenga una clave "plan" con el array de 20 objetos. Todo en español.
  Cada objeto del array debe tener:
  {
    "week": "Semana 1" | "Semana 2" | "Semana 3" | "Semana 4",
    "contentType": "Post X" | "Post LinkedIn" | "Post Instagram" | "Email",
    "title": "Título corto (max 10 palabras)",
    "angle": "El ángulo o enfoque del contenido",
    "isTrend": boolean,
    "trendContext": "Contexto de la tendencia si existe"
  }`
      },
      {
        key: "generateSingleIdea",
        name: "Idea Individual",
        description: "Genera una única idea de contenido cuando el usuario pide 'Añadir Idea'.",
        content: `Genera UNA (1) idea de contenido de marketing creativa y única para la: "{week}".
    
    Producto: {project.name}
    Descripción: {project.description}
    Target: {project.targetAudience}
  
    Tipos permitidos: "Post X", "Post LinkedIn", "Post Instagram", "Email".
    Selecciona uno aleatoriamente.

    Responde ÚNICAMENTE con un JSON válido con esta estructura:
    {
        "contentType": "Tipo seleccionado",
        "title": "Título corto",
        "angle": "Explicación del ángulo",
        "isTrend": false,
        "trendContext": ""
    }`
      },
      {
        key: "generateCopy",
        name: "Escritura de Copy",
        description: "Genera el texto final para un post o email.",
        content: `Genera el texto FINAL listo para publicar para este contenido de marketing.
  
  Producto: {project.name}
  Descripción: {project.description}
  Target: {project.targetAudience}
  
  Detalles del contenido:
  Tipo: {item.contentType}
  Título/Idea: {item.title}
  Ángulo: {item.angle}
  {trendInfo}
  
  REGLAS:
  1. SOLO devuelve el texto del contenido. 
  2. PROHIBIDO usar Markdown. 
  3. NO incluyas introducciones.
  4. Si es Email: Primera línea el Asunto, salta dos líneas, y luego el cuerpo.
  5. Escribe en Español. Tono profesional pero cercano.`
      },
      {
        key: "refineCopy",
        name: "Refinar Copy",
        description: "Ajusta el texto generado según las instrucciones del usuario.",
        content: `Reescribe el siguiente texto aplicando la instrucción dada.
  
  Texto original:
  "{currentCopy}"
  
  Instrucción:
  "{instruction}"
  
  REGLAS:
  1. Devuelve SOLAMENTE el texto reescrito en español.
  2. PROHIBIDO usar Markdown.
  3. Sin explicaciones.`
      },
      {
        key: "generateImage",
        name: "Generación de Imágenes",
        description: "Prompt para crear la imagen de marketing.",
        content: `Attractive marketing image for a project named "{project.name}". 
  Context: {item.title}. Angle: {item.angle}. 
  Aspect Ratio: {aspectRatio}`
      },
      {
        key: "emailsLaunchKit",
        name: "Kit: Emails",
        description: "Genera los 3 emails estratégicos del Launch Kit.",
        content: `Genera 3 emails de marketing para el lanzamiento. Producto: {project.name}. Descripción: {project.description}. Target: {project.targetAudience}.
            Escribe asunto y cuerpo.
            Responde ÚNICAMENTE con JSON:
            { "teaser": "texto", "lanzamiento": "texto", "recordatorio": "texto" }`
      },
      {
        key: "productHuntLaunchKit",
        name: "Kit: Product Hunt",
        description: "Genera tagline y descripción para Product Hunt.",
        content: `Genera textos para Product Hunt. Producto: {project.name}. Descripción: {project.description}. Target: {project.targetAudience}.
            Responde ÚNICAMENTE con JSON:
            { "tagline": "texto max 60 chars", "descripcion": "texto intro", "primerComentario": "texto comentario" }`
      },
      {
        key: "directoriesLaunchKit",
        name: "Kit: Directorios",
        description: "Genera descripciones cortas y largas para directorios.",
        content: `Genera descripciones para directorios. Producto: {project.name}. Descripción: {project.description}. Target: {project.targetAudience}.
            Responde ÚNICAMENTE con JSON:
            { "descripcionCorta": "texto", "descripcionLarga": "texto" }`
      }
    ];

    for (const p of defaultPrompts) {
      const existing = await ctx.db
        .query("prompts")
        .withIndex("by_key", (q) => q.eq("key", p.key))
        .unique();
      
      if (!existing) {
        await ctx.db.insert("prompts", {
          ...p,
          updatedAt: Date.now(),
        });
      }
    }
  },
});
