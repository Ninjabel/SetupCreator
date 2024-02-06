import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    Inject,
    Injector,
    OnInit
} from '@angular/core';
import {TuiDialogService} from "@taiga-ui/core";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {UserFormComponent} from "../Account/user-form.component";
import {LocalstorageService} from "../../core/util-services/localstorage.service";
import {UserLoggedStoreService} from "../../core/util-services/user-logged-store.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NavigationEnd, Router, RouterEvent} from "@angular/router";
import {filter, map} from "rxjs";
import {RouterEnum, UserRole} from "../../enums/router-enum";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

    destroyRef: DestroyRef = inject(DestroyRef)
    userLogged: boolean = false;
    userRole: UserRole = UserRole.USER
    creatorVisible: boolean = true;

    constructor(
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        private readonly injector: Injector,
        private readonly localstorageService: LocalstorageService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly userLoggedStoreService: UserLoggedStoreService,
        private readonly router: Router
    ) {
    }

    ngOnInit() {
        this.observeUserLogged();
        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                map((event) => event as RouterEvent)
            )
            .subscribe((event) => {
                this.creatorVisible = event.url === RouterEnum.CREATOR;
                this.changeDetectorRef.detectChanges();
            })
    }

    showFormDialog(loginButton: boolean) {
        this.dialogs
            .open(
                new PolymorpheusComponent(UserFormComponent, this.injector),
                {
                    closeable: false,
                    size: 's',
                    data: {login: loginButton}
                }
            )
            .subscribe();
    }

    logout() {
        this.localstorageService.removeData('token');
        this.localstorageService.removeData('role');
        this.userLoggedStoreService.logout();
        this.changeDetectorRef.detectChanges();
    }

    private observeUserLogged() {
        this.userLoggedStoreService.userLogged
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((logged) => {
                this.userLogged = logged;
                this.updateUserRole();
            })
    }

    private updateUserRole() {
        this.userRole = this.localstorageService.getData('role') as UserRole;
    }

    protected readonly UserRole = UserRole;
}
