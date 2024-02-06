import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output
} from '@angular/core';
import {Category} from "../../interfaces/parts";
import {NgChanges} from "../../types/ComponentChanges";


@Component({
    selector: 'app-category-picker',
    templateUrl: './category-picker.component.html',
    styleUrls: ['./category-picker.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryPickerComponent implements OnChanges {

    @Input({required: true})
    categories!: Category[] | null

    @Output()
    categoryPicked: EventEmitter<Category> = new EventEmitter<Category>()

    pickedCategory: Category | null = null;
    loading: boolean = true;
    error: string = '';


    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnChanges(changes: NgChanges<CategoryPickerComponent>): void {
        if (changes.categories) {
            this.loading = false;
            this.changeDetectorRef.detectChanges();
        }
    }
    pickCategory(category: Category) {
        this.pickedCategory = category;
        this.categoryPicked.emit(category);
    }

}
