// socket-client.ts
import * as WebSocket from 'ws';
import { clearTimeout } from 'timers';

type WsClientOption = {
  onConnected: () => void;
  // eslint-disable-next-line no-unused-vars
  onMessage: (message: any) => void;
  onClose?: () => void;

  clientPing?: () => void;
  clientPingInterval?: number;

  logger?: any;
};

export class WsClient {
  // wss://echo.websocket.org is a test websocket server
  public ws: WebSocket;

  private closeTimeout: NodeJS.Timeout;
  private pingTimeout: NodeJS.Timeout;
  private logger = console;
  private url: string;
  private opt;

  constructor(url: string, opt: WsClientOption) {
    this.url = url;
    this.opt = opt;
    if (opt.logger) {
      this.logger = opt.logger;
    }

    this.init();
  }

  init() {
    const url = this.url;
    const opt = this.opt;

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.logger.debug('{WSService.init} open');
      opt.clientPing && this.heartbeatOnServerResponse();
      this.onConnected();
      opt.onConnected && opt.onConnected();
    });

    // binance is `ping frame` `pong frame`
    this.ws.on('ping frame', () => {
      this.logger.debug('{WSService.init} ping');
      opt.clientPing && this.heartbeatOnServerResponse();

      // Shit code For binance only, plz make this modular later
      // https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
      this.send('pong frame');
    });

    this.ws.on('pong', () => {
      this.logger.debug('{WSService.init} pong');
      opt.clientPing && this.heartbeatOnServerResponse();
    });

    this.ws.on('message', (message: MessageEvent) => {
      opt.clientPing && this.heartbeatOnServerResponse();
      this.onMessage(message);
    });

    // eslint-disable-next-line no-unused-vars
    this.ws.on('error', (e) => {
      this.logger.debug('{WSService.error} ', e);
      this.ws.close();
      clearTimeout(this.closeTimeout);
    });

    // eslint-disable-next-line no-unused-vars
    this.ws.on('close', (ev) => {
      this.logger.debug('{WSService.init} close');
      this.opt.onClose && this.opt.onClose();
      // delay 10s then reconnect
      setTimeout(() => {
        this.reConnect();
      }, 15000);
    });

    // this.logger.log('{init} this.ws: ', this.ws);
  }

  reConnect() {
    this.logger.warn('{WSService.reConnect} readyState: ', this.ws.readyState);
    this.init();
  }

  // heartbeat
  heartbeatOnServerResponse() {
    // ==> Some server require client ping, but binance server will ping client
    this.pingServerAfter(this.opt.clientPingInterval ?? 10000);

    // Use `WebSocket#terminate()`, which immediately destroys the connection,
    // instead of `WebSocket#close()`, which waits for the close timer.
    // Delay should be equal to the interval at which your server
    // sends out pings plus a conservative assumption of the latency.
    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      // this.ws.terminate();
      this.ws.close();
    }, 60000 + 1000);
  }

  pingServerAfter(ms: number) {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      this.opt.clientPing && this.opt.clientPing();
    }, ms);
  }

  isReady() {
    return this.ws.readyState === WebSocket.OPEN;
  }

  onConnected() {
    this.logger.log('{WSService} opened');
  }

  /**
   * @param data
   * @throws Error
   */
  send(data: any) {
    if (this.isReady()) {
      return this.ws.send(data);
    } else {
      throw new Error("Connection haven't ready, plz try again");
    }
  }

  /**
   * @param data
   * @throws Error
   */
  sendObject(data: any) {
    return this.send(JSON.stringify(data));
  }

  onMessage(message: any) {
    // this.logger.log('{WSService.onMessage} message: ', message);
    this.opt.onMessage && this.opt.onMessage(message);
  }
}
