import axios from "axios";
import {
  REST,
  Routes,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
dotenv.config();
const configuration = new Configuration({
  apiKey: process.env.CHATGPT,
});
const openai = new OpenAIApi(configuration);
// Create a new client instance
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

// const commands = [
//   {
//     name: "ping",
//     description: "Replies with Pong!",
//   },
//   {
//     name: "quote",
//     description: "Replies with Pong!",
//   },
// ];

// const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

// (async () => {
//   try {
//     console.log("Started refreshing application (/) commands.");

//     await rest.put(Routes.applicationCommands(`834820890926514176`), {
//       body: commands,
//     });

//     console.log("Successfully reloaded application (/) commands.");
//   } catch (error) {
//     console.error(error);
//   }
// })();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content === "quote") {
    const data = await axios({
      method: "Get",
      url: "https://api.api-ninjas.com/v1/quotes",
      headers: { "X-Api-Key": process.env.QUOTES },
    });

    console.log(message.content);
    message.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
    return;
  } else {
    messageAi.push({ role: "user", content: message.content });
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messageAi,
    });
    messageAi.push(completion.data.choices[0].message);
    message.reply(completion.data.choices[0].message);
    console.log(messageAi);
  }
});
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
  if (interaction.commandName === "quote") {
    const data = await axios({
      method: "Get",
      url: "https://api.api-ninjas.com/v1/quotes",
      headers: { "X-Api-Key": process.env.QUOTES },
    });
    interaction.reply(`${data.data[0].quote} \nauthor: ${data.data[0].author}`);
  }
});
// Log in to Discord with your client's token
client.login(process.env.TOKEN);
