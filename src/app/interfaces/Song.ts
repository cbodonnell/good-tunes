import { Howl } from "howler";

export interface Song {
    title: string,
    file: string,
    howl?: Howl
}