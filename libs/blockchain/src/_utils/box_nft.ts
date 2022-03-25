import { Chain } from '@prisma/client';
import { ethers } from 'ethers';
import { BOX_NFT_ABI } from './abi/box_nft_abi';
import { ETH } from './eth';

const _getContract = (chain: Chain, contract_address: string) => {
  return new ethers.Contract(
    contract_address,
    BOX_NFT_ABI,
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

export const BoxNft = {
  balanceOf: async (
    blockchain: any,
    contract_address: string,
    address: string,
  ) => {
    return _getContract(blockchain, contract_address).balanceOf(address);
  },
  ownerOf: async (
    blockchain: any,
    contract_address: string,
    tokenId: number,
  ) => {
    return _getContract(blockchain, contract_address).ownerOf(tokenId);
  },
  tokenURI: async (
    blockchain: any,
    contract_address: string,
    tokenId: number,
  ) => {
    return _getContract(blockchain, contract_address).tokenURI(tokenId);
  },
  setBaseURI: async (
    blockchain: any,
    contract_address: string,
    uri: string,
    prvKey: string,
  ) => {
    const contractWithSigner = _getContractSigner(
      blockchain,
      contract_address,
      prvKey,
    );
    const tx = await contractWithSigner.setBaseURI(uri);
    return tx.wait();
  },
  setupMinterRole: async (
    blockchain: any,
    contract_address: string,
    address: string,
    is_allowed: boolean,
    prvKey: string,
  ) => {
    const contractWithSigner = _getContractSigner(
      blockchain,
      contract_address,
      prvKey,
    );
    const tx = await contractWithSigner.setupMinterRole(address, is_allowed);
    return tx.wait();
  },
  getNftDetail: async (
    blockchain: any,
    contract_address: string,
    tokenId: number,
  ) => {
    return _getContract(blockchain, contract_address).getNftDetail(tokenId);
  },
  /***
   * @param prv_key private key of admin address or minter
   *  ***/
  buyBox: async (
    chain: Chain,
    contract_address: string,
    to_address: string,
    box_type_uid: string,
    quantity: number,
    prv_key: string,
  ): Promise<string> => {
    const contractWithSigner = _getContractSigner(
      chain,
      contract_address,
      prv_key,
    );
    const tx = await contractWithSigner.buyBox(
      to_address,
      box_type_uid,
      quantity,
      { gasLimit: 400000 },
    );
    // console.log('tx: ', tx);
    return tx;
    // return tx.wait();
  },
};
