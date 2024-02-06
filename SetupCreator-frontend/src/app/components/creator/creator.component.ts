import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {Category} from "../../interfaces/parts";
import {CategoryService} from "../../core/category.service";
import {BehaviorSubject, map, Subject, Subscription} from "rxjs";

@Component({
    selector: 'app-creator',
    templateUrl: './creator.component.html',
    styleUrls: ['./creator.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatorComponent implements OnInit {

    loading: boolean = true;
    categories: BehaviorSubject<Category[]> = this.categoryService.categories
    pickedCategory: Category | null = null

    constructor(
        private readonly httpRequestsService: HttpRequestsService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly categoryService: CategoryService
    ) {
    }

    ngOnInit() {
        this.getCategories();
    }

    private getCategories() {
        this.httpRequestsService.get('/parts')
            .subscribe((data: Category[]) => {
                this.categoryService.categories.next(data)
                this.loading = false;
                this.changeDetectorRef.detectChanges();
            });
    }

    categoryPicked(category: Category): void {
        this.pickedCategory = category;
    }

}
