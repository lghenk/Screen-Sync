class Timeline {
    constructor(name) {
        this.name = name;
        this.data = [];
    }

    GetLatestEnd() {
        if (this.data.length == 0) return 0;
        let latest = 0;

        for (let i = 0; i < this.data.length; i++) {
            const element = this.data[i];
            if(element.end > latest) {
                latest = element.end
            }
        }

        return latest;
    }
}