import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from 'app/app.component';
import { ConnectComponent } from 'app/connect/connect.component';
import { SelecttypeComponent } from 'app/selecttype/selecttype.component';
import { ControldashboardComponent } from 'app/controldashboard/controldashboard.component';
import { InterfacedashboardComponent } from 'app/interfacedashboard/interfacedashboard.component';

const appRoutes: Routes = [
    { path: '', component: ConnectComponent },
    { path: 'selecttype', component: SelecttypeComponent },
    { path: 'control/dashboard', component: ControldashboardComponent },
    { path: 'interface/dashboard', component: InterfacedashboardComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];


@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: true } // <-- debugging purposes only
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {}

