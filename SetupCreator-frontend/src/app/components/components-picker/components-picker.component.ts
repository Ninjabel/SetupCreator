import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Input, OnChanges, OnInit
} from '@angular/core';
import {Category, Part} from "../../interfaces/parts";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";
import {NgChanges} from "../../types/ComponentChanges";

@Component({
    selector: 'app-components-picker',
    templateUrl: './components-picker.component.html',
    styleUrls: ['./components-picker.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentsPickerComponent implements OnInit, OnChanges {

    @Input()
    headerText: string = ''

    @Input()
    addProductComponentVariant: boolean = false;

    @Input()
    parts: Part[] | null = []

    @Input()
    category?: Category | null;

    search: FormControl = new FormControl<string>('');
    filteredParts: Part[] | null = [];

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnChanges(changes: NgChanges<ComponentsPickerComponent>) {
        if (changes.parts) {
            this.filteredParts = this.parts;
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnInit() {

        this.search.valueChanges
            .pipe(
                debounceTime(400)
            )
            .subscribe((value) => {
                this.filterResults(value)
            })
    }

    private filterResults(searchString: string): void {
        if (!this.parts) {
            this.filteredParts = [];
            this.changeDetectorRef.detectChanges();
            return;
        }

        if (!searchString) {
            this.filteredParts = this.parts;
            this.changeDetectorRef.detectChanges();
            return;
        }

        this.filteredParts = this.parts.filter((part: Part) => part.name.toLowerCase().includes(searchString.toLowerCase()))
        this.changeDetectorRef.detectChanges();
    }

}
