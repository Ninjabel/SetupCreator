import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    OnInit
} from '@angular/core';
import {switchMap, tap} from "rxjs";
import {CategoryService} from "../../../core/category.service";
import {Category, Part} from "../../../interfaces/parts";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {convertPrice} from "../../../utils/currencyConverter";
import {SearchService} from "../services/search.service";

@Component({
    selector: 'app-admin-parts-list',
    templateUrl: './admin-parts-list.component.html',
    styleUrls: ['./admin-parts-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPartsListComponent implements OnInit {

    parts: Part[] = [];
    categories: Category[] = [];
    destroyRef: DestroyRef = inject(DestroyRef);
    filteredParts: Part[] = [];

    constructor(
        private readonly categoryService: CategoryService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly searchService: SearchService
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

    private mapCategoriesToProducts() {
        this.parts = this.categories.flatMap((category) => category.products);
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

    protected readonly convertPrice = convertPrice;
}
