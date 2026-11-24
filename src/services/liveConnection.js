// Conexão autenticada com heartbeat, reconexão e cancelamento.
export function setupSubscription({
  onMessage, getToken, clearAuth, path, field, id, onConnectionChange = () => {},
}) {
  const token = getToken();
  if (!token) return null;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}${path}`;
  let socket = null;
  let stopped = false;
  let reconnectTimer = null;
  let pingInterval = null;
  let watchdog = null;

  const clearTimers = () => {
    clearTimeout(reconnectTimer);
    clearInterval(pingInterval);
    clearTimeout(watchdog);
  };
  const connect = () => {
    if (stopped || getToken() !== token) return;
    try {
      socket = new WebSocket(wsUrl);
    } catch {
      onConnectionChange(false);
      reconnectTimer = setTimeout(connect, 2000);
      return;
    }
    const currentSocket = socket;
    currentSocket.onopen = () => {
      if (stopped || getToken() !== token) { currentSocket.close(); return; }
      currentSocket.send(JSON.stringify({ type: 'subscribe', [field]: id, token }));
      watchdog = setTimeout(() => currentSocket.close(), 10000);
    };
    currentSocket.onmessage = (event) => {
      if (stopped || getToken() !== token) return;
      let data;
      try { data = JSON.parse(event.data); } catch { currentSocket.close(); return; }
      if (data?.type === 'pong') { clearTimeout(watchdog); return; }
      if (data?.[field] !== id) return;
      if (data.type === 'READY') {
        clearTimeout(watchdog);
        clearInterval(pingInterval);
        onConnectionChange(true);
        pingInterval = setInterval(() => {
          if (currentSocket.readyState === WebSocket.OPEN) {
            currentSocket.send(JSON.stringify({ type: 'ping' }));
            watchdog = setTimeout(() => currentSocket.close(), 10000);
          }
        }, 20000);
      }
      onMessage?.(data);
    };
    currentSocket.onerror = () => currentSocket.close();
    currentSocket.onclose = (event) => {
      clearTimers();
      if (stopped || getToken() !== token) return;
      if (event.code === 1008) { stopped = true; clearAuth(); return; }
      onConnectionChange(false);
      // A nova mensagem READY faz o painel consultar eventos perdidos na queda.
      reconnectTimer = setTimeout(connect, 2000);
    };
  };
  connect();
  return {
    close() {
      stopped = true;
      clearTimers();
      if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
    }
  };
}
