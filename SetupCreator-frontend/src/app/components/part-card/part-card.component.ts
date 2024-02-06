import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef, Inject,
    inject,
    Input,
    OnInit
} from '@angular/core';
import {Part} from "../../interfaces/parts";
import {SetupService} from "../../core/util-services/setup.service";
import {convertPrice} from "../../utils/currencyConverter";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TuiDialogService} from "@taiga-ui/core";

@Component({
    selector: 'app-part-card',
    templateUrl: './part-card.component.html',
    styleUrls: ['./part-card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartCardComponent implements OnInit {

    @Input()
    counterVisible: boolean = true;

    @Input({required: true})
    part!: Part;

    destroyRef: DestroyRef = inject(DestroyRef)

    counter: number = 0;

    constructor(
        private readonly setupService: SetupService,
        private readonly changeDetectorRef: ChangeDetectorRef,
        @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
    ) {
    }

    ngOnInit() {
        this.setupService.summary
            .pipe(
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((parts: Part[]) => {
                if (!parts.length) {
                    this.counter = 0;
                    this.changeDetectorRef.detectChanges();
                }
            })
    }

    addPart() {
        this.counter += 1;
        this.setupService.addPartToSetup(this.part);
        this.changeDetectorRef.detectChanges();
    }

    deletePart() {
        if (this.counter > 0) {
            this.counter -= 1;
            this.setupService.deletePartFromSetup(this.part.id);
        }
        this.changeDetectorRef.detectChanges();
    }

    protected readonly convertPrice = convertPrice;
}
