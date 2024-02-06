import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef, inject,
    Inject,
    Injector,
    OnInit
} from '@angular/core';
import {CategoryService} from "../../../core/category.service";
import {Category} from "../../../interfaces/parts";
import {switchMap, tap} from "rxjs";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {
    CategoryDeleteApprovalComponent
} from "../category-delete-approval/category-delete-approval.component";
import {TuiDialogService} from "@taiga-ui/core";
import {SearchService} from "../services/search.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-admin-categories-list',
    templateUrl: './admin-categories-list.component.html',
    styleUrls: ['./admin-categories-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCategoriesListComponent implements OnInit {

    categories: Category[] = [];
    filteredCategories: Category[] = [];
    destroyRef: DestroyRef = inject(DestroyRef);

    constructor(
        private readonly categoryService: CategoryService,
        private readonly injector: Injector,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        private readonly searchService: SearchService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.categoryService.categories
            .pipe(
                tap((categories) => this.categories = categories),
                switchMap(() => this.searchService.searchString
                    .pipe(takeUntilDestroyed(this.destroyRef)))
            )
            .subscribe((searchString) => {
                this.filterCategories(searchString);
                this.changeDetectorRef.detectChanges();
            })
    }

    deleteCategory(category: Category) {
        this.dialogs
            .open(new PolymorpheusComponent(CategoryDeleteApprovalComponent, this.injector), {
                size: 's',
                data: {category: category},
            }).subscribe()
    }

    private filterCategories(searchString: string) {
        if (!this.categories) {
            this.filteredCategories = [];
            this.changeDetectorRef.detectChanges();
            return;
        }

        if (!searchString) {
            this.filteredCategories = this.categories;
            this.changeDetectorRef.detectChanges();
            return;
        }

        this.filteredCategories = this.categories.filter((category: Category) => category.name.toLowerCase().includes(searchString.toLowerCase()))
        this.changeDetectorRef.detectChanges();
    }

}
