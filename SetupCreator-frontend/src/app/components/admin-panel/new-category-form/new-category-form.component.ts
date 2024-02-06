import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {Category} from "../../../interfaces/parts";
import {CategoryService} from "../../../core/category.service";

@Component({
    selector: 'app-new-category-form',
    templateUrl: './new-category-form.component.html',
    styleUrls: ['./new-category-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCategoryFormComponent {

    formGroup: FormGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required])
    });

    loading: boolean = false;
    error: string = '';

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>,
        private readonly httpRequestsService:HttpRequestsService,
        private readonly changeDetectorRef:ChangeDetectorRef,
        private readonly categoryService: CategoryService

    ) {
    }

    addCategory(): void {
        if (!this.formGroup.valid) {
            this.loading = true;
        }
        this.handleRequest();
    }

    private handleRequest(): void {
        this.httpRequestsService.post('/categories', this.formGroup.value).subscribe({
            next: () => {
                this.handleSuccessRequest()
            },
            error: (e) => {
                this.handleErrorRequest(e);
            }
        })
    }

    private handleErrorRequest(e: HttpErrorResponse) {
        this.error = e.error.message;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
    }

    private handleSuccessRequest() {
        this.categoryService.refreshCategories();
        this.loading = false;
        this.changeDetectorRef.detectChanges();
        this.context.completeWith(true);
    }

}
