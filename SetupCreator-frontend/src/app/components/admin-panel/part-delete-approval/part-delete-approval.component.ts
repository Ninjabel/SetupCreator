import {Component, Inject} from '@angular/core';
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {Part} from "../../../interfaces/parts";
import {HttpErrorResponse} from "@angular/common/http";
import {take} from "rxjs";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {TuiPushService} from "@taiga-ui/kit";
import {CategoryService} from "../../../core/category.service";

@Component({
    selector: 'app-part-delete-approval',
    templateUrl: './part-delete-approval.component.html',
    styleUrls: ['./part-delete-approval.component.css']
})
export class PartDeleteApprovalComponent {
    loading = false;
    error: string = '';

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean, { part: Part }>,
        @Inject(TuiPushService) protected readonly push: TuiPushService,
        private readonly httpRequestsService: HttpRequestsService,
        private readonly categoryService: CategoryService
    ) {
    }

    cancel() {
        this.context.completeWith(false);
    }

    delete() {
        this.loading = true;
        this.httpRequestsService.delete(`/parts/${this.context.data.part.id}`).subscribe({
            next: () => {
                this.categoryService.refreshCategories();
                this.correctlyDeletedPartNotifier();
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

    private correctlyDeletedPartNotifier() {
        this.loading = false;
        this.push.open('', {
            type: 'Część usunięta!',
            heading: 'Razem z nią wszelkie wspomnienia :P',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
        this.context.completeWith(true);
    }

}
