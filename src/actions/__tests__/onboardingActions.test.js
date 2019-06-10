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
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ReduxAsyncQueue from 'redux-async-queue';
import {
  UPDATE_WALLET_STATE,
  GENERATE_ENCRYPTED_WALLET,
  GENERATING,
  ENCRYPTING,
  REGISTERING,
  DECRYPTED,
} from 'constants/walletConstants';
import { SET_INITIAL_ASSETS, UPDATE_ASSETS } from 'constants/assetsConstants';
import { UPDATE_CONTACTS } from 'constants/contactsConstants';
import { UPDATE_APP_SETTINGS } from 'constants/appSettingsConstants';
import { UPDATE_INVITATIONS } from 'constants/invitationsConstants';
import { UPDATE_RATES } from 'constants/ratesConstants';
import { UPDATE_USER, REGISTERED } from 'constants/userConstants';
import { UPDATE_ACCESS_TOKENS } from 'constants/accessTokensConstants';
import { UPDATE_OAUTH_TOKENS } from 'constants/oAuthConstants';
import { SET_HISTORY } from 'constants/historyConstants';
import { UPDATE_SESSION } from 'constants/sessionConstants';
import { ACCOUNT_TYPES, UPDATE_ACCOUNTS, ADD_ACCOUNT } from 'constants/accountsConstants';
import {
  SET_SMART_WALLET_ACCOUNTS,
  SET_SMART_WALLET_SDK_INIT,
  SET_SMART_WALLET_UPGRADE_STATUS,
  SMART_WALLET_UPGRADE_STATUSES,
} from 'constants/smartWalletConstants';
import { SET_COLLECTIBLES_TRANSACTION_HISTORY, UPDATE_COLLECTIBLES } from 'constants/collectiblesConstants';
import { initialAssets as mockInitialAssets } from 'fixtures/assets';
import { registerWalletAction } from 'actions/onboardingActions';
import * as connectionKeyActions from 'actions/connectionKeyPairActions';
import { transformAssetsToObject } from 'utils/assets';
import PillarSdk from 'services/api';
import Storage from 'services/storage';
import { WebSocket } from 'mock-socket';

global.WebSocket = WebSocket;

type SDK = {
  registerOnAuthServer: Function,
  fetchInitialAssets: Function,
  updateUser: Function,
  userInfo: Function,
};

const pillarSdk: SDK = new PillarSdk();
pillarSdk.registerOnAuthServer = jest.fn(() => ({
  userId: 1,
  walletId: 2,
  refreshToken: 'uniqueRefreshToken',
  accessToken: 'uniqueAccessToken',
}));
pillarSdk.updateUser = jest.fn(() => ({ username: 'snow', walletId: 2 }));
pillarSdk.userInfo = jest.fn(() => ({ username: 'snow', walletId: 2 }));
pillarSdk.fetchInitialAssets = jest.fn(() => transformAssetsToObject(mockInitialAssets));
const mockStore = configureMockStore([thunk.withExtraArgument(pillarSdk), ReduxAsyncQueue]);

const mockWallet: Object = {
  address: '0x9c',
};

const mockSmartWalletAccountApiData = {
  id: 123,
  address: 'publicAddress',
  deployMode: 'Unsecured',
  ensName: null,
  state: 'Created',
  nextState: null,
  updatedAt: '2019-05-10T07:15:09.000Z',
};

const mockSmartWalletAccount = {
  id: 'publicAddress',
  isActive: false,
  type: ACCOUNT_TYPES.SMART_WALLET,
  extra: mockSmartWalletAccountApiData,
};

const mockKeyBasedAccount = {
  id: mockWallet.address,
  isActive: true,
  type: ACCOUNT_TYPES.KEY_BASED,
  walletId: 2,
};

const mockImportedWallet: Object = {
  address: '0x9c',
  privateKey: '0x067D674A5D8D0DEBC0B02D4E5DB5166B3FA08384DCE50A574A0D0E370B4534F9',
  RNencrypt: () => Promise.resolve({ address: 'encry_pted' }),
};

const mockOnboarding: Object = {
  confirmedPin: '',
  importedWallet: null,
  mnemonic: {
    original: '',
    shuffled: '',
    wordsToValidate: [],
  },
  apiUser: { username: 'asd' },
  pin: '',
};

const mockBackupStatus: Object = {
  isImported: false,
  isBackedUp: false,
};

const storage = Storage.getInstance('db');

const mockExchangeRates = {
  ETH: {
    EUR: 624.21,
    GBP: 544.57,
    USD: 748.92,
  },
};

describe('Wallet actions', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });

  it(`should expect series of actions with payload to be dispatched 
  on registerWalletAction execution when wallet wasn't imported`, () => {
    store = mockStore({
      session: { data: { isSignalInitiated: false } },
      oAuthTokens: { data: {} },
      wallet: {
        onboarding: mockOnboarding,
        backupStatus: mockBackupStatus,
      },
      accounts: { data: [mockSmartWalletAccount] },
      featureFlags: { data: { SMART_WALLET_ENABLED: false } },
    });
    const expectedActions = [
      { type: UPDATE_ACCOUNTS, payload: [] },
      { type: UPDATE_CONTACTS, payload: [] },
      { type: UPDATE_INVITATIONS, payload: [] },
      { type: UPDATE_ASSETS, payload: {} },
      { type: UPDATE_APP_SETTINGS, payload: {} },
      { type: UPDATE_ACCESS_TOKENS, payload: [] },
      { type: SET_HISTORY, payload: {} },
      { type: UPDATE_COLLECTIBLES, payload: {} },
      { type: SET_COLLECTIBLES_TRANSACTION_HISTORY, payload: {} },
      { type: UPDATE_WALLET_STATE, payload: GENERATING },
      { type: UPDATE_WALLET_STATE, payload: ENCRYPTING },
      { type: GENERATE_ENCRYPTED_WALLET, payload: mockWallet },
      { type: UPDATE_WALLET_STATE, payload: REGISTERING },
      { type: UPDATE_OAUTH_TOKENS, payload: { accessToken: 'uniqueAccessToken', refreshToken: 'uniqueRefreshToken' } },
      { type: UPDATE_SESSION, payload: { fcmToken: '12x2342x212' } },
      { type: UPDATE_USER, payload: { state: REGISTERED, user: { username: 'snow', walletId: 2 } } },
      { type: UPDATE_SESSION, payload: { isSignalInitiated: true } },
      { type: ADD_ACCOUNT, payload: mockKeyBasedAccount },
      { type: UPDATE_RATES, payload: mockExchangeRates },
      { type: SET_INITIAL_ASSETS, payload: transformAssetsToObject(mockInitialAssets) },
      { type: UPDATE_WALLET_STATE, payload: DECRYPTED },
    ];

    // $FlowFixMe
    connectionKeyActions.updateConnectionKeyPairs = () => async () => Promise.resolve(true);

    return store.dispatch(registerWalletAction())
      .then(() => {
        const actualActions = store.getActions();
        expect(actualActions).toEqual(expectedActions);
      });
  });

  it(`should expect series of actions with payload to be dispatched 
  on registerWalletAction execution when wallet wasn't imported 
  and Smart Wallet feature enabled`, () => {
    store = mockStore({
      session: { data: { isSignalInitiated: false } },
      oAuthTokens: { data: {} },
      wallet: {
        onboarding: mockOnboarding,
        backupStatus: mockBackupStatus,
      },
      accounts: { data: [mockSmartWalletAccount] },
      featureFlags: { data: { SMART_WALLET_ENABLED: true } },
      smartWallet: { upgrade: { status: null } },
      assets: { data: {} },
    });
    const expectedActions = [
      { type: UPDATE_ACCOUNTS, payload: [] },
      { type: UPDATE_CONTACTS, payload: [] },
      { type: UPDATE_INVITATIONS, payload: [] },
      { type: UPDATE_ASSETS, payload: {} },
      { type: UPDATE_APP_SETTINGS, payload: {} },
      { type: UPDATE_ACCESS_TOKENS, payload: [] },
      { type: SET_HISTORY, payload: {} },
      { type: UPDATE_COLLECTIBLES, payload: {} },
      { type: SET_COLLECTIBLES_TRANSACTION_HISTORY, payload: {} },
      { type: UPDATE_WALLET_STATE, payload: GENERATING },
      { type: UPDATE_WALLET_STATE, payload: ENCRYPTING },
      { type: GENERATE_ENCRYPTED_WALLET, payload: mockWallet },
      { type: UPDATE_WALLET_STATE, payload: REGISTERING },
      { type: UPDATE_OAUTH_TOKENS, payload: { accessToken: 'uniqueAccessToken', refreshToken: 'uniqueRefreshToken' } },
      { type: UPDATE_SESSION, payload: { fcmToken: '12x2342x212' } },
      { type: UPDATE_USER, payload: { state: REGISTERED, user: { username: 'snow', walletId: 2 } } },
      { type: UPDATE_SESSION, payload: { isSignalInitiated: true } },
      { type: ADD_ACCOUNT, payload: mockKeyBasedAccount },
      { type: UPDATE_RATES, payload: mockExchangeRates },
      { type: SET_INITIAL_ASSETS, payload: transformAssetsToObject(mockInitialAssets) },
      { type: SET_SMART_WALLET_SDK_INIT, payload: true },
      { type: SET_SMART_WALLET_ACCOUNTS, payload: [mockSmartWalletAccountApiData] },
      { type: UPDATE_ACCOUNTS, payload: [mockSmartWalletAccount] },
      { type: UPDATE_ACCOUNTS, payload: [{ ...mockSmartWalletAccount, isActive: true }] },
      { type: SET_SMART_WALLET_UPGRADE_STATUS, payload: SMART_WALLET_UPGRADE_STATUSES.ACCOUNT_CREATED },
      { type: UPDATE_WALLET_STATE, payload: DECRYPTED },
    ];

    // $FlowFixMe
    connectionKeyActions.updateConnectionKeyPairs = () => async () => Promise.resolve(true);

    return store.dispatch(registerWalletAction())
      .then(() => {
        const actualActions = store.getActions();
        expect(actualActions).toEqual(expectedActions);
      });
  });

  it(`should expect series of actions with payload to be 
  dispatch on registerWalletAction execution when wallet was imported`, () => {
    store = mockStore({
      session: { data: { isSignalInitiated: false } },
      oAuthTokens: { data: {} },
      wallet: {
        onboarding: {
          ...mockOnboarding,
          importedWallet: mockImportedWallet,
        },
        backupStatus: mockBackupStatus,
      },
      featureFlags: { data: { SMART_WALLET_ENABLED: false } },
      assets: { data: {} },
    });
    const expectedActions = [
      { type: UPDATE_ACCOUNTS, payload: [] },
      { type: UPDATE_CONTACTS, payload: [] },
      { type: UPDATE_INVITATIONS, payload: [] },
      { type: UPDATE_ASSETS, payload: {} },
      { type: UPDATE_APP_SETTINGS, payload: {} },
      { type: UPDATE_ACCESS_TOKENS, payload: [] },
      { type: SET_HISTORY, payload: {} },
      { type: UPDATE_COLLECTIBLES, payload: {} },
      { type: SET_COLLECTIBLES_TRANSACTION_HISTORY, payload: {} },
      { type: UPDATE_WALLET_STATE, payload: ENCRYPTING },
      { type: GENERATE_ENCRYPTED_WALLET, payload: mockWallet },
      { type: UPDATE_WALLET_STATE, payload: REGISTERING },
      { type: UPDATE_OAUTH_TOKENS, payload: { accessToken: 'uniqueAccessToken', refreshToken: 'uniqueRefreshToken' } },
      { type: UPDATE_SESSION, payload: { fcmToken: '12x2342x212' } },
      { type: UPDATE_USER, payload: { state: REGISTERED, user: { username: 'snow', walletId: 2 } } },
      { type: UPDATE_SESSION, payload: { isSignalInitiated: true } },
      { type: ADD_ACCOUNT, payload: mockKeyBasedAccount },
      { type: UPDATE_RATES, payload: mockExchangeRates },
      { type: SET_INITIAL_ASSETS, payload: transformAssetsToObject(mockInitialAssets) },
      { type: UPDATE_WALLET_STATE, payload: DECRYPTED },
    ];

    return store.dispatch(registerWalletAction())
      .then(() => {
        const actualActions = store.getActions();
        expect(actualActions).toEqual(expectedActions);
      });
  });
});
