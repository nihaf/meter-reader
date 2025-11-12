import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

// Konfiguration
const SUPABASE_URL: string = process.env.SUPABASE_URL || "";
const SUPABASE_KEY: string = process.env.SUPABASE_KEY || "";
const ANTHROPIC_API_KEY: string = process.env.ANTHROPIC_API_KEY || "";
const PORT: number = parseInt(process.env.PORT || "3000", 10);
const MAX_FILE_SIZE_MB: number = parseInt(process.env.MAX_FILE_SIZE_MB || "5", 10);
const MAX_FILE_SIZE: number = MAX_FILE_SIZE_MB * 1024 * 1024;

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

// Multer Konfiguration mit Größenlimit
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // Nur Bilddateien akzeptieren
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Nur Bilddateien sind erlaubt"));
    } else {
      cb(null, true);
    }
  },
});

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
  data?: any;
  error?: string;
  timestamp?: string;
}

interface ProcessingMetrics {
  processing_time_ms: number;
  image_size_bytes: number;
  confidence_score: number;
}

// Middleware
app.use(express.json());

// Logging Middleware
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  const originalJson = res.json.bind(res);

  res.json = function (data: any) {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
    return originalJson(data);
  };

  next();
});

// Fehlerbehandlung Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: `Datei zu groß. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }
  }

  console.error("Fehler:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Unbekannter Fehler",
  });
});

// Hauptfunktion: Zählerstand vom Bild erkennen
async function readMeterFromImage(
  imagePath: string
): Promise<{ reading: MeterReading; metrics: ProcessingMetrics }> {
  const startTime = Date.now();

  // Bild in Base64 konvertieren
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const imageSize = imageBuffer.length;

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
  "meter_id": "Die ID/Seriennummer des Zählers (falls sichtbar, sonst 'UNKNOWN')",
  "meter_type": "electricity" | "water" | "gas" | "unknown",
  "reading_value": Die Zahl die der Zähler anzeigt (nur Ziffern, als Nummer),
  "unit": "kWh" | "m³" | "unknown",
  "confidence": "high" | "medium" | "low",
  "confidence_score": 0.0 bis 1.0 (numerischer Wert)
}

Wichtig:
- Erkenne den Zählertyp basierend auf Design und Beschriftung
- Extrahiere die angezeigte Zahl genau
- Die Meter-ID ist normalerweise auf dem Zähler gedruckt (rechts oben oder unten)
- Setze confidence basierend auf Bildqualität, Lesbarkeit und Deutlichkeit
- confidence_score sollte zwischen 0.0 (sehr unsicher) und 1.0 (sehr sicher) liegen
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

  const processingTime = Date.now() - startTime;
  const confidenceScore = parsedResponse.confidence_score || 0.5;

  const meterReading: MeterReading = {
    meter_id: parsedResponse.meter_id || "UNKNOWN",
    meter_type: parsedResponse.meter_type || "unknown",
    reading_value: parseFloat(parsedResponse.reading_value) || 0,
    unit: parsedResponse.unit || "unknown",
    confidence: parsedResponse.confidence || "low",
    raw_response: responseText,
  };

  const metrics: ProcessingMetrics = {
    processing_time_ms: processingTime,
    image_size_bytes: imageSize,
    confidence_score: confidenceScore,
  };

  return { reading: meterReading, metrics };
}

// Daten zu Supabase speichern
async function saveMeterReadingToSupabase(
  reading: MeterReading,
  metrics: ProcessingMetrics
) {
  const { data, error } = await supabase
    .from("meter_readings")
    .insert([
      {
        meter_id: reading.meter_id,
        meter_type: reading.meter_type,
        reading_value: reading.reading_value,
        unit: reading.unit,
        confidence: reading.confidence,
        confidence_score: metrics.confidence_score,
        processing_time_ms: metrics.processing_time_ms,
        image_size_bytes: metrics.image_size_bytes,
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
          timestamp: new Date().toISOString(),
        } as ApiResponse);
        return;
      }

      // Zählerstand vom Bild erkennen
      const { reading, metrics } = await readMeterFromImage(req.file.path);

      // Zu Supabase speichern
      const supabaseData = await saveMeterReadingToSupabase(reading, metrics);

      // Temporäre Datei löschen
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        data: {
          ...reading,
          metrics: metrics,
          supabase_id: supabaseData?.[0]?.id,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } catch (error) {
      // Temporäre Datei bei Fehler löschen
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          /* ignorieren */
        }
      }

      console.error("Fehler:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  }
);

// GET /api/readings - Alle gespeicherten Messwerte abrufen
app.get("/api/readings", async (req: Request, res: Response): Promise<void> => {
  try {
    const { meter_id, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from("meter_readings")
      .select("*")
      .order("created_at", { ascending: false });

    if (meter_id) {
      query = query.eq("meter_id", meter_id as string);
    }

    const { data, error } = await query.range(
      Number(offset),
      Number(offset) + Number(limit) - 1
    );

    if (error) {
      throw new Error(`Supabase Fehler: ${error.message}`);
    }

    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/readings/:meter_id - Messwerte für spezifischen Zähler
app.get(
  "/api/readings/:meter_id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { meter_id } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const { data, error } = await supabase
        .from("meter_readings")
        .select("*")
        .eq("meter_id", meter_id)
        .order("created_at", { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      if (error) {
        throw new Error(`Supabase Fehler: ${error.message}`);
      }

      res.json({
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// GET /api/stats - Aggregierte Statistiken
app.get("/api/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const { meter_id } = req.query;

    let query = supabase.from("meter_readings").select("*");

    if (meter_id) {
      query = query.eq("meter_id", meter_id as string);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase Fehler: ${error.message}`);
    }

    // Berechne Statistiken
    const stats = {
      total_readings: data?.length || 0,
      meters_count: new Set(data?.map((r: any) => r.meter_id)).size || 0,
      avg_confidence: data
        ? (
            data.reduce((sum: number, r: any) => sum + (r.confidence_score || 0), 0) /
            data.length
          ).toFixed(2)
        : 0,
      meters_by_type: data?.reduce(
        (acc: any, r: any) => {
          acc[r.meter_type] = (acc[r.meter_type] || 0) + 1;
          return acc;
        },
        {}
      ),
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
      timestamp: new Date().toISOString(),
    });
  }
});

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint nicht gefunden",
    timestamp: new Date().toISOString(),
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Meter Reader Agent läuft auf Port ${PORT}`);
  console.log(`\n📚 Verfügbare Endpoints:`);
  console.log(`   POST   /api/meter-reading - Zählerstand erkennen`);
  console.log(`   GET    /api/readings - Alle Messwerte abrufen`);
  console.log(`   GET    /api/readings/:meter_id - Messwerte für Zähler`);
  console.log(`   GET    /api/stats - Statistiken`);
  console.log(`   GET    /health - Health Check`);
  console.log(`\n✅ Bereit für Anfragen!\n`);
});

export {};