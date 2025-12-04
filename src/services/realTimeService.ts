// frontend/src/services/realTimeService.ts - VERSÃO CORRIGIDA SEM RECONEXÕES CONSTANTES
import { io, Socket } from 'socket.io-client';
import { authService } from './authService';

export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface EventHandler {
  (event: RealTimeEvent): void;
}

class RealTimeService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private isConnecting: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private hasConnected = false;

  // URL do WebSocket
  private getSocketUrl(): string {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return apiUrl;
  }

  // Conectar ao WebSocket APENAS UMA VEZ
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = authService.getToken();
        if (!token) {
          console.warn('Usuário não autenticado. Conexão WebSocket adiada.');
          this.isConnecting = false;
          resolve();
          return;
        }

        // Fecha conexão anterior se existir
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        console.log('🔌 Conectando ao WebSocket...');
        this.socket = io(this.getSocketUrl(), {
          transports: ['websocket', 'polling'],
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          timeout: 20000
        });

        this.setupEventListeners();

        // Timeout para conexão
        const timeout = setTimeout(() => {
          if (!this.socket?.connected) {
            console.error('Timeout na conexão WebSocket');
            this.isConnecting = false;
            reject(new Error('Timeout na conexão WebSocket'));
          }
        }, 5000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('✅ Conectado ao WebSocket');
          this.isConnecting = false;
          this.hasConnected = true;
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          console.error('❌ Erro de conexão WebSocket:', error.message);
          this.isConnecting = false;
          reject(error);
        });

      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Configurar listeners do WebSocket
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('authenticated', (data: any) => {
      console.log('✅ Autenticado no WebSocket:', data.user?.email);
    });

    this.socket.on('auth_error', (error: any) => {
      console.error('Erro de autenticação WebSocket:', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Desconectado do WebSocket:', reason);
      this.hasConnected = false;
      
      // Tentar reconexão apenas se foi desconectado inesperadamente
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setTimeout(() => {
          if (authService.isAuthenticated()) {
            console.log('🔄 Tentando reconectar...');
            this.connect();
          }
        }, 5000);
      }
    });

    // Eventos específicos do sistema
    const events = [
      'tarefa:criada',
      'tarefa:atualizada',
      'tarefa:excluida',
      'financeiro:criado',
      'financeiro:excluido',
      'acao:criada',
      'acao:atualizada',
      'acao:excluida',
      'dashboard:atualizar'
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        this.emitEvent(event, data);
      });
    });
  }

  // Desconectar
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.hasConnected = false;
    this.connectionPromise = null;
  }

  // Registrar handler para evento
  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    const handlers = this.eventHandlers.get(event)!;
    handlers.push(handler);

    // Retorna função para remover handler
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }

  // Emitir evento para handlers registrados
  private emitEvent(type: string, data: any): void {
    const event: RealTimeEvent = {
      type,
      data,
      timestamp: new Date()
    };

    console.log(`📡 Evento: ${type}`);

    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Erro no handler do evento ${type}:`, error);
      }
    });
  }

  // Verificar se está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Obter status da conexão
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    hasConnected: boolean;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      hasConnected: this.hasConnected
    };
  }
}

// Instância única do serviço
export const realTimeService = new RealTimeService();