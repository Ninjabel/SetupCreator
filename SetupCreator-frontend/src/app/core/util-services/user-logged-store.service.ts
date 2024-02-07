import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {LocalstorageService} from "./localstorage.service";
import {Router} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class UserLoggedStoreService {

    userLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private readonly localstorageService: LocalstorageService,
        private readonly router: Router
    ) {
    }

    logout() {
        this.userLogged.next(false);
        this.router.navigate(['/creator']);
    }

    login() {
        this.userLogged.next(true);
    }

    checkForInitialLogin() {
        if (this.localstorageService.getData('token')) {
            this.login();
        }
    }

}
