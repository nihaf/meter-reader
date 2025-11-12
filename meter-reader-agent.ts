import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

// Konfiguration
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}
if (!SUPABASE_KEY) {
  throw new Error("SUPABASE_KEY environment variable is required");
}
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

// Clients initialisieren
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Express Setup
const app = express();
const upload = multer({ dest: "uploads/" });

// Types
interface MeterReading {
  meter_id: string;
  meter_type: "electricity" | "water" | "gas" | "unknown";
  reading_value: number;
  unit: string;
  confidence: "high" | "medium" | "low";
  raw_response: string;
}

interface ApiResponse {
  success: boolean;
  data?: MeterReading;
  error?: string;
}

// Hauptfunktion: Zählerstand vom Bild erkennen
async function readMeterFromImage(imagePath: string): Promise<MeterReading> {
  // Bild in Base64 konvertieren
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  // MIME-Type basierend auf Dateiendung bestimmen
  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypeMap: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".heic": "image/heic",
    ".webp": "image/webp",
  };
  const mimeType = mimeTypeMap[ext] || "image/jpeg";

  // Claude Vision API aufrufen
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Analysiere dieses Bild eines Zählerstands (Stromzähler, Wasserzähler oder Gaszähler) und extrahiere folgende Informationen im JSON-Format:

{
  "meter_id": "Die ID/Seriennummer des Zählers (falls sichtbar, sonst null)",
  "meter_type": "electricity" | "water" | "gas" | "unknown",
  "reading_value": Die Zahl die der Zähler anzeigt (nur Ziffern, als Nummer),
  "unit": "kWh" | "m³" | "unknown",
  "confidence": "high" | "medium" | "low",
  "notes": "Zusätzliche Anmerkungen"
}

Wichtig:
- Erkenne den Zählertyp basierend auf Design und Beschriftung
- Extrahiere die angezeigte Zahl genau (ignoriere Dezimalstellen nach dem ersten Komma wenn nicht klar)
- Die Meter-ID ist normalerweise auf dem Zähler gedruckt
- Setze confidence basierend auf Bildqualität und Lesbarkeit
- Antworte NUR mit gültigem JSON, nichts anderes!`,
          },
        ],
      },
    ],
  });

  // Response parsing
  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsedResponse;
  try {
    parsedResponse = JSON.parse(responseText);
  } catch (e) {
    throw new Error(
      `Ungültiges JSON-Response von Claude: ${responseText.substring(0, 200)}`
    );
  }

  const meterReading: MeterReading = {
    meter_id: parsedResponse.meter_id || "UNKNOWN",
    meter_type: parsedResponse.meter_type || "unknown",
    reading_value: parseFloat(parsedResponse.reading_value) || 0,
    unit: parsedResponse.unit || "unknown",
    confidence: parsedResponse.confidence || "low",
    raw_response: responseText,
  };

  return meterReading;
}

// Daten zu Supabase speichern
async function saveMeterReadingToSupabase(reading: MeterReading) {
  const { data, error } = await supabase
    .from("meter_readings")
    .insert([
      {
        meter_id: reading.meter_id,
        meter_type: reading.meter_type,
        reading_value: reading.reading_value,
        unit: reading.unit,
        confidence: reading.confidence,
        created_at: new Date().toISOString(),
      },
    ])
    .select();

  if (error) {
    throw new Error(`Supabase Fehler: ${error.message}`);
  }

  return data;
}

// API Endpoints

// POST /api/meter-reading - Bild hochladen und verarbeiten
app.post(
  "/api/meter-reading",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "Kein Bild hochgeladen",
        } as ApiResponse);
        return;
      }

      // Zählerstand vom Bild erkennen
      const meterReading = await readMeterFromImage(req.file.path);

      // Zu Supabase speichern
      const supabaseData = await saveMeterReadingToSupabase(meterReading);

      // Temporäre Datei löschen
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        data: {
          ...meterReading,
          supabase_id: supabaseData?.[0]?.id,
        },
      } as ApiResponse);
    } catch (error) {
      // Temporäre Datei bei Fehler löschen
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Fehler:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unbekannter Fehler",
      } as ApiResponse);
    }
  }
);

// GET /api/readings - Alle gespeicherten Messwerte abrufen
app.get("/api/readings", async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("meter_readings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase Fehler: ${error.message}`);
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
});

// GET /api/readings/:meter_id - Messwerte für spezifischen Zähler
app.get(
  "/api/readings/:meter_id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { meter_id } = req.params;

      const { data, error } = await supabase
        .from("meter_readings")
        .select("*")
        .eq("meter_id", meter_id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Supabase Fehler: ${error.message}`);
      }

      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    }
  }
);

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Meter Reader Agent läuft auf Port ${PORT}`);
  console.log(`📝 POST /api/meter-reading - Zählerstand erkennen`);
  console.log(`📊 GET /api/readings - Alle Messwerte abrufen`);
  console.log(`📊 GET /api/readings/:meter_id - Messwerte für Zähler`);
});