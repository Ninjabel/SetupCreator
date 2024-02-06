import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {Category} from "../../../interfaces/parts";
import {HttpErrorResponse} from "@angular/common/http";
import {take} from "rxjs";
import {TuiDialogContext} from "@taiga-ui/core";
import {TuiPushService} from "@taiga-ui/kit";
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {CategoryService} from "../../../core/category.service";

@Component({
    selector: 'app-category-delete-approval',
    templateUrl: './category-delete-approval.component.html',
    styleUrls: ['./category-delete-approval.component.css'],
    changeDetection:ChangeDetectionStrategy.OnPush
})
export class CategoryDeleteApprovalComponent {

    loading: boolean = false;
    error: string = '';

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean, { category: Category }>,
        @Inject(TuiPushService) protected readonly push: TuiPushService,
        private readonly httpRequestsService: HttpRequestsService,
        private readonly categoryService:CategoryService,
        private readonly changeDetectorRef:ChangeDetectorRef
    ) {
    }


    cancel() {
        this.context.completeWith(false);
    }

    delete() {
        this.httpRequestsService.delete(`/categories/${this.context.data.category.id}`).subscribe({
            next: () => {
                this.categoryService.refreshCategories();
                this.correctlyDeletedCategoryNotifier();
            },
            error: (e: HttpErrorResponse) => {
                this.handleFailedRequest(e);
            }
        })
    }

    private handleFailedRequest(e: HttpErrorResponse) {
        this.error = e.error.message;
        this.push.open('', {
            heading: this.error,
            icon: 'tuiIconX'
        }).pipe(take(1)).subscribe();
        this.loading = false;
        this.context.completeWith(false);
    }

    private correctlyDeletedCategoryNotifier() {
        this.loading = false;
        this.push.open('', {
            type: 'Kategoria usunięta!',
            heading: 'Razem z nią wszystkie części przypisane :P',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
        this.changeDetectorRef.detectChanges();
        this.context.completeWith(true);
    }
}
