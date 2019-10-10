import { BN } from 'web3-utils'

import { store } from '../index'
import * as actions from '../constants/actions'
import { setStateClaimableFunds } from './fundingActions'

// createToken

export const createToken = (networkClient, name, symbol, decimals) => ({
  type: actions.CREATE_TOKEN,
  payload: (async () => {

    // Create token
    const tx = await networkClient.createToken.send({
      name,
      symbol,
      decimals,
    })

    // Check unsuccessful
    if (!tx.successful) {

      // Throw failed transaction error
      throw Error ('Transaction Failed: ' + tx.meta.transaction.hash)

    }

    // Return token address
    return tx.meta.receipt.contractAddress

  })()
  .then(tokenAddress => {
    store.dispatch(setStateTokenAddress(tokenAddress))
    store.dispatch(createTokenSuccess(true))
  })
  .catch(error => {
    store.dispatch(createTokenError(error.message))
  }),
})

export const createTokenError = (error) => ({
  type: actions.CREATE_TOKEN_ERROR,
  payload: error,
})

export const createTokenSuccess = (success) => ({
  type: actions.CREATE_TOKEN_SUCCESS,
  payload: success,
})

// getToken

export const getToken = (colonyClient) => ({
  type: actions.GET_TOKEN,
  payload: (async () => {

    // Set token address
    const address = colonyClient.tokenClient.contract.address

    // Get token info
    const info = await colonyClient.tokenClient.getTokenInfo.call()

    // Get total supply
    const { amount } = await colonyClient.tokenClient.getTotalSupply.call()

    // Get token owner
    const owner = await colonyClient.tokenClient.contract.owner.call()

    // Format total supply
    const totalSupply = amount.toString()

    // return token
    return {
      address,
      owner,
      totalSupply,
      ...info,
    }

  })()
  .then(token => {
    store.dispatch(setStateToken(token))
    store.dispatch(getTokenSuccess(true))
  })
  .catch(error => {
    store.dispatch(getTokenError(error.message))
  }),
})

export const getTokenError = (error) => ({
  type: actions.GET_TOKEN_ERROR,
  payload: error,
})

export const getTokenSuccess = (success) => ({
  type: actions.GET_TOKEN_SUCCESS,
  payload: success,
})

// mintTokens

export const mintTokens = (colonyClient, amount) => ({
  type: actions.MINT_TOKENS,
  payload: (async () => {

    // Mint tokens
    const tx = await colonyClient.mintTokens.send({ amount: new BN(amount) })

    // Check unsuccessful
    if (!tx.successful) {

      // Throw failed transaction error
      throw Error ('Transaction Failed: ' + tx.meta.transaction.hash)

    }

    // Return successful
    return tx.successful

  })()
  .then(success => {
    store.dispatch(getToken(colonyClient))
    store.dispatch(setStateClaimableFunds(null))
    store.dispatch(mintTokensSuccess(success))
  })
  .catch(error => {
    store.dispatch(mintTokensError(error.message))
  }),
})

export const mintTokensError = (error) => ({
  type: actions.MINT_TOKENS_ERROR,
  payload: error,
})

export const mintTokensSuccess = (success) => ({
  type: actions.MINT_TOKENS_SUCCESS,
  payload: success,
})

// setTokenOwner

export const setTokenOwner = (colonyClient) => ({
  type: actions.SET_TOKEN_OWNER,
  payload: (async () => {

    // Set colony contract as token owner
    const tx = await colonyClient.tokenClient.setOwner.send({
      owner: colonyClient.contract.address,
    })

    // Check unsuccessful
    if (!tx.successful) {

      // Throw failed transaction error
      throw Error ('Transaction Failed: ' + tx.meta.transaction.hash)

    }

    // Return successful
    return tx.successful

  })()
  .then(success => {
    store.dispatch(getToken(colonyClient))
    store.dispatch(setTokenOwnerSuccess(success))
  })
  .catch(error => {
    store.dispatch(setTokenOwnerError(error.message))
  }),
})

export const setTokenOwnerError = (error) => ({
  type: actions.SET_TOKEN_OWNER_ERROR,
  payload: error,
})

export const setTokenOwnerSuccess = (success) => ({
  type: actions.SET_TOKEN_OWNER_SUCCESS,
  payload: success,
})

// setStateToken

export const setStateToken = (token) => ({
  type: actions.SET_STATE_TOKEN,
  payload: token,
})

// setStateTokenAddress

export const setStateTokenAddress = (tokenAddress) => ({
  type: actions.SET_STATE_TOKEN_ADDRESS,
  payload: tokenAddress,
})
