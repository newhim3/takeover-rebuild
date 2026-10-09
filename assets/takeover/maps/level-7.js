/* Original map geometry exported by JPEXS; isolated from the game renderer. */
(function(){var Filters,BlendModes,canvas,ownerFrames={},level=7;
var groundOnly=false,objectCollector=null,objectLocation=0,nativeObjectRegions=[{"symbol":5508,"location":0,"matrix":[0.05,0.0,0.0,0.05,87.45,-135.7]},{"symbol":5509,"location":1,"matrix":[0.05,0.0,0.0,0.05,450.05,-224.25]},{"symbol":5510,"location":2,"matrix":[0.05,0.0,0.0,0.05,790.15,267.7]},{"symbol":5511,"location":3,"matrix":[0.05,0.0,0.0,0.05,230.35,2.2]},{"symbol":5512,"location":5,"matrix":[0.05,0.0,0.0,0.05,-175.15,239.85]},{"symbol":5513,"location":4,"matrix":[0.05,0.0,0.0,0.05,111.35,336.2]}];
var nativeObjectSymbols=new Set(nativeObjectRegions.map(r=>'sprite'+r.symbol));
function ownerTime(location){return ownerFrames[location]??0;}
var imageObj9000007=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/maps/masks/level-7.png"):document.createElement("img");if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj9000007,"assets/takeover/maps/masks/level-7.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj9000007.src="assets/takeover/maps/masks/level-7.png";
/**
 *  JPEXS Free Flash Decompiler Filters
 */

Filters = {};

var createCanvas = function (width, height) {
    var c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    c.style.display = "none";
    //temporary add to document to get this work (getImageData, etc.)
    document.body.appendChild(c);
    document.body.removeChild(c);
    return c;
};

Filters._premultiply = function (data) {
    var len = data.length;
    for (var i = 0; i < len; i += 4) {
        var f = data[i + 3] * 0.003921569;
        data[i] = Math.round(data[i] * f);
        data[i + 1] = Math.round(data[i + 1] * f);
        data[i + 2] = Math.round(data[i + 2] * f);
    }
};

Filters._unpremultiply = function (data) {
    var len = data.length;
    for (var i = 0; i < len; i += 4) {
        var a = data[i + 3];
        if (a == 0 || a == 255) {
            continue;
        }
        var f = 255 / a;
        var r = (data[i] * f);
        var g = (data[i + 1] * f);
        var b = (data[i + 2] * f);
        if (r > 255) {
            r = 255;
        }
        if (g > 255) {
            g = 255;
        }
        if (b > 255) {
            b = 255;
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
    }
};


Filters._boxBlurHorizontal = function (pixels, mask, w, h, radius, maskType) {
    var index = 0;
    var newColors = [];

    for (var y = 0; y < h; y++) {
        var hits = 0;
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        for (var x = -radius * 4; x < w * 4; x += 4) {
            var oldPixel = x - radius * 4 - 4;
            if (oldPixel >= 0) {
                if ((maskType == 0) || (maskType == 1 && mask[index + oldPixel + 3] > 0) || (maskType == 2 && mask[index + oldPixel + 3] < 255)) {
                    a -= pixels[index + oldPixel + 3];
                    r -= pixels[index + oldPixel];
                    g -= pixels[index + oldPixel + 1];
                    b -= pixels[index + oldPixel + 2];
                    hits--;
                }
            }

            var newPixel = x + radius * 4;
            if (newPixel < w * 4) {
                if ((maskType == 0) || (maskType == 1 && mask[index + newPixel + 3] > 0) || (maskType == 2 && mask[index + newPixel + 3] < 255)) {
                    a += pixels[index + newPixel + 3];
                    r += pixels[index + newPixel];
                    g += pixels[index + newPixel + 1];
                    b += pixels[index + newPixel + 2];
                    hits++;
                }
            }

            if (x >= 0) {
                if ((maskType == 0) || (maskType == 1 && mask[index + x + 3] > 0) || (maskType == 2 && mask[index + x + 3] < 255)) {
                    if (hits == 0) {
                        newColors[x] = 0;
                        newColors[x + 1] = 0;
                        newColors[x + 2] = 0;
                        newColors[x + 3] = 0;
                    } else {
                        newColors[x] = Math.round(r / hits);
                        newColors[x + 1] = Math.round(g / hits);
                        newColors[x + 2] = Math.round(b / hits);
                        newColors[x + 3] = Math.round(a / hits);

                    }
                } else {
                    newColors[x] = 0;
                    newColors[x + 1] = 0;
                    newColors[x + 2] = 0;
                    newColors[x + 3] = 0;
                }
            }
        }
        for (var p = 0; p < w * 4; p += 4) {
            pixels[index + p] = newColors[p];
            pixels[index + p + 1] = newColors[p + 1];
            pixels[index + p + 2] = newColors[p + 2];
            pixels[index + p + 3] = newColors[p + 3];
        }

        index += w * 4;
    }
};

Filters._boxBlurVertical = function (pixels, mask, w, h, radius, maskType) {
    var newColors = [];
    var oldPixelOffset = -(radius + 1) * w * 4;
    var newPixelOffset = (radius) * w * 4;

    for (var x = 0; x < w * 4; x += 4) {
        var hits = 0;
        var r = 0;
        var g = 0;
        var b = 0;
        var a = 0;
        var index = -radius * w * 4 + x;
        for (var y = -radius; y < h; y++) {
            var oldPixel = y - radius - 1;
            if (oldPixel >= 0) {
                if ((maskType == 0) || (maskType == 1 && mask[index + oldPixelOffset + 3] > 0) || (maskType == 2 && mask[index + oldPixelOffset + 3] < 255)) {
                    a -= pixels[index + oldPixelOffset + 3];
                    r -= pixels[index + oldPixelOffset];
                    g -= pixels[index + oldPixelOffset + 1];
                    b -= pixels[index + oldPixelOffset + 2];
                    hits--;
                }

            }

            var newPixel = y + radius;
            if (newPixel < h) {
                if ((maskType == 0) || (maskType == 1 && mask[index + newPixelOffset + 3] > 0) || (maskType == 2 && mask[index + newPixelOffset + 3] < 255)) {
                    a += pixels[index + newPixelOffset + 3];
                    r += pixels[index + newPixelOffset];
                    g += pixels[index + newPixelOffset + 1];
                    b += pixels[index + newPixelOffset + 2];
                    hits++;
                }
            }

            if (y >= 0) {
                if ((maskType == 0) || (maskType == 1 && mask[y * w * 4 + x + 3] > 0) || (maskType == 2 && mask[y * w * 4 + x + 3] < 255)) {
                    if (hits == 0) {
                        newColors[4 * y] = 0;
                        newColors[4 * y + 1] = 0;
                        newColors[4 * y + 2] = 0;
                        newColors[4 * y + 3] = 0;
                    } else {
                        newColors[4 * y] = Math.round(r / hits);
                        newColors[4 * y + 1] = Math.round(g / hits);
                        newColors[4 * y + 2] = Math.round(b / hits);
                        newColors[4 * y + 3] = Math.round(a / hits);
                    }
                } else {
                    newColors[4 * y] = 0;
                    newColors[4 * y + 1] = 0;
                    newColors[4 * y + 2] = 0;
                    newColors[4 * y + 3] = 0;
                }
            }

            index += w * 4;
        }

        for (var y = 0; y < h; y++) {
            pixels[y * w * 4 + x] = newColors[4 * y];
            pixels[y * w * 4 + x + 1] = newColors[4 * y + 1];
            pixels[y * w * 4 + x + 2] = newColors[4 * y + 2];
            pixels[y * w * 4 + x + 3] = newColors[4 * y + 3];
        }
    }
};


Filters.blur = function (canvas, ctx, hRadius, vRadius, iterations, mask, maskType) {
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    Filters._premultiply(data);
    for (var i = 0; i < iterations; i++) {
        Filters._boxBlurHorizontal(data, mask, canvas.width, canvas.height, Math.floor(hRadius / 2), maskType);
        Filters._boxBlurVertical(data, mask, canvas.width, canvas.height, Math.floor(vRadius / 2), maskType);
    }

    Filters._unpremultiply(data);

    var width = canvas.width;
    var height = canvas.height;
    var retCanvas = createCanvas(width, height);
    var retImg = retCanvas.getContext("2d");
    retImg.putImageData(imgData, 0, 0);
    return retCanvas;
}

Filters._moveRGB = function (width, height, rgb, deltaX, deltaY, fill) {
    var img = createCanvas(width, height);

    var ig = img.getContext("2d");

    Filters._setRGB(ig, 0, 0, width, height, rgb);
    var retImg = createCanvas(width, height);
    retImg.width = width;
    retImg.height = height;
    var g = retImg.getContext("2d");
    g.fillStyle = fill;
    g.globalCompositeOperation = "copy";
    g.fillRect(0, 0, width, height);
    g.drawImage(img, deltaX, deltaY);
    return g.getImageData(0, 0, width, height).data;
};


Filters.FULL = 1;
Filters.INNER = 2;
Filters.OUTER = 3;

Filters._setRGB = function (ctx, x, y, width, height, data) {
    var id = ctx.createImageData(width, height);
    for (var i = 0; i < data.length; i++) {
        id.data[i] = data[i];
    }
    ctx.putImageData(id, x, y);
};

Filters.gradientGlow = function (srcCanvas, src, blurX, blurY, angle, distance, colors, ratios, type, iterations, strength, knockout) {
    var width = canvas.width;
    var height = canvas.height;
    var retCanvas = createCanvas(width, height);
    var retImg = retCanvas.getContext("2d");

    var gradCanvas = createCanvas(256, 1);

    var gradient = gradCanvas.getContext("2d");
    var grd = ctx.createLinearGradient(0, 0, 255, 0);
    for (var s = 0; s < colors.length; s++) {
        var v = "rgba(" + colors[s][0] + "," + colors[s][1] + "," + colors[s][2] + "," + colors[s][3] + ")";
        grd.addColorStop(ratios[s], v);
    }
    gradient.fillStyle = grd;
    gradient.fillRect(0, 0, 256, 1);
    var gradientPixels = gradient.getImageData(0, 0, gradCanvas.width, gradCanvas.height).data;

    var angleRad = angle / 180 * Math.PI;
    var moveX = (distance * Math.cos(angleRad));
    var moveY = (distance * Math.sin(angleRad));
    var srcPixels = src.getImageData(0, 0, width, height).data;
    var shadow = [];
    for (var i = 0; i < srcPixels.length; i += 4) {
        var alpha = srcPixels[i + 3];
        shadow[i] = 0;
        shadow[i + 1] = 0;
        shadow[i + 2] = 0;
        shadow[i + 3] = Math.round(alpha * strength);
    }
    var colorAlpha = "rgba(0,0,0,0)";
    shadow = Filters._moveRGB(width, height, shadow, moveX, moveY, colorAlpha);

    Filters._setRGB(retImg, 0, 0, width, height, shadow);

    var maskType = 0;
    if (type == Filters.INNER) {
        maskType = 1;
    }
    if (type == Filters.OUTER) {
        maskType = 2;
    }


    retCanvas = Filters.blur(retCanvas, retCanvas.getContext("2d"), blurX, blurY, iterations, srcPixels, maskType);
    retImg = retCanvas.getContext("2d");
    shadow = retImg.getImageData(0, 0, width, height).data;

    if (maskType != 0) {
        for (var i = 0; i < srcPixels.length; i += 4) {
            if ((maskType == 1 && srcPixels[i + 3] == 0) || (maskType == 2 && srcPixels[i + 3] == 255)) {
                shadow[i] = 0;
                shadow[i + 1] = 0;
                shadow[i + 2] = 0;
                shadow[i + 3] = 0;
            }
        }
    }


    for (var i = 0; i < shadow.length; i += 4) {
        var a = shadow[i + 3];
        shadow[i] = gradientPixels[a * 4];
        shadow[i + 1] = gradientPixels[a * 4 + 1];
        shadow[i + 2] = gradientPixels[a * 4 + 2];
        shadow[i + 3] = gradientPixels[a * 4 + 3];
    }

    Filters._setRGB(retImg, 0, 0, width, height, shadow);

    if (!knockout) {
        retImg.globalCompositeOperation = "destination-over";
        retImg.drawImage(srcCanvas, 0, 0);
    }

    return retCanvas;
};


Filters.dropShadow = function (canvas, src, blurX, blurY, angle, distance, color, inner, iterations, strength, knockout) {
    var width = canvas.width;
    var height = canvas.height;
    var srcPixels = src.getImageData(0, 0, width, height).data;
    var shadow = [];
    for (var i = 0; i < srcPixels.length; i += 4) {
        var alpha = srcPixels[i + 3];
        if (inner) {
            alpha = 255 - alpha;
        }
        shadow[i] = color[0];
        shadow[i + 1] = color[1];
        shadow[i + 2] = color[2];
        var sa = color[3] * alpha * strength;
        if (sa > 255)
            sa = 255;
        shadow[i + 3] = Math.round(sa);
    }
    var colorFirst = "#000000";
    var colorAlpha = "rgba(0,0,0,0)";
    var angleRad = angle / 180 * Math.PI;
    var moveX = (distance * Math.cos(angleRad));
    var moveY = (distance * Math.sin(angleRad));
    shadow = Filters._moveRGB(width, height, shadow, moveX, moveY, inner ? colorFirst : colorAlpha);


    var retCanvas = createCanvas(canvas.width, canvas.height);
    Filters._setRGB(retCanvas.getContext("2d"), 0, 0, width, height, shadow);
    if (blurX > 0 || blurY > 0) {
        retCanvas = Filters.blur(retCanvas, retCanvas.getContext("2d"), blurX, blurY, iterations, null, 0);
    }
    shadow = retCanvas.getContext("2d").getImageData(0, 0, width, height).data;

    var srcPixels = src.getImageData(0, 0, width, height).data;
    for (var i = 0; i < shadow.length; i += 4) {
        var mask = srcPixels[i + 3];
        if (!inner) {
            mask = 255 - mask;
        }
        shadow[i + 3] = mask * shadow[i + 3] / 255;
    }
    Filters._setRGB(retCanvas.getContext("2d"), 0, 0, width, height, shadow);

    if (!knockout) {
        var g = retCanvas.getContext("2d");
        g.globalCompositeOperation = "destination-over";
        g.drawImage(canvas, 0, 0);
    }

    return retCanvas;
};

Filters._cut = function (a, min, max) {
    if (a > max)
        a = max;
    if (a < min)
        a = min;
    return a;
}

Filters.gradientBevel = function (canvas, src, colors, ratios, blurX, blurY, strength, type, angle, distance, knockout, iterations) {
    var width = canvas.width;
    var height = canvas.height;
    var retImg = createCanvas(width, height);
    var srcPixels = src.getImageData(0, 0, width, height).data;

    var gradient = createCanvas(512, 1);
    var gg = gradient.getContext("2d");

    var grd = ctx.createLinearGradient(0, 0, 511, 0);
    for (var s = 0; s < colors.length; s++) {
        var v = "rgba(" + colors[s][0] + "," + colors[s][1] + "," + colors[s][2] + "," + colors[s][3] + ")";
        grd.addColorStop(ratios[s], v);
    }
    gg.fillStyle = grd;
    gg.globalCompositeOperation = "copy";
    gg.fillRect(0, 0, gradient.width, gradient.height);
    var gradientPixels = gg.getImageData(0, 0, gradient.width, gradient.height).data;


    if (type != Filters.OUTER) {
        var hilightIm = Filters.dropShadow(canvas, src, 0, 0, angle, distance, [255, 0, 0, 1], true, iterations, strength, true);
        var shadowIm = Filters.dropShadow(canvas, src, 0, 0, angle + 180, distance, [0, 0, 255, 1], true, iterations, strength, true);
        var h2 = createCanvas(width, height);
        var s2 = createCanvas(width, height);
        var hc = h2.getContext("2d");
        var sc = s2.getContext("2d");
        hc.drawImage(hilightIm, 0, 0);
        hc.globalCompositeOperation = "destination-out";
        hc.drawImage(shadowIm, 0, 0);

        sc.drawImage(shadowIm, 0, 0);
        sc.globalCompositeOperation = "destination-out";
        sc.drawImage(hilightIm, 0, 0);
        var shadowInner = s2;
        var hilightInner = h2;
    }
    if (type != Filters.INNER) {
        var hilightIm = Filters.dropShadow(canvas, src, 0, 0, angle + 180, distance, [255, 0, 0, 1], false, iterations, strength, true);
        var shadowIm = Filters.dropShadow(canvas, src, 0, 0, angle, distance, [0, 0, 255, 1], false, iterations, strength, true);
        var h2 = createCanvas(width, height);
        var s2 = createCanvas(width, height);
        var hc = h2.getContext("2d");
        var sc = s2.getContext("2d");
        hc.drawImage(hilightIm, 0, 0);
        hc.globalCompositeOperation = "destination-out";
        hc.drawImage(shadowIm, 0, 0);

        sc.drawImage(shadowIm, 0, 0);
        sc.globalCompositeOperation = "destination-out";
        sc.drawImage(hilightIm, 0, 0);
        var shadowOuter = s2;
        var hilightOuter = h2;
    }

    var hilightIm;
    var shadowIm;
    switch (type) {
        case Filters.OUTER:
            hilightIm = hilightOuter;
            shadowIm = shadowOuter;
            break;
        case Filters.INNER:
            hilightIm = hilightInner;
            shadowIm = shadowInner;
            break;
        case Filters.FULL:
            hilightIm = hilightInner;
            shadowIm = shadowInner;
            var hc = hilightIm.getContext("2d");
            hc.globalCompositeOperation = "source-over";
            hc.drawImage(hilightOuter, 0, 0);
            var sc = shadowIm.getContext("2d");
            sc.globalCompositeOperation = "source-over";
            sc.drawImage(shadowOuter, 0, 0);
            break;
    }

    var maskType = 0;
    if (type == Filters.INNER) {
        maskType = 1;
    }
    if (type == Filters.OUTER) {
        maskType = 2;
    }

    var retc = retImg.getContext("2d");
    retc.fillStyle = "#000000";
    retc.fillRect(0, 0, width, height);
    retc.drawImage(shadowIm, 0, 0);
    retc.drawImage(hilightIm, 0, 0);

    retImg = Filters.blur(retImg, retImg.getContext("2d"), blurX, blurY, iterations, srcPixels, maskType);
    var ret = retImg.getContext("2d").getImageData(0, 0, width, height).data;

    for (var i = 0; i < srcPixels.length; i += 4) {
        var ah = ret[i] * strength;
        var as = ret[i + 2] * strength;
        var ra = Filters._cut(ah - as, -255, 255);
        ret[i] = gradientPixels[4 * (255 + ra)];
        ret[i + 1] = gradientPixels[4 * (255 + ra) + 1];
        ret[i + 2] = gradientPixels[4 * (255 + ra) + 2];
        ret[i + 3] = gradientPixels[4 * (255 + ra) + 3];
    }
    Filters._setRGB(retImg.getContext("2d"), 0, 0, width, height, ret);


    if (!knockout) {
        var g = retImg.getContext("2d");
        g.globalCompositeOperation = "destination-over";
        g.drawImage(canvas, 0, 0);
    }
    return retImg;
}
Filters.bevel = function (canvas, src, blurX, blurY, strength, type, highlightColor, shadowColor, angle, distance, knockout, iterations) {
    return Filters.gradientBevel(canvas, src, [
        shadowColor,
        [shadowColor[0], shadowColor[1], shadowColor[2], 0],
        [highlightColor[0], highlightColor[1], highlightColor[2], 0],
        highlightColor
    ], [0, 127 / 255, 128 / 255, 1], blurX, blurY, strength, type, angle, distance, knockout, iterations);
}


//http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
Filters.convolution = function (canvas, ctx, weights, opaque) {
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side / 2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var outCanvas = createCanvas(w, h);
    var outCtx = outCanvas.getContext("2d");
    var output = outCtx.getImageData(0, 0, w, h);
    var dst = output.data;
    // go through the destination image pixels
    var alphaFac = opaque ? 1 : 0;
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            var sy = y;
            var sx = x;
            var dstOff = (y * w + x) * 4;
            // calculate the weighed sum of the source image pixels that
            // fall under the convolution matrix
            var r = 0, g = 0, b = 0, a = 0;
            for (var cy = 0; cy < side; cy++) {
                for (var cx = 0; cx < side; cx++) {
                    var scy = sy + cy - halfSide;
                    var scx = sx + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        var srcOff = (scy * sw + scx) * 4;
                        var wt = weights[cy * side + cx];
                        r += src[srcOff] * wt;
                        g += src[srcOff + 1] * wt;
                        b += src[srcOff + 2] * wt;
                        a += src[srcOff + 3] * wt;
                    }
                }
            }
            dst[dstOff] = r;
            dst[dstOff + 1] = g;
            dst[dstOff + 2] = b;
            dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
    }
    outCtx.putImageData(output, 0, 0);
    return outCanvas;
};

Filters.colorMatrix = function (canvas, ctx, m) {
    var pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var data = pixels.data;
    for (var i = 0; i < data.length; i += 4) {
        var r = i;
        var g = i + 1;
        var b = i + 2;
        var a = i + 3;

        var oR = data[r];
        var oG = data[g];
        var oB = data[b];
        var oA = data[a];

        data[r] = (m[0] * oR) + (m[1] * oG) + (m[2] * oB) + (m[3] * oA) + m[4];
        data[g] = (m[5] * oR) + (m[6] * oG) + (m[7] * oB) + (m[8] * oA) + m[9];
        data[b] = (m[10] * oR) + (m[11] * oG) + (m[12] * oB) + (m[13] * oA) + m[14];
        data[a] = (m[15] * oR) + (m[16] * oG) + (m[17] * oB) + (m[18] * oA) + m[19];
    }
    var outCanvas = createCanvas(canvas.width, canvas.height);
    var outCtx = outCanvas.getContext("2d");
    outCtx.putImageData(pixels, 0, 0);
    return outCanvas;
};


Filters.glow = function (canvas, src, blurX, blurY, strength, color, inner, knockout, iterations) {
    return Filters.dropShadow(canvas, src, blurX, blurY, 45, 0, color, inner, iterations, strength, knockout);
};


var BlendModes = {};

BlendModes._cut = function (v) {
    if (v < 0)
        v = 0;
    if (v > 255)
        v = 255;
    return v;
};

BlendModes.normal = function (src, dst, result, pos) {
    var am = (255 - src[pos + 3]) / 255;
    result[pos] = this._cut(src[pos] * src[pos + 3] / 255 + dst[pos] * dst[pos + 3] / 255 * am);
    result[pos + 1] = this._cut(src[pos + 1] * src[pos + 3] / 255 + dst[pos + 1] * dst[pos + 3] / 255 * am);
    result[pos + 2] = this._cut(src[pos + 2] * src[pos + 3] / 255 + dst[pos + 2] * dst[pos + 3] / 255 * am);
    result[pos + 3] = this._cut(src[pos + 3] + dst[pos + 3] * am);
};

BlendModes.layer = function (src, dst, result, pos) {
    BlendModes.normal(src, dst, result, pos);
};

BlendModes.multiply = function (src, dst, result, pos) {
    result[pos + 0] = (src[pos + 0] * dst[pos + 0]) >> 8;
    result[pos + 1] = (src[pos + 1] * dst[pos + 1]) >> 8;
    result[pos + 2] = (src[pos + 2] * dst[pos + 2]) >> 8;
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.screen = function (src, dst, result, pos) {
    result[pos + 0] = 255 - ((255 - src[pos + 0]) * (255 - dst[pos + 0]) >> 8);
    result[pos + 1] = 255 - ((255 - src[pos + 1]) * (255 - dst[pos + 1]) >> 8);
    result[pos + 2] = 255 - ((255 - src[pos + 2]) * (255 - dst[pos + 2]) >> 8);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.lighten = function (src, dst, result, pos) {
    result[pos + 0] = Math.max(src[pos + 0], dst[pos + 0]);
    result[pos + 1] = Math.max(src[pos + 1], dst[pos + 1]);
    result[pos + 2] = Math.max(src[pos + 2], dst[pos + 2]);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.darken = function (src, dst, result, pos) {
    result[pos + 0] = Math.min(src[pos + 0], dst[pos + 0]);
    result[pos + 1] = Math.min(src[pos + 1], dst[pos + 1]);
    result[pos + 2] = Math.min(src[pos + 2], dst[pos + 2]);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.difference = function (src, dst, result, pos) {
    result[pos + 0] = Math.abs(dst[pos + 0] - src[pos + 0]);
    result[pos + 1] = Math.abs(dst[pos + 1] - src[pos + 1]);
    result[pos + 2] = Math.abs(dst[pos + 2] - src[pos + 2]);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.add = function (src, dst, result, pos) {
    result[pos + 0] = Math.min(255, src[pos + 0] + dst[pos + 0]);
    result[pos + 1] = Math.min(255, src[pos + 1] + dst[pos + 1]);
    result[pos + 2] = Math.min(255, src[pos + 2] + dst[pos + 2]);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3]);
};

BlendModes.subtract = function (src, dst, result, pos) {
    result[pos + 0] = Math.max(0, src[pos + 0] + dst[pos + 0] - 256);
    result[pos + 1] = Math.max(0, src[pos + 1] + dst[pos + 1] - 256);
    result[pos + 2] = Math.max(0, src[pos + 2] + dst[pos + 2] - 256);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.invert = function (src, dst, result, pos) {
    result[pos + 0] = 255 - dst[pos + 0];
    result[pos + 1] = 255 - dst[pos + 1];
    result[pos + 2] = 255 - dst[pos + 2];
    result[pos + 3] = src[pos + 3];
};

BlendModes.alpha = function (src, dst, result, pos) {
    result[pos + 0] = src[pos + 0];
    result[pos + 1] = src[pos + 1];
    result[pos + 2] = src[pos + 2];
    result[pos + 3] = dst[pos + 3]; //?
};

BlendModes.erase = function (src, dst, result, pos) {
    result[pos + 0] = src[pos + 0];
    result[pos + 1] = src[pos + 1];
    result[pos + 2] = src[pos + 2];
    result[pos + 3] = 255 - dst[pos + 3]; //?
};

BlendModes.overlay = function (src, dst, result, pos) {
    result[pos + 0] = dst[pos + 0] < 128 ? dst[pos + 0] * src[pos + 0] >> 7
            : 255 - ((255 - dst[pos + 0]) * (255 - src[pos + 0]) >> 7);
    result[pos + 1] = dst[pos + 1] < 128 ? dst[pos + 1] * src[pos + 1] >> 7
            : 255 - ((255 - dst[pos + 1]) * (255 - src[pos + 1]) >> 7);
    result[pos + 2] = dst[pos + 2] < 128 ? dst[pos + 2] * src[pos + 2] >> 7
            : 255 - ((255 - dst[pos + 2]) * (255 - src[pos + 2]) >> 7);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes.hardlight = function (src, dst, result, pos) {
    result[pos + 0] = src[pos + 0] < 128 ? dst[pos + 0] * src[pos + 0] >> 7
            : 255 - ((255 - src[pos + 0]) * (255 - dst[pos + 0]) >> 7);
    result[pos + 1] = src[pos + 1] < 128 ? dst[pos + 1] * src[pos + 1] >> 7
            : 255 - ((255 - src[pos + 1]) * (255 - dst[pos + 1]) >> 7);
    result[pos + 2] = src[pos + 2] < 128 ? dst[pos + 2] * src[pos + 2] >> 7
            : 255 - ((255 - src[pos + 2]) * (255 - dst[pos + 2]) >> 7);
    result[pos + 3] = Math.min(255, src[pos + 3] + dst[pos + 3] - (src[pos + 3] * dst[pos + 3]) / 255);
};

BlendModes._list = [
    BlendModes.normal,
    BlendModes.normal,
    BlendModes.layer,
    BlendModes.multiply,
    BlendModes.screen,
    BlendModes.lighten,
    BlendModes.darken,
    BlendModes.difference,
    BlendModes.add,
    BlendModes.subtract,
    BlendModes.invert,
    BlendModes.alpha,
    BlendModes.erase,
    BlendModes.overlay,
    BlendModes.hardlight
];

BlendModes.blendData = function (srcPixel, dstPixel, retData, modeIndex) {
    var result = [];
    var retPixel = [];
    var alpha = 1.0;
    for (var i = 0; i < retData.length; i += 4) {
        this._list[modeIndex](srcPixel, dstPixel, result, i);

        retPixel[i + 0] = this._cut(dstPixel[i + 0] + (result[i + 0] - dstPixel[i + 0]) * alpha);
        retPixel[i + 1] = this._cut(dstPixel[i + 1] + (result[i + 1] - dstPixel[i + 1]) * alpha);
        retPixel[i + 2] = this._cut(dstPixel[i + 2] + (result[i + 2] - dstPixel[i + 2]) * alpha);
        retPixel[i + 3] = this._cut(dstPixel[i + 3] + (result[i + 3] - dstPixel[i + 3]) * alpha);

        var af = srcPixel[i + 3] / 255;
        retData[i + 0] = this._cut((1 - af) * dstPixel[i + 0] + af * retPixel[i + 0]);
        retData[i + 1] = this._cut((1 - af) * dstPixel[i + 1] + af * retPixel[i + 1]);
        retData[i + 2] = this._cut((1 - af) * dstPixel[i + 2] + af * retPixel[i + 2]);
        retData[i + 3] = this._cut((1 - af) * dstPixel[i + 3] + af * retPixel[i + 3]);
    }
};

BlendModes.blendCanvas = function (src, dst, result, modeIndex) {
    var width = src.width;
    var height = src.height;
    var rctx = result.getContext("2d");
    var sctx = src.getContext("2d");
    var dctx = dst.getContext("2d");
    var ridata = rctx.getImageData(0, 0, width, height);
    var sidata = sctx.getImageData(0, 0, width, height);
    var didata = dctx.getImageData(0, 0, width, height);

    this.blendData(sidata.data, didata.data, ridata.data, modeIndex);
    rctx.putImageData(ridata, 0, 0);
};


function concatMatrix(m1, m2) {
    var result = [1, 0, 0, 1, 0, 0];
    var scaleX = 0;
    var rotateSkew0 = 1;
    var rotateSkew1 = 2;
    var scaleY = 3;
    var translateX = 4;
    var translateY = 5;

    result[scaleX] = m2[scaleX] * m1[scaleX] + m2[rotateSkew1] * m1[rotateSkew0];
    result[rotateSkew0] = m2[rotateSkew0] * m1[scaleX] + m2[scaleY] * m1[rotateSkew0];
    result[rotateSkew1] = m2[scaleX] * m1[rotateSkew1] + m2[rotateSkew1] * m1[scaleY];
    result[scaleY] = m2[rotateSkew0] * m1[rotateSkew1] + m2[scaleY] * m1[scaleY];
    result[translateX] = m2[scaleX] * m1[translateX] + m2[rotateSkew1] * m1[translateY] + m2[translateX];
    result[translateY] = m2[rotateSkew0] * m1[translateX] + m2[scaleY] * m1[translateY] + m2[translateY];

    return result;
}

var enhanceContext = function (context) {
    var m = [1, 0, 0, 1, 0, 0];
    context._matrix = m;

    //the stack of saved matrices
    context._savedMatrices = [m]; //[[m]];

    var super_ = context.__proto__;
    context.__proto__ = ({
        save: function () {
            this._savedMatrices.push(this._matrix); //.slice()
            super_.save.call(this);
        },
        //if the stack of matrices we're managing doesn't have a saved matrix,
        //we won't even call the context's original `restore` method.
        restore: function () {
            if (this._savedMatrices.length == 0)
                return;
            super_.restore.call(this);
            this._matrix = this._savedMatrices.pop();
        },
        scale: function (x, y) {
            super_.scale.call(this, x, y);
        },
        rotate: function (theta) {
            super_.rotate.call(this, theta);
        },
        translate: function (x, y) {
            super_.translate.call(this, x, y);
        },
        transform: function (a, b, c, d, e, f) {
            this._matrix = concatMatrix([a, b, c, d, e, f], this._matrix);
            super_.transform.call(this, a, b, c, d, e, f);
        },
        setTransform: function (a, b, c, d, e, f) {
            this._matrix = [a, b, c, d, e, f];
            super_.setTransform.call(this, a, b, c, d, e, f);
        },
        resetTransform: function () {
            super_.resetTransform.call(this);
        },
        applyTransforms: function (m) {
            this.setTransform(m[0], m[1], m[2], m[3], m[4], m[5])
        },
        applyTransformToPoint: function (p) {
            var ret = {};
            ret.x = this._matrix[0] * p.x + this._matrix[2] * p.y + this._matrix[4];
            ret.y = this._matrix[1] * p.x + this._matrix[3] * p.y + this._matrix[5];
            return ret;
        },
        __proto__: super_
    });

    return context;
};
var cxform = function (r_add, g_add, b_add, a_add, r_mult, g_mult, b_mult, a_mult) {
    this.r_add = r_add;
    this.g_add = g_add;
    this.b_add = b_add;
    this.a_add = a_add;
    this.r_mult = r_mult;
    this.g_mult = g_mult;
    this.b_mult = b_mult;
    this.a_mult = a_mult;
    this._cut = function (v, min, max) {
        if (v < min)
            v = min;
        if (v > max)
            v = max;
        return v;
    };
    this.apply = function (c) {
        var d = c;
        d[0] = this._cut(Math.round(d[0] * this.r_mult / 255 + this.r_add), 0, 255);
        d[1] = this._cut(Math.round(d[1] * this.g_mult / 255 + this.g_add), 0, 255);
        d[2] = this._cut(Math.round(d[2] * this.b_mult / 255 + this.b_add), 0, 255);
        d[3] = this._cut(d[3] * this.a_mult / 255 + this.a_add / 255, 0, 1);
        return d;
    };
    this.applyToImage = function (fimg) {
        if (this.isEmpty()) {
            return fimg
        }
        ;
        var icanvas = createCanvas(fimg.width, fimg.height);
        var ictx = icanvas.getContext("2d");
        ictx.drawImage(fimg, 0, 0);
        var imdata = ictx.getImageData(0, 0, icanvas.width, icanvas.height);
        var idata = imdata.data;
        for (var i = 0; i < idata.length; i += 4) {
            var c = this.apply([idata[i], idata[i + 1], idata[i + 2], idata[i + 3] / 255]);
            idata[i] = c[0];
            idata[i + 1] = c[1];
            idata[i + 2] = c[2];
            idata[i + 3] = Math.round(c[3] * 255);
        }
        ictx.putImageData(imdata, 0, 0);
        return icanvas;
    };
    this.merge = function (cx) {
        return new cxform(this.r_add + cx.r_add, this.g_add + cx.g_add, this.b_add + cx.b_add, this.a_add + cx.a_add, this.r_mult * cx.r_mult / 255, this.g_mult * cx.g_mult / 255, this.b_mult * cx.b_mult / 255, this.a_mult * cx.a_mult / 255);
    };
    this.isEmpty = function () {
        return this.r_add == 0 && this.g_add == 0 && this.b_add == 0 && this.a_add == 0 && this.r_mult == 255 && this.g_mult == 255 && this.b_mult == 255 && this.a_mult == 255;
    };
};

var placeRaw = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {
    ctx.save();
    ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
    if (blendMode > 1) {
        var oldctx = ctx;
        var ncanvas = createCanvas(canvas.width, canvas.height);
        ctx = ncanvas.getContext("2d");
        enhanceContext(ctx);
        ctx.applyTransforms(oldctx._matrix);
    }
    if (blendMode > 1) {
        eval(obj + "(ctx,new cxform(0,0,0,0,255,255,255,255),frame,ratio,time);");
    } else {
        eval(obj + "(ctx,ctrans,frame,ratio,time);");
    }
    if (blendMode > 1) {
        BlendModes.blendCanvas(ctrans.applyToImage(ncanvas), canvas, canvas, blendMode);
        ctx = oldctx;
    }
    ctx.restore();
}

var transformPoint = function (matrix, p) {
    var ret = {};
    ret.x = matrix[0] * p.x + matrix[2] * p.y + matrix[4];
    ret.y = matrix[1] * p.x + matrix[3] * p.y + matrix[5];
    return ret;
}

var transformRect = function (matrix, rect) {
    var minX = Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    var maxX = Number.MIN_VALUE;
    var maxY = Number.MIN_VALUE;
    var point = transformPoint(matrix, {x: rect.xMin, y: rect.yMin});
    if (point.x < minX) {
        minX = point.x;
    }
    if (point.x > maxX) {
        maxX = point.x;
    }
    if (point.y < minY) {
        minY = point.y;
    }
    if (point.y > maxY) {
        maxY = point.y;
    }
    point = transformPoint(matrix, {x: rect.xMax, y: rect.yMin});
    if (point.x < minX) {
        minX = point.x;
    }
    if (point.x > maxX) {
        maxX = point.x;
    }
    if (point.y < minY) {
        minY = point.y;
    }
    if (point.y > maxY) {
        maxY = point.y;
    }
    point = transformPoint(matrix, {x: rect.xMin, y: rect.yMax});
    if (point.x < minX) {
        minX = point.x;
    }
    if (point.x > maxX) {
        maxX = point.x;
    }
    if (point.y < minY) {
        minY = point.y;
    }
    if (point.y > maxY) {
        maxY = point.y;
    }
    point = transformPoint(matrix, {x: rect.xMax, y: rect.yMax});
    if (point.x < minX) {
        minX = point.x;
    }
    if (point.x > maxX) {
        maxX = point.x;
    }
    if (point.y < minY) {
        minY = point.y;
    }
    if (point.y > maxY) {
        maxY = point.y;
    }
    return {xMin: minX, xMax: maxX, yMin: minY, yMax: maxY};
}

var getTranslateMatrix = function (translateX, translateY) {
    return [1, 0, 0, 1, translateX, translateY];
}

var getRectWidth = function (rect) {
    return rect.xMax - rect.xMin;
}

var getRectHeight = function (rect) {
    return rect.yMax - rect.yMin;
}

var rint = function (v) {
    return Math.round(v);
}

var scaleMatrix = function (m, factorX, factorY) {
    var scaleX = 0;
    var rotateSkew0 = 1;
    var rotateSkew1 = 2;
    var scaleY = 3;
    var translateX = 4;
    var translateY = 5;

    var m2 = Object.assign({}, m);

    m2[scaleX] *= factorX;
    m2[scaleY] *= factorY;
    m2[rotateSkew0] *= factorX;
    m2[rotateSkew1] *= factorY;
    return m2;
}

var translateMatrix = function (m, x, y) {
    var m2 = Object.assign({}, m);
    var scaleX = 0;
    var rotateSkew0 = 1;
    var rotateSkew1 = 2;
    var scaleY = 3;
    var translateX = 4;
    var translateY = 5;

    m2[translateX] = m2[scaleX] * x + m2[rotateSkew1] * y + m2[translateX];
    m2[translateY] = m2[rotateSkew0] * x + m2[scaleY] * y + m2[translateY];

    return m2;
}

var place = function (obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time) {
    if(objectCollector){objectCollector.push({obj,matrix:concatMatrix(matrix,ctx._matrix),ctrans,blendMode,frame,ratio,time,location:objectLocation});return;}
    if(groundOnly&&nativeObjectSymbols.has(obj))return;
    if ((typeof scalingGrids[obj]) !== "undefined") {
        var swfScaleMatrix = [1 / 20, 0, 0, 1 / 20, 0, 0];
        var boundRect = boundRects[obj];
        var scalingRect = scalingGrids[obj];
        var exRect = boundRect;
        var newRect = exRect;
        var transform = matrix;

        var transform2;
        newRect = transformRect(transform, exRect);
        transform = Object.assign({}, transform);

        transform = getTranslateMatrix(newRect.xMin, newRect.yMin);

        transform = concatMatrix(swfScaleMatrix, transform);

        var scaleWidth = getRectWidth(newRect) * 20 - scalingRect.xMin - (boundRect.xMax - scalingRect.xMax);
        var originalWidth = getRectWidth(boundRect) - scalingRect.xMin - (boundRect.xMax - scalingRect.xMax);
        var scaleX = scaleWidth / originalWidth;

        var scaleHeight = getRectHeight(newRect) * 20 - scalingRect.yMin - (boundRect.yMax - scalingRect.yMax);
        var originalHeight = getRectHeight(boundRect) - scalingRect.yMin - (boundRect.yMax - scalingRect.yMax);
        var scaleY = scaleHeight / originalHeight;


        //top left
        ctx.save();
        drawPath(ctx, ""
                + "M " + newRect.xMin + " " + newRect.yMin + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMin + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + newRect.xMin + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " Z"
                );
        ctx.clip();
        placeRaw(obj, canvas, ctx, transform, ctrans, blendMode, frame, ratio, time);

        ctx.restore();

        //bottom left
        transform2 = Object.assign({}, transform);
        transform2[5] /*translateY*/ += getRectHeight(newRect) - getRectHeight(boundRect) / 20;

        ctx.save();

        drawPath(ctx, "M " + newRect.xMin + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMax + " "
                + "L " + newRect.xMin + " " + newRect.yMax + " Z"
                )
        ctx.clip();

        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //top right
        transform2 = Object.assign({}, transform);
        transform2[4] /*translateX*/ += getRectWidth(newRect) - getRectWidth(boundRect) / 20;
        ctx.save();
        drawPath(ctx, "M " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + newRect.yMin + " "
                + "L " + newRect.xMax + " " + newRect.yMin + " "
                + "L " + newRect.xMax + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " Z");

        ctx.clip();

        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //bottom right
        transform2 = Object.assign({}, transform);
        transform2[4] /*translateX*/ += getRectWidth(newRect) - getRectWidth(boundRect) / 20;
        transform2[5] /*translateY*/ += getRectHeight(newRect) - getRectHeight(boundRect) / 20;
        ctx.save();
        drawPath(ctx, "M " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + newRect.xMax + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + newRect.xMax + " " + newRect.yMax + " "
                + "L " + (newRect.xMax - rint((exRect.xMax - scalingRect.xMax) / 20)) + " " + newRect.yMax + " Z");

        ctx.clip();

        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();


        //top
        transform2 = Object.assign({}, transform);
        ctx.save();
        transform2 = translateMatrix(transform2, scalingRect.xMin, 0);
        transform2 = scaleMatrix(transform2, scaleX, 1);
        transform2 = translateMatrix(transform2, -scalingRect.xMin, 0);

        drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMin + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + newRect.yMin + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " Z");

        ctx.clip();
        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //left
        transform2 = Object.assign({}, transform);
        ctx.save();
        transform2 = translateMatrix(transform2, 0, scalingRect.yMin);
        transform2 = scaleMatrix(transform2, 1, scaleY);
        transform2 = translateMatrix(transform2, 0, -scalingRect.yMin);

        drawPath(ctx, "M " + newRect.xMin + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + newRect.xMin + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " Z");

        ctx.clip();
        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //bottom
        transform2 = Object.assign({}, transform);
        ctx.save();
        transform2 = translateMatrix(transform2, scalingRect.xMin, 0);
        transform2 = scaleMatrix(transform2, scaleX, 1);
        transform2 = translateMatrix(transform2, -scalingRect.xMin, 0);

        transform2 = translateMatrix(transform2, 0, getRectHeight(newRect) * 20 - getRectHeight(boundRect));

        drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + newRect.yMax + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + newRect.yMax + " Z");

        ctx.clip();
        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //right
        transform2 = Object.assign({}, transform);
        ctx.save();
        transform2 = translateMatrix(transform2, 0, scalingRect.yMin)
        transform2 = scaleMatrix(transform2, 1, scaleY);
        transform2 = translateMatrix(transform2, 0, -scalingRect.yMin);

        transform2 = translateMatrix(transform2, getRectWidth(newRect) * 20 - getRectWidth(boundRect), 0);

        drawPath(ctx, "M " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + newRect.xMax + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + newRect.xMax + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " Z");

        ctx.clip();
        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();

        //center
        transform2 = Object.assign({}, transform);
        ctx.save();
        transform2 = translateMatrix(transform2, scalingRect.xMin, scalingRect.yMin)
        transform2 = scaleMatrix(transform2, scaleX, scaleY);
        transform2 = translateMatrix(transform2, -scalingRect.xMin, -scalingRect.yMin);

        drawPath(ctx, "M " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMin + rint(scalingRect.yMin / 20)) + " "
                + "L " + (newRect.xMax - rint((boundRect.xMax - scalingRect.xMax) / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " "
                + "L " + (newRect.xMin + rint(scalingRect.xMin / 20)) + " " + (newRect.yMax - rint((boundRect.yMax - scalingRect.yMax) / 20)) + " Z");

        ctx.clip();
        placeRaw(obj, canvas, ctx, transform2, ctrans, blendMode, frame, ratio, time);
        ctx.restore();
        return;
    }
    placeRaw(obj, canvas, ctx, matrix, ctrans, blendMode, frame, ratio, time);
}

var tocolor = function (c) {
    var r = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
    return r;
};


function drawMorphPath(ctx, p, ratio, doStroke, scaleMode) {
    var parts = p.split(" ");
    var len = parts.length;
    if (doStroke) {
        for (var i = 0; i < len; i++) {
            switch (parts[i]) {
                case '':
                    break;
                case 'L':
                case 'M':
                case 'Q':
                    break;
                default:
                    var k = ctx.applyTransformToPoint({x: parts[i], y: parts[i + 2]});
                    parts[i] = k.x;
                    parts[i + 2] = k.y;
                    k = ctx.applyTransformToPoint({x: parts[i + 1], y: parts[i + 3]});
                    parts[i + 1] = k.x;
                    parts[i + 3] = k.y;
                    i += 3;
            }
        }

        switch (scaleMode) {
            case "NONE":
                break;
            case "NORMAL":
                ctx.lineWidth *= 20 * Math.max(ctx._matrix[0], ctx._matrix[3]);
                break;
            case "VERTICAL":
                ctx.lineWidth *= 20 * ctx._matrix[3];
                break;
            case "HORIZONTAL":
                ctx.lineWidth *= 20 * ctx._matrix[0];
                break;
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.beginPath();
    var drawCommand = "";
    for (var i = 0; i < len; i++) {
        switch (parts[i]) {
            case 'L':
            case 'M':
            case 'Q':
                drawCommand = parts[i];
                break;
            default:
                switch (drawCommand) {
                    case 'L':
                        ctx.lineTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio));
                        i += 3;
                        break;
                    case 'M':
                        ctx.moveTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio));
                        i += 3;
                        break;
                    case 'Q':
                        ctx.quadraticCurveTo(useRatio(parts[i], parts[i + 1], ratio), useRatio(parts[i + 2], parts[i + 3], ratio),
                                useRatio(parts[i + 4], parts[i + 5], ratio), useRatio(parts[i + 6], parts[i + 7], ratio));
                        i += 7;
                        break;
                }
                break;
        }
    }
    if (doStroke) {
        ctx.stroke();
        ctx.restore();
    }
}

function useRatio(v1, v2, ratio) {
    return v1 * 1 + (v2 - v1) * ratio / 65535;
}

function drawPath(ctx, p, doStroke, scaleMode) {
//console.log("drawing "+p)
    var parts = p.split(" ");
    var len = parts.length;
    if (doStroke) {
        for (var i = 0; i < len; i++) {
            switch (parts[i]) {
                case 'L':
                case 'M':
                case 'Q':
                case 'Z':
                    break;
                default:
                    var k = ctx.applyTransformToPoint({x: parts[i], y: parts[i + 1]});
                    parts[i] = k.x;
                    parts[i + 1] = k.y;
                    i++;
            }
        }

        switch (scaleMode) {
            case "NONE":
                break;
            case "NORMAL":
                ctx.lineWidth *= 20 * Math.max(ctx._matrix[0], ctx._matrix[3]);
                break;
            case "VERTICAL":
                ctx.lineWidth *= 20 * ctx._matrix[3];
                break;
            case "HORIZONTAL":
                ctx.lineWidth *= 20 * ctx._matrix[0];
                break;
        }

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.beginPath();
    var drawCommand = "";
    for (var i = 0; i < len; i++) {
        switch (parts[i]) {
            case 'L':
            case 'M':
            case 'Q':
                drawCommand = parts[i];
                break;
            case 'Z':
                ctx.closePath();
                break;
            default:
                switch (drawCommand) {
                    case 'L':
                        ctx.lineTo(parts[i], parts[i + 1]);
                        i++;
                        break;
                    case 'M':
                        ctx.moveTo(parts[i], parts[i + 1]);
                        i++;
                        break;
                    case 'Q':
                        ctx.quadraticCurveTo(parts[i], parts[i + 1], parts[i + 2], parts[i + 3]);
                        i += 3;
                        break;
                }
                break;
        }
    }
    if (doStroke) {
        ctx.stroke();
        ctx.restore();
    }
}
var scalingGrids = {};
var boundRects = {};
function shape3915(ctx,ctrans,frame,ratio,time){
	var pathData="M -222 -10 Q -196 -1 -196 7 L -201 16 -216 25 Q -201 39 -201 49 -201 59 -250 89 L -241 104 -236 121 -241 128 -248 122 Q -248 130 -261 143 -298 142 -298 153 L -295 163 -289 172 -226 148 Q -212 148 -203 164 -196 176 -196 184 -196 190 -203 204 L -215 218 -222 213 -241 213 -255 216 -263 224 -221 263 Q -206 275 -206 304 L -211 313 -272 325 -306 342 -280 353 Q -266 357 -266 369 -266 378 -277 384 L -307 390 -328 386 -363 390 -374 394 -414 369 -446 342 Q -446 330 -434 314 -421 296 -418 284 -414 264 -390 250 L -357 234 -406 186 Q -403 175 -403 151 -403 143 -421 137 -438 132 -438 114 -438 90 -402 78 -366 65 -366 54 -366 49 -375 41 -383 33 -383 24 -383 5 -343 -2 L -284 -10 Q -253 -20 -222 -10";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -364 556 L -372 563 -375 548 -364 556";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -280 -2 L -296 0 -298 6 -304 2 Q -292 -16 -257 -8 L -254 -5 -258 -1 -280 -2";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -311 -8 L -308 -5 Q -316 5 -378 14 L -369 30 -345 37 -355 49 -350 59 -353 69 -335 66 -333 72 -338 79 Q -334 80 -321 70 L -317 77 -300 74 -299 78 -304 90 -294 95 -287 89 -270 85 -252 85 -244 90 -269 94 -283 96 -293 103 -323 87 -402 93 Q -425 101 -434 107 -429 109 -427 120 -425 129 -402 132 -392 142 -392 148 -392 156 -395 161 L -406 179 Q -399 183 -379 203 L -371 212 Q -362 212 -344 235 L -306 226 -299 230 -303 235 -289 227 -276 219 Q -294 216 -294 206 -294 194 -256 174 -217 154 -217 182 L -217 184 -235 175 Q -252 175 -256 185 -262 197 -277 200 L -279 204 -266 211 -261 218 -277 234 -280 237 -278 239 -278 245 -254 249 -235 252 -212 255 -231 261 -255 259 -276 255 -281 258 -286 260 -292 258 -293 254 -299 259 -320 273 -325 270 Q -327 266 -331 266 -336 266 -339 271 L -345 275 -364 260 Q -377 277 -414 282 L -416 286 -414 288 -422 308 -424 317 Q -431 339 -446 352 -437 359 -431 359 L -427 357 -423 355 -379 393 -336 384 Q -329 384 -317 393 L -296 397 -296 392 -287 395 -283 394 -279 398 -265 405 -264 404 -250 404 -250 415 -326 420 Q -416 432 -416 472 L -415 486 -424 472 -424 476 -430 477 -436 476 -445 414 Q -450 378 -460 354 L -461 357 -466 357 -467 352 Q -442 333 -426 251 -426 238 -433 198 L -438 144 Q -437 134 -442 118 L -441 113 -442 108 Q -442 90 -399 82 L -385 79 -393 53 -397 22 Q -397 7 -385 9 L -383 7 -329 -2 -311 -8 M -358 58 L -360 67 -356 59 -358 58 M -329 246 L -330 244 -338 242 -336 244 -329 246 M -457 354 L -457 352 -457 350 -460 353 -457 354";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -98 97 L -101 100 -106 92 -101 92 -98 97";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -326 420 L -374 431 -380 398 Q -380 386 -361 382 -339 376 -316 395 -298 398 -290 416 L -326 420";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -255 97 L -256 101 -269 103 -283 106 -305 105 -311 100 -324 99 -329 88 -383 92 -397 89 -373 88 -346 82 -320 83 -312 93 -289 99 -276 95 -255 97 M -312 95 Q -325 88 -325 89 L -322 96 -312 95 M -228 268 L -300 257 -301 252 -311 266 Q -314 276 -328 276 L -358 272 Q -363 272 -373 278 L -388 285 -392 284 -376 272 -354 265 Q -350 265 -348 269 L -329 269 -314 248 Q -308 239 -295 251 L -263 256 -225 264 -228 268";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -169 19 L -178 17 -174 19 -169 19 M -186 11 L -161 13 Q -143 18 -138 30 L -160 35 Q -163 35 -167 39 L -178 42 -194 29 Q -187 20 -187 15 L -186 11 M -191 107 L -205 106 -229 83 -196 81 -188 82 -190 90 -184 98 -191 107 M -109 175 L -107 179 -116 193 -133 196 -143 195 -144 190 Q -144 171 -110 175 L -109 175 M -160 141 Q -160 149 -173 151 L -184 149 -178 140 -162 137 -160 141 M -219 232 L -211 224 Q -182 222 -167 238 -167 252 -186 252 -210 252 -217 244 L -220 236 -219 232 M -254 352 Q -251 351 -251 340 L -205 340 -203 341 -202 344 -211 357 -243 364 -255 363 -256 354 -254 352 M -162 283 Q -143 277 -143 293 L -166 312 -178 308 -180 303 Q -180 288 -162 283";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3916(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3915",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3917(ctx,ctrans,frame,ratio,time){
	var pathData="M 834 424 L 835 425 Q 825 428 820 436 808 439 794 454 744 467 710 498 L 710 499 Q 687 509 651 508 L 621 503 616 497 582 512 Q 534 511 534 488 L 455 475 Q 426 471 426 456 426 448 436 443 L 456 438 477 443 486 446 490 442 474 437 469 428 481 406 500 381 Q 491 368 483 368 474 368 454 384 436 400 417 400 408 400 398 393 L 389 386 363 391 328 388 288 384 Q 274 379 271 374 L 270 360 271 348 292 332 277 316 Q 266 306 265 294 L 223 313 204 308 187 319 Q 180 319 168 290 L 163 278 Q 149 273 149 269 149 263 154 259 L 157 256 158 249 145 253 134 253 131 251 112 250 91 254 63 249 48 239 40 239 24 247 13 246 -3 238 -23 230 -49 229 Q -67 223 -70 219 L -71 208 Q -71 195 -47 190 -25 184 -25 177 L -20 165 Q -20 155 -40 155 L -60 157 -77 151 -77 173 -75 177 -78 179 Q -86 179 -86 172 L -83 167 -83 149 -112 150 Q -127 150 -139 158 L -162 166 -157 171 -146 175 -163 176 -190 159 -172 140 Q -166 134 -138 115 L -105 87 Q -85 61 -35 30 L -25 23 14 33 20 40 25 47 32 50 35 50 35 51 40 53 70 58 103 64 118 62 121 61 139 59 182 59 199 66 211 78 205 90 214 90 214 97 239 113 274 130 Q 287 136 287 148 L 281 159 Q 281 169 320 169 L 399 170 Q 447 178 458 192 L 471 221 482 252 Q 491 275 499 275 L 532 265 Q 562 254 568 254 583 255 627 278 673 302 680 303 714 310 733 330 752 351 740 371 L 744 373 765 368 Q 776 368 792 386 L 809 407 834 424 M 125 292 L 127 298 128 304 129 305 127 305 124 293 121 294 117 297 106 292 105 287 Q 105 277 121 277 L 140 279 141 282 Q 141 293 126 292 L 125 292 M 126 358 L 132 359 128 355 126 356 126 358 M 112 350 L 115 347 136 348 137 350 135 353 136 359 143 365 135 365 133 368 Q 132 373 125 372 L 121 372 113 370 108 369 Q 110 365 117 366 L 118 366 112 350 M 183 356 Q 183 331 207 339 232 348 232 361 L 222 374 205 383 Q 188 383 184 369 L 183 356 M 46 276 L 43 280 43 287 36 294 28 299 24 295 13 296 -12 290 -27 278 -19 267 9 260 17 266 30 264 36 266 47 270 48 273 46 276 M 18 360 Q 18 368 5 374 L -28 380 Q -42 380 -43 374 L -41 364 -49 357 -42 344 -10 338 -8 334 6 336 16 336 18 342 11 348 16 354 18 360 M 242 434 Q 242 410 295 421 347 431 347 449 347 473 309 473 277 473 257 455 242 442 242 434 M 327 444 L 326 457 335 454 336 449 Q 336 441 327 444 M 526 557 L 511 554 516 563 521 564 526 557 M 526 577 L 482 581 Q 463 581 454 561 L 449 542 452 527 496 528 Q 517 539 539 556 539 572 526 577 M -192 198 L -192 228 -173 235 -211 230 Q -234 222 -234 213 L -230 203 -200 199 -189 190 -192 198 M -19 351 L -25 352 -15 352 -14 351 -19 351";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 490 429 L 480 427 Q 507 396 523 397 L 527 402 520 404 Q 505 404 503 417 501 429 490 429 M 735 479 L 710 498 697 511 693 511 691 507 Q 691 499 713 488 725 482 735 479";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 825 430 L 797 408 765 384 762 386 757 386 762 391 762 395 755 396 717 387 709 393 691 393 657 383 Q 640 379 637 368 L 618 368 608 373 599 378 592 384 578 401 576 407 585 437 575 447 540 457 536 455 Q 547 448 564 444 L 574 436 569 414 570 404 531 401 521 396 521 392 524 391 542 396 570 395 589 373 Q 602 358 628 353 L 634 352 Q 642 352 645 357 L 647 361 662 362 687 368 706 368 710 365 720 347 722 339 721 339 724 338 726 332 702 324 647 306 608 278 561 256 Q 532 285 508 285 L 494 281 489 281 477 278 475 276 474 277 474 276 464 274 Q 446 273 439 301 L 435 314 435 316 426 363 Q 414 396 396 396 L 386 391 377 386 365 390 355 392 347 389 347 377 348 375 347 375 350 374 353 378 356 380 373 376 Q 384 376 396 385 406 385 411 353 L 415 329 414 329 Q 392 329 375 313 357 297 335 295 L 325 305 272 311 250 318 241 317 239 311 Q 253 303 323 294 L 318 290 318 284 326 283 Q 363 284 376 301 387 318 413 318 L 416 317 417 310 422 310 430 286 Q 436 259 465 263 L 464 252 466 234 464 206 463 196 437 194 Q 413 194 392 184 373 174 338 174 L 289 175 278 182 272 180 279 174 238 172 234 183 217 189 214 189 214 193 206 193 198 191 196 188 185 192 160 195 151 201 140 206 136 205 135 200 153 194 151 191 144 196 119 200 Q 105 200 101 194 L 100 188 105 177 Q 92 164 75 164 L 73 162 51 164 44 161 47 157 52 154 79 157 Q 94 158 104 165 L 113 175 108 185 Q 105 191 116 191 L 133 189 149 183 151 187 154 183 Q 158 179 161 179 L 167 184 165 189 176 189 199 182 200 182 195 179 203 173 215 177 Q 226 177 228 171 L 230 161 261 164 276 161 276 159 282 144 Q 282 135 260 128 L 222 113 214 102 214 103 198 109 197 110 198 116 198 119 198 121 198 127 195 129 195 130 201 134 205 138 Q 211 138 214 141 L 214 153 211 151 200 145 187 143 187 134 188 134 185 133 183 135 175 128 172 122 162 124 145 120 144 128 139 136 124 135 127 137 121 136 116 133 121 131 137 129 136 120 Q 137 113 144 113 L 156 116 167 114 173 116 177 115 176 114 178 109 182 109 198 75 199 77 199 76 200 72 195 68 180 65 172 61 147 63 121 68 113 69 105 72 70 63 55 63 50 64 45 63 40 63 35 66 24 66 24 63 -16 75 -17 76 0 82 5 88 -17 111 -52 126 -53 126 -25 108 Q -9 101 -7 88 L -5 87 -21 82 -29 77 Q -29 70 0 60 L 7 58 6 56 20 44 20 43 21 44 21 43 4 34 -11 31 -44 36 -35 30 -19 18 -11 20 -3 20 3 26 12 28 29 29 31 30 32 29 35 32 39 38 40 40 40 43 41 45 73 50 114 60 Q 142 40 178 44 216 47 227 72 L 220 77 222 83 222 86 252 100 277 117 286 120 Q 308 129 310 139 L 310 164 353 164 395 170 408 178 441 181 466 185 468 182 470 187 472 188 490 217 495 224 Q 506 232 518 251 L 518 273 Q 533 270 544 258 L 557 242 586 258 635 289 Q 645 297 675 305 L 744 322 Q 755 329 755 341 L 749 351 749 359 753 358 764 364 801 388 833 418 838 420 845 424 Q 832 424 825 430 M 518 273 L 508 272 Q 506 272 507 274 L 518 273 M 735 335 L 734 339 738 336 735 335 M 215 85 L 214 84 215 84 214 81 214 84 214 86 213 86 212 87 214 86 214 89 215 85 M 244 114 L 239 108 224 93 Q 226 105 233 109 L 244 115 244 114 M 302 164 L 301 161 300 164 302 164 M 204 185 L 204 186 206 186 205 185 204 185 M 180 53 L 143 58 118 64 121 64 167 56 178 56 181 58 180 53 M 195 138 L 193 137 193 138 195 138 M 160 186 L 156 188 156 189 160 186";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 719 490 L 715 489 735 472 750 464 757 468 720 490 719 490 M 156 180 L 157 187 147 196 150 184 Q 150 179 152 180 L 156 180 M -5 98 L 2 91 -4 101 -5 98";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 815 437 L 807 426 762 388 753 391 749 393 746 395 668 382 668 378 672 377 734 384 Q 744 384 754 372 758 369 805 397 L 811 408 816 419 828 428 820 435 815 437 M 445 199 Q 438 192 418 184 L 387 181 376 176 Q 405 166 458 193 L 468 187 473 192 473 269 468 272 Q 453 271 453 221 453 207 445 199 M 568 246 L 599 264 Q 631 283 641 295 648 304 689 312 726 318 726 333 L 710 376 706 378 Q 700 374 700 368 L 696 371 688 376 685 374 682 371 669 375 647 372 628 354 628 350 637 348 Q 661 363 667 363 L 675 363 682 358 691 356 699 343 705 328 681 319 632 305 605 282 Q 579 262 568 261 L 553 266 532 276 528 276 545 262 564 246 568 246 M 562 394 L 522 392 516 389 Q 530 384 546 389 556 392 568 380 L 579 370 579 379 588 370 Q 602 355 616 353 L 624 356 Q 596 366 576 394 L 568 390 562 394 M 715 333 L 713 331 712 334 715 333 M 206 73 L 195 94 179 116 168 116 168 111 187 75 165 62 Q 145 62 125 69 L 121 71 96 76 Q 90 76 87 72 L 82 64 28 61 27 60 30 57 39 56 84 58 90 66 97 71 121 65 124 64 161 58 182 59 193 62 202 63 205 63 205 69 206 73 M 212 109 L 209 110 205 108 204 115 203 116 200 121 195 121 194 119 200 107 207 95 210 101 211 101 218 93 Q 226 116 265 122 L 266 125 264 127 285 145 275 158 262 168 255 165 254 159 266 135 255 132 251 132 Q 237 131 223 121 L 212 109 M 208 172 L 201 178 188 182 165 179 165 176 Q 190 180 205 163 L 222 162 225 162 227 168 208 172 M 146 122 L 149 119 165 119 172 120 Q 170 125 177 132 L 175 134 Q 165 133 168 124 L 158 123 159 129 153 136 141 140 126 137 126 131 135 133 Q 151 133 150 127 L 151 123 149 123 146 122 M 20 55 L 3 59 Q -14 64 -17 77 L -18 77 -19 71 -27 77 -15 92 -23 102 -38 114 -42 112 -25 92 -37 79 -29 66 Q -19 56 -8 57 L -11 61 -5 60 -7 56 3 48 -12 38 -44 38 -50 40 -35 30 -23 31 -14 27 Q -11 25 -1 33 L 11 39 21 49 16 51 19 51 20 55";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3918(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3917",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3919(ctx,ctrans,frame,ratio,time){
	var pathData="M 821 306 L 817 291 818 286 Q 836 310 862 310 L 869 310 845 313 Q 827 313 821 306";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 828 171 L 831 192 816 213 Q 807 223 804 231 L 744 229 706 223 643 236 646 237 720 257 Q 776 272 777 277 L 776 284 768 287 699 291 563 295 Q 523 306 486 322 461 324 421 303 L 389 304 Q 358 318 337 310 321 303 320 292 L 326 277 336 267 Q 278 288 228 259 192 238 190 222 189 212 243 177 L 215 165 173 182 170 185 141 194 Q 152 197 154 202 L 157 213 141 219 99 220 Q 74 213 70 205 60 182 80 147 36 110 -55 156 -95 175 -125 202 L -191 210 -293 207 -294 204 -282 205 Q -248 205 -132 94 L -72 36 Q -25 21 57 19 175 14 181 30 L 182 39 124 49 120 53 120 58 Q 140 86 154 89 L 282 79 Q 329 112 338 135 L 342 151 347 154 381 143 374 159 371 160 425 160 436 147 492 145 Q 490 136 495 133 L 591 123 645 126 641 122 642 119 648 118 674 124 677 123 675 119 677 111 748 140 Q 800 163 801 166 L 821 172 828 171 M 114 297 L 98 325 7 323 Q 13 305 49 291 96 273 114 297 M 69 230 L 70 237 115 250 138 227 140 237 136 248 59 261 43 259 30 263 Q -8 275 -16 257 -19 249 -12 240 1 225 46 221 65 219 69 230 M 3 155 L 23 160 Q 42 166 45 172 L 45 187 Q 38 203 5 213 L -44 216 Q -61 214 -66 203 L -67 186 Q -55 173 3 155";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 789 178 L 787 179 785 178 781 177 785 177 789 178 M 716 178 L 710 179 714 177 716 178 M 246 98 L 247 99 234 102 246 98 M 270 125 L 272 126 263 126 262 126 270 125 M 225 130 L 229 130 219 138 220 136 225 130 M 365 181 L 400 185 355 180 365 181 M -133 96 L -138 104 Q -147 117 -166 126 L -133 96";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 824 168 L 825 168 827 165 831 192 825 203 805 207 798 206 762 209 760 209 772 200 752 198 735 196 729 197 744 208 746 210 728 206 692 203 Q 680 203 665 213 L 669 221 668 230 631 232 615 231 604 232 611 232 649 246 735 257 Q 743 259 758 274 L 774 291 Q 775 301 772 297 L 741 303 706 305 690 294 699 288 739 289 746 285 732 273 Q 688 272 634 256 585 242 583 232 581 217 611 215 L 633 217 634 215 Q 626 206 629 200 633 193 676 188 L 685 189 743 187 750 191 775 191 786 191 788 191 797 189 Q 809 186 807 178 805 162 745 142 703 128 672 125 L 664 122 460 167 450 175 439 175 Q 429 165 377 162 L 365 162 311 176 295 173 285 170 252 170 251 167 246 162 247 161 242 162 219 165 218 166 215 165 208 168 183 173 177 181 173 182 170 188 170 190 162 199 Q 144 222 130 226 L 122 228 119 222 Q 132 213 135 200 L 142 177 Q 156 153 248 140 259 139 263 151 268 162 277 162 L 342 150 325 130 305 107 286 88 Q 270 83 242 88 L 179 109 177 111 172 108 Q 154 98 152 92 145 81 123 73 110 68 107 73 L 106 70 106 67 110 69 124 64 127 63 128 63 134 62 148 50 180 30 Q 174 21 145 20 L 115 22 58 26 12 29 4 24 -26 42 -110 73 -80 44 -2 14 Q 31 -1 67 2 L 153 6 Q 200 8 207 24 L 211 37 200 42 Q 166 53 149 65 171 70 177 84 L 178 92 173 95 176 97 260 71 Q 315 57 331 101 L 344 126 363 146 383 141 374 159 371 160 425 160 438 145 462 144 Q 633 103 661 102 777 143 824 168 M 9 19 L 7 20 14 20 9 19";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -191 149 L -189 150 -200 159 -205 160 -191 149";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -149 116 L -142 104 -132 94 -122 85 -121 87 Q -111 111 -138 125 L -183 142 -159 120 -149 116 M 143 52 L 135 69 109 89 101 82 Q 99 80 103 73 L 112 60 90 49 127 43 Q 140 44 143 52 M 587 238 L 590 236 643 245 718 264 716 270 621 257 Q 593 247 587 238 M 686 195 Q 673 216 643 217 L 633 216 631 212 653 195 Q 671 185 686 195 M 623 123 L 637 121 703 138 710 137 710 138 689 144 640 129 571 149 477 170 461 169 440 170 Q 444 178 438 185 428 198 396 199 369 201 351 189 L 332 171 341 166 Q 347 167 359 178 371 187 394 186 430 184 431 169 430 154 455 153 L 533 141 Q 565 129 600 123 L 603 127 Q 599 132 604 133 L 623 123";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3920(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3919",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3921(ctx,ctrans,frame,ratio,time){
	var pathData="M 15 191 L 12 186 32 175 Q 29 193 19 193 L 15 191";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 818 187 L 827 195 813 207 813 212 812 232 809 233 808 233 809 279 809 307 812 307 809 311 807 346 806 344 807 338 802 320 803 319 803 314 800 316 799 317 787 313 776 315 767 314 767 309 773 309 760 304 Q 756 304 754 308 L 753 311 755 316 739 336 754 346 755 357 751 374 Q 700 371 700 405 L 704 425 Q 671 460 658 460 646 460 641 441 L 638 431 629 420 615 420 599 423 557 415 534 404 507 404 504 400 508 394 512 388 514 383 516 378 510 372 489 368 469 381 452 394 454 402 443 419 421 432 414 428 390 427 360 408 349 397 340 389 Q 334 389 325 398 L 318 402 301 402 284 399 273 393 Q 268 393 257 404 L 272 419 272 427 Q 266 426 251 432 L 231 442 220 442 202 438 189 442 Q 176 442 166 435 L 150 431 149 427 177 378 164 354 Q 164 350 191 331 217 311 217 290 L 216 280 207 270 192 270 180 278 136 278 110 279 107 282 115 288 Q 119 290 119 295 L 93 323 87 319 62 328 Q 50 336 43 336 L 39 334 Q 39 345 35 345 L 17 343 12 338 9 339 6 338 6 232 4 225 6 215 Q 6 210 9 208 L 15 191 19 193 Q 29 193 32 175 L 41 168 69 152 96 152 97 153 98 152 101 152 166 152 183 162 Q 199 172 213 172 L 221 170 224 170 269 162 285 156 292 155 328 164 375 174 393 172 397 172 442 158 534 136 571 136 586 140 591 141 593 142 629 154 682 167 739 161 760 162 769 162 Q 781 166 794 173 802 202 817 199 L 817 193 818 193 817 192 818 187 M 474 468 Q 474 463 494 451 513 440 520 439 L 552 441 Q 583 445 583 455 583 465 567 474 L 533 483 516 479 507 472 477 472 474 468 M 789 408 Q 782 442 760 442 727 442 727 421 L 728 416 723 416 Q 722 411 729 405 735 400 743 398 L 738 397 728 400 Q 730 393 736 393 L 775 394 Q 789 394 789 408 M 147 362 L 132 394 97 415 81 414 65 421 62 419 50 419 Q 41 415 39 400 L 39 386 Q 39 376 42 372 L 61 365 Q 65 358 76 354 L 97 347 128 347 Q 147 351 147 362 M 16 255 L 12 243 12 274 16 255 M 14 297 L 12 291 12 307 14 297 M 74 359 L 68 361 66 362 74 359 M 98 483 L 92 484 Q 74 484 71 468 L 67 461 75 455 91 450 107 450 113 454 119 459 124 465 124 467 128 476 125 477 122 475 Q 116 483 99 483 L 98 483 M 290 447 L 302 434 Q 312 426 328 426 343 426 357 438 369 448 369 456 L 361 463 345 467 339 463 338 457 312 465 302 465 294 458 294 453 Q 294 446 297 444 L 297 443 290 447 M 377 510 L 380 507 410 503 411 503 415 503 Q 429 503 429 514 L 427 522 405 526 Q 378 526 378 517 L 383 513 377 513 377 510 M 394 512 L 402 516 397 512 394 512 M 281 521 L 275 525 278 526 279 527 275 529 267 528 258 529 Q 246 529 242 524 L 242 523 239 522 240 517 241 517 Q 243 509 269 504 L 276 504 Q 289 504 289 511 L 281 521 M 249 525 L 252 525 248 524 249 525 M 616 499 L 634 497 652 501 654 509 Q 654 531 632 531 620 531 616 525 L 607 521 602 514 Q 602 507 613 508 L 613 505 604 509 Q 606 503 614 500 L 616 499";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 69 152 Q 96 140 134 140 L 193 153 Q 226 165 237 165 L 266 155 Q 282 145 315 145 L 343 155 387 165 Q 417 165 469 140 522 115 569 115 598 115 634 128 670 140 697 140 L 790 148 813 152 818 183 818 187 817 192 817 193 817 199 Q 802 202 794 173 781 166 769 162 L 760 162 739 161 682 167 629 154 593 142 591 141 586 140 571 136 534 136 442 158 397 172 393 172 375 174 328 164 292 155 285 156 269 162 224 170 221 170 213 172 Q 199 172 183 162 L 166 152 101 152 98 152 97 153 96 152 69 152";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 831 198 L 824 198 785 178 Q 753 161 740 161 L 695 171 696 176 698 185 699 185 699 188 699 190 699 192 716 198 733 209 730 212 721 215 720 214 725 210 727 209 Q 717 203 696 199 L 694 199 691 198 642 236 Q 665 250 675 265 L 672 268 695 281 689 283 681 294 670 294 669 293 Q 673 287 682 283 L 653 267 625 277 622 277 622 270 Q 635 262 651 262 L 651 261 647 259 649 255 651 257 654 257 644 249 Q 632 241 627 242 L 626 238 627 236 Q 614 237 611 241 L 607 251 569 253 565 252 603 246 608 240 612 236 610 234 611 232 620 232 632 231 637 225 648 216 655 212 663 208 674 199 685 190 685 189 677 179 674 176 649 182 645 181 Q 646 179 657 176 L 636 166 625 162 592 156 586 155 573 164 583 169 593 175 562 187 558 186 Q 561 181 576 174 574 174 571 171 L 567 164 561 167 558 166 557 164 572 153 562 151 544 145 546 146 544 147 535 144 531 141 524 140 494 149 447 165 419 177 419 178 418 181 408 181 404 183 405 183 Q 416 186 416 191 L 416 192 452 213 492 219 Q 491 227 462 239 L 460 238 476 227 476 226 469 226 453 220 440 217 405 231 403 231 402 228 397 231 401 233 417 237 418 240 411 246 402 256 395 256 409 241 394 232 394 230 395 230 Q 397 222 426 209 L 399 195 380 191 345 202 343 201 360 193 362 192 345 197 341 196 368 188 365 187 348 192 340 192 356 184 341 180 279 164 231 181 229 182 232 184 232 189 225 189 218 186 190 195 Q 207 201 207 211 L 205 217 165 224 155 239 130 264 125 262 Q 116 262 96 272 L 99 280 95 281 90 276 88 271 Q 88 267 117 257 145 247 145 239 L 143 237 152 223 149 221 160 212 184 211 169 200 174 198 174 197 170 196 173 195 180 189 181 189 184 187 202 179 198 177 149 158 128 161 60 162 55 167 34 188 28 197 Q 21 197 15 206 L 4 213 3 211 5 206 Q 0 203 -6 203 L 9 188 10 187 41 168 Q 51 160 63 154 L 97 153 111 152 169 152 183 158 186 158 187 160 Q 205 167 216 174 L 226 170 229 170 Q 266 169 274 156 L 285 156 330 165 350 171 381 175 384 173 395 169 394 168 397 168 442 153 529 133 529 132 539 131 540 130 542 129 545 130 547 130 544 129 545 128 591 141 629 154 682 167 751 159 754 160 753 158 759 157 764 157 795 173 831 194 831 198 M 667 169 L 667 167 626 157 644 165 661 174 661 175 670 172 667 169 M 688 177 L 687 177 688 178 688 177 M 757 162 L 779 170 756 161 757 162 M 412 173 L 411 173 400 176 404 176 412 174 412 173 M 484 222 L 473 219 483 222 484 222 M 590 152 L 620 160 596 153 590 152 M 577 150 L 578 149 541 141 540 141 575 149 577 150 M 557 134 L 560 134 558 133 557 134 M 534 137 L 568 143 539 135 534 137 M 227 180 L 231 178 227 179 227 180 M 232 172 L 231 171 229 173 232 172 M 379 183 L 377 185 383 183 378 182 379 183 M 387 179 L 392 180 394 180 389 179 387 179 M 332 170 L 343 173 347 173 332 170 M 393 186 L 387 188 404 191 403 188 395 186 393 186 M 183 203 L 178 203 183 204 183 203 M 118 259 L 117 260 129 257 118 259";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 642 258 L 636 258 Q 639 253 647 253 L 642 258";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 754 159 L 749 167 718 164 717 164 715 164 694 179 693 179 Q 675 189 675 171 675 164 684 159 697 153 702 145 691 148 688 140 L 697 140 750 142 754 159 M 527 138 L 525 140 524 140 524 141 473 156 457 164 453 163 451 161 446 159 433 163 409 168 Q 392 183 390 165 419 164 469 140 509 121 546 117 L 537 128 527 138 M 291 162 L 283 168 258 180 226 187 219 184 215 172 219 162 237 165 266 155 Q 278 147 301 146 L 301 150 291 162 M 99 159 L 93 155 61 155 Q 82 144 110 142 L 120 149 115 157 112 159 104 162 99 159";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 754 159 L 761 159 755 166 810 193 810 199 802 199 777 184 Q 761 174 743 171 L 750 170 750 168 739 171 699 178 700 186 703 191 703 193 698 193 693 179 694 179 715 164 717 164 718 164 749 167 754 159 M 619 167 Q 610 165 608 160 607 156 602 156 588 156 578 166 L 582 167 578 173 570 174 566 172 568 170 552 166 554 160 557 160 573 164 Q 574 159 593 149 L 595 151 Q 596 149 598 149 607 149 628 160 647 171 648 176 L 645 177 619 167 M 656 247 L 654 248 644 243 Q 637 237 635 237 L 669 215 694 199 696 197 700 196 Q 694 209 650 238 L 656 247 M 625 237 L 625 243 Q 620 244 608 252 L 585 258 577 257 622 235 625 237 M 453 163 L 457 164 473 156 524 141 524 140 525 140 527 138 529 138 551 140 553 142 569 146 578 149 578 153 569 154 560 154 530 144 434 179 437 180 425 188 400 186 Q 402 182 414 179 L 410 178 453 163 M 426 183 L 423 183 422 184 426 183 M 409 237 L 405 236 401 232 435 217 433 215 441 214 443 213 445 215 467 220 471 222 472 224 465 226 Q 469 226 473 229 L 473 231 470 232 Q 449 232 438 221 418 237 409 237 M 423 213 L 399 205 378 195 343 205 337 205 335 202 Q 342 192 371 190 L 384 190 402 193 Q 408 193 427 212 L 423 213 M 524 142 L 517 145 526 143 524 142 M 291 162 L 294 164 314 171 357 182 355 183 351 184 357 185 358 187 353 189 318 178 283 168 291 162 M 226 187 L 222 187 218 190 226 191 216 197 202 198 199 195 Q 199 191 221 186 L 219 184 226 187 M 112 159 L 125 159 154 159 158 159 185 165 Q 200 172 204 182 L 177 198 193 206 193 208 183 208 183 212 175 212 170 216 162 216 153 222 147 224 145 225 Q 152 212 179 209 175 202 169 202 L 169 195 192 180 194 179 171 171 162 166 147 168 126 168 114 170 105 169 61 169 63 170 63 172 57 170 39 185 6 218 4 212 Q 4 205 27 184 L 58 159 62 164 71 162 72 159 99 159 104 162 112 159";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3922(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3921",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3927(ctx,ctrans,frame,ratio,time){
	var pathData="M -18 291 L -22 306 -46 313 -70 310 -63 310 Q -37 310 -19 286 L -18 291";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1093 204 L 1092 207 990 210 924 202 Q 894 175 854 156 763 110 719 147 739 182 729 205 725 213 700 220 L 658 219 642 213 645 202 658 194 629 185 626 182 584 165 556 177 Q 610 212 609 222 607 238 571 259 521 288 463 267 L 473 277 479 292 Q 478 303 462 310 441 318 410 304 L 378 303 Q 338 324 313 322 276 306 236 295 L 100 291 31 287 23 284 Q 21 284 22 277 23 272 79 257 L 153 237 156 236 93 223 55 229 -5 231 -17 213 -32 192 -29 171 -22 172 -2 166 51 140 122 111 124 119 122 123 Q 122 127 125 124 L 151 118 157 119 158 122 154 126 208 123 304 133 Q 309 136 307 145 L 363 147 374 160 428 160 425 159 418 143 452 154 457 151 461 135 Q 470 112 517 79 L 645 89 Q 659 86 679 58 L 679 53 675 49 617 39 Q 614 39 618 30 624 14 742 19 824 21 871 36 L 931 94 Q 1047 205 1081 205 L 1093 204 M 865 203 Q 860 214 843 216 L 794 213 Q 761 203 754 187 L 754 172 Q 757 166 776 160 L 796 155 Q 854 173 866 186 L 865 203 M 815 257 Q 807 275 769 263 L 756 259 740 261 Q 679 258 663 248 658 245 659 237 L 661 227 684 250 729 237 730 230 Q 734 219 753 221 798 225 811 240 818 249 815 257 M 750 291 Q 786 305 792 323 L 701 325 685 297 Q 703 273 750 291";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 965 126 Q 946 117 937 104 L 932 96 965 126 M 18 177 L 14 178 12 179 10 178 14 177 18 177 M 89 179 L 83 178 85 177 89 179 M 537 126 L 536 126 527 126 529 125 537 126 M 574 130 L 579 136 580 138 570 130 574 130 M 434 181 L 444 180 399 185 434 181 M 552 99 L 553 98 565 102 552 99";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 909 73 Q 840 46 825 42 L 795 24 787 29 741 26 684 22 654 20 Q 625 21 619 30 626 37 651 50 655 59 665 62 L 671 63 672 63 675 64 689 69 693 67 693 70 692 73 Q 689 68 676 73 654 81 647 92 L 627 108 622 111 620 109 557 88 Q 529 83 513 88 L 494 107 474 130 457 150 522 162 Q 531 162 536 151 540 139 551 140 643 153 657 177 L 664 200 Q 667 213 680 222 L 677 228 669 226 Q 655 222 637 199 L 629 190 629 188 626 182 622 181 616 173 591 168 584 165 581 166 580 165 557 162 552 161 553 162 548 167 547 170 514 170 504 173 488 176 434 162 422 162 Q 370 165 360 175 L 349 175 339 167 135 122 127 125 Q 96 128 54 142 -6 162 -8 178 -10 186 2 189 L 11 191 13 191 24 191 49 191 56 187 114 189 123 188 Q 166 193 170 200 173 206 165 215 L 166 217 188 215 Q 218 217 216 232 214 242 165 256 111 272 67 273 L 53 285 60 289 100 288 109 294 93 305 58 303 27 297 Q 24 301 25 291 L 41 274 64 257 150 246 188 232 195 232 184 231 168 232 131 230 Q 128 230 130 221 L 134 213 Q 119 203 107 203 L 71 206 53 210 55 208 70 197 64 196 47 198 27 200 39 209 37 209 1 206 -6 207 -26 203 -32 192 -28 165 -26 168 -25 168 Q 22 143 138 102 166 103 337 144 L 361 145 374 160 428 160 425 159 416 141 436 146 455 126 468 101 Q 484 57 539 71 L 623 97 626 95 621 92 622 84 Q 628 70 650 65 633 53 599 42 L 588 37 592 24 Q 599 8 646 6 L 732 2 Q 768 -1 801 14 L 879 44 909 73 M 792 20 L 790 19 785 20 792 20";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1004 160 L 999 159 988 150 990 149 1004 160";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 941 104 L 948 116 958 120 982 142 937 125 Q 910 111 920 87 L 921 85 931 94 941 104 M 687 60 L 696 73 698 82 690 89 664 69 Q 653 56 656 52 659 44 672 43 L 709 49 687 60 M 448 189 Q 430 201 403 199 371 198 361 185 355 178 359 170 L 338 169 322 170 228 149 159 129 110 144 89 138 89 137 96 138 162 121 176 123 195 133 Q 200 132 196 127 L 199 123 Q 234 129 266 141 L 344 153 Q 369 154 368 169 369 184 405 186 428 187 440 178 452 167 458 166 L 467 171 448 189 M 212 238 Q 206 247 178 257 L 83 270 81 264 Q 102 255 156 245 L 209 236 212 238";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 168 212 L 166 216 156 217 Q 126 216 113 195 128 185 146 195 L 168 212";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 549 88 L 557 92 567 96 568 98 559 108 555 106 547 110 542 114 541 115 545 113 555 113 556 117 552 122 564 127 570 125 585 129 591 135 585 139 562 133 540 127 523 129 518 129 517 125 Q 517 120 534 110 L 554 100 554 99 Q 546 99 542 95 L 542 88 549 88";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3928(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3927",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3929(ctx,ctrans,frame,ratio,time){
	var pathData="M 198 -6 L 216 -9 227 -13 303 -13 Q 309 -3 331 9 355 21 373 21 L 397 17 458 17 Q 505 28 505 54 L 501 68 497 80 Q 497 89 512 98 526 106 522 124 519 135 531 162 L 490 142 435 152 436 164 454 165 Q 469 183 489 195 L 491 205 Q 534 208 545 252 L 557 280 573 279 593 294 598 294 604 294 605 297 608 313 608 314 608 317 619 320 646 321 672 322 707 345 724 333 728 340 730 350 739 358 744 369 745 380 737 393 739 394 Q 753 402 753 412 719 453 693 453 L 679 449 675 451 Q 672 473 642 484 L 519 497 Q 508 497 500 490 L 491 480 467 476 Q 450 472 450 465 L 458 453 424 421 423 419 434 411 442 410 455 409 451 404 427 380 358 344 Q 345 332 348 318 352 304 364 305 L 415 298 408 294 370 267 365 262 371 259 385 257 387 244 386 240 390 211 389 211 389 206 Q 372 198 372 187 L 377 171 Q 380 161 370 156 L 346 152 Q 336 152 314 176 L 300 189 Q 273 182 267 200 L 265 200 Q 257 200 236 185 215 170 215 164 215 155 234 126 224 116 226 103 L 222 104 Q 215 108 194 96 185 91 185 84 L 183 74 162 66 172 50 166 43 150 42 143 50 125 55 Q 110 55 98 31 L 82 18 Q 75 17 75 11 75 3 97 -7 L 152 -14 173 -11 Q 178 -6 198 -6";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 419 162 L 413 171 Q 410 181 416 197 L 423 216 407 228 397 232 Q 399 221 393 215 L 408 214 403 195 Q 398 177 401 167 L 402 161 419 162 M 366 115 Q 359 115 356 109 L 360 108 380 100 388 89 Q 388 83 346 69 L 295 52 300 49 310 49 365 66 Q 396 75 396 89 L 391 104 Q 383 115 366 115";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 184 -4 L 255 -16 Q 294 -19 336 -2 L 375 15 408 11 449 16 488 24 503 40 504 55 501 83 516 95 531 108 530 114 535 137 535 162 534 163 Q 511 156 490 142 L 439 151 Q 440 139 445 137 451 134 467 137 L 469 133 480 119 499 119 Q 512 108 515 108 L 513 107 Q 495 101 490 92 L 489 77 493 54 485 37 451 29 393 23 375 27 Q 369 27 357 18 L 341 9 263 -7 Q 239 7 173 7 L 155 6 153 2 131 1 Q 123 2 123 -5 L 128 -11 153 -11 164 -5 184 -4 M 736 401 L 720 428 707 442 727 432 748 420 736 401 M 716 364 L 727 369 Q 717 344 708 338 L 654 322 637 327 622 322 619 321 617 326 628 337 635 337 Q 650 340 661 349 687 345 716 364 M 569 433 L 572 433 584 418 572 421 569 433 M 589 348 L 589 364 599 388 614 387 632 387 636 376 644 370 660 374 689 395 694 394 Q 697 381 707 383 L 719 386 721 386 728 386 723 379 722 378 673 362 673 363 668 368 654 362 642 352 632 348 589 348 M 603 303 L 596 299 596 301 614 308 609 302 603 303 M 427 165 L 423 163 454 165 Q 471 184 491 197 L 495 198 511 206 545 221 550 227 553 258 Q 560 281 588 297 L 588 294 586 293 575 283 570 279 573 279 593 294 598 294 614 294 614 295 Q 622 301 622 309 L 622 310 625 311 653 311 713 328 734 359 735 363 743 382 744 382 743 385 Q 762 404 762 419 L 756 427 755 435 759 444 748 526 743 525 Q 743 516 735 502 L 727 503 723 524 712 523 Q 712 582 693 582 685 582 674 553 660 514 640 489 L 637 489 586 495 Q 584 495 577 488 586 477 610 475 L 617 475 618 472 620 471 624 474 651 470 Q 671 462 671 437 L 680 436 Q 687 441 699 442 L 713 427 731 400 Q 715 401 705 408 L 702 407 701 406 693 405 686 404 677 396 664 396 647 385 640 396 640 397 628 404 603 402 579 441 568 440 560 445 546 441 537 433 482 419 506 416 544 425 560 430 Q 565 413 576 407 L 590 400 591 399 591 398 584 397 575 385 Q 563 375 550 374 L 546 367 534 360 525 357 522 367 507 383 508 385 517 397 516 398 519 400 503 396 498 395 483 375 Q 494 367 511 367 L 518 355 511 353 493 355 472 333 479 332 490 341 499 348 506 347 523 349 523 348 527 349 527 350 542 353 Q 551 356 556 366 L 572 373 571 372 572 371 578 372 574 355 Q 584 338 588 336 L 613 336 609 327 612 319 Q 587 311 564 296 L 548 283 530 278 543 274 Q 550 249 540 225 L 484 207 Q 448 194 436 186 424 179 427 165";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 746 443 L 740 471 Q 740 477 748 484 L 756 460 760 435 Q 760 421 756 417 752 419 746 443";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 436 149 L 442 147 456 145 447 153 443 159 447 164 445 173 439 169 436 171 433 170 433 156 436 149";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 411 92 L 407 100 Q 401 107 387 107 L 381 103 402 90 Q 392 75 358 66 322 56 313 46 359 58 378 65 411 75 411 92 M 590 361 L 594 348 Q 603 354 603 390 L 602 405 599 405 590 361 M 532 268 L 535 270 539 274 551 284 545 286 526 283 516 280 514 288 510 296 506 293 508 274 506 271 508 271 509 267 513 267 513 270 530 268 532 268 M 592 309 L 567 295 562 294 563 290 569 290 595 306 631 318 631 320 624 322 639 324 685 324 713 339 712 339 696 332 677 328 657 327 648 327 648 328 638 329 Q 618 329 617 321 L 592 309 M 422 174 L 411 169 419 163 473 204 517 217 Q 539 224 546 232 L 544 233 532 227 510 222 481 211 450 198 427 182 422 174";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3930(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3929",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj357=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/357.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj357,"assets/takeover/art/images/357.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj357.src="assets/takeover/art/images/357.png";
function image357(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 12000 16000 12000 16000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.00125,0,0,1.0016666666666667,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj357);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape358(ctx,ctrans,frame,ratio,time){
	var pathData="M 16000 12000 L 0 12000 0 0 16000 0 16000 12000";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.00125,0,0,1.0016666666666667,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj357);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape359(ctx,ctrans,frame,ratio,time){
	var pathData="M 2191 -2824 L 2194 -2821 2145 -2470 2152 -2537 Q 2173 -2718 2191 -2824 M 1943 -1218 Q 1834 -480 1834 99 1834 201 1639 1093 L 1579 1367 1549 1505 Q 1530 1473 1489 1492 L 1509 1367 1529 1261 1680 668 Q 1765 336 1769 121 L 1771 71 Q 1784 6 1784 -41 L 1779 -81 Q 1812 -522 1943 -1218 M 1483 1797 L 1369 2281 1334 2286 Q 1330 2267 1332 2236 1384 2103 1421 1932 L 1425 1922 1483 1797 M 1266 2216 L 1265 2215 1266 2215 1266 2216 M 1186 2161 L 1092 2096 1109 2048 1140 2097 1186 2161 M 1041 2060 L 997 2030 Q 1011 2024 1021 2012 1034 1996 1039 1941 L 1046 1949 1039 2021 1041 2060 M 54 1371 L 84 1389 Q 65 1394 50 1402 L 54 1371";
	ctx.fillStyle=tocolor(ctrans.apply([113,88,72,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -1848 -1179 L -1853 -1164 Q -1836 -1176 -1814 -1199 L -1826 -1202 -1848 -1179 M -769 2125 L -781 2116 Q -810 2178 -847 2223 -886 2271 -911 2271 -970 2271 -1002 2239 -1034 2206 -1076 2206 -1100 2206 -1123 2161 L -1166 2054 Q -1234 1885 -1333 1836 -1338 1846 -1353 1851 -1401 1779 -1550 1401 L -1563 1367 Q -1718 968 -1718 841 L -1698 658 -1678 474 Q -1678 358 -1938 177 L -2117 53 Q -2198 -7 -2198 -36 -2198 -142 -2158 -260 L -2075 -462 Q -1965 -718 -1998 -914 -1998 -961 -1975 -1007 L -1989 -1006 Q -1998 -1005 -1998 -1036 -1998 -1070 -1872 -1194 L -1847 -1217 -1848 -1219 -1836 -1228 Q -1751 -1306 -1703 -1324 -1478 -1478 -1146 -1657 -629 -1938 -426 -1946 L -421 -1931 -570 -1858 Q 15 -2092 217 -2182 717 -2407 914 -2586 991 -2656 1218 -2770 1497 -2910 1634 -3001 1791 -3104 1990 -2991 2053 -2955 2115 -2900 2063 -2726 1996 -2421 1905 -1999 1834 -1796 1735 -1510 1682 -1229 1599 -1123 1539 -1008 1459 -855 1459 -759 L 1540 -258 1581 -52 Q 1544 297 1469 818 L 1355 1615 Q 1204 1801 1189 1801 L 1179 1798 1200 1711 Q 1249 1500 1271 1367 1289 1260 1289 1204 L 1159 439 Q 1159 199 1055 -562 1074 -878 1074 -971 1074 -993 994 -1182 L 961 -1262 Q 931 -1498 929 -1557 942 -1616 964 -1683 1014 -1832 1014 -1891 1014 -1980 999 -2055 L 1014 -2121 Q 999 -2118 986 -2107 965 -2177 929 -2231 895 -2283 871 -2270 844 -2256 844 -2166 844 -2141 864 -2027 884 -1914 884 -1889 884 -1879 832 -1743 779 -1608 779 -1499 779 -1415 812 -1277 L 884 -984 Q 982 -555 989 -44 L 957 70 Q 899 298 899 446 899 515 992 991 L 1060 1367 Q 1084 1524 1084 1586 L 1067 1760 1009 1741 959 1756 Q 959 1725 952 1706 936 1661 889 1661 704 1661 704 2029 704 2089 710 2118 723 2192 769 2211 L 794 2198 769 2361 734 2366 703 2245 674 2126 Q 625 2191 604 2247 592 2277 583 2312 575 2332 546 2337 L 424 2341 Q 357 2341 277 2409 198 2476 169 2476 120 2476 107 2430 99 2376 89 2361 L 79 2361 Q 81 2409 27 2502 L -71 2656 Q -104 2635 -142 2585 -62 2516 9 2162 79 1813 79 1666 79 1637 93 1539 L 111 1404 149 1411 Q 210 1411 248 1367 296 1310 305 1180 299 919 319 856 410 866 420 898 429 926 489 926 527 926 550 896 569 870 569 836 L 587 570 604 304 Q 604 -52 559 -198 L 559 -199 Q 540 -259 515 -283 L 512 -290 510 -296 Q 532 -310 549 -334 506 -337 494 -410 L 494 -411 529 -461 Q 569 -526 569 -566 569 -598 558 -605 L 529 -614 Q 515 -609 495 -588 507 -664 542 -722 594 -808 594 -871 594 -1066 469 -910 429 -860 383 -783 344 -717 344 -711 L 370 -490 380 -429 Q 339 -364 339 -349 L 379 -259 Q 402 -222 430 -200 L 429 -191 442 75 Q 454 336 454 461 350 578 267 755 179 944 179 1071 179 1161 189 1311 L 144 1316 110 1261 Q 81 1221 39 1221 L -3 1229 -16 1236 -46 1367 -113 1635 -137 1739 Q -155 1747 -179 1771 -264 1856 -296 1946 L -369 2125 Q -414 2237 -431 2291 -505 2522 -560 2730 -576 2632 -646 2566 -718 2498 -732 2360 L -738 2301 Q -719 2356 -691 2356 -681 2356 -600 2251 -516 2142 -516 2109 -516 2088 -548 2028 -581 1968 -581 1921 L -562 1784 Q -543 1667 -546 1606 -552 1501 -598 1433 -620 1401 -630 1367 -641 1334 -641 1301 -641 1271 -543 810 -446 349 -446 244 -446 202 -500 87 -557 -35 -618 -112 -692 -205 -735 -181 -788 -152 -786 51 -799 205 -808 494 L -816 794 -798 1138 -787 1367 -781 1566 Q -781 1934 -775 2037 L -769 2125";
	ctx.fillStyle=tocolor(ctrans.apply([98,73,64,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 2115 -2900 L 2149 -3006 2199 -3001 2199 -2866 2191 -2824 Q 2173 -2718 2152 -2537 L 2145 -2470 Q 2124 -2272 2124 -2161 2124 -2101 1974 -1376 L 1962 -1317 1953 -1275 1943 -1218 Q 1812 -522 1779 -81 L 1784 -41 Q 1784 6 1771 71 L 1769 121 Q 1765 336 1680 668 L 1529 1261 1509 1367 1489 1492 Q 1530 1473 1549 1505 1564 1530 1564 1591 1564 1615 1483 1797 L 1425 1922 1421 1932 Q 1384 2103 1332 2236 1299 2322 1259 2391 L 1252 2382 Q 1244 2375 1244 2346 1244 2321 1264 2226 L 1266 2216 1266 2215 1265 2215 Q 1227 2207 1186 2161 L 1140 2097 1109 2048 1092 2096 Q 1071 2150 1054 2171 L 1042 2075 1041 2060 1039 2021 1046 1949 1039 1941 Q 1034 1996 1021 2012 1011 2024 997 2030 955 2045 874 2011 872 2025 838 2078 808 2137 814 2186 809 2186 797 2195 L 794 2198 769 2211 Q 723 2192 710 2118 704 2089 704 2029 704 1661 889 1661 936 1661 952 1706 959 1725 959 1756 L 1009 1741 1067 1760 1084 1586 Q 1084 1524 1060 1367 L 992 991 Q 899 515 899 446 899 298 957 70 L 989 -44 Q 982 -555 884 -984 L 812 -1277 Q 779 -1415 779 -1499 779 -1608 832 -1743 884 -1879 884 -1889 884 -1914 864 -2027 844 -2141 844 -2166 844 -2256 871 -2270 895 -2283 929 -2231 965 -2177 986 -2107 999 -2118 1014 -2121 L 999 -2055 Q 1014 -1980 1014 -1891 1014 -1832 964 -1683 942 -1616 929 -1557 931 -1498 961 -1262 L 994 -1182 Q 1074 -993 1074 -971 1074 -878 1055 -562 1159 199 1159 439 L 1289 1204 Q 1289 1260 1271 1367 1249 1500 1200 1711 L 1179 1798 1189 1801 Q 1204 1801 1355 1615 L 1469 818 Q 1544 297 1581 -52 L 1540 -258 1459 -759 Q 1459 -855 1539 -1008 1599 -1123 1682 -1229 1735 -1510 1834 -1796 1905 -1999 1996 -2421 2063 -2726 2115 -2900 M -142 2585 Q -161 2601 -181 2601 -244 2601 -261 2569 L -266 2538 Q -501 3051 -551 3051 -596 3051 -610 3019 L -616 2981 Q -616 2941 -564 2743 L -560 2730 Q -505 2522 -431 2291 -414 2237 -369 2125 L -296 1946 Q -264 1856 -179 1771 -155 1747 -137 1739 L -113 1635 -46 1367 -16 1236 -3 1229 39 1221 Q 81 1221 110 1261 L 144 1316 189 1311 Q 179 1161 179 1071 179 944 267 755 350 578 454 461 454 336 442 75 L 429 -191 430 -200 Q 402 -222 379 -259 L 339 -349 Q 339 -364 380 -429 L 370 -490 344 -711 Q 344 -717 383 -783 429 -860 469 -910 594 -1066 594 -871 594 -808 542 -722 507 -664 495 -588 515 -609 529 -614 L 558 -605 Q 569 -598 569 -566 569 -526 529 -461 L 494 -411 494 -410 Q 506 -337 549 -334 532 -310 510 -296 L 512 -290 515 -283 Q 540 -259 559 -199 L 559 -198 Q 604 -52 604 304 L 587 570 569 836 Q 569 870 550 896 527 926 489 926 429 926 420 898 410 866 319 856 299 919 305 1180 296 1310 248 1367 210 1411 149 1411 L 111 1404 93 1539 Q 79 1637 79 1666 79 1813 9 2162 -62 2516 -142 2585 M -738 2301 Q -758 2243 -769 2125 L -775 2037 Q -781 1934 -781 1566 L -787 1367 -798 1138 -816 794 -808 494 Q -799 205 -786 51 -788 -152 -735 -181 -692 -205 -618 -112 -557 -35 -500 87 -446 202 -446 244 -446 349 -543 810 -641 1271 -641 1301 -641 1334 -630 1367 -620 1401 -598 1433 -552 1501 -546 1606 -543 1667 -562 1784 L -581 1921 Q -581 1968 -548 2028 -516 2088 -516 2109 -516 2142 -600 2251 -681 2356 -691 2356 -719 2356 -738 2301 M 54 1371 L 50 1402 Q 65 1394 84 1389 L 54 1371";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite360(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape359",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj362=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/362.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj362,"assets/takeover/art/images/362.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj362.src="assets/takeover/art/images/362.png";
function image362(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 4140 5260 4140 5260 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0038022813688212,0,0,1.0048309178743962,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj362);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape363(ctx,ctrans,frame,ratio,time){
	var pathData="M -2634 -2076 L 2626 -2076 2626 2064 -2634 2064 -2634 -2076";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2634,-2076);
	ctx.transform(1.0038022813688212,0,0,1.0048309178743962,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj362);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M -2634 -2796 L 2626 -2796 2626 1344 -2634 1344 -2634 -2796";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2634,-2796);
	ctx.transform(1.0038022813688212,0,0,1.0048309178743962,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj362);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj364=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/364.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj364,"assets/takeover/art/images/364.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj364.src="assets/takeover/art/images/364.png";
function image364(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 5360 5360 5360 5360 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0037313432835822,0,0,1.0037313432835822,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj364);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape365(ctx,ctrans,frame,ratio,time){
	var pathData="M -2680 -2598 L 2680 -2598 2680 2762 -2680 2762 -2680 -2598";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2680,-2598);
	ctx.transform(1.0037313432835822,0,0,1.0037313432835822,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj364);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj366=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/366.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj366,"assets/takeover/art/images/366.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj366.src="assets/takeover/art/images/366.png";
function image366(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 5360 5360 5360 5360 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0037313432835822,0,0,1.0037313432835822,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj366);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape367(ctx,ctrans,frame,ratio,time){
	var pathData="M -2680 -2680 L 2680 -2680 2680 2680 -2680 2680 -2680 -2680";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2680,-2680);
	ctx.transform(1.0037313432835822,0,0,1.0037313432835822,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj366);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj368=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/368.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj368,"assets/takeover/art/images/368.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj368.src="assets/takeover/art/images/368.png";
function image368(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 4140 5260 4140 5260 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0038022813688212,0,0,1.0048309178743962,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj368);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape369(ctx,ctrans,frame,ratio,time){
	var pathData="M -2680 -2073 L 2580 -2073 2580 2067 -2680 2067 -2680 -2073";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2680,-2073);
	ctx.transform(1.0038022813688212,0,0,1.0048309178743962,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj368);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite370(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape363",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape365",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape367",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape369",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj371=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/371.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj371,"assets/takeover/art/images/371.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj371.src="assets/takeover/art/images/371.png";
function image371(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 620 1160 620 1160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj371);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape372(ctx,ctrans,frame,ratio,time){
	var pathData="M 520 300 L -640 300 -640 -320 520 -320 520 300";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-640,-320);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj371);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj373=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/373.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj373,"assets/takeover/art/images/373.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj373.src="assets/takeover/art/images/373.png";
function image373(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 620 1160 620 1160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj373);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape374(ctx,ctrans,frame,ratio,time){
	var pathData="M 520 300 L -640 300 -640 -320 520 -320 520 300";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-640,-320);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj373);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape5495(ctx,ctrans,frame,ratio,time){
	var pathData="M 4191 -90 L 7860 -90 7565 215 4348 908 Q 4299 788 4275 692 4241 552 4223 371 4214 279 4200 43 L 4191 -90 M 7860 0 L 7897 0 Q 7911 -42 7910 -90 L 15998 -90 15999 6613 Q 15602 7227 15209 7669 14642 8304 14301 8304 14028 8304 13875 8292 L 13733 8279 Q 13168 8279 12688 8470 12413 8579 12177 8747 12138 8730 12092 8727 12007 8723 11948 8772 11882 8826 11882 8925 11882 8951 11893 8981 11760 9105 11708 9161 11633 9244 11599 9318 L 11596 9326 Q 11542 9381 11542 9475 L 11546 9516 11505 9812 Q 11442 10274 10989 11028 10874 11220 10637 11584 10439 11890 10380 11999 L 0 11999 0 5980 31 5980 Q 91 5697 516 5467 646 5396 828 5323 L 1021 5244 Q 1050 5228 1084 5200 1185 5114 1322 4913 1448 4727 1524 4575 1657 4311 1857 3725 2029 3221 2117 3102 2333 2812 2621 2678 2719 2633 2838 2599 L 3003 2556 Q 3283 2473 3426 2320 L 3580 2146 Q 3695 2019 3831 1901 3945 1803 4139 1721 4377 1620 4736 1545 4936 1503 5662 1402 5922 1366 6065 1324 6162 1296 6442 1204 6639 981 6770 843 6937 666 6998 627 7025 609 7110 578 7198 545 7308 476 L 7458 377 7575 287 7610 260 7616 256 7565 265 7860 0 M 3852 899 Q 3970 990 3970 1146 3971 1233 3867 1359 3731 1523 3456 1688 3322 1769 3105 1813 L 3040 1826 Q 2908 1853 2899 1858 2810 1924 2624 2038 L 2524 2100 Q 2184 2309 2066 2372 1913 2452 1867 2535 L 1866 2536 1834 2610 Q 1810 2662 1779 2704 1667 2852 1459 2933 1257 3010 994 3010 680 3010 490 2869 290 2721 290 2467 290 2349 364 2211 391 2161 432 2100 495 2007 593 1889 644 1825 777 1713 937 1577 1068 1506 L 1067 1506 Q 1105 1483 1190 1365 1300 1211 1385 1129 1711 811 2279 811 2349 811 2567 869 L 2766 925 Q 2833 924 2970 870 L 3113 812 3120 810 3531 808 Q 3736 808 3853 899 L 3852 899 M 2189 40 Q 1965 132 1639 303 1395 431 1152 572 605 862 207 1093 17 1203 -126 1294 L -126 -67 2421 -67 Q 2297 -5 2189 40 M 11981 9571 Q 12269 9233 12687 9233 L 12849 9250 13011 9267 13323 9257 Q 13436 9247 13873 9254 14112 9294 14192 9357 14247 9399 14247 9486 14247 9526 14128 9666 13983 9838 13780 9989 13180 10434 12433 10434 12232 10434 11980 10202 11899 10127 11825 10042 11767 9971 11767 9965 11767 9926 11819 9821 11883 9687 11981 9571 M 12882 11401 L 12886 11329 Q 12886 11284 12983 11150 13084 11014 13231 10862 13611 10473 13912 10370 14680 10109 15360 10562 15586 10712 15759 10913 15899 11076 15899 11121 15899 11605 14232 11605 L 14143 11616 14067 11638 Q 13940 11670 13646 11670 13096 11670 12940 11516 12888 11466 12882 11401 M 15914 8755 L 15988 8755 15988 9775 15914 9775 15914 9766 15633 9742 Q 15308 9704 15067 9619 14888 9557 14789 9478 14700 9407 14700 9342 14700 9241 14798 9182 14838 9158 14895 9141 L 15048 9093 Q 15129 9062 15160 9013 15241 8892 15313 8849 L 15319 8845 Q 15434 8780 15633 8762 L 15887 8755 15914 8756 15914 8755";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj375=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/375.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj375,"assets/takeover/art/images/375.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj375.src="assets/takeover/art/images/375.png";
function image375(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 620 1160 620 1160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj375);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5496(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,5817.0,1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6718.0,-47.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2653.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.512725830078125,0.0,0.0,0.512725830078125,1298.0,2647.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,491.0,1328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,1092.0,1766.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,1211.0,1306.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6431.0,-12.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,992.0,-101.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1912.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5811.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6571.0,-581.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5386.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2196.0,3004.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6671.0,736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2640.0,-1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4221.0,-1084.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6023.0,-1144.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,7363.0,-724.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6391.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4852.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3038.0,3736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1379.0,3416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-129.0,2841.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,823.0,-1085.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-263.0,154.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-658.0,-1085.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-858.0,2703.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-810.0,879.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-178.0,-438.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,5081.0,-1816.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,3552.0,-1916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,1944.0,-1864.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,-658.0,-1864.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,4696.0,-321.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,5501.0,2447.0],ctrans,1,(0+time)%4,0,time);
			place("sprite407",canvas,ctx,[1.0,0.0,0.0,1.0,4891.0,1414.0],ctrans,1,(0+time)%4,0,time);
			place("sprite426",canvas,ctx,[1.0,0.0,0.0,1.0,2931.0,2530.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape376(ctx,ctrans,frame,ratio,time){
	var pathData="M 520 300 L -640 300 -640 -320 520 -320 520 300";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-640,-320);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj375);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj377=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/377.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj377,"assets/takeover/art/images/377.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj377.src="assets/takeover/art/images/377.png";
function image377(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 620 1160 620 1160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj377);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5497(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,4917.0,1324.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2653.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.512725830078125,0.0,0.0,0.512725830078125,1298.0,2647.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,491.0,1328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,1092.0,1766.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,1211.0,1306.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,992.0,-101.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1912.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5811.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5386.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2196.0,3004.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-338.0,-332.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-1133.0,1440.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-1657.0,-47.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-277.0,251.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4852.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3038.0,3736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1379.0,3416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-129.0,2841.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4730.0,3949.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3638916015625,0.0,0.0,0.3638916015625,-2045.0,743.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,-778.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,724.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3642.0,3616.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,-40.0,1946.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,-1646.0,702.0],ctrans,1,(0+time)%4,0,time);
			place("sprite416",canvas,ctx,[1.0,0.0,0.0,1.0,3473.0,829.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape378(ctx,ctrans,frame,ratio,time){
	var pathData="M 520 300 L -640 300 -640 -320 520 -320 520 300";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-640,-320);
	ctx.transform(1.0172413793103448,0,0,1.032258064516129,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj377);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5498(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,5817.0,1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6718.0,-47.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2653.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.512725830078125,0.0,0.0,0.512725830078125,1298.0,2647.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,491.0,1328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,1092.0,1766.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,1211.0,1306.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6431.0,-12.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,992.0,-101.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1912.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5811.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6571.0,-581.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5386.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2196.0,3004.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6671.0,736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2640.0,-1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4221.0,-1084.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6023.0,-1144.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1063.0,-1758.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6391.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4852.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3038.0,3736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1379.0,3416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,351.0,841.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,933.0,-2302.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,2065.0,-2148.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,3502.0,-1949.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,4994.0,-1908.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,602.0,-416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,462.0,-1688.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,297.0,-225.0],ctrans,1,(0+time)%4,0,time);
			place("sprite407",canvas,ctx,[1.0,0.0,0.0,1.0,4536.0,-1957.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,3093.0,3653.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function sprite379(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape372",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape374",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape376",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape378",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite5499(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,5817.0,1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6718.0,-47.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2653.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.512725830078125,0.0,0.0,0.512725830078125,1298.0,2647.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,491.0,1328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,1207.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,1211.0,1306.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6431.0,-12.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,992.0,-101.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1912.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5811.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6571.0,-581.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5386.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2196.0,3004.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6671.0,736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2640.0,-1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4221.0,-1084.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6023.0,-1144.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1504.0,-1144.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6391.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4852.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3038.0,3736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1379.0,3416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,771.0,583.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,-33.0,3405.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,2065.0,-2148.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,3502.0,-1949.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,4994.0,-1908.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,1089.0,-660.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,6040.0,3471.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,3442.0,2082.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,1360.0,-207.0],ctrans,1,(0+time)%4,0,time);
			place("sprite426",canvas,ctx,[1.0,0.0,0.0,1.0,1111.0,2186.0],ctrans,1,(0+time)%4,0,time);
			place("sprite416",canvas,ctx,[1.0,0.0,0.0,1.0,2620.0,-742.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj380=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/380.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj380,"assets/takeover/art/images/380.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj380.src="assets/takeover/art/images/380.png";
function image380(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 800 1160 800 1160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0172413793103448,0,0,1.025,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj380);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5500(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,5187.0,933.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,6163.0,13.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2653.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.512725830078125,0.0,0.0,0.512725830078125,1298.0,2647.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,491.0,1328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,1207.0,2206.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,1211.0,1306.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6431.0,-12.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,992.0,-101.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1912.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5811.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,6571.0,-581.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5386.0,2294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2196.0,3004.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5671.0,500.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,2640.0,-1104.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4221.0,-1084.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5104.0,-1184.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1504.0,-1144.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,5403.0,2354.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4852.0,3264.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3038.0,3736.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,1379.0,3416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,771.0,583.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,4364.0,4602.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,6343.0,-1043.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,3502.0,-1949.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,2590.0,4602.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,1089.0,-660.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4133453369140625,0.0,0.0,0.4133453369140625,4881.0,3557.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3475189208984375,0.0,0.0,0.3475189208984375,6881.0,-1047.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,5921.0,-287.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,5501.0,2447.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,2714.0,-1137.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape381(ctx,ctrans,frame,ratio,time){
	var pathData="M 665 150 L -495 150 -495 -650 665 -650 665 150";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-495,-650);
	ctx.transform(1.0172413793103448,0,0,1.025,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj380);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5501(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.5965423583984375,0.0,0.0,0.5965423583984375,4837.0,1026.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7835235595703125,0.0,0.0,0.7835235595703125,2991.0,1671.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3680419921875,0.0,0.0,0.3680419921875,4552.0,2686.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.2456512451171875,0.0,0.0,0.2456512451171875,2071.0,-532.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5327301025390625,0.0,0.0,0.5327301025390625,2904.0,394.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.296234130859375,0.0,0.0,0.296234130859375,2281.0,3085.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4747161865234375,0.0,0.0,0.4747161865234375,4202.0,356.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1787.0,149.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,5616.0,-183.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,1604.0,1860.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,2726.0,-1021.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,3504.0,-659.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4765.0,-481.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3265380859375,0.0,0.0,0.3265380859375,4766.0,-801.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4756.0,2170.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3491.0,2916.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,3772.0,-884.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4817657470703125,0.0,0.0,0.4817657470703125,4581.0,-724.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.313079833984375,0.0,0.0,0.313079833984375,3637.0,-1097.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,3123.0,2.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,1700.0,1227.0],ctrans,1,(0+time)%4,0,time);
			place("sprite407",canvas,ctx,[1.0,0.0,0.0,1.0,3903.0,2577.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,4761.0,1357.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj382=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/382.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj382,"assets/takeover/art/images/382.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj382.src="assets/takeover/art/images/382.png";
function image382(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1060 1560 1060 1560 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0128205128205128,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj382);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5502(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite3751",canvas,ctx,[0.54144287109375,-0.8387451171875,0.8387451171875,0.54144287109375,4263.0,2566.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.35888671875,-0.62115478515625,0.863037109375,0.4986114501953125,4868.0,1979.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.5920257568359375,-0.4694671630859375,0.708343505859375,0.711944580078125,5232.0,1699.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.768768310546875,-0.636260986328125,0.636260986328125,0.768768310546875,4173.0,2138.0],ctrans,1,(0+time)%4,0,time);
			place("sprite1972",canvas,ctx,[0.632843017578125,0.0836639404296875,-0.1307373046875,0.98883056640625,3565.0,2712.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.25,0.0,0.0,1.25,3334.0,1808.0],ctrans,1,(0+time)%4,0,time);
			place("sprite1972",canvas,ctx,[0.57427978515625,-0.0279083251953125,0.048492431640625,0.99737548828125,3709.0,2493.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.1345367431640625,-0.7928009033203125,0.9813385009765625,0.166534423828125,3008.0,3652.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,5039.0,1304.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,2471.0,2883.0],ctrans,1,(0+time)%1,0,time);
			place("sprite439",canvas,ctx,[0.9908294677734375,0.1040191650390625,-0.1040191650390625,0.9908294677734375,4625.0,2358.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9842529296875,0.1552886962890625,-0.1552886962890625,0.9842529296875,5267.0,2689.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9925079345703125,0.0828399658203125,-0.0828399658203125,0.9925079345703125,5989.0,3110.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0715789794921875,-0.8007354736328125,0.991180419921875,0.0886077880859375,2690.0,4187.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,1900.0,607.0],ctrans,1,(0+time)%1,0,time);
			place("sprite433",canvas,ctx,[0.8499908447265625,0.0,0.0,0.8499908447265625,5250.0,4782.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.2503509521484375,-0.7616424560546875,0.944793701171875,-0.3159942626953125,5324.0,4011.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.4191436767578125,-0.6818389892578125,0.84735107421875,-0.5243072509765625,5402.0,4673.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.4935760498046875,-0.3041534423828125,0.6177825927734375,0.7884063720703125,5754.0,1569.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.5350341796875,-0.2225189208984375,0.4856719970703125,0.875396728515625,6302.0,1579.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.563018798828125,-0.1359710693359375,0.3425140380859375,0.9402008056640625,6694.0,1641.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.5473480224609375,-0.1898956298828125,0.432037353515625,0.902862548828125,7087.0,1816.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0726470947265625,-0.5742645263671875,0.9999237060546875,0.013427734375,8275.0,1869.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.2516021728515625,-0.5213623046875,0.9438018798828125,0.3309173583984375,7887.0,2051.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.46185302734375,-0.35015869140625,0.69061279296875,0.7250213623046875,7477.0,1975.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.8530120849609375,0.15728759765625,-0.179656982421875,0.97418212890625,6517.0,3328.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape383(ctx,ctrans,frame,ratio,time){
	var pathData="M -805 -810 L 755 -810 755 250 -805 250 -805 -810";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-805,-810);
	ctx.transform(1.0128205128205128,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj382);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5503(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite1972",canvas,ctx,[0.65399169921875,0.3455352783203125,-0.466461181640625,0.8828582763671875,2145.0,2585.0],ctrans,1,(0+time)%4,0,time);
			place("sprite1972",canvas,ctx,[1.0,0.0,0.0,1.0,2269.0,2355.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.2543182373046875,-0.763275146484375,0.944793701171875,0.3148193359375,1387.0,3422.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,2957.0,5307.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,2524.0,3584.0],ctrans,1,(0+time)%1,0,time);
			place("sprite439",canvas,ctx,[0.2873687744140625,0.8194580078125,-0.9358673095703125,0.3281707763671875,4685.0,-17.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0175628662109375,0.9949188232421875,-0.9949188232421875,0.0175628662109375,4727.0,351.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.3282318115234375,0.940185546875,-0.940185546875,-0.3282318115234375,4486.0,1114.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.592681884765625,0.7983551025390625,-0.7983551025390625,-0.592681884765625,3894.0,1787.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.2857208251953125,0.818878173828125,-0.9351959228515625,-0.3263397216796875,3350.0,2085.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.25,0.0,0.0,1.25,3120.0,2480.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0715789794921875,-0.8007354736328125,0.991180419921875,0.0886077880859375,1054.0,4002.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.308349609375,-0.80792236328125,0.9227142333984375,-0.3521270751953125,2135.0,2240.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.155487060546875,-0.851165771484375,0.9720916748046875,-0.1775360107421875,1939.0,2857.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.6747589111328125,-0.539337158203125,0.615997314453125,-0.7705841064453125,2169.0,1605.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[0.8499908447265625,0.0,0.0,0.8499908447265625,1164.0,611.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.8607330322265625,-0.2279510498046875,0.254791259765625,0.9620513916015625,1074.0,2275.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.5035400390625,-0.3260040283203125,0.295166015625,0.9933013916015625,1484.0,2285.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj384=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/384.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj384,"assets/takeover/art/images/384.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj384.src="assets/takeover/art/images/384.png";
function image384(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1180 1460 1180 1460 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0136986301369864,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj384);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5504(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite3751",canvas,ctx,[0.900146484375,0.430755615234375,-0.430755615234375,0.900146484375,4101.0,1390.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.126068115234375,-0.9879608154296875,0.9879608154296875,0.126068115234375,4889.0,605.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.026580810546875,-0.803375244140625,0.9944305419921875,0.0329132080078125,2888.0,3402.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.21673583984375,-0.84014892578125,0.9594879150390625,0.2475433349609375,5302.0,-140.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.1981201171875,-0.9765472412109375,0.9765472412109375,0.1981201171875,4436.0,1307.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.147186279296875,-0.9853668212890625,0.9853668212890625,0.147186279296875,4189.0,1777.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9908294677734375,0.1040191650390625,-0.1040191650390625,0.9908294677734375,2111.0,1049.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9842529296875,0.1552886962890625,-0.1552886962890625,0.9842529296875,2753.0,1380.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.22674560546875,0.8358917236328125,-0.9546356201171875,-0.2589569091796875,3905.0,2558.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9925079345703125,0.0828399658203125,-0.0828399658203125,0.9925079345703125,3475.0,1801.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.25,0.0,0.0,1.25,3274.0,1857.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0715789794921875,-0.8007354736328125,0.991180419921875,0.0886077880859375,2555.0,3982.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9474029541015625,-0.304290771484375,0.304290771484375,0.9474029541015625,4986.0,2556.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.83636474609375,-0.22625732421875,0.2583770751953125,0.9551849365234375,4256.0,2410.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.184661865234375,-0.978759765625,0.978759765625,0.184661865234375,2268.0,4381.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.6421356201171875,-0.4752044677734375,0.59466552734375,0.7948150634765625,4980.0,-633.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.8530120849609375,0.15728759765625,-0.179656982421875,0.97418212890625,1888.0,809.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.6421356201171875,-0.4752044677734375,0.59466552734375,0.7948150634765625,4328.0,-518.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[0.846771240234375,-0.0703277587890625,0.0703277587890625,0.846771240234375,3774.0,-473.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape385(ctx,ctrans,frame,ratio,time){
	var pathData="M -940 -810 L 520 -810 520 370 -940 370 -940 -810";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-940,-810);
	ctx.transform(1.0136986301369864,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj384);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5505(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite439",canvas,ctx,[0.7772674560546875,-0.624725341796875,0.624725341796875,0.7772674560546875,694.0,2780.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.7027130126953125,-0.3890228271484375,0.481536865234375,0.8698577880859375,1928.0,2495.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.7235107421875,-0.481475830078125,0.5498504638671875,0.8262939453125,1390.0,2556.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,2122.0,3410.0],ctrans,1,(0+time)%1,0,time);
			place("sprite433",canvas,ctx,[0.846771240234375,-0.0703277587890625,0.0703277587890625,0.846771240234375,3713.0,3063.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.9908294677734375,0.1040191650390625,-0.1040191650390625,0.9908294677734375,4417.0,2628.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.926544189453125,0.3646697998046875,-0.3646697998046875,0.926544189453125,5047.0,2960.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.72515869140625,0.68017578125,-0.68017578125,0.72515869140625,5645.0,3496.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.457000732421875,0.733734130859375,-0.837982177734375,0.52191162109375,5988.0,4620.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0715789794921875,-0.8007354736328125,0.991180419921875,0.0886077880859375,3099.0,3309.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.4631805419921875,0.878173828125,-0.878173828125,0.4631805419921875,5978.0,4222.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.21673583984375,-0.84014892578125,0.9594879150390625,0.2475433349609375,2754.0,3573.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.7789459228515625,-0.3778228759765625,0.4314422607421875,0.88958740234375,2585.0,2488.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.169342041015625,-0.4481964111328125,0.9674072265625,0.2458343505859375,278.0,3044.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.8213043212890625,-0.2726287841796875,0.311309814453125,0.937957763671875,3344.0,2485.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.8443450927734375,-0.18817138671875,0.2148590087890625,0.9642791748046875,3814.0,2528.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,3259.0,4680.0],ctrans,1,(0+time)%1,0,time);
			place("sprite439",canvas,ctx,[0.137847900390625,-0.8563385009765625,0.9986419677734375,0.0291900634765625,2339.0,4228.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.25,0.0,0.0,1.25,3745.0,3577.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0429534912109375,-0.577117919921875,0.99908447265625,-0.0380706787109375,-31.0,3501.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj386=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/386.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj386,"assets/takeover/art/images/386.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj386.src="assets/takeover/art/images/386.png";
function image386(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1260 1340 1260 1340 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0149253731343284,0,0,1.0158730158730158,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj386);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5506(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite439",canvas,ctx,[-0.7602996826171875,0.6462860107421875,-0.6462860107421875,-0.7602996826171875,8601.0,1175.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.9073028564453125,-0.401611328125,0.401611328125,-0.9073028564453125,5920.0,1928.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.3023681640625,-0.9467315673828125,0.9467315673828125,-0.3023681640625,5333.0,1782.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.2477264404296875,0.0711212158203125,-0.0711212158203125,1.2477264404296875,4055.0,1019.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.79290771484375,0.6060791015625,-0.6060791015625,-0.79290771484375,7967.0,1418.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.7460784912109375,0.6621551513671875,-0.6621551513671875,-0.7460784912109375,7162.0,1650.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.465576171875,0.65380859375,-0.809295654296875,-0.576324462890625,9053.0,882.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.717071533203125,0.490936279296875,-0.560638427734375,-0.8189544677734375,6360.0,1939.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.717071533203125,0.490936279296875,-0.560638427734375,-0.8189544677734375,5607.0,2080.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.1126861572265625,-0.8566436767578125,0.8675384521484375,-0.11407470703125,2642.0,1358.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.17730712890625,-0.9801177978515625,0.9801177978515625,0.17730712890625,5372.0,934.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.3022003173828125,0.7429351806640625,-0.9196319580078125,-0.37408447265625,9540.0,425.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.6551055908203125,-0.1202850341796875,0.145660400390625,-0.7930755615234375,3248.0,1971.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.8430023193359375,0.2009429931640625,-0.2294769287109375,-0.9627532958984375,3985.0,2095.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.8195343017578125,0.280975341796875,-0.320892333984375,-0.9359588623046875,4625.0,2173.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.7932586669921875,0.3478546142578125,-0.3972625732421875,-0.9059600830078125,5145.0,2153.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.436248779296875,0.164031982421875,-0.3468170166015625,0.92230224609375,2824.0,-100.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.31951904296875,0.338470458984375,-0.715606689453125,0.675506591796875,3033.0,294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.410797119140625,-0.2197265625,0.46453857421875,-0.86846923828125,2875.0,1740.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape387(ctx,ctrans,frame,ratio,time){
	var pathData="M 620 -940 L 620 320 -720 320 -720 -940 620 -940";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,620,-940);
	ctx.transform(1.0149253731343284,0,0,1.0158730158730158,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj386);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5507(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite439",canvas,ctx,[-0.6412506103515625,-0.2325592041015625,0.4358978271484375,-0.717193603515625,4681.0,1773.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.25,0.0,0.0,1.25,3070.0,1740.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.199981689453125,-0.53509521484375,0.879730224609375,-0.4703369140625,3065.0,743.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,3812.0,3252.0],ctrans,1,(0+time)%1,0,time);
			place("sprite439",canvas,ctx,[-0.0181884765625,-0.5020294189453125,1.0524139404296875,-0.0380706787109375,4241.0,-412.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.2571868896484375,-0.4324188232421875,0.90643310546875,0.5391998291015625,3513.0,-241.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.492645263671875,-0.3565826416015625,0.567169189453125,0.8141632080078125,4828.0,1564.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.249603271484375,0.1760406494140625,-0.3382110595703125,-0.7655181884765625,4924.0,1816.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.0405731201171875,-0.501617431640625,1.0515289306640625,0.0850982666015625,3190.0,100.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.2932586669921875,-0.1296844482421875,0.3253173828125,-0.501312255859375,3188.0,975.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.5010528564453125,0.053497314453125,-0.1048736572265625,-0.982513427734375,3644.0,1212.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[-0.444854736328125,0.2354736328125,-0.4616851806640625,-0.8723297119140625,4180.0,1302.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.482879638671875,-0.14141845703125,0.2772674560546875,0.9468841552734375,4064.0,1077.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.1653289794921875,-0.474822998046875,0.995361328125,0.3466339111328125,3946.0,-357.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,5070.0,767.0],ctrans,1,(0+time)%1,0,time);
			place("sprite439",canvas,ctx,[0.2659912109375,-0.2793426513671875,0.5598297119140625,0.7728118896484375,5346.0,1552.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.53369140625,-0.15155029296875,0.27130126953125,0.955413818359375,5661.0,1559.0],ctrans,1,(0+time)%4,0,time);
			place("sprite439",canvas,ctx,[0.464141845703125,-0.048583984375,0.1027069091796875,0.981292724609375,6073.0,1724.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,5180.0,2698.0],ctrans,1,(0+time)%1,0,time);
			break;
	}
}

function sprite388(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape381",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape383",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape385",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape387",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite5508(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite481",canvas,ctx,[0.5999908447265625,0.0,0.0,0.5999908447265625,6293.0,4483.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4859.0,8026.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,4319.0,7867.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4478.0,8281.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj389=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/389.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj389,"assets/takeover/art/images/389.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj389.src="assets/takeover/art/images/389.png";
function image389(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1020 2040 1020 2040 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0098039215686274,0,0,1.0196078431372548,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj389);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5509(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2165.0,5129.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2715.0,5290.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,3923.0,5605.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,814.0,4445.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,2862.0,4445.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,5242.0,4237.0],ctrans,1,(0+time)%4,0,time);
			place("sprite481",canvas,ctx,[0.8839263916015625,0.0,0.0,0.8839263916015625,6058.0,4973.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3124.0,4918.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4669.0,4993.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,4129.0,4834.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4288.0,5248.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,3666.0,5054.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,3385.0,5248.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6440.0,5569.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6116.0,5731.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,-501.0,4775.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6870.0,5552.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6636.0,6131.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6200.0,6465.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6560.0,6918.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6236.0,7080.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6990.0,6901.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6756.0,7480.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6320.0,7814.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6510.0,8381.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2603.0,8713.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2941.0,8805.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4547.0,9371.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.74285888671875,0.0,0.0,0.74285888671875,3432.0,8684.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,5037.0,8670.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,4527.0,8511.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4686.0,8925.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-0.861114501953125,0.0,0.0,0.861114501953125,4015.0,8779.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4963.0,9189.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape390(ctx,ctrans,frame,ratio,time){
	var pathData="M 980 470 L -1060 470 -1060 -550 980 -550 980 470";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1060,-550);
	ctx.transform(1.0098039215686274,0,0,1.0196078431372548,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj389);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5510(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,125.0,7630.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-1627.0,2610.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-261.0,1325.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-1932.0,4139.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-3848.0,4475.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-3214.0,4951.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,-663.0,1746.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-723.0,2100.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,-1165.0,2311.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-2394.0,2728.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj391=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/391.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj391,"assets/takeover/art/images/391.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj391.src="assets/takeover/art/images/391.png";
function image391(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1120 2600 1120 2600 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0076923076923077,0,0,1.0178571428571428,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj391);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5511(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2168.0,6211.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2491.0,5761.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,2660.0,6614.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,3979.0,8106.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2969.0,4359.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2754.0,4675.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,3127.0,4676.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,2498.0,7432.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,2168.0,6832.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,2868.0,7027.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,3079.0,7501.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6314.0,7652.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-0.77142333984375,0.0,0.0,0.77142333984375,5914.0,7212.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,6684.0,7247.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape392(ctx,ctrans,frame,ratio,time){
	var pathData="M 1380 520 L -1220 520 -1220 -600 1380 -600 1380 520";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1220,-600);
	ctx.transform(1.0076923076923077,0,0,1.0178571428571428,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj391);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5512(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6795.0,809.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8340.0,884.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8251.0,1458.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8036.0,1774.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,7789.0,1535.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6585.0,1553.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,7800.0,725.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,7959.0,1139.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,7257.0,510.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,7337.0,945.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,7056.0,1139.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[0.75,0.0,0.0,0.75,3253.0,4617.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[0.75,0.0,0.0,0.75,4014.0,5817.0],ctrans,1,(0+time)%4,0,time);
			place("sprite481",canvas,ctx,[1.0,0.0,0.0,1.0,5713.0,6589.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,3845.0,7337.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,6040.0,7598.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8162.0,2434.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,8459.0,1975.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,5300.0,168.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

var imageObj393=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/393.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj393,"assets/takeover/art/images/393.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj393.src="assets/takeover/art/images/393.png";
function image393(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1060 1980 1060 1980 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0101010101010102,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj393);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5513(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,7755.0,3335.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8802.0,3294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,7545.0,4079.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,8683.0,2700.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,8217.0,3036.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[-1.0,0.0,0.0,1.0,8297.0,3471.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8016.0,3665.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,7716.0,4325.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,7886.0,3929.0],ctrans,1,(0+time)%4,0,time);
			place("sprite481",canvas,ctx,[1.0,0.0,0.0,1.0,7117.0,5516.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape394(ctx,ctrans,frame,ratio,time){
	var pathData="M 940 560 L -1040 560 -1040 -500 940 -500 940 560";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1040,-500);
	ctx.transform(1.0101010101010102,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj393);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj5514=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/5514.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj5514,"assets/takeover/art/images/5514.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj5514.src="assets/takeover/art/images/5514.png";
function image5514(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 660 980 660 980 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0204081632653061,0,0,1.0303030303030303,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5514);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj395=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/395.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj395,"assets/takeover/art/images/395.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj395.src="assets/takeover/art/images/395.png";
function image395(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1140 2160 1140 2160 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0092592592592593,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj395);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj5515=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/5515.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj5515,"assets/takeover/art/images/5515.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj5515.src="assets/takeover/art/images/5515.png";
function image5515(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 740 1080 740 1080 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0185185185185186,0,0,1.027027027027027,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5515);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape396(ctx,ctrans,frame,ratio,time){
	var pathData="M 1080 520 L -1080 520 -1080 -620 1080 -620 1080 520";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1080,-620);
	ctx.transform(1.0092592592592593,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj395);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj5516=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/5516.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj5516,"assets/takeover/art/images/5516.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj5516.src="assets/takeover/art/images/5516.png";
function image5516(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 780 960 780 960 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0208333333333333,0,0,1.0256410256410255,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5516);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite397(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape390",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape392",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape394",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape396",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape5517(ctx,ctrans,frame,ratio,time){
	var pathData="M 11399 9099 L 12359 9099 12359 9879 11399 9879 11399 9099";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,11399,9099);
	ctx.transform(1.0208333333333333,0,0,1.0256410256410255,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5516);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 15021 9742 L 14041 9742 14041 9082 15021 9082 15021 9742";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,14041,9082);
	ctx.transform(1.0204081632653061,0,0,1.0303030303030303,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5514);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 1424 2614 L 2504 2614 2504 3354 1424 3354 1424 2614";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,1424,2614);
	ctx.transform(1.0185185185185186,0,0,1.027027027027027,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj5515);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj399=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/399.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj399,"assets/takeover/art/images/399.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj399.src="assets/takeover/art/images/399.png";
function image399(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 920 2100 920 2100 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0095238095238095,0,0,1.0217391304347827,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj399);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape400(ctx,ctrans,frame,ratio,time){
	var pathData="M 1060 470 L -1040 470 -1040 -450 1060 -450 1060 470";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1040,-450);
	ctx.transform(1.0095238095238095,0,0,1.0217391304347827,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj399);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj401=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/401.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj401,"assets/takeover/art/images/401.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj401.src="assets/takeover/art/images/401.png";
function image401(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1640 2480 1640 2480 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0080645161290323,0,0,1.0121951219512195,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj401);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape402(ctx,ctrans,frame,ratio,time){
	var pathData="M 1300 661 L -1180 661 -1180 -979 1300 -979 1300 661";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1180,-979);
	ctx.transform(1.0080645161290323,0,0,1.0121951219512195,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj401);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj403=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/403.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj403,"assets/takeover/art/images/403.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj403.src="assets/takeover/art/images/403.png";
function image403(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1060 1880 1060 1880 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0106382978723405,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj403);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape404(ctx,ctrans,frame,ratio,time){
	var pathData="M 840 560 L -1040 560 -1040 -500 840 -500 840 560";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1040,-500);
	ctx.transform(1.0106382978723405,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj403);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj405=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/405.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj405,"assets/takeover/art/images/405.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj405.src="assets/takeover/art/images/405.png";
function image405(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 800 1960 800 1960 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.010204081632653,0,0,1.025,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj405);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape406(ctx,ctrans,frame,ratio,time){
	var pathData="M 880 440 L -1080 440 -1080 -360 880 -360 880 440";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1080,-360);
	ctx.transform(1.010204081632653,0,0,1.025,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj405);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite407(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape400",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape402",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape404",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape406",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj409=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/409.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj409,"assets/takeover/art/images/409.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj409.src="assets/takeover/art/images/409.png";
function image409(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 940 1340 940 1340 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0149253731343284,0,0,1.0212765957446808,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj409);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape410(ctx,ctrans,frame,ratio,time){
	var pathData="M 600 295 L -740 295 -740 -645 600 -645 600 295";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-740,-645);
	ctx.transform(1.0149253731343284,0,0,1.0212765957446808,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj409);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj411=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/411.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj411,"assets/takeover/art/images/411.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj411.src="assets/takeover/art/images/411.png";
function image411(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1060 1560 1060 1560 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0128205128205128,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj411);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape412(ctx,ctrans,frame,ratio,time){
	var pathData="M -805 -810 L 755 -810 755 250 -805 250 -805 -810";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-805,-810);
	ctx.transform(1.0128205128205128,0,0,1.0188679245283019,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj411);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj413=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/413.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj413,"assets/takeover/art/images/413.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj413.src="assets/takeover/art/images/413.png";
function image413(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1180 1680 1180 1680 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0119047619047619,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj413);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape414(ctx,ctrans,frame,ratio,time){
	var pathData="M 740 370 L -940 370 -940 -810 740 -810 740 370";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-940,-810);
	ctx.transform(1.0119047619047619,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj413);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape415(ctx,ctrans,frame,ratio,time){
	var pathData="M -720 -940 L 620 -940 620 320 -720 320 -720 -940";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-720,-940);
	ctx.transform(1.0149253731343284,0,0,1.0158730158730158,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj386);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite416(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape410",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape412",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape414",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape415",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape1952(ctx,ctrans,frame,ratio,time){
	var pathData="M 617 352 L 618 349 634 349 Q 648 349 648 359 L 647 364 638 369 632 365 629 377 628 377 628 376 629 370 631 364 630 364 Q 617 363 617 352 M 366 468 Q 370 452 377 450 385 448 391 464 L 373 468 374 472 361 471 359 469 366 468";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 730 337 Q 747 338 753 345 L 760 356 748 367 727 373 716 370 713 374 706 369 701 362 701 355 698 350 696 347 697 344 706 341 711 339 723 342 730 337 M 499 430 L 477 429 474 435 465 440 Q 446 439 434 411 L 436 403 440 394 432 389 434 384 444 383 487 394 508 393 Q 527 393 527 406 L 518 418 Q 504 424 499 430 M 808 114 L 809 113 808 113 808 114 M 810 214 L 811 214 811 219 808 225 808 247 811 252 804 259 801 257 803 253 803 231 789 236 772 234 Q 754 233 754 243 L 758 255 Q 758 262 778 269 798 275 798 288 L 797 299 779 308 757 308 740 315 Q 729 320 727 323 L 717 322 703 314 696 313 684 323 659 327 642 322 626 321 623 323 613 323 595 315 595 317 606 329 610 339 Q 610 344 589 350 L 581 358 Q 579 363 572 362 L 561 358 Q 559 360 556 361 L 544 362 530 359 519 356 498 361 482 357 466 352 461 346 461 340 465 330 470 320 464 314 448 313 445 316 433 316 408 318 390 336 Q 364 343 364 359 L 386 378 408 395 405 399 378 402 356 405 338 400 Q 324 393 324 388 L 325 369 Q 324 349 317 349 L 314 351 307 350 304 347 295 347 281 361 273 361 259 358 249 356 242 358 235 347 231 334 Q 222 336 214 322 207 307 195 307 L 174 310 178 320 183 330 Q 183 338 154 341 L 146 341 141 338 136 340 135 339 120 341 Q 100 344 100 349 L 105 354 111 359 105 364 92 368 Q 84 368 78 360 L 72 350 65 349 64 348 56 348 48 353 48 357 43 360 31 353 23 352 23 361 28 377 Q 28 387 5 386 L -12 383 Q -12 390 -15 393 L 16 398 Q 31 403 31 409 L 26 413 29 419 14 429 -9 420 -19 418 -23 409 -18 395 -20 395 -27 388 -43 388 -44 389 -48 391 Q -61 390 -79 369 L -103 339 Q -115 324 -145 308 L -171 288 -170 288 -162 292 -162 291 -163 288 -142 272 -115 259 -114 259 -116 243 -114 235 -97 231 -73 231 -46 228 -36 223 -26 218 -9 216 28 221 49 213 Q 58 203 67 201 L 68 201 69 199 78 199 97 203 120 203 122 201 Q 146 201 156 192 L 167 190 171 188 217 190 Q 239 184 247 163 257 137 268 130 L 288 130 310 132 317 130 331 126 347 110 359 109 373 107 380 105 402 106 420 112 419 108 441 109 Q 462 115 463 124 L 474 124 513 142 554 157 562 158 557 146 Q 557 141 568 134 L 582 128 619 129 637 134 649 136 678 132 703 128 707 126 707 125 710 125 716 122 721 115 Q 722 110 726 110 L 772 98 780 97 801 104 815 113 808 120 808 218 810 214 M 82 383 L 94 396 73 406 48 399 Q 36 391 36 383 L 48 378 63 373 Q 71 373 82 383 M 193 360 L 186 357 190 358 193 361 193 360 M 118 371 Q 118 365 136 359 L 173 355 Q 184 345 202 359 L 217 376 214 381 221 394 219 398 208 397 205 395 199 395 Q 183 408 174 408 158 407 146 393 L 130 379 118 371 M 630 428 L 628 427 Q 626 426 625 429 L 630 430 630 428 M 622 429 L 622 423 621 420 622 418 639 419 642 422 637 438 638 438 Q 643 437 645 441 L 641 442 631 444 Q 625 443 624 438 L 622 435 616 435 622 429 M -105 328 L -102 330 -104 328 -105 328";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 424 272 L 407 269 397 270 Q 387 269 383 264 L 375 254 354 248 336 244 336 243 355 243 376 249 383 257 Q 389 264 398 266 418 264 426 272 L 424 272";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 604 258 L 601 255 604 259 604 258 M 571 206 L 573 206 573 205 571 206 M 518 233 L 519 232 528 229 515 230 518 233 M 555 154 L 554 154 556 155 555 154 M 450 114 L 449 113 444 113 450 114 M 734 111 L 720 118 720 119 721 118 721 119 732 133 732 135 737 137 Q 762 148 762 155 L 755 160 742 164 743 165 Q 745 178 758 186 L 783 205 782 205 752 189 733 165 737 159 752 154 751 153 717 138 717 141 707 141 703 138 699 137 695 138 690 137 678 137 648 144 641 141 612 133 591 130 584 134 565 136 568 144 568 145 569 143 582 178 586 178 587 183 586 184 590 185 595 183 604 186 615 183 622 190 621 199 Q 637 203 638 205 L 629 209 632 207 619 206 615 198 614 190 599 193 591 191 588 197 581 204 580 202 578 202 578 211 567 213 557 219 Q 554 219 554 222 L 551 226 523 236 Q 540 247 558 254 L 564 254 564 251 568 250 587 258 596 258 595 253 Q 595 248 600 248 L 606 253 609 259 607 264 622 270 622 275 618 276 608 271 601 264 580 261 570 256 569 259 561 261 Q 549 260 528 248 L 514 239 507 241 497 239 511 236 509 232 513 224 537 223 537 222 550 213 554 209 Q 557 206 562 206 L 566 202 571 198 571 197 569 195 569 189 569 187 569 184 570 178 569 177 536 161 513 155 507 154 506 151 502 150 497 148 495 148 495 147 473 139 469 140 471 135 491 141 466 127 462 124 424 113 392 112 391 110 373 109 Q 366 111 355 116 L 345 122 Q 345 128 352 134 L 361 143 356 147 357 153 357 154 361 154 359 158 Q 371 161 373 163 383 162 389 168 L 397 176 394 178 386 175 382 177 382 176 383 173 Q 345 166 344 159 L 337 158 335 161 Q 344 170 344 184 L 340 190 346 196 370 200 382 201 Q 382 208 372 206 L 359 203 353 203 336 187 338 180 Q 338 170 327 160 L 334 154 346 153 350 153 350 149 344 141 341 141 336 139 316 135 315 136 297 137 264 140 260 140 260 156 259 160 262 168 261 175 267 182 272 188 275 188 277 191 276 193 279 197 278 199 285 206 273 215 254 225 Q 223 221 219 230 214 239 197 238 L 195 243 Q 195 249 233 254 L 232 259 217 259 197 251 191 245 195 234 210 233 217 225 Q 220 218 225 218 L 255 219 262 218 278 205 277 204 272 202 261 197 261 198 269 205 267 207 258 197 248 193 230 198 194 203 190 199 Q 187 196 181 196 177 196 169 204 L 162 209 167 223 163 235 Q 158 242 151 242 L 141 245 136 248 131 246 129 247 129 253 123 252 116 256 102 256 99 259 126 282 123 282 110 270 96 262 96 255 114 252 115 250 127 246 125 240 138 239 135 237 132 229 135 229 138 233 145 234 149 235 150 235 155 234 158 228 149 209 142 206 142 205 140 204 139 205 125 207 97 207 75 205 68 210 62 216 46 228 34 233 34 234 31 234 10 242 10 243 1 247 3 248 15 257 Q 15 265 0 263 L 19 273 21 276 22 281 31 284 36 287 35 291 30 291 Q -5 268 -5 261 L -2 256 6 257 4 256 -6 245 15 233 6 233 Q 4 230 -2 229 L -3 227 -2 225 -6 225 -37 229 -72 239 -84 242 -92 245 -99 248 -109 266 -107 270 -108 272 -103 278 -104 281 -109 281 -113 280 -113 283 -114 283 -115 278 -120 260 -126 264 -137 274 -148 282 -146 293 -146 296 -150 298 -157 294 -164 296 -172 291 -178 283 -178 273 Q -161 274 -144 261 -131 250 -120 248 L -116 239 Q -111 229 -92 230 L -85 232 -84 233 -66 227 -46 221 -31 215 -29 212 -26 213 -12 211 -17 215 -16 216 -11 213 -9 214 -12 211 13 219 Q 41 219 51 210 L 52 199 84 196 94 195 97 197 114 197 131 198 Q 136 192 138 194 L 149 196 151 196 170 186 186 187 203 193 207 191 211 190 226 184 226 181 232 182 239 157 245 144 246 139 265 135 295 132 314 130 315 129 316 129 330 128 Q 331 122 338 118 341 111 352 107 371 97 376 97 L 386 98 410 98 425 96 446 98 487 127 511 138 533 151 535 151 533 148 540 151 551 152 552 152 554 150 Q 554 133 561 133 L 573 129 586 125 595 125 638 136 637 133 675 124 702 120 703 118 703 115 704 113 707 107 710 104 711 105 712 104 727 105 735 103 740 97 747 97 758 96 801 105 808 109 809 113 808 117 799 117 807 118 800 119 797 117 786 116 747 108 734 111 M -157 278 L -157 279 -155 278 -157 278 M 158 213 L 157 212 158 214 162 226 163 223 158 213 M 143 205 L 147 205 146 204 143 205 M 31 226 L 28 226 30 227 31 226 M 260 186 L 260 187 261 187 260 186 M 243 160 L 244 160 244 158 243 160 M 242 169 L 240 177 242 171 242 169";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -63 240 L -79 242 Q -92 242 -97 261 L -105 278 -107 277 -107 270 -120 268 -126 276 -143 296 -148 295 -149 291 -147 286 -150 283 Q -150 275 -116 257 L -114 260 -119 267 -108 267 -105 251 -103 252 -102 254 -91 239 -77 232 -59 228 -57 230 -52 231 -26 227 -13 222 Q -3 222 1 229 L -2 229 -11 227 -22 231 -42 236 -63 240 M 9 258 L 9 257 6 254 5 254 9 258 M 151 206 L 106 201 108 200 140 201 147 203 151 206 M 5 242 Q 5 235 32 225 L 70 219 58 223 Q 64 223 64 227 L 63 230 42 235 32 243 Q 25 249 19 248 L 16 247 12 261 27 273 37 286 34 292 16 273 0 254 Q 0 248 10 248 L 10 246 5 242 M 392 179 L 383 180 365 173 Q 353 164 346 164 L 343 166 338 157 349 160 362 164 Q 375 174 386 175 L 392 173 395 174 395 177 392 179 M 223 201 L 248 194 Q 259 192 272 203 L 270 205 Q 269 203 260 200 L 249 198 235 202 200 206 188 203 183 200 177 204 178 210 178 215 178 217 178 229 Q 175 238 164 238 L 151 252 Q 133 266 123 263 L 139 280 137 283 133 281 131 283 114 262 111 262 110 256 110 254 113 253 120 257 Q 120 253 139 240 160 226 164 226 L 165 226 164 217 164 214 165 210 157 214 156 213 156 208 158 207 165 202 166 199 168 200 170 199 173 194 174 197 Q 178 194 182 194 L 188 196 193 201 209 200 223 201 M 262 159 Q 256 159 256 153 L 254 143 257 139 289 138 Q 294 132 317 133 324 133 348 148 L 345 150 334 144 Q 324 138 318 138 L 298 140 264 143 Q 261 143 261 148 L 263 156 262 159 M 369 107 L 387 106 390 104 375 103 369 107 M 401 104 L 399 105 408 105 401 104 M 407 98 L 430 108 Q 445 111 461 120 L 482 133 549 165 558 169 560 163 567 175 572 187 571 189 567 189 565 184 564 183 562 176 559 178 543 169 542 169 518 155 510 153 509 154 493 148 481 142 Q 477 133 462 130 L 439 118 407 111 388 114 380 116 361 127 375 155 371 158 363 163 350 131 348 130 343 128 345 125 345 123 346 122 347 120 Q 347 112 354 108 L 373 97 407 98 M 461 122 L 459 122 464 124 461 122 M 610 189 L 612 192 610 193 594 193 Q 596 202 588 203 L 586 201 591 189 596 188 610 189 M 668 137 L 663 145 Q 660 149 655 149 L 631 141 596 131 578 143 594 180 594 185 585 185 571 162 561 141 563 137 563 131 565 131 573 130 582 128 600 127 632 136 654 144 660 139 666 131 704 131 711 132 714 135 713 136 668 137 M 749 105 L 757 109 767 108 789 111 792 116 791 118 782 119 775 117 748 115 735 125 743 133 742 137 Q 748 138 754 142 L 761 147 760 149 753 149 753 155 752 155 Q 749 142 735 136 L 721 130 722 127 724 128 720 124 728 116 738 110 Q 747 102 749 105";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1953(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1952",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj418=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/418.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj418,"assets/takeover/art/images/418.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj418.src="assets/takeover/art/images/418.png";
function image418(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 900 2080 900 2080 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0096153846153846,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj418);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape1954(ctx,ctrans,frame,ratio,time){
	var pathData="M 449 -69 L 492 -69 510 -67 513 -66 528 -64 561 -70 591 -75 596 -77 596 -78 599 -78 606 -81 611 -88 617 -95 656 -105 666 -98 Q 716 -67 736 -41 L 769 -13 Q 797 6 803 12 L 821 31 Q 804 48 794 48 L 777 47 788 43 793 38 Q 783 38 770 30 758 22 743 22 L 714 21 714 39 717 44 Q 717 51 709 51 L 706 49 708 45 708 23 691 29 671 27 Q 651 27 651 37 L 656 49 Q 656 56 678 62 702 67 702 80 L 701 91 680 101 654 102 634 110 Q 621 115 618 118 L 607 119 591 111 583 111 568 121 540 126 519 122 500 123 497 125 486 125 473 121 474 128 477 131 482 141 468 150 463 162 Q 451 191 444 191 436 191 427 180 L 408 185 366 166 Q 365 178 354 188 L 339 204 360 220 361 232 360 246 343 256 303 260 268 263 242 258 233 265 214 272 Q 195 272 177 256 157 240 148 240 140 240 131 253 L 150 278 162 300 157 309 141 314 145 318 154 315 175 310 195 315 Q 205 320 205 328 205 343 176 347 L 97 360 Q 97 383 49 384 L 15 369 10 375 -20 380 -79 371 -79 370 Q -113 339 -163 326 -177 311 -189 308 L -204 297 -203 296 -178 279 -161 258 Q -145 240 -134 240 L -113 245 -109 243 Q -121 223 -102 202 -83 182 -49 175 L 4 150 Q 48 127 63 126 69 126 99 137 L 132 147 Q 140 147 149 124 L 160 93 Q 166 73 173 64 184 50 232 42 L 311 41 Q 350 41 350 31 L 344 20 Q 344 8 357 2 386 -10 392 -15 L 417 -31 417 -38 426 -38 420 -50 432 -62 449 -69 M 336 293 Q 389 282 389 306 L 374 327 Q 354 345 322 345 284 345 284 321 284 303 336 293 M 305 329 L 304 316 Q 295 313 295 321 L 296 326 305 329 M 120 426 L 105 429 110 436 115 435 120 426 M 179 399 L 182 414 177 433 Q 168 453 149 453 L 105 449 Q 92 444 92 428 L 135 400 179 399 M 495 231 L 496 225 494 222 495 220 516 219 519 222 513 238 514 238 Q 521 237 523 241 L 518 242 510 244 506 244 Q 499 245 498 240 L 496 237 488 237 495 231 M 499 231 L 505 230 505 228 503 227 499 231 M 448 228 L 447 241 Q 443 255 426 255 L 409 246 399 233 Q 399 220 424 211 448 203 448 228 M 490 154 L 491 151 510 149 Q 526 149 526 159 L 525 164 514 169 510 166 507 165 504 177 502 177 503 176 Q 502 174 504 170 L 506 164 505 164 Q 490 165 490 154 M 646 224 L 656 224 650 223 645 223 646 224 M 639 206 L 641 210 673 216 680 229 672 236 674 246 Q 673 252 659 252 L 626 246 Q 613 240 613 232 L 615 226 620 220 Q 613 218 613 214 L 615 208 625 208 639 206 M 643 162 L 618 168 607 167 603 171 595 166 588 159 588 152 585 148 583 145 584 142 595 138 601 136 614 138 622 132 650 139 658 150 643 162 M 831 71 L 861 75 865 85 Q 865 94 842 102 L 804 107 823 100 823 70 820 62 831 71";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 111 276 L 104 274 108 269 Q 124 268 151 299 L 141 301 Q 130 301 128 289 126 276 111 276 M -62 383 L -66 383 -79 370 -104 351 Q -94 354 -82 360 -60 371 -60 379 L -62 383";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 331 36 L 330 33 329 36 331 36 M 427 57 L 426 57 425 58 427 58 427 57 M 438 10 L 438 9 436 10 438 10 M 475 61 L 475 60 471 58 475 61 M 416 -44 L 417 -44 416 -43 417 -39 417 -42 419 -41 418 -42 417 -42 417 -44 417 -47 416 -44 M 451 -75 L 450 -70 453 -72 464 -72 510 -64 513 -64 488 -70 451 -75 M 345 -8 L 354 -11 379 -28 409 -42 409 -45 411 -51 404 -56 Q 415 -81 453 -84 489 -88 517 -68 L 558 -78 590 -83 591 -85 591 -88 592 -90 596 -96 599 -99 600 -98 602 -99 619 -100 628 -102 634 -108 642 -108 650 -110 666 -98 675 -92 642 -97 627 -94 610 -85 610 -84 611 -85 611 -84 625 -72 624 -70 631 -68 660 -51 Q 660 -49 652 -46 L 636 -41 638 -40 Q 640 -27 656 -20 L 684 -2 683 -2 648 -17 626 -40 631 -46 648 -52 647 -53 607 -65 607 -62 596 -62 591 -65 586 -65 581 -64 576 -65 561 -65 526 -56 518 -59 510 -60 484 -65 459 -67 451 -63 436 -60 431 -56 432 -52 432 -51 433 -53 449 -19 453 -19 455 -14 454 -13 458 -12 464 -14 475 -12 487 -15 495 -8 494 1 510 3 515 5 510 8 504 9 507 7 492 8 487 0 486 -8 469 -4 459 -6 456 0 Q 452 7 448 7 L 446 5 443 6 444 6 444 15 431 17 420 23 417 25 417 13 Q 420 10 426 10 L 430 6 436 2 436 1 433 -1 433 -7 433 -9 433 -12 434 -18 433 -19 417 -25 417 -26 Q 415 -18 409 -15 L 371 0 Q 349 7 349 16 L 355 31 355 33 370 36 401 33 403 43 Q 405 49 416 49 L 428 45 436 51 431 54 432 54 455 61 466 61 464 56 Q 464 51 470 51 L 477 55 480 59 482 55 498 61 515 63 Q 526 63 523 57 L 518 47 Q 518 42 527 37 537 30 552 29 L 579 26 584 29 587 33 580 36 558 34 556 36 Q 539 36 526 49 L 531 60 530 66 512 72 487 68 480 63 478 66 496 72 495 77 491 78 480 73 471 67 446 64 435 60 433 63 425 65 417 65 417 61 414 61 Q 401 61 397 55 L 393 44 352 46 359 52 353 54 342 47 293 46 Q 258 46 239 56 218 66 194 66 L 168 68 167 78 165 106 167 124 166 135 Q 195 131 201 158 L 209 182 214 182 215 189 218 190 Q 244 190 255 173 268 156 305 155 L 313 156 313 162 308 166 Q 378 175 392 183 L 390 189 381 190 359 183 306 177 296 167 Q 274 169 256 185 239 201 217 201 L 216 201 220 225 Q 225 257 235 257 247 248 258 248 L 275 252 278 250 281 246 284 247 283 247 284 249 284 261 276 264 266 262 254 258 245 263 235 268 Q 217 268 205 235 196 209 196 188 L 196 186 192 173 Q 185 145 167 146 L 157 148 157 149 156 148 154 150 142 153 137 153 123 157 Q 99 157 70 128 L 23 150 Q 5 158 -16 178 L -71 196 -95 204 -93 210 -90 211 -91 211 -89 219 -79 237 -75 240 -56 240 -31 234 -16 233 -14 229 Q -11 224 -3 224 L 3 225 Q 29 230 42 245 L 61 267 89 268 107 263 110 264 110 268 Q 106 269 100 273 L 61 276 62 286 57 308 Q 57 314 67 316 84 320 95 327 L 91 329 56 319 Q 46 316 46 309 L 55 279 53 273 39 256 32 250 23 245 13 240 -6 240 Q -9 251 -26 255 L -60 265 -78 265 -86 259 -124 268 -131 267 -131 263 -126 258 -131 258 -134 256 -166 280 -194 302 Q -201 296 -214 296 L -207 292 -202 290 -170 260 -133 236 -122 230 -118 231 -118 223 -124 213 Q -124 201 -113 194 L -44 177 Q -14 169 -4 161 12 147 45 130 72 114 74 114 L 87 130 113 145 124 146 123 144 113 145 113 123 Q 125 104 136 96 L 141 89 159 60 161 59 163 54 165 57 190 53 223 50 236 42 278 36 321 36 321 11 Q 323 1 345 -8 M 392 -20 L 387 -14 387 -13 398 -19 407 -35 392 -20 M -104 207 L -107 208 -103 211 -104 207";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 474 59 L 475 52 479 52 481 56 484 68 Q 474 66 474 59 M 635 -27 L 629 -37 636 -30 635 -27 M -84 361 L -88 362 -89 362 Q -105 349 -126 340 L -119 336 -104 344 -84 361";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 666 -98 L 681 -88 675 -90 643 -90 Q 633 -85 628 -80 L 638 -72 636 -68 642 -67 639 -71 Q 650 -72 660 -62 L 668 -49 656 -36 673 -16 669 -14 654 -26 646 -36 658 -51 650 -57 649 -51 648 -51 Q 645 -64 628 -69 L 611 -73 612 -77 615 -77 610 -79 620 -89 632 -95 Q 642 -103 645 -101 652 -97 654 -97 L 666 -98 M 485 -6 L 482 -5 480 -5 481 -1 Q 480 5 496 5 L 505 3 505 9 490 12 478 8 472 1 473 -5 463 -4 Q 466 5 456 6 L 454 4 459 -8 466 -9 482 -9 485 -6 M 429 -65 L 438 -66 449 -69 470 -70 507 -64 510 -63 534 -57 541 -62 547 -70 592 -72 601 -71 604 -68 603 -67 549 -64 544 -56 535 -52 510 -57 506 -59 466 -66 444 -53 463 -17 463 -12 452 -12 436 -34 425 -55 426 -59 426 -65 429 -65 M 367 -1 L 365 -3 366 -6 Q 405 -12 413 -35 L 420 -27 421 -27 424 -33 431 -21 437 -9 436 -7 431 -7 428 -12 427 -13 426 -20 422 -18 419 -19 408 -7 Q 394 3 380 4 L 376 4 365 7 377 31 376 37 369 40 356 30 346 17 367 -1 M -81 206 L -82 203 -84 205 -81 206 M 7 228 L 15 225 Q 29 227 43 242 L 52 251 Q 49 246 52 242 L 63 252 Q 75 264 85 261 101 256 115 261 L 109 264 69 266 63 262 55 266 Q 35 238 7 228 M 63 118 L 67 118 86 134 103 148 99 148 78 138 63 133 Q 52 134 26 154 L -1 177 -50 191 -74 200 -68 215 -60 228 -51 230 -44 235 -36 235 Q -30 235 -6 220 L 3 222 3 226 -16 244 -38 247 -51 243 -54 246 -57 248 -65 243 -69 240 -75 250 -79 248 -95 205 Q -95 190 -58 184 -17 176 -10 167 0 155 32 136 L 63 118 M 244 53 L 213 56 Q 193 64 186 71 178 79 178 93 178 143 163 144 158 144 158 141 L 158 64 163 59 173 65 Q 226 38 255 48 247 50 244 53 M 466 48 L 466 51 443 54 430 50 423 44 404 40 406 34 409 34 426 35 Q 441 52 466 48 M -41 249 L -37 250 -37 254 -115 267 -118 265 -122 263 Q -128 260 -131 260 L -176 298 -184 309 -189 307 -197 300 -185 291 -180 280 -174 269 Q -127 241 -123 244 L -103 256 -41 249";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape419(ctx,ctrans,frame,ratio,time){
	var pathData="M 1050 440 L -1030 440 -1030 -460 1050 -460 1050 440";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1030,-460);
	ctx.transform(1.0096153846153846,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj418);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape3747(ctx,ctrans,frame,ratio,time){
	var pathData="M 1063 211 L 1069 218 1067 219 1063 212 1063 211 M 1031 164 L 1032 164 1049 190 1049 191 1031 164 M 831 56 L 827 50 829 51 832 55 831 56 M 826 31 Q 824 31 823 33 L 822 27 826 31 M 904 177 Q 926 182 942 194 966 212 945 226 L 918 238 900 241 906 245 Q 929 259 933 295 L 936 309 933 316 Q 927 342 877 379 L 877 380 Q 877 391 858 394 L 853 396 831 409 827 418 827 425 828 425 839 438 Q 845 451 836 461 L 820 468 816 468 738 465 730 465 Q 654 503 597 522 L 524 524 525 526 519 528 507 534 508 547 508 549 509 550 509 554 508 556 508 570 Q 503 592 479 592 414 592 379 564 360 550 355 534 L 314 541 301 538 299 527 286 476 278 448 Q 274 433 255 420 242 410 205 395 L 169 383 177 375 Q 153 361 136 347 L 140 344 Q 150 334 150 325 L 152 323 159 331 167 322 158 288 150 251 Q 150 239 132 210 L 115 182 117 179 120 175 110 163 97 148 78 124 51 95 66 82 Q 79 72 98 64 L 94 57 118 42 139 52 201 39 204 34 209 14 229 35 244 33 329 33 354 42 355 40 Q 360 26 355 10 L 401 17 453 23 471 20 488 17 520 26 535 31 567 20 612 20 635 31 647 24 Q 663 49 698 49 731 49 755 14 L 744 36 737 44 752 64 752 66 745 99 748 106 767 108 779 118 805 144 815 156 826 170 838 166 844 166 Q 845 165 846 167 849 176 834 177 L 831 178 832 178 879 174 887 175 904 177 M 825 223 L 820 221 804 216 830 237 844 241 825 223 M 992 287 Q 968 294 962 314 947 296 980 288 L 992 287 M 998 266 L 991 269 Q 970 273 958 262 947 253 966 248 L 984 248 998 253 Q 1006 261 998 266 M 895 342 L 879 350 862 353 872 364 895 342 M 796 173 L 785 183 794 188 Q 807 199 791 203 L 788 203 786 204 791 205 792 206 Q 793 203 803 199 801 194 804 190 L 796 173 M 794 167 L 786 147 773 166 795 169 794 167 M 734 117 L 756 117 760 118 738 102 Q 733 105 727 110 L 720 115 722 115 734 117 M 907 325 L 906 325 905 329 907 325 M 529 87 L 495 85 488 90 498 89 509 88 517 88 529 87 M 452 446 L 471 455 493 456 521 458 534 453 548 453 539 446 535 446 534 446 Q 496 455 472 440 L 470 439 453 446 452 446 M 706 446 L 700 454 696 458 713 451 710 449 706 446 M 651 477 L 643 478 642 482 671 470 Q 656 472 651 477 M 301 68 Q 328 68 342 58 L 284 54 253 55 Q 274 68 301 68 M 27 94 L 28 94 31 96 27 94 M 8 111 L -2 103 0 102 8 111 M 86 62 Q 81 69 58 74 43 75 38 67 L 37 57 Q 50 65 68 65 L 86 62 M 126 428 L 128 427 134 435 126 428 M 184 483 L 184 482 187 486 186 486 184 483 M 263 289 L 265 290 267 289 263 289 M 489 546 L 441 541 Q 433 546 431 549 L 457 556 Q 489 556 493 543 L 489 546 M 311 581 L 305 555 352 561 Q 377 563 377 577 L 368 586 Q 358 594 348 594 L 311 581";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 847 286 L 847 292 857 295 Q 878 301 886 308 912 327 907 351 902 372 879 377 L 856 383 846 388 835 390 823 397 812 399 780 413 715 433 618 453 587 468 515 473 487 468 473 466 Q 330 470 327 442 314 427 325 408 285 390 278 378 L 273 372 273 370 258 359 Q 241 346 244 335 L 224 318 222 314 213 314 188 304 190 307 189 309 161 298 158 288 150 251 Q 150 240 136 217 L 158 209 168 207 194 193 Q 247 168 286 158 L 308 152 Q 308 146 335 140 L 383 136 388 136 Q 475 118 529 115 L 477 114 473 113 425 108 Q 395 108 390 115 L 364 115 253 129 220 136 209 136 Q 179 137 153 148 L 152 142 150 140 145 137 105 99 Q 73 70 108 47 136 30 175 29 L 186 29 220 21 330 7 356 6 Q 361 1 391 -1 L 439 5 442 6 597 16 Q 646 25 678 41 733 62 748 85 L 745 99 748 106 753 108 Q 750 123 727 138 L 720 142 722 143 740 147 756 160 755 169 750 166 Q 761 181 751 201 L 750 205 747 209 750 208 755 206 770 208 794 216 Q 807 228 791 230 L 788 231 786 232 791 234 803 244 Q 844 274 847 286 M 267 317 L 263 317 265 319 267 317";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 390 -10 Q 415 1 447 7 L 455 8 459 15 Q 465 30 447 40 L 441 43 452 46 Q 487 55 500 84 511 108 483 121 L 489 120 509 115 529 118 Q 545 120 548 127 552 136 526 145 L 498 152 Q 479 154 483 149 L 491 141 483 137 474 131 Q 472 127 477 124 L 428 133 Q 397 137 373 122 375 138 356 152 336 168 320 171 L 293 173 Q 285 183 247 193 202 198 181 173 L 177 167 Q 148 170 129 149 108 127 139 124 L 176 128 Q 206 136 209 142 L 209 143 211 143 232 141 225 135 219 122 216 123 Q 178 128 166 110 L 165 108 147 113 Q 118 116 120 103 123 92 146 88 L 168 91 182 87 211 87 233 90 255 84 287 83 297 83 322 85 328 90 351 97 Q 350 92 354 88 361 67 370 56 380 47 394 44 378 35 361 3 L 375 -8 390 -10 M 161 -6 Q 189 5 197 22 208 45 197 59 185 72 160 75 94 82 67 39 39 -4 103 -11 L 161 -6 M 357 -14 Q 363 5 352 26 341 52 310 55 L 256 52 Q 212 42 198 15 192 1 192 -9 L 253 -3 Q 325 -1 357 -14 M 562 -22 L 577 -17 628 -16 Q 628 0 610 10 L 575 20 558 20 565 30 Q 573 48 556 59 L 531 68 Q 496 72 471 43 450 17 486 10 L 483 10 Q 515 9 542 -5 L 562 -22 M 882 233 L 904 253 Q 906 257 891 260 874 264 820 249 766 236 813 225 859 215 882 233 M 958 360 L 957 361 956 360 958 360 M 893 327 Q 881 335 860 339 L 843 342 854 350 Q 874 364 862 375 854 383 840 388 805 395 763 372 724 353 761 342 732 340 723 332 688 311 709 284 726 266 750 259 L 822 263 Q 864 273 882 288 914 312 893 327 M 828 453 L 826 453 814 448 813 442 766 456 701 453 Q 713 467 700 482 L 686 495 Q 659 498 651 506 L 643 507 634 518 616 528 606 530 Q 560 540 525 522 L 518 516 Q 486 523 456 508 420 491 452 484 L 493 483 Q 529 486 537 492 L 536 493 541 492 560 488 550 483 537 472 534 474 Q 496 483 472 468 L 470 467 453 473 Q 425 481 420 469 416 458 440 453 L 465 452 476 447 508 443 534 443 Q 541 438 555 435 L 586 430 598 429 626 428 635 431 665 435 Q 660 430 662 427 657 407 660 397 666 388 680 383 659 377 621 351 623 344 630 340 L 648 336 Q 698 325 732 350 749 362 734 373 L 729 377 744 377 Q 786 382 816 404 841 425 820 439 L 824 437 839 432 Q 823 440 827 452 L 828 453 M 730 112 Q 718 133 691 137 629 144 589 103 548 62 608 55 L 670 57 Q 719 65 731 93 744 91 730 112 M 636 196 L 636 194 631 194 633 196 636 196 M 652 166 Q 674 172 686 195 693 214 667 226 650 236 635 238 580 244 570 208 L 569 206 Q 567 214 555 219 L 533 225 Q 497 229 497 211 497 194 530 191 L 550 192 Q 564 193 566 198 566 191 572 185 L 557 189 Q 533 193 516 173 500 156 533 152 L 558 152 Q 577 155 581 163 L 581 175 Q 592 167 614 166 640 162 652 166 M 756 152 Q 776 157 781 167 789 186 760 195 745 196 715 175 686 153 726 150 L 756 152 M 409 241 L 385 243 390 249 Q 398 266 369 275 L 336 282 Q 314 284 305 261 298 241 337 234 323 225 319 210 307 171 380 162 L 419 165 Q 447 173 457 194 467 216 442 230 427 239 409 241 M 552 268 L 583 267 Q 614 268 629 280 641 290 634 297 L 621 302 Q 574 313 547 294 522 276 552 268 M 603 334 Q 625 351 625 372 628 397 597 403 L 537 407 Q 484 404 455 382 418 354 442 338 452 330 488 322 L 542 316 Q 581 316 603 334 M 451 295 L 476 301 Q 486 309 471 314 L 456 320 416 314 Q 395 309 430 299 L 451 295 M 412 356 Q 378 363 354 346 332 329 367 321 L 397 320 Q 423 321 438 333 442 335 430 345 L 412 356 M 478 420 Q 472 433 447 440 382 453 328 419 274 387 338 372 L 404 369 Q 440 375 457 389 481 407 478 420 M 638 475 L 638 470 631 472 Q 633 475 636 475 L 638 475 M 709 493 L 731 488 774 485 816 496 728 493 709 493 M 271 231 Q 280 251 255 263 L 227 273 Q 168 279 156 246 141 214 194 207 L 236 210 Q 265 216 271 231 M 308 132 L 301 134 305 137 306 137 308 132 M 120 21 L 113 21 121 34 128 36 129 33 120 21 M 155 393 L 158 392 159 393 157 395 155 393 M 282 464 L 287 465 Q 302 467 302 475 L 302 480 290 484 288 484 286 476 282 464 M 205 395 L 185 388 Q 215 387 222 402 L 205 395 M 374 398 L 366 398 383 408 392 409 390 407 374 398";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 15 -37 L 13 -36 13 -37 24 -41 15 -37 M 95 -34 L 119 -27 133 -8 Q 144 16 121 32 109 41 91 43 L 52 36 Q 25 25 20 12 L 22 11 28 -15 Q 35 -41 52 -42 L 60 -43 95 -34 M 196 -8 L 219 -6 219 -4 Q 221 -1 216 1 L 211 2 Q 198 4 196 -3 L 196 -8 M 619 -14 Q 639 -11 643 1 651 15 642 26 635 38 619 39 564 46 555 16 544 -11 581 -16 L 619 -14 M 717 -32 L 727 -26 Q 730 -16 720 -11 L 711 -9 Q 691 -7 688 -20 683 -32 703 -34 L 717 -32 M 413 -1 Q 439 8 447 23 456 45 438 56 L 408 65 Q 339 73 334 36 330 0 372 -5 L 413 -1 M 743 66 L 742 48 749 22 752 26 Q 761 45 744 64 L 743 66 M 736 13 L 717 52 726 79 711 83 Q 683 87 666 51 648 15 692 10 L 736 13 M 726 99 L 743 120 730 127 Q 714 128 705 115 697 102 718 99 L 726 99 M 777 151 L 788 160 Q 793 171 773 194 L 800 198 783 213 760 207 746 216 Q 763 220 777 230 789 241 771 248 L 749 253 Q 695 265 667 244 L 662 241 657 241 629 249 Q 580 256 567 225 552 195 598 188 656 182 672 215 L 701 211 673 188 Q 648 156 724 146 L 756 146 777 151 M 815 210 L 845 216 867 211 905 206 921 225 943 244 955 241 945 255 918 267 Q 872 277 826 248 783 223 815 210 M 984 277 Q 993 278 998 282 1006 288 998 293 L 991 297 Q 970 302 958 291 947 281 966 277 L 984 277 M 936 337 Q 935 347 918 351 862 364 837 339 810 316 851 306 905 300 923 314 938 326 936 337 M 992 314 Q 968 323 962 343 947 325 980 317 L 992 314 M 893 284 Q 902 292 884 294 L 856 289 Q 839 282 853 279 L 873 279 893 284 M 820 278 L 807 285 Q 783 290 775 279 768 266 783 263 L 813 266 820 278 825 273 830 276 829 279 821 280 820 278 M 858 423 Q 807 435 765 410 723 386 788 370 L 819 369 Q 846 369 855 376 880 395 877 408 877 419 858 423 M 827 452 L 839 467 Q 845 480 836 489 L 820 496 738 493 Q 724 488 710 477 681 453 682 439 683 428 700 425 L 772 427 Q 806 435 827 446 L 827 452 M 648 78 Q 647 82 635 83 617 84 609 72 601 58 624 56 L 644 60 648 78 M 631 173 Q 569 180 552 142 535 104 593 98 L 633 103 Q 657 110 666 126 676 148 660 162 648 171 631 173 M 517 37 Q 488 41 481 28 473 16 501 13 L 521 13 Q 537 15 540 21 546 36 517 37 M 552 96 Q 546 107 528 110 475 115 453 83 430 52 495 44 L 523 47 Q 546 50 550 59 562 82 552 96 M 478 173 L 447 183 Q 420 187 408 183 382 178 368 148 354 120 365 104 372 93 389 92 417 88 449 103 480 117 489 137 500 160 478 173 M 452 197 L 473 199 486 216 Q 493 230 476 231 L 453 226 Q 436 220 432 214 428 206 438 201 L 452 197 M 452 243 L 473 251 Q 477 256 436 266 414 267 411 253 408 238 440 234 453 233 456 238 L 454 241 452 243 M 503 175 Q 541 171 546 183 551 195 546 200 L 530 203 Q 502 206 490 192 478 178 503 175 M 545 225 Q 549 235 537 236 L 495 231 Q 481 224 518 219 L 534 218 Q 542 219 545 225 M 532 162 Q 477 151 528 145 544 142 547 148 L 532 162 M 581 260 Q 591 269 582 277 L 569 283 Q 549 288 533 276 521 266 528 262 L 539 258 560 257 581 260 M 563 351 Q 525 360 482 328 440 298 487 287 509 282 537 287 571 292 591 307 621 330 597 342 L 563 351 M 580 368 Q 585 372 578 374 L 571 377 542 375 Q 532 368 549 365 L 580 368 M 445 361 L 457 360 467 362 Q 471 367 467 369 L 461 370 442 367 Q 435 362 445 361 M 440 346 L 427 351 Q 402 356 396 346 389 337 413 332 L 444 337 Q 449 341 440 346 M 412 321 L 400 326 Q 363 335 351 321 340 309 361 304 L 386 299 Q 404 299 414 308 424 314 412 321 M 484 385 Q 508 380 535 385 L 570 394 574 397 584 404 Q 601 417 589 426 L 571 435 Q 510 449 476 423 441 396 484 385 M 430 403 L 456 409 Q 468 419 437 425 418 430 412 425 L 401 414 Q 392 407 409 403 L 430 403 M 443 445 L 434 447 Q 416 451 408 443 401 436 416 434 L 445 436 Q 450 440 443 445 M 439 471 Q 456 473 483 490 480 495 480 504 L 466 514 Q 442 519 423 503 388 477 417 471 428 468 439 471 M 497 453 L 523 456 Q 532 463 514 467 L 490 464 Q 479 457 497 453 M 597 452 L 635 451 Q 668 453 681 463 711 486 654 498 635 503 599 482 564 460 597 452 M 576 489 L 602 500 Q 620 513 607 522 L 588 530 Q 533 542 519 515 504 488 534 481 L 576 489 M 800 340 L 824 345 Q 839 357 809 362 L 764 358 Q 749 349 776 343 L 800 340 M 766 323 Q 753 332 733 337 680 349 636 316 591 283 654 268 680 263 709 268 743 273 766 291 787 307 766 323 M 675 342 Q 708 346 724 358 747 376 733 388 L 707 400 Q 636 415 611 384 586 353 630 343 L 675 342 M 621 440 L 611 441 Q 606 440 599 435 589 428 608 424 L 630 427 Q 643 437 621 440 M 312 97 L 301 98 294 90 Q 290 81 309 78 322 77 326 85 331 98 312 97 M 310 22 L 302 24 Q 283 26 278 19 273 10 291 8 311 6 315 15 318 20 310 22 M 293 43 L 294 45 300 54 Q 307 70 292 79 L 270 86 Q 208 93 195 60 179 27 222 22 L 266 27 Q 283 33 293 43 M 203 113 Q 189 115 183 107 177 99 196 96 214 94 216 101 221 110 203 113 M 254 183 L 233 190 Q 177 196 180 166 183 135 211 131 224 130 244 145 L 261 160 Q 269 175 254 183 M 225 201 Q 240 204 245 215 250 226 235 233 L 218 236 Q 198 239 190 222 181 205 203 203 L 225 201 M 270 197 Q 290 181 303 179 L 346 182 Q 380 188 389 209 398 230 379 246 365 258 352 259 L 307 249 Q 275 238 264 228 246 216 270 197 M 307 164 Q 287 167 268 140 250 112 283 109 L 316 111 Q 344 117 349 130 363 158 307 164 M 160 59 L 137 57 135 42 Q 130 32 147 31 L 166 34 Q 181 38 184 45 189 57 160 59 M 136 107 Q 149 113 162 133 156 140 153 149 147 155 136 157 111 159 102 141 87 108 116 105 L 136 107 M 125 74 Q 122 67 137 65 156 62 160 72 L 153 79 145 82 Q 126 83 125 74 M 34 74 L 32 68 Q 36 61 43 60 73 57 86 82 90 92 66 100 L 58 87 Q 49 78 34 74 M 115 181 L 117 179 120 175 118 171 124 172 Q 153 179 161 194 168 210 156 219 L 145 224 115 181 M 164 276 L 172 277 191 279 193 278 195 280 Q 201 294 170 299 L 167 300 164 276 M 168 334 L 193 332 Q 220 334 230 342 245 352 229 361 L 212 367 Q 174 376 158 367 L 159 362 168 334 M 155 389 L 159 393 157 395 151 390 155 389 M 190 241 Q 196 252 186 257 L 178 261 Q 165 262 161 250 156 238 170 236 L 184 237 190 241 M 371 371 Q 397 390 382 407 373 416 355 420 L 309 418 Q 275 412 262 403 L 265 401 257 377 Q 249 355 266 351 L 309 349 Q 347 351 371 371 M 257 295 Q 227 299 218 273 211 250 235 248 L 276 257 Q 307 267 300 273 L 280 287 257 295 M 278 321 L 305 322 Q 303 329 286 332 L 266 330 Q 265 325 278 321 M 352 475 L 329 472 306 449 Q 307 442 314 440 344 434 372 455 384 465 352 475 M 399 508 L 424 510 Q 430 515 426 519 L 417 523 394 519 Q 383 512 399 508 M 588 540 L 593 541 583 541 588 540 M 519 556 Q 499 564 489 574 447 578 422 559 389 535 420 529 L 462 528 Q 498 530 515 542 L 525 554 519 556";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 743 66 L 745 78 748 94 Q 767 105 788 125 L 839 179 841 171 Q 845 165 861 165 L 892 169 Q 879 155 879 145 L 885 137 892 128 891 118 Q 892 112 905 104 L 926 104 Q 959 109 969 94 L 974 71 969 59 Q 979 63 979 84 L 974 102 909 111 901 117 899 122 903 140 895 148 917 169 933 183 933 184 Q 950 192 973 212 L 972 216 961 219 954 218 954 219 959 231 955 241 943 244 921 225 905 206 867 211 845 216 815 210 Q 800 204 800 195 L 808 183 Q 808 178 788 160 L 777 151 765 140 743 120 726 99 722 87 725 80 727 81 726 79 717 52 736 13 Q 749 -6 749 22 L 742 48 743 66 M 34 74 Q 49 78 58 87 L 66 100 78 111 96 135 110 161 109 166 104 166 Q 88 152 74 121 55 94 -1 82 L -37 66 -62 70 Q -51 59 -28 59 -4 58 2 71 L 34 74 M 145 224 L 150 233 164 276 167 300 167 303 166 309 167 309 169 311 170 322 168 334 159 362 158 367 163 383 155 389 151 390 107 393 103 399 92 404 59 398 Q 40 391 40 379 L 46 328 44 302 Q 40 285 25 280 L -26 276 -26 271 Q 35 268 51 291 L 56 328 54 384 88 389 94 382 134 377 141 367 137 358 137 342 Q 137 325 145 303 L 154 278 Q 154 266 130 217 L 105 169 115 181 145 224 M 283 435 Q 297 428 301 452 L 312 497 Q 318 517 343 554 L 365 590 363 595 358 596 345 587 330 578 320 584 329 584 329 587 317 591 Q 271 590 256 571 L 318 584 Q 307 575 270 455 270 442 283 435";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1955(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1954",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj420=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/420.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj420,"assets/takeover/art/images/420.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj420.src="assets/takeover/art/images/420.png";
function image420(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1020 2000 1020 2000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.01,0,0,1.0196078431372548,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj420);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape3748(ctx,ctrans,frame,ratio,time){
	var pathData="M 834 50 L 823 64 Q 811 74 797 74 786 74 774 60 762 47 762 38 762 10 798 17 834 25 834 50 M 891 101 Q 891 104 908 112 L 912 108 891 101 M 879 36 L 873 39 866 40 861 30 857 20 Q 857 12 860 15 L 914 15 Q 918 26 908 38 L 880 36 869 34 879 36 M 967 108 L 971 110 957 101 957 102 967 108 M 913 65 Q 992 88 992 112 992 122 974 135 949 152 905 152 864 152 845 127 833 110 833 93 833 42 913 65 M 1077 197 L 1070 216 Q 1056 235 1025 235 1007 235 994 208 983 186 983 173 L 986 159 Q 1077 163 1077 197 M 1028 180 L 1021 178 1002 178 1007 182 1028 180 M 832 178 L 879 174 Q 918 175 942 194 966 212 945 226 L 918 238 900 241 906 245 Q 929 259 933 295 L 936 309 933 316 Q 927 342 877 379 L 877 380 Q 877 391 858 394 L 853 396 831 409 827 418 827 425 828 425 839 438 Q 845 451 836 461 L 820 468 816 468 738 465 730 465 Q 654 503 597 522 L 524 524 525 526 519 528 507 534 508 547 508 549 509 550 509 554 508 556 508 570 Q 503 592 479 592 414 592 379 564 360 550 355 534 L 314 541 Q 297 541 279 517 263 495 263 482 263 470 281 468 L 264 462 254 458 243 472 Q 227 488 201 488 183 488 151 471 119 454 119 446 119 414 168 425 L 178 427 173 423 Q 164 413 164 401 164 383 177 375 139 353 118 328 L 109 316 104 315 Q 98 309 99 299 L 95 290 81 293 56 296 35 293 34 284 Q 34 245 77 242 L 50 201 Q 32 183 32 150 32 127 41 110 30 118 1 118 L -16 110 Q 21 89 44 95 L 47 100 66 82 Q 79 72 98 64 L 94 57 118 42 139 52 201 39 204 34 209 14 229 35 244 33 329 33 354 42 355 40 Q 360 26 355 10 L 401 17 453 23 471 20 488 17 520 26 535 31 567 20 612 20 635 31 647 24 Q 663 49 698 49 731 49 755 14 L 744 36 737 44 752 64 Q 758 78 747 93 792 124 815 156 L 826 170 838 166 844 166 Q 845 165 846 167 849 176 834 177 L 831 178 832 178 M 820 221 L 804 216 830 237 844 241 825 223 820 221 M 992 287 Q 968 294 962 314 947 296 980 288 L 992 287 M 998 266 L 991 269 Q 970 273 958 262 947 253 966 248 L 984 248 998 253 Q 1006 261 998 266 M 895 342 L 879 350 862 353 872 364 895 342 M 734 117 L 756 117 760 118 738 102 Q 733 105 727 110 L 720 115 722 115 734 117 M 907 325 L 906 325 905 329 907 325 M 783 97 Q 775 89 788 87 L 800 88 808 94 Q 812 105 800 103 791 104 783 97 M 796 173 L 785 183 794 188 Q 807 199 791 203 L 788 203 786 204 791 205 792 206 Q 793 203 803 199 801 194 804 190 L 796 173 M 794 167 L 786 147 773 166 795 169 794 167 M 517 88 L 529 87 495 85 488 90 498 89 509 88 517 88 M 452 446 L 471 455 493 456 521 458 534 453 548 453 539 446 535 446 534 446 Q 496 455 472 440 L 470 439 453 446 452 446 M 706 446 L 700 454 696 458 713 451 710 449 706 446 M 671 470 Q 656 472 651 477 L 643 478 642 482 671 470 M 301 68 Q 328 68 342 58 L 284 54 253 55 Q 274 68 301 68 M 86 62 Q 81 69 58 74 43 75 38 67 L 37 57 Q 50 65 68 65 L 86 62 M 128 348 L 124 369 96 371 Q 66 371 54 350 L 46 326 50 320 97 331 Q 128 342 128 348 M 50 216 L 43 228 Q 31 237 8 237 -4 237 -14 230 -26 222 -26 211 -26 193 12 196 50 199 50 216 M 265 290 L 267 289 263 289 265 290 M 489 546 L 441 541 Q 433 546 431 549 L 457 556 Q 489 556 493 543 L 489 546 M 352 561 Q 377 563 377 577 L 368 586 Q 358 594 348 594 289 577 289 563 L 291 556 293 554 352 561 M 213 437 L 212 437 223 440 220 437 213 437";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 847 286 L 847 292 857 295 Q 878 301 886 308 912 327 907 351 902 372 879 377 L 856 383 846 388 835 390 823 397 812 399 780 413 715 433 618 453 587 468 515 473 487 468 473 466 Q 330 470 327 442 314 427 325 408 285 390 278 378 L 273 372 273 370 258 359 Q 241 346 244 335 L 224 318 222 314 213 314 188 304 190 307 189 309 Q 156 299 151 289 L 149 288 Q 96 267 110 239 L 118 230 Q 130 215 158 209 L 168 207 194 193 Q 247 168 286 158 L 308 152 Q 308 146 335 140 L 383 136 388 136 Q 475 118 529 115 L 477 114 473 113 425 108 Q 395 108 390 115 L 364 115 253 129 220 136 209 136 Q 179 137 153 148 L 152 142 150 140 145 137 105 99 Q 73 70 108 47 136 30 175 29 L 186 29 220 21 330 7 356 6 Q 361 1 391 -1 L 439 5 442 6 597 16 Q 646 25 678 41 742 65 752 92 761 115 727 138 L 720 142 722 143 740 147 756 160 755 169 750 166 Q 761 181 751 201 L 750 205 747 209 750 208 755 206 770 208 794 216 Q 807 228 791 230 L 788 231 786 232 791 234 803 244 Q 844 274 847 286 M 953 152 L 950 157 935 162 929 161 926 159 926 152 Q 926 141 940 142 953 142 953 152 M 876 73 Q 911 77 911 99 L 911 103 911 107 907 115 Q 900 127 882 127 L 872 127 867 127 849 117 848 115 Q 840 106 840 90 840 68 876 73 M 965 112 L 959 110 957 104 965 94 Q 975 95 975 101 L 965 112 M 935 41 Q 933 54 917 53 L 904 47 899 40 Q 899 29 917 26 935 24 935 41 M 1023 183 L 1019 191 1001 199 Q 985 188 983 185 980 183 980 175 980 165 1002 167 1023 170 1023 183 M 263 317 L 265 319 267 317 263 317";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 161 -6 Q 189 5 197 22 208 45 197 59 185 72 160 75 94 82 67 39 39 -4 103 -11 L 161 -6 M 390 -10 Q 415 1 447 7 L 455 8 459 15 Q 465 30 447 40 L 441 43 452 46 Q 487 55 500 84 511 108 483 121 L 489 120 509 115 529 118 Q 545 120 548 127 552 136 526 145 L 498 152 Q 479 154 483 149 L 491 141 483 137 474 131 Q 472 127 477 124 L 428 133 Q 397 137 373 122 375 138 356 152 336 168 320 171 L 293 173 Q 285 183 247 193 202 198 181 173 L 177 167 Q 148 170 129 149 108 127 139 124 L 176 128 Q 206 136 209 142 L 209 143 211 143 232 141 225 135 219 122 216 123 Q 178 128 166 110 L 165 108 147 113 Q 118 116 120 103 123 92 146 88 L 168 91 182 87 211 87 233 90 255 84 287 83 297 83 322 85 328 90 351 97 Q 350 92 354 88 361 67 370 56 380 47 394 44 378 35 361 3 L 375 -8 390 -10 M 357 -14 Q 363 5 352 26 341 52 310 55 L 256 52 Q 212 42 198 15 192 1 192 -9 L 253 -3 Q 325 -1 357 -14 M 628 -16 Q 628 0 610 10 L 575 20 558 20 565 30 Q 573 48 556 59 L 531 68 Q 496 72 471 43 450 17 486 10 L 483 10 Q 515 9 542 -5 L 562 -22 577 -17 628 -16 M 843 118 Q 836 110 836 103 836 77 876 83 915 89 915 112 L 911 120 867 129 Q 853 129 843 118 M 971 105 L 960 112 950 110 948 104 950 99 Q 971 96 971 105 M 917 32 Q 932 29 932 42 L 926 49 911 54 Q 902 54 902 46 902 36 917 32 M 882 233 L 904 253 Q 906 257 891 260 874 264 820 249 766 236 813 225 859 215 882 233 M 1007 191 Q 1005 206 986 206 977 206 971 198 L 966 187 Q 966 170 987 170 1007 171 1007 191 M 953 150 L 939 159 928 157 920 152 Q 934 141 943 141 953 140 953 150 M 957 361 L 956 360 958 360 957 361 M 893 327 Q 881 335 860 339 L 843 342 854 350 Q 874 364 862 375 854 383 840 388 805 395 763 372 724 353 761 342 732 340 723 332 688 311 709 284 726 266 750 259 L 822 263 Q 864 273 882 288 914 312 893 327 M 828 453 L 826 453 814 448 813 442 766 456 701 453 Q 713 467 700 482 L 686 495 Q 659 498 651 506 L 643 507 634 518 616 528 606 530 Q 560 540 525 522 L 518 516 Q 486 523 456 508 420 491 452 484 L 493 483 Q 529 486 537 492 L 536 493 541 492 560 488 550 483 537 472 534 474 Q 496 483 472 468 L 470 467 453 473 Q 425 481 420 469 416 458 440 453 L 465 452 476 447 508 443 534 443 Q 541 438 555 435 L 586 430 598 429 626 428 635 431 665 435 Q 660 430 662 427 657 407 660 397 666 388 680 383 659 377 621 351 623 344 630 340 L 648 336 Q 698 325 732 350 749 362 734 373 L 729 377 744 377 Q 786 382 816 404 841 425 820 439 L 824 437 839 432 Q 823 440 827 452 L 828 453 M 730 112 Q 718 133 691 137 629 144 589 103 548 62 608 55 L 670 57 Q 719 65 731 93 744 91 730 112 M 631 194 L 633 196 636 196 636 194 631 194 M 652 166 Q 674 172 686 195 693 214 667 226 650 236 635 238 580 244 570 208 L 569 206 Q 567 214 555 219 L 533 225 Q 497 229 497 211 497 194 530 191 L 550 192 Q 564 193 566 198 566 191 572 185 L 557 189 Q 533 193 516 173 500 156 533 152 L 558 152 Q 577 155 581 163 L 581 175 Q 592 167 614 166 640 162 652 166 M 756 152 Q 776 157 781 167 789 186 760 195 745 196 715 175 686 153 726 150 L 756 152 M 409 241 L 385 243 390 249 Q 398 266 369 275 L 336 282 Q 314 284 305 261 298 241 337 234 323 225 319 210 307 171 380 162 L 419 165 Q 447 173 457 194 467 216 442 230 427 239 409 241 M 552 268 L 583 267 Q 614 268 629 280 641 290 634 297 L 621 302 Q 574 313 547 294 522 276 552 268 M 603 334 Q 625 351 625 372 628 397 597 403 L 537 407 Q 484 404 455 382 418 354 442 338 452 330 488 322 L 542 316 Q 581 316 603 334 M 451 295 L 476 301 Q 486 309 471 314 L 456 320 416 314 Q 395 309 430 299 L 451 295 M 412 356 Q 378 363 354 346 332 329 367 321 L 397 320 Q 423 321 438 333 442 335 430 345 L 412 356 M 478 420 Q 472 433 447 440 382 453 328 419 274 387 338 372 L 404 369 Q 440 375 457 389 481 407 478 420 M 638 475 L 638 470 631 472 Q 633 475 636 475 L 638 475 M 774 485 L 816 496 728 493 709 493 731 488 774 485 M 271 231 Q 280 251 255 263 L 227 273 Q 168 279 156 246 141 214 194 207 L 236 210 Q 265 216 271 231 M 308 132 L 301 134 305 137 306 137 308 132 M 128 36 L 129 33 120 21 113 21 121 34 128 36 M 271 475 Q 271 461 287 465 302 467 302 475 L 302 480 290 484 278 481 271 475 M 139 410 Q 139 392 182 388 224 385 224 413 L 220 423 Q 210 431 182 431 L 151 422 139 410 M 104 301 L 103 304 91 307 70 305 Q 67 304 67 297 67 287 86 288 104 289 104 301 M 49 237 Q 40 236 40 228 40 224 53 222 65 220 65 226 65 234 49 237 M 374 398 L 366 398 383 408 392 409 390 407 374 398";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13 -37 L 24 -41 15 -37 13 -36 13 -37 M 95 -34 L 119 -27 133 -8 Q 144 16 121 32 109 41 91 43 L 52 36 Q 25 25 20 12 L 22 11 28 -15 Q 35 -41 52 -42 L 60 -43 95 -34 M 196 -8 L 219 -6 219 -4 Q 221 -1 216 1 L 211 2 Q 198 4 196 -3 L 196 -8 M 619 -14 Q 639 -11 643 1 651 15 642 26 635 38 619 39 564 46 555 16 544 -11 581 -16 L 619 -14 M 688 -20 Q 683 -32 703 -34 L 717 -32 727 -26 Q 730 -16 720 -11 L 711 -9 Q 691 -7 688 -20 M 413 -1 Q 439 8 447 23 456 45 438 56 L 408 65 Q 339 73 334 36 330 0 372 -5 L 413 -1 M 866 112 L 845 108 843 101 Q 843 84 867 83 890 80 890 98 894 112 866 112 M 838 194 L 844 194 846 196 Q 848 202 842 204 L 879 203 Q 918 203 942 222 966 241 945 255 L 918 267 Q 872 277 826 248 776 219 829 206 L 833 205 820 203 Q 821 199 838 194 M 984 277 Q 993 278 998 282 1006 288 998 293 L 991 297 Q 970 302 958 291 947 281 966 277 L 984 277 M 936 337 Q 935 347 918 351 862 364 837 339 810 316 851 306 905 300 923 314 938 326 936 337 M 992 314 Q 968 323 962 343 947 325 980 317 L 992 314 M 893 284 Q 902 292 884 294 L 856 289 Q 839 282 853 279 L 873 279 893 284 M 820 278 L 807 285 Q 783 290 775 279 768 266 783 263 L 813 266 820 278 825 273 830 276 829 279 821 280 820 278 M 858 423 Q 807 435 765 410 723 386 788 370 L 819 369 Q 846 369 855 376 880 395 877 408 877 419 858 423 M 827 452 L 839 467 Q 845 480 836 489 L 820 496 738 493 Q 724 488 710 477 681 453 682 439 683 428 700 425 L 772 427 Q 806 435 827 446 L 827 452 M 742 108 Q 750 125 730 127 714 128 705 115 697 102 718 99 L 731 99 Q 740 100 742 108 M 744 64 Q 730 81 711 83 683 87 666 51 648 15 692 10 742 5 752 26 761 45 744 64 M 800 116 L 808 122 Q 812 133 800 131 791 133 783 125 775 117 788 115 L 800 116 M 648 78 Q 647 82 635 83 617 84 609 72 601 58 624 56 L 644 60 648 78 M 657 241 L 629 249 Q 580 256 567 225 552 195 598 188 656 182 672 215 L 701 211 673 188 Q 648 156 724 146 L 756 146 Q 783 148 788 160 793 171 773 194 L 800 198 783 213 760 207 746 216 Q 763 220 777 230 789 241 771 248 L 749 253 Q 695 265 667 244 L 662 241 657 241 M 631 173 Q 569 180 552 142 535 104 593 98 L 633 103 Q 657 110 666 126 676 148 660 162 648 171 631 173 M 540 21 Q 546 36 517 37 488 41 481 28 473 16 501 13 L 521 13 Q 537 15 540 21 M 528 110 Q 475 115 453 83 430 52 495 44 L 523 47 Q 546 50 550 59 562 82 552 96 546 107 528 110 M 478 173 L 447 183 Q 420 187 408 183 382 178 368 148 354 120 365 104 372 93 389 92 417 88 449 103 480 117 489 137 500 160 478 173 M 452 243 L 473 251 Q 477 256 436 266 414 267 411 253 408 238 440 234 453 233 456 238 L 454 241 452 243 M 432 214 Q 428 206 438 201 L 452 197 473 199 486 216 Q 493 230 476 231 L 453 226 Q 436 220 432 214 M 503 175 Q 541 171 546 183 551 195 546 200 L 530 203 Q 502 206 490 192 478 178 503 175 M 545 225 Q 549 235 537 236 L 495 231 Q 481 224 518 219 L 534 218 Q 542 219 545 225 M 532 162 Q 477 151 528 145 544 142 547 148 L 532 162 M 569 283 Q 549 288 533 276 521 266 528 262 L 539 258 560 257 581 260 Q 591 269 582 277 L 569 283 M 563 351 Q 525 360 482 328 440 298 487 287 509 282 537 287 571 292 591 307 621 330 597 342 L 563 351 M 580 368 Q 585 372 578 374 L 571 377 542 375 Q 532 368 549 365 L 580 368 M 440 346 L 427 351 Q 402 356 396 346 389 337 413 332 L 444 337 Q 449 341 440 346 M 445 361 L 457 360 467 362 Q 471 367 467 369 L 461 370 442 367 Q 435 362 445 361 M 412 321 L 400 326 Q 363 335 351 321 340 309 361 304 L 386 299 Q 404 299 414 308 424 314 412 321 M 484 385 Q 508 380 535 385 L 570 394 574 397 584 404 Q 601 417 589 426 L 571 435 Q 510 449 476 423 441 396 484 385 M 430 403 L 456 409 Q 468 419 437 425 418 430 412 425 L 401 414 Q 392 407 409 403 L 430 403 M 443 445 L 434 447 Q 416 451 408 443 401 436 416 434 L 445 436 Q 450 440 443 445 M 439 471 Q 456 473 483 490 480 495 480 504 L 466 514 Q 442 519 423 503 388 477 417 471 428 468 439 471 M 497 453 L 523 456 Q 532 463 514 467 L 490 464 Q 479 457 497 453 M 597 452 L 635 451 Q 668 453 681 463 711 486 654 498 635 503 599 482 564 460 597 452 M 576 489 L 602 500 Q 620 513 607 522 L 588 530 Q 533 542 519 515 504 488 534 481 L 576 489 M 800 340 L 824 345 Q 839 357 809 362 L 764 358 Q 749 349 776 343 L 800 340 M 733 337 Q 680 349 636 316 591 283 654 268 680 263 709 268 743 273 766 291 787 307 766 323 753 332 733 337 M 675 342 Q 708 346 724 358 747 376 733 388 L 707 400 Q 636 415 611 384 586 353 630 343 L 675 342 M 630 427 Q 643 437 621 440 L 611 441 Q 606 440 599 435 589 428 608 424 L 630 427 M 312 97 L 301 98 294 90 Q 290 81 309 78 322 77 326 85 331 98 312 97 M 310 22 L 302 24 Q 283 26 278 19 273 10 291 8 311 6 315 15 318 20 310 22 M 293 43 L 294 45 300 54 Q 307 70 292 79 L 270 86 Q 208 93 195 60 179 27 222 22 L 266 27 Q 283 33 293 43 M 203 113 Q 189 115 183 107 177 99 196 96 214 94 216 101 221 110 203 113 M 254 183 L 233 190 Q 177 196 180 166 183 135 211 131 224 130 244 145 L 261 160 Q 269 175 254 183 M 225 201 Q 240 204 245 215 250 226 235 233 L 218 236 Q 198 239 190 222 181 205 203 203 L 225 201 M 270 197 Q 290 181 303 179 L 346 182 Q 380 188 389 209 398 230 379 246 365 258 352 259 L 307 249 Q 275 238 264 228 246 216 270 197 M 307 164 Q 287 167 268 140 250 112 283 109 L 316 111 Q 344 117 349 130 363 158 307 164 M 160 59 L 137 57 135 42 Q 130 32 147 31 L 166 34 Q 181 38 184 45 189 57 160 59 M 136 107 Q 149 113 162 133 156 140 153 149 147 155 136 157 111 159 102 141 87 108 116 105 L 136 107 M 125 74 Q 122 67 137 65 156 62 160 72 L 153 79 145 82 Q 126 83 125 74 M 58 102 Q 43 104 38 95 L 32 68 Q 36 61 43 60 73 57 86 82 91 94 58 102 M 87 167 L 124 172 Q 153 179 161 194 168 210 156 219 L 141 225 Q 85 230 71 200 56 171 87 167 M 100 148 Q 103 154 97 157 L 87 161 Q 72 162 68 153 65 145 81 143 96 141 100 148 M 127 234 L 142 236 148 239 Q 151 246 133 248 119 250 118 242 119 235 127 234 M 184 237 L 190 241 Q 196 252 186 257 L 178 261 Q 165 262 161 250 156 238 170 236 L 184 237 M 172 277 L 191 279 193 278 195 280 Q 201 294 170 299 149 301 135 290 123 279 153 276 L 172 277 M 193 332 Q 220 334 230 342 245 352 229 361 L 212 367 Q 159 379 150 358 141 339 161 335 L 193 332 M 137 400 Q 137 379 173 388 209 397 209 409 L 205 423 Q 195 436 170 436 145 436 137 400 M 82 288 Q 97 286 97 294 L 96 299 79 301 70 301 67 296 Q 67 289 82 288 M 371 371 Q 397 390 382 407 373 416 355 420 L 309 418 Q 275 412 262 403 L 265 401 257 377 Q 249 355 266 351 L 309 349 Q 347 351 371 371 M 257 295 Q 227 299 218 273 211 250 235 248 L 276 257 Q 307 267 300 273 L 280 287 257 295 M 278 321 L 305 322 Q 303 329 286 332 L 266 330 Q 265 325 278 321 M 276 468 Q 292 470 292 480 L 287 488 272 495 263 485 260 476 Q 260 466 276 468 M 352 475 L 329 472 306 449 Q 307 442 314 440 344 434 372 455 384 465 352 475 M 399 508 L 424 510 Q 430 515 426 519 L 417 523 394 519 Q 383 512 399 508 M 525 554 L 519 556 Q 499 564 489 574 447 578 422 559 389 535 420 529 L 462 528 Q 498 530 515 542 L 525 554 M 588 540 L 593 541 583 541 588 540";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 618 37 Q 618 51 684 82 L 702 81 Q 711 79 711 70 711 61 704 61 L 692 65 Q 683 65 653 48 L 652 45 661 32 Q 661 11 629 -7 598 -26 598 -3 598 4 603 4 L 618 2 Q 623 2 631 11 L 638 21 628 29 618 37 M 715 57 L 713 59 711 63 Q 711 81 754 124 L 797 165 797 167 804 182 Q 812 193 820 193 L 841 188 843 199 860 203 882 198 914 205 Q 926 211 926 218 L 922 234 Q 916 237 916 245 L 917 250 919 251 Q 904 257 904 291 904 324 914 324 928 324 931 312 935 302 931 297 943 298 943 277 L 942 265 958 272 982 278 Q 1000 278 996 263 996 239 979 239 L 965 243 955 250 959 256 958 259 950 258 Q 948 258 941 261 L 932 250 939 241 Q 950 234 949 211 949 194 920 182 891 170 854 170 L 832 174 826 176 Q 825 162 806 141 785 117 757 106 L 759 100 756 93 738 83 755 57 Q 755 36 731 36 708 36 708 49 L 715 57 M 766 13 L 767 17 770 18 Q 752 26 752 40 752 51 764 51 777 51 780 44 L 784 33 785 32 797 43 790 65 Q 790 75 799 75 815 75 815 44 815 28 807 20 796 10 767 9 L 766 13 M 734 54 L 726 69 717 58 734 54 M 875 19 L 898 23 893 24 886 29 913 33 932 15 Q 932 5 883 3 L 883 1 860 5 Q 853 9 853 18 L 856 25 868 34 873 28 870 21 875 19 M 845 79 L 848 71 Q 851 64 856 63 L 860 72 847 85 845 79 M 854 94 Q 872 80 898 80 913 80 927 91 L 936 84 Q 954 90 954 97 L 941 110 Q 928 117 928 123 928 133 941 133 961 133 971 112 L 977 91 Q 828 -10 828 99 828 107 837 107 L 854 94 M 973 166 Q 973 169 980 172 L 999 171 1024 171 1043 195 1024 196 1022 197 Q 1036 208 1046 208 1063 208 1065 193 1065 185 1050 168 1031 147 1009 147 L 981 155 Q 973 161 973 166 M 979 252 L 980 252 983 264 980 264 979 252";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape1956(ctx,ctrans,frame,ratio,time){
	var pathData="M 801 122 L 806 132 812 127 801 119 801 122 M 754 96 L 763 96 Q 775 100 788 107 L 801 114 801 115 821 129 807 141 807 146 806 166 803 167 802 167 803 213 803 241 806 241 803 245 801 280 800 278 801 272 796 254 797 253 797 248 794 250 793 251 781 247 770 249 761 248 761 243 767 243 754 238 Q 750 238 748 242 L 747 245 749 250 733 270 748 280 749 291 745 308 Q 694 305 694 339 L 698 359 Q 665 394 652 394 640 394 635 375 L 632 365 623 354 609 354 593 357 551 349 528 338 501 338 498 334 502 328 506 322 508 317 510 312 504 306 483 302 Q 480 302 463 315 L 446 328 448 336 437 353 415 366 408 362 384 361 Q 359 344 354 342 L 343 331 334 323 Q 328 323 319 332 L 312 336 295 336 278 333 267 327 Q 262 327 251 338 L 266 353 266 361 245 366 225 376 214 376 196 372 183 376 Q 170 376 160 369 L 144 365 143 361 171 312 158 288 Q 158 284 185 265 211 245 211 224 L 210 214 201 204 186 204 174 212 130 212 104 213 101 216 109 222 113 229 87 257 81 253 56 262 37 270 33 268 29 279 11 277 6 272 3 273 0 272 0 166 -2 159 0 149 Q 0 144 3 142 5 126 23 108 L 50 85 90 86 91 87 92 86 95 86 160 86 177 96 Q 193 106 207 106 L 215 104 218 104 263 96 279 90 286 89 322 98 369 108 387 106 391 106 436 92 528 70 565 70 580 74 585 75 587 76 623 88 676 101 733 95 754 96 M 421 456 L 399 460 Q 372 460 372 451 372 449 377 447 L 371 447 371 444 374 441 404 437 405 437 409 437 Q 423 437 423 448 L 421 456 M 488 385 Q 507 374 514 373 L 546 375 Q 577 379 577 389 577 399 561 408 L 527 417 510 413 501 406 471 406 468 402 Q 468 397 488 385 M 598 443 Q 600 437 608 434 L 610 433 628 431 646 435 648 443 Q 648 465 626 465 614 465 610 459 L 601 455 596 448 Q 596 441 607 442 L 607 439 598 443 M 732 331 L 722 334 Q 724 327 730 327 L 769 328 Q 783 328 783 342 776 376 754 376 721 376 721 355 L 722 350 717 350 Q 716 345 723 339 729 334 737 332 L 732 331 M 8 231 L 6 225 6 241 8 231 M 10 189 L 6 177 6 208 10 189 M 141 296 L 126 328 Q 109 339 91 349 L 75 348 59 355 56 353 44 353 Q 35 349 33 334 L 33 320 Q 33 310 36 306 L 55 299 Q 59 292 70 288 L 91 281 122 281 Q 141 285 141 296 M 62 295 L 60 296 68 293 62 295 M 65 402 L 61 395 69 389 85 384 101 384 107 388 113 393 118 399 118 401 122 410 119 411 116 409 Q 110 417 93 417 L 92 417 86 418 Q 68 418 65 402 M 288 387 Q 288 380 291 378 L 291 377 Q 289 381 284 381 L 296 368 Q 306 360 322 360 337 360 351 372 363 382 363 390 L 355 397 339 401 333 397 332 391 306 399 296 399 288 392 288 387 M 234 451 L 235 451 Q 237 443 263 438 L 270 438 Q 283 438 283 445 L 275 455 269 459 272 460 273 461 269 463 261 462 252 463 236 458 236 457 233 456 234 451 M 247 459 L 242 458 243 459 247 459 M 388 446 L 396 450 391 446 388 446";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 825 132 L 818 132 779 112 Q 747 95 734 95 L 689 105 690 110 692 119 693 119 693 122 693 124 693 126 710 132 Q 727 139 727 143 L 724 146 715 149 714 148 719 144 721 143 690 133 688 133 685 132 636 170 669 199 666 202 689 215 683 217 675 228 664 228 663 227 Q 667 221 676 217 L 647 201 619 211 616 211 616 204 Q 629 196 645 196 L 645 195 641 193 643 189 645 191 648 191 638 183 621 176 620 172 621 170 Q 608 171 605 175 L 601 185 563 187 559 186 597 180 602 174 606 170 604 168 605 166 614 166 626 165 631 159 642 150 649 146 657 142 668 133 679 124 679 123 671 113 668 110 643 116 639 115 Q 640 113 651 110 L 630 100 619 96 586 90 580 89 567 98 577 103 587 109 556 121 552 120 Q 555 115 570 108 L 565 105 561 98 555 101 552 100 551 98 566 87 556 85 538 79 540 80 538 81 529 78 525 75 518 74 488 83 441 99 413 111 413 112 412 115 402 115 398 117 399 117 Q 410 120 410 125 L 410 126 446 147 486 153 Q 485 161 456 173 L 454 172 Q 455 169 470 161 L 470 160 463 160 447 154 434 151 399 165 397 165 396 162 Q 393 164 391 165 L 395 167 411 171 412 174 405 180 396 190 389 190 403 175 388 166 388 164 389 164 Q 391 156 420 143 L 393 129 374 125 339 136 337 135 Q 339 131 354 127 L 356 126 Q 351 125 339 131 L 335 130 362 122 359 121 342 126 334 126 350 118 335 114 273 98 225 115 223 116 226 118 226 123 219 123 212 120 184 129 Q 201 135 201 145 L 199 151 Q 166 152 159 158 L 149 173 124 198 119 196 Q 110 196 90 206 L 93 214 89 215 84 210 82 205 Q 82 201 111 191 139 181 139 173 L 137 171 Q 137 164 146 157 L 143 155 Q 144 151 154 146 L 178 145 Q 163 137 163 134 L 168 132 168 131 164 130 167 129 174 123 175 123 178 121 196 113 192 111 143 92 122 95 54 96 49 101 28 122 22 131 9 140 -2 147 -3 145 -1 140 -12 137 3 122 15 108 28 96 22 95 30 91 25 91 24 93 23 91 34 90 37 87 47 89 91 87 105 86 163 86 177 92 180 92 181 94 210 108 220 104 223 104 Q 260 103 268 90 L 279 90 324 99 344 105 375 109 378 107 389 103 388 102 391 102 436 87 523 67 523 66 533 65 534 64 536 63 539 64 541 64 538 63 539 62 585 75 623 88 676 101 745 93 748 94 747 92 753 91 758 91 789 107 825 128 825 132 M 751 96 L 773 104 Q 756 95 750 95 L 751 96 M 655 109 L 664 106 661 103 661 101 620 91 638 99 655 108 655 109 M 682 111 L 681 111 682 112 682 111 M 551 68 L 554 68 552 67 551 68 M 534 75 L 569 83 571 84 572 83 535 75 534 75 M 528 71 L 562 77 533 69 528 71 M 584 86 L 614 94 590 87 584 86 M 405 107 L 394 110 398 110 406 108 406 107 405 107 M 477 156 L 478 156 467 153 477 156 M 341 107 L 326 104 337 107 341 107 M 377 117 L 372 116 373 117 371 119 377 117 M 381 113 L 386 114 388 114 383 113 381 113 M 387 120 L 381 122 398 125 397 122 389 120 387 120 M 226 106 L 225 105 223 107 226 106 M 221 114 L 225 112 221 113 221 114 M 177 137 L 172 137 177 138 177 137 M 111 194 L 123 191 112 193 111 194";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 636 192 L 630 192 Q 633 187 641 187 L 636 192";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 744 102 L 733 105 693 112 694 120 697 125 697 127 692 127 685 109 Q 685 104 688 101 L 689 101 691 102 712 98 719 97 740 93 745 93 755 93 749 100 804 127 804 133 796 133 771 118 Q 755 108 737 105 L 744 104 744 102 M 613 101 L 602 94 Q 601 90 596 90 582 90 572 100 L 576 101 572 107 564 108 560 106 562 104 546 100 548 94 551 94 567 98 Q 568 93 587 83 L 589 85 Q 590 83 592 83 601 83 622 94 L 642 110 639 111 613 101 M 690 131 L 694 130 Q 688 143 644 172 L 650 181 648 182 638 177 Q 631 171 629 171 L 663 149 688 133 690 131 M 619 177 Q 614 178 602 186 L 579 192 571 191 616 169 619 171 619 177 M 547 76 L 563 80 572 83 572 87 563 88 554 88 524 78 428 113 431 114 419 122 394 120 Q 396 116 408 113 L 404 112 Q 493 80 518 75 519 71 523 72 L 545 74 547 76 M 511 79 L 520 77 518 76 511 79 M 420 117 L 417 117 416 118 420 117 M 467 163 L 467 165 464 166 Q 443 166 432 155 L 403 171 399 170 395 166 429 151 427 149 435 148 437 147 439 149 461 154 465 156 466 158 459 160 467 163 M 417 147 L 393 139 372 129 337 139 331 139 329 136 Q 336 126 365 124 L 378 124 396 127 421 146 417 147 M 351 116 L 349 117 345 118 351 119 352 121 347 123 312 112 269 101 259 102 257 104 265 102 273 104 241 115 220 121 216 121 212 124 220 125 210 131 196 132 193 129 Q 193 125 215 120 L 213 118 Q 232 107 242 105 L 241 108 240 109 260 99 275 98 272 96 272 93 288 98 308 105 351 116 M 240 110 L 237 111 235 112 240 110 M 256 107 L 254 108 266 106 264 106 256 107 M 148 93 L 152 93 179 99 Q 194 106 198 116 L 171 132 187 140 187 142 177 142 177 146 169 146 164 150 156 150 147 156 141 158 139 159 Q 146 146 173 143 L 163 136 163 129 186 114 188 113 165 105 156 100 141 102 120 102 108 104 99 103 55 103 57 104 57 106 51 104 33 119 0 152 -2 146 Q -2 139 21 118 L 52 93 56 98 65 96 66 93 119 93 148 93";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape421(ctx,ctrans,frame,ratio,time){
	var pathData="M 970 560 L -1030 560 -1030 -460 970 -460 970 560";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1030,-460);
	ctx.transform(1.01,0,0,1.0196078431372548,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj420);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape3749(ctx,ctrans,frame,ratio,time){
	var pathData="M 971 326 Q 970 327 975 328 968 334 964 342 955 331 965 325 967 323 968 324 L 971 326 M 821 193 L 841 205 Q 856 227 876 282 L 878 285 877 292 882 292 Q 901 317 936 323 L 936 338 932 345 Q 921 372 860 410 L 860 411 Q 859 423 838 426 L 833 428 Q 820 434 807 442 L 802 450 800 458 801 457 811 471 Q 816 483 805 493 L 787 500 783 500 702 497 692 497 549 554 475 555 476 557 470 559 Q 462 561 457 565 L 456 577 456 579 457 580 457 584 456 586 455 599 Q 447 619 424 619 L 407 618 400 608 Q 353 585 347 575 L 336 541 Q 327 520 313 509 304 502 255 490 L 183 464 124 423 133 415 104 397 104 396 107 391 122 385 Q 127 382 134 381 163 373 164 356 165 313 56 300 L 32 279 8 243 1 235 -4 204 3 156 7 134 25 117 Q 38 105 59 97 L 55 90 81 72 102 83 169 67 172 61 178 39 199 62 215 58 307 55 333 65 334 63 Q 340 47 336 29 L 386 35 442 41 462 37 482 32 516 42 532 47 568 34 619 32 644 43 658 35 Q 672 62 712 61 749 60 781 20 L 775 33 767 45 Q 765 43 765 46 L 756 55 768 72 766 83 770 95 761 110 796 139 798 145 798 162 797 170 796 169 779 189 803 192 802 190 800 180 821 193 M 846 268 L 828 249 823 247 806 242 832 264 846 268 M 902 355 L 901 355 899 357 902 355 M 868 381 L 849 385 858 396 886 373 868 381 M 790 207 L 799 212 Q 812 223 794 229 L 790 229 788 230 793 231 794 232 Q 795 229 808 225 806 218 810 214 L 804 196 790 207 M 767 136 L 770 136 749 120 736 129 Q 730 130 727 135 L 730 135 743 137 767 136 M 792 32 L 791 31 792 30 792 32 M 513 110 L 483 108 475 114 486 113 498 111 507 111 513 110 M 448 491 L 477 493 491 488 Q 496 485 506 488 L 497 481 492 481 Q 451 490 429 475 L 427 474 409 481 408 481 426 490 448 491 M 673 482 L 671 479 663 487 658 491 677 484 673 482 M 274 96 Q 303 94 318 83 L 256 81 223 83 Q 245 95 274 96 M 46 95 Q 40 102 17 109 L 9 109 8 96 28 99 46 95 M 223 328 L 225 329 227 328 223 328 M 404 587 Q 436 585 442 573 L 438 576 390 572 Q 381 577 379 580 L 404 587 M 317 612 L 314 614 305 605 317 612 M 609 510 L 601 511 599 515 631 503 Q 614 505 609 510";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 898 382 Q 889 402 864 408 L 837 415 827 420 814 422 800 430 789 432 Q 772 436 752 446 L 681 467 578 487 544 501 470 507 442 502 427 500 Q 282 505 282 478 269 464 281 446 241 428 235 417 L 230 411 230 410 Q 220 404 216 399 198 386 202 375 L 183 358 181 354 171 354 163 351 Q 160 314 67 301 62 290 68 280 L 77 271 Q 88 256 118 249 L 129 247 155 231 Q 212 203 254 192 L 277 185 Q 277 179 306 172 L 357 167 363 167 Q 458 145 517 140 L 461 141 456 140 405 136 Q 372 135 367 144 L 339 145 220 162 185 171 174 171 Q 142 173 115 185 L 114 179 112 177 107 174 66 134 Q 32 103 70 78 99 58 141 56 L 153 56 190 46 309 27 338 25 Q 343 19 376 16 L 428 21 432 22 603 27 Q 656 36 690 53 759 78 766 109 772 134 732 160 L 723 164 726 165 745 169 Q 758 175 761 184 L 759 193 Q 756 190 754 190 763 205 750 228 L 748 232 745 236 748 235 753 233 770 235 Q 786 236 795 243 806 255 790 257 L 787 259 Q 784 258 784 260 785 261 789 262 L 801 272 Q 840 302 842 315 L 842 321 852 324 Q 874 330 882 337 906 356 898 382 M 222 356 L 224 358 226 356 222 356";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 641 -10 Q 640 8 619 21 L 578 34 559 34 565 44 Q 572 64 553 77 L 524 89 Q 484 94 461 62 439 33 480 25 513 22 543 6 L 568 -15 584 -9 641 -10 M 877 287 L 819 277 Q 761 264 814 252 L 863 248 876 282 878 285 877 287 M 887 357 L 848 370 829 373 841 382 Q 860 395 845 406 835 415 819 420 780 428 740 405 700 386 742 375 711 373 702 365 666 343 693 315 713 296 741 289 L 819 291 Q 863 301 881 316 911 341 887 357 M 952 391 L 951 392 950 391 952 391 M 679 72 Q 732 79 743 110 757 106 739 131 722 154 692 160 623 169 584 125 543 81 611 72 645 66 679 72 M 625 222 L 620 222 622 224 625 224 625 222 M 680 222 Q 684 243 655 256 L 618 269 Q 559 276 553 239 L 551 239 Q 547 245 535 251 L 510 258 Q 471 262 474 244 475 225 511 221 L 533 222 Q 547 223 549 229 549 220 556 214 L 540 219 Q 514 223 497 203 481 185 517 180 L 545 179 Q 564 182 568 191 L 568 204 Q 580 194 604 193 L 646 192 Q 669 198 680 222 M 714 200 Q 684 177 729 173 L 763 174 Q 783 179 788 190 794 210 761 220 744 221 714 200 M 488 107 Q 498 131 467 147 L 473 147 496 141 517 143 Q 533 145 536 152 540 162 511 173 L 480 181 Q 459 183 464 178 L 474 169 Q 471 169 465 165 L 456 159 Q 453 154 460 151 L 406 163 Q 372 167 348 152 349 169 328 184 L 289 206 261 208 Q 251 218 211 230 164 236 143 211 L 139 205 Q 108 208 90 187 68 163 101 160 L 139 163 Q 170 170 174 178 L 174 179 176 179 197 176 191 170 185 156 182 157 Q 141 163 130 145 L 128 143 109 149 Q 78 152 81 138 84 126 109 122 L 132 124 147 120 177 119 201 121 224 114 258 112 269 111 296 113 302 119 326 125 Q 325 120 330 116 338 92 349 80 360 69 376 66 359 56 343 21 L 359 9 375 5 Q 401 17 437 23 L 445 24 449 31 Q 454 48 434 60 L 427 63 439 66 Q 476 74 488 107 M 575 369 Q 596 386 594 406 593 432 561 438 L 499 443 Q 443 441 416 419 379 392 406 375 416 367 454 358 L 512 351 Q 553 350 575 369 M 560 300 Q 593 300 608 313 619 323 612 330 L 597 336 Q 546 348 519 329 494 310 527 302 L 560 300 M 444 337 Q 453 345 437 350 L 421 357 380 351 Q 358 346 395 336 L 418 331 Q 436 330 444 337 M 492 478 Q 499 472 514 470 L 547 465 560 464 588 463 597 466 629 469 Q 624 464 626 461 623 441 628 432 634 422 650 417 628 411 592 386 L 602 375 622 370 Q 676 358 710 383 726 394 709 406 L 703 410 719 410 Q 762 415 792 437 813 456 792 470 L 796 470 Q 804 466 812 465 793 472 797 484 L 798 485 795 485 784 480 Q 780 478 783 474 L 732 489 664 486 Q 675 499 659 515 L 643 527 Q 615 530 607 538 L 598 539 588 550 Q 578 553 568 559 L 557 561 Q 509 570 476 554 L 469 548 Q 436 554 407 541 372 525 405 519 L 447 517 491 525 490 526 495 525 515 521 505 517 492 506 489 508 Q 450 516 426 502 L 424 501 407 508 Q 378 516 373 504 370 492 395 488 L 420 487 Q 424 485 433 482 L 466 478 492 478 M 436 456 Q 429 468 403 475 336 489 284 456 230 425 297 410 L 364 407 Q 400 412 417 426 440 442 436 456 M 414 265 L 379 277 352 279 357 285 Q 365 302 334 312 L 299 320 Q 276 322 268 299 261 279 303 271 288 262 285 247 274 206 353 195 L 394 197 Q 423 205 433 226 441 250 414 265 M 332 47 Q 317 75 284 81 L 226 80 Q 179 69 166 40 L 160 14 226 18 Q 303 18 340 2 344 23 332 47 M 275 170 L 276 170 278 165 270 167 275 170 M 124 107 Q 54 116 27 71 -3 24 65 14 L 128 18 Q 156 29 165 48 175 73 164 89 149 103 124 107 M 84 64 L 91 66 92 62 83 50 75 50 Q 78 61 84 64 M 22 268 L 22 269 18 263 22 268 M 179 451 L 175 459 129 429 138 428 Q 180 424 179 451 M 115 287 Q 100 254 155 246 L 199 248 Q 228 254 234 269 243 289 217 302 L 187 313 Q 126 320 115 287 M 360 357 Q 387 358 402 370 L 393 382 373 394 Q 337 400 314 384 292 367 329 359 L 360 357 M 340 446 L 349 447 348 445 332 436 323 436 340 446 M 691 520 L 736 517 Q 760 519 779 527 L 687 525 668 525 691 520 M 594 508 L 596 508 596 503 589 505 594 508";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 11 68 Q -18 57 -23 43 L -21 42 -14 13 Q -8 -17 11 -18 L 20 -19 58 -10 83 -4 97 17 Q 107 43 84 61 L 60 72 Q 42 3 40 37 30 15 4 9 L 5 10 Q -2 9 -2 22 L 11 68 M 33 183 L 40 182 Q 55 179 60 186 L 57 196 46 201 29 196 33 183 M 23 225 L 24 229 Q 20 210 46 207 L 84 211 Q 113 217 122 233 128 249 116 259 L 100 266 Q 60 269 42 257 L 56 272 Q 26 256 23 227 L 23 225 M 78 279 Q 80 275 86 275 L 101 277 107 280 104 286 103 286 101 285 78 279 M 120 289 Q 115 277 130 276 L 144 277 Q 149 278 150 281 155 290 148 295 L 120 289 M 177 308 Q 173 288 196 287 L 239 295 Q 270 305 262 311 L 241 326 217 334 198 334 Q 193 318 179 310 L 177 308 M 198 337 L 200 342 200 345 198 337 M 158 423 L 160 427 155 423 158 423 M 366 507 L 370 506 Q 381 502 393 506 410 507 436 523 432 528 431 537 L 417 547 Q 392 552 375 537 L 372 535 Q 366 523 367 516 L 366 507 M 468 577 L 473 584 468 585 469 582 468 577 M 434 623 L 424 636 416 640 417 638 405 614 408 614 389 599 Q 376 595 370 589 L 360 582 354 578 346 565 347 561 350 546 Q 358 563 368 564 L 378 562 422 564 Q 436 575 435 600 L 433 601 433 602 425 614 Q 423 621 434 623 M 281 497 L 255 490 183 464 162 451 190 463 257 484 280 496 281 497 M 146 440 L 121 420 119 410 106 399 104 394 107 391 122 385 131 381 132 383 140 384 Q 153 384 161 370 L 163 366 167 362 Q 179 348 179 336 L 179 332 185 346 Q 187 361 195 367 L 189 379 187 382 186 385 Q 176 396 159 401 144 402 144 412 L 145 416 142 414 139 415 170 440 142 436 146 440 M 1 233 L -4 204 1 163 12 139 6 139 9 113 7 93 14 93 7 188 1 233 M 631 -7 Q 652 -5 656 9 663 24 652 38 642 51 625 53 562 62 556 29 546 -2 588 -8 L 631 -7 M 734 -4 Q 711 -2 709 -16 705 -30 729 -33 L 745 -31 755 -25 Q 756 -14 745 -8 L 734 -4 M -28 -12 L -30 -11 -30 -12 -18 -16 -28 -12 M 767 44 L 751 27 745 39 756 66 750 58 732 26 731 28 728 43 Q 730 59 748 86 L 775 127 776 129 776 135 775 158 Q 776 173 786 182 L 795 189 824 211 831 216 Q 846 252 853 286 856 299 871 311 L 883 323 899 329 902 330 Q 940 347 969 347 979 347 982 341 L 999 343 999 350 991 361 985 364 Q 984 362 986 361 L 899 345 891 345 880 335 858 313 853 301 830 255 Q 820 221 811 211 L 787 195 786 192 783 193 761 174 755 177 750 170 750 167 763 168 Q 765 160 770 155 L 774 142 Q 774 135 762 127 L 731 87 Q 697 52 695 72 L 695 76 686 62 680 29 Q 688 20 710 18 L 763 20 794 19 784 32 Q 770 32 767 44 M 911 381 L 910 382 Q 846 395 823 370 797 347 844 336 L 857 335 863 340 864 342 856 340 855 344 869 356 873 364 Q 879 377 911 381 M 812 265 Q 802 258 803 252 L 811 264 812 265 M 788 237 L 783 240 Q 773 241 758 234 L 742 244 Q 760 247 774 258 786 269 765 277 L 741 282 Q 680 296 653 275 L 648 272 642 272 611 281 Q 557 289 547 257 534 225 585 217 648 209 661 244 L 694 239 Q 677 231 667 215 643 181 727 169 L 737 188 Q 744 195 753 199 L 772 221 788 237 M 730 147 Q 716 145 711 135 704 124 719 119 L 744 133 750 143 743 146 740 137 730 147 M 824 308 L 815 309 814 307 799 315 Q 772 320 765 309 759 295 776 292 L 808 295 Q 818 303 814 307 L 821 302 826 305 824 308 M 856 440 Q 855 451 834 455 778 467 737 443 695 419 767 403 L 800 402 Q 828 400 838 408 862 427 856 440 M 653 96 L 637 101 Q 617 103 609 91 602 75 628 72 648 69 650 76 L 653 96 M 655 188 Q 641 198 623 200 553 209 539 169 525 127 589 120 L 632 124 Q 658 130 667 148 674 172 655 188 M 538 36 Q 543 51 511 55 479 60 472 45 464 32 496 28 L 518 27 Q 535 28 538 36 M 546 78 Q 556 102 545 119 536 130 516 135 458 142 437 107 414 73 486 63 L 517 65 Q 542 67 546 78 M 423 78 Q 410 85 390 88 314 99 312 59 309 19 356 12 L 401 15 Q 428 24 436 41 443 65 423 78 M 449 232 L 462 249 Q 467 263 449 265 L 425 260 Q 408 254 404 248 400 239 412 235 L 427 230 449 232 M 483 205 Q 524 200 529 213 532 225 527 231 L 510 235 Q 479 237 467 223 455 209 483 205 M 423 215 L 381 216 Q 353 211 341 180 327 150 341 132 348 120 367 119 397 113 431 129 463 143 472 165 481 189 457 204 L 423 215 M 516 191 Q 457 180 513 173 L 534 175 516 191 M 514 269 L 470 265 Q 455 257 495 252 L 513 250 Q 521 251 524 257 526 267 514 269 M 537 290 L 558 293 Q 568 302 558 310 L 543 317 Q 521 322 506 310 494 300 502 296 506 291 515 292 L 537 290 M 564 341 Q 593 364 567 377 L 530 387 Q 489 395 448 364 406 334 456 322 L 509 321 Q 544 326 564 341 M 426 276 Q 422 276 423 278 L 445 286 404 302 Q 381 303 379 289 376 273 411 269 L 428 273 426 276 M 498 421 L 533 430 537 433 547 440 Q 563 451 551 461 L 530 470 Q 466 484 434 459 399 433 445 421 470 416 498 421 M 479 491 Q 488 497 469 501 L 445 498 Q 434 491 453 488 L 479 491 M 429 406 L 423 407 403 405 Q 396 399 407 398 L 419 397 429 399 Q 433 403 429 406 M 602 378 L 650 376 Q 684 379 700 392 722 409 705 421 L 677 434 Q 600 449 577 419 553 387 602 378 M 507 410 Q 496 403 515 401 L 546 404 Q 551 407 544 409 L 537 412 507 410 M 582 474 L 572 475 560 470 Q 550 463 570 459 L 592 461 Q 605 470 582 474 M 596 485 Q 629 486 642 497 670 518 610 530 589 534 555 516 520 493 556 486 L 596 485 M 712 370 Q 654 383 611 350 567 316 636 300 L 695 299 Q 731 303 754 322 774 338 750 355 L 712 370 M 666 459 Q 697 451 742 460 777 467 797 478 L 797 484 807 499 Q 811 511 801 520 L 783 527 698 525 671 510 Q 643 485 646 472 647 461 666 459 M 808 377 Q 822 388 790 395 L 742 391 Q 727 382 758 375 L 784 372 808 377 M 292 36 Q 295 41 287 45 L 278 47 252 42 Q 247 32 267 30 288 26 292 36 M 282 106 Q 296 104 300 113 304 127 285 126 L 273 128 Q 267 127 266 120 262 109 282 106 M 274 80 Q 280 96 264 107 L 240 116 Q 174 125 162 90 145 54 192 47 L 239 51 Q 256 57 266 68 L 267 70 274 80 M 287 142 Q 317 147 322 161 335 190 276 199 254 201 235 174 218 145 253 141 L 287 142 M 271 214 L 315 216 Q 351 221 359 244 366 265 346 282 330 295 317 296 L 271 287 Q 238 276 227 266 208 254 234 234 256 216 271 214 M 227 196 Q 234 211 219 220 L 197 227 Q 137 234 142 204 146 171 176 166 189 164 210 180 L 227 196 M 165 15 L 189 16 189 18 186 24 180 25 Q 166 27 164 20 163 16 165 15 M 150 73 Q 155 86 124 90 L 100 88 Q 98 82 99 72 92 60 111 59 L 131 63 Q 147 66 150 73 M 108 115 Q 87 116 87 107 83 99 100 97 120 93 124 104 126 109 116 111 L 108 115 M 38 119 L 39 98 42 77 44 91 38 119 M 77 140 L 98 143 Q 111 148 124 170 L 115 186 97 195 Q 70 197 62 179 46 144 77 140 M 188 240 Q 202 241 209 253 212 264 197 272 L 180 275 Q 158 279 151 262 141 243 165 242 L 188 240 M 161 129 Q 180 126 182 133 187 142 168 147 153 149 147 141 140 132 161 129 M 183 376 L 184 376 189 366 Q 183 367 183 376 M 40 268 L 36 267 29 259 40 268 M 323 342 L 350 336 Q 368 336 378 345 388 351 376 358 L 363 364 Q 324 373 312 359 301 347 323 342 M 266 361 Q 262 368 246 371 L 225 370 Q 224 364 238 360 L 266 361 M 268 388 Q 307 389 330 409 355 427 339 445 L 311 457 264 456 Q 230 450 217 442 L 221 440 214 416 Q 206 394 224 391 L 268 388 M 389 389 Q 362 393 358 384 351 374 376 369 395 366 408 374 413 378 403 383 L 389 389 M 367 440 L 388 440 414 446 Q 426 455 394 461 L 368 462 358 451 Q 348 443 367 440 M 372 471 L 402 472 Q 406 475 399 480 L 390 483 Q 370 487 363 479 356 472 372 471 M 374 635 L 395 647 382 648 362 641 370 631 374 635 M 539 561 Q 482 572 470 547 456 521 489 515 501 511 531 522 L 556 533 Q 573 544 559 554 L 539 561 M 445 571 L 451 582 449 587 445 571";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 60 72 L 65 92 45 153 33 183 29 196 23 225 Q 24 202 31 170 L 38 119 44 91 42 77 44 65 40 37 Q 42 3 60 72 M 200 342 Q 201 331 210 347 220 365 219 379 L 203 404 Q 184 423 165 424 L 158 423 155 423 145 416 144 412 Q 144 402 159 401 176 396 186 385 L 187 382 189 379 195 367 196 365 200 349 200 345 200 342 M 339 486 Q 341 466 354 479 364 489 366 507 L 367 516 Q 366 523 372 535 L 374 538 377 544 377 548 380 555 372 559 373 561 378 562 368 564 Q 358 563 350 546 L 350 545 350 538 351 539 355 522 Q 356 498 339 486 M 428 553 Q 447 544 460 556 L 468 577 469 582 468 585 461 604 Q 448 623 435 623 L 434 623 Q 423 621 425 614 L 433 602 439 609 448 589 449 587 451 582 445 571 444 569 428 553 M 985 364 L 981 368 972 373 Q 966 381 945 382 L 912 381 911 381 Q 879 377 873 364 L 869 356 855 344 856 340 864 342 863 340 857 335 Q 835 311 812 265 L 811 264 803 252 788 237 772 221 753 199 Q 744 195 737 188 L 727 169 Q 726 164 728 161 L 730 147 740 137 743 146 750 167 750 170 755 177 761 174 783 193 786 192 787 195 811 211 Q 820 221 830 255 L 853 301 858 313 880 335 891 345 899 345 986 361 Q 984 362 985 364 M 719 119 L 714 116 707 108 697 105 676 96 Q 663 88 662 75 659 72 662 56 665 25 675 25 L 680 29 686 62 695 76 695 72 Q 697 52 731 87 L 762 127 770 145 768 152 762 155 751 146 750 143 744 133 719 119";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 56 272 L 57 273 78 279 101 285 103 286 104 286 105 286 110 287 120 289 148 295 177 308 179 310 Q 193 318 198 334 L 198 336 198 337 200 345 200 349 196 365 195 367 Q 187 361 185 346 L 179 332 179 336 Q 179 348 167 362 L 163 366 161 370 Q 153 384 140 384 L 132 383 131 381 123 381 Q 116 381 113 377 L 112 372 Q 112 363 124 358 L 145 346 142 335 69 304 61 300 42 301 40 298 Q 23 294 11 274 0 255 0 238 L 1 233 7 188 14 93 11 68 -2 22 Q -2 9 5 10 L 4 9 Q 30 15 40 37 L 44 65 42 77 39 98 38 119 31 170 Q 24 202 23 225 L 23 227 Q 26 256 56 272 M 160 427 L 161 427 205 445 273 464 287 466 Q 321 471 339 486 356 498 355 522 L 351 539 350 538 350 545 350 546 347 561 346 565 354 578 362 591 359 595 344 574 343 578 342 592 342 593 339 594 Q 323 594 320 572 L 320 550 319 542 281 497 280 496 257 484 190 463 162 451 148 441 147 441 146 440 142 436 170 440 139 415 142 414 145 416 155 423 160 427 M 380 555 L 385 553 425 552 428 553 444 569 445 571 449 587 448 589 439 609 433 602 433 601 435 600 Q 436 575 422 564 L 378 562 373 561 372 559 380 555 M 767 44 L 768 46 768 42 Q 778 50 789 73 L 807 113 824 150 839 190 840 192 849 199 855 205 857 208 860 215 870 227 896 264 949 314 992 321 Q 1013 324 1013 336 L 1012 339 1003 344 999 343 982 341 Q 979 347 969 347 940 347 902 330 L 899 329 883 323 871 311 Q 856 299 853 286 846 252 831 216 L 824 211 795 189 786 182 Q 776 173 775 158 L 776 135 776 129 775 127 748 86 Q 730 59 728 43 L 731 28 732 26 750 58 756 66 745 39 751 27 767 44 M 40 268 L 29 259 36 267 40 268 M 183 376 Q 183 367 189 366 L 184 376 183 376";
	ctx.fillStyle=tocolor(ctrans.apply([230,235,236,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1957(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1956",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj422=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/422.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj422,"assets/takeover/art/images/422.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj422.src="assets/takeover/art/images/422.png";
function image422(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 960 1860 960 1860 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.010752688172043,0,0,1.0208333333333333,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj422);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape3750(ctx,ctrans,frame,ratio,time){
	var pathData="M 872 117 L 876 113 855 106 872 117 M 878 20 Q 882 31 872 43 L 844 41 833 39 843 41 837 44 830 45 825 35 821 25 Q 821 17 824 20 L 878 20 M 931 113 L 935 115 921 106 921 107 931 113 M 1041 202 L 1034 221 Q 1020 240 989 240 971 240 958 213 947 191 947 178 L 950 164 Q 1041 168 1041 202 M 906 199 Q 930 217 909 231 L 882 243 864 246 870 250 Q 893 264 897 300 L 900 314 897 321 Q 891 347 841 384 L 841 385 Q 841 396 822 399 L 817 401 795 414 791 423 791 430 792 430 803 443 Q 809 456 800 466 L 784 473 780 473 702 470 694 470 Q 618 508 561 527 L 488 529 489 531 483 533 471 539 472 552 472 554 473 555 473 559 472 561 472 575 Q 467 597 443 597 378 597 343 569 324 555 319 539 L 278 546 Q 261 546 243 522 227 500 227 487 227 475 245 473 L 228 467 218 463 207 477 Q 191 493 165 493 147 493 115 476 83 459 83 451 83 419 132 430 L 142 432 137 428 Q 128 418 128 406 128 388 141 380 103 358 82 333 L 73 321 68 320 Q 62 314 63 304 L 59 295 45 298 20 301 -1 298 -2 289 Q -2 250 41 247 L 14 206 Q -4 188 -4 155 -4 132 5 115 -6 123 -35 123 L -52 115 Q -15 94 8 100 L 11 105 30 87 Q 43 77 62 69 L 58 62 82 47 103 57 Q 130 49 165 44 L 168 39 173 19 193 40 208 38 293 38 318 47 319 45 Q 324 31 319 15 L 365 22 417 28 435 25 452 22 484 31 499 36 531 25 576 25 599 36 Q 607 34 611 29 627 54 662 54 695 54 719 19 L 708 41 701 49 716 69 Q 722 83 711 98 756 129 779 161 L 790 175 802 171 808 171 Q 809 170 810 172 813 181 798 182 L 795 183 796 183 843 179 Q 882 180 906 199 M 956 117 Q 956 127 938 140 913 157 869 157 828 157 809 132 797 115 797 98 797 47 877 70 956 93 956 117 M 985 183 L 966 183 971 187 992 185 985 183 M 962 271 L 955 274 Q 934 278 922 267 911 258 930 253 L 948 253 962 258 Q 970 266 962 271 M 956 292 Q 932 299 926 319 911 301 944 293 L 956 292 M 836 369 L 859 347 843 355 826 358 836 369 M 762 22 Q 798 30 798 55 L 787 69 Q 775 79 761 79 750 79 738 65 726 52 726 43 726 15 762 22 M 869 334 L 871 330 870 330 869 334 M 752 92 L 764 93 772 99 Q 776 110 764 108 755 109 747 102 739 94 752 92 M 749 188 L 758 193 Q 771 204 755 208 L 752 208 750 209 755 210 756 211 767 204 Q 765 199 768 195 L 760 178 749 188 M 750 152 L 737 171 759 174 758 172 750 152 M 720 122 L 724 123 702 107 691 115 684 120 686 120 698 122 720 122 M 808 246 L 789 228 784 226 768 221 794 242 808 246 M 493 92 L 459 90 452 95 462 94 473 93 481 93 493 92 M 435 460 L 457 461 485 463 Q 490 460 498 458 L 512 458 503 451 499 451 498 451 Q 460 460 436 445 L 434 444 417 451 416 451 435 460 M 606 487 L 635 475 Q 620 477 615 482 L 607 483 606 487 M 670 451 L 664 459 660 463 677 456 674 454 670 451 M 265 73 L 306 63 248 59 217 60 Q 238 73 265 73 M 32 70 L 50 67 Q 45 74 22 79 7 80 2 72 L 1 62 32 70 M 177 442 L 176 442 187 445 184 442 177 442 M 10 331 L 14 325 Q 30 325 61 336 92 347 92 353 L 88 374 60 376 Q 30 376 18 355 L 10 331 M 14 221 L 7 233 -28 242 -50 235 Q -62 227 -62 216 -62 198 -24 201 14 204 14 221 M 227 294 L 229 295 231 294 227 294 M 453 551 L 405 546 Q 397 551 395 554 L 421 561 Q 453 561 457 548 L 453 551 M 316 566 Q 341 568 341 582 L 332 591 Q 322 599 312 599 253 582 253 568 L 255 561 257 559 316 566";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 871 356 Q 866 377 843 382 L 820 388 810 393 799 395 Q 796 400 787 402 L 776 404 744 418 679 438 582 458 551 473 479 478 451 473 437 471 Q 294 475 291 447 278 432 289 413 249 395 242 383 L 237 377 237 375 222 364 Q 205 351 208 340 L 188 323 186 319 177 319 152 309 154 312 153 314 Q 120 304 115 294 L 113 293 Q 60 272 74 244 L 82 235 Q 94 220 122 214 L 132 212 158 198 Q 211 173 250 163 L 272 157 Q 272 151 299 145 L 347 141 352 141 493 120 441 119 437 118 389 113 Q 359 113 354 120 L 328 120 217 134 184 141 173 141 Q 143 142 117 153 L 116 147 114 145 109 142 69 104 Q 37 75 72 52 100 35 139 34 L 150 34 184 26 294 12 320 11 Q 325 6 355 4 L 403 10 406 11 561 21 Q 610 30 642 46 706 70 716 97 725 120 691 143 L 684 147 686 148 704 152 720 165 719 174 714 171 Q 725 186 715 206 L 714 210 711 214 714 213 Q 716 211 719 211 L 734 213 758 221 Q 771 233 755 235 L 752 236 750 237 755 239 767 249 Q 808 279 811 291 L 811 297 821 300 Q 842 306 850 313 876 332 871 356 M 983 196 L 965 204 947 190 Q 944 188 944 180 944 170 966 172 987 175 987 188 L 983 196 M 890 157 Q 890 146 904 147 917 147 917 157 L 914 162 899 167 893 166 890 164 890 157 M 813 122 L 812 120 Q 804 111 804 95 804 73 840 78 875 82 875 104 L 875 108 875 112 871 120 Q 864 132 846 132 L 836 132 831 132 Q 820 132 813 122 M 899 46 Q 897 59 881 58 L 868 52 863 45 Q 863 34 881 31 899 29 899 46 M 921 109 L 929 99 Q 939 100 939 106 L 929 117 923 115 921 109 M 229 324 L 231 322 227 322 229 324";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 354 -5 L 411 12 419 13 423 20 Q 429 35 411 45 L 405 48 416 51 Q 451 60 464 89 475 113 447 126 L 453 125 473 120 493 123 Q 509 125 512 132 516 141 490 150 L 462 157 447 154 455 146 447 142 438 136 Q 436 132 441 129 L 392 138 Q 361 142 337 127 339 143 320 157 300 173 284 176 L 257 178 Q 249 188 211 198 166 203 145 178 L 141 172 Q 112 175 93 154 72 132 103 129 L 140 133 Q 170 141 173 147 L 173 148 175 148 196 146 189 140 183 127 180 128 Q 142 133 130 115 L 129 113 111 118 Q 82 121 84 108 87 97 110 93 L 132 96 146 92 175 92 197 95 219 89 251 88 261 88 286 90 292 95 315 102 Q 314 97 318 93 325 72 334 61 344 52 358 49 342 40 325 8 330 0 339 -3 L 354 -5 M 125 -1 Q 153 10 161 27 172 50 161 64 149 77 124 80 58 87 31 44 3 1 67 -6 L 125 -1 M 541 -12 L 592 -11 Q 592 5 574 15 L 539 25 522 25 529 35 Q 537 53 520 64 L 495 73 Q 460 77 435 48 414 22 450 15 L 447 15 Q 479 14 506 0 520 -6 526 -17 L 541 -12 M 950 211 Q 941 211 935 203 L 930 192 Q 930 175 951 175 971 176 971 196 969 211 950 211 M 884 157 Q 898 146 907 146 917 145 917 155 917 164 903 164 L 892 162 884 157 M 890 54 L 875 59 Q 866 59 866 51 866 41 881 37 896 34 896 47 L 890 54 M 840 88 Q 879 94 879 117 L 875 125 831 134 Q 817 134 807 123 800 115 800 108 800 82 840 88 M 924 117 L 914 115 912 109 914 104 Q 935 101 935 110 935 117 924 117 M 855 265 L 784 254 Q 730 241 777 230 823 220 846 238 L 868 258 855 265 M 826 380 L 804 393 Q 769 400 727 377 688 358 725 347 696 345 687 337 652 316 673 289 690 271 714 264 L 786 268 Q 828 278 846 293 878 317 857 332 845 340 824 344 L 807 347 818 355 Q 838 369 826 380 M 920 365 L 922 365 921 366 920 365 M 694 117 Q 682 138 655 142 593 149 553 108 512 67 572 60 L 634 62 Q 683 70 695 98 708 96 694 117 M 690 155 L 720 157 Q 740 162 745 172 753 191 724 200 709 201 679 180 650 158 690 155 M 631 231 Q 614 241 599 243 544 249 534 213 L 533 211 519 224 497 230 Q 461 234 461 216 461 199 494 196 L 514 197 Q 528 198 530 203 530 196 536 190 L 521 194 Q 497 198 480 178 464 161 497 157 L 522 157 Q 541 160 545 168 L 545 180 Q 556 172 578 171 604 167 616 171 638 177 650 200 657 219 631 231 M 406 235 Q 391 244 373 246 L 349 248 354 254 Q 362 271 333 280 L 300 287 Q 278 289 269 266 262 246 301 239 287 230 283 215 271 176 344 167 L 383 170 Q 411 178 421 199 431 221 406 235 M 595 199 L 597 201 600 201 600 199 595 199 M 547 272 Q 578 273 593 285 605 295 598 302 L 585 307 Q 538 318 511 299 486 281 516 273 L 547 272 M 594 345 L 612 341 Q 662 330 696 355 713 367 698 378 L 693 382 708 382 Q 750 387 780 409 805 430 784 444 L 788 442 803 437 Q 787 445 791 457 L 792 458 790 458 778 453 777 447 Q 762 454 730 461 L 665 458 Q 677 472 664 487 L 650 500 Q 623 503 615 511 L 607 512 598 523 580 533 570 535 Q 524 545 489 527 L 482 521 Q 450 528 420 513 384 496 416 489 L 457 488 Q 493 491 501 497 L 500 498 505 497 524 493 514 488 501 477 498 479 Q 460 488 436 473 L 434 472 Q 431 477 417 478 389 486 384 474 380 463 404 458 L 429 457 Q 433 455 440 452 L 472 448 498 448 Q 505 443 519 440 L 550 435 562 434 590 433 599 436 629 440 Q 624 435 626 432 621 412 624 402 L 644 388 Q 623 382 585 356 587 349 594 345 M 452 327 L 506 321 Q 545 321 567 339 589 356 589 377 592 402 561 408 L 501 412 Q 448 409 419 387 382 359 406 343 416 335 452 327 M 440 306 Q 450 314 435 319 L 420 325 380 319 Q 359 314 394 304 L 415 300 440 306 M 442 425 Q 436 438 411 445 346 458 292 424 238 392 302 377 L 368 374 Q 404 380 421 394 445 412 442 425 M 600 480 L 602 480 602 475 595 477 600 480 M 738 490 L 780 501 692 498 673 498 695 493 738 490 M 220 57 Q 176 47 162 20 156 6 156 -4 L 217 2 321 -9 Q 327 10 316 31 305 57 274 60 L 220 57 M 272 137 L 265 139 269 142 270 142 272 137 M 77 26 L 85 39 92 41 93 38 84 26 77 26 M 17 227 Q 29 225 29 231 29 239 13 242 4 241 4 233 4 229 17 227 M 200 215 Q 229 221 235 236 244 256 219 268 L 191 278 Q 132 284 120 251 105 219 158 212 L 200 215 M 184 428 L 146 436 115 427 103 415 Q 103 397 146 393 188 390 188 418 L 184 428 M 34 310 Q 31 309 31 302 31 292 50 293 68 294 68 306 L 67 309 55 312 34 310 M 331 326 L 361 325 Q 387 326 402 338 406 340 394 350 L 376 361 Q 342 368 318 351 296 334 331 326 M 254 489 L 242 486 235 480 Q 235 466 251 470 266 472 266 480 L 266 485 254 489 M 356 414 L 354 412 338 403 330 403 Q 341 412 347 413 L 356 414";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 183 -1 L 183 1 180 6 175 7 Q 162 9 160 2 L 160 -3 183 -1 M 97 -3 Q 108 21 85 37 73 46 55 48 L 16 41 Q -11 30 -16 17 L -14 16 -8 -10 Q -1 -36 16 -37 L 24 -38 59 -29 83 -22 97 -3 M 667 -29 L 681 -27 691 -21 Q 694 -11 684 -6 L 675 -4 Q 655 -2 652 -15 647 -27 667 -29 M 583 -9 Q 603 -6 607 6 615 20 606 31 L 583 44 Q 528 51 519 21 508 -6 545 -11 L 583 -9 M 906 227 Q 930 246 909 260 L 882 272 Q 836 282 790 253 740 224 793 211 L 797 210 784 208 Q 785 204 802 199 L 808 199 810 201 Q 812 207 806 209 L 843 208 Q 882 208 906 227 M 831 88 Q 854 85 854 103 858 117 830 117 L 809 113 807 106 Q 807 89 831 88 M 962 298 L 955 302 Q 934 307 922 296 911 286 930 282 L 948 282 962 287 Q 970 293 962 298 M 944 322 L 956 319 Q 932 328 926 348 911 330 944 322 M 837 284 L 857 289 Q 866 297 848 299 L 820 294 Q 803 287 817 284 L 837 284 M 882 356 Q 826 369 801 344 774 321 815 311 869 305 887 319 902 331 900 342 899 352 882 356 M 841 413 Q 841 424 822 428 771 440 729 415 687 391 752 375 L 783 374 Q 810 374 819 381 844 400 841 413 M 764 121 L 772 127 Q 776 138 764 136 755 138 747 130 739 122 752 120 L 764 121 M 656 15 Q 706 10 716 31 725 50 708 69 694 86 675 88 647 92 630 56 612 20 656 15 M 612 83 Q 611 87 599 88 581 89 573 77 565 63 588 61 L 608 65 612 83 M 706 113 Q 714 130 694 132 678 133 669 120 661 107 682 104 L 695 104 Q 704 105 706 113 M 688 151 L 720 151 Q 747 153 752 165 757 176 737 199 L 764 203 747 218 724 212 710 221 Q 727 225 741 235 753 246 735 253 L 713 258 Q 659 270 631 249 L 626 246 621 246 593 254 Q 544 261 531 230 516 200 562 193 620 187 636 220 L 665 216 Q 649 209 637 193 612 161 688 151 M 624 167 Q 612 176 595 178 533 185 516 147 499 109 557 103 L 597 108 Q 621 115 630 131 640 153 624 167 M 516 101 Q 510 112 492 115 439 120 417 88 394 57 459 49 L 487 52 Q 510 55 514 64 526 87 516 101 M 465 18 L 485 18 Q 501 20 504 26 510 41 481 42 452 46 445 33 437 21 465 18 M 492 150 L 511 153 Q 513 158 496 167 441 156 492 150 M 440 236 L 417 231 Q 400 225 396 219 392 211 402 206 L 416 202 437 204 Q 445 209 450 221 457 235 440 236 M 418 246 L 416 248 437 256 Q 441 261 400 271 378 272 375 258 372 243 404 239 417 238 420 243 L 418 246 M 498 223 Q 506 224 509 230 513 240 501 241 L 459 236 Q 445 229 482 224 L 498 223 M 411 188 Q 384 192 372 188 346 183 332 153 318 125 329 109 336 98 353 97 381 93 413 108 444 122 453 142 464 165 442 178 L 411 188 M 467 180 Q 505 176 510 188 515 200 510 205 L 494 208 Q 466 211 454 197 442 183 467 180 M 545 265 Q 555 274 546 282 L 533 288 Q 513 293 497 281 485 271 492 267 496 263 503 263 L 524 262 545 265 M 561 347 L 527 356 Q 489 365 446 333 404 303 451 292 473 287 501 292 535 297 555 312 585 335 561 347 M 421 365 L 431 367 Q 435 372 431 374 L 425 375 406 372 Q 399 367 409 366 L 421 365 M 448 390 Q 472 385 499 390 L 534 399 538 402 548 409 Q 565 422 553 431 L 535 440 Q 474 454 440 428 405 401 448 390 M 407 450 L 398 452 372 448 Q 365 441 380 439 L 409 441 Q 414 445 407 450 M 487 461 Q 496 468 478 472 L 454 469 Q 443 462 461 458 L 487 461 M 594 432 Q 607 442 585 445 L 575 446 Q 570 445 563 440 553 433 572 429 L 594 432 M 542 379 L 535 382 506 380 Q 496 373 513 370 L 544 373 Q 549 377 542 379 M 599 456 Q 632 458 645 468 675 491 618 503 599 508 563 487 528 465 561 457 L 599 456 M 540 494 L 566 505 Q 584 518 571 527 566 533 552 535 497 547 483 520 468 493 498 486 L 540 494 M 594 348 L 639 347 Q 672 351 688 363 711 381 697 393 L 671 405 Q 600 420 575 389 550 358 594 348 M 771 290 Q 747 295 739 284 732 271 747 268 L 777 271 784 283 789 278 794 281 793 284 785 285 784 283 771 290 M 740 348 L 764 345 788 350 Q 803 362 773 367 L 728 363 Q 713 354 740 348 M 730 328 Q 717 337 697 342 644 354 600 321 555 288 618 273 644 268 673 273 707 278 730 296 751 312 730 328 M 664 430 L 736 432 Q 770 440 791 451 L 791 457 803 472 Q 809 485 800 494 L 784 501 702 498 674 482 Q 645 458 646 444 647 433 664 430 M 372 70 Q 303 78 298 41 294 5 336 0 L 377 4 Q 403 13 411 28 420 50 402 61 L 372 70 M 266 29 L 242 24 Q 237 15 255 13 275 11 279 20 282 25 274 27 L 266 29 M 258 50 L 264 59 Q 271 75 256 84 L 234 91 Q 172 98 159 65 143 32 186 27 L 230 32 257 48 258 50 M 258 95 Q 254 86 273 83 286 82 290 90 295 103 276 102 L 265 103 258 95 M 280 116 Q 308 122 313 135 327 163 271 169 251 172 232 145 214 117 247 114 L 280 116 M 267 184 L 310 187 Q 344 193 353 214 362 235 343 251 329 263 316 264 L 271 254 Q 239 243 228 233 210 221 234 202 254 186 267 184 M 218 188 L 197 195 Q 141 201 144 171 147 140 175 136 188 135 208 150 L 225 165 Q 233 180 218 188 M 148 50 Q 153 62 124 64 L 101 62 99 47 Q 94 37 111 36 L 130 39 Q 145 43 148 50 M 117 84 L 109 87 Q 90 88 89 79 86 72 101 70 120 67 124 77 L 117 84 M 180 106 Q 185 115 167 118 153 120 147 112 141 104 160 101 178 99 180 106 M 22 107 Q 7 109 2 100 L -4 73 7 65 Q 37 62 50 87 55 99 22 107 M 100 112 Q 113 118 126 138 L 117 154 100 162 Q 75 164 66 146 51 113 80 110 L 100 112 M 88 177 Q 117 184 125 199 132 215 120 224 L 105 230 Q 49 235 35 205 20 176 51 172 L 88 177 M 51 166 Q 36 167 32 158 29 150 45 148 60 146 64 153 67 159 61 162 L 51 166 M 91 239 L 106 241 112 244 Q 115 251 97 253 83 255 82 247 83 240 91 239 M 148 242 L 154 246 Q 160 257 150 262 L 142 266 Q 129 267 125 255 120 243 134 241 L 148 242 M 182 241 Q 162 244 154 227 145 210 167 208 L 189 206 Q 204 209 209 220 214 231 199 238 L 182 241 M 157 283 L 159 285 Q 165 299 134 304 113 306 99 295 87 284 117 281 L 136 282 155 284 157 283 M 199 253 L 240 262 Q 271 272 264 278 L 244 292 221 300 Q 191 304 182 278 175 255 199 253 M 125 340 L 157 337 Q 184 339 194 347 209 357 193 366 L 176 372 Q 123 384 114 363 105 344 125 340 M 169 428 Q 159 441 134 441 109 441 101 405 101 384 137 393 173 402 173 414 L 169 428 M 46 293 Q 61 291 61 299 L 60 304 43 306 34 306 Q 31 305 31 301 31 294 46 293 M 350 304 Q 368 304 378 313 388 319 376 326 L 364 331 Q 327 340 315 326 304 314 325 309 L 350 304 M 391 356 Q 366 361 360 351 353 342 377 337 L 408 342 Q 413 346 404 351 L 391 356 M 273 354 Q 311 356 335 376 361 395 346 412 L 319 425 273 423 Q 239 417 226 408 L 229 406 221 382 Q 213 360 230 356 L 273 354 M 269 327 Q 267 334 250 337 L 230 335 Q 229 330 242 326 L 269 327 M 224 481 Q 224 471 240 473 256 475 256 485 L 251 493 236 500 227 490 224 481 M 270 454 Q 271 447 278 445 308 439 336 460 348 470 316 480 L 293 477 270 454 M 373 408 L 394 408 420 414 Q 432 424 401 430 382 435 376 430 L 365 419 Q 356 412 373 408 M 403 476 Q 420 478 447 495 444 500 444 509 441 515 430 519 406 524 387 508 352 482 381 476 392 473 403 476 M 384 534 L 426 533 Q 462 535 479 547 L 489 559 483 561 Q 463 569 453 579 411 583 386 564 353 540 384 534 M 363 513 L 388 515 Q 394 520 390 524 L 381 528 358 524 Q 347 517 363 513 M 557 546 L 547 546 552 545 557 546 M -12 -36 L -21 -32 -23 -31 -23 -32 -12 -36";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 692 66 L 701 77 709 62 692 66 M 627 53 L 628 56 Q 658 73 667 73 L 679 69 Q 686 69 686 78 686 87 677 89 L 659 90 Q 593 59 593 45 593 40 603 37 L 613 29 606 19 593 10 578 12 Q 573 12 573 5 573 -18 604 1 636 19 636 40 L 627 53 M 782 28 Q 790 36 790 52 790 83 774 83 765 83 765 73 L 772 51 760 40 759 41 755 52 Q 752 59 739 59 727 59 727 48 727 34 745 26 L 742 25 741 21 742 17 Q 771 18 782 28 M 954 260 L 955 272 958 272 955 260 954 260 M 829 178 Q 866 178 895 190 924 202 924 219 925 242 914 249 L 907 258 916 269 925 266 933 267 934 264 930 258 940 251 954 247 Q 971 247 971 271 975 286 957 286 L 933 280 917 273 918 285 Q 918 306 906 305 910 310 906 320 903 332 889 332 879 332 879 299 879 265 894 259 L 892 258 891 253 Q 891 245 897 242 L 901 226 Q 901 219 889 213 875 206 857 206 L 835 211 818 207 816 196 795 201 779 190 772 175 772 173 729 132 Q 686 89 686 71 L 688 67 690 65 683 57 Q 683 44 706 44 730 44 730 65 L 713 91 731 101 734 108 732 114 Q 760 125 781 149 800 170 801 184 L 807 182 829 178 M 835 80 L 831 71 Q 826 72 823 79 L 820 87 822 93 835 80 M 888 41 L 861 37 868 32 873 31 850 27 845 29 848 36 843 42 831 33 Q 828 31 828 26 828 17 835 13 L 858 9 858 11 Q 907 13 907 23 L 888 41 M 952 99 L 946 120 Q 936 141 916 141 903 141 903 131 903 125 916 118 L 929 105 Q 929 98 911 92 L 902 99 Q 888 88 873 88 847 88 829 102 L 812 115 Q 803 115 803 107 803 -2 952 99 M 1025 176 Q 1040 193 1040 201 1038 216 1021 216 1011 216 997 205 L 999 204 1018 203 999 179 974 179 955 180 948 174 956 163 Q 966 155 984 155 1006 155 1025 176";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape423(ctx,ctrans,frame,ratio,time){
	var pathData="M 880 500 L -980 500 -980 -460 880 -460 880 500";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-980,-460);
	ctx.transform(1.010752688172043,0,0,1.0208333333333333,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj422);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite3751(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3747",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3748",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3749",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3750",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj424=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/424.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj424,"assets/takeover/art/images/424.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj424.src="assets/takeover/art/images/424.png";
function image424(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1000 1960 1000 1960 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.010204081632653,0,0,1.02,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj424);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape1960(ctx,ctrans,frame,ratio,time){
	var pathData="M 1035 208 L 1039 218 Q 1039 227 1016 235 L 978 240 997 233 997 203 994 195 1005 204 1035 208";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 840 35 Q 890 66 910 92 L 943 120 977 145 995 164 Q 978 181 968 181 L 951 180 Q 951 178 962 176 L 967 171 Q 957 171 944 163 932 155 917 155 L 888 154 888 172 891 177 883 184 880 182 882 178 882 156 Q 874 162 865 162 L 845 160 Q 825 160 825 170 L 830 182 Q 830 189 852 195 876 200 876 213 L 875 224 854 234 828 235 808 243 Q 795 248 792 251 L 781 252 765 244 757 244 742 254 714 259 693 255 674 256 671 258 660 258 647 254 648 261 651 264 656 274 642 283 637 295 Q 625 324 618 324 610 324 601 313 L 582 318 540 299 Q 539 311 528 321 L 513 337 534 353 535 365 534 379 Q 531 384 517 389 L 477 393 442 396 416 391 407 398 388 405 Q 369 405 351 389 331 373 322 373 314 373 305 386 L 324 411 336 433 331 442 315 447 319 451 328 448 349 443 369 448 Q 379 453 379 461 379 476 350 480 L 271 493 Q 271 516 223 517 L 189 502 184 508 154 513 95 504 95 503 Q 61 472 11 459 L -15 441 -30 430 -29 429 -4 412 13 391 Q 29 373 40 373 L 61 378 65 376 Q 53 356 72 335 91 315 125 308 L 178 283 Q 222 260 237 259 243 259 273 270 L 306 280 Q 314 280 323 257 L 334 226 Q 340 206 347 197 358 183 406 175 L 485 174 Q 524 174 524 164 L 518 153 Q 518 141 531 135 L 566 118 591 102 591 95 600 95 594 83 Q 594 78 606 71 617 66 623 64 L 666 64 684 66 687 67 702 69 735 63 765 58 770 56 770 55 773 55 780 52 785 45 Q 787 39 791 38 L 830 28 840 35 M 284 569 L 289 568 294 559 279 562 284 569 M 309 533 L 353 532 356 547 351 566 Q 342 586 323 586 L 279 582 Q 266 577 266 561 L 309 533 M 677 360 L 673 364 679 363 679 361 677 360 M 668 355 L 669 353 690 352 693 355 687 371 688 371 Q 695 370 697 374 L 692 375 684 377 680 377 Q 673 378 672 373 L 670 370 662 370 669 364 670 358 668 355 M 664 287 L 665 284 684 282 Q 700 282 700 292 L 699 297 688 302 684 299 681 298 678 310 676 310 677 309 Q 676 307 678 303 L 680 297 679 297 Q 664 298 664 287 M 496 478 Q 458 478 458 454 458 436 510 426 563 415 563 439 563 447 548 460 528 478 496 478 M 478 449 Q 469 446 469 454 L 470 459 479 462 478 449 M 573 366 Q 573 353 598 344 622 336 622 361 L 621 374 Q 617 388 600 388 594 388 583 379 L 573 366 M 813 339 L 815 343 847 349 854 362 846 369 848 379 Q 847 385 833 385 L 800 379 Q 787 373 787 365 L 789 359 794 353 Q 787 351 787 347 L 789 341 799 341 813 339 M 819 356 L 820 357 830 357 824 356 819 356 M 824 272 L 832 283 817 295 792 301 781 300 777 304 769 299 762 292 762 285 759 281 757 278 758 275 769 271 775 269 788 271 796 265 Q 816 266 824 272";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 302 422 Q 300 409 285 409 L 278 407 282 402 Q 298 401 325 432 L 315 434 Q 304 434 302 422 M 70 484 L 92 493 Q 114 504 114 512 L 112 516 108 516 95 503 70 484";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 67 341 L 71 344 70 340 67 341 M 601 191 L 601 190 600 190 599 191 601 191 M 505 169 L 504 166 503 169 505 169 M 561 119 L 561 120 572 114 581 98 566 113 561 119 M 591 91 L 591 89 591 86 590 89 591 89 590 90 591 94 591 91 593 92 592 91 591 91 M 649 194 L 649 193 645 191 649 194 M 610 143 L 612 143 612 142 610 143 M 627 61 L 638 61 684 69 687 69 662 63 625 58 624 63 627 61 M 849 41 L 816 36 801 39 784 48 784 49 785 48 785 49 799 61 798 63 805 65 Q 834 75 834 82 L 826 87 810 92 812 93 Q 814 106 830 113 L 858 131 857 131 822 116 800 93 805 87 822 81 821 80 781 68 781 71 770 71 765 68 760 68 755 69 750 68 735 68 700 77 692 74 684 73 658 68 633 66 625 70 610 73 605 77 606 81 606 82 607 80 623 114 627 114 629 119 628 120 632 121 638 119 649 121 661 118 Q 668 118 669 125 L 668 134 684 136 689 138 684 141 678 142 681 140 666 141 Q 661 139 661 133 L 660 125 643 129 633 127 630 133 622 140 620 138 617 139 618 139 618 148 605 150 594 156 591 158 591 146 Q 594 143 600 143 L 604 139 610 135 610 134 607 132 607 126 607 124 607 121 608 115 607 114 591 108 591 107 583 118 545 133 Q 523 140 523 149 L 529 164 529 166 544 169 575 166 577 176 Q 579 182 590 182 L 602 178 610 184 605 187 606 187 629 194 640 194 638 189 Q 638 184 644 184 L 651 188 654 192 656 188 672 194 689 196 697 190 692 180 Q 692 175 701 170 711 163 726 162 L 753 159 758 162 761 166 754 169 732 167 730 169 Q 713 169 700 182 L 705 193 704 199 686 205 661 201 654 196 652 199 670 205 669 210 665 211 654 206 645 200 620 197 609 193 607 196 599 198 591 198 591 194 588 194 Q 575 194 571 188 L 567 177 526 179 533 185 527 187 Q 519 188 516 180 L 467 179 Q 432 179 413 189 392 199 368 199 L 342 201 341 211 339 239 341 257 340 268 Q 369 264 375 291 L 383 315 388 315 389 322 392 323 Q 418 323 429 306 442 289 479 288 L 487 289 487 295 482 299 Q 552 308 566 316 L 564 322 555 323 533 316 480 310 470 300 Q 448 302 430 318 413 334 391 334 L 390 334 394 358 Q 399 390 409 390 421 381 432 381 L 449 385 452 383 Q 452 380 455 379 L 458 380 457 380 458 382 458 394 450 397 440 395 428 391 Q 425 391 419 396 L 409 401 Q 391 401 379 368 370 342 370 321 L 370 319 366 306 Q 359 278 341 279 L 331 281 331 282 330 281 328 283 316 286 311 286 297 290 Q 273 290 244 261 L 197 283 158 311 103 329 79 337 81 343 84 344 83 344 85 352 95 370 99 373 118 373 143 367 158 366 160 362 Q 163 357 171 357 L 177 358 Q 203 363 216 378 L 235 400 263 401 281 396 284 397 284 401 Q 280 402 274 406 L 235 409 236 419 231 441 Q 231 447 241 449 L 269 460 265 462 230 452 Q 220 449 220 442 L 229 412 227 406 213 389 206 383 197 378 187 373 168 373 Q 165 384 148 388 L 114 398 96 398 88 392 50 401 43 400 43 396 48 391 43 391 40 389 8 413 -20 435 Q -27 429 -40 429 L -33 425 -28 423 4 393 Q 24 376 41 369 46 363 52 363 L 56 364 56 356 50 346 Q 50 334 61 327 L 130 310 Q 160 302 170 294 186 280 219 263 L 248 247 261 263 Q 272 275 287 278 L 298 279 297 277 287 278 287 256 Q 299 237 310 229 L 315 222 333 193 335 192 337 187 339 190 364 186 397 183 410 175 452 169 495 169 495 144 Q 497 134 519 125 L 528 122 553 105 Q 571 93 583 91 L 583 88 585 82 578 77 Q 589 52 627 49 663 45 691 65 L 732 55 764 50 765 48 765 45 766 43 770 37 773 34 774 35 776 34 793 33 802 31 808 25 816 25 824 23 840 35 849 41";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 809 106 L 803 96 810 103 809 106";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 723 69 L 718 77 Q 715 81 709 81 L 684 76 680 74 640 67 618 80 637 116 637 121 626 121 610 99 599 78 600 74 600 68 603 68 612 67 623 64 644 63 681 69 684 70 708 76 715 71 721 63 766 61 775 62 778 65 777 66 723 69 M 819 32 L 828 36 840 35 855 45 849 43 817 43 Q 807 48 802 53 L 812 61 810 65 816 66 813 62 Q 824 61 834 71 L 842 84 830 97 847 117 843 119 828 107 820 97 832 82 824 76 823 82 822 82 Q 819 69 802 64 L 785 60 786 56 789 56 784 54 794 44 806 38 Q 816 30 819 32 M 70 477 Q 87 487 90 494 L 86 495 85 495 48 473 55 469 70 477 M 59 400 L 56 398 52 396 43 393 -2 431 -10 442 -15 440 -23 433 -11 424 -6 413 0 402 Q 47 374 51 377 61 389 71 389 L 133 382 137 383 137 387 59 400 M 92 336 L 90 338 93 339 92 336 M 181 361 L 189 358 Q 203 360 217 375 L 226 384 Q 223 379 226 375 L 237 385 Q 249 397 259 394 275 389 289 394 L 283 397 243 399 237 395 229 399 Q 209 371 181 361 M 114 361 L 123 363 130 368 138 368 168 353 177 355 177 359 158 377 136 380 123 376 120 379 117 381 109 376 105 373 99 383 95 381 79 338 Q 79 323 116 317 157 309 164 300 174 288 206 269 L 237 251 241 251 260 267 277 281 273 281 252 271 237 266 Q 226 267 200 287 L 173 310 124 324 100 333 106 348 114 361 M 429 181 L 418 186 387 189 Q 367 197 360 204 352 212 352 226 352 276 337 277 332 277 332 274 L 332 197 337 192 347 198 Q 400 171 429 181 M 640 181 L 640 184 617 187 Q 611 187 604 183 L 597 177 578 173 580 167 583 167 600 168 Q 615 185 640 181 M 649 185 L 653 185 655 189 658 201 648 192 649 185 M 611 124 L 610 126 605 126 602 121 601 120 600 113 596 115 593 114 582 126 554 137 550 137 539 140 551 164 550 170 543 173 530 163 520 150 541 132 539 130 540 127 Q 579 121 587 98 L 594 106 595 106 598 100 605 112 611 124 M 679 136 L 679 142 664 145 652 141 646 134 647 128 637 129 Q 640 138 630 139 L 628 137 633 125 640 124 656 124 659 127 656 128 654 128 655 132 Q 654 138 670 138 L 679 136";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape425(ctx,ctrans,frame,ratio,time){
	var pathData="M 930 540 L -1030 540 -1030 -460 930 -460 930 540";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1030,-460);
	ctx.transform(1.010204081632653,0,0,1.02,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj424);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite1961(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1960",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite426(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape419",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape421",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape423",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape425",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape1962(ctx,ctrans,frame,ratio,time){
	var pathData="M 709 40 Q 729 41 737 47 L 745 58 730 70 705 76 693 74 689 78 681 73 674 66 674 59 671 55 669 52 670 49 681 45 687 43 701 46 709 40";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 577 -163 L 598 -159 613 -157 630 -159 740 -60 738 -55 743 -43 Q 743 -36 766 -30 790 -25 790 -12 L 789 -1 768 9 741 10 721 18 705 26 694 26 677 18 669 18 654 28 637 33 638 37 Q 638 45 586 54 535 63 535 85 535 92 576 100 618 108 618 114 618 127 602 127 L 604 129 603 133 634 150 Q 638 152 638 169 638 183 632 186 L 517 205 Q 475 216 475 233 475 256 494 257 513 259 513 283 L 513 293 507 306 493 307 491 311 496 321 529 326 557 366 573 400 573 402 514 407 Q 488 414 465 428 L 325 404 Q 273 401 242 376 216 356 216 335 L 228 290 242 247 Q 245 238 275 205 303 175 303 162 L 296 139 Q 309 64 347 64 L 369 69 402 56 Q 433 43 443 41 459 38 481 24 L 503 3 Q 503 -11 475 -31 448 -51 448 -58 448 -66 485 -89 L 519 -106 519 -157 533 -163 577 -163 M 710 285 L 673 307 651 292 633 276 Q 633 272 639 267 L 652 254 685 261 Q 702 268 710 285 M 562 232 Q 562 219 599 216 637 212 637 230 L 628 248 Q 617 264 606 264 585 264 572 251 562 241 562 232 M 600 231 L 580 233 618 236 600 231 M 704 157 Q 677 145 677 129 677 111 707 115 L 747 122 748 128 743 137 Q 752 134 752 140 L 751 143 714 161 687 177 687 176 698 166 704 157 M 611 66 L 610 71 599 76 Q 595 72 592 72 L 589 84 587 84 588 83 589 77 591 71 590 71 Q 575 71 575 60 L 576 57 595 56 Q 611 56 611 66 M 624 34 L 624 33 604 29 585 29 582 31 570 31 548 24 548 26 561 37 565 44 624 34";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 544 -166 L 548 -166 599 -157 598 -160 623 -167 634 -155 611 -149 Q 606 -149 603 -152 578 -154 568 -159 L 545 -161 548 -154 540 -139 532 -128 534 -120 582 -119 Q 612 -110 612 -97 612 -79 638 -79 L 665 -83 688 -79 624 -71 Q 612 -79 602 -96 597 -106 578 -107 L 580 -102 579 -93 600 -88 Q 596 -84 589 -84 L 592 -86 577 -86 572 -94 571 -102 566 -100 559 -94 556 -98 553 -98 544 -100 543 -99 540 -94 Q 536 -87 532 -87 L 530 -89 527 -88 528 -88 528 -79 519 -77 519 -84 503 -78 503 -84 510 -89 498 -85 Q 463 -73 457 -58 L 459 -58 465 -50 469 -48 472 -53 475 -46 483 -43 483 -44 486 -48 489 -48 494 -49 497 -48 497 -43 503 -37 517 -18 Q 519 -16 544 -4 563 5 563 16 L 560 20 565 22 581 28 582 27 Q 588 22 592 22 L 634 29 Q 667 37 667 46 L 665 51 599 37 590 39 588 40 574 44 Q 543 44 542 19 L 540 18 513 29 491 35 500 27 500 19 Q 495 33 480 40 L 397 74 391 80 370 84 360 91 350 86 342 80 331 83 Q 320 87 320 92 320 108 309 140 L 337 150 Q 346 144 353 145 L 354 142 365 142 377 150 395 147 409 153 421 147 Q 431 141 438 141 L 438 152 425 171 430 178 430 179 436 183 448 196 450 196 453 196 452 195 452 179 Q 453 167 464 167 L 494 176 513 172 535 169 573 173 595 170 605 167 Q 594 171 593 175 L 554 177 488 184 463 178 465 194 Q 465 205 454 207 L 435 207 432 203 Q 427 203 428 205 L 402 186 387 175 339 172 328 177 305 193 298 211 297 211 294 202 285 221 272 241 258 241 227 305 228 307 223 316 232 359 251 382 272 398 303 406 360 405 363 399 337 367 312 336 314 330 324 330 341 331 336 329 334 325 339 320 334 319 327 319 330 313 342 310 Q 352 310 352 319 L 357 327 362 336 360 342 348 342 349 344 372 355 385 368 383 383 405 387 408 393 395 414 424 415 446 412 476 417 483 419 Q 441 438 407 475 356 532 345 610 325 746 241 880 L 241 879 227 823 226 783 226 766 201 566 Q 178 360 178 321 181 293 195 289 L 195 292 197 288 199 292 201 287 203 285 203 283 Q 204 276 213 267 L 217 259 Q 223 239 230 235 L 240 218 259 205 262 201 265 202 275 198 277 196 278 197 283 195 290 186 289 163 293 143 299 124 308 103 315 82 Q 324 66 343 66 L 354 71 360 75 449 39 450 39 440 -43 Q 440 -53 443 -56 445 -74 464 -84 L 514 -110 509 -119 Q 509 -175 543 -168 L 544 -166 M 559 -33 L 559 -34 555 -36 559 -33 M 555 -27 L 530 -30 519 -34 519 -39 539 -33 550 -33 548 -38 554 -43 561 -39 565 -33 562 -28 581 -22 580 -17 576 -16 564 -21 555 -27 M 520 -84 L 522 -84 522 -85 520 -84 M 264 229 L 267 229 267 227 265 228 264 229 M 243 762 L 244 756 242 753 243 762 M 217 538 L 225 587 224 577 216 531 217 538";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 519 -101 L 519 -108 521 -103 520 -101 519 -101";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 554 -164 L 592 -157 619 -150 626 -155 629 -160 634 -156 629 -149 620 -145 591 -152 550 -160 528 -147 547 -111 547 -106 536 -106 520 -128 519 -129 519 -159 522 -160 533 -163 554 -164 M 566 -103 L 569 -100 566 -99 547 -98 Q 550 -89 540 -88 L 538 -90 543 -102 550 -103 566 -103 M 466 -63 L 502 -39 538 -19 553 -7 562 7 Q 566 17 586 21 L 615 26 587 28 Q 555 28 551 14 545 -5 517 -13 505 -16 483 -35 461 -53 454 -66 L 483 -81 469 -84 Q 516 -102 532 -101 L 533 -101 Q 516 -96 466 -63 M 302 203 Q 281 236 267 245 254 254 247 284 L 242 330 Q 276 419 337 401 L 341 406 340 411 338 411 290 406 Q 261 403 249 377 L 238 354 Q 232 341 232 330 232 307 238 282 245 249 259 238 291 213 295 197 L 311 171 Q 323 158 342 162 L 340 167 Q 319 174 302 203 M 462 202 L 427 186 Q 427 159 436 139 L 441 139 437 169 Q 437 176 452 186 L 468 197 467 201 462 202 M 517 16 L 518 16 Q 497 26 467 45 L 395 69 389 75 347 81 349 85 348 91 342 84 332 84 320 123 Q 333 138 339 138 L 361 131 Q 382 131 382 140 L 380 144 338 149 317 136 308 137 308 114 315 91 Q 319 79 338 77 L 338 76 347 73 Q 409 64 448 47 488 27 517 16 M 350 325 L 352 321 358 317 344 304 Q 356 300 364 311 L 372 326 363 332 392 358 Q 402 364 402 380 402 398 393 405 L 390 401 Q 398 385 388 362 362 365 350 325";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 253 209 L 255 210 211 281 Q 199 303 199 340 199 375 216 511 216 547 231 660 L 232 634 236 600 240 568 234 513 228 462 237 422 246 389 251 389 251 404 245 447 252 523 259 618 254 697 249 775 248 788 258 852 240 881 235 890 208 628 180 334 183 324 179 310 Q 179 302 184 302 L 200 284 214 257 253 209 M 247 557 L 248 557 248 546 247 557";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1963(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1962",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape1964(ctx,ctrans,frame,ratio,time){
	var pathData="M -292 296 L -303 298 -309 297 -310 290 -308 285 -295 284 -285 285 -285 291 -292 296";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -289 249 Q -289 258 -292 261 L -316 267 -332 262 -343 252 Q -343 237 -316 233 -289 228 -289 249 M -215 180 L -220 185 -275 183 -288 166 Q -288 146 -251 143 -215 141 -215 180 M -343 95 L -353 94 -355 88 -345 75 Q -335 66 -333 67 L -334 59 Q -317 64 -312 69 -309 73 -309 80 -309 88 -315 91 L -343 95 M -334 13 L -343 10 -351 8 -349 12 -334 13 M -177 221 L -161 234 -155 243 -157 248 -185 248 -226 236 -234 232 -228 227 -213 227 -194 223 -177 221 M -546 -14 L -486 -18 -427 -10 -323 -4 -275 7 -268 0 -235 0 -229 7 -230 11 -250 15 -248 17 Q -237 23 -237 28 L -239 34 -250 34 -268 28 -271 33 -285 47 -300 47 -320 34 Q -329 34 -347 46 L -374 68 -370 77 Q -370 81 -397 99 L -367 104 -311 113 Q -275 122 -275 134 L -295 150 Q -316 162 -316 169 L -308 195 -310 205 Q -316 213 -341 213 L -369 209 -394 205 -395 206 -391 207 Q -378 210 -378 213 L -380 218 -403 220 -408 227 -402 230 -402 233 -410 241 -411 257 -450 274 -463 274 -465 275 -466 276 Q -457 277 -457 285 L -464 299 Q -464 309 -453 316 L -429 329 Q -414 322 -396 322 L -369 327 -340 323 -333 324 Q -320 314 -312 317 L -273 325 Q -258 324 -258 339 L -257 344 -265 354 -268 354 -275 360 -278 360 -278 362 -354 371 -358 374 -376 374 -389 379 -420 375 -426 374 -477 377 -507 382 -525 377 -557 376 Q -564 377 -571 369 L -578 359 -595 334 -604 311 -602 302 -594 292 -606 266 -612 236 Q -612 222 -585 178 L -559 127 Q -559 115 -604 49 L -612 57 -614 55 -615 47 Q -608 9 -596 2 -583 -6 -546 -14 M -335 357 L -340 359 -339 359 -335 357 M -340 334 L -354 334 -344 337 -342 337 -337 336 -338 334 -340 334 M -404 356 L -401 357 -396 357 -393 357 -403 355 -404 356 M -348 291 L -350 301 Q -355 310 -370 310 L -380 312 -404 313 -437 307 -443 291 Q -443 285 -435 277 -427 269 -423 268 -348 261 -348 291";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -523 289 L -524 285 -524 284 -540 288 -523 289 M -580 -14 Q -565 -28 -548 -28 L -517 -25 -507 -26 -467 -20 -466 -20 Q -445 -21 -436 -12 L -445 -10 -475 -6 -491 -13 -506 -11 -520 -13 -563 -1 Q -589 9 -601 18 L -609 32 -608 41 -589 65 -589 67 -567 100 -565 104 -562 105 -562 104 -560 104 -558 105 -555 105 -554 107 -535 121 -529 119 -507 124 -500 122 Q -485 129 -471 132 L -454 132 -445 125 Q -438 127 -435 138 L -434 139 -434 138 -426 147 -361 143 Q -349 143 -347 150 L -349 150 -421 157 -418 162 Q -407 183 -397 183 L -380 179 -368 180 Q -357 184 -357 200 L -359 200 Q -370 187 -378 187 L -405 192 -422 170 -429 158 Q -438 158 -447 140 L -473 142 -467 149 -474 154 -485 149 Q -493 144 -503 144 L -508 144 -509 144 -505 149 -506 150 -529 142 -542 138 -544 137 -561 153 -579 169 -580 173 Q -581 186 -595 199 L -602 216 -605 236 -599 259 -599 261 -593 266 Q -586 258 -578 262 -556 274 -544 274 L -532 270 -522 269 Q -518 251 -503 251 L -494 258 -486 265 -458 250 -422 249 -447 250 -467 266 Q -479 274 -488 274 L -498 267 -506 259 -510 268 -508 268 -502 270 -502 275 -514 282 -516 291 -504 298 -494 309 -472 302 -459 294 -459 296 -475 307 -503 317 -508 305 Q -512 298 -525 298 L -554 302 -568 314 -582 314 -584 318 -551 372 -521 376 -513 375 -492 375 -482 374 -480 370 -449 370 -448 374 -448 375 -447 375 -448 376 -450 387 -455 382 -455 381 -458 383 -464 383 -471 385 -489 407 -502 444 -498 461 -503 493 -498 525 -503 561 -498 599 -509 623 -520 659 -522 690 Q -523 708 -530 720 L -546 735 Q -557 750 -566 750 L -573 749 Q -576 748 -580 753 L -584 751 -585 734 Q -600 723 -610 699 -622 671 -619 643 L -622 595 -627 541 -622 499 -629 382 -637 250 -630 219 -629 224 -625 219 -624 216 -620 197 -622 195 -622 98 -623 77 -625 70 -624 67 -624 57 Q -633 26 -620 20 L -617 10 -606 0 Q -594 0 -580 -14";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -617 41 L -618 25 Q -618 11 -569 -10 -520 -31 -520 -10 -520 -5 -522 -6 -572 3 -601 23 -589 34 -578 67 L -561 93 -547 114 -550 122 -534 126 Q -522 126 -516 132 L -499 144 -500 146 -541 133 Q -565 123 -571 111 L -570 109 -563 107 -581 96 -593 86 -608 68 -610 65 -612 40 -617 41 M -604 192 L -591 188 Q -579 158 -568 147 -543 125 -506 151 L -515 153 -522 147 -534 144 Q -549 144 -558 155 L -570 171 -578 186 -586 199 Q -606 208 -609 226 L -610 256 -612 256 -613 243 -613 240 -614 216 -604 192 M -606 27 L -607 30 -598 50 -584 67 -593 43 Q -599 30 -606 27 M -604 49 L -605 49 -600 57 -604 49 M -590 318 L -571 306 Q -557 295 -539 291 L -525 289 -518 268 Q -512 252 -507 252 L -484 262 -462 253 Q -447 246 -444 256 -459 271 -483 271 L -507 265 -508 279 -518 290 -512 292 Q -496 298 -496 305 L -500 308 -533 296 Q -544 296 -562 309 L -581 324 -569 348 -559 371 Q -559 376 -562 374 L -567 369 -568 367 -576 355 -585 333 -590 318";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -590 318 L -585 333 -576 355 -568 367 -567 369 -561 386 -566 443 -571 501 -574 557 -577 616 -572 675 -573 691 -586 710 -591 709 -592 697 -599 704 -601 702 -601 691 Q -599 659 -602 636 L -607 589 -602 494 -605 451 -603 307 Q -595 308 -590 318";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -617 41 L -612 40 -610 65 -606 82 -593 86 -581 96 -575 108 -564 142 -567 144 -586 103 Q -590 103 -595 99 L -595 108 -598 165 -604 192 -614 216 -618 221 Q -614 228 -613 240 L -613 243 -613 320 -608 364 -612 383 -607 499 Q -607 541 -610 561 L -608 599 Q -609 624 -618 624 L -620 623 -621 622 -621 491 -626 423 Q -627 381 -634 357 L -635 242 -626 203 -626 78 Q -634 44 -617 41 M -358 146 L -365 149 -411 149 -432 141 -446 123 -445 120 -443 119 -434 125 -428 133 Q -411 149 -395 144 L -358 146";
	ctx.fillStyle=tocolor(ctrans.apply([117,89,79,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape429(ctx,ctrans,frame,ratio,time){
	var pathData="M 287 -279 L 300 -280 302 -285 303 -287 Q 307 -293 317 -296 L 347 -303 349 -303 389 -300 393 -291 375 -271 Q 355 -255 341 -255 L 339 -255 339 -254 337 -242 352 -243 369 -243 378 -243 377 -244 375 -246 Q 375 -252 378 -256 384 -268 409 -270 L 415 -271 417 -271 Q 411 -276 411 -283 L 412 -288 429 -297 436 -296 Q 460 -291 460 -277 460 -267 450 -265 L 454 -256 453 -248 448 -239 436 -227 442 -217 474 -220 492 -219 510 -217 521 -214 Q 546 -227 591 -227 643 -227 669 -215 L 678 -210 681 -210 673 -216 672 -217 660 -231 661 -234 662 -237 Q 667 -248 692 -251 L 704 -252 739 -245 748 -231 748 -227 737 -215 722 -207 712 -205 715 -197 715 -195 Q 720 -200 731 -202 L 737 -204 756 -202 758 -202 Q 782 -197 782 -183 782 -173 772 -171 L 776 -162 775 -154 770 -145 758 -133 764 -120 768 -111 Q 768 -104 758 -96 L 758 -94 Q 758 -84 748 -80 L 737 -78 Q 728 -70 718 -66 L 733 -64 736 -63 793 -44 Q 807 -37 811 -28 L 822 -30 884 -34 898 -35 Q 913 -30 916 -24 L 917 -14 Q 917 17 853 17 L 822 13 806 4 802 0 794 6 Q 776 18 744 22 L 731 23 Q 737 26 739 34 L 744 31 Q 759 22 795 18 L 822 17 Q 852 18 856 35 872 23 890 24 949 22 990 47 L 1014 66 Q 1022 57 1041 51 L 1095 43 1112 43 Q 1176 42 1184 69 L 1185 76 1185 77 Q 1185 93 1164 107 L 1160 109 Q 1133 123 1098 123 L 1082 123 1057 121 1061 131 1113 125 Q 1165 125 1191 137 L 1205 146 1208 149 Q 1215 159 1215 179 L 1214 189 1203 207 1193 215 1189 217 1142 225 1087 220 1073 217 1056 212 Q 1009 198 1009 179 L 1011 170 1016 160 1014 160 965 158 960 155 958 158 958 162 958 164 Q 958 174 948 178 L 937 180 918 192 933 194 936 195 Q 976 205 993 214 1007 221 1011 230 L 1022 228 1084 224 1098 223 1116 234 1117 244 Q 1117 273 1061 275 L 1070 279 1076 284 1090 282 Q 1149 280 1190 305 L 1195 308 1185 339 1177 373 1105 384 Q 1048 384 1027 365 L 1023 361 1012 379 1002 387 998 389 951 397 914 395 911 397 925 406 926 416 Q 926 447 862 447 L 831 443 815 434 811 430 803 436 784 445 784 451 804 448 831 447 Q 861 448 865 465 881 453 899 454 958 452 999 477 L 1011 486 1002 521 969 540 946 554 914 556 Q 857 556 836 537 826 527 826 514 L 829 504 808 506 Q 771 506 754 493 L 744 483 742 475 748 464 749 464 746 462 737 455 736 453 719 453 715 453 715 459 714 469 703 487 693 495 688 498 737 503 742 503 774 506 Q 790 510 790 521 L 780 536 Q 766 548 741 550 L 736 555 732 559 Q 714 576 685 582 L 690 585 719 611 Q 675 632 654 645 637 655 623 664 L 605 664 Q 548 664 527 645 517 635 517 622 L 520 612 499 614 Q 462 614 445 601 433 593 433 583 433 566 477 559 L 481 557 493 554 522 551 506 542 502 538 494 544 Q 468 561 410 561 363 561 344 544 L 338 538 Q 331 528 331 506 331 487 366 478 L 356 477 317 464 308 459 Q 283 444 283 434 L 287 418 274 411 270 407 267 410 Q 252 423 226 424 L 241 427 261 434 Q 264 443 280 451 L 285 471 284 479 271 493 Q 250 507 207 507 L 202 507 Q 192 516 168 525 L 167 526 Q 182 528 189 535 L 197 532 Q 248 516 248 545 L 248 546 Q 271 547 271 563 L 264 576 Q 255 587 239 587 L 215 583 Q 226 592 226 605 226 621 217 628 201 639 153 639 116 639 95 620 82 607 82 598 82 565 149 568 L 146 565 136 557 130 543 132 535 92 538 Q 35 538 14 519 4 509 4 496 L 7 486 -14 488 Q -51 488 -68 475 -80 467 -80 457 -80 437 -18 430 37 424 43 447 56 437 72 436 L 70 434 67 428 40 429 Q 9 429 -7 416 L -11 412 -19 418 Q -45 435 -103 435 -150 435 -169 418 L -175 412 Q -182 402 -182 380 -182 361 -147 352 L -157 351 -196 338 -215 332 -233 325 Q -228 333 -228 345 L -229 353 -242 367 Q -263 381 -306 381 -352 381 -373 362 -386 352 -386 341 L -384 327 -398 327 Q -431 327 -443 308 L -449 288 Q -449 275 -407 275 L -422 265 -435 243 Q -435 221 -404 215 -400 203 -384 198 L -387 188 Q -387 166 -354 170 -323 175 -321 193 L -303 195 -285 192 Q -246 187 -246 208 -246 214 -253 221 -261 230 -273 232 L -287 248 -291 251 Q -291 266 -300 273 -316 284 -364 284 L -366 284 Q -358 290 -356 301 L -307 296 -272 301 -252 308 -253 303 Q -253 291 -243 281 L -257 260 Q -257 233 -204 227 L -191 226 -189 221 -202 223 Q -221 223 -231 205 L -238 187 Q -238 175 -230 179 L -216 186 -210 184 -226 170 Q -226 161 -186 151 -186 132 -151 123 L -161 122 -209 126 -233 124 -246 138 Q -267 152 -310 152 -356 152 -377 133 -390 123 -390 112 L -388 98 -402 98 Q -435 98 -447 79 L -453 59 Q -453 45 -406 46 -364 47 -360 72 L -311 67 -276 72 Q -268 59 -243 56 -254 47 -261 31 -261 4 -208 -2 L -195 -3 -192 -10 Q -211 -15 -222 -25 -235 -35 -235 -46 L -233 -60 -247 -60 Q -280 -60 -292 -79 L -298 -99 Q -298 -113 -251 -112 -209 -111 -205 -86 L -156 -91 Q -77 -87 -77 -42 -77 -31 -91 -20 L -102 -14 -120 6 Q -140 22 -154 22 L -156 22 -156 23 -158 35 -143 34 -126 34 -118 33 -120 31 Q -120 8 -80 6 L -78 6 -84 -6 Q -84 -24 -59 -19 -35 -14 -35 0 -35 10 -45 12 L -41 21 -37 21 Q -24 21 -19 33 L -16 45 -24 56 Q -34 65 -47 65 L -53 65 Q -53 73 -59 83 L -59 89 Q -59 99 -69 103 L -80 105 -99 117 -84 119 Q -63 102 -9 95 L -6 95 10 73 Q 38 50 96 50 L 118 45 123 42 81 48 65 48 48 48 Q -7 48 -24 25 -31 15 -31 -7 -31 -26 4 -35 -29 -38 -54 -54 -79 -69 -79 -79 L -75 -95 Q -96 -103 -106 -127 -106 -154 -53 -160 L -40 -161 Q -38 -179 7 -184 53 -190 53 -172 L 35 -152 Q 15 -136 1 -136 L -1 -136 -1 -135 -3 -123 12 -124 38 -124 35 -127 Q 35 -150 75 -152 L 77 -152 Q 71 -157 71 -164 71 -182 96 -177 L 106 -174 107 -179 93 -179 Q 62 -179 50 -196 L 48 -198 45 -204 42 -218 Q 42 -231 82 -231 L 84 -231 89 -231 Q 113 -230 125 -222 L 135 -205 178 -210 184 -210 204 -208 219 -205 239 -198 244 -190 264 -190 261 -198 265 -214 252 -221 248 -225 234 -246 235 -253 Q 241 -274 287 -279 M 204 -258 L 200 -255 Q 186 -246 167 -244 L 153 -243 Q 125 -243 107 -253 L 96 -261 Q 86 -270 84 -279 L 87 -291 Q 91 -303 107 -308 L 152 -314 170 -313 188 -311 Q 209 -306 216 -294 L 219 -281 218 -274 204 -258 M 114 -137 L 108 -120 96 -108 102 -94 96 -75 96 -69 95 -63 127 -64 132 -64 134 -64 124 -67 114 -75 108 -89 110 -97 Q 115 -110 141 -107 L 145 -106 Q 160 -104 167 -97 L 173 -90 Q 200 -108 251 -108 L 312 -102 Q 309 -111 309 -126 L 310 -132 298 -124 Q 271 -110 236 -110 190 -110 165 -121 L 153 -128 Q 131 -132 118 -144 L 114 -147 110 -146 114 -137 M 62 -43 L 56 -41 61 -41 62 -43 M 336 -199 L 330 -198 329 -197 337 -195 336 -199 M 323 -156 L 320 -144 344 -154 334 -155 323 -157 323 -156 M 203 -18 L 200 -9 236 -10 Q 251 -5 254 1 L 254 2 270 -8 203 -18 M 350 -74 L 353 -54 Q 353 -38 341 -26 L 340 -25 Q 413 -34 419 -5 428 0 428 8 L 418 23 405 31 401 35 401 36 Q 407 32 417 31 L 449 30 454 30 456 30 446 27 436 19 430 5 432 -3 Q 437 -16 463 -13 L 467 -12 Q 482 -10 489 -3 L 495 4 496 12 490 24 Q 484 31 474 32 L 485 34 499 38 496 34 493 28 Q 493 19 507 14 L 505 13 Q 495 3 495 -10 L 498 -20 477 -18 Q 440 -18 423 -31 411 -39 411 -49 L 399 -48 Q 381 -48 375 -58 L 371 -69 372 -71 350 -74 M 663 -276 L 663 -275 Q 663 -259 642 -245 L 638 -243 Q 611 -229 576 -229 L 560 -229 Q 525 -231 505 -240 L 493 -246 491 -248 Q 483 -256 483 -265 483 -290 519 -301 L 573 -309 590 -309 Q 654 -310 662 -283 L 663 -276 M 595 -274 L 598 -277 598 -278 571 -277 564 -274 571 -272 595 -274 M 572 -129 L 570 -131 565 -132 551 -135 534 -140 503 -152 489 -150 475 -149 Q 447 -149 429 -159 L 418 -167 414 -171 Q 405 -164 396 -160 L 411 -158 414 -157 471 -138 489 -122 500 -124 562 -128 572 -129 M 422 -72 L 422 -69 422 -63 428 -66 427 -71 427 -73 422 -72 M 581 -85 L 585 -70 Q 622 -69 652 -55 L 666 -60 656 -61 645 -63 Q 630 -67 617 -74 L 608 -79 590 -92 581 -85 M 711 -189 L 697 -177 693 -174 693 -173 692 -163 685 -149 691 -149 700 -149 699 -150 697 -152 700 -162 Q 704 -170 718 -174 L 715 -177 711 -188 711 -189 M 652 -104 L 651 -103 659 -101 658 -105 652 -104 M 920 -183 L 920 -184 893 -183 886 -180 893 -178 917 -180 920 -183 M 964 -151 L 960 -149 Q 933 -135 898 -135 L 882 -135 Q 847 -137 827 -146 L 815 -152 813 -154 Q 805 -162 805 -171 805 -196 841 -207 L 895 -215 912 -215 Q 976 -216 984 -189 L 985 -182 985 -181 Q 985 -165 964 -151 M 983 -140 L 984 -143 Q 989 -154 1014 -157 L 1026 -158 1061 -151 Q 1070 -146 1070 -137 L 1070 -133 1059 -121 1044 -113 1015 -110 1012 -110 995 -122 994 -123 982 -137 983 -140 M 856 -46 Q 809 -60 809 -79 L 811 -88 Q 814 -99 827 -110 L 834 -115 Q 861 -133 913 -133 965 -133 991 -121 L 1005 -112 1008 -109 Q 1015 -99 1015 -79 L 1014 -69 1003 -51 993 -43 989 -41 942 -33 887 -38 873 -41 856 -46 M 1082 -81 Q 1078 -73 1061 -73 L 1046 -76 1037 -83 1033 -94 Q 1033 -104 1053 -108 L 1059 -110 Q 1084 -115 1084 -94 L 1082 -81 M 1042 -35 L 1074 -32 Q 1090 -28 1090 -17 L 1080 -2 Q 1064 12 1034 12 1010 12 1000 4 994 -1 994 -6 994 -29 1028 -34 L 1042 -35 M 1261 107 Q 1270 112 1270 121 L 1270 125 1259 137 1244 145 1215 148 1212 148 1195 136 1194 135 1182 121 1183 118 1184 115 Q 1189 104 1214 101 L 1226 100 Q 1250 100 1261 107 M 1282 177 Q 1278 185 1261 185 L 1246 182 Q 1240 180 1237 175 L 1233 164 Q 1233 154 1253 150 L 1259 148 Q 1284 143 1284 164 L 1282 177 M 1246 223 L 1211 268 1200 262 1194 252 Q 1194 229 1228 224 L 1242 223 1246 223 M 1249 382 L 1251 380 1250 382 1249 382 M 1120 75 L 1120 74 1093 75 1086 78 1093 80 1117 78 1120 75 M 1027 112 L 1015 106 1013 104 1009 99 Q 999 106 981 113 L 967 118 958 125 964 138 964 140 Q 976 131 1010 120 L 1034 115 1027 112 M 859 157 L 858 153 852 154 851 155 859 157 M 832 220 L 842 208 852 203 866 198 856 197 845 195 817 184 808 179 790 166 786 162 783 154 787 138 774 131 772 129 770 127 756 106 757 99 Q 762 82 792 76 760 75 745 63 L 737 56 738 58 741 71 740 78 738 82 741 89 741 94 Q 741 111 727 125 L 723 129 705 142 706 142 726 144 741 147 761 154 766 162 780 171 781 173 785 188 785 191 784 199 771 213 Q 754 224 722 227 L 724 233 724 235 720 241 706 253 702 256 695 261 695 262 696 270 691 281 694 281 Q 697 276 707 272 L 709 268 Q 713 260 727 256 L 740 254 746 253 748 253 Q 742 248 742 241 L 743 236 Q 748 231 760 227 L 765 228 767 228 Q 791 233 791 247 L 789 255 801 261 807 259 810 257 814 256 Q 815 246 823 238 826 234 831 232 L 831 226 832 220 M 1002 258 L 994 264 985 269 973 279 972 280 995 276 1013 275 1023 273 1027 273 1022 271 1006 262 1002 258 M 935 297 L 939 292 907 295 891 295 866 293 Q 860 285 843 287 L 842 286 838 289 Q 828 298 815 298 802 298 794 290 L 786 280 784 276 779 285 776 290 Q 772 294 767 297 L 773 310 773 312 769 327 767 330 767 334 767 336 Q 767 346 757 350 L 746 352 727 364 742 366 745 367 765 372 Q 767 362 776 354 L 792 344 Q 805 337 825 333 L 825 332 836 320 843 315 Q 854 307 870 303 L 922 297 935 297 M 1003 424 Q 1003 401 1037 396 L 1051 395 1083 398 1098 409 1050 421 1042 426 1041 426 Q 1040 416 1026 416 L 1022 440 1009 434 1003 424 M 1062 435 L 1055 435 1056 433 1068 432 1062 435 M 1172 394 L 1171 395 1168 396 1172 394 M 694 23 L 672 20 664 18 659 19 645 24 638 31 Q 628 40 615 40 602 40 594 32 L 583 32 569 32 564 38 Q 555 49 539 49 L 515 45 Q 526 54 526 67 L 525 76 522 85 517 90 Q 501 101 453 101 416 101 395 82 382 69 382 60 L 383 53 384 51 387 46 Q 361 61 318 61 L 312 64 328 72 Q 359 92 359 107 359 123 319 138 L 257 151 Q 273 155 273 166 L 263 181 Q 247 195 217 195 193 195 183 187 177 182 177 177 177 154 211 149 L 176 140 125 150 70 145 67 149 81 148 99 159 100 169 Q 100 192 65 198 L 82 197 99 197 Q 163 196 171 223 L 172 230 173 230 201 255 213 254 248 261 Q 257 266 257 275 L 257 279 246 291 231 299 Q 237 300 240 304 L 246 302 Q 271 297 271 318 L 269 331 Q 265 339 248 339 L 238 338 241 351 240 358 226 374 222 377 229 377 257 379 Q 263 358 309 353 L 322 352 324 347 325 345 Q 329 339 339 336 350 331 369 329 L 371 329 381 328 379 326 376 320 Q 373 313 373 306 L 376 300 Q 384 293 413 293 L 415 293 420 293 Q 444 294 456 302 L 466 319 509 314 514 314 515 314 535 316 550 319 568 325 583 324 582 318 583 311 584 309 586 305 583 303 581 301 579 299 565 278 566 271 Q 571 254 601 248 L 618 245 631 244 633 239 634 237 Q 638 231 648 228 L 668 223 Q 651 218 640 208 L 636 205 Q 629 198 628 192 L 627 187 627 185 628 178 629 173 615 173 Q 584 173 572 156 L 570 154 567 148 564 134 567 128 564 120 Q 564 106 576 96 L 592 86 Q 599 82 609 79 L 606 73 Q 606 66 609 61 613 49 629 44 L 642 41 654 39 Q 667 33 688 26 L 699 23 694 23 M 462 72 L 465 73 469 70 462 70 462 72 M 484 124 Q 531 113 531 137 L 519 153 Q 504 164 483 164 446 164 436 145 L 440 139 445 136 461 130 472 127 484 124 M 451 213 L 463 211 483 210 501 211 519 213 530 216 544 225 547 230 550 243 549 250 547 254 535 266 531 269 512 278 498 280 484 281 Q 456 281 438 271 L 427 263 423 259 418 251 415 245 Q 415 238 418 233 422 221 438 216 L 451 213 M 594 360 L 617 358 620 355 619 354 593 355 594 360 M 436 359 L 436 358 433 349 434 345 424 345 414 345 397 361 Q 377 377 363 377 L 361 377 361 378 359 390 374 389 391 389 400 389 399 388 397 386 Q 397 380 400 376 406 364 431 362 L 436 361 436 359 M 470 393 L 458 405 464 417 472 417 476 418 Q 491 420 498 427 L 504 434 505 442 499 454 Q 493 461 483 462 L 494 464 508 468 505 464 502 458 Q 502 450 513 446 517 437 527 428 L 534 423 Q 561 405 613 405 L 638 406 636 403 640 397 598 403 582 403 543 398 516 399 511 399 484 396 471 393 470 393 M 441 460 L 458 460 463 460 465 460 455 457 453 456 448 458 441 460 M 531 483 L 535 497 534 506 534 507 584 504 598 503 614 511 634 505 587 500 556 492 531 483 M 664 328 L 668 329 668 328 664 328 M 253 42 L 253 46 253 50 271 52 Q 259 47 253 42 M 296 173 Q 296 162 348 145 399 129 399 158 399 185 352 185 L 303 183 Q 296 180 296 173 M 143 34 L 139 36 150 33 147 32 143 34 M 36 200 Q 5 200 -11 187 L -15 183 -23 189 Q -48 205 -102 206 L -98 215 Q -98 221 -116 235 -136 251 -150 251 L -152 251 -152 252 -113 250 Q -107 238 -82 236 L -84 228 -79 218 -62 209 -22 201 28 205 53 200 36 200 M 182 290 L 181 289 178 291 192 300 195 303 199 302 182 290 M 21 297 L 10 290 Q 0 280 0 267 L 2 260 0 258 -18 259 -38 258 -43 267 -55 279 Q -49 285 -49 293 L -49 294 Q -49 302 -55 312 L -55 318 Q -55 328 -65 332 L -76 334 -95 346 -80 348 -77 349 Q -37 359 -20 368 -6 375 -2 384 L 71 378 85 377 Q 100 382 103 388 L 104 398 104 401 106 401 111 401 Q 135 402 147 410 L 157 427 200 422 187 416 Q 181 411 181 406 181 395 189 388 L 175 389 129 379 74 374 43 366 Q -4 352 -4 333 L -2 324 Q 1 313 14 302 L 21 297 M 351 435 L 359 437 358 433 352 434 351 435 M 343 546 L 346 558 338 569 Q 328 578 315 578 296 578 286 560 L 279 542 Q 279 530 287 534 L 301 541 307 539 310 537 325 534 Q 337 534 342 544 L 343 546 M 336 691 L 312 682 317 681 369 691 342 693 336 691 M 282 637 L 280 631 Q 301 615 353 608 441 595 441 632 441 651 423 667 407 682 381 689 L 383 686 Q 375 677 356 669 L 324 658 326 655 320 649 295 648 293 647 282 637 M 169 608 L 162 608 162 610 165 611 169 608 M 196 572 L 185 572 199 576 196 572 M 533 554 L 537 557 Q 553 561 556 573 567 564 580 563 L 574 554 553 555 533 554 M -256 -160 Q -256 -196 -188 -195 -121 -195 -121 -162 -121 -151 -136 -139 -156 -124 -187 -124 -225 -124 -244 -142 L -256 -160 M -276 -4 Q -276 7 -291 19 -311 34 -342 34 -380 34 -399 16 -409 7 -411 -2 -411 -38 -343 -37 -276 -37 -276 -4 M -4 -80 L -10 -79 -11 -78 -3 -76 -4 -80 M -171 203 L -174 210 -144 203 -142 203 Q -163 199 -173 189 L -175 189 -174 191 -171 203 M -317 424 L -323 436 Q -329 443 -339 444 L -314 450 -320 440 Q -320 425 -281 421 -242 416 -242 437 -242 443 -249 450 -258 461 -274 461 L -298 457 Q -287 466 -287 479 -287 495 -296 502 -312 513 -360 513 -397 513 -418 494 -431 481 -431 472 -431 438 -359 442 L -357 442 Q -370 439 -377 431 L -383 417 Q -383 395 -350 399 -317 404 -317 424 M -344 482 L -351 482 -351 484 -348 485 -344 482 M -203 411 L -188 408 Q -176 408 -171 418 L -170 420 -167 432 -175 443 Q -185 452 -198 452 -217 452 -227 434 L -234 416 Q -234 404 -226 408 L -212 415 -206 413 -203 411 M -90 541 Q -101 551 -116 558 L -121 554 Q -126 554 -129 557 L -129 559 -135 557 -145 555 -146 555 -244 544 -249 532 Q -249 494 -160 482 -72 469 -72 506 -72 525 -90 541 M -129 562 L -128 561 -128 562 -129 562 M -173 567 L -173 568 -175 568 -173 567 M -329 536 Q -290 527 -283 542 L -352 542 -329 536";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 275 -288 L 270 -288 260 -289 152 -298 146 -298 127 -302 130 -294 122 -285 118 -283 114 -280 103 -270 100 -256 100 -255 101 -244 101 -242 98 -230 72 -203 59 -192 34 -179 22 -175 16 -168 -11 -168 -43 -168 -61 -168 -118 -170 -173 -178 -179 -179 Q -183 -179 -183 -191 L -191 -191 Q -268 -160 -288 -158 L -294 -159 -296 -155 -296 -148 Q -296 -140 -305 -136 -309 -133 -324 -126 L -327 -125 -329 -124 -320 -106 -300 -79 -290 -65 -291 -63 Q -295 -63 -301 -66 L -291 -56 -290 -55 -290 -46 -297 -43 -313 -36 -304 -31 -350 4 Q -387 26 -387 30 L -399 38 Q -413 42 -417 52 L -419 77 -413 90 -415 92 -408 104 -388 121 -383 125 Q -362 139 -355 139 L -349 146 Q -349 155 -368 188 L -370 191 Q -390 225 -408 232 L -418 234 -428 229 -427 235 -441 271 -419 313 -413 323 -397 339 -386 347 -371 360 -365 369 -353 381 -349 383 -338 391 -338 392 -350 385 -353 383 -366 389 -368 390 -366 390 -359 391 -358 397 -361 401 -390 431 -415 457 -422 468 Q -422 480 -373 536 L -375 539 -406 511 -428 479 Q -430 487 -435 487 L -449 468 Q -449 454 -432 435 L -412 415 -399 404 -376 389 -358 381 -381 368 Q -391 362 -404 355 -443 334 -444 326 L -451 287 -453 251 -462 242 Q -462 235 -442 215 L -433 207 -418 191 -415 188 -397 171 -391 165 -378 155 -373 150 Q -373 144 -376 139 L -377 139 -378 139 -385 134 -408 115 Q -416 110 -428 106 L -435 102 -439 93 -432 56 -438 46 Q -438 23 -387 -7 L -301 -54 -316 -78 -322 -85 -333 -109 -338 -119 -338 -121 -338 -131 -335 -130 -323 -147 Q -307 -168 -301 -165 L -286 -174 -259 -188 Q -221 -204 -200 -201 L -200 -203 Q -200 -210 -186 -210 L -50 -200 10 -186 Q 81 -198 87 -243 L 88 -255 89 -273 89 -279 94 -285 105 -291 114 -295 120 -309 124 -309 125 -308 136 -314 155 -319 235 -320 303 -324 310 -317 304 -310 359 -309 385 -315 517 -313 636 -303 Q 653 -303 646 -291 L 646 -290 668 -287 Q 689 -284 689 -277 L 688 -272 683 -269 792 -196 800 -205 876 -212 952 -216 Q 972 -216 969 -207 L 967 -198 981 -192 1008 -182 1037 -168 1058 -160 Q 1069 -155 1072 -143 L 1077 -134 1075 -132 1082 -128 1083 -126 1079 -125 1071 -128 1048 -105 1047 -101 1042 -97 1035 -89 1034 -87 1032 -74 1032 -64 1031 -63 1009 -38 1048 9 1072 45 1085 45 1199 49 Q 1237 53 1250 66 1257 73 1257 82 1257 94 1273 114 L 1279 122 1290 150 1293 160 Q 1293 169 1286 170 L 1275 188 1273 191 1229 262 Q 1184 336 1184 368 L 1184 376 Q 1195 377 1209 384 L 1222 383 Q 1235 367 1243 367 L 1264 374 1289 386 Q 1296 390 1296 400 L 1296 417 1321 420 1326 427 Q 1326 432 1351 437 L 1350 438 Q 1325 437 1325 430 L 1293 425 1283 399 Q 1272 378 1244 378 L 1234 386 1225 396 1205 396 Q 1202 394 1183 387 1172 383 1172 375 L 1174 366 1174 364 1170 366 1123 388 1117 391 1081 407 1062 416 1058 419 Q 1015 442 1015 477 L 1012 484 Q 1017 481 1017 485 L 1011 495 1046 521 1088 512 1114 503 1125 507 1133 514 1152 516 Q 1166 517 1171 524 L 1143 524 Q 1137 523 1126 515 L 1117 508 1094 519 Q 1070 530 1057 538 L 1035 538 1011 518 1000 506 972 534 971 534 968 539 Q 957 554 940 557 L 912 559 919 557 942 542 966 522 974 514 994 497 995 492 1010 460 1014 452 Q 1028 428 1039 421 L 1042 419 1071 405 1100 392 1110 387 1133 378 1165 366 1175 363 1182 343 Q 1194 316 1221 269 L 1253 214 1273 185 1284 170 1283 170 1263 153 1248 133 1243 126 1215 89 1211 85 1103 73 1083 69 1076 68 1074 69 1068 72 Q 1043 72 1032 52 L 1031 48 1017 20 1012 14 1005 6 994 -6 Q 978 -26 978 -36 L 981 -37 1000 -46 1015 -59 1021 -88 1026 -94 1030 -99 1029 -100 1032 -101 1046 -116 1060 -132 Q 1044 -140 1015 -155 L 946 -189 906 -184 886 -181 819 -164 799 -163 Q 788 -163 788 -172 L 790 -176 792 -180 791 -182 790 -181 787 -180 758 -197 727 -219 719 -225 702 -237 675 -257 662 -268 552 -277 521 -278 513 -279 Q 496 -281 494 -293 L 477 -290 466 -288 396 -288 389 -288 355 -291 351 -292 323 -288 308 -288 275 -288 M 902 562 L 906 561 898 565 860 570 Q 851 570 848 566 L 836 562 Q 801 562 762 601 L 721 647 724 649 726 653 Q 726 665 680 677 L 689 699 729 682 Q 762 668 780 668 816 668 821 691 L 812 709 802 709 811 689 808 683 783 680 781 676 777 679 Q 763 680 728 695 L 690 709 680 708 681 694 676 684 671 677 Q 671 669 680 666 L 716 656 711 649 747 604 648 666 Q 600 694 577 702 537 717 459 726 L 468 735 465 743 Q 465 755 505 770 544 784 544 788 L 534 820 542 827 Q 551 833 556 847 L 575 850 582 854 583 856 575 859 552 856 533 837 522 821 527 809 532 794 Q 532 791 511 783 L 477 772 Q 452 766 455 737 L 438 737 436 731 Q 436 725 503 707 L 486 698 442 696 432 694 416 693 405 691 404 677 400 670 387 665 Q 385 653 399 661 L 412 672 415 680 425 679 431 676 468 686 481 690 514 701 515 702 515 704 520 702 599 678 Q 627 667 639 657 L 656 644 672 633 695 616 713 603 Q 742 583 763 570 L 777 561 792 552 797 557 797 558 Q 809 550 817 550 L 845 553 852 557 866 563 878 564 902 562 M 225 604 L 216 600 Q 208 600 183 621 158 640 128 637 L 71 635 Q 62 637 54 642 38 650 36 652 L 19 664 14 667 -1 678 -8 694 Q -11 704 -26 707 L -68 713 -110 722 -121 722 -95 710 -65 702 -51 701 -47 701 Q -22 698 -17 686 -9 667 3 661 L 7 659 34 642 Q 36 631 43 629 L 68 628 128 629 137 631 Q 162 631 177 619 L 194 601 225 600 231 602 256 610 269 612 Q 298 616 313 631 336 656 366 666 L 363 667 Q 342 667 328 659 L 324 657 315 650 314 649 309 642 295 629 268 619 225 604 M -2 650 Q -10 656 -20 656 -43 656 -58 634 L -78 606 -111 586 Q -132 577 -166 574 L -143 572 Q -96 572 -65 610 -34 648 -20 648 L -7 645 -7 644 -3 639 1 639 4 642 -2 650 M -396 181 L -396 182 -374 166 -386 171 -396 181 M -373 393 L -381 397 -382 399 Q -377 398 -374 394 L -373 393 M -341 537 L -341 542 -345 542 -345 535 -345 534 Q -345 528 -338 528 L -280 533 -274 536 -280 537 -327 533 -341 533 -341 537 M -363 527 L -348 542 -354 542 -380 517 -395 503 -416 477 -415 474 -414 474 -409 477 -413 477 -394 498 -380 511 -363 527 M -425 321 L -434 308 -426 321 -425 321";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 270 -264 Q 270 -278 306 -278 375 -278 375 -261 375 -254 366 -250 L 309 -241 281 -252 Q 270 -257 270 -264 M 260 -289 L 243 -274 Q 221 -259 192 -259 159 -259 145 -268 L 138 -278 Q 138 -290 146 -298 L 152 -298 260 -289 M 122 -285 L 115 -281 114 -280 118 -283 122 -285 M 103 -270 L 108 -264 102 -257 100 -256 103 -270 M 101 -244 L 131 -249 Q 165 -250 165 -237 L 162 -223 Q 155 -216 131 -216 109 -216 100 -226 L 98 -230 101 -242 101 -244 M 59 -192 Q 83 -204 102 -208 129 -215 161 -197 189 -180 189 -173 189 -160 174 -148 152 -131 112 -131 L 56 -139 47 -131 35 -127 Q 50 -122 50 -107 L 48 -102 53 -94 53 -92 62 -98 90 -107 Q 107 -107 115 -100 L 120 -91 118 -84 124 -84 148 -83 147 -87 Q 134 -90 134 -104 134 -116 145 -117 L 161 -115 189 -123 Q 180 -132 180 -140 180 -149 205 -161 L 216 -165 216 -166 Q 216 -178 273 -182 L 303 -181 Q 305 -192 326 -196 346 -199 349 -187 357 -204 391 -199 L 399 -197 443 -203 471 -201 482 -205 475 -205 Q 453 -205 453 -223 453 -235 464 -236 L 492 -233 Q 511 -233 511 -223 L 501 -213 Q 495 -209 489 -207 L 515 -209 Q 576 -211 576 -192 L 573 -185 577 -180 573 -174 563 -172 560 -172 558 -171 Q 536 -156 507 -156 L 496 -156 490 -153 468 -144 Q 480 -142 480 -134 L 477 -120 Q 474 -117 467 -115 L 499 -108 498 -114 499 -121 Q 492 -122 490 -126 488 -128 489 -131 489 -143 506 -144 518 -144 521 -138 L 558 -137 562 -136 613 -143 596 -149 Q 585 -154 585 -161 585 -172 607 -174 L 605 -179 592 -183 588 -189 Q 588 -198 606 -198 L 621 -195 625 -195 Q 645 -192 645 -178 L 645 -174 666 -172 663 -180 Q 663 -203 693 -201 L 713 -197 726 -200 758 -197 787 -180 790 -181 Q 781 -170 740 -170 L 722 -174 720 -171 Q 713 -162 692 -162 L 689 -162 690 -158 Q 690 -151 681 -147 L 658 -141 Q 702 -137 702 -115 702 -103 679 -91 655 -79 622 -78 645 -74 645 -61 L 642 -54 Q 654 -49 659 -40 L 660 -42 661 -45 662 -48 678 -50 Q 696 -50 697 -39 697 -31 680 -31 L 671 -31 662 -33 663 -26 Q 663 -14 650 -4 L 654 4 Q 654 18 632 30 L 618 37 618 39 Q 618 51 599 51 L 600 52 595 53 592 53 577 50 579 52 573 54 567 51 567 49 554 50 542 50 506 47 503 47 490 63 Q 498 58 503 56 514 52 518 61 L 533 57 Q 555 53 555 62 L 547 71 528 77 518 76 514 80 508 81 498 79 485 70 483 68 486 66 456 73 419 69 408 66 407 65 402 63 393 64 367 59 358 59 344 57 342 57 305 55 Q 299 54 299 46 L 301 41 297 41 263 39 262 39 Q 241 52 207 52 L 201 52 191 59 156 71 156 80 150 99 146 104 146 106 141 118 Q 134 126 120 126 92 126 95 112 L 80 107 76 110 Q 64 123 47 123 L 30 123 38 133 55 133 Q 67 138 67 142 L 61 152 38 159 33 160 35 166 Q 35 176 23 176 L -14 174 -20 165 Q -20 157 -6 155 L -16 140 -16 138 -12 133 1 130 5 131 6 131 18 132 18 128 20 122 -27 114 Q -47 107 -47 96 -47 64 20 59 31 48 66 43 L 65 38 66 30 34 32 17 31 -16 53 Q -52 66 -92 66 -139 66 -160 50 -172 40 -172 29 -172 13 -163 6 -146 -7 -86 -7 L -22 -2 Q -21 -29 28 -31 L 28 -32 44 -34 58 -31 70 -30 65 -33 Q 58 -39 57 -46 L 43 -44 Q 24 -44 24 -52 24 -69 43 -75 59 -80 62 -64 L 75 -76 Q 51 -76 49 -84 L 39 -82 Q 20 -82 20 -94 20 -101 32 -102 L 29 -103 11 -93 Q 0 -93 -9 -119 L -8 -122 -10 -122 -38 -133 Q -49 -138 -49 -145 -49 -159 -13 -159 L 26 -157 21 -166 34 -179 59 -192 M 719 -225 L 711 -223 Q 702 -227 702 -237 L 719 -225 M 675 -257 Q 674 -248 660 -237 636 -221 589 -221 539 -221 514 -237 499 -248 499 -259 499 -267 521 -278 L 552 -277 662 -268 675 -257 M 477 -290 Q 475 -273 425 -273 403 -273 396 -288 L 466 -288 477 -290 M 308 -288 Q 305 -282 293 -282 L 277 -286 275 -288 308 -288 M 668 -287 L 666 -295 Q 666 -325 710 -318 753 -310 753 -297 L 742 -282 Q 728 -270 706 -270 L 688 -272 689 -277 Q 689 -284 668 -287 M 981 -192 Q 981 -222 1025 -215 1068 -207 1068 -194 1068 -189 1057 -179 1048 -172 1037 -168 L 1008 -182 981 -192 M 1035 -89 L 1038 -82 1035 -68 1032 -64 1032 -74 1034 -87 1035 -89 M 1085 45 L 1102 35 Q 1128 23 1154 23 L 1154 25 1204 35 Q 1253 47 1253 57 L 1250 66 Q 1237 53 1199 49 L 1085 45 M 1273 114 Q 1301 117 1301 130 L 1298 144 1290 150 1279 122 1273 114 M 1275 188 L 1276 188 1273 191 1275 188 M 1174 366 L 1170 366 1174 364 1174 366 M 1081 407 L 1087 411 1058 419 1062 416 1081 407 M 972 534 L 968 539 971 534 972 534 M 942 542 L 927 538 933 543 927 545 921 542 921 537 925 537 918 527 Q 918 512 945 516 L 966 522 942 542 M 995 492 Q 970 504 926 504 883 504 862 485 849 473 849 461 849 438 892 431 L 888 429 876 423 864 431 Q 842 444 812 444 L 779 442 775 448 761 451 757 451 758 456 759 461 759 466 749 482 745 486 737 492 720 495 648 487 650 493 648 502 645 505 633 512 627 522 617 530 616 530 Q 601 540 578 542 577 556 556 568 L 509 579 504 590 503 592 506 592 Q 533 596 533 606 L 531 613 538 612 Q 555 609 555 618 L 551 624 537 627 Q 515 627 521 619 L 522 618 514 618 488 614 494 619 488 621 482 618 482 613 486 613 479 605 469 605 449 603 434 598 425 595 406 587 382 574 373 568 354 574 Q 324 574 329 557 329 551 332 547 338 539 355 538 L 358 538 Q 374 538 379 547 389 540 410 536 410 527 417 522 L 388 523 375 523 371 522 360 520 340 518 333 516 349 504 Q 349 494 328 495 307 498 307 503 L 300 493 299 487 274 488 248 482 240 489 232 494 223 500 284 508 308 516 310 518 312 519 318 527 319 532 320 537 320 542 310 558 306 562 298 568 281 571 248 570 217 572 190 570 194 584 188 598 178 606 177 606 Q 156 619 122 619 L 116 619 Q 76 618 56 606 41 597 41 587 41 577 47 570 52 563 61 559 L 53 554 50 548 Q 50 535 76 536 L 92 539 85 534 83 532 103 520 Q 114 516 118 525 L 119 534 118 540 114 544 108 545 98 543 101 550 118 549 152 552 142 533 Q 142 522 156 514 L 154 514 142 514 106 511 103 511 Q 86 506 76 499 L 63 504 65 512 Q 65 534 41 534 L 19 533 16 533 11 549 17 564 17 570 Q 12 590 -19 597 L -51 599 -62 599 -72 591 -107 564 Q -107 554 -99 548 L -100 547 Q -128 534 -128 523 -128 508 -74 507 L -59 506 -55 500 -53 498 -42 492 -38 491 Q -29 490 -25 497 L -23 503 -23 507 6 515 Q 8 508 17 504 L -3 498 -8 496 -17 491 -32 488 -36 483 -37 481 -32 475 -29 473 -23 469 -19 467 -18 465 Q -6 449 36 450 L 71 455 71 454 76 452 78 451 98 445 104 444 126 442 Q 109 437 98 427 L 90 418 89 419 79 426 59 433 47 435 29 440 7 435 5 435 -22 431 -27 434 -44 437 -118 428 Q -137 421 -138 411 L -138 410 -137 403 Q -134 390 -117 383 L -84 375 -72 373 -71 373 -66 373 -29 376 -16 371 -25 359 -26 353 -26 352 -26 350 -40 358 -61 368 -79 368 -92 360 -93 360 -103 366 -107 367 -124 373 -150 378 -157 379 -158 379 -166 380 -171 380 -183 380 -219 377 -222 377 -251 364 -262 350 -262 348 -263 346 -263 345 -263 343 Q -263 327 -254 320 L -249 318 -247 317 -227 311 -221 310 -177 307 -152 308 -117 311 -91 317 -83 321 -73 320 -69 320 -61 320 -20 327 -17 329 -7 325 -2 320 33 316 47 317 95 327 106 332 110 329 121 326 131 325 131 323 133 314 Q 133 307 140 302 L 110 308 109 308 94 312 86 311 80 307 79 306 77 305 Q 76 298 62 300 L 60 299 53 290 44 291 45 292 40 292 22 292 11 292 -11 288 -24 282 -26 281 -33 272 -34 266 Q -34 251 -24 243 L -19 240 -11 236 -6 235 -9 233 Q -37 220 -37 209 -37 196 4 193 6 184 21 185 34 187 37 192 107 190 107 217 107 234 93 242 L 99 249 100 255 100 256 115 255 142 256 142 255 Q 142 247 155 247 167 247 167 253 L 163 259 166 260 Q 176 264 176 272 L 173 279 164 290 160 292 158 293 152 297 162 294 174 292 192 291 205 290 207 290 221 289 245 290 266 292 284 297 289 302 290 306 290 309 292 318 289 328 269 342 240 352 217 355 210 362 199 366 184 370 183 371 230 378 Q 253 387 253 407 L 253 408 Q 252 422 231 434 L 197 444 208 445 234 451 243 455 Q 246 442 259 435 L 266 432 262 431 259 425 259 424 260 422 261 419 262 416 266 415 278 414 Q 293 414 296 422 L 297 425 297 428 337 433 Q 350 438 350 449 L 350 450 358 450 372 451 420 461 424 461 426 462 443 467 Q 456 474 456 488 L 456 494 448 508 453 507 481 504 486 494 494 486 Q 468 482 460 469 L 458 466 456 457 447 454 446 453 444 444 Q 444 427 474 423 L 499 426 517 425 513 422 502 408 502 406 501 404 501 403 501 401 Q 501 385 510 378 L 515 376 517 375 537 369 543 368 587 365 612 366 644 358 664 355 702 356 Q 730 362 734 386 L 734 395 728 414 724 419 Q 713 429 693 429 L 673 427 661 424 657 425 640 431 614 436 610 437 Q 617 443 617 452 L 614 462 594 476 595 477 609 481 618 480 636 482 626 469 626 468 627 461 Q 630 448 647 441 L 680 433 692 431 693 431 698 431 Q 731 429 747 440 749 437 759 436 L 757 435 750 430 739 417 738 411 738 410 Q 738 396 747 387 L 757 383 762 378 797 374 811 375 Q 859 380 875 393 L 897 390 Q 893 381 897 372 L 883 370 Q 877 369 877 361 L 879 356 889 351 905 349 916 350 920 350 926 352 969 348 970 347 Q 982 331 1024 332 1082 334 1082 358 1073 380 1053 386 1047 393 1033 400 L 1004 410 1004 413 998 432 994 436 Q 1009 442 1014 452 L 1010 460 995 492 M 1039 421 L 1026 416 Q 1027 404 1057 404 L 1071 405 1042 419 1039 421 M 1100 392 Q 1088 390 1088 382 1088 376 1111 372 1133 368 1133 377 L 1133 378 1110 387 1100 392 M 1165 366 L 1151 362 1157 367 1151 369 1145 366 1145 361 1149 361 1142 351 Q 1142 336 1169 340 L 1182 343 1175 363 1165 366 M 1253 214 L 1240 231 1194 237 Q 1136 237 1123 217 1116 207 1121 196 1121 173 1201 172 1255 171 1273 185 L 1253 214 M 1263 153 Q 1251 151 1245 144 L 1241 135 1243 126 1248 133 1263 153 M 1215 89 L 1167 94 Q 1117 94 1092 78 L 1083 69 1103 73 1211 85 1215 89 M 1031 48 L 1027 48 1000 42 985 38 Q 975 33 972 22 L 972 20 931 25 887 21 887 23 Q 887 33 871 33 L 868 33 855 29 851 23 Q 851 14 869 14 L 870 14 860 5 Q 853 -5 858 -16 858 -39 938 -40 L 981 -37 978 -36 Q 978 -26 994 -6 L 1005 6 994 12 993 13 1012 14 1017 20 1031 48 M 1015 -59 L 1007 -59 Q 989 -59 982 -68 L 978 -77 Q 978 -100 1008 -98 L 1026 -94 1021 -88 1015 -59 M 906 -184 L 941 -177 Q 990 -165 990 -155 990 -145 975 -134 951 -118 904 -118 854 -118 829 -134 814 -145 814 -156 L 819 -164 886 -181 906 -184 M -11 -168 Q -15 -163 -26 -163 L -42 -167 -43 -168 -11 -168 M -61 -168 L -76 -155 Q -98 -140 -127 -140 -160 -140 -174 -149 L -181 -159 Q -181 -171 -173 -178 L -118 -170 -61 -168 M -288 -158 L -290 -156 -296 -148 -296 -155 -294 -159 -288 -158 M -324 -126 L -295 -128 Q -247 -126 -247 -111 -247 -104 -274 -90 -290 -81 -300 -79 L -320 -106 -329 -124 -327 -125 -324 -126 M -291 -56 L -267 -70 Q -238 -85 -217 -89 -190 -96 -158 -78 L -130 -54 Q -130 -41 -145 -29 -167 -12 -207 -12 -251 -12 -279 -28 L -297 -43 -290 -46 -290 -55 -291 -56 M -368 188 L -345 193 Q -338 197 -338 203 L -338 204 -341 209 -365 224 Q -377 231 -386 234 L -404 234 -408 232 Q -390 225 -370 191 L -368 188 M -419 313 L -418 311 Q -415 301 -389 303 L -386 304 -375 306 Q -360 311 -360 326 L -362 331 -367 333 -371 333 -376 332 -378 331 -381 330 Q -386 330 -397 339 L -413 323 -419 313 M -371 360 L -367 358 -363 357 Q -354 356 -350 363 L -348 369 -348 375 -349 383 -353 381 -365 369 -371 360 M -350 385 L -353 387 -358 389 -366 389 -353 383 -350 385 M -361 401 L -352 402 -340 403 -338 404 -321 409 Q -308 416 -308 430 L -308 436 Q -313 456 -344 463 L -376 465 -389 465 -393 464 -415 457 -390 431 -361 401 M -432 435 L -432 431 Q -431 409 -399 404 L -412 415 -432 435 M -376 389 L -381 387 -386 381 -381 368 -358 381 -376 389 M -433 207 L -434 206 -435 203 -434 199 Q -431 191 -415 188 L -418 191 -433 207 M -397 171 L -411 168 Q -422 163 -423 151 L -422 149 Q -420 138 -399 134 L -385 134 -378 139 -377 139 -376 143 -375 148 -375 150 -377 153 -378 154 -378 155 -391 165 -397 171 M -322 -85 L -333 -95 Q -344 -106 -344 -111 L -338 -121 -338 -119 -333 -109 -322 -85 M -323 -147 Q -331 -153 -332 -163 -332 -176 -308 -180 -291 -183 -286 -174 L -301 -165 Q -307 -168 -323 -147 M 88 -255 L 63 -261 59 -267 Q 59 -275 84 -274 L 89 -273 88 -255 M 94 -285 L 93 -289 Q 93 -299 108 -296 L 114 -295 105 -291 94 -285 M 21 -264 L 22 -263 17 -262 Q -3 -262 -9 -272 L 9 -272 9 -298 11 -299 Q 35 -303 35 -285 L 29 -275 21 -264 M 183 -217 Q 183 -250 243 -240 302 -230 302 -213 302 -205 269 -197 L 234 -191 Q 203 -191 190 -202 183 -209 183 -217 M 6 -199 L -14 -214 -25 -230 Q -25 -248 24 -247 72 -245 72 -230 72 -223 45 -209 18 -194 6 -199 M 95 -119 Q 95 -130 112 -129 128 -127 128 -119 128 -107 109 -107 98 -107 95 -114 L 95 -119 M 131 -22 L 113 -22 89 -24 Q 102 -17 102 -3 L 102 3 132 3 Q 142 -11 171 -16 173 -23 183 -24 177 -27 170 -33 L 135 -23 131 -22 M 188 -47 Q 204 -53 204 -33 L 199 -23 203 -18 238 -15 272 -22 272 -23 Q 272 -41 293 -50 L 288 -55 286 -60 252 -54 244 -53 239 -53 227 -53 191 -56 188 -47 M 358 -201 Q 339 -201 339 -213 339 -221 356 -222 372 -223 372 -213 372 -201 358 -201 M 347 -176 L 344 -172 336 -161 337 -160 332 -159 329 -159 326 -156 346 -148 347 -151 363 -153 Q 381 -153 382 -142 L 380 -137 387 -127 387 -126 396 -126 Q 408 -124 408 -116 L 408 -113 425 -116 415 -123 411 -134 Q 411 -139 417 -141 396 -144 386 -151 361 -151 352 -163 L 347 -176 M 392 -104 Q 383 -108 383 -118 L 384 -121 360 -106 339 -96 Q 337 -84 317 -73 L 326 -59 326 -58 337 -60 336 -63 350 -76 357 -80 367 -86 387 -95 393 -104 392 -104 M 428 -226 Q 417 -226 414 -233 L 414 -238 Q 414 -249 431 -248 447 -246 447 -238 447 -226 428 -226 M 432 -28 L 427 -28 405 -29 405 -25 Q 405 -18 395 -9 L 383 1 383 2 405 -4 414 -3 414 -10 Q 414 -25 432 -28 M 476 -12 L 498 -19 Q 495 -25 495 -30 495 -51 531 -58 L 531 -62 531 -63 Q 531 -75 588 -79 L 591 -79 Q 568 -81 556 -88 L 549 -88 528 -89 529 -82 Q 529 -72 510 -60 L 498 -54 489 -45 Q 472 -32 446 -29 465 -28 465 -13 L 460 -1 Q 453 7 439 7 L 433 7 435 12 434 17 446 17 463 18 462 16 462 13 Q 462 -3 471 -10 L 476 -12 M 729 -135 Q 729 -146 746 -145 762 -143 762 -135 762 -123 743 -123 732 -123 729 -130 L 729 -135 M 807 -130 Q 826 -130 826 -120 L 816 -110 Q 804 -102 790 -102 768 -102 768 -120 768 -132 779 -133 L 807 -130 M 672 -74 Q 672 -87 701 -87 L 714 -94 758 -100 Q 825 -100 825 -74 825 -60 805 -50 L 769 -39 765 -38 747 -38 Q 715 -38 701 -48 L 699 -49 692 -58 Q 685 -60 680 -64 L 672 -74 M 772 -13 Q 844 -6 844 21 844 31 825 43 803 56 773 56 L 770 56 767 56 759 56 749 55 725 50 710 54 712 55 718 67 720 67 738 62 Q 759 61 759 71 L 758 74 773 77 784 74 810 74 810 73 Q 810 50 852 43 857 39 870 38 L 884 37 908 38 929 40 947 45 Q 978 54 978 77 978 92 956 104 L 950 107 Q 947 114 936 114 L 927 113 887 116 862 114 847 118 819 124 812 124 791 123 Q 776 120 768 113 L 765 109 754 110 Q 728 110 729 98 L 709 99 706 99 705 106 739 118 743 121 761 120 Q 807 122 817 137 L 851 133 854 133 881 134 Q 885 125 906 128 933 132 933 142 933 154 914 154 L 908 154 905 158 904 159 894 168 Q 876 183 851 183 813 183 801 169 L 771 176 742 174 722 181 Q 740 187 741 199 L 748 196 752 191 765 188 769 189 784 190 811 189 871 193 Q 881 178 922 173 L 922 172 923 170 924 167 925 164 941 162 Q 956 162 959 170 L 977 170 964 164 962 163 955 154 954 148 Q 954 133 964 125 L 969 122 Q 976 99 1021 98 L 1032 98 1031 92 Q 1031 80 1042 79 L 1070 82 Q 1089 82 1089 92 L 1079 102 1070 107 1075 119 1075 120 Q 1088 127 1088 138 1088 152 1068 162 L 1062 165 Q 1073 166 1074 173 L 1084 171 Q 1100 171 1100 181 L 1100 184 1107 194 1096 209 1092 213 Q 1107 221 1107 233 1107 243 1088 255 L 1081 259 Q 1078 266 1065 268 L 1061 266 1036 268 994 264 976 268 982 280 983 285 983 290 981 297 993 301 995 295 Q 1001 287 1018 286 L 1021 286 1038 290 1047 290 Q 1077 293 1077 306 L 1074 320 Q 1067 329 1046 329 1030 329 1023 322 L 1017 322 998 319 977 325 Q 966 325 961 317 L 961 316 944 319 922 319 917 319 908 318 870 310 863 307 864 314 857 330 857 332 851 346 841 354 840 354 Q 819 367 785 367 L 779 367 Q 744 366 724 357 L 719 357 710 357 701 355 698 349 698 348 699 346 700 343 701 340 705 339 704 335 Q 704 325 710 318 718 306 740 301 L 745 298 753 294 762 292 761 291 748 282 746 280 766 268 Q 777 264 781 273 L 782 282 781 288 781 289 797 288 851 296 850 293 850 292 851 285 854 279 846 283 829 286 Q 811 286 808 274 L 807 268 808 262 805 262 797 262 782 265 Q 772 265 769 259 L 766 259 Q 748 254 737 246 L 728 235 720 241 697 247 663 250 652 245 635 239 Q 624 234 624 227 L 628 219 629 219 625 217 621 215 617 215 612 214 610 213 607 212 603 214 599 216 597 217 590 221 589 222 588 222 549 232 546 232 543 232 535 232 525 231 516 229 516 230 512 236 498 239 Q 476 239 482 231 482 225 499 224 L 501 224 499 223 Q 492 218 492 213 492 196 509 188 513 183 525 182 L 528 181 554 179 605 184 639 178 634 176 618 168 604 158 600 152 599 149 Q 599 145 610 138 L 588 134 578 142 577 142 Q 556 155 522 155 L 516 155 Q 476 154 456 142 441 133 441 123 441 113 447 106 457 92 486 87 L 518 85 553 88 554 88 553 85 Q 553 69 590 68 595 59 608 53 L 638 46 Q 641 42 652 41 L 652 29 Q 652 -4 706 -5 L 718 -5 723 -10 772 -13 M 804 -28 Q 804 -40 821 -41 837 -41 837 -31 837 -18 819 -18 808 -18 805 -23 803 -25 804 -28 M 892 -77 L 888 -71 878 -69 867 -72 867 -75 Q 867 -83 880 -83 892 -83 892 -77 M 960 -75 Q 960 -63 938 -63 927 -63 922 -71 L 919 -79 Q 919 -94 940 -92 960 -89 960 -75 M 1042 -132 Q 1042 -123 1026 -120 1017 -124 1017 -134 1017 -145 1030 -142 1042 -140 1042 -132 M 1320 33 Q 1306 45 1284 45 1258 45 1249 33 L 1244 20 Q 1244 -10 1288 -3 1331 5 1331 18 L 1320 33 M 1280 78 Q 1280 67 1293 70 1305 72 1305 80 1305 89 1289 92 1280 88 1280 78 M 1326 393 L 1333 379 1337 386 1332 392 1326 393 M 1028 174 L 1010 174 999 174 Q 1017 179 1020 192 1022 179 1033 174 L 1028 174 M 1182 133 Q 1182 118 1203 120 1223 123 1223 137 1223 149 1201 149 1190 149 1185 141 L 1182 133 M 1143 129 Q 1155 129 1155 135 L 1151 141 1141 143 1130 140 1130 137 Q 1130 129 1143 129 M 992 77 Q 992 66 1009 67 1025 69 1025 77 1025 89 1006 89 995 89 992 82 L 992 77 M 871 265 L 882 261 868 254 864 255 850 258 Q 865 259 865 268 L 871 265 M 843 360 L 844 357 Q 844 352 850 349 L 860 347 Q 876 347 876 357 876 370 858 370 L 844 365 843 360 M 814 490 Q 807 498 793 498 763 498 768 481 768 475 771 471 777 463 794 462 L 797 462 Q 819 462 819 478 L 814 490 M 1206 274 L 1206 280 1204 285 1189 325 1150 328 Q 1107 328 1086 309 1073 297 1073 285 1073 253 1157 252 L 1217 260 1206 274 M 1062 435 L 1056 435 1056 433 1068 432 1062 435 M 1058 486 Q 1052 489 1045 493 L 1038 498 1038 497 1040 488 1058 486 M 1094 489 L 1082 495 1082 494 1091 488 1094 489 M 1170 451 L 1190 442 Q 1179 447 1171 451 L 1170 451 M 1139 432 L 1152 427 1139 432 M 1173 387 L 1171 395 1137 401 Q 1147 392 1173 387 M 1048 612 L 1028 624 1049 612 1048 612 M 866 563 L 864 558 Q 864 552 887 548 909 544 909 553 L 902 562 878 564 866 563 M 416 693 L 402 695 380 690 383 686 376 680 Q 378 669 400 670 L 404 677 405 691 416 693 M 412 672 Q 421 674 425 679 L 415 680 412 672 M 481 690 L 477 686 467 667 Q 467 640 544 634 621 629 621 662 L 621 665 599 678 520 702 515 704 515 702 514 701 481 690 M 656 644 L 654 645 647 649 632 637 Q 632 632 653 629 667 628 672 633 L 656 644 M 695 616 L 677 611 664 605 663 605 661 606 Q 641 622 599 622 573 622 567 609 L 567 596 567 593 Q 546 590 546 580 546 570 575 569 L 584 569 621 562 662 567 690 565 708 564 763 570 Q 742 583 713 603 L 695 616 M 777 561 L 761 556 756 554 Q 741 548 741 539 741 530 746 523 758 507 800 508 858 510 858 534 L 845 553 817 550 Q 809 550 797 558 L 797 557 792 552 777 561 M 826 603 L 821 597 837 594 826 603 M 832 619 L 860 599 865 606 837 619 832 619 M 621 240 L 625 239 Q 634 238 638 245 L 640 251 640 253 661 260 668 270 668 268 Q 668 251 698 247 728 244 728 260 L 725 273 726 278 726 283 Q 723 290 712 290 L 703 289 694 282 682 281 671 278 670 277 668 270 657 285 654 288 667 291 Q 680 298 680 312 L 680 318 684 327 684 330 681 334 680 335 670 344 Q 652 359 627 359 589 359 577 345 L 573 339 571 338 567 335 555 340 537 344 525 345 518 350 498 357 485 359 471 360 466 360 444 359 416 354 415 355 407 359 390 362 Q 372 362 369 350 L 368 344 369 338 Q 371 333 378 331 L 376 328 375 325 Q 375 321 386 314 L 389 312 Q 391 309 396 308 L 406 302 426 293 433 291 439 287 Q 464 276 488 275 L 485 275 482 275 464 272 454 265 450 254 Q 450 249 456 247 L 485 242 494 243 496 243 507 244 Q 519 246 519 254 L 516 268 506 273 505 274 491 275 491 277 541 287 543 288 541 285 538 280 537 274 538 267 Q 540 258 549 253 L 560 250 586 250 593 251 594 250 608 248 610 246 621 240 M 420 117 Q 441 121 441 135 L 439 144 Q 467 150 471 174 L 471 183 468 196 Q 477 198 477 202 L 469 210 461 213 454 212 434 217 438 217 Q 462 218 462 227 L 456 234 449 236 417 230 413 224 414 222 Q 417 218 428 217 L 410 215 395 210 389 208 387 211 387 214 Q 387 228 375 240 L 370 244 378 244 419 251 426 261 426 262 423 267 399 282 378 292 363 293 340 294 337 294 322 290 Q 312 285 309 274 L 309 272 313 267 326 264 330 265 331 265 330 264 329 261 330 257 312 258 310 262 Q 303 271 282 271 266 271 259 264 L 257 262 253 253 254 247 243 238 233 219 Q 233 192 310 186 L 343 186 330 174 334 163 333 161 333 150 332 151 329 154 328 155 Q 316 163 298 163 295 170 280 170 L 260 168 265 175 Q 265 185 250 196 L 242 201 230 206 212 210 200 211 179 212 118 203 104 196 94 186 88 184 Q 68 177 68 167 68 134 127 136 L 165 141 166 141 166 142 173 145 216 153 218 154 249 163 245 155 Q 245 145 257 144 L 256 138 256 134 257 132 253 132 Q 210 132 189 113 176 101 176 89 176 57 260 56 317 55 335 73 L 343 72 355 71 373 72 385 73 387 74 Q 426 78 426 98 L 420 117 M 483 395 L 478 395 472 395 474 400 473 405 472 407 471 408 464 412 436 415 429 415 408 413 405 414 404 415 414 421 415 424 421 423 Q 437 423 437 433 437 446 419 446 L 411 445 406 447 397 447 383 445 378 439 Q 378 430 384 424 L 385 423 369 425 370 426 365 426 347 426 336 426 314 422 301 416 299 415 292 406 291 400 Q 291 386 300 378 L 274 372 270 369 267 366 264 365 Q 256 363 255 358 L 254 354 Q 254 346 271 345 L 284 347 293 346 311 348 Q 319 349 323 353 L 325 359 323 368 342 365 350 364 375 361 378 362 389 364 395 367 412 372 424 383 425 389 444 384 453 385 467 390 467 389 Q 467 381 480 381 492 381 492 387 L 488 393 483 395 M 390 27 L 368 24 362 27 Q 371 26 375 33 L 384 32 392 32 397 27 390 27 M 345 36 L 347 34 342 35 345 36 M 229 243 L 235 255 234 261 216 267 221 269 224 273 224 275 Q 224 285 208 285 L 205 285 192 281 188 275 Q 188 266 206 266 L 197 259 197 258 194 251 Q 194 236 215 238 L 217 239 229 243 M 183 136 Q 161 136 167 128 167 122 184 121 201 118 201 127 L 197 133 183 136 M 141 234 Q 141 221 167 222 192 224 192 236 L 185 244 168 247 Q 151 247 144 240 L 141 234 M 10 312 L -22 306 -26 300 -25 298 Q -22 294 -11 293 L -9 293 -7 293 -1 293 Q 23 294 23 303 L 17 310 10 312 M 100 373 L 89 379 96 384 Q 105 377 123 374 L 109 368 100 373 M 329 329 Q 329 318 346 319 362 321 362 329 L 358 338 343 341 Q 333 341 330 335 L 329 334 329 329 M 361 584 Q 419 586 419 610 407 640 371 640 L 322 632 317 630 Q 302 624 302 615 302 606 307 599 319 583 361 584 M 268 619 L 257 624 220 622 Q 214 621 214 613 L 216 608 Q 219 605 225 604 L 268 619 M 71 635 L 71 638 71 647 68 661 61 662 17 671 14 667 19 664 36 652 Q 38 650 54 642 62 637 71 635 M -65 702 L -67 695 -65 689 -60 688 -55 690 -47 701 -51 701 -65 702 M 7 659 L -2 650 4 642 1 639 -3 639 -7 644 -7 645 -42 615 -19 610 1 607 39 608 Q 60 613 68 628 L 43 629 Q 36 631 34 642 L 7 659 M 231 602 L 242 601 253 602 257 602 Q 266 604 269 610 L 269 612 256 610 231 602 M 328 659 L 324 658 324 657 328 659 M 314 649 L 295 648 293 647 287 640 309 642 314 649 M 234 669 L 249 665 250 666 254 669 234 669 M 330 689 L 312 682 317 681 334 685 330 689 M 163 652 L 162 652 107 657 107 656 Q 107 646 136 645 158 644 163 652 M 708 539 Q 708 548 696 548 L 659 546 Q 653 545 653 537 L 655 532 665 527 681 525 692 526 696 526 Q 705 528 708 534 L 708 538 708 539 M 462 638 L 443 644 Q 425 644 425 634 425 628 448 624 470 620 470 629 L 462 638 M -260 -148 Q -260 -156 -235 -155 -211 -154 -211 -145 -211 -140 -217 -138 L -224 -136 Q -248 -136 -256 -142 L -260 -148 M -212 -159 Q -226 -159 -226 -170 -226 -180 -211 -177 -196 -175 -196 -170 -196 -165 -204 -162 L -212 -159 M -223 -118 Q -223 -130 -188 -130 -154 -131 -154 -118 -154 -107 -157 -104 -164 -97 -188 -97 -210 -97 -219 -107 L -223 -118 M -136 -98 Q -136 -131 -76 -121 -17 -111 -17 -94 -17 -86 -50 -78 L -85 -72 Q -116 -72 -129 -83 L -136 -98 M -46 -13 Q -103 -13 -103 -47 -103 -59 -46 -63 11 -66 11 -45 11 -39 -3 -28 -21 -13 -46 -13 M -116 101 Q -40 101 -40 136 -40 148 -57 158 L -57 159 -41 163 -36 168 -35 172 -36 177 -44 183 -67 189 -101 192 -112 187 -129 181 -140 170 -171 162 -174 163 -176 164 -180 166 Q -165 175 -163 194 L -159 195 -125 204 Q -121 198 -98 197 -70 196 -70 209 -70 215 -73 217 L -94 221 -108 220 -115 228 -126 232 -141 236 -169 242 -176 242 -197 241 -202 240 -219 232 -263 217 -279 217 -282 217 -300 214 -310 207 -314 196 Q -314 191 -308 189 L -303 187 Q -301 171 -266 164 L -272 155 -271 151 -285 151 -292 151 -295 152 -303 155 -310 154 -317 147 -334 135 -341 117 Q -341 87 -279 87 -217 87 -217 116 L -217 121 -210 121 -187 121 Q -172 101 -116 101 M -169 64 Q -169 86 -193 86 L -226 82 -229 72 Q -229 55 -199 51 -169 48 -169 64 M -115 86 Q -115 97 -126 97 L -151 84 Q -115 56 -115 86 M -118 246 L -120 251 -107 252 -103 252 Q -90 254 -84 260 L -80 269 -80 270 -74 268 Q -54 265 -51 277 L -50 280 -47 280 Q -32 280 -29 288 L -28 291 Q -28 298 -40 299 L -45 299 -54 299 -60 298 -64 303 -63 304 -68 305 -71 305 -86 302 -97 289 Q -114 301 -137 301 -175 301 -187 287 L -191 281 -194 272 -194 268 -194 267 Q -194 259 -171 255 L -152 252 -152 247 Q -152 241 -135 240 -118 237 -118 246 M -54 211 Q -43 210 -39 215 L -38 220 -38 225 Q -41 232 -52 232 L -61 231 -70 224 -71 220 Q -71 212 -54 211 M -244 43 Q -271 43 -271 33 -271 29 -257 21 L -229 12 Q -212 12 -204 19 L -199 28 Q -199 36 -209 40 L -244 43 M -290 16 Q -295 16 -308 26 -319 26 -328 0 -328 -13 -298 -11 -269 -9 -269 12 -269 19 -280 19 L -285 18 Q -286 16 -290 16 M -257 61 L -259 70 -276 75 Q -295 75 -295 67 -295 50 -276 44 -257 38 -257 61 M -351 166 L -350 164 Q -347 160 -336 159 L -334 159 -332 159 -326 159 Q -302 160 -302 169 L -308 176 -315 178 -347 172 -351 166 M -308 225 L -283 224 Q -267 226 -249 236 L -245 239 Q -221 254 -221 260 -221 268 -227 276 L -236 285 -246 292 -266 299 -279 301 -293 302 -298 302 -320 301 -349 296 -354 294 -370 286 -384 276 -388 270 -389 267 -378 256 -375 254 Q -373 251 -368 250 L -358 244 -338 235 -308 225 M -292 337 L -290 342 -291 347 -292 349 -293 350 -300 354 -328 357 -335 357 -357 354 -361 349 -362 347 -357 341 -354 339 -348 335 -342 332 Q -330 326 -320 326 L -311 327 -295 333 -292 337 M -318 395 L -320 386 Q -320 369 -290 365 -260 362 -260 378 -260 400 -284 400 L -306 399 -317 396 -318 395 M -394 498 L -391 493 -390 492 Q -379 481 -344 476 L -324 473 -286 474 Q -258 480 -254 504 L -254 513 Q -254 522 -260 532 L -264 537 -271 542 -325 542 -330 540 -339 537 -341 537 -341 533 -327 533 -280 537 -274 536 -280 533 -338 528 Q -345 528 -345 534 L -345 535 -358 529 -363 527 -380 511 -394 498 M -380 517 L -382 516 -395 504 -395 503 -380 517 M -206 400 L -207 406 -211 410 -217 411 -227 409 -240 400 -242 398 Q -230 389 -222 386 -211 382 -207 391 L -206 400 M -207 415 L -172 418 -169 419 Q -131 425 -131 450 -131 457 -137 464 L -147 472 -148 472 Q -169 485 -203 485 L -209 485 Q -249 484 -269 472 -284 463 -284 453 L -278 436 Q -268 422 -239 417 L -207 415 M -109 474 L -99 469 -85 467 -94 448 -93 445 Q -90 435 -64 437 L -61 438 -50 440 Q -35 445 -35 460 L -37 465 -42 467 -46 467 -51 466 -53 465 -56 464 -66 469 -56 476 -56 480 -56 481 Q -56 490 -68 490 L -105 488 -111 479 -109 474 M -164 531 L -185 535 Q -218 535 -218 522 -218 512 -189 511 -161 510 -161 523 L -164 531 M -70 638 L -65 642 -54 652 -57 650 -70 638";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1965(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1964",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape430(ctx,ctrans,frame,ratio,time){
	var pathData="M 204 -258 L 200 -255 Q 186 -246 167 -244 L 153 -243 Q 125 -243 107 -253 L 96 -261 Q 86 -270 84 -279 L 87 -291 Q 91 -303 107 -308 L 152 -314 170 -313 188 -311 Q 209 -306 216 -294 L 219 -281 218 -274 204 -258 M 287 -279 L 300 -280 302 -285 303 -287 Q 307 -293 317 -296 L 347 -303 349 -303 389 -300 393 -291 375 -271 Q 355 -255 341 -255 L 339 -255 339 -254 337 -242 352 -243 369 -243 378 -243 377 -244 375 -246 Q 375 -252 378 -256 384 -268 409 -270 L 415 -271 417 -271 Q 411 -276 411 -283 L 412 -288 429 -297 436 -296 Q 460 -291 460 -277 460 -267 450 -265 L 454 -256 453 -248 448 -239 436 -227 442 -217 474 -220 492 -219 510 -217 521 -214 Q 546 -227 591 -227 643 -227 669 -215 L 678 -210 681 -210 673 -216 672 -217 660 -231 661 -234 662 -237 Q 667 -248 692 -251 L 704 -252 739 -245 748 -231 748 -227 737 -215 722 -207 712 -205 715 -197 715 -195 Q 720 -200 731 -202 L 737 -204 756 -202 758 -202 Q 782 -197 782 -183 782 -173 772 -171 L 776 -162 775 -154 770 -145 758 -133 764 -120 768 -111 Q 768 -104 758 -96 L 758 -94 Q 758 -84 748 -80 L 737 -78 Q 728 -70 718 -66 L 733 -64 736 -63 793 -44 Q 807 -37 811 -28 L 822 -30 884 -34 898 -35 Q 913 -30 916 -24 L 917 -14 Q 917 17 853 17 L 822 13 806 4 802 0 794 6 Q 776 18 744 22 L 731 23 Q 737 26 739 34 L 744 31 Q 759 22 795 18 L 822 17 Q 852 18 856 35 872 23 890 24 949 22 990 47 L 1014 66 Q 1022 57 1041 51 L 1095 43 1112 43 Q 1176 42 1184 69 L 1185 76 1185 77 Q 1185 93 1164 107 L 1160 109 Q 1133 123 1098 123 L 1082 123 1057 121 1061 131 1113 125 Q 1165 125 1191 137 L 1205 146 1208 149 Q 1215 159 1215 179 L 1214 189 1203 207 1193 215 1189 217 1142 225 1087 220 1073 217 1056 212 Q 1009 198 1009 179 L 1011 170 1016 160 1014 160 965 158 960 155 958 158 958 162 958 164 Q 958 174 948 178 L 937 180 918 192 933 194 936 195 Q 976 205 993 214 1007 221 1011 230 L 1022 228 1084 224 1098 223 1116 234 1117 244 Q 1117 273 1061 275 L 1070 279 1076 284 1090 282 Q 1149 280 1190 305 1221 325 1221 340 L 1221 342 Q 1218 357 1181 371 L 1105 384 Q 1048 384 1027 365 L 1023 361 1012 379 1002 387 998 389 951 397 914 395 911 397 925 406 926 416 Q 926 447 862 447 L 831 443 815 434 811 430 803 436 784 445 784 451 804 448 831 447 Q 861 448 865 465 881 453 899 454 958 452 999 477 1030 497 1030 512 L 1030 514 Q 1027 529 990 543 L 914 556 Q 857 556 836 537 826 527 826 514 L 829 504 808 506 Q 771 506 754 493 L 744 483 742 475 748 464 749 464 746 462 737 455 736 453 719 453 715 453 715 459 714 469 703 487 693 495 688 498 737 503 742 503 774 506 Q 790 510 790 521 L 780 536 Q 766 548 741 550 L 736 555 732 559 Q 714 576 685 582 L 690 585 Q 721 605 721 620 721 636 681 651 644 664 605 664 548 664 527 645 517 635 517 622 L 520 612 499 614 Q 462 614 445 601 433 593 433 583 433 566 477 559 L 481 557 493 554 522 551 506 542 502 538 494 544 Q 468 561 410 561 363 561 344 544 L 338 538 Q 331 528 331 506 331 487 366 478 L 356 477 317 464 308 459 Q 283 444 283 434 L 287 418 274 411 270 407 267 410 Q 252 423 226 424 L 241 427 261 434 Q 264 443 280 451 L 285 471 284 479 271 493 Q 250 507 207 507 L 202 507 Q 192 516 168 525 L 167 526 Q 182 528 189 535 L 197 532 Q 248 516 248 545 L 248 546 Q 271 547 271 563 L 264 576 Q 255 587 239 587 L 215 583 Q 226 592 226 605 226 621 217 628 201 639 153 639 116 639 95 620 82 607 82 598 82 565 149 568 L 146 565 136 557 130 543 132 535 92 538 Q 35 538 14 519 4 509 4 496 L 7 486 -14 488 Q -51 488 -68 475 -80 467 -80 457 -80 437 -18 430 37 424 43 447 56 437 72 436 L 70 434 67 428 40 429 Q 9 429 -7 416 L -11 412 -19 418 Q -45 435 -103 435 -150 435 -169 418 L -175 412 Q -182 402 -182 380 -182 361 -147 352 L -157 351 -196 338 -215 332 -233 325 Q -228 333 -228 345 L -229 353 -242 367 Q -263 381 -306 381 -352 381 -373 362 -386 352 -386 341 L -384 327 -398 327 Q -431 327 -443 308 L -449 288 Q -449 275 -407 275 L -422 265 -435 243 Q -435 221 -404 215 -400 203 -384 198 L -387 188 Q -387 166 -354 170 -323 175 -321 193 L -303 195 -285 192 Q -246 187 -246 208 -246 214 -253 221 -261 230 -273 232 L -287 248 -291 251 Q -291 266 -300 273 -316 284 -364 284 L -366 284 Q -358 290 -356 301 L -307 296 -272 301 -252 308 -253 303 Q -253 291 -243 281 L -257 260 Q -257 233 -204 227 L -191 226 -189 221 -202 223 Q -221 223 -231 205 L -238 187 Q -238 175 -230 179 L -216 186 -210 184 -226 170 Q -226 161 -186 151 -186 132 -151 123 L -161 122 -209 126 -233 124 -246 138 Q -267 152 -310 152 -356 152 -377 133 -390 123 -390 112 L -388 98 -402 98 Q -435 98 -447 79 L -453 59 Q -453 45 -406 46 -364 47 -360 72 L -311 67 -276 72 Q -268 59 -243 56 -254 47 -261 31 -261 4 -208 -2 L -195 -3 -192 -10 Q -211 -15 -222 -25 -235 -35 -235 -46 L -233 -60 -247 -60 Q -280 -60 -292 -79 L -298 -99 Q -298 -113 -251 -112 -209 -111 -205 -86 L -156 -91 Q -77 -87 -77 -42 -77 -31 -91 -20 L -102 -14 -120 6 Q -140 22 -154 22 L -156 22 -156 23 -158 35 -143 34 -126 34 -118 33 -120 31 Q -120 8 -80 6 L -78 6 -84 -6 Q -84 -24 -59 -19 -35 -14 -35 0 -35 10 -45 12 L -41 21 -37 21 Q -24 21 -19 33 L -16 45 -24 56 Q -34 65 -47 65 L -53 65 Q -53 73 -59 83 L -59 89 Q -59 99 -69 103 L -80 105 -99 117 -84 119 Q -63 102 -9 95 L -6 95 10 73 Q 38 50 96 50 L 118 45 123 42 81 48 65 48 48 48 Q -7 48 -24 25 -31 15 -31 -7 -31 -26 4 -35 -29 -38 -54 -54 -79 -69 -79 -79 L -75 -95 Q -96 -103 -106 -127 -106 -154 -53 -160 L -40 -161 Q -38 -179 7 -184 53 -190 53 -172 L 35 -152 Q 15 -136 1 -136 L -1 -136 -1 -135 -3 -123 12 -124 38 -124 35 -127 Q 35 -150 75 -152 L 77 -152 Q 71 -157 71 -164 71 -182 96 -177 L 106 -174 107 -179 93 -179 Q 62 -179 50 -196 L 48 -198 45 -204 42 -218 Q 42 -231 82 -231 L 84 -231 89 -231 Q 113 -230 125 -222 L 135 -205 178 -210 184 -210 204 -208 219 -205 239 -198 244 -190 264 -190 261 -198 265 -214 252 -221 248 -225 234 -246 235 -253 Q 241 -274 287 -279 M 114 -137 L 108 -120 96 -108 102 -94 96 -75 96 -69 95 -63 127 -64 132 -64 134 -64 124 -67 114 -75 108 -89 110 -97 Q 115 -110 141 -107 L 145 -106 Q 160 -104 167 -97 L 173 -90 Q 200 -108 251 -108 L 312 -102 Q 309 -111 309 -126 L 310 -132 298 -124 Q 271 -110 236 -110 190 -110 165 -121 L 153 -128 Q 131 -132 118 -144 L 114 -147 110 -146 114 -137 M 56 -41 L 61 -41 62 -43 56 -41 M 337 -195 L 336 -199 330 -198 329 -197 337 -195 M 320 -144 L 344 -154 334 -155 323 -157 323 -156 320 -144 M 203 -18 L 200 -9 236 -10 Q 251 -5 254 1 L 254 2 270 -8 203 -18 M 353 -54 Q 353 -38 341 -26 L 340 -25 Q 413 -34 419 -5 428 0 428 8 L 418 23 405 31 401 35 401 36 Q 407 32 417 31 L 449 30 454 30 456 30 446 27 436 19 430 5 432 -3 Q 437 -16 463 -13 L 467 -12 Q 482 -10 489 -3 L 495 4 496 12 490 24 Q 484 31 474 32 L 485 34 499 38 496 34 493 28 Q 493 19 507 14 L 505 13 Q 495 3 495 -10 L 498 -20 477 -18 Q 440 -18 423 -31 411 -39 411 -49 L 399 -48 Q 381 -48 375 -58 L 371 -69 372 -71 350 -74 353 -54 M 663 -276 L 663 -275 Q 663 -259 642 -245 L 638 -243 Q 611 -229 576 -229 L 560 -229 Q 525 -231 505 -240 L 493 -246 491 -248 Q 483 -256 483 -265 483 -290 519 -301 L 573 -309 590 -309 Q 654 -310 662 -283 L 663 -276 M 598 -277 L 598 -278 571 -277 564 -274 571 -272 595 -274 598 -277 M 572 -129 L 570 -131 565 -132 551 -135 534 -140 503 -152 489 -150 475 -149 Q 447 -149 429 -159 L 418 -167 414 -171 Q 405 -164 396 -160 L 411 -158 414 -157 471 -138 489 -122 500 -124 562 -128 572 -129 M 422 -72 L 422 -69 422 -63 428 -66 427 -71 427 -73 422 -72 M 585 -70 Q 622 -69 652 -55 L 666 -60 656 -61 645 -63 Q 630 -67 617 -74 L 608 -79 590 -92 581 -85 585 -70 M 711 -189 L 697 -177 693 -174 693 -173 692 -163 685 -149 691 -149 700 -149 699 -150 697 -152 700 -162 Q 704 -170 718 -174 L 715 -177 711 -188 711 -189 M 651 -103 L 659 -101 658 -105 652 -104 651 -103 M 920 -183 L 920 -184 893 -183 886 -180 893 -178 917 -180 920 -183 M 983 -140 L 984 -143 Q 989 -154 1014 -157 L 1026 -158 1061 -151 Q 1070 -146 1070 -137 L 1070 -133 1059 -121 1044 -113 1015 -110 1012 -110 995 -122 994 -123 982 -137 983 -140 M 964 -151 L 960 -149 Q 933 -135 898 -135 L 882 -135 Q 847 -137 827 -146 L 815 -152 813 -154 Q 805 -162 805 -171 805 -196 841 -207 L 895 -215 912 -215 Q 976 -216 984 -189 L 985 -182 985 -181 Q 985 -165 964 -151 M 827 -110 L 834 -115 Q 861 -133 913 -133 965 -133 991 -121 L 1005 -112 1008 -109 Q 1015 -99 1015 -79 L 1014 -69 1003 -51 993 -43 989 -41 942 -33 887 -38 873 -41 856 -46 Q 809 -60 809 -79 L 811 -88 Q 814 -99 827 -110 M 1082 -81 Q 1078 -73 1061 -73 L 1046 -76 1037 -83 1033 -94 Q 1033 -104 1053 -108 L 1059 -110 Q 1084 -115 1084 -94 L 1082 -81 M 1042 -35 L 1074 -32 Q 1090 -28 1090 -17 L 1080 -2 Q 1064 12 1034 12 1010 12 1000 4 994 -1 994 -6 994 -29 1028 -34 L 1042 -35 M 1261 107 Q 1270 112 1270 121 L 1270 125 1259 137 1244 145 1215 148 1212 148 1195 136 1194 135 1182 121 1183 118 1184 115 Q 1189 104 1214 101 L 1226 100 Q 1250 100 1261 107 M 1282 177 Q 1278 185 1261 185 L 1246 182 Q 1240 180 1237 175 L 1233 164 Q 1233 154 1253 150 L 1259 148 Q 1284 143 1284 164 L 1282 177 M 1242 223 L 1274 226 Q 1290 230 1290 241 L 1280 256 Q 1264 270 1234 270 1210 270 1200 262 L 1194 252 Q 1194 229 1228 224 L 1242 223 M 1120 74 L 1093 75 1086 78 1093 80 1117 78 1120 75 1120 74 M 1027 112 L 1015 106 1013 104 1009 99 Q 999 106 981 113 L 967 118 958 125 964 138 964 140 Q 976 131 1010 120 L 1034 115 1027 112 M 859 157 L 858 153 852 154 851 155 859 157 M 845 195 L 817 184 808 179 790 166 786 162 783 154 787 138 774 131 772 129 770 127 756 106 757 99 Q 762 82 792 76 760 75 745 63 L 737 56 738 58 741 71 740 78 738 82 741 89 741 94 Q 741 111 727 125 L 723 129 705 142 706 142 726 144 741 147 761 154 766 162 780 171 781 173 785 188 785 191 784 199 771 213 Q 754 224 722 227 L 724 233 724 235 720 241 706 253 702 256 695 261 695 262 696 270 691 281 694 281 Q 697 276 707 272 L 709 268 Q 713 260 727 256 L 740 254 746 253 748 253 Q 742 248 742 241 L 743 236 Q 748 231 760 227 L 765 228 767 228 Q 791 233 791 247 L 789 255 801 261 807 259 810 257 814 256 Q 815 246 823 238 826 234 831 232 L 831 226 832 220 842 208 852 203 866 198 856 197 845 195 M 935 297 L 939 292 907 295 891 295 866 293 Q 860 285 843 287 L 842 286 838 289 Q 828 298 815 298 802 298 794 290 L 786 280 784 276 779 285 776 290 Q 772 294 767 297 L 773 310 773 312 769 327 767 330 767 334 767 336 Q 767 346 757 350 L 746 352 727 364 742 366 745 367 765 372 Q 767 362 776 354 L 792 344 Q 805 337 825 333 L 825 332 836 320 843 315 Q 854 307 870 303 L 922 297 935 297 M 1002 258 L 994 264 985 269 973 279 972 280 995 276 1013 275 1023 273 1027 273 1022 271 1006 262 1002 258 M 1003 424 Q 1003 401 1037 396 L 1051 395 1083 398 Q 1099 402 1099 413 L 1089 428 Q 1073 442 1043 442 1019 442 1009 434 L 1003 424 M 1158 406 Q 1158 395 1210 378 1261 362 1261 391 1261 418 1214 418 L 1165 416 Q 1158 413 1158 406 M 1023 590 L 974 588 Q 967 585 967 578 967 567 1019 550 1070 534 1070 563 1070 590 1023 590 M 694 23 L 672 20 664 18 659 19 645 24 638 31 Q 628 40 615 40 602 40 594 32 L 583 32 569 32 564 38 Q 555 49 539 49 L 515 45 Q 526 54 526 67 L 525 76 522 85 517 90 Q 501 101 453 101 416 101 395 82 382 69 382 60 L 383 53 384 51 387 46 Q 361 61 318 61 L 312 64 328 72 Q 359 92 359 107 359 123 319 138 L 257 151 Q 273 155 273 166 L 263 181 Q 247 195 217 195 193 195 183 187 177 182 177 177 177 154 211 149 L 176 140 125 150 70 145 67 149 81 148 99 159 100 169 Q 100 192 65 198 L 82 197 99 197 Q 163 196 171 223 L 172 230 173 230 201 255 213 254 248 261 Q 257 266 257 275 L 257 279 246 291 231 299 Q 237 300 240 304 L 246 302 Q 271 297 271 318 L 269 331 Q 265 339 248 339 L 238 338 241 351 240 358 226 374 222 377 229 377 257 379 Q 263 358 309 353 L 322 352 324 347 325 345 Q 329 339 339 336 350 331 369 329 L 371 329 381 328 379 326 376 320 Q 373 313 373 306 L 376 300 Q 384 293 413 293 L 415 293 420 293 Q 444 294 456 302 L 466 319 509 314 514 314 515 314 535 316 550 319 568 325 583 324 582 318 583 311 584 309 586 305 583 303 581 301 579 299 565 278 566 271 Q 571 254 601 248 L 618 245 631 244 633 239 634 237 Q 638 231 648 228 L 668 223 Q 651 218 640 208 L 636 205 Q 629 198 628 192 L 627 187 627 185 628 178 629 173 615 173 Q 584 173 572 156 L 570 154 567 148 564 134 567 128 564 120 Q 564 106 576 96 L 592 86 Q 599 82 609 79 L 606 73 Q 606 66 609 61 613 49 629 44 L 642 41 654 39 Q 667 33 688 26 L 699 23 694 23 M 465 73 L 469 70 462 70 462 72 465 73 M 472 127 L 484 124 Q 531 113 531 137 L 519 153 Q 504 164 483 164 446 164 436 145 L 440 139 445 136 461 130 472 127 M 451 213 L 463 211 483 210 501 211 519 213 530 216 544 225 547 230 550 243 549 250 547 254 535 266 531 269 512 278 498 280 484 281 Q 456 281 438 271 L 427 263 423 259 418 251 415 245 Q 415 238 418 233 422 221 438 216 L 451 213 M 594 360 L 617 358 620 355 619 354 593 355 594 360 M 436 358 L 433 349 434 345 424 345 414 345 397 361 Q 377 377 363 377 L 361 377 361 378 359 390 374 389 391 389 400 389 399 388 397 386 Q 397 380 400 376 406 364 431 362 L 436 361 436 359 436 358 M 470 393 L 458 405 464 417 472 417 476 418 Q 491 420 498 427 L 504 434 505 442 499 454 Q 493 461 483 462 L 494 464 508 468 505 464 502 458 Q 502 450 513 446 517 437 527 428 L 534 423 Q 561 405 613 405 L 638 406 636 403 640 397 598 403 582 403 543 398 516 399 511 399 484 396 471 393 470 393 M 453 456 L 448 458 441 460 458 460 463 460 465 460 455 457 453 456 M 531 483 L 535 497 534 506 534 507 584 504 598 503 614 511 634 505 587 500 556 492 531 483 M 668 329 L 668 328 664 328 668 329 M 253 46 L 253 50 271 52 Q 259 47 253 42 L 253 46 M 296 173 Q 296 162 348 145 399 129 399 158 399 185 352 185 L 303 183 Q 296 180 296 173 M 143 34 L 139 36 150 33 147 32 143 34 M 53 200 L 36 200 Q 5 200 -11 187 L -15 183 -23 189 Q -48 205 -102 206 L -98 215 Q -98 221 -116 235 -136 251 -150 251 L -152 251 -152 252 -113 250 Q -107 238 -82 236 L -84 228 -79 218 -62 209 -22 201 28 205 53 200 M 182 290 L 181 289 178 291 192 300 195 303 199 302 182 290 M 10 290 Q 0 280 0 267 L 2 260 0 258 -18 259 -38 258 -43 267 -55 279 Q -49 285 -49 293 L -49 294 Q -49 302 -55 312 L -55 318 Q -55 328 -65 332 L -76 334 -95 346 -80 348 -77 349 Q -37 359 -20 368 -6 375 -2 384 L 71 378 85 377 Q 100 382 103 388 L 104 398 104 401 106 401 111 401 Q 135 402 147 410 L 157 427 200 422 187 416 Q 181 411 181 406 181 395 189 388 L 175 389 129 379 74 374 43 366 Q -4 352 -4 333 L -2 324 Q 1 313 14 302 L 21 297 10 290 M 351 435 L 359 437 358 433 352 434 351 435 M 310 537 L 325 534 Q 337 534 342 544 L 343 546 346 558 338 569 Q 328 578 315 578 296 578 286 560 L 279 542 Q 279 530 287 534 L 301 541 307 539 310 537 M 219 691 Q 204 702 183 702 146 702 136 683 136 673 184 662 231 651 231 675 L 219 691 M 264 658 Q 264 620 353 608 441 595 441 632 441 651 423 667 396 693 340 693 340 700 302 687 264 674 264 658 M 162 608 L 162 610 165 611 169 608 162 608 M 185 572 L 199 576 196 572 185 572 M 658 686 Q 658 675 710 658 761 642 761 671 761 698 714 698 L 665 696 Q 658 693 658 686 M 533 554 L 537 557 Q 553 561 556 573 567 564 580 563 L 574 554 553 555 533 554 M -256 -160 Q -256 -196 -188 -195 -121 -195 -121 -162 -121 -151 -136 -139 -156 -124 -187 -124 -225 -124 -244 -142 L -256 -160 M -276 -4 Q -276 7 -291 19 -311 34 -342 34 -380 34 -399 16 -409 7 -411 -2 -411 -38 -343 -37 -276 -37 -276 -4 M -10 -79 L -11 -78 -3 -76 -4 -80 -10 -79 M -174 210 L -144 203 -142 203 Q -163 199 -173 189 L -175 189 -174 191 -171 203 -174 210 M -317 424 L -323 436 Q -329 443 -339 444 L -314 450 -320 440 Q -320 425 -281 421 -242 416 -242 437 -242 443 -249 450 -258 461 -274 461 L -298 457 Q -287 466 -287 479 -287 495 -296 502 -312 513 -360 513 -397 513 -418 494 -431 481 -431 472 -431 438 -359 442 L -357 442 Q -370 439 -377 431 L -383 417 Q -383 395 -350 399 -317 404 -317 424 M -344 482 L -351 482 -351 484 -348 485 -344 482 M -203 411 L -188 408 Q -176 408 -171 418 L -170 420 -167 432 -175 443 Q -185 452 -198 452 -217 452 -227 434 L -234 416 Q -234 404 -226 408 L -212 415 -206 413 -203 411 M -173 567 Q -173 574 -211 561 -249 548 -249 532 -249 494 -160 482 -72 469 -72 506 -72 525 -90 541 -117 567 -173 567 M -282 549 Q -282 556 -294 565 -309 576 -330 576 -367 576 -377 557 -377 547 -329 536 -282 525 -282 549";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 270 -264 Q 270 -278 306 -278 375 -278 375 -261 375 -254 366 -250 L 309 -241 281 -252 Q 270 -257 270 -264 M 291 -301 Q 309 -301 309 -292 309 -282 293 -282 L 277 -286 273 -292 Q 273 -301 291 -301 M 243 -274 Q 221 -259 192 -259 159 -259 145 -268 L 138 -278 Q 138 -312 200 -312 261 -314 261 -295 261 -287 243 -274 M 84 -274 Q 108 -273 108 -264 L 102 -257 95 -255 Q 71 -255 63 -261 L 59 -267 Q 59 -275 84 -274 M 29 -275 L 21 -264 22 -263 17 -262 Q -11 -262 -13 -282 -13 -295 11 -299 35 -303 35 -285 L 29 -275 M 107 -278 Q 93 -278 93 -289 93 -299 108 -296 123 -294 123 -289 L 115 -281 Q 109 -278 107 -278 M 174 -148 Q 152 -131 112 -131 L 56 -139 47 -131 35 -127 Q 50 -122 50 -107 L 48 -102 53 -94 53 -92 62 -98 90 -107 Q 107 -107 115 -100 L 120 -91 118 -84 124 -84 148 -83 147 -87 Q 134 -90 134 -104 134 -116 145 -117 L 161 -115 189 -123 Q 180 -132 180 -140 180 -149 205 -161 L 216 -165 216 -166 Q 216 -178 273 -182 L 303 -181 Q 305 -192 326 -196 346 -199 349 -187 357 -204 391 -199 L 399 -197 443 -203 471 -201 482 -205 475 -205 Q 453 -205 453 -223 453 -235 464 -236 L 492 -233 Q 511 -233 511 -223 L 501 -213 Q 495 -209 489 -207 L 515 -209 Q 576 -211 576 -192 L 573 -185 577 -180 573 -174 563 -172 560 -172 558 -171 Q 536 -156 507 -156 L 496 -156 490 -153 468 -144 Q 480 -142 480 -134 L 477 -120 Q 474 -117 467 -115 L 499 -108 498 -114 499 -121 Q 492 -122 490 -126 488 -128 489 -131 489 -143 506 -144 518 -144 521 -138 L 558 -137 562 -136 613 -143 596 -149 Q 585 -154 585 -161 585 -172 607 -174 L 605 -179 592 -183 588 -189 Q 588 -198 606 -198 L 621 -195 625 -195 Q 645 -192 645 -178 L 645 -174 666 -172 663 -180 Q 663 -203 693 -201 L 713 -197 726 -200 780 -197 792 -188 Q 792 -170 740 -170 L 722 -174 720 -171 Q 713 -162 692 -162 L 689 -162 690 -158 Q 690 -151 681 -147 L 658 -141 Q 702 -137 702 -115 702 -103 679 -91 655 -79 622 -78 645 -74 645 -61 L 642 -54 Q 654 -49 659 -40 L 660 -42 661 -45 662 -48 678 -50 Q 696 -50 697 -39 697 -31 680 -31 L 671 -31 662 -33 663 -26 Q 663 -14 650 -4 L 654 4 Q 654 18 632 30 L 618 37 618 39 Q 618 51 599 51 L 600 52 595 53 592 53 577 50 579 52 573 54 567 51 567 49 554 50 542 50 506 47 503 47 490 63 Q 498 58 503 56 514 52 518 61 L 533 57 Q 555 53 555 62 L 547 71 528 77 518 76 514 80 508 81 498 79 485 70 483 68 486 66 456 73 419 69 408 66 407 65 402 63 393 64 367 59 358 59 344 57 342 57 305 55 Q 299 54 299 46 L 301 41 297 41 263 39 262 39 Q 241 52 207 52 L 201 52 191 59 156 71 156 80 150 99 146 104 146 106 141 118 Q 134 126 120 126 92 126 95 112 L 80 107 76 110 Q 64 123 47 123 L 30 123 38 133 55 133 Q 67 138 67 142 L 61 152 38 159 33 160 35 166 Q 35 176 23 176 L -14 174 -20 165 Q -20 157 -6 155 L -16 140 -16 138 -12 133 1 130 5 131 6 131 18 132 18 128 20 122 -27 114 Q -47 107 -47 96 -47 64 20 59 31 48 66 43 L 65 38 66 30 34 32 17 31 -16 53 Q -52 66 -92 66 -139 66 -160 50 -172 40 -172 29 -172 13 -163 6 -146 -7 -86 -7 L -22 -2 Q -21 -29 28 -31 L 28 -32 44 -34 58 -31 70 -30 65 -33 Q 58 -39 57 -46 L 43 -44 Q 24 -44 24 -52 24 -69 43 -75 59 -80 62 -64 L 75 -76 Q 51 -76 49 -84 L 39 -82 Q 20 -82 20 -94 20 -101 32 -102 L 29 -103 11 -93 Q 0 -93 -9 -119 L -8 -122 -10 -122 -38 -133 Q -49 -138 -49 -145 -49 -159 -13 -159 L 26 -157 21 -166 Q 21 -173 52 -189 81 -204 102 -208 129 -215 161 -197 189 -180 189 -173 189 -160 174 -148 M 162 -223 Q 155 -216 131 -216 109 -216 100 -226 L 96 -237 Q 96 -249 131 -249 165 -250 165 -237 L 162 -223 M 183 -217 Q 183 -250 243 -240 302 -230 302 -213 302 -205 269 -197 L 234 -191 Q 203 -191 190 -202 183 -209 183 -217 M 6 -199 L -14 -214 -25 -230 Q -25 -248 24 -247 72 -245 72 -230 72 -223 45 -209 18 -194 6 -199 M 95 -119 Q 95 -130 112 -129 128 -127 128 -119 128 -107 109 -107 98 -107 95 -114 L 95 -119 M 113 -22 L 89 -24 Q 102 -17 102 -3 L 102 3 132 3 Q 142 -11 171 -16 173 -23 183 -24 177 -27 170 -33 L 135 -23 131 -22 113 -22 M 188 -47 Q 204 -53 204 -33 L 199 -23 203 -18 238 -15 272 -22 272 -23 Q 272 -41 293 -50 L 288 -55 286 -60 252 -54 244 -53 239 -53 227 -53 191 -56 188 -47 M 358 -201 Q 339 -201 339 -213 339 -221 356 -222 372 -223 372 -213 372 -201 358 -201 M 336 -161 L 337 -160 332 -159 329 -159 326 -156 346 -148 347 -151 363 -153 Q 381 -153 382 -142 L 380 -137 387 -127 387 -126 396 -126 Q 408 -124 408 -116 L 408 -113 425 -116 415 -123 411 -134 Q 411 -139 417 -141 396 -144 386 -151 361 -151 352 -163 L 347 -176 344 -172 336 -161 M 392 -104 Q 383 -108 383 -118 L 384 -121 360 -106 339 -96 Q 337 -84 317 -73 L 326 -59 326 -58 337 -60 336 -63 350 -76 357 -80 367 -86 387 -95 393 -104 392 -104 M 675 -258 Q 675 -248 660 -237 636 -221 589 -221 539 -221 514 -237 499 -248 499 -259 499 -268 524 -280 550 -292 576 -292 L 576 -290 626 -280 Q 675 -268 675 -258 M 671 -282 Q 666 -288 666 -295 666 -325 710 -318 753 -310 753 -297 L 742 -282 Q 728 -270 706 -270 680 -270 671 -282 M 465 -300 L 477 -291 Q 477 -273 425 -273 400 -273 394 -293 394 -303 411 -303 L 465 -300 M 428 -226 Q 417 -226 414 -233 L 414 -238 Q 414 -249 431 -248 447 -246 447 -238 447 -226 428 -226 M 405 -29 L 405 -25 Q 405 -18 395 -9 L 383 1 383 2 405 -4 414 -3 414 -10 Q 414 -25 432 -28 L 427 -28 405 -29 M 498 -19 Q 495 -25 495 -30 495 -51 531 -58 L 531 -62 531 -63 Q 531 -75 588 -79 L 591 -79 Q 568 -81 556 -88 L 549 -88 528 -89 529 -82 Q 529 -72 510 -60 L 498 -54 489 -45 Q 472 -32 446 -29 465 -28 465 -13 L 460 -1 Q 453 7 439 7 L 433 7 435 12 434 17 446 17 463 18 462 16 462 13 Q 462 -3 471 -10 L 476 -12 498 -19 M 711 -223 Q 702 -227 702 -237 702 -248 715 -245 727 -243 727 -235 727 -226 711 -223 M 746 -145 Q 762 -143 762 -135 762 -123 743 -123 732 -123 729 -130 L 729 -135 Q 729 -146 746 -145 M 807 -130 Q 826 -130 826 -120 L 816 -110 Q 804 -102 790 -102 768 -102 768 -120 768 -132 779 -133 L 807 -130 M 672 -74 Q 672 -87 701 -87 L 714 -94 758 -100 Q 825 -100 825 -74 825 -60 805 -50 L 769 -39 765 -38 747 -38 Q 715 -38 701 -48 L 699 -49 692 -58 Q 685 -60 680 -64 L 672 -74 M 723 -10 L 772 -13 Q 844 -6 844 21 844 31 825 43 803 56 773 56 L 770 56 767 56 759 56 749 55 725 50 710 54 712 55 718 67 720 67 738 62 Q 759 61 759 71 L 758 74 773 77 784 74 810 74 810 73 Q 810 50 852 43 857 39 870 38 L 884 37 908 38 929 40 947 45 Q 978 54 978 77 978 92 956 104 L 950 107 Q 947 114 936 114 L 927 113 887 116 862 114 847 118 819 124 812 124 791 123 Q 776 120 768 113 L 765 109 754 110 Q 728 110 729 98 L 709 99 706 99 705 106 739 118 743 121 761 120 Q 807 122 817 137 L 851 133 854 133 881 134 Q 885 125 906 128 933 132 933 142 933 154 914 154 L 908 154 905 158 904 159 894 168 Q 876 183 851 183 813 183 801 169 L 771 176 742 174 722 181 Q 740 187 741 199 L 748 196 752 191 765 188 769 189 784 190 811 189 871 193 Q 881 178 922 173 L 922 172 923 170 924 167 925 164 941 162 Q 956 162 959 170 L 977 170 964 164 962 163 955 154 954 148 Q 954 133 964 125 L 969 122 Q 976 99 1021 98 L 1032 98 1031 92 Q 1031 80 1042 79 L 1070 82 Q 1089 82 1089 92 L 1079 102 1070 107 1075 119 1075 120 Q 1088 127 1088 138 1088 152 1068 162 L 1062 165 Q 1073 166 1074 173 L 1084 171 Q 1100 171 1100 181 L 1100 184 1107 194 1096 209 1092 213 Q 1107 221 1107 233 1107 243 1088 255 L 1081 259 Q 1078 266 1065 268 L 1061 266 1036 268 994 264 976 268 982 280 983 285 983 290 981 297 993 301 995 295 Q 1001 287 1018 286 L 1021 286 1038 290 1047 290 Q 1077 293 1077 306 L 1074 320 Q 1067 329 1046 329 1030 329 1023 322 L 1017 322 998 319 977 325 Q 966 325 961 317 L 961 316 944 319 922 319 917 319 908 318 870 310 863 307 864 314 857 330 857 332 851 346 841 354 840 354 Q 819 367 785 367 L 779 367 Q 744 366 724 357 L 719 357 710 357 701 355 698 349 698 348 699 346 700 343 701 340 705 339 704 335 Q 704 325 710 318 718 306 740 301 L 745 298 753 294 762 292 761 291 748 282 746 280 766 268 Q 777 264 781 273 L 782 282 781 288 781 289 797 288 851 296 850 293 850 292 851 285 854 279 846 283 829 286 Q 811 286 808 274 L 807 268 808 262 805 262 797 262 782 265 Q 772 265 769 259 L 766 259 Q 748 254 737 246 L 728 235 720 241 697 247 663 250 652 245 635 239 Q 624 234 624 227 L 628 219 629 219 625 217 621 215 617 215 612 214 610 213 607 212 603 214 599 216 597 217 590 221 589 222 588 222 549 232 546 232 543 232 535 232 525 231 516 229 516 230 512 236 498 239 Q 476 239 482 231 482 225 499 224 L 501 224 499 223 Q 492 218 492 213 492 196 509 188 513 183 525 182 L 528 181 554 179 605 184 639 178 634 176 618 168 604 158 600 152 599 149 Q 599 145 610 138 L 588 134 578 142 577 142 Q 556 155 522 155 L 516 155 Q 476 154 456 142 441 133 441 123 441 113 447 106 457 92 486 87 L 518 85 553 88 554 88 553 85 Q 553 69 590 68 595 59 608 53 L 638 46 Q 641 42 652 41 L 652 29 Q 652 -4 706 -5 L 718 -5 723 -10 M 804 -28 Q 804 -40 821 -41 837 -41 837 -31 837 -18 819 -18 808 -18 805 -23 803 -25 804 -28 M 981 -192 Q 981 -222 1025 -215 1068 -207 1068 -194 1068 -189 1057 -179 1043 -167 1021 -167 995 -167 986 -179 981 -185 981 -192 M 975 -134 Q 951 -118 904 -118 854 -118 829 -134 814 -145 814 -156 814 -165 839 -177 865 -189 891 -189 L 891 -187 941 -177 Q 990 -165 990 -155 990 -145 975 -134 M 878 -69 L 867 -72 867 -75 Q 867 -83 880 -83 892 -83 892 -77 L 888 -71 878 -69 M 919 -79 Q 919 -94 940 -92 960 -89 960 -75 960 -63 938 -63 927 -63 922 -71 L 919 -79 M 978 -77 Q 978 -100 1008 -98 1038 -95 1038 -82 L 1035 -68 Q 1028 -59 1007 -59 989 -59 982 -68 L 978 -77 M 938 -40 Q 1017 -41 1017 -12 1017 0 994 12 L 993 13 1043 15 Q 1055 20 1055 24 L 1049 34 1045 41 Q 1039 48 1027 48 L 1000 42 985 38 Q 975 33 972 22 L 972 20 931 25 887 21 887 23 Q 887 33 871 33 L 868 33 855 29 851 23 Q 851 14 869 14 L 870 14 860 5 Q 853 -5 858 -16 858 -39 938 -40 M 1017 -134 Q 1017 -145 1030 -142 1042 -140 1042 -132 1042 -123 1026 -120 1017 -124 1017 -134 M 1320 33 Q 1306 45 1284 45 1258 45 1249 33 L 1244 20 Q 1244 -10 1288 -3 1331 5 1331 18 L 1320 33 M 1238 78 Q 1214 94 1167 94 1117 94 1092 78 1077 67 1077 56 1077 47 1102 35 1128 23 1154 23 L 1154 25 1204 35 Q 1253 47 1253 57 1253 67 1238 78 M 1289 92 Q 1280 88 1280 78 1280 67 1293 70 1305 72 1305 80 1305 89 1289 92 M 1245 144 L 1241 135 Q 1241 112 1271 114 1301 117 1301 130 L 1298 144 Q 1291 153 1270 153 1252 153 1245 144 M 1281 228 Q 1305 228 1311 235 L 1313 241 1308 253 1290 260 Q 1270 260 1258 251 L 1250 241 Q 1250 228 1281 228 M 1257 224 Q 1231 237 1194 237 1136 237 1123 217 1116 207 1121 196 1121 173 1201 172 1280 171 1280 200 1280 212 1257 224 M 1324 354 Q 1304 370 1262 370 1236 370 1230 357 L 1230 344 Q 1230 311 1284 310 1338 309 1338 331 1338 343 1324 354 M 1219 316 Q 1194 328 1150 328 1107 328 1086 309 1073 297 1073 285 1073 253 1157 252 1241 251 1241 289 1241 304 1219 316 M 1316 377 Q 1337 376 1337 386 L 1315 401 1295 385 Q 1295 380 1316 377 M 1272 436 Q 1253 454 1205 454 1159 454 1140 434 L 1130 415 Q 1130 388 1207 382 1284 377 1284 410 1284 424 1272 436 M 1028 174 L 1010 174 999 174 Q 1017 179 1020 192 1022 179 1033 174 L 1028 174 M 1185 141 L 1182 133 Q 1182 118 1203 120 1223 123 1223 137 1223 149 1201 149 1190 149 1185 141 M 1143 129 Q 1155 129 1155 135 L 1151 141 1141 143 1130 140 1130 137 Q 1130 129 1143 129 M 1009 67 Q 1025 69 1025 77 1025 89 1006 89 995 89 992 82 L 992 77 Q 992 66 1009 67 M 926 352 L 969 348 970 347 Q 982 331 1024 332 1082 334 1082 358 1073 380 1053 386 1047 393 1033 400 L 1004 410 1004 413 998 432 994 436 Q 1017 445 1017 465 1017 480 995 492 970 504 926 504 883 504 862 485 849 473 849 461 849 438 892 431 L 888 429 876 423 864 431 Q 842 444 812 444 L 779 442 775 448 761 451 757 451 758 456 759 461 759 466 749 482 745 486 737 492 720 495 648 487 650 493 648 502 645 505 633 512 627 522 617 530 616 530 Q 601 540 578 542 577 556 556 568 L 509 579 504 590 503 592 506 592 Q 533 596 533 606 L 531 613 538 612 Q 555 609 555 618 L 551 624 537 627 Q 515 627 521 619 L 522 618 514 618 488 614 494 619 488 621 482 618 482 613 486 613 479 605 469 605 449 603 434 598 425 595 406 587 382 574 373 568 354 574 Q 324 574 329 557 329 551 332 547 338 539 355 538 L 358 538 Q 374 538 379 547 389 540 410 536 410 527 417 522 L 388 523 375 523 371 522 360 520 340 518 333 516 349 504 Q 349 494 328 495 307 498 307 503 L 300 493 299 487 274 488 248 482 240 489 232 494 223 500 284 508 308 516 310 518 312 519 318 527 319 532 320 537 320 542 310 558 306 562 298 568 281 571 248 570 217 572 190 570 194 584 188 598 178 606 177 606 Q 156 619 122 619 L 116 619 Q 76 618 56 606 41 597 41 587 41 577 47 570 52 563 61 559 L 53 554 50 548 Q 50 535 76 536 L 92 539 85 534 83 532 103 520 Q 114 516 118 525 L 119 534 118 540 114 544 108 545 98 543 101 550 118 549 152 552 142 533 Q 142 522 156 514 L 154 514 142 514 106 511 103 511 Q 86 506 76 499 L 63 504 65 512 Q 65 534 41 534 L 19 533 16 533 11 549 17 564 17 570 Q 12 590 -19 597 L -51 599 -64 599 -68 598 -92 590 -100 583 -107 565 Q -107 554 -99 548 L -100 547 Q -128 534 -128 523 -128 508 -74 507 L -59 506 -55 500 -53 498 -42 492 -38 491 Q -29 490 -25 497 L -23 503 -23 507 6 515 Q 8 508 17 504 L -3 498 -8 496 -17 491 -32 488 -36 483 -37 481 -32 475 -29 473 -23 469 -19 467 -18 465 Q -6 449 36 450 L 71 455 71 454 76 452 78 451 98 445 104 444 126 442 Q 109 437 98 427 L 90 418 89 419 79 426 59 433 47 435 29 440 7 435 5 435 -22 431 -27 434 -44 437 -118 428 Q -137 421 -138 411 L -138 410 -137 403 Q -134 390 -117 383 L -84 375 -72 373 -71 373 -66 373 -29 376 -16 371 -25 359 -26 353 -26 352 -26 350 -40 358 -61 368 -79 368 -92 360 -93 360 -103 366 -107 367 -124 373 -150 378 -157 379 -158 379 -166 380 -171 380 -183 380 -219 377 -222 377 -251 364 -262 350 -262 348 -263 346 -263 345 -263 343 Q -263 327 -254 320 L -249 318 -247 317 -227 311 -221 310 -177 307 -152 308 -117 311 -91 317 -83 321 -73 320 -69 320 -61 320 -20 327 -17 329 -7 325 -2 320 33 316 47 317 95 327 106 332 110 329 121 326 131 325 131 323 133 314 Q 133 307 140 302 L 110 308 109 308 94 312 86 311 80 307 79 306 77 305 Q 76 298 62 300 L 60 299 53 290 44 291 45 292 40 292 22 292 11 292 -11 288 -24 282 -26 281 -33 272 -34 266 Q -34 251 -24 243 L -19 240 -11 236 -6 235 -9 233 Q -37 220 -37 209 -37 196 4 193 6 184 21 185 34 187 37 192 107 190 107 217 107 234 93 242 L 99 249 100 255 100 256 115 255 142 256 142 255 Q 142 247 155 247 167 247 167 253 L 163 259 166 260 Q 176 264 176 272 L 173 279 164 290 160 292 158 293 152 297 162 294 174 292 192 291 205 290 207 290 221 289 245 290 266 292 284 297 289 302 290 306 290 309 292 318 289 328 269 342 240 352 217 355 210 362 199 366 184 370 183 371 230 378 Q 253 387 253 407 L 253 408 Q 252 422 231 434 L 197 444 208 445 234 451 243 455 Q 246 442 259 435 L 266 432 262 431 259 425 259 424 260 422 261 419 262 416 266 415 278 414 Q 293 414 296 422 L 297 425 297 428 337 433 Q 350 438 350 449 L 350 450 358 450 372 451 420 461 424 461 426 462 443 467 Q 456 474 456 488 L 456 494 448 508 453 507 481 504 486 494 494 486 Q 468 482 460 469 L 458 466 456 457 447 454 446 453 444 444 Q 444 427 474 423 L 499 426 517 425 513 422 502 408 502 406 501 404 501 403 501 401 Q 501 385 510 378 L 515 376 517 375 537 369 543 368 587 365 612 366 644 358 664 355 702 356 Q 730 362 734 386 L 734 395 728 414 724 419 Q 713 429 693 429 L 673 427 661 424 657 425 640 431 614 436 610 437 Q 617 443 617 452 L 614 462 594 476 595 477 609 481 618 480 636 482 626 469 626 468 627 461 Q 630 448 647 441 L 680 433 692 431 693 431 698 431 Q 731 429 747 440 749 437 759 436 L 757 435 750 430 739 417 738 411 738 410 Q 738 396 747 387 L 757 383 762 378 797 374 811 375 Q 859 380 875 393 L 897 390 Q 893 381 897 372 L 883 370 Q 877 369 877 361 L 879 356 889 351 905 349 916 350 920 350 926 352 M 871 265 L 882 261 868 254 864 255 850 258 Q 865 259 865 268 L 871 265 M 844 357 Q 844 352 850 349 L 860 347 Q 876 347 876 357 876 370 858 370 L 844 365 843 360 844 357 M 814 490 Q 807 498 793 498 763 498 768 481 768 475 771 471 777 463 794 462 L 797 462 Q 819 462 819 478 L 814 490 M 1149 361 L 1142 351 Q 1142 336 1169 340 1196 344 1196 354 1196 366 1177 366 L 1151 362 1157 367 1151 369 1145 366 1145 361 1149 361 M 1088 382 Q 1088 376 1111 372 1133 368 1133 377 L 1125 386 1106 392 Q 1088 392 1088 382 M 1089 417 L 1087 426 1089 432 1082 440 1065 443 Q 1048 443 1041 436 L 1038 430 1034 427 1026 417 Q 1026 404 1057 404 1081 404 1087 411 L 1089 417 M 1048 612 Q 1029 630 981 630 935 630 916 610 L 906 591 Q 906 564 983 558 1060 553 1060 586 1060 600 1048 612 M 1100 530 Q 1080 546 1038 546 1012 546 1006 533 L 1006 520 Q 1006 487 1060 486 1114 485 1114 507 1114 519 1100 530 M 1092 553 Q 1113 552 1113 562 1113 567 1091 577 L 1071 561 Q 1071 556 1092 553 M 927 545 L 921 542 921 537 925 537 918 527 Q 918 512 945 516 972 520 972 530 972 542 953 542 L 927 538 933 543 927 545 M 909 553 L 901 562 882 568 Q 864 568 864 558 864 552 887 548 909 544 909 553 M 814 606 Q 814 593 840 594 865 596 865 608 L 858 616 841 619 Q 824 619 817 612 L 814 606 M 810 564 L 761 556 756 554 Q 741 548 741 539 741 530 746 523 758 507 800 508 858 510 858 534 846 564 810 564 M 625 239 Q 634 238 638 245 L 640 251 640 253 661 260 668 270 668 268 Q 668 251 698 247 728 244 728 260 L 725 273 726 278 726 283 Q 723 290 712 290 L 703 289 694 282 682 281 671 278 670 277 668 270 657 285 654 288 667 291 Q 680 298 680 312 L 680 318 684 327 684 330 681 334 680 335 670 344 Q 652 359 627 359 589 359 577 345 L 573 339 571 338 567 335 555 340 537 344 525 345 518 350 498 357 485 359 471 360 466 360 444 359 416 354 415 355 407 359 390 362 Q 372 362 369 350 L 368 344 369 338 Q 371 333 378 331 L 376 328 375 325 Q 375 321 386 314 L 389 312 Q 391 309 396 308 L 406 302 426 293 433 291 439 287 Q 464 276 488 275 L 485 275 482 275 464 272 454 265 450 254 Q 450 249 456 247 L 485 242 494 243 496 243 507 244 Q 519 246 519 254 L 516 268 506 273 505 274 491 275 491 277 541 287 543 288 541 285 538 280 537 274 538 267 Q 540 258 549 253 L 560 250 586 250 593 251 594 250 608 248 610 246 621 240 625 239 M 420 117 Q 441 121 441 135 L 439 144 Q 467 150 471 174 L 471 183 468 196 Q 477 198 477 202 L 469 210 461 213 454 212 434 217 438 217 Q 462 218 462 227 L 456 234 449 236 417 230 413 224 414 222 Q 417 218 428 217 L 410 215 395 210 389 208 387 211 387 214 Q 387 228 375 240 L 370 244 378 244 419 251 426 261 426 262 423 267 399 282 378 292 363 293 340 294 337 294 322 290 Q 312 285 309 274 L 309 272 313 267 326 264 330 265 331 265 330 264 329 261 330 257 312 258 310 262 Q 303 271 282 271 266 271 259 264 L 257 262 253 253 254 247 243 238 233 219 Q 233 192 310 186 L 343 186 330 174 334 163 333 161 333 150 332 151 329 154 328 155 Q 316 163 298 163 295 170 280 170 L 260 168 265 175 Q 265 185 250 196 L 242 201 230 206 212 210 200 211 179 212 118 203 104 196 94 186 88 184 Q 68 177 68 167 68 134 127 136 L 165 141 166 141 166 142 173 145 216 153 218 154 249 163 245 155 Q 245 145 257 144 L 256 138 256 134 257 132 253 132 Q 210 132 189 113 176 101 176 89 176 57 260 56 317 55 335 73 L 343 72 355 71 373 72 385 73 387 74 Q 426 78 426 98 L 420 117 M 488 393 L 483 395 478 395 472 395 474 400 473 405 472 407 471 408 464 412 436 415 429 415 408 413 405 414 404 415 414 421 415 424 421 423 Q 437 423 437 433 437 446 419 446 L 411 445 406 447 397 447 383 445 378 439 Q 378 430 384 424 L 385 423 369 425 370 426 365 426 347 426 336 426 314 422 301 416 299 415 292 406 291 400 Q 291 386 300 378 L 274 372 270 369 267 366 264 365 Q 256 363 255 358 L 254 354 Q 254 346 271 345 L 284 347 293 346 311 348 Q 319 349 323 353 L 325 359 323 368 342 365 350 364 375 361 378 362 389 364 395 367 412 372 424 383 425 389 444 384 453 385 467 390 467 389 Q 467 381 480 381 492 381 492 387 L 488 393 M 390 27 L 368 24 362 27 Q 371 26 375 33 L 384 32 392 32 397 27 390 27 M 347 34 L 342 35 345 36 347 34 M 217 239 L 229 243 235 255 234 261 216 267 221 269 224 273 224 275 Q 224 285 208 285 L 205 285 192 281 188 275 Q 188 266 206 266 L 197 259 197 258 194 251 Q 194 236 215 238 L 217 239 M 183 136 Q 161 136 167 128 167 122 184 121 201 118 201 127 L 197 133 183 136 M 141 234 Q 141 221 167 222 192 224 192 236 L 185 244 168 247 Q 151 247 144 240 L 141 234 M 10 312 L -22 306 -26 300 -25 298 Q -22 294 -11 293 L -9 293 -7 293 -1 293 Q 23 294 23 303 L 17 310 10 312 M 100 373 L 89 379 96 384 Q 105 377 123 374 L 109 368 100 373 M 329 329 Q 329 318 346 319 362 321 362 329 L 358 338 343 341 Q 333 341 330 335 L 329 334 329 329 M 361 584 Q 419 586 419 610 407 640 371 640 L 322 632 317 630 Q 302 624 302 615 302 606 307 599 319 583 361 584 M 226 603 L 242 601 253 602 257 602 Q 266 604 269 610 L 269 614 269 615 Q 269 624 257 624 L 220 622 Q 214 621 214 613 L 216 608 226 603 M 238 687 L 225 681 Q 197 668 197 657 197 642 251 641 L 269 640 Q 341 638 341 665 L 335 684 Q 325 696 296 696 L 259 692 238 687 M 401 670 Q 426 672 426 684 L 419 692 402 695 Q 385 695 378 688 L 375 682 Q 375 669 401 670 M 39 608 Q 67 614 71 638 L 71 647 65 666 61 671 Q 50 681 30 681 L 10 679 -5 674 -14 671 -33 663 -57 650 -70 638 -66 627 -65 626 Q -54 615 -19 610 L 1 607 39 608 M 99 688 Q 116 685 116 694 L 112 700 98 703 Q 76 703 82 695 82 689 99 688 M 164 657 L 161 665 140 669 Q 107 669 107 656 107 646 136 645 164 644 164 657 M 774 608 Q 764 620 735 620 L 698 616 677 611 664 605 663 605 661 606 Q 641 622 599 622 573 622 567 609 L 567 596 567 593 Q 546 590 546 580 546 570 575 569 L 584 569 621 562 662 567 690 565 708 564 Q 780 562 780 589 L 774 608 M 708 539 Q 708 548 696 548 L 659 546 Q 653 545 653 537 L 655 532 665 527 681 525 692 526 696 526 Q 705 528 708 534 L 708 538 708 539 M 652 653 L 632 637 Q 632 632 653 629 674 628 674 638 674 643 652 653 M 609 688 Q 590 706 542 706 496 706 477 686 L 467 667 Q 467 640 544 634 621 629 621 662 621 676 609 688 M 425 634 Q 425 628 448 624 470 620 470 629 L 462 638 443 644 Q 425 644 425 634 M -297 -144 L -302 -143 Q -330 -143 -332 -163 -332 -176 -308 -180 -284 -184 -284 -166 L -290 -156 -298 -145 -297 -144 M -260 -148 Q -260 -156 -235 -155 -211 -154 -211 -145 -211 -140 -217 -138 L -224 -136 Q -248 -136 -256 -142 L -260 -148 M -226 -170 Q -226 -180 -211 -177 -196 -175 -196 -170 -196 -165 -204 -162 L -212 -159 Q -226 -159 -226 -170 M -333 -95 Q -344 -106 -344 -111 -344 -129 -295 -128 -247 -126 -247 -111 -247 -104 -274 -90 -301 -75 -313 -80 L -333 -95 M -279 -28 Q -298 -39 -298 -47 L -267 -70 Q -238 -85 -217 -89 -190 -96 -158 -78 L -130 -54 Q -130 -41 -145 -29 -167 -12 -207 -12 -251 -12 -279 -28 M -223 -118 Q -223 -130 -188 -130 -154 -131 -154 -118 -154 -107 -157 -104 -164 -97 -188 -97 -210 -97 -219 -107 L -223 -118 M -76 -155 Q -98 -140 -127 -140 -160 -140 -174 -149 L -181 -159 Q -181 -193 -119 -193 -58 -195 -58 -176 -58 -168 -76 -155 M -42 -167 L -46 -173 Q -46 -182 -28 -182 -10 -182 -10 -173 -10 -163 -26 -163 L -42 -167 M -136 -98 Q -136 -131 -76 -121 -17 -111 -17 -94 -17 -86 -50 -78 L -85 -72 Q -116 -72 -129 -83 L -136 -98 M -46 -13 Q -103 -13 -103 -47 -103 -59 -46 -63 11 -66 11 -45 11 -39 -3 -28 -21 -13 -46 -13 M -115 86 Q -115 97 -126 97 L -151 84 Q -115 56 -115 86 M -169 64 Q -169 86 -193 86 L -226 82 -229 72 Q -229 55 -199 51 -169 48 -169 64 M -116 101 Q -40 101 -40 136 -40 148 -57 158 L -57 159 -41 163 -36 168 -35 172 -36 177 -44 183 -67 189 -101 192 -112 187 -129 181 -140 170 -171 162 -174 163 -176 164 -180 166 Q -165 175 -163 194 L -159 195 -125 204 Q -121 198 -98 197 -70 196 -70 209 -70 215 -73 217 L -94 221 -108 220 -115 228 -126 232 -141 236 -169 242 -176 242 -197 241 -202 240 -219 232 -263 217 -279 217 -282 217 -300 214 -310 207 -314 196 Q -314 191 -308 189 L -303 187 Q -301 171 -266 164 L -272 155 -271 151 -285 151 -292 151 -295 152 -303 155 -310 154 -317 147 -334 135 -341 117 Q -341 87 -279 87 -217 87 -217 116 L -217 121 -210 121 -187 121 Q -172 101 -116 101 M -118 246 L -120 251 -107 252 -103 252 Q -90 254 -84 260 L -80 269 -80 270 -74 268 Q -54 265 -51 277 L -50 280 -47 280 Q -32 280 -29 288 L -28 291 Q -28 298 -40 299 L -45 299 -54 299 -60 298 -64 303 -63 304 -68 305 -71 305 -86 302 -97 289 Q -114 301 -137 301 -175 301 -187 287 L -191 281 -194 272 -194 268 -194 267 Q -194 259 -171 255 L -152 252 -152 247 Q -152 241 -135 240 -118 237 -118 246 M -61 231 L -70 224 -71 220 Q -71 212 -54 211 -43 210 -39 215 L -38 220 -38 225 Q -41 232 -52 232 L -61 231 M -244 43 Q -271 43 -271 33 -271 29 -257 21 L -229 12 Q -212 12 -204 19 L -199 28 Q -199 36 -209 40 L -244 43 M -280 19 L -285 18 Q -286 16 -290 16 -295 16 -308 26 -319 26 -328 0 -328 -13 -298 -11 -269 -9 -269 12 -269 19 -280 19 M -257 61 L -259 70 -276 75 Q -295 75 -295 67 -295 50 -276 44 -257 38 -257 61 M -350 164 Q -347 160 -336 159 L -334 159 -332 159 -326 159 Q -302 160 -302 169 L -308 176 -315 178 -347 172 -351 166 -350 164 M -375 148 L -375 150 -377 153 -378 154 -381 158 -389 169 -388 170 -393 171 -396 171 -411 168 Q -422 163 -423 151 L -422 149 Q -420 138 -399 134 -379 131 -376 143 L -375 148 M -365 224 Q -377 231 -386 234 L -404 234 -424 219 -434 206 -435 203 -434 199 Q -430 187 -398 186 L -394 186 -386 186 -345 193 Q -338 197 -338 203 L -338 204 -341 209 -365 224 M -308 225 L -283 224 Q -267 226 -249 236 L -245 239 Q -221 254 -221 260 -221 268 -227 276 L -236 285 -246 292 -266 299 -279 301 -293 302 -298 302 -320 301 -349 296 -354 294 -370 286 -384 276 -388 270 -389 267 -378 256 -375 254 Q -373 251 -368 250 L -358 244 -338 235 -308 225 M -292 337 L -290 342 -291 347 -292 349 -293 350 -300 354 -328 357 -335 357 -357 354 -361 349 -362 347 -357 341 -354 339 -348 335 -342 332 Q -330 326 -320 326 L -311 327 -295 333 -292 337 M -375 306 Q -360 311 -360 326 L -362 331 -367 333 -371 333 -376 332 -378 331 -381 330 -399 340 Q -410 340 -419 314 L -418 311 Q -415 301 -389 303 L -386 304 -375 306 M -363 357 Q -354 356 -350 363 L -348 369 -348 375 -350 384 -353 387 -358 389 -367 389 -381 387 -386 381 -380 366 -378 364 Q -374 360 -367 358 L -363 357 M -317 396 L -318 395 -320 386 Q -320 369 -290 365 -260 362 -260 378 -260 400 -284 400 L -306 399 -317 396 M -338 404 L -321 409 Q -308 416 -308 430 L -308 436 Q -313 456 -344 463 L -376 465 -389 465 -393 464 -417 456 -425 449 -432 431 Q -431 406 -390 403 L -382 402 -370 401 -352 402 -340 403 -338 404 M -390 492 Q -379 481 -344 476 L -324 473 -286 474 Q -258 480 -254 504 L -254 513 Q -254 522 -260 532 L -264 537 Q -275 547 -295 547 L -315 545 -330 540 -339 537 -358 529 -382 516 -395 504 -391 493 -390 492 M -207 391 L -206 400 -207 406 -211 410 -217 411 -227 409 -240 400 -242 398 Q -230 389 -222 386 -211 382 -207 391 M -207 415 L -172 418 -169 419 Q -131 425 -131 450 -131 457 -137 464 L -147 472 -148 472 Q -169 485 -203 485 L -209 485 Q -249 484 -269 472 -284 463 -284 453 L -278 436 Q -268 422 -239 417 L -207 415 M -111 479 L -109 474 -99 469 -85 467 -94 448 -93 445 Q -90 435 -64 437 L -61 438 -50 440 Q -35 445 -35 460 L -37 465 -42 467 -46 467 -51 466 -53 465 -56 464 -66 469 -56 476 -56 480 -56 481 Q -56 490 -68 490 L -105 488 -111 479 M -164 531 L -185 535 Q -218 535 -218 522 -218 512 -189 511 -161 510 -161 523 L -164 531 M -60 688 L -55 690 -47 701 -49 703 -48 704 -53 705 Q -70 705 -67 695 L -65 689 -60 688 M -227 569 Q -249 569 -243 561 -243 555 -226 554 -209 551 -209 560 L -213 566 -227 569 M -380 556 L -372 567 -374 569 -373 570 -378 571 Q -395 571 -392 561 L -390 555 -385 554 -380 556";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape431(ctx,ctrans,frame,ratio,time){
	var pathData="M 318 -295 L 356 -311 427 -326 435 -327 Q 465 -310 548 -287 L 707 -248 765 -248 814 -251 896 -235 918 -218 917 -217 905 -206 Q 922 -192 973 -171 L 974 -169 Q 978 -156 1009 -150 L 1027 -147 1050 -131 Q 1124 -122 1124 -102 1124 -61 1145 -40 L 1187 11 1217 50 Q 1245 76 1289 104 L 1322 128 Q 1322 178 1262 202 L 1289 271 1307 328 Q 1307 342 1296 353 1282 364 1257 365 L 1291 394 Q 1302 406 1302 421 1302 433 1290 456 1277 482 1263 488 1242 499 1220 520 1203 538 1183 543 1165 549 1114 606 1070 657 1017 657 L 926 645 905 649 857 655 Q 834 702 804 706 L 676 705 558 710 453 715 360 727 203 695 Q 73 732 -7 732 -16 732 -116 676 L -256 595 Q -276 583 -419 517 -481 488 -481 444 L -479 432 Q -475 427 -451 425 L -473 395 -473 394 -460 391 Q -453 391 -451 383 -448 375 -448 347 -448 324 -456 293 L -465 263 Q -465 248 -477 234 L -504 201 -516 190 -508 176 -463 95 -434 37 -422 17 -384 -13 -346 -41 Q -374 -79 -394 -86 -361 -136 -314 -178 -211 -271 -131 -240 -116 -247 -112 -257 L -102 -266 -85 -260 -68 -255 Q -47 -255 -43 -273 -39 -296 -30 -301 L 72 -300 81 -328 Q 84 -341 105 -341 117 -341 124 -333 132 -325 140 -325 L 144 -325 173 -309 Q 223 -283 251 -283 L 318 -295";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 219 -281 L 218 -274 204 -258 200 -255 Q 186 -246 167 -244 L 153 -243 Q 125 -243 107 -253 L 96 -261 Q 86 -270 84 -279 L 87 -291 Q 91 -303 107 -308 L 152 -314 170 -313 188 -311 Q 209 -306 216 -294 L 219 -281 M 300 -280 L 302 -285 303 -287 Q 307 -293 317 -296 L 347 -303 349 -303 389 -300 393 -291 375 -271 Q 355 -255 341 -255 L 339 -255 339 -254 337 -242 352 -243 369 -243 378 -243 377 -244 375 -246 Q 375 -252 378 -256 384 -268 409 -270 L 415 -271 417 -271 Q 411 -276 411 -283 L 412 -288 429 -297 436 -296 Q 460 -291 460 -277 460 -267 450 -265 L 454 -256 453 -248 448 -239 436 -227 442 -217 474 -220 492 -219 510 -217 521 -214 Q 546 -227 591 -227 643 -227 669 -215 L 678 -210 681 -210 673 -216 672 -217 660 -231 661 -234 662 -237 Q 667 -248 692 -251 L 704 -252 739 -245 748 -231 748 -227 737 -215 722 -207 712 -205 715 -197 715 -195 Q 720 -200 731 -202 L 737 -204 756 -202 758 -202 Q 782 -197 782 -183 782 -173 772 -171 L 776 -162 775 -154 770 -145 758 -133 764 -120 768 -111 Q 768 -104 758 -96 L 758 -94 Q 758 -84 748 -80 L 737 -78 Q 728 -70 718 -66 L 733 -64 736 -63 793 -44 Q 807 -37 811 -28 L 822 -30 884 -34 898 -35 Q 913 -30 916 -24 L 917 -14 Q 917 17 853 17 L 822 13 806 4 802 0 794 6 Q 776 18 744 22 L 731 23 Q 737 26 739 34 L 744 31 Q 759 22 795 18 L 822 17 Q 852 18 856 35 872 23 890 24 L 954 31 990 47 1014 66 Q 1022 57 1041 51 L 1072 45 1095 43 1112 43 Q 1176 42 1184 69 L 1185 76 1185 77 Q 1185 93 1164 107 L 1160 109 Q 1133 123 1098 123 L 1082 123 1072 123 1057 121 1061 131 1072 129 1113 125 Q 1165 125 1191 137 L 1205 146 1208 149 Q 1215 159 1215 179 L 1214 189 1203 207 1193 215 1189 217 1142 225 1087 220 1073 217 1072 217 1056 212 Q 1009 198 1009 179 L 1011 170 1016 160 1014 160 965 158 960 155 958 158 958 162 958 164 954 174 948 178 937 180 918 192 933 194 936 195 954 200 993 214 Q 1007 221 1011 230 L 1022 228 1072 225 1084 224 1098 223 1116 234 1117 244 Q 1117 270 1072 275 L 1061 275 1070 279 1072 281 1076 284 1090 282 Q 1149 280 1190 305 1221 325 1221 340 L 1221 342 Q 1218 357 1181 371 L 1105 384 1072 382 Q 1041 378 1027 365 L 1023 361 1012 379 1002 387 998 389 954 397 951 397 914 395 911 397 925 406 926 416 Q 926 447 862 447 L 831 443 815 434 811 430 803 436 784 445 784 451 804 448 831 447 Q 861 448 865 465 881 453 899 454 L 954 459 999 477 Q 1030 497 1030 512 L 1030 514 Q 1027 529 990 543 L 954 553 914 556 Q 857 556 836 537 826 527 826 514 L 829 504 808 506 Q 771 506 754 493 L 744 483 742 475 748 464 749 464 746 462 737 455 736 453 719 453 715 453 715 459 714 469 703 487 693 495 688 498 737 503 742 503 774 506 Q 790 510 790 521 L 780 536 Q 766 548 741 550 L 736 555 732 559 Q 714 576 685 582 L 690 585 Q 721 605 721 620 721 636 681 651 644 664 605 664 548 664 527 645 517 635 517 622 L 520 612 499 614 Q 462 614 445 601 433 593 433 583 433 566 477 559 L 481 557 493 554 522 551 506 542 502 538 494 544 Q 468 561 410 561 363 561 344 544 L 338 538 Q 331 528 331 506 331 487 366 478 L 356 477 317 464 308 459 Q 283 444 283 434 L 287 418 274 411 270 407 267 410 Q 252 423 226 424 L 241 427 261 434 Q 264 443 280 451 L 285 471 284 479 271 493 Q 250 507 207 507 L 202 507 Q 192 516 168 525 L 167 526 Q 182 528 189 535 L 197 532 Q 248 516 248 545 L 248 546 Q 271 547 271 563 L 264 576 Q 255 587 239 587 L 215 583 Q 226 592 226 605 226 621 217 628 201 639 153 639 116 639 95 620 82 607 82 598 82 565 149 568 L 146 565 136 557 130 543 132 535 92 538 Q 35 538 14 519 4 509 4 496 L 7 486 -14 488 Q -51 488 -68 475 -80 467 -80 457 -80 437 -18 430 37 424 43 447 56 437 72 436 L 70 434 67 428 40 429 Q 9 429 -7 416 L -11 412 -19 418 Q -45 435 -103 435 -150 435 -169 418 L -175 412 Q -182 402 -182 380 -182 361 -147 352 L -157 351 -196 338 -215 332 -233 325 Q -228 333 -228 345 L -229 353 -242 367 Q -263 381 -306 381 -352 381 -373 362 -386 352 -386 341 L -384 327 -398 327 Q -431 327 -443 308 L -449 288 Q -449 275 -407 275 L -422 265 -435 243 Q -435 221 -404 215 -400 203 -384 198 L -387 188 Q -387 166 -354 170 -323 175 -321 193 L -303 195 -285 192 Q -246 187 -246 208 -246 214 -253 221 -261 230 -273 232 L -287 248 -291 251 Q -291 266 -300 273 -316 284 -364 284 L -366 284 Q -358 290 -356 301 L -307 296 -272 301 -252 308 -253 303 Q -253 291 -243 281 L -257 260 Q -257 233 -204 227 L -191 226 -189 221 -202 223 Q -221 223 -231 205 L -238 187 Q -238 175 -230 179 L -216 186 -210 184 -226 170 Q -226 161 -186 151 -186 132 -151 123 L -161 122 -209 126 -233 124 -246 138 Q -267 152 -310 152 -356 152 -377 133 -390 123 -390 112 L -388 98 -402 98 Q -435 98 -447 79 L -453 59 Q -453 45 -406 46 -364 47 -360 72 L -311 67 -276 72 Q -268 59 -243 56 -254 47 -261 31 -261 4 -208 -2 L -195 -3 -192 -10 Q -211 -15 -222 -25 -235 -35 -235 -46 L -233 -60 -247 -60 Q -280 -60 -292 -79 L -298 -99 Q -298 -113 -251 -112 -209 -111 -205 -86 L -156 -91 Q -77 -87 -77 -42 -77 -31 -91 -20 L -102 -14 -120 6 Q -140 22 -154 22 L -156 22 -156 23 -158 35 -143 34 -126 34 -118 33 -120 31 Q -120 8 -80 6 L -78 6 -84 -6 Q -84 -24 -59 -19 -35 -14 -35 0 -35 10 -45 12 L -41 21 -37 21 Q -24 21 -19 33 L -16 45 -24 56 Q -34 65 -47 65 L -53 65 Q -53 73 -59 83 L -59 89 Q -59 99 -69 103 L -80 105 -99 117 -84 119 Q -63 102 -9 95 L -6 95 10 73 Q 38 50 96 50 L 118 45 123 42 81 48 65 48 48 48 Q -7 48 -24 25 -31 15 -31 -7 -31 -26 4 -35 -29 -38 -54 -54 -79 -69 -79 -79 L -75 -95 Q -96 -103 -106 -127 -106 -154 -53 -160 L -40 -161 Q -38 -179 7 -184 53 -190 53 -172 L 35 -152 Q 15 -136 1 -136 L -1 -136 -1 -135 -3 -123 12 -124 38 -124 35 -127 Q 35 -150 75 -152 L 77 -152 Q 71 -157 71 -164 71 -182 96 -177 L 106 -174 107 -179 93 -179 Q 62 -179 50 -196 L 48 -198 45 -204 42 -218 Q 42 -231 82 -231 L 84 -231 89 -231 Q 113 -230 125 -222 L 135 -205 178 -210 184 -210 204 -208 219 -205 239 -198 244 -190 264 -190 261 -198 265 -214 252 -221 248 -225 234 -246 235 -253 Q 241 -274 287 -279 L 300 -280 M 114 -147 L 110 -146 114 -137 108 -120 96 -108 102 -94 96 -75 96 -69 95 -63 127 -64 132 -64 134 -64 124 -67 114 -75 108 -89 110 -97 Q 115 -110 141 -107 L 145 -106 Q 160 -104 167 -97 L 173 -90 Q 200 -108 251 -108 L 312 -102 Q 309 -111 309 -126 L 310 -132 298 -124 Q 271 -110 236 -110 190 -110 165 -121 L 153 -128 Q 131 -132 118 -144 L 114 -147 M 61 -41 L 62 -43 56 -41 61 -41 M 330 -198 L 329 -197 337 -195 336 -199 330 -198 M 323 -156 L 320 -144 344 -154 334 -155 323 -157 323 -156 M 203 -18 L 200 -9 236 -10 Q 251 -5 254 1 L 254 2 270 -8 203 -18 M 372 -71 L 350 -74 353 -54 Q 353 -38 341 -26 L 340 -25 Q 413 -34 419 -5 428 0 428 8 L 418 23 405 31 401 35 401 36 Q 407 32 417 31 L 449 30 454 30 456 30 446 27 436 19 430 5 432 -3 Q 437 -16 463 -13 L 467 -12 Q 482 -10 489 -3 L 495 4 496 12 490 24 Q 484 31 474 32 L 485 34 499 38 496 34 493 28 Q 493 19 507 14 L 505 13 Q 495 3 495 -10 L 498 -20 477 -18 Q 440 -18 423 -31 411 -39 411 -49 L 399 -48 Q 381 -48 375 -58 L 371 -69 372 -71 M 663 -275 Q 663 -259 642 -245 L 638 -243 Q 611 -229 576 -229 L 560 -229 Q 525 -231 505 -240 L 493 -246 491 -248 Q 483 -256 483 -265 483 -290 519 -301 L 573 -309 590 -309 Q 654 -310 662 -283 L 663 -276 663 -275 M 571 -277 L 564 -274 571 -272 595 -274 598 -277 598 -278 571 -277 M 534 -140 L 503 -152 489 -150 475 -149 Q 447 -149 429 -159 L 418 -167 414 -171 Q 405 -164 396 -160 L 411 -158 414 -157 471 -138 489 -122 500 -124 562 -128 572 -129 570 -131 565 -132 551 -135 534 -140 M 422 -69 L 422 -63 428 -66 427 -71 427 -73 422 -72 422 -69 M 585 -70 Q 622 -69 652 -55 L 666 -60 656 -61 645 -63 Q 630 -67 617 -74 L 608 -79 590 -92 581 -85 585 -70 M 711 -189 L 697 -177 693 -174 693 -173 692 -163 685 -149 691 -149 700 -149 699 -150 697 -152 700 -162 Q 704 -170 718 -174 L 715 -177 711 -188 711 -189 M 651 -103 L 659 -101 658 -105 652 -104 651 -103 M 954 -211 Q 979 -205 984 -189 L 985 -182 985 -181 Q 985 -165 964 -151 L 960 -149 954 -146 Q 929 -135 898 -135 L 882 -135 Q 847 -137 827 -146 L 815 -152 813 -154 Q 805 -162 805 -171 805 -196 841 -207 L 895 -215 912 -215 954 -211 M 954 -130 L 991 -121 1005 -112 1008 -109 Q 1015 -99 1015 -79 L 1014 -69 1003 -51 993 -43 989 -41 954 -33 942 -33 887 -38 873 -41 856 -46 Q 809 -60 809 -79 L 811 -88 Q 814 -99 827 -110 L 834 -115 Q 861 -133 913 -133 L 954 -130 M 920 -184 L 893 -183 886 -180 893 -178 917 -180 920 -183 920 -184 M 984 -143 Q 989 -154 1014 -157 L 1026 -158 1061 -151 Q 1070 -146 1070 -137 L 1070 -133 1059 -121 1044 -113 1015 -110 1012 -110 995 -122 994 -123 982 -137 983 -140 984 -143 M 1084 -94 L 1082 -81 1072 -74 1061 -73 1046 -76 1037 -83 1033 -94 Q 1033 -104 1053 -108 L 1059 -110 1072 -110 Q 1084 -109 1084 -94 M 1042 -35 L 1072 -32 1074 -32 Q 1090 -28 1090 -17 L 1080 -2 1072 4 1034 12 Q 1010 12 1000 4 994 -1 994 -6 994 -29 1028 -34 L 1042 -35 M 1261 107 Q 1270 112 1270 121 L 1270 125 1259 137 1244 145 1215 148 1212 148 1195 136 1194 135 1182 121 1183 118 1184 115 Q 1189 104 1214 101 L 1226 100 Q 1250 100 1261 107 M 1282 177 Q 1278 185 1261 185 L 1246 182 Q 1240 180 1237 175 L 1233 164 Q 1233 154 1253 150 L 1259 148 Q 1284 143 1284 164 L 1282 177 M 1242 223 L 1274 226 Q 1290 230 1290 241 L 1280 256 Q 1264 270 1234 270 1210 270 1200 262 L 1194 252 Q 1194 229 1228 224 L 1242 223 M 1120 74 L 1093 75 1086 78 1093 80 1117 78 1120 75 1120 74 M 1027 112 L 1015 106 1013 104 1009 99 Q 999 106 981 113 L 967 118 958 125 964 138 964 140 Q 976 131 1010 120 L 1034 115 1027 112 M 858 153 L 852 154 851 155 859 157 858 153 M 845 195 L 817 184 808 179 790 166 786 162 783 154 787 138 774 131 772 129 770 127 756 106 757 99 Q 762 82 792 76 760 75 745 63 L 737 56 738 58 741 71 740 78 738 82 741 89 741 94 Q 741 111 727 125 L 723 129 705 142 706 142 726 144 741 147 761 154 766 162 780 171 781 173 785 188 785 191 784 199 771 213 Q 754 224 722 227 L 724 233 724 235 720 241 706 253 702 256 695 261 695 262 696 270 691 281 694 281 Q 697 276 707 272 L 709 268 Q 713 260 727 256 L 740 254 746 253 748 253 Q 742 248 742 241 L 743 236 Q 748 231 760 227 L 765 228 767 228 Q 791 233 791 247 L 789 255 801 261 807 259 810 257 814 256 Q 815 246 823 238 826 234 831 232 L 831 226 832 220 842 208 852 203 866 198 856 197 845 195 M 994 264 L 985 269 973 279 972 280 995 276 1013 275 1023 273 1027 273 1022 271 1006 262 1002 258 994 264 M 935 297 L 939 292 907 295 891 295 866 293 Q 860 285 843 287 L 842 286 838 289 Q 828 298 815 298 802 298 794 290 L 786 280 784 276 779 285 776 290 Q 772 294 767 297 L 773 310 773 312 769 327 767 330 767 334 767 336 Q 767 346 757 350 L 746 352 727 364 742 366 745 367 765 372 Q 767 362 776 354 L 792 344 Q 805 337 825 333 L 825 332 836 320 843 315 Q 854 307 870 303 L 922 297 935 297 M 1003 424 Q 1003 401 1037 396 L 1051 395 1072 396 1083 398 Q 1099 402 1099 413 L 1089 428 1072 438 1043 442 Q 1019 442 1009 434 L 1003 424 M 1210 378 Q 1261 362 1261 391 1261 418 1214 418 L 1165 416 Q 1158 413 1158 406 1158 395 1210 378 M 1070 563 Q 1070 590 1023 590 L 974 588 Q 967 585 967 578 967 567 1019 550 1070 534 1070 563 M 699 23 L 694 23 672 20 664 18 659 19 645 24 638 31 Q 628 40 615 40 602 40 594 32 L 583 32 569 32 564 38 Q 555 49 539 49 L 515 45 Q 526 54 526 67 L 525 76 522 85 517 90 Q 501 101 453 101 416 101 395 82 382 69 382 60 L 383 53 384 51 387 46 Q 361 61 318 61 L 312 64 328 72 Q 359 92 359 107 359 123 319 138 L 257 151 Q 273 155 273 166 L 263 181 Q 247 195 217 195 193 195 183 187 177 182 177 177 177 154 211 149 L 176 140 125 150 70 145 67 149 81 148 99 159 100 169 Q 100 192 65 198 L 82 197 99 197 Q 163 196 171 223 L 172 230 173 230 201 255 213 254 248 261 Q 257 266 257 275 L 257 279 246 291 231 299 Q 237 300 240 304 L 246 302 Q 271 297 271 318 L 269 331 Q 265 339 248 339 L 238 338 241 351 240 358 226 374 222 377 229 377 257 379 Q 263 358 309 353 L 322 352 324 347 325 345 Q 329 339 339 336 350 331 369 329 L 371 329 381 328 379 326 376 320 Q 373 313 373 306 L 376 300 Q 384 293 413 293 L 415 293 420 293 Q 444 294 456 302 L 466 319 509 314 514 314 515 314 535 316 550 319 568 325 583 324 582 318 583 311 584 309 586 305 583 303 581 301 579 299 565 278 566 271 Q 571 254 601 248 L 618 245 631 244 633 239 634 237 Q 638 231 648 228 L 668 223 Q 651 218 640 208 L 636 205 Q 629 198 628 192 L 627 187 627 185 628 178 629 173 615 173 Q 584 173 572 156 L 570 154 567 148 564 134 567 128 564 120 Q 564 106 576 96 L 592 86 Q 599 82 609 79 L 606 73 Q 606 66 609 61 613 49 629 44 L 642 41 654 39 Q 667 33 688 26 L 699 23 M 465 73 L 469 70 462 70 462 72 465 73 M 472 127 L 484 124 Q 531 113 531 137 L 519 153 Q 504 164 483 164 446 164 436 145 L 440 139 445 136 461 130 472 127 M 418 233 Q 422 221 438 216 L 451 213 463 211 483 210 501 211 519 213 530 216 544 225 547 230 550 243 549 250 547 254 535 266 531 269 512 278 498 280 484 281 Q 456 281 438 271 L 427 263 423 259 418 251 415 245 Q 415 238 418 233 M 594 360 L 617 358 620 355 619 354 593 355 594 360 M 414 345 L 397 361 Q 377 377 363 377 L 361 377 361 378 359 390 374 389 391 389 400 389 399 388 397 386 Q 397 380 400 376 406 364 431 362 L 436 361 436 359 436 358 433 349 434 345 424 345 414 345 M 470 393 L 458 405 464 417 472 417 476 418 Q 491 420 498 427 L 504 434 505 442 499 454 Q 493 461 483 462 L 494 464 508 468 505 464 502 458 Q 502 450 513 446 517 437 527 428 L 534 423 Q 561 405 613 405 L 638 406 636 403 640 397 598 403 582 403 543 398 516 399 511 399 484 396 471 393 470 393 M 441 460 L 458 460 463 460 465 460 455 457 453 456 448 458 441 460 M 531 483 L 535 497 534 506 534 507 584 504 598 503 614 511 634 505 587 500 556 492 531 483 M 664 328 L 668 329 668 328 664 328 M 253 50 L 271 52 Q 259 47 253 42 L 253 46 253 50 M 296 173 Q 296 162 348 145 399 129 399 158 399 185 352 185 L 303 183 Q 296 180 296 173 M 143 34 L 139 36 150 33 147 32 143 34 M 53 200 L 36 200 Q 5 200 -11 187 L -15 183 -23 189 Q -48 205 -102 206 L -98 215 Q -98 221 -116 235 -136 251 -150 251 L -152 251 -152 252 -113 250 Q -107 238 -82 236 L -84 228 -79 218 -62 209 -22 201 28 205 53 200 M 181 289 L 178 291 192 300 195 303 199 302 182 290 181 289 M 21 297 L 10 290 Q 0 280 0 267 L 2 260 0 258 -18 259 -38 258 -43 267 -55 279 Q -49 285 -49 293 L -49 294 Q -49 302 -55 312 L -55 318 Q -55 328 -65 332 L -76 334 -95 346 -80 348 -77 349 Q -37 359 -20 368 -6 375 -2 384 L 71 378 85 377 Q 100 382 103 388 L 104 398 104 401 106 401 111 401 Q 135 402 147 410 L 157 427 200 422 187 416 Q 181 411 181 406 181 395 189 388 L 175 389 129 379 74 374 43 366 Q -4 352 -4 333 L -2 324 Q 1 313 14 302 L 21 297 M 351 435 L 359 437 358 433 352 434 351 435 M 325 534 Q 337 534 342 544 L 343 546 346 558 338 569 Q 328 578 315 578 296 578 286 560 L 279 542 Q 279 530 287 534 L 301 541 307 539 310 537 325 534 M 264 658 Q 264 620 353 608 441 595 441 632 441 651 423 667 396 693 340 693 340 700 302 687 264 674 264 658 M 219 691 Q 204 702 183 702 146 702 136 683 136 673 184 662 231 651 231 675 L 219 691 M 196 572 L 185 572 199 576 196 572 M 165 611 L 169 608 162 608 162 610 165 611 M 658 686 Q 658 675 710 658 761 642 761 671 761 698 714 698 L 665 696 Q 658 693 658 686 M 533 554 L 537 557 Q 553 561 556 573 567 564 580 563 L 574 554 553 555 533 554 M -256 -160 Q -256 -196 -188 -195 -121 -195 -121 -162 -121 -151 -136 -139 -156 -124 -187 -124 -225 -124 -244 -142 L -256 -160 M -276 -4 Q -276 7 -291 19 -311 34 -342 34 -380 34 -399 16 -409 7 -411 -2 -411 -38 -343 -37 -276 -37 -276 -4 M -3 -76 L -4 -80 -10 -79 -11 -78 -3 -76 M -174 191 L -171 203 -174 210 -144 203 -142 203 Q -163 199 -173 189 L -175 189 -174 191 M -317 424 L -323 436 Q -329 443 -339 444 L -314 450 -320 440 Q -320 425 -281 421 -242 416 -242 437 -242 443 -249 450 -258 461 -274 461 L -298 457 Q -287 466 -287 479 -287 495 -296 502 -312 513 -360 513 -397 513 -418 494 -431 481 -431 472 -431 438 -359 442 L -357 442 Q -370 439 -377 431 L -383 417 Q -383 395 -350 399 -317 404 -317 424 M -351 482 L -351 484 -348 485 -344 482 -351 482 M -226 408 L -212 415 -206 413 -203 411 -188 408 Q -176 408 -171 418 L -170 420 -167 432 -175 443 Q -185 452 -198 452 -217 452 -227 434 L -234 416 Q -234 404 -226 408 M -173 567 Q -173 574 -211 561 -249 548 -249 532 -249 494 -160 482 -72 469 -72 506 -72 525 -90 541 -117 567 -173 567 M -294 565 Q -309 576 -330 576 -367 576 -377 557 -377 547 -329 536 -282 525 -282 549 -282 556 -294 565";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 243 -274 Q 221 -259 192 -259 159 -259 145 -268 L 138 -278 Q 138 -312 200 -312 261 -314 261 -295 261 -287 243 -274 M 277 -286 L 273 -292 Q 273 -301 291 -301 309 -301 309 -292 309 -282 293 -282 L 277 -286 M 270 -264 Q 270 -278 306 -278 375 -278 375 -261 375 -254 366 -250 L 309 -241 281 -252 Q 270 -257 270 -264 M 29 -275 L 21 -264 22 -263 17 -262 Q -11 -262 -13 -282 -13 -295 11 -299 35 -303 35 -285 L 29 -275 M 63 -261 L 59 -267 Q 59 -275 84 -274 108 -273 108 -264 L 102 -257 95 -255 Q 71 -255 63 -261 M 123 -289 L 115 -281 Q 109 -278 107 -278 93 -278 93 -289 93 -299 108 -296 123 -294 123 -289 M 183 -217 Q 183 -250 243 -240 302 -230 302 -213 302 -205 269 -197 L 234 -191 Q 203 -191 190 -202 183 -209 183 -217 M 162 -223 Q 155 -216 131 -216 109 -216 100 -226 L 96 -237 Q 96 -249 131 -249 165 -250 165 -237 L 162 -223 M 174 -148 Q 152 -131 112 -131 L 56 -139 47 -131 35 -127 Q 50 -122 50 -107 L 48 -102 53 -94 53 -92 62 -98 90 -107 Q 107 -107 115 -100 L 120 -91 118 -84 124 -84 148 -83 147 -87 Q 134 -90 134 -104 134 -116 145 -117 L 161 -115 189 -123 Q 180 -132 180 -140 180 -149 205 -161 L 216 -165 216 -166 Q 216 -178 273 -182 L 303 -181 Q 305 -192 326 -196 346 -199 349 -187 357 -204 391 -199 L 399 -197 443 -203 471 -201 482 -205 475 -205 Q 453 -205 453 -223 453 -235 464 -236 L 492 -233 Q 511 -233 511 -223 L 501 -213 Q 495 -209 489 -207 L 515 -209 Q 576 -211 576 -192 L 573 -185 577 -180 573 -174 563 -172 560 -172 558 -171 Q 536 -156 507 -156 L 496 -156 490 -153 468 -144 Q 480 -142 480 -134 L 477 -120 Q 474 -117 467 -115 L 499 -108 498 -114 499 -121 Q 492 -122 490 -126 488 -128 489 -131 489 -143 506 -144 518 -144 521 -138 L 558 -137 562 -136 613 -143 596 -149 Q 585 -154 585 -161 585 -172 607 -174 L 605 -179 592 -183 588 -189 Q 588 -198 606 -198 L 621 -195 625 -195 Q 645 -192 645 -178 L 645 -174 666 -172 663 -180 Q 663 -203 693 -201 L 713 -197 726 -200 780 -197 792 -188 Q 792 -170 740 -170 L 722 -174 720 -171 Q 713 -162 692 -162 L 689 -162 690 -158 Q 690 -151 681 -147 L 658 -141 Q 702 -137 702 -115 702 -103 679 -91 655 -79 622 -78 645 -74 645 -61 L 642 -54 Q 654 -49 659 -40 L 660 -42 661 -45 662 -48 678 -50 Q 696 -50 697 -39 697 -31 680 -31 L 671 -31 662 -33 663 -26 Q 663 -14 650 -4 L 654 4 Q 654 18 632 30 L 618 37 618 39 Q 618 51 599 51 L 600 52 595 53 592 53 577 50 579 52 573 54 567 51 567 49 554 50 542 50 506 47 503 47 490 63 Q 498 58 503 56 514 52 518 61 L 533 57 Q 555 53 555 62 L 547 71 528 77 518 76 514 80 508 81 498 79 485 70 483 68 486 66 456 73 419 69 408 66 407 65 402 63 393 64 367 59 358 59 344 57 342 57 305 55 Q 299 54 299 46 L 301 41 297 41 263 39 262 39 Q 241 52 207 52 L 201 52 191 59 156 71 156 80 150 99 146 104 146 106 141 118 Q 134 126 120 126 92 126 95 112 L 80 107 76 110 Q 64 123 47 123 L 30 123 38 133 55 133 Q 67 138 67 142 L 61 152 38 159 33 160 35 166 Q 35 176 23 176 L -14 174 -20 165 Q -20 157 -6 155 L -16 140 -16 138 -12 133 1 130 5 131 6 131 18 132 18 128 20 122 -27 114 Q -47 107 -47 96 -47 64 20 59 31 48 66 43 L 65 38 66 30 34 32 17 31 -16 53 Q -52 66 -92 66 -139 66 -160 50 -172 40 -172 29 -172 13 -163 6 -146 -7 -86 -7 L -22 -2 Q -21 -29 28 -31 L 28 -32 44 -34 58 -31 70 -30 65 -33 Q 58 -39 57 -46 L 43 -44 Q 24 -44 24 -52 24 -69 43 -75 59 -80 62 -64 L 75 -76 Q 51 -76 49 -84 L 39 -82 Q 20 -82 20 -94 20 -101 32 -102 L 29 -103 11 -93 Q 0 -93 -9 -119 L -8 -122 -10 -122 -38 -133 Q -49 -138 -49 -145 -49 -159 -13 -159 L 26 -157 21 -166 Q 21 -173 52 -189 81 -204 102 -208 129 -215 161 -197 189 -180 189 -173 189 -160 174 -148 M 6 -199 L -14 -214 -25 -230 Q -25 -248 24 -247 72 -245 72 -230 72 -223 45 -209 18 -194 6 -199 M 95 -119 Q 95 -130 112 -129 128 -127 128 -119 128 -107 109 -107 98 -107 95 -114 L 95 -119 M 131 -22 L 113 -22 89 -24 Q 102 -17 102 -3 L 102 3 132 3 Q 142 -11 171 -16 173 -23 183 -24 177 -27 170 -33 L 135 -23 131 -22 M 188 -47 Q 204 -53 204 -33 L 199 -23 203 -18 238 -15 272 -22 272 -23 Q 272 -41 293 -50 L 288 -55 286 -60 252 -54 244 -53 239 -53 227 -53 191 -56 188 -47 M 358 -201 Q 339 -201 339 -213 339 -221 356 -222 372 -223 372 -213 372 -201 358 -201 M 332 -159 L 329 -159 326 -156 346 -148 347 -151 363 -153 Q 381 -153 382 -142 L 380 -137 387 -127 387 -126 396 -126 Q 408 -124 408 -116 L 408 -113 425 -116 415 -123 411 -134 Q 411 -139 417 -141 396 -144 386 -151 361 -151 352 -163 L 347 -176 344 -172 336 -161 337 -160 332 -159 M 392 -104 Q 383 -108 383 -118 L 384 -121 360 -106 339 -96 Q 337 -84 317 -73 L 326 -59 326 -58 337 -60 336 -63 350 -76 357 -80 367 -86 387 -95 393 -104 392 -104 M 671 -282 Q 666 -288 666 -295 666 -325 710 -318 753 -310 753 -297 L 742 -282 Q 728 -270 706 -270 680 -270 671 -282 M 675 -258 Q 675 -248 660 -237 636 -221 589 -221 539 -221 514 -237 499 -248 499 -259 499 -268 524 -280 550 -292 576 -292 L 576 -290 626 -280 Q 675 -268 675 -258 M 477 -291 Q 477 -273 425 -273 400 -273 394 -293 394 -303 411 -303 L 465 -300 477 -291 M 428 -226 Q 417 -226 414 -233 L 414 -238 Q 414 -249 431 -248 447 -246 447 -238 447 -226 428 -226 M 414 -3 L 414 -10 Q 414 -25 432 -28 L 427 -28 405 -29 405 -25 Q 405 -18 395 -9 L 383 1 383 2 405 -4 414 -3 M 495 -30 Q 495 -51 531 -58 L 531 -62 531 -63 Q 531 -75 588 -79 L 591 -79 Q 568 -81 556 -88 L 549 -88 528 -89 529 -82 Q 529 -72 510 -60 L 498 -54 489 -45 Q 472 -32 446 -29 465 -28 465 -13 L 460 -1 Q 453 7 439 7 L 433 7 435 12 434 17 446 17 463 18 462 16 462 13 Q 462 -3 471 -10 L 476 -12 498 -19 Q 495 -25 495 -30 M 711 -223 Q 702 -227 702 -237 702 -248 715 -245 727 -243 727 -235 727 -226 711 -223 M 729 -135 Q 729 -146 746 -145 762 -143 762 -135 762 -123 743 -123 732 -123 729 -130 L 729 -135 M 807 -130 Q 826 -130 826 -120 L 816 -110 Q 804 -102 790 -102 768 -102 768 -120 768 -132 779 -133 L 807 -130 M 672 -74 Q 672 -87 701 -87 L 714 -94 758 -100 Q 825 -100 825 -74 825 -60 805 -50 L 769 -39 765 -38 747 -38 Q 715 -38 701 -48 L 699 -49 692 -58 Q 685 -60 680 -64 L 672 -74 M 772 -13 Q 844 -6 844 21 844 31 825 43 803 56 773 56 L 770 56 767 56 759 56 749 55 725 50 710 54 712 55 718 67 720 67 738 62 Q 759 61 759 71 L 758 74 773 77 784 74 810 74 810 73 Q 810 50 852 43 857 39 870 38 L 884 37 908 38 929 40 947 45 Q 978 54 978 77 978 92 956 104 L 950 107 Q 947 114 936 114 L 927 113 887 116 862 114 847 118 819 124 812 124 791 123 Q 776 120 768 113 L 765 109 754 110 Q 728 110 729 98 L 709 99 706 99 705 106 739 118 743 121 761 120 Q 807 122 817 137 L 851 133 854 133 881 134 Q 885 125 906 128 933 132 933 142 933 154 914 154 L 908 154 905 158 904 159 894 168 Q 876 183 851 183 813 183 801 169 L 771 176 742 174 722 181 Q 740 187 741 199 L 748 196 752 191 765 188 769 189 784 190 811 189 871 193 Q 881 178 922 173 L 922 172 923 170 924 167 925 164 941 162 Q 956 162 959 170 L 977 170 964 164 962 163 955 154 954 148 Q 954 133 964 125 L 969 122 Q 976 99 1021 98 L 1032 98 1031 92 Q 1031 80 1042 79 L 1070 82 Q 1089 82 1089 92 L 1079 102 1070 107 1075 119 1075 120 Q 1088 127 1088 138 1088 152 1068 162 L 1062 165 Q 1073 166 1074 173 L 1084 171 Q 1100 171 1100 181 L 1100 184 1107 194 1096 209 1092 213 Q 1107 221 1107 233 1107 243 1088 255 L 1081 259 Q 1078 266 1065 268 L 1061 266 1036 268 994 264 976 268 982 280 983 285 983 290 981 297 993 301 995 295 Q 1001 287 1018 286 L 1021 286 1038 290 1047 290 Q 1077 293 1077 306 L 1074 320 Q 1067 329 1046 329 1030 329 1023 322 L 1017 322 998 319 977 325 Q 966 325 961 317 L 961 316 944 319 922 319 917 319 908 318 870 310 863 307 864 314 857 330 857 332 851 346 841 354 840 354 Q 819 367 785 367 L 779 367 Q 744 366 724 357 L 719 357 710 357 701 355 698 349 698 348 699 346 700 343 701 340 705 339 704 335 Q 704 325 710 318 718 306 740 301 L 745 298 753 294 762 292 761 291 748 282 746 280 766 268 Q 777 264 781 273 L 782 282 781 288 781 289 797 288 851 296 850 293 850 292 851 285 854 279 846 283 829 286 Q 811 286 808 274 L 807 268 808 262 805 262 797 262 782 265 Q 772 265 769 259 L 766 259 Q 748 254 737 246 L 728 235 720 241 697 247 663 250 652 245 635 239 Q 624 234 624 227 L 628 219 629 219 625 217 621 215 617 215 612 214 610 213 607 212 603 214 599 216 597 217 590 221 589 222 588 222 549 232 546 232 543 232 535 232 525 231 516 229 516 230 512 236 498 239 Q 476 239 482 231 482 225 499 224 L 501 224 499 223 Q 492 218 492 213 492 196 509 188 513 183 525 182 L 528 181 554 179 605 184 639 178 634 176 618 168 604 158 600 152 599 149 Q 599 145 610 138 L 588 134 578 142 577 142 Q 556 155 522 155 L 516 155 Q 476 154 456 142 441 133 441 123 441 113 447 106 457 92 486 87 L 518 85 553 88 554 88 553 85 Q 553 69 590 68 595 59 608 53 L 638 46 Q 641 42 652 41 L 652 29 Q 652 -4 706 -5 L 718 -5 723 -10 772 -13 M 804 -28 Q 804 -40 821 -41 837 -41 837 -31 837 -18 819 -18 808 -18 805 -23 803 -25 804 -28 M 975 -134 Q 951 -118 904 -118 854 -118 829 -134 814 -145 814 -156 814 -165 839 -177 865 -189 891 -189 L 891 -187 941 -177 Q 990 -165 990 -155 990 -145 975 -134 M 981 -192 Q 981 -222 1025 -215 1068 -207 1068 -194 1068 -189 1057 -179 1043 -167 1021 -167 995 -167 986 -179 981 -185 981 -192 M 867 -75 Q 867 -83 880 -83 892 -83 892 -77 L 888 -71 878 -69 867 -72 867 -75 M 940 -92 Q 960 -89 960 -75 960 -63 938 -63 927 -63 922 -71 L 919 -79 Q 919 -94 940 -92 M 1008 -98 Q 1038 -95 1038 -82 L 1035 -68 Q 1028 -59 1007 -59 989 -59 982 -68 L 978 -77 Q 978 -100 1008 -98 M 938 -40 Q 1017 -41 1017 -12 1017 0 994 12 L 993 13 1043 15 Q 1055 20 1055 24 L 1049 34 1045 41 Q 1039 48 1027 48 L 1000 42 985 38 Q 975 33 972 22 L 972 20 931 25 887 21 887 23 Q 887 33 871 33 L 868 33 855 29 851 23 Q 851 14 869 14 L 870 14 860 5 Q 853 -5 858 -16 858 -39 938 -40 M 1030 -142 Q 1042 -140 1042 -132 1042 -123 1026 -120 1017 -124 1017 -134 1017 -145 1030 -142 M 1320 33 Q 1306 45 1284 45 1258 45 1249 33 L 1244 20 Q 1244 -10 1288 -3 1331 5 1331 18 L 1320 33 M 1289 92 Q 1280 88 1280 78 1280 67 1293 70 1305 72 1305 80 1305 89 1289 92 M 1238 78 Q 1214 94 1167 94 1117 94 1092 78 1077 67 1077 56 1077 47 1102 35 1128 23 1154 23 L 1154 25 1204 35 Q 1253 47 1253 57 1253 67 1238 78 M 1241 135 Q 1241 112 1271 114 1301 117 1301 130 L 1298 144 Q 1291 153 1270 153 1252 153 1245 144 L 1241 135 M 1311 235 L 1313 241 1308 253 1290 260 Q 1270 260 1258 251 L 1250 241 Q 1250 228 1281 228 1305 228 1311 235 M 1257 224 Q 1231 237 1194 237 1136 237 1123 217 1116 207 1121 196 1121 173 1201 172 1280 171 1280 200 1280 212 1257 224 M 1324 354 Q 1304 370 1262 370 1236 370 1230 357 L 1230 344 Q 1230 311 1284 310 1338 309 1338 331 1338 343 1324 354 M 1219 316 Q 1194 328 1150 328 1107 328 1086 309 1073 297 1073 285 1073 253 1157 252 1241 251 1241 289 1241 304 1219 316 M 1295 385 Q 1295 380 1316 377 1337 376 1337 386 L 1315 401 1295 385 M 1272 436 Q 1253 454 1205 454 1159 454 1140 434 L 1130 415 Q 1130 388 1207 382 1284 377 1284 410 1284 424 1272 436 M 1028 174 L 1010 174 999 174 Q 1017 179 1020 192 1022 179 1033 174 L 1028 174 M 1182 133 Q 1182 118 1203 120 1223 123 1223 137 1223 149 1201 149 1190 149 1185 141 L 1182 133 M 1143 129 Q 1155 129 1155 135 L 1151 141 1141 143 1130 140 1130 137 Q 1130 129 1143 129 M 992 82 L 992 77 Q 992 66 1009 67 1025 69 1025 77 1025 89 1006 89 995 89 992 82 M 920 350 L 926 352 969 348 970 347 Q 982 331 1024 332 1082 334 1082 358 1073 380 1053 386 1047 393 1033 400 L 1004 410 1004 413 998 432 994 436 Q 1017 445 1017 465 1017 480 995 492 970 504 926 504 883 504 862 485 849 473 849 461 849 438 892 431 L 888 429 876 423 864 431 Q 842 444 812 444 L 779 442 775 448 761 451 757 451 758 456 759 461 759 466 749 482 745 486 737 492 720 495 648 487 650 493 648 502 645 505 633 512 627 522 617 530 616 530 Q 601 540 578 542 577 556 556 568 L 509 579 504 590 503 592 506 592 Q 533 596 533 606 L 531 613 538 612 Q 555 609 555 618 L 551 624 537 627 Q 515 627 521 619 L 522 618 514 618 488 614 494 619 488 621 482 618 482 613 486 613 479 605 469 605 449 603 434 598 425 595 406 587 382 574 373 568 354 574 Q 324 574 329 557 329 551 332 547 338 539 355 538 L 358 538 Q 374 538 379 547 389 540 410 536 410 527 417 522 L 388 523 375 523 371 522 360 520 340 518 333 516 349 504 Q 349 494 328 495 307 498 307 503 L 300 493 299 487 274 488 248 482 240 489 232 494 223 500 284 508 308 516 310 518 312 519 318 527 319 532 320 537 320 542 310 558 306 562 298 568 281 571 248 570 217 572 190 570 194 584 188 598 178 606 177 606 Q 156 619 122 619 L 116 619 Q 76 618 56 606 41 597 41 587 41 577 47 570 52 563 61 559 L 53 554 50 548 Q 50 535 76 536 L 92 539 85 534 83 532 103 520 Q 114 516 118 525 L 119 534 118 540 114 544 108 545 98 543 101 550 118 549 152 552 142 533 Q 142 522 156 514 L 154 514 142 514 106 511 103 511 Q 86 506 76 499 L 63 504 65 512 Q 65 534 41 534 L 19 533 16 533 11 549 17 564 17 570 Q 12 590 -19 597 L -51 599 -64 599 -68 598 -92 590 -100 583 -107 565 Q -107 554 -99 548 L -100 547 Q -128 534 -128 523 -128 508 -74 507 L -59 506 -55 500 -53 498 -42 492 -38 491 Q -29 490 -25 497 L -23 503 -23 507 6 515 Q 8 508 17 504 L -3 498 -8 496 -17 491 -32 488 -36 483 -37 481 -32 475 -29 473 -23 469 -19 467 -18 465 Q -6 449 36 450 L 71 455 71 454 76 452 78 451 98 445 104 444 126 442 Q 109 437 98 427 L 90 418 89 419 79 426 59 433 47 435 29 440 7 435 5 435 -22 431 -27 434 -44 437 -118 428 Q -137 421 -138 411 L -138 410 -137 403 Q -134 390 -117 383 L -84 375 -72 373 -71 373 -66 373 -29 376 -16 371 -25 359 -26 353 -26 352 -26 350 -40 358 -61 368 -79 368 -92 360 -93 360 -103 366 -107 367 -124 373 -150 378 -157 379 -158 379 -166 380 -171 380 -183 380 -219 377 -222 377 -251 364 -262 350 -262 348 -263 346 -263 345 -263 343 Q -263 327 -254 320 L -249 318 -247 317 -227 311 -221 310 -177 307 -152 308 -117 311 -91 317 -83 321 -73 320 -69 320 -61 320 -20 327 -17 329 -7 325 -2 320 33 316 47 317 95 327 106 332 110 329 121 326 131 325 131 323 133 314 Q 133 307 140 302 L 110 308 109 308 94 312 86 311 80 307 79 306 77 305 Q 76 298 62 300 L 60 299 53 290 44 291 45 292 40 292 22 292 11 292 -11 288 -24 282 -26 281 -33 272 -34 266 Q -34 251 -24 243 L -19 240 -11 236 -6 235 -9 233 Q -37 220 -37 209 -37 196 4 193 6 184 21 185 34 187 37 192 107 190 107 217 107 234 93 242 L 99 249 100 255 100 256 115 255 142 256 142 255 Q 142 247 155 247 167 247 167 253 L 163 259 166 260 Q 176 264 176 272 L 173 279 164 290 160 292 158 293 152 297 162 294 174 292 192 291 205 290 207 290 221 289 245 290 266 292 284 297 289 302 290 306 290 309 292 318 289 328 269 342 240 352 217 355 210 362 199 366 184 370 183 371 230 378 Q 253 387 253 407 L 253 408 Q 252 422 231 434 L 197 444 208 445 234 451 243 455 Q 246 442 259 435 L 266 432 262 431 259 425 259 424 260 422 261 419 262 416 266 415 278 414 Q 293 414 296 422 L 297 425 297 428 337 433 Q 350 438 350 449 L 350 450 358 450 372 451 420 461 424 461 426 462 443 467 Q 456 474 456 488 L 456 494 448 508 453 507 481 504 486 494 494 486 Q 468 482 460 469 L 458 466 456 457 447 454 446 453 444 444 Q 444 427 474 423 L 499 426 517 425 513 422 502 408 502 406 501 404 501 403 501 401 Q 501 385 510 378 L 515 376 517 375 537 369 543 368 587 365 612 366 644 358 664 355 702 356 Q 730 362 734 386 L 734 395 728 414 724 419 Q 713 429 693 429 L 673 427 661 424 657 425 640 431 614 436 610 437 Q 617 443 617 452 L 614 462 594 476 595 477 609 481 618 480 636 482 626 469 626 468 627 461 Q 630 448 647 441 L 680 433 692 431 693 431 698 431 Q 731 429 747 440 749 437 759 436 L 757 435 750 430 739 417 738 411 738 410 Q 738 396 747 387 L 757 383 762 378 797 374 811 375 Q 859 380 875 393 L 897 390 Q 893 381 897 372 L 883 370 Q 877 369 877 361 L 879 356 889 351 905 349 916 350 920 350 M 871 265 L 882 261 868 254 864 255 850 258 Q 865 259 865 268 L 871 265 M 850 349 L 860 347 Q 876 347 876 357 876 370 858 370 L 844 365 843 360 844 357 Q 844 352 850 349 M 814 490 Q 807 498 793 498 763 498 768 481 768 475 771 471 777 463 794 462 L 797 462 Q 819 462 819 478 L 814 490 M 1145 361 L 1149 361 1142 351 Q 1142 336 1169 340 1196 344 1196 354 1196 366 1177 366 L 1151 362 1157 367 1151 369 1145 366 1145 361 M 1089 417 L 1087 426 1089 432 1082 440 1065 443 Q 1048 443 1041 436 L 1038 430 1034 427 1026 417 Q 1026 404 1057 404 1081 404 1087 411 L 1089 417 M 1111 372 Q 1133 368 1133 377 L 1125 386 1106 392 Q 1088 392 1088 382 1088 376 1111 372 M 1092 553 Q 1113 552 1113 562 1113 567 1091 577 L 1071 561 Q 1071 556 1092 553 M 1100 530 Q 1080 546 1038 546 1012 546 1006 533 L 1006 520 Q 1006 487 1060 486 1114 485 1114 507 1114 519 1100 530 M 1048 612 Q 1029 630 981 630 935 630 916 610 L 906 591 Q 906 564 983 558 1060 553 1060 586 1060 600 1048 612 M 927 538 L 933 543 927 545 921 542 921 537 925 537 918 527 Q 918 512 945 516 972 520 972 530 972 542 953 542 L 927 538 M 909 553 L 901 562 882 568 Q 864 568 864 558 864 552 887 548 909 544 909 553 M 840 594 Q 865 596 865 608 L 858 616 841 619 Q 824 619 817 612 L 814 606 Q 814 593 840 594 M 810 564 L 761 556 756 554 Q 741 548 741 539 741 530 746 523 758 507 800 508 858 510 858 534 846 564 810 564 M 621 240 L 625 239 Q 634 238 638 245 L 640 251 640 253 661 260 668 270 668 268 Q 668 251 698 247 728 244 728 260 L 725 273 726 278 726 283 Q 723 290 712 290 L 703 289 694 282 682 281 671 278 670 277 668 270 657 285 654 288 667 291 Q 680 298 680 312 L 680 318 684 327 684 330 681 334 680 335 670 344 Q 652 359 627 359 589 359 577 345 L 573 339 571 338 567 335 555 340 537 344 525 345 518 350 498 357 485 359 471 360 466 360 444 359 416 354 415 355 407 359 390 362 Q 372 362 369 350 L 368 344 369 338 Q 371 333 378 331 L 376 328 375 325 Q 375 321 386 314 L 389 312 Q 391 309 396 308 L 406 302 426 293 433 291 439 287 Q 464 276 488 275 L 485 275 482 275 464 272 454 265 450 254 Q 450 249 456 247 L 485 242 494 243 496 243 507 244 Q 519 246 519 254 L 516 268 506 273 505 274 491 275 491 277 541 287 543 288 541 285 538 280 537 274 538 267 Q 540 258 549 253 L 560 250 586 250 593 251 594 250 608 248 610 246 621 240 M 420 117 Q 441 121 441 135 L 439 144 Q 467 150 471 174 L 471 183 468 196 Q 477 198 477 202 L 469 210 461 213 454 212 434 217 438 217 Q 462 218 462 227 L 456 234 449 236 417 230 413 224 414 222 Q 417 218 428 217 L 410 215 395 210 389 208 387 211 387 214 Q 387 228 375 240 L 370 244 378 244 419 251 426 261 426 262 423 267 399 282 378 292 363 293 340 294 337 294 322 290 Q 312 285 309 274 L 309 272 313 267 326 264 330 265 331 265 330 264 329 261 330 257 312 258 310 262 Q 303 271 282 271 266 271 259 264 L 257 262 253 253 254 247 243 238 233 219 Q 233 192 310 186 L 343 186 330 174 334 163 333 161 333 150 332 151 329 154 328 155 Q 316 163 298 163 295 170 280 170 L 260 168 265 175 Q 265 185 250 196 L 242 201 230 206 212 210 200 211 179 212 118 203 104 196 94 186 88 184 Q 68 177 68 167 68 134 127 136 L 165 141 166 141 166 142 173 145 216 153 218 154 249 163 245 155 Q 245 145 257 144 L 256 138 256 134 257 132 253 132 Q 210 132 189 113 176 101 176 89 176 57 260 56 317 55 335 73 L 343 72 355 71 373 72 385 73 387 74 Q 426 78 426 98 L 420 117 M 483 395 L 478 395 472 395 474 400 473 405 472 407 471 408 464 412 436 415 429 415 408 413 405 414 404 415 414 421 415 424 421 423 Q 437 423 437 433 437 446 419 446 L 411 445 406 447 397 447 383 445 378 439 Q 378 430 384 424 L 385 423 369 425 370 426 365 426 347 426 336 426 314 422 301 416 299 415 292 406 291 400 Q 291 386 300 378 L 274 372 270 369 267 366 264 365 Q 256 363 255 358 L 254 354 Q 254 346 271 345 L 284 347 293 346 311 348 Q 319 349 323 353 L 325 359 323 368 342 365 350 364 375 361 378 362 389 364 395 367 412 372 424 383 425 389 444 384 453 385 467 390 467 389 Q 467 381 480 381 492 381 492 387 L 488 393 483 395 M 390 27 L 368 24 362 27 Q 371 26 375 33 L 384 32 392 32 397 27 390 27 M 342 35 L 345 36 347 34 342 35 M 229 243 L 235 255 234 261 216 267 221 269 224 273 224 275 Q 224 285 208 285 L 205 285 192 281 188 275 Q 188 266 206 266 L 197 259 197 258 194 251 Q 194 236 215 238 L 217 239 229 243 M 183 136 Q 161 136 167 128 167 122 184 121 201 118 201 127 L 197 133 183 136 M 141 234 Q 141 221 167 222 192 224 192 236 L 185 244 168 247 Q 151 247 144 240 L 141 234 M 10 312 L -22 306 -26 300 -25 298 Q -22 294 -11 293 L -9 293 -7 293 -1 293 Q 23 294 23 303 L 17 310 10 312 M 100 373 L 89 379 96 384 Q 105 377 123 374 L 109 368 100 373 M 329 329 Q 329 318 346 319 362 321 362 329 L 358 338 343 341 Q 333 341 330 335 L 329 334 329 329 M 361 584 Q 419 586 419 610 407 640 371 640 L 322 632 317 630 Q 302 624 302 615 302 606 307 599 319 583 361 584 M 226 603 L 242 601 253 602 257 602 Q 266 604 269 610 L 269 614 269 615 Q 269 624 257 624 L 220 622 Q 214 621 214 613 L 216 608 226 603 M 225 681 Q 197 668 197 657 197 642 251 641 L 269 640 Q 341 638 341 665 L 335 684 Q 325 696 296 696 L 259 692 238 687 225 681 M 378 688 L 375 682 Q 375 669 401 670 426 672 426 684 L 419 692 402 695 Q 385 695 378 688 M 39 608 Q 67 614 71 638 L 71 647 65 666 61 671 Q 50 681 30 681 L 10 679 -5 674 -14 671 -33 663 -57 650 -70 638 -66 627 -65 626 Q -54 615 -19 610 L 1 607 39 608 M 82 695 Q 82 689 99 688 116 685 116 694 L 112 700 98 703 Q 76 703 82 695 M 161 665 L 140 669 Q 107 669 107 656 107 646 136 645 164 644 164 657 L 161 665 M 774 608 Q 764 620 735 620 L 698 616 677 611 664 605 663 605 661 606 Q 641 622 599 622 573 622 567 609 L 567 596 567 593 Q 546 590 546 580 546 570 575 569 L 584 569 621 562 662 567 690 565 708 564 Q 780 562 780 589 L 774 608 M 708 539 Q 708 548 696 548 L 659 546 Q 653 545 653 537 L 655 532 665 527 681 525 692 526 696 526 Q 705 528 708 534 L 708 538 708 539 M 632 637 Q 632 632 653 629 674 628 674 638 674 643 652 653 L 632 637 M 609 688 Q 590 706 542 706 496 706 477 686 L 467 667 Q 467 640 544 634 621 629 621 662 621 676 609 688 M 448 624 Q 470 620 470 629 L 462 638 443 644 Q 425 644 425 634 425 628 448 624 M -302 -143 Q -330 -143 -332 -163 -332 -176 -308 -180 -284 -184 -284 -166 L -290 -156 -298 -145 -297 -144 -302 -143 M -260 -148 Q -260 -156 -235 -155 -211 -154 -211 -145 -211 -140 -217 -138 L -224 -136 Q -248 -136 -256 -142 L -260 -148 M -211 -177 Q -196 -175 -196 -170 -196 -165 -204 -162 L -212 -159 Q -226 -159 -226 -170 -226 -180 -211 -177 M -344 -111 Q -344 -129 -295 -128 -247 -126 -247 -111 -247 -104 -274 -90 -301 -75 -313 -80 L -333 -95 Q -344 -106 -344 -111 M -298 -47 L -267 -70 Q -238 -85 -217 -89 -190 -96 -158 -78 L -130 -54 Q -130 -41 -145 -29 -167 -12 -207 -12 -251 -12 -279 -28 -298 -39 -298 -47 M -223 -118 Q -223 -130 -188 -130 -154 -131 -154 -118 -154 -107 -157 -104 -164 -97 -188 -97 -210 -97 -219 -107 L -223 -118 M -76 -155 Q -98 -140 -127 -140 -160 -140 -174 -149 L -181 -159 Q -181 -193 -119 -193 -58 -195 -58 -176 -58 -168 -76 -155 M -42 -167 L -46 -173 Q -46 -182 -28 -182 -10 -182 -10 -173 -10 -163 -26 -163 L -42 -167 M -136 -98 Q -136 -131 -76 -121 -17 -111 -17 -94 -17 -86 -50 -78 L -85 -72 Q -116 -72 -129 -83 L -136 -98 M -46 -13 Q -103 -13 -103 -47 -103 -59 -46 -63 11 -66 11 -45 11 -39 -3 -28 -21 -13 -46 -13 M -116 101 Q -40 101 -40 136 -40 148 -57 158 L -57 159 -41 163 -36 168 -35 172 -36 177 -44 183 -67 189 -101 192 -112 187 -129 181 -140 170 -171 162 -174 163 -176 164 -180 166 Q -165 175 -163 194 L -159 195 -125 204 Q -121 198 -98 197 -70 196 -70 209 -70 215 -73 217 L -94 221 -108 220 -115 228 -126 232 -141 236 -169 242 -176 242 -197 241 -202 240 -219 232 -263 217 -279 217 -282 217 -300 214 -310 207 -314 196 Q -314 191 -308 189 L -303 187 Q -301 171 -266 164 L -272 155 -271 151 -285 151 -292 151 -295 152 -303 155 -310 154 -317 147 -334 135 -341 117 Q -341 87 -279 87 -217 87 -217 116 L -217 121 -210 121 -187 121 Q -172 101 -116 101 M -169 64 Q -169 86 -193 86 L -226 82 -229 72 Q -229 55 -199 51 -169 48 -169 64 M -115 86 Q -115 97 -126 97 L -151 84 Q -115 56 -115 86 M -118 246 L -120 251 -107 252 -103 252 Q -90 254 -84 260 L -80 269 -80 270 -74 268 Q -54 265 -51 277 L -50 280 -47 280 Q -32 280 -29 288 L -28 291 Q -28 298 -40 299 L -45 299 -54 299 -60 298 -64 303 -63 304 -68 305 -71 305 -86 302 -97 289 Q -114 301 -137 301 -175 301 -187 287 L -191 281 -194 272 -194 268 -194 267 Q -194 259 -171 255 L -152 252 -152 247 Q -152 241 -135 240 -118 237 -118 246 M -70 224 L -71 220 Q -71 212 -54 211 -43 210 -39 215 L -38 220 -38 225 Q -41 232 -52 232 L -61 231 -70 224 M -244 43 Q -271 43 -271 33 -271 29 -257 21 L -229 12 Q -212 12 -204 19 L -199 28 Q -199 36 -209 40 L -244 43 M -285 18 Q -286 16 -290 16 -295 16 -308 26 -319 26 -328 0 -328 -13 -298 -11 -269 -9 -269 12 -269 19 -280 19 L -285 18 M -257 61 L -259 70 -276 75 Q -295 75 -295 67 -295 50 -276 44 -257 38 -257 61 M -351 166 L -350 164 Q -347 160 -336 159 L -334 159 -332 159 -326 159 Q -302 160 -302 169 L -308 176 -315 178 -347 172 -351 166 M -375 148 L -375 150 -377 153 -378 154 -381 158 -389 169 -388 170 -393 171 -396 171 -411 168 Q -422 163 -423 151 L -422 149 Q -420 138 -399 134 -379 131 -376 143 L -375 148 M -394 186 L -386 186 -345 193 Q -338 197 -338 203 L -338 204 -341 209 -365 224 Q -377 231 -386 234 L -404 234 -424 219 -434 206 -435 203 -434 199 Q -430 187 -398 186 L -394 186 M -308 225 L -283 224 Q -267 226 -249 236 L -245 239 Q -221 254 -221 260 -221 268 -227 276 L -236 285 -246 292 -266 299 -279 301 -293 302 -298 302 -320 301 -349 296 -354 294 -370 286 -384 276 -388 270 -389 267 -378 256 -375 254 Q -373 251 -368 250 L -358 244 -338 235 -308 225 M -292 337 L -290 342 -291 347 -292 349 -293 350 -300 354 -328 357 -335 357 -357 354 -361 349 -362 347 -357 341 -354 339 -348 335 -342 332 Q -330 326 -320 326 L -311 327 -295 333 -292 337 M -375 306 Q -360 311 -360 326 L -362 331 -367 333 -371 333 -376 332 -378 331 -381 330 -399 340 Q -410 340 -419 314 L -418 311 Q -415 301 -389 303 L -386 304 -375 306 M -363 357 Q -354 356 -350 363 L -348 369 -348 375 -350 384 -353 387 -358 389 -367 389 -381 387 -386 381 -380 366 -378 364 Q -374 360 -367 358 L -363 357 M -318 395 L -320 386 Q -320 369 -290 365 -260 362 -260 378 -260 400 -284 400 L -306 399 -317 396 -318 395 M -338 404 L -321 409 Q -308 416 -308 430 L -308 436 Q -313 456 -344 463 L -376 465 -389 465 -393 464 -417 456 -425 449 -432 431 Q -431 406 -390 403 L -382 402 -370 401 -352 402 -340 403 -338 404 M -390 492 Q -379 481 -344 476 L -324 473 -286 474 Q -258 480 -254 504 L -254 513 Q -254 522 -260 532 L -264 537 Q -275 547 -295 547 L -315 545 -330 540 -339 537 -358 529 -382 516 -395 504 -391 493 -390 492 M -206 400 L -207 406 -211 410 -217 411 -227 409 -240 400 -242 398 Q -230 389 -222 386 -211 382 -207 391 L -206 400 M -207 415 L -172 418 -169 419 Q -131 425 -131 450 -131 457 -137 464 L -147 472 -148 472 Q -169 485 -203 485 L -209 485 Q -249 484 -269 472 -284 463 -284 453 L -278 436 Q -268 422 -239 417 L -207 415 M -109 474 L -99 469 -85 467 -94 448 -93 445 Q -90 435 -64 437 L -61 438 -50 440 Q -35 445 -35 460 L -37 465 -42 467 -46 467 -51 466 -53 465 -56 464 -66 469 -56 476 -56 480 -56 481 Q -56 490 -68 490 L -105 488 -111 479 -109 474 M -185 535 Q -218 535 -218 522 -218 512 -189 511 -161 510 -161 523 L -164 531 -185 535 M -60 688 L -55 690 -47 701 -49 703 -48 704 -53 705 Q -70 705 -67 695 L -65 689 -60 688 M -227 569 Q -249 569 -243 561 -243 555 -226 554 -209 551 -209 560 L -213 566 -227 569 M -380 556 L -372 567 -374 569 -373 570 -378 571 Q -395 571 -392 561 L -390 555 -385 554 -380 556";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -284 -143 L -307 -140 -312 -140 -318 -137 Q -358 -113 -358 -91 -358 -85 -333 -76 L -309 -59 -314 -47 -313 -44 -332 -16 -396 37 -409 50 -429 60 -418 61 -434 82 -436 84 -453 99 -450 104 -449 106 Q -469 136 -470 150 L -487 181 -467 195 -463 194 Q -453 194 -450 205 L -442 210 -440 209 -435 214 Q -397 238 -397 243 -397 254 -408 254 L -423 249 -428 247 -424 292 -421 301 Q -406 344 -406 349 L -410 360 -404 397 Q -410 398 -419 405 L -441 427 -446 430 -445 433 -446 438 Q -437 466 -423 466 -400 495 -357 528 -252 608 -135 618 L -70 619 Q -60 621 -58 632 L -55 648 -27 664 1 676 Q 22 687 35 699 L 137 688 204 674 Q 252 665 252 680 L 252 682 300 690 Q 395 709 395 730 395 742 382 742 L 277 718 234 708 214 703 169 718 154 724 126 727 51 726 52 733 59 745 55 753 48 756 Q 19 742 13 742 L 16 755 4 763 Q -8 763 -111 700 -137 684 -167 656 -182 642 -204 642 L -208 647 -216 651 -235 642 Q -245 636 -265 636 -276 627 -268 619 -301 597 -357 563 -419 526 -426 526 L -430 528 -435 530 Q -448 530 -451 502 -451 496 -461 480 L -475 457 -495 414 -493 406 -492 406 -487 407 -479 402 -473 394 -460 391 Q -453 391 -451 383 -448 375 -448 347 -448 324 -456 293 L -465 263 Q -465 248 -477 234 L -504 201 -516 190 -508 176 -463 95 -430 27 -408 5 -402 0 -384 -13 -346 -41 Q -374 -81 -396 -87 L -381 -118 -355 -148 Q -364 -151 -364 -159 L -259 -228 Q -171 -267 -153 -270 L -128 -266 Q -123 -266 -117 -270 L -103 -274 -93 -272 -71 -283 -28 -294 Q -9 -294 60 -313 L 88 -320 91 -320 102 -322 102 -325 105 -325 104 -327 Q 104 -332 130 -334 139 -326 173 -309 223 -283 251 -283 L 318 -295 356 -311 427 -326 435 -327 Q 465 -310 548 -287 L 707 -248 765 -248 864 -255 875 -253 895 -236 939 -203 974 -169 Q 977 -159 996 -153 L 996 -151 998 -152 1009 -150 1058 -145 1101 -142 1161 -46 1217 48 1234 56 Q 1293 87 1315 107 L 1317 109 1327 125 Q 1327 134 1319 135 1330 139 1330 151 L 1325 194 1325 285 1327 332 1325 370 1311 417 1305 465 Q 1302 493 1287 498 1258 507 1158 580 L 1077 638 Q 1102 641 1102 653 1102 665 1074 665 L 1031 662 952 659 938 657 926 654 900 654 Q 864 647 836 689 807 733 790 733 L 772 708 788 690 809 664 825 640 Q 837 628 855 628 L 993 616 Q 1001 614 1004 619 L 1007 628 1030 627 1035 628 Q 1215 480 1225 480 L 1237 486 Q 1254 486 1267 450 L 1268 450 Q 1278 450 1284 436 L 1288 417 1285 398 1285 397 1285 395 1283 395 Q 1276 386 1261 386 L 1235 380 1227 380 1242 339 1239 334 1236 328 1250 270 1272 191 1283 161 Q 1284 171 1294 171 L 1298 170 1299 167 1292 137 1295 127 1295 126 1295 122 Q 1295 109 1281 102 L 1243 84 1207 65 1170 48 1169 48 1157 29 1119 -36 1089 -90 Q 1082 -117 1051 -116 L 1007 -109 990 -111 989 -111 932 -178 920 -200 893 -212 876 -221 831 -230 784 -222 744 -215 Q 709 -215 667 -233 616 -255 567 -262 532 -280 470 -285 L 456 -286 451 -290 440 -291 422 -292 366 -295 303 -285 279 -275 164 -292 139 -296 117 -305 102 -302 73 -303 Q 55 -296 19 -292 L -35 -281 -115 -240 -172 -202 Q -201 -181 -230 -168 L -284 -143 M 422 -292 L 421 -295 422 -301 416 -299 411 -297 407 -296 422 -292 M 689 -284 L 690 -285 700 -283 689 -284 M 598 -311 L 609 -308 591 -312 598 -311 M 1007 -212 L 1004 -213 1008 -219 Q 1024 -242 1024 -220 L 1021 -207 1007 -212 M -398 -48 L -398 -51 -397 -53 -391 -49 -395 -48 -398 -48";
	ctx.fillStyle=tocolor(ctrans.apply([237,241,242,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1283 161 L 1283 158 1285 139 Q 1264 134 1208 100 L 1177 81 1173 81 Q 1163 81 1146 61 L 1128 31 1115 5 1099 -22 1088 -49 1066 -74 1018 -80 Q 984 -84 982 -99 975 -102 967 -108 L 952 -124 917 -156 902 -171 889 -186 875 -183 Q 869 -183 860 -189 L 830 -196 791 -189 742 -182 Q 690 -182 646 -205 601 -228 570 -228 539 -228 499 -248 L 448 -256 434 -259 416 -258 396 -261 365 -264 Q 330 -264 307 -251 284 -238 277 -238 L 185 -252 107 -269 87 -269 Q 72 -254 47 -253 L 5 -253 -53 -236 Q -128 -202 -142 -188 -161 -167 -231 -137 -294 -111 -311 -111 -322 -111 -329 -102 L -338 -93 -345 -94 -346 -103 Q -346 -113 -284 -143 L -230 -168 Q -201 -181 -172 -202 L -115 -240 -35 -281 19 -292 Q 55 -296 73 -303 L 102 -302 139 -296 164 -292 279 -275 303 -285 366 -295 422 -292 440 -291 451 -290 456 -286 470 -285 Q 532 -280 567 -262 616 -255 667 -233 709 -215 744 -215 L 784 -222 831 -230 876 -221 893 -212 920 -200 932 -178 989 -111 990 -111 1007 -109 1051 -116 Q 1082 -117 1089 -90 L 1119 -36 1157 29 1169 48 1170 48 1207 65 1243 84 1281 102 Q 1295 109 1295 122 L 1295 126 1291 135 1292 137 1299 167 1298 170 1294 171 Q 1284 171 1283 161 M -313 -44 Q -297 -63 -297 -35 -297 -11 -332 26 L -382 69 Q -408 85 -429 118 L -458 171 Q -470 166 -470 151 L -470 150 Q -469 136 -449 106 L -441 93 -434 82 -418 61 -409 50 -396 37 -332 -16 -313 -44 M -404 397 Q -393 395 -393 415 -393 419 -408 443 L -423 466 Q -437 466 -446 438 L -445 433 -441 427 -419 405 Q -410 398 -404 397 M 1267 450 Q 1257 449 1255 437 1254 426 1258 416 1240 415 1228 405 L 1219 390 Q 1219 381 1227 380 L 1235 380 1261 386 Q 1276 386 1283 395 L 1285 398 1288 417 1284 436 Q 1278 450 1268 450 L 1267 450";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape1968(ctx,ctrans,frame,ratio,time){
	var pathData="M 296 85 L 262 87 274 88 282 88 293 89 303 90 296 85 M 663 427 L 665 428 657 435 663 427 M 607 482 L 607 483 605 486 604 486 607 482 M 526 290 L 528 289 524 289 526 290 M 538 55 L 507 54 449 58 Q 463 68 490 68 517 68 538 55 M 763 94 L 764 94 760 96 763 94 M 791 102 L 793 103 783 111 791 102 M 753 67 L 733 74 Q 710 69 705 62 L 723 65 754 57 753 67 M 725 82 L 740 95 713 124 694 148 681 163 671 175 674 179 676 182 659 210 Q 641 239 641 251 L 633 288 624 322 632 331 639 323 641 325 Q 641 334 651 344 L 655 347 614 375 622 383 586 395 Q 549 410 536 420 517 433 513 448 L 505 476 492 527 490 538 477 541 436 534 Q 431 550 412 564 377 592 312 592 288 592 283 570 L 283 556 282 554 282 550 283 549 283 547 284 534 272 528 266 526 267 524 194 522 Q 137 503 61 465 L 53 465 -25 468 -29 468 -45 461 Q -54 451 -48 438 L -37 425 -36 425 -36 418 -40 409 -62 396 -67 394 Q -86 391 -86 380 L -86 379 Q -136 342 -142 316 L -145 309 -142 295 Q -138 259 -115 245 L -109 241 -127 238 -154 226 Q -175 212 -151 194 -135 182 -113 177 L -96 175 -88 174 -41 178 -40 178 -43 177 Q -58 176 -55 167 L -53 166 -47 166 Q -39 167 -35 170 L -24 156 -14 144 12 118 24 108 43 106 46 99 39 66 39 64 Q 43 53 54 44 L 47 36 Q 37 25 36 14 60 49 93 49 128 49 144 24 L 156 31 179 20 224 20 256 31 271 26 303 17 320 20 338 23 390 17 436 10 Q 431 26 436 40 L 437 42 462 33 547 33 562 35 582 14 Q 581 24 587 34 L 590 39 652 52 673 42 697 57 693 64 Q 712 72 725 82 M 35 117 L 57 117 69 115 71 115 64 110 53 102 31 118 35 117 M 5 147 L -3 167 -4 169 18 166 5 147 M 5 204 L 3 203 0 203 Q -16 199 -3 188 L 6 183 -5 173 -13 190 Q -10 194 -12 199 -2 203 -1 206 L 0 205 5 204 M 85 446 L 81 449 78 451 95 458 91 454 85 446 M 270 458 L 298 456 320 455 Q 331 449 339 446 L 338 446 321 439 319 440 Q 295 455 257 446 L 256 446 252 446 243 453 257 453 270 458 M 140 477 Q 135 472 120 470 L 149 482 148 478 140 477 M 350 541 L 302 546 298 543 Q 302 556 334 556 L 360 549 350 541 M 423 586 L 414 577 Q 414 563 439 561 L 486 555 480 581 443 594 Q 433 594 423 586 M -38 51 L -36 50 -40 56 -41 55 -38 51 M -31 27 L -32 33 -35 31 -31 27 M -272 211 L -272 212 -276 219 -278 218 -272 211 M -13 216 L -29 221 -34 223 -53 241 -39 237 -13 216 M -240 164 L -258 191 -258 190 -241 164 -240 164 M -201 287 L -189 288 Q -156 296 -171 314 -177 294 -201 287 M -71 353 L -88 350 -104 342 -81 364 -71 353 M -207 266 Q -215 261 -207 253 L -193 248 -175 248 Q -156 253 -167 262 -179 273 -200 269 L -207 266 M -116 325 L -114 329 -115 325 -116 325";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 686 99 L 646 137 Q 642 139 641 140 L 639 142 638 148 Q 612 137 582 136 L 571 136 538 129 427 115 401 115 Q 396 108 366 108 L 318 113 314 114 262 115 Q 316 118 403 136 L 408 136 456 140 Q 483 146 483 152 L 505 158 Q 544 168 597 193 L 623 207 633 209 655 217 Q 641 240 641 251 L 633 288 630 298 602 309 601 307 603 304 578 314 569 314 567 318 547 335 Q 550 346 533 359 L 518 370 518 372 513 378 Q 506 390 466 408 477 427 464 442 461 470 318 466 L 304 468 276 473 204 468 173 453 76 433 11 413 -21 399 -32 397 -44 390 -55 388 -65 383 -88 377 Q -111 372 -116 351 -121 327 -95 308 -87 301 -66 295 L -56 292 -56 286 Q -53 274 -12 244 L 0 234 5 232 3 231 0 230 Q -16 228 -3 216 5 211 21 208 L 36 206 41 208 44 209 41 205 40 201 Q 30 181 41 166 L 36 169 35 160 51 147 69 143 71 142 64 138 Q 41 123 38 108 L 43 106 46 99 43 85 Q 58 62 113 41 145 25 194 16 L 349 6 352 5 400 -1 435 6 461 7 571 21 605 29 616 29 Q 655 30 683 47 718 70 686 99 M 526 319 L 528 317 524 317 526 319";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -166 361 L -167 360 -165 360 -166 361 M -91 233 Q -68 215 -22 225 25 236 -29 249 L -100 260 Q -115 257 -113 253 L -91 233 M 315 301 Q 323 294 340 295 L 361 299 Q 396 309 375 314 L 335 320 320 314 Q 305 309 315 301 M 153 470 L 153 475 155 475 160 472 153 470 M 194 403 Q 163 397 166 372 166 351 188 334 210 316 249 316 L 303 322 Q 339 330 349 338 373 354 336 382 307 404 254 407 L 194 403 M 60 488 L 82 493 63 493 -25 496 17 485 60 488 M 41 259 Q 65 266 82 284 103 311 68 332 59 340 30 342 67 353 28 372 -14 395 -49 388 L -71 375 Q -83 364 -63 350 L -52 342 -69 339 Q -90 335 -102 327 -123 312 -91 288 -73 273 -31 263 L 41 259 M 161 340 L 170 351 Q 132 377 111 383 125 388 131 397 134 407 129 427 L 126 435 156 431 165 428 193 429 205 430 236 435 257 443 283 443 315 447 326 452 351 453 Q 375 458 371 469 366 481 338 473 324 472 321 467 L 319 468 Q 295 483 257 474 L 254 472 241 483 231 488 250 492 255 493 254 492 Q 262 486 298 483 L 339 484 Q 371 491 335 508 305 523 273 516 L 266 522 Q 231 540 185 530 L 175 528 157 518 148 507 140 506 Q 132 498 105 495 L 91 482 Q 78 467 90 453 L 25 456 -22 442 Q -20 446 -23 448 L -35 453 -37 453 -36 452 Q -32 440 -48 432 L -33 437 -29 439 Q -50 425 -25 404 5 382 47 377 L 62 377 57 373 Q 42 362 59 350 93 325 143 336 L 161 340 M 170 302 L 157 297 Q 150 290 162 280 177 268 208 267 L 239 268 Q 269 276 244 294 217 313 170 302 M 155 196 L 158 196 160 194 155 194 Q 152 195 155 196 M 65 150 Q 105 153 76 175 46 196 31 195 2 186 10 167 15 157 35 152 L 65 150 M 121 57 L 183 55 Q 243 62 202 103 162 144 100 137 73 133 61 112 47 91 60 93 72 65 121 57 M 258 152 Q 291 156 275 173 258 193 234 189 L 219 185 225 198 241 192 261 191 Q 294 194 294 211 294 229 258 225 L 236 219 222 206 221 208 Q 211 244 156 238 141 236 124 226 98 214 105 195 117 172 139 166 151 162 177 166 199 167 210 175 L 210 163 Q 214 155 233 152 L 258 152 M 636 393 L 634 395 632 393 633 392 636 393 M 606 388 L 586 395 569 402 Q 576 387 606 388 M 505 476 L 503 484 501 484 Q 492 484 489 480 L 489 475 Q 489 467 504 465 L 509 464 505 476 M 408 408 L 425 398 417 398 401 407 399 409 408 408 M 453 372 Q 517 387 463 419 409 453 344 440 319 433 313 420 310 407 334 389 351 375 387 369 L 453 372 M 424 321 Q 459 329 437 346 413 363 379 356 L 361 345 Q 349 335 353 333 368 321 394 320 L 424 321 M 520 231 Q 526 216 555 210 L 597 207 Q 650 214 635 246 623 279 564 273 L 536 263 Q 511 251 520 231 M 483 132 L 485 137 486 137 490 134 483 132 M 472 210 Q 468 225 454 234 493 241 486 261 477 284 455 282 L 422 275 Q 393 266 401 249 L 406 243 382 241 Q 364 239 349 230 324 216 334 194 344 173 372 165 L 411 162 Q 484 171 472 210 M 678 21 L 671 21 662 33 663 36 670 34 678 21 M 229 -22 Q 235 -11 249 -5 276 9 308 10 L 305 10 Q 341 17 320 43 295 72 260 68 L 235 59 Q 218 48 226 30 L 233 20 216 20 181 10 Q 163 0 163 -16 L 214 -17 229 -22 M 434 -14 Q 466 -1 538 -3 L 599 -9 593 15 Q 579 42 535 52 L 481 55 Q 450 52 439 26 428 5 434 -14 M 630 -6 L 688 -11 Q 752 -4 724 39 697 82 631 75 606 72 594 59 583 45 594 22 602 5 630 -6 M 401 -10 L 416 -8 430 3 Q 413 35 397 44 411 47 421 56 L 437 88 440 97 463 90 469 85 494 83 504 83 536 84 558 90 580 87 609 87 623 91 645 88 Q 668 92 671 103 673 116 644 113 L 626 108 625 110 Q 613 128 575 123 L 572 122 566 135 559 141 580 143 582 143 582 142 Q 585 136 615 128 L 652 124 Q 683 127 662 149 643 170 614 167 L 610 173 Q 589 198 544 193 506 183 498 173 L 471 171 Q 455 168 435 152 416 138 418 122 394 137 363 133 L 314 124 317 131 308 137 300 141 308 149 293 152 265 145 Q 239 136 243 127 246 120 262 118 L 282 115 302 120 308 121 Q 280 108 291 84 304 55 339 46 L 350 43 344 40 Q 326 30 332 15 L 336 8 344 7 401 -10";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 378 -1 L 419 -5 Q 461 0 457 36 452 73 383 65 L 353 56 Q 335 45 344 23 352 8 378 -1 M 778 -36 L 776 -37 Q 772 -38 767 -41 L 778 -37 778 -36 M 672 -27 L 696 -34 731 -43 739 -42 Q 756 -41 763 -15 L 769 11 771 12 Q 766 25 739 36 L 700 43 Q 682 41 670 32 647 16 658 -8 L 672 -27 M 572 -4 L 572 -6 595 -8 595 -3 Q 593 4 580 2 L 575 1 Q 570 -1 572 -4 M 172 -14 L 210 -16 Q 247 -11 236 16 227 46 172 39 156 38 149 26 140 15 148 1 152 -11 172 -14 M 103 -20 Q 100 -7 80 -9 L 71 -11 Q 61 -16 64 -26 L 74 -32 88 -34 Q 108 -32 103 -20 M 640 390 L 634 395 632 393 636 389 640 390 M 633 367 Q 617 376 579 367 L 562 361 Q 546 352 561 342 571 334 598 332 L 623 334 632 362 633 367 M 624 300 L 621 299 Q 590 294 596 280 L 598 278 600 279 619 277 627 276 624 300 M 646 224 L 635 219 Q 623 210 630 194 638 179 667 172 L 673 171 671 175 674 179 676 181 Q 658 201 646 224 M 725 100 Q 701 92 705 82 718 57 748 60 755 61 759 68 L 757 74 Q 742 78 733 87 L 725 100 M 439 475 Q 407 465 419 455 447 434 477 440 L 485 449 462 472 439 475 M 420 371 Q 444 351 482 349 L 525 351 Q 542 355 534 377 L 526 401 529 403 Q 516 412 482 418 L 436 420 Q 418 416 409 407 394 390 420 371 M 430 304 Q 451 309 440 321 428 335 391 326 L 379 321 Q 367 314 377 308 387 299 405 299 L 430 304 M 513 321 L 525 330 505 332 Q 488 329 486 322 L 513 321 M 534 295 L 511 287 491 273 Q 484 267 515 257 545 246 556 248 580 250 573 273 564 299 534 295 M 426 104 Q 437 120 423 148 409 178 383 183 371 187 344 183 327 181 313 173 291 160 302 137 311 117 342 103 374 88 402 92 419 93 426 104 M 601 241 L 607 237 621 236 Q 635 238 630 250 626 262 613 261 L 605 257 Q 595 252 601 241 M 556 233 Q 541 226 546 215 551 204 566 201 L 588 203 Q 610 205 601 222 593 239 573 236 L 556 233 M 530 160 L 547 145 Q 567 130 580 131 608 135 611 166 614 196 558 190 L 537 183 Q 522 175 530 160 M 445 182 L 488 179 Q 501 181 521 197 545 216 527 228 516 238 484 249 L 439 259 Q 426 258 412 246 393 230 402 209 411 188 445 182 M 484 164 Q 428 158 442 130 447 117 475 111 L 508 109 Q 541 112 523 140 504 167 484 164 M 497 90 L 490 98 479 97 Q 460 98 465 85 469 77 482 78 501 81 497 90 M 476 15 Q 480 6 500 8 518 10 513 19 L 489 24 481 22 Q 473 20 476 15 M 525 27 L 569 22 Q 612 27 596 60 583 93 521 86 507 84 499 79 484 70 491 54 L 497 45 498 43 Q 508 33 525 27 M 575 101 Q 577 94 595 96 614 99 608 107 602 115 588 113 570 110 575 101 M 655 107 L 675 105 Q 704 108 689 141 680 159 655 157 644 155 638 149 L 629 133 Q 642 113 655 107 M 631 72 Q 635 62 654 65 669 67 666 74 665 83 646 82 L 638 79 Q 629 77 631 72 M 656 42 L 654 57 631 59 Q 602 57 607 45 610 38 625 34 L 644 31 Q 661 32 656 42 M 167 56 Q 190 58 182 72 174 84 156 83 144 82 143 78 140 74 147 60 L 167 56 M 158 103 L 198 98 Q 256 104 239 142 222 180 160 173 143 171 131 162 115 148 125 126 134 110 158 103 M 339 243 L 337 241 335 238 Q 338 233 351 234 383 238 380 253 377 267 355 266 314 256 318 251 L 339 243 M 318 199 L 339 197 353 201 Q 363 206 359 214 L 338 226 315 231 Q 298 230 305 216 310 204 318 199 M 301 192 Q 289 206 261 203 L 245 200 Q 240 195 245 183 250 171 288 175 313 178 301 192 M 257 218 L 273 219 Q 310 224 296 231 L 254 236 Q 242 235 246 225 L 257 218 M 263 145 Q 314 151 259 162 242 153 244 148 L 263 145 M 274 37 Q 245 36 251 21 254 15 270 13 L 290 13 Q 318 16 310 28 303 41 274 37 M 241 59 Q 245 50 268 47 L 296 44 Q 361 52 338 83 316 115 263 110 245 107 239 96 229 82 241 59 M 65 79 L 74 52 55 13 99 10 Q 143 15 125 51 108 87 80 83 L 65 79 M 42 22 L 49 48 48 66 47 64 Q 30 45 39 26 L 42 22 M -164 241 L -152 244 Q -143 244 -130 225 L -114 206 -76 211 -54 216 -24 210 Q 8 223 -35 248 -81 277 -127 267 L -154 255 -164 241 M 3 160 L 14 151 35 146 67 146 Q 143 156 118 188 L 90 211 119 215 Q 135 182 193 188 239 195 224 225 211 256 162 249 L 134 241 129 241 124 244 Q 96 265 42 253 L 20 248 Q 2 241 14 230 28 220 45 216 L 31 207 8 213 -9 198 18 194 Q -2 171 3 160 M 48 120 L 65 99 73 99 Q 94 102 86 115 77 128 61 127 L 48 120 M -189 317 Q -156 325 -171 343 -177 323 -201 314 L -189 317 M -60 306 Q -19 316 -46 339 -71 364 -127 351 -144 347 -145 337 -147 326 -132 314 -114 300 -60 306 M -65 289 Q -84 297 -93 294 -111 292 -102 284 L -82 279 -62 279 Q -48 282 -65 289 M -30 280 L -38 279 -39 276 -34 273 -29 278 -30 280 M -207 293 Q -215 288 -207 282 -202 278 -193 277 L -175 277 Q -156 281 -167 291 -179 302 -200 297 L -207 293 M 203 540 L 208 541 198 541 203 540 M 371 529 Q 402 535 369 559 344 578 302 574 292 564 272 556 L 266 554 276 542 Q 293 530 329 528 L 371 529 M 397 519 L 374 523 365 519 Q 361 515 367 510 L 392 508 Q 408 512 397 519 M 308 490 Q 335 473 352 471 363 468 374 471 403 477 368 503 349 519 325 514 L 311 504 308 490 M 348 445 Q 341 440 346 436 L 375 434 Q 390 436 383 443 L 357 447 348 445 M 382 403 Q 399 407 390 414 L 379 425 Q 373 430 354 425 323 419 335 409 L 361 403 382 403 M 215 489 Q 245 478 257 481 287 488 272 515 258 542 203 530 189 528 184 522 171 513 189 500 L 215 489 M 301 464 L 277 467 Q 259 463 268 456 L 294 453 Q 312 457 301 464 M 207 404 Q 211 399 217 397 L 221 394 Q 236 388 256 385 283 380 307 385 350 396 315 423 281 449 220 435 L 202 426 Q 190 417 207 404 M 252 258 L 263 262 Q 270 266 258 276 242 288 222 283 L 209 277 Q 200 269 210 260 L 231 257 252 258 M 211 368 L 242 365 Q 259 368 249 375 L 220 377 213 374 Q 206 372 211 368 M 324 362 L 334 360 346 361 Q 356 362 349 367 L 330 370 324 369 Q 320 367 324 362 M 351 346 Q 342 341 347 337 360 329 378 332 402 337 395 346 389 356 364 351 L 351 346 M 3 370 Q 68 386 26 410 -16 435 -67 423 -86 419 -86 408 -89 395 -64 376 -55 369 -28 369 L 3 370 M 110 463 Q 123 453 156 451 L 194 452 Q 227 460 192 482 156 503 137 498 80 486 110 463 M 183 424 Q 202 428 192 435 L 180 441 170 440 Q 148 437 161 427 L 183 424 M 81 477 L 53 493 -29 496 -45 489 Q -54 480 -48 467 L -36 452 -36 446 Q -15 435 19 427 L 91 425 Q 108 428 109 439 110 453 81 477 M 8 263 Q 23 266 16 279 8 290 -16 285 L -29 278 -22 266 8 263 M 15 343 Q 42 349 27 358 L -18 362 Q -48 357 -33 345 L -9 340 15 343 M 116 342 L 161 343 Q 205 353 180 384 155 415 84 400 L 58 388 Q 44 376 67 358 83 346 116 342 M 194 342 Q 170 330 200 307 220 292 254 287 282 282 304 287 351 298 309 328 266 360 228 351 L 194 342 M 137 268 Q 200 283 155 316 111 349 58 337 38 332 25 323 4 307 25 291 48 273 82 268 111 263 137 268";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 676 181 L 686 169 661 217 Q 637 266 637 278 L 646 303 Q 654 325 654 342 L 654 358 650 367 657 377 697 382 703 389 737 384 735 328 Q 735 299 740 291 756 268 817 271 L 817 276 766 280 Q 751 285 747 302 L 745 328 751 379 Q 751 391 732 398 L 699 404 688 399 684 393 640 390 636 389 628 383 633 367 632 362 623 334 621 322 622 311 624 309 625 309 624 303 624 300 627 276 Q 631 255 641 233 L 646 224 Q 658 201 676 181 M 757 74 L 789 71 Q 795 58 819 59 842 59 853 70 L 828 66 Q 821 66 792 82 736 94 717 121 703 152 687 166 L 682 166 681 161 695 135 713 111 725 100 733 87 Q 742 78 757 74 M 521 455 Q 484 575 473 584 L 535 571 Q 520 590 474 591 464 591 462 587 L 462 584 471 584 461 578 Q 457 578 446 587 L 433 596 428 595 426 590 448 554 479 497 490 452 Q 494 428 508 435 521 442 521 455 M 55 13 L 74 52 65 79 64 81 66 80 69 87 65 99 48 120 26 140 14 151 3 160 Q -17 178 -17 183 L -9 195 Q -9 204 -24 210 L -54 216 -76 211 -114 206 -130 225 Q -143 244 -152 244 L -164 241 -168 231 -163 219 -163 218 -170 219 -181 216 -182 212 Q -159 192 -142 184 L -142 183 -126 169 -104 148 -112 140 -108 122 -110 117 -118 111 -183 102 -188 84 Q -188 63 -178 59 L -183 71 -178 94 Q -168 109 -135 104 L -114 104 Q -101 112 -100 118 L -101 128 -94 137 -88 145 Q -88 155 -101 169 L -70 165 Q -54 165 -50 171 L -48 179 3 125 43 94 46 78 48 66 49 48 42 22 Q 42 -6 55 13";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape432(ctx,ctrans,frame,ratio,time){
	var pathData="M 251 -283 L 318 -295 356 -311 427 -326 435 -327 Q 465 -310 548 -287 L 707 -248 765 -248 814 -251 896 -235 918 -218 917 -217 905 -206 Q 922 -192 973 -171 L 974 -169 Q 978 -156 1009 -150 L 1027 -147 1050 -131 Q 1124 -122 1124 -102 1124 -61 1145 -40 L 1187 11 1217 50 Q 1245 76 1289 104 L 1322 128 Q 1322 178 1262 202 L 1289 271 1307 328 Q 1307 342 1296 353 1282 364 1257 365 L 1291 394 Q 1302 406 1302 421 1302 433 1290 456 1277 482 1263 488 1242 499 1220 520 1203 538 1183 543 1165 549 1114 606 1070 657 1017 657 L 926 645 905 649 857 655 Q 834 702 804 706 L 676 705 558 710 453 715 360 727 203 695 Q 73 732 -7 732 -16 732 -116 676 L -256 595 Q -276 583 -419 517 -481 488 -481 444 L -479 432 Q -475 427 -451 425 L -473 395 -473 394 -460 391 Q -453 391 -451 383 -448 375 -448 347 -448 324 -456 293 L -465 263 Q -465 248 -477 234 L -504 201 -516 190 -508 176 -463 95 -434 37 -422 17 -384 -13 -346 -41 Q -374 -79 -394 -86 -361 -136 -314 -178 -211 -271 -131 -240 -116 -247 -112 -257 L -102 -266 -85 -260 -68 -255 Q -47 -255 -43 -273 -39 -296 -30 -301 L 72 -300 81 -328 Q 84 -341 105 -341 117 -341 124 -333 132 -325 140 -325 L 144 -325 173 -309 Q 223 -283 251 -283";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 219 -281 L 218 -274 204 -258 200 -255 Q 186 -246 167 -244 L 153 -243 Q 125 -243 107 -253 L 96 -261 Q 86 -270 84 -279 L 87 -291 Q 91 -303 107 -308 L 152 -314 170 -313 188 -311 Q 209 -306 216 -294 L 219 -281 M 300 -280 L 302 -285 303 -287 Q 307 -293 317 -296 L 347 -303 349 -303 389 -300 393 -291 375 -271 Q 355 -255 341 -255 L 339 -255 339 -254 337 -242 352 -243 369 -243 378 -243 377 -244 375 -246 Q 375 -252 378 -256 384 -268 409 -270 L 415 -271 417 -271 Q 411 -276 411 -283 L 412 -288 429 -297 436 -296 Q 460 -291 460 -277 460 -267 450 -265 L 454 -256 453 -248 448 -239 436 -227 442 -217 474 -220 492 -219 510 -217 521 -214 Q 546 -227 591 -227 643 -227 669 -215 L 678 -210 681 -210 673 -216 672 -217 660 -231 661 -234 662 -237 Q 667 -248 692 -251 L 704 -252 739 -245 748 -231 748 -227 737 -215 722 -207 712 -205 715 -197 715 -195 Q 720 -200 731 -202 L 737 -204 756 -202 758 -202 Q 782 -197 782 -183 782 -173 772 -171 L 776 -162 775 -154 770 -145 758 -133 764 -120 768 -111 Q 768 -104 758 -96 L 758 -94 Q 758 -84 748 -80 L 737 -78 Q 728 -70 718 -66 L 733 -64 736 -63 793 -44 Q 807 -37 811 -28 L 822 -30 884 -34 898 -35 Q 913 -30 916 -24 L 917 -14 Q 917 17 853 17 L 822 13 806 4 802 0 794 6 Q 776 18 744 22 L 731 23 Q 737 26 739 34 L 744 31 Q 759 22 795 18 L 822 17 Q 852 18 856 35 872 23 890 24 L 954 31 990 47 1014 66 Q 1022 57 1041 51 L 1072 45 1095 43 1112 43 Q 1176 42 1184 69 L 1185 76 1185 77 Q 1185 93 1164 107 L 1160 109 Q 1133 123 1098 123 L 1082 123 1072 123 1057 121 1061 131 1072 129 1113 125 Q 1165 125 1191 137 L 1205 146 1208 149 Q 1215 159 1215 179 L 1214 189 1203 207 1193 215 1189 217 1142 225 1087 220 1073 217 1072 217 1056 212 Q 1009 198 1009 179 L 1011 170 1016 160 1014 160 965 158 960 155 958 158 958 162 958 164 954 174 948 178 937 180 918 192 933 194 936 195 954 200 993 214 Q 1007 221 1011 230 L 1022 228 1072 225 1084 224 1098 223 1116 234 1117 244 Q 1117 270 1072 275 L 1061 275 1070 279 1072 281 1076 284 1090 282 Q 1149 280 1190 305 1221 325 1221 340 L 1221 342 Q 1218 357 1181 371 L 1105 384 1072 382 Q 1041 378 1027 365 L 1023 361 1012 379 1002 387 998 389 954 397 951 397 914 395 911 397 925 406 926 416 Q 926 447 862 447 L 831 443 815 434 811 430 803 436 784 445 784 451 804 448 831 447 Q 861 448 865 465 881 453 899 454 L 954 459 999 477 Q 1030 497 1030 512 L 1030 514 Q 1027 529 990 543 L 954 553 914 556 Q 857 556 836 537 826 527 826 514 L 829 504 808 506 Q 771 506 754 493 L 744 483 742 475 748 464 749 464 746 462 737 455 736 453 719 453 715 453 715 459 714 469 703 487 693 495 688 498 737 503 742 503 774 506 Q 790 510 790 521 L 780 536 Q 766 548 741 550 L 736 555 732 559 Q 714 576 685 582 L 690 585 Q 721 605 721 620 721 636 681 651 644 664 605 664 548 664 527 645 517 635 517 622 L 520 612 499 614 Q 462 614 445 601 433 593 433 583 433 566 477 559 L 481 557 493 554 522 551 506 542 502 538 494 544 Q 468 561 410 561 363 561 344 544 L 338 538 Q 331 528 331 506 331 487 366 478 L 356 477 317 464 308 459 Q 283 444 283 434 L 287 418 274 411 270 407 267 410 Q 252 423 226 424 L 241 427 261 434 Q 264 443 280 451 L 285 471 284 479 271 493 Q 250 507 207 507 L 202 507 Q 192 516 168 525 L 167 526 Q 182 528 189 535 L 197 532 Q 248 516 248 545 L 248 546 Q 271 547 271 563 L 264 576 Q 255 587 239 587 L 215 583 Q 226 592 226 605 226 621 217 628 201 639 153 639 116 639 95 620 82 607 82 598 82 565 149 568 L 146 565 136 557 130 543 132 535 92 538 Q 35 538 14 519 4 509 4 496 L 7 486 -14 488 Q -51 488 -68 475 -80 467 -80 457 -80 437 -18 430 37 424 43 447 56 437 72 436 L 70 434 67 428 40 429 Q 9 429 -7 416 L -11 412 -19 418 Q -45 435 -103 435 -150 435 -169 418 L -175 412 Q -182 402 -182 380 -182 361 -147 352 L -157 351 -196 338 -215 332 -233 325 Q -228 333 -228 345 L -229 353 -242 367 Q -263 381 -306 381 -352 381 -373 362 -386 352 -386 341 L -384 327 -398 327 Q -431 327 -443 308 L -449 288 Q -449 275 -407 275 L -422 265 -435 243 Q -435 221 -404 215 -400 203 -384 198 L -387 188 Q -387 166 -354 170 -323 175 -321 193 L -303 195 -285 192 Q -246 187 -246 208 -246 214 -253 221 -261 230 -273 232 L -287 248 -291 251 Q -291 266 -300 273 -316 284 -364 284 L -366 284 Q -358 290 -356 301 L -307 296 -272 301 -252 308 -253 303 Q -253 291 -243 281 L -257 260 Q -257 233 -204 227 L -191 226 -189 221 -202 223 Q -221 223 -231 205 L -238 187 Q -238 175 -230 179 L -216 186 -210 184 -226 170 Q -226 161 -186 151 -186 132 -151 123 L -161 122 -209 126 -233 124 -246 138 Q -267 152 -310 152 -356 152 -377 133 -390 123 -390 112 L -388 98 -402 98 Q -435 98 -447 79 L -453 59 Q -453 45 -406 46 -364 47 -360 72 L -311 67 -276 72 Q -268 59 -243 56 -254 47 -261 31 -261 4 -208 -2 L -195 -3 -192 -10 Q -211 -15 -222 -25 -235 -35 -235 -46 L -233 -60 -247 -60 Q -280 -60 -292 -79 L -298 -99 Q -298 -113 -251 -112 -209 -111 -205 -86 L -156 -91 Q -77 -87 -77 -42 -77 -31 -91 -20 L -102 -14 -120 6 Q -140 22 -154 22 L -156 22 -156 23 -158 35 -143 34 -126 34 -118 33 -120 31 Q -120 8 -80 6 L -78 6 -84 -6 Q -84 -24 -59 -19 -35 -14 -35 0 -35 10 -45 12 L -41 21 -37 21 Q -24 21 -19 33 L -16 45 -24 56 Q -34 65 -47 65 L -53 65 Q -53 73 -59 83 L -59 89 Q -59 99 -69 103 L -80 105 -99 117 -84 119 Q -63 102 -9 95 L -6 95 10 73 Q 38 50 96 50 L 118 45 123 42 81 48 65 48 48 48 Q -7 48 -24 25 -31 15 -31 -7 -31 -26 4 -35 -29 -38 -54 -54 -79 -69 -79 -79 L -75 -95 Q -96 -103 -106 -127 -106 -154 -53 -160 L -40 -161 Q -38 -179 7 -184 53 -190 53 -172 L 35 -152 Q 15 -136 1 -136 L -1 -136 -1 -135 -3 -123 12 -124 38 -124 35 -127 Q 35 -150 75 -152 L 77 -152 Q 71 -157 71 -164 71 -182 96 -177 L 106 -174 107 -179 93 -179 Q 62 -179 50 -196 L 48 -198 45 -204 42 -218 Q 42 -231 82 -231 L 84 -231 89 -231 Q 113 -230 125 -222 L 135 -205 178 -210 184 -210 204 -208 219 -205 239 -198 244 -190 264 -190 261 -198 265 -214 252 -221 248 -225 234 -246 235 -253 Q 241 -274 287 -279 L 300 -280 M 114 -137 L 108 -120 96 -108 102 -94 96 -75 96 -69 95 -63 127 -64 132 -64 134 -64 124 -67 114 -75 108 -89 110 -97 Q 115 -110 141 -107 L 145 -106 Q 160 -104 167 -97 L 173 -90 Q 200 -108 251 -108 L 312 -102 Q 309 -111 309 -126 L 310 -132 298 -124 Q 271 -110 236 -110 190 -110 165 -121 L 153 -128 Q 131 -132 118 -144 L 114 -147 110 -146 114 -137 M 56 -41 L 61 -41 62 -43 56 -41 M 336 -199 L 330 -198 329 -197 337 -195 336 -199 M 323 -156 L 320 -144 344 -154 334 -155 323 -157 323 -156 M 203 -18 L 200 -9 236 -10 Q 251 -5 254 1 L 254 2 270 -8 203 -18 M 372 -71 L 350 -74 353 -54 Q 353 -38 341 -26 L 340 -25 Q 413 -34 419 -5 428 0 428 8 L 418 23 405 31 401 35 401 36 Q 407 32 417 31 L 449 30 454 30 456 30 446 27 436 19 430 5 432 -3 Q 437 -16 463 -13 L 467 -12 Q 482 -10 489 -3 L 495 4 496 12 490 24 Q 484 31 474 32 L 485 34 499 38 496 34 493 28 Q 493 19 507 14 L 505 13 Q 495 3 495 -10 L 498 -20 477 -18 Q 440 -18 423 -31 411 -39 411 -49 L 399 -48 Q 381 -48 375 -58 L 371 -69 372 -71 M 663 -276 L 663 -275 Q 663 -259 642 -245 L 638 -243 Q 611 -229 576 -229 L 560 -229 Q 525 -231 505 -240 L 493 -246 491 -248 Q 483 -256 483 -265 483 -290 519 -301 L 573 -309 590 -309 Q 654 -310 662 -283 L 663 -276 M 571 -277 L 564 -274 571 -272 595 -274 598 -277 598 -278 571 -277 M 534 -140 L 503 -152 489 -150 475 -149 Q 447 -149 429 -159 L 418 -167 414 -171 Q 405 -164 396 -160 L 411 -158 414 -157 471 -138 489 -122 500 -124 562 -128 572 -129 570 -131 565 -132 551 -135 534 -140 M 422 -72 L 422 -69 422 -63 428 -66 427 -71 427 -73 422 -72 M 585 -70 Q 622 -69 652 -55 L 666 -60 656 -61 645 -63 Q 630 -67 617 -74 L 608 -79 590 -92 581 -85 585 -70 M 711 -189 L 697 -177 693 -174 693 -173 692 -163 685 -149 691 -149 700 -149 699 -150 697 -152 700 -162 Q 704 -170 718 -174 L 715 -177 711 -188 711 -189 M 651 -103 L 659 -101 658 -105 652 -104 651 -103 M 954 -211 Q 979 -205 984 -189 L 985 -182 985 -181 Q 985 -165 964 -151 L 960 -149 954 -146 Q 929 -135 898 -135 L 882 -135 Q 847 -137 827 -146 L 815 -152 813 -154 Q 805 -162 805 -171 805 -196 841 -207 L 895 -215 912 -215 954 -211 M 954 -130 L 991 -121 1005 -112 1008 -109 Q 1015 -99 1015 -79 L 1014 -69 1003 -51 993 -43 989 -41 954 -33 942 -33 887 -38 873 -41 856 -46 Q 809 -60 809 -79 L 811 -88 Q 814 -99 827 -110 L 834 -115 Q 861 -133 913 -133 L 954 -130 M 920 -184 L 893 -183 886 -180 893 -178 917 -180 920 -183 920 -184 M 984 -143 Q 989 -154 1014 -157 L 1026 -158 1061 -151 Q 1070 -146 1070 -137 L 1070 -133 1059 -121 1044 -113 1015 -110 1012 -110 995 -122 994 -123 982 -137 983 -140 984 -143 M 1084 -94 L 1082 -81 1072 -74 1061 -73 1046 -76 1037 -83 1033 -94 Q 1033 -104 1053 -108 L 1059 -110 1072 -110 Q 1084 -109 1084 -94 M 1042 -35 L 1072 -32 1074 -32 Q 1090 -28 1090 -17 L 1080 -2 1072 4 1034 12 Q 1010 12 1000 4 994 -1 994 -6 994 -29 1028 -34 L 1042 -35 M 1270 121 L 1270 125 1259 137 1244 145 1215 148 1212 148 1195 136 1194 135 1182 121 1183 118 1184 115 Q 1189 104 1214 101 L 1226 100 Q 1250 100 1261 107 1270 112 1270 121 M 1282 177 Q 1278 185 1261 185 L 1246 182 Q 1240 180 1237 175 L 1233 164 Q 1233 154 1253 150 L 1259 148 Q 1284 143 1284 164 L 1282 177 M 1242 223 L 1274 226 Q 1290 230 1290 241 L 1280 256 Q 1264 270 1234 270 1210 270 1200 262 L 1194 252 Q 1194 229 1228 224 L 1242 223 M 1120 75 L 1120 74 1093 75 1086 78 1093 80 1117 78 1120 75 M 1015 106 L 1013 104 1009 99 Q 999 106 981 113 L 967 118 958 125 964 138 964 140 Q 976 131 1010 120 L 1034 115 1027 112 1015 106 M 858 153 L 852 154 851 155 859 157 858 153 M 845 195 L 817 184 808 179 790 166 786 162 783 154 787 138 774 131 772 129 770 127 756 106 757 99 Q 762 82 792 76 760 75 745 63 L 737 56 738 58 741 71 740 78 738 82 741 89 741 94 Q 741 111 727 125 L 723 129 705 142 706 142 726 144 741 147 761 154 766 162 780 171 781 173 785 188 785 191 784 199 771 213 Q 754 224 722 227 L 724 233 724 235 720 241 706 253 702 256 695 261 695 262 696 270 691 281 694 281 Q 697 276 707 272 L 709 268 Q 713 260 727 256 L 740 254 746 253 748 253 Q 742 248 742 241 L 743 236 Q 748 231 760 227 L 765 228 767 228 Q 791 233 791 247 L 789 255 801 261 807 259 810 257 814 256 Q 815 246 823 238 826 234 831 232 L 831 226 832 220 842 208 852 203 866 198 856 197 845 195 M 1002 258 L 994 264 985 269 973 279 972 280 995 276 1013 275 1023 273 1027 273 1022 271 1006 262 1002 258 M 935 297 L 939 292 907 295 891 295 866 293 Q 860 285 843 287 L 842 286 838 289 Q 828 298 815 298 802 298 794 290 L 786 280 784 276 779 285 776 290 Q 772 294 767 297 L 773 310 773 312 769 327 767 330 767 334 767 336 Q 767 346 757 350 L 746 352 727 364 742 366 745 367 765 372 Q 767 362 776 354 L 792 344 Q 805 337 825 333 L 825 332 836 320 843 315 Q 854 307 870 303 L 922 297 935 297 M 1003 424 Q 1003 401 1037 396 L 1051 395 1072 396 1083 398 Q 1099 402 1099 413 L 1089 428 1072 438 1043 442 Q 1019 442 1009 434 L 1003 424 M 1158 406 Q 1158 395 1210 378 1261 362 1261 391 1261 418 1214 418 L 1165 416 Q 1158 413 1158 406 M 1070 563 Q 1070 590 1023 590 L 974 588 Q 967 585 967 578 967 567 1019 550 1070 534 1070 563 M 699 23 L 694 23 672 20 664 18 659 19 645 24 638 31 Q 628 40 615 40 602 40 594 32 L 583 32 569 32 564 38 Q 555 49 539 49 L 515 45 Q 526 54 526 67 L 525 76 522 85 517 90 Q 501 101 453 101 416 101 395 82 382 69 382 60 L 383 53 384 51 387 46 Q 361 61 318 61 L 312 64 328 72 Q 359 92 359 107 359 123 319 138 L 257 151 Q 273 155 273 166 L 263 181 Q 247 195 217 195 193 195 183 187 177 182 177 177 177 154 211 149 L 176 140 125 150 70 145 67 149 81 148 99 159 100 169 Q 100 192 65 198 L 82 197 99 197 Q 163 196 171 223 L 172 230 173 230 201 255 213 254 248 261 Q 257 266 257 275 L 257 279 246 291 231 299 Q 237 300 240 304 L 246 302 Q 271 297 271 318 L 269 331 Q 265 339 248 339 L 238 338 241 351 240 358 226 374 222 377 229 377 257 379 Q 263 358 309 353 L 322 352 324 347 325 345 Q 329 339 339 336 350 331 369 329 L 371 329 381 328 379 326 376 320 Q 373 313 373 306 L 376 300 Q 384 293 413 293 L 415 293 420 293 Q 444 294 456 302 L 466 319 509 314 514 314 515 314 535 316 550 319 568 325 583 324 582 318 583 311 584 309 586 305 583 303 581 301 579 299 565 278 566 271 Q 571 254 601 248 L 618 245 631 244 633 239 634 237 Q 638 231 648 228 L 668 223 Q 651 218 640 208 L 636 205 Q 629 198 628 192 L 627 187 627 185 628 178 629 173 615 173 Q 584 173 572 156 L 570 154 567 148 564 134 567 128 564 120 Q 564 106 576 96 L 592 86 Q 599 82 609 79 L 606 73 Q 606 66 609 61 613 49 629 44 L 642 41 654 39 Q 667 33 688 26 L 699 23 M 462 70 L 462 72 465 73 469 70 462 70 M 472 127 L 484 124 Q 531 113 531 137 L 519 153 Q 504 164 483 164 446 164 436 145 L 440 139 445 136 461 130 472 127 M 438 216 L 451 213 463 211 483 210 501 211 519 213 530 216 544 225 547 230 550 243 549 250 547 254 535 266 531 269 512 278 498 280 484 281 Q 456 281 438 271 L 427 263 423 259 418 251 415 245 Q 415 238 418 233 422 221 438 216 M 594 360 L 617 358 620 355 619 354 593 355 594 360 M 414 345 L 397 361 Q 377 377 363 377 L 361 377 361 378 359 390 374 389 391 389 400 389 399 388 397 386 Q 397 380 400 376 406 364 431 362 L 436 361 436 359 436 358 433 349 434 345 424 345 414 345 M 470 393 L 458 405 464 417 472 417 476 418 Q 491 420 498 427 L 504 434 505 442 499 454 Q 493 461 483 462 L 494 464 508 468 505 464 502 458 Q 502 450 513 446 517 437 527 428 L 534 423 Q 561 405 613 405 L 638 406 636 403 640 397 598 403 582 403 543 398 516 399 511 399 484 396 471 393 470 393 M 448 458 L 441 460 458 460 463 460 465 460 455 457 453 456 448 458 M 531 483 L 535 497 534 506 534 507 584 504 598 503 614 511 634 505 587 500 556 492 531 483 M 668 328 L 664 328 668 329 668 328 M 253 50 L 271 52 Q 259 47 253 42 L 253 46 253 50 M 296 173 Q 296 162 348 145 399 129 399 158 399 185 352 185 L 303 183 Q 296 180 296 173 M 143 34 L 139 36 150 33 147 32 143 34 M 53 200 L 36 200 Q 5 200 -11 187 L -15 183 -23 189 Q -48 205 -102 206 L -98 215 Q -98 221 -116 235 -136 251 -150 251 L -152 251 -152 252 -113 250 Q -107 238 -82 236 L -84 228 -79 218 -62 209 -22 201 28 205 53 200 M 178 291 L 192 300 195 303 199 302 182 290 181 289 178 291 M 21 297 L 10 290 Q 0 280 0 267 L 2 260 0 258 -18 259 -38 258 -43 267 -55 279 Q -49 285 -49 293 L -49 294 Q -49 302 -55 312 L -55 318 Q -55 328 -65 332 L -76 334 -95 346 -80 348 -77 349 Q -37 359 -20 368 -6 375 -2 384 L 71 378 85 377 Q 100 382 103 388 L 104 398 104 401 106 401 111 401 Q 135 402 147 410 L 157 427 200 422 187 416 Q 181 411 181 406 181 395 189 388 L 175 389 129 379 74 374 43 366 Q -4 352 -4 333 L -2 324 Q 1 313 14 302 L 21 297 M 351 435 L 359 437 358 433 352 434 351 435 M 325 534 Q 337 534 342 544 L 343 546 346 558 338 569 Q 328 578 315 578 296 578 286 560 L 279 542 Q 279 530 287 534 L 301 541 307 539 310 537 325 534 M 219 691 Q 204 702 183 702 146 702 136 683 136 673 184 662 231 651 231 675 L 219 691 M 264 658 Q 264 620 353 608 441 595 441 632 441 651 423 667 396 693 340 693 340 700 302 687 264 674 264 658 M 199 576 L 196 572 185 572 199 576 M 162 608 L 162 610 165 611 169 608 162 608 M 658 686 Q 658 675 710 658 761 642 761 671 761 698 714 698 L 665 696 Q 658 693 658 686 M 533 554 L 537 557 Q 553 561 556 573 567 564 580 563 L 574 554 553 555 533 554 M -256 -160 Q -256 -196 -188 -195 -121 -195 -121 -162 -121 -151 -136 -139 -156 -124 -187 -124 -225 -124 -244 -142 L -256 -160 M -276 -4 Q -276 7 -291 19 -311 34 -342 34 -380 34 -399 16 -409 7 -411 -2 -411 -38 -343 -37 -276 -37 -276 -4 M -10 -79 L -11 -78 -3 -76 -4 -80 -10 -79 M -174 210 L -144 203 -142 203 Q -163 199 -173 189 L -175 189 -174 191 -171 203 -174 210 M -317 424 L -323 436 Q -329 443 -339 444 L -314 450 -320 440 Q -320 425 -281 421 -242 416 -242 437 -242 443 -249 450 -258 461 -274 461 L -298 457 Q -287 466 -287 479 -287 495 -296 502 -312 513 -360 513 -397 513 -418 494 -431 481 -431 472 -431 438 -359 442 L -357 442 Q -370 439 -377 431 L -383 417 Q -383 395 -350 399 -317 404 -317 424 M -348 485 L -344 482 -351 482 -351 484 -348 485 M -212 415 L -206 413 -203 411 -188 408 Q -176 408 -171 418 L -170 420 -167 432 -175 443 Q -185 452 -198 452 -217 452 -227 434 L -234 416 Q -234 404 -226 408 L -212 415 M -173 567 Q -173 574 -211 561 -249 548 -249 532 -249 494 -160 482 -72 469 -72 506 -72 525 -90 541 -117 567 -173 567 M -294 565 Q -309 576 -330 576 -367 576 -377 557 -377 547 -329 536 -282 525 -282 549 -282 556 -294 565";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 270 -264 Q 270 -278 306 -278 375 -278 375 -261 375 -254 366 -250 L 309 -241 281 -252 Q 270 -257 270 -264 M 291 -301 Q 309 -301 309 -292 309 -282 293 -282 L 277 -286 273 -292 Q 273 -301 291 -301 M 243 -274 Q 221 -259 192 -259 159 -259 145 -268 L 138 -278 Q 138 -312 200 -312 261 -314 261 -295 261 -287 243 -274 M 22 -263 L 17 -262 Q -11 -262 -13 -282 -13 -295 11 -299 35 -303 35 -285 L 29 -275 21 -264 22 -263 M 59 -267 Q 59 -275 84 -274 108 -273 108 -264 L 102 -257 95 -255 Q 71 -255 63 -261 L 59 -267 M 123 -289 L 115 -281 Q 109 -278 107 -278 93 -278 93 -289 93 -299 108 -296 123 -294 123 -289 M 183 -217 Q 183 -250 243 -240 302 -230 302 -213 302 -205 269 -197 L 234 -191 Q 203 -191 190 -202 183 -209 183 -217 M 162 -223 Q 155 -216 131 -216 109 -216 100 -226 L 96 -237 Q 96 -249 131 -249 165 -250 165 -237 L 162 -223 M 174 -148 Q 152 -131 112 -131 L 56 -139 47 -131 35 -127 Q 50 -122 50 -107 L 48 -102 53 -94 53 -92 62 -98 90 -107 Q 107 -107 115 -100 L 120 -91 118 -84 124 -84 148 -83 147 -87 Q 134 -90 134 -104 134 -116 145 -117 L 161 -115 189 -123 Q 180 -132 180 -140 180 -149 205 -161 L 216 -165 216 -166 Q 216 -178 273 -182 L 303 -181 Q 305 -192 326 -196 346 -199 349 -187 357 -204 391 -199 L 399 -197 443 -203 471 -201 482 -205 475 -205 Q 453 -205 453 -223 453 -235 464 -236 L 492 -233 Q 511 -233 511 -223 L 501 -213 Q 495 -209 489 -207 L 515 -209 Q 576 -211 576 -192 L 573 -185 577 -180 573 -174 563 -172 560 -172 558 -171 Q 536 -156 507 -156 L 496 -156 490 -153 468 -144 Q 480 -142 480 -134 L 477 -120 Q 474 -117 467 -115 L 499 -108 498 -114 499 -121 Q 492 -122 490 -126 488 -128 489 -131 489 -143 506 -144 518 -144 521 -138 L 558 -137 562 -136 613 -143 596 -149 Q 585 -154 585 -161 585 -172 607 -174 L 605 -179 592 -183 588 -189 Q 588 -198 606 -198 L 621 -195 625 -195 Q 645 -192 645 -178 L 645 -174 666 -172 663 -180 Q 663 -203 693 -201 L 713 -197 726 -200 780 -197 792 -188 Q 792 -170 740 -170 L 722 -174 720 -171 Q 713 -162 692 -162 L 689 -162 690 -158 Q 690 -151 681 -147 L 658 -141 Q 702 -137 702 -115 702 -103 679 -91 655 -79 622 -78 645 -74 645 -61 L 642 -54 Q 654 -49 659 -40 L 660 -42 661 -45 662 -48 678 -50 Q 696 -50 697 -39 697 -31 680 -31 L 671 -31 662 -33 663 -26 Q 663 -14 650 -4 L 654 4 Q 654 18 632 30 L 618 37 618 39 Q 618 51 599 51 L 600 52 595 53 592 53 577 50 579 52 573 54 567 51 567 49 554 50 542 50 506 47 503 47 490 63 Q 498 58 503 56 514 52 518 61 L 533 57 Q 555 53 555 62 L 547 71 528 77 518 76 514 80 508 81 498 79 485 70 483 68 486 66 456 73 419 69 408 66 407 65 402 63 393 64 367 59 358 59 344 57 342 57 305 55 Q 299 54 299 46 L 301 41 297 41 263 39 262 39 Q 241 52 207 52 L 201 52 191 59 156 71 156 80 150 99 146 104 146 106 141 118 Q 134 126 120 126 92 126 95 112 L 80 107 76 110 Q 64 123 47 123 L 30 123 38 133 55 133 Q 67 138 67 142 L 61 152 38 159 33 160 35 166 Q 35 176 23 176 L -14 174 -20 165 Q -20 157 -6 155 L -16 140 -16 138 -12 133 1 130 5 131 6 131 18 132 18 128 20 122 -27 114 Q -47 107 -47 96 -47 64 20 59 31 48 66 43 L 65 38 66 30 34 32 17 31 -16 53 Q -52 66 -92 66 -139 66 -160 50 -172 40 -172 29 -172 13 -163 6 -146 -7 -86 -7 L -22 -2 Q -21 -29 28 -31 L 28 -32 44 -34 58 -31 70 -30 65 -33 Q 58 -39 57 -46 L 43 -44 Q 24 -44 24 -52 24 -69 43 -75 59 -80 62 -64 L 75 -76 Q 51 -76 49 -84 L 39 -82 Q 20 -82 20 -94 20 -101 32 -102 L 29 -103 11 -93 Q 0 -93 -9 -119 L -8 -122 -10 -122 -38 -133 Q -49 -138 -49 -145 -49 -159 -13 -159 L 26 -157 21 -166 Q 21 -173 52 -189 81 -204 102 -208 129 -215 161 -197 189 -180 189 -173 189 -160 174 -148 M 6 -199 L -14 -214 -25 -230 Q -25 -248 24 -247 72 -245 72 -230 72 -223 45 -209 18 -194 6 -199 M 95 -119 Q 95 -130 112 -129 128 -127 128 -119 128 -107 109 -107 98 -107 95 -114 L 95 -119 M 131 -22 L 113 -22 89 -24 Q 102 -17 102 -3 L 102 3 132 3 Q 142 -11 171 -16 173 -23 183 -24 177 -27 170 -33 L 135 -23 131 -22 M 188 -47 Q 204 -53 204 -33 L 199 -23 203 -18 238 -15 272 -22 272 -23 Q 272 -41 293 -50 L 288 -55 286 -60 252 -54 244 -53 239 -53 227 -53 191 -56 188 -47 M 372 -213 Q 372 -201 358 -201 339 -201 339 -213 339 -221 356 -222 372 -223 372 -213 M 332 -159 L 329 -159 326 -156 346 -148 347 -151 363 -153 Q 381 -153 382 -142 L 380 -137 387 -127 387 -126 396 -126 Q 408 -124 408 -116 L 408 -113 425 -116 415 -123 411 -134 Q 411 -139 417 -141 396 -144 386 -151 361 -151 352 -163 L 347 -176 344 -172 336 -161 337 -160 332 -159 M 393 -104 L 392 -104 Q 383 -108 383 -118 L 384 -121 360 -106 339 -96 Q 337 -84 317 -73 L 326 -59 326 -58 337 -60 336 -63 350 -76 357 -80 367 -86 387 -95 393 -104 M 675 -258 Q 675 -248 660 -237 636 -221 589 -221 539 -221 514 -237 499 -248 499 -259 499 -268 524 -280 550 -292 576 -292 L 576 -290 626 -280 Q 675 -268 675 -258 M 666 -295 Q 666 -325 710 -318 753 -310 753 -297 L 742 -282 Q 728 -270 706 -270 680 -270 671 -282 666 -288 666 -295 M 425 -273 Q 400 -273 394 -293 394 -303 411 -303 L 465 -300 477 -291 Q 477 -273 425 -273 M 414 -233 L 414 -238 Q 414 -249 431 -248 447 -246 447 -238 447 -226 428 -226 417 -226 414 -233 M 405 -29 L 405 -25 Q 405 -18 395 -9 L 383 1 383 2 405 -4 414 -3 414 -10 Q 414 -25 432 -28 L 427 -28 405 -29 M 489 -45 Q 472 -32 446 -29 465 -28 465 -13 L 460 -1 Q 453 7 439 7 L 433 7 435 12 434 17 446 17 463 18 462 16 462 13 Q 462 -3 471 -10 L 476 -12 498 -19 Q 495 -25 495 -30 495 -51 531 -58 L 531 -62 531 -63 Q 531 -75 588 -79 L 591 -79 Q 568 -81 556 -88 L 549 -88 528 -89 529 -82 Q 529 -72 510 -60 L 498 -54 489 -45 M 727 -235 Q 727 -226 711 -223 702 -227 702 -237 702 -248 715 -245 727 -243 727 -235 M 729 -135 Q 729 -146 746 -145 762 -143 762 -135 762 -123 743 -123 732 -123 729 -130 L 729 -135 M 807 -130 Q 826 -130 826 -120 L 816 -110 Q 804 -102 790 -102 768 -102 768 -120 768 -132 779 -133 L 807 -130 M 672 -74 Q 672 -87 701 -87 L 714 -94 758 -100 Q 825 -100 825 -74 825 -60 805 -50 L 769 -39 765 -38 747 -38 Q 715 -38 701 -48 L 699 -49 692 -58 Q 685 -60 680 -64 L 672 -74 M 723 -10 L 772 -13 Q 844 -6 844 21 844 31 825 43 803 56 773 56 L 770 56 767 56 759 56 749 55 725 50 710 54 712 55 718 67 720 67 738 62 Q 759 61 759 71 L 758 74 773 77 784 74 810 74 810 73 Q 810 50 852 43 857 39 870 38 L 884 37 908 38 929 40 947 45 Q 978 54 978 77 978 92 956 104 L 950 107 Q 947 114 936 114 L 927 113 887 116 862 114 847 118 819 124 812 124 791 123 Q 776 120 768 113 L 765 109 754 110 Q 728 110 729 98 L 709 99 706 99 705 106 739 118 743 121 761 120 Q 807 122 817 137 L 851 133 854 133 881 134 Q 885 125 906 128 933 132 933 142 933 154 914 154 L 908 154 905 158 904 159 894 168 Q 876 183 851 183 813 183 801 169 L 771 176 742 174 722 181 Q 740 187 741 199 L 748 196 752 191 765 188 769 189 784 190 811 189 871 193 Q 881 178 922 173 L 922 172 923 170 924 167 925 164 941 162 Q 956 162 959 170 L 977 170 964 164 962 163 955 154 954 148 Q 954 133 964 125 L 969 122 Q 976 99 1021 98 L 1032 98 1031 92 Q 1031 80 1042 79 L 1070 82 Q 1089 82 1089 92 L 1079 102 1070 107 1075 119 1075 120 Q 1088 127 1088 138 1088 152 1068 162 L 1062 165 Q 1073 166 1074 173 L 1084 171 Q 1100 171 1100 181 L 1100 184 1107 194 1096 209 1092 213 Q 1107 221 1107 233 1107 243 1088 255 L 1081 259 Q 1078 266 1065 268 L 1061 266 1036 268 994 264 976 268 982 280 983 285 983 290 981 297 993 301 995 295 Q 1001 287 1018 286 L 1021 286 1038 290 1047 290 Q 1077 293 1077 306 L 1074 320 Q 1067 329 1046 329 1030 329 1023 322 L 1017 322 998 319 977 325 Q 966 325 961 317 L 961 316 944 319 922 319 917 319 908 318 870 310 863 307 864 314 857 330 857 332 851 346 841 354 840 354 Q 819 367 785 367 L 779 367 Q 744 366 724 357 L 719 357 710 357 701 355 698 349 698 348 699 346 700 343 701 340 705 339 704 335 Q 704 325 710 318 718 306 740 301 L 745 298 753 294 762 292 761 291 748 282 746 280 766 268 Q 777 264 781 273 L 782 282 781 288 781 289 797 288 851 296 850 293 850 292 851 285 854 279 846 283 829 286 Q 811 286 808 274 L 807 268 808 262 805 262 797 262 782 265 Q 772 265 769 259 L 766 259 Q 748 254 737 246 L 728 235 720 241 697 247 663 250 652 245 635 239 Q 624 234 624 227 L 628 219 629 219 625 217 621 215 617 215 612 214 610 213 607 212 603 214 599 216 597 217 590 221 589 222 588 222 549 232 546 232 543 232 535 232 525 231 516 229 516 230 512 236 498 239 Q 476 239 482 231 482 225 499 224 L 501 224 499 223 Q 492 218 492 213 492 196 509 188 513 183 525 182 L 528 181 554 179 605 184 639 178 634 176 618 168 604 158 600 152 599 149 Q 599 145 610 138 L 588 134 578 142 577 142 Q 556 155 522 155 L 516 155 Q 476 154 456 142 441 133 441 123 441 113 447 106 457 92 486 87 L 518 85 553 88 554 88 553 85 Q 553 69 590 68 595 59 608 53 L 638 46 Q 641 42 652 41 L 652 29 Q 652 -4 706 -5 L 718 -5 723 -10 M 804 -28 Q 804 -40 821 -41 837 -41 837 -31 837 -18 819 -18 808 -18 805 -23 803 -25 804 -28 M 981 -192 Q 981 -222 1025 -215 1068 -207 1068 -194 1068 -189 1057 -179 1043 -167 1021 -167 995 -167 986 -179 981 -185 981 -192 M 990 -155 Q 990 -145 975 -134 951 -118 904 -118 854 -118 829 -134 814 -145 814 -156 814 -165 839 -177 865 -189 891 -189 L 891 -187 941 -177 Q 990 -165 990 -155 M 888 -71 L 878 -69 867 -72 867 -75 Q 867 -83 880 -83 892 -83 892 -77 L 888 -71 M 978 -77 Q 978 -100 1008 -98 1038 -95 1038 -82 L 1035 -68 Q 1028 -59 1007 -59 989 -59 982 -68 L 978 -77 M 938 -63 Q 927 -63 922 -71 L 919 -79 Q 919 -94 940 -92 960 -89 960 -75 960 -63 938 -63 M 938 -40 Q 1017 -41 1017 -12 1017 0 994 12 L 993 13 1043 15 Q 1055 20 1055 24 L 1049 34 1045 41 Q 1039 48 1027 48 L 1000 42 985 38 Q 975 33 972 22 L 972 20 931 25 887 21 887 23 Q 887 33 871 33 L 868 33 855 29 851 23 Q 851 14 869 14 L 870 14 860 5 Q 853 -5 858 -16 858 -39 938 -40 M 1030 -142 Q 1042 -140 1042 -132 1042 -123 1026 -120 1017 -124 1017 -134 1017 -145 1030 -142 M 1320 33 Q 1306 45 1284 45 1258 45 1249 33 L 1244 20 Q 1244 -10 1288 -3 1331 5 1331 18 L 1320 33 M 1280 78 Q 1280 67 1293 70 1305 72 1305 80 1305 89 1289 92 1280 88 1280 78 M 1238 78 Q 1214 94 1167 94 1117 94 1092 78 1077 67 1077 56 1077 47 1102 35 1128 23 1154 23 L 1154 25 1204 35 Q 1253 47 1253 57 1253 67 1238 78 M 1270 153 Q 1252 153 1245 144 L 1241 135 Q 1241 112 1271 114 1301 117 1301 130 L 1298 144 Q 1291 153 1270 153 M 1311 235 L 1313 241 1308 253 1290 260 Q 1270 260 1258 251 L 1250 241 Q 1250 228 1281 228 1305 228 1311 235 M 1257 224 Q 1231 237 1194 237 1136 237 1123 217 1116 207 1121 196 1121 173 1201 172 1280 171 1280 200 1280 212 1257 224 M 1324 354 Q 1304 370 1262 370 1236 370 1230 357 L 1230 344 Q 1230 311 1284 310 1338 309 1338 331 1338 343 1324 354 M 1219 316 Q 1194 328 1150 328 1107 328 1086 309 1073 297 1073 285 1073 253 1157 252 1241 251 1241 289 1241 304 1219 316 M 1272 436 Q 1253 454 1205 454 1159 454 1140 434 L 1130 415 Q 1130 388 1207 382 1284 377 1284 410 1284 424 1272 436 M 1295 385 Q 1295 380 1316 377 1337 376 1337 386 L 1315 401 1295 385 M 1028 174 L 1010 174 999 174 Q 1017 179 1020 192 1022 179 1033 174 L 1028 174 M 1182 133 Q 1182 118 1203 120 1223 123 1223 137 1223 149 1201 149 1190 149 1185 141 L 1182 133 M 1155 135 L 1151 141 1141 143 1130 140 1130 137 Q 1130 129 1143 129 1155 129 1155 135 M 992 82 L 992 77 Q 992 66 1009 67 1025 69 1025 77 1025 89 1006 89 995 89 992 82 M 926 352 L 969 348 970 347 Q 982 331 1024 332 1082 334 1082 358 1073 380 1053 386 1047 393 1033 400 L 1004 410 1004 413 998 432 994 436 Q 1017 445 1017 465 1017 480 995 492 970 504 926 504 883 504 862 485 849 473 849 461 849 438 892 431 L 888 429 876 423 864 431 Q 842 444 812 444 L 779 442 775 448 761 451 757 451 758 456 759 461 759 466 749 482 745 486 737 492 720 495 648 487 650 493 648 502 645 505 633 512 627 522 617 530 616 530 Q 601 540 578 542 577 556 556 568 L 509 579 504 590 503 592 506 592 Q 533 596 533 606 L 531 613 538 612 Q 555 609 555 618 L 551 624 537 627 Q 515 627 521 619 L 522 618 514 618 488 614 494 619 488 621 482 618 482 613 486 613 479 605 469 605 449 603 434 598 425 595 406 587 382 574 373 568 354 574 Q 324 574 329 557 329 551 332 547 338 539 355 538 L 358 538 Q 374 538 379 547 389 540 410 536 410 527 417 522 L 388 523 375 523 371 522 360 520 340 518 333 516 349 504 Q 349 494 328 495 307 498 307 503 L 300 493 299 487 274 488 248 482 240 489 232 494 223 500 284 508 308 516 310 518 312 519 318 527 319 532 320 537 320 542 310 558 306 562 298 568 281 571 248 570 217 572 190 570 194 584 188 598 178 606 177 606 Q 156 619 122 619 L 116 619 Q 76 618 56 606 41 597 41 587 41 577 47 570 52 563 61 559 L 53 554 50 548 Q 50 535 76 536 L 92 539 85 534 83 532 103 520 Q 114 516 118 525 L 119 534 118 540 114 544 108 545 98 543 101 550 118 549 152 552 142 533 Q 142 522 156 514 L 154 514 142 514 106 511 103 511 Q 86 506 76 499 L 63 504 65 512 Q 65 534 41 534 L 19 533 16 533 11 549 17 564 17 570 Q 12 590 -19 597 L -51 599 -64 599 -68 598 -92 590 -100 583 -107 565 Q -107 554 -99 548 L -100 547 Q -128 534 -128 523 -128 508 -74 507 L -59 506 -55 500 -53 498 -42 492 -38 491 Q -29 490 -25 497 L -23 503 -23 507 6 515 Q 8 508 17 504 L -3 498 -8 496 -17 491 -32 488 -36 483 -37 481 -32 475 -29 473 -23 469 -19 467 -18 465 Q -6 449 36 450 L 71 455 71 454 76 452 78 451 98 445 104 444 126 442 Q 109 437 98 427 L 90 418 89 419 79 426 59 433 47 435 29 440 7 435 5 435 -22 431 -27 434 -44 437 -118 428 Q -137 421 -138 411 L -138 410 -137 403 Q -134 390 -117 383 L -84 375 -72 373 -71 373 -66 373 -29 376 -16 371 -25 359 -26 353 -26 352 -26 350 -40 358 -61 368 -79 368 -92 360 -93 360 -103 366 -107 367 -124 373 -150 378 -157 379 -158 379 -166 380 -171 380 -183 380 -219 377 -222 377 -251 364 -262 350 -262 348 -263 346 -263 345 -263 343 Q -263 327 -254 320 L -249 318 -247 317 -227 311 -221 310 -177 307 -152 308 -117 311 -91 317 -83 321 -73 320 -69 320 -61 320 -20 327 -17 329 -7 325 -2 320 33 316 47 317 95 327 106 332 110 329 121 326 131 325 131 323 133 314 Q 133 307 140 302 L 110 308 109 308 94 312 86 311 80 307 79 306 77 305 Q 76 298 62 300 L 60 299 53 290 44 291 45 292 40 292 22 292 11 292 -11 288 -24 282 -26 281 -33 272 -34 266 Q -34 251 -24 243 L -19 240 -11 236 -6 235 -9 233 Q -37 220 -37 209 -37 196 4 193 6 184 21 185 34 187 37 192 107 190 107 217 107 234 93 242 L 99 249 100 255 100 256 115 255 142 256 142 255 Q 142 247 155 247 167 247 167 253 L 163 259 166 260 Q 176 264 176 272 L 173 279 164 290 160 292 158 293 152 297 162 294 174 292 192 291 205 290 207 290 221 289 245 290 266 292 284 297 289 302 290 306 290 309 292 318 289 328 269 342 240 352 217 355 210 362 199 366 184 370 183 371 230 378 Q 253 387 253 407 L 253 408 Q 252 422 231 434 L 197 444 208 445 234 451 243 455 Q 246 442 259 435 L 266 432 262 431 259 425 259 424 260 422 261 419 262 416 266 415 278 414 Q 293 414 296 422 L 297 425 297 428 337 433 Q 350 438 350 449 L 350 450 358 450 372 451 420 461 424 461 426 462 443 467 Q 456 474 456 488 L 456 494 448 508 453 507 481 504 486 494 494 486 Q 468 482 460 469 L 458 466 456 457 447 454 446 453 444 444 Q 444 427 474 423 L 499 426 517 425 513 422 502 408 502 406 501 404 501 403 501 401 Q 501 385 510 378 L 515 376 517 375 537 369 543 368 587 365 612 366 644 358 664 355 702 356 Q 730 362 734 386 L 734 395 728 414 724 419 Q 713 429 693 429 L 673 427 661 424 657 425 640 431 614 436 610 437 Q 617 443 617 452 L 614 462 594 476 595 477 609 481 618 480 636 482 626 469 626 468 627 461 Q 630 448 647 441 L 680 433 692 431 693 431 698 431 Q 731 429 747 440 749 437 759 436 L 757 435 750 430 739 417 738 411 738 410 Q 738 396 747 387 L 757 383 762 378 797 374 811 375 Q 859 380 875 393 L 897 390 Q 893 381 897 372 L 883 370 Q 877 369 877 361 L 879 356 889 351 905 349 916 350 920 350 926 352 M 882 261 L 868 254 864 255 850 258 Q 865 259 865 268 L 871 265 882 261 M 860 347 Q 876 347 876 357 876 370 858 370 L 844 365 843 360 844 357 Q 844 352 850 349 L 860 347 M 814 490 Q 807 498 793 498 763 498 768 481 768 475 771 471 777 463 794 462 L 797 462 Q 819 462 819 478 L 814 490 M 1145 361 L 1149 361 1142 351 Q 1142 336 1169 340 1196 344 1196 354 1196 366 1177 366 L 1151 362 1157 367 1151 369 1145 366 1145 361 M 1088 382 Q 1088 376 1111 372 1133 368 1133 377 L 1125 386 1106 392 Q 1088 392 1088 382 M 1089 417 L 1087 426 1089 432 1082 440 1065 443 Q 1048 443 1041 436 L 1038 430 1034 427 1026 417 Q 1026 404 1057 404 1081 404 1087 411 L 1089 417 M 1038 546 Q 1012 546 1006 533 L 1006 520 Q 1006 487 1060 486 1114 485 1114 507 1114 519 1100 530 1080 546 1038 546 M 1091 577 L 1071 561 Q 1071 556 1092 553 1113 552 1113 562 1113 567 1091 577 M 1048 612 Q 1029 630 981 630 935 630 916 610 L 906 591 Q 906 564 983 558 1060 553 1060 586 1060 600 1048 612 M 921 542 L 921 537 925 537 918 527 Q 918 512 945 516 972 520 972 530 972 542 953 542 L 927 538 933 543 927 545 921 542 M 909 553 L 901 562 882 568 Q 864 568 864 558 864 552 887 548 909 544 909 553 M 840 594 Q 865 596 865 608 L 858 616 841 619 Q 824 619 817 612 L 814 606 Q 814 593 840 594 M 810 564 L 761 556 756 554 Q 741 548 741 539 741 530 746 523 758 507 800 508 858 510 858 534 846 564 810 564 M 625 239 Q 634 238 638 245 L 640 251 640 253 661 260 668 270 668 268 Q 668 251 698 247 728 244 728 260 L 725 273 726 278 726 283 Q 723 290 712 290 L 703 289 694 282 682 281 671 278 670 277 668 270 657 285 654 288 667 291 Q 680 298 680 312 L 680 318 684 327 684 330 681 334 680 335 670 344 Q 652 359 627 359 589 359 577 345 L 573 339 571 338 567 335 555 340 537 344 525 345 518 350 498 357 485 359 471 360 466 360 444 359 416 354 415 355 407 359 390 362 Q 372 362 369 350 L 368 344 369 338 Q 371 333 378 331 L 376 328 375 325 Q 375 321 386 314 L 389 312 Q 391 309 396 308 L 406 302 426 293 433 291 439 287 Q 464 276 488 275 L 485 275 482 275 464 272 454 265 450 254 Q 450 249 456 247 L 485 242 494 243 496 243 507 244 Q 519 246 519 254 L 516 268 506 273 505 274 491 275 491 277 541 287 543 288 541 285 538 280 537 274 538 267 Q 540 258 549 253 L 560 250 586 250 593 251 594 250 608 248 610 246 621 240 625 239 M 420 117 Q 441 121 441 135 L 439 144 Q 467 150 471 174 L 471 183 468 196 Q 477 198 477 202 L 469 210 461 213 454 212 434 217 438 217 Q 462 218 462 227 L 456 234 449 236 417 230 413 224 414 222 Q 417 218 428 217 L 410 215 395 210 389 208 387 211 387 214 Q 387 228 375 240 L 370 244 378 244 419 251 426 261 426 262 423 267 399 282 378 292 363 293 340 294 337 294 322 290 Q 312 285 309 274 L 309 272 313 267 326 264 330 265 331 265 330 264 329 261 330 257 312 258 310 262 Q 303 271 282 271 266 271 259 264 L 257 262 253 253 254 247 243 238 233 219 Q 233 192 310 186 L 343 186 330 174 334 163 333 161 333 150 332 151 329 154 328 155 Q 316 163 298 163 295 170 280 170 L 260 168 265 175 Q 265 185 250 196 L 242 201 230 206 212 210 200 211 179 212 118 203 104 196 94 186 88 184 Q 68 177 68 167 68 134 127 136 L 165 141 166 141 166 142 173 145 216 153 218 154 249 163 245 155 Q 245 145 257 144 L 256 138 256 134 257 132 253 132 Q 210 132 189 113 176 101 176 89 176 57 260 56 317 55 335 73 L 343 72 355 71 373 72 385 73 387 74 Q 426 78 426 98 L 420 117 M 488 393 L 483 395 478 395 472 395 474 400 473 405 472 407 471 408 464 412 436 415 429 415 408 413 405 414 404 415 414 421 415 424 421 423 Q 437 423 437 433 437 446 419 446 L 411 445 406 447 397 447 383 445 378 439 Q 378 430 384 424 L 385 423 369 425 370 426 365 426 347 426 336 426 314 422 301 416 299 415 292 406 291 400 Q 291 386 300 378 L 274 372 270 369 267 366 264 365 Q 256 363 255 358 L 254 354 Q 254 346 271 345 L 284 347 293 346 311 348 Q 319 349 323 353 L 325 359 323 368 342 365 350 364 375 361 378 362 389 364 395 367 412 372 424 383 425 389 444 384 453 385 467 390 467 389 Q 467 381 480 381 492 381 492 387 L 488 393 M 390 27 L 368 24 362 27 Q 371 26 375 33 L 384 32 392 32 397 27 390 27 M 345 36 L 347 34 342 35 345 36 M 217 239 L 229 243 235 255 234 261 216 267 221 269 224 273 224 275 Q 224 285 208 285 L 205 285 192 281 188 275 Q 188 266 206 266 L 197 259 197 258 194 251 Q 194 236 215 238 L 217 239 M 183 136 Q 161 136 167 128 167 122 184 121 201 118 201 127 L 197 133 183 136 M 141 234 Q 141 221 167 222 192 224 192 236 L 185 244 168 247 Q 151 247 144 240 L 141 234 M 10 312 L -22 306 -26 300 -25 298 Q -22 294 -11 293 L -9 293 -7 293 -1 293 Q 23 294 23 303 L 17 310 10 312 M 89 379 L 96 384 Q 105 377 123 374 L 109 368 100 373 89 379 M 329 329 Q 329 318 346 319 362 321 362 329 L 358 338 343 341 Q 333 341 330 335 L 329 334 329 329 M 361 584 Q 419 586 419 610 407 640 371 640 L 322 632 317 630 Q 302 624 302 615 302 606 307 599 319 583 361 584 M 226 603 L 242 601 253 602 257 602 Q 266 604 269 610 L 269 614 269 615 Q 269 624 257 624 L 220 622 Q 214 621 214 613 L 216 608 226 603 M 225 681 Q 197 668 197 657 197 642 251 641 L 269 640 Q 341 638 341 665 L 335 684 Q 325 696 296 696 L 259 692 238 687 225 681 M 375 682 Q 375 669 401 670 426 672 426 684 L 419 692 402 695 Q 385 695 378 688 L 375 682 M 39 608 Q 67 614 71 638 L 71 647 65 666 61 671 Q 50 681 30 681 L 10 679 -5 674 -14 671 -33 663 -57 650 -70 638 -66 627 -65 626 Q -54 615 -19 610 L 1 607 39 608 M 82 695 Q 82 689 99 688 116 685 116 694 L 112 700 98 703 Q 76 703 82 695 M 161 665 L 140 669 Q 107 669 107 656 107 646 136 645 164 644 164 657 L 161 665 M 774 608 Q 764 620 735 620 L 698 616 677 611 664 605 663 605 661 606 Q 641 622 599 622 573 622 567 609 L 567 596 567 593 Q 546 590 546 580 546 570 575 569 L 584 569 621 562 662 567 690 565 708 564 Q 780 562 780 589 L 774 608 M 696 548 L 659 546 Q 653 545 653 537 L 655 532 665 527 681 525 692 526 696 526 Q 705 528 708 534 L 708 538 708 539 Q 708 548 696 548 M 653 629 Q 674 628 674 638 674 643 652 653 L 632 637 Q 632 632 653 629 M 609 688 Q 590 706 542 706 496 706 477 686 L 467 667 Q 467 640 544 634 621 629 621 662 621 676 609 688 M 462 638 L 443 644 Q 425 644 425 634 425 628 448 624 470 620 470 629 L 462 638 M -290 -156 L -298 -145 -297 -144 -302 -143 Q -330 -143 -332 -163 -332 -176 -308 -180 -284 -184 -284 -166 L -290 -156 M -260 -148 Q -260 -156 -235 -155 -211 -154 -211 -145 -211 -140 -217 -138 L -224 -136 Q -248 -136 -256 -142 L -260 -148 M -211 -177 Q -196 -175 -196 -170 -196 -165 -204 -162 L -212 -159 Q -226 -159 -226 -170 -226 -180 -211 -177 M -344 -111 Q -344 -129 -295 -128 -247 -126 -247 -111 -247 -104 -274 -90 -301 -75 -313 -80 L -333 -95 Q -344 -106 -344 -111 M -223 -118 Q -223 -130 -188 -130 -154 -131 -154 -118 -154 -107 -157 -104 -164 -97 -188 -97 -210 -97 -219 -107 L -223 -118 M -298 -47 L -267 -70 Q -238 -85 -217 -89 -190 -96 -158 -78 L -130 -54 Q -130 -41 -145 -29 -167 -12 -207 -12 -251 -12 -279 -28 -298 -39 -298 -47 M -76 -155 Q -98 -140 -127 -140 -160 -140 -174 -149 L -181 -159 Q -181 -193 -119 -193 -58 -195 -58 -176 -58 -168 -76 -155 M -46 -173 Q -46 -182 -28 -182 -10 -182 -10 -173 -10 -163 -26 -163 L -42 -167 -46 -173 M -136 -98 Q -136 -131 -76 -121 -17 -111 -17 -94 -17 -86 -50 -78 L -85 -72 Q -116 -72 -129 -83 L -136 -98 M -46 -13 Q -103 -13 -103 -47 -103 -59 -46 -63 11 -66 11 -45 11 -39 -3 -28 -21 -13 -46 -13 M -193 86 L -226 82 -229 72 Q -229 55 -199 51 -169 48 -169 64 -169 86 -193 86 M -126 97 L -151 84 Q -115 56 -115 86 -115 97 -126 97 M -116 101 Q -40 101 -40 136 -40 148 -57 158 L -57 159 -41 163 -36 168 -35 172 -36 177 -44 183 -67 189 -101 192 -112 187 -129 181 -140 170 -171 162 -174 163 -176 164 -180 166 Q -165 175 -163 194 L -159 195 -125 204 Q -121 198 -98 197 -70 196 -70 209 -70 215 -73 217 L -94 221 -108 220 -115 228 -126 232 -141 236 -169 242 -176 242 -197 241 -202 240 -219 232 -263 217 -279 217 -282 217 -300 214 -310 207 -314 196 Q -314 191 -308 189 L -303 187 Q -301 171 -266 164 L -272 155 -271 151 -285 151 -292 151 -295 152 -303 155 -310 154 -317 147 -334 135 -341 117 Q -341 87 -279 87 -217 87 -217 116 L -217 121 -210 121 -187 121 Q -172 101 -116 101 M -118 246 L -120 251 -107 252 -103 252 Q -90 254 -84 260 L -80 269 -80 270 -74 268 Q -54 265 -51 277 L -50 280 -47 280 Q -32 280 -29 288 L -28 291 Q -28 298 -40 299 L -45 299 -54 299 -60 298 -64 303 -63 304 -68 305 -71 305 -86 302 -97 289 Q -114 301 -137 301 -175 301 -187 287 L -191 281 -194 272 -194 268 -194 267 Q -194 259 -171 255 L -152 252 -152 247 Q -152 241 -135 240 -118 237 -118 246 M -61 231 L -70 224 -71 220 Q -71 212 -54 211 -43 210 -39 215 L -38 220 -38 225 Q -41 232 -52 232 L -61 231 M -204 19 L -199 28 Q -199 36 -209 40 L -244 43 Q -271 43 -271 33 -271 29 -257 21 L -229 12 Q -212 12 -204 19 M -290 16 Q -295 16 -308 26 -319 26 -328 0 -328 -13 -298 -11 -269 -9 -269 12 -269 19 -280 19 L -285 18 Q -286 16 -290 16 M -257 61 L -259 70 -276 75 Q -295 75 -295 67 -295 50 -276 44 -257 38 -257 61 M -332 159 L -326 159 Q -302 160 -302 169 L -308 176 -315 178 -347 172 -351 166 -350 164 Q -347 160 -336 159 L -334 159 -332 159 M -377 153 L -378 154 -381 158 -389 169 -388 170 -393 171 -396 171 -411 168 Q -422 163 -423 151 L -422 149 Q -420 138 -399 134 -379 131 -376 143 L -375 148 -375 150 -377 153 M -394 186 L -386 186 -345 193 Q -338 197 -338 203 L -338 204 -341 209 -365 224 Q -377 231 -386 234 L -404 234 -424 219 -434 206 -435 203 -434 199 Q -430 187 -398 186 L -394 186 M -308 225 L -283 224 Q -267 226 -249 236 L -245 239 Q -221 254 -221 260 -221 268 -227 276 L -236 285 -246 292 -266 299 -279 301 -293 302 -298 302 -320 301 -349 296 -354 294 -370 286 -384 276 -388 270 -389 267 -378 256 -375 254 Q -373 251 -368 250 L -358 244 -338 235 -308 225 M -292 337 L -290 342 -291 347 -292 349 -293 350 -300 354 -328 357 -335 357 -357 354 -361 349 -362 347 -357 341 -354 339 -348 335 -342 332 Q -330 326 -320 326 L -311 327 -295 333 -292 337 M -386 304 L -375 306 Q -360 311 -360 326 L -362 331 -367 333 -371 333 -376 332 -378 331 -381 330 -399 340 Q -410 340 -419 314 L -418 311 Q -415 301 -389 303 L -386 304 M -363 357 Q -354 356 -350 363 L -348 369 -348 375 -350 384 -353 387 -358 389 -367 389 -381 387 -386 381 -380 366 -378 364 Q -374 360 -367 358 L -363 357 M -317 396 L -318 395 -320 386 Q -320 369 -290 365 -260 362 -260 378 -260 400 -284 400 L -306 399 -317 396 M -338 404 L -321 409 Q -308 416 -308 430 L -308 436 Q -313 456 -344 463 L -376 465 -389 465 -393 464 -417 456 -425 449 -432 431 Q -431 406 -390 403 L -382 402 -370 401 -352 402 -340 403 -338 404 M -390 492 Q -379 481 -344 476 L -324 473 -286 474 Q -258 480 -254 504 L -254 513 Q -254 522 -260 532 L -264 537 Q -275 547 -295 547 L -315 545 -330 540 -339 537 -358 529 -382 516 -395 504 -391 493 -390 492 M -207 391 L -206 400 -207 406 -211 410 -217 411 -227 409 -240 400 -242 398 Q -230 389 -222 386 -211 382 -207 391 M -207 415 L -172 418 -169 419 Q -131 425 -131 450 -131 457 -137 464 L -147 472 -148 472 Q -169 485 -203 485 L -209 485 Q -249 484 -269 472 -284 463 -284 453 L -278 436 Q -268 422 -239 417 L -207 415 M -111 479 L -109 474 -99 469 -85 467 -94 448 -93 445 Q -90 435 -64 437 L -61 438 -50 440 Q -35 445 -35 460 L -37 465 -42 467 -46 467 -51 466 -53 465 -56 464 -66 469 -56 476 -56 480 -56 481 Q -56 490 -68 490 L -105 488 -111 479 M -164 531 L -185 535 Q -218 535 -218 522 -218 512 -189 511 -161 510 -161 523 L -164 531 M -55 690 L -47 701 -49 703 -48 704 -53 705 Q -70 705 -67 695 L -65 689 -60 688 -55 690 M -243 561 Q -243 555 -226 554 -209 551 -209 560 L -213 566 -227 569 Q -249 569 -243 561 M -385 554 L -380 556 -372 567 -374 569 -373 570 -378 571 Q -395 571 -392 561 L -390 555 -385 554";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 690 -285 L 700 -283 689 -284 690 -285 M 598 -311 L 609 -308 591 -312 598 -311 M 1004 -213 L 1008 -219 Q 1024 -242 1024 -220 L 1021 -207 1007 -212 1004 -213 M -398 -48 L -398 -51 -397 -53 -391 -49 -395 -48 -398 -48";
	ctx.fillStyle=tocolor(ctrans.apply([237,241,242,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -313 -44 Q -297 -63 -297 -35 -297 -11 -332 26 L -382 69 Q -408 85 -429 118 L -458 171 Q -470 166 -470 151 L -470 150 Q -469 136 -449 106 L -441 93 -434 82 -418 61 -409 50 -396 37 -332 -16 -313 -44 M -404 397 Q -393 395 -393 415 -393 419 -408 443 L -423 466 Q -437 466 -446 438 L -445 433 -441 427 -419 405 Q -410 398 -404 397 M 1267 450 Q 1257 449 1255 437 1254 426 1258 416 1240 415 1228 405 L 1219 390 Q 1219 381 1227 380 L 1235 380 1261 386 Q 1276 386 1283 395 L 1285 398 1288 417 1284 436 Q 1278 450 1268 450 L 1267 450";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1283 161 L 1283 158 1285 139 Q 1264 134 1208 100 L 1177 81 1173 81 Q 1163 81 1146 61 L 1128 31 1115 5 1099 -22 1088 -49 1066 -74 1018 -80 Q 984 -84 982 -99 975 -102 967 -108 L 952 -124 917 -156 902 -171 889 -186 875 -183 Q 869 -183 860 -189 L 830 -196 791 -189 742 -182 Q 690 -182 646 -205 601 -228 570 -228 539 -228 499 -248 L 448 -256 434 -259 416 -258 396 -261 365 -264 Q 330 -264 307 -251 284 -238 277 -238 L 185 -252 107 -269 87 -269 Q 72 -254 47 -253 L 5 -253 -53 -236 Q -128 -202 -142 -188 -161 -167 -231 -137 -294 -111 -311 -111 -322 -111 -329 -102 L -338 -93 -345 -94 -346 -103 Q -346 -113 -284 -143 L -230 -168 Q -201 -181 -172 -202 L -115 -240 -35 -281 19 -292 Q 55 -296 73 -303 L 102 -302 139 -296 164 -292 279 -275 303 -285 366 -295 422 -292 440 -291 451 -290 456 -286 470 -285 Q 532 -280 567 -262 616 -255 667 -233 709 -215 744 -215 L 784 -222 831 -230 876 -221 893 -212 920 -200 932 -178 989 -111 990 -111 1007 -109 1051 -116 Q 1082 -117 1089 -90 L 1119 -36 1157 29 1169 48 1170 48 1207 65 1243 84 1281 102 Q 1295 109 1295 122 L 1295 126 1291 135 1292 137 1299 167 1298 170 1294 171 Q 1284 171 1283 161";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -284 -143 L -307 -140 -312 -140 -318 -137 Q -358 -113 -358 -91 -358 -85 -333 -76 L -309 -59 -314 -47 -313 -44 -332 -16 -396 37 -409 50 -429 60 -418 61 -434 82 -436 84 -453 99 -450 104 -449 106 Q -469 136 -470 150 L -487 181 -467 195 -463 194 Q -453 194 -450 205 L -442 210 -440 209 -435 214 Q -397 238 -397 243 -397 254 -408 254 L -423 249 -428 247 -424 292 -421 301 Q -406 344 -406 349 L -410 360 -404 397 Q -410 398 -419 405 L -441 427 -446 430 -445 433 -446 438 Q -437 466 -423 466 -400 495 -357 528 -252 608 -135 618 L -70 619 Q -60 621 -58 632 L -55 648 -27 664 1 676 Q 22 687 35 699 L 137 688 204 674 Q 252 665 252 680 L 252 682 300 690 Q 395 709 395 730 395 742 382 742 L 277 718 234 708 214 703 169 718 154 724 126 727 51 726 52 733 59 745 55 753 48 756 Q 19 742 13 742 L 16 755 4 763 Q -8 763 -111 700 -137 684 -167 656 -182 642 -204 642 L -208 647 -216 651 -235 642 Q -245 636 -265 636 -276 627 -268 619 -301 597 -357 563 -419 526 -426 526 L -430 528 -435 530 Q -448 530 -451 502 -451 496 -461 480 L -475 457 -495 414 -493 406 -492 406 -487 407 -479 402 -473 394 -460 391 Q -453 391 -451 383 -448 375 -448 347 -448 324 -456 293 L -465 263 Q -465 248 -477 234 L -504 201 -516 190 -508 176 -463 95 -430 27 -408 5 -402 0 -384 -13 -346 -41 Q -374 -81 -396 -87 L -381 -118 -355 -148 Q -364 -151 -364 -159 L -259 -228 Q -171 -267 -153 -270 L -128 -266 Q -123 -266 -117 -270 L -103 -274 -93 -272 -71 -283 -28 -294 Q -9 -294 60 -313 L 88 -320 91 -320 102 -322 102 -325 105 -325 104 -327 Q 104 -332 130 -334 139 -326 173 -309 223 -283 251 -283 L 318 -295 356 -311 427 -326 435 -327 Q 465 -310 548 -287 L 707 -248 765 -248 864 -255 875 -253 895 -236 939 -203 974 -169 Q 977 -159 996 -153 L 996 -151 998 -152 1009 -150 1058 -145 1101 -142 1161 -46 1217 48 1234 56 Q 1293 87 1315 107 L 1317 109 1327 125 Q 1327 134 1319 135 1330 139 1330 151 L 1325 194 1325 285 1327 332 1325 370 1311 417 1305 465 Q 1302 493 1287 498 1258 507 1158 580 L 1077 638 Q 1102 641 1102 653 1102 665 1074 665 L 1031 662 952 659 938 657 926 654 900 654 Q 864 647 836 689 807 733 790 733 L 772 708 788 690 809 664 825 640 Q 837 628 855 628 L 993 616 Q 1001 614 1004 619 L 1007 628 1030 627 1035 628 Q 1215 480 1225 480 L 1237 486 Q 1254 486 1267 450 L 1268 450 Q 1278 450 1284 436 L 1288 417 1285 398 1285 397 1285 395 1283 395 Q 1276 386 1261 386 L 1235 380 1227 380 1242 339 1239 334 1236 328 1250 270 1272 191 1283 161 Q 1284 171 1294 171 L 1298 170 1299 167 1292 137 1295 127 1295 126 1295 122 Q 1295 109 1281 102 L 1243 84 1207 65 1170 48 1169 48 1157 29 1119 -36 1089 -90 Q 1082 -117 1051 -116 L 1007 -109 990 -111 989 -111 932 -178 920 -200 893 -212 876 -221 831 -230 784 -222 744 -215 Q 709 -215 667 -233 616 -255 567 -262 532 -280 470 -285 L 456 -286 451 -290 440 -291 422 -292 366 -295 303 -285 279 -275 164 -292 139 -296 117 -305 102 -302 73 -303 Q 55 -296 19 -292 L -35 -281 -115 -240 -172 -202 Q -201 -181 -230 -168 L -284 -143 M 422 -292 L 421 -295 422 -301 416 -299 411 -297 407 -296 422 -292";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape1969(ctx,ctrans,frame,ratio,time){
	var pathData="M 753 67 L 733 74 Q 710 69 705 62 L 723 65 754 57 753 67 M 725 82 L 744 100 747 95 Q 770 89 807 110 L 790 118 Q 761 118 750 110 759 127 759 150 759 183 741 201 726 219 714 242 757 245 757 284 L 756 293 735 296 710 293 696 290 692 299 Q 693 309 687 315 L 682 316 673 328 Q 652 353 614 375 627 383 627 401 L 618 423 613 427 623 425 Q 672 414 672 446 672 454 640 471 608 488 590 488 564 488 548 472 L 537 458 527 462 510 468 Q 528 470 528 482 528 495 512 517 494 541 477 541 L 436 534 Q 431 550 412 564 377 592 312 592 288 592 283 570 L 283 556 282 554 282 550 283 549 283 547 284 534 272 528 266 526 267 524 194 522 Q 137 503 61 465 L 53 465 -25 468 -29 468 -45 461 Q -54 451 -48 438 L -37 425 -36 425 -36 418 -40 409 -62 396 -67 394 Q -86 391 -86 380 L -86 379 Q -136 342 -142 316 L -145 309 -142 295 Q -138 259 -115 245 L -109 241 -127 238 -154 226 Q -175 212 -151 194 -127 175 -88 174 L -41 178 -40 178 -43 177 Q -58 176 -55 167 L -53 166 -47 166 Q -39 167 -35 170 L -24 156 Q -1 124 44 93 33 78 39 64 43 53 54 44 L 47 36 Q 37 25 36 14 60 49 93 49 128 49 144 24 L 156 31 179 20 224 20 256 31 271 26 303 17 320 20 338 23 390 17 436 10 Q 431 26 436 40 L 437 42 462 33 547 33 562 35 582 14 Q 581 24 587 34 L 590 39 652 52 673 42 697 57 693 64 Q 712 72 725 82 M 741 216 Q 741 199 779 196 817 193 817 211 817 222 805 230 795 237 783 237 L 748 228 Q 741 222 741 216 M 526 290 L 528 289 524 289 526 290 M 538 55 L 507 54 449 58 Q 463 68 490 68 517 68 538 55 M 568 440 L 579 437 578 437 571 437 568 440 M 737 350 Q 725 371 695 371 L 667 369 663 348 Q 663 342 694 331 725 320 741 320 L 745 326 737 350 M 293 89 L 303 90 296 85 262 87 274 88 282 88 293 89 M 17 60 L -6 74 Q -20 74 -32 64 L -43 50 Q -43 25 -7 17 29 10 29 38 29 47 17 60 M 35 117 L 57 117 69 115 71 115 64 110 53 102 31 118 35 117 M 3 87 Q 16 89 8 97 0 104 -9 103 -21 105 -17 94 L -9 88 3 87 M 0 203 Q -16 199 -3 188 L 6 183 -5 173 -13 190 Q -10 194 -12 199 -2 203 -1 206 L 0 205 5 204 3 203 0 203 M 5 147 L -3 167 -4 169 18 166 5 147 M 81 449 L 78 451 95 458 91 454 85 446 81 449 M 252 446 L 243 453 257 453 270 458 298 456 320 455 Q 331 449 339 446 L 338 446 321 439 319 440 Q 295 455 257 446 L 256 446 252 446 M 149 482 L 148 478 140 477 Q 135 472 120 470 L 149 482 M 350 541 L 302 546 298 543 Q 302 556 334 556 L 360 549 350 541 M 500 556 L 502 563 Q 502 577 443 594 433 594 423 586 L 414 577 Q 414 563 439 561 L 498 554 500 556 M -66 20 L -70 30 -75 40 -82 39 -88 36 -78 34 -89 36 -117 38 Q -127 26 -123 15 L -69 15 Q -66 12 -66 20 M -180 110 L -176 108 -166 102 -166 101 -180 110 M -117 112 L -100 101 -121 108 -117 112 M -122 65 Q -42 42 -42 93 -42 110 -54 127 -73 152 -114 152 -158 152 -183 135 -201 122 -201 112 -201 88 -122 65 M -192 173 Q -192 186 -203 208 -216 235 -234 235 -265 235 -279 216 L -286 197 Q -286 163 -195 159 L -192 173 M -29 221 L -34 223 -53 241 -39 237 -13 216 -29 221 M -211 178 L -230 178 -237 180 -216 182 -211 178 M -201 287 L -189 288 Q -156 296 -171 314 -177 294 -201 287 M -81 364 L -71 353 -88 350 -104 342 -81 364 M -207 266 Q -215 261 -207 253 L -193 248 -175 248 Q -156 253 -167 262 -179 273 -200 269 L -207 266 M -116 325 L -114 329 -115 325 -116 325";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 683 47 Q 718 70 686 99 L 646 137 Q 642 139 641 140 L 639 142 638 148 Q 612 137 582 136 L 571 136 538 129 427 115 401 115 Q 396 108 366 108 L 318 113 314 114 262 115 Q 316 118 403 136 L 408 136 456 140 Q 483 146 483 152 L 505 158 Q 544 168 597 193 L 623 207 633 209 Q 661 215 673 230 L 681 239 Q 695 267 642 288 L 640 289 Q 635 299 602 309 L 601 307 603 304 578 314 569 314 567 318 547 335 Q 550 346 533 359 L 518 370 518 372 513 378 Q 506 390 466 408 477 427 464 442 461 470 318 466 L 304 468 276 473 204 468 173 453 76 433 11 413 -21 399 -32 397 -44 390 -55 388 -65 383 -88 377 Q -111 372 -116 351 -121 327 -95 308 -87 301 -66 295 L -56 292 -56 286 Q -53 274 -12 244 L 0 234 5 232 3 231 0 230 Q -16 228 -3 216 5 211 21 208 L 36 206 41 208 44 209 41 205 40 201 Q 30 181 41 166 L 36 169 35 160 51 147 69 143 71 142 64 138 Q 30 115 39 92 49 65 113 41 145 25 194 16 L 349 6 352 5 400 -1 435 6 461 7 571 21 605 29 616 29 Q 655 30 683 47 M 526 319 L 528 317 524 317 526 319 M -49 90 Q -49 106 -57 115 L -58 117 Q -65 127 -76 127 L -81 127 -91 127 Q -109 127 -116 115 L -120 107 -120 103 -120 99 Q -120 77 -85 73 -49 68 -49 90 M -108 40 L -113 47 -126 53 Q -142 54 -144 41 -144 24 -126 26 -108 29 -108 40 M -166 104 L -168 110 -174 112 -184 101 Q -184 95 -174 94 L -166 104 M -135 152 L -135 159 -138 161 -144 162 -159 157 -162 152 Q -162 142 -149 142 -135 141 -135 152 M -192 185 L -210 199 -228 191 -232 183 Q -232 170 -211 167 -189 165 -189 175 -189 183 -192 185";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 678 21 L 671 21 662 33 663 36 670 34 678 21 M 401 -10 L 416 -8 430 3 Q 413 35 397 44 411 47 421 56 L 437 88 440 97 463 90 469 85 494 83 504 83 536 84 558 90 580 87 609 87 623 91 645 88 Q 668 92 671 103 673 116 644 113 L 626 108 625 110 Q 613 128 575 123 L 572 122 566 135 559 141 580 143 582 143 582 142 Q 585 136 615 128 L 652 124 Q 683 127 662 149 643 170 614 167 L 610 173 Q 589 198 544 193 506 183 498 173 L 471 171 Q 455 168 435 152 416 138 418 122 394 137 363 133 L 314 124 317 131 308 137 300 141 308 149 293 152 265 145 Q 239 136 243 127 246 120 262 118 L 282 115 302 120 308 121 Q 280 108 291 84 304 55 339 46 L 350 43 344 40 Q 326 30 332 15 L 336 8 344 7 401 -10 M 538 -3 L 599 -9 593 15 Q 579 42 535 52 L 481 55 Q 450 52 439 26 428 5 434 -14 466 -1 538 -3 M 630 -6 L 688 -11 Q 752 -4 724 39 697 82 631 75 606 72 594 59 583 45 594 22 602 5 630 -6 M 214 -17 L 229 -22 Q 235 -11 249 -5 276 9 308 10 L 305 10 Q 341 17 320 43 295 72 260 68 L 235 59 Q 218 48 226 30 L 233 20 216 20 181 10 Q 163 0 163 -16 L 214 -17 M 738 222 L 751 228 742 237 Q 726 234 726 226 726 220 738 222 M 425 398 L 417 398 401 407 399 409 408 408 425 398 M 424 321 Q 459 329 437 346 413 363 379 356 L 361 345 Q 349 335 353 333 368 321 394 320 L 424 321 M 520 231 Q 526 216 555 210 L 597 207 Q 650 214 635 246 623 279 564 273 L 536 263 Q 511 251 520 231 M 411 162 Q 484 171 472 210 468 225 454 234 493 241 486 261 477 284 455 282 L 422 275 Q 393 266 401 249 L 406 243 382 241 Q 364 239 349 230 324 216 334 194 344 173 372 165 L 411 162 M 483 132 L 485 137 486 137 490 134 483 132 M 489 480 L 489 475 Q 489 467 504 465 520 461 520 475 L 513 481 501 484 Q 492 484 489 480 M 453 372 Q 517 387 463 419 409 453 344 440 319 433 313 420 310 407 334 389 351 375 387 369 L 453 372 M 567 413 Q 567 385 609 388 652 392 652 410 L 640 422 609 431 Q 581 431 571 423 L 567 413 M 721 305 L 700 307 688 304 687 301 Q 687 289 705 288 724 287 724 297 L 721 305 M 315 301 Q 323 294 340 295 L 361 299 Q 396 309 375 314 L 335 320 320 314 Q 305 309 315 301 M 153 470 L 153 475 155 475 160 472 153 470 M 194 403 Q 163 397 166 372 166 351 188 334 210 316 249 316 L 303 322 Q 339 330 349 338 373 354 336 382 307 404 254 407 L 194 403 M 60 488 L 82 493 63 493 -25 496 17 485 60 488 M 41 259 Q 65 266 82 284 103 311 68 332 59 340 30 342 67 353 28 372 -14 395 -49 388 L -71 375 Q -83 364 -63 350 L -52 342 -69 339 Q -90 335 -102 327 -123 312 -91 288 -73 273 -31 263 L 41 259 M 157 297 Q 150 290 162 280 177 268 208 267 L 239 268 Q 269 276 244 294 217 313 170 302 L 157 297 M 161 340 L 170 351 Q 132 377 111 383 125 388 131 397 134 407 129 427 L 126 435 156 431 165 428 193 429 205 430 236 435 257 443 283 443 315 447 326 452 351 453 Q 375 458 371 469 366 481 338 473 324 472 321 467 L 319 468 Q 295 483 257 474 L 254 472 241 483 231 488 250 492 255 493 254 492 Q 262 486 298 483 L 339 484 Q 371 491 335 508 305 523 273 516 L 266 522 Q 231 540 185 530 L 175 528 157 518 148 507 140 506 Q 132 498 105 495 L 91 482 Q 78 467 90 453 L 25 456 -22 442 Q -20 446 -23 448 L -35 453 -37 453 -36 452 Q -32 440 -48 432 L -33 437 -29 439 Q -50 425 -25 404 5 382 47 377 L 62 377 57 373 Q 42 362 59 350 93 325 143 336 L 161 340 M 155 194 Q 152 195 155 196 L 158 196 160 194 155 194 M 65 150 Q 105 153 76 175 46 196 31 195 2 186 10 167 15 157 35 152 L 65 150 M 121 57 L 183 55 Q 243 62 202 103 162 144 100 137 73 133 61 112 47 91 60 93 72 65 121 57 M 258 152 Q 291 156 275 173 258 193 234 189 L 219 185 225 198 241 192 261 191 Q 294 194 294 211 294 229 258 225 L 236 219 222 206 221 208 Q 211 244 156 238 141 236 124 226 98 214 105 195 117 172 139 166 151 162 177 166 199 167 210 175 L 210 163 Q 214 155 233 152 L 258 152 M -45 103 Q -45 110 -52 118 -62 129 -76 129 L -120 120 -124 112 Q -124 89 -85 83 -45 77 -45 103 M -111 46 Q -111 54 -120 54 L -135 49 -141 42 Q -141 29 -126 32 -111 36 -111 46 M -157 104 L -159 110 -169 112 -180 105 Q -180 96 -159 99 L -157 104 M -137 157 L -148 159 Q -162 159 -162 150 -162 140 -152 141 -143 141 -129 152 L -137 157 M -180 198 Q -186 206 -195 206 -214 206 -216 191 -216 171 -196 170 -175 170 -175 187 L -180 198 M -166 361 L -167 360 -165 360 -166 361 M -91 233 Q -68 215 -22 225 25 236 -29 249 L -100 260 Q -115 257 -113 253 L -91 233";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 439 475 Q 407 465 419 455 447 434 477 440 L 485 449 462 472 439 475 M 420 371 Q 444 351 482 349 L 525 351 Q 542 355 534 377 L 526 401 529 403 Q 516 412 482 418 L 436 420 Q 418 416 409 407 394 390 420 371 M 405 299 L 430 304 Q 451 309 440 321 428 335 391 326 L 379 321 Q 367 314 377 308 387 299 405 299 M 579 367 L 562 361 Q 546 352 561 342 571 334 598 332 L 630 335 Q 650 339 641 358 632 379 579 367 M 513 321 L 525 330 505 332 Q 488 329 486 322 L 513 321 M 515 257 Q 545 246 556 248 580 250 573 273 564 299 534 295 L 511 287 491 273 Q 484 267 515 257 M 596 280 L 598 278 600 279 619 277 638 276 Q 668 279 656 290 642 301 621 299 590 294 596 280 M 426 104 Q 437 120 423 148 409 178 383 183 371 187 344 183 327 181 313 173 291 160 302 137 311 117 342 103 374 88 402 92 419 93 426 104 M 601 241 L 607 237 621 236 Q 635 238 630 250 626 262 613 261 L 605 257 Q 595 252 601 241 M 556 233 Q 541 226 546 215 551 204 566 201 L 588 203 Q 610 205 601 222 593 239 573 236 L 556 233 M 530 160 L 547 145 Q 567 130 580 131 608 135 611 166 614 196 558 190 L 537 183 Q 522 175 530 160 M 484 164 Q 428 158 442 130 447 117 475 111 L 508 109 Q 541 112 523 140 504 167 484 164 M 445 182 L 488 179 Q 501 181 521 197 545 216 527 228 516 238 484 249 L 439 259 Q 426 258 412 246 393 230 402 209 411 188 445 182 M 482 78 Q 501 81 497 90 L 490 98 479 97 Q 460 98 465 85 469 77 482 78 M 489 24 L 481 22 Q 473 20 476 15 480 6 500 8 518 10 513 19 L 489 24 M 575 101 Q 577 94 595 96 614 99 608 107 602 115 588 113 570 110 575 101 M 569 22 Q 612 27 596 60 583 93 521 86 507 84 499 79 484 70 491 54 L 497 45 498 43 Q 508 33 525 27 L 569 22 M 643 239 L 649 236 664 234 Q 672 235 673 242 672 250 658 248 640 246 643 239 M 667 172 L 704 167 Q 735 171 720 200 706 230 650 225 L 635 219 Q 623 210 630 194 638 179 667 172 M 704 161 L 694 157 Q 688 154 691 148 695 141 710 143 726 145 723 153 719 162 704 161 M 655 107 L 675 105 Q 704 108 689 141 680 159 655 157 644 155 638 149 L 629 133 Q 642 113 655 107 M 646 82 L 638 79 Q 629 77 631 72 635 62 654 65 669 67 666 74 665 83 646 82 M 625 34 L 644 31 Q 661 32 656 42 L 654 57 631 59 Q 602 57 607 45 610 38 625 34 M 753 95 Q 748 104 733 102 700 94 705 82 718 57 748 60 755 61 759 68 L 753 95 M 378 -1 L 419 -5 Q 461 0 457 36 452 73 383 65 L 353 56 Q 335 45 344 23 352 8 378 -1 M 778 -36 L 776 -37 Q 772 -38 767 -41 L 778 -37 778 -36 M 672 -27 L 696 -34 731 -43 739 -42 Q 756 -41 763 -15 L 769 11 771 12 Q 766 25 739 36 L 700 43 Q 682 41 670 32 647 16 658 -8 L 672 -27 M 572 -4 L 572 -6 595 -8 595 -3 Q 593 4 580 2 L 575 1 Q 570 -1 572 -4 M 172 -14 L 210 -16 Q 247 -11 236 16 227 46 172 39 156 38 149 26 140 15 148 1 152 -11 172 -14 M 80 -9 L 71 -11 Q 61 -16 64 -26 L 74 -32 88 -34 Q 108 -32 103 -20 100 -7 80 -9 M 499 480 Q 499 470 515 468 531 466 531 476 L 528 485 519 495 504 488 Q 499 486 499 480 M 582 409 Q 582 397 618 388 654 379 654 400 646 436 621 436 596 436 586 423 L 582 409 M 721 301 L 712 301 695 299 694 294 Q 694 286 709 288 724 289 724 296 L 721 301 M 203 540 L 208 541 198 541 203 540 M 371 529 Q 402 535 369 559 344 578 302 574 292 564 272 556 L 266 554 276 542 Q 293 530 329 528 L 371 529 M 392 508 Q 408 512 397 519 L 374 523 365 519 Q 361 515 367 510 L 392 508 M 348 445 Q 341 440 346 436 L 375 434 Q 390 436 383 443 L 357 447 348 445 M 308 490 Q 335 473 352 471 363 468 374 471 403 477 368 503 349 519 325 514 L 311 504 308 490 M 382 403 Q 399 407 390 414 L 379 425 Q 373 430 354 425 323 419 335 409 L 361 403 382 403 M 215 489 Q 245 478 257 481 287 488 272 515 258 542 203 530 189 528 184 522 171 513 189 500 L 215 489 M 301 464 L 277 467 Q 259 463 268 456 L 294 453 Q 312 457 301 464 M 207 404 Q 211 399 217 397 L 221 394 Q 236 388 256 385 283 380 307 385 350 396 315 423 281 449 220 435 L 202 426 Q 190 417 207 404 M 211 368 L 242 365 Q 259 368 249 375 L 220 377 213 374 Q 206 372 211 368 M 263 262 Q 270 266 258 276 242 288 222 283 L 209 277 Q 200 269 210 260 L 231 257 252 258 263 262 M 351 346 Q 342 341 347 337 360 329 378 332 402 337 395 346 389 356 364 351 L 351 346 M 324 369 Q 320 367 324 362 L 334 360 346 361 Q 356 362 349 367 L 330 370 324 369 M 3 370 Q 68 386 26 410 -16 435 -67 423 -86 419 -86 408 -89 395 -64 376 -55 369 -28 369 L 3 370 M 156 451 L 194 452 Q 227 460 192 482 156 503 137 498 80 486 110 463 123 453 156 451 M 161 427 L 183 424 Q 202 428 192 435 L 180 441 170 440 Q 148 437 161 427 M 81 477 L 53 493 -29 496 -45 489 Q -54 480 -48 467 L -36 452 -36 446 Q -15 435 19 427 L 91 425 Q 108 428 109 439 110 453 81 477 M 15 343 Q 42 349 27 358 L -18 362 Q -48 357 -33 345 L -9 340 15 343 M 8 263 Q 23 266 16 279 8 290 -16 285 L -29 278 -22 266 8 263 M 194 342 Q 170 330 200 307 220 292 254 287 282 282 304 287 351 298 309 328 266 360 228 351 L 194 342 M 116 342 L 161 343 Q 205 353 180 384 155 415 84 400 L 58 388 Q 44 376 67 358 83 346 116 342 M 137 268 Q 200 283 155 316 111 349 58 337 38 332 25 323 4 307 25 291 48 273 82 268 111 263 137 268 M 3 115 Q 16 117 8 125 0 133 -9 131 -21 133 -17 122 L -9 116 3 115 M 3 160 Q 8 148 35 146 L 67 146 Q 143 156 118 188 L 90 211 119 215 Q 135 182 193 188 239 195 224 225 211 256 162 249 L 134 241 129 241 124 244 Q 96 265 42 253 L 20 248 Q 2 241 14 230 28 220 45 216 L 31 207 8 213 -9 198 18 194 Q -2 171 3 160 M 80 83 Q 61 81 47 64 30 45 39 26 49 5 99 10 143 15 125 51 108 87 80 83 M 60 99 L 73 99 Q 94 102 86 115 77 128 61 127 41 125 49 108 51 100 60 99 M 147 60 L 167 56 Q 190 58 182 72 174 84 156 83 144 82 143 78 140 74 147 60 M 158 103 L 198 98 Q 256 104 239 142 222 180 160 173 143 171 131 162 115 148 125 126 134 110 158 103 M 337 241 L 335 238 Q 338 233 351 234 383 238 380 253 377 267 355 266 314 256 318 251 L 339 243 337 241 M 339 197 L 353 201 Q 363 206 359 214 L 338 226 315 231 Q 298 230 305 216 310 204 318 199 L 339 197 M 301 192 Q 289 206 261 203 L 245 200 Q 240 195 245 183 250 171 288 175 313 178 301 192 M 257 218 L 273 219 Q 310 224 296 231 L 254 236 Q 242 235 246 225 L 257 218 M 263 145 Q 314 151 259 162 242 153 244 148 L 263 145 M 268 47 L 296 44 Q 361 52 338 83 316 115 263 110 245 107 239 96 229 82 241 59 245 50 268 47 M 270 13 L 290 13 Q 318 16 310 28 303 41 274 37 245 36 251 21 254 15 270 13 M -54 108 L -75 112 Q -103 112 -99 98 -99 80 -76 83 -52 84 -52 101 L -54 108 M -207 293 Q -215 288 -207 282 -202 278 -193 277 L -175 277 Q -156 281 -167 291 -179 302 -200 297 L -207 293 M -88 203 L -51 204 Q -57 202 -55 196 L -53 194 -47 194 Q -30 199 -29 203 L -42 205 -38 206 Q 15 219 -35 248 -81 277 -127 267 L -154 255 Q -175 241 -151 222 -127 203 -88 203 M -29 278 L -30 280 -38 279 -39 276 -34 273 -29 278 M -189 317 Q -156 325 -171 343 -177 323 -201 314 L -189 317 M -60 306 Q -19 316 -46 339 -71 364 -127 351 -144 347 -145 337 -147 326 -132 314 -114 300 -60 306 M -65 289 Q -84 297 -93 294 -111 292 -102 284 L -82 279 -62 279 Q -48 282 -65 289";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 162 40 Q 162 54 96 85 L 78 84 Q 69 82 69 73 69 64 76 64 L 88 68 Q 97 68 127 51 L 128 48 119 35 Q 119 14 151 -4 182 -23 182 0 L 177 7 162 5 Q 157 5 149 14 L 142 24 152 32 Q 162 35 162 40 M 65 60 L 67 62 69 66 Q 69 84 26 127 L -17 168 -17 170 -24 185 Q -32 196 -40 196 L -61 191 -63 202 -80 206 -102 201 Q -120 201 -134 208 -146 214 -146 221 L -142 237 Q -136 240 -136 248 L -137 253 -139 254 Q -124 260 -124 294 -124 327 -134 327 -148 327 -151 315 -155 305 -151 300 -163 301 -163 280 L -162 268 -178 275 -202 281 Q -220 281 -216 266 -216 242 -199 242 L -185 246 Q -177 250 -175 253 L -179 259 -178 262 -170 261 Q -168 261 -161 264 -158 255 -152 253 L -159 244 Q -170 237 -169 214 -169 197 -140 185 -111 173 -74 173 L -52 177 -46 179 Q -45 165 -26 144 -5 120 23 109 L 21 103 Q 21 98 24 96 L 42 86 Q 25 68 25 60 25 39 49 39 72 39 72 52 L 65 60 M 14 16 L 13 20 10 21 Q 28 29 28 43 28 54 16 54 3 54 0 47 L -4 36 -5 35 -17 46 -10 68 Q -10 78 -19 78 -35 78 -35 47 -35 31 -27 23 -16 13 13 12 L 14 16 M 54 72 L 63 61 46 57 54 72 M -93 31 L -90 24 -95 22 -118 26 -113 27 -106 32 -133 36 -152 18 Q -152 8 -103 6 L -103 4 -80 8 Q -73 12 -73 21 L -76 28 -88 37 -93 31 M -74 97 Q -92 83 -118 83 -133 83 -147 94 L -156 87 -174 100 -161 113 Q -148 120 -148 126 -148 136 -161 136 -181 136 -191 115 L -197 94 Q -48 -7 -48 102 -48 110 -57 110 L -74 97 M -80 75 L -67 88 -65 82 -68 74 Q -71 67 -76 66 L -80 75 M -193 169 Q -193 172 -200 175 L -219 174 -244 174 -263 198 -244 199 -242 200 Q -256 211 -266 211 -283 211 -285 196 -285 188 -270 171 -251 150 -229 150 L -201 158 -193 169 M -199 255 L -200 255 -203 267 -200 267 -199 255";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite433(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape429",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape430",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape431",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape432",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape1970(ctx,ctrans,frame,ratio,time){
	var pathData="M 732 97 Q 753 105 766 117 L 784 134 788 156 795 204 790 235 783 243 759 279 735 300 Q 626 313 627 356 628 373 657 381 L 669 385 684 391 687 396 687 397 658 415 667 423 608 464 Q 588 476 536 490 487 502 478 509 464 520 455 541 L 444 575 Q 438 585 391 608 L 384 618 367 619 Q 344 619 336 599 L 335 586 334 584 334 580 335 579 335 577 334 565 321 559 315 557 316 555 242 554 99 497 89 497 8 500 4 500 -14 493 Q -25 483 -20 471 L -10 457 -9 458 -11 450 -16 442 Q -29 434 -42 428 L -47 426 Q -68 423 -69 411 L -69 410 Q -130 372 -141 345 L -145 338 -145 323 Q -110 317 -91 292 L -86 292 -87 285 -85 282 Q -65 227 -50 205 L -30 193 -9 180 -11 190 -12 192 12 189 -5 169 -6 170 Q -5 166 -7 162 L -7 145 -5 139 30 110 21 95 25 83 23 72 Q 26 62 35 55 L 26 46 Q 26 43 24 45 L 16 33 10 20 Q 42 60 79 61 119 62 133 35 139 41 147 43 L 172 32 223 34 259 47 275 42 Q 303 32 309 32 L 329 37 349 41 405 35 455 29 Q 451 47 457 63 L 458 65 484 55 576 58 592 62 613 39 Q 613 50 619 61 L 622 67 689 83 710 72 736 90 732 97 M 305 113 L 316 114 308 108 276 110 284 111 293 111 305 113 M 568 328 L 564 328 566 329 568 328 M 568 83 L 535 81 473 83 Q 488 94 517 96 546 95 568 83 M 782 109 L 774 109 Q 751 102 745 95 L 763 99 783 96 782 109 M 1 229 L -3 229 Q -21 223 -8 212 L 1 207 -13 196 -19 214 Q -15 218 -17 225 -4 229 -3 232 L -2 231 3 230 1 229 M 48 137 L 61 135 64 135 55 129 42 120 21 136 24 136 48 137 M 118 482 L 114 484 133 491 128 487 120 479 118 482 M 182 510 Q 177 505 160 503 L 192 515 190 511 182 510 M 353 576 L 349 573 Q 355 585 387 587 L 412 580 401 572 353 576 M 299 481 L 294 481 285 488 Q 295 485 300 488 L 314 493 343 491 365 490 383 481 382 481 364 474 362 475 Q 340 490 299 481 M 474 612 L 486 605 477 614 474 612 M -1 30 L 0 31 -1 32 -1 30 M -15 242 L -32 247 -37 249 -55 268 -41 264 -15 242 M -177 324 Q -176 323 -174 325 -164 331 -173 342 L -184 328 -180 326 -177 324 M -108 357 L -110 355 -111 355 -108 357 M -77 381 L -95 373 -67 396 -58 385 -77 381";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 650 56 Q 692 58 721 78 759 103 725 134 L 684 174 679 177 677 179 676 185 Q 649 173 617 171 L 606 171 571 162 452 145 424 144 Q 419 135 386 136 L 335 140 330 141 274 140 428 167 434 167 485 172 Q 514 179 514 185 L 537 192 Q 579 203 636 231 L 662 247 673 249 Q 703 256 714 271 L 723 280 Q 729 290 724 301 631 314 628 351 L 620 354 610 354 608 358 589 375 Q 593 386 575 399 L 561 410 561 411 556 417 510 446 Q 522 464 509 478 509 505 364 500 L 349 502 321 507 247 501 213 487 110 467 39 446 2 432 -9 430 -23 422 -36 420 -46 415 -73 408 Q -98 402 -107 382 -115 356 -91 337 -83 330 -61 324 L -51 321 -51 315 Q -49 302 -10 272 L 2 262 7 260 Q 7 258 4 259 L 1 257 Q -15 255 -4 243 5 236 21 235 L 38 233 43 235 46 236 43 232 41 228 Q 28 205 37 190 L 32 193 30 184 Q 33 175 46 169 L 65 165 68 164 59 160 Q 19 134 25 109 32 78 101 53 135 36 188 27 L 359 22 363 21 415 16 Q 448 19 453 25 L 482 27 601 46 638 56 650 56 M 567 358 L 569 356 565 356 567 358";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 427 407 L 494 410 Q 561 425 507 456 455 489 388 475 362 468 355 456 351 442 374 426 391 412 427 407 M 451 446 L 468 436 459 436 443 445 442 447 451 446 M 431 357 L 462 359 Q 499 367 477 384 454 400 418 394 L 398 382 Q 386 372 389 370 404 358 431 357 M 604 313 L 574 302 Q 548 289 557 269 563 254 592 248 L 636 246 Q 691 254 676 287 665 320 604 313 M 438 195 Q 517 206 506 247 503 262 488 271 530 279 523 299 515 322 492 320 L 457 312 Q 426 302 434 285 L 439 279 412 277 377 265 Q 350 250 358 226 368 205 397 197 L 438 195 M 516 170 L 521 167 513 165 515 170 516 170 M 631 14 L 625 40 Q 612 69 565 80 L 507 81 Q 474 75 459 47 447 23 451 2 488 18 565 18 L 631 14 M 614 119 L 644 120 659 124 682 122 Q 707 126 710 138 713 152 682 149 L 663 143 661 145 Q 650 163 609 157 L 606 156 600 170 594 176 615 179 617 179 617 178 Q 621 170 652 163 L 690 160 Q 723 163 701 187 683 208 652 205 L 648 211 Q 627 236 580 230 540 218 530 208 L 502 206 Q 486 201 463 184 442 169 443 152 419 167 385 163 L 331 151 Q 338 154 335 159 L 326 165 317 169 327 178 Q 332 183 311 181 L 280 173 Q 251 162 255 152 258 145 274 143 L 295 141 318 147 324 147 Q 293 131 303 107 315 74 352 66 L 364 63 357 60 Q 337 48 342 31 L 346 24 354 23 416 5 432 9 448 21 Q 432 56 415 66 431 69 442 80 453 92 461 116 L 465 125 489 119 495 113 522 111 533 112 567 114 590 121 614 119 M 699 62 L 700 66 707 64 716 50 708 50 699 62 M 726 14 Q 794 24 764 71 737 116 667 107 642 103 627 89 616 73 626 48 635 29 663 18 L 726 14 M 150 -10 L 207 -9 223 -15 Q 231 -2 248 6 278 22 311 25 352 33 330 62 307 94 267 89 251 85 238 77 219 64 226 44 L 232 34 213 34 172 21 Q 151 8 150 -10 M 612 451 Q 611 424 653 428 L 662 429 616 459 612 451 M 769 268 L 773 263 769 269 769 268 M -161 391 L -159 391 -160 392 -161 391 M -87 285 L -85 282 -72 248 -23 252 Q 30 264 -28 277 L -86 287 -87 285 M 123 525 L 104 525 12 527 Q 31 519 55 517 L 100 520 123 525 M 202 505 L 195 503 195 508 197 508 202 505 M 216 369 Q 238 350 279 351 L 337 358 Q 375 367 385 375 412 392 375 419 348 441 292 443 L 230 438 Q 198 432 197 406 195 386 216 369 M 347 337 Q 355 330 373 331 L 396 336 Q 433 346 411 351 L 370 357 354 350 Q 338 345 347 337 M 72 410 L 88 410 82 406 Q 65 394 81 383 115 358 169 370 L 189 375 199 386 Q 163 411 141 417 157 422 163 432 168 441 165 461 L 162 469 194 466 Q 197 463 203 463 L 231 464 244 465 277 470 299 478 325 478 358 482 371 487 396 488 Q 421 492 418 504 413 516 384 508 L 367 501 365 502 Q 341 516 302 508 L 299 506 286 517 276 521 296 525 301 526 300 525 344 517 386 519 Q 419 525 384 541 355 554 322 548 L 315 554 Q 282 570 234 561 L 223 559 Q 213 553 203 550 L 193 539 184 538 Q 176 530 148 527 L 132 515 Q 116 499 127 486 L 59 489 8 474 7 480 -4 485 -7 485 -6 484 Q -2 472 -21 465 -13 466 -5 470 L -1 470 Q -22 456 -1 437 29 415 72 410 M 50 289 Q 78 296 98 315 125 343 89 365 80 373 49 375 91 386 51 405 11 428 -28 420 -44 415 -54 406 -69 395 -50 382 L -38 373 -57 370 -96 357 Q -120 341 -90 316 -72 301 -28 291 L 50 289 M 194 336 L 179 330 Q 172 323 183 313 198 300 231 300 L 264 302 Q 297 310 272 329 245 348 194 336 M 171 222 L 166 222 Q 163 223 166 224 L 169 224 171 222 M 3 190 Q 8 179 28 174 L 62 173 Q 107 177 77 200 47 221 30 220 -3 210 3 190 M 112 72 Q 146 66 180 72 248 81 207 125 168 169 99 160 69 154 52 131 34 106 48 110 59 79 112 72 M 223 204 L 223 191 Q 227 182 246 179 L 274 180 Q 310 185 294 203 277 223 251 219 L 235 214 Q 242 220 242 229 244 223 258 222 L 280 221 Q 316 225 317 244 320 262 281 258 L 256 251 240 239 238 239 Q 232 276 173 269 L 136 256 Q 107 243 111 222 122 198 145 192 L 187 193 Q 211 194 223 204";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 731 72 L 707 61 Q 684 43 694 17 699 5 708 -4 L 733 -10 771 -19 780 -18 Q 799 -17 805 13 L 812 42 814 43 Q 809 57 780 68 L 793 22 Q 793 9 786 10 L 787 9 Q 761 15 751 37 749 3 731 72 M 160 -7 L 203 -8 Q 245 -2 235 29 229 62 166 53 149 51 139 38 128 24 135 9 139 -5 160 -7 M 46 -8 Q 35 -14 36 -25 38 -29 46 -31 L 62 -33 Q 86 -30 82 -16 80 -2 57 -4 L 46 -8 M 777 93 L 784 93 782 113 785 139 779 139 790 163 795 204 790 233 784 188 Q 777 141 777 93 M 660 381 Q 666 382 669 385 L 684 391 687 394 685 399 672 410 670 420 645 440 649 436 621 440 652 415 649 414 646 416 647 412 Q 647 402 632 401 615 396 605 385 L 604 382 602 379 596 367 606 346 612 332 612 336 Q 612 348 624 362 L 628 366 630 370 Q 638 384 651 384 L 659 383 660 381 M 629 451 L 608 464 Q 588 476 536 490 L 510 497 511 496 534 484 601 463 629 451 M 437 578 L 431 582 421 589 402 599 383 614 386 614 374 638 375 640 367 636 357 623 366 614 358 602 358 601 356 600 Q 355 575 369 564 L 413 562 423 564 Q 433 563 441 546 L 444 561 445 565 437 578 M 323 585 L 318 584 323 577 322 582 323 585 M 419 535 L 416 537 Q 399 552 374 547 L 360 537 355 523 Q 381 507 398 506 410 502 421 506 L 425 507 424 516 419 535 M 631 427 L 633 423 636 423 Q 634 423 631 427 M 591 342 L 593 337 591 345 591 342 M 593 334 L 574 334 550 326 529 311 Q 521 305 552 295 L 595 287 Q 618 288 614 308 L 612 310 Q 598 318 593 334 M 643 295 Q 636 290 641 281 L 647 277 661 276 Q 676 277 671 289 L 643 295 M 688 286 L 684 280 690 277 705 275 713 279 690 285 688 286 M 735 272 L 749 257 Q 731 269 691 266 L 675 259 Q 663 249 669 233 678 217 707 211 L 745 207 Q 771 210 767 229 L 768 225 768 227 Q 765 256 735 272 M 762 196 L 745 201 734 196 Q 729 192 731 186 736 179 751 182 L 758 183 762 196 M 821 -12 L 821 -11 819 -12 809 -16 821 -12 M 749 77 L 752 98 753 119 747 91 749 77 M 615 166 Q 645 171 649 204 654 234 594 227 L 572 220 Q 557 211 564 196 565 191 581 180 602 164 615 166 M 609 133 Q 611 126 630 129 651 132 644 141 638 149 623 147 604 142 609 133 M 667 170 Q 680 148 693 143 L 714 140 Q 745 144 729 179 721 197 694 195 L 676 186 667 170 M 692 72 L 691 88 667 90 Q 636 86 641 73 644 66 660 63 L 680 59 Q 699 60 692 72 M 683 115 L 675 111 Q 665 109 667 104 671 93 691 97 708 99 704 107 704 116 683 115 M 626 15 L 627 20 Q 625 27 611 25 L 605 24 Q 600 21 602 18 L 602 16 626 15 M 545 371 Q 529 368 525 361 L 553 360 Q 567 364 566 370 L 545 371 M 594 272 Q 579 264 582 253 589 241 603 240 L 626 242 Q 650 243 640 262 633 279 611 275 L 594 272 M 469 161 Q 474 147 504 142 L 538 141 Q 573 145 556 174 537 201 515 199 456 190 469 161 M 432 244 Q 440 221 476 216 L 520 214 Q 535 216 557 234 583 254 564 266 553 276 520 287 L 474 296 Q 461 295 445 282 425 265 432 244 M 450 132 Q 464 150 450 180 438 211 410 216 L 368 215 334 204 Q 310 189 319 165 328 143 360 129 394 113 424 119 443 120 450 132 M 435 12 Q 482 19 479 59 477 99 401 88 381 85 368 78 348 65 355 41 363 24 390 15 L 435 12 M 509 106 Q 529 109 525 120 L 518 128 506 126 Q 487 127 491 113 495 104 509 106 M 517 80 L 524 70 525 68 Q 535 57 552 51 L 599 47 Q 646 54 629 90 617 125 551 116 L 527 107 Q 511 96 517 80 M 539 42 L 513 47 504 45 Q 496 41 499 36 503 26 524 30 544 32 539 42 M 419 471 Q 435 472 428 479 421 487 401 483 L 392 480 Q 385 475 389 472 L 419 471 M 433 451 L 423 462 397 461 Q 365 455 377 446 L 403 440 424 440 Q 443 443 433 451 M 452 445 Q 436 427 461 409 484 389 523 388 L 567 391 Q 585 394 577 416 L 570 440 574 442 527 456 480 457 Q 463 453 452 445 M 441 336 L 468 342 Q 490 347 479 359 467 373 428 364 L 415 358 Q 403 351 413 345 423 336 441 336 M 607 376 L 608 376 Q 608 367 602 366 L 607 376 M 415 369 Q 440 374 433 384 L 402 389 388 383 Q 378 378 383 374 396 366 415 369 M 751 268 L 762 259 755 267 751 268 M 342 232 L 364 230 379 235 Q 391 239 387 248 L 366 260 342 265 Q 324 263 329 249 334 236 342 232 M 281 235 L 264 231 Q 259 225 262 213 267 200 308 205 336 209 324 223 312 237 281 235 M 275 191 L 257 175 278 173 Q 334 180 275 191 M 253 36 Q 256 28 273 27 L 295 28 Q 327 32 319 45 312 60 280 55 248 51 253 36 M 305 63 Q 377 73 354 107 333 142 275 135 255 130 246 119 235 102 245 78 249 67 274 65 L 305 63 M 111 29 Q 107 36 105 62 L 96 76 96 72 Q 94 52 60 87 L 29 127 Q 17 135 17 142 L 21 155 28 168 41 167 41 170 36 177 30 174 8 193 5 192 4 195 -20 211 Q -29 221 -39 255 L -62 301 -67 313 -89 335 -100 345 -108 345 -195 361 -194 364 -200 361 -208 350 -208 343 -191 341 Q -188 347 -178 347 -149 347 -111 330 L -108 329 -92 323 -80 311 Q -65 299 -62 286 -55 252 -40 216 L -33 211 -4 189 5 182 Q 15 173 16 158 L 15 135 15 129 16 127 Q 20 116 43 86 61 59 63 43 L 60 28 59 26 41 58 35 66 46 39 40 27 24 44 Q 21 32 7 32 L -3 19 28 20 81 18 Q 103 20 111 29 M 41 143 L 47 133 72 119 Q 87 124 80 135 75 145 61 147 L 51 137 48 146 41 143 M 64 169 Q 148 181 124 215 114 231 97 239 L 130 244 Q 143 209 206 217 257 225 244 257 234 289 180 281 L 149 272 143 272 Q 142 271 138 275 111 296 50 282 L 26 277 Q 5 269 17 258 31 247 49 244 L 33 234 8 240 3 237 19 221 38 199 54 188 64 169 M -12 252 Q -11 258 -21 265 L -20 264 -12 252 M -66 335 L -53 336 Q -6 347 -32 370 -55 395 -119 382 L -120 381 Q -88 377 -82 364 L -78 356 Q -65 350 -64 344 L -65 340 -73 342 -72 340 -66 335 M 138 96 Q 135 91 141 76 143 69 163 72 189 75 182 91 174 103 154 101 L 138 96 M 195 485 L 235 486 Q 271 493 236 516 202 534 181 530 121 518 149 497 162 486 195 485 M 312 491 L 338 488 Q 357 491 346 498 L 322 501 Q 303 497 312 491 M 372 397 L 384 398 Q 395 399 388 405 L 368 407 362 406 Q 358 403 362 399 L 372 397 M 219 475 L 209 474 Q 186 470 199 461 L 221 459 Q 241 463 231 470 L 219 475 M 276 401 Q 295 403 284 410 L 254 412 247 409 Q 240 407 245 404 L 276 401 M 254 433 L 258 430 293 421 Q 321 416 346 421 392 433 357 459 325 484 261 470 L 240 461 Q 228 451 244 440 248 434 254 433 M 254 290 L 276 292 Q 285 291 289 296 297 300 285 310 270 322 248 317 L 233 310 Q 223 302 233 293 L 254 290 M 267 257 L 278 250 296 252 Q 336 257 321 265 L 277 269 Q 265 267 267 257 M 335 322 Q 385 334 343 364 302 395 261 387 239 384 224 377 198 364 227 341 247 326 282 321 L 335 322 M 368 278 Q 369 276 365 276 L 363 273 Q 366 267 380 269 415 273 412 289 410 303 387 302 344 291 346 286 L 368 278 M 125 459 Q 144 461 145 472 148 485 120 510 L 93 525 8 527 -10 520 Q -20 511 -16 499 L -6 484 -6 478 Q 14 467 49 460 94 451 125 459 M 24 403 Q 96 419 54 443 13 467 -43 455 -64 451 -65 440 -71 427 -47 408 -37 400 -9 402 L 24 403 M 49 391 L 1 395 Q -31 388 -17 377 L 7 372 33 375 Q 64 382 49 391 M 86 421 Q 69 409 91 392 107 379 141 376 L 189 378 Q 238 387 214 419 191 449 114 434 L 86 421 M 15 292 Q 32 295 26 309 19 320 -8 315 L -23 307 Q -27 303 -17 295 L 15 292 M 155 300 Q 224 316 180 350 137 383 79 370 L 41 355 Q 17 338 37 322 60 303 96 299 L 155 300 M 136 188 Q 117 172 124 148 133 130 159 124 L 202 120 Q 266 127 252 169 238 209 168 200 150 198 136 188 M 346 571 L 342 587 340 582 Q 340 576 346 571 M 260 522 Q 290 511 302 515 335 521 321 547 309 572 252 561 L 232 554 Q 218 544 235 533 L 260 522 M 409 648 L 396 647 417 635 421 631 429 641 409 648 M -33 308 L -35 305 -30 302 -23 307 -24 309 -33 308";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 731 72 Q 749 3 751 37 L 747 65 749 77 747 91 753 119 760 170 768 225 762 196 758 183 746 153 726 92 731 72 M 357 623 L 356 623 Q 343 623 330 604 L 323 585 322 582 323 577 Q 324 565 331 556 344 544 363 553 354 555 347 569 L 346 571 Q 340 576 340 582 L 342 587 343 589 Q 344 600 352 609 L 358 602 366 614 357 623 M 411 555 L 414 548 414 544 417 538 419 535 424 516 425 507 Q 427 489 437 479 450 466 452 486 435 498 436 522 L 440 539 441 538 441 545 441 546 Q 433 563 423 564 L 413 562 418 561 419 559 411 555 M 633 423 L 626 424 Q 607 423 588 404 573 387 572 379 571 365 581 347 590 331 591 342 L 591 345 591 349 595 365 596 367 602 379 604 382 605 385 Q 615 396 632 401 647 402 647 412 L 646 416 Q 645 421 636 423 L 633 423 M 111 29 Q 114 24 116 25 126 25 129 56 L 129 75 Q 128 88 115 96 L 94 105 84 108 77 116 72 119 47 133 41 143 40 146 29 155 Q 24 155 23 152 L 21 145 29 127 60 87 Q 94 52 96 72 L 96 76 105 62 Q 107 36 111 29 M 61 147 L 63 161 64 169 54 188 38 199 19 221 3 237 -12 252 -20 264 -21 265 Q -44 311 -66 335 L -72 340 -73 342 -65 340 -64 344 Q -65 350 -78 356 L -82 364 Q -88 377 -120 381 L -121 381 -154 382 Q -175 381 -181 373 -186 371 -190 368 L -194 364 -195 361 -108 345 -100 345 -89 335 -67 313 -62 301 -39 255 Q -29 221 -20 211 L 4 195 5 192 8 193 30 174 36 177 41 170 41 167 48 146 51 137 61 147";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 751 37 Q 761 15 787 9 L 786 10 Q 793 9 793 22 L 780 68 777 93 Q 777 141 784 188 L 790 233 791 238 Q 791 255 780 274 768 294 751 298 L 749 301 730 300 722 304 649 335 646 346 667 358 Q 679 363 679 372 L 678 377 Q 675 381 668 381 L 660 381 659 383 651 384 Q 638 384 630 370 L 628 366 624 362 Q 612 348 612 336 L 612 332 606 346 596 367 595 365 591 349 591 345 593 337 593 336 593 334 Q 598 318 612 310 L 614 308 643 295 671 289 681 287 686 286 688 286 690 285 713 279 734 273 735 272 Q 765 256 768 227 L 768 225 760 170 753 119 752 98 749 77 747 65 751 37 M 645 440 L 644 441 643 441 629 451 601 463 534 484 511 496 510 497 472 542 471 550 471 572 Q 468 594 452 594 L 449 593 449 592 448 578 447 574 432 595 429 591 437 578 445 565 444 561 441 546 441 545 441 538 440 539 436 522 Q 435 498 452 486 470 471 504 466 L 518 464 586 445 630 427 631 427 Q 634 423 636 423 645 421 646 416 L 649 414 652 415 621 440 649 436 645 440 M 363 553 L 366 552 406 553 411 555 419 559 418 561 413 562 369 564 Q 355 575 356 600 L 358 601 358 602 352 609 Q 344 600 343 589 L 342 587 346 571 347 569 Q 354 555 363 553 M 607 376 L 602 366 Q 608 367 608 376 L 607 376 M 751 268 L 755 267 762 259 751 268 M -208 343 L -212 344 -221 339 -222 336 Q -222 324 -201 321 L -158 314 Q -127 292 -105 264 L -79 227 -69 215 -66 208 -64 205 -58 199 -49 192 -48 190 -33 150 -16 113 2 73 Q 13 50 23 42 L 23 46 24 44 40 27 46 39 35 66 41 58 59 26 60 28 63 43 Q 61 59 43 86 20 116 16 127 L 15 129 15 135 16 158 Q 15 173 5 182 L -4 189 -33 211 -40 216 Q -55 252 -62 286 -65 299 -80 311 L -92 323 -108 329 -111 330 Q -149 347 -178 347 -188 347 -191 341 L -208 343";
	ctx.fillStyle=tocolor(ctrans.apply([230,235,236,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite434(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite433",canvas,ctx,[0.5885009765625,0.0,0.0,0.5885009765625,-261.0,-157.0],ctrans.merge(new cxform(0,15,0,0,230,230,230,256)),1,(0+time)%4,0,time);
			break;
	}
}

function shape435(ctx,ctrans,frame,ratio,time){
	var pathData="M 125 -39 L 146 -18 144 -18 137 -17 148 -16 156 -9 154 -5 161 1 169 2 193 16 198 15 199 10 194 3 203 4 214 9 216 9 219 11 234 12 321 24 383 34 Q 394 39 395 45 L 393 48 402 50 410 53 429 53 442 69 445 71 448 75 448 77 452 79 458 86 461 83 473 88 476 91 487 93 579 124 632 141 629 142 Q 619 149 619 155 L 630 168 640 177 646 177 652 175 666 177 705 180 723 203 750 229 747 233 Q 749 247 824 265 L 916 283 951 283 952 287 950 296 Q 958 308 948 313 L 923 318 909 318 910 340 Q 907 357 898 357 L 891 357 890 356 890 353 878 356 836 350 835 351 828 355 815 371 Q 789 403 764 417 L 748 424 Q 753 431 735 441 L 698 450 694 450 Q 642 473 604 483 612 492 597 500 L 560 510 533 509 532 516 531 522 Q 545 528 534 534 L 529 534 526 560 533 576 538 591 Q 529 607 503 607 L 460 602 458 602 439 602 432 602 405 576 Q 349 524 323 512 L 323 519 310 521 309 521 289 509 269 518 228 510 161 497 73 401 66 409 51 396 13 392 -14 398 -23 395 -54 392 Q -65 381 -84 365 L -102 350 -97 350 -101 340 Q -106 324 -140 319 L -141 319 Q -149 313 -155 309 L -157 313 -168 298 Q -171 293 -211 281 L -254 260 Q -277 247 -278 236 -279 230 -236 203 L -188 170 -167 151 -139 132 -127 123 -110 114 -68 109 Q -48 114 -20 109 L 8 108 24 108 59 90 Q 88 72 75 56 L 88 16 93 -11 108 -4 109 -3 112 -5 103 -14 107 -19 115 -18 Q 102 -28 121 -38 L 125 -39 M 865 290 L 862 290 870 295 865 290 M 881 281 L 880 281 880 282 881 281 M 848 307 L 851 314 853 327 857 327 863 321 849 306 848 307 M 428 87 L 425 87 427 88 428 87 M 432 89 L 432 88 428 88 429 89 432 89 M 693 150 L 695 158 696 161 694 167 Q 691 176 672 176 648 176 646 151 646 148 649 146 L 683 153 687 151 Q 689 148 692 148 L 693 150 M 563 145 L 550 146 565 148 563 145 M 338 34 L 339 34 337 33 338 34 M 309 73 L 328 70 320 56 302 57 281 57 286 69 291 71 308 73 309 73 M 381 72 L 405 73 404 67 388 71 381 72 M 234 12 L 237 14 240 13 234 12 M 378 590 L 378 589 382 593 379 592 378 590 M 283 540 L 285 542 266 539 261 539 272 538 283 540 M 133 502 L 118 491 132 499 133 502 M 441 612 L 457 611 Q 478 614 479 620 479 638 461 638 L 453 638 458 632 441 612 M -244 314 L -239 317 -231 324 -245 315 -244 314 M -192 299 L -187 299 -184 305 -192 299";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 814 430 L 793 425 Q 801 412 798 399 787 365 749 376 712 387 725 415 L 729 446 723 448 Q 679 467 654 481 L 615 518 593 544 555 540 Q 474 536 419 510 372 488 354 455 L 353 450 349 455 311 451 Q 230 447 175 421 128 399 110 366 L 107 357 105 356 105 357 86 358 Q 69 357 58 350 30 339 41 334 L 44 331 16 318 Q -56 284 -73 270 L -79 263 -92 260 -134 246 Q -180 225 -201 197 -222 171 -205 162 L -192 155 -184 148 -182 145 -176 135 -169 130 -153 114 Q -134 92 -117 84 L -50 53 -37 32 Q -21 23 24 22 L 56 25 70 27 Q 197 11 233 46 262 63 272 87 319 102 341 113 445 104 477 135 506 152 516 176 575 195 594 208 L 610 218 634 230 Q 664 244 675 258 L 712 277 715 280 724 280 816 307 Q 864 322 889 344 L 862 339 Q 825 338 830 356 L 838 363 845 371 Q 847 376 814 430 M 906 367 Q 915 392 897 403 L 906 367 M 672 278 L 672 281 675 280 672 278";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 838 402 L 810 407 Q 785 407 759 394 753 392 754 379 754 365 758 364 780 351 819 369 861 389 838 402 M 497 180 Q 518 172 559 187 608 203 587 214 L 573 217 Q 581 225 579 233 L 584 235 587 236 Q 585 230 595 226 613 215 630 229 645 242 631 250 L 609 254 603 261 577 268 556 270 555 273 Q 564 275 575 280 617 300 594 313 L 593 314 Q 643 314 693 338 755 366 753 389 750 399 724 413 708 423 684 424 646 428 609 410 569 392 546 365 L 537 352 514 348 Q 499 340 505 331 L 512 323 547 322 561 318 Q 539 317 515 305 L 511 296 509 296 509 300 Q 506 310 480 324 L 478 326 489 340 Q 494 350 485 357 510 362 571 389 580 400 576 404 L 564 411 Q 531 430 473 403 L 465 398 460 399 Q 466 407 456 415 485 415 498 423 555 446 564 479 570 505 551 514 535 523 483 515 434 508 400 492 350 468 352 446 354 436 369 428 L 383 424 362 415 Q 329 399 327 386 325 374 335 368 L 376 366 Q 377 362 380 361 L 339 345 311 327 Q 279 337 230 314 207 303 203 291 L 193 292 188 293 Q 232 311 212 326 241 326 254 334 311 357 320 390 326 416 307 425 291 434 239 426 L 169 409 134 396 Q 123 401 105 376 86 352 103 343 116 335 135 334 L 118 326 Q 91 313 86 303 L 58 297 Q 60 305 45 313 L 43 315 Q 78 326 55 338 L 26 343 -17 334 -30 326 Q -70 325 -110 307 -121 312 -139 287 -158 263 -141 254 -99 230 -5 261 L -1 263 -6 246 Q -4 235 6 230 L -7 226 Q -25 218 -13 203 L -1 188 Q 13 181 16 188 L 22 197 31 199 50 203 56 212 58 211 Q 62 202 86 188 106 177 149 188 123 172 117 151 112 130 123 125 L 144 117 Q 134 104 152 83 181 67 236 88 242 89 248 93 L 295 92 296 89 Q 337 67 396 96 457 126 420 145 L 394 152 387 161 365 165 359 172 333 179 324 181 Q 361 205 346 225 L 360 225 Q 361 217 367 214 376 208 388 206 L 386 203 Q 380 192 388 184 L 396 172 Q 420 159 464 172 L 497 180 M 499 213 L 496 213 492 216 504 220 510 220 512 219 504 215 501 214 499 213 M 753 346 Q 713 345 681 329 640 309 630 292 621 277 638 268 681 243 767 279 852 313 809 338 L 753 346 M 724 301 L 748 309 754 309 756 308 Q 736 298 729 298 L 719 297 724 301 M 701 451 Q 745 471 724 483 L 698 488 Q 667 489 641 476 620 467 619 457 L 625 449 701 451 M 756 412 L 798 413 Q 825 420 802 433 L 786 440 757 437 Q 743 429 749 420 L 756 412 M 270 143 L 278 147 278 145 Q 295 135 317 139 L 301 129 260 126 Q 271 135 270 143 M 229 231 L 245 251 Q 250 261 241 268 262 272 309 292 L 314 288 302 276 Q 285 256 288 245 L 229 231 M 177 56 L 138 64 Q 103 65 75 51 42 35 45 17 45 6 53 0 93 -22 152 7 213 37 177 56 M 67 85 Q 134 121 85 149 L 48 156 Q 13 156 -26 137 -67 117 -64 97 -64 85 -52 78 L -36 71 -49 64 Q -77 51 -68 35 L -51 19 Q -36 10 6 31 39 50 18 67 L 67 85 M 51 222 L 56 223 56 215 53 219 51 222 M 188 159 L 190 156 185 154 181 154 188 159 M 142 276 L 141 279 145 280 142 276 M 66 271 L 73 271 68 269 65 270 66 271 M 181 438 L 256 443 Q 320 455 289 472 L 217 470 Q 181 453 174 446 172 442 181 438 M 424 527 L 500 532 Q 564 544 533 561 L 461 559 418 535 Q 416 531 424 527 M -108 175 L -104 167 Q -85 158 -46 172 -7 186 -29 198 L -51 203 -85 200 -102 187 Q -103 197 -118 205 -133 215 -149 214 -176 214 -219 194 -251 178 -249 157 -248 145 -237 140 -201 119 -140 151 -146 144 -144 137 L -134 126 Q -108 113 -85 130 -60 146 -82 159 L -103 162 -124 161 -108 175 M -171 182 L -176 180 -179 181 -178 182 -171 182 M -217 221 Q -162 235 -189 249 L -218 254 -261 245 Q -295 229 -281 213 L -217 221";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 105 -20 L 95 -18 77 -16 77 -14 69 -16 Q 45 -28 65 -41 L 85 -44 85 -40 Q 86 -33 105 -20 M 769 265 Q 774 273 766 277 L 765 278 786 279 Q 823 282 846 292 L 845 294 878 323 Q 908 350 897 355 L 860 362 Q 822 362 780 342 735 320 731 301 731 287 742 281 L 740 281 694 273 Q 671 262 678 251 677 245 685 240 L 687 240 Q 669 229 686 215 L 706 214 737 244 Q 750 255 764 258 L 766 260 769 265 M 573 148 L 568 157 541 162 530 162 513 162 512 162 Q 493 174 445 152 426 142 439 130 L 437 124 Q 434 119 442 115 L 466 107 468 108 Q 505 139 541 162 L 501 124 523 134 573 148 M 308 41 L 316 46 350 49 Q 377 56 356 67 L 339 71 321 73 321 75 313 73 311 72 286 73 265 72 Q 281 74 303 86 L 308 89 Q 322 87 345 98 380 113 390 124 L 403 130 Q 433 144 419 151 L 401 160 Q 388 161 366 150 350 142 349 135 L 308 121 307 119 282 118 273 117 Q 280 128 272 134 L 330 142 Q 363 150 370 175 L 375 196 385 201 413 217 454 231 Q 509 253 486 266 L 480 268 479 273 470 275 458 272 457 271 455 271 399 261 385 253 372 252 366 252 Q 413 274 423 291 L 427 295 481 315 515 335 Q 531 340 548 350 602 385 573 401 L 533 407 508 404 506 405 486 409 464 408 Q 445 398 443 387 444 380 448 378 L 449 378 Q 438 370 434 362 L 415 356 Q 423 369 401 381 L 400 394 436 395 Q 459 405 441 417 L 422 421 395 417 381 407 337 410 281 397 275 405 272 407 Q 285 419 275 424 L 262 427 Q 303 449 289 462 313 478 299 490 311 486 330 495 L 330 485 359 489 Q 379 497 367 503 L 342 505 Q 346 510 337 514 L 332 517 323 512 323 517 304 511 Q 289 504 290 497 L 293 495 Q 275 504 254 507 L 198 499 201 495 187 492 181 492 173 488 Q 132 469 136 448 L 148 433 162 428 156 410 153 408 Q 138 401 150 395 L 181 398 186 400 219 409 223 406 226 408 Q 223 402 231 398 L 235 397 223 389 Q 219 386 227 381 L 247 380 229 359 201 361 174 358 Q 183 370 167 378 L 139 384 134 387 124 390 100 383 81 369 58 350 55 344 37 350 Q 58 366 40 377 L 43 378 Q 60 383 51 388 L 40 391 26 386 23 385 Q -5 392 -36 377 -69 361 -82 339 -93 318 -83 313 L -43 314 -48 307 Q -61 280 -53 275 L -44 272 Q -77 271 -106 256 -145 238 -150 220 -155 209 -142 202 -102 179 -31 213 L -15 222 -6 216 Q 27 198 80 223 L 100 234 Q 117 237 135 245 L 138 246 135 243 143 235 Q 162 225 193 235 208 240 211 245 L 234 241 242 235 Q 260 224 275 224 L 291 225 Q 278 216 278 208 L 279 204 254 194 231 181 211 182 176 179 174 181 158 183 172 193 176 193 209 199 224 214 220 221 198 224 182 220 178 222 111 225 Q 64 218 29 202 -14 181 -14 161 -14 151 -1 146 16 135 31 135 61 133 115 159 L 123 163 130 154 Q 120 140 143 127 156 119 207 141 L 211 134 230 132 223 130 187 119 Q 159 107 159 94 160 88 168 83 L 235 86 241 75 261 72 223 61 Q 194 47 193 35 L 192 31 194 31 279 37 308 41 M 168 13 L 165 11 168 12 168 13 M 922 340 Q 921 334 929 329 962 311 993 334 1025 358 1010 366 L 984 370 938 362 Q 915 351 922 340 M 899 380 L 918 381 Q 926 387 917 393 908 398 891 393 886 386 899 380 M 843 429 L 805 421 Q 792 415 795 405 795 402 802 398 826 384 850 398 873 413 861 420 L 843 429 M 634 234 L 653 254 Q 661 254 669 259 680 266 672 271 658 279 642 271 L 641 271 616 273 Q 578 273 536 253 L 495 225 467 219 466 219 449 219 418 213 Q 400 204 411 196 403 190 403 184 L 398 182 Q 386 177 393 172 L 397 168 Q 409 162 422 168 454 155 492 183 L 502 191 538 190 Q 536 184 543 181 558 172 589 187 652 215 632 226 L 628 229 634 234 M 413 102 Q 400 96 412 89 L 433 91 Q 443 98 439 102 L 422 103 413 102 M 576 164 L 601 167 Q 618 175 609 181 L 582 178 574 169 576 164 M 507 302 L 484 300 Q 461 288 478 285 L 486 282 502 287 507 283 536 282 Q 574 264 629 290 L 646 299 651 294 Q 648 288 659 282 L 683 280 708 293 Q 722 301 711 307 L 693 308 671 305 658 306 Q 681 324 661 335 L 616 341 601 340 599 340 561 332 551 324 527 307 507 302 M 592 354 Q 605 348 620 354 635 360 623 366 610 375 592 366 585 362 587 358 L 592 354 M 487 418 Q 521 399 597 434 673 469 631 492 L 581 499 Q 547 497 507 478 468 459 471 439 471 425 487 418 M 511 492 Q 530 507 519 513 L 490 512 Q 473 504 470 497 L 469 503 463 502 462 498 467 495 470 497 Q 468 491 475 487 491 480 511 492 M 723 362 L 714 364 702 361 695 354 699 352 720 354 Q 730 359 723 362 M 692 467 L 734 471 Q 755 483 751 489 L 750 494 730 498 708 497 Q 689 487 687 476 688 469 692 467 M 782 392 L 750 390 Q 740 386 743 377 L 751 372 783 373 Q 798 383 782 392 M 717 459 Q 680 455 647 440 596 417 605 397 611 389 626 384 652 371 725 404 795 437 762 455 L 717 459 M 332 75 L 358 78 368 88 386 94 Q 408 105 397 109 L 384 113 376 111 Q 354 101 355 94 L 338 89 330 80 332 75 M 242 193 L 259 198 Q 274 205 264 212 L 240 211 Q 217 199 234 196 L 242 193 M 111 5 L 112 -1 Q 122 -5 142 5 164 16 153 20 L 140 24 133 22 Q 110 12 111 5 M 104 42 L 112 32 Q 128 25 159 41 189 55 175 62 L 157 71 Q 144 72 122 61 102 51 104 42 M 127 112 L 85 121 Q 48 123 10 105 -30 86 -36 64 -41 49 -32 45 L 22 44 86 53 Q 119 61 126 86 136 108 127 112 M 38 29 Q -4 26 -8 17 L -9 0 -3 -14 Q 17 -25 59 -3 101 19 84 26 L 38 29 M 153 178 L 151 176 145 175 156 181 153 178 M 168 286 L 212 302 Q 241 315 251 326 L 288 324 Q 317 312 368 330 L 360 315 355 314 333 310 329 312 289 318 229 303 216 296 209 295 201 286 Q 189 276 187 267 L 188 263 166 261 Q 181 273 168 286 M 95 297 L 90 294 55 276 7 261 5 260 -4 266 -18 271 Q 7 273 44 287 91 305 81 324 L 103 323 94 309 Q 90 302 95 297 M 87 407 Q 106 418 95 424 L 73 402 87 407 M 55 401 L 72 401 Q 68 402 66 409 L 55 401 M 226 408 L 226 412 230 413 226 408 M 302 439 Q 292 426 305 420 339 400 388 426 L 401 433 403 434 Q 451 456 428 470 L 390 479 Q 353 480 318 462 293 450 303 440 L 302 439 M 392 522 Q 423 505 498 534 571 564 537 583 L 498 596 Q 460 598 417 577 376 558 380 537 L 392 522 M 672 559 L 634 568 Q 597 569 562 551 537 539 547 529 L 562 521 647 523 Q 695 545 672 559 M 574 574 L 603 578 Q 623 586 611 592 605 596 573 592 L 574 574 M 421 502 L 397 497 Q 382 490 394 484 L 425 487 Q 449 495 438 500 L 421 502 M -70 92 L -87 93 -91 89 -93 87 -121 85 Q -131 81 -110 61 -95 52 -71 67 -48 79 -70 92 M -96 105 L -68 104 -35 110 Q -21 117 -20 125 L -24 132 -46 135 -83 122 Q -107 111 -96 105 M -113 109 Q -89 114 -113 128 L -125 132 -147 127 Q -162 120 -155 115 -135 104 -113 109 M -139 177 Q -177 200 -237 172 -270 156 -264 140 -261 132 -250 127 -217 109 -164 134 -107 161 -139 177 M -39 167 L -83 170 -109 154 -100 146 Q -82 136 -50 146 -19 157 -39 167 M -15 203 L -35 206 Q -46 201 -44 187 20 184 -15 203 M -297 186 Q -270 172 -200 198 -131 224 -184 252 L -207 261 -257 255 Q -277 245 -292 218 -304 191 -297 186 M -358 222 L -343 221 Q -339 224 -346 235 L -352 235 -355 235 Q -370 227 -358 222 M -110 298 L -120 301 -144 294 Q -173 281 -157 272 -149 266 -123 278 -95 288 -110 298 M -195 297 L -214 285 -201 289 Q -184 294 -193 299 L -195 297 M -114 311 L -99 310 Q -96 313 -102 324 L -108 324 -111 324 Q -126 316 -114 311";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 105 -20 Q 86 -33 85 -40 L 85 -44 Q 88 -57 120 -44 L 139 -33 Q 178 -9 184 -9 L 189 -10 189 -12 195 -14 200 -20 208 -40 Q 196 -43 183 -50 168 -59 167 -68 L 171 -88 161 -106 178 -98 184 -86 181 -74 186 -65 201 -56 218 -55 225 -47 Q 226 -36 213 -17 L 195 -12 201 0 214 9 222 8 222 2 282 2 300 9 304 14 367 22 378 24 379 22 379 18 371 6 Q 370 -2 376 -8 375 -12 377 -13 L 386 -15 387 -15 384 -29 392 -44 Q 391 -52 346 -79 L 387 -65 Q 401 -58 403 -42 L 399 -32 396 -21 398 -23 404 -20 404 -19 Q 432 -24 442 4 L 487 13 510 21 510 22 500 27 489 21 Q 479 15 465 15 433 15 425 1 415 -14 405 -14 L 400 -10 400 -9 402 -5 402 -4 Q 388 -12 390 10 409 23 425 47 L 442 69 464 72 508 86 516 89 531 94 596 119 Q 646 138 679 142 L 664 110 Q 664 108 673 104 L 678 110 685 92 685 91 688 84 667 69 652 56 684 70 692 75 697 64 Q 706 48 727 57 L 767 73 Q 787 82 798 97 L 791 99 763 81 Q 739 62 714 62 708 62 705 70 L 703 80 701 85 701 86 685 127 692 144 700 163 724 183 778 239 Q 802 239 860 256 961 285 962 300 963 309 950 309 L 899 300 844 285 778 270 769 265 766 260 765 258 764 258 Q 750 255 737 244 L 706 214 706 213 672 173 656 173 573 148 523 134 501 124 541 162 Q 505 139 468 108 L 466 107 433 82 433 77 421 66 397 47 386 49 308 41 279 37 194 31 192 31 Q 168 28 167 16 L 168 13 168 12 165 11 105 -20 M 198 499 L 187 503 171 507 164 518 159 529 Q 148 549 139 549 L 117 544 Q 104 544 103 551 101 557 86 557 L 75 554 69 547 70 542 89 541 90 531 98 529 128 533 138 536 151 522 157 512 158 507 122 454 148 482 162 500 Q 168 493 181 492 L 187 492 201 495 198 499 M 406 28 L 408 31 408 29 406 28 M 385 678 L 371 680 363 675 381 658 396 658 Q 426 663 439 651 448 643 447 630 446 621 416 589 L 381 555 425 592 Q 457 622 458 636 459 647 446 659 430 675 401 675 L 385 678 M -249 273 Q -299 276 -310 263 L -307 259 -235 264 Q -191 272 -186 289 L -188 289 Q -201 271 -249 273 M -133 393 L -124 389 -118 384 -78 388 -73 385 -40 389 -14 395 -39 399 -62 395 -94 399 -114 402 -142 405 -146 419 -145 422 Q -128 429 -117 439 -107 440 -97 451 L -89 463 Q -89 468 -92 467 L -97 466 -105 451 -147 435 Q -157 431 -158 418 L -155 404 -158 388 -151 387 Q -149 393 -133 393";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape1971(ctx,ctrans,frame,ratio,time){
	var pathData="M 725 82 L 744 100 747 95 Q 770 89 807 110 L 790 118 Q 761 118 750 110 759 127 759 150 759 183 741 201 726 219 714 242 757 245 757 284 L 756 293 735 296 710 293 696 290 692 299 Q 693 309 687 315 L 682 316 673 328 Q 652 353 614 375 627 383 627 401 L 618 423 613 427 623 425 Q 672 414 672 446 672 454 640 471 608 488 590 488 564 488 548 472 L 537 458 527 462 510 468 Q 528 470 528 482 528 495 512 517 494 541 477 541 L 436 534 Q 431 550 412 564 377 592 312 592 288 592 283 570 L 283 556 282 554 282 550 283 549 283 547 284 534 272 528 266 526 267 524 194 522 Q 137 503 61 465 L 53 465 -25 468 -29 468 -45 461 Q -54 451 -48 438 L -37 425 -36 425 -36 418 -40 409 -62 396 -67 394 Q -86 391 -86 380 L -86 379 Q -136 342 -142 316 L -145 309 -142 295 Q -138 259 -115 245 L -109 241 -127 238 -154 226 Q -175 212 -151 194 -127 175 -88 174 L -41 178 -40 178 -43 177 Q -58 176 -55 167 L -53 166 -47 166 Q -39 167 -35 170 L -24 156 Q -1 124 44 93 33 78 39 64 43 53 54 44 L 47 36 Q 37 25 36 14 60 49 93 49 128 49 144 24 L 156 31 179 20 224 20 256 31 271 26 303 17 320 20 338 23 390 17 436 10 Q 431 26 436 40 L 437 42 462 33 547 33 562 35 582 14 Q 581 24 587 34 L 590 39 652 52 673 42 697 57 693 64 Q 712 72 725 82 M 753 67 L 733 74 Q 710 69 705 62 L 723 65 754 57 753 67 M 741 216 Q 741 199 779 196 817 193 817 211 817 222 805 230 795 237 783 237 L 748 228 Q 741 222 741 216 M 524 289 L 526 290 528 289 524 289 M 538 55 L 507 54 449 58 Q 463 68 490 68 517 68 538 55 M 579 437 L 578 437 571 437 568 440 579 437 M 737 350 Q 725 371 695 371 L 667 369 663 348 Q 663 342 694 331 725 320 741 320 L 745 326 737 350 M 262 87 L 274 88 282 88 293 89 303 90 296 85 262 87 M 17 60 L -6 74 Q -20 74 -32 64 L -43 50 Q -43 25 -7 17 29 10 29 38 29 47 17 60 M 3 87 Q 16 89 8 97 0 104 -9 103 -21 105 -17 94 L -9 88 3 87 M 35 117 L 57 117 69 115 71 115 64 110 53 102 31 118 35 117 M 5 147 L -3 167 -4 169 18 166 5 147 M 0 203 Q -16 199 -3 188 L 6 183 -5 173 -13 190 Q -10 194 -12 199 -2 203 -1 206 L 0 205 5 204 3 203 0 203 M 78 451 L 95 458 91 454 85 446 81 449 78 451 M 252 446 L 243 453 257 453 270 458 298 456 320 455 Q 331 449 339 446 L 338 446 321 439 319 440 Q 295 455 257 446 L 256 446 252 446 M 149 482 L 148 478 140 477 Q 135 472 120 470 L 149 482 M 350 541 L 302 546 298 543 Q 302 556 334 556 L 360 549 350 541 M 500 556 L 502 563 Q 502 577 443 594 433 594 423 586 L 414 577 Q 414 563 439 561 L 498 554 500 556 M -66 20 L -70 30 -75 40 -82 39 -88 36 -78 34 -89 36 -117 38 Q -127 26 -123 15 L -69 15 Q -66 12 -66 20 M -122 65 Q -42 42 -42 93 -42 110 -54 127 -73 152 -114 152 -158 152 -183 135 -201 122 -201 112 -201 88 -122 65 M -117 112 L -100 101 -121 108 -117 112 M -180 110 L -176 108 -166 102 -166 101 -180 110 M -192 173 Q -192 186 -203 208 -216 235 -234 235 -265 235 -279 216 L -286 197 Q -286 163 -195 159 L -192 173 M -29 221 L -34 223 -53 241 -39 237 -13 216 -29 221 M -211 178 L -230 178 -237 180 -216 182 -211 178 M -201 287 L -189 288 Q -156 296 -171 314 -177 294 -201 287 M -81 364 L -71 353 -88 350 -104 342 -81 364 M -207 266 Q -215 261 -207 253 L -193 248 -175 248 Q -156 253 -167 262 -179 273 -200 269 L -207 266 M -116 325 L -114 329 -115 325 -116 325";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 686 99 L 646 137 Q 642 139 641 140 L 639 142 638 148 Q 612 137 582 136 L 571 136 538 129 427 115 401 115 Q 396 108 366 108 L 318 113 314 114 262 115 Q 316 118 403 136 L 408 136 456 140 Q 483 146 483 152 L 505 158 Q 544 168 597 193 L 623 207 633 209 Q 661 215 673 230 L 681 239 Q 695 267 642 288 L 640 289 Q 635 299 602 309 L 601 307 603 304 578 314 569 314 567 318 547 335 Q 550 346 533 359 L 518 370 518 372 513 378 Q 506 390 466 408 477 427 464 442 461 470 318 466 L 304 468 276 473 204 468 173 453 76 433 11 413 -21 399 -32 397 -44 390 -55 388 -65 383 -88 377 Q -111 372 -116 351 -121 327 -95 308 -87 301 -66 295 L -56 292 -56 286 Q -53 274 -12 244 L 0 234 5 232 3 231 0 230 Q -16 228 -3 216 5 211 21 208 L 36 206 41 208 44 209 41 205 40 201 Q 30 181 41 166 L 36 169 35 160 51 147 69 143 71 142 64 138 Q 30 115 39 92 49 65 113 41 145 25 194 16 L 349 6 352 5 400 -1 435 6 461 7 571 21 605 29 616 29 Q 655 30 683 47 718 70 686 99 M 526 319 L 528 317 524 317 526 319 M -49 90 Q -49 106 -57 115 L -58 117 Q -65 127 -76 127 L -81 127 -91 127 Q -109 127 -116 115 L -120 107 -120 103 -120 99 Q -120 77 -85 73 -49 68 -49 90 M -113 47 L -126 53 Q -142 54 -144 41 -144 24 -126 26 -108 29 -108 40 L -113 47 M -166 104 L -168 110 -174 112 -184 101 Q -184 95 -174 94 L -166 104 M -192 185 L -210 199 -228 191 -232 183 Q -232 170 -211 167 -189 165 -189 175 -189 183 -192 185 M -135 152 L -135 159 -138 161 -144 162 -159 157 -162 152 Q -162 142 -149 142 -135 141 -135 152";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 678 21 L 671 21 662 33 663 36 670 34 678 21 M 214 -17 L 229 -22 Q 235 -11 249 -5 276 9 308 10 L 305 10 Q 341 17 320 43 295 72 260 68 L 235 59 Q 218 48 226 30 L 233 20 216 20 181 10 Q 163 0 163 -16 L 214 -17 M 630 -6 L 688 -11 Q 752 -4 724 39 697 82 631 75 606 72 594 59 583 45 594 22 602 5 630 -6 M 538 -3 L 599 -9 593 15 Q 579 42 535 52 L 481 55 Q 450 52 439 26 428 5 434 -14 466 -1 538 -3 M 401 -10 L 416 -8 430 3 Q 413 35 397 44 411 47 421 56 L 437 88 440 97 463 90 469 85 494 83 504 83 536 84 558 90 580 87 609 87 623 91 645 88 Q 668 92 671 103 673 116 644 113 L 626 108 625 110 Q 613 128 575 123 L 572 122 566 135 559 141 580 143 582 143 582 142 Q 585 136 615 128 L 652 124 Q 683 127 662 149 643 170 614 167 L 610 173 Q 589 198 544 193 506 183 498 173 L 471 171 Q 455 168 435 152 416 138 418 122 394 137 363 133 L 314 124 317 131 308 137 300 141 308 149 293 152 265 145 Q 239 136 243 127 246 120 262 118 L 282 115 302 120 308 121 Q 280 108 291 84 304 55 339 46 L 350 43 344 40 Q 326 30 332 15 L 336 8 344 7 401 -10 M 738 222 L 751 228 742 237 Q 726 234 726 226 726 220 738 222 M 453 372 Q 517 387 463 419 409 453 344 440 319 433 313 420 310 407 334 389 351 375 387 369 L 453 372 M 424 321 Q 459 329 437 346 413 363 379 356 L 361 345 Q 349 335 353 333 368 321 394 320 L 424 321 M 520 231 Q 526 216 555 210 L 597 207 Q 650 214 635 246 623 279 564 273 L 536 263 Q 511 251 520 231 M 483 132 L 485 137 486 137 490 134 483 132 M 411 162 Q 484 171 472 210 468 225 454 234 493 241 486 261 477 284 455 282 L 422 275 Q 393 266 401 249 L 406 243 382 241 Q 364 239 349 230 324 216 334 194 344 173 372 165 L 411 162 M 489 480 L 489 475 Q 489 467 504 465 520 461 520 475 L 513 481 501 484 Q 492 484 489 480 M 408 408 L 425 398 417 398 401 407 399 409 408 408 M 567 413 Q 567 385 609 388 652 392 652 410 L 640 422 609 431 Q 581 431 571 423 L 567 413 M 721 305 L 700 307 688 304 687 301 Q 687 289 705 288 724 287 724 297 L 721 305 M 315 301 Q 323 294 340 295 L 361 299 Q 396 309 375 314 L 335 320 320 314 Q 305 309 315 301 M 153 470 L 153 475 155 475 160 472 153 470 M 194 403 Q 163 397 166 372 166 351 188 334 210 316 249 316 L 303 322 Q 339 330 349 338 373 354 336 382 307 404 254 407 L 194 403 M 60 488 L 82 493 63 493 -25 496 17 485 60 488 M 41 259 Q 65 266 82 284 103 311 68 332 59 340 30 342 67 353 28 372 -14 395 -49 388 L -71 375 Q -83 364 -63 350 L -52 342 -69 339 Q -90 335 -102 327 -123 312 -91 288 -73 273 -31 263 L 41 259 M 161 340 L 170 351 Q 132 377 111 383 125 388 131 397 134 407 129 427 L 126 435 156 431 165 428 193 429 205 430 236 435 257 443 283 443 315 447 326 452 351 453 Q 375 458 371 469 366 481 338 473 324 472 321 467 L 319 468 Q 295 483 257 474 L 254 472 241 483 231 488 250 492 255 493 254 492 Q 262 486 298 483 L 339 484 Q 371 491 335 508 305 523 273 516 L 266 522 Q 231 540 185 530 L 175 528 157 518 148 507 140 506 Q 132 498 105 495 L 91 482 Q 78 467 90 453 L 25 456 -22 442 Q -20 446 -23 448 L -35 453 -37 453 -36 452 Q -32 440 -48 432 L -33 437 -29 439 Q -50 425 -25 404 5 382 47 377 L 62 377 57 373 Q 42 362 59 350 93 325 143 336 L 161 340 M 157 297 Q 150 290 162 280 177 268 208 267 L 239 268 Q 269 276 244 294 217 313 170 302 L 157 297 M 155 194 Q 152 195 155 196 L 158 196 160 194 155 194 M 65 150 Q 105 153 76 175 46 196 31 195 2 186 10 167 15 157 35 152 L 65 150 M 121 57 L 183 55 Q 243 62 202 103 162 144 100 137 73 133 61 112 47 91 60 93 72 65 121 57 M 258 152 Q 291 156 275 173 258 193 234 189 L 219 185 225 198 241 192 261 191 Q 294 194 294 211 294 229 258 225 L 236 219 222 206 221 208 Q 211 244 156 238 141 236 124 226 98 214 105 195 117 172 139 166 151 162 177 166 199 167 210 175 L 210 163 Q 214 155 233 152 L 258 152 M -52 118 Q -62 129 -76 129 L -120 120 -124 112 Q -124 89 -85 83 -45 77 -45 103 -45 110 -52 118 M -141 42 Q -141 29 -126 32 -111 36 -111 46 -111 54 -120 54 L -135 49 -141 42 M -157 104 L -159 110 -169 112 -180 105 Q -180 96 -159 99 L -157 104 M -180 198 Q -186 206 -195 206 -214 206 -216 191 -216 171 -196 170 -175 170 -175 187 L -180 198 M -137 157 L -148 159 Q -162 159 -162 150 -162 140 -152 141 -143 141 -129 152 L -137 157 M -166 361 L -167 360 -165 360 -166 361 M -91 233 Q -68 215 -22 225 25 236 -29 249 L -100 260 Q -115 257 -113 253 L -91 233";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 405 299 L 430 304 Q 451 309 440 321 428 335 391 326 L 379 321 Q 367 314 377 308 387 299 405 299 M 420 371 Q 444 351 482 349 L 525 351 Q 542 355 534 377 L 526 401 529 403 Q 516 412 482 418 L 436 420 Q 418 416 409 407 394 390 420 371 M 579 367 L 562 361 Q 546 352 561 342 571 334 598 332 L 630 335 Q 650 339 641 358 632 379 579 367 M 513 321 L 525 330 505 332 Q 488 329 486 322 L 513 321 M 515 257 Q 545 246 556 248 580 250 573 273 564 299 534 295 L 511 287 491 273 Q 484 267 515 257 M 596 280 L 598 278 600 279 619 277 638 276 Q 668 279 656 290 642 301 621 299 590 294 596 280 M 426 104 Q 437 120 423 148 409 178 383 183 371 187 344 183 327 181 313 173 291 160 302 137 311 117 342 103 374 88 402 92 419 93 426 104 M 601 241 L 607 237 621 236 Q 635 238 630 250 626 262 613 261 L 605 257 Q 595 252 601 241 M 556 233 Q 541 226 546 215 551 204 566 201 L 588 203 Q 610 205 601 222 593 239 573 236 L 556 233 M 537 183 Q 522 175 530 160 L 547 145 Q 567 130 580 131 608 135 611 166 614 196 558 190 L 537 183 M 445 182 L 488 179 Q 501 181 521 197 545 216 527 228 516 238 484 249 L 439 259 Q 426 258 412 246 393 230 402 209 411 188 445 182 M 484 164 Q 428 158 442 130 447 117 475 111 L 508 109 Q 541 112 523 140 504 167 484 164 M 482 78 Q 501 81 497 90 L 490 98 479 97 Q 460 98 465 85 469 77 482 78 M 476 15 Q 480 6 500 8 518 10 513 19 L 489 24 481 22 Q 473 20 476 15 M 525 27 L 569 22 Q 612 27 596 60 583 93 521 86 507 84 499 79 484 70 491 54 L 497 45 498 43 Q 508 33 525 27 M 575 101 Q 577 94 595 96 614 99 608 107 602 115 588 113 570 110 575 101 M 643 239 L 649 236 664 234 Q 672 235 673 242 672 250 658 248 640 246 643 239 M 667 172 L 704 167 Q 735 171 720 200 706 230 650 225 L 635 219 Q 623 210 630 194 638 179 667 172 M 694 157 Q 688 154 691 148 695 141 710 143 726 145 723 153 719 162 704 161 L 694 157 M 655 107 L 675 105 Q 704 108 689 141 680 159 655 157 644 155 638 149 L 629 133 Q 642 113 655 107 M 646 82 L 638 79 Q 629 77 631 72 635 62 654 65 669 67 666 74 665 83 646 82 M 654 57 L 631 59 Q 602 57 607 45 610 38 625 34 L 644 31 Q 661 32 656 42 L 654 57 M 748 60 Q 755 61 759 68 L 753 95 Q 748 104 733 102 700 94 705 82 718 57 748 60 M 378 -1 L 419 -5 Q 461 0 457 36 452 73 383 65 L 353 56 Q 335 45 344 23 352 8 378 -1 M 778 -37 L 778 -36 776 -37 Q 772 -38 767 -41 L 778 -37 M 672 -27 L 696 -34 731 -43 739 -42 Q 756 -41 763 -15 L 769 11 771 12 Q 766 25 739 36 L 700 43 Q 682 41 670 32 647 16 658 -8 L 672 -27 M 572 -6 L 595 -8 595 -3 Q 593 4 580 2 L 575 1 Q 570 -1 572 -4 L 572 -6 M 172 -14 L 210 -16 Q 247 -11 236 16 227 46 172 39 156 38 149 26 140 15 148 1 152 -11 172 -14 M 103 -20 Q 100 -7 80 -9 L 71 -11 Q 61 -16 64 -26 L 74 -32 88 -34 Q 108 -32 103 -20 M 499 480 Q 499 470 515 468 531 466 531 476 L 528 485 519 495 504 488 Q 499 486 499 480 M 439 475 Q 407 465 419 455 447 434 477 440 L 485 449 462 472 439 475 M 582 409 Q 582 397 618 388 654 379 654 400 646 436 621 436 596 436 586 423 L 582 409 M 721 301 L 712 301 695 299 694 294 Q 694 286 709 288 724 289 724 296 L 721 301 M 203 540 L 208 541 198 541 203 540 M 329 528 L 371 529 Q 402 535 369 559 344 578 302 574 292 564 272 556 L 266 554 276 542 Q 293 530 329 528 M 392 508 Q 408 512 397 519 L 374 523 365 519 Q 361 515 367 510 L 392 508 M 308 490 Q 335 473 352 471 363 468 374 471 403 477 368 503 349 519 325 514 L 311 504 308 490 M 348 445 Q 341 440 346 436 L 375 434 Q 390 436 383 443 L 357 447 348 445 M 361 403 L 382 403 Q 399 407 390 414 L 379 425 Q 373 430 354 425 323 419 335 409 L 361 403 M 215 489 Q 245 478 257 481 287 488 272 515 258 542 203 530 189 528 184 522 171 513 189 500 L 215 489 M 268 456 L 294 453 Q 312 457 301 464 L 277 467 Q 259 463 268 456 M 217 397 L 221 394 Q 236 388 256 385 283 380 307 385 350 396 315 423 281 449 220 435 L 202 426 Q 190 417 207 404 211 399 217 397 M 263 262 Q 270 266 258 276 242 288 222 283 L 209 277 Q 200 269 210 260 L 231 257 252 258 263 262 M 211 368 L 242 365 Q 259 368 249 375 L 220 377 213 374 Q 206 372 211 368 M 324 369 Q 320 367 324 362 L 334 360 346 361 Q 356 362 349 367 L 330 370 324 369 M 351 346 Q 342 341 347 337 360 329 378 332 402 337 395 346 389 356 364 351 L 351 346 M 3 370 Q 68 386 26 410 -16 435 -67 423 -86 419 -86 408 -89 395 -64 376 -55 369 -28 369 L 3 370 M 161 427 L 183 424 Q 202 428 192 435 L 180 441 170 440 Q 148 437 161 427 M 156 451 L 194 452 Q 227 460 192 482 156 503 137 498 80 486 110 463 123 453 156 451 M 81 477 L 53 493 -29 496 -45 489 Q -54 480 -48 467 L -36 452 -36 446 Q -15 435 19 427 L 91 425 Q 108 428 109 439 110 453 81 477 M 8 263 Q 23 266 16 279 8 290 -16 285 L -29 278 -22 266 8 263 M 15 343 Q 42 349 27 358 L -18 362 Q -48 357 -33 345 L -9 340 15 343 M 137 268 Q 200 283 155 316 111 349 58 337 38 332 25 323 4 307 25 291 48 273 82 268 111 263 137 268 M 116 342 L 161 343 Q 205 353 180 384 155 415 84 400 L 58 388 Q 44 376 67 358 83 346 116 342 M 194 342 Q 170 330 200 307 220 292 254 287 282 282 304 287 351 298 309 328 266 360 228 351 L 194 342 M 3 115 Q 16 117 8 125 0 133 -9 131 -21 133 -17 122 L -9 116 3 115 M 3 160 Q 8 148 35 146 L 67 146 Q 143 156 118 188 L 90 211 119 215 Q 135 182 193 188 239 195 224 225 211 256 162 249 L 134 241 129 241 124 244 Q 96 265 42 253 L 20 248 Q 2 241 14 230 28 220 45 216 L 31 207 8 213 -9 198 18 194 Q -2 171 3 160 M 60 99 L 73 99 Q 94 102 86 115 77 128 61 127 41 125 49 108 51 100 60 99 M 80 83 Q 61 81 47 64 30 45 39 26 49 5 99 10 143 15 125 51 108 87 80 83 M 158 103 L 198 98 Q 256 104 239 142 222 180 160 173 143 171 131 162 115 148 125 126 134 110 158 103 M 147 60 L 167 56 Q 190 58 182 72 174 84 156 83 144 82 143 78 140 74 147 60 M 318 199 L 339 197 353 201 Q 363 206 359 214 L 338 226 315 231 Q 298 230 305 216 310 204 318 199 M 337 241 L 335 238 Q 338 233 351 234 383 238 380 253 377 267 355 266 314 256 318 251 L 339 243 337 241 M 296 231 L 254 236 Q 242 235 246 225 L 257 218 273 219 Q 310 224 296 231 M 301 192 Q 289 206 261 203 L 245 200 Q 240 195 245 183 250 171 288 175 313 178 301 192 M 263 145 Q 314 151 259 162 242 153 244 148 L 263 145 M 270 13 L 290 13 Q 318 16 310 28 303 41 274 37 245 36 251 21 254 15 270 13 M 268 47 L 296 44 Q 361 52 338 83 316 115 263 110 245 107 239 96 229 82 241 59 245 50 268 47 M -75 112 Q -103 112 -99 98 -99 80 -76 83 -52 84 -52 101 L -54 108 -75 112 M -207 293 Q -215 288 -207 282 -202 278 -193 277 L -175 277 Q -156 281 -167 291 -179 302 -200 297 L -207 293 M -88 203 L -51 204 Q -57 202 -55 196 L -53 194 -47 194 Q -30 199 -29 203 L -42 205 -38 206 Q 15 219 -35 248 -81 277 -127 267 L -154 255 Q -175 241 -151 222 -127 203 -88 203 M -29 278 L -30 280 -38 279 -39 276 -34 273 -29 278 M -201 314 L -189 317 Q -156 325 -171 343 -177 323 -201 314 M -60 306 Q -19 316 -46 339 -71 364 -127 351 -144 347 -145 337 -147 326 -132 314 -114 300 -60 306 M -65 289 Q -84 297 -93 294 -111 292 -102 284 L -82 279 -62 279 Q -48 282 -65 289";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 162 40 Q 162 54 96 85 L 78 84 Q 69 82 69 73 69 64 76 64 L 88 68 Q 97 68 127 51 L 128 48 119 35 Q 119 14 151 -4 182 -23 182 0 L 177 7 162 5 Q 157 5 149 14 L 142 24 152 32 Q 162 35 162 40 M 65 60 L 67 62 69 66 Q 69 84 26 127 L -17 168 -17 170 -24 185 Q -32 196 -40 196 L -61 191 -63 202 -80 206 -102 201 Q -120 201 -134 208 -146 214 -146 221 L -142 237 Q -136 240 -136 248 L -137 253 -139 254 Q -124 260 -124 294 -124 327 -134 327 -148 327 -151 315 -155 305 -151 300 -163 301 -163 280 L -162 268 -178 275 -202 281 Q -220 281 -216 266 -216 242 -199 242 L -185 246 Q -177 250 -175 253 L -179 259 -178 262 -170 261 Q -168 261 -161 264 -158 255 -152 253 L -159 244 Q -170 237 -169 214 -169 197 -140 185 -111 173 -74 173 L -52 177 -46 179 Q -45 165 -26 144 -5 120 23 109 L 21 103 Q 21 98 24 96 L 42 86 Q 25 68 25 60 25 39 49 39 72 39 72 52 L 65 60 M 14 16 L 13 20 10 21 Q 28 29 28 43 28 54 16 54 3 54 0 47 L -4 36 -5 35 -17 46 -10 68 Q -10 78 -19 78 -35 78 -35 47 -35 31 -27 23 -16 13 13 12 L 14 16 M 54 72 L 63 61 46 57 54 72 M -93 31 L -90 24 -95 22 -118 26 -113 27 -106 32 -133 36 -152 18 Q -152 8 -103 6 L -103 4 -80 8 Q -73 12 -73 21 L -76 28 -88 37 -93 31 M -80 75 L -67 88 -65 82 -68 74 Q -71 67 -76 66 L -80 75 M -74 97 Q -92 83 -118 83 -133 83 -147 94 L -156 87 -174 100 -161 113 Q -148 120 -148 126 -148 136 -161 136 -181 136 -191 115 L -197 94 Q -48 -7 -48 102 -48 110 -57 110 L -74 97 M -200 175 L -219 174 -244 174 -263 198 -244 199 -242 200 Q -256 211 -266 211 -283 211 -285 196 -285 188 -270 171 -251 150 -229 150 L -201 158 -193 169 Q -193 172 -200 175 M -199 255 L -200 255 -203 267 -200 267 -199 255";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape436(ctx,ctrans,frame,ratio,time){
	var pathData="M 121 -38 L 158 -39 Q 181 -33 160 -22 L 144 -18 137 -17 196 -14 219 -7 226 -4 232 2 262 5 Q 393 25 395 45 L 393 48 402 50 410 53 447 57 451 69 451 77 463 82 Q 467 82 470 85 L 476 91 506 94 Q 637 114 638 134 L 629 142 Q 619 149 619 155 L 630 168 640 177 646 177 652 175 666 177 713 181 720 185 725 187 752 188 Q 769 194 767 211 L 768 216 Q 767 223 773 228 L 783 235 Q 843 237 850 252 857 269 897 271 L 930 270 Q 951 276 952 287 L 950 296 Q 958 308 948 313 L 923 318 909 318 910 340 Q 907 357 898 357 L 891 357 890 356 890 353 878 356 836 350 835 351 828 355 815 371 Q 789 403 764 417 L 748 424 Q 753 431 735 441 L 698 450 694 450 Q 642 473 604 483 612 492 597 500 L 560 510 533 509 532 516 531 522 Q 545 528 534 534 L 529 534 526 560 533 576 538 591 Q 529 607 503 607 L 460 602 458 602 439 602 383 593 Q 363 586 362 578 361 569 369 561 L 361 552 311 522 289 509 259 518 249 518 245 518 233 516 216 513 214 513 195 513 139 504 Q 119 497 118 489 117 480 125 472 L 117 463 102 451 88 453 90 455 Q 113 460 113 467 L 110 472 103 474 76 474 66 471 56 475 26 466 Q 13 459 13 452 12 439 44 441 L 41 434 Q 44 428 50 424 L 31 407 29 407 30 412 Q 31 422 15 424 L 14 424 1 429 -16 424 -23 414 Q -23 407 -4 408 L 2 401 -23 395 -57 392 Q -109 387 -110 371 L -102 361 -118 350 -116 348 -113 346 -101 352 -102 350 -97 350 -101 340 Q -106 324 -140 319 -159 317 -168 298 -171 293 -211 281 L -254 260 Q -277 247 -278 236 -279 230 -236 203 L -188 170 -167 151 -139 132 -127 123 -110 114 -68 109 Q -48 114 -20 109 L 8 108 24 108 59 90 Q 88 72 75 56 L 88 16 93 -11 108 -4 109 -3 112 -5 103 -14 107 -19 115 -18 Q 102 -28 121 -38 M 865 290 L 862 290 870 295 865 290 M 881 281 L 880 281 880 282 881 281 M 236 -6 L 230 -13 Q 228 -36 258 -29 287 -23 287 -14 L 286 -9 Q 278 -2 256 -2 L 236 -6 M 186 -4 L 176 -4 183 -1 186 -4 M 188 -1 L 184 -1 188 0 188 -1 M 848 307 L 851 314 853 327 857 327 863 321 849 306 848 307 M 432 89 L 432 88 428 88 429 89 432 89 M 427 88 L 428 87 425 87 427 88 M 583 123 L 581 122 582 123 583 123 M 531 75 L 530 80 500 87 480 83 474 76 Q 472 53 502 60 530 66 531 75 M 691 146 L 695 158 694 167 Q 691 176 672 176 648 176 646 151 L 654 142 691 146 M 563 145 L 550 146 565 148 563 145 M 339 34 L 337 33 338 34 339 34 M 328 70 L 320 56 302 57 281 57 286 69 291 71 308 73 309 73 328 70 M 381 72 L 405 73 404 67 388 71 381 72 M 237 14 L 240 13 234 12 237 14 M -90 373 L -95 376 -89 376 -90 373 M -75 409 L -66 407 -64 408 Q -59 408 -56 411 L -62 414 -75 409 M -165 364 L -170 364 -171 364 -174 364 Q -201 361 -203 345 L -193 334 Q -178 323 -154 329 -145 329 -140 335 L -131 340 -121 350 -134 353 -134 358 -165 364 M -195 304 L -195 299 -187 299 Q -184 302 -183 308 L -191 308 -195 304 M -214 323 Q -213 335 -237 335 L -249 331 -249 326 Q -251 312 -233 309 -215 308 -214 323 M -239 317 L -232 318 -223 318 -239 316 -239 317 M -218 291 L -221 297 Q -227 303 -240 303 L -270 297 -280 286 Q -281 279 -275 273 L -230 278 Q -218 284 -218 291 M 479 620 Q 479 638 461 638 448 638 442 631 L 436 622 Q 435 607 457 611 478 614 479 620 M 235 531 Q 235 549 217 549 204 549 198 542 L 192 533 Q 191 518 213 522 234 525 235 531 M 347 563 L 320 563 309 560 300 564 Q 284 564 270 555 257 548 257 541 255 526 296 531 326 534 334 544 356 549 357 556 L 354 561 347 563 M 5 406 L 12 407 21 407 5 405 5 406";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 814 430 L 793 425 Q 801 412 798 399 787 365 749 376 712 387 725 415 L 729 446 723 448 Q 679 467 654 481 L 615 518 593 544 555 540 Q 474 536 419 510 372 488 354 455 L 353 450 349 455 311 451 Q 230 447 175 421 128 399 110 366 L 107 357 105 356 105 357 86 358 Q 69 357 58 350 30 339 41 334 L 44 331 16 318 Q -56 284 -73 270 L -79 263 -92 260 -134 246 Q -180 225 -201 197 -222 171 -205 162 L -192 155 -184 148 -182 145 -176 135 -169 130 -153 114 Q -134 92 -117 84 L -50 53 -37 32 Q -21 23 24 22 L 56 25 70 27 Q 197 11 233 46 262 63 272 87 319 102 341 113 445 104 477 135 506 152 516 176 575 195 594 208 L 610 218 634 230 Q 664 244 675 258 L 712 277 715 280 724 280 816 307 Q 864 322 889 344 L 862 339 Q 825 338 830 356 L 838 363 845 371 Q 847 376 814 430 M 906 367 Q 915 392 897 403 L 906 367 M 672 281 L 675 280 672 278 672 281";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 838 402 L 810 407 Q 785 407 759 394 753 392 754 379 754 365 758 364 780 351 819 369 861 389 838 402 M 497 180 Q 518 172 559 187 608 203 587 214 L 573 217 Q 581 225 579 233 L 584 235 587 236 Q 585 230 595 226 613 215 630 229 645 242 631 250 L 609 254 603 261 577 268 556 270 555 273 Q 564 275 575 280 617 300 594 313 L 593 314 Q 643 314 693 338 755 366 753 389 750 399 724 413 708 423 684 424 646 428 609 410 569 392 546 365 L 537 352 514 348 Q 499 340 505 331 L 512 323 547 322 561 318 Q 539 317 515 305 L 511 296 509 296 509 300 Q 506 310 480 324 L 478 326 489 340 Q 494 350 485 357 510 362 571 389 580 400 576 404 L 564 411 Q 531 430 473 403 L 465 398 460 399 Q 466 407 456 415 485 415 498 423 555 446 564 479 570 505 551 514 535 523 483 515 434 508 400 492 350 468 352 446 354 436 369 428 L 383 424 362 415 Q 329 399 327 386 325 374 335 368 L 376 366 Q 377 362 380 361 L 339 345 311 327 Q 279 337 230 314 207 303 203 291 L 193 292 188 293 Q 232 311 212 326 241 326 254 334 311 357 320 390 326 416 307 425 291 434 239 426 L 169 409 134 396 Q 123 401 105 376 86 352 103 343 116 335 135 334 L 118 326 Q 91 313 86 303 L 58 297 Q 60 305 45 313 L 43 315 Q 78 326 55 338 L 26 343 -17 334 -30 326 Q -70 325 -110 307 -121 312 -139 287 -158 263 -141 254 -99 230 -5 261 L -1 263 -6 246 Q -4 235 6 230 L -7 226 Q -25 218 -13 203 L -1 188 Q 13 181 16 188 L 22 197 31 199 50 203 56 212 58 211 Q 62 202 86 188 106 177 149 188 123 172 117 151 112 130 123 125 L 144 117 Q 134 104 152 83 181 67 236 88 242 89 248 93 L 295 92 296 89 Q 337 67 396 96 457 126 420 145 L 394 152 387 161 365 165 359 172 333 179 324 181 Q 361 205 346 225 L 360 225 Q 361 217 367 214 376 208 388 206 L 386 203 Q 380 192 388 184 L 396 172 Q 420 159 464 172 L 497 180 M 492 216 L 504 220 510 220 512 219 504 215 501 214 499 213 496 213 492 216 M 753 346 Q 713 345 681 329 640 309 630 292 621 277 638 268 681 243 767 279 852 313 809 338 L 753 346 M 724 301 L 748 309 754 309 756 308 Q 736 298 729 298 L 719 297 724 301 M 701 451 Q 745 471 724 483 L 698 488 Q 667 489 641 476 620 467 619 457 L 625 449 701 451 M 756 412 L 798 413 Q 825 420 802 433 L 786 440 757 437 Q 743 429 749 420 L 756 412 M 270 143 L 278 147 278 145 Q 295 135 317 139 L 301 129 260 126 Q 271 135 270 143 M 229 231 L 245 251 Q 250 261 241 268 262 272 309 292 L 314 288 302 276 Q 285 256 288 245 L 229 231 M 177 56 L 138 64 Q 103 65 75 51 42 35 45 17 45 6 53 0 93 -22 152 7 213 37 177 56 M 67 85 Q 134 121 85 149 L 48 156 Q 13 156 -26 137 -67 117 -64 97 -64 85 -52 78 L -36 71 -49 64 Q -77 51 -68 35 L -51 19 Q -36 10 6 31 39 50 18 67 L 67 85 M 56 215 L 53 219 51 222 56 223 56 215 M 185 154 L 181 154 188 159 190 156 185 154 M 141 279 L 145 280 142 276 141 279 M 73 271 L 68 269 65 270 66 271 73 271 M 181 438 L 256 443 Q 320 455 289 472 L 217 470 Q 181 453 174 446 172 442 181 438 M 533 561 L 461 559 418 535 Q 416 531 424 527 L 500 532 Q 564 544 533 561 M -104 167 Q -85 158 -46 172 -7 186 -29 198 L -51 203 -85 200 -102 187 Q -103 197 -118 205 -133 215 -149 214 -176 214 -219 194 -251 178 -249 157 -248 145 -237 140 -201 119 -140 151 -146 144 -144 137 L -134 126 Q -108 113 -85 130 -60 146 -82 159 L -103 162 -124 161 -108 175 -104 167 M -179 181 L -178 182 -171 182 -176 180 -179 181 M -217 221 Q -162 235 -189 249 L -218 254 -261 245 Q -295 229 -281 213 L -217 221";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 106 -40 Q 133 -33 112 -22 L 95 -18 77 -16 77 -14 69 -16 Q 45 -28 65 -41 L 106 -40 M 984 370 L 938 362 Q 915 351 922 340 921 334 929 329 962 311 993 334 1025 358 1010 366 L 984 370 M 878 323 Q 908 350 897 355 L 860 362 Q 822 362 780 342 735 320 731 301 731 287 742 281 L 740 281 694 273 Q 671 262 678 251 677 245 685 240 L 687 240 Q 669 229 686 215 L 712 216 756 242 757 251 Q 780 270 766 277 L 765 278 786 279 Q 823 282 846 292 L 845 294 878 323 M 899 380 L 918 381 Q 926 387 917 393 908 398 891 393 886 386 899 380 M 843 429 L 805 421 Q 792 415 795 405 795 402 802 398 826 384 850 398 873 413 861 420 L 843 429 M 628 229 L 634 234 653 254 Q 661 254 669 259 680 266 672 271 658 279 642 271 L 641 271 616 273 Q 578 273 536 253 L 495 225 467 219 466 219 449 219 418 213 Q 400 204 411 196 403 190 403 184 L 398 182 Q 386 177 393 172 L 397 168 Q 409 162 422 168 454 155 492 183 L 502 191 538 190 Q 536 184 543 181 558 172 589 187 652 215 632 226 L 628 229 M 412 89 L 433 91 Q 443 98 439 102 L 422 103 413 102 Q 400 96 412 89 M 439 130 L 437 124 Q 434 119 442 115 478 95 532 120 590 146 568 157 L 530 162 513 162 512 162 Q 493 174 445 152 426 142 439 130 M 454 231 Q 509 253 486 266 L 480 268 479 273 470 275 458 272 457 271 455 271 399 261 385 253 372 252 366 252 Q 413 274 423 291 L 427 295 481 315 515 335 Q 531 340 548 350 602 385 573 401 L 533 407 508 404 506 405 486 409 464 408 Q 445 398 443 387 444 380 448 378 L 449 378 Q 438 370 434 362 L 415 356 Q 423 369 401 381 L 400 394 436 395 Q 459 405 441 417 L 422 421 395 417 381 407 337 410 281 397 275 405 272 407 Q 285 419 275 424 L 262 427 Q 303 449 289 462 313 478 299 490 311 486 330 495 L 330 485 359 489 Q 379 497 367 503 L 342 505 Q 346 510 337 514 L 323 517 304 511 Q 289 504 290 497 L 293 495 Q 275 504 254 507 216 509 173 488 132 469 136 448 L 148 433 162 428 156 410 153 408 Q 138 401 150 395 L 181 398 186 400 219 409 223 406 226 408 Q 223 402 231 398 L 235 397 223 389 Q 219 386 227 381 L 247 380 229 359 201 361 174 358 Q 183 370 167 378 L 139 384 134 387 124 390 100 383 81 369 58 350 55 344 37 350 Q 58 366 40 377 L 43 378 Q 60 383 51 388 L 40 391 26 386 23 385 Q -5 392 -36 377 -69 361 -82 339 -93 318 -83 313 L -43 314 -48 307 Q -61 280 -53 275 L -44 272 Q -77 271 -106 256 -145 238 -150 220 -155 209 -142 202 -102 179 -31 213 L -15 222 -6 216 Q 27 198 80 223 L 100 234 Q 117 237 135 245 L 138 246 135 243 143 235 Q 162 225 193 235 208 240 211 245 L 234 241 242 235 Q 260 224 275 224 L 291 225 Q 278 216 278 208 L 279 204 254 194 231 181 211 182 176 179 174 181 158 183 172 193 176 193 209 199 224 214 220 221 198 224 182 220 178 222 111 225 Q 64 218 29 202 -14 181 -14 161 -14 151 -1 146 16 135 31 135 61 133 115 159 L 123 163 130 154 Q 120 140 143 127 156 119 207 141 L 211 134 230 132 223 130 187 119 Q 159 107 159 94 160 88 168 83 L 235 86 241 75 261 72 223 61 Q 194 47 193 35 190 30 198 26 234 6 288 31 L 316 46 350 49 Q 377 56 356 67 L 339 71 321 73 321 75 313 73 311 72 286 73 265 72 Q 281 74 303 86 L 308 89 Q 322 87 345 98 380 113 390 124 L 403 130 Q 433 144 419 151 L 401 160 Q 388 161 366 150 350 142 349 135 L 308 121 307 119 282 118 273 117 Q 280 128 272 134 L 330 142 Q 363 150 370 175 L 375 196 385 201 413 217 454 231 M 601 167 Q 618 175 609 181 L 582 178 574 169 576 164 601 167 M 507 302 L 484 300 Q 461 288 478 285 L 486 282 502 287 507 283 536 282 Q 574 264 629 290 L 646 299 651 294 Q 648 288 659 282 L 683 280 708 293 Q 722 301 711 307 L 693 308 671 305 658 306 Q 681 324 661 335 L 616 341 601 340 599 340 561 332 551 324 527 307 507 302 M 592 354 Q 605 348 620 354 635 360 623 366 610 375 592 366 585 362 587 358 L 592 354 M 487 418 Q 521 399 597 434 673 469 631 492 L 581 499 Q 547 497 507 478 468 459 471 439 471 425 487 418 M 511 492 Q 530 507 519 513 L 490 512 Q 473 504 470 497 L 469 503 463 502 462 498 467 495 470 497 Q 468 491 475 487 491 480 511 492 M 723 362 L 714 364 702 361 695 354 699 352 720 354 Q 730 359 723 362 M 692 467 L 734 471 Q 755 483 751 489 L 750 494 730 498 708 497 Q 689 487 687 476 688 469 692 467 M 782 392 L 750 390 Q 740 386 743 377 L 751 372 783 373 Q 798 383 782 392 M 717 459 Q 680 455 647 440 596 417 605 397 611 389 626 384 652 371 725 404 795 437 762 455 L 717 459 M 332 75 L 358 78 368 88 386 94 Q 408 105 397 109 L 384 113 376 111 Q 354 101 355 94 L 338 89 330 80 332 75 M 242 193 L 259 198 Q 274 205 264 212 L 240 211 Q 217 199 234 196 L 242 193 M 178 14 L 169 13 Q 156 7 169 0 L 189 2 Q 199 9 195 13 L 178 14 M 111 5 L 112 -1 Q 122 -5 142 5 164 16 153 20 L 140 24 133 22 Q 110 12 111 5 M 104 42 L 112 32 Q 128 25 159 41 189 55 175 62 L 157 71 Q 144 72 122 61 102 51 104 42 M 127 112 L 85 121 Q 48 123 10 105 -30 86 -36 64 -41 49 -32 45 L 22 44 86 53 Q 119 61 126 86 136 108 127 112 M 38 29 Q -4 26 -8 17 L -9 0 -3 -14 Q 17 -25 59 -3 101 19 84 26 L 38 29 M 153 178 L 151 176 145 175 156 181 153 178 M 168 286 L 212 302 Q 241 315 251 326 L 288 324 Q 317 312 368 330 L 360 315 355 314 333 310 329 312 289 318 229 303 216 296 209 295 201 286 Q 189 276 187 267 L 188 263 166 261 Q 181 273 168 286 M 95 297 L 90 294 55 276 7 261 5 260 -4 266 -18 271 Q 7 273 44 287 91 305 81 324 L 103 323 94 309 Q 90 302 95 297 M 87 407 Q 107 419 93 425 L 79 428 60 422 Q 46 415 46 408 L 51 403 87 407 M 226 412 L 230 413 226 408 226 412 M 302 439 Q 292 426 305 420 339 400 388 426 L 401 433 403 434 Q 451 456 428 470 L 390 479 Q 353 480 318 462 293 450 303 440 L 302 439 M 392 522 Q 423 505 498 534 571 564 537 583 L 498 596 Q 460 598 417 577 376 558 380 537 L 392 522 M 672 559 L 634 568 Q 597 569 562 551 537 539 547 529 L 562 521 647 523 Q 695 545 672 559 M 603 578 Q 623 586 611 592 605 596 573 592 L 574 574 603 578 M 421 502 L 397 497 Q 382 490 394 484 L 425 487 Q 449 495 438 500 L 421 502 M -93 87 L -121 85 Q -131 81 -110 61 -95 52 -71 67 -48 79 -70 92 L -87 93 -91 89 -93 87 M -96 105 L -68 104 -35 110 Q -21 117 -20 125 L -24 132 -46 135 -83 122 Q -107 111 -96 105 M -113 109 Q -89 114 -113 128 L -125 132 -147 127 Q -162 120 -155 115 -135 104 -113 109 M -139 177 Q -177 200 -237 172 -270 156 -264 140 -261 132 -250 127 -217 109 -164 134 -107 161 -139 177 M -39 167 L -83 170 -109 154 -100 146 Q -82 136 -50 146 -19 157 -39 167 M -44 187 Q 20 184 -15 203 L -35 206 Q -46 201 -44 187 M -346 235 L -352 235 -355 235 Q -370 227 -358 222 L -343 221 Q -339 224 -346 235 M -297 186 Q -270 172 -200 198 -131 224 -184 252 L -207 261 -257 255 Q -277 245 -292 218 -304 191 -297 186 M -226 286 L -201 289 Q -184 294 -193 299 L -204 302 -218 297 Q -239 288 -226 286 M -110 298 L -120 301 -144 294 Q -173 281 -157 272 -149 266 -123 278 -95 288 -110 298 M -108 324 L -111 324 Q -126 316 -114 311 L -99 310 Q -96 313 -102 324 L -108 324";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 530 82 L 514 87 Q 503 87 502 78 L 490 72 484 65 Q 484 38 537 75 L 530 82 M 616 143 L 619 136 527 122 Q 484 113 484 99 L 484 91 557 102 623 124 Q 645 123 645 131 L 635 135 Q 626 140 626 162 L 620 160 616 143 M 676 155 L 677 158 682 160 686 159 685 156 675 154 676 155 M 934 268 L 940 277 943 291 Q 943 309 936 315 933 318 933 313 L 935 302 Q 932 291 911 291 908 291 906 294 L 902 296 850 288 Q 828 281 828 274 L 829 269 825 270 769 266 Q 762 264 762 259 L 767 252 Q 748 243 748 229 L 752 205 734 204 Q 664 204 664 193 L 676 178 Q 679 176 681 175 L 666 166 Q 652 156 652 149 652 126 677 135 703 144 703 156 705 176 689 176 L 688 176 689 181 689 184 757 191 Q 769 193 769 199 L 765 221 Q 765 238 786 240 824 243 863 273 L 910 274 928 271 Q 928 268 934 268 M 249 -25 L 290 -23 Q 307 -18 307 -12 L 283 4 311 7 359 8 Q 375 26 462 70 L 459 75 448 78 445 72 401 65 378 59 Q 371 56 371 51 374 42 382 43 L 378 42 350 33 275 27 Q 267 25 267 14 267 1 274 2 L 274 1 277 0 279 -5 276 -9 258 -11 248 -20 249 -25 M 129 -30 L 127 -31 115 -35 100 -40 Q 115 -47 153 -40 192 -32 192 -18 192 -11 185 -11 L 193 -10 245 -6 268 3 267 6 Q 259 14 235 14 205 14 163 0 151 -2 137 -17 L 121 -11 Q 113 -11 113 -18 L 129 -30";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite1972(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1968",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape1969",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape1970",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape1971",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape437(ctx,ctrans,frame,ratio,time){
	var pathData="M 334 77 L 299 46 Q 281 34 266 28 L 234 22 219 25 192 21 189 20 155 15 124 3 Q 94 -12 93 -28 92 -37 101 -46 L 101 -49 104 -49 108 -52 113 -52 115 -46 114 -40 122 -28 Q 135 -13 152 -11 L 171 -6 172 -6 180 -4 187 -3 232 -1 Q 273 -1 313 28 L 314 28 325 36 Q 348 55 350 68 L 349 72 351 77 353 78 350 89 351 89 369 98 375 98 398 93 415 89 432 93 439 91 453 96 457 97 479 106 480 109 480 114 466 112 417 117 414 118 382 121 Q 366 121 353 113 L 351 112 349 111 348 110 339 103 338 103 Q 329 103 328 94 L 332 90 330 86 331 78 335 79 334 77";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 414 118 L 429 118 Q 560 138 562 158 L 552 166 Q 542 173 542 179 L 553 192 563 201 569 201 Q 571 199 575 199 L 589 201 636 205 Q 639 206 643 209 L 648 211 675 212 Q 692 218 690 235 L 691 240 696 252 707 259 Q 766 261 773 276 780 293 820 295 L 853 294 Q 874 300 875 311 L 873 320 Q 881 332 872 337 L 846 342 832 342 833 364 Q 830 381 821 381 L 814 381 813 380 813 377 801 380 759 374 758 375 751 379 738 395 Q 713 427 687 441 678 445 671 448 676 455 658 465 L 621 474 617 474 527 507 Q 536 516 520 524 L 483 534 456 533 455 540 454 546 Q 468 552 457 558 L 452 558 450 575 405 564 345 564 303 534 Q 273 513 243 511 L 184 511 Q 101 507 91 484 95 456 91 444 87 432 53 406 11 374 -23 374 L -43 378 -56 381 Q -113 381 -130 338 -150 291 -182 286 -234 278 -295 254 L -337 243 -313 227 -265 194 -244 175 -216 156 -204 147 Q -199 143 -187 138 L -145 133 -113 135 -97 133 -69 132 -53 132 -18 114 Q 11 96 -2 80 L 11 40 16 13 31 20 32 21 35 19 26 10 30 5 38 6 35 2 Q 29 -6 44 -14 L 81 -15 Q 104 -9 83 2 L 67 6 60 7 119 10 Q 140 12 142 17 146 17 149 20 L 155 26 185 29 Q 316 49 318 69 L 316 72 325 74 333 77 334 77 335 79 331 78 330 86 332 90 328 94 Q 329 103 338 103 L 339 103 348 110 349 111 348 111 351 112 353 113 Q 366 121 382 121 L 414 118 M 192 21 L 180 22 159 18 155 15 189 20 192 21 M 172 -6 L 181 -5 187 -3 180 -4 172 -6 M 313 28 L 314 25 321 26 326 32 325 36 314 28 313 28 M 351 77 L 353 77 370 81 374 93 375 98 369 98 351 89 350 89 353 78 351 77 M 398 93 Q 401 78 425 84 447 89 453 96 L 439 91 432 93 415 89 398 93 M 618 182 L 618 191 Q 614 200 595 200 571 200 569 175 569 170 577 166 L 614 170 618 182 M 487 169 L 471 170 488 172 487 169 M 793 319 L 789 314 786 314 793 319 M 803 306 L 804 305 803 305 803 306 M 506 147 L 505 146 505 147 506 147 M 774 338 L 776 351 780 351 786 345 772 330 771 331 774 338 M 328 97 L 327 91 311 95 304 96 328 97 M 261 58 L 262 58 261 57 261 58 M 204 81 L 209 93 214 95 231 97 232 97 251 94 243 80 225 81 204 81 M 160 38 L 163 37 157 36 160 38 M -152 340 L -152 342 -152 343 -155 341 -152 340 M 108 23 L 111 24 112 23 108 23 M 107 23 L 109 20 99 20 107 23";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 819 428 L 829 391 Q 839 416 820 427 L 819 428 M 517 232 L 533 242 557 254 Q 587 268 598 282 L 635 301 639 304 648 304 739 331 Q 787 346 812 368 L 785 363 Q 748 362 753 380 L 761 387 768 395 737 454 717 449 Q 724 436 721 423 710 389 672 400 635 411 648 439 L 652 470 647 472 Q 602 491 578 505 563 514 538 542 L 516 568 478 564 Q 397 560 342 534 295 512 277 479 L 276 474 272 479 234 475 Q 154 471 98 445 L 90 441 Q 83 429 53 406 L 36 394 33 390 30 381 28 380 28 381 15 383 Q -3 375 -19 374 -47 363 -36 358 L -33 355 -61 342 Q -133 308 -150 294 L -156 287 -169 284 Q -195 279 -210 270 -257 249 -278 221 -299 195 -282 186 L -269 179 -261 172 -258 169 -253 159 -246 154 -230 138 -194 108 -127 77 -113 56 -53 46 -21 49 -7 51 Q 120 35 156 70 185 87 195 111 L 264 137 Q 368 128 400 159 429 176 439 200 498 219 517 232 M 599 304 L 595 302 595 305 599 304";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 435 243 L 427 239 424 238 422 237 419 237 415 240 427 244 433 244 435 243 M 482 211 Q 531 227 510 238 L 496 241 Q 504 249 502 257 L 508 259 510 260 Q 508 254 518 250 536 239 553 253 568 266 554 274 L 532 278 526 285 501 292 479 294 478 297 499 304 Q 540 324 518 337 L 516 338 Q 566 338 616 362 678 390 676 413 673 423 647 437 631 447 607 448 569 452 532 434 493 416 469 389 L 460 376 437 372 Q 422 364 428 355 L 435 347 470 346 484 342 Q 462 341 438 329 L 434 320 432 320 432 324 Q 429 334 404 348 L 401 350 412 364 Q 417 374 408 381 433 386 494 413 503 424 499 428 L 487 435 Q 454 454 397 427 L 388 422 383 423 Q 389 431 379 439 408 439 421 447 478 470 487 503 493 529 474 538 458 547 407 539 357 532 324 516 273 492 275 470 278 460 292 452 L 306 448 285 439 Q 252 423 250 410 248 398 258 392 L 299 390 303 385 262 369 234 351 Q 202 361 153 338 130 327 127 315 L 116 316 111 317 Q 155 335 135 350 L 177 358 Q 234 381 243 414 249 440 231 449 214 458 163 450 L 92 433 81 430 53 406 20 385 Q 15 373 26 367 40 359 58 358 L 41 350 9 327 -19 321 Q -17 329 -31 337 L -34 339 Q 1 350 -22 362 L -51 367 -94 358 -107 350 -124 349 -130 338 Q -150 291 -182 286 L -219 279 -218 278 Q -176 254 -82 285 L -78 287 -82 270 Q -80 259 -71 254 L -84 250 Q -102 242 -90 227 L -78 212 Q -64 205 -61 212 L -55 221 -46 223 -27 227 Q -19 231 -20 236 L -19 235 Q -15 226 9 212 29 201 72 212 46 196 40 175 35 154 46 149 55 143 67 141 57 128 75 107 104 91 160 112 L 171 117 218 116 220 113 Q 260 91 319 120 380 150 344 169 L 317 176 310 185 Q 299 191 288 189 L 282 196 257 203 247 205 Q 284 229 269 249 L 283 249 Q 284 241 290 238 L 311 230 309 227 Q 303 216 311 208 L 319 196 Q 343 183 387 196 L 420 204 Q 441 196 482 211 M 562 292 Q 604 267 691 303 776 337 732 362 714 372 677 370 636 369 604 353 563 333 553 316 544 301 562 292 M 548 473 L 624 475 Q 668 495 647 507 L 621 512 Q 590 513 564 500 543 491 542 481 L 548 473 M 652 322 L 642 321 648 325 671 333 677 333 679 332 Q 659 322 652 322 M 677 403 Q 677 389 681 388 703 375 743 393 784 413 761 426 L 733 431 Q 708 431 682 418 677 416 677 403 M 679 436 L 721 437 Q 748 444 725 457 L 709 464 681 461 Q 666 453 672 444 L 679 436 M 224 153 L 183 150 Q 194 159 193 167 L 201 171 202 169 Q 218 159 240 163 L 224 153 M 61 88 Q 26 89 -2 75 -35 59 -32 41 -32 30 -24 24 16 2 75 31 136 61 100 80 L 61 88 M 104 178 L 111 183 114 180 108 178 104 178 M 168 275 Q 173 285 165 292 185 296 232 316 L 237 312 225 300 Q 208 280 212 269 183 268 152 255 L 168 275 M 69 304 L 65 300 65 303 69 304 M 179 467 Q 243 479 212 496 L 141 494 97 470 Q 95 466 104 462 L 179 467 M 348 564 L 341 559 Q 339 555 348 551 L 423 556 Q 477 566 463 580 L 405 564 348 564 M -59 91 Q -36 96 -10 109 57 145 8 173 L -28 180 Q -63 180 -103 161 -144 141 -141 121 -141 109 -129 102 L -113 95 Q -117 92 -126 88 -154 75 -145 59 L -128 43 Q -112 34 -71 55 -38 74 -59 91 M -179 211 Q -180 221 -195 229 -210 239 -226 238 -253 238 -296 218 -327 202 -326 181 -324 169 -314 164 -278 143 -217 175 L -221 161 -211 150 Q -185 137 -162 154 -137 170 -159 183 L -180 186 -201 185 -185 199 -180 191 Q -162 182 -123 196 -84 210 -106 222 L -128 227 -161 224 -179 211 M -21 239 L -24 243 -26 246 -20 247 -21 239 M -357 237 L -294 245 Q -250 256 -258 267 L -295 254 -350 238 -357 237 M -253 204 L -256 205 -255 206 -248 206 -253 204 M -4 295 L -9 293 -12 294 -11 295 -4 295 M -152 340 L -152 342 -152 343 -155 341 -152 340";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 302 23 L 284 14 251 -3 Q 251 -10 263 -11 L 267 -11 Q 314 -11 346 16 L 365 35 366 37 372 55 372 68 366 77 364 83 360 84 Q 350 77 344 60 L 326 36 302 23 M 531 101 Q 505 87 489 84 L 486 79 Q 518 67 561 96 595 119 601 137 L 602 143 603 158 597 160 Q 590 160 574 141 L 557 119 532 102 531 101 M 225 497 L 243 496 266 496 314 496 325 502 339 509 364 523 374 528 409 534 433 540 439 539 Q 455 538 476 549 L 492 559 530 575 556 592 562 603 555 605 Q 544 605 522 597 L 488 578 486 577 480 578 418 565 353 547 309 518 251 511 191 506 155 498 162 498 109 486 Q 85 480 62 440 34 396 26 390 -10 361 -83 365 L -84 369 -87 371 Q -123 358 -126 349 L -125 327 Q -127 309 -212 272 -280 243 -309 235 L -309 231 -309 230 -308 230 -238 253 -215 261 -189 269 Q -154 282 -133 295 L -128 299 Q -106 314 -105 331 L -108 342 -98 353 -91 358 -35 355 4 361 Q 61 376 86 426 L 97 444 Q 117 473 150 491 L 167 498 214 497 225 497 M 248 553 L 237 550 226 548 248 553 M -102 437 L -102 433 -95 438 -102 437 M -45 471 L -6 501 -20 503 Q -41 503 -55 487 L -66 468 -59 462 -45 471";
	ctx.fillStyle=tocolor(ctrans.apply([240,243,244,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 346 97 L 347 94 339 75 340 71 333 60 336 53 329 52 Q 319 34 302 23 L 326 36 344 60 Q 350 77 360 84 L 364 83 366 77 372 68 Q 401 61 499 91 L 531 101 532 102 557 119 574 141 Q 590 160 597 160 L 603 158 602 143 601 137 608 150 600 162 584 177 585 182 690 192 Q 726 196 728 214 L 726 225 712 241 Q 723 251 745 250 769 249 781 259 L 802 272 822 284 881 290 Q 895 294 896 304 895 317 886 317 L 842 315 Q 779 269 743 269 723 269 705 233 689 196 653 196 L 624 200 608 204 584 194 574 187 575 171 Q 573 148 537 120 490 83 418 83 L 352 100 346 97 M 284 14 Q 254 3 182 -6 113 -14 112 -27 L 118 -41 115 -47 109 -48 117 -55 130 -62 Q 151 -81 153 -58 L 145 -43 132 -28 146 -20 153 -20 252 -13 263 -11 Q 251 -10 251 -3 L 284 14 M 694 250 L 681 235 675 229 677 223 686 232 694 250 M 558 181 L 555 179 556 175 556 174 558 181 M 442 104 L 431 103 419 106 414 107 396 106 399 105 412 101 442 104 M 503 605 L 497 606 484 603 503 605 M 369 591 L 363 591 334 586 369 591 M 132 519 L 111 514 111 513 Q 51 451 44 427 32 402 -2 386 L -76 383 -79 383 -105 385 -127 383 -124 383 -109 374 -139 355 -162 335 -178 309 Q -189 295 -209 286 -232 275 -251 270 L -297 256 -328 242 Q -351 233 -358 242 L -357 243 -362 242 -363 236 -350 234 Q -351 216 -309 231 L -309 235 Q -280 243 -212 272 -127 309 -125 327 L -126 349 Q -123 358 -87 371 L -84 369 -83 365 Q -10 361 26 390 34 396 62 440 85 480 109 486 L 162 498 155 498 191 506 251 511 309 518 353 547 418 565 480 578 486 577 488 578 443 582 Q 437 574 411 572 L 339 560 309 544 Q 290 532 284 530 L 208 518 Q 150 512 132 519 M 16 422 L -14 400 Q 2 405 10 413 L 16 422 M 4 361 Q 27 363 59 389 L 78 405 91 419 95 427 97 444 86 426 Q 61 376 4 361 M 150 491 L 157 491 214 497 167 498 150 491 M -375 243 L -376 250 -377 249 -376 243 -375 243";
	ctx.fillStyle=tocolor(ctrans.apply([221,228,230,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 341 99 L 340 99 Q 329 99 323 79 L 312 53 282 28 275 23 257 15 255 15 221 20 Q 174 20 133 1 98 -15 97 -24 L 100 -41 102 -44 Q 104 -48 109 -48 L 115 -47 118 -41 112 -27 Q 113 -14 182 -6 254 3 284 14 L 302 23 Q 319 34 329 52 L 330 55 333 60 339 75 347 94 346 97 341 99 M 335 114 L 364 123 362 126 345 127 336 126 Q 324 120 335 114 M 614 237 L 635 240 676 264 678 267 682 271 680 275 Q 703 294 689 301 L 688 302 710 303 736 307 775 326 801 347 Q 831 374 820 379 L 783 386 Q 745 386 703 366 658 344 655 325 654 311 665 305 L 663 305 617 297 Q 594 286 601 275 601 269 608 264 L 610 264 Q 592 253 609 239 L 614 237 M 821 319 L 776 299 Q 709 271 698 259 L 694 250 686 232 677 223 652 218 649 218 640 218 617 216 583 209 571 194 567 197 558 181 556 174 556 172 Q 551 156 534 144 490 111 442 104 L 412 101 399 105 396 106 382 109 379 109 376 109 356 107 348 103 347 101 352 100 418 83 Q 490 83 537 120 573 148 575 171 L 574 187 584 194 608 204 624 200 653 196 Q 689 196 705 233 723 269 743 269 779 269 842 315 L 863 331 Q 864 338 858 338 L 821 319 M 852 353 Q 885 335 916 358 949 382 933 390 L 907 394 Q 881 395 861 386 838 375 845 364 844 358 852 353 M 823 404 L 842 405 Q 849 411 840 417 831 422 814 417 809 410 823 404 M 435 186 Q 416 198 368 176 349 166 362 154 L 360 148 Q 357 143 365 139 401 119 455 144 513 170 491 181 L 453 186 436 186 435 186 M 425 215 L 462 214 Q 459 208 466 205 481 196 512 211 575 239 555 250 L 551 253 558 258 576 278 592 283 Q 603 290 595 295 582 303 565 295 L 564 295 539 297 Q 501 297 459 277 L 418 249 390 243 389 243 372 243 341 237 Q 323 228 334 220 327 214 326 208 L 321 206 Q 309 201 316 196 L 320 192 Q 332 186 345 192 377 179 415 207 L 425 215 M 499 188 L 525 191 Q 541 199 532 205 L 506 202 Q 495 197 497 193 L 499 188 M 607 304 L 631 317 Q 646 325 634 331 L 616 332 594 329 581 330 Q 605 348 585 359 L 539 365 524 364 522 364 484 356 475 348 450 331 431 326 407 324 Q 384 312 401 309 L 409 306 425 311 430 307 459 306 Q 497 288 553 314 L 569 323 574 318 Q 571 312 582 306 L 607 304 M -215 261 L -227 244 Q -232 233 -219 226 -178 203 -108 237 -99 241 -92 246 L -83 240 Q -50 222 4 247 L 24 258 59 269 62 270 58 267 Q 58 264 67 259 85 249 117 259 L 135 269 157 265 Q 160 261 166 259 183 248 198 248 L 214 249 Q 201 240 201 232 L 202 228 177 218 154 205 134 206 100 203 97 205 81 207 95 217 99 217 132 223 147 238 143 245 121 248 105 244 101 246 34 249 Q -13 242 -48 226 -91 205 -91 185 -91 175 -78 170 -61 159 -46 159 -15 157 38 183 L 46 187 53 178 Q 43 164 66 151 79 143 130 165 131 160 135 158 L 153 156 146 154 110 143 Q 82 131 82 118 L 91 107 158 110 164 99 184 96 146 85 Q 117 71 116 59 113 54 121 50 157 30 211 55 229 63 239 70 L 273 73 Q 300 80 279 91 L 262 95 244 97 244 99 236 97 234 96 209 97 188 96 Q 204 98 226 110 L 232 113 Q 245 111 268 122 L 313 148 Q 319 150 326 154 357 168 342 175 L 324 184 Q 311 185 289 174 273 166 272 159 L 231 145 230 143 205 142 196 141 Q 203 152 196 158 L 253 166 Q 286 174 293 199 L 298 220 309 225 336 241 377 255 Q 432 277 409 290 L 404 292 Q 407 295 402 297 L 393 299 381 296 380 295 378 295 Q 345 296 322 285 L 308 277 295 276 289 276 Q 336 298 347 315 L 350 319 404 339 439 359 471 374 Q 525 409 496 425 L 456 431 431 428 429 429 409 433 387 432 Q 368 422 366 411 L 371 402 372 402 357 386 338 380 Q 347 393 325 405 L 323 418 359 419 Q 382 429 364 441 L 345 445 318 441 304 431 260 434 204 421 198 429 195 431 Q 208 443 198 448 L 185 451 Q 226 473 212 486 L 225 497 214 497 157 491 150 491 Q 117 473 97 444 L 95 427 91 419 104 422 109 424 142 433 146 430 149 432 149 436 153 437 149 432 Q 146 426 154 422 L 158 421 146 413 Q 142 410 151 405 L 171 404 Q 155 394 152 383 L 124 385 98 382 Q 106 394 90 402 L 78 405 59 389 Q 27 363 4 361 L -35 355 -91 358 -98 353 -108 342 -105 331 Q -106 314 -128 299 L -121 296 -133 295 Q -154 282 -189 269 L -215 261 M 266 496 L 241 486 Q 216 474 226 464 L 225 463 Q 216 450 228 444 262 424 312 450 L 324 457 326 458 Q 374 480 352 494 L 325 502 314 496 266 496 M 339 509 L 348 511 Q 369 518 364 523 L 339 509 M 409 534 Q 383 520 398 511 414 504 435 516 453 531 442 537 L 439 539 433 540 409 534 M 476 549 L 485 545 570 547 Q 618 569 595 583 L 557 592 556 592 530 575 492 559 476 549 M 555 605 L 558 613 Q 559 626 540 626 L 526 621 515 610 503 605 484 603 460 607 428 597 416 592 378 591 369 591 334 586 300 571 Q 274 550 262 547 L 196 535 127 521 132 519 Q 150 512 208 518 L 284 530 Q 290 532 309 544 L 339 560 411 572 Q 437 574 443 582 L 488 578 522 597 Q 544 605 555 605 M 111 514 L 112 518 106 522 Q 84 522 61 498 40 477 29 450 L 16 422 10 413 Q 2 405 -14 400 L -81 389 -84 386 -76 383 -2 386 Q 32 402 44 427 51 451 111 513 L 111 514 M -127 383 Q -162 382 -179 353 -204 312 -214 305 L -283 281 Q -335 267 -357 243 L -358 242 Q -351 233 -328 242 L -297 256 -251 270 Q -232 275 -209 286 -189 295 -178 309 L -162 335 -139 355 -109 374 -124 383 -127 383 M -363 236 L -370 238 Q -380 215 -374 210 -347 196 -277 222 -237 237 -238 253 L -308 230 -309 230 -309 231 Q -351 216 -350 234 L -363 236 M 546 390 Q 533 399 515 390 508 386 511 382 L 515 378 Q 528 372 543 378 558 384 546 390 M 528 421 L 549 408 Q 575 395 648 428 719 461 685 479 L 641 483 Q 603 479 570 464 519 441 528 421 M 520 458 Q 596 493 555 516 L 504 523 Q 470 521 430 502 392 483 394 463 395 449 410 442 444 423 520 458 M 666 401 L 674 396 706 397 Q 721 407 706 416 L 673 414 Q 663 410 666 401 M 646 386 L 637 388 625 385 618 378 622 376 643 378 Q 653 383 646 386 M 728 445 Q 715 439 718 429 718 426 725 422 749 408 773 422 796 437 784 444 L 766 453 728 445 M 262 113 Q 251 108 253 104 L 255 99 Q 265 93 281 102 L 292 112 309 118 Q 331 129 320 133 316 137 307 137 L 300 135 Q 277 125 278 118 L 262 113 M 118 37 L 101 38 92 37 Q 79 31 92 24 L 112 26 Q 122 33 118 37 M 63 48 L 56 46 Q 33 36 34 29 L 36 23 Q 45 19 65 29 87 40 76 44 72 48 63 48 M 0 10 L -8 8 Q -32 -4 -12 -17 L 29 -16 Q 56 -9 35 2 L 18 6 0 8 0 10 M 49 110 Q 59 132 50 136 L 8 145 Q -29 147 -67 129 -107 110 -113 88 -118 73 -109 69 L -54 68 9 77 Q 42 85 49 110 M 27 66 L 36 56 Q 51 49 82 65 113 79 98 86 L 80 95 Q 67 96 45 85 25 75 27 66 M 77 202 L 74 200 68 199 79 205 77 202 M 182 222 Q 197 229 188 236 L 163 235 Q 140 223 157 220 L 165 217 182 222 M 111 287 L 89 285 Q 104 297 91 310 112 314 136 326 164 339 174 350 L 212 348 Q 240 336 291 354 283 346 283 339 L 278 338 256 334 252 336 212 342 Q 177 339 152 327 L 139 320 132 319 124 310 Q 112 300 110 291 L 111 287 M 26 347 L 17 333 Q 14 326 18 321 L 13 318 -22 300 -70 285 -72 284 -81 290 -95 295 Q -70 297 -33 311 14 329 5 348 L 26 347 M 385 522 L 390 519 393 521 392 527 386 526 385 522 M 673 518 L 653 522 631 521 Q 612 511 610 500 611 493 615 491 L 657 495 Q 678 507 674 513 L 673 518 M -85 41 L -86 24 -80 10 Q -60 -1 -18 21 24 43 7 50 L -39 53 Q -81 50 -85 41 M -198 109 Q -208 105 -187 85 -172 76 -148 91 -125 103 -147 116 L -164 117 -167 113 -170 111 -198 109 M -112 134 Q -98 141 -97 149 L -101 156 -123 159 -159 146 Q -183 135 -173 129 L -145 128 -112 134 M -177 170 Q -159 160 -127 170 -96 181 -115 191 L -160 194 -186 178 -177 170 M -202 156 L -224 151 Q -239 144 -232 139 -212 128 -190 133 -166 138 -190 152 L -202 156 M -121 211 Q -57 208 -92 227 L -112 230 Q -122 225 -121 211 M -327 151 Q -294 133 -240 158 -184 185 -216 201 -253 224 -314 196 -346 180 -341 164 L -327 151";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 102 -44 L 100 -41 97 -24 Q 98 -15 133 1 174 20 221 20 L 255 15 257 15 275 23 282 28 312 53 323 79 Q 329 99 340 99 L 341 99 356 107 376 109 379 109 382 109 414 107 419 106 431 103 442 104 Q 490 111 534 144 551 156 556 172 L 556 174 556 175 554 178 555 179 558 181 567 197 571 194 583 209 617 216 640 218 649 218 Q 663 219 675 229 L 681 235 694 250 698 259 Q 709 271 776 299 L 821 319 Q 831 327 831 336 832 346 823 346 L 775 326 736 307 682 271 678 267 676 264 Q 655 242 636 240 L 635 240 614 237 580 229 Q 572 226 566 217 L 554 205 536 191 533 180 539 160 Q 489 129 388 125 L 364 123 335 114 Q 313 102 311 80 L 315 69 Q 256 32 231 32 225 32 223 35 L 211 38 181 31 128 24 Q 102 24 82 9 66 -3 65 -12 64 -26 83 -40 97 -51 102 -44 M 339 75 L 333 60 340 71 339 75";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape438(ctx,ctrans,frame,ratio,time){
	var pathData="M 117 -5 L 109 -14 113 -19 121 -18 Q 109 -28 129 -38 L 166 -39 Q 188 -33 166 -22 L 150 -18 143 -17 202 -14 Q 222 -12 224 -7 L 231 -4 236 2 266 5 Q 395 25 395 45 L 393 48 402 50 410 53 446 57 449 69 449 77 Q 459 79 460 82 464 82 467 85 L 472 91 502 94 Q 631 114 631 134 L 621 142 Q 610 149 610 155 L 619 168 629 177 635 177 Q 637 175 641 175 L 655 177 701 181 708 185 713 187 740 188 Q 756 194 753 211 L 753 216 Q 752 223 757 228 L 767 235 Q 826 237 832 252 837 269 877 271 L 910 270 Q 931 276 931 287 L 928 296 Q 935 308 925 313 L 899 318 885 318 884 340 Q 880 357 871 357 L 864 357 863 356 863 353 851 356 809 350 808 351 801 355 786 371 Q 758 403 731 417 L 715 424 Q 719 431 700 441 L 662 450 658 450 565 483 Q 573 492 557 500 L 519 510 492 509 490 516 489 522 Q 502 528 491 534 L 486 534 481 560 486 576 490 591 Q 479 607 453 607 L 411 602 409 602 390 602 335 593 Q 315 586 315 578 315 569 323 561 L 316 552 Q 309 542 269 522 L 248 509 Q 236 518 217 518 L 207 518 203 518 191 516 175 513 173 513 154 513 99 504 79 489 Q 79 480 87 472 L 80 463 66 451 52 453 54 455 Q 76 460 76 467 L 72 472 65 474 38 474 28 471 18 475 Q 2 475 -11 466 -23 459 -23 452 -23 439 9 441 L 7 434 17 424 -1 407 -3 407 -2 412 Q -2 422 -18 424 L -19 424 -33 429 -49 424 -55 414 Q -55 407 -36 408 L -29 401 -54 395 -87 392 Q -139 387 -139 371 L -130 361 -145 350 -143 348 -139 346 -128 352 -129 350 -124 350 -127 340 Q -130 324 -164 319 -183 317 -190 298 -193 293 -232 281 L -273 260 Q -295 247 -295 236 -295 230 -250 203 L -199 170 -176 151 -146 132 -134 123 -116 114 -73 109 Q -54 114 -25 109 L 3 108 19 108 55 90 Q 86 72 74 56 L 91 16 98 -11 113 -4 114 -3 117 -5 M 293 -14 L 291 -9 Q 283 -2 261 -2 L 241 -6 236 -13 Q 236 -36 265 -29 293 -23 293 -14 M 193 -1 L 189 -1 192 0 193 -1 M 191 -4 L 181 -4 188 -1 191 -4 M 825 307 L 827 314 828 327 832 327 839 321 826 306 825 307 M 429 88 L 425 88 426 89 429 89 429 88 M 424 88 L 425 87 422 87 424 88 M 576 123 L 575 122 575 123 576 123 M 529 75 L 527 80 Q 519 87 497 87 L 477 83 472 76 Q 472 53 501 60 529 66 529 75 M 682 146 L 685 158 684 167 Q 680 176 661 176 637 176 637 151 637 146 646 142 L 682 146 M 848 295 L 844 290 841 290 848 295 M 860 281 L 859 281 859 282 860 281 M 555 145 L 541 146 556 148 555 145 M 340 34 L 339 33 339 34 340 34 M 326 70 L 319 56 301 57 280 57 284 69 289 71 306 73 307 73 326 70 M 403 73 L 402 67 386 71 379 72 403 73 M 240 14 L 243 13 237 12 240 14 M -88 411 L -94 414 -107 409 -98 407 -96 408 Q -91 408 -88 411 M -27 405 L -27 406 -20 407 -11 407 -27 405 M -124 376 L -118 376 -119 373 -124 376 M -229 345 L -218 334 Q -202 323 -179 329 -170 329 -165 335 L -157 340 -148 350 -161 353 -161 358 -193 364 -198 364 -199 364 -202 364 Q -229 361 -229 345 M -274 331 L -274 326 Q -274 312 -256 309 -238 308 -238 323 -238 335 -262 335 -272 335 -274 331 M -263 317 L -256 318 -247 318 -263 316 -263 317 M -239 291 L -243 297 Q -250 303 -263 303 L -292 297 -301 286 -295 273 -250 278 Q -239 284 -239 291 M -218 304 L -217 299 -209 299 Q -206 302 -206 308 L -214 308 -218 304 M 149 533 Q 149 518 171 522 192 525 192 531 191 549 173 549 160 549 154 542 L 149 533 M 390 631 L 385 622 Q 385 607 407 611 428 614 428 620 427 638 409 638 396 638 390 631 M 312 556 L 308 561 301 563 274 563 264 560 254 564 Q 238 564 225 555 213 548 213 541 213 526 253 531 283 534 290 544 312 549 312 556";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 836 339 Q 799 338 803 356 L 810 363 816 371 Q 818 376 780 430 L 760 425 Q 769 412 767 399 759 365 720 376 682 387 692 415 L 694 446 688 448 Q 642 467 616 481 601 490 573 518 L 549 544 511 540 Q 431 536 378 510 333 488 318 455 L 317 450 313 455 275 451 Q 195 447 142 421 97 399 82 366 L 80 357 78 356 78 357 59 358 Q 42 357 31 350 4 339 16 334 L 19 331 -8 318 -93 270 -98 263 -111 260 -151 246 Q -196 225 -214 197 -233 171 -215 162 L -201 155 -193 148 -190 145 -184 135 -176 130 -159 114 Q -138 92 -120 84 -100 73 -50 53 L -35 32 26 22 58 25 72 27 Q 200 11 233 46 261 63 269 87 L 335 113 Q 440 104 469 135 497 152 505 176 562 195 580 208 L 595 218 618 230 Q 647 244 656 258 L 692 277 695 280 704 280 793 307 Q 840 322 863 344 L 836 339 M 865 403 L 864 404 878 367 Q 885 392 865 403 M 651 281 L 655 280 652 278 Q 650 279 651 281";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 486 214 L 484 213 481 213 477 216 489 220 495 220 497 219 489 215 486 214 M 485 180 Q 507 172 547 187 594 203 572 214 L 558 217 563 233 568 235 570 236 Q 569 230 579 226 598 215 614 229 628 242 613 250 L 591 254 584 261 558 268 536 270 535 273 Q 544 275 555 280 595 300 571 313 L 569 314 Q 619 314 667 338 727 366 723 389 L 692 413 Q 675 423 651 424 612 428 577 410 539 392 518 365 L 510 352 487 348 Q 473 340 480 331 L 488 323 523 322 537 318 Q 515 317 492 305 488 303 489 296 L 487 296 487 300 Q 483 310 456 324 L 453 326 463 340 Q 467 350 458 357 482 362 541 389 549 400 544 404 L 532 411 Q 497 430 442 403 L 434 398 429 399 Q 434 407 423 415 L 465 423 Q 520 446 526 479 529 505 510 514 493 523 442 515 393 508 361 492 313 468 317 446 320 436 335 428 L 350 424 329 415 Q 298 399 297 386 296 374 307 368 L 348 366 352 361 313 345 286 327 Q 253 337 206 314 184 303 182 291 L 171 292 166 293 Q 209 311 187 326 L 229 334 Q 284 357 290 390 293 416 274 425 257 434 206 426 L 137 409 103 396 Q 92 401 76 376 59 352 77 343 91 335 110 334 L 93 326 Q 68 313 63 303 L 36 297 Q 37 305 22 313 L 19 315 Q 53 326 29 338 L 0 343 -42 334 -55 326 Q -95 325 -133 307 -144 312 -160 287 -177 263 -159 254 -115 230 -24 261 L -20 263 -23 246 Q -20 235 -10 230 L -23 226 Q -40 218 -27 203 L -13 188 Q 1 181 4 188 L 9 197 18 199 36 203 Q 44 207 42 212 L 44 211 Q 48 202 74 188 95 177 137 188 112 172 108 151 105 130 116 125 L 138 117 Q 129 104 149 83 179 67 233 88 L 244 93 291 92 293 89 Q 335 67 392 96 450 126 412 145 L 385 152 377 161 355 165 348 172 322 179 312 181 Q 347 205 330 225 L 344 225 352 214 374 206 372 203 Q 367 192 376 184 L 385 172 Q 410 159 453 172 L 485 180 M 589 449 L 665 451 Q 707 471 685 483 L 659 488 Q 628 489 603 476 583 467 583 457 L 589 449 M 783 338 L 727 346 Q 687 345 656 329 617 309 608 292 601 277 619 268 664 243 747 279 829 313 783 338 M 731 309 L 733 308 Q 714 298 707 298 L 697 297 702 301 725 309 731 309 M 791 369 Q 831 389 807 402 L 778 407 Q 753 407 728 394 723 392 725 379 726 365 730 364 753 351 791 369 M 768 433 L 751 440 723 437 Q 709 429 716 420 L 724 412 766 413 Q 792 420 768 433 M 262 143 L 269 147 270 145 Q 287 135 309 139 L 294 129 253 126 Q 263 135 262 143 M 213 231 L 227 251 Q 231 261 222 268 L 287 292 293 288 282 276 Q 267 256 271 245 243 244 213 231 M 176 56 L 137 64 Q 102 65 75 51 43 35 48 17 49 6 57 0 99 -22 156 7 214 37 176 56 M 64 85 Q 128 121 76 149 L 39 156 Q 4 156 -34 137 -73 117 -68 97 -67 85 -55 78 L -38 71 -50 64 Q -77 51 -67 35 L -48 19 Q -32 10 8 31 39 50 16 67 39 72 64 85 M 36 222 L 41 223 41 215 38 219 36 222 M 176 154 L 172 154 178 159 181 156 176 154 M 121 279 L 125 280 122 276 121 279 M 45 270 L 46 271 53 271 48 269 45 270 M 146 438 L 221 443 Q 284 455 251 472 L 180 470 139 446 Q 137 442 146 438 M 382 527 L 457 532 Q 520 544 487 561 L 416 559 Q 381 542 375 535 373 531 382 527 M -114 167 Q -95 158 -57 172 -19 186 -42 198 L -65 203 -98 200 -114 187 Q -116 197 -132 205 -148 215 -164 214 -191 214 -232 194 -262 178 -259 157 -256 145 -245 140 -207 119 -149 151 L -152 137 -141 126 Q -114 113 -92 130 -69 146 -92 159 L -113 162 -134 161 -119 175 -114 167 M -191 181 L -190 182 -183 182 -188 180 -191 181 M -232 221 Q -178 235 -207 249 L -236 254 -278 245 Q -311 229 -296 213 L -232 221";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 64 -3 Q 104 19 86 26 L 40 29 Q -2 26 -5 17 L -5 0 3 -14 Q 24 -25 64 -3 M 114 -40 Q 140 -33 118 -22 L 101 -18 83 -16 83 -14 75 -16 Q 52 -28 73 -41 L 114 -40 M 955 370 L 910 362 Q 888 351 896 340 L 904 329 Q 939 311 968 334 998 358 982 366 L 955 370 M 823 294 L 854 323 Q 881 350 870 355 L 832 362 Q 794 362 754 342 711 320 709 301 710 287 721 281 L 719 281 674 273 Q 652 262 660 251 L 668 240 670 240 Q 653 229 671 215 L 697 216 739 242 Q 743 248 739 251 760 270 746 277 L 745 278 766 279 Q 802 282 824 292 L 823 294 M 870 380 L 889 381 Q 896 387 886 393 877 398 860 393 856 386 870 380 M 828 420 L 809 429 772 421 Q 759 415 763 405 L 771 398 Q 796 384 819 398 841 413 828 420 M 612 229 L 618 234 635 254 650 259 Q 661 266 652 271 638 279 622 271 L 621 271 596 273 Q 558 273 518 253 489 238 479 225 L 452 219 451 219 434 219 403 213 Q 386 204 398 196 391 190 391 184 L 386 182 Q 375 177 382 172 L 386 168 Q 399 162 411 168 445 155 480 183 L 489 191 526 190 Q 524 184 531 181 547 172 577 187 637 215 616 226 L 612 229 M 434 102 L 417 103 408 102 Q 396 96 409 89 L 429 91 Q 439 98 434 102 M 502 162 Q 482 174 436 152 418 142 432 130 L 430 124 Q 428 119 436 115 474 95 526 120 581 146 558 157 L 520 162 503 162 502 162 M 591 167 Q 607 175 597 181 L 571 178 563 169 566 164 Q 576 158 591 167 M 527 324 L 504 307 485 302 462 300 Q 440 288 457 285 L 465 282 481 287 486 283 515 282 Q 555 264 608 290 L 624 299 629 294 Q 627 288 638 282 L 663 280 686 293 Q 700 301 688 307 L 670 308 648 305 635 306 Q 657 324 636 335 L 590 341 575 340 573 340 536 332 527 324 M 564 366 Q 557 362 560 358 561 355 565 354 578 348 593 354 607 360 595 366 581 375 564 366 M 461 268 Q 464 271 459 273 L 450 275 438 272 437 271 435 271 Q 402 272 380 261 L 367 253 354 252 348 252 Q 393 274 402 291 L 405 295 457 315 490 335 521 350 Q 572 385 542 401 L 501 407 476 404 474 405 454 409 432 408 Q 414 398 413 387 L 419 378 420 378 406 362 388 356 Q 395 369 372 381 L 369 394 405 395 Q 427 405 408 417 L 389 421 362 417 349 407 305 410 250 397 243 405 240 407 Q 252 419 242 424 L 228 427 Q 267 449 252 462 275 478 260 490 272 486 290 495 L 291 485 320 489 Q 339 497 327 503 L 301 505 Q 305 510 296 514 L 281 517 263 511 Q 249 504 250 497 L 253 495 213 507 Q 175 509 134 488 95 469 101 448 L 114 433 128 428 Q 123 416 124 410 L 121 408 Q 107 401 119 395 L 150 398 155 400 187 409 191 406 194 408 Q 192 402 200 398 L 204 397 193 389 Q 189 386 198 381 L 218 380 Q 203 370 201 359 L 173 361 147 358 Q 154 370 138 378 L 109 384 104 387 94 390 70 383 53 369 31 350 29 344 10 350 Q 30 366 11 377 L 14 378 Q 30 383 21 388 L 10 391 -4 386 -7 385 Q -35 392 -65 377 -97 361 -108 339 -117 318 -106 313 L -67 314 -71 307 Q -81 280 -73 275 L -64 272 Q -97 271 -124 256 -162 238 -165 220 -169 209 -156 202 -113 179 -46 213 -37 217 -30 222 L -21 216 Q 14 198 65 223 L 84 234 118 245 121 246 118 243 127 235 Q 146 225 177 235 191 240 194 245 L 217 241 Q 220 237 226 235 244 224 259 224 L 275 225 Q 263 216 264 208 L 265 204 241 194 219 181 199 182 165 179 162 181 146 183 159 193 163 193 196 199 Q 209 206 209 214 L 205 221 182 224 167 220 163 222 95 225 Q 49 218 15 202 -26 181 -24 161 -23 151 -10 146 8 135 23 135 54 133 105 159 L 113 163 121 154 Q 112 140 136 127 150 119 199 141 200 136 204 134 L 223 132 216 130 181 119 Q 154 107 155 94 157 88 165 83 L 232 86 239 75 259 72 222 61 Q 194 47 194 35 192 30 200 26 238 6 290 31 307 39 316 46 L 350 49 Q 376 56 354 67 L 337 71 319 73 319 75 311 73 309 72 284 73 263 72 Q 279 74 300 86 L 305 89 Q 319 87 341 98 L 383 124 396 130 Q 425 144 410 151 L 391 160 Q 378 161 357 150 342 142 341 135 L 302 121 301 119 276 118 267 117 Q 273 128 265 134 L 322 142 Q 354 150 359 175 L 362 196 372 201 398 217 438 231 Q 491 253 467 266 L 461 268 M 472 492 Q 489 507 478 513 L 449 512 Q 419 497 436 487 453 480 472 492 M 436 439 Q 438 425 454 418 490 399 563 434 636 469 592 492 L 541 499 Q 507 497 469 478 432 459 436 439 M 596 384 Q 623 371 693 404 761 437 726 455 L 681 459 Q 644 455 612 440 563 417 574 397 L 596 384 M 672 352 L 693 354 Q 702 359 695 362 L 686 364 674 361 668 354 672 352 M 696 471 Q 716 483 712 489 L 710 494 690 498 668 497 Q 650 487 649 476 L 655 467 696 471 M 720 390 Q 710 386 714 377 L 722 372 754 373 Q 768 383 752 392 L 720 390 M 327 80 L 330 75 355 78 365 88 382 94 Q 403 105 392 109 L 378 113 371 111 Q 349 101 351 94 L 335 89 Q 325 84 327 80 M 226 211 Q 204 199 221 196 228 193 229 193 L 246 198 Q 260 205 250 212 L 226 211 M 173 0 L 193 2 Q 203 9 198 13 L 181 14 172 13 Q 160 7 173 0 M 135 22 Q 113 12 115 5 L 117 -1 Q 127 -5 146 5 167 16 156 20 L 142 24 135 22 M 105 42 L 114 32 Q 130 25 160 41 189 55 174 62 L 155 71 Q 142 72 121 61 102 51 105 42 M 121 112 L 79 121 Q 41 123 5 105 -33 86 -37 64 -41 49 -32 45 L 23 44 86 53 Q 118 61 123 86 131 108 121 112 M 134 175 L 144 181 142 178 140 176 134 175 M 169 263 L 147 261 Q 161 273 147 286 L 190 302 Q 217 315 226 326 L 264 324 Q 294 312 343 330 336 322 336 315 L 331 314 310 310 306 312 265 318 Q 230 315 206 303 L 194 296 187 295 180 286 Q 169 276 168 267 L 169 263 M 73 297 L 68 294 35 276 -12 261 -14 260 -23 266 -38 271 Q -13 273 23 287 68 305 57 324 L 79 323 Q 72 316 71 309 68 302 73 297 M 60 425 L 45 428 27 422 Q 13 415 14 408 L 20 403 Q 33 395 55 407 74 419 60 425 M 194 408 L 194 412 198 413 194 408 M 268 440 L 267 439 Q 259 426 272 420 308 400 355 426 L 367 433 369 434 Q 415 456 391 470 L 352 479 Q 315 480 281 462 257 450 268 440 M 386 487 Q 409 495 398 500 L 381 502 357 497 Q 343 490 355 484 L 386 487 M 350 522 Q 382 505 455 534 525 564 490 583 472 593 449 596 411 598 370 577 331 558 337 537 L 350 522 M 563 592 Q 556 596 525 592 L 527 574 556 578 Q 575 586 563 592 M 605 523 Q 651 545 627 559 L 588 568 Q 551 569 517 551 493 539 504 529 L 520 521 605 523 M 422 498 L 427 495 430 497 429 503 423 502 422 498 M -40 110 Q -27 117 -27 125 L -31 132 -54 135 -89 122 Q -112 111 -101 105 L -73 104 -40 110 M -94 89 L -96 87 -124 85 Q -134 81 -111 61 -95 52 -73 67 -51 79 -74 92 L -91 93 -94 89 M -118 109 Q -95 114 -120 128 L -132 132 -154 127 Q -168 120 -161 115 -140 104 -118 109 M -150 177 Q -190 200 -248 172 -279 156 -272 140 L -257 127 Q -222 109 -171 134 -117 161 -150 177 M -109 146 Q -90 136 -59 146 -29 157 -49 167 L -94 170 -118 154 -109 146 M -49 206 Q -59 201 -56 187 8 184 -29 203 L -49 206 M -373 222 L -358 221 Q -355 224 -362 235 L -368 235 -371 235 Q -386 227 -373 222 M -309 186 Q -281 172 -213 198 -147 224 -202 252 L -226 261 -275 255 Q -294 245 -307 218 -317 191 -309 186 M -240 297 Q -260 288 -247 286 L -222 289 Q -206 294 -215 299 L -226 302 -240 297 M -132 298 L -142 301 -166 294 Q -194 281 -177 272 -168 266 -143 278 -116 288 -132 298 M -137 311 L -122 310 Q -119 313 -126 324 L -132 324 -135 324 Q -150 316 -137 311";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 528 71 L 521 78 505 83 Q 494 83 493 74 L 481 68 475 61 Q 475 34 528 71 M 617 158 L 611 156 607 139 610 132 518 118 Q 475 109 475 95 L 475 87 548 98 614 120 Q 636 119 636 127 636 130 626 131 617 136 617 158 M 667 151 L 668 154 673 156 677 155 676 152 666 150 667 151 M 924 309 L 926 298 Q 923 287 902 287 899 287 897 290 L 893 292 841 284 Q 819 277 819 270 L 820 265 816 266 760 262 Q 753 260 753 255 L 758 248 Q 739 239 739 225 L 743 201 725 200 Q 655 200 655 189 L 667 174 672 171 657 162 Q 643 152 643 145 643 122 668 131 694 140 694 152 696 172 680 172 L 679 172 680 177 680 180 748 187 Q 760 189 760 195 L 756 217 Q 756 234 777 236 815 239 854 269 L 901 270 919 267 Q 919 264 925 264 L 931 273 934 287 Q 934 305 927 311 L 924 309 M 239 -24 L 240 -29 281 -27 Q 298 -22 298 -16 L 274 0 302 3 350 4 Q 366 22 453 66 L 450 71 439 74 436 68 392 61 369 55 Q 362 52 362 47 365 38 373 39 L 369 38 341 29 266 23 Q 258 21 258 10 258 -3 265 -2 L 265 -3 268 -4 270 -9 267 -13 249 -15 239 -24 M 104 -22 L 120 -34 118 -35 106 -39 91 -44 Q 106 -51 144 -44 183 -36 183 -22 183 -15 176 -15 L 184 -14 236 -10 Q 259 -6 259 -1 L 258 2 Q 250 10 226 10 196 10 154 -4 142 -6 128 -21 L 112 -15 Q 104 -15 104 -22";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite439(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape435",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape436",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape437",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape438",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj445=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/445.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj445,"assets/takeover/art/images/445.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj445.src="assets/takeover/art/images/445.png";
function image445(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1180 720 1180 720 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0277777777777777,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj445);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape446(ctx,ctrans,frame,ratio,time){
	var pathData="M 320 405 L -400 405 -400 -775 320 -775 320 405";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-400,-775);
	ctx.transform(1.0277777777777777,0,0,1.0169491525423728,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj445);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj447=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/447.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj447,"assets/takeover/art/images/447.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj447.src="assets/takeover/art/images/447.png";
function image447(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 520 520 520 520 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0384615384615385,0,0,1.0384615384615385,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj447);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape448(ctx,ctrans,frame,ratio,time){
	var pathData="M -245 -295 L 275 -295 275 225 -245 225 -245 -295";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-245,-295);
	ctx.transform(1.0384615384615385,0,0,1.0384615384615385,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj447);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj449=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/449.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj449,"assets/takeover/art/images/449.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj449.src="assets/takeover/art/images/449.png";
function image449(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 820 640 820 640 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.03125,0,0,1.024390243902439,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj449);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape450(ctx,ctrans,frame,ratio,time){
	var pathData="M -335 -575 L 305 -575 305 245 -335 245 -335 -575";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-335,-575);
	ctx.transform(1.03125,0,0,1.024390243902439,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj449);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj451=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/451.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj451,"assets/takeover/art/images/451.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj451.src="assets/takeover/art/images/451.png";
function image451(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 980 660 980 660 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0303030303030303,0,0,1.0204081632653061,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj451);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape452(ctx,ctrans,frame,ratio,time){
	var pathData="M -385 -735 L 275 -735 275 245 -385 245 -385 -735";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-385,-735);
	ctx.transform(1.0303030303030303,0,0,1.0204081632653061,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj451);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite453(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape446",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape448",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape450",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape452",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj454=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/454.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj454,"assets/takeover/art/images/454.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj454.src="assets/takeover/art/images/454.png";
function image454(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 720 700 720 700 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0285714285714285,0,0,1.0277777777777777,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj454);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape455(ctx,ctrans,frame,ratio,time){
	var pathData="M -350 -372 L 350 -372 350 348 -350 348 -350 -372";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-350,-372);
	ctx.transform(1.0285714285714285,0,0,1.0277777777777777,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj454);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj456=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/456.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj456,"assets/takeover/art/images/456.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj456.src="assets/takeover/art/images/456.png";
function image456(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 900 640 900 640 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.03125,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj456);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape457(ctx,ctrans,frame,ratio,time){
	var pathData="M -340 -600 L 300 -600 300 300 -340 300 -340 -600";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-340,-600);
	ctx.transform(1.03125,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj456);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj458=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/458.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj458,"assets/takeover/art/images/458.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj458.src="assets/takeover/art/images/458.png";
function image458(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 900 640 900 640 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.03125,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj458);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape459(ctx,ctrans,frame,ratio,time){
	var pathData="M -330 -640 L 310 -640 310 260 -330 260 -330 -640";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-330,-640);
	ctx.transform(1.03125,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj458);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj460=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/460.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj460,"assets/takeover/art/images/460.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj460.src="assets/takeover/art/images/460.png";
function image460(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 880 620 880 620 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.032258064516129,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj460);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape461(ctx,ctrans,frame,ratio,time){
	var pathData="M -350 -640 L 270 -640 270 240 -350 240 -350 -640";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-350,-640);
	ctx.transform(1.032258064516129,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj460);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite462(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape455",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape457",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape459",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape461",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj464=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/464.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj464,"assets/takeover/art/images/464.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj464.src="assets/takeover/art/images/464.png";
function image464(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2240 3000 2240 3000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0066666666666666,0,0,1.0089285714285714,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj464);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape465(ctx,ctrans,frame,ratio,time){
	var pathData="M -1482 -1577 L 1518 -1577 1518 663 -1482 663 -1482 -1577";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1482,-1577);
	ctx.transform(1.0066666666666666,0,0,1.0089285714285714,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj464);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj466=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/466.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj466,"assets/takeover/art/images/466.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj466.src="assets/takeover/art/images/466.png";
function image466(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2460 3000 2460 3000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0066666666666666,0,0,1.008130081300813,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj466);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape467(ctx,ctrans,frame,ratio,time){
	var pathData="M -1464 -1807 L 1536 -1807 1536 653 -1464 653 -1464 -1807";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1464,-1807);
	ctx.transform(1.0066666666666666,0,0,1.008130081300813,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj466);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj468=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/468.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj468,"assets/takeover/art/images/468.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj468.src="assets/takeover/art/images/468.png";
function image468(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2480 3080 2480 3080 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0064935064935066,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj468);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape469(ctx,ctrans,frame,ratio,time){
	var pathData="M -1549 -1847 L 1531 -1847 1531 633 -1549 633 -1549 -1847";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1549,-1847);
	ctx.transform(1.0064935064935066,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj468);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj470=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/470.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj470,"assets/takeover/art/images/470.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj470.src="assets/takeover/art/images/470.png";
function image470(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2480 2980 2480 2980 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0067114093959733,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj470);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape471(ctx,ctrans,frame,ratio,time){
	var pathData="M -1489 -1847 L 1491 -1847 1491 633 -1489 633 -1489 -1847";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1489,-1847);
	ctx.transform(1.0067114093959733,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj470);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite472(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape465",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape467",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape469",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape471",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj473=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/473.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj473,"assets/takeover/art/images/473.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj473.src="assets/takeover/art/images/473.png";
function image473(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2240 3000 2240 3000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0066666666666666,0,0,1.0089285714285714,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj473);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape474(ctx,ctrans,frame,ratio,time){
	var pathData="M -1550 -1621 L 1450 -1621 1450 619 -1550 619 -1550 -1621";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1550,-1621);
	ctx.transform(1.0066666666666666,0,0,1.0089285714285714,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj473);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj475=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/475.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj475,"assets/takeover/art/images/475.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj475.src="assets/takeover/art/images/475.png";
function image475(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2460 3000 2460 3000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0066666666666666,0,0,1.008130081300813,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj475);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape476(ctx,ctrans,frame,ratio,time){
	var pathData="M -1526 -1840 L 1474 -1840 1474 620 -1526 620 -1526 -1840";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1526,-1840);
	ctx.transform(1.0066666666666666,0,0,1.008130081300813,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj475);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj477=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/477.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj477,"assets/takeover/art/images/477.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj477.src="assets/takeover/art/images/477.png";
function image477(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2420 3000 2420 3000 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0066666666666666,0,0,1.0082644628099173,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj477);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape478(ctx,ctrans,frame,ratio,time){
	var pathData="M -1536 -1828 L 1464 -1828 1464 592 -1536 592 -1536 -1828";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1536,-1828);
	ctx.transform(1.0066666666666666,0,0,1.0082644628099173,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj477);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj479=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/479.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj479,"assets/takeover/art/images/479.png","assets/takeover/packs/map-7.pack?v=af5cb7da1a95e99e");else imageObj479.src="assets/takeover/art/images/479.png";
function image479(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 2480 2980 2480 2980 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0067114093959733,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj479);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape480(ctx,ctrans,frame,ratio,time){
	var pathData="M -1517 -1854 L 1463 -1854 1463 626 -1517 626 -1517 -1854";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-1517,-1854);
	ctx.transform(1.0067114093959733,0,0,1.0080645161290323,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj479);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite481(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape474",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape476",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape478",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape480",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape486(ctx,ctrans,frame,ratio,time){
	var pathData="M 285 -8 L 330 -10 Q 348 -7 348 9 348 22 330 32 309 43 275 43 241 43 227 30 L 220 16 Q 220 2 252 -5 L 285 -8 M 559 -42 L 570 -42 572 -40 573 -31 578 -12 Q 578 0 537 23 493 48 462 48 418 48 404 32 L 404 30 395 27 401 21 400 15 Q 400 -9 489 -36 L 559 -42 M 589 399 L 527 435 Q 428 488 380 488 L 360 485 360 465 310 459 289 455 Q 285 455 274 465 L 260 478 215 480 204 501 Q 193 518 175 518 L 157 517 160 520 150 525 43 445 40 445 33 438 Q -48 380 -48 364 L -39 355 -3 335 0 333 -37 315 -55 298 Q -55 287 -39 282 L 0 270 45 270 93 286 Q 124 302 113 335 L 134 338 Q 183 338 285 255 267 244 233 243 L 140 243 Q 121 243 108 221 L 100 198 Q 100 164 188 125 282 84 375 90 L 410 90 Q 433 109 437 135 L 437 180 438 182 449 183 Q 475 183 488 167 L 503 143 Q 490 136 490 123 490 112 540 77 594 40 620 40 643 40 646 54 650 68 666 68 L 685 62 703 52 680 37 Q 687 16 714 -8 740 -31 762 -37 L 766 -35 767 -28 757 -12 Q 770 14 822 57 855 77 916 99 948 110 948 129 L 924 180 887 245 Q 828 244 815 253 L 790 262 Q 698 262 679 243 L 672 229 Q 668 223 658 223 655 223 593 260 530 298 507 315 L 579 342 596 349 Q 577 370 577 383 577 393 587 398 L 589 399 M 92 115 L 55 137 15 135 Q 12 141 12 128 12 105 42 101 72 98 92 115 M 43 230 L 25 248 -5 251 -18 253 -27 252 -27 250 Q -30 258 -30 245 -30 205 40 223 L 43 230 M -92 202 Q -92 210 -100 216 L -126 230 -163 230 -187 221 -188 211 Q -188 170 -140 172 -92 175 -92 202";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 596 349 L 602 342 Q 627 315 627 350 627 377 612 405 L 605 407 589 399 587 398 Q 577 393 577 383 577 370 596 349";
	ctx.fillStyle=tocolor(ctrans.apply([133,105,88,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 880 201 Q 880 185 904 158 L 928 132 Q 928 104 898 97 847 84 805 45 833 60 914 86 948 98 948 130 948 142 935 155 L 935 161 925 399 937 718 937 729 927 867 925 888 917 986 917 992 Q 820 1010 753 1049 659 1103 670 1175 589 1175 559 1215 L 511 1277 Q 407 1287 204 1400 L 125 1446 89 1436 Q 69 1406 37 1380 8 1321 -34 1296 L -35 1290 Q -45 1230 -45 1060 L -35 944 -39 888 -45 773 -41 718 -35 652 -60 396 Q -60 378 -48 380 L 5 400 Q 31 415 40 431 43 436 49 438 L 62 435 108 443 108 439 Q 108 427 93 412 78 398 78 391 L 80 375 87 375 Q 91 387 106 409 L 120 434 119 449 129 458 Q 137 468 146 506 L 151 510 183 508 202 481 Q 216 465 283 463 L 308 454 Q 294 448 277 445 240 438 240 416 240 413 251 405 L 267 390 Q 256 373 221 348 L 177 320 177 318 244 348 Q 282 367 282 389 282 398 263 415 271 424 312 430 334 433 346 445 L 370 445 Q 378 453 378 470 L 378 475 Q 454 454 522 415 L 620 360 622 360 548 338 521 327 495 333 Q 447 333 442 310 438 295 404 290 L 385 300 357 287 311 279 252 262 341 272 354 231 367 179 366 170 365 170 315 173 284 175 Q 317 159 330 157 L 375 150 390 169 398 191 393 213 388 234 390 248 408 263 422 260 Q 448 260 453 287 L 454 290 470 300 Q 495 300 618 229 L 610 222 610 214 Q 610 205 630 199 L 639 197 637 192 660 188 661 191 665 190 Q 642 179 619 153 L 560 98 Q 596 97 638 136 L 695 195 Q 692 204 672 211 L 662 215 662 216 665 215 Q 687 215 695 233 702 250 733 250 L 795 238 883 228 Q 880 220 880 201";
	ctx.fillStyle=tocolor(ctrans.apply([122,98,82,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 295 455 L 302 463 299 468 295 455";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 910 247 L 913 247 912 230 910 232 910 247 M 910 170 Q 935 164 935 184 L 930 204 925 223 937 554 928 718 926 767 921 888 917 992 888 998 886 955 887 999 852 1008 849 920 848 888 844 718 840 582 846 535 852 491 840 248 845 248 Q 860 267 867 303 L 865 271 Q 865 238 873 228 L 910 170 M 591 351 L 602 338 Q 615 396 613 445 L 608 536 625 1014 621 1180 Q 601 1184 586 1192 L 570 1085 542 888 542 887 535 718 532 682 Q 524 596 505 540 L 503 537 Q 498 550 498 563 L 490 568 Q 476 560 476 529 476 504 440 500 L 432 490 Q 454 479 502 437 L 518 422 Q 568 377 583 380 582 372 588 357 L 591 351 M 299 468 Q 328 571 331 629 L 332 718 330 794 339 888 393 1295 393 1309 336 1333 291 989 280 888 268 718 262 620 257 613 Q 257 625 250 630 238 618 228 560 L 227 568 222 575 205 575 201 547 Q 199 530 175 522 179 506 192 493 214 470 255 470 273 470 281 478 L 290 490 293 470 295 455 299 468 M 73 447 L 95 468 82 468 99 671 103 718 111 888 115 955 115 1252 120 1300 118 1335 110 1344 Q 89 1264 84 1128 L 73 904 72 888 59 718 Q 42 567 42 520 42 466 45 455 L 51 445 73 447 M 267 520 L 258 508 257 503 247 504 235 507 Q 235 513 247 513 L 255 532 258 542 258 537 Q 259 528 280 525 L 275 500 273 500 267 520 M 363 1207 L 365 1200 355 1135 352 1138 362 1204 363 1207";
	ctx.fillStyle=tocolor(ctrans.apply([133,105,88,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 869 164 L 913 115 Q 909 99 859 76 796 46 787 40 L 787 38 Q 814 38 869 63 930 90 930 111 930 124 862 238 L 775 228 857 220 Q 843 200 869 164 M 677 188 Q 640 223 584 256 525 289 495 290 L 492 288 Q 521 273 574 236 L 650 185 Q 590 125 578 103 592 101 624 131 L 677 188 M 591 351 L 588 357 Q 582 372 583 380 568 377 518 422 L 502 437 Q 433 478 397 478 388 478 382 472 413 449 475 414 L 565 360 Q 546 329 523 333 L 502 343 429 334 400 318 465 317 555 315 Q 578 329 591 351 M 347 183 L 308 180 Q 349 164 359 170 L 362 190 355 235 Q 346 272 337 272 L 308 268 293 255 293 250 Q 306 246 320 255 336 246 340 223 L 347 183 M 293 470 Q 269 465 245 451 215 433 215 416 L 230 390 212 368 197 345 200 338 Q 225 350 248 392 248 402 233 413 L 269 437 295 455 293 470 M 51 445 L 43 442 Q 41 425 20 409 L -15 385 Q -12 377 0 377 20 377 39 399 L 62 430 77 420 62 390 45 368 Q 81 365 92 417 L 87 435 Q 82 445 73 447 L 51 445";
	ctx.fillStyle=tocolor(ctrans.apply([206,167,142,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite487(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape486",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape488(ctx,ctrans,frame,ratio,time){
	var pathData="M 73 -201 L 96 -204 96 -201 73 -201";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 13 -84 Q 21 -80 21 -69 21 -63 26 -59 L 36 -50 35 -40 18 -39 -4 -42 Q -10 -69 -23 -89 L 13 -84 M 275 -19 L 273 -15 244 -22 Q 223 -28 211 -37 208 -29 208 -42 208 -61 242 -60 276 -60 276 -40 L 274 -31 Q 273 -24 275 -19 M 461 -134 Q 478 -160 546 -156 613 -153 613 -130 613 -117 588 -108 L 535 -102 482 -109 Q 471 -112 463 -127 L 461 -134 M 460 -32 Q 459 -27 453 -28 428 -30 406 -40 L 358 -63 486 -83 Q 546 -91 573 -69 L 564 -58 579 -61 603 -52 628 -44 Q 665 -41 689 -56 707 -67 712 -86 737 -54 783 -20 L 903 69 921 147 849 226 Q 674 390 480 366 L 155 341 -15 304 -15 231 Q -20 195 -13 133 L -1 30 0 -2 103 4 110 7 113 16 108 20 103 24 116 62 Q 116 86 5 91 24 108 43 110 52 110 78 133 104 155 148 159 253 166 265 121 L 266 110 238 105 223 97 228 68 Q 228 37 267 24 313 8 363 50 357 60 333 59 339 70 341 88 L 345 89 Q 383 92 401 77 L 435 44 Q 448 61 485 64 528 68 548 49 L 556 40 Q 536 37 525 24 518 16 518 10 518 4 525 -1 L 545 -13 539 -25 466 -37 460 -32 M 563 14 L 560 -2 543 14 563 15 563 14 M 103 104 Q 127 86 151 78 L 198 79 200 82 170 98 Q 186 99 190 104 L 191 115 Q 191 123 196 124 L 203 127 194 139 160 139 Q 120 136 108 120 L 103 104";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 138 207 Q 116 215 45 208 8 205 -16 218 L -17 200 -2 198 Q 101 186 150 167 L 135 157 148 159 184 160 193 165 Q 171 197 138 207 M -8 94 L -7 81 Q 8 96 22 103 L -8 94";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 534 -47 L 542 -50 562 -58 565 -39 636 -36 Q 655 -48 680 -45 L 738 -37 754 -42 755 -42 783 -20 903 68 925 179 925 340 915 508 910 605 905 790 909 854 891 888 887 916 Q 883 951 885 990 880 1017 812 1009 643 987 628 1041 614 1091 492 1076 476 1074 445 1104 424 1126 396 1089 L 293 1074 Q 279 1101 265 1158 246 1204 193 1222 L 153 1217 94 1126 Q 64 1081 28 1057 23 1054 1 1046 L -15 1014 -15 231 -16 223 13 225 20 227 23 236 -7 264 Q -1 274 0 287 L 136 307 178 309 Q 255 290 312 287 L 331 273 Q 345 262 353 262 L 362 274 Q 365 281 387 286 L 493 285 515 277 Q 525 274 525 270 472 270 457 232 451 221 451 194 443 182 442 156 L 445 111 Q 445 96 405 93 364 113 340 112 L 330 109 328 107 328 84 Q 336 85 345 89 L 346 89 Q 383 92 401 77 L 407 72 423 73 463 81 493 103 495 108 470 129 Q 463 135 463 146 L 464 153 Q 472 147 485 147 L 515 156 560 165 664 179 755 155 Q 840 127 896 100 868 87 868 70 L 838 42 Q 819 21 818 10 790 -9 778 -12 L 743 -15 677 -31 Q 659 -32 652 -23 L 553 -20 Q 542 -21 534 -47";
	ctx.fillStyle=tocolor(ctrans.apply([108,85,70,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 738 -57 L 742 -54 691 -57 693 -58 738 -57";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 893 95 L 900 85 906 272 901 577 901 605 903 832 899 916 Q 890 1036 863 1032 L 848 1022 843 1009 836 1029 818 1032 805 1020 791 1010 Q 784 1010 782 1017 L 778 1027 Q 763 1019 763 965 L 766 916 Q 769 872 778 807 L 793 693 Q 793 664 779 607 L 779 605 Q 764 569 763 553 L 758 448 763 343 Q 763 324 737 311 L 705 292 Q 698 280 698 242 698 196 715 180 L 733 172 760 168 Q 842 160 893 95 M 497 281 L 511 285 513 280 527 280 528 288 521 299 518 301 524 443 526 605 526 615 529 724 526 881 526 896 526 903 526 914 526 916 Q 528 958 539 1020 540 1051 530 1074 L 530 1153 Q 533 1160 520 1158 L 508 1155 515 1104 503 1118 Q 486 1131 483 1153 486 1158 474 1158 463 1157 456 1125 450 1098 450 1066 406 1042 398 972 L 395 916 Q 392 877 385 857 371 869 363 909 L 362 916 350 973 337 916 Q 326 861 317 787 L 295 605 293 599 288 605 278 610 278 605 Q 250 480 198 360 L 178 375 Q 166 374 156 352 L 146 338 141 347 138 350 Q 130 340 130 321 130 296 241 278 L 399 272 474 282 488 279 497 281 M 514 392 L 520 525 520 545 524 482 Q 524 431 514 392";
	ctx.fillStyle=tocolor(ctrans.apply([122,98,82,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 733 172 L 692 172 Q 668 171 656 183 645 195 628 194 L 577 184 Q 558 175 538 174 L 513 168 506 158 505 154 558 153 Q 575 154 583 164 592 173 605 174 L 657 169 Q 677 156 723 153 L 843 127 833 115 Q 849 97 868 93 818 28 786 23 706 10 655 -13 L 658 -15 Q 759 -21 834 30 891 68 893 95 842 160 760 168 L 733 172 M 399 272 L 468 266 Q 445 240 444 234 L 448 214 Q 448 188 439 174 426 152 418 121 L 418 117 358 115 343 99 347 92 349 89 352 89 355 96 375 103 402 100 428 97 451 100 454 103 456 112 450 118 436 126 Q 463 204 463 234 L 482 251 503 269 506 276 497 281 488 279 474 282 399 272 M 33 159 L 55 174 127 155 148 159 156 159 135 178 Q 104 200 60 196 54 196 49 190 L 38 185 Q 30 184 -17 204 L -16 176 Q 20 158 33 159 M 6 93 Q 25 109 43 110 52 110 78 133 39 118 3 112 L -10 107 -9 98 6 93";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite489(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape488",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape492(ctx,ctrans,frame,ratio,time){
	var pathData="M -298 452 L -296 448 -289 459 -293 456 -298 452";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 226 18 Q 191 30 167 50 L 160 47 Q 173 9 191 -9 222 -41 261 0 257 7 226 18 M 47 55 Q 58 43 77 44 96 44 110 60 L 75 90 47 55 M 44 222 L 42 206 46 188 51 169 Q 50 161 52 160 L 60 160 140 158 Q 161 171 161 181 162 218 123 235 L 68 235 44 222 M -31 110 Q -16 121 -12 130 L -3 140 -22 163 Q -28 173 -42 173 L -45 173 -59 175 Q -91 175 -98 161 L -105 167 -115 173 -99 157 -100 153 -99 134 Q -95 117 -76 110 L -31 110 M -107 245 Q -127 262 -138 289 L -143 286 -149 270 Q -131 254 -115 247 L -107 245";
	ctx.fillStyle=tocolor(ctrans.apply([191,142,106,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 588 -6 Q 601 -2 601 22 602 40 583 66 L 563 91 Q 566 164 606 188 647 213 648 243 649 295 588 353 L 474 462 425 519 Q 386 550 327 555 233 562 170 579 L 165 574 Q 118 520 31 491 20 487 -53 407 L -55 386 Q -55 354 -37 335 L -33 335 Q -22 335 0 318 20 301 64 300 126 299 151 276 L 154 274 Q 172 262 195 239 236 196 236 178 L 231 150 325 145 238 121 Q 224 114 223 90 223 76 234 65 247 50 274 50 L 309 56 344 62 396 55 397 35 332 35 321 25 316 16 Q 316 6 341 0 L 455 -21 588 -6";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 1880 -144 L 1872 -129 1870 -130 1879 -146 1880 -144 M 64 314 L 66 317 62 315 64 314 M 8 672 L 7 672 -1 650 8 672";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 499 -10 Q 575 -20 612 1 L 631 19 631 12 636 12 Q 646 96 648 196 L 649 249 Q 658 243 663 243 L 665 260 627 459 Q 586 661 579 738 L 572 745 555 882 Q 543 882 529 896 L 527 899 525 907 Q 508 929 505 959 L 500 967 Q 465 960 437 974 411 993 392 1014 L 385 1024 Q 327 985 252 987 216 1009 192 1039 L 190 1049 Q 100 1102 92 1202 91 1217 97 1227 L 95 1230 85 1199 Q 65 1139 65 1085 L 75 1010 85 935 Q 85 888 65 710 L 45 548 Q 45 448 109 499 L 150 538 175 533 188 495 Q 198 469 217 451 L 212 445 Q 177 410 174 385 L 166 391 Q 160 395 152 395 133 395 100 378 61 359 55 337 40 336 21 346 L -9 355 -48 352 -37 335 -33 335 -13 327 -2 326 Q 24 324 72 325 113 373 146 373 L 169 363 Q 184 353 188 353 L 199 355 197 390 Q 198 434 311 467 L 404 467 Q 406 458 423 426 L 424 370 433 370 434 406 437 400 450 383 450 382 Q 447 386 446 374 446 360 460 348 L 431 350 Q 413 350 405 329 L 400 305 380 305 360 307 320 307 314 290 388 293 Q 418 294 430 328 L 452 327 480 325 502 325 Q 532 315 561 315 L 584 303 589 296 614 258 Q 605 224 527 195 L 512 202 503 202 501 203 487 212 472 198 Q 444 190 436 170 L 431 160 420 158 402 159 394 145 392 142 426 146 414 118 302 117 Q 300 117 290 124 L 275 130 Q 252 130 211 98 L 240 108 271 117 295 110 369 103 416 105 Q 443 122 456 157 L 462 160 484 174 503 177 507 174 523 168 Q 533 168 550 178 L 546 165 Q 545 162 551 150 559 135 565 130 L 548 109 545 104 535 94 513 70 474 73 448 75 443 69 435 63 451 65 465 60 472 52 519 53 544 85 567 59 601 20 Q 587 12 544 6 L 499 -3 499 -10 M 627 221 Q 627 201 586 194 L 570 190 594 208 625 236 627 221 M 635 328 L 639 302 633 328 635 328";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 8 672 L 7 672 -1 650 8 672";
	ctx.fillStyle=tocolor(ctrans.apply([115,115,115,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 434 125 L 376 132 315 135 293 132 279 127 279 120 348 113 431 120 434 125";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 618 42 L 629 38 Q 644 65 647 117 L 649 201 648 214 642 220 627 205 624 203 618 235 Q 600 214 594 165 L 590 83 Q 590 74 596 62 L 599 58 Q 605 47 618 42";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 565 323 L 566 347 612 304 Q 642 275 651 273 L 656 290 Q 657 337 613 601 583 774 558 883 L 555 882 Q 543 882 529 896 L 527 899 525 907 515 923 515 920 Q 510 761 512 680 515 546 533 438 544 441 548 459 L 550 483 545 331 545 325 555 318 565 320 565 323 M 456 368 L 456 365 474 383 477 401 Q 479 480 418 855 L 416 905 413 994 392 1014 385 1024 382 1022 380 1008 380 950 Q 379 918 385 733 L 396 470 398 450 398 442 405 440 408 445 409 456 409 470 409 472 433 416 442 395 444 396 452 400 456 375 456 368 M 618 345 L 622 330 617 333 613 340 618 345 M 184 528 Q 196 571 200 632 189 601 165 574 L 159 567 160 567 169 547 169 545 Q 178 525 183 525 L 184 528";
	ctx.fillStyle=tocolor(ctrans.apply([153,122,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 599 58 L 563 80 553 75 592 30 Q 578 19 531 10 L 529 5 Q 555 -12 589 0 621 11 622 26 L 618 42 Q 605 47 599 58 M 581 120 L 583 119 584 126 Q 585 143 536 183 L 531 180 Q 530 161 555 147 L 554 110 Q 533 108 503 94 L 470 80 470 73 520 77 Q 563 88 564 125 L 570 123 581 120 M 545 331 L 516 324 478 322 457 325 Q 477 307 510 309 L 566 302 593 284 628 260 595 236 Q 566 215 557 215 550 215 534 223 L 517 230 Q 502 230 479 213 L 458 195 461 192 512 215 529 210 547 205 Q 569 205 604 228 L 648 265 Q 627 294 565 323 L 565 320 555 318 545 325 545 331 M 408 445 L 413 440 416 437 398 440 396 433 441 368 Q 438 365 420 360 L 386 355 Q 371 362 371 350 371 342 376 341 L 383 338 Q 375 330 347 321 321 314 311 300 L 314 298 Q 322 308 390 334 451 356 456 368 L 456 375 444 396 442 395 433 416 409 456 408 445 M 169 547 L 143 552 133 544 139 543 154 536 169 525 156 518 201 478 Q 178 427 164 427 157 427 153 432 L 143 437 Q 73 401 70 380 64 341 30 342 L -17 340 -18 338 68 340 111 385 Q 130 402 152 402 184 402 214 470 L 197 494 173 515 188 520 184 528 183 525 Q 178 525 169 545 L 169 547";
	ctx.fillStyle=tocolor(ctrans.apply([215,181,159,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 396 470 L 371 467 369 463 392 453 398 450 396 470";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite493(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape492",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape498(ctx,ctrans,frame,ratio,time){
	var pathData="M 661 171 Q 663 161 685 148 L 765 150 773 150 774 159 775 178 776 194 770 210 745 222 690 222 Q 653 206 661 171 M 797 50 L 763 83 734 54 Q 751 39 770 39 789 38 797 50 M 946 271 L 903 278 Q 892 278 891 251 897 221 925 234 940 241 956 256 L 946 271 M 866 103 L 911 103 Q 928 109 930 125 L 927 144 925 147 939 163 930 157 923 151 Q 914 165 882 165 L 869 163 866 163 Q 852 163 847 153 L 832 131 844 121 Q 848 113 866 103 M 594 -4 Q 640 -43 666 -12 680 5 686 42 L 679 45 Q 659 26 625 14 596 3 594 -4 M 269 -10 L 403 -23 514 -4 Q 538 2 535 12 L 530 21 516 30 451 30 Q 446 46 448 50 L 500 56 535 51 572 45 Q 599 45 609 59 617 69 615 83 610 106 594 113 L 503 136 597 141 Q 590 152 586 168 582 185 617 226 L 652 259 655 261 Q 674 284 736 285 780 286 797 302 816 319 827 319 L 861 317 Q 857 324 855 336 L 852 362 822 437 Q 701 538 698 594 L 698 599 Q 673 592 633 572 566 539 428 530 369 526 336 495 L 297 441 203 336 Q 153 280 163 230 170 201 215 178 259 154 275 84 L 260 60 Q 245 35 249 18 254 -6 269 -10";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 736 299 L 731 301 735 298 736 299";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 242 -3 Q 283 -22 358 -13 L 356 -7 310 2 Q 266 8 249 16 L 277 53 295 78 326 48 373 47 379 54 392 59 409 57 400 63 393 68 368 66 329 64 304 87 291 97 287 102 267 121 277 141 279 155 272 168 Q 292 158 302 158 L 317 164 319 167 340 164 363 150 370 147 Q 389 114 420 98 L 467 96 540 103 562 109 595 101 626 91 Q 580 121 557 121 L 542 116 531 109 419 110 402 137 437 133 434 136 423 149 405 148 394 150 389 160 Q 376 180 346 187 L 330 200 317 191 315 190 306 190 292 184 Q 209 212 194 245 L 211 281 215 288 Q 229 299 237 299 266 299 294 309 L 316 309 344 311 365 312 Q 384 279 414 278 L 488 275 480 292 440 292 420 290 400 290 390 313 Q 379 333 361 333 L 332 331 Q 343 342 341 356 L 336 364 336 365 345 381 347 387 355 352 364 352 355 406 366 446 459 446 Q 579 414 588 372 587 349 592 337 L 603 336 Q 607 336 620 345 L 641 355 Q 674 355 724 309 772 308 798 310 L 809 311 Q 819 319 827 319 L 836 319 851 333 800 337 772 329 738 321 Q 728 341 686 360 651 376 632 376 L 618 373 611 367 Q 604 391 563 424 L 557 430 Q 572 448 578 472 L 584 509 645 522 673 530 Q 699 531 720 542 699 572 698 594 L 698 761 700 945 681 1320 674 1328 629 1328 562 1292 Q 513 1267 472 1267 399 1267 368 1250 L 311 1218 Q 265 943 240 841 220 759 205 624 189 482 175 421 L 161 317 161 312 162 312 161 287 160 310 145 240 148 230 161 236 170 185 Q 191 89 217 8 L 222 8 220 15 242 -3 M 605 570 L 607 569 575 567 575 570 605 570 M 250 180 L 234 183 Q 192 189 187 209 L 187 223 223 196 250 180";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 703 572 L 702 570 697 559 723 537 703 572";
	ctx.fillStyle=tocolor(ctrans.apply([115,115,115,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 286 985 L 275 1009 263 949 275 873 277 913 286 985";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 576 504 L 577 501 Q 582 501 587 521 L 587 523 592 541 617 540 625 541 625 552 587 677 541 803 500 996 Q 491 1018 483 1068 472 1113 444 1135 467 1047 476 962 487 868 500 809 L 529 653 Q 548 562 576 504 M 332 350 L 332 357 330 381 340 377 342 376 347 396 360 451 361 449 364 435 367 424 370 419 376 421 376 429 374 449 338 701 330 754 348 838 Q 420 1171 420 1190 L 417 1210 412 1215 412 1218 395 1220 Q 320 1220 286 985 L 277 913 275 873 262 602 244 502 240 481 Q 235 559 219 650 L 213 688 205 624 Q 189 482 175 421 L 161 317 151 263 155 259 Q 164 260 187 289 L 226 330 231 307 232 304 242 302 251 309 250 315 242 346 245 346 290 564 Q 295 426 305 382 L 312 365 Q 318 357 333 347 L 332 350 M 229 37 Q 241 42 245 53 L 246 54 248 56 249 76 231 155 Q 217 202 195 222 190 213 194 191 L 191 193 173 208 169 202 170 189 186 109 Q 199 59 219 33 L 229 37 M 178 317 L 173 314 175 328 180 323 178 317 M 228 408 L 217 462 218 460 224 438 230 426 228 408 M 665 741 Q 679 678 698 628 L 698 761 Q 697 804 699 838 L 690 864 599 1164 598 1169 588 1169 584 1162 635 924 Q 629 921 630 916 L 632 902 665 741";
	ctx.fillStyle=tocolor(ctrans.apply([117,89,79,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 576 504 L 573 496 589 492 569 471 Q 553 457 556 449 598 383 630 383 652 383 674 367 L 725 323 811 322 810 323 763 325 Q 729 324 716 362 709 382 632 416 626 416 624 412 621 407 614 407 600 407 567 456 L 605 494 591 501 604 512 617 519 625 520 624 524 626 526 618 527 587 523 587 521 Q 582 501 577 501 L 576 504 M 332 350 Q 340 338 404 318 478 293 486 283 L 489 285 Q 478 298 450 305 420 314 410 322 L 417 324 Q 422 325 421 333 418 344 405 337 L 369 342 347 350 381 413 377 419 359 416 362 419 367 424 364 435 347 396 342 376 340 377 332 357 332 350 M 231 307 Q 175 279 158 252 175 235 209 216 249 193 271 193 L 288 198 304 203 Q 354 183 359 182 L 361 184 338 201 Q 311 218 296 218 L 280 211 259 203 Q 250 203 217 223 L 179 247 210 269 234 287 289 294 Q 323 292 339 309 L 301 316 259 319 250 315 251 309 242 302 232 304 231 307 M 229 37 L 228 22 Q 232 7 266 -4 302 -15 325 1 L 322 6 Q 273 15 258 26 L 288 68 277 73 246 54 245 53 Q 241 42 229 37 M 320 70 L 372 66 370 73 336 87 Q 302 101 281 103 L 273 138 Q 295 151 291 170 L 285 173 Q 244 134 248 118 L 250 111 251 112 262 115 268 117 Q 276 81 320 70";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 515 126 L 456 123 398 117 401 112 487 105 553 112 552 119 539 123 515 126 M 376 429 L 382 432 402 442 399 446 374 449 376 429";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite499(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape498",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape500(ctx,ctrans,frame,ratio,time){
	var pathData="M 376 77 Q 362 93 318 93 287 93 243 68 202 45 202 33 202 21 207 14 L 208 5 210 3 221 3 291 9 Q 380 36 380 60 L 379 66 385 72 376 75 376 77 M 737 275 L 740 268 Q 810 250 810 290 810 303 807 295 L 807 297 798 298 785 296 755 293 Q 743 289 737 275 M 560 61 L 553 75 Q 539 88 505 88 471 88 450 77 432 67 432 54 432 38 450 35 L 495 37 528 40 Q 560 47 560 61 M 738 146 Q 768 150 768 173 768 186 765 180 L 725 182 688 160 Q 708 143 738 146 M 819 327 Q 835 332 835 343 L 817 360 780 378 783 380 819 400 828 409 Q 828 425 747 483 L 740 490 737 490 Q 643 554 630 570 L 620 565 623 562 605 563 Q 587 563 576 546 L 565 525 520 523 506 510 Q 495 500 491 500 L 470 504 420 510 420 530 400 533 Q 352 533 253 480 157 428 157 408 157 403 201 387 L 273 360 187 305 Q 125 268 122 268 112 268 108 274 L 101 288 Q 82 307 -10 307 L -35 298 -107 290 -144 225 -168 174 Q -168 155 -136 144 -75 122 -42 102 10 59 23 33 13 23 13 17 L 14 10 18 8 Q 40 14 66 37 93 61 100 82 L 77 97 95 107 114 113 Q 130 113 134 99 137 85 160 85 186 85 240 122 290 157 290 168 290 181 277 188 L 292 212 Q 305 228 331 228 L 342 227 343 225 343 180 Q 347 154 370 135 L 405 135 Q 498 129 592 170 680 209 680 243 L 672 266 Q 659 288 640 288 L 547 288 Q 513 289 495 300 597 383 646 383 L 667 380 Q 656 347 687 331 L 735 315 780 315 819 327 M 872 247 Q 872 220 920 217 968 215 968 256 L 967 266 943 275 906 275 880 261 872 247";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 828 425 Q 840 423 840 441 L 815 697 821 763 825 818 819 933 815 989 825 1105 Q 825 1275 815 1335 L 814 1341 Q 772 1366 743 1425 711 1451 691 1481 L 655 1491 576 1445 Q 373 1332 269 1322 L 221 1260 Q 191 1220 110 1220 121 1148 27 1094 -40 1055 -137 1037 L -137 1031 -145 933 -147 912 -157 774 -145 444 -155 206 -155 200 Q -168 187 -168 175 -168 143 -134 131 L -25 90 Q -67 129 -118 142 -148 149 -148 177 L -124 203 Q -100 230 -100 246 -100 265 -103 273 L -15 283 47 295 Q 78 295 85 278 93 260 115 260 L 118 261 118 260 108 256 Q 88 249 85 240 L 142 181 Q 184 142 220 143 191 165 161 198 138 224 115 235 L 119 236 120 233 143 237 141 242 150 244 Q 170 250 170 259 L 170 267 162 274 Q 285 345 310 345 L 326 335 327 332 Q 332 305 358 305 L 372 308 390 293 392 279 387 258 382 236 390 214 405 195 450 202 Q 463 204 496 220 L 465 218 415 215 414 215 413 224 Q 413 242 426 276 L 439 317 528 307 469 324 423 332 395 345 376 335 Q 342 340 338 355 333 378 285 378 L 259 372 232 383 158 405 160 405 Q 175 411 258 460 326 499 402 520 L 402 515 Q 402 498 410 490 L 434 490 Q 446 478 468 475 509 469 517 460 498 443 498 434 498 412 536 393 L 603 363 603 365 559 393 Q 524 418 513 435 L 529 450 540 461 Q 540 483 503 490 486 493 472 499 L 497 508 Q 564 510 578 526 L 597 553 629 555 634 551 Q 643 513 651 503 L 661 494 660 479 Q 660 474 674 454 L 693 420 700 420 702 436 687 457 Q 672 472 672 484 L 672 488 718 480 731 483 740 476 Q 749 460 775 445 L 828 425";
	ctx.fillStyle=tocolor(ctrans.apply([98,73,64,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 481 513 L 478 508 485 500 481 513";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 418 235 Q 418 218 421 215 431 209 472 225 L 433 228 440 268 Q 444 291 460 300 474 291 487 295 L 487 300 472 313 443 317 Q 434 317 425 280 418 249 418 235";
	ctx.fillStyle=tocolor(ctrans.apply([222,196,160,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 485 500 L 487 515 490 535 499 523 Q 507 515 525 515 566 515 588 538 601 551 605 567 581 575 579 592 L 575 620 558 620 553 613 552 605 Q 542 663 530 675 523 670 523 658 L 518 665 512 763 500 933 489 1034 444 1378 387 1354 387 1340 441 933 450 839 448 763 Q 447 703 449 674 452 616 481 513 L 485 500 M 707 492 L 729 490 735 500 738 565 721 763 708 933 707 949 696 1173 Q 691 1309 670 1389 L 662 1380 660 1345 665 1297 665 1000 669 933 677 763 681 716 Q 689 585 698 513 L 685 513 707 492 M 189 396 L 192 402 197 425 Q 212 422 262 467 L 278 482 Q 326 524 348 535 L 340 545 Q 304 549 304 574 304 605 290 613 L 282 608 277 582 275 585 Q 256 641 248 727 L 245 763 238 932 238 933 210 1130 194 1237 159 1225 155 1059 172 581 167 490 Q 165 441 178 383 L 189 396 M 428 1183 L 425 1180 415 1245 417 1252 418 1249 428 1183 M 523 548 Q 521 550 522 553 L 513 565 507 545 505 545 500 570 Q 521 573 522 582 L 522 587 525 577 Q 530 558 533 558 545 558 545 552 L 533 549 523 548 M -133 292 L -130 292 -130 277 -132 275 -133 292 M -155 229 Q -155 209 -130 215 L -93 273 Q -85 283 -85 316 L -87 348 Q -80 312 -65 293 L -60 293 -72 536 -66 580 -60 627 -64 763 -68 933 -69 965 -72 1053 -107 1044 -106 1000 -108 1043 -137 1037 -141 933 -146 812 -148 763 -157 599 -145 268 -150 249 -155 229";
	ctx.fillStyle=tocolor(ctrans.apply([103,77,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 485 500 L 511 482 547 458 Q 532 447 532 437 555 395 580 383 L 583 390 568 413 550 435 Q 555 451 565 461 565 478 535 496 L 487 515 485 500 M 707 492 Q 698 490 693 480 L 688 462 Q 699 410 735 413 727 419 718 435 L 703 465 718 475 741 444 Q 760 422 780 422 792 422 795 430 L 760 454 Q 739 470 737 487 L 729 490 707 492 M 156 176 Q 188 146 202 148 190 170 130 230 L 206 281 Q 259 318 288 333 L 285 335 Q 255 334 196 301 140 268 103 233 L 156 176 M 278 482 L 262 467 Q 212 422 197 425 L 192 402 189 396 Q 202 374 225 360 L 315 362 380 363 Q 368 368 351 379 L 278 388 257 378 Q 234 374 215 405 L 305 459 Q 367 494 398 517 392 523 383 523 347 523 278 482 M -150 156 Q -150 135 -89 108 -34 83 -7 83 L -7 85 Q -16 91 -79 121 -129 144 -133 160 L -89 209 Q -63 245 -77 265 L 5 273 -82 283 Q -150 169 -150 156";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite501(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape500",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape502(ctx,ctrans,frame,ratio,time){
	var pathData="M 217 45 L 217 46 237 46 220 29 Q 217 36 217 45 M 572 2 Q 572 15 569 7 L 536 21 507 27 505 23 506 11 504 2 Q 504 -18 538 -18 572 -17 572 2 M 672 168 Q 660 184 620 185 L 586 184 577 172 Q 577 171 584 169 L 589 159 590 148 Q 594 143 610 144 L 580 127 582 124 Q 598 112 629 124 653 134 677 153 L 672 168 M 759 -17 Q 759 -28 767 -32 L 817 -38 Q 802 -37 811 -44 L 835 -56 838 -51 840 -41 Q 840 -19 831 -8 L 818 1 762 12 745 10 744 0 754 -8 759 -17 M 177 -23 L 201 -31 216 -26 207 -38 Q 234 -60 294 -49 372 -30 422 -25 L 374 -3 327 7 320 2 Q 320 -3 314 -2 L 241 7 235 19 255 32 262 43 255 57 Q 244 69 224 71 L 232 80 Q 252 100 295 98 332 97 345 79 L 379 114 Q 397 129 435 128 L 439 126 Q 441 109 447 99 423 98 417 88 467 48 513 65 552 80 552 111 L 557 140 542 148 514 151 515 162 Q 527 209 632 205 676 203 702 182 728 161 737 160 756 160 775 143 664 133 664 109 L 677 73 672 68 Q 667 69 667 63 667 55 670 54 L 677 53 Q 777 47 808 54 L 811 62 Q 806 78 806 97 L 806 354 625 387 300 400 Q 106 417 -69 246 L -118 193 -118 178 Q -117 145 -126 118 L -109 94 -84 61 Q -55 44 -25 17 L -24 17 80 -8 109 -20 152 -16 177 -23 M 173 -89 Q 167 -94 167 -100 167 -123 234 -125 302 -126 319 -100 L 317 -93 315 -89 Q 307 -78 298 -75 L 245 -70 Q 217 -69 192 -79 179 -83 173 -89";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 795 125 L 806 132 806 140 758 155 794 125 795 125";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 80 -8 L 107 -19 144 -8 215 -8 218 -27 238 -18 246 -15 Q 238 11 227 11 L 128 5 Q 121 -5 103 -4 L 37 9 2 10 -38 31 Q -39 42 -58 63 L -88 89 Q -88 106 -116 118 -60 148 25 178 102 206 116 206 L 220 196 265 189 295 181 Q 308 181 316 187 L 317 180 Q 317 169 310 163 L 285 142 287 137 317 115 357 109 373 109 379 114 Q 397 129 434 128 L 435 128 452 124 452 147 450 149 440 150 Q 416 151 375 130 335 132 335 147 L 338 192 Q 337 218 329 229 L 323 267 Q 308 304 255 303 L 265 310 287 319 393 323 Q 415 319 418 312 423 301 427 301 435 301 449 313 L 468 327 Q 525 333 602 355 L 644 354 780 339 Q 781 326 787 316 L 757 288 Q 757 281 760 278 L 767 277 804 276 Q 778 257 735 258 L 642 254 Q 609 243 587 209 L 596 205 632 205 645 204 630 213 Q 679 235 782 250 L 806 255 806 1001 804 1102 752 1118 Q 716 1136 686 1176 L 627 1254 587 1256 Q 534 1238 515 1194 501 1144 487 1120 L 384 1126 Q 356 1158 335 1138 304 1108 288 1109 166 1117 152 1069 137 1020 -32 1031 -100 1034 -105 1011 -102 961 -111 918 -113 909 -130 883 L -130 622 -128 545 Q -123 396 -130 320 L -118 178 Q -117 145 -126 118 L -109 94 -84 61 Q -55 44 -25 17 L -24 17 80 -8";
	ctx.fillStyle=tocolor(ctrans.apply([94,72,60,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 354 311 Q 357 308 361 307 L 433 310 470 324 Q 470 416 460 476 L 450 554 Q 443 598 425 623 388 674 369 762 L 340 910 330 903 330 697 335 621 328 501 321 395 Q 321 330 354 311 M 348 710 L 350 710 350 695 348 710 M -55 210 L -35 190 -26 206 -7 223 Q -26 239 -25 270 L -20 315 Q -20 358 -37 430 L -58 536 -75 761 -85 767 Q -101 735 -103 696 L -102 627 -90 401 -78 207 -55 210";
	ctx.fillStyle=tocolor(ctrans.apply([94,72,60,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 348 710 L 350 695 350 710 348 710";
	ctx.fillStyle=tocolor(ctrans.apply([78,61,50,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 283 315 L 292 313 306 316 354 311 Q 321 330 321 395 L 328 501 335 621 330 697 330 903 340 910 369 762 Q 388 674 425 623 443 598 450 554 L 460 476 Q 470 416 470 324 L 433 310 539 321 Q 650 343 650 368 650 387 642 397 L 639 394 634 385 624 398 Q 614 419 602 421 L 582 405 Q 551 474 530 545 513 623 502 703 490 700 487 690 L 463 860 Q 448 964 430 1025 426 1016 417 966 409 931 395 918 384 948 382 1020 374 1084 330 1103 L 324 1155 Q 317 1182 306 1183 294 1183 297 1179 294 1159 277 1146 L 265 1133 272 1177 260 1182 Q 247 1182 250 1176 L 250 1105 Q 240 1084 241 1056 L 254 963 254 952 254 946 254 933 Q 250 884 251 791 L 254 694 255 545 256 476 262 334 259 332 Q 252 330 252 320 L 253 312 255 313 267 312 269 317 283 315 M -113 113 Q -62 181 20 191 L 47 197 65 206 Q 82 221 82 267 82 305 75 317 L 43 335 Q 17 348 17 367 16 400 22 471 L 20 545 17 593 1 670 Q -13 721 -13 747 L 2 850 Q 17 954 17 995 17 1043 2 1047 L -2 1038 Q -4 1032 -11 1034 -18 1034 -25 1041 L -38 1050 -56 1047 -63 1029 -68 1041 Q -74 1047 -83 1049 -118 1050 -123 866 L -121 620 -122 545 -126 289 -126 280 -118 178 Q -117 154 -122 133 L -120 110 -118 107 -113 113 M 260 595 L 260 564 261 545 266 424 Q 256 464 256 515 L 257 545 260 595 M -55 210 L -78 207 -90 401 -102 627 -103 696 Q -101 735 -85 767 L -75 761 -58 536 -37 430 Q -20 358 -20 315 L -25 270 Q -26 239 -7 223 L -26 206 -35 190 -55 210";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 632 205 L 653 203 725 224 Q 737 210 747 210 762 209 806 233 L 806 262 804 261 Q 751 235 742 235 736 235 731 241 L 720 246 Q 676 248 645 225 L 624 205 632 205 M 774 145 Q 787 147 795 155 L 777 164 702 182 Q 728 161 737 160 755 160 774 145 M 283 315 L 274 309 277 302 298 285 317 268 Q 317 238 344 161 L 330 154 324 147 326 138 329 135 352 133 378 137 405 141 425 135 428 128 431 128 433 131 437 138 422 153 362 154 362 158 341 209 Q 332 224 332 250 L 336 270 312 301 361 307 Q 357 308 354 311 L 306 316 292 313 283 315 M -113 113 Q -111 87 -54 50 21 2 122 12 L 125 15 Q 74 35 -6 46 -38 49 -88 112 -69 117 -53 135 L -63 148 Q 18 173 57 178 103 183 123 196 L 175 203 Q 188 203 197 194 205 185 222 184 L 275 187 274 191 267 200 242 205 Q 222 206 203 214 L 152 222 Q 135 223 124 210 112 198 88 199 L 47 197 20 191 Q -62 181 -113 113";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite503(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape502",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape506(ctx,ctrans,frame,ratio,time){
	var pathData="M 125 -50 L 213 -41 Q 255 -31 255 -16 255 20 200 20 158 20 127 0 103 -16 103 -25 103 -50 125 -50 M 335 -46 Q 335 -67 367 -80 403 -96 434 -59 L 423 -60 411 -58 387 -50 Q 392 -47 412 -40 L 388 -35 338 -35 Q 335 -34 335 -46 M 618 -79 Q 646 -85 690 -65 L 674 -47 Q 658 -35 642 -35 595 -35 595 -62 595 -75 618 -79 M 574 -25 Q 658 0 710 3 725 8 725 22 L 721 34 715 40 715 47 Q 748 46 755 76 L 734 122 Q 711 161 693 170 L 768 170 770 145 792 143 Q 816 143 825 177 L 830 213 Q 830 228 798 265 765 301 765 322 765 352 737 378 695 419 557 410 L 425 393 Q 338 393 287 412 L 212 430 Q 135 430 98 381 62 335 -11 338 L -11 327 -8 313 -16 291 -25 268 28 173 Q 8 172 -12 154 -30 137 -30 126 -30 115 -15 95 2 73 15 73 36 73 42 97 49 125 67 130 L 89 101 Q 112 83 167 83 L 187 87 220 93 Q 235 98 235 112 L 229 126 217 137 233 142 256 145 Q 268 145 280 135 291 125 315 127 294 121 280 96 268 77 268 66 268 62 327 29 384 -2 387 -2 430 -2 430 26 L 425 47 420 69 408 90 Q 395 105 395 110 L 400 142 430 142 Q 442 136 441 125 449 116 512 110 L 513 101 503 81 493 60 Q 493 44 499 42 L 530 23 Q 512 13 503 -8 534 -37 574 -25 M 25 125 Q 18 108 18 100 -5 117 -5 125 L 2 136 Q 11 144 25 145 L 35 147 25 125";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 398 277 L 398 278 392 293 387 292 385 285 398 277";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 459 501 L 460 505 460 507 459 509 459 501";
	ctx.fillStyle=tocolor(ctrans.apply([115,115,115,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 424 265 L 430 265 Q 467 238 531 228 L 603 215 Q 603 200 581 186 570 179 555 175 L 530 175 521 169 475 168 455 157 Q 455 149 465 145 L 545 150 647 140 Q 669 140 673 110 673 94 643 87 L 558 78 Q 555 83 555 70 555 63 560 61 L 565 60 Q 698 44 698 119 698 141 666 155 L 599 172 Q 625 191 625 214 625 232 562 258 548 275 531 314 L 529 320 610 313 726 325 Q 764 325 785 282 L 780 261 773 238 780 230 Q 800 239 804 269 L 805 260 812 260 815 289 807 509 802 631 802 934 Q 797 1003 800 1084 L 805 1111 793 1135 768 1135 Q 757 1144 750 1169 742 1191 732 1191 721 1191 715 1173 L 710 1155 Q 702 1183 687 1183 671 1183 666 1165 L 657 1136 Q 626 1186 617 1182 L 574 1165 Q 547 1165 519 1191 L 495 1219 Q 478 1206 475 1191 L 456 1209 445 1226 Q 436 1222 429 1195 423 1172 409 1172 399 1172 388 1185 377 1198 365 1198 351 1198 344 1189 L 335 1172 Q 312 1185 274 1229 L 240 1269 Q 222 1269 207 1228 195 1192 195 1169 L 190 1162 174 1178 Q 162 1191 152 1191 135 1191 135 1176 L 125 1212 Q 112 1233 75 1233 46 1233 38 1202 35 1189 35 1155 12 1155 -2 1135 L -12 1135 -19 1105 -20 1020 -10 961 Q 0 923 0 896 L -5 869 -10 841 0 666 Q 0 621 -13 511 L -15 498 Q -30 407 -30 366 L -19 329 -24 320 -35 291 Q -35 280 -24 270 L -14 253 1 252 Q 27 238 50 238 61 238 65 245 L 11 274 -2 286 0 289 5 304 3 320 7 323 175 335 Q 184 350 178 358 218 368 234 381 L 276 373 284 345 Q 295 310 305 300 297 286 297 264 L 298 257 315 245 297 225 Q 191 220 166 206 145 194 85 195 L 75 188 Q 91 157 130 133 177 102 216 123 L 208 122 Q 172 122 142 144 L 118 168 115 172 Q 136 169 160 182 192 198 314 197 L 319 193 347 170 335 162 Q 342 152 349 151 L 380 158 383 165 370 183 Q 377 176 377 183 L 343 207 345 214 Q 349 233 357 242 L 342 258 353 265 348 331 356 413 369 509 370 511 370 515 373 548 363 515 362 511 362 515 359 602 356 637 354 670 348 809 348 815 355 856 365 853 367 825 370 737 370 731 372 735 373 782 373 785 363 896 363 902 Q 364 916 367 920 L 370 920 Q 381 849 390 627 L 391 604 395 515 397 430 Q 397 404 407 340 416 287 424 265 M 459 501 L 459 509 460 507 460 505 459 501";
	ctx.fillStyle=tocolor(ctrans.apply([98,77,64,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 353 265 L 353 262 364 262 380 265 410 259 415 248 430 253 424 265 Q 416 287 407 340 397 404 397 430 L 395 515 391 604 390 627 Q 381 849 370 920 L 367 920 Q 364 916 363 902 L 373 788 373 785 373 782 372 735 370 731 370 737 367 825 365 853 355 856 348 815 348 809 354 670 356 643 359 602 362 515 363 515 373 548 370 515 371 515 370 511 369 509 356 413 348 331 353 265 M 398 277 L 385 285 387 292 392 293 398 278 398 277";
	ctx.fillStyle=tocolor(ctrans.apply([113,85,74,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 545 268 Q 539 342 542 445 L 542 784 547 828 542 1019 537 1019 527 603 528 515 530 511 528 511 528 485 522 330 525 328 532 361 Q 536 307 545 268 M 762 313 L 765 311 765 310 780 295 780 296 Q 787 305 787 317 L 790 334 790 348 803 360 805 371 803 490 802 511 793 515 802 515 800 719 793 942 785 1124 784 1141 782 1141 765 1137 Q 759 1137 756 1141 L 748 1141 Q 739 1088 725 864 710 616 710 544 L 711 515 712 515 715 347 738 350 Q 742 335 760 315 L 762 313 M 295 305 L 295 335 295 515 295 541 295 565 292 726 Q 287 969 271 1141 L 268 1141 268 1142 269 1175 Q 269 1194 260 1201 L 255 1141 253 1141 236 851 219 515 225 515 219 511 217 456 Q 217 441 230 428 L 230 423 Q 142 377 137 352 L 143 344 145 342 Q 189 361 213 375 239 388 242 395 L 245 377 245 360 246 358 Q 247 355 255 355 265 355 269 368 L 270 383 270 425 282 350 283 300 292 300 295 303 295 305";
	ctx.fillStyle=tocolor(ctrans.apply([113,85,74,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 658 125 Q 658 112 652 108 L 652 110 640 128 638 130 658 125 M 660 147 L 595 152 Q 551 152 538 144 532 141 528 130 L 573 135 637 104 Q 677 83 677 124 677 137 660 147 M 582 189 Q 582 221 555 227 498 225 464 244 425 266 353 270 L 347 270 352 263 Q 358 256 365 253 422 249 462 229 498 210 525 210 570 210 573 192 L 568 165 577 165 582 189 M 762 313 Q 744 322 722 322 L 625 315 565 310 Q 639 296 670 308 L 705 308 Q 757 298 785 267 L 787 266 788 274 Q 788 285 780 296 L 780 295 765 310 765 311 762 313 M 345 188 Q 333 216 323 211 297 197 287 197 267 210 240 210 209 210 176 183 L 145 153 Q 154 154 175 176 194 197 225 197 L 273 190 Q 287 183 305 183 L 345 188 M 143 344 L 120 315 122 310 225 360 Q 271 360 281 300 L 283 225 292 225 297 295 295 305 295 303 292 300 283 300 282 350 269 368 Q 265 355 255 355 247 355 246 358 L 245 360 245 377 242 395 Q 239 388 213 375 189 361 145 342 L 143 344";
	ctx.fillStyle=tocolor(ctrans.apply([209,172,148,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite507(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape506",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape508(ctx,ctrans,frame,ratio,time){
	var pathData="M 415 463 L 397 459 Q 403 443 411 445 418 447 422 463 L 429 464 427 466 414 467 415 463";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 834 223 L 861 226 885 226 902 230 904 238 902 254 903 254 930 267 951 283 950 286 950 287 958 283 959 283 933 303 Q 903 319 891 334 L 867 364 Q 849 385 836 386 L 832 384 831 383 815 383 808 390 806 390 811 404 807 413 797 415 774 424 759 414 762 408 757 404 Q 757 398 772 393 L 803 388 Q 800 385 800 378 L 783 381 Q 760 382 760 372 L 765 356 765 347 757 348 745 355 Q 740 356 740 352 L 740 348 Q 735 347 732 343 L 724 343 723 344 716 345 710 355 696 363 683 359 677 354 Q 677 350 683 349 L 688 344 Q 688 339 668 336 L 653 334 652 335 647 333 Q 645 333 642 336 L 634 336 Q 605 333 605 325 L 610 315 614 305 593 302 Q 581 302 574 317 566 331 557 329 L 553 342 546 353 539 351 529 353 515 356 507 356 493 342 484 342 481 345 474 346 471 344 Q 464 344 463 364 L 464 383 450 395 432 400 410 397 383 394 380 390 Q 380 387 402 373 L 424 354 Q 424 338 398 331 390 328 380 313 L 355 311 343 311 340 308 324 309 Q 318 311 318 315 L 323 325 327 335 327 341 322 347 Q 313 347 306 352 L 290 356 269 351 258 354 244 357 232 356 227 353 216 357 Q 209 358 207 353 L 199 345 Q 178 339 178 334 L 182 324 193 312 193 310 175 318 165 318 162 316 146 317 129 322 104 318 92 308 85 309 71 317 61 318 48 310 31 303 9 303 -9 294 -10 283 Q -10 270 10 264 30 257 30 250 L 34 238 Q 34 228 16 229 L -1 231 Q -8 232 -15 226 L -15 248 -13 252 -16 254 -23 247 -20 242 -20 220 -23 214 -23 209 -22 209 -20 213 -20 115 -27 108 Q -27 105 -13 99 L 8 92 16 93 62 105 67 110 72 117 78 120 81 120 81 121 85 123 110 127 139 131 151 129 169 124 206 123 220 129 231 141 226 153 234 152 275 137 314 119 325 119 Q 326 110 347 104 L 369 103 368 107 386 101 408 100 415 102 429 104 441 105 457 121 Q 461 125 471 125 L 478 127 500 125 520 125 Q 531 132 541 158 549 179 571 185 L 617 183 Q 620 186 621 185 L 632 187 Q 642 196 666 196 L 668 198 691 198 710 194 719 194 720 196 721 196 Q 730 198 739 208 747 215 760 216 L 797 211 814 213 824 218 834 223 M 890 325 L 893 323 892 323 890 325 M 586 354 Q 604 340 615 350 L 652 354 Q 670 360 670 366 L 658 374 642 388 Q 630 402 614 403 605 403 589 390 L 583 390 580 392 569 393 567 389 574 376 571 371 586 354 M 602 352 Q 599 351 595 355 L 595 356 598 353 602 352 M 706 378 Q 717 368 725 368 L 740 373 752 378 Q 752 386 740 394 L 715 401 694 391 706 378 M 140 354 Q 140 344 154 344 L 170 344 171 347 Q 171 358 158 359 L 157 359 159 365 160 371 160 372 159 372 156 360 150 364 141 359 140 354 M 35 340 Q 41 333 58 332 L 65 337 77 334 82 336 91 339 92 342 90 345 87 350 87 357 82 364 75 369 72 365 61 368 40 362 28 351 35 340 M 167 415 L 166 418 166 424 172 430 166 430 164 433 157 439 147 437 143 436 Q 145 432 150 433 L 151 433 146 417 149 414 166 413 167 415 M 158 423 L 158 425 163 424 160 422 158 423 M 270 413 L 261 401 Q 261 388 280 388 L 301 389 344 378 354 379 356 384 348 389 352 398 354 406 Q 342 434 323 435 L 314 430 311 424 289 425 270 413 M -20 108 L -21 108 -20 109 -20 108";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 452 239 L 434 243 413 249 405 259 391 265 381 264 364 267 362 267 Q 370 259 390 261 L 405 252 412 244 433 238 452 238 452 239";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 825 224 L 794 220 790 220 791 222 790 224 Q 784 225 782 228 L 773 228 794 240 784 251 782 252 790 251 793 256 758 286 753 286 752 282 Q 752 280 757 279 L 766 276 767 271 769 268 788 258 Q 773 260 773 252 L 785 243 787 242 778 238 778 237 757 229 754 229 754 228 742 223 Q 732 219 726 211 L 720 205 713 200 691 202 663 202 649 200 648 199 646 200 646 201 639 204 630 223 633 229 638 230 639 230 643 229 650 228 653 224 656 224 653 232 650 234 663 235 661 241 673 245 674 247 692 250 692 257 678 265 665 277 662 277 Q 675 263 689 254 L 686 251 672 251 665 247 659 248 659 242 657 241 652 243 647 240 637 237 Q 630 237 625 230 L 621 218 Q 621 210 626 204 L 619 199 607 191 Q 601 191 598 194 L 594 198 558 193 540 188 530 192 521 202 519 200 527 193 527 192 516 197 511 199 510 200 526 213 533 214 563 213 571 220 578 228 593 229 597 240 591 246 571 254 556 254 555 249 593 238 591 233 Q 574 234 569 225 565 216 534 220 L 515 210 503 201 Q 503 198 510 194 L 509 192 512 188 511 186 513 183 516 183 521 177 527 170 526 163 Q 526 158 529 155 L 528 151 528 135 524 135 491 132 473 131 472 130 452 134 447 136 444 136 438 144 438 148 442 148 454 149 461 155 Q 450 165 450 175 L 452 182 435 198 429 198 416 201 Q 406 203 406 196 L 418 195 442 191 448 185 444 179 Q 444 165 453 156 L 451 153 444 154 Q 443 161 405 168 L 406 171 406 172 402 170 394 173 391 171 399 163 Q 405 157 415 158 L 429 153 427 149 431 149 431 148 432 142 427 138 436 129 443 117 433 111 415 104 397 105 396 107 364 108 326 119 322 122 297 136 317 130 319 135 315 134 293 142 293 143 291 143 286 145 282 146 281 149 275 150 252 156 219 172 218 173 219 179 219 182 219 184 219 190 217 192 217 193 222 197 226 201 Q 231 201 234 204 L 238 208 251 217 251 218 275 219 279 227 277 231 291 234 281 236 274 234 260 243 Q 239 255 227 256 L 219 254 218 251 208 256 187 259 180 266 170 271 166 270 166 265 181 259 179 254 182 248 188 243 193 248 192 253 201 253 220 245 224 246 224 249 230 249 Q 248 242 265 231 L 237 221 234 217 231 214 221 208 210 206 210 197 208 197 207 199 200 192 197 186 189 188 174 185 173 193 169 201 156 202 159 204 Q 153 204 150 200 L 167 194 166 185 Q 167 178 173 178 L 184 181 193 178 198 180 202 179 201 178 202 173 206 173 219 138 220 140 220 139 223 131 204 129 197 125 176 128 147 136 140 139 110 132 98 132 93 133 89 132 85 133 81 136 71 136 71 133 37 148 36 149 51 154 55 160 36 184 6 200 5 200 30 181 Q 43 173 45 160 L 46 159 33 155 26 150 Q 26 143 51 132 L 56 130 56 128 67 114 67 113 68 114 68 113 54 106 Q 51 103 41 103 L 2 111 -9 112 -12 114 -19 113 -11 112 -20 112 -21 108 -20 104 -13 100 30 91 41 92 48 92 53 98 61 100 76 99 77 100 78 99 81 102 84 108 85 110 85 113 86 115 113 119 151 128 150 131 193 120 202 120 215 124 227 128 Q 234 128 234 145 L 236 147 237 147 248 146 Q 251 142 255 143 L 253 146 255 146 Q 260 139 277 133 L 301 122 Q 304 119 342 93 L 363 91 378 93 402 93 412 92 436 102 450 113 458 123 472 124 473 124 474 125 493 127 523 130 542 134 543 139 549 152 556 177 562 176 562 179 577 185 581 186 585 188 602 182 618 181 637 191 639 191 650 189 Q 652 187 657 193 L 674 192 691 192 694 190 704 191 736 194 737 205 Q 747 214 775 214 L 800 206 814 208 817 207 819 210 834 216 854 222 872 228 873 227 880 225 Q 899 224 904 234 L 908 243 Q 919 245 932 256 949 269 966 268 L 966 278 960 286 952 291 945 289 938 293 934 291 934 288 936 277 925 269 914 259 908 255 903 273 902 278 901 278 901 275 897 276 892 276 891 273 896 267 895 265 897 261 887 243 880 240 872 237 860 234 825 224 M 945 274 L 945 273 943 273 945 274 M 642 199 L 641 200 643 200 645 200 642 199 M 631 207 L 630 208 Q 625 212 625 218 L 626 221 630 209 631 207 M 758 222 L 760 221 757 221 758 222 M 800 206 L 797 209 799 208 804 211 805 210 800 206 M 528 181 L 527 182 528 182 528 181 M 546 166 L 548 172 546 164 546 166 M 545 155 L 544 153 544 155 545 155 M 338 109 L 344 108 339 108 338 109 M 232 150 L 234 149 233 149 232 150 M 215 201 L 217 201 215 200 215 201 M 270 228 L 273 225 260 224 269 227 270 228 M 184 253 L 184 254 187 250 184 253";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 470 133 Q 464 133 454 139 L 443 145 440 143 Q 464 128 471 128 494 127 499 133 L 531 134 534 138 532 148 526 154 525 151 527 143 524 138 490 135 470 133 M 405 175 L 396 174 393 172 393 169 396 168 402 170 Q 413 169 426 159 L 439 155 450 152 445 161 442 159 Q 435 159 423 168 411 175 405 175 M 192 183 L 197 184 Q 196 189 202 196 L 200 198 Q 192 197 194 188 L 178 188 176 187 178 184 192 183";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 840 226 L 845 225 847 223 865 227 879 234 890 249 891 247 893 246 896 262 907 262 902 255 904 252 Q 938 270 938 278 L 935 281 937 286 936 290 931 291 914 271 908 263 895 265 895 272 893 273 885 256 Q 880 237 867 237 L 851 235 830 231 810 226 799 222 790 224 787 224 Q 791 217 801 217 L 814 222 840 226 M 648 196 L 680 195 682 196 716 195 Q 725 208 756 220 783 230 783 237 L 778 241 778 243 788 249 772 268 754 287 751 281 761 268 Q 771 257 776 256 L 772 242 769 243 Q 763 244 756 238 L 746 230 725 225 724 222 Q 724 218 730 218 L 715 213 703 203 704 201 648 201 642 203 Q 636 204 638 211 L 635 211 Q 635 200 641 198 L 648 196 M 623 197 L 632 203 632 208 631 209 623 205 624 209 623 221 624 221 Q 628 221 649 235 L 668 252 675 248 678 249 678 251 677 257 674 257 657 278 655 276 651 278 649 275 665 258 Q 655 261 637 247 L 624 233 610 224 610 210 611 199 605 195 Q 603 195 600 198 L 588 201 553 197 539 193 528 195 Q 519 198 518 200 L 516 198 Q 529 187 540 189 L 565 196 579 195 595 196 600 191 606 189 614 192 615 189 618 194 620 195 622 194 623 197 M 442 117 L 443 118 443 120 445 123 440 125 438 126 425 158 417 153 413 150 427 122 408 111 400 109 381 106 349 113 326 125 Q 311 128 307 137 L 295 143 279 149 278 148 270 150 246 164 245 164 229 173 226 171 224 178 223 179 221 184 217 184 216 182 221 170 Q 225 159 228 158 L 230 164 239 160 306 128 327 115 Q 343 106 358 103 L 381 93 415 92 434 103 Q 441 107 441 115 L 442 117 M 413 98 L 398 99 401 101 419 102 413 98 M 783 249 L 782 249 779 252 779 253 783 249 M 324 119 L 329 117 327 117 324 119 M 387 99 L 380 100 389 100 387 99 M 225 126 L 225 132 227 136 217 157 203 180 194 180 194 175 210 138 192 126 Q 175 127 157 136 L 133 144 Q 128 144 125 140 L 120 132 75 131 74 130 77 127 84 126 122 126 128 134 134 139 156 131 Q 174 123 188 122 L 206 123 215 125 223 126 225 126 M 13 112 L 6 114 -3 113 -4 111 -1 106 21 103 31 104 39 100 Q 41 97 50 105 L 60 111 68 119 64 123 66 122 67 125 53 131 Q 39 137 36 150 L 35 150 35 144 28 144 27 142 Q 27 140 34 137 L 46 132 45 128 53 120 40 110 13 112";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite509(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape508",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape510(ctx,ctrans,frame,ratio,time){
	var pathData="M 77 -4 L 48 -3 Q 33 -3 21 5 8 13 -2 13 L 3 18 14 22 -3 23 -30 6 -12 -13 22 -38 55 -66 Q 75 -92 125 -123 L 135 -130 174 -120 180 -113 185 -106 192 -103 195 -103 195 -102 200 -100 230 -95 263 -89 278 -91 281 -92 299 -94 342 -94 359 -87 371 -75 365 -63 374 -63 374 -56 399 -40 Q 405 -35 434 -23 447 -17 447 -5 L 441 6 Q 441 16 480 16 L 559 17 Q 607 25 618 39 L 631 68 642 99 Q 651 122 659 122 L 692 112 728 101 Q 743 102 787 125 L 840 150 Q 874 157 893 177 912 198 900 218 L 904 220 925 215 Q 936 215 952 233 L 969 254 994 271 995 272 Q 985 275 980 283 L 954 301 Q 904 314 870 345 L 870 346 811 355 781 350 776 344 742 359 Q 694 358 694 335 L 615 322 Q 586 318 586 303 586 295 596 290 L 616 285 637 290 646 293 650 289 634 284 629 275 641 253 660 228 Q 651 215 643 215 634 215 614 231 596 247 577 247 568 247 558 240 L 549 233 523 238 488 235 448 231 Q 434 226 431 221 L 430 207 431 195 452 179 437 163 Q 426 153 425 141 L 383 160 364 155 Q 355 166 347 166 340 166 328 137 L 323 125 Q 309 120 309 116 309 110 314 106 L 317 103 318 96 305 100 294 100 291 98 272 97 251 101 223 96 208 86 200 86 184 94 173 93 157 85 137 77 111 76 Q 93 70 90 66 L 89 55 Q 89 42 113 37 L 135 24 140 12 Q 140 2 120 2 L 100 4 83 -2 83 20 85 24 82 26 Q 74 26 74 19 L 77 14 77 -4 M 417 302 Q 402 289 402 281 402 257 455 268 507 278 507 296 507 320 469 320 437 320 417 302 M 486 304 L 495 301 496 296 Q 496 288 487 291 L 486 304 M 671 401 L 676 410 681 411 686 404 671 401 M 686 424 L 642 428 Q 623 428 614 408 L 609 389 612 374 656 375 Q 677 386 699 403 699 419 686 424 M 208 120 L 206 123 203 127 203 134 196 141 188 146 184 142 173 143 148 137 133 125 141 114 169 107 177 113 190 111 196 113 207 117 208 120 M 301 129 Q 301 140 286 139 L 285 139 287 145 288 151 289 152 287 152 284 140 281 141 277 144 266 139 265 134 Q 265 124 281 124 L 300 126 301 129 M 297 197 L 295 200 296 206 303 212 295 212 293 215 Q 292 220 285 219 L 281 219 273 217 268 216 Q 270 212 277 213 L 278 213 272 197 275 194 296 195 297 197 M 286 205 L 292 206 288 202 286 203 286 205 M 343 203 Q 343 178 367 186 392 195 392 208 L 382 221 365 230 Q 348 230 344 216 L 343 203 M 176 183 L 178 189 171 195 176 201 178 207 165 221 132 227 Q 118 227 117 221 L 119 211 111 204 118 191 150 185 152 181 166 183 176 183 M -32 45 L -32 75 -13 82 -51 77 Q -74 69 -74 60 L -70 50 -40 46 -29 37 -32 45";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 851 354 Q 851 346 873 335 885 329 895 326 L 870 345 857 358 853 358 851 354";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 189 -124 L 191 -123 192 -124 195 -121 199 -115 200 -113 200 -110 201 -108 233 -103 274 -93 Q 302 -113 338 -109 376 -106 387 -81 L 380 -76 382 -70 382 -67 Q 394 -65 412 -53 L 437 -36 446 -33 Q 468 -24 470 -14 L 470 11 513 11 555 17 568 25 601 28 626 32 628 29 630 34 632 35 650 64 655 71 Q 666 79 678 98 L 678 120 704 105 717 89 746 105 795 136 Q 805 144 835 152 L 904 169 Q 915 176 915 188 L 909 198 909 206 913 205 Q 919 205 924 211 941 218 961 235 L 976 248 993 265 998 267 1005 271 Q 992 271 985 277 L 957 255 948 248 925 231 922 233 917 233 922 238 922 242 915 243 877 234 869 240 851 240 817 230 Q 800 226 797 215 L 778 215 768 220 759 225 752 231 741 245 738 248 736 254 743 277 745 284 735 294 700 304 696 302 Q 707 295 724 291 L 734 283 733 277 729 261 730 251 691 248 684 244 681 243 681 239 684 238 702 243 730 242 749 220 Q 762 205 788 200 L 794 199 Q 802 199 805 204 L 807 208 822 209 847 215 866 215 870 212 880 194 882 186 881 186 884 185 886 179 862 171 807 153 Q 786 133 768 125 L 721 103 Q 692 132 668 132 L 654 128 649 128 637 125 635 123 634 124 634 123 624 121 Q 606 120 599 148 L 595 161 595 163 586 210 Q 574 243 556 243 L 546 238 537 233 525 237 515 239 507 236 507 224 508 222 507 222 510 221 513 225 516 227 533 223 Q 544 223 556 232 566 232 571 200 L 575 176 574 176 Q 552 176 535 160 517 144 495 142 L 485 152 432 158 410 165 401 164 399 158 Q 413 150 483 141 L 478 137 478 131 486 130 Q 523 131 536 148 547 165 573 165 L 576 164 577 157 582 157 590 133 Q 596 106 625 110 L 624 99 626 81 624 53 623 43 597 41 Q 573 41 552 31 533 21 498 21 L 449 22 Q 446 30 438 29 L 432 27 439 21 398 19 394 30 Q 390 36 377 36 L 374 36 374 40 366 40 358 38 356 35 345 39 320 42 311 48 300 53 296 52 295 47 313 41 311 38 304 43 279 47 Q 265 47 261 41 L 260 35 Q 260 29 265 24 252 11 235 11 L 233 9 211 11 204 8 207 4 Q 210 0 212 1 L 239 4 Q 254 5 264 12 L 273 22 268 32 Q 265 38 276 38 L 293 36 309 30 311 34 314 30 321 26 327 31 325 36 336 36 359 29 360 29 355 26 363 20 375 24 Q 386 24 388 18 L 390 8 421 11 436 8 436 6 442 -9 Q 442 -18 420 -25 L 382 -40 374 -51 374 -50 358 -44 357 -43 358 -37 358 -34 358 -32 358 -26 355 -24 355 -23 361 -19 365 -15 374 -12 374 0 371 -2 360 -8 347 -10 347 -19 348 -19 345 -20 343 -18 Q 339 -18 335 -25 L 332 -31 322 -29 305 -33 304 -25 299 -17 284 -18 287 -16 281 -17 276 -20 281 -22 297 -24 296 -33 Q 297 -40 304 -40 L 316 -37 327 -39 333 -37 337 -38 336 -39 338 -44 342 -44 358 -78 359 -76 359 -77 360 -81 355 -85 340 -88 332 -92 307 -90 281 -85 273 -84 Q 270 -81 265 -81 L 230 -90 215 -90 210 -89 205 -90 200 -90 195 -87 184 -87 184 -90 144 -78 143 -77 160 -71 165 -65 143 -42 108 -27 107 -27 135 -45 Q 151 -52 153 -65 L 155 -66 139 -71 131 -76 Q 131 -83 160 -93 L 167 -95 166 -97 180 -109 180 -110 181 -109 181 -110 164 -119 149 -122 116 -117 125 -123 141 -135 149 -133 157 -133 163 -127 172 -125 189 -124 M 278 -89 L 281 -89 327 -97 338 -97 341 -95 340 -100 303 -95 278 -89 M 373 -67 L 372 -66 374 -67 374 -64 375 -68 374 -69 375 -69 374 -72 374 -69 374 -67 373 -67 M 353 -15 L 355 -15 353 -16 353 -15 M 404 -39 L 399 -45 384 -60 Q 386 -48 393 -44 L 404 -38 404 -39 M 895 182 L 894 186 898 183 895 182 M 678 120 L 668 119 Q 666 119 667 121 L 678 120 M 461 8 L 460 11 462 11 461 8 M 364 32 L 364 33 366 33 365 32 364 32 M 316 36 L 320 33 316 35 316 36";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 155 -55 L 162 -62 156 -52 155 -55 M 879 337 L 875 336 Q 878 329 895 319 L 910 311 917 315 880 337 879 337";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 199 -97 L 244 -95 250 -87 Q 252 -82 257 -82 L 281 -88 284 -89 321 -95 342 -94 353 -91 362 -90 365 -90 365 -84 366 -80 355 -59 339 -37 328 -37 328 -42 347 -78 325 -91 285 -84 281 -82 256 -77 Q 250 -77 247 -81 L 242 -89 188 -92 187 -93 190 -96 199 -97 M 180 -98 L 163 -94 Q 146 -89 143 -76 L 142 -76 141 -82 133 -76 145 -61 Q 145 -57 137 -51 L 122 -39 118 -41 135 -61 123 -74 131 -87 Q 141 -97 152 -96 L 149 -92 155 -93 153 -97 163 -105 148 -115 116 -115 110 -113 125 -123 137 -122 146 -126 159 -120 Q 162 -118 171 -114 L 181 -104 176 -102 179 -102 180 -98 M 286 -22 L 295 -20 Q 311 -20 310 -26 L 311 -30 309 -30 306 -31 309 -34 325 -34 332 -33 Q 330 -28 337 -21 L 335 -19 Q 325 -20 328 -29 L 318 -30 319 -24 313 -17 301 -13 286 -16 286 -22 M 378 -60 Q 386 -37 425 -31 L 426 -28 424 -26 445 -8 435 5 422 15 415 12 414 6 426 -18 415 -21 411 -21 Q 397 -22 383 -32 374 -38 372 -44 L 369 -43 Q 366 -43 365 -45 L 364 -38 363 -37 360 -32 355 -32 354 -34 360 -46 367 -58 370 -52 371 -52 378 -60 M 872 181 L 875 180 873 178 872 181 M 851 203 L 859 190 865 175 Q 856 171 841 166 L 792 152 765 129 728 108 713 113 Q 698 119 692 123 L 688 123 Q 690 118 705 109 L 724 93 728 93 759 111 Q 791 130 801 142 808 151 849 159 886 165 886 180 L 870 223 866 225 860 215 856 218 848 223 845 221 842 218 829 222 807 219 788 201 788 197 797 195 Q 821 210 827 210 L 835 210 842 205 851 203 M 832 224 L 894 231 Q 904 231 914 219 918 216 965 244 L 971 255 976 266 988 275 980 282 975 284 967 273 922 235 913 238 909 240 906 242 828 229 828 225 832 224 M 628 34 L 633 39 633 116 628 119 Q 613 118 613 68 613 54 605 46 598 39 578 31 L 547 28 536 23 Q 565 13 618 40 L 628 34 M 706 236 Q 716 239 728 227 735 219 739 217 L 739 226 748 217 Q 762 202 776 200 L 784 203 Q 756 213 736 241 L 728 237 722 241 682 239 676 236 Q 690 231 706 236 M 361 25 L 348 29 325 26 325 23 Q 350 27 365 10 L 382 9 385 9 387 15 368 19 361 25 M 310 31 Q 310 26 312 27 L 316 27 317 34 307 43 310 31";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite511(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape510",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite5518(ctx,ctrans,frame,ratio,time){
	ctx.save();

	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0496307373046875,-0.0059051513671875,0.0059051513671875,0.0496307373046875,719.1,461.1],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.049724578857421875,-0.0050750732421875,0.0050750732421875,0.049724578857421875,677.25,408.65],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0499664306640625,-1.8310546875E-5,1.8310546875E-5,0.0499664306640625,656.45,591.9],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0499664306640625,-1.8310546875E-5,1.8310546875E-5,0.0499664306640625,555.3,552.95],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,-20.495005,-0.0040891524,1.1271044,-0.053015266,0.0,-20.495,-0.15504453,0.065487385,1.1595572,0.0,-20.495,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.055912017822265625,0.0,0.0,0.055912017822265625,224.45,653.95],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,0.90500075,-0.0040891524,1.1271044,-0.053015266,0.0,0.9050007,-0.15504453,0.065487385,1.1595572,0.0,0.9050007,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("sprite360",canvas,ctx,[-0.05,0.0,0.0,0.05,335.5,625.95],ctrans,1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[-0.05,0.0,0.0,0.05,128.95,600.85],ctrans,1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[0.0499664306640625,-1.8310546875E-5,1.8310546875E-5,0.0499664306640625,447.45,623.9],ctrans,1,(0+time)%1,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0496307373046875,-0.0059051513671875,0.0059051513671875,0.0496307373046875,711.45,595.8],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("sprite360",canvas,ctx,[0.0377593994140625,-0.004492950439453125,0.004492950439453125,0.0377593994140625,124.25,171.65],ctrans,1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[-0.0377593994140625,-0.004492950439453125,-0.004492950439453125,0.0377593994140625,83.95,236.95],ctrans,1,(0+time)%1,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.01722564697265625,-6.103515625E-6,-1.220703125E-5,0.033594512939453126,53.45,220.0],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,0.90500075,-0.0040891524,1.1271044,-0.053015266,0.0,0.9050007,-0.15504453,0.065487385,1.1595572,0.0,0.9050007,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.014852142333984375,6.40869140625E-5,1.2054443359375E-4,0.027989959716796874,20.2,264.25],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("sprite360",canvas,ctx,[0.0235565185546875,6.2408447265625E-4,-0.001006317138671875,0.037994384765625,660.1,585.4],ctrans,1,(0+time)%1,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.0377593994140625,-0.004492950439453125,-0.004492950439453125,0.0377593994140625,658.2,613.45],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.01722564697265625,-6.103515625E-6,-1.220703125E-5,0.033594512939453126,772.95,570.6],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,0.90500075,-0.0040891524,1.1271044,-0.053015266,0.0,0.9050007,-0.15504453,0.065487385,1.1595572,0.0,0.9050007,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.014852142333984375,6.40869140625E-5,-1.2054443359375E-4,0.027989959716796874,775.65,526.4],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0219573974609375,2.7618408203125E-4,-4.7760009765625E-4,0.038005828857421875,726.9,649.1],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.025637054443359376,-2.288818359375E-6,-5.340576171875E-6,0.05,700.5,714.0],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,0.90500075,-0.0040891524,1.1271044,-0.053015266,0.0,0.9050007,-0.15504453,0.065487385,1.1595572,0.0,0.9050007,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0219573974609375,2.7618408203125E-4,-4.7760009765625E-4,0.038005828857421875,745.2,673.9],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.0496307373046875,-0.0059051513671875,-0.0059051513671875,0.0496307373046875,83.45,132.35],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.049724578857421875,-0.0050750732421875,-0.0050750732421875,0.049724578857421875,125.3,79.9],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0499664306640625,-1.8310546875E-5,1.8310546875E-5,0.0499664306640625,273.15,102.5],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0499664306640625,-1.8310546875E-5,1.8310546875E-5,0.0499664306640625,172.0,99.55],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,-20.495005,-0.0040891524,1.1271044,-0.053015266,0.0,-20.495,-0.15504453,0.065487385,1.1595572,0.0,-20.495,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0496307373046875,-0.0059051513671875,0.0059051513671875,0.0496307373046875,328.15,136.4],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-15.0,0.0,1.0,0.0,0.0,-15.0,0.0,0.0,1.0,0.0,-15.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("sprite360",canvas,ctx,[0.0235565185546875,6.2408447265625E-4,-0.001006317138671875,0.037994384765625,276.8,46.0],ctrans,1,(0+time)%1,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.0377593994140625,-0.004492950439453125,-0.004492950439453125,0.0377593994140625,274.9,74.05],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,-10.0,0.0,1.0,0.0,0.0,-10.0,0.0,0.0,1.0,0.0,-10.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.01722564697265625,-6.103515625E-6,-1.220703125E-5,0.033594512939453126,389.65,31.2],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,-15.145001,-0.0040891524,1.1271044,-0.053015266,0.0,-15.145,-0.15504453,0.065487385,1.1595572,0.0,-15.145,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0219573974609375,2.7618408203125E-4,-4.7760009765625E-4,0.038005828857421875,343.6,109.7],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[-0.025637054443359376,-2.288818359375E-6,-5.340576171875E-6,0.05,317.2,174.6],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0930754,-0.16662678,0.14355136,0.0,-15.145001,-0.0040891524,1.1271044,-0.053015266,0.0,-15.145,-0.15504453,0.065487385,1.1595572,0.0,-15.145,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite360",canvas,ctx,[0.0219573974609375,2.7618408203125E-4,-4.7760009765625E-4,0.038005828857421875,361.9,134.5],ctrans,1,(0+time)%1,0,time);
			fcanvas = Filters.colorMatrix(fcanvas,fcanvas.getContext("2d"),[1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,0.0]);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			ctx.drawImage(imageObj9000007,-240,-180);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("sprite5496",canvas,ctx,[0.05,0.0,0.0,0.05,82.6,113.3],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5497",canvas,ctx,[0.05,0.0,0.0,0.05,534.2,26.4],ctrans,1,(0+time)%1,0,ownerTime(1));
			place("sprite5498",canvas,ctx,[0.05,0.0,0.0,0.05,553.2,379.7],ctrans,1,(0+time)%1,0,ownerTime(2));
			place("sprite5499",canvas,ctx,[0.05,0.0,0.0,0.05,179.05,459.5],ctrans,1,(0+time)%1,0,ownerTime(4));
			place("sprite5500",canvas,ctx,[0.05,0.0,0.0,0.05,-106.15,372.3],ctrans,1,(0+time)%1,0,ownerTime(5));
			place("sprite5501",canvas,ctx,[0.05,0.0,0.0,0.05,284.5,250.6],ctrans,1,(0+time)%1,0,ownerTime(3));
			place("sprite5502",canvas,ctx,[0.05,0.0,0.0,0.05,-2.55,60.7],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5503",canvas,ctx,[0.05,0.0,0.0,0.05,498.4,224.25],ctrans,1,(0+time)%1,0,ownerTime(2));
			place("sprite5504",canvas,ctx,[0.05,0.0,0.0,0.05,257.9,206.95],ctrans,1,(0+time)%1,0,ownerTime(3));
			place("sprite5505",canvas,ctx,[0.05,0.0,0.0,0.05,428.4,-37.85],ctrans,1,(0+time)%1,0,ownerTime(1));
			place("sprite5506",canvas,ctx,[0.05,0.0,0.0,0.05,81.4,412.45],ctrans,1,(0+time)%1,0,ownerTime(4));
			place("sprite5507",canvas,ctx,[0.05,0.0,0.0,0.05,-97.45,309.7],ctrans,1,(0+time)%1,0,ownerTime(5));
			place("sprite5508",canvas,ctx,[0.05,0.0,0.0,0.05,87.45,-135.7],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5509",canvas,ctx,[0.05,0.0,0.0,0.05,450.05,-224.25],ctrans,1,(0+time)%1,0,ownerTime(1));
			place("sprite5510",canvas,ctx,[0.05,0.0,0.0,0.05,790.15,267.7],ctrans,1,(0+time)%1,0,ownerTime(2));
			place("sprite5511",canvas,ctx,[0.05,0.0,0.0,0.05,230.35,2.2],ctrans,1,(0+time)%1,0,ownerTime(3));
			place("sprite5512",canvas,ctx,[0.05,0.0,0.0,0.05,-175.15,239.85],ctrans,1,(0+time)%1,0,ownerTime(5));
			place("sprite5513",canvas,ctx,[0.05,0.0,0.0,0.05,111.35,336.2],ctrans,1,(0+time)%1,0,ownerTime(4));
			var o = clips.pop();
			ctx.globalCompositeOperation = "destination-in";
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(o.clipCanvas,0,0);
			var ms=o.ctx._matrix;
			o.ctx.setTransform(1,0,0,1,0,0);
			o.ctx.globalCompositeOperation = "source-over";
			o.ctx.drawImage(canvas,0,0);
			o.ctx.applyTransforms(ms);
			ctx = o.ctx;
			canvas = o.canvas;
			place("sprite1963",canvas,ctx,[0.04938812255859375,0.007636260986328125,-0.007636260986328125,0.04938812255859375,-10.75,273.75],ctrans,1,(0+time)%1,0,time);
			place("sprite1965",canvas,ctx,[0.05,0.0,0.0,0.05,27.5,293.0],ctrans,1,(0+time)%1,0,time);
			place("sprite1953",canvas,ctx,[0.025591278076171876,-0.04287033081054688,0.04287033081054688,0.025591278076171876,64.95,221.2],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,26.2,257.7],ctrans,1,(0+time)%1,0,time);
			place("sprite499",canvas,ctx,[0.05,0.0,0.0,0.05,574.6,499.2],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.04951553344726563,-0.00678253173828125,0.00678253173828125,0.04951553344726563,250.3,67.05],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,698.85,469.55],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032861328125,-0.0029083251953125,0.0021453857421875,0.024242401123046875,685.1,486.1],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.0243438720703125,661.7,497.5],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,637.85,509.7],ctrans,1,(0+time)%1,0,time);
			place("sprite501",canvas,ctx,[0.030633544921875,0.0,0.0,0.030633544921875,613.45,515.85],ctrans,1,(0+time)%1,0,time);
			place("sprite503",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,677.05,406.2],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,651.4,405.75],ctrans,1,(0+time)%1,0,time);
			place("sprite509",canvas,ctx,[0.038730621337890625,-0.031463623046875,0.031463623046875,0.038730621337890625,99.7,146.8],ctrans,1,(0+time)%1,0,time);
			place("sprite511",canvas,ctx,[0.024637603759765626,-0.028748321533203124,0.03790359497070313,0.03248443603515625,138.35,136.05],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,593.05,420.45],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,575.8,439.25],ctrans,1,(0+time)%1,0,time);
			place("sprite489",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,623.15,415.35],ctrans,1,(0+time)%1,0,time);
			place("sprite3916",canvas,ctx,[-0.008300018310546876,0.04927902221679688,0.04927902221679688,0.008300018310546876,158.6,58.1],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.034252166748046875,0.0,0.0,0.030240631103515624,178.1,40.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.01991424560546875,-0.04577484130859375,0.04577484130859375,0.01991424560546875,27.75,91.1],ctrans,1,(0+time)%1,0,time);
			place("sprite3920",canvas,ctx,[0.028155517578125,-0.022487640380859375,0.031145477294921876,0.038995361328125,64.25,53.55],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.05,0.0,0.0,0.05,84.05,31.45],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.01638946533203125,-0.02537841796875,0.04193954467773438,0.02708587646484375,-0.3,131.7],ctrans,1,(0+time)%1,0,time);
			place("sprite3928",canvas,ctx,[0.05,0.0,0.0,0.05,120.25,34.95],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.00989837646484375,-0.02275238037109375,0.04577484130859375,0.01991424560546875,67.65,52.95],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.021083831787109375,0.019565582275390625,-0.025193023681640624,0.02714691162109375,192.65,35.75],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.028873443603515625,-0.008721160888671874,0.01441192626953125,0.04771575927734375,8.5,95.0],ctrans,1,(0+time)%1,0,time);
			place("sprite499",canvas,ctx,[0.0375,0.0,0.0,0.0375,7.25,136.05],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,182.7,52.05],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,155.2,67.05],ctrans,1,(0+time)%1,0,time);
			place("sprite489",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,128.1,79.55],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,105.85,91.85],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,89.35,108.75],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,74.2,124.2],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,32.1,146.8],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,56.35,138.65],ctrans,1,(0+time)%1,0,time);
			place("sprite1953",canvas,ctx,[0.02725677490234375,-0.025539398193359375,0.034107208251953125,0.03640289306640625,49.9,245.0],ctrans,1,(0+time)%1,0,time);
			place("sprite1953",canvas,ctx,[0.025591278076171876,-0.04287033081054688,0.04287033081054688,0.025591278076171876,81.15,183.15],ctrans,1,(0+time)%1,0,time);
			place("sprite511",canvas,ctx,[0.006261444091796875,-0.03728408813476562,0.04915771484375,0.008255767822265624,171.15,127.45],ctrans,1,(0+time)%1,0,time);
			place("sprite511",canvas,ctx,[0.0211639404296875,-0.031267547607421876,0.0412261962890625,0.0279052734375,189.85,101.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.049131011962890624,-0.009119415283203125,0.009119415283203125,0.049131011962890624,216.65,73.2],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.047473907470703125,-0.015528106689453125,0.015528106689453125,0.047473907470703125,282.55,62.95],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.03626251220703125,-0.03427886962890625,0.03427886962890625,0.03626251220703125,314.05,54.25],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.042398834228515626,-0.026343536376953126,0.026343536376953126,0.042398834228515626,343.55,28.55],ctrans,1,(0+time)%1,0,time);
			place("sprite1957",canvas,ctx,[0.028678131103515626,-0.04083175659179687,0.04083175659179687,0.028678131103515626,369.05,23.35],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,563.8,458.6],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,560.35,483.05],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,784.35,321.9],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,775.55,338.4],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,761.1,355.25],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,746.35,373.4],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,729.35,390.75],ctrans,1,(0+time)%1,0,time);
			place("sprite489",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,703.45,408.0],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,551.9,501.6],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,542.8,522.15],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,527.8,542.15],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,516.35,562.85],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,507.85,583.55],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.0452178955078125,-0.020957183837890626,0.020957183837890626,0.0452178955078125,648.05,460.35],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.042499542236328125,0.0,0.0,0.042499542236328125,623.7,453.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.00989837646484375,-0.02275238037109375,0.04577484130859375,0.01991424560546875,602.9,470.25],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.028873443603515625,-0.008721160888671874,0.01441192626953125,0.04771575927734375,578.3,477.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.040374755859375,0.01313629150390625,-0.01313629150390625,0.040374755859375,684.45,452.2],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.042499542236328125,0.0,0.0,0.042499542236328125,692.35,506.55],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.00989837646484375,-0.02275238037109375,0.04577484130859375,0.01991424560546875,671.55,524.5],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.028873443603515625,-0.008721160888671874,0.01441192626953125,0.04771575927734375,646.95,531.55],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.041576385498046875,0.008673858642578126,-0.008673858642578126,0.041576385498046875,719.8,503.3],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,775.25,549.1],ctrans,1,(0+time)%1,0,time);
			place("sprite501",canvas,ctx,[0.030633544921875,0.0,0.0,0.030633544921875,779.0,479.25],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.023973846435546876,-0.00624237060546875,0.01255950927734375,0.04823150634765625,750.6,515.85],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.021648406982421875,-0.00653839111328125,0.01441192626953125,0.04771575927734375,634.3,553.45],ctrans,1,(0+time)%1,0,time);
			place("sprite499",canvas,ctx,[0.0375,0.0,0.0,0.0375,631.4,569.25],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,657.8,580.4],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,683.8,577.9],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,758.0,560.2],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,731.25,567.1],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,709.8,574.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.029278564453125,0.0306671142578125,-0.0306671142578125,0.029278564453125,779.15,522.15],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.042499542236328125,0.0,0.0,0.042499542236328125,773.35,422.85],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.00989837646484375,-0.02275238037109375,0.04577484130859375,0.01991424560546875,752.55,441.5],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.028873443603515625,-0.008721160888671874,0.01441192626953125,0.04771575927734375,728.45,448.05],ctrans,1,(0+time)%1,0,time);
			place("sprite499",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,731.1,466.35],ctrans,1,(0+time)%1,0,time);
			place("sprite501",canvas,ctx,[0.030633544921875,0.0,0.0,0.030633544921875,757.85,476.35],ctrans,1,(0+time)%1,0,time);
			place("sprite1961",canvas,ctx,[0.01638946533203125,-0.02537841796875,0.04193954467773438,0.02708587646484375,196.2,7.5],ctrans,1,(0+time)%1,0,time);
			place("sprite499",canvas,ctx,[0.0375,0.0,0.0,0.0375,203.75,11.85],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,377.2,-38.95],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,351.7,-27.15],ctrans,1,(0+time)%1,0,time);
			place("sprite489",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,324.6,-14.65],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,302.35,-2.35],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,285.85,-0.45],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,270.7,10.0],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,228.6,22.6],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,252.85,14.45],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.0375,0.0,0.0,0.0375,113.75,-17.95],ctrans,1,(0+time)%1,0,time);
			place("sprite487",canvas,ctx,[0.032999420166015626,0.01053619384765625,0.0,0.032999420166015626,88.3,-16.25],ctrans,1,(0+time)%1,0,time);
			place("sprite489",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,62.85,-3.15],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,39.95,6.7],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,25.8,16.1],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,7.8,24.9],ctrans,1,(0+time)%1,0,time);
			place("sprite507",canvas,ctx,[0.032999420166015626,0.0,0.0,0.032999420166015626,-13.1,36.15],ctrans,1,(0+time)%1,0,time);
			place("shape5517",canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
	ctx.restore();
}

/* Appended inside each isolated JPEXS map closure by restore-native-maps.py. */
var objectTextureCache=new Map();
function layerContext(target){canvas=target;const ctx=target.getContext('2d'),m=ctx.getTransform();if(!ctx._matrix)enhanceContext(ctx);ctx._matrix=[m.a,m.b,m.c,m.d,m.e,m.f];return ctx;}
function objectTexture(item){
 const linear=item.matrix.slice(0,4),key=JSON.stringify([item.obj,linear,item.frame,item.ratio,item.time,item.ctrans,item.blendMode]);let cached=objectTextureCache.get(key);if(cached)return cached;
 for(const size of [256,512,1024]){
  const c=createCanvas(size,size),ctx=layerContext(c),half=size/2;ctx.setTransform(1,0,0,1,half,half);placeRaw(item.obj,c,ctx,[...linear,0,0],item.ctrans,item.blendMode,item.frame,item.ratio,item.time);
  const data=ctx.getImageData(0,0,size,size).data;let left=size,top=size,right=0,bottom=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(data[(y*size+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
  if(right===0)return null;if((left===0||top===0||right===size||bottom===size)&&size<1024)continue;
  if(left===0||top===0||right===size||bottom===size)throw Error('Native decoration exceeds its texture bounds: '+item.obj);
  const image=createCanvas(right-left,bottom-top);image.getContext('2d').drawImage(c,left,top,right-left,bottom-top,0,0,right-left,bottom-top);
  let weight=0,footSum=0;for(let y=Math.max(top,bottom-3);y<bottom;y++)for(let x=left;x<right;x++){const a=data[(y*size+x)*4+3];weight+=a;footSum+=x*a;}
  cached={image,offsetX:left-half,offsetY:top-half,footX:(weight?footSum/weight:(left+right)/2)-half,footY:bottom-half};objectTextureCache.set(key,cached);return cached;
 }
}
function collectNativeObjects(owners){
 ownerFrames=owners;const scratch=createCanvas(1,1),ctx=layerContext(scratch),items=[];
 try{for(const region of nativeObjectRegions){ctx.save();ctx.transform(...region.matrix);objectCollector=items;objectLocation=region.location;eval('sprite'+region.symbol+'(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,ownerTime(region.location))');objectCollector=null;ctx.restore();}
  return items.flatMap(item=>{const texture=objectTexture(item);return texture?[{x:item.matrix[4],y:item.matrix[5],location:item.location,...texture}]:[];});
 }finally{objectCollector=null;canvas=null;}
}

const loaded=[imageObj357,imageObj362,imageObj364,imageObj366,imageObj368,imageObj371,imageObj373,imageObj375,imageObj377,imageObj380,imageObj382,imageObj384,imageObj386,imageObj389,imageObj391,imageObj393,imageObj395,imageObj399,imageObj401,imageObj403,imageObj405,imageObj409,imageObj411,imageObj413,imageObj418,imageObj420,imageObj422,imageObj424,imageObj445,imageObj447,imageObj449,imageObj451,imageObj454,imageObj456,imageObj458,imageObj460,imageObj464,imageObj466,imageObj468,imageObj470,imageObj473,imageObj475,imageObj477,imageObj479,imageObj5514,imageObj5515,imageObj5516,imageObj9000007].map(im=>new Promise(resolve=>{if(im.complete&&im.naturalWidth)resolve();else{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true});}}));
Promise.all(loaded).then(()=>{window.NativeMaps[level]={draw(target,owners){ownerFrames=owners;const ctx=layerContext(target);try{sprite5518(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,0);}finally{canvas=null;}},drawGround(target,owners){groundOnly=true;try{this.draw(target,owners);}finally{groundOnly=false;}},objects:collectNativeObjects};window.dispatchEvent(new Event('native-map-ready'));});
})();