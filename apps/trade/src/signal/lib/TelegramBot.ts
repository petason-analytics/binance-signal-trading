/**
 * ======= Telegram Bot ======
 * How to get chat_id: https://github.com/GabrielRF/telegram-id#web-channel-id
 */
import api from "./Api";

export const TelegramChatIds = {
  MatrixBinomoBotChannelId: '-1001398087010',
  BOGamblingAIChannelId: '@BoGamblingBot_AI',
};

const isDevMode = () => process.env.NODE_ENV === 'development';


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


export enum TlMsgType {
  'Text' = 'Text',
  'Code' = 'Code',
  'Bold' = 'Bold',
}

export type TelegramString = {
  text: string,
  type: TlMsgType,
}

export class TelegramChat {
  botToken: string
  chatId: any
  msgPrefix: string

  constructor(botToken, chatId: any, msgPrefix: string = '') {
    this.chatId = chatId
    this.botToken = botToken
    this.msgPrefix = msgPrefix
  }

  async log(markDownFormattedMessage: string) {
    return this.send([{ text: markDownFormattedMessage, type: TlMsgType.Text }]);
  }

  async warn(markDownFormattedMessage: string) {
    return this.send([{ text: markDownFormattedMessage, type: TlMsgType.Text }], "Warn: ");
  }

  async error(markDownFormattedMessage: string) {
    return this.send([{ text: markDownFormattedMessage, type: TlMsgType.Text }], "Error: ");
  }

  async send(strings: TelegramString[], prefix: string = '') {
    const { chatId, botToken, msgPrefix } = this;

    if (!chatId) {
      console.log('{Telegram_sendMessage} chatId is empty');
      return;
    }

    return api.req({
      method: "POST",
      url: `https://api.telegram.org/bot${botToken}/sendMessage`,
      data: {
        chat_id: chatId,
        text: msgPrefix + prefix + this.toMessage(strings),
        parse_mode: "MarkdownV2"
      }
    })
      .then((r: any) => {
        if (isDevMode() && r.code) {
          console.error("TelegramError: " + JSON.stringify(r.data.data));
        }

        return r;
      });
  }


  private toMessage(strings: TelegramString[]): string {
    let markDownV2 = ''
    for (let i = 0, c = strings.length; i < c; i++) {
      const msg = strings[i];

      switch (msg.type) {
        case TlMsgType.Text:
          markDownV2 += this.escape_text(msg.text)
          break;
        case TlMsgType.Bold:
          markDownV2 += this.bold(msg.text)
          break;
        case TlMsgType.Code:
          markDownV2 += this.code_block(msg.text)
          break;
        default:
          throw new Error("Invalid string type: " + msg);
      }
    }

    return markDownV2
  }

  /**
   * https://core.telegram.org/bots/api#markdownv2-style
   */
  private escape_text(s: string): string {
    // '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
    s = s
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/\[/g, '\\[')
      .replace(/]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/~/g, '\\~')
      .replace(/`/g, '\\`')
      .replace(/>/g, '\\>')
      .replace(/#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/-/g, '\\-')
      .replace(/=/g, '\\=')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\./g, '\\.')
      .replace(/!/g, '\\!')
    ;
    return s
  }

  private bold(s: string): string {
    return `**${this.escape_text(s)}**`;
  }

  public code_block(unsafeString: string): string {
    unsafeString = unsafeString
      .replace(/\\/g, '\\')
      .replace(/`/g, '\`')
    ;
    return "\n```" + unsafeString + "```\n";
  }
}
