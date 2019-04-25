// @flow
/*
    Pillar Wallet: the personal data locker
    Copyright (C) 2019 Stiftung Pillar Project

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
import WalletConnect from '@walletconnect/react-native';
import { NavigationActions } from 'react-navigation';
// import { NETWORK_PROVIDER } from 'react-native-dotenv';
import {
  WALLETCONNECT_SESSION_REQUEST,
  WALLETCONNECT_SESSION_APPROVED,
  WALLETCONNECT_SESSION_REJECTED,
  WALLETCONNECT_SESSION_DISCONNECTED,
  WALLETCONNECT_CALL_REQUEST,
  WALLETCONNECT_ERROR,
  SESSION_REQUEST_EVENT,
  CALL_REQUEST_EVENT,
  DISCONNECT_EVENT,
  SESSION_REQUEST_ERROR,
  CALL_REQUEST_ERROR,
  DISCONNECT_ERROR,
} from 'constants/walletConnectConstants';
import { WALLETCONNECT_SESSION_REQUEST_SCREEN, WALLETCONNECT_CALL_REQUEST_SCREEN } from 'constants/navigationConstants';
// import type { JsonRpcRequest } from 'models/JsonRpc';
import { navigate } from 'services/navigation';
// import { saveDbAction } from './dbActions';

const getNativeOptions = async () => {
  // const language = DEVICE_LANGUAGE.replace(/[-_](\w?)+/gi, "").toLowerCase();
  // const token = await getFCMToken();

  const nativeOptions = {
    clientMeta: {
      name: 'Pillar Wallet ',
      description: 'Social. Secure. Intuitive.',
      url: 'https://pillarproject.io/wallet',
      icons: [
        'https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/8c/36/c7/8c36c7d5-0698-97b5-13b2-a51564706cf5/AppIcon-1x_U007emarketing-85-220-0-6.png/460x0w.jpg',
      ],
    },
    // push: {
    //   url: "https://push.pillarproject.io",
    //   type: "fcm",
    //   token: token,
    //   peerMeta: true,
    //   language: language
    // }
  };

  return nativeOptions;
};

export const onWalletConnectCallRequest = (peerId: string, payload: Object) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { connectors } = getState().walletConnect;

      const matchingConnectors = connectors.filter(c => c.peerId === peerId);

      if (matchingConnectors && matchingConnectors.length) {
        const connector = matchingConnectors[0];

        const { requests } = getState().walletConnect;

        const request = {
          peerId: connector.peerId,
          peerMeta: connector.peerMeta,
          payload,
        };

        const newPending = [...requests, request];

        dispatch({
          type: WALLETCONNECT_CALL_REQUEST,
          payload: newPending,
        });

        navigate(
          NavigationActions.navigate({
            routeName: WALLETCONNECT_CALL_REQUEST_SCREEN,
            params: request,
          }),
        );
      } else {
        dispatch({
          type: WALLETCONNECT_ERROR,
          payload: {
            code: SESSION_REQUEST_ERROR,
            message: 'No Matching WalletConnect Requests Found',
          },
        });
      }
    } catch (error) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: error.toString(),
        },
      });
    }
  };
};

export const onWalletConnectDisconnect = (peerId: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { connectors } = getState().walletConnect;

      const newConnectors = connectors.filter(c => c !== peerId);

      dispatch({
        type: WALLETCONNECT_SESSION_DISCONNECTED,
        payload: newConnectors,
      });
    } catch (error) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: error.toString(),
        },
      });
    }
  };
};

export const onWalletConnectSubscribeToEvents = (peerId: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { connectors } = getState().walletConnect;

      const matchingConnectors = connectors.filter(c => c.peerId === peerId);

      if (matchingConnectors && matchingConnectors.length) {
        const connector = matchingConnectors[0];

        connector.on(CALL_REQUEST_EVENT, (error: any, payload: any) => {
          if (error) {
            dispatch({
              type: WALLETCONNECT_ERROR,
              payload: {
                code: CALL_REQUEST_ERROR,
                message: error.toString(),
              },
            });
          }
          dispatch(onWalletConnectCallRequest(peerId, payload));
        });

        connector.on(DISCONNECT_EVENT, (error: any) => {
          if (error) {
            dispatch({
              type: WALLETCONNECT_ERROR,
              payload: {
                code: DISCONNECT_ERROR,
                message: error.toString(),
              },
            });
          }
          dispatch(onWalletConnectDisconnect(peerId));
        });
      } else {
        dispatch({
          type: WALLETCONNECT_ERROR,
          payload: {
            code: SESSION_REQUEST_ERROR,
            message: 'No Matching WalletConnect Requests Found',
          },
        });
      }
    } catch (error) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: error.toString(),
        },
      });
    }
  };
};

export const onWalletConnectSessionRequest = (uri: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { pending } = getState().walletConnect;

      const nativeOptions = await getNativeOptions();

      const connector = new WalletConnect({ uri }, nativeOptions);

      if (pending && pending.length) {
        const matchingPending = pending.filter(c => c.peerId === connector.peerId);

        if (matchingPending && matchingPending.length) {
          return;
        }
      }

      const newPending = [...pending, connector];

      dispatch({ type: WALLETCONNECT_SESSION_REQUEST, payload: newPending });

      connector.on(SESSION_REQUEST_EVENT, (error: any, payload: any) => {
        if (error) {
          dispatch({
            type: WALLETCONNECT_ERROR,
            payload: {
              code: SESSION_REQUEST_ERROR,
              message: error.toString(),
            },
          });
        }
        const { peerId, peerMeta } = payload.params[0];

        navigate(
          NavigationActions.navigate({ routeName: WALLETCONNECT_SESSION_REQUEST_SCREEN, params: { peerId, peerMeta } }),
        );
      });
    } catch (e) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: e.toString(),
        },
      });
    }
  };
};

export const onWalletConnectSessionApproval = (peerId: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { pending, connectors } = getState().walletConnect;

      const matchingPending = pending.filter(c => c.peerId === peerId);

      if (matchingPending && matchingPending.length) {
        const connector = matchingPending[0];

        const { data } = getState().wallet;

        connector.approveSession({
          accounts: [data.address],
          chainId: 3,
        });

        const newPending = pending.filter(c => c.peerId !== peerId);
        const newConnectors = [...connectors, connector];

        dispatch({
          type: WALLETCONNECT_SESSION_APPROVED,
          payload: {
            pending: newPending,
            connectors: newConnectors,
          },
        });

        dispatch(onWalletConnectSubscribeToEvents(peerId));
      } else {
        dispatch({
          type: WALLETCONNECT_ERROR,
          payload: {
            code: SESSION_REQUEST_ERROR,
            message: 'No Matching WalletConnect Requests Found',
          },
        });
      }
    } catch (e) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: e.toString(),
        },
      });
    }
  };
};

export const onWalletConnectSessionRejection = (peerId: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    try {
      const { pending } = getState().walletConnect;

      const matchingPending = pending.filter(c => c.peerId === peerId);

      if (matchingPending && matchingPending.length) {
        const connector = matchingPending[0];

        connector.rejectSession();

        const newPending = pending.filter(c => c.peerId !== peerId);

        dispatch({
          type: WALLETCONNECT_SESSION_REJECTED,
          payload: newPending,
        });
      } else {
        dispatch({
          type: WALLETCONNECT_ERROR,
          payload: {
            code: SESSION_REQUEST_ERROR,
            message: 'No Matching WalletConnect Requests Found',
          },
        });
      }
    } catch (e) {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: SESSION_REQUEST_ERROR,
          message: e.toString(),
        },
      });
    }
  };
};

export const onWalletConnectRejectCallRequest = (peerId: string, callId: string, error?: string) => {
  return async (dispatch: Function, getState: () => Object) => {
    const { connectors } = getState().walletConnect;

    const matchingConnectors = connectors.filter(c => c.peerId === peerId);

    if (matchingConnectors && matchingConnectors.length) {
      const connector = matchingConnectors[0];

      connector.rejectRequest({ id: callId, error: error || null });
    } else {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: CALL_REQUEST_ERROR,
          message: 'No Matching WalletConnect Connectors Found',
        },
      });
    }
  };
};

// export const onWalletConnectHandleTransactionRequest = (
//   peerId: String,
//   callId: string,
//   wallet: Object,
//   payload: JsonRpcRequest,
// ) => {
//   return async (dispatch: Function, getState: () => Object) => {
//     let nonce;

//     console.log('payload', payload)

//     const { to, note } = transaction;

//     const {
//       txCount: {
//         data: { lastNonce },
//       },
//     } = getState();

//     wallet.provider = providers.getDefaultProvider(NETWORK_PROVIDER);
//     const transactionCount = await wallet.provider.getTransactionCount(wallet.address, 'pending');

//     if (lastNonce === transactionCount && lastNonce > 0) {
//       nonce = lastNonce + 1;
//     }

//     const {
//       to, wallet, gasPrice, gasLimit, amount, nonce,
//     } = options;
//     const trx = {
//       gasLimit,
//       gasPrice: utils.bigNumberify(gasPrice),
//       value: utils.parseEther(amount.toString()),
//       to,
//       nonce,
//     };
//     wallet.provider = providers.getDefaultProvider(PROVIDER);
//     return wallet.sendTransaction(trx);

//     const result = null;

//     dispatch(onWalletConnectApproveCallRequest(peerId, callId, result));
//   };
// };

export const onWalletConnectApproveCallRequest = (peerId: string, callId: string, result: any) => {
  return async (dispatch: Function, getState: () => Object) => {
    if (!result) {
      dispatch(onWalletConnectRejectCallRequest(peerId, callId));
    }

    const { connectors } = getState().walletConnect;

    const matchingConnectors = connectors.filter(c => c.peerId === peerId);

    if (matchingConnectors && matchingConnectors.length) {
      const connector = matchingConnectors[0];

      connector.approveRequest({ id: callId, result });
    } else {
      dispatch({
        type: WALLETCONNECT_ERROR,
        payload: {
          code: CALL_REQUEST_ERROR,
          message: 'No Matching WalletConnect Connectors Found',
        },
      });
    }
  };
};
