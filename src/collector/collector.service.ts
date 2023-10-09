import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import fs from 'fs';
const path = require('path');

type SaleData = {
  contractAddress: string;
  createdAddressOwner: string;
  createdAt: number;
  dollarValue: number;
  lp: string;
};

type TimeFrame =
  | 'today'
  | 'yesterday'
  | 'this week'
  | 'last week'
  | '2 weeks ago'
  | 'this month'
  | 'last month'
  | '2 months ago'
  | '3 months ago'
  | '4 months ago'
  | '5 months ago'
  | '6 months ago';

@Injectable()
export class CollectorService {
  private readonly apiUrl =
    'https://api-v2.apeswap.finance/bills/summary/purchases';
  private readonly filename = path.resolve(__dirname, 'data.json');
  private readonly itemsPerPage = 50;
  private readonly maxNewPages = 75;

  @Cron(CronExpression.EVERY_30_MINUTES)
  async collectData() {
    const allData = [];

    try {
      const initialData = await this.fetchData(1);
      const totalPages = initialData.pages;

      allData.push(...initialData.data); // assuming the data is in a "data" property

      for (let i = 2; i <= totalPages; i++) {
        console.log(`Fetching page ${i} of ${totalPages}`);
        const pageData = await this.fetchData(i);
        allData.push(...pageData.data); // adjust this if the data structure is different
      }

      await this.saveDataToFile(allData);
      console.log('Data saved to file');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }

    return allData;
  }
  async fetchData(pageNumber: number): Promise<any> {
    let retries = 0;
    const url = `${this.apiUrl}?page=${pageNumber}`;
    while (retries < 10) {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        retries++;
        console.error(
          `Error fetching page ${pageNumber} - ${url}. Retrying... (${retries}/10)`,
        );
      }
    }
    throw new Error(`Failed to fetch page ${pageNumber} after 10 retries.`);
  }

  readExistingData(): any[] {
    try {
      const rawData = fs.readFileSync(this.filename, 'utf-8');
      return JSON.parse(rawData);
    } catch (error) {
      return [];
    }
  }

  async saveDataToFile(data: any[]) {
    fs.writeFileSync(this.filename, JSON.stringify(data, null, 2));
  }

  getStartAndEndTime(timeframe: TimeFrame): { start: number; end: number } {
    const date = new Date(
      Date.UTC(
        new Date().getUTCFullYear(),
        new Date().getUTCMonth(),
        new Date().getUTCDate(),
        new Date().getUTCHours(),
        new Date().getUTCMinutes(),
        new Date().getUTCSeconds(),
      ),
    );

    function getMondayOfLastWeek(): Date {
      const day = date.getUTCDay();
      const difference = date.getUTCDate() - day + (day === 0 ? -6 : 1) - 7;
      return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), difference),
      );
    }

    function getMonthRange(monthsAgo: number): { start: number; end: number } {
      const firstDay = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsAgo, 1),
      );
      const lastDay = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsAgo + 1, 0),
      );

      // Set hours, minutes, and seconds to 0 for midnight for the first day
      firstDay.setUTCHours(0, 0, 0, 0);

      // Set hours, minutes, and seconds for 11:59:59 PM for the last day
      lastDay.setUTCHours(23, 59, 59, 999);

      return {
        start: Math.floor(firstDay.getTime() / 1000),
        end: Math.floor(lastDay.getTime() / 1000),
      };
    }

    switch (timeframe) {
      case 'today':
        const startOfDay = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0,
            0,
            0,
          ),
        );
        return {
          start: Math.floor(startOfDay.getTime() / 1000),
          end: Math.floor(date.getTime() / 1000),
        };

      case 'yesterday':
        const startOfYesterday = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() - 1,
            0,
            0,
            0,
          ),
        );
        const endOfYesterday = new Date(
          Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() - 1,
            23,
            59,
            59,
          ),
        );
        return {
          start: Math.floor(startOfYesterday.getTime() / 1000),
          end: Math.floor(endOfYesterday.getTime() / 1000),
        };

      case 'this week':
        const thisMonday = new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate() -
            date.getUTCDay() +
            (date.getUTCDay() === 0 ? -6 : 1),
          0,
          0,
          0, // Set hours, minutes, and seconds to 0 for midnight
        );
        return {
          start: Math.floor(thisMonday.getTime() / 1000),
          end: Math.floor(new Date().getTime() / 1000), // Current timestamp
        };

      case 'last week':
        const lastMonday = getMondayOfLastWeek();
        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59); // Set hours, minutes, and seconds for 11:59:59 PM

        return {
          start: Math.floor(lastMonday.getTime() / 1000),
          end: Math.floor(lastSunday.getTime() / 1000),
        };

      case '2 weeks ago':
        const twoWeeksAgoMonday = new Date(getMondayOfLastWeek());
        twoWeeksAgoMonday.setDate(twoWeeksAgoMonday.getDate() - 7);
        const twoWeeksAgoSunday = new Date(twoWeeksAgoMonday);
        twoWeeksAgoSunday.setDate(twoWeeksAgoMonday.getDate() + 6);
        twoWeeksAgoSunday.setHours(23, 59, 59); // Set hours, minutes, and seconds for 11:59:59 PM

        return {
          start: Math.floor(twoWeeksAgoMonday.getTime() / 1000),
          end: Math.floor(twoWeeksAgoSunday.getTime() / 1000),
        };

      case 'this month':
        const firstDayThisMonth = new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          1,
          0,
          0,
          0, // Set hours, minutes, and seconds to 0 for midnight
        );
        return {
          start: Math.floor(firstDayThisMonth.getTime() / 1000),
          end: Math.floor(date.getTime() / 1000),
        };

      case 'last month':
      case '2 months ago':
      case '3 months ago':
      case '4 months ago':
      case '5 months ago':
      case '6 months ago':
        return getMonthRange(
          timeframe === 'last month' ? 1 : parseInt(timeframe[0], 10),
        );

      default:
        throw new Error('Invalid time frame specified.');
    }
  }

  getSalesData(timeframe: TimeFrame, data: any) {
    const { start, end } = this.getStartAndEndTime(timeframe);
    const relevantSales = data.filter(
      (item) => item.createdAt >= start && item.createdAt <= end,
    );

    const startDate = new Date(start * 1000).toLocaleDateString();
    const endDate = new Date(end * 1000).toLocaleDateString();

    const DateRange = `${startDate} - ${endDate}`;
    const UnixDateRange = `${start} - ${end}`;

    return {
      DateRange: DateRange,
      UnixDateRange: UnixDateRange,
      Label: timeframe,
      TotalSales: relevantSales.length,
      UniqueWallets: new Set(
        relevantSales.map((item) => item.createdAddressOwner),
      ).size,
      DollarValue: relevantSales.reduce(
        (acc, item) => acc + item.dollarValue,
        0,
      ),
      Sales: relevantSales.sort((a, b) => b.createdAt - a.createdAt),
    };
  }

  getSalesUserInfo(address: string) {
    const allData = this.readExistingData();

    const filteredData = allData.filter(
      (x: any) => x.createdAddressOwner === address,
    );
    const sortedData = filteredData.sort((a, b) => b.createdAt - a.createdAt);

    const totalDollarValue = filteredData.reduce(
      (sum, current) => sum + current.dollarValue,
      0,
    );

    return {
      totalDollarValue,
      Sales: sortedData,
    };
  }

  getSalesBondInfo(address: string) {
    const allData = this.readExistingData();

    const filteredData = allData.filter(
      (x: any) => x.contractAddress === address,
    );
    const sortedData = filteredData.sort((a, b) => b.createdAt - a.createdAt);

    const totalDollarValue = filteredData.reduce(
      (sum, current) => sum + current.dollarValue,
      0,
    );

    return {
      totalDollarValue,
      Sales: sortedData,
    };
  }

  getAllBonds(data: any[]) {
    const seen = new Set();
    const salesCount: { [key: string]: number } = {};
    const totalDollarValues: { [key: string]: number } = {};

    data.forEach((item: any) => {
      // Count the sales for each contractAddress
      salesCount[item.contractAddress] =
        (salesCount[item.contractAddress] || 0) + 1;

      // // Calculate the totalDollarValue for each contractAddress
      // const currentItemTotal = Object.values(item)
      //   .filter((value): value is number => typeof value === 'number') // Only consider number fields
      //   .reduce((sum, current) => sum + current, 0);
      //
      // totalDollarValues[item.contractAddress] =
      //   (totalDollarValues[item.contractAddress] || 0) + currentItemTotal;

      totalDollarValues[item.contractAddress] =
        (totalDollarValues[item.contractAddress] || 0) + item.dollarValue;
    });

    const uniqueData = data
      .filter((x: any) => {
        if (seen.has(x.contractAddress)) {
          return false;
        } else {
          seen.add(x.contractAddress);
          return true;
        }
      })
      .sort((a: any, b: any) => {
        if (a.createdAt > b.createdAt) {
          return -1; // For descending order
        } else if (a.createdAt < b.createdAt) {
          return 1; // For descending order
        } else {
          return 0; // If equal
        }
      })
      .map((item: any) => {
        // Add the TotalSales and totalDollarValue fields to each unique item
        return {
          ...item,
          totalSales: salesCount[item.contractAddress],
          totalDollarValue: totalDollarValues[item.contractAddress],
        };
      });

    return uniqueData;
  }

  getSalesInfo(contractAddress?: string) {
    const allData = this.readExistingData();
    const currentTime = Math.floor(Date.now() / 1000); // current timestamp in seconds

    const today = this.getSalesData('today', allData);
    const yesterday = this.getSalesData('yesterday', allData);
    const thisWeek = this.getSalesData('this week', allData);
    const oneWeekAgo = this.getSalesData('last week', allData);
    const twoWeeksAgo = this.getSalesData('2 weeks ago', allData);
    const thisMonth = this.getSalesData('this month', allData);
    const oneMonthAgo = this.getSalesData('last month', allData);
    const twoMonthsAgo = this.getSalesData('2 months ago', allData);
    const threeMonthsAgo = this.getSalesData('3 months ago', allData);
    const fourMonthsAgo = this.getSalesData('4 months ago', allData);
    const fiveMonthsAgo = this.getSalesData('5 months ago', allData);
    const sixMonthsAgo = this.getSalesData('6 months ago', allData);

    const bonds = this.getAllBonds(allData);

    return {
      bonds: bonds,
      figures: [
        today,
        yesterday,
        thisWeek,
        oneWeekAgo,
        twoWeeksAgo,
        thisMonth,
        oneMonthAgo,
        twoMonthsAgo,
        threeMonthsAgo,
        fourMonthsAgo,
        fiveMonthsAgo,
        sixMonthsAgo,
      ],
    };
  }
}
