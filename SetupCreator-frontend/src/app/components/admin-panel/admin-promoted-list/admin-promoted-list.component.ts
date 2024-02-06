import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnInit} from '@angular/core';
import {Category, Part} from "../../../interfaces/parts";
import {CategoryService} from "../../../core/category.service";
import {switchMap, take, tap} from "rxjs";
import {convertPrice} from "../../../utils/currencyConverter";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {TuiPushService} from "@taiga-ui/kit";
import {SearchService} from "../services/search.service";

@Component({
    selector: 'app-admin-promoted-list',
    templateUrl: './admin-promoted-list.component.html',
    styleUrls: ['./admin-promoted-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPromotedListComponent implements OnInit {

    parts: Part[] = [];
    categories: Category[] = [];
    destroyRef: DestroyRef = inject(DestroyRef);
    filteredParts: Part[] = [];

    constructor(
        private readonly categoryService: CategoryService,
        private readonly httpRequestsService: HttpRequestsService,
        @Inject(TuiPushService) protected readonly push: TuiPushService,
        private readonly searchService: SearchService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.categoryService.categories
            .pipe(
                tap((categories) => {
                    this.categories = categories;
                    this.mapCategoriesToProducts();
                }),
                switchMap(() => this.searchService.searchString
                    .pipe(takeUntilDestroyed(this.destroyRef))),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((searchString) => {
                this.filterCategories(searchString);
                this.changeDetectorRef.detectChanges();
            })
    }

    mapCategoryIdIntoName(categoryId: string): string {
        return this.categories.find(category => category.id === categoryId)?.name ?? ''
    }

    deleteFromPromoted(part: Part): void {
        this.httpRequestsService.post(`/parts/unpromote/${part.id}`).subscribe({
            next: () => {
                this.categoryService.refreshCategories();
                this.correctlyRemovedPartNotifier();
            },
            error: (e: HttpErrorResponse) => {
                this.handleFailedRequest(e);
            }
        })
    }

    private mapCategoriesToProducts() {
        this.parts = this.categories.flatMap((category) => category.products).filter((part) => part.isPromoted);
    }

    private filterCategories(searchString: string) {
        if (!this.categories) {
            this.filteredParts = [];
            this.changeDetectorRef.detectChanges();
            return;
        }

        if (!searchString) {
            this.filteredParts = this.parts;
            this.changeDetectorRef.detectChanges();
            return;
        }

        this.filteredParts = this.parts.filter((part: Part) => part.name.toLowerCase().includes(searchString.toLowerCase()))
        this.changeDetectorRef.detectChanges();
    }

    private correctlyRemovedPartNotifier() {
        this.push.open('', {
            type: 'Udało się!',
            heading: 'Usunięto z polecanych!',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
    }

    private handleFailedRequest(e: HttpErrorResponse) {
        this.push.open('', {
            heading: e.message,
            icon: 'tuiIconX'
        }).pipe(take(1)).subscribe();
    }


    protected readonly convertPrice = convertPrice;
}
