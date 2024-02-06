import {FormControl} from "@angular/forms";

export type UserAccountDataForm = {
    email: FormControl<string | null>
    password: FormControl<string | null>
}

export type Token = {
    token: string
}

export type TokenData = { id: string, role: string, iat: number }
