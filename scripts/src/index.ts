import { OpenAI } from "openai";
// dotenv
import { config } from "dotenv";

config();

async function main() {}

async function gptJudgement(transcription: string): Promise<void> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://oai.hconeai.com/v1",
    defaultHeaders: {
      "Helicone-Auth": "Bearer " + process.env.HELICONE_API_KEY,
    },
  });
}

main();
