describe("game-util", () => {

    it("can create a canvas", () => {
        const canvas = document.createElement("canvas");
        expect(canvas).not.toBe(null);
    });

});
