// Lazy-load @stomp/stompjs + sockjs-client để tránh:
// (1) phồng main bundle ~80KB cho guest user không cần websocket
// (2) sockjs đăng ký unload event listener ở module load → block bf-cache + ảnh hưởng Lighthouse
//
// API public giữ nguyên (connect/disconnect/subscribe/unsubscribe/send) — pending queue
// các call trước khi module load xong.
import { API_ORIGIN } from '../config';

class ChatRealtimeService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this._libsPromise = null;
    this._libs = null;
    this._pendingSubs = [];
  }

  _loadLibs() {
    if (this._libs) return Promise.resolve(this._libs);
    if (!this._libsPromise) {
      this._libsPromise = Promise.all([
        import(/* webpackChunkName: "vendor-stomp" */ '@stomp/stompjs'),
        import(/* webpackChunkName: "vendor-sockjs" */ 'sockjs-client'),
      ]).then(([stomp, sockjs]) => {
        this._libs = { Client: stomp.Client, SockJS: sockjs.default };
        return this._libs;
      });
    }
    return this._libsPromise;
  }

  connect(token) {
    if (this.client?.active) return;
    this._loadLibs().then(({ Client, SockJS }) => {
      if (this.client?.active) return;
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${API_ORIGIN}/ws`),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => { },
      });

      this.client.onConnect = () => {
        this.connected = true;
        const pending = this._pendingSubs.slice();
        this._pendingSubs = [];
        pending.forEach(({ destination, key, handler }) => this._doSubscribe(destination, key, handler));
      };
      this.client.onStompError = () => { this.connected = false; };
      this.client.onWebSocketClose = () => { this.connected = false; };
      this.client.activate();
    });
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.connected = false;
    this.subscriptions.clear();
    this._pendingSubs = [];
  }

  _doSubscribe(destination, key, handler) {
    if (!this.client) return;
    if (this.subscriptions.has(key)) {
      this.subscriptions.get(key).unsubscribe();
    }
    const subscription = this.client.subscribe(destination, (message) => {
      try { handler(JSON.parse(message.body)); }
      catch { handler(null); }
    });
    this.subscriptions.set(key, subscription);
  }

  ensureConnected(callback, retry = 0) {
    if (this.connected && this.client) {
      callback();
      return;
    }
    if (retry > 20) return;
    setTimeout(() => this.ensureConnected(callback, retry + 1), 250);
  }

  subscribe(destination, key, handler) {
    if (!destination || !key) return;
    if (this.connected && this.client) {
      this._doSubscribe(destination, key, handler);
      return;
    }
    // Lib chưa load xong hoặc chưa connect — queue lại, onConnect sẽ flush.
    this._pendingSubs.push({ destination, key, handler });
  }

  unsubscribe(key) {
    if (!key) return;
    this._pendingSubs = this._pendingSubs.filter((s) => s.key !== key);
    if (!this.subscriptions.has(key)) return;
    this.subscriptions.get(key).unsubscribe();
    this.subscriptions.delete(key);
  }

  send(destination, body) {
    this.ensureConnected(() => {
      this.client.publish({ destination, body: JSON.stringify(body) });
    });
  }
}

const chatRealtimeService = new ChatRealtimeService();

export default chatRealtimeService;
