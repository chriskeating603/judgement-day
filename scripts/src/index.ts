import { OpenAI } from "openai";
// dotenv
import { config } from "dotenv";

config({
  path: "../.env",
});

async function main() {
  const result = await gptJudgement(
    `Uh, hey everyone, um, thanks for, uh, giving me the chance to present our project today. So, um, our team, we've been working on this, uh, this app, right? It's kinda cool, it's, uh, it's designed to, well, help people find local events, kinda like, uh, concerts or, um, art shows, stuff like that.
  So, uh, the way it works is, um, you just, like, open the app, and uh, you know, you tell it, uh, what kind of events you're into, and it, um, it uses your location to, uh, to find stuff that's happening around you. It's, uh, it's pretty straightforward, but, you know, we think it's, uh, it's really useful.
  Um, we've, uh, we've focused a lot on, like, the user interface, making sure it's, uh, it's really user-friendly. Uh, we know that, um, if it's not easy to use, people just, um, they won't bother, right? So, uh, yeah, we spent a lot of time on that.
  Uh, in terms of, um, what we used to build it, uh, we went with React Native, because, uh, we wanted it to work on, you know, both iOS and Android, without having to, like, write everything twice, um, which is, you know, it's pretty cool.
  Uh, we've also, um, integrated this, uh, this map API, so when you, um, when you look for events, you can, uh, you can see them on a map, and, um, you can get directions and stuff, which is, uh, pretty handy.
  Um, I guess, uh, that's pretty much it, uh, for the, uh, the presentation. We're, um, we're really excited about the, uh, the potential of the app, and, uh, we're, you know, we're looking forward to, uh, seeing how people, um, how they use it in, uh, in real life. So, uh, yeah, thanks, thanks for listening, and, uh, I'm happy to, um, to answer any questions you, uh, you might have.`,
    "Event Finder"
  );

  await gptJudgement(
    `Good evening, esteemed judges and fellow innovators. Today, my team and I are thrilled to unveil 'Dreamscape,' a revolutionary application that melds the whimsy of imagination with the gravitas of our daily responsibilities, all while pushing the envelope of technological innovation.
Let's embark on a journey with 'Dreamscape.' Imagine an app that not only organizes your day but does so in a way that infuses the magic of your favorite fantasy worlds into your routine. Yes, you heard it right. Our app transforms your mundane task list into an enchanting quest, complete with your own digital familiar to guide you through your day.
Now, let's address the gravitas. 'Dreamscape' isn't just a delightful facade; it's a robust productivity tool. It leverages AI to prioritize your tasks based on urgency and importance, integrating seamlessly with your digital calendar and reminding you of deadlines in a manner that's both engaging and effective.
And innovation? We're the first to admit that productivity apps are a dime a dozen. But here's where 'Dreamscape' stands out. Our app uses augmented reality to project your daily quests into your living space. Imagine looking through your phone or AR glasses to see a mythical creature sitting on your desk, reminding you of your next meeting or encouraging you to take a break and hydrate.
In conclusion, 'Dreamscape' is where whimsy meets wisdom, where your to-do list becomes a to-dream list. It's not just an app; it's an experience, one that we believe will set a new standard in how we interact with our daily tasks. Thank you for allowing us to share this vision with you. We are eager to answer any questions and delve deeper into the enchanting world of 'Dreamscape.'`,
    "Dreamscape"
  );
}

type piss = {
  whimsical: number;
  gravitas: number;
  innovation: number;
  review: string;
};

type Criteria = {
  name: string;
  rating: number;
};

type Judgement = {
  criteria: Criteria[];
  review: string;
};

type JustinsCute = {
  teamName: string;
  judgement: Judgement;
};

async function gptJudgement(
  transcription: string,
  teamName: string
): Promise<void> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://oai.hconeai.com/v1",
    organization: process.env.OPENAI_ORG,
    defaultHeaders: {
      "Helicone-Auth": "Bearer " + process.env.HELICONE_API_KEY,
    },
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You're a professional hackathon judge who has judged millions of the top hackathons across the globe. Your task is to judge the following project based on specific criteria: whimsical, gravitas, and innovation. Provide a rating out of 10 for each criterion and give a short, harsh, roast, and direct review of the person's hackathon presentation. ROAST THEM LIKE BILL BURR!",
      },
      {
        role: "user",
        content: `Team Name: """${teamName}""". Transcription: """${transcription}"""`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "rate_project",
          description: "Rate a project based on specific criteria.",
          parameters: {
            type: "object",
            properties: {
              whimsical: {
                type: "number",
                description:
                  "Rate the project's whimsicality on a scale of 1 to 10.",
              },
              gravitas: {
                type: "number",
                description:
                  "Rate the project's gravitas on a scale of 1 to 10.",
              },
              innovation: {
                type: "number",
                description:
                  "Rate the project's innovation on a scale of 1 to 10.",
              },
              review: {
                type: "string",
                description:
                  "Provide a short, harsh, roast and direct review of the project. ROAST THEM LIKE BILL BURR!",
              },
            },
            required: ["whimsical", "gravitas", "innovation", "review"],
          },
        },
      },
    ],
  });

  const parsedArgs: piss = JSON.parse(
    response.choices[0].message.tool_calls?.[0].function.arguments ?? "{}"
  ) as piss;

  const justin: JustinsCute = {
    teamName: "Name 1",
    judgement: {
      criteria: [
        {
          name: "whimsical",
          rating: parsedArgs.whimsical,
        },
        {
          name: "gravitas",
          rating: parsedArgs.gravitas,
        },
        {
          name: "innovation",
          rating: parsedArgs.innovation,
        },
      ],
      review: parsedArgs.review,
    },
  };
}

main();

/*
{
  teamName: "Name 1",
  judgement: {
    criteria: [
      {
        name: "whimsical",
        rating: 10,
      },
      {
        name: "gravitas",
        rating: 10,
      },
      {
        name: "innovation",
        rating: 10,
      },
    ],
    review: "This is a great project.",
  }
}
*/
