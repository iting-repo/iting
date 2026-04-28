import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class ChatRealtimeService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(token) {
    if (this.client?.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8081';
        return new SockJS(`${API_BASE}/ws`);
      },
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });

    this.client.onConnect = () => {
      this.connected = true;
    };

    this.client.onStompError = () => {
      this.connected = false;
    };

    this.client.onWebSocketClose = () => {
      this.connected = false;
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.connected = false;
    this.subscriptions.clear();
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
    if (!destination || !key) {
      return;
    }

    this.ensureConnected(() => {
      if (this.subscriptions.has(key)) {
        this.subscriptions.get(key).unsubscribe();
      }

      const subscription = this.client.subscribe(destination, (message) => {
        try {
          handler(JSON.parse(message.body));
        } catch {
          handler(null);
        }
      });
      this.subscriptions.set(key, subscription);
    });
  }

  unsubscribe(key) {
    if (!key || !this.subscriptions.has(key)) {
      return;
    }
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
