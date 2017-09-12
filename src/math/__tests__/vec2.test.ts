import {Vec2} from "../vec2";

describe("vec", () => {

    it("initializes to origo", () => {
        const vec = new Vec2();
        expect(vec).toEqual({x: 0, y: 0});
    });

});
