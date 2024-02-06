import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {Category, Part} from "../../interfaces/parts";
import {CategoryService} from "../../core/category.service";
import {map, Observable} from "rxjs";
import {convertPrice} from "../../utils/currencyConverter";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-promoted-parts',
    templateUrl: './promoted.component.html',
    styleUrls: ['./promoted.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotedComponent implements OnInit {

    parts: Observable<Part[]> = this.categoryService.categories.pipe(
        map((categories) => categories.flatMap((category) => category.products)),
        map((parts) => parts.filter((part) => part.isPromoted))
    )

    categories: Category[] = [];

    destroyRef: DestroyRef = inject(DestroyRef);


    constructor(
        private readonly categoryService: CategoryService
    ) {
    }

    ngOnInit(): void {
        this.categoryService.categories.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((categories) => {
            this.categories = categories;
        })
    }

    mapCatIdIntoCategory(categoryId: string): string {
        return this.categories.find(category => category.id === categoryId)?.name ?? ''
    }

    protected readonly convertPrice = convertPrice;
}
