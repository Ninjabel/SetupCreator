import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {LocalstorageService} from "../core/util-services/localstorage.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
      private readonly localstorageService:LocalstorageService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localstorageService.getData('token')

    if (!token) {
      return next.handle(req);
    }

    const authenticatedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

    return next.handle(authenticatedRequest);
  }

}
