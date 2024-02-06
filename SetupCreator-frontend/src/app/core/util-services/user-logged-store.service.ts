import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {LocalstorageService} from "./localstorage.service";

@Injectable({
    providedIn: 'root'
})
export class UserLoggedStoreService {

    userLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private readonly localstorageService: LocalstorageService
    ) {
    }

    logout() {
        this.userLogged.next(false);
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
