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

    // Call Claude Vision API
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
              text: `Analyze this image of a meter reading (electricity meter, water meter, or gas meter) and extract the following information in JSON format:

{
  "meter_id": "The ID/serial number of the meter (if visible, otherwise 'UNKNOWN')",
  "meter_type": "electricity" | "water" | "gas" | "unknown",
  "reading_value": The number displayed by the meter (digits only, as a number),
  "unit": "kWh" | "m3" | "unknown",
  "confidence": "high" | "medium" | "low",
  "confidence_score": 0.0 to 1.0 (numeric value)
}

Important:
- Identify the meter type based on design and labeling
- Extract the displayed number accurately
- The meter ID is usually printed on the meter (top right or bottom)
- Set confidence based on image quality, readability, and clarity
- confidence_score should be between 0.0 (very uncertain) and 1.0 (very certain)
- Respond ONLY with a pure JSON object
- Deliver only the pure JSON object!
- NO Markdown formatting
- No additional explanations or text
- Note for electricity meters: The last digit displayed is ALWAYS after the decimal point.
- Note for gas meters: The last THREE digits (often marked in red) are after the decimal point. The meter displays three decimal places.`,
            },
          ],
        },
      ],
    })

    // Validate response structure
    if (!response || !response.content || !Array.isArray(response.content) || response.content.length === 0) {
      throw new Error('Invalid response structure from Claude API')
    }

    const firstContent = response.content[0]
    if (!firstContent || typeof firstContent !== 'object' || firstContent.type !== 'text') {
      throw new Error(`Unexpected response type from Claude: ${firstContent?.type || 'undefined'}`)
    }

    // Extract response text safely
    const responseText = String(firstContent.text || '')

    if (!responseText) {
      throw new Error('Empty response text from Claude')
    }

    // Detect if response looks like Base64 data (common mobile browser issue)
    if (/^[A-Za-z0-9+/=]{20,}$/.test(responseText.substring(0, 100).replace(/\s/g, ''))) {
      throw new Error('Received Base64 data instead of JSON response. This may be a mobile browser compatibility issue.')
    }

    // Parse JSON response (remove markdown if present)
    let parsedResponse: ClaudeResponse
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      if (!cleanedResponse.startsWith('{')) {
        throw new Error(`Response does not start with JSON object: ${cleanedResponse.substring(0, 50)}`)
      }

      parsedResponse = JSON.parse(cleanedResponse)
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown parsing error'
      throw new Error(
        `Invalid JSON response from Claude (${errorMessage}): ${responseText.substring(0, 200)}`
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
