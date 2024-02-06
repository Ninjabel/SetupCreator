import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Category, Part} from "../../../interfaces/parts";
import {SearchService} from "../services/search.service";
import {debounceTime} from "rxjs";

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

    @Input()
    initialValues: Part[] | Category[] = [];


    search: FormControl = new FormControl<string>('');

    constructor(
        private readonly searchService: SearchService
    ) {
    }

    ngOnInit() {
        this.search.valueChanges.pipe(debounceTime(300))
            .subscribe((string) => {
                this.searchService.searchString.next(string);
            })
    }

}
