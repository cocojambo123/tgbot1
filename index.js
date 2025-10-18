const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");

const token = "8209656068:AAHN56sen0qNd35yenwYNlHS0FWg1EO6MWs";

const bot = new TelegramApi(token, { polling: true });

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    `Сейчас я загадаю цифру от 0 до 9, а ты должен угадать.`
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const start = () => {
  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию о пользователе" },
    { command: "/game", description: "Депнуть" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/256/1.webp"
      );
      return bot.sendMessage(
        chatId,
        `Привет, ${msg.chat.first_name}, добро пожаловать в бот`
      );
    }
    if (text === "/info") {
      return bot.sendMessage(chatId, JSON.stringify(msg));
    }
    if (text === "/game") {
      return startGame(chatId);
    }
    return bot.sendMessage(chatId, "Я тебя не понимаю");
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    console.log(chats);
    console.log(chatId);
    if (data === "/again") {
      return startGame(chatId);
    }
    if (Number(data) === chats[chatId]) {
      return bot.sendMessage(
        chatId,
        `Поздравляю, ты отгадал цифру ${data}`,
        againOptions
      );
    } else {
      bot.sendMessage(
        chatId,
        `Ты выбрал цифру ${data} - не верно, бот загадал ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
