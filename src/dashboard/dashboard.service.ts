import { Injectable } from '@nestjs/common';
import Web3 from 'web3';

@Injectable()
export class DashboardService {
  async checkServer(input: string) {
    try {
      const web3 = new Web3(input);
      const block = await web3.eth.getBlockNumber();
      return block.toString();
    } catch (e) {
      return 0;
    }
  }

  async checkAllServers() {
    // const bnbPrimaryAddress = 'http://135.181.137.87:8545';
    const bnbBackupAddress = 'http://51.81.243.57:8545';
    const bnbUrlAddress = 'https://bnb.apeswap.dev';
    const olaUrlAddress = 'https://ola.apeswap.dev';
    const bnbOfficialAddress = 'https://bsc-dataseed.binance.org/';

    const servers = [];
    const officialBlocks = [];

    // Check BNB Primary
    // const bnbPrimary = await this.checkServer(bnbPrimaryAddress);
    // servers.push({
    //   name: 'BNB Primary Erigon',
    //   address: bnbPrimaryAddress,
    //   chain: 56,
    //   block: Number(bnbPrimary),
    // });
    //
    // // Check BNB Backup
    const bnbBackup = await this.checkServer(bnbBackupAddress);
    servers.push({
      name: 'BNB Backup Erigon',
      address: bnbBackupAddress,
      chain: 56,
      block: Number(bnbBackup),
    });

    // const localTest = await this.checkServer(
    //   'http://localhost:3000/redirect/sdfdbshfbhsdjknds',
    // );
    // servers.push({
    //   name: 'Localhost Test',
    //   address: 'http://localhost:3000/redirect',
    //   chain: 137,
    //   block: Number(localTest),
    // });

    // Check BNB Url
    const bnbUrl = await this.checkServer(bnbUrlAddress);
    servers.push({
      name: 'bnb.apeswap.dev',
      address: bnbUrlAddress,
      chain: 56,
      block: Number(bnbUrl),
    });

    // Check Eth Url
    // const ethUrl = await this.checkServer(ethPrimaryAddress);
    // servers.push({
    //   name: 'ETH Primary Erigon',
    //   address: ethPrimaryAddress,
    //   chain: 1,
    //   block: Number(ethUrl),
    // });




    // Check Ola Url
    const olaUrl = await this.checkServer(olaUrlAddress);
    servers.push({
      name: 'ola.apeswap.dev',
      address: olaUrlAddress,
      chain: 56,
      block: Number(olaUrl),
    });

    // const noderealUrl = await this.checkServer(
    //   'https://bsc-mainnet.nodereal.io/v1/9fcbd5a5fa274851af3531f9d4a77ba9',
    // );
    // servers.push({
    //   name: 'Nodereal BNB',
    //   address: noderealUrl,
    //   chain: 56,
    //   block: Number(noderealUrl),
    // });

    /////////////////////////


    const bnbOfficial = await this.checkServer(bnbOfficialAddress);
    officialBlocks.push({
      name: 'BNB Official',
      address: bnbOfficialAddress,
      chain: 56,
      block: Number(bnbOfficial),
    });


    return {
      officialBlocks: officialBlocks,
      servers: servers.sort((a, b) => a.chain - b.chain),
    };
  }
}
