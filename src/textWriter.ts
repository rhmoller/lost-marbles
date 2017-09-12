export function drawTextWrapped(ctx: CanvasRenderingContext2D,
                                text: string, x: number, y: number, width: number, lineHeight: number) {
    const tokens = text.split(/\s/);

    let tx = x;
    let ty = y;

    const cw = ctx.measureText(" ").width;

    tokens.forEach((token) =>  {
        const tm = ctx.measureText(token);
        if (tx + tm.width > (x + width)) {
            tx = x;
            ty += lineHeight;
        }
        ctx.strokeText(token, tx, ty);
        ctx.fillText(token, tx, ty);
        tx += tm.width + cw;
    });
}

export function drawTextCentered(ctx: CanvasRenderingContext2D, text: string, y: number) {
    const tm = ctx.measureText(text);
    const tx = (ctx.canvas.width - tm.width) / 2;
    ctx.strokeText(text, tx, y);
    ctx.fillText(text, tx, y);
}
