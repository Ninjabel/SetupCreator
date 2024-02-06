import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Part} from "../../interfaces/parts";

@Injectable({
    providedIn: 'root'
})
export class SetupService {

    summary: BehaviorSubject<Part[]> = new BehaviorSubject<Part[]>([]);

    private _summary: Part[] = [];


    constructor() {
    }

    addPartToSetup(part: Part) {
        this._summary.push(part);
        this.propagateChanges();
    }

    deletePartFromSetup(partId: string) {
        const existingPartId = this._summary.findIndex((part) => part.id === partId);
        if (existingPartId !== -1) {
            this._summary.splice(existingPartId, 1)
            this.propagateChanges();
        }
    }

    clearSetup() {
        this._summary = [];
        this.propagateChanges();
    }

    private propagateChanges() {
        this.summary.next(this._summary)
    }
}
