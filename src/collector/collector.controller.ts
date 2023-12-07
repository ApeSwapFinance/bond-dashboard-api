import { Controller, Get, Param } from '@nestjs/common';
import { CollectorService } from './collector.service';

@Controller('collector')
export class CollectorController {
  constructor(private readonly collectorService: CollectorService) {}

  @Get('test')
  async test() {
    return 'test';
  }
  @Get('collectData')
  async collectData() {
    return await this.collectorService.collectData();
  }

  @Get('salesInfo/:chainId?')
  async salesInfo(@Param('chainId') chainId?: string) {
    console.log(chainId);
    return await this.collectorService.getSalesInfo(null, chainId);
  }

  @Get('salesInfo/:address')
  async salesInfoIndividualToken(@Param('address') address: string) {
    return await this.collectorService.getSalesInfo(address);
  }

  @Get('salesInfo/purchased/:address')
  async salesInfoUser(@Param('address') address: string) {
    return await this.collectorService.getSalesUserInfo(address);
  }

  @Get('salesInfo/bond/:address')
  async salesInfoBond(@Param('address') address: string) {
    return await this.collectorService.getSalesBondInfo(address);
  }
}
