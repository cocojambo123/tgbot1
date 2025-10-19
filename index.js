const TelegramApi = require("node-telegram-bot-api");
const { gameOptions, againOptions } = require("./options");
const sequelize = require("./db");
const UserModel = require("./models");
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

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.log("Подключение к бд сломалось", error);
  }

  bot.setMyCommands([
    { command: "/start", description: "Начальное приветствие" },
    { command: "/info", description: "Получить информацию о пользователе" },
    { command: "/game", description: "Депнуть" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === "/start") {
        await UserModel.create({ chatId });
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
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Тебя зовут ${msg.from.first_name} в игре у тебя \n правильных ответов ${user.right}; \n не правильных ответов ${user.wrong};
          `
        );
      }
      if (text === "/game") {
        return startGame(chatId);
      }
      return bot.sendMessage(chatId, "Я тебя не понимаю");
    } catch (error) {
      return bot.sendMessage(chatId, `Ошибка ${error.message}`);
    }
  });

  bot.on("callback_query", async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === "/again") {
      return startGame(chatId);
    }
    const user = await UserModel.findOne({ chatId });
    if (Number(data) === chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `Поздравляю, ты отгадал цифру ${data}`,
        againOptions
      );
    } else {
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `Ты выбрал цифру ${data} - не верно, бот загадал ${chats[chatId]}`,
        againOptions
      );
    }
    await user.save();
  });
};

start();
