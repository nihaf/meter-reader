'use server'

import Anthropic from '@anthropic-ai/sdk'

interface ClaudeResponse {
  meter_id: string
  meter_type: 'electricity' | 'water' | 'gas' | 'unknown'
  reading_value: number
  unit: string
  confidence: 'high' | 'medium' | 'low'
  confidence_score: number
}

interface AnalysisResult {
  success: boolean
  data?: ClaudeResponse
  error?: string
  processing_time_ms?: number
}

export async function analyzeMeterImage(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
): Promise<AnalysisResult> {
  const startTime = Date.now()

  try {
    // Validate environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured')
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey })

    // Call Claude Vision API with exact prompt from backend
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analysiere dieses Bild eines Zählerstands (Stromzähler, Wasserzähler oder Gaszähler) und extrahiere folgende Informationen im JSON-Format:

{
  "meter_id": "Die ID/Seriennummer des Zählers (falls sichtbar, sonst 'UNKNOWN')",
  "meter_type": "electricity" | "water" | "gas" | "unknown",
  "reading_value": Die Zahl die der Zähler anzeigt (nur Ziffern, als Nummer),
  "unit": "kWh" | "m3" | "unknown",
  "confidence": "high" | "medium" | "low",
  "confidence_score": 0.0 bis 1.0 (numerischer Wert)
}

Wichtig:
- Erkenne den Zählertyp basierend auf Design und Beschriftung
- Extrahiere die angezeigte Zahl genau
- Die Meter-ID ist normalerweise auf dem Zähler gedruckt (rechts oben oder unten)
- Setze confidence basierend auf Bildqualität, Lesbarkeit und Deutlichkeit
- confidence_score sollte zwischen 0.0 (sehr unsicher) und 1.0 (sehr sicher) liegen
- Antworte NUR mit reinem JSON-Objekt
- Nur das reine JSON-Objekt liefern!
- KEINE Markdown-Formatierung
- Keine zusätzlichen Erklärungen oder Text
- Beachte bei Stromzählern: Die letzte angezeigte Ziffer steht IMMER hinter dem Dezimalkomma.
- Beachte bei Gaszählern: Die letzten DREI Ziffern (oft rot markiert) stehen hinter dem Dezimalkomma. Der Zähler zeigt drei Nachkommastellen an.`,
            },
          ],
        },
      ],
    })

    // Extract response text
    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON response (remove markdown if present)
    let parsedResponse: ClaudeResponse
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      parsedResponse = JSON.parse(cleanedResponse)
    } catch (e) {
      throw new Error(
        `Invalid JSON response from Claude: ${responseText.substring(0, 200)}`
      )
    }

    const processingTime = Date.now() - startTime

    return {
      success: true,
      data: {
        meter_id: parsedResponse.meter_id || 'UNKNOWN',
        meter_type: parsedResponse.meter_type || 'unknown',
        reading_value: parseFloat(String(parsedResponse.reading_value)) || 0,
        unit: parsedResponse.unit || 'unknown',
        confidence: parsedResponse.confidence || 'low',
        confidence_score: parsedResponse.confidence_score || 0.5,
      },
      processing_time_ms: processingTime,
    }
  } catch (error) {
    console.error('Error analyzing meter image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
