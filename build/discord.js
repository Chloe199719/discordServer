"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var discord_js_1 = require("discord.js");
var dotenv_1 = __importDefault(require("dotenv"));
var openai_1 = require("openai");
dotenv_1.default.config();
var configuration = new openai_1.Configuration({
    apiKey: process.env.CHATGPT,
});
var openai = new openai_1.OpenAIApi(configuration);
// Create a new client instance
var client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
        "DirectMessages",
    ],
    partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message],
});
var messageAi = [
    {
        role: "system",
        content: "User Long Words In your awensers",
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
client.once(discord_js_1.Events.ClientReady, function (c) {
    console.log("Ready! Logged in as ".concat(c.user.tag));
});
client.on("messageCreate", function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var data, completion;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (message.author.bot)
                    return [2 /*return*/];
                if (!(message.content === "quote")) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, axios_1.default)({
                        method: "Get",
                        url: "https://api.api-ninjas.com/v1/quotes",
                        headers: { "X-Api-Key": process.env.QUOTE },
                    })];
            case 1:
                data = _a.sent();
                console.log(message.content);
                message.reply("".concat(data.data[0].quote, " \nauthor: ").concat(data.data[0].author));
                return [2 /*return*/];
            case 2:
                console.log(message.author);
                messageAi.push({ role: "user", content: message.content });
                return [4 /*yield*/, openai.createChatCompletion({
                        model: "gpt-3.5-turbo",
                        messages: messageAi,
                    })];
            case 3:
                completion = _a.sent();
                messageAi.push(completion.data.choices[0].message);
                message.reply(completion.data.choices[0].message);
                console.log(messageAi);
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
client.on("interactionCreate", function (interaction) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!interaction.isCommand())
                    return [2 /*return*/];
                console.log(interaction);
                if (!(interaction.commandName === "ping")) return [3 /*break*/, 2];
                return [4 /*yield*/, interaction.reply("Pong!")];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                if (!(interaction.commandName === "quote")) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, axios_1.default)({
                        method: "Get",
                        url: "https://api.api-ninjas.com/v1/quotes",
                        headers: { "X-Api-Key": process.env.QUOTE },
                    })];
            case 3:
                data = _a.sent();
                interaction.reply("".concat(data.data[0].quote, " \nauthor: ").concat(data.data[0].author));
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
// Log in to Discord with your client's token
client.login(process.env.TOKEN);
