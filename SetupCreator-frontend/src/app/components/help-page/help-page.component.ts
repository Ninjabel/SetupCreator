import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {TuiPushService} from "@taiga-ui/kit";
import {take} from "rxjs";

@Component({
    selector: 'app-help-page',
    templateUrl: './help-page.component.html',
    styleUrls: ['./help-page.component.css']
})
export class HelpPageComponent {

    formGroup: FormGroup = new FormGroup({
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        subject: new FormControl<string>('', [Validators.required]),
        message: new FormControl<string>('', [Validators.required])
    });

    loading: boolean = false;

    constructor(
        @Inject(TuiPushService) protected readonly push: TuiPushService
    ) {
    }

    sendForm() {
        this.loading = true;
        if (this.formGroup.valid) {
            setTimeout(() => {
                this.formGroup.reset();
                this.loading = false;
                this.push.open('', {
                    type: 'Dziękujemy za wiadomość!',
                    heading: 'Odpowiemy jak najszybciej',
                    icon: 'tuiIconCheck'
                }).pipe(take(1)).subscribe();
            }, 1000)

        } else {
            this.formGroup.markAsTouched();
            this.formGroup.updateValueAndValidity();
            this.loading = false;
        }
        return;
    }


}
