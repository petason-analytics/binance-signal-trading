import { Chain } from '@prisma/client';
import { ethers } from 'ethers';

const providers: any = {};

const get_provider = (chain: Chain) => {
  if (!providers[chain.symbol]) {
    providers[chain.symbol] = new ethers.providers.JsonRpcProvider(
      chain.rpc_url,
      { name: chain.symbol, chainId: chain.chain_id },
    );
  }
  return providers[chain.symbol];
};
export const ETH = {
  get_provider: (blockchain: Chain) => {
    return get_provider(blockchain);
  },
  block_number: async (blockchain: Chain) => {
    return get_provider(blockchain).getBlockNumber();
  },
  get_logs: async (
    blockchain: Chain,
    from: number,
    to: number,
    address: string,
    topic?: string,
  ) => {
    const req: any = {
      address: address,
      fromBlock: from,
      toBlock: to,
    };
    if (topic) req.topic = topic;
    // console.log(req)
    return get_provider(blockchain).getLogs(req);
  },
};
