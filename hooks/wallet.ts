// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useEffect, useRef, useState } from 'react';

// const WS_URL = 'wss://api.vendcliq.com/wallets';

// interface WalletData {
//   walletId: number;
//   balance: string;
//   currency: string;
//   accountName: string;
//   accountNumbers: {
//     WEMA?: string;
//     [key: string]: string | undefined;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

// interface UseWalletWebSocketProps {
//   token: string | null;
//   onWalletUpdate: (wallet: WalletData) => void;
// }

// export const useWalletWebSocket = ({ token, onWalletUpdate }: UseWalletWebSocketProps) => {
//   const ws = useRef<WebSocket | null>(null);
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
//   const reconnectAttempts = useRef<number>(0);
//   const [isConnected, setIsConnected] = useState(false);

//   const maxReconnectAttempts = 5;
//   const baseReconnectDelay = 1000;

//   const connectWebSocket = (authToken: string) => {
//     try {
//       ws.current = new WebSocket(`${WS_URL}?token=${authToken}`);

//       ws.current.onopen = () => {
//         console.log('WebSocket connected');
//         setIsConnected(true);
//         reconnectAttempts.current = 0;

//         if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//           ws.current.send(JSON.stringify({ action: 'getWallet' }));
//         }
//       };

//       ws.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           const action = data.action;

//           switch (action) {
//             case 'getWallet':
//               if (data.data) {
//                 const formattedWalletData: WalletData = {
//                   walletId: data.data.walletId,
//                   balance: data.data.balance,
//                   currency: data.data.currency,
//                   accountName: data.data.accountName,
//                   accountNumbers: data.data.accountNumbers || {},
//                   createdAt: data.data.lastUpdated || new Date().toISOString(),
//                   updatedAt: data.data.lastUpdated || new Date().toISOString(),
//                 };
//                 onWalletUpdate(formattedWalletData);
//               }
//               break;

//             case 'balanceUpdate':
//               if (data.data) {
//                 const updatedWallet: Partial<WalletData> = {
//                   balance: data.data.balance,
//                   updatedAt: new Date().toISOString(),
//                 };
//                 onWalletUpdate(updatedWallet as WalletData);
//               }
//               break;

//             case 'transactionNotification':
//               // Refresh wallet to get latest balance
//               ws.current?.send(JSON.stringify({ action: 'getWallet' }));
//               break;

//             case 'connection':
//               ws.current?.send(JSON.stringify({ action: 'getWallet' }));
//               break;

//             default:
//               console.log('Unhandled WebSocket action:', action);
//           }
//         } catch (error) {
//           console.error('Failed to parse WebSocket message:', error);
//         }
//       };

//       ws.current.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setIsConnected(false);
//         attemptReconnect(authToken);
//       };

//       ws.current.onclose = () => {
//         console.log('WebSocket closed');
//         setIsConnected(false);
//         attemptReconnect(authToken);
//       };
//     } catch (error) {
//       console.error('Failed to create WebSocket:', error);
//       setIsConnected(false);
//       attemptReconnect(authToken);
//     }
//   };

//   const attemptReconnect = (authToken: string) => {
//     if (reconnectAttempts.current >= maxReconnectAttempts) {
//       console.error('Max WebSocket reconnection attempts reached');
//       return;
//     }

//     reconnectAttempts.current += 1;
//     const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts.current - 1);

//     console.log(
//       `Attempting WebSocket reconnect (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms`
//     );

//     if (reconnectTimeout.current) {
//       clearTimeout(reconnectTimeout.current);
//     }

//     reconnectTimeout.current = setTimeout(() => {
//       connectWebSocket(authToken);
//     }, delay);
//   };

//   const disconnect = () => {
//     if (reconnectTimeout.current) {
//       clearTimeout(reconnectTimeout.current);
//     }
//     ws.current?.close();
//     ws.current = null;
//     setIsConnected(false);
//   };

//   useEffect(() => {
//     if (!token) return;

//     connectWebSocket(token);

//     return () => {
//       disconnect();
//     };
//   }, [token]);

//   return { isConnected, disconnect };
// };