import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable, switchMap, throwError} from 'rxjs';
import {LocalstorageService} from "../core/util-services/localstorage.service";
import {HttpRequestsService} from "../core/util-services/http-requests.service";
import {UserLoggedStoreService} from "../core/util-services/user-logged-store.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private readonly localstorageService: LocalstorageService,
    private readonly httpRequestsService: HttpRequestsService,
    private readonly userLoggedStoreService:UserLoggedStoreService
  ) {
  }

  private isRefreshing = false;
  private token: string = ''

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.token = this.localstorageService.getData('token') ?? ''

    const authenticatedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${this.token}`),
    });

    return next.handle(authenticatedRequest).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/signin') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      if (this.token) {
        return this.refreshToken().pipe(
          switchMap(() => {
            this.isRefreshing = false;
            return next.handle(request);
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error.status == '403') {
              this.logout();
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }

  private refreshToken() {
    return this.httpRequestsService.post('auth/token');
  }

  private logout() {
    this.localstorageService.removeData('token');
    this.userLoggedStoreService.logout();
  }
}
