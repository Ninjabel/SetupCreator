import {Component, EventEmitter, Inject, Injector, Input, OnInit, Output} from '@angular/core';
import {Part, Setup} from "../../interfaces/parts";
import {convertPrice} from "../../utils/currencyConverter";
import {TuiPushService} from "@taiga-ui/kit";
import {TuiDialogService} from "@taiga-ui/core";
import {PolymorpheusComponent} from "@tinkoff/ng-polymorpheus";
import {SetupDeleteApprovalComponent} from "./setup-delete-approval/setup-delete-approval.component";

@Component({
    selector: 'app-setup',
    templateUrl: './setup.component.html',
    styleUrls: ['./setup.component.css']
})
export class SetupComponent implements OnInit {

    @Input({required: true})
    setup!: Setup

    overallPrice: number = 0;

    @Output()
    actionFinished: EventEmitter<void> = new EventEmitter<void>();

    constructor(
      @Inject(TuiPushService) protected readonly push: TuiPushService,
      private readonly injector: Injector,
      @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
    ) {
    }

    ngOnInit() {
        this.setup.products.forEach((part: Part) => {
            if (part.price) {
               this.overallPrice += part.price
            }
        })
    }


    deleteSetup(setupId:string){
      this.dialogs
        .open(new PolymorpheusComponent(SetupDeleteApprovalComponent, this.injector), {
          size: 's',
          data: {setupId: setupId},
        }).subscribe(()=>{
         this.actionFinished.emit();
      })
    }

    protected readonly convertPrice = convertPrice;
}
