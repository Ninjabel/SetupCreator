import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {UserLoggedStoreService} from "./core/util-services/user-logged-store.service";
import {CategoryService} from "./core/category.service";
import {Router} from "@angular/router";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {RouterEnum} from "./enums/router-enum";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
    title = 'setup-creator-frontend';

    creatorView: boolean = true;

    destroyRef: DestroyRef = inject(DestroyRef)

    constructor(
        private readonly userLoggedStoreService: UserLoggedStoreService,
        private readonly categoryService:CategoryService,
        private readonly router:Router
    ) {
    }

    ngOnInit() {
        this.userLoggedStoreService.checkForInitialLogin();
        this.categoryService.refreshCategories();

        this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.creatorView = `/${this.router.url.split('/').pop()}`===RouterEnum.CREATOR;
        })
    }
}
