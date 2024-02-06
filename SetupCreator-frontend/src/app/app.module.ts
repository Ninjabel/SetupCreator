import {NgDompurifySanitizer} from "@tinkoff/ng-dompurify";
import {
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    TUI_SANITIZER,
    TuiButtonModule,
    TuiLinkModule,
    TuiScrollbarModule,
    TuiSvgModule,
    TuiHintModule,
    TuiDataListModule,
    TuiLoaderModule,
    TuiHostedDropdownModule, TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AppRoutingModule} from "./app-routing.module";
import {CreatorComponent} from './components/creator/creator.component';
import {UserFormComponent} from './components/Account/user-form.component';
import {
    TuiInputModule,
    TuiInputNumberModule,
    TuiInputPasswordModule,
    TuiPushModule, TuiSelectModule,
    TuiTabsModule, TuiTextareaModule
} from "@taiga-ui/kit";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TuiLetModule, TuiValidatorModule} from "@taiga-ui/cdk";
import {HeaderComponent} from './components/header/header.component';
import {ComponentsPickerComponent} from './components/components-picker/components-picker.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {PartCardComponent} from './components/part-card/part-card.component';
import {SummaryComponent} from './components/summary/summary.component';
import {SetupsComponent} from './components/setups/setups.component';
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import { SetupComponent } from './components/setup/setup.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { CategoryPickerComponent } from './components/category-picker/category-picker.component';
import { NewProductFormComponent } from './components/admin-panel/new-product-form/new-product-form.component';
import { NewCategoryFormComponent } from './components/admin-panel/new-category-form/new-category-form.component';
import { CategoryDeleteApprovalComponent } from './components/admin-panel/category-delete-approval/category-delete-approval.component';
import { AdminCategoriesListComponent } from './components/admin-panel/admin-categories-list/admin-categories-list.component';
import { AdminPartsListComponent } from './components/admin-panel/admin-parts-list/admin-parts-list.component';
import { PartDeleteApprovalComponent } from './components/admin-panel/part-delete-approval/part-delete-approval.component';
import { PromotedComponent } from './components/promoted/promoted.component';
import { ComboMenuComponent } from './components/admin-panel/admin-parts-list/combo-menu/combo-menu.component';
import { AdminPromotedListComponent } from './components/admin-panel/admin-promoted-list/admin-promoted-list.component';
import { HelpPageComponent } from './components/help-page/help-page.component';
import { SearchComponent } from './components/admin-panel/search/search.component';
import { SetupDeleteApprovalComponent } from './components/setup/setup-delete-approval/setup-delete-approval.component';

@NgModule({
    declarations: [
        AppComponent,
        CreatorComponent,
        UserFormComponent,
        HeaderComponent,
        ComponentsPickerComponent,
        PartCardComponent,
        SummaryComponent,
        SetupsComponent,
        SetupComponent,
        AdminPanelComponent,
        CategoryPickerComponent,
        NewProductFormComponent,
        NewCategoryFormComponent,
        CategoryDeleteApprovalComponent,
        AdminCategoriesListComponent,
        AdminPartsListComponent,
        PartDeleteApprovalComponent,
        PromotedComponent,
        ComboMenuComponent,
        AdminPromotedListComponent,
        HelpPageComponent,
        SearchComponent,
        SetupDeleteApprovalComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        TuiRootModule,
        TuiDialogModule,
        TuiAlertModule,
        TuiButtonModule,
        TuiInputModule,
        ReactiveFormsModule,
        TuiInputPasswordModule,
        TuiLinkModule,
        TuiValidatorModule,
        HttpClientModule,
        TuiScrollbarModule,
        TuiInputNumberModule,
        TuiSvgModule,
        FormsModule,
        TuiHintModule,
        TuiPushModule,
        TuiTabsModule,
        TuiSelectModule,
        TuiDataListModule,
        TuiLoaderModule,
        TuiLetModule,
        TuiHostedDropdownModule,
        TuiTextareaModule,
        TuiTextfieldControllerModule
    ],
    providers: [
        {provide: TUI_SANITIZER, useClass: NgDompurifySanitizer},
        {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
