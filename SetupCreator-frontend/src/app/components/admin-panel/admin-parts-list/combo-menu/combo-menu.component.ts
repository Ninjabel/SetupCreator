import {ChangeDetectionStrategy, Component, Inject, Injector, Input} from '@angular/core';
import {Part} from "../../../../interfaces/parts";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {PartDeleteApprovalComponent} from "../../part-delete-approval/part-delete-approval.component";
import {TuiDialogService} from "@taiga-ui/core";
import {HttpErrorResponse} from "@angular/common/http";
import {HttpRequestsService} from "../../../../core/util-services/http-requests.service";
import {CategoryService} from "../../../../core/category.service";
import {take} from "rxjs";
import {TuiPushService} from "@taiga-ui/kit";

@Component({
    selector: 'app-combo-menu',
    templateUrl: './combo-menu.component.html',
    styleUrls: ['./combo-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComboMenuComponent {
    @Input({required: true})
    part!: Part

    open = false;

    constructor(
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
        private readonly injector: Injector,
        private readonly httpRequestsService:HttpRequestsService,
        private readonly categoryService:CategoryService,
        @Inject(TuiPushService) protected readonly push: TuiPushService
    ) {
    }

    deletePart() {
        this.open = false;
        this.dialogs
            .open(new PolymorpheusComponent(PartDeleteApprovalComponent, this.injector), {
                size: 's',
                data: {part: this.part},
            }).subscribe()
    }

    addToPromoted(){
        this.open = false;
        this.httpRequestsService.post(`/parts/promote/${this.part.id}`).subscribe({
            next: () => {
                this.categoryService.refreshCategories();
                this.correctlyAddedPartNotifier();
            },
            error: (e: HttpErrorResponse) => {
                this.handleFailedRequest(e);
            }
        })
    }


    private correctlyAddedPartNotifier() {
        this.push.open('', {
            type: 'Udało się!',
            heading: 'Poprawnie dodano część do polecanych!',
            icon: 'tuiIconCheck'
        }).pipe(take(1)).subscribe();
    }

    private handleFailedRequest(e: HttpErrorResponse) {
        this.push.open('', {
            heading: e.message,
            icon: 'tuiIconX'
        }).pipe(take(1)).subscribe();
    }
}
