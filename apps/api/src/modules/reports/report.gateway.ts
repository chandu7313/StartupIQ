import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface ReportData {
  [key: string]: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ReportGateway {
  @WebSocketServer()
  server: Server;

  // Expected payload: { reportId: string }
  @SubscribeMessage('join_report')
  handleJoinReport(@ConnectedSocket() client: Socket, @MessageBody() data: { reportId: string }): void {
    if (!data?.reportId) return;
    
    // NOTE: Auth token validation can be extracted from client.handshake.auth.token
    // In production, verify the user owns the reportId before joining.
    const token = client.handshake.auth?.token;
    if (token) {
      // Validate JWT here...
    }

    client.join(`report:${data.reportId}`);
    console.log(`[Socket] Client ${client.id} joined room report:${data.reportId}`);
  }

  emitQueued(reportId: string, position: number, estimatedWait: string) {
    this.server.to(`report:${reportId}`).emit('report:queued', { reportId, position, estimatedWait });
  }

  emitStarted(reportId: string, startedAt: string) {
    this.server.to(`report:${reportId}`).emit('report:started', { reportId, startedAt });
  }

  // Stages: "market_analysis" | "competitor_scan" | "product_strategy" | "vc_review" | "finalizing"
  emitProgress(reportId: string, stage: string, percent: number, data?: { message: string, data?: any }) {
    this.server.to(`report:${reportId}`).emit('report:progress', {
      reportId,
      stage,
      percent,
      message: data?.message || '',
    });
  }

  emitCompleted(reportId: string, report: ReportData) {
    this.server.to(`report:${reportId}`).emit('report:completed', { reportId, report });
  }

  emitFailed(reportId: string, error: string) {
    this.server.to(`report:${reportId}`).emit('report:failed', { reportId, error });
  }
}
