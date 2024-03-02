import { config } from "dotenv";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
import * as fs from "fs";
import { OpenAI } from "openai";
import readline from "readline";

config({
  path: "../.env",
}); // Load environment variables

const record = require("node-record-lpcm16");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const [command, ...args] = input.split(" ");
  const teamName = args.join(" ");
  if (!teamName) {
    console.log("Please provide a team name.");
    return;
  }
  if (command === "start") {
    startRecording(teamName);
  } else if (command === "stop") {
    stopRecording(teamName);
  } else if (command === "transcribe") {
    transcribe(teamName);
  } else if (command === "judgement") {
    gptJudgementDay(teamName);
  } else if (command === "exit") {
    rl.close();
  } else {
    console.log(
      'Unknown command. Type "start" to begin recording, "stop" to end, or "exit" to quit.'
    );
  }
});

let recordingStream: NodeJS.ReadableStream | null = null;
let audioData: Buffer[] = [];
let recorder: ReturnType<typeof record.record> | null = null;

async function startRecording(teamName: string) {
  try {
    const response = await fetch("https://www.judgementday.xyz/api/put-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        teamName: teamName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Judgement for ${teamName} sent to web!`);
  } catch (error) {
    console.error("Fetch error:", error);
  }

  console.log(`Starting recording for ${teamName}...`);
  recorder = record.record({
    sampleRate: 16000,
    threshold: 0.5,
    verbose: false,
    recordProgram: "sox", // Adjust this to your available recording software
    silence: "10.0",
  });

  audioData = [];
  recordingStream = recorder.stream();
  recordingStream?.on("data", (data: Buffer) => {
    audioData.push(data);
  });
}

async function stopRecording(teamName: string) {
  if (recordingStream) {
    console.log(`Stopping recording for ${teamName}...`);
    recorder.stop();
    recordingStream = null;
    recorder = null;
    const audioFileName = `${teamName}_recorded_audio.wav`;
    await writeFile(audioFileName, Buffer.concat(audioData));
  } else {
    console.log("No recording to stop.");
  }

  await transcribe(teamName);
}

async function transcribe(teamName: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://oai.hconeai.com/v1",
    organization: process.env.OPENAI_ORG,
    defaultHeaders: {
      "Helicone-Auth": "Bearer " + process.env.HELICONE_API_KEY,
    },
  });

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(`${teamName}_recorded_audio.wav`),
    model: "whisper-1",
  });

  const transcriptionFileName = `${teamName}_transcription.txt`;
  await writeFile(transcriptionFileName, transcription.text);
}

async function gptJudgementDay(teamName: string) {
  const transcription = fs.readFileSync(
    `${teamName}_transcription.txt`,
    "utf-8"
  );
  const res = await gptJudgement(transcription, teamName);
  console.log(`Judgement for ${teamName}:`, JSON.stringify(res, null, 2));

  try {
    const response = await fetch("https://www.judgementday.xyz/api/put-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Judgement for ${teamName} sent to web!`);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

type piss = {
  virality: number;
  gravitas: number;
  innovative: number;
  review: string;
};

type Criteria = {
  name: string;
  rating: number;
};

type Judgement = {
  criteria: Criteria[];
  review: string;
  image: string;
};

type JustinsCute = {
  teamName: string;
  judgement: Judgement;
};

async function gptJudgement(
  transcription: string,
  teamName: string
): Promise<JustinsCute> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://oai.hconeai.com/v1",
    organization: process.env.OPENAI_ORG,
    defaultHeaders: {
      "Helicone-Auth": "Bearer " + process.env.HELICONE_API_KEY,
    },
  });

  const chatPromise = openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: `You're a professional hackathon judge who has judged millions of the top hackathons across the globe. Your task is to judge the following project based on specific criteria: virality, gravitas, and innovative. Provide a rating out of 10 for each criterion and give a short, harsh, roast, and direct review of the person's hackathon presentation. ROAST THEM LIKE BILL BURR!
           MAX 3 SENTENCES!
          `,
      },
      {
        role: "user",
        content: `Team Name: """${teamName}""". Transcription: """${transcription}"""`,
      },
    ],
    tool_choice: {
      type: "function",
      function: {
        name: "rate_project",
      },
    },
    tools: [
      {
        type: "function",
        function: {
          name: "rate_project",
          description: "Rate a project based on specific criteria.",
          parameters: {
            type: "object",
            properties: {
              virality: {
                type: "number",
                description:
                  "Rate the project's viralityity on a scale of 1 to 10.",
              },
              gravitas: {
                type: "number",
                description:
                  "Rate the project's gravitas on a scale of 1 to 10.",
              },
              innovative: {
                type: "number",
                description:
                  "Rate the project's innovative on a scale of 1 to 10.",
              },
              review: {
                type: "string",
                description:
                  "Provide a short, harsh, roast and direct review of the project. ROAST THEM LIKE BILL BURR!",
              },
            },
            required: ["virality", "gravitas", "innovative", "review"],
          },
        },
      },
    ],
  });

  const imagePromise = openai.images.generate({
    model: "dall-e-3",
    prompt: `Make a simple vector graphic for a hackathon project named ${teamName}. Make it cool and futuristic.`,
    n: 1,
    size: "1024x1024",
  });

  const [response, image] = await Promise.all([chatPromise, imagePromise]);

  const piss: piss = JSON.parse(
    response.choices[0].message.tool_calls?.[0].function.arguments ?? "{}"
  ) as piss;

  const justin: JustinsCute = {
    teamName: teamName,
    judgement: {
      criteria: [
        {
          name: "virality",
          rating: piss.virality,
        },
        {
          name: "gravitas",
          rating: piss.gravitas,
        },
        {
          name: "innovative",
          rating: piss.innovative,
        },
      ],
      review: piss.review,
      image: image.data[0].url ?? "",
    },
  };
  return justin;
}

/*
{
  teamName: "Name 1",
  judgement: {
    criteria: [
      {
        name: "virality",
        rating: 10,
      },
      {
        name: "gravitas",
        rating: 10,
      },
      {
        name: "innovative",
        rating: 10,
      },
    ],
    review: "This is a great project.",
  }
}
*/
