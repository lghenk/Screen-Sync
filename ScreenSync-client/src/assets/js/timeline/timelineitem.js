class TimelineItem {
    constructor(start, end, duration, videoStart) {
        this.types = { audio: 1, video: 2, effect: 3, image: 4 }
        Object.freeze(this.types);

        this.file = "";
        this._type = "";

        this.startSecond = start;
        this.end = end;
        this.duration = duration;
        this.videoStart = videoStart;
    }

    set SetType(type_in) {
        this._type = type_in;
    }

    get GetType() {
        return _type;
    }

    get GetTypes() {
        return this.types;
    }
}