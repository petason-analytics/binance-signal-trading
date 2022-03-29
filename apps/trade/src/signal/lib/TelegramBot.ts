/**
 * ======= Telegram Bot ======
 * How to get chat_id: https://github.com/GabrielRF/telegram-id#web-channel-id
 */
import api from './Api'

export const TelegramChatIds = {
  MatrixBinomoBotChannelId: '-1001398087010',
  BOGamblingAIChannelId: '@BoGamblingBot_AI',
};

const devMode = process.env.NODE_ENV === 'development';
// console.log('{Telegram} devMode: ', devMode);

let TelegramEnable = !devMode;
let chatIds = [
  TelegramChatIds.MatrixBinomoBotChannelId,
];
let msgPrefix = '';
const defaultChatId = TelegramChatIds.BOGamblingAIChannelId;


export function setPrefix(str) {
  msgPrefix = str;
}
export function setEnable(enable) {
  TelegramEnable = enable;
}
export function getEnable(enable) {
  return enable;
}

export function setChatIds(ids) {
  if (ids.indexOf(defaultChatId) > -1) {
    chatIds = ids;
  } else {
    chatIds = [...ids, defaultChatId];
  }
}

export async function sendMessage(markDownFormatedMessage) {
  if (!TelegramEnable) {
    console.log('{Telegram_sendMessage} Message does not send: Telegram was not enabled');
    return;
  }

  if (chatIds.length === 0) {
    console.log('{Telegram_sendMessage} Message does not send: No target chatIds');
    return;
  }

  sendMessageToAllChatIds(markDownFormatedMessage);
}

async function sendMessageToAllChatIds(markDownFormatedMessage, tmpIdx = 0) {
  if (tmpIdx >= chatIds.length) {
    // stop
    return true;
  } else {
    // continue: send message to chatId at index
    const chatId = chatIds[tmpIdx];
    await sendMessageToChatId(chatId, markDownFormatedMessage);
    // Try to send to next chatId
    return sendMessageToAllChatIds(markDownFormatedMessage, tmpIdx + 1);
  }
}

export async function sendMessageToChatId(chatId, markDownFormatedMessage) {
  if (!TelegramEnable) {
    console.log('{Telegram_sendMessage} TelegramEnable: ', TelegramEnable);
    return;
  }

  if (!chatId) {
    console.log('{Telegram_sendMessage} chatId is empty');
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  return api.req({
    method: 'POST',
    url: `https://api.telegram.org/bot${token}/sendMessage`,
    data: {
      chat_id: chatId,
      text: msgPrefix + markDownFormatedMessage,
      parse_mode: 'Markdown',
    }
  });
}

/**
 * https://core.telegram.org/bots/api#setwebhook
 */
export function setWebhook() {
  // /setWebhook?url=https://2634a3ce.ngrok.io/telegramWebhook/<my_token>>
  // /getWebhookInfo
  // /deleteWebhook
  // /getUpdates?offset=1&timeout=30&allowed_updates=["message","channel_post"]
}

export function getUpdates(
  lastOffset,
  option: { token?: string } = {}
) {
  // /getUpdates?offset=11794587&timeout=30&allowed_updates=["message","channel_post"]
  const token = option.token ? option.token : process.env.TELEGRAM_BOT_TOKEN;
  return api.req({
    method: 'GET',
    url: `https://api.telegram.org/bot${token}/getUpdates`,
    params: {
      offset: lastOffset + 1,
      timeout: 30,
      // limit: 100, // Telegram set default to 100
      allowed_updates: ["message", "edited_message", "channel_post", "edited_channel_post"],
    },
    data: {},
    timeout: 60000,
  }).then((res: any) => {
    if (res.isApiServiceError) {
      return res;
    }

    return {
      code: null,
      data: res.data,
    };
  });
}
