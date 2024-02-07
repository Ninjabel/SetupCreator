import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {LocalstorageService} from "../../../core/util-services/localstorage.service";
import {UserRole} from "../../../enums/router-enum";
import {jwtDecode} from "jwt-decode";
import {TokenData} from "../../Account/domain/user-forms-types";

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
      const userRole: TokenData = jwtDecode(this.localstorageService.getData('token')??'')
        if (userRole.role === UserRole.ADMIN) {
            return true;
        } else {
            this.router.navigate(['/creator']);
            return false;
        }
    }
}
