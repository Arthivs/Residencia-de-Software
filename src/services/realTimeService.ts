// frontend/src/services/realTimeService.ts - VERSÃO COMPLETA REVISADA
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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // CORREÇÃO: Retornar URL direto (Socket.IO usa a URL HTTP/HTTPS)
  private getSocketUrl(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  // Conectar ao WebSocket
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('✅ WebSocket já conectado');
      return;
    }

    if (this.isConnecting && this.connectionPromise) {
      console.log('⏳ WebSocket já está conectando...');
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const token = authService.getToken();
        if (!token) {
          console.warn('⚠️ Usuário não autenticado. Conexão WebSocket adiada.');
          this.isConnecting = false;
          resolve();
          return;
        }

        // Fecha conexão anterior se existir
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        const socketUrl = this.getSocketUrl();
        console.log('🔌 Conectando ao WebSocket:', socketUrl);
        
        // CORREÇÃO: Configuração simplificada
        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        this.setupEventListeners();

        // Timeout para conexão
        const timeout = setTimeout(() => {
          if (!this.socket?.connected) {
            console.error('⏱️ Timeout na conexão WebSocket');
            this.isConnecting = false;
            reject(new Error('Timeout na conexão WebSocket'));
          }
        }, 10000);

        // Evento de conexão estabelecida
        this.socket.once('connect', () => {
          clearTimeout(timeout);
          console.log('✅ Conectado ao WebSocket com sucesso!');
          
          // CORREÇÃO IMPORTANTE: Autenticar após conectar
          this.authenticate(token);
          
          this.isConnecting = false;
          this.hasConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          this.reconnectAttempts++;
          console.error(`❌ Erro de conexão WebSocket (tentativa ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error.message);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('🚫 Máximo de tentativas de reconexão atingido');
            this.isConnecting = false;
            reject(error);
          } else {
            // Tentar reconectar automaticamente
            setTimeout(() => {
              if (!this.socket?.connected) {
                this.connect().then(resolve).catch(reject);
              }
            }, 2000);
          }
        });

      } catch (error) {
        console.error('❌ Erro ao conectar WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // CORREÇÃO: Método para autenticar no WebSocket
  private authenticate(token: string): void {
    if (!this.socket) return;
    
    console.log('🔐 Autenticando no WebSocket...');
    this.socket.emit('authenticate', token);
    
    // Configurar listener para resposta de autenticação
    this.socket.once('authenticated', (data: any) => {
      console.log('✅ Autenticado no WebSocket:', data.user?.email);
    });
    
    this.socket.once('auth_error', (error: any) => {
      console.error('❌ Erro de autenticação WebSocket:', error);
      // Desconectar se falhar autenticação
      this.disconnect();
    });
  }

  // Configurar listeners do WebSocket
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Evento de desconexão
    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Desconectado do WebSocket:', reason);
      this.hasConnected = false;
      
      // Tentar reconexão apenas se foi desconectado inesperadamente
      if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
        console.log('🔄 Tentando reconectar em 5 segundos...');
        setTimeout(() => {
          if (authService.isAuthenticated()) {
            this.connect();
          }
        }, 5000);
      }
    });

    // Eventos específicos do sistema - CORREÇÃO: Usar once para evitar duplicados
    const events = [
      'tarefa:criada',
      'tarefa:atualizada',
      'tarefa:excluida',
      'financeiro:criado',
      'financeiro:excluido',
      'acao:criada',
      'acao:atualizada',
      'acao:excluida',
      'dashboard:atualizar',
      'test_event',
      'test_response'
    ];

    events.forEach(event => {
      // Limpar listener anterior se existir
      this.socket?.off(event);
      
      // Adicionar novo listener
      this.socket?.on(event, (data: any) => {
        console.log(`📡 Evento recebido: ${event}`, data);
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
    this.reconnectAttempts = 0;
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

    console.log(`📡 Processando evento: ${type}`);

    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`❌ Erro no handler do evento ${type}:`, error);
      }
    });
  }

  // Testar conexão WebSocket
  async testConnection(): Promise<boolean> {
    try {
      if (!this.socket?.connected) {
        await this.connect();
      }
      
      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }
        
        const timeout = setTimeout(() => {
          resolve(false);
        }, 5000);
        
        this.socket.emit('test', { message: 'Teste de conexão' });
        
        this.socket.once('test_response', (data: any) => {
          clearTimeout(timeout);
          console.log('✅ Resposta de teste:', data);
          resolve(true);
        });
      });
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      return false;
    }
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
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      hasConnected: this.hasConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instância única do serviço
export const realTimeService = new RealTimeService();