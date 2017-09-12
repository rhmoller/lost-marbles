export const timer = {
    time: 0,
    lastTime: 0,
    dt: 0,
    update(t: number) {
        this.dt = t - this.lastTime;
        this.lastTime = this.time;
        this.time = t;
    }
};
