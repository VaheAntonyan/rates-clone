import {Component, ViewChild} from '@angular/core';
import {MatSort, Sort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {ScraperService} from "../scraper.service";
import {catchError, of} from "rxjs";

const CURRENCY_OPTIONS = [
  "1 USD",
  "1 EUR",
  "1 RUR",
  "1 GBP",
  "1 GEL",
  "1 CHF",
  "1 CAD",
  "1 AED",
  "1 CNY",
  "1 AUD",
  "10 JPY",
  "1 SEK",
  "1 HKD",
  "10 KZT",
  "1 XAU"
] as const;

type CurrencyOptionType = typeof CURRENCY_OPTIONS[number];

interface CurrencyToAMDRate {
  buy: number;
  sell: number;
}

export interface OrganizationRate {
  name: string;
  branches: number;
  date: Date;
  currencyRates: CurrencyToAMDRate[]
}

const MONTHS_DICTIONARY = {
  "Հնվ": "January",
  "Փտվ": "February",
  "Մրտ": "March",
  "Ապր": "April",
  "Մյս": "May",
  "Հնս": "June",
  "Հլս": "July",
  "Օգս": "August",
  "Սեպ": "September",
  "Հոկ": "October",
  "Նոյ": "November",
  "Դեկ": "December",
};

type CurrencyNameModel = {
  groupName: string,
  buyName: string,
  sellName: string,
};

@Component({
  selector: 'app-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.scss'],
})
export class RatesComponent {
  currencyCount = 4;
  dataColumns: string[] = [];
  firstRow: string[] = [];
  secondRow: string[] = [];
  defaultCurrencies: CurrencyOptionType[] = ["1 USD", "1 EUR", "1 RUR", "1 GBP"];
  currencyGroups: CurrencyNameModel[] = [];
  CURRENCY_OPTIONS = CURRENCY_OPTIONS;
  isReady: boolean = false;

  dataSource!: MatTableDataSource<OrganizationRate>;
  selectedCurrencies: CurrencyOptionType[] = [...this.defaultCurrencies];

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  constructor(private scraper: ScraperService) {
  }

  ngOnInit() {
    this.dataColumns = ['position', 'name', 'branches', 'date'];
    this.firstRow = ['position', 'name', 'branches', 'date'];
    this.secondRow = ['hidden', 'hidden', 'hidden', 'hidden'];

    for (let i = 0; i < this.currencyCount; i++) {
      const names: CurrencyNameModel = {
        groupName: 'currencyGroup' + i,
        buyName: 'currencyBuy' + i,
        sellName: 'currencySell' + i
      }
      this.currencyGroups.push(names);
      this.firstRow.push(names.groupName);

      this.secondRow.push(names.buyName);
      this.dataColumns.push(names.buyName);

      this.secondRow.push(names.sellName);
      this.dataColumns.push(names.sellName);
    }

    this.update();
  }

  update() {
    this.scraper.update("/banks/cash", {
      currencyList: this.selectedCurrencies.toString()
    })
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(res => {
        const model = this.convertToOrganizationRateModel(res);
        if (this.dataSource) {
          this.dataSource.data = model;
        } else {
          this.dataSource = new MatTableDataSource(model);
        }
        this.isReady = true;
      })
  }

  private convertToOrganizationRateModel(data: any[]): OrganizationRate[] {
    const result: OrganizationRate[] = [];
    data.forEach(e => {
      const currencyRates: CurrencyToAMDRate[] = [];
      for (let i = 0; i < e.flatRates.length; i += 2) {
        currencyRates.push({
          buy: e.flatRates[i],
          sell: e.flatRates[i + 1]
        })
      }
      result.push({
        name: e.name,
        date: RatesComponent.parseDate(e.date),
        branches: +e.branches,
        currencyRates: currencyRates
      })
    })
    return result;
  }

  private static parseDate(date: string): Date {
    return new Date(Date.parse(RatesComponent.translateMonth(date)));
  }

  private static translateMonth(date: string): string {
    const month = date.substring(date.indexOf(" ") + 1, date.indexOf(","));
    const monthInEnglish = (MONTHS_DICTIONARY as any)[month];
    return monthInEnglish ? date.replace(month, monthInEnglish) : date;
  }

  sortColumn($event: Sort): void {
    this.dataSource.sortingDataAccessor = (item, sortHeaderId) => {
      if (sortHeaderId.startsWith("currencyBuy")) {
        return item.currencyRates[+sortHeaderId.at(-1)!].buy;
      }
      if (sortHeaderId.startsWith("currencySell")) {
        return item.currencyRates[+sortHeaderId.at(-1)!].sell;
      }
      if (sortHeaderId === 'date') {
        return item[sortHeaderId].getMilliseconds();
      }
      if (sortHeaderId === 'branches' || sortHeaderId === 'name') {
        return item[sortHeaderId];
      }
      throw new Error('Sorting is not implemented for ' + sortHeaderId + ' column.');
    };
  }
}
