import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreatorComponent} from "./components/creator/creator.component";
import {SetupsComponent} from "./components/setups/setups.component";
import {AdminPanelComponent} from "./components/admin-panel/admin-panel.component";
import {
    AdminCategoriesListComponent
} from "./components/admin-panel/admin-categories-list/admin-categories-list.component";
import {AdminPartsListComponent} from "./components/admin-panel/admin-parts-list/admin-parts-list.component";
import {AdminPanelGuard} from "./components/admin-panel/guards/admin-panel.guard";
import {AdminPromotedListComponent} from "./components/admin-panel/admin-promoted-list/admin-promoted-list.component";
import {HelpPageComponent} from "./components/help-page/help-page.component";

const routes: Routes = [
    {path: '', redirectTo: '/creator', pathMatch: 'full'},
    {path: 'creator', component: CreatorComponent},
    {path: 'my-setups', component: SetupsComponent},
    {path: 'help', component: HelpPageComponent},
    {
        path: 'admin-panel',
        component: AdminPanelComponent,
        canActivate: [AdminPanelGuard],
        children: [
            {path: '', redirectTo:'categories', pathMatch: 'full'},
            {path: 'categories', component:AdminCategoriesListComponent},
            {path: 'parts', component:AdminPartsListComponent},
            {path: 'promoted', component:AdminPromotedListComponent}
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
