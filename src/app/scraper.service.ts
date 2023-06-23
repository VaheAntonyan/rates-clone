import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ScraperService {

  constructor(private httpClient: HttpClient) {
  }

  update(endpoint: string, options: { currencyList: string }): Observable<any[]> {
    return this.httpClient.get<any[]>("http://localhost:3000" + endpoint, {
      params: {
        'currencyList': options.currencyList,
      }
    })
  }
}
