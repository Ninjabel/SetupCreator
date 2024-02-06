import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HttpRequestsService {

    apiUrl = environment.API_BASE_URL

    constructor(
        private readonly httpClient: HttpClient
    ) {
    }

    post(urlPart: string, body?: any): Observable<any> {
        return this.httpClient.post(`${this.apiUrl}${urlPart}`, body)
    }

    get(urlPart: string): Observable<any>{
        return this.httpClient.get(`${this.apiUrl}${urlPart}`)
    }

    delete(urlPart: string): Observable<any>{
        return this.httpClient.delete(`${this.apiUrl}${urlPart}`)
    }
}
