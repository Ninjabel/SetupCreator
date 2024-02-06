import {Component, Inject} from '@angular/core';
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {TuiPushService} from "@taiga-ui/kit";
import {HttpRequestsService} from "../../../core/util-services/http-requests.service";
import {take} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-setup-delete-approval',
  templateUrl: './setup-delete-approval.component.html',
  styleUrls: ['./setup-delete-approval.component.css']
})
export class SetupDeleteApprovalComponent {

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext<boolean, { setupId: string }>,
    @Inject(TuiPushService) protected readonly push: TuiPushService,
    private readonly httpRequestsService: HttpRequestsService
  ) {
  }


  delete(){
    this.httpRequestsService.delete(`/setups/delete/${this.context.data.setupId}`).subscribe({
      next: () => {
        this.correctlyRemovedSetupNotifier();
      },
      error: (e: HttpErrorResponse) => {
        console.log(e)
        this.handleFailedRequest(e);
      }
    })
  }

  cancel() {
    this.context.completeWith(false);
  }


  private correctlyRemovedSetupNotifier() {
    this.context.completeWith(true);
    this.push.open('', {
      type: 'Udało się!',
      heading: 'Usunięto zestaw!',
      icon: 'tuiIconCheck'
    }).pipe(take(1)).subscribe();
  }

  private handleFailedRequest(e: HttpErrorResponse) {
    this.context.completeWith(false);
    this.push.open('', {
      heading: e.error.message,
      type:'Coś poszło nie tak',
      icon: 'tuiIconX'
    }).pipe(take(1)).subscribe();
  }


}
