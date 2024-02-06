import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NewProductFormTypes} from "./domain/new-product-form-types";
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {Category} from "../../../interfaces/parts";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {HttpErrorResponse} from "@angular/common/http";
import {CategoryService} from "../../../core/category.service";
import {BehaviorSubject} from "rxjs";
import {TuiContextWithImplicit, tuiPure, TuiStringHandler} from "@taiga-ui/cdk";

@Component({
    selector: 'app-new-product-form',
    templateUrl: './new-product-form.component.html',
    styleUrls: ['./new-product-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewProductFormComponent implements OnInit {

    categories: BehaviorSubject<Category[]> = this.categoryService.categories
    loading: boolean = false;
    error: string = '';

    formGroup: FormGroup<NewProductFormTypes> = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        categoryId: new FormControl<string>('', [Validators.required]),
        ceneoId: new FormControl<string>('', [Validators.required])
    });

    constructor(
        @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean>,
        private readonly httpRequestsService: HttpRequestsService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly categoryService: CategoryService
    ) {
    }

    ngOnInit(): void {
    }

    @tuiPure
    stringify(
        items: readonly Category[],
    ): TuiStringHandler<TuiContextWithImplicit<string>> {
        const map = new Map(items.map(({id, name}) => [id, name] as [string, string]));

        return ({$implicit}: TuiContextWithImplicit<string>) => map.get($implicit) || '';
    }

    addProduct(): void {
        if (!this.formGroup.valid) {
            return;
        }
        this.loading = true;
        this.handleRequest();
    }

    private handleRequest(): void {
        this.httpRequestsService.post('/parts', this.formGroup.value).subscribe({
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
        this.categoryService.refreshCategories()
        this.loading = false;
        this.changeDetectorRef.detectChanges();
        this.context.completeWith(true);
    }

}
