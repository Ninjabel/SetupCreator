import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpRequestsService} from "../../core/util-services/http-requests.service";
import {take} from "rxjs";
import {Setup} from "../../interfaces/parts";

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
            .subscribe((data: Setup[]) => {
                this.loading = false;
                console.log(data)
                this.setups = data;
                this.isCurrentlyPickedSetupAvailable()
                this.changeDetectorRef.detectChanges();
            })
    }


  private isCurrentlyPickedSetupAvailable() {
    if (this.setups.some((setup)=>setup.id===this.currentSetup?.id)){
      return;
    }
    this.currentSetup = null;
  }
}
