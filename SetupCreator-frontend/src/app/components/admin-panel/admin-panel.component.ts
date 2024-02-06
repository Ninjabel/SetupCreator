import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, DestroyRef, inject, Inject, Injector,
    OnInit
} from '@angular/core';
import {Category} from "../../interfaces/parts";
import {CategoryService} from "../../core/category.service";
import {BehaviorSubject, take} from "rxjs";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {TuiDialogService} from "@taiga-ui/core";
import {NewCategoryFormComponent} from "./new-category-form/new-category-form.component";
import {Router} from "@angular/router";
import {NewProductFormComponent} from "./new-product-form/new-product-form.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {TuiPushService} from "@taiga-ui/kit";

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPanelComponent implements OnInit {

    categories: BehaviorSubject<Category[]> = this.categoryService.categories

    activeTabIndex: number = 0;
    destroyRef: DestroyRef = inject(DestroyRef)
    loading: boolean = false;

    constructor(
        private readonly categoryService: CategoryService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly injector: Injector,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        @Inject(TuiPushService) protected readonly push: TuiPushService,
        private readonly router: Router,
        private readonly httpRequestsService: HttpRequestsService
    ) {
    }

    ngOnInit() {
        this.categoryService.updates.subscribe(() => {
            this.changeDetectorRef.detectChanges();
        })

        this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.adjustTabs(this.router.url.split('/').pop())
        })

    }

    addCategory() {
        this.dialogs.open(
            new PolymorpheusComponent(NewCategoryFormComponent, this.injector),
            {
                closeable: false,
                size: 'm',
            }
        ).subscribe();
    }

    addPart(): void {
        this.dialogs.open(
            new PolymorpheusComponent(NewProductFormComponent, this.injector),
            {
                closeable: false,
                size: 'm'
            }
        ).subscribe();
    }


    refreshPrices() {
        this.loading = true;

        this.httpRequestsService.post('/parts/update').subscribe({
            next: () => {
                this.handleSuccessRequest()
            },
            error: () => {
                this.handleErrorRequest();
            }
        })
    }

    private handleErrorRequest() {
        this.loading = false;
        this.push.open('', {
            heading: 'Ups! Coś poszło nie tak',
            icon: 'tuiIconX'
        }).pipe(take(1)).subscribe();
        this.changeDetectorRef.detectChanges();
    }

    private handleSuccessRequest() {
        this.categoryService.refreshCategories();
        this.push.open('', {
            type: 'Poprawnie pobrano aktualne ceny!',
            heading: 'Ciekawe czy drogo :P',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
        this.loading = false;
        this.changeDetectorRef.detectChanges();
    }


    private adjustTabs(route: string | undefined) {
        if (!route) return;
        if (route === 'categories') {
            this.activeTabIndex = 0;
        }
        if (route === 'parts') {
            this.activeTabIndex = 1;
        }
        if (route === 'promoted') {
            this.activeTabIndex = 2;
        }
        this.changeDetectorRef.detectChanges();
    }
}
