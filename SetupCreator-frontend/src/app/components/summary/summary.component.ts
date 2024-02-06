import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnInit} from '@angular/core';
import {SetupService} from "../../core/util-services/setup.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Part} from "../../interfaces/parts";
import {convertPrice} from "../../utils/currencyConverter";
import {UserLoggedStoreService} from "../../core/util-services/user-logged-store.service";
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {HttpErrorResponse} from "@angular/common/http";
import {TuiPushService} from "@taiga-ui/kit";
import {TuiAlertService} from "@taiga-ui/core";
import {take} from "rxjs";

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent implements OnInit {


    destroyRef = inject(DestroyRef)
    summary: Part[] = []
    setupName: string = ''
    setupPrice: number = 0;
    userLogged: boolean = false;
    loading: boolean = false;
    error: string = '';

    constructor(
        @Inject(TuiPushService) protected readonly push: TuiPushService,
        @Inject(TuiAlertService) protected readonly alert: TuiAlertService,
        private readonly setupService: SetupService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly userLoggedStoreService: UserLoggedStoreService,
        private readonly httpRequestsService: HttpRequestsService
    ) {
    }

    ngOnInit() {
        this.observeUserLogged();
        this.observeSetup();
    }

    isSaveEnable(): boolean {
        return !this.setupName || !this.summary.length || !this.userLogged;
    }

    saveSetup() {
        this.loading = true;
        const setupData = {
            name: this.setupName,
            products: this.summary.map((part: Part) => part.id)
        }
        this.httpRequestsService.post('/setups/save', setupData).subscribe({
            next: () => {
                this.setupService.clearSetup();
                this.setupName = '';
                this.correctlyAddedSetupNotifier();
            },
            error: (e: HttpErrorResponse) => {
                this.handleFailedRequest(e);
            }
        })
    }

    removeFromSetup(part: Part) {
        this.setupService.deletePartFromSetup(part.id);
    }

    private recalculatePrice() {
        let setupPrice = 0;
        this.summary.forEach((part) => {
            if (part.price) {
                setupPrice += part.price;
            }
        })
        this.setupPrice = setupPrice;
        this.changeDetectorRef.detectChanges();
    }

    private observeUserLogged() {
        this.userLoggedStoreService.userLogged
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((logged) => {
                this.userLogged = logged;
                this.changeDetectorRef.detectChanges();
            })
    }

    private observeSetup() {
        this.setupService.summary
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((summary) => {
                this.summary = summary;
                this.recalculatePrice();
                this.changeDetectorRef.detectChanges();
            })
    }

    private correctlyAddedSetupNotifier() {
        this.loading = false;
        this.push.open('', {
            type: 'Dobra robota!',
            heading: 'Poprawnie dodano zestaw!',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
        this.changeDetectorRef.detectChanges();
    }

    private handleFailedRequest(e: HttpErrorResponse) {
        this.error = e.error.message;
        this.push.open('', {
            heading: this.error,
            icon: 'tuiIconX'
        }).pipe(take(1)).subscribe();
        this.loading = false;
        this.changeDetectorRef.detectChanges();
    }

    protected readonly convertPrice = convertPrice;
}
