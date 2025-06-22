import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url: string) => {
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const webSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!url) return;

        const ws = new WebSocket(url);
        webSocketRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setLastMessage(message);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Cleanup on component unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [url]);

    return { lastMessage, isConnected };
};

export default useWebSocket; 