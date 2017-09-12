export function initRenderingContext(width = 640, height = 360): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    (canvas as any).mozOpaque = true;

    const stage = document.getElementById("stage") as HTMLElement;
    stage.appendChild(canvas);

    const scaleX = window.innerWidth / width;
    const scaleY = window.innerHeight / height;
    const scaleToFit = Math.min(scaleX, scaleY);
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform =  `scale(${scaleToFit},${scaleToFit})`;

    // canvas.style.cursor =  "none";
    const ctx = canvas.getContext("2d", {
        alpha: false,
    }) as CanvasRenderingContext2D;

    return [canvas, ctx];
}
