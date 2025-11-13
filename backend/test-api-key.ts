import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

async function testApiKey() {
  console.log("Testing Anthropic API key...\n");

  if (!ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY not found in .env file");
    process.exit(1);
  }

  console.log(`API Key: ${ANTHROPIC_API_KEY.substring(0, 20)}...`);
  console.log("Making test request to Claude API...\n");

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Hello! Please respond with a simple greeting.",
        },
      ],
    });

    console.log("✅ Success! API key is valid and working.\n");
    console.log("Response from Claude:");
    console.log("─".repeat(50));

    if (response.content[0].type === "text") {
      console.log(response.content[0].text);
    }

    console.log("─".repeat(50));
    console.log(`\nModel: ${response.model}`);
    console.log(`Stop reason: ${response.stop_reason}`);
    console.log(`Usage: ${response.usage.input_tokens} input tokens, ${response.usage.output_tokens} output tokens`);

  } catch (error: any) {
    console.error("❌ Error: API key test failed\n");

    if (error.status === 401) {
      console.error("Authentication failed. The API key is invalid or expired.");
      console.error("Please check your ANTHROPIC_API_KEY in the .env file.");
    } else if (error.status === 429) {
      console.error("Rate limit exceeded. Too many requests.");
    } else if (error.status === 500) {
      console.error("Anthropic API server error.");
    } else {
      console.error(`Error: ${error.message}`);
      if (error.status) {
        console.error(`Status: ${error.status}`);
      }
    }

    process.exit(1);
  }
}

testApiKey();