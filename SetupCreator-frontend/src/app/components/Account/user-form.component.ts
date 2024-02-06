import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Token, TokenData, UserAccountDataForm} from "./domain/user-forms-types";
import {PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH} from "./domain/user-forms-consts";
import {TuiDialogContext} from "@taiga-ui/core";
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus';
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {LocalstorageService} from "../../core/util-services/localstorage.service";
import {UserLoggedStoreService} from "../../core/util-services/user-logged-store.service";
import {HttpErrorResponse} from "@angular/common/http";
import {jwtDecode} from 'jwt-decode';


@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {

    formGroup: FormGroup<UserAccountDataForm> = new FormGroup({
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        password: new FormControl<string>('', [Validators.required, Validators.min(PASSWORD_MIN_LENGTH), Validators.max(PASSWORD_MAX_LENGTH)])
    });
    loading: boolean = false;
    error: string = ''
    readonly login: boolean = this.context.data.login

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean, { login: boolean }>,
        private readonly httpRequestsService: HttpRequestsService,
        private readonly localstorageService: LocalstorageService,
        private readonly userLoggedStoreService: UserLoggedStoreService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    sendForm() {
        if (!this.formGroup.valid) {
            return;
        }
        this.loading = true;
        if (this.login) {
            this.handleLogin();
            return;
        }
        this.handleRegistration();
    }

    private handleLogin() {
        this.httpRequestsService.post('/auth/login', this.formGroup.value)
            .pipe()
            .subscribe({
                next: (token: Token) => {
                    this.handleSuccessAuthorization(token);
                },
                error: (e) => {
                    this.handleFailedAuthorization(e);
                }
            })
    }

    private handleRegistration() {
        this.httpRequestsService.post('/auth/register', this.formGroup.value)
            .pipe()
            .subscribe({
                    next: (token: Token) => {
                        this.handleSuccessAuthorization(token);
                    },
                    error: (e: HttpErrorResponse) => {
                        this.handleFailedAuthorization(e);
                    }
                }
            )
    }

    private handleSuccessAuthorization(token: Token) {
        const userRole: TokenData = jwtDecode(token.token)
        this.localstorageService.saveData('token', token.token);
        this.localstorageService.saveData('role', userRole.role);
        this.userLoggedStoreService.login();
        this.loading = false;
        this.changeDetectorRef.detectChanges();
        this.context.completeWith(true);
    }

    private handleFailedAuthorization(e: HttpErrorResponse) {
        this.error = e.error.message;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
    }

}
