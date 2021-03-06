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
export const ADD_OFFER = 'ADD_OFFER';
export const RESET_OFFERS = 'RESET_OFFERS';
export const SET_EXCHANGE_SEARCH_REQUEST = 'SET_EXCHANGE_SEARCH_REQUEST';
export const SET_EXECUTING_TRANSACTION = 'SET_EXECUTING_TRANSACTION';
export const SET_DISMISS_TRANSACTION = 'SET_DISMISS_TRANSACTION';
export const SET_EXCHANGE_ALLOWANCES = 'SET_EXCHANGE_ALLOWANCES';
export const ADD_EXCHANGE_ALLOWANCE = 'ADD_EXCHANGE_ALLOWANCE';
export const UPDATE_EXCHANGE_ALLOWANCE = 'UPDATE_EXCHANGE_ALLOWANCE';
export const SET_EXCHANGE_PROVIDERS_METADATA = 'SET_EXCHANGE_PROVIDERS_METADATA';
export const SET_EXCHANGE_SUPPORTED_ASSETS = 'SET_EXCHANGE_SUPPORTED_ASSETS';
export const SET_FIAT_EXCHANGE_SUPPORTED_ASSETS = 'SET_FIAT_EXCHANGE_SUPPORTED_ASSETS';

export const PROVIDER_SHAPESHIFT = 'SHAPESHIFT-SHIM';
export const PROVIDER_UNISWAP = 'UNISWAP-SHIM';
export const PROVIDER_ZEROX = 'ZEROX-SHIM';
export const PROVIDER_CHANGELLY = 'CHANGELLY-SHIM';
export const PROVIDER_MOONPAY = 'MoonPay';
export const PROVIDER_SENDWYRE = 'SendWyre';

export const ADD_CONNECTED_EXCHANGE_PROVIDER = 'ADD_CONNECTED_EXCHANGE_PROVIDER';
export const REMOVE_CONNECTED_EXCHANGE_PROVIDER = 'REMOVE_CONNECTED_EXCHANGE_PROVIDER';
export const SET_CONNECTED_EXCHANGE_PROVIDERS = 'SET_CONNECTED_EXCHANGE_PROVIDERS';

export const MARK_NOTIFICATION_SEEN = 'MARK_NOTIFICATION_SEEN';
export const MIN_MOONPAY_FIAT_VALUE = 20;

export const EXCHANGE = 'EXCHANGE';

export const SLOW = 'min';
export const NORMAL = 'avg';
export const FAST = 'max';
