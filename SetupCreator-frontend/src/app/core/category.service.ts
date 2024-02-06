import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject, take} from "rxjs";
import {Category} from "../interfaces/parts";
import {HttpRequestsService} from "./util-services/http-requests.service";

@Injectable({
    providedIn: "root"
})
export class CategoryService {

    categories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
    updates: Subject<void> = new Subject();

    constructor(
        private readonly httpRequestsService: HttpRequestsService
    ) {
        this.getCategories();
    }

    private getCategories() {
        this.httpRequestsService.get('/parts')
            .pipe(take(1))
            .subscribe((data: Category[]) => {
                this.categories.next(data);
                this.updates.next();
            });
    }

    refreshCategories() {
        this.getCategories();
    }
}
