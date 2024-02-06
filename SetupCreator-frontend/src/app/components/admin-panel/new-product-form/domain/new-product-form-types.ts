import {FormControl} from "@angular/forms";

export type NewProductFormTypes = {
    name: FormControl<string | null>
    categoryId: FormControl<string | null>
    ceneoId: FormControl<string | null>
}
