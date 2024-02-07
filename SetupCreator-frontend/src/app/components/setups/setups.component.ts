import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {take} from "rxjs";
import {Setup} from "../../interfaces/parts";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
    selector: 'app-setups',
    templateUrl: './setups.component.html',
    styleUrls: ['./setups.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SetupsComponent implements OnInit {

    loading: boolean = true;
    setups: Setup[] = [];
    currentSetup: Setup | null = null;
    emptyDatabase: boolean = false;

    constructor(
        private readonly httpRequestsService: HttpRequestsService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.selectSetups();
    }

    pickSetup(setup: Setup) {
        this.currentSetup = setup;
    }

  propagateChanges(){
      this.selectSetups();
  }

    private selectSetups() {
        this.httpRequestsService.get('/setups')
            .pipe(take(1))
            .subscribe({
              next: (data: Setup[]) => {
                this.loading = false;
                this.setups = data;
                this.isCurrentlyPickedSetupAvailable();
                this.changeDetectorRef.detectChanges();
              },
              error: (e: HttpErrorResponse) => {
                if (e.status === 404){
                  this.loading = false;
                  this.emptyDatabase = true;
                  this.setups = [];
                  this.isCurrentlyPickedSetupAvailable()
                  this.changeDetectorRef.detectChanges();
                }}
            })

    }


  private isCurrentlyPickedSetupAvailable() {
    if (this.setups.some((setup)=>setup.id===this.currentSetup?.id)){
      return;
    }
    this.currentSetup = null;
  }
}
