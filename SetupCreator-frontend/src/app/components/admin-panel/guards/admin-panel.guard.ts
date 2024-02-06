import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {LocalstorageService} from "../../../core/util-services/localstorage.service";
import {UserRole} from "../../../enums/router-enum";

@Injectable({
    providedIn: 'root'
})
export class AdminPanelGuard implements CanActivate {

    constructor(
        private router: Router,
        private readonly localstorageService: LocalstorageService
    ) {
    }

    canActivate(): boolean {
        if (this.localstorageService.getData('role') === UserRole.ADMIN) {
            return true;
        } else {
            this.router.navigate(['/creator']);
            return false;
        }
    }
}
