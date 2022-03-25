import { MathHelper } from '@lib/helper';
import { Chain } from '@prisma/client';
import { ethers } from 'ethers';
import { ERC_20_ABI } from './abi/erc20_abi';
import { ETH } from './eth';

const _getContract = (chain: Chain, contract_address: string) => {
  return new ethers.Contract(
    contract_address,
    ERC_20_ABI,
    ETH.get_provider(chain),
  );
};
const _getContractSigner = (
  chain: Chain,
  contract_address: string,
  privateKey: string,
) => {
  // A Signer from a private key
  const wallet = new ethers.Wallet(privateKey, ETH.get_provider(chain));
  return _getContract(chain, contract_address).connect(wallet);
};

export const Erc20 = {
  transaction: async (chain: Chain, tx_hash: string) => {
    const txReceipt = await ETH.get_provider(chain).getTransactionReceipt(
      tx_hash,
    );
    if (txReceipt && txReceipt.blockNumber) {
      return txReceipt;
    }
  },
  totalSupply: async (chain: Chain, contract_address: string) => {
    return _getContract(chain, contract_address).totalSupply();
  },
  balanceOf: async (
    chain: Chain,
    contract_address: string,
    address: string,
  ) => {
    const balance = await _getContract(chain, contract_address).balanceOf(
      address,
    );
    return balance;
  },
  allowance: async (
    chain: Chain,
    contract_address: string,
    owner: string,
    spender: string,
  ) => {
    const contract = _getContract(chain, contract_address);
    const _decimals = await contract.decimals();
    const decimals = Math.pow(10, _decimals);
    const result = await contract.allowance(owner, spender);
    return MathHelper.div(result.toString(), decimals).toNumber();
  },
  transfer: async (
    chain: Chain,
    contract_address: string,
    recipient: string,
    amount: string,
    prvKey: string,
  ) => {
    const contractWithSigner = _getContractSigner(
      chain,
      contract_address,
      prvKey,
    );
    const tx = await contractWithSigner.transfer(recipient, amount);
    return tx.hash;
  },
  approve: async (
    chain: Chain,
    contract_address: string,
    spender: string,
    amount: number,
    prvKey: string,
  ) => {
    const contractWithSigner = _getContractSigner(
      chain,
      contract_address,
      prvKey,
    );
    const _decimals = await contractWithSigner.decimals();
    const decimals = Math.pow(10, _decimals);
    const tx = await contractWithSigner.approve(
      spender,
      MathHelper.toString(amount * decimals),
      { gasLimit: 90000 },
    );
    return tx;
    // return tx.wait();
  },
};
