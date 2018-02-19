const secondWidth = 20; 

class TimelineMananger{
    constructor(element) {
        this.timelineDOM = element[0];
        this.timelines = {};

        this.ctx = this.timelineDOM.getContext('2d');

        this.timelineDOM.width = $("#TimelineWrapper").width();
        this.timelineDOM.height = $("#TimelineWrapper").height();

        $(window).on('resize', () => {
            if ($("#TimelineWrapper").width() > $("#Timeline").width()) {
                this.timelineDOM.width = $("#TimelineWrapper").width();
            }
        })
    }

    AddTimeline(name) {
        this.timelines[name] = new Timeline(name);
    }

    Draw(timeline) { 
        let ctx = timeline.ctx;
        timeline.ctx.clearRect(0, 0, timeline.timelineDOM.width, timeline.timelineDOM.height);

        // First Draw The Second Guide Line

        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo($("#Timeline").width(), 30);
        ctx.strokeStyle = 'white';
        ctx.stroke();

        let width = timeline.timelineDOM.width / secondWidth;
        let height = timeline.timelineDOM.height;
        for (let i = 0; i < width; i++) {
            ctx.font = "10px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(i, (i * secondWidth) - 5, 20); // javascript draws from the top left, so we simply substract 50% of the fontsize (in pixels) so if your font is 10px, you substract 5

            ctx.beginPath();
            ctx.moveTo(i * secondWidth, 30);
            ctx.lineTo(i * secondWidth, height);
            ctx.strokeStyle = '#636363';
            ctx.stroke();
        }

        let timelineProcessed = Object.keys(timeline.timelines).map((key) => { return { key: key, value: timeline.timelines[key] } });
        for (let i = 0; i < timelineProcessed.length; i++) {
            const tl = timelineProcessed[i];
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(tl.key, 10, (i * 50) + 65);

            // Then draw the timelines

            ctx.beginPath();
            ctx.moveTo(0, (i * 50) + 80);
            ctx.lineTo($("#Timeline").width(), (i * 50) + 80);
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }

        // Draw all the timeline items
        
    }
}