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
  try {
    //  Required the bot to bge @ed to reply or in a dm
    if (!message.mentions.has(client.user) && message.guild !== null) return;

    // Trims the message to remove the mention
    const userMessage = message.content.replace(/<@(.*?)>/, "").trim();

    // Only Replies to User Messages
    if (message.author.bot) return;
    //if the user types quote it will send a quote
    if (userMessage === "quote") {
      const data = await axios({
        method: "Get",
        url: "https://api.api-ninjas.com/v1/quotes",
        headers: { "X-Api-Key": process.env.QUOTE },
      });

      message.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
      return;
    } else {
      // anything else will be sent to the ai

      //Finds the user in the database and if they dont exist it will create them
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

      // if the user does not exist it will create them
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
      //Adds the user message to the context
      context?.push({ role: "user", content: userMessage });

      //creates the context in the database
      const sendUsePromt = await prisma.contexts.create({
        data: {
          content: userMessage,
          role: `user`,
          userId: message.author.id,
        },
      });

      // sends the context to the ai
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo" /* @ts-expect-error */,
        messages: context,
      });
      // store the ai response in the database
      const sendChatreply = await prisma.contexts.create({
        data: {
          content: completion.data.choices[0].message?.content!,
          role: completion.data.choices[0].message?.role!,
          userId: message.author.id,
        },
      });

      // sends the ai response to the user
      message.reply(completion.data.choices[0].message);
      // console.log(messageAi);
    }
  } catch (error: any) {
    console.log(error);
    message.reply(`There was an error`);
  }
});
client.on("interactionCreate", async (interaction: any) => {
  // If the interaction isn't a slash command, return
  if (!interaction.isCommand()) return;

  // If the command is "ping", reply with "Pong!"
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
  // If the command is "quote", reply with a Quote  from the api
  if (interaction.commandName === "quote") {
    const data = await axios({
      method: "Get",
      url: "https://api.api-ninjas.com/v1/quotes",
      headers: { "X-Api-Key": process.env.QUOTE },
    });
    interaction.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
  }
  // If the command is "reset", reset the context for the user and reply with "Context Rested"
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
