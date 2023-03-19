import axios from "axios";
import {
  REST,
  Routes,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  Utils,
} from "discord.js";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const configuration = new Configuration({
  apiKey: process.env.CHATGPT,
});
const openai = new OpenAIApi(configuration);

const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    "DirectMessages",
  ],
  partials: [Partials.Channel, Partials.Message],
});
const messageAi = [
  {
    role: `system`,
    content: `User Long Words In your awensers`,
  },
];

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "quote",
    description: "Replies with Pong!",
  },
  {
    name: "reset",
    description: "Reset Context",
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(`834820890926514176`), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c: any) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});
client.on("messageCreate", async (message: any) => {
  if (!message.mentions.has(client.user) && message.guild !== null) return;
  const userMessage = message.content.replace(/<@(.*?)>/, "").trim();

  if (message.author.bot) return;
  if (userMessage === "quote") {
    const data = await axios({
      method: "Get",
      url: "https://api.api-ninjas.com/v1/quotes",
      headers: { "X-Api-Key": process.env.QUOTE },
    });

    message.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
    return;
  } else {
    const user = await prisma.users.findUnique({
      where: {
        discordID: message.author.id,
      },
      include: {
        contexts: true,
      },
    });
    let context = user?.contexts.map((context) => {
      return { role: context.role, content: context.content };
    });

    if (!user) {
      const createuser = await prisma.users.create({
        data: {
          discordID: message.author.id,
          name: message.author.username,
          contexts: {
            create: {
              content: `You give Very Calm awsners`,
              role: "system",
            },
          },
        },
        select: {
          discordID: true,
          contexts: { orderBy: [{ created: "asc" }] },
        },
      });
      context = createuser.contexts.map((context) => {
        return { role: context.role, content: context.content };
      });
    }
    context?.push({ role: "user", content: userMessage });

    const sendUsePromt = await prisma.contexts.create({
      data: {
        content: userMessage,
        role: `user`,
        userId: message.author.id,
      },
    });

    // messageAi.push({ role: "user", content: userMessage });
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo" /* @ts-expect-error */,
      messages: context,
    });
    const sendChatreply = await prisma.contexts.create({
      data: {
        content: completion.data.choices[0].message?.content!,
        role: completion.data.choices[0].message?.role!,
        userId: message.author.id,
      },
    });
    // messageAi.push(completion.data.choices[0].message!);
    message.reply(completion.data.choices[0].message);
    // console.log(messageAi);
  }
});
client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
  if (interaction.commandName === "quote") {
    const data = await axios({
      method: "Get",
      url: "https://api.api-ninjas.com/v1/quotes",
      headers: { "X-Api-Key": process.env.QUOTE },
    });
    interaction.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
  }
  if (interaction.commandName === "reset") {
    await prisma.users.delete({
      where: {
        discordID: interaction.user.id,
      },
    });
  }
  interaction.reply("Context Rested");
});
// Log in to Discord with your client's token
client.login(process.env.TOKEN);
