/* Original map geometry exported by JPEXS; isolated from the game renderer. */
(function(){var Filters,BlendModes,canvas,ownerFrames={},level=2;
var groundOnly=false,objectCollector=null,objectLocation=0,nativeObjectRegions=[{"symbol":5972,"location":1,"matrix":[0.05,0.0,0.0,0.05,172.6,464.3]},{"symbol":5973,"location":0,"matrix":[0.05,0.0,0.0,0.05,548.3,150.9]},{"symbol":5974,"location":2,"matrix":[0.05,0.0,0.0,0.05,34.9,217.8]}];
var nativeObjectSymbols=new Set(nativeObjectRegions.map(r=>'sprite'+r.symbol));
function ownerTime(location){return ownerFrames[location]??0;}
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
function shape514(ctx,ctrans,frame,ratio,time){
	var pathData="M -292 296 L -303 298 -309 297 -310 290 -308 285 -295 284 -285 285 -285 291 -292 296";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -289 249 Q -289 258 -292 261 L -316 267 -332 262 -343 252 Q -343 237 -316 233 -289 228 -289 249 M -215 180 L -220 185 -275 183 -288 166 Q -288 146 -251 143 -215 141 -215 180 M -343 95 L -353 94 -355 88 -345 75 Q -335 66 -333 67 L -334 59 Q -317 64 -312 69 -309 73 -309 80 -309 88 -315 91 L -343 95 M -334 13 L -343 10 -351 8 -349 12 -334 13 M -177 221 L -161 234 -155 243 -157 248 -185 248 -226 236 -234 232 -228 227 -213 227 -194 223 -177 221 M -546 -14 L -486 -18 -427 -10 -323 -4 -275 7 -268 0 -235 0 -229 7 -230 11 -250 15 -248 17 Q -237 23 -237 28 L -239 34 -250 34 -268 28 -271 33 -285 47 -300 47 -320 34 Q -329 34 -347 46 L -374 68 -370 77 Q -370 81 -397 99 L -367 104 -311 113 Q -275 122 -275 134 L -295 150 Q -316 162 -316 169 L -308 195 -310 205 Q -316 213 -341 213 L -369 209 -394 205 -395 206 -391 207 Q -378 210 -378 213 L -380 218 -403 220 -408 227 -402 230 -402 233 -410 241 -411 257 -450 274 -463 274 -465 275 -466 276 Q -457 277 -457 285 L -464 299 Q -464 309 -453 316 L -429 329 Q -414 322 -396 322 L -369 327 -340 323 -333 324 Q -320 314 -312 317 L -273 325 Q -258 324 -258 339 L -257 344 -265 354 -268 354 -275 360 -278 360 -278 362 -354 371 -358 374 -376 374 -389 379 -420 375 -426 374 -477 377 -507 382 -525 377 -557 376 Q -564 377 -571 369 L -578 359 -595 334 -604 311 -602 302 -594 292 -606 266 -612 236 Q -612 222 -585 178 L -559 127 Q -559 115 -604 49 L -612 57 -614 55 -615 47 Q -608 9 -596 2 -583 -6 -546 -14 M -335 357 L -340 359 -339 359 -335 357 M -344 337 L -342 337 -337 336 -338 334 -340 334 -354 334 -344 337 M -404 356 L -401 357 -396 357 -393 357 -403 355 -404 356 M -348 291 L -350 301 Q -355 310 -370 310 L -380 312 -404 313 -437 307 -443 291 Q -443 285 -435 277 -427 269 -423 268 -348 261 -348 291";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -524 285 L -524 284 -540 288 -523 289 -524 285 M -580 -14 Q -565 -28 -548 -28 L -517 -25 -507 -26 -467 -20 -466 -20 Q -445 -21 -436 -12 L -445 -10 -475 -6 -491 -13 -506 -11 -520 -13 -563 -1 Q -589 9 -601 18 L -609 32 -608 41 -589 65 -589 67 -567 100 -565 104 -562 105 -562 104 -560 104 -558 105 -555 105 -554 107 -535 121 -529 119 -507 124 -500 122 Q -485 129 -471 132 L -454 132 -445 125 Q -438 127 -435 138 L -434 139 -434 138 -426 147 -361 143 Q -349 143 -347 150 L -349 150 -421 157 -418 162 Q -407 183 -397 183 L -380 179 -368 180 Q -357 184 -357 200 L -359 200 Q -370 187 -378 187 L -405 192 -422 170 -429 158 Q -438 158 -447 140 L -473 142 -467 149 -474 154 -485 149 Q -493 144 -503 144 L -508 144 -509 144 -505 149 -506 150 -529 142 -542 138 -544 137 -561 153 -579 169 -580 173 Q -581 186 -595 199 L -602 216 -605 236 -599 259 -599 261 -593 266 Q -586 258 -578 262 -556 274 -544 274 L -532 270 -522 269 Q -518 251 -503 251 L -494 258 -486 265 -458 250 -422 249 -447 250 -467 266 Q -479 274 -488 274 L -498 267 -506 259 -510 268 -508 268 -502 270 -502 275 -514 282 -516 291 -504 298 -494 309 -472 302 -459 294 -459 296 -475 307 -503 317 -508 305 Q -512 298 -525 298 L -554 302 -568 314 -582 314 -584 318 -551 372 -521 376 -513 375 -492 375 -482 374 -480 370 -449 370 -448 374 -448 375 -447 375 -448 376 -450 387 -455 382 -455 381 -458 383 -464 383 -471 385 -489 407 -502 444 -498 461 -503 493 -498 525 -503 561 -498 599 -509 623 -520 659 -522 690 Q -523 708 -530 720 L -546 735 Q -557 750 -566 750 L -573 749 Q -576 748 -580 753 L -584 751 -585 734 Q -600 723 -610 699 -622 671 -619 643 L -622 595 -627 541 -622 499 -629 382 -637 250 -636 217 -630 217 -629 224 -625 219 -624 216 -620 197 -622 195 -622 98 -623 77 -625 70 -624 67 -624 57 Q -633 26 -620 20 L -617 10 -606 0 Q -594 0 -580 -14";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -617 41 L -618 25 Q -618 11 -569 -10 -520 -31 -520 -10 -520 -5 -522 -6 -572 3 -601 23 -589 34 -578 67 L -561 93 -547 114 -550 122 -534 126 Q -522 126 -516 132 L -499 144 -500 146 -541 133 Q -565 123 -571 111 L -570 109 -563 107 -581 96 -593 86 -608 68 -610 65 -612 40 -617 41 M -604 192 L -591 188 Q -579 158 -568 147 -543 125 -506 151 L -515 153 -522 147 -534 144 Q -549 144 -558 155 L -570 171 -578 186 -586 199 Q -606 208 -609 226 L -610 256 -612 256 -613 243 -613 240 -614 216 -604 192 M -607 30 L -598 50 -584 67 -593 43 Q -599 30 -606 27 L -607 30 M -600 57 L -604 49 -605 49 -600 57 M -395 144 L -358 146 -365 149 -411 149 -432 141 -446 123 -445 120 -443 119 -434 125 -428 133 Q -411 149 -395 144 M -590 318 L -571 306 Q -557 295 -539 291 L -525 289 -518 268 Q -512 252 -507 252 L -484 262 -462 253 Q -447 246 -444 256 -459 271 -483 271 L -507 265 -508 279 -518 290 -512 292 Q -496 298 -496 305 L -500 308 -533 296 Q -544 296 -562 309 L -581 324 -569 348 -559 371 Q -559 376 -562 374 L -567 369 -568 367 -576 355 -585 333 -590 318";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -617 41 L -612 40 -610 65 -606 82 -593 86 -581 96 -575 108 -564 142 -567 144 -586 103 Q -590 103 -595 99 L -595 108 -598 165 -604 192 -614 216 -617 219 -621 216 -626 78 Q -634 44 -617 41 M -613 243 L -613 320 -608 364 -612 383 -607 499 Q -607 541 -610 561 L -608 599 Q -609 624 -618 624 L -620 623 -621 622 -621 491 -626 423 Q -627 381 -634 357 L -635 242 -633 217 -625 222 Q -625 219 -619 219 L -613 240 -613 243 M -590 318 L -585 333 -576 355 -568 367 -567 369 -561 386 -566 443 -571 501 -574 557 -577 616 -572 675 -573 691 -586 710 -591 709 -592 697 -599 704 -601 702 -601 691 Q -599 659 -602 636 L -607 589 -602 494 -605 451 -603 307 Q -595 308 -590 318";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite515(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape514",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite4894(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite433",canvas,ctx,[0.779571533203125,0.0,0.0,0.779571533203125,-446.0,-269.0],ctrans.merge(new cxform(0,15,0,0,230,230,230,256)),1,(0+time)%4,0,time);
			break;
	}
}

function shape5963(ctx,ctrans,frame,ratio,time){
	var pathData="M 13516 1705 Q 13696 1865 13782 2035 13816 2101 13936 2289 14036 2444 14104 2678 14171 2911 14370 3101 14569 3291 14856 3495 15143 3698 15244 3891 15344 4082 15349 4271 15354 4459 15377 4570 15424 4797 15443 5098 15457 5317 15457 5620 15457 5879 15422 6010 L 15417 6031 15349 6622 Q 15275 7217 15242 7405 15206 7600 15074 7792 14985 7922 14797 8119 14574 8351 14507 8434 14359 8617 14302 8787 14265 8901 14215 9151 14150 9375 13987 9522 13921 9582 13760 9654 L 13683 9687 13607 9742 13220 9953 Q 13141 9995 13075 10058 L 12970 10163 Q 12923 10210 12843 10257 12702 10340 12568 10340 L 12565 10340 Q 12530 10441 12503 10580 L 12451 10839 Q 12374 11137 12122 11337 11998 11436 11952 11594 11929 11675 11911 11886 11895 12074 11854 12171 11792 12319 11637 12407 11389 12548 11183 12620 10989 12687 10737 12723 L 10152 12784 9282 12867 8420 12867 Q 8158 12831 7918 12780 L 7542 12698 Q 7091 12604 6340 12567 L 5395 12567 Q 4347 12631 3734 12755 3418 12818 3195 12848 2804 12901 2160 12942 L 1420 12942 Q 166 12960 -287 12658 -458 12543 -530 12372 -571 12274 -595 12082 L -689 11445 Q -760 10980 -760 10935 -760 10327 -31 9241 120 9017 567 8400 L 746 8149 766 8101 Q 838 7932 925 7763 1024 7571 1102 7455 L 1164 7317 Q 1274 7080 1307 7028 1396 6887 1457 6725 L 1534 6574 Q 1600 6446 1600 6426 1600 6358 1488 6269 1376 6180 1376 6132 1376 6093 1382 6066 L 1380 6063 Q 1261 5968 1261 5906 1261 5872 1305 5818 1307 5762 1317 5692 L 1299 5607 Q 1288 5541 1288 5433 1288 5302 1324 5151 L 1319 5147 Q 1206 5052 1181 5040 1130 5014 1085 4949 1059 4912 1049 4884 L 1020 4866 Q 1020 4841 1054 4809 1068 4778 1102 4740 L 1200 4625 1269 4511 Q 1314 4442 1357 4407 1373 4394 1427 4371 L 1517 4332 Q 1552 4315 1574 4281 L 1603 4222 Q 1665 4038 1665 3997 1665 3957 1638 3922 1610 3887 1610 3843 1610 3779 1638 3741 1676 3691 1780 3655 1841 3635 1869 3559 1897 3486 1965 3466 2069 3436 2253 3365 2478 3155 2720 3155 L 3502 2815 Q 4365 2441 4735 2295 L 5326 2054 Q 5584 1946 5872 1888 6160 1830 7220 1465 L 7360 1465 Q 7369 1469 7371 1491 7372 1510 7400 1510 7598 1510 7886 1422 7992 1390 8405 1239 8726 1122 8913 1083 9123 1039 9283 1059 9372 1034 9372 1002 9372 947 9498 930 L 9793 920 9821 936 Q 10006 1023 10176 914 10213 890 10251 875 L 10517 858 10543 865 Q 10728 924 10923 866 11008 841 11098 840 11249 832 11278 733 L 11286 731 Q 11370 717 11427 745 11490 778 11592 895 11623 926 11713 966 11794 1002 11822 1005 L 12408 1039 12822 1065 Q 12809 1149 12868 1249 12912 1326 12968 1395 L 13021 1379 Q 13156 1605 13187 1605 13212 1605 13227 1580 13242 1555 13267 1555 13347 1555 13516 1705 M 13600 9721 L 13447 9782 Q 13028 9951 12947 10072 12875 10184 12578 10306 L 12577 10307 12572 10320 Q 12758 10319 12938 10167 L 13077 10040 Q 13157 9966 13210 9935 13350 9853 13586 9729 L 13600 9721 M 1043 4852 L 1044 4844 Q 1038 4851 1038 4857 L 1044 4861 1043 4852 M 1333 4926 L 1331 4936 1335 4954 1342 4948 1333 4926 M 1360 4925 L 1361 4904 1349 4911 1360 4925 M 1340 5175 L 1325 5297 Q 1311 5411 1311 5431 1311 5525 1325 5608 L 1327 5616 1333 5548 1323 5396 Q 1323 5284 1376 5192 L 1339 5164 1340 5175 M 1277 5890 Q 1277 5946 1352 6016 L 1351 6014 Q 1303 5917 1303 5863 L 1304 5839 Q 1277 5873 1277 5890 M 1346 9731 L 1338 9715 1333 9711 1338 9723 1346 9731";
	ctx.fillStyle=tocolor(ctrans.apply([51,51,0,0.99215686]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite5964(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,499.0,-121.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,1912.0,-1422.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-463.0,1040.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,2739.0,455.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3066253662109375,0.0,0.0,0.3066253662109375,-1245.0,2700.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,3417.0,-561.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,2817.0,-1341.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,556.0,2299.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.3066253662109375,0.0,0.0,0.3066253662109375,-605.0,2583.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,1917.0,922.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,497.0,2478.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4441680908203125,0.0,0.0,0.4441680908203125,3417.0,-21.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,1575.0,1834.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,2623.0,1118.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,3301.0,694.0],ctrans,1,(0+time)%4,0,time);
			place("sprite416",canvas,ctx,[1.0,0.0,0.0,1.0,750.0,1001.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,318.0,1985.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,2023.0,1036.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[0.8499908447265625,0.0,0.0,0.8499908447265625,222.0,2799.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function sprite5965(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.7296295166015625,0.0,0.0,0.7296295166015625,3150.0,-677.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4696807861328125,0.0,0.0,0.4696807861328125,359.0,-1038.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7296295166015625,0.0,0.0,0.7296295166015625,5370.0,-1177.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7296295166015625,0.0,0.0,0.7296295166015625,6870.0,283.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,6611.0,1464.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7296295166015625,0.0,0.0,0.7296295166015625,4448.0,947.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.7296295166015625,0.0,0.0,0.7296295166015625,3570.0,-1057.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4696807861328125,0.0,0.0,0.4696807861328125,1179.0,-57.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4696807861328125,0.0,0.0,0.4696807861328125,2019.0,1200.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4696807861328125,0.0,0.0,0.4696807861328125,1896.0,-1121.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.4696807861328125,0.0,0.0,0.4696807861328125,1459.0,1100.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,8031.0,1421.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,119.0,-80.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,5259.0,1900.0],ctrans,1,(0+time)%4,0,time);
			place("sprite426",canvas,ctx,[1.0,0.0,0.0,1.0,6236.0,-910.0],ctrans,1,(0+time)%4,0,time);
			place("sprite407",canvas,ctx,[1.0,0.0,0.0,1.0,2347.0,-463.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,4787.0,707.0],ctrans,1,(0+time)%4,0,time);
			place("sprite416",canvas,ctx,[1.0,0.0,0.0,1.0,1347.0,-898.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,8022.0,857.0],ctrans,1,(0+time)%4,0,time);
			place("sprite388",canvas,ctx,[1.0,0.0,0.0,1.0,7522.0,4039.0],ctrans,1,(0+time)%4,0,time);
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

function sprite5966(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-1037.0,672.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-697.0,2396.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,963.0,335.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,1444.0,2216.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,1823.0,-725.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,2343.0,827.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.238433837890625,0.0,0.0,0.238433837890625,2243.0,1588.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,964.0,2997.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,-3218.0,271.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,-3655.0,700.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,-2740.0,1821.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,3423.0,2276.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,5824.0,2196.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,7625.0,1696.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,4104.0,455.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,3527.0,-261.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,6165.0,415.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,7625.0,271.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.398284912109375,0.0,0.0,0.398284912109375,9186.0,480.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-4158.0,2155.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-4338.0,3876.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,-2478.0,3796.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,286.0,4416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,2366.0,4416.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,4781.0,4316.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,6184.0,3876.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.725830078125,0.0,0.0,0.725830078125,7785.0,1596.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,534.0,-441.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,2252.0,-1265.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,4277.0,-1236.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,6404.0,-898.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,8832.0,-898.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,1177.0,-1465.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,-587.0,-125.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,7124.0,-1604.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,9988.0,-1683.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.5,0.0,0.0,0.5,5428.0,-1803.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,3244.0,-2475.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,342.0,-2079.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,-518.0,-1452.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,-2493.0,-514.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,-1563.0,-968.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,1508.0,-2475.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,2268.0,-2895.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,4388.0,-2971.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,6227.0,-2631.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,8127.0,-2375.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,7270.0,-2715.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,9239.0,-2436.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.399993896484375,0.0,0.0,0.399993896484375,8312.0,-2860.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,3850.0,-3599.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,5143.0,-2967.0],ctrans,1,(0+time)%4,0,time);
			place("sprite370",canvas,ctx,[0.329986572265625,0.0,0.0,0.329986572265625,3136.0,-3339.0],ctrans,1,(0+time)%4,0,time);
			place("sprite426",canvas,ctx,[1.0,0.0,0.0,1.0,3520.0,3359.0],ctrans,1,(0+time)%4,0,time);
			place("sprite407",canvas,ctx,[1.0,0.0,0.0,1.0,3307.0,1957.0],ctrans,1,(0+time)%4,0,time);
			place("sprite416",canvas,ctx,[1.0,0.0,0.0,1.0,-464.0,2127.0],ctrans,1,(0+time)%4,0,time);
			place("sprite397",canvas,ctx,[1.0,0.0,0.0,1.0,8271.0,1479.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[1.0,0.0,0.0,1.0,6513.0,2747.0],ctrans,1,(0+time)%4,0,time);
			place("sprite379",canvas,ctx,[-0.8499908447265625,0.0,0.0,0.8499908447265625,8879.0,617.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
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

function shape5967(ctx,ctrans,frame,ratio,time){
	var pathData="M 14477 11507 Q 14974 11412 15120 11308 15184 11262 15222 11191 L 15287 11042 Q 15396 10793 15483 10769 15567 10747 15567 10942 15567 11049 15469 11589 15369 12139 15367 12187 15359 12342 15208 12470 15031 12621 14697 12687 14610 12705 14386 12780 L 13948 12929 Q 13344 13127 13077 13127 12969 13127 12938 13068 12927 13048 12927 13000 12927 12920 12951 12879 12963 12860 13004 12826 13077 12765 13067 12597 L 13097 12395 Q 13115 12274 13147 12192 13183 12100 13350 12006 13473 11938 13721 11842 L 14138 11682 Q 14365 11587 14477 11507";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,6247,5947);
	ctx.transform(1.00125,0,0,1.0016666666666667,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj357);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function sprite5968(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape5967",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
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

function sprite5969(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,575.0,1113.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,1010.0,41.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,4071.0,1318.0],ctrans,1,(0+time)%1,0,time);
			place("sprite3724",canvas,ctx,[0.8067626953125,-0.5878143310546875,0.5878143310546875,0.8067626953125,2817.0,-2607.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.7799072265625,-0.62274169921875,0.62274169921875,0.7799072265625,2979.0,-2358.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.7685394287109375,-0.6370391845703125,0.6370391845703125,0.7685394287109375,3190.0,-2088.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.688507080078125,-0.722686767578125,0.722686767578125,0.688507080078125,3361.0,-1886.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[1.0,0.0,0.0,1.0,4057.0,-1048.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[1.0,0.0,0.0,1.0,4057.0,-748.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.9672088623046875,0.2508392333984375,-0.2508392333984375,0.9672088623046875,4024.0,-381.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.845672607421875,0.530120849609375,-0.530120849609375,0.845672607421875,3889.0,5.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3740",canvas,ctx,[1.0,0.0,0.0,1.0,3881.0,-1051.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.5410614013671875,-0.83807373046875,0.83807373046875,0.5410614013671875,3489.0,-1695.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.8416595458984375,-0.532928466796875,0.532928466796875,0.8416595458984375,3778.0,-1473.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.7188568115234375,0.6914520263671875,-0.6914520263671875,0.7188568115234375,3693.0,341.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.6423492431640625,0.7625885009765625,-0.7625885009765625,0.6423492431640625,3400.0,621.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.7068634033203125,0.702789306640625,-0.702789306640625,0.7068634033203125,3177.0,815.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.0,0.0,0.0,1.0,1964.0,773.0],ctrans,1,(0+time)%4,0,time);
			place("sprite4894",canvas,ctx,[1.0,0.0,0.0,1.0,5307.0,-778.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,-7.0,416.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,4582.0,545.0],ctrans,1,(0+time)%1,0,time);
			break;
	}
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

function sprite5970(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,3722.0,901.0],ctrans,1,(0+time)%1,0,time);
			place("sprite3769",canvas,ctx,[1.0,0.0,0.0,1.0,726.0,553.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.0,0.0,0.0,1.0,1598.0,328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3735",canvas,ctx,[1.0,0.0,0.0,1.0,85.0,452.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3769",canvas,ctx,[1.0,0.0,0.0,1.0,-1227.0,614.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3740",canvas,ctx,[1.0,0.0,0.0,1.0,-508.0,607.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3735",canvas,ctx,[1.0,0.0,0.0,1.0,-2381.0,560.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3740",canvas,ctx,[1.0,0.0,0.0,1.0,-1758.0,546.0],ctrans,1,(0+time)%4,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,2482.0,1580.0],ctrans,1,(0+time)%1,0,time);
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,641.0,-46.0],ctrans,1,(0+time)%1,0,time);
			place("sprite3740",canvas,ctx,[0.9897613525390625,-0.139495849609375,0.139495849609375,0.9897613525390625,-3051.0,756.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3769",canvas,ctx,[-0.9258575439453125,0.37481689453125,-0.37481689453125,-0.9258575439453125,-2756.0,999.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3735",canvas,ctx,[0.9941253662109375,-0.1049652099609375,0.1049652099609375,0.9941253662109375,-4284.0,941.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.3311614990234375,0.516998291015625,0.942413330078125,0.1884765625,-3764.0,81.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.508331298828125,0.470062255859375,0.8592376708984375,0.2855377197265625,-3560.0,111.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.59185791015625,0.438934326171875,0.8037109375,0.3311767578125,-3302.0,202.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.62664794921875,0.4238128662109375,0.7766876220703125,0.3501739501953125,-3054.0,294.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.640899658203125,0.41741943359375,0.7652435302734375,0.357940673828125,-2785.0,413.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.7261199951171875,0.3725433349609375,0.6847991943359375,0.404388427734375,-2584.0,509.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[-0.84075927734375,0.290283203125,0.5367584228515625,0.466583251953125,-2393.0,582.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[0.6599884033203125,0.0,0.0,0.6599884033203125,-3708.0,-328.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.94415283203125,-0.3264007568359375,0.3264007568359375,0.94415283203125,-1290.0,717.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3724",canvas,ctx,[0.8618621826171875,-0.503997802734375,0.503997802734375,0.8618621826171875,-1240.0,921.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function shape3923(ctx,ctrans,frame,ratio,time){
	var pathData="M -590 341 L -588 340 -542 340 -539 352 -537 354 -538 363 -550 364 -582 357 -591 344 -590 341 M -624 303 L -626 299 -633 297 -632 299 Q -630 303 -624 303 M -631 283 Q -613 288 -613 303 L -615 308 Q -618 312 -627 312 L -650 293 Q -650 277 -631 283 M -686 179 L -684 175 -683 175 Q -649 171 -649 190 L -650 195 -660 196 -677 193 -686 179 M -609 149 L -620 151 Q -633 149 -633 141 L -631 137 -615 140 -609 149 M -619 19 L -615 17 -624 19 -619 19 M -582 224 L -574 232 -573 236 -576 244 Q -583 252 -607 252 -626 252 -626 238 -611 222 -582 224 M -597 81 L -564 83 -588 106 -602 107 -609 98 -603 90 -605 82 -597 81 M -606 15 L -599 29 -615 42 -626 39 Q -630 35 -633 35 L -655 30 Q -650 18 -632 13 L -607 11 -606 15 M -571 -10 Q -540 -20 -509 -10 L -450 -2 Q -410 5 -410 24 L -418 41 -427 54 Q -427 65 -391 78 -355 90 -355 114 -355 132 -372 137 -390 143 -390 151 L -387 186 -436 234 -403 250 Q -379 264 -375 284 L -359 314 Q -347 330 -347 342 L -379 369 Q -412 394 -419 394 L -430 390 -465 386 -486 390 -516 384 Q -527 378 -527 369 -527 357 -513 353 L -487 342 -521 325 -582 313 -587 304 Q -587 275 -572 263 L -530 224 -538 216 -552 213 -571 213 Q -573 218 -578 218 L -590 204 -597 184 -590 164 Q -581 148 -567 148 L -504 172 -498 163 -495 153 Q -495 142 -532 143 L -545 122 -552 128 -557 121 -552 104 -543 89 Q -592 59 -592 49 -592 39 -577 25 L -592 16 -597 7 Q -597 -1 -571 -10";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -513 -2 L -535 -1 -539 -5 -536 -8 Q -501 -16 -489 2 L -495 6 -497 0 -513 -2";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -482 -8 L -464 -2 -410 7 -408 9 Q -396 7 -396 22 L -400 53 -408 79 -394 82 Q -351 90 -351 108 L -352 113 -351 118 -355 144 Q -354 161 -360 198 L -367 251 Q -351 333 -326 352 L -327 357 -332 357 -333 354 -348 414 -357 476 -363 477 -369 476 -369 472 -378 486 -377 472 Q -377 432 -467 420 L -543 415 -543 404 -529 404 -528 405 -514 398 -510 394 -506 395 -497 392 -497 397 -476 393 Q -464 384 -457 384 L -414 393 -370 355 Q -367 355 -366 357 L -362 359 Q -356 359 -347 352 -362 339 -369 317 L -371 308 -379 288 -377 286 -379 282 Q -416 277 -429 260 L -448 275 -454 271 Q -457 266 -462 266 L -468 270 -473 273 -494 259 -500 254 -501 258 -507 260 -512 258 -517 255 -538 259 -562 261 -581 255 -558 252 -539 249 -515 245 -515 239 -513 237 -516 234 -532 218 -527 211 -514 204 -516 200 -537 185 Q -541 175 -558 175 -563 175 -576 184 L -576 182 Q -576 154 -537 174 -499 194 -499 206 -499 216 -517 219 L -504 227 -490 235 -494 230 -487 226 -449 235 Q -431 212 -422 212 L -414 203 -387 179 -398 161 -401 148 -391 132 Q -368 129 -366 120 -364 109 -359 107 -368 101 -391 93 L -470 87 -500 103 -510 96 -524 94 -549 90 -541 85 -523 85 Q -510 84 -506 89 L -499 95 -489 90 -494 78 -493 74 -476 77 -472 70 -455 79 -460 72 -458 66 -440 69 -443 59 -438 49 -448 37 -424 30 -415 14 Q -477 5 -485 -5 L -482 -8 M -463 244 L -464 246 -457 244 -455 242 -463 244 M -435 58 L -437 59 -433 67 -435 58 M -336 350 L -336 352 -336 354 -333 353 -336 350";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -687 92 L -692 100 -695 97 -692 92 -687 92";
	ctx.fillStyle=tocolor(ctrans.apply([153,153,153,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -471 96 L -468 89 -481 95 -471 96 M -464 88 L -469 99 -482 100 -488 105 -510 106 -524 103 -537 101 -538 97 -517 95 -504 99 -481 93 -473 83 -447 82 -420 88 -396 89 -410 92 -464 88 M -401 284 L -405 285 -420 278 Q -430 272 -435 272 L -465 276 Q -479 276 -482 266 -486 254 -492 252 L -493 257 -565 268 -568 264 -530 256 -498 251 Q -485 239 -479 248 L -464 269 -445 269 -439 265 Q -431 265 -417 272 L -401 284";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -432 382 Q -413 386 -413 398 L -419 431 -467 420 -503 416 Q -495 398 -477 395 -454 376 -432 382";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite5971(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite434",canvas,ctx,[1.0,0.0,0.0,1.0,-1768.0,1176.0],ctrans,1,(0+time)%1,0,time);
			place("sprite3714",canvas,ctx,[0.8933868408203125,-0.4463653564453125,0.4463653564453125,0.8933868408203125,-676.0,-252.0],ctrans,1,(0+time)%4,0,time);
			place("sprite433",canvas,ctx,[1.0,0.0,0.0,1.0,-1486.0,-611.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3714",canvas,ctx,[-0.5807952880859375,0.5623626708984375,-0.945159912109375,-0.473236083984375,1426.0,-799.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3714",canvas,ctx,[-0.5948486328125,0.547760009765625,-0.9332122802734375,-0.4969329833984375,1061.0,-663.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function sprite3924(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3923",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function sprite5972(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite3808",canvas,ctx,[1.0,0.0,0.0,1.0,-323.0,-1165.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-1591.0,-254.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-376.0,-381.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1593.0,-871.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,461.0,-1010.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-179.0,-942.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,7942.0,1879.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-1827.0,656.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,134.0,-701.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,893.0,-901.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2433.0,1389.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3543.0,1249.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,3012.0,1202.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3143.0,1429.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-2666.0,1507.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-986.0,1646.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,414.0,2026.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-3287.0,2466.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-1827.0,2866.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,-297.0,2965.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,1653.0,2965.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,3253.0,3436.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2522.0,-62.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,521.0,-501.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1882.0,-321.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6002.0,859.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6322.0,1079.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6842.0,1129.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,7182.0,1389.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,7582.0,1309.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,7502.0,1658.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,8282.0,410.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,9002.0,219.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,8702.0,549.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,8522.0,859.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,8642.0,1159.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,8282.0,1389.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2443.0,-782.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6882.0,1822.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,6482.0,1579.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,-1600.0,-2127.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,57.0,82.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,1271.0,-438.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,7272.0,2372.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,6172.0,2372.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1664.0,-2121.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1161.0,-1662.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2000.0,-1861.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,3686.0,-688.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4043.0,-631.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4763.0,-722.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,5447.0,-501.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,2074.0,-1208.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,4446.0,-178.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3143.0,-321.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,134.0,-2581.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,654.0,-2761.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1300.0,-3250.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1882.0,-3738.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1733.0,-3178.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1073.0,-2841.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,654.0,-2281.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-486.0,-2399.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-179.0,-2181.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[1.0,0.0,0.0,1.0,8111.0,-1170.0],ctrans,1,(0+time)%4,0,time);
			place("sprite472",canvas,ctx,[0.79998779296875,0.0,0.0,0.79998779296875,9832.0,-904.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,9350.0,-2456.0],ctrans,1,(0+time)%4,0,time);
			place("sprite481",canvas,ctx,[1.0,0.0,0.0,1.0,7347.0,-272.0],ctrans,1,(0+time)%4,0,time);
			place("sprite3808",canvas,ctx,[1.0,0.0,0.0,1.0,4806.0,-3682.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,11562.0,-3586.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,11462.0,-4058.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,10569.0,-4282.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,9320.0,-4822.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,9869.0,-3738.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,11042.0,-3775.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,10389.0,-3357.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3994.0,-5238.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3656.0,-4999.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3104.0,-4678.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3444.0,-4478.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2404.0,-4228.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2744.0,-4508.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3006.0,-4258.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,10000.0,-4390.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[0.75,0.0,0.0,0.75,10942.0,-2937.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function sprite5973(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-257.0,-1831.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,443.0,-1831.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-957.0,-1831.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-2147.0,-1633.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-1530.0,-1551.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-627.0,-1551.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,123.0,-1230.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,-1870.0,-896.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3117.0,1062.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3817.0,1062.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2417.0,1062.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,264.0,1120.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,-735.0,1062.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,2747.0,1342.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,-186.0,965.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,3497.0,1663.0],ctrans,1,(0+time)%4,0,time);
			break;
	}
}

function sprite5974(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4337.0,-1698.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4537.0,-1268.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3757.0,-1548.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4047.0,-1218.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4167.0,-1168.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3287.0,-1218.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,3637.0,-1128.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1301.0,-109.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1131.0,261.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,1831.0,332.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,911.0,1484.0],ctrans,1,(0+time)%4,0,time);
			place("sprite453",canvas,ctx,[1.0,0.0,0.0,1.0,880.0,872.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,5717.0,-359.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,5477.0,-218.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,5677.0,-19.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,5307.0,121.0],ctrans,1,(0+time)%4,0,time);
			place("sprite462",canvas,ctx,[1.0,0.0,0.0,1.0,4907.0,252.0],ctrans,1,(0+time)%4,0,time);
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

function shape5975(ctx,ctrans,frame,ratio,time){
	var pathData="M 16000 12000 L 16000 0 0 0 0 12000 16000 12000 M -2000 -2000 L 18000 -2000 18000 14000 -2000 14000 -2000 -2000";
	ctx.fillStyle=tocolor(ctrans.apply([0,0,0,0.5019608]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 4650 3152 L 210 3152 210 1912 4650 1912 4650 3152";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,210,1912);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 16096 1523 L 12696 1523 12696 573 16096 573 16096 1523";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(15.31524658203125,0,0,15.31524658203125,12696,573);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 14685 5943 L 19125 5943 19125 7183 14685 7183 14685 5943";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,14685,5943);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 1701 7159 L -1699 7159 -1699 6209 1701 6209 1701 7159";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(15.31524658203125,0,0,15.31524658203125,-1699,6209);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 18782 7665 L 12202 7665 12202 6525 18782 6525 18782 7665";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,12202,6525);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 14989 8283 L 14989 7143 21569 7143 21569 8283 14989 8283";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,21569,7143);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 15223 6343 L 15223 5683 19032 5683 19032 6343 15223 6343";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-11.5789794921875,0,0,11.5789794921875,19032,5683);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 3900 9423 L -2680 9423 -2680 8283 3900 8283 3900 9423";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2680,8283);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 15815 7465 L 15815 6645 18751 6645 18751 7465 15815 7465";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-13.2257080078125,0,0,13.2257080078125,18751,6645);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 2720 9079 L 2720 10219 -3860 10219 -3860 9079 2720 9079";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,2720,9079);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 19207 5941 L 19207 7081 12627 7081 12627 5941 19207 5941";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,19207,5941);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 17153 868 L 17153 2008 10573 2008 10573 868 17153 868";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,17153,868);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 3617 7230 L -2963 7230 -2963 6090 3617 6090 3617 7230";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-2963,6090);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 5510 2436 L 5510 3576 -1070 3576 -1070 2436 5510 2436";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,5510,2436);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 13714 9687 L 13714 8547 20294 8547 20294 9687 13714 9687";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(-20,0,0,20,20294,8547);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
	var pathData="M 20179 8629 L 13599 8629 13599 7489 20179 7489 20179 8629";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,13599,7489);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj357,"assets/takeover/art/images/357.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj357.src="assets/takeover/art/images/357.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj362,"assets/takeover/art/images/362.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj362.src="assets/takeover/art/images/362.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj364,"assets/takeover/art/images/364.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj364.src="assets/takeover/art/images/364.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj366,"assets/takeover/art/images/366.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj366.src="assets/takeover/art/images/366.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj368,"assets/takeover/art/images/368.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj368.src="assets/takeover/art/images/368.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj371,"assets/takeover/art/images/371.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj371.src="assets/takeover/art/images/371.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj373,"assets/takeover/art/images/373.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj373.src="assets/takeover/art/images/373.png";
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

var imageObj375=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/375.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj375,"assets/takeover/art/images/375.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj375.src="assets/takeover/art/images/375.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj377,"assets/takeover/art/images/377.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj377.src="assets/takeover/art/images/377.png";
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

var imageObj380=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/380.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj380,"assets/takeover/art/images/380.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj380.src="assets/takeover/art/images/380.png";
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

var imageObj382=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/382.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj382,"assets/takeover/art/images/382.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj382.src="assets/takeover/art/images/382.png";
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

function shape3710(ctx,ctrans,frame,ratio,time){
	var pathData="M 202 -96 Q 207 -97 238 -117 L 241 -120 242 -119 262 -132 287 -145 279 -157 294 -156 310 -154 319 -156 337 -159 341 -154 358 -152 354 -171 338 -167 299 -172 Q 283 -180 288 -192 L 298 -206 353 -202 372 -192 369 -174 361 -174 365 -150 367 -149 391 -143 465 -139 479 -136 490 -132 490 -130 477 -124 463 -117 459 -111 446 -105 440 -104 440 -102 459 -87 457 -84 463 -77 466 -78 468 -64 Q 492 -61 516 -49 L 520 -47 522 -48 Q 534 -54 556 -48 L 554 -45 560 -42 572 -42 579 -39 602 -42 605 -43 Q 616 -49 629 -43 L 629 -42 634 -42 635 -44 Q 622 -46 616 -50 L 615 -51 674 -54 673 -54 670 -50 696 -45 706 -41 712 -41 712 -39 739 -39 742 -36 739 -34 742 -34 Q 756 -29 759 -24 L 763 -24 766 -27 767 -26 767 -3 772 14 764 22 774 33 Q 784 41 784 52 L 791 53 800 47 888 91 879 91 865 88 846 85 819 84 818 80 835 80 828 75 824 77 818 79 810 82 811 93 Q 835 96 859 108 L 863 110 865 109 Q 883 100 922 118 L 945 115 948 114 Q 959 108 972 114 L 972 115 1055 116 1055 118 1082 118 1085 121 1082 123 1085 123 Q 1104 130 1103 136 L 1109 130 1112 136 1112 140 Q 1109 140 1104 143 L 1092 133 Q 1085 125 1076 125 L 1070 129 1070 130 1069 130 Q 1058 136 1058 139 L 1059 145 1070 156 1073 157 1103 154 1119 158 1124 168 Q 1132 171 1136 173 L 1172 183 1169 187 1145 187 1136 183 1130 187 1103 187 1098 192 1075 193 1073 189 1073 187 1064 187 1051 184 1054 189 Q 1069 193 1084 200 1094 205 1099 209 1110 200 1139 195 L 1176 199 1217 210 1207 219 Q 1198 222 1203 231 L 1198 233 1174 231 1167 234 1161 236 1153 239 Q 1150 252 1112 270 L 1109 271 1051 295 1048 297 1033 303 918 358 853 392 837 405 812 413 808 414 779 428 737 455 Q 695 480 663 481 L 641 476 638 475 594 466 Q 584 458 578 458 L 565 460 529 454 452 437 467 440 Q 488 440 493 433 L 493 424 492 420 482 408 445 408 446 411 Q 446 424 428 424 L 418 424 Q 418 403 399 395 L 377 395 376 391 Q 370 355 355 339 341 324 262 305 197 289 158 287 L 140 282 147 279 144 278 104 271 101 269 103 265 114 265 117 265 124 261 113 257 103 255 Q 102 267 87 267 L 75 264 Q 74 245 56 238 L 45 238 36 227 22 210 24 210 25 210 19 203 21 199 3 189 -23 166 -23 175 -22 176 -107 135 -175 103 -172 79 -157 65 -140 50 -139 51 -111 19 Q -108 11 -89 4 L -23 -11 Q -3 -14 14 -23 L 13 -24 14 -27 16 -27 19 -26 52 -41 132 -67 202 -96 M 537 -126 L 540 -128 551 -124 546 -124 537 -126 M 263 -117 Q 284 -117 288 -129 L 263 -117 M 550 -146 L 547 -148 550 -148 550 -146 M 715 -17 L 716 -12 727 -1 730 0 749 -2 Q 745 -7 746 -12 L 751 -22 749 -24 Q 742 -32 733 -32 L 727 -28 727 -27 725 -27 734 -23 727 -18 715 -17 M 604 -3 L 607 -1 625 0 632 1 632 -10 634 -20 630 -26 606 -23 Q 610 -18 600 -13 L 599 -12 604 -3 M 475 -77 L 476 -77 480 -72 476 -73 475 -77 M 1097 163 L 1100 165 1106 164 1097 163 M 1105 235 L 1096 242 1097 242 1116 254 1137 240 1131 240 1124 240 1105 235 M 959 107 L 1009 111 1007 114 959 107 M 1062 277 L 1054 277 1044 274 1041 279 1049 284 1053 282 1062 277 M 964 315 L 973 323 999 309 976 307 964 315 M 941 338 L 922 340 868 358 835 368 853 385 856 383 927 345 941 338 M 982 130 L 949 134 Q 953 139 943 144 L 942 145 947 154 950 156 975 158 975 147 Q 976 136 982 130 M 763 7 L 754 6 757 8 763 7 M 438 462 L 447 467 443 467 439 466 437 463 438 462 M 403 424 L 380 419 379 410 377 398 Q 387 400 394 405 L 415 420 403 424 M 263 372 L 267 379 265 379 264 378 259 373 263 372 M 72 263 L 61 261 53 249 72 263 M 588 511 L 599 514 590 519 Q 572 509 552 502 L 551 500 580 508 578 508 586 511 588 511 M -264 89 L -258 96 -263 96 -266 93 -264 89 M -221 77 L -220 84 -227 78 -221 77 M -176 127 L -179 124 -179 123 -175 125 -176 125 -175 127 -176 127 M -183 79 L -183 81 -184 99 -189 97 -186 78 -183 79";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 772 114 L 770 116 774 115 772 114 M 431 -42 L 429 -43 427 -41 431 -42 M 171 -95 Q 202 -106 202 -122 L 214 -125 221 -128 294 -138 Q 356 -135 391 -104 L 431 -66 433 -62 436 -60 468 -45 516 -31 536 -21 554 -15 607 17 628 19 637 19 Q 699 22 734 53 L 774 91 776 95 779 97 811 112 Q 835 114 859 126 L 879 136 897 142 Q 919 149 950 174 L 1019 187 Q 1081 198 1042 260 L 1044 266 Q 1051 269 1048 281 1042 302 1025 310 L 986 319 926 355 Q 908 365 868 376 L 835 386 827 390 810 393 803 396 790 400 776 408 713 410 Q 663 404 627 386 L 606 368 601 363 590 361 Q 566 355 509 327 L 487 314 483 317 Q 473 323 452 312 442 307 441 299 440 292 445 290 L 446 290 445 289 430 289 Q 370 285 334 266 307 253 296 235 L 284 229 Q 271 223 263 211 L 258 206 247 204 Q 223 198 166 170 L 144 157 140 160 109 155 Q 99 150 98 142 97 135 102 133 L 103 133 102 132 87 132 Q 27 128 -9 109 -53 88 -54 51 -67 28 -53 6 L -50 2 Q -20 -3 10 -23 L 12 -24 Q 81 -43 108 -64 L 171 -95";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -56 113 L -94 97 Q -127 80 -94 64 -60 46 -43 74 -26 103 -39 109 L -56 113 M 269 171 Q 305 200 290 220 L 300 231 309 252 324 264 Q 345 288 334 293 304 302 278 288 263 281 265 269 L 267 263 249 254 Q 234 246 232 239 L 210 237 Q 167 231 177 226 138 207 149 183 156 166 178 155 222 132 269 171 M 242 128 L 211 135 Q 185 135 159 123 L 146 114 136 121 102 131 Q 63 135 23 115 -4 102 -14 80 -25 57 -6 47 12 39 58 37 117 37 156 60 169 65 167 78 199 67 230 90 266 116 242 128 M 741 394 L 741 397 744 397 746 397 741 394 M 619 413 Q 648 397 667 421 688 445 677 450 L 621 445 Q 606 438 608 426 610 417 619 413 M 553 394 Q 510 388 520 383 481 364 492 340 499 323 521 312 565 289 612 328 661 367 615 390 L 553 394 M 468 67 L 476 69 477 67 474 65 468 67 M 710 51 Q 743 48 780 71 838 106 791 130 L 745 137 Q 716 135 683 118 L 670 110 655 104 Q 633 93 637 77 640 64 653 57 679 44 710 51 M 845 347 Q 873 355 847 369 L 826 376 799 375 800 376 Q 855 399 815 419 L 781 428 Q 743 431 717 418 683 401 684 388 685 382 704 372 L 739 363 717 357 Q 706 351 712 341 716 334 723 330 747 319 771 334 792 351 774 361 L 759 364 784 370 Q 778 366 782 360 L 791 350 845 347 M 965 320 L 955 315 939 324 905 333 Q 868 336 836 320 805 304 807 288 809 277 823 270 876 244 936 270 960 280 966 290 998 277 1029 290 1064 307 1048 315 L 1018 325 965 320 M 980 234 Q 983 221 996 214 1035 194 1084 219 1132 242 1090 264 L 1059 270 Q 1025 274 998 261 976 250 980 234 M 820 224 L 817 222 811 224 819 226 820 224 M 861 128 Q 885 134 864 145 L 845 149 847 151 Q 872 166 845 179 L 840 180 858 189 867 196 880 188 882 187 880 186 Q 870 181 874 165 878 150 885 146 907 135 933 156 959 174 938 186 L 946 191 Q 977 214 945 229 L 885 238 869 249 820 256 758 245 Q 772 264 749 275 L 707 292 720 294 727 302 729 307 746 308 Q 757 308 743 315 L 716 324 Q 688 331 674 324 665 319 669 310 L 675 302 692 295 699 293 Q 662 298 627 280 586 260 589 240 L 590 234 582 235 533 226 510 209 504 212 495 215 499 217 Q 512 222 510 235 542 224 573 247 609 273 585 285 L 554 292 Q 528 292 502 280 L 489 271 479 278 445 288 Q 406 292 366 272 339 259 329 237 318 214 337 204 348 199 369 197 365 191 369 184 373 177 380 173 404 162 428 177 442 188 438 197 L 442 197 448 193 502 190 511 194 525 184 537 178 564 178 Q 609 203 617 214 L 648 210 711 219 728 224 728 210 723 204 Q 721 198 733 193 L 740 189 758 176 Q 768 171 780 169 779 164 785 158 L 800 145 814 141 Q 809 137 821 131 L 861 128 M 471 -16 Q 466 -20 478 -26 L 518 -29 Q 542 -23 521 -12 L 502 -8 504 -6 Q 529 9 502 22 L 497 23 515 32 524 39 537 31 539 30 537 29 Q 527 24 531 8 535 -7 542 -11 564 -22 590 -1 616 17 595 29 L 603 34 Q 622 48 617 59 L 619 60 Q 650 75 626 88 L 598 91 570 91 556 82 543 81 Q 549 90 539 95 L 523 100 493 98 477 99 Q 441 99 415 88 429 107 406 118 L 364 135 377 137 384 145 386 150 400 151 Q 392 143 395 133 397 125 406 120 429 109 462 126 L 465 128 Q 468 119 480 113 514 96 552 101 L 579 93 Q 620 89 669 114 695 127 701 142 717 152 705 158 L 702 160 Q 698 174 679 183 L 607 187 561 176 Q 525 179 493 163 L 474 151 460 161 445 166 Q 428 166 411 158 L 405 155 400 158 373 167 Q 345 174 331 167 322 162 326 153 L 332 145 349 138 356 136 Q 319 141 284 123 243 103 246 83 L 247 77 239 78 Q 212 80 190 69 145 46 182 27 L 194 21 221 21 Q 266 46 274 57 L 305 53 368 62 Q 377 63 385 67 L 385 53 380 47 Q 378 41 390 36 L 397 32 415 19 Q 425 14 437 12 436 7 442 1 L 457 -12 471 -16 M 313 -69 Q 313 -87 333 -97 380 -121 437 -86 495 -51 448 -27 430 -18 402 -20 373 -22 340 -39 315 -52 313 -69 M 401 -66 L 382 -76 380 -75 380 -72 395 -63 402 -61 Q 398 -64 401 -66 M 276 -97 Q 307 -82 283 -69 L 255 -66 227 -66 Q 207 -76 209 -88 210 -96 220 -101 L 276 -97 M 196 -62 L 180 -57 150 -59 Q 138 -65 145 -72 L 160 -80 196 -81 Q 209 -69 196 -62 M 166 -26 Q 171 -38 190 -47 217 -61 236 -64 277 -68 326 -43 367 -22 359 2 355 17 336 26 L 264 30 Q 218 22 187 7 157 -8 166 -26 M 63 -37 Q 86 -48 119 -31 151 -12 117 4 L 102 9 68 1 Q 47 -9 52 -24 54 -32 63 -37";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 106 -37 Q 103 -52 118 -59 152 -76 206 -48 262 -19 235 -6 225 3 209 7 175 14 134 -6 108 -20 106 -37 M 181 -84 Q 166 -91 172 -100 L 187 -109 226 -107 Q 250 -99 223 -85 L 209 -81 181 -84 M 72 -21 Q 53 -19 38 -27 30 -31 35 -38 L 45 -47 54 -49 83 -43 Q 105 -32 90 -24 L 72 -21 M 359 -182 L 369 -177 369 -164 370 -162 364 -158 Q 358 -163 358 -177 L 359 -182 M 496 -57 Q 478 -67 478 -75 L 483 -69 498 -59 503 -58 496 -57 M 524 -54 L 525 -61 540 -54 533 -52 530 -53 524 -54 M 840 71 L 847 71 896 95 890 100 889 101 883 97 840 71 M 1173 245 L 1165 252 1120 254 1117 251 1120 250 1126 241 1134 234 Q 1141 230 1147 229 L 1173 245 M 1071 188 L 1054 200 1037 203 Q 1015 204 992 193 972 183 975 166 975 159 978 155 L 1006 159 1038 155 1071 188 M 949 151 Q 953 157 943 162 L 921 166 888 161 859 136 Q 857 131 865 127 L 869 126 926 156 Q 936 156 938 149 L 949 151 M 826 93 L 822 95 777 97 774 94 777 93 783 84 791 77 793 76 809 81 826 93 M 784 73 L 775 83 739 91 689 84 675 88 665 89 Q 666 78 674 78 695 79 717 63 L 741 62 771 66 772 66 782 72 784 73 M 652 88 L 641 83 Q 624 75 627 68 L 642 59 643 59 Q 634 49 635 40 L 640 30 Q 630 21 632 9 L 634 -1 630 -12 622 -11 606 -14 601 -18 Q 611 -21 619 -27 618 -23 620 -22 L 636 -20 Q 677 -20 705 -4 L 709 -2 705 0 708 1 Q 736 16 728 30 L 753 36 760 48 724 44 Q 701 44 675 63 652 79 652 86 L 652 88 M 591 -16 L 592 -16 Q 617 -3 600 5 L 578 9 545 4 Q 520 -12 516 -21 L 579 -16 591 -16 M 470 -32 L 467 -31 461 -27 443 -28 437 -33 458 -37 470 -32 M 422 -35 L 386 -33 Q 376 -38 377 -47 378 -54 382 -56 L 392 -59 395 -54 Q 406 -39 422 -35 M 384 -66 L 347 -73 351 -76 Q 371 -76 384 -66 M 338 -76 L 323 -83 Q 290 -100 292 -117 295 -129 308 -136 L 349 -135 Q 363 -122 417 -119 L 415 -113 Q 415 -106 426 -82 L 430 -73 406 -66 399 -75 371 -85 Q 351 -88 340 -76 L 338 -76 M 347 -150 L 338 -149 299 -153 Q 283 -162 288 -174 L 298 -187 345 -186 Q 350 -172 347 -150 M 267 -6 Q 280 -13 290 -6 301 -1 287 7 L 280 9 265 8 Q 252 1 267 -6 M 283 -54 L 298 -54 Q 308 -48 299 -43 L 295 -42 283 -43 279 -48 283 -54 M 267 -80 Q 285 -74 267 -64 L 255 -61 234 -62 Q 219 -69 233 -77 L 267 -80 M 263 -143 Q 277 -139 264 -132 L 239 -127 Q 232 -135 242 -140 L 263 -143 M 312 -6 Q 310 -20 327 -28 358 -44 406 -20 453 4 410 25 L 386 31 Q 363 33 339 21 L 327 15 325 13 Q 313 4 312 -6 M 552 -63 L 553 -62 549 -58 552 -63 M 467 -1 Q 480 -6 489 -1 500 6 490 11 477 18 464 11 454 6 467 -1 M 1097 201 Q 1110 204 1098 210 L 1075 212 1073 208 Q 1072 202 1077 199 L 1097 201 M 1034 240 L 1018 245 984 240 Q 967 232 970 225 972 222 985 216 L 1024 220 Q 1049 233 1034 240 M 1056 230 L 1053 227 1059 219 Q 1069 214 1087 223 1105 231 1096 235 L 1085 238 1056 230 M 832 156 Q 843 163 833 168 820 175 807 168 797 163 810 156 823 151 832 156 M 882 219 L 865 203 Q 850 186 859 182 L 934 186 Q 989 202 949 222 L 927 228 882 219 M 843 211 Q 879 233 865 240 824 261 784 240 766 231 771 216 775 204 783 201 808 188 843 211 M 1054 295 Q 1038 294 1037 275 1035 257 1043 253 1061 244 1097 260 1134 277 1112 287 L 1085 293 1054 295 M 830 383 Q 873 405 837 424 L 812 432 Q 783 436 758 424 710 400 752 378 786 361 830 383 M 844 294 L 823 310 790 318 Q 756 321 722 304 694 290 685 269 677 247 697 237 L 733 233 Q 764 236 806 257 849 279 844 294 M 837 329 Q 834 324 844 319 L 858 316 883 320 Q 892 325 893 335 L 888 348 857 345 837 329 M 835 366 L 845 360 Q 872 346 879 357 886 366 865 377 L 843 375 835 366 M 816 333 Q 832 346 812 356 L 798 361 771 352 Q 754 343 780 330 799 320 816 333 M 913 334 L 960 331 Q 983 340 967 349 L 922 357 Q 926 346 922 345 L 917 344 911 343 Q 904 340 913 334 M 892 245 L 940 241 Q 985 242 996 256 1005 266 1008 285 1011 305 1002 310 L 967 314 Q 927 314 896 299 867 284 873 266 877 253 892 245 M 810 114 Q 824 119 810 126 L 804 130 786 129 Q 773 122 787 115 L 810 114 M 743 99 L 750 101 773 110 Q 777 112 774 116 782 124 769 130 L 746 136 749 137 Q 796 161 753 182 L 729 188 Q 706 190 682 178 L 670 172 668 170 655 154 638 157 630 164 623 166 608 165 Q 600 160 603 156 L 578 151 552 164 543 166 550 177 583 173 617 174 Q 627 178 629 182 L 636 184 Q 695 206 644 231 L 613 239 Q 584 240 553 224 L 535 211 522 220 507 221 506 222 490 228 508 243 544 242 Q 560 252 539 263 L 501 265 499 264 494 267 486 270 Q 527 288 489 308 L 454 311 Q 431 308 410 298 386 285 411 265 371 243 404 224 L 399 221 383 212 373 222 Q 395 229 379 237 L 336 234 334 233 330 233 Q 300 233 269 218 245 205 245 190 L 245 185 245 174 Q 250 163 265 156 L 275 152 Q 248 149 214 131 202 125 209 114 L 221 100 308 103 Q 351 130 313 149 L 303 153 327 162 337 169 355 176 366 183 368 178 367 177 Q 360 173 372 167 386 160 393 160 L 404 157 379 147 Q 351 133 342 112 334 90 354 80 L 390 76 Q 420 79 460 99 L 461 98 474 93 Q 458 92 441 83 423 74 428 59 432 47 440 44 465 31 500 54 L 513 63 515 57 Q 517 55 526 50 L 522 46 Q 507 29 516 25 L 579 26 Q 578 21 585 17 L 606 14 Q 620 18 607 25 L 591 29 Q 646 45 606 65 L 584 71 569 71 566 72 552 76 524 73 Q 529 80 522 83 L 497 92 Q 514 93 533 102 L 549 88 570 85 576 80 610 77 Q 621 81 618 86 645 89 653 99 662 109 665 128 L 665 132 670 129 694 123 694 118 Q 692 100 700 96 L 743 99 M 557 288 Q 545 282 552 271 L 564 257 651 260 Q 694 287 656 306 L 619 309 Q 592 306 557 288 M 549 320 Q 566 331 553 338 L 538 341 Q 531 340 510 329 502 325 514 319 L 549 320 M 588 347 Q 588 335 602 328 645 307 698 333 753 361 708 383 L 673 390 Q 643 390 612 375 588 362 588 347 M 503 161 L 480 153 457 160 487 172 Q 511 185 518 197 L 531 196 531 194 514 188 494 172 Q 491 167 501 162 L 503 161 M 412 46 L 405 50 379 49 Q 367 43 377 38 L 402 39 412 46 M 720 195 L 745 196 755 203 748 207 722 206 Q 710 200 720 195 M 54 202 Q 22 186 59 167 91 151 141 177 191 204 170 214 L 122 218 Q 81 215 54 202 M 10 148 Q 30 157 15 165 L 6 167 -20 163 -28 156 -23 148 Q -9 141 10 148 M 12 118 Q 4 114 6 107 L 10 99 Q 21 93 33 104 44 114 37 118 24 125 12 118 M 16 88 L 8 88 6 85 18 84 21 85 Q 19 87 16 88 M 29 64 Q 52 72 36 80 L -7 77 Q -20 70 -6 62 L 29 64 M 153 95 Q 156 90 163 87 L 201 85 Q 217 95 196 106 L 158 108 Q 148 103 153 95 M 163 65 L 125 75 Q 87 79 56 64 25 48 23 32 21 17 39 8 84 -15 144 15 201 46 163 65 M 209 222 Q 247 203 295 233 L 306 241 350 244 349 242 361 241 364 242 359 245 354 245 369 253 Q 411 282 382 297 L 326 298 262 289 Q 235 289 211 277 L 208 276 206 277 187 276 180 269 184 264 189 262 Q 180 252 185 242 L 189 236 187 230 Q 187 229 194 225 L 209 222 M 224 191 Q 236 200 229 203 L 196 206 Q 193 192 199 188 211 182 224 191 M 206 163 Q 223 174 210 181 L 195 184 167 172 Q 159 168 171 162 L 206 163 M 270 82 Q 241 83 210 67 189 57 188 41 188 29 201 22 L 293 27 Q 352 49 301 74 L 270 82 M 743 335 L 710 334 Q 703 330 715 324 752 306 743 335 M 484 334 Q 534 361 513 371 L 465 375 Q 424 372 397 359 365 343 402 324 434 308 484 334 M 603 445 Q 586 436 597 423 604 415 614 410 670 382 712 410 754 439 725 454 L 669 455 603 445 M 523 426 L 527 421 Q 537 416 546 424 556 431 549 434 L 530 433 523 426 M 571 385 Q 590 396 579 401 L 540 397 Q 529 392 530 387 530 386 537 382 553 374 571 385 M -144 31 Q -132 25 -119 34 -107 43 -114 46 L -147 49 Q -150 35 -144 31 M -73 49 Q -102 35 -98 17 L -78 -1 Q -52 -15 -16 5 21 25 -18 45 L -34 52 -73 49 M -48 76 Q 1 107 -32 123 L -62 131 Q -100 136 -132 120 -166 103 -158 85 L -134 65 Q -96 46 -48 76 M 320 305 Q 334 298 353 305 373 314 358 322 L 349 324 323 320 315 313 320 305 M 146 151 L 111 154 Q 88 151 67 141 42 128 69 107 98 92 141 112 185 130 146 151";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 345 -186 L 342 -192 313 -197 308 -203 Q 308 -219 336 -216 363 -213 363 -197 L 359 -182 358 -177 Q 358 -163 364 -158 368 -154 374 -154 L 432 -156 443 -158 457 -152 Q 460 -146 455 -141 483 -143 483 -130 483 -118 454 -118 L 430 -118 443 -93 Q 455 -68 466 -63 478 -57 489 -57 L 496 -57 503 -58 504 -58 524 -54 530 -53 533 -52 553 -51 Q 571 -48 578 -35 L 620 -48 643 -48 652 -63 658 -70 625 -107 615 -103 596 -106 Q 630 -123 663 -94 L 678 -80 678 -79 702 -56 733 -34 754 -35 Q 777 -57 775 -35 L 824 -43 849 -38 864 -43 Q 890 -43 921 -15 949 11 949 25 L 972 40 1001 54 992 59 Q 979 59 955 43 L 932 24 Q 932 18 936 15 L 894 -22 Q 859 -22 834 -10 816 -1 762 -11 L 758 -9 762 -4 755 5 755 9 765 28 Q 779 48 796 48 802 48 840 71 L 883 97 889 101 915 118 918 118 1030 118 1051 126 Q 1060 128 1060 136 L 1053 148 1056 150 1076 162 1085 161 1084 155 Q 1084 144 1097 144 1125 144 1169 176 1209 205 1209 215 1209 226 1196 227 L 1203 237 1199 244 1187 248 1173 245 1147 229 1133 219 1098 190 1081 196 1071 188 1038 155 1006 159 978 155 949 151 938 149 Q 936 156 926 156 L 869 126 860 119 826 93 809 81 793 76 784 73 782 72 772 66 771 66 741 62 717 63 Q 695 79 674 78 666 78 665 89 L 664 96 662 105 659 106 655 97 652 88 652 86 Q 652 79 675 63 701 44 724 44 L 760 48 753 36 742 17 742 12 709 -2 705 -4 Q 677 -20 636 -20 L 620 -22 Q 618 -23 619 -27 611 -21 601 -18 L 591 -16 579 -16 516 -21 485 -28 470 -32 458 -37 437 -33 436 -33 422 -35 Q 406 -39 395 -54 L 392 -59 384 -66 Q 371 -76 351 -76 L 347 -73 344 -70 308 -73 303 -72 298 -66 296 -67 295 -70 Q 295 -80 308 -80 L 321 -76 338 -76 340 -76 Q 351 -88 371 -85 L 399 -75 406 -66 417 -58 Q 431 -47 439 -47 L 444 -47 439 -55 430 -73 426 -82 Q 415 -106 415 -113 L 417 -119 Q 363 -122 349 -135 L 345 -141 347 -150 Q 350 -172 345 -186 M 675 -49 L 676 -50 673 -53 675 -49 M 416 434 L 406 439 Q 392 439 373 397 L 356 354 Q 356 320 373 339 387 354 393 371 L 410 405 421 427 416 434 M 6 192 Q 17 174 43 211 67 245 67 260 L 66 264 60 267 36 237 6 192";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3711(ctx,ctrans,frame,ratio,time){
	var pathData="M 13 -24 L 14 -27 16 -27 19 -26 52 -41 132 -67 202 -96 Q 207 -97 238 -117 L 241 -120 242 -119 262 -132 287 -145 279 -157 294 -156 310 -154 319 -156 337 -159 341 -154 358 -152 354 -171 338 -167 299 -172 Q 283 -180 288 -192 L 298 -206 353 -202 373 -191 382 -193 380 -185 391 -180 384 -175 361 -174 365 -150 367 -149 391 -143 465 -139 490 -132 490 -130 477 -124 463 -117 459 -111 446 -105 440 -104 440 -102 Q 474 -80 468 -64 492 -61 516 -49 L 520 -47 522 -48 Q 540 -57 579 -39 L 602 -42 605 -43 Q 616 -49 629 -43 L 629 -42 634 -42 635 -44 Q 622 -46 616 -50 613 -53 613 -59 613 -66 618 -69 L 634 -75 656 -75 674 -69 676 -60 673 -54 670 -50 696 -45 706 -41 712 -41 712 -39 739 -39 742 -36 739 -34 742 -34 Q 756 -29 759 -24 L 763 -24 766 -27 768 -24 Q 800 -23 800 -11 L 794 0 780 6 781 11 Q 789 14 793 16 L 808 18 833 25 833 27 820 33 810 37 Q 826 36 833 42 L 874 53 865 61 870 63 897 65 Q 935 68 935 72 L 931 78 920 82 929 88 Q 929 91 924 91 L 879 91 865 88 846 85 819 84 818 80 835 80 828 75 824 77 818 79 810 82 811 93 Q 835 96 859 108 L 863 110 865 109 Q 883 100 922 118 L 945 115 948 114 Q 959 108 972 114 L 972 115 1055 116 1055 118 1082 118 1085 121 1082 123 1085 123 Q 1104 130 1103 136 L 1109 130 1112 136 1112 140 Q 1109 140 1104 143 L 1092 133 Q 1085 125 1076 125 L 1070 129 1070 130 1069 130 Q 1058 136 1058 139 L 1059 145 1070 156 1073 157 1103 154 1119 158 1124 168 Q 1132 171 1136 173 L 1172 183 1169 187 1145 187 1136 183 1130 187 1103 187 1098 192 1075 193 1073 189 1073 187 1064 187 1051 184 1054 189 Q 1069 193 1084 200 1094 205 1099 209 1110 200 1139 195 L 1176 199 1217 210 1207 219 Q 1198 222 1203 231 L 1198 233 1174 231 1167 234 1161 236 1153 239 Q 1150 252 1112 270 L 1109 271 1051 295 1048 297 1033 303 918 358 853 392 837 405 812 413 808 414 779 428 737 455 Q 693 481 659 481 L 643 478 638 475 626 477 619 479 Q 611 479 598 469 L 578 458 565 460 563 463 557 463 538 464 530 466 540 469 542 472 539 478 528 473 503 467 471 464 458 462 443 467 439 466 437 463 444 456 451 450 450 450 440 447 433 443 433 435 440 434 467 440 Q 488 440 493 433 L 493 424 492 420 482 408 445 408 446 411 Q 446 424 428 424 L 418 424 Q 418 403 399 395 L 365 395 344 390 343 387 Q 343 385 346 382 L 350 380 351 375 353 371 353 368 355 367 367 367 368 367 361 358 324 363 325 364 313 373 316 376 320 376 311 380 288 380 257 375 Q 257 371 283 366 L 308 361 308 360 Q 308 357 311 357 L 317 355 278 355 Q 263 353 263 345 L 259 353 Q 254 362 245 362 L 236 362 223 362 208 358 203 354 Q 203 349 211 348 L 205 335 Q 205 330 217 328 L 208 319 198 319 196 321 191 319 176 319 172 318 170 314 170 312 160 310 128 307 115 305 100 310 96 309 94 306 101 299 108 293 107 293 97 290 90 286 90 278 97 277 124 283 147 279 144 278 104 271 101 269 103 265 114 265 117 265 124 261 113 257 103 255 Q 102 267 85 267 L 75 267 Q 75 246 56 238 L 22 238 1 233 0 230 3 225 7 223 8 218 10 214 10 211 12 210 24 210 25 210 18 201 -19 206 -18 207 -30 216 -27 219 -23 219 -32 223 -55 223 -86 218 Q -86 214 -60 209 L -35 204 -35 203 -32 200 -26 198 -65 198 Q -80 196 -80 188 L -78 187 Q -75 185 -75 175 L -71 173 -110 174 -125 171 -135 162 -167 162 -171 161 -173 157 Q -173 150 -152 143 L -143 141 -146 137 -144 133 -165 125 -176 125 -175 127 -199 121 -239 114 -242 112 -240 108 -229 108 -226 108 -219 104 -230 100 -263 96 -266 93 Q -266 84 -233 78 L -174 80 -157 65 -140 50 -139 51 -111 19 Q -108 11 -89 4 L -23 -11 Q -3 -14 14 -23 L 13 -24 M 288 -129 L 263 -117 Q 284 -117 288 -129 M 514 -141 L 521 -148 550 -148 Q 550 -140 553 -138 L 553 -124 546 -124 Q 539 -124 526 -132 L 514 -141 M 406 -159 L 403 -169 Q 403 -177 412 -181 457 -182 457 -168 L 451 -157 Q 444 -151 433 -151 413 -151 406 -159 M 502 -162 L 505 -155 493 -139 484 -139 482 -150 Q 479 -168 502 -162 M 505 -104 L 527 -94 554 -92 592 -85 588 -79 577 -75 586 -69 581 -66 536 -66 522 -69 503 -72 476 -73 475 -77 492 -77 483 -84 482 -85 478 -90 478 -91 486 -102 505 -104 M 725 -27 L 734 -23 727 -18 715 -17 716 -12 727 -1 730 0 749 -2 Q 745 -7 746 -12 L 751 -22 749 -24 Q 742 -32 733 -32 L 727 -28 727 -27 725 -27 M 604 -3 L 607 -1 625 0 632 1 632 -10 634 -20 630 -26 606 -23 Q 610 -18 600 -13 L 599 -12 604 -3 M 1019 97 L 1016 103 1007 114 959 107 Q 956 104 956 98 L 961 88 977 82 999 82 1017 88 1019 97 M 1100 165 L 1106 164 1097 163 1100 165 M 1096 242 L 1097 242 1116 254 1137 240 1131 240 1124 240 1105 235 1096 242 M 893 9 Q 893 17 896 19 L 896 33 889 33 Q 882 33 869 25 L 857 16 864 9 893 9 M 836 18 L 827 18 825 7 Q 822 -11 845 -5 L 848 2 836 18 M 1053 282 L 1062 277 1054 277 1044 274 1041 279 1049 284 1053 282 M 941 338 L 922 340 868 358 835 368 853 385 856 383 927 345 941 338 M 964 315 L 973 323 999 309 976 307 964 315 M 975 147 Q 976 136 982 130 L 949 134 Q 953 139 943 144 L 942 145 947 154 950 156 975 158 975 147 M 757 8 L 763 7 754 6 757 8 M 584 478 L 601 491 607 497 602 510 588 519 Q 567 519 556 507 L 548 492 Q 548 487 563 484 L 584 478 M 72 263 L 54 268 34 269 Q 8 269 16 240 37 239 51 248 L 72 263 M 34 254 L 36 253 28 251 33 253 34 254 M 250 346 L 247 349 239 351 243 354 253 348 250 346 M 284 320 L 289 319 287 319 284 320 M 264 340 L 263 345 265 344 268 332 272 330 253 331 258 334 264 340 M 270 321 L 261 317 263 322 270 321 M 278 329 L 294 333 313 336 299 325 278 329 M 359 397 Q 380 396 394 405 L 415 420 397 425 377 426 Q 351 426 359 397 M 371 408 L 376 410 377 411 379 410 371 408 M 578 508 L 586 511 596 505 593 503 590 506 578 508 M -172 117 L -171 117 -169 116 -172 117 M -132 137 L -137 135 -140 135 -138 139 -132 137 M -110 191 Q -98 196 -98 199 L -99 204 -120 205 -135 201 -140 197 Q -140 188 -110 191 M -49 176 L -30 179 -44 168 -65 172 -49 176 M -83 158 L -80 165 -62 163 -54 162 -68 160 -81 157 -83 158";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 770 116 L 774 115 772 114 770 116 M 427 -41 L 431 -42 429 -43 427 -41 M 171 -95 Q 202 -106 202 -122 L 214 -125 221 -128 294 -138 Q 356 -135 391 -104 L 431 -66 433 -62 436 -60 468 -45 516 -31 536 -21 554 -15 607 17 628 19 637 19 Q 699 22 734 53 L 774 91 776 95 779 97 811 112 Q 835 114 859 126 L 879 136 897 142 Q 919 149 950 174 L 1019 187 Q 1081 198 1042 260 L 1044 266 Q 1051 269 1048 281 1042 302 1025 310 L 986 319 926 355 Q 908 365 868 376 L 835 386 827 390 810 393 803 396 790 400 776 408 713 410 Q 663 404 627 386 L 606 368 601 363 590 361 Q 566 355 509 327 L 487 314 483 317 Q 473 323 452 312 442 307 441 299 440 292 445 290 L 446 290 445 289 430 289 Q 370 285 334 266 307 253 296 235 L 284 229 Q 271 223 263 211 L 258 206 247 204 Q 223 198 166 170 L 144 157 140 160 109 155 Q 99 150 98 142 97 135 102 133 L 103 133 102 132 87 132 Q 27 128 -9 109 -53 88 -54 51 -67 28 -53 6 L -50 2 Q -20 -3 10 -23 L 12 -24 Q 81 -43 108 -64 L 171 -95";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -56 113 L -94 97 Q -127 80 -94 64 -60 46 -43 74 -26 103 -39 109 L -56 113 M 232 239 L 210 237 Q 167 231 177 226 138 207 149 183 156 166 178 155 222 132 269 171 305 200 290 220 L 300 231 309 252 324 264 Q 345 288 334 293 304 302 278 288 263 281 265 269 L 267 263 249 254 Q 234 246 232 239 M 242 128 L 211 135 Q 185 135 159 123 L 146 114 136 121 102 131 Q 63 135 23 115 -4 102 -14 80 -25 57 -6 47 12 39 58 37 117 37 156 60 169 65 167 78 199 67 230 90 266 116 242 128 M 746 397 L 741 394 741 397 744 397 746 397 M 608 426 Q 610 417 619 413 648 397 667 421 688 445 677 450 L 621 445 Q 606 438 608 426 M 492 340 Q 499 323 521 312 565 289 612 328 661 367 615 390 L 553 394 Q 510 388 520 383 481 364 492 340 M 468 67 L 476 69 477 67 474 65 468 67 M 710 51 Q 743 48 780 71 838 106 791 130 L 745 137 Q 716 135 683 118 L 670 110 655 104 Q 633 93 637 77 640 64 653 57 679 44 710 51 M 845 347 Q 873 355 847 369 L 826 376 799 375 800 376 Q 855 399 815 419 L 781 428 Q 743 431 717 418 683 401 684 388 685 382 704 372 L 739 363 717 357 Q 706 351 712 341 716 334 723 330 747 319 771 334 792 351 774 361 L 759 364 784 370 Q 778 366 782 360 L 791 350 845 347 M 936 270 Q 960 280 966 290 998 277 1029 290 1064 307 1048 315 L 1018 325 965 320 955 315 939 324 905 333 Q 868 336 836 320 805 304 807 288 809 277 823 270 876 244 936 270 M 980 234 Q 983 221 996 214 1035 194 1084 219 1132 242 1090 264 L 1059 270 Q 1025 274 998 261 976 250 980 234 M 819 226 L 820 224 817 222 811 224 819 226 M 874 165 Q 878 150 885 146 907 135 933 156 959 174 938 186 L 946 191 Q 977 214 945 229 L 885 238 869 249 820 256 758 245 Q 772 264 749 275 L 707 292 720 294 727 302 729 307 746 308 Q 757 308 743 315 L 716 324 Q 688 331 674 324 665 319 669 310 L 675 302 692 295 699 293 Q 662 298 627 280 586 260 589 240 L 590 234 582 235 533 226 510 209 504 212 495 215 499 217 Q 512 222 510 235 542 224 573 247 609 273 585 285 L 554 292 Q 528 292 502 280 L 489 271 479 278 445 288 Q 406 292 366 272 339 259 329 237 318 214 337 204 348 199 369 197 365 191 369 184 373 177 380 173 404 162 428 177 442 188 438 197 L 442 197 448 193 502 190 511 194 525 184 537 178 564 178 Q 609 203 617 214 L 648 210 711 219 728 224 728 210 723 204 Q 721 198 733 193 L 740 189 758 176 Q 768 171 780 169 779 164 785 158 L 800 145 814 141 Q 809 137 821 131 L 861 128 Q 885 134 864 145 L 845 149 847 151 Q 872 166 845 179 L 840 180 858 189 867 196 880 188 882 187 880 186 Q 870 181 874 165 M 471 -16 Q 466 -20 478 -26 L 518 -29 Q 542 -23 521 -12 L 502 -8 504 -6 Q 529 9 502 22 L 497 23 515 32 524 39 537 31 539 30 537 29 Q 527 24 531 8 535 -7 542 -11 564 -22 590 -1 616 17 595 29 L 603 34 Q 622 48 617 59 L 619 60 Q 650 75 626 88 L 598 91 570 91 556 82 543 81 Q 549 90 539 95 L 523 100 493 98 477 99 Q 441 99 415 88 429 107 406 118 L 364 135 377 137 384 145 386 150 400 151 Q 392 143 395 133 397 125 406 120 429 109 462 126 L 465 128 Q 468 119 480 113 514 96 552 101 L 579 93 Q 620 89 669 114 695 127 701 142 717 152 705 158 L 702 160 Q 698 174 679 183 L 607 187 561 176 Q 525 179 493 163 L 474 151 460 161 445 166 Q 428 166 411 158 L 405 155 400 158 373 167 Q 345 174 331 167 322 162 326 153 L 332 145 349 138 356 136 Q 319 141 284 123 243 103 246 83 L 247 77 239 78 Q 212 80 190 69 145 46 182 27 L 194 21 221 21 Q 266 46 274 57 L 305 53 368 62 Q 377 63 385 67 L 385 53 380 47 Q 378 41 390 36 L 397 32 415 19 Q 425 14 437 12 436 7 442 1 L 457 -12 471 -16 M 313 -69 Q 313 -87 333 -97 380 -121 437 -86 495 -51 448 -27 430 -18 402 -20 373 -22 340 -39 315 -52 313 -69 M 382 -76 L 380 -75 380 -72 395 -63 402 -61 Q 398 -64 401 -66 L 382 -76 M 220 -101 L 276 -97 Q 307 -82 283 -69 L 255 -66 227 -66 Q 207 -76 209 -88 210 -96 220 -101 M 160 -80 L 196 -81 Q 209 -69 196 -62 L 180 -57 150 -59 Q 138 -65 145 -72 L 160 -80 M 166 -26 Q 171 -38 190 -47 217 -61 236 -64 277 -68 326 -43 367 -22 359 2 355 17 336 26 L 264 30 Q 218 22 187 7 157 -8 166 -26 M 52 -24 Q 54 -32 63 -37 86 -48 119 -31 151 -12 117 4 L 102 9 68 1 Q 47 -9 52 -24";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -114 46 L -147 49 Q -150 35 -144 31 -132 25 -119 34 -107 43 -114 46 M -48 76 Q 1 107 -32 123 L -62 131 Q -100 136 -132 120 -166 103 -158 85 L -134 65 Q -96 46 -48 76 M -73 49 Q -102 35 -98 17 L -78 -1 Q -52 -15 -16 5 21 25 -18 45 L -34 52 -73 49 M 315 324 Q 322 324 311 330 L 290 331 288 329 289 329 291 326 315 324 M 320 305 Q 334 298 353 305 373 314 358 322 L 349 324 323 320 315 313 320 305 M 146 151 L 111 154 Q 88 151 67 141 42 128 69 107 98 92 141 112 185 130 146 151 M 54 202 Q 22 186 59 167 91 151 141 177 191 204 170 214 L 122 218 Q 81 215 54 202 M 15 165 L 6 167 -20 163 -28 156 -23 148 Q -9 141 10 148 30 157 15 165 M 6 107 L 10 99 Q 21 93 33 104 44 114 37 118 24 125 12 118 4 114 6 107 M 21 85 Q 19 87 16 88 L 8 88 6 85 18 84 21 85 M 29 64 Q 52 72 36 80 L -7 77 Q -20 70 -6 62 L 29 64 M 163 65 L 125 75 Q 87 79 56 64 25 48 23 32 21 17 39 8 84 -15 144 15 201 46 163 65 M 153 95 Q 156 90 163 87 L 201 85 Q 217 95 196 106 L 158 108 Q 148 103 153 95 M 209 222 Q 247 203 295 233 L 306 241 350 244 349 242 361 241 364 242 359 245 354 245 369 253 Q 411 282 382 297 L 326 298 262 289 Q 235 289 211 277 L 208 276 206 277 187 276 180 269 184 264 189 262 Q 180 252 185 242 L 189 236 187 230 Q 187 229 194 225 L 209 222 M 224 191 Q 236 200 229 203 L 196 206 Q 193 192 199 188 211 182 224 191 M 206 163 Q 223 174 210 181 L 195 184 167 172 Q 159 168 171 162 L 206 163 M 301 74 L 270 82 Q 241 83 210 67 189 57 188 41 188 29 201 22 L 293 27 Q 352 49 301 74 M 658 481 Q 665 481 654 487 L 633 488 631 486 632 486 634 483 658 481 M 743 335 L 710 334 Q 703 330 715 324 752 306 743 335 M 513 371 L 465 375 Q 424 372 397 359 365 343 402 324 434 308 484 334 534 361 513 371 M 603 445 Q 586 436 597 423 604 415 614 410 670 382 712 410 754 439 725 454 L 669 455 603 445 M 523 426 L 527 421 Q 537 416 546 424 556 431 549 434 L 530 433 523 426 M 571 385 Q 590 396 579 401 L 540 397 Q 529 392 530 387 530 386 537 382 553 374 571 385 M 588 347 Q 588 335 602 328 645 307 698 333 753 361 708 383 L 673 390 Q 643 390 612 375 588 362 588 347 M 549 320 Q 566 331 553 338 L 538 341 Q 531 340 510 329 502 325 514 319 L 549 320 M 557 288 Q 545 282 552 271 L 564 257 651 260 Q 694 287 656 306 L 619 309 Q 592 306 557 288 M 501 162 L 503 161 480 153 457 160 487 172 Q 511 185 518 197 L 531 196 531 194 514 188 494 172 Q 491 167 501 162 M 412 46 L 405 50 379 49 Q 367 43 377 38 L 402 39 412 46 M 720 195 L 745 196 755 203 748 207 722 206 Q 710 200 720 195 M 743 99 L 750 101 773 110 Q 777 112 774 116 782 124 769 130 L 746 136 749 137 Q 796 161 753 182 L 729 188 Q 706 190 682 178 L 670 172 668 170 655 154 638 157 630 164 623 166 608 165 Q 600 160 603 156 L 578 151 552 164 543 166 550 177 583 173 617 174 Q 627 178 629 182 L 636 184 Q 695 206 644 231 L 613 239 Q 584 240 553 224 L 535 211 522 220 507 221 506 222 490 228 508 243 544 242 Q 560 252 539 263 L 501 265 499 264 494 267 486 270 Q 527 288 489 308 L 454 311 Q 431 308 410 298 386 285 411 265 371 243 404 224 L 399 221 383 212 373 222 Q 395 229 379 237 L 336 234 334 233 330 233 Q 300 233 269 218 245 205 245 190 L 245 185 245 174 Q 250 163 265 156 L 275 152 Q 248 149 214 131 202 125 209 114 L 221 100 308 103 Q 351 130 313 149 L 303 153 327 162 337 169 355 176 366 183 368 178 367 177 Q 360 173 372 167 386 160 393 160 L 404 157 379 147 Q 351 133 342 112 334 90 354 80 L 390 76 Q 420 79 460 99 L 461 98 474 93 Q 458 92 441 83 423 74 428 59 432 47 440 44 465 31 500 54 L 513 63 515 57 Q 517 55 526 50 L 522 46 Q 507 29 516 25 L 579 26 Q 578 21 585 17 L 606 14 Q 620 18 607 25 L 591 29 Q 646 45 606 65 L 584 71 569 71 566 72 552 76 524 73 Q 529 80 522 83 L 497 92 Q 514 93 533 102 L 549 88 570 85 576 80 610 77 Q 621 81 618 86 645 89 653 99 662 109 665 128 L 665 132 670 129 694 123 694 118 Q 692 100 700 96 L 743 99 M 1085 293 L 1054 295 Q 1038 294 1037 275 1035 257 1043 253 1061 244 1097 260 1134 277 1112 287 L 1085 293 M 837 424 L 812 432 Q 783 436 758 424 710 400 752 378 786 361 830 383 873 405 837 424 M 844 294 L 823 310 790 318 Q 756 321 722 304 694 290 685 269 677 247 697 237 L 733 233 Q 764 236 806 257 849 279 844 294 M 835 366 L 845 360 Q 872 346 879 357 886 366 865 377 L 843 375 835 366 M 816 333 Q 832 346 812 356 L 798 361 771 352 Q 754 343 780 330 799 320 816 333 M 837 329 Q 834 324 844 319 L 858 316 883 320 Q 892 325 893 335 L 888 348 857 345 837 329 M 913 334 L 960 331 Q 983 340 967 349 L 922 357 Q 926 346 922 345 L 917 344 911 343 Q 904 340 913 334 M 892 245 L 940 241 Q 985 242 996 256 1005 266 1008 285 1011 305 1002 310 L 967 314 Q 927 314 896 299 867 284 873 266 877 253 892 245 M 810 114 Q 824 119 810 126 L 804 130 786 129 Q 773 122 787 115 L 810 114 M 975 144 L 965 146 949 143 Q 937 137 948 131 L 972 133 Q 985 139 975 144 M 888 161 L 859 136 Q 857 131 865 127 886 116 935 141 960 154 943 162 L 921 166 888 161 M 832 156 Q 843 163 833 168 820 175 807 168 797 163 810 156 823 151 832 156 M 865 203 Q 850 186 859 182 L 934 186 Q 989 202 949 222 L 927 228 882 219 865 203 M 843 211 Q 879 233 865 240 824 261 784 240 766 231 771 216 775 204 783 201 808 188 843 211 M 827 92 L 822 95 777 97 774 94 777 93 783 84 791 77 823 76 829 72 848 71 890 88 Q 902 94 890 100 L 843 102 827 92 M 1126 241 L 1134 234 Q 1156 222 1168 234 1180 245 1165 252 L 1120 254 1117 251 1120 250 1126 241 M 1073 208 Q 1072 202 1077 199 L 1097 201 Q 1110 204 1098 210 L 1075 212 1073 208 M 1054 200 L 1037 203 Q 1015 204 992 193 972 183 975 166 976 151 986 146 1008 135 1051 158 1093 181 1054 200 M 1024 220 Q 1049 233 1034 240 L 1018 245 984 240 Q 967 232 970 225 972 222 985 216 L 1024 220 M 1053 227 L 1059 219 Q 1069 214 1087 223 1105 231 1096 235 L 1085 238 1056 230 1053 227 M 516 -21 Q 514 -26 522 -30 543 -41 592 -16 617 -3 600 5 L 578 9 545 4 Q 520 -12 516 -21 M 606 -14 Q 594 -20 605 -26 L 629 -24 633 -22 641 -30 696 -27 Q 733 -17 705 0 L 708 1 Q 736 16 728 30 L 759 37 761 36 Q 778 46 782 62 787 77 775 83 L 739 91 689 84 675 88 641 83 Q 624 75 627 68 L 642 59 643 59 Q 634 49 635 40 L 640 30 Q 630 21 632 9 L 634 -1 630 -12 622 -11 606 -14 M 467 -1 Q 480 -6 489 -1 500 6 490 11 477 18 464 11 454 6 467 -1 M 443 -28 Q 430 -35 444 -42 L 467 -43 Q 481 -38 467 -31 L 461 -27 443 -28 M 486 -85 L 505 -86 547 -69 Q 559 -63 547 -57 L 500 -55 Q 464 -74 486 -85 M 377 -47 Q 378 -54 382 -56 394 -62 407 -56 L 430 -47 Q 437 -43 422 -35 L 386 -33 Q 376 -38 377 -47 M 312 -6 Q 310 -20 327 -28 358 -44 406 -20 453 4 410 25 L 386 31 Q 363 33 339 21 L 327 15 325 13 Q 313 4 312 -6 M 295 -42 L 283 -43 279 -48 283 -54 298 -54 Q 308 -48 299 -43 L 295 -42 M 267 -6 Q 280 -13 290 -6 301 -1 287 7 L 280 9 265 8 Q 252 1 267 -6 M 267 -80 Q 285 -74 267 -64 L 255 -61 234 -62 Q 219 -69 233 -77 L 267 -80 M 263 -143 Q 277 -139 264 -132 L 239 -127 Q 232 -135 242 -140 L 263 -143 M 357 -154 L 338 -149 299 -153 Q 283 -162 288 -174 L 298 -187 353 -184 Q 393 -173 357 -154 M 308 -136 L 367 -132 416 -120 418 -121 Q 435 -111 439 -95 444 -80 432 -74 420 -67 396 -66 359 -64 323 -83 290 -100 292 -117 295 -129 308 -136 M 134 -6 Q 108 -20 106 -37 103 -52 118 -59 152 -76 206 -48 262 -19 235 -6 225 3 209 7 175 14 134 -6 M 172 -100 L 187 -109 226 -107 Q 250 -99 223 -85 L 209 -81 181 -84 Q 166 -91 172 -100 M 90 -24 L 72 -21 Q 53 -19 38 -27 30 -31 35 -38 L 45 -47 54 -49 83 -43 Q 105 -32 90 -24";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 349 -166 L 291 -160 278 -163 278 -167 294 -196 Q 294 -219 334 -207 373 -195 373 -157 L 373 -156 401 -155 486 -139 493 -131 Q 493 -125 465 -124 L 456 -114 456 -112 454 -112 437 -115 349 -127 Q 349 -136 373 -138 369 -139 367 -141 L 358 -139 Q 341 -139 349 -164 L 349 -166 M 347 -179 L 346 -178 352 -180 347 -179 M 315 -179 L 299 -173 328 -176 315 -179 M 454 -74 Q 441 -93 441 -99 L 443 -110 445 -110 Q 452 -64 538 -45 L 592 -45 595 -44 Q 603 -45 613 -61 622 -77 645 -77 666 -77 674 -58 L 675 -55 699 -52 Q 744 -40 746 -11 746 -9 741 -9 L 731 -17 718 -23 717 -19 725 -2 727 -1 739 -4 751 -13 Q 754 -23 766 -26 791 -33 805 -19 L 819 4 814 10 785 0 759 -7 753 8 738 4 729 11 716 0 710 -12 714 -24 697 -25 Q 654 -25 654 -35 L 658 -48 655 -51 632 -47 635 -39 Q 634 -34 608 -33 L 609 -28 607 -23 589 -21 Q 471 -21 471 -43 L 475 -51 Q 464 -55 459 -58 448 -63 448 -67 448 -72 454 -74 M 1096 154 L 1145 164 Q 1179 175 1179 185 L 1172 194 1170 195 Q 1207 203 1207 221 1207 229 1199 229 L 1155 219 1110 209 1099 210 1101 219 1098 221 Q 1090 221 1090 212 1090 191 1122 190 L 1089 176 Q 1039 154 1029 141 1035 134 1047 144 1063 159 1079 159 L 1096 154 M 1073 135 Q 1070 135 1041 117 1023 106 1023 133 L 992 133 984 123 970 127 Q 963 127 961 117 L 961 107 Q 961 81 991 82 1021 82 1021 98 L 1012 108 1033 109 Q 1083 114 1083 128 1083 135 1073 135 M 1136 181 L 1151 186 1161 184 Q 1157 180 1150 179 L 1139 176 1138 178 1136 181 M 812 55 L 794 46 Q 794 26 831 37 867 48 867 60 L 867 64 887 63 917 71 909 83 870 83 863 80 857 70 860 67 859 67 836 60 812 55 M 788 29 L 778 23 777 23 785 28 785 29 765 21 Q 770 3 796 10 815 14 834 28 L 805 33 788 29";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj384=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/384.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj384,"assets/takeover/art/images/384.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj384.src="assets/takeover/art/images/384.png";
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

function shape3712(ctx,ctrans,frame,ratio,time){
	var pathData="M 112 -77 L 182 -106 Q 187 -107 218 -127 L 221 -130 222 -129 242 -142 267 -155 259 -167 274 -166 290 -164 299 -166 317 -169 321 -164 338 -162 334 -181 318 -177 Q 297 -173 279 -182 263 -190 268 -202 L 278 -216 Q 289 -221 315 -216 L 315 -214 Q 315 -195 336 -181 L 342 -177 345 -160 347 -159 371 -153 445 -149 470 -142 470 -140 457 -134 443 -127 439 -121 426 -115 420 -114 420 -112 Q 454 -90 448 -74 472 -71 496 -59 L 500 -57 502 -58 Q 520 -67 559 -49 L 582 -52 585 -53 Q 596 -59 609 -53 L 609 -52 614 -52 615 -54 Q 602 -56 596 -60 L 593 -66 601 -66 656 -70 653 -64 650 -60 676 -55 686 -51 692 -51 692 -49 719 -49 722 -46 719 -44 722 -44 732 -39 Q 743 -17 773 -9 768 -5 760 -4 L 761 1 773 6 788 8 813 15 813 17 800 23 790 27 813 32 854 43 845 51 850 53 873 55 Q 891 64 913 66 L 911 68 900 72 909 78 904 81 859 81 845 78 826 75 799 74 798 70 815 70 808 65 804 67 798 69 790 72 791 83 Q 815 86 839 98 L 843 100 845 99 Q 863 90 902 108 L 925 105 928 104 Q 939 98 952 104 L 952 105 1009 105 1010 106 1038 131 1039 135 1050 146 1053 147 1067 146 1083 154 1077 153 1080 155 1085 154 1092 158 1150 176 1149 177 1125 177 1116 173 1110 177 1083 177 1078 182 1055 183 1053 179 1053 177 1044 177 1031 174 1034 179 Q 1049 183 1064 190 L 1079 199 Q 1090 190 1119 185 L 1156 189 1197 200 1187 209 Q 1178 212 1183 221 L 1178 223 1154 221 1147 224 1141 226 1133 229 Q 1130 242 1092 260 L 1089 261 1031 285 1028 287 1013 293 898 348 833 382 817 395 792 403 788 404 759 418 717 445 Q 673 471 639 471 L 623 468 Q 622 465 618 465 L 606 467 599 469 Q 591 469 578 459 565 448 558 448 L 555 448 Q 546 399 457 386 L 399 384 Q 386 329 289 315 L 245 312 250 311 241 307 243 312 234 312 237 299 Q 237 278 224 267 203 250 145 250 L 141 250 Q 108 208 37 170 3 151 -27 143 L -35 140 -56 136 -76 135 Q -68 124 -68 112 -68 74 -153 55 L -173 51 -160 40 -159 41 -131 9 Q -128 1 -109 -6 L -43 -21 Q -23 -24 -6 -33 L -7 -34 -6 -37 -4 -37 -1 -36 32 -51 112 -77 M 243 -127 Q 264 -127 268 -139 L 243 -127 M 532 -134 L 533 -137 533 -134 532 -134 M 413 -161 L 394 -164 415 -163 425 -163 413 -161 M 485 -165 L 473 -149 464 -149 462 -160 Q 459 -178 482 -172 L 485 -165 M 505 -158 L 496 -148 494 -151 501 -158 505 -158 M 488 -112 Q 494 -98 513 -86 L 534 -76 516 -76 502 -79 483 -82 456 -83 455 -87 472 -87 463 -94 462 -95 458 -100 458 -101 Q 456 -107 466 -112 L 485 -114 488 -112 M 696 -22 L 707 -11 710 -10 729 -12 726 -22 731 -32 729 -34 Q 722 -42 713 -42 L 707 -38 707 -37 705 -37 714 -33 707 -28 695 -27 696 -22 M 584 -13 L 587 -11 605 -10 612 -9 612 -20 614 -30 610 -36 586 -33 Q 590 -28 580 -23 L 579 -22 584 -13 M 743 -3 L 734 -4 737 -2 743 -3 M 809 -6 L 827 -6 816 8 807 8 805 -3 804 -6 809 -6 M 850 -1 L 842 10 837 6 844 -1 850 -1 M 1076 232 L 1077 232 1096 244 1117 230 1111 230 1104 230 1085 225 1076 232 M 936 88 L 941 78 Q 944 76 957 72 L 979 72 997 78 997 79 999 85 999 87 996 93 987 104 939 97 Q 936 94 936 88 M 1042 267 L 1034 267 1024 264 1021 269 1029 274 1033 272 1042 267 M 848 348 L 815 358 833 375 836 373 907 335 921 328 902 330 848 348 M 979 299 L 956 297 944 305 953 313 979 299 M 930 146 L 955 148 955 137 Q 956 126 962 120 L 929 124 Q 933 129 923 134 L 922 135 927 144 930 146 M 564 468 L 581 481 587 487 582 500 Q 577 509 568 509 L 566 509 567 504 566 501 576 495 573 493 570 496 565 498 554 484 556 471 564 468 M 267 309 L 264 310 269 309 267 309 M -6 241 L -5 243 -6 244 -6 241 M -286 83 Q -286 74 -253 68 L -237 67 -238 76 -230 98 -249 105 -259 104 -262 102 -260 98 -249 98 -246 98 -239 94 -250 90 -283 86 -286 83";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 754 105 L 752 104 750 106 754 105 M 407 -51 L 411 -52 409 -53 407 -51 M 194 -135 L 201 -138 Q 225 -150 274 -148 336 -145 371 -114 L 411 -76 413 -72 416 -70 448 -55 Q 472 -53 496 -41 L 516 -31 534 -25 587 7 608 9 617 9 Q 679 12 714 43 L 754 81 756 85 759 87 791 102 Q 815 104 839 116 L 859 126 877 132 930 164 999 177 Q 1061 188 1022 250 L 1024 256 Q 1031 259 1028 271 1022 292 1005 300 L 966 309 906 345 848 366 815 376 807 380 790 383 783 386 770 390 756 398 693 400 Q 643 394 607 376 L 586 358 581 353 570 351 489 317 467 304 463 307 Q 453 313 432 302 422 297 421 289 420 282 425 280 L 426 280 425 279 410 279 Q 350 275 314 256 287 243 276 225 L 264 219 243 201 238 196 227 194 146 160 124 147 120 150 89 145 Q 79 140 78 132 77 125 82 123 L 83 123 82 122 67 122 Q 7 118 -29 99 -73 78 -74 41 -87 18 -73 -4 L -70 -8 Q -40 -13 -10 -33 L -8 -34 Q 61 -53 88 -74 105 -86 151 -105 182 -116 182 -132 L 194 -135";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -70 103 Q -77 78 -127 62 L -114 54 Q -80 36 -63 64 -46 93 -59 99 L -70 103 M 249 161 Q 285 190 270 210 L 280 221 289 242 304 254 Q 325 278 314 283 L 258 278 Q 243 271 245 259 L 247 253 229 244 212 229 190 227 Q 147 221 157 216 118 197 129 173 136 156 158 145 202 122 249 161 M 210 80 Q 246 106 222 118 L 191 125 Q 165 125 139 113 L 126 104 116 111 82 121 Q 43 125 3 105 -24 92 -34 70 -45 47 -26 37 -8 29 38 27 97 27 136 50 149 55 147 68 179 57 210 80 M 724 387 L 726 387 721 384 721 387 724 387 M 588 416 Q 590 407 599 403 628 387 647 411 668 435 657 440 627 449 601 435 586 428 588 416 M 472 330 Q 479 313 501 302 545 279 592 318 641 357 595 380 L 533 384 Q 490 378 500 373 461 354 472 330 M 456 59 L 457 57 454 55 448 57 456 59 M 791 214 L 799 216 800 214 797 212 791 214 M 760 61 Q 818 96 771 120 L 725 127 Q 696 125 663 108 L 650 100 635 94 Q 613 83 617 67 620 54 633 47 659 34 690 41 723 38 760 61 M 825 337 Q 853 345 827 359 L 806 366 779 365 780 366 Q 835 389 795 409 784 415 761 418 723 421 697 408 663 391 664 378 665 372 684 362 L 719 353 697 347 Q 686 341 692 331 696 324 703 320 727 309 751 324 772 341 754 351 L 739 354 764 360 Q 758 356 762 350 L 771 340 825 337 M 998 315 L 945 310 935 305 919 314 885 323 Q 848 326 816 310 785 294 787 278 789 267 803 260 856 234 916 260 940 270 946 280 978 267 1009 280 1044 297 1028 305 L 998 315 M 960 224 Q 963 211 976 204 1015 184 1064 209 1112 232 1070 254 L 1039 260 978 251 Q 956 240 960 224 M 844 135 L 825 139 827 141 Q 852 156 825 169 L 820 170 838 179 847 186 860 178 862 177 860 176 Q 850 171 854 155 858 140 865 136 887 125 913 146 939 164 918 176 L 926 181 Q 957 204 925 219 L 865 228 849 239 800 246 738 235 Q 752 254 729 265 L 687 282 700 284 707 292 709 297 726 298 Q 737 298 723 305 L 696 314 Q 668 321 654 314 645 309 649 300 L 655 292 Q 662 288 672 285 L 679 283 Q 642 288 607 270 566 250 569 230 L 570 224 562 225 513 216 490 199 484 202 475 205 479 207 Q 492 212 490 225 522 214 553 237 589 263 565 275 L 534 282 Q 508 282 482 270 L 469 261 459 268 425 278 Q 386 282 346 262 319 249 309 227 298 204 317 194 L 349 187 Q 345 181 349 174 353 167 360 163 384 152 408 167 422 178 418 187 L 422 187 428 183 482 180 491 184 505 174 517 168 544 168 597 204 628 200 691 209 708 214 708 200 703 194 Q 701 188 713 183 L 720 179 738 166 Q 748 161 760 159 759 154 765 148 L 780 135 794 131 Q 789 127 801 121 L 841 118 Q 865 124 844 135 M 458 -36 L 498 -39 Q 522 -33 501 -22 L 482 -18 484 -16 Q 509 -1 482 12 L 477 13 495 22 504 29 517 21 519 20 517 19 Q 507 14 511 -2 515 -17 522 -21 544 -32 570 -11 596 7 575 19 L 583 24 Q 602 38 597 49 L 599 50 Q 630 65 606 78 L 578 81 550 81 536 72 523 71 Q 529 80 519 85 L 503 90 473 88 457 89 395 78 Q 409 97 386 108 L 344 125 357 127 364 135 366 140 380 141 Q 372 133 375 123 377 115 386 110 409 99 442 116 L 445 118 Q 448 109 460 103 494 86 532 91 L 559 83 Q 600 79 649 104 675 117 681 132 697 142 685 148 L 682 150 Q 678 164 659 173 L 587 177 541 166 Q 505 169 473 153 L 454 141 440 151 425 156 391 148 385 145 380 148 353 157 Q 325 164 311 157 302 152 306 143 L 312 135 329 128 336 126 Q 299 131 264 113 223 93 226 73 L 227 67 219 68 170 59 Q 125 36 162 17 L 174 11 201 11 254 47 285 43 348 52 Q 357 53 365 57 L 365 43 360 37 Q 358 31 370 26 L 377 22 395 9 Q 405 4 417 2 416 -3 422 -9 L 437 -22 451 -26 Q 446 -30 458 -36 M 381 -76 L 362 -86 360 -85 360 -82 375 -73 382 -71 Q 378 -74 381 -76 M 382 -30 Q 353 -32 320 -49 295 -62 293 -79 293 -97 313 -107 360 -131 417 -96 475 -61 428 -37 410 -28 382 -30 M 167 -3 Q 137 -18 146 -36 151 -48 170 -57 197 -71 216 -74 257 -78 306 -53 347 -32 339 -8 335 7 316 16 L 244 20 Q 198 12 167 -3 M 189 -98 L 200 -111 Q 225 -124 256 -107 287 -92 263 -79 L 235 -76 207 -76 Q 187 -86 189 -98 M 176 -91 Q 189 -79 176 -72 L 160 -67 130 -69 Q 118 -75 125 -82 L 140 -90 176 -91 M 43 -47 Q 66 -58 99 -41 131 -22 97 -6 L 82 -1 48 -9 Q 27 -19 32 -34 34 -42 43 -47";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 268 -185 L 278 -197 278 -198 Q 278 -225 317 -240 L 340 -245 338 -244 Q 315 -233 315 -214 315 -195 336 -181 351 -171 375 -166 L 355 -163 Q 334 -163 313 -174 291 -187 273 -189 L 271 -184 268 -185 M 161 -94 Q 146 -101 152 -110 L 167 -119 206 -117 Q 230 -109 203 -95 L 189 -91 161 -94 M 86 -47 Q 83 -62 98 -69 132 -86 186 -58 242 -29 215 -16 205 -7 189 -3 155 4 114 -16 88 -30 86 -47 M 34 -59 L 63 -53 Q 85 -42 70 -34 L 52 -31 Q 33 -29 18 -37 10 -41 15 -48 L 25 -57 34 -59 M 414 -163 L 415 -163 Q 446 -163 457 -171 L 458 -172 462 -172 477 -176 484 -173 486 -171 519 -168 497 -149 Q 496 -164 480 -143 466 -125 463 -107 L 462 -111 Q 453 -125 453 -140 453 -150 447 -146 L 447 -148 440 -150 450 -151 451 -154 Q 451 -164 428 -160 L 414 -163 M 556 -70 L 601 -66 Q 662 -66 683 -79 695 -86 695 -99 L 694 -105 706 -115 Q 730 -131 730 -107 L 721 -92 713 -76 Q 713 -67 722 -55 L 727 -52 Q 738 -6 809 -6 L 851 -9 855 -5 Q 840 7 840 18 L 845 32 843 32 840 42 Q 840 50 850 59 L 856 64 808 59 800 53 Q 804 44 829 30 L 827 28 Q 834 26 834 17 834 12 792 0 744 -14 728 -28 L 703 -60 Q 684 -82 684 -57 L 684 -55 643 -51 Q 612 -51 551 -66 L 556 -70 M 847 35 L 864 49 884 60 Q 851 55 847 35 M 891 62 L 929 67 940 67 939 68 948 69 947 67 Q 985 65 999 55 L 996 60 Q 993 63 993 67 993 72 995 70 L 997 71 997 73 1000 90 996 83 993 77 Q 983 67 977 82 974 92 974 109 974 140 1014 159 L 1104 202 1108 200 1107 199 1117 202 1124 195 1121 189 1124 189 1122 187 1119 187 Q 1110 178 1086 165 L 1029 134 1017 118 1011 108 Q 1027 127 1048 136 L 1092 158 Q 1135 177 1169 177 L 1178 175 1179 178 1170 193 Q 1183 197 1183 205 1185 216 1166 216 L 1156 215 1158 212 1147 209 1128 213 1125 213 1106 211 Q 1100 196 1031 175 955 151 955 92 L 949 80 944 86 Q 932 80 902 73 L 882 69 891 64 891 62 M 1140 219 L 1148 224 Q 1160 235 1145 242 L 1100 244 1097 241 1100 240 1106 231 1114 224 1120 221 1140 219 M 1077 220 L 1076 225 1065 228 Q 1053 229 1036 220 L 1033 217 1034 214 997 197 982 187 972 183 960 175 965 177 1032 205 1077 220 M 893 100 L 881 102 850 98 893 100 M 798 87 Q 776 96 757 87 L 754 84 757 83 763 74 771 67 772 67 Q 780 79 798 87 M 693 -6 Q 715 8 708 20 L 739 27 741 26 Q 758 36 762 52 767 67 755 73 L 719 81 669 74 655 78 621 73 Q 604 65 607 58 L 622 49 623 49 Q 614 39 615 30 L 620 20 Q 610 11 612 -1 L 614 -11 612 -14 691 -6 693 -6 M 578 -22 Q 595 -12 580 -5 L 558 -1 525 -6 Q 500 -22 496 -31 494 -36 502 -40 L 507 -42 578 -22 M 428 -98 Q 420 -106 420 -111 L 425 -127 425 -115 428 -98 M 422 -134 L 416 -130 402 -128 Q 416 -119 419 -105 424 -90 412 -84 400 -77 376 -76 339 -74 303 -93 270 -110 272 -127 275 -139 288 -146 L 293 -147 Q 329 -126 358 -126 L 422 -134 M 269 -163 L 258 -171 260 -173 269 -163 M 399 -144 L 404 -145 436 -149 431 -145 399 -144 M 219 -137 Q 212 -145 222 -150 L 243 -153 Q 257 -149 244 -142 L 219 -137 M 357 -57 Q 358 -64 362 -66 374 -72 387 -66 L 410 -57 Q 417 -53 402 -45 L 366 -43 Q 356 -48 357 -57 M 307 -38 Q 338 -54 386 -30 433 -6 390 15 L 366 21 Q 343 23 319 11 L 307 5 305 3 Q 293 -6 292 -16 290 -30 307 -38 M 245 -2 Q 232 -9 247 -16 260 -23 270 -16 281 -11 267 -3 L 260 -1 245 -2 M 214 -72 Q 199 -79 213 -87 L 247 -90 Q 265 -84 247 -74 L 235 -71 214 -72 M 263 -64 L 278 -64 Q 288 -58 279 -53 L 275 -52 263 -53 259 -58 263 -64 M 447 -11 Q 460 -16 469 -11 480 -4 470 1 457 8 444 1 434 -4 447 -11 M 447 -53 Q 461 -48 447 -41 L 441 -37 423 -38 Q 410 -45 424 -52 L 447 -53 M 632 -58 L 619 -58 597 -57 620 -56 632 -58 M 767 105 L 790 104 Q 804 109 790 116 L 784 120 766 119 Q 753 112 767 105 M 730 91 L 753 100 Q 757 102 754 106 762 114 749 120 L 726 126 729 127 Q 776 151 733 172 L 709 178 Q 686 180 662 168 L 650 162 648 160 Q 638 152 635 144 L 618 147 610 154 603 156 588 155 Q 580 150 583 146 L 558 141 532 154 523 156 530 167 563 163 597 164 609 172 616 174 Q 675 196 624 221 L 593 229 Q 564 230 533 214 L 515 201 502 210 487 211 486 212 470 218 488 233 524 232 Q 540 242 519 253 L 481 255 479 254 474 257 466 260 Q 507 278 469 298 L 434 301 390 288 Q 366 275 391 255 351 233 384 214 L 379 211 363 202 353 212 Q 375 219 359 227 L 316 224 314 223 310 223 Q 280 223 249 208 225 195 225 180 L 225 175 225 164 Q 230 153 245 146 L 255 142 Q 228 139 194 121 182 115 189 104 193 94 201 90 L 288 93 Q 331 120 293 139 L 283 143 307 152 317 159 Q 326 161 335 166 L 346 173 348 168 347 167 Q 340 163 352 157 366 150 373 150 L 384 147 359 137 Q 331 123 322 102 314 80 334 70 L 370 66 Q 400 69 440 89 L 441 88 454 83 Q 438 82 421 73 403 64 408 49 412 37 420 34 445 21 480 44 L 493 53 495 47 506 40 502 36 Q 487 19 496 15 L 559 16 565 7 586 4 Q 600 8 587 15 L 571 19 Q 626 35 586 55 L 564 61 549 61 546 62 532 66 504 63 Q 509 70 502 73 L 477 82 Q 494 83 513 92 L 529 78 550 75 556 70 590 67 Q 601 71 598 76 625 79 633 89 642 99 645 118 L 645 122 650 119 674 113 674 108 Q 672 90 680 86 L 723 89 730 91 M 1034 285 Q 1018 284 1017 265 1015 247 1023 243 1041 234 1077 250 1114 267 1092 277 L 1065 283 1034 285 M 810 373 Q 853 395 817 414 L 792 422 Q 763 426 738 414 690 390 732 368 766 351 810 373 M 815 356 L 825 350 Q 852 336 859 347 866 356 845 367 L 823 365 815 356 M 824 309 L 838 306 863 310 Q 872 315 873 325 L 868 338 837 335 817 319 Q 814 314 824 309 M 940 321 Q 963 330 947 339 910 351 902 347 906 336 902 335 L 897 334 891 333 Q 884 330 893 324 L 940 321 M 920 231 Q 965 232 976 246 985 256 988 275 991 295 982 300 L 947 304 Q 907 304 876 289 847 274 853 256 857 243 872 235 L 920 231 M 965 206 L 1004 210 Q 1029 223 1014 230 L 998 235 964 230 Q 947 222 950 215 952 212 965 206 M 812 146 Q 823 153 813 158 800 165 787 158 777 153 790 146 803 141 812 146 M 823 201 Q 859 223 845 230 804 251 764 230 746 221 751 206 755 194 763 191 788 178 823 201 M 868 151 L 839 126 Q 837 121 845 117 866 106 915 131 940 144 923 152 L 901 156 868 151 M 862 209 L 845 193 Q 830 176 839 172 L 914 176 Q 969 192 929 212 L 907 218 862 209 M -54 128 L -53 128 -26 135 -11 138 8 141 Q 29 144 46 154 76 144 121 167 171 194 150 204 L 106 208 108 210 134 247 154 243 164 242 165 232 169 226 167 220 174 215 189 212 Q 227 193 275 223 L 286 231 330 234 329 232 341 231 344 232 339 235 334 235 Q 342 238 349 243 391 272 362 287 L 306 288 242 279 233 279 224 267 219 264 233 279 238 285 253 311 253 314 256 314 Q 316 314 363 340 L 379 350 Q 404 368 406 385 432 367 495 390 556 410 567 454 608 482 608 506 L 599 524 Q 586 537 559 537 L 554 537 567 504 561 492 558 490 557 487 554 484 555 480 548 458 Q 542 440 525 430 508 419 472 410 L 405 389 405 392 396 397 347 359 Q 331 348 275 342 228 336 228 325 228 320 234 317 L 220 296 183 262 169 261 Q 160 270 129 272 118 272 118 261 L 120 255 104 236 67 197 Q 42 174 20 171 L -49 158 Q -68 152 -68 141 L -67 135 -67 134 -68 135 -72 137 -75 135 -76 135 -76 134 -83 116 -93 89 Q -100 79 -133 66 -163 55 -163 49 L -160 39 -167 39 Q -170 25 -164 21 -152 15 -139 24 -127 33 -134 36 L -138 37 -112 46 -103 51 Q -86 55 -68 66 -19 97 -52 113 L -61 116 -62 119 -62 122 -65 131 -54 128 M 464 324 Q 514 351 493 361 L 445 365 Q 406 362 379 350 L 363 338 Q 357 327 382 314 414 298 464 324 M 592 365 Q 568 352 568 337 568 325 582 318 625 297 678 323 733 351 688 373 L 653 380 Q 623 380 592 365 M 529 310 Q 546 321 533 328 L 518 331 490 319 Q 482 315 494 309 L 529 310 M 599 299 Q 572 296 537 278 525 272 532 261 536 251 544 247 L 631 250 Q 674 277 636 296 L 599 299 M 474 162 Q 471 157 481 152 L 483 151 460 143 437 150 467 162 Q 491 175 498 187 L 511 186 511 184 494 178 474 162 M 713 223 Q 744 226 786 247 829 269 824 284 823 290 803 300 L 770 308 Q 736 311 702 294 674 280 665 259 657 237 677 227 L 713 223 M 702 196 Q 690 190 700 185 L 725 186 Q 735 191 735 193 L 728 197 702 196 M 338 312 L 329 314 303 310 295 303 Q 295 298 300 295 314 288 333 295 353 304 338 312 M 190 171 L 175 174 147 162 Q 139 158 151 152 L 186 153 Q 203 164 190 171 M 91 144 L 47 131 Q 22 118 49 97 78 82 121 102 165 120 126 141 L 91 144 M 13 94 Q 24 104 17 108 4 115 -8 108 -16 104 -14 97 L -10 89 Q 1 83 13 94 M 9 54 Q 32 62 16 70 L -27 67 Q -40 60 -26 52 L 9 54 M 124 5 Q 181 36 143 55 L 105 65 Q 67 69 36 54 5 38 3 22 1 7 19 -2 64 -25 124 5 M 133 85 Q 136 80 143 77 L 181 75 Q 197 85 176 96 L 138 98 Q 128 93 133 85 M 204 181 Q 216 190 209 193 L 176 196 Q 173 182 179 178 191 172 204 181 M 281 64 L 250 72 Q 221 73 190 57 169 47 168 31 168 19 181 12 L 273 17 Q 332 39 281 64 M 392 36 L 385 40 359 39 Q 347 33 357 28 L 382 29 392 36 M 634 477 L 613 478 611 476 612 476 614 473 638 471 Q 645 471 634 477 M 690 324 Q 683 320 695 314 732 296 723 325 L 690 324 M 751 342 Q 734 333 760 320 779 310 796 323 812 336 792 346 L 778 351 751 342 M 510 377 L 517 372 551 375 Q 570 386 559 391 L 520 387 Q 509 382 510 377 M 577 413 L 594 400 Q 650 372 692 400 734 429 705 444 L 649 445 583 435 Q 566 426 577 413 M 295 314 L 297 316 289 315 281 314 295 314 M -4 78 L -12 78 -14 75 -2 74 1 75 -4 78 M -98 -11 Q -72 -25 -36 -5 1 15 -38 35 L -54 42 -93 39 Q -122 25 -118 7 -113 -4 -98 -11 M -283 83 Q -283 62 -237 66 L -238 76 -230 98 -243 103 -250 102 Q -283 98 -283 83";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 268 -185 L 271 -184 271 -182 Q 271 -167 302 -153 329 -141 347 -141 L 399 -144 431 -145 436 -149 440 -150 447 -148 447 -146 444 -143 435 -125 Q 435 -73 537 -47 L 644 -30 675 -35 689 -40 Q 698 -24 724 -5 757 19 795 26 779 40 779 58 779 80 863 86 880 87 897 95 L 918 101 932 103 936 103 935 108 Q 935 142 970 167 1009 194 1099 219 L 1107 213 1106 211 1125 213 1128 213 1147 209 1158 212 1156 215 1152 218 1140 219 1120 221 1099 223 1077 220 1032 205 965 177 960 175 Q 938 161 926 135 L 925 131 Q 921 127 924 124 L 924 115 Q 924 108 913 103 L 907 100 893 100 850 98 798 87 Q 780 79 772 67 L 767 47 Q 767 36 775 28 L 724 7 Q 711 0 701 -7 L 693 -6 691 -6 612 -14 584 -21 578 -22 507 -42 504 -43 Q 470 -51 447 -72 433 -85 428 -98 L 425 -115 425 -127 427 -135 422 -134 358 -126 Q 329 -126 293 -147 L 292 -148 269 -163 260 -173 258 -181 264 -186 268 -185 M 845 32 L 847 35 Q 851 55 884 60 L 891 62 891 64 882 69 856 64 850 59 Q 840 50 840 42 L 843 32 845 32 M 1107 199 L 1108 200 1104 202 1014 159 Q 974 140 974 109 974 92 977 82 983 67 993 77 L 996 83 994 81 Q 984 67 984 85 984 115 1019 149 1055 183 1107 199";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 271 -184 L 273 -189 Q 291 -187 313 -174 334 -163 355 -163 L 375 -166 414 -163 428 -160 Q 451 -164 451 -154 L 450 -151 440 -150 436 -149 404 -145 399 -144 347 -141 Q 329 -141 302 -153 271 -167 271 -182 L 271 -184 M 497 -149 Q 487 -137 487 -122 487 -112 493 -104 L 495 -102 495 -101 510 -88 513 -86 Q 531 -75 556 -70 L 551 -66 Q 612 -51 643 -51 L 684 -55 684 -57 Q 684 -82 703 -60 L 728 -28 Q 744 -14 792 0 834 12 834 17 834 26 827 28 L 829 30 Q 804 44 800 53 L 808 59 856 64 882 69 902 73 Q 932 80 944 86 L 949 80 955 92 Q 955 151 1031 175 1100 196 1106 211 L 1107 213 1099 219 Q 1009 194 970 167 935 142 935 108 L 936 103 932 103 918 101 897 95 Q 880 87 863 86 779 80 779 58 779 40 795 26 757 19 724 -5 698 -24 689 -40 L 675 -35 644 -30 537 -47 Q 435 -73 435 -125 L 444 -143 447 -146 Q 453 -150 453 -140 453 -125 462 -111 L 463 -107 Q 466 -125 480 -143 496 -164 497 -149 M 1000 90 L 1010 106 1011 108 1017 118 1029 134 1086 165 Q 1110 178 1119 187 L 1121 189 1124 195 1117 202 1107 199 Q 1055 183 1019 149 984 115 984 85 984 67 994 81 L 996 83 1000 90 M -54 128 L -65 131 -62 122 -62 119 -54 128 M -68 135 L -67 134 -67 135 -68 135";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3713(ctx,ctrans,frame,ratio,time){
	var pathData="M 13 -24 L 14 -27 16 -27 19 -26 52 -41 132 -67 202 -96 Q 207 -97 238 -117 L 241 -120 242 -119 262 -132 287 -145 279 -157 294 -156 310 -154 319 -156 337 -159 341 -154 358 -152 354 -171 338 -167 299 -172 Q 283 -180 288 -192 L 298 -206 353 -202 373 -191 382 -193 380 -185 391 -180 384 -175 361 -174 365 -150 367 -149 391 -143 465 -139 490 -132 490 -130 477 -124 463 -117 459 -111 446 -105 440 -104 440 -102 Q 474 -80 468 -64 492 -61 516 -49 L 520 -47 522 -48 Q 540 -57 579 -39 L 602 -42 605 -43 Q 616 -49 629 -43 L 629 -42 634 -42 635 -44 Q 622 -46 616 -50 613 -53 613 -59 613 -66 618 -69 L 634 -75 656 -75 674 -69 676 -60 673 -54 670 -50 696 -45 706 -41 712 -41 712 -39 739 -39 742 -36 739 -34 742 -34 Q 756 -29 759 -24 L 763 -24 766 -27 768 -24 Q 800 -23 800 -11 L 794 0 780 6 781 11 Q 789 14 793 16 L 808 18 833 25 833 27 820 33 810 37 Q 826 36 833 42 L 874 53 865 61 870 63 897 65 Q 935 68 935 72 L 931 78 920 82 929 88 Q 929 91 924 91 L 879 91 865 88 846 85 819 84 818 80 835 80 828 75 824 77 818 79 810 82 811 93 Q 835 96 859 108 L 863 110 865 109 Q 883 100 922 118 L 945 115 948 114 Q 959 108 972 114 L 972 115 1055 116 1055 118 1082 118 1085 121 1082 123 1085 123 Q 1104 130 1103 136 L 1109 130 1112 136 1112 140 Q 1109 140 1104 143 L 1092 133 Q 1085 125 1076 125 L 1070 129 1070 130 1069 130 Q 1058 136 1058 139 L 1059 145 1070 156 1073 157 1103 154 1119 158 1124 168 Q 1132 171 1136 173 L 1172 183 1169 187 1145 187 1136 183 1130 187 1103 187 1098 192 1075 193 1073 189 1073 187 1064 187 1051 184 1054 189 Q 1069 193 1084 200 1094 205 1099 209 1110 200 1139 195 L 1176 199 1217 210 1207 219 Q 1198 222 1203 231 L 1198 233 1174 231 1167 234 1161 236 1153 239 Q 1150 252 1112 270 L 1109 271 1051 295 1048 297 1033 303 918 358 853 392 837 405 812 413 808 414 779 428 737 455 Q 693 481 659 481 L 643 478 638 475 626 477 619 479 Q 611 479 598 469 L 578 458 565 460 563 463 557 463 538 464 530 466 540 469 542 472 539 478 528 473 503 467 471 464 458 462 443 467 439 466 437 463 444 456 451 450 450 450 440 447 433 443 433 435 440 434 467 440 Q 488 440 493 433 L 493 424 492 420 482 408 445 408 446 411 Q 446 424 428 424 L 418 424 Q 418 403 399 395 L 365 395 344 390 343 387 Q 343 385 346 382 L 350 380 351 375 353 371 353 368 355 367 367 367 368 367 361 358 324 363 325 364 313 373 316 376 320 376 311 380 288 380 257 375 Q 257 371 283 366 L 308 361 308 360 Q 308 357 311 357 L 317 355 278 355 Q 263 353 263 345 L 259 353 Q 254 362 245 362 L 236 362 223 362 208 358 203 354 Q 203 349 211 348 L 205 335 Q 205 330 217 328 L 208 319 198 319 196 321 191 319 176 319 172 318 170 314 170 312 160 310 128 307 115 305 100 310 96 309 94 306 101 299 108 293 107 293 97 290 90 286 90 278 97 277 124 283 147 279 144 278 104 271 101 269 103 265 114 265 117 265 124 261 113 257 103 255 Q 102 267 85 267 L 75 267 Q 75 246 56 238 L 22 238 1 233 0 230 3 225 7 223 8 218 10 214 10 211 12 210 24 210 25 210 18 201 -19 206 -18 207 -30 216 -27 219 -23 219 -32 223 -55 223 -86 218 Q -86 214 -60 209 L -35 204 -35 203 -32 200 -26 198 -65 198 Q -80 196 -80 188 L -78 187 Q -75 185 -75 175 L -71 173 -110 174 -125 171 -135 162 -167 162 -171 161 -173 157 Q -173 150 -152 143 L -143 141 -146 137 -144 133 -165 125 -176 125 -175 127 -199 121 -239 114 -242 112 -240 108 -229 108 -226 108 -219 104 -230 100 -263 96 -266 93 Q -266 84 -233 78 L -174 80 -157 65 -140 50 -139 51 -111 19 Q -108 11 -89 4 L -23 -11 Q -3 -14 14 -23 L 13 -24 M 288 -129 L 263 -117 Q 284 -117 288 -129 M 514 -141 L 521 -148 550 -148 Q 550 -140 553 -138 L 553 -124 546 -124 Q 539 -124 526 -132 L 514 -141 M 433 -151 Q 413 -151 406 -159 L 403 -169 Q 403 -177 412 -181 457 -182 457 -168 L 451 -157 Q 444 -151 433 -151 M 505 -155 L 493 -139 484 -139 482 -150 Q 479 -168 502 -162 L 505 -155 M 505 -104 L 527 -94 554 -92 592 -85 588 -79 577 -75 586 -69 581 -66 536 -66 522 -69 503 -72 476 -73 475 -77 492 -77 483 -84 482 -85 478 -90 478 -91 486 -102 505 -104 M 725 -27 L 734 -23 727 -18 715 -17 716 -12 727 -1 730 0 749 -2 Q 745 -7 746 -12 L 751 -22 749 -24 Q 742 -32 733 -32 L 727 -28 727 -27 725 -27 M 604 -3 L 607 -1 625 0 632 1 632 -10 634 -20 630 -26 606 -23 Q 610 -18 600 -13 L 599 -12 604 -3 M 1019 97 L 1016 103 1007 114 959 107 Q 956 104 956 98 L 961 88 977 82 999 82 1017 88 1019 97 M 1100 165 L 1106 164 1097 163 1100 165 M 1096 242 L 1097 242 1116 254 1137 240 1131 240 1124 240 1105 235 1096 242 M 893 9 Q 893 17 896 19 L 896 33 889 33 Q 882 33 869 25 L 857 16 864 9 893 9 M 827 18 L 825 7 Q 822 -11 845 -5 L 848 2 836 18 827 18 M 1053 282 L 1062 277 1054 277 1044 274 1041 279 1049 284 1053 282 M 976 307 L 964 315 973 323 999 309 976 307 M 941 338 L 922 340 868 358 835 368 853 385 856 383 927 345 941 338 M 975 147 Q 976 136 982 130 L 949 134 Q 953 139 943 144 L 942 145 947 154 950 156 975 158 975 147 M 757 8 L 763 7 754 6 757 8 M 584 478 L 601 491 607 497 602 510 588 519 Q 567 519 556 507 L 548 492 Q 548 487 563 484 L 584 478 M 72 263 L 54 268 34 269 Q 8 269 16 240 37 239 51 248 L 72 263 M 34 254 L 36 253 28 251 33 253 34 254 M 250 346 L 247 349 239 351 243 354 253 348 250 346 M 287 319 L 284 320 289 319 287 319 M 264 340 L 263 345 265 344 268 332 272 330 253 331 258 334 264 340 M 261 317 L 263 322 270 321 261 317 M 278 329 L 294 333 313 336 299 325 278 329 M 371 408 L 376 410 377 411 379 410 371 408 M 359 397 Q 380 396 394 405 L 415 420 397 425 377 426 Q 351 426 359 397 M 578 508 L 586 511 596 505 593 503 590 506 578 508 M -172 117 L -171 117 -169 116 -172 117 M -132 137 L -137 135 -140 135 -138 139 -132 137 M -110 191 Q -98 196 -98 199 L -99 204 -120 205 -135 201 -140 197 Q -140 188 -110 191 M -49 176 L -30 179 -44 168 -65 172 -49 176 M -83 158 L -80 165 -62 163 -54 162 -68 160 -81 157 -83 158";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 770 116 L 774 115 772 114 770 116 M 427 -41 L 431 -42 429 -43 427 -41 M 171 -95 Q 202 -106 202 -122 L 214 -125 221 -128 294 -138 Q 356 -135 391 -104 L 431 -66 433 -62 436 -60 468 -45 516 -31 536 -21 554 -15 607 17 628 19 637 19 Q 699 22 734 53 L 774 91 776 95 779 97 811 112 Q 835 114 859 126 L 879 136 897 142 Q 919 149 950 174 L 1019 187 Q 1081 198 1042 260 L 1044 266 Q 1051 269 1048 281 1042 302 1025 310 L 986 319 926 355 Q 908 365 868 376 L 835 386 827 390 810 393 803 396 790 400 776 408 713 410 Q 663 404 627 386 L 606 368 601 363 590 361 Q 566 355 509 327 L 487 314 483 317 Q 473 323 452 312 442 307 441 299 440 292 445 290 L 446 290 445 289 430 289 Q 370 285 334 266 307 253 296 235 L 284 229 Q 271 223 263 211 L 258 206 247 204 Q 223 198 166 170 L 144 157 140 160 109 155 Q 99 150 98 142 97 135 102 133 L 103 133 102 132 87 132 Q 27 128 -9 109 -53 88 -54 51 -67 28 -53 6 L -50 2 Q -20 -3 10 -23 L 12 -24 Q 81 -43 108 -64 L 171 -95";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -56 113 L -94 97 Q -127 80 -94 64 -60 46 -43 74 -26 103 -39 109 L -56 113 M 242 128 L 211 135 Q 185 135 159 123 L 146 114 136 121 102 131 Q 63 135 23 115 -4 102 -14 80 -25 57 -6 47 12 39 58 37 117 37 156 60 169 65 167 78 199 67 230 90 266 116 242 128 M 232 239 L 210 237 Q 167 231 177 226 138 207 149 183 156 166 178 155 222 132 269 171 305 200 290 220 L 300 231 309 252 324 264 Q 345 288 334 293 304 302 278 288 263 281 265 269 L 267 263 249 254 Q 234 246 232 239 M 746 397 L 741 394 741 397 744 397 746 397 M 608 426 Q 610 417 619 413 648 397 667 421 688 445 677 450 L 621 445 Q 606 438 608 426 M 492 340 Q 499 323 521 312 565 289 612 328 661 367 615 390 L 553 394 Q 510 388 520 383 481 364 492 340 M 468 67 L 476 69 477 67 474 65 468 67 M 710 51 Q 743 48 780 71 838 106 791 130 L 745 137 Q 716 135 683 118 L 670 110 655 104 Q 633 93 637 77 640 64 653 57 679 44 710 51 M 845 347 Q 873 355 847 369 L 826 376 799 375 800 376 Q 855 399 815 419 L 781 428 Q 743 431 717 418 683 401 684 388 685 382 704 372 L 739 363 717 357 Q 706 351 712 341 716 334 723 330 747 319 771 334 792 351 774 361 L 759 364 784 370 Q 778 366 782 360 L 791 350 845 347 M 955 315 L 939 324 905 333 Q 868 336 836 320 805 304 807 288 809 277 823 270 876 244 936 270 960 280 966 290 998 277 1029 290 1064 307 1048 315 L 1018 325 965 320 955 315 M 980 234 Q 983 221 996 214 1035 194 1084 219 1132 242 1090 264 L 1059 270 Q 1025 274 998 261 976 250 980 234 M 819 226 L 820 224 817 222 811 224 819 226 M 874 165 Q 878 150 885 146 907 135 933 156 959 174 938 186 L 946 191 Q 977 214 945 229 L 885 238 869 249 820 256 758 245 Q 772 264 749 275 L 707 292 720 294 727 302 729 307 746 308 Q 757 308 743 315 L 716 324 Q 688 331 674 324 665 319 669 310 L 675 302 692 295 699 293 Q 662 298 627 280 586 260 589 240 L 590 234 582 235 533 226 510 209 504 212 495 215 499 217 Q 512 222 510 235 542 224 573 247 609 273 585 285 L 554 292 Q 528 292 502 280 L 489 271 479 278 445 288 Q 406 292 366 272 339 259 329 237 318 214 337 204 348 199 369 197 365 191 369 184 373 177 380 173 404 162 428 177 442 188 438 197 L 442 197 448 193 502 190 511 194 525 184 537 178 564 178 Q 609 203 617 214 L 648 210 711 219 728 224 728 210 723 204 Q 721 198 733 193 L 740 189 758 176 Q 768 171 780 169 779 164 785 158 L 800 145 814 141 Q 809 137 821 131 L 861 128 Q 885 134 864 145 L 845 149 847 151 Q 872 166 845 179 L 840 180 858 189 867 196 880 188 882 187 880 186 Q 870 181 874 165 M 471 -16 Q 466 -20 478 -26 L 518 -29 Q 542 -23 521 -12 L 502 -8 504 -6 Q 529 9 502 22 L 497 23 515 32 524 39 537 31 539 30 537 29 Q 527 24 531 8 535 -7 542 -11 564 -22 590 -1 616 17 595 29 L 603 34 Q 622 48 617 59 L 619 60 Q 650 75 626 88 L 598 91 570 91 556 82 543 81 Q 549 90 539 95 L 523 100 493 98 477 99 Q 441 99 415 88 429 107 406 118 L 364 135 377 137 384 145 386 150 400 151 Q 392 143 395 133 397 125 406 120 429 109 462 126 L 465 128 Q 468 119 480 113 514 96 552 101 L 579 93 Q 620 89 669 114 695 127 701 142 717 152 705 158 L 702 160 Q 698 174 679 183 L 607 187 561 176 Q 525 179 493 163 L 474 151 460 161 445 166 Q 428 166 411 158 L 405 155 400 158 373 167 Q 345 174 331 167 322 162 326 153 L 332 145 349 138 356 136 Q 319 141 284 123 243 103 246 83 L 247 77 239 78 Q 212 80 190 69 145 46 182 27 L 194 21 221 21 Q 266 46 274 57 L 305 53 368 62 Q 377 63 385 67 L 385 53 380 47 Q 378 41 390 36 L 397 32 415 19 Q 425 14 437 12 436 7 442 1 L 457 -12 471 -16 M 313 -69 Q 313 -87 333 -97 380 -121 437 -86 495 -51 448 -27 430 -18 402 -20 373 -22 340 -39 315 -52 313 -69 M 401 -66 L 382 -76 380 -75 380 -72 395 -63 402 -61 Q 398 -64 401 -66 M 209 -88 Q 210 -96 220 -101 L 276 -97 Q 307 -82 283 -69 L 255 -66 227 -66 Q 207 -76 209 -88 M 52 -24 Q 54 -32 63 -37 86 -48 119 -31 151 -12 117 4 L 102 9 68 1 Q 47 -9 52 -24 M 166 -26 Q 171 -38 190 -47 217 -61 236 -64 277 -68 326 -43 367 -22 359 2 355 17 336 26 L 264 30 Q 218 22 187 7 157 -8 166 -26 M 160 -80 L 196 -81 Q 209 -69 196 -62 L 180 -57 150 -59 Q 138 -65 145 -72 L 160 -80";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -114 46 L -147 49 Q -150 35 -144 31 -132 25 -119 34 -107 43 -114 46 M -18 45 L -34 52 -73 49 Q -102 35 -98 17 L -78 -1 Q -52 -15 -16 5 21 25 -18 45 M -48 76 Q 1 107 -32 123 L -62 131 Q -100 136 -132 120 -166 103 -158 85 L -134 65 Q -96 46 -48 76 M 315 324 Q 322 324 311 330 L 290 331 288 329 289 329 291 326 315 324 M 320 305 Q 334 298 353 305 373 314 358 322 L 349 324 323 320 315 313 320 305 M 146 151 L 111 154 Q 88 151 67 141 42 128 69 107 98 92 141 112 185 130 146 151 M 54 202 Q 22 186 59 167 91 151 141 177 191 204 170 214 L 122 218 Q 81 215 54 202 M 10 148 Q 30 157 15 165 L 6 167 -20 163 -28 156 -23 148 Q -9 141 10 148 M 12 118 Q 4 114 6 107 L 10 99 Q 21 93 33 104 44 114 37 118 24 125 12 118 M 8 88 L 6 85 18 84 21 85 Q 19 87 16 88 L 8 88 M 29 64 Q 52 72 36 80 L -7 77 Q -20 70 -6 62 L 29 64 M 163 87 L 201 85 Q 217 95 196 106 L 158 108 Q 148 103 153 95 156 90 163 87 M 144 15 Q 201 46 163 65 L 125 75 Q 87 79 56 64 25 48 23 32 21 17 39 8 84 -15 144 15 M 209 222 Q 247 203 295 233 L 306 241 350 244 349 242 361 241 364 242 359 245 354 245 369 253 Q 411 282 382 297 L 326 298 262 289 Q 235 289 211 277 L 208 276 206 277 187 276 180 269 184 264 189 262 Q 180 252 185 242 L 189 236 187 230 Q 187 229 194 225 L 209 222 M 224 191 Q 236 200 229 203 L 196 206 Q 193 192 199 188 211 182 224 191 M 206 163 Q 223 174 210 181 L 195 184 167 172 Q 159 168 171 162 L 206 163 M 301 74 L 270 82 Q 241 83 210 67 189 57 188 41 188 29 201 22 L 293 27 Q 352 49 301 74 M 654 487 L 633 488 631 486 632 486 634 483 658 481 Q 665 481 654 487 M 743 335 L 710 334 Q 703 330 715 324 752 306 743 335 M 484 334 Q 534 361 513 371 L 465 375 Q 424 372 397 359 365 343 402 324 434 308 484 334 M 603 445 Q 586 436 597 423 604 415 614 410 670 382 712 410 754 439 725 454 L 669 455 603 445 M 523 426 L 527 421 Q 537 416 546 424 556 431 549 434 L 530 433 523 426 M 571 385 Q 590 396 579 401 L 540 397 Q 529 392 530 387 530 386 537 382 553 374 571 385 M 510 329 Q 502 325 514 319 L 549 320 Q 566 331 553 338 L 538 341 Q 531 340 510 329 M 588 347 Q 588 335 602 328 645 307 698 333 753 361 708 383 L 673 390 Q 643 390 612 375 588 362 588 347 M 552 271 L 564 257 651 260 Q 694 287 656 306 L 619 309 Q 592 306 557 288 545 282 552 271 M 503 161 L 480 153 457 160 487 172 Q 511 185 518 197 L 531 196 531 194 514 188 494 172 Q 491 167 501 162 L 503 161 M 412 46 L 405 50 379 49 Q 367 43 377 38 L 402 39 412 46 M 745 196 L 755 203 748 207 722 206 Q 710 200 720 195 L 745 196 M 743 99 L 750 101 773 110 Q 777 112 774 116 782 124 769 130 L 746 136 749 137 Q 796 161 753 182 L 729 188 Q 706 190 682 178 L 670 172 668 170 655 154 638 157 630 164 623 166 608 165 Q 600 160 603 156 L 578 151 552 164 543 166 550 177 583 173 617 174 Q 627 178 629 182 L 636 184 Q 695 206 644 231 L 613 239 Q 584 240 553 224 L 535 211 522 220 507 221 506 222 490 228 508 243 544 242 Q 560 252 539 263 L 501 265 499 264 494 267 486 270 Q 527 288 489 308 L 454 311 Q 431 308 410 298 386 285 411 265 371 243 404 224 L 399 221 383 212 373 222 Q 395 229 379 237 L 336 234 334 233 330 233 Q 300 233 269 218 245 205 245 190 L 245 185 245 174 Q 250 163 265 156 L 275 152 Q 248 149 214 131 202 125 209 114 L 221 100 308 103 Q 351 130 313 149 L 303 153 327 162 337 169 355 176 366 183 368 178 367 177 Q 360 173 372 167 386 160 393 160 L 404 157 379 147 Q 351 133 342 112 334 90 354 80 L 390 76 Q 420 79 460 99 L 461 98 474 93 Q 458 92 441 83 423 74 428 59 432 47 440 44 465 31 500 54 L 513 63 515 57 Q 517 55 526 50 L 522 46 Q 507 29 516 25 L 579 26 Q 578 21 585 17 L 606 14 Q 620 18 607 25 L 591 29 Q 646 45 606 65 L 584 71 569 71 566 72 552 76 524 73 Q 529 80 522 83 L 497 92 Q 514 93 533 102 L 549 88 570 85 576 80 610 77 Q 621 81 618 86 645 89 653 99 662 109 665 128 L 665 132 670 129 694 123 694 118 Q 692 100 700 96 L 743 99 M 1054 295 Q 1038 294 1037 275 1035 257 1043 253 1061 244 1097 260 1134 277 1112 287 L 1085 293 1054 295 M 830 383 Q 873 405 837 424 L 812 432 Q 783 436 758 424 710 400 752 378 786 361 830 383 M 844 294 L 823 310 790 318 Q 756 321 722 304 694 290 685 269 677 247 697 237 L 733 233 Q 764 236 806 257 849 279 844 294 M 844 319 L 858 316 883 320 Q 892 325 893 335 L 888 348 857 345 837 329 Q 834 324 844 319 M 816 333 Q 832 346 812 356 L 798 361 771 352 Q 754 343 780 330 799 320 816 333 M 835 366 L 845 360 Q 872 346 879 357 886 366 865 377 L 843 375 835 366 M 922 357 Q 926 346 922 345 L 917 344 911 343 Q 904 340 913 334 L 960 331 Q 983 340 967 349 L 922 357 M 892 245 L 940 241 Q 985 242 996 256 1005 266 1008 285 1011 305 1002 310 L 967 314 Q 927 314 896 299 867 284 873 266 877 253 892 245 M 810 114 Q 824 119 810 126 L 804 130 786 129 Q 773 122 787 115 L 810 114 M 972 133 Q 985 139 975 144 L 965 146 949 143 Q 937 137 948 131 L 972 133 M 832 156 Q 843 163 833 168 820 175 807 168 797 163 810 156 823 151 832 156 M 882 219 L 865 203 Q 850 186 859 182 L 934 186 Q 989 202 949 222 L 927 228 882 219 M 843 211 Q 879 233 865 240 824 261 784 240 766 231 771 216 775 204 783 201 808 188 843 211 M 859 136 Q 857 131 865 127 886 116 935 141 960 154 943 162 L 921 166 888 161 859 136 M 823 76 L 829 72 848 71 890 88 Q 902 94 890 100 L 843 102 827 92 822 95 777 97 774 94 777 93 783 84 791 77 823 76 M 1134 234 Q 1156 222 1168 234 1180 245 1165 252 L 1120 254 1117 251 1120 250 1126 241 1134 234 M 1097 201 Q 1110 204 1098 210 L 1075 212 1073 208 Q 1072 202 1077 199 L 1097 201 M 1034 240 L 1018 245 984 240 Q 967 232 970 225 972 222 985 216 L 1024 220 Q 1049 233 1034 240 M 1053 227 L 1059 219 Q 1069 214 1087 223 1105 231 1096 235 L 1085 238 1056 230 1053 227 M 1054 200 L 1037 203 Q 1015 204 992 193 972 183 975 166 976 151 986 146 1008 135 1051 158 1093 181 1054 200 M 606 -14 Q 594 -20 605 -26 L 629 -24 633 -22 641 -30 696 -27 Q 733 -17 705 0 L 708 1 Q 736 16 728 30 L 759 37 761 36 Q 778 46 782 62 787 77 775 83 L 739 91 689 84 675 88 641 83 Q 624 75 627 68 L 642 59 643 59 Q 634 49 635 40 L 640 30 Q 630 21 632 9 L 634 -1 630 -12 622 -11 606 -14 M 522 -30 Q 543 -41 592 -16 617 -3 600 5 L 578 9 545 4 Q 520 -12 516 -21 514 -26 522 -30 M 467 -1 Q 480 -6 489 -1 500 6 490 11 477 18 464 11 454 6 467 -1 M 443 -28 Q 430 -35 444 -42 L 467 -43 Q 481 -38 467 -31 L 461 -27 443 -28 M 486 -85 L 505 -86 547 -69 Q 559 -63 547 -57 L 500 -55 Q 464 -74 486 -85 M 386 -33 Q 376 -38 377 -47 378 -54 382 -56 394 -62 407 -56 L 430 -47 Q 437 -43 422 -35 L 386 -33 M 312 -6 Q 310 -20 327 -28 358 -44 406 -20 453 4 410 25 L 386 31 Q 363 33 339 21 L 327 15 325 13 Q 313 4 312 -6 M 298 -54 Q 308 -48 299 -43 L 295 -42 283 -43 279 -48 283 -54 298 -54 M 267 -6 Q 280 -13 290 -6 301 -1 287 7 L 280 9 265 8 Q 252 1 267 -6 M 267 -80 Q 285 -74 267 -64 L 255 -61 234 -62 Q 219 -69 233 -77 L 267 -80 M 239 -127 Q 232 -135 242 -140 L 263 -143 Q 277 -139 264 -132 L 239 -127 M 353 -184 Q 393 -173 357 -154 L 338 -149 299 -153 Q 283 -162 288 -174 L 298 -187 353 -184 M 308 -136 L 367 -132 416 -120 418 -121 Q 435 -111 439 -95 444 -80 432 -74 420 -67 396 -66 359 -64 323 -83 290 -100 292 -117 295 -129 308 -136 M 106 -37 Q 103 -52 118 -59 152 -76 206 -48 262 -19 235 -6 225 3 209 7 175 14 134 -6 108 -20 106 -37 M 172 -100 L 187 -109 226 -107 Q 250 -99 223 -85 L 209 -81 181 -84 Q 166 -91 172 -100 M 90 -24 L 72 -21 Q 53 -19 38 -27 30 -31 35 -38 L 45 -47 54 -49 83 -43 Q 105 -32 90 -24";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 315 -179 L 299 -173 328 -176 315 -179 M 347 -179 L 346 -178 352 -180 347 -179 M 349 -166 L 291 -160 278 -163 278 -167 294 -196 Q 294 -219 334 -207 373 -195 373 -157 L 373 -156 401 -155 486 -139 493 -131 Q 493 -125 465 -124 L 456 -114 456 -112 454 -112 437 -115 349 -127 Q 349 -136 373 -138 369 -139 367 -141 L 358 -139 Q 341 -139 349 -164 L 349 -166 M 454 -74 Q 441 -93 441 -99 L 443 -110 445 -110 Q 452 -64 538 -45 L 592 -45 595 -44 Q 603 -45 613 -61 622 -77 645 -77 666 -77 674 -58 L 675 -55 699 -52 Q 744 -40 746 -11 746 -9 741 -9 L 731 -17 718 -23 717 -19 725 -2 727 -1 739 -4 751 -13 Q 754 -23 766 -26 791 -33 805 -19 L 819 4 814 10 785 0 759 -7 753 8 738 4 729 11 716 0 710 -12 714 -24 697 -25 Q 654 -25 654 -35 L 658 -48 655 -51 632 -47 635 -39 Q 634 -34 608 -33 L 609 -28 607 -23 589 -21 Q 471 -21 471 -43 L 475 -51 Q 464 -55 459 -58 448 -63 448 -67 448 -72 454 -74 M 1096 154 L 1145 164 Q 1179 175 1179 185 L 1172 194 1170 195 Q 1207 203 1207 221 1207 229 1199 229 L 1155 219 1110 209 1099 210 1101 219 1098 221 Q 1090 221 1090 212 1090 191 1122 190 L 1089 176 Q 1039 154 1029 141 1035 134 1047 144 1063 159 1079 159 L 1096 154 M 1073 135 Q 1070 135 1041 117 1023 106 1023 133 L 992 133 984 123 970 127 Q 963 127 961 117 L 961 107 Q 961 81 991 82 1021 82 1021 98 L 1012 108 1033 109 Q 1083 114 1083 128 1083 135 1073 135 M 1136 181 L 1151 186 1161 184 Q 1157 180 1150 179 L 1139 176 1138 178 1136 181 M 812 55 L 794 46 Q 794 26 831 37 867 48 867 60 L 867 64 887 63 917 71 909 83 870 83 863 80 857 70 860 67 859 67 836 60 812 55 M 788 29 L 778 23 777 23 785 28 785 29 765 21 Q 770 3 796 10 815 14 834 28 L 805 33 788 29";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj386=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/386.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj386,"assets/takeover/art/images/386.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj386.src="assets/takeover/art/images/386.png";
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

function sprite3714(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3710",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3711",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3712",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3713",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
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

var imageObj389=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/389.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj389,"assets/takeover/art/images/389.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj389.src="assets/takeover/art/images/389.png";
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

var imageObj391=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/391.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj391,"assets/takeover/art/images/391.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj391.src="assets/takeover/art/images/391.png";
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

function shape3720(ctx,ctrans,frame,ratio,time){
	var pathData="M -24 359 L -26 354 -34 355 -24 359 M -433 -23 L -393 -15 -389 -14 -317 -8 -277 -8 Q -149 -18 -101 -11 -37 -2 -15 33 L -21 60 Q -21 75 -11 88 L -35 104 -42 105 -42 108 -61 118 -56 154 -49 207 -31 257 -44 244 -52 256 -64 275 -63 276 -62 275 Q -56 269 -29 262 L -25 273 -17 261 -10 277 -16 279 -2 287 0 288 7 291 0 307 Q -33 380 -33 396 L -29 406 -18 394 -12 398 -11 398 Q -19 414 -33 414 L -53 410 -64 405 -76 402 -171 409 -192 402 -208 397 -321 410 -383 404 -434 409 -527 403 -567 413 Q -589 413 -618 401 L -668 402 -678 402 -700 404 Q -756 404 -792 383 L -839 374 -813 346 -806 345 -806 322 Q -825 295 -837 238 L -849 190 -829 165 -809 138 Q -804 124 -805 107 L -805 100 -804 93 -794 42 Q -777 21 -730 8 L -635 5 -565 -20 -460 -20 -433 -23 M -659 157 L -663 156 -663 157 -659 157 M -846 383 L -845 387 -846 384 -846 383 M -884 421 L -881 418 -884 421 M -886 373 L -887 374 -886 373 M 49 148 L 46 162 45 156 47 147 49 140 49 148";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -109 72 L -126 76 Q -144 76 -172 47 -200 19 -151 19 -105 19 -105 44 -105 68 -109 72 M -162 106 Q -162 138 -195 151 L -233 156 -250 154 Q -247 159 -247 166 -247 186 -268 196 -282 203 -298 203 -333 203 -344 167 -355 137 -315 134 -335 125 -334 115 -338 81 -295 58 -262 41 -236 41 -209 41 -185 63 -162 85 -162 106 M -377 8 Q -354 17 -354 33 -354 47 -368 52 L -384 57 Q -432 57 -434 29 -435 2 -403 2 L -377 8 M -375 164 L -365 168 Q -335 183 -335 215 -335 244 -368 255 L -361 253 -340 252 -322 256 Q -307 261 -307 269 -307 280 -337 286 L -368 290 Q -388 290 -381 285 L -370 278 -376 272 -382 263 Q -382 258 -372 256 L -375 256 -428 261 Q -461 261 -476 241 -481 259 -507 273 -533 287 -550 287 L -577 285 Q -590 297 -631 302 -676 302 -686 273 L -687 266 Q -718 264 -727 239 -737 213 -706 213 -696 213 -672 223 -646 234 -646 242 L -646 244 -643 244 -624 244 -626 237 -626 221 -631 223 Q -669 223 -673 201 L -673 200 -693 203 Q -723 203 -714 189 -706 175 -682 175 -665 175 -662 181 L -647 180 -618 182 Q -605 185 -599 189 L -574 185 -543 189 -533 189 -509 194 -505 201 -486 211 -480 202 -449 168 Q -437 162 -421 159 -431 147 -434 109 -425 101 -415 100 L -398 99 Q -345 99 -345 135 -345 153 -368 162 L -375 164 M -256 355 L -253 355 -252 354 Q -253 352 -256 352 L -256 355 M -261 320 L -223 325 Q -205 334 -205 361 -205 382 -237 393 L -273 401 Q -330 401 -324 361 L -324 359 Q -329 366 -343 371 L -366 373 Q -403 373 -396 355 -388 337 -354 337 L -334 339 Q -322 344 -321 349 -318 340 -311 335 L -327 338 Q -352 338 -360 316 -367 295 -333 295 L -310 298 Q -292 302 -292 312 -292 320 -298 326 L -261 320 M -123 277 Q -145 298 -172 298 -237 298 -257 248 -278 199 -216 199 -185 199 -157 209 -114 224 -114 256 -101 256 -123 277 M -166 344 Q -185 317 -144 317 L -117 324 Q -99 331 -99 344 -99 365 -131 371 -147 371 -166 344 M -430 86 Q -430 109 -452 134 -476 161 -508 161 L -559 151 Q -598 134 -598 101 -598 62 -563 50 L -508 44 -461 50 Q -430 62 -430 86 M -533 33 Q -552 33 -560 20 -568 5 -533 5 L -511 7 Q -497 9 -497 19 -497 28 -515 32 L -533 33 M -578 20 Q -560 28 -560 44 L -580 56 -605 62 Q -639 62 -640 39 -641 13 -605 13 -591 13 -578 20 M -551 244 L -550 249 -548 250 -544 244 -551 244 M -685 97 L -683 113 -677 117 -674 113 -677 99 -682 97 -685 97 M -626 75 Q -602 90 -602 109 -602 136 -620 151 -636 162 -662 162 -729 162 -737 111 -745 61 -679 61 -650 61 -626 75 M -650 320 Q -625 331 -625 348 -625 369 -655 379 L -686 387 Q -746 387 -745 349 -744 311 -689 311 -670 311 -650 320 M -451 295 Q -427 306 -427 330 -427 356 -458 367 L -494 375 -518 374 -517 382 Q -517 401 -549 407 L -584 411 Q -607 411 -605 385 -603 361 -561 358 -572 348 -569 331 -563 286 -488 286 -468 286 -451 295";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -781 385 L -777 386 Q -771 386 -769 382 L -760 381 -743 385 -725 388 -723 388 -722 391 Q -722 407 -755 409 -776 409 -784 394 -788 387 -781 385 M -778 346 L -779 344 -779 339 Q -775 331 -766 331 -759 331 -753 336 L -748 340 Q -748 348 -767 348 L -778 346 M -798 309 L -806 290 -806 288 Q -808 253 -776 253 L -742 263 Q -716 276 -716 292 -716 311 -732 319 L -749 323 Q -785 323 -798 309 M -750 47 L -740 39 -724 23 -715 21 -679 29 Q -652 42 -652 69 -652 97 -680 111 L -716 120 Q -732 120 -751 106 -771 91 -772 76 L -769 76 -751 48 -750 47 M -734 6 L -761 13 -780 21 -792 19 -806 16 -807 10 -817 10 -817 11 -815 1 -807 -11 Q -796 -24 -781 -24 L -755 -17 Q -734 -9 -734 3 L -734 6 M -568 -5 Q -553 -1 -553 11 -553 21 -568 25 L -584 27 Q -622 27 -618 10 -613 -7 -592 -7 L -568 -5 M -675 -8 Q -661 -8 -655 0 L -680 5 Q -698 5 -693 -2 L -675 -8 M -162 -2 Q -171 -2 -175 -15 -178 -26 -161 -26 -153 -26 -135 -14 L -162 -2 M -385 -10 Q -372 -7 -372 0 -372 11 -388 18 L -405 22 Q -426 22 -426 4 -426 -8 -415 -12 L -404 -14 -385 -10 M -214 -20 Q -187 -8 -187 15 -187 30 -209 33 L -232 33 Q -287 33 -289 3 -291 -27 -254 -27 L -214 -20 M -72 116 L -72 138 -77 139 -87 142 Q -108 142 -106 127 -104 113 -84 113 L -72 116 M -70 171 L -66 202 Q -72 216 -88 227 -110 242 -128 242 -157 242 -158 202 -160 161 -115 161 -82 161 -70 171 M -79 85 L -112 90 Q -158 90 -167 47 -176 3 -121 3 L -77 10 Q -46 21 -46 48 -46 74 -79 85 M -161 92 Q -150 97 -150 104 -150 114 -168 114 -178 114 -185 100 -191 88 -175 88 L -161 92 M -201 79 L -193 75 -190 78 -195 81 -202 81 -202 80 -220 84 Q -244 84 -238 68 -231 52 -215 52 -195 52 -195 63 -195 74 -201 79 M -202 232 Q -221 232 -223 216 -225 202 -201 202 -184 202 -184 209 -184 225 -187 229 L -202 232 M -170 172 Q -182 183 -199 183 -255 183 -251 149 -248 117 -207 117 -157 124 -157 144 -157 161 -170 172 M -290 115 L -331 122 Q -385 122 -387 75 -388 27 -324 27 -298 27 -279 39 -258 53 -258 79 -258 104 -290 115 M -383 177 Q -397 185 -416 185 -488 185 -476 144 -463 104 -419 104 -401 104 -382 114 -360 126 -360 143 -360 167 -383 177 M -322 173 L -295 178 Q -274 185 -274 194 -274 222 -289 237 -301 248 -319 248 -373 248 -381 210 -389 173 -322 173 M -268 154 Q -268 171 -297 167 -327 167 -329 153 -331 138 -302 138 L -282 142 Q -268 145 -268 154 M -247 329 Q -311 329 -311 286 -311 244 -251 244 -231 244 -214 253 -193 264 -193 285 -193 308 -214 320 L -247 329 M -318 291 Q -318 297 -339 306 -387 286 -335 286 -318 286 -318 291 M -394 333 Q -400 316 -373 316 -336 316 -336 329 -336 344 -343 348 L -359 349 Q -388 349 -394 333 M -362 367 Q -355 368 -355 376 -355 387 -368 387 -397 387 -406 376 -416 366 -378 366 L -362 367 M -397 311 L -431 318 -470 312 Q -493 302 -493 269 -493 237 -476 221 -464 210 -446 210 -417 210 -392 230 -369 250 -369 273 -369 299 -397 311 M -283 413 Q -334 413 -334 378 -334 344 -286 344 -226 344 -226 382 -226 402 -253 409 L -283 413 M -52 297 Q -52 309 -64 307 -74 307 -77 297 -81 287 -67 287 L -57 290 Q -52 292 -52 297 M -114 316 Q -88 323 -88 336 -88 349 -119 372 -149 392 -161 392 -203 392 -213 352 -224 312 -145 312 L -114 316 M -116 261 Q -109 264 -109 273 -109 292 -131 292 -147 292 -149 276 -151 261 -129 261 L -116 261 M -48 383 Q -48 392 -64 391 -79 391 -77 386 L -55 378 -51 379 -49 379 -48 383 M -484 117 Q -484 123 -492 125 L -501 126 Q -521 126 -522 115 -523 107 -505 107 -484 107 -484 117 M -412 53 Q -412 86 -445 94 L -481 95 Q -519 95 -521 50 -522 5 -474 5 -453 5 -434 19 -412 33 -412 53 M -573 59 L -587 61 Q -612 61 -608 49 -604 38 -580 38 -560 38 -560 50 -560 57 -573 59 M -569 84 L -574 90 -580 90 Q -593 90 -593 82 L -583 76 -573 78 -569 84 M -536 185 L -561 189 Q -623 189 -622 151 -622 114 -578 114 -554 114 -537 125 -524 133 -519 145 L -518 147 -517 157 Q -517 176 -536 185 M -557 214 L -527 222 Q -502 232 -502 247 -502 279 -560 279 -580 279 -586 247 -592 214 -557 214 M -535 205 L -538 196 Q -538 185 -520 185 -506 185 -506 195 -506 210 -524 206 L -535 205 M -639 118 Q -626 126 -626 133 -626 145 -655 145 -676 145 -677 139 L -673 124 Q -673 113 -656 113 L -639 118 M -770 133 Q -739 133 -739 162 -739 175 -774 180 -790 180 -790 168 L -785 138 -770 133 M -787 237 Q -787 227 -771 227 -755 227 -755 235 -755 242 -762 244 L -772 247 Q -787 247 -787 237 M -719 190 L -701 194 Q -691 203 -686 227 L -704 242 -724 249 Q -748 249 -748 228 -748 190 -719 190 M -681 167 Q -700 167 -697 157 -695 149 -681 149 -661 149 -661 159 -661 166 -672 167 L -681 167 M -654 200 Q -656 191 -638 191 -619 191 -619 199 -619 210 -638 210 -652 210 -654 200 M -645 297 Q -701 297 -685 263 -668 231 -638 231 -625 231 -612 250 -602 264 -602 269 -602 286 -621 294 L -645 297 M -700 326 Q -701 308 -679 308 L -655 309 Q -643 314 -643 326 -643 339 -660 344 L -679 346 Q -700 346 -700 326 M -611 309 Q -584 295 -571 295 L -529 302 Q -500 315 -500 338 -500 362 -527 378 -546 388 -559 388 -572 388 -598 372 L -631 344 Q -642 328 -611 309 M -709 347 Q -709 361 -719 365 L -730 367 Q -743 367 -741 354 -740 339 -725 339 -717 339 -712 344 L -709 347 M -641 409 L -668 414 Q -698 414 -696 387 -693 361 -668 361 -656 361 -632 375 -607 391 -616 396 L -641 409 M -434 333 L -414 338 Q -408 344 -408 358 -408 373 -425 373 L -445 366 Q -460 356 -460 349 -460 340 -448 336 L -434 333 M -451 382 L -454 385 -436 394 Q -436 401 -480 405 -502 405 -499 388 -495 373 -461 373 -448 373 -448 378 L -451 382";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -781 385 L -786 378 -792 369 -818 376 -831 375 -835 369 -852 372 -865 362 -875 352 -879 356 -891 360 -904 356 -903 354 Q -883 341 -873 343 -863 345 -850 361 L -834 357 -827 354 -809 336 -824 295 -832 270 -851 199 -860 199 -891 176 -887 162 -886 161 -886 160 -886 159 -889 151 -886 129 -895 117 -909 107 -906 104 Q -878 110 -876 140 L -871 124 -869 124 -876 149 -876 159 -866 166 Q -862 172 -854 172 L -846 164 -837 164 -821 146 -818 142 -811 134 -812 122 -806 63 Q -806 31 -819 27 L -830 15 -846 6 -842 5 -831 12 -832 2 Q -832 -9 -825 -12 L -841 -18 -851 -24 -821 -23 Q -810 -19 -807 -11 L -817 -5 -822 3 -817 11 -806 16 -792 19 -780 21 -761 13 -734 6 Q -716 3 -716 14 L -724 23 -740 39 -750 47 Q -767 59 -783 62 L -791 103 -795 122 Q -786 120 -786 141 L -804 175 Q -823 208 -832 208 L -832 210 -831 209 -831 210 -831 211 -830 217 -829 225 -813 269 -806 290 -798 309 -788 330 -787 330 -779 344 -778 346 -775 351 -767 371 -768 379 -769 382 Q -771 386 -777 386 L -781 385 M -72 116 L -72 112 -69 106 -59 114 -56 107 -45 85 -19 84 Q -13 80 -6 55 1 34 10 34 L 25 39 Q 33 39 37 32 42 29 61 51 L 73 64 83 81 Q 81 85 73 86 L 41 44 11 50 Q 6 57 3 78 -6 95 -42 96 L -49 118 -52 126 Q -48 135 -47 147 L -41 201 -29 251 -26 251 -14 258 -3 268 -2 265 -4 254 0 246 -2 244 30 211 20 187 10 169 13 166 15 162 18 156 Q 34 165 45 185 L 60 217 39 233 35 237 28 246 31 247 26 251 25 251 26 259 17 267 13 275 13 280 13 281 16 281 16 282 24 289 Q 33 312 44 312 74 298 77 285 80 271 89 272 L 104 286 103 286 89 275 Q 85 280 84 288 L 75 299 44 325 Q 21 325 14 301 L 11 296 8 304 -5 337 Q -19 370 -37 387 L -3 312 -7 312 -25 303 -39 287 -39 285 Q -56 262 -65 211 L -66 202 -70 171 -72 138 -72 116 M 44 216 L 48 212 40 207 40 208 44 216 M -813 306 L -814 305 -811 310 -813 306 M -834 214 L -834 215 -834 214 M -835 213 L -834 212 -836 205 -840 202 -835 213 M -878 171 L -878 172 -883 171 -883 170 -884 172 -879 174 -874 175 -878 171 M -847 169 L -839 169 -838 167 -847 169";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj393=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/393.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj393,"assets/takeover/art/images/393.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj393.src="assets/takeover/art/images/393.png";
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

function shape3721(ctx,ctrans,frame,ratio,time){
	var pathData="M -24 359 L -26 354 -34 355 -24 359 M -64 275 L -63 276 -62 275 Q -56 269 -28 261 L -44 244 -52 256 -64 275 M -27 158 Q -39 151 -39 130 -39 105 12 109 L 18 109 37 115 Q 63 125 63 154 62 176 39 176 L 26 171 Q 17 164 3 164 L -27 158 M -433 -23 L -393 -15 -389 -14 -317 -8 -277 -8 Q -149 -18 -101 -11 -37 -2 -15 33 L -21 60 Q -21 75 -11 88 -25 100 -61 118 L -50 176 -41 218 -19 232 Q -6 244 -6 268 L -9 276 -16 279 16 295 Q 30 302 30 314 L 24 326 24 328 Q 24 337 20 338 L -5 338 -6 343 Q -1 350 -2 366 L -1 372 Q -1 379 -4 378 L -5 378 -6 383 Q -14 414 -33 414 L -53 410 -64 405 -76 402 -171 409 -192 402 -208 397 -321 410 -383 404 -434 409 -527 403 -567 413 Q -589 413 -618 401 L -668 402 -678 402 -700 404 Q -756 404 -792 383 L -839 374 Q -853 368 -853 362 -853 352 -828 348 L -845 315 -849 301 -877 305 -898 295 Q -908 285 -908 273 -908 253 -873 256 L -854 261 -856 211 Q -856 189 -829 165 -802 143 -805 107 -808 68 -802 53 -789 24 -730 8 L -635 5 -565 -20 -460 -20 -433 -23 M -663 156 L -663 157 -659 157 -663 156 M 11 244 L 13 237 20 232 26 233 Q 17 222 21 214 30 215 36 221 L 47 233 65 248 Q 74 252 74 261 L 72 267 65 268 21 256 Q 11 252 11 244 M -898 392 Q -898 378 -889 373 L -853 377 Q -845 379 -845 387 -845 396 -848 397 L -875 397 Q -872 409 -884 421 L -889 420 -898 392 M -952 191 L -959 172 Q -959 163 -955 163 L -884 163 -877 164 Q -862 180 -894 196 L -937 214 Q -943 200 -952 191 M -814 110 L -817 123 -858 129 -882 134 Q -893 134 -904 118 -914 104 -914 91 L -898 76 Q -882 65 -864 61 -814 50 -814 110 M -877 22 L -869 22 Q -867 33 -872 43 L -886 43 -887 39 Q -887 27 -877 22";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -195 151 L -233 156 -250 154 Q -247 159 -247 166 -247 186 -268 196 -282 203 -298 203 -333 203 -344 167 -355 137 -315 134 -335 125 -334 115 -338 81 -295 58 -262 41 -236 41 -209 41 -185 63 -162 85 -162 106 -162 138 -195 151 M -105 44 Q -105 68 -109 72 L -126 76 Q -144 76 -172 47 -200 19 -151 19 -105 19 -105 44 M -377 8 Q -354 17 -354 33 -354 47 -368 52 L -384 57 Q -432 57 -434 29 -435 2 -403 2 L -377 8 M -375 164 L -365 168 Q -335 183 -335 215 -335 244 -368 255 L -361 253 -340 252 -322 256 Q -307 261 -307 269 -307 280 -337 286 L -368 290 Q -388 290 -381 285 L -370 278 -376 272 -382 263 Q -382 258 -372 256 L -375 256 -428 261 Q -461 261 -476 241 -481 259 -507 273 -533 287 -550 287 L -577 285 Q -590 297 -631 302 -676 302 -686 273 L -687 266 Q -718 264 -727 239 -737 213 -706 213 -696 213 -672 223 -646 234 -646 242 L -646 244 -643 244 -624 244 -626 237 -626 221 -631 223 Q -669 223 -673 201 L -673 200 -693 203 Q -723 203 -714 189 -706 175 -682 175 -665 175 -662 181 L -647 180 -618 182 Q -605 185 -599 189 L -574 185 -543 189 -533 189 -509 194 -505 201 -486 211 -480 202 -449 168 Q -437 162 -421 159 -431 147 -434 109 -425 101 -415 100 L -398 99 Q -345 99 -345 135 -345 153 -368 162 L -375 164 M -256 355 L -253 355 -252 354 Q -253 352 -256 352 L -256 355 M -261 320 L -223 325 Q -205 334 -205 361 -205 382 -237 393 L -273 401 Q -330 401 -324 361 L -324 359 Q -329 366 -343 371 L -366 373 Q -403 373 -396 355 -388 337 -354 337 L -334 339 Q -322 344 -321 349 -318 340 -311 335 L -327 338 Q -352 338 -360 316 -367 295 -333 295 L -310 298 Q -292 302 -292 312 -292 320 -298 326 L -261 320 M -99 344 Q -99 365 -131 371 -147 371 -166 344 -185 317 -144 317 L -117 324 Q -99 331 -99 344 M -172 298 Q -237 298 -257 248 -278 199 -216 199 -185 199 -157 209 -114 224 -114 256 -101 256 -123 277 -145 298 -172 298 M -430 86 Q -430 109 -452 134 -476 161 -508 161 L -559 151 Q -598 134 -598 101 -598 62 -563 50 L -508 44 -461 50 Q -430 62 -430 86 M -533 33 Q -552 33 -560 20 -568 5 -533 5 L -511 7 Q -497 9 -497 19 -497 28 -515 32 L -533 33 M -578 20 Q -560 28 -560 44 L -580 56 -605 62 Q -639 62 -640 39 -641 13 -605 13 -591 13 -578 20 M -551 244 L -550 249 -548 250 -544 244 -551 244 M -682 97 L -685 97 -683 113 -677 117 -674 113 -677 99 -682 97 M -626 75 Q -602 90 -602 109 -602 136 -620 151 -636 162 -662 162 -729 162 -737 111 -745 61 -679 61 -650 61 -626 75 M -655 379 L -686 387 Q -746 387 -745 349 -744 311 -689 311 -670 311 -650 320 -625 331 -625 348 -625 369 -655 379 M -451 295 Q -427 306 -427 330 -427 356 -458 367 L -494 375 -518 374 -517 382 Q -517 401 -549 407 L -584 411 Q -607 411 -605 385 -603 361 -561 358 -572 348 -569 331 -563 286 -488 286 -468 286 -451 295";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -755 -17 Q -734 -9 -734 3 -734 18 -755 22 L -776 25 Q -828 25 -815 1 -802 -24 -781 -24 L -755 -17 M -675 -8 Q -661 -8 -655 0 L -680 5 Q -698 5 -693 -2 L -675 -8 M -568 -5 Q -553 -1 -553 11 -553 21 -568 25 L -584 27 Q -622 27 -618 10 -613 -7 -592 -7 L -568 -5 M -385 -10 Q -372 -7 -372 0 -372 11 -388 18 L -405 22 Q -426 22 -426 4 -426 -8 -415 -12 L -404 -14 -385 -10 M -214 -20 Q -187 -8 -187 15 -187 30 -209 33 L -232 33 Q -287 33 -289 3 -291 -27 -254 -27 L -214 -20 M -162 -2 Q -171 -2 -175 -15 -178 -26 -161 -26 -153 -26 -135 -14 L -162 -2 M -79 85 L -112 90 Q -158 90 -167 47 -176 3 -121 3 L -77 10 Q -46 21 -46 48 -46 74 -79 85 M -70 117 Q -64 120 -64 127 -64 136 -77 139 L -87 142 Q -108 142 -106 127 -104 113 -84 113 L -70 117 M -161 92 Q -150 97 -150 104 -150 114 -168 114 -178 114 -185 100 -191 88 -175 88 L -161 92 M -202 81 L -202 80 -220 84 Q -244 84 -238 68 -231 52 -215 52 -195 52 -195 63 -195 74 -201 79 L -193 75 -190 78 -195 81 -202 81 M -115 161 Q -63 161 -63 185 -63 209 -88 227 -110 242 -128 242 -157 242 -158 202 -160 161 -115 161 M -199 183 Q -255 183 -251 149 -248 117 -207 117 -157 124 -157 144 -157 161 -170 172 -182 183 -199 183 M -202 232 Q -221 232 -223 216 -225 202 -201 202 -184 202 -184 209 -184 225 -187 229 L -202 232 M -258 79 Q -258 104 -290 115 L -331 122 Q -385 122 -387 75 -388 27 -324 27 -298 27 -279 39 -258 53 -258 79 M -322 173 L -295 178 Q -274 185 -274 194 -274 222 -289 237 -301 248 -319 248 -373 248 -381 210 -389 173 -322 173 M -383 177 Q -397 185 -416 185 -488 185 -476 144 -463 104 -419 104 -401 104 -382 114 -360 126 -360 143 -360 167 -383 177 M -282 142 Q -268 145 -268 154 -268 171 -297 167 -327 167 -329 153 -331 138 -302 138 L -282 142 M -247 329 Q -311 329 -311 286 -311 244 -251 244 -231 244 -214 253 -193 264 -193 285 -193 308 -214 320 L -247 329 M -339 306 Q -387 286 -335 286 -318 286 -318 291 -318 297 -339 306 M -373 316 Q -336 316 -336 329 -336 344 -343 348 L -359 349 Q -388 349 -394 333 -400 316 -373 316 M -362 367 Q -355 368 -355 376 -355 387 -368 387 -397 387 -406 376 -416 366 -378 366 L -362 367 M -397 311 L -431 318 -470 312 Q -493 302 -493 269 -493 237 -476 221 -464 210 -446 210 -417 210 -392 230 -369 250 -369 273 -369 299 -397 311 M -253 409 L -283 413 Q -334 413 -334 378 -334 344 -286 344 -226 344 -226 382 -226 402 -253 409 M -57 290 Q -52 292 -52 297 -52 309 -64 307 -74 307 -77 297 -81 287 -67 287 L -57 290 M -114 316 Q -88 323 -88 336 -88 349 -119 372 -149 392 -161 392 -203 392 -213 352 -224 312 -145 312 L -114 316 M -129 261 L -116 261 Q -109 264 -109 273 -109 292 -131 292 -147 292 -149 276 -151 261 -129 261 M -77 386 L -55 378 -51 379 -49 379 -48 383 Q -48 392 -64 391 -79 391 -77 386 M -484 117 Q -484 123 -492 125 L -501 126 Q -521 126 -522 115 -523 107 -505 107 -484 107 -484 117 M -434 19 Q -412 33 -412 53 -412 86 -445 94 L -481 95 Q -519 95 -521 50 -522 5 -474 5 -453 5 -434 19 M -560 50 Q -560 57 -573 59 L -587 61 Q -612 61 -608 49 -604 38 -580 38 -560 38 -560 50 M -593 82 L -583 76 -573 78 -569 84 -574 90 -580 90 Q -593 90 -593 82 M -517 157 Q -517 176 -536 185 L -561 189 Q -623 189 -622 151 -622 114 -578 114 -554 114 -537 125 -524 133 -519 145 L -518 147 -517 157 M -557 214 L -527 222 Q -502 232 -502 247 -502 279 -560 279 -580 279 -586 247 -592 214 -557 214 M -535 205 L -538 196 Q -538 185 -520 185 -506 185 -506 195 -506 210 -524 206 L -535 205 M -652 69 Q -652 97 -680 111 L -716 120 Q -732 120 -751 106 -771 91 -772 76 L -769 76 -751 48 Q -732 21 -715 21 L -679 29 Q -652 42 -652 69 M -639 118 Q -626 126 -626 133 -626 145 -655 145 -676 145 -677 139 L -673 124 Q -673 113 -656 113 L -639 118 M -770 133 Q -739 133 -739 162 -739 175 -774 180 -790 180 -790 168 L -785 138 -770 133 M -772 247 Q -787 247 -787 237 -787 227 -771 227 -755 227 -755 235 -755 242 -762 244 L -772 247 M -719 190 L -701 194 Q -691 203 -686 227 L -704 242 -724 249 Q -748 249 -748 228 -748 190 -719 190 M -681 149 Q -661 149 -661 159 -661 166 -672 167 L -681 167 Q -700 167 -697 157 -695 149 -681 149 M -638 191 Q -619 191 -619 199 -619 210 -638 210 -652 210 -654 200 -656 191 -638 191 M -645 297 Q -701 297 -685 263 -668 231 -638 231 -625 231 -612 250 -602 264 -602 269 -602 286 -621 294 L -645 297 M -700 326 Q -701 308 -679 308 L -655 309 Q -643 314 -643 326 -643 339 -660 344 L -679 346 Q -700 346 -700 326 M -611 309 Q -584 295 -571 295 L -529 302 Q -500 315 -500 338 -500 362 -527 378 -546 388 -559 388 -572 388 -598 372 L -631 344 Q -642 328 -611 309 M -716 292 Q -716 311 -732 319 L -749 323 Q -805 323 -806 288 -808 253 -776 253 L -742 263 Q -716 276 -716 292 M -766 331 Q -759 331 -753 336 L -748 340 Q -748 348 -767 348 -783 348 -779 339 -775 331 -766 331 M -712 344 L -709 347 Q -709 361 -719 365 L -730 367 Q -743 367 -741 354 -740 339 -725 339 -717 339 -712 344 M -725 388 L -723 388 -722 391 Q -722 407 -755 409 -776 409 -784 394 -791 381 -760 381 L -743 385 -725 388 M -616 396 L -641 409 -668 414 Q -698 414 -696 387 -693 361 -668 361 -656 361 -632 375 -607 391 -616 396 M -414 338 Q -408 344 -408 358 -408 373 -425 373 L -445 366 Q -460 356 -460 349 -460 340 -448 336 L -434 333 -414 338 M -436 394 Q -436 401 -480 405 -502 405 -499 388 -495 373 -461 373 -448 373 -448 378 L -451 382 -454 385 -436 394";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -834 356 L -831 354 -839 357 -834 356 M -847 266 L -851 267 -864 263 -863 264 -861 272 Q -861 278 -868 279 L -886 277 -887 280 -875 290 Q -869 293 -869 298 L -870 304 -879 305 Q -902 305 -902 263 -902 249 -873 249 -845 250 -845 262 L -847 266 M -855 302 L -850 296 -836 318 -825 339 Q -804 334 -804 346 L -815 361 Q -827 375 -834 375 L -850 372 -861 362 Q -861 349 -837 342 L -845 326 -855 302 M -960 172 L -954 166 -885 161 Q -863 161 -863 169 L -870 177 -939 187 -960 172 M -802 143 Q -796 146 -796 153 L -822 189 -849 220 -843 238 -847 251 -849 250 Q -852 237 -858 231 L -862 220 Q -851 164 -829 164 L -815 156 -802 143 M -803 81 L -791 60 Q -803 68 -805 81 L -803 81 M -806 95 L -810 93 -812 91 -813 93 -822 107 -833 95 -827 93 -823 94 -822 92 -823 92 -824 88 -822 77 -824 74 -836 71 -836 72 Q -835 80 -843 85 L -865 95 -895 117 Q -903 117 -903 108 -903 73 -855 59 L -812 62 -803 51 Q -779 28 -755 33 L -778 69 Q -791 95 -806 95 M -9 374 L -4 348 -6 346 -9 343 -7 339 Q 7 347 9 350 L 10 362 Q 10 396 0 396 -12 396 -9 374 M -55 143 L -53 138 Q -45 148 -42 163 L -37 194 Q -33 211 -14 225 2 238 2 251 L -9 279 Q 37 305 37 319 L 35 323 33 327 37 348 Q 37 372 20 372 14 372 14 365 L 23 347 Q 23 333 4 315 L -15 294 -17 282 -16 281 Q -28 280 -27 269 L -24 251 Q -28 232 -39 223 L -49 218 Q -49 190 -52 175 L -55 143 M -2 127 L -14 124 -23 130 -32 135 -38 130 Q 17 95 40 107 54 114 54 139 56 150 46 150 23 125 5 123 L 0 132 -2 127 M -103 -4 Q -103 -24 -60 -8 -17 8 -17 42 L -19 65 -24 93 -29 94 Q -34 94 -35 91 -33 86 -34 75 L -36 58 -32 44 Q -32 36 -67 22 -103 8 -103 -4";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3722(ctx,ctrans,frame,ratio,time){
	var pathData="M -36 146 L -39 130 -32 116 -27 128 -36 146 M -433 -23 L -393 -15 -389 -14 -317 -8 -277 -8 Q -149 -18 -101 -11 -62 -6 -39 10 L -53 34 -54 57 Q -54 79 -40 101 L -37 106 -61 118 Q -61 138 -50 175 L -54 193 Q -54 219 -42 246 L -44 244 -52 256 -64 275 -63 276 -62 275 -33 263 -24 283 -36 308 Q -49 331 -49 352 -49 379 -31 414 L -33 414 -53 410 -64 405 -76 402 -171 409 -192 402 -208 397 -321 410 -383 404 -434 409 -527 403 -567 413 Q -589 413 -618 401 L -668 402 -678 402 -700 404 Q -747 404 -779 390 L -777 372 Q -777 348 -798 333 L -809 324 -812 315 -816 300 -811 291 -803 277 -802 245 Q -802 223 -816 203 L -825 189 -828 181 -830 173 -801 143 Q -772 122 -772 99 -772 72 -796 44 -780 22 -730 8 L -635 5 -565 -20 -460 -20 -433 -23 M -663 156 L -663 157 -659 157 -663 156 M -875 174 L -875 182 -876 184 -876 174 -875 174 M -880 384 L -894 377 -889 373 -880 373 -873 387 -880 384 M -889 420 L -893 412 -879 416 -884 421 -889 420";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -195 151 L -233 156 -250 154 Q -247 159 -247 166 -247 186 -268 196 -282 203 -298 203 -333 203 -344 167 -355 137 -315 134 -335 125 -334 115 -338 81 -295 58 -262 41 -236 41 -209 41 -185 63 -162 85 -162 106 -162 138 -195 151 M -105 44 Q -105 68 -109 72 L -126 76 Q -144 76 -172 47 -200 19 -151 19 -105 19 -105 44 M -377 8 Q -354 17 -354 33 -354 47 -368 52 L -384 57 Q -432 57 -434 29 -435 2 -403 2 L -377 8 M -375 164 L -365 168 Q -335 183 -335 215 -335 244 -368 255 L -361 253 -340 252 -322 256 Q -307 261 -307 269 -307 280 -337 286 L -368 290 Q -388 290 -381 285 L -370 278 -376 272 -382 263 Q -382 258 -372 256 L -375 256 -428 261 Q -461 261 -476 241 -481 259 -507 273 -533 287 -550 287 L -577 285 Q -590 297 -631 302 -676 302 -686 273 L -687 266 Q -718 264 -727 239 -737 213 -706 213 -696 213 -672 223 -646 234 -646 242 L -646 244 -643 244 -624 244 -626 237 -626 221 -631 223 Q -669 223 -673 201 L -673 200 -693 203 Q -723 203 -714 189 -706 175 -682 175 -665 175 -662 181 L -647 180 -618 182 Q -605 185 -599 189 L -574 185 -543 189 -533 189 -509 194 -505 201 -486 211 -480 202 -449 168 Q -437 162 -421 159 -431 147 -434 109 -425 101 -415 100 L -398 99 Q -345 99 -345 135 -345 153 -368 162 L -375 164 M -256 355 L -253 355 -252 354 Q -253 352 -256 352 L -256 355 M -261 320 L -223 325 Q -205 334 -205 361 -205 382 -237 393 L -273 401 Q -330 401 -324 361 L -324 359 Q -329 366 -343 371 L -366 373 Q -403 373 -396 355 -388 337 -354 337 L -334 339 Q -322 344 -321 349 -318 340 -311 335 L -327 338 Q -352 338 -360 316 -367 295 -333 295 L -310 298 Q -292 302 -292 312 -292 320 -298 326 L -261 320 M -131 371 Q -147 371 -166 344 -185 317 -144 317 L -117 324 Q -99 331 -99 344 -99 365 -131 371 M -172 298 Q -237 298 -257 248 -278 199 -216 199 -185 199 -157 209 -114 224 -114 256 -101 256 -123 277 -145 298 -172 298 M -430 86 Q -430 109 -452 134 -476 161 -508 161 L -559 151 Q -598 134 -598 101 -598 62 -563 50 L -508 44 -461 50 Q -430 62 -430 86 M -533 33 Q -552 33 -560 20 -568 5 -533 5 L -511 7 Q -497 9 -497 19 -497 28 -515 32 L -533 33 M -578 20 Q -560 28 -560 44 L -580 56 -605 62 Q -639 62 -640 39 -641 13 -605 13 -591 13 -578 20 M -551 244 L -550 249 -548 250 -544 244 -551 244 M -682 97 L -685 97 -683 113 -677 117 -674 113 -677 99 -682 97 M -626 75 Q -602 90 -602 109 -602 136 -620 151 -636 162 -662 162 -729 162 -737 111 -745 61 -679 61 -650 61 -626 75 M -655 379 L -686 387 Q -746 387 -745 349 -744 311 -689 311 -670 311 -650 320 -625 331 -625 348 -625 369 -655 379 M -451 295 Q -427 306 -427 330 -427 356 -458 367 L -494 375 -518 374 -517 382 Q -517 401 -549 407 L -584 411 Q -607 411 -605 385 -603 361 -561 358 -572 348 -569 331 -563 286 -488 286 -468 286 -451 295";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 73 -30 L 85 -29 85 -18 73 -30 M 272 83 L 270 85 270 75 272 83 M -430 -20 Q -409 -12 -409 0 -409 14 -430 19 L -451 22 Q -503 22 -490 -2 -477 -27 -456 -27 L -430 -20 M -350 -11 Q -336 -11 -330 -4 L -355 2 Q -373 2 -368 -6 L -350 -11 M -243 -8 Q -228 -5 -228 8 -228 18 -243 22 L -259 23 Q -297 23 -293 7 -288 -10 -267 -10 L -243 -8 M -47 -4 Q -47 8 -63 14 L -80 19 Q -101 19 -101 1 -101 -11 -90 -16 L -79 -17 -60 -14 -47 -4 M -54 46 L -58 53 -62 75 -62 71 Q -62 53 -54 43 L -54 46 M -56 123 Q -49 136 -35 143 L -35 144 -40 153 -48 168 -58 174 -91 182 Q -163 182 -151 141 -138 100 -94 100 -77 100 -60 109 L -56 123 M -109 15 Q -87 30 -87 50 -87 82 -120 90 L -156 91 Q -194 91 -196 47 -197 2 -149 2 -128 2 -109 15 M -159 114 L -167 122 -176 123 Q -196 123 -197 111 -198 104 -180 104 -159 104 -159 114 M -181 192 Q -181 206 -199 203 L -210 202 -213 193 Q -213 182 -195 182 -181 182 -181 192 M -121 206 Q -92 206 -67 227 -44 247 -44 270 -44 296 -72 308 L -106 315 -145 309 Q -168 299 -168 266 -168 233 -151 218 -139 206 -121 206 M -177 243 Q -177 276 -235 276 L -245 273 -260 295 -246 291 -204 299 Q -175 311 -175 335 -175 358 -202 375 -221 385 -234 385 -247 385 -273 368 L -290 356 Q -295 366 -311 366 -327 366 -329 349 -331 335 -309 335 L -308 335 Q -311 326 -298 315 L -308 316 -320 314 -318 323 Q -318 336 -335 340 L -354 343 Q -375 343 -375 323 -376 305 -354 305 L -330 306 -336 294 Q -373 288 -360 260 L -351 247 Q -363 257 -379 257 -424 257 -430 235 L -437 241 -447 243 -458 241 -477 241 Q -507 241 -509 227 -511 212 -482 212 L -462 215 Q -452 218 -449 223 L -446 223 Q -435 223 -431 228 L -431 223 Q -429 206 -417 199 -410 186 -394 186 L -376 191 -374 193 Q -337 201 -337 218 -337 230 -343 239 -331 228 -313 228 L -297 234 -295 234 -261 239 Q -264 211 -232 211 L -202 219 Q -177 229 -177 243 M -192 154 Q -192 173 -211 182 L -236 185 Q -282 185 -293 164 -325 164 -339 142 -351 141 -352 136 L -348 120 -347 117 -348 105 -355 108 -391 117 -420 107 Q -467 105 -469 77 -471 47 -434 47 L -427 47 -426 44 Q -407 18 -390 18 L -354 25 Q -335 36 -329 52 L -315 60 -327 66 -329 81 -301 77 -268 80 -268 79 Q -268 72 -258 72 L -248 75 -244 80 -249 87 Q -230 97 -226 115 -219 117 -212 122 -199 129 -194 142 L -193 144 -192 154 M -54 193 L -50 221 -56 206 Q -59 195 -53 187 L -54 193 M -248 56 L -262 58 Q -287 58 -283 46 -279 34 -255 34 -235 34 -235 47 -235 53 -248 56 M -330 177 Q -330 187 -348 187 L -365 174 Q -369 166 -364 164 -374 162 -372 154 L -375 155 -382 155 -382 154 -400 157 -414 155 -414 158 Q -414 172 -448 176 -456 184 -470 189 L -511 195 Q -565 195 -567 148 -568 100 -504 100 -478 100 -459 113 L -443 129 Q -425 129 -418 142 -411 126 -395 126 -375 126 -375 137 -375 147 -381 153 L -373 148 -370 152 Q -367 146 -356 146 -336 146 -336 156 -336 163 -346 164 L -341 166 Q -330 171 -330 177 M -329 196 Q -331 187 -313 187 -294 187 -294 195 -294 206 -313 206 -327 206 -329 196 M -267 215 Q -288 215 -286 201 -284 186 -264 186 -256 186 -250 191 -244 194 -244 201 -244 210 -257 213 L -267 215 M -364 282 Q -364 299 -367 302 L -382 306 -394 304 -407 316 -419 319 Q -406 320 -394 327 -373 338 -373 358 -373 375 -384 386 -397 386 -403 398 L -421 405 Q -434 397 -443 397 L -456 401 Q -491 392 -491 359 -491 321 -440 318 L -468 309 -469 310 Q -481 321 -499 321 -553 321 -561 283 -569 247 -502 247 L -475 252 -469 254 -451 250 Q -438 250 -417 260 L -394 278 -381 276 Q -364 276 -364 282 M -371 384 Q -368 357 -343 357 -331 357 -307 372 -286 385 -289 392 -268 397 -268 410 L -270 417 -273 417 -291 423 -313 428 Q -338 428 -353 407 L -371 390 -371 384 M -244 464 L -252 464 -248 455 -235 452 -231 453 -229 453 -228 457 Q -228 465 -244 464 M -29 296 Q -47 285 -24 283 L -29 296 M -100 369 L -120 363 -135 346 Q -135 337 -123 333 L -109 329 Q -95 329 -89 335 -83 340 -83 355 -83 369 -100 369 M -48 345 Q -65 342 -69 329 -75 312 -48 312 L -38 312 Q -47 329 -48 345 M -48 363 L -43 384 Q -72 384 -81 373 -91 363 -53 363 L -48 363 M -111 391 Q -111 397 -155 402 -177 402 -174 385 -170 369 -136 369 -123 369 -123 375 L -126 378 -129 382 -111 391 M -595 61 L -584 60 -565 63 Q -552 67 -552 74 -552 85 -568 91 L -585 96 Q -606 96 -606 78 -606 66 -595 61 M -540 216 Q -540 241 -563 251 L -596 259 Q -668 259 -656 218 -643 177 -599 177 -581 177 -562 187 -540 200 -540 216 M -614 92 Q -592 107 -592 127 -592 159 -625 167 L -661 168 Q -699 168 -701 124 -702 79 -654 79 -633 79 -614 92 M -760 111 Q -740 111 -740 124 -740 130 -753 133 L -767 135 -786 130 -775 114 -760 111 M -772 100 L -772 99 Q -772 84 -780 68 L -772 67 -748 69 Q -733 72 -733 85 -733 95 -748 99 L -764 100 -772 100 M -749 157 Q -749 163 -754 164 L -760 164 Q -773 164 -773 156 -773 149 -763 149 -758 149 -753 152 L -749 157 M -809 214 L -816 203 -824 190 -819 192 Q -806 200 -806 206 L -809 214 M -717 199 Q -704 206 -699 219 L -698 221 -697 231 Q -697 250 -716 259 L -741 262 Q -803 262 -802 224 -802 187 -758 187 -734 187 -717 199 M -702 189 Q -703 181 -685 181 -664 181 -664 191 L -672 199 -681 200 Q -701 200 -702 189 M -656 295 Q -644 283 -626 283 -597 283 -572 304 -549 324 -549 347 -549 373 -577 385 L -611 392 -613 392 -614 392 -650 386 Q -673 376 -673 343 -673 310 -656 295 M -704 280 L -715 279 -718 270 Q -718 259 -700 259 -686 259 -686 269 -686 283 -704 280 M -682 320 Q -682 353 -740 353 -760 353 -766 320 -772 288 -737 288 L -707 296 Q -682 306 -682 320 M -799 272 Q -799 279 -805 281 L -803 277 -802 268 -799 272 M -783 349 L -798 333 -809 324 -812 315 -815 305 Q -803 307 -792 324 -782 338 -782 343 L -783 349 M -743 368 L -715 374 -737 369 -743 368 M -625 464 Q -621 465 -616 468 -616 472 -632 476 L -625 464 M -542 391 L -551 395 -566 392 -553 390 -542 391 M -588 448 L -586 443 -583 442 -555 454 -557 461 Q -578 459 -586 450 L -588 448 M -498 365 L -519 379 Q -567 359 -515 359 -498 359 -498 365 M -902 469 Q -906 479 -924 481 L -916 469 -914 461 -907 462 -902 469";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -810 18 L -817 9 -815 1 Q -802 -24 -781 -24 L -755 -17 Q -734 -9 -734 3 -734 13 -743 19 L -738 7 -739 0 Q -768 10 -774 15 L -776 21 -760 48 -755 56 -751 48 Q -732 21 -715 21 L -679 29 Q -652 42 -652 69 -652 97 -680 111 L -716 120 -736 116 -736 106 Q -736 97 -743 91 -739 113 -767 130 -798 148 -798 163 L -797 172 -798 172 -802 180 -799 199 -793 244 Q -793 254 -799 269 L -804 290 -810 278 Q -796 256 -796 250 -796 212 -806 199 -816 186 -816 156 L -793 122 Q -770 92 -770 86 L -780 56 -796 30 -796 29 Q -795 8 -787 12 -776 -4 -762 -6 L -760 -15 -778 -19 Q -799 -19 -808 9 L -810 18 M -748 139 Q -739 146 -739 162 -739 175 -774 180 L -779 180 Q -773 155 -757 146 L -748 139 M -778 228 L -771 227 Q -755 227 -755 235 -755 242 -762 244 L -772 247 -777 247 -777 243 -778 228 M -777 253 L -776 253 -742 263 Q -716 276 -716 292 -716 311 -732 319 L -749 323 -780 319 -789 296 -777 253 M -776 331 L -774 334 Q -771 331 -766 331 -759 331 -753 336 L -748 340 -756 347 -757 344 -763 333 -777 363 -780 373 -785 336 -788 320 -781 327 -776 331 M -744 385 L -743 385 -725 388 -723 388 -722 391 Q -722 407 -755 409 L -761 409 -782 412 -785 412 -779 401 -769 404 Q -753 404 -747 393 L -744 385 M -791 415 L -802 419 -811 414 Q -804 413 -800 403 L -791 415 M -675 -8 Q -661 -8 -655 0 L -680 5 Q -698 5 -693 -2 L -675 -8 M -568 -5 Q -553 -1 -553 11 -553 21 -568 25 L -584 27 Q -622 27 -618 10 -613 -7 -592 -7 L -568 -5 M -385 -10 Q -372 -7 -372 0 -372 11 -388 18 L -405 22 Q -426 22 -426 4 -426 -8 -415 -12 L -404 -14 -385 -10 M -214 -20 Q -187 -8 -187 15 -187 30 -209 33 L -232 33 Q -287 33 -289 3 -291 -27 -254 -27 L -214 -20 M -135 -14 L -162 -2 Q -171 -2 -175 -15 -178 -26 -161 -26 -153 -26 -135 -14 M -40 -12 L -42 -14 -26 -23 -10 -20 Q -2 -23 -1 -16 L -5 -10 -5 -6 -6 -2 -32 -5 -30 -12 -31 -17 -40 -12 M -70 13 L -75 30 -82 41 -87 68 Q -87 92 -77 104 -67 115 -67 132 L -67 136 -63 139 Q -51 132 -51 110 -51 104 -61 80 L -71 48 -68 33 -66 31 -65 30 -46 9 -42 5 -37 1 -41 17 -31 106 -50 146 Q -70 188 -70 203 -70 221 -59 238 L -43 261 -38 287 -50 320 -61 366 -56 398 -47 408 -27 421 -38 433 -51 411 -47 409 -47 408 -53 409 -56 409 Q -67 407 -70 393 L -72 378 -71 374 -71 382 -68 385 -58 335 -51 283 Q -51 277 -66 258 -81 238 -89 237 L -90 241 Q -90 257 -79 275 L -68 294 -72 315 -75 304 -79 302 -97 290 -104 269 -93 230 Q -112 242 -128 242 -157 242 -158 202 -160 161 -115 161 L -80 165 -89 195 -86 216 -80 187 -68 135 -68 134 -69 137 -77 139 -87 142 Q -108 142 -106 127 -104 115 -89 113 L -103 89 -112 90 Q -158 90 -167 47 -176 3 -121 3 L -77 10 -70 13 M -40 198 L -35 199 -34 204 -38 212 -40 200 -40 198 M -91 345 L -119 372 Q -149 392 -161 392 -203 392 -213 352 -224 312 -145 312 L -114 316 Q -93 321 -89 331 L -91 345 M -161 92 Q -150 97 -150 104 -150 114 -168 114 -178 114 -185 100 -191 88 -175 88 L -161 92 M -190 78 L -195 81 -202 81 -202 80 -220 84 Q -244 84 -238 68 -231 52 -215 52 -195 52 -195 63 -195 74 -201 79 L -193 75 -190 78 M -199 183 Q -255 183 -251 149 -248 117 -207 117 -157 124 -157 144 -157 161 -170 172 -182 183 -199 183 M -202 232 Q -221 232 -223 216 -225 202 -201 202 -184 202 -184 209 -184 225 -187 229 L -202 232 M -258 79 Q -258 104 -290 115 L -331 122 Q -385 122 -387 75 -388 27 -324 27 -298 27 -279 39 -258 53 -258 79 M -322 173 L -295 178 Q -274 185 -274 194 -274 222 -289 237 -301 248 -319 248 -373 248 -381 210 -389 173 -322 173 M -383 177 Q -397 185 -416 185 -488 185 -476 144 -463 104 -419 104 -401 104 -382 114 -360 126 -360 143 -360 167 -383 177 M -282 142 Q -268 145 -268 154 -268 171 -297 167 -327 167 -329 153 -331 138 -302 138 L -282 142 M -247 329 Q -311 329 -311 286 -311 244 -251 244 -231 244 -214 253 -193 264 -193 285 -193 308 -214 320 L -247 329 M -318 291 Q -318 297 -339 306 -387 286 -335 286 -318 286 -318 291 M -373 316 Q -336 316 -336 329 -336 344 -343 348 L -359 349 Q -388 349 -394 333 -400 316 -373 316 M -362 367 Q -355 368 -355 376 -355 387 -368 387 -397 387 -406 376 -416 366 -378 366 L -362 367 M -397 311 L -431 318 -470 312 Q -493 302 -493 269 -493 237 -476 221 -464 210 -446 210 -417 210 -392 230 -369 250 -369 273 -369 299 -397 311 M -253 409 L -283 413 Q -334 413 -334 378 -334 344 -286 344 -226 344 -226 382 -226 402 -253 409 M -35 273 L -33 275 -34 275 -35 273 M -32 276 L -32 277 -32 276 M -129 261 L -116 261 Q -109 264 -109 273 -109 292 -131 292 -147 292 -149 276 -151 261 -129 261 M -484 117 Q -484 123 -492 125 L -501 126 Q -521 126 -522 115 -523 107 -505 107 -484 107 -484 117 M -434 19 Q -412 33 -412 53 -412 86 -445 94 L -481 95 Q -519 95 -521 50 -522 5 -474 5 -453 5 -434 19 M -560 50 Q -560 57 -573 59 L -587 61 Q -612 61 -608 49 -604 38 -580 38 -560 38 -560 50 M -573 78 L -569 84 -574 90 -580 90 Q -593 90 -593 82 L -583 76 -573 78 M -517 157 Q -517 176 -536 185 L -561 189 Q -623 189 -622 151 -622 114 -578 114 -554 114 -537 125 -524 133 -519 145 L -518 147 -517 157 M -557 214 L -527 222 Q -502 232 -502 247 -502 279 -560 279 -580 279 -586 247 -592 214 -557 214 M -538 196 Q -538 185 -520 185 -506 185 -506 195 -506 210 -524 206 L -535 205 -538 196 M -639 118 Q -626 126 -626 133 -626 145 -655 145 -676 145 -677 139 L -673 124 Q -673 113 -656 113 L -639 118 M -719 190 L -701 194 Q -691 203 -686 227 L -704 242 -724 249 Q -748 249 -748 228 -748 190 -719 190 M -661 159 Q -661 166 -672 167 L -681 167 Q -700 167 -697 157 -695 149 -681 149 -661 149 -661 159 M -638 191 Q -619 191 -619 199 -619 210 -638 210 -652 210 -654 200 -656 191 -638 191 M -645 297 Q -701 297 -685 263 -668 231 -638 231 -625 231 -612 250 -602 264 -602 269 -602 286 -621 294 L -645 297 M -700 326 Q -701 308 -679 308 L -655 309 Q -643 314 -643 326 -643 339 -660 344 L -679 346 Q -700 346 -700 326 M -611 309 Q -584 295 -571 295 L -529 302 Q -500 315 -500 338 -500 362 -527 378 -546 388 -559 388 -572 388 -598 372 L -631 344 Q -642 328 -611 309 M -709 347 Q -709 361 -719 365 L -730 367 Q -743 367 -741 354 -740 339 -725 339 -717 339 -712 344 L -709 347 M -616 396 L -641 409 -668 414 Q -698 414 -696 387 -693 361 -668 361 -656 361 -632 375 -607 391 -616 396 M -408 358 Q -408 373 -425 373 L -445 366 Q -460 356 -460 349 -460 340 -448 336 L -434 333 -414 338 Q -408 344 -408 358 M -436 394 Q -436 401 -480 405 -502 405 -499 388 -495 373 -461 373 -448 373 -448 378 L -451 382 -454 385 -436 394";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -811 414 L -809 407 -808 393 -800 403 Q -804 413 -811 414 M -822 330 L -839 308 -839 307 -834 301 -828 316 -822 330 M -806 24 L -810 18 -808 9 Q -799 -19 -778 -19 L -760 -15 -762 -6 Q -776 -4 -787 12 -795 8 -796 29 L -796 30 -805 23 -806 24 M -42 5 L -34 -10 -40 -12 -31 -17 -30 -12 -32 -5 -37 1 -42 5 M -51 411 L -54 411 -56 409 -53 409 -47 408 -47 409 -51 411 M -43 261 L -35 273 -34 275 -33 275 -32 276 -32 277 -38 287 -43 261";
	ctx.fillStyle=tocolor(ctrans.apply([221,228,230,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -743 19 L -750 22 Q -762 29 -762 38 L -760 48 -776 21 -774 15 Q -768 10 -739 0 L -738 7 -743 19 M -736 116 Q -739 129 -748 139 L -757 146 Q -773 155 -779 180 L -782 196 -781 205 -778 228 -777 243 -777 247 -777 253 -789 296 -780 319 -779 323 -776 331 -781 327 -788 320 -797 302 -804 290 -799 269 Q -793 254 -793 244 L -799 199 -802 180 -798 172 -797 172 -798 163 Q -798 148 -767 130 -739 113 -743 91 -736 97 -736 106 L -736 116 M -756 347 L -756 355 -748 368 -744 379 -744 385 -747 393 Q -753 404 -769 404 L -779 401 -778 389 -780 373 -777 363 -763 333 -757 344 -756 347 M -42 -14 L -40 -12 -34 -10 -42 5 -46 9 -65 30 -66 31 -68 33 -71 48 -61 80 Q -51 104 -51 110 -51 132 -63 139 L -67 136 -67 132 Q -67 115 -77 104 -87 92 -87 68 L -82 41 -75 30 -70 13 -67 5 Q -58 -17 -42 -14 M -70 393 L -72 393 Q -80 393 -86 374 L -91 349 -91 345 -89 331 -80 304 -79 302 -75 304 -72 315 -68 294 -79 275 Q -90 257 -90 241 L -89 237 Q -81 238 -66 258 -51 277 -51 283 L -58 335 -68 385 -71 382 -71 374 -72 378 -70 393 M -80 165 L -76 154 -69 137 -68 134 -68 135 -80 187 -86 216 -89 195 -80 165";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -785 412 L -790 416 -791 415 -800 403 -808 393 -816 380 -818 348 -822 330 -828 316 -834 301 -838 290 -829 260 -820 231 Q -820 225 -838 190 L -856 155 Q -856 132 -828 108 L -800 80 -815 37 -812 27 -806 24 -805 23 -796 30 -780 56 -770 86 Q -770 92 -793 122 L -816 156 Q -816 186 -806 199 -796 212 -796 250 -796 256 -810 278 L -804 290 -797 302 -788 320 -785 336 -780 373 -778 389 -779 401 -785 412 M -32 -5 L -6 -2 11 8 1 35 -7 59 -2 84 2 110 Q 2 138 -19 151 -39 164 -40 198 L -40 200 -38 212 -23 240 Q -6 266 -6 275 L -26 370 -13 391 0 410 -15 427 -27 421 -47 408 -56 398 -61 366 -50 320 -38 287 -32 277 -32 276 -33 275 -35 273 -43 261 -59 238 Q -70 221 -70 203 -70 188 -50 146 L -31 106 -41 17 -37 1 -32 -5";
	ctx.fillStyle=tocolor(ctrans.apply([240,243,244,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj395=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/395.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj395,"assets/takeover/art/images/395.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj395.src="assets/takeover/art/images/395.png";
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

function shape3723(ctx,ctrans,frame,ratio,time){
	var pathData="M -24 359 L -26 354 -34 355 -24 359 M -63 276 L -62 275 Q -56 269 -28 261 L -44 244 -52 256 -64 275 -63 276 M -27 158 Q -39 151 -39 130 -39 105 12 109 L 18 109 37 115 Q 63 125 63 154 62 176 39 176 L 26 171 Q 17 164 3 164 L -27 158 M -565 -20 L -460 -20 -433 -23 -393 -15 -389 -14 -317 -8 -277 -8 Q -149 -18 -101 -11 -37 -2 -15 33 L -21 60 Q -21 75 -11 88 -25 100 -61 118 L -50 176 -41 218 -19 232 Q -6 244 -6 268 L -9 276 -16 279 16 295 Q 30 302 30 314 L 24 326 24 328 Q 24 337 20 338 L -5 338 -6 343 Q -1 350 -2 366 L -1 372 Q -1 379 -4 378 L -5 378 -6 383 Q -14 414 -33 414 L -53 410 -64 405 -76 402 -171 409 -192 402 -208 397 -321 410 -383 404 -434 409 -527 403 -567 413 Q -589 413 -618 401 L -668 402 -678 402 -700 404 Q -756 404 -792 383 L -839 374 Q -853 368 -853 362 -853 352 -828 348 L -845 315 -849 301 -877 305 -898 295 Q -908 285 -908 273 -908 253 -873 256 L -854 261 -856 211 Q -856 189 -829 165 -802 143 -805 107 -808 68 -802 53 -789 24 -730 8 L -635 5 -565 -20 M -663 156 L -663 157 -659 157 -663 156 M 11 244 L 13 237 20 232 26 233 Q 17 222 21 214 30 215 36 221 L 47 233 65 248 Q 74 252 74 261 L 72 267 65 268 21 256 Q 11 252 11 244 M -898 392 Q -898 378 -889 373 L -853 377 Q -845 379 -845 387 -845 396 -848 397 L -875 397 Q -872 409 -884 421 L -889 420 -898 392 M -952 191 L -959 172 Q -959 163 -955 163 L -884 163 -877 164 Q -862 180 -894 196 L -937 214 Q -943 200 -952 191 M -864 61 Q -814 50 -814 110 L -817 123 -858 129 -882 134 Q -893 134 -904 118 -914 104 -914 91 L -898 76 Q -882 65 -864 61 M -887 39 Q -887 27 -877 22 L -869 22 Q -867 33 -872 43 L -886 43 -887 39";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -195 151 L -233 156 -250 154 Q -247 159 -247 166 -247 186 -268 196 -282 203 -298 203 -333 203 -344 167 -355 137 -315 134 -335 125 -334 115 -338 81 -295 58 -262 41 -236 41 -209 41 -185 63 -162 85 -162 106 -162 138 -195 151 M -105 44 Q -105 68 -109 72 L -126 76 Q -144 76 -172 47 -200 19 -151 19 -105 19 -105 44 M -377 8 Q -354 17 -354 33 -354 47 -368 52 L -384 57 Q -432 57 -434 29 -435 2 -403 2 L -377 8 M -375 164 L -365 168 Q -335 183 -335 215 -335 244 -368 255 L -361 253 -340 252 -322 256 Q -307 261 -307 269 -307 280 -337 286 L -368 290 Q -388 290 -381 285 L -370 278 -376 272 -382 263 Q -382 258 -372 256 L -375 256 -428 261 Q -461 261 -476 241 -481 259 -507 273 -533 287 -550 287 L -577 285 Q -590 297 -631 302 -676 302 -686 273 L -687 266 Q -718 264 -727 239 -737 213 -706 213 -696 213 -672 223 -646 234 -646 242 L -646 244 -643 244 -624 244 -626 237 -626 221 -631 223 Q -669 223 -673 201 L -673 200 -693 203 Q -723 203 -714 189 -706 175 -682 175 -665 175 -662 181 L -647 180 -618 182 Q -605 185 -599 189 L -574 185 -543 189 -533 189 -509 194 -505 201 -486 211 -480 202 -449 168 Q -437 162 -421 159 -431 147 -434 109 -425 101 -415 100 L -398 99 Q -345 99 -345 135 -345 153 -368 162 L -375 164 M -256 355 L -253 355 -252 354 Q -253 352 -256 352 L -256 355 M -261 320 L -223 325 Q -205 334 -205 361 -205 382 -237 393 L -273 401 Q -330 401 -324 361 L -324 359 Q -329 366 -343 371 L -366 373 Q -403 373 -396 355 -388 337 -354 337 L -334 339 Q -322 344 -321 349 -318 340 -311 335 L -327 338 Q -352 338 -360 316 -367 295 -333 295 L -310 298 Q -292 302 -292 312 -292 320 -298 326 L -261 320 M -99 344 Q -99 365 -131 371 -147 371 -166 344 -185 317 -144 317 L -117 324 Q -99 331 -99 344 M -172 298 Q -237 298 -257 248 -278 199 -216 199 -185 199 -157 209 -114 224 -114 256 -101 256 -123 277 -145 298 -172 298 M -430 86 Q -430 109 -452 134 -476 161 -508 161 L -559 151 Q -598 134 -598 101 -598 62 -563 50 L -508 44 -461 50 Q -430 62 -430 86 M -533 33 Q -552 33 -560 20 -568 5 -533 5 L -511 7 Q -497 9 -497 19 -497 28 -515 32 L -533 33 M -578 20 Q -560 28 -560 44 L -580 56 -605 62 Q -639 62 -640 39 -641 13 -605 13 -591 13 -578 20 M -551 244 L -550 249 -548 250 -544 244 -551 244 M -682 97 L -685 97 -683 113 -677 117 -674 113 -677 99 -682 97 M -626 75 Q -602 90 -602 109 -602 136 -620 151 -636 162 -662 162 -729 162 -737 111 -745 61 -679 61 -650 61 -626 75 M -655 379 L -686 387 Q -746 387 -745 349 -744 311 -689 311 -670 311 -650 320 -625 331 -625 348 -625 369 -655 379 M -451 295 Q -427 306 -427 330 -427 356 -458 367 L -494 375 -518 374 -517 382 Q -517 401 -549 407 L -584 411 Q -607 411 -605 385 -603 361 -561 358 -572 348 -569 331 -563 286 -488 286 -468 286 -451 295";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -755 -17 Q -734 -9 -734 3 -734 18 -755 22 L -776 25 Q -828 25 -815 1 -802 -24 -781 -24 L -755 -17 M -675 -8 Q -661 -8 -655 0 L -680 5 Q -698 5 -693 -2 L -675 -8 M -568 -5 Q -553 -1 -553 11 -553 21 -568 25 L -584 27 Q -622 27 -618 10 -613 -7 -592 -7 L -568 -5 M -214 -20 Q -187 -8 -187 15 -187 30 -209 33 L -232 33 Q -287 33 -289 3 -291 -27 -254 -27 L -214 -20 M -175 -15 Q -178 -26 -161 -26 -153 -26 -135 -14 L -162 -2 Q -171 -2 -175 -15 M -385 -10 Q -372 -7 -372 0 -372 11 -388 18 L -405 22 Q -426 22 -426 4 -426 -8 -415 -12 L -404 -14 -385 -10 M -46 48 Q -46 74 -79 85 L -112 90 Q -158 90 -167 47 -176 3 -121 3 L -77 10 Q -46 21 -46 48 M -70 117 Q -64 120 -64 127 -64 136 -77 139 L -87 142 Q -108 142 -106 127 -104 113 -84 113 L -70 117 M -161 92 Q -150 97 -150 104 -150 114 -168 114 -178 114 -185 100 -191 88 -175 88 L -161 92 M -190 78 L -195 81 -202 81 -202 80 -220 84 Q -244 84 -238 68 -231 52 -215 52 -195 52 -195 63 -195 74 -201 79 L -193 75 -190 78 M -115 161 Q -63 161 -63 185 -63 209 -88 227 -110 242 -128 242 -157 242 -158 202 -160 161 -115 161 M -199 183 Q -255 183 -251 149 -248 117 -207 117 -157 124 -157 144 -157 161 -170 172 -182 183 -199 183 M -202 232 Q -221 232 -223 216 -225 202 -201 202 -184 202 -184 209 -184 225 -187 229 L -202 232 M -258 79 Q -258 104 -290 115 L -331 122 Q -385 122 -387 75 -388 27 -324 27 -298 27 -279 39 -258 53 -258 79 M -322 173 L -295 178 Q -274 185 -274 194 -274 222 -289 237 -301 248 -319 248 -373 248 -381 210 -389 173 -322 173 M -383 177 Q -397 185 -416 185 -488 185 -476 144 -463 104 -419 104 -401 104 -382 114 -360 126 -360 143 -360 167 -383 177 M -282 142 Q -268 145 -268 154 -268 171 -297 167 -327 167 -329 153 -331 138 -302 138 L -282 142 M -247 329 Q -311 329 -311 286 -311 244 -251 244 -231 244 -214 253 -193 264 -193 285 -193 308 -214 320 L -247 329 M -339 306 Q -387 286 -335 286 -318 286 -318 291 -318 297 -339 306 M -373 316 Q -336 316 -336 329 -336 344 -343 348 L -359 349 Q -388 349 -394 333 -400 316 -373 316 M -362 367 Q -355 368 -355 376 -355 387 -368 387 -397 387 -406 376 -416 366 -378 366 L -362 367 M -397 311 L -431 318 -470 312 Q -493 302 -493 269 -493 237 -476 221 -464 210 -446 210 -417 210 -392 230 -369 250 -369 273 -369 299 -397 311 M -253 409 L -283 413 Q -334 413 -334 378 -334 344 -286 344 -226 344 -226 382 -226 402 -253 409 M -64 307 Q -74 307 -77 297 -81 287 -67 287 L -57 290 Q -52 292 -52 297 -52 309 -64 307 M -114 316 Q -88 323 -88 336 -88 349 -119 372 -149 392 -161 392 -203 392 -213 352 -224 312 -145 312 L -114 316 M -129 261 L -116 261 Q -109 264 -109 273 -109 292 -131 292 -147 292 -149 276 -151 261 -129 261 M -77 386 L -55 378 -51 379 -49 379 -48 383 Q -48 392 -64 391 -79 391 -77 386 M -484 117 Q -484 123 -492 125 L -501 126 Q -521 126 -522 115 -523 107 -505 107 -484 107 -484 117 M -434 19 Q -412 33 -412 53 -412 86 -445 94 L -481 95 Q -519 95 -521 50 -522 5 -474 5 -453 5 -434 19 M -587 61 Q -612 61 -608 49 -604 38 -580 38 -560 38 -560 50 -560 57 -573 59 L -587 61 M -593 82 L -583 76 -573 78 -569 84 -574 90 -580 90 Q -593 90 -593 82 M -519 145 L -518 147 -517 157 Q -517 176 -536 185 L -561 189 Q -623 189 -622 151 -622 114 -578 114 -554 114 -537 125 -524 133 -519 145 M -557 214 L -527 222 Q -502 232 -502 247 -502 279 -560 279 -580 279 -586 247 -592 214 -557 214 M -535 205 L -538 196 Q -538 185 -520 185 -506 185 -506 195 -506 210 -524 206 L -535 205 M -652 69 Q -652 97 -680 111 L -716 120 Q -732 120 -751 106 -771 91 -772 76 L -769 76 -751 48 Q -732 21 -715 21 L -679 29 Q -652 42 -652 69 M -639 118 Q -626 126 -626 133 -626 145 -655 145 -676 145 -677 139 L -673 124 Q -673 113 -656 113 L -639 118 M -785 138 L -770 133 Q -739 133 -739 162 -739 175 -774 180 -790 180 -790 168 L -785 138 M -772 247 Q -787 247 -787 237 -787 227 -771 227 -755 227 -755 235 -755 242 -762 244 L -772 247 M -719 190 L -701 194 Q -691 203 -686 227 L -704 242 -724 249 Q -748 249 -748 228 -748 190 -719 190 M -681 149 Q -661 149 -661 159 -661 166 -672 167 L -681 167 Q -700 167 -697 157 -695 149 -681 149 M -638 191 Q -619 191 -619 199 -619 210 -638 210 -652 210 -654 200 -656 191 -638 191 M -645 297 Q -701 297 -685 263 -668 231 -638 231 -625 231 -612 250 -602 264 -602 269 -602 286 -621 294 L -645 297 M -700 326 Q -701 308 -679 308 L -655 309 Q -643 314 -643 326 -643 339 -660 344 L -679 346 Q -700 346 -700 326 M -611 309 Q -584 295 -571 295 L -529 302 Q -500 315 -500 338 -500 362 -527 378 -546 388 -559 388 -572 388 -598 372 L -631 344 Q -642 328 -611 309 M -716 292 Q -716 311 -732 319 L -749 323 Q -805 323 -806 288 -808 253 -776 253 L -742 263 Q -716 276 -716 292 M -766 331 Q -759 331 -753 336 L -748 340 Q -748 348 -767 348 -783 348 -779 339 -775 331 -766 331 M -712 344 L -709 347 Q -709 361 -719 365 L -730 367 Q -743 367 -741 354 -740 339 -725 339 -717 339 -712 344 M -725 388 L -723 388 -722 391 Q -722 407 -755 409 -776 409 -784 394 -791 381 -760 381 L -743 385 -725 388 M -616 396 L -641 409 -668 414 Q -698 414 -696 387 -693 361 -668 361 -656 361 -632 375 -607 391 -616 396 M -414 338 Q -408 344 -408 358 -408 373 -425 373 L -445 366 Q -460 356 -460 349 -460 340 -448 336 L -434 333 -414 338 M -436 394 Q -436 401 -480 405 -502 405 -499 388 -495 373 -461 373 -448 373 -448 378 L -451 382 -454 385 -436 394";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M -834 356 L -831 354 -839 357 -834 356 M -847 266 L -851 267 -864 263 -863 264 -861 272 Q -861 278 -868 279 L -886 277 -887 280 -875 290 Q -869 293 -869 298 L -870 304 -879 305 Q -902 305 -902 263 -902 249 -873 249 -845 250 -845 262 L -847 266 M -855 302 L -850 296 -836 318 -825 339 Q -804 334 -804 346 L -815 361 Q -827 375 -834 375 L -850 372 -861 362 Q -861 349 -837 342 L -845 326 -855 302 M -960 172 L -954 166 -885 161 Q -863 161 -863 169 L -870 177 -939 187 -960 172 M -802 143 Q -796 146 -796 153 L -822 189 -849 220 -843 238 -847 251 -849 250 Q -852 237 -858 231 L -862 220 Q -851 164 -829 164 L -815 156 -802 143 M -803 81 L -791 60 Q -803 68 -805 81 L -803 81 M -806 95 L -810 93 -812 91 -813 93 -822 107 -833 95 -827 93 -823 94 -822 92 -823 92 -824 88 -822 77 -824 74 -836 71 -836 72 Q -835 80 -843 85 L -865 95 -895 117 Q -903 117 -903 108 -903 73 -855 59 L -812 62 -803 51 Q -779 28 -755 33 L -778 69 Q -791 95 -806 95 M -9 374 L -4 348 -6 346 -9 343 -7 339 Q 7 347 9 350 L 10 362 Q 10 396 0 396 -12 396 -9 374 M -55 143 L -53 138 Q -45 148 -42 163 L -37 194 Q -33 211 -14 225 2 238 2 251 L -9 279 Q 37 305 37 319 L 35 323 33 327 37 348 Q 37 372 20 372 14 372 14 365 L 23 347 Q 23 333 4 315 L -15 294 -17 282 -16 281 Q -28 280 -27 269 L -24 251 Q -28 232 -39 223 L -49 218 Q -49 190 -52 175 L -55 143 M -23 130 L -32 135 -38 130 Q 17 95 40 107 54 114 54 139 56 150 46 150 23 125 5 123 L 0 132 -2 127 -14 124 -23 130 M -103 -4 Q -103 -24 -60 -8 -17 8 -17 42 L -19 65 -24 93 -29 94 Q -34 94 -35 91 -33 86 -34 75 L -36 58 -32 44 Q -32 36 -67 22 -103 8 -103 -4";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function sprite3724(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3720",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3721",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3722",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3723",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
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

var imageObj399=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/399.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj399,"assets/takeover/art/images/399.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj399.src="assets/takeover/art/images/399.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj401,"assets/takeover/art/images/401.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj401.src="assets/takeover/art/images/401.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj403,"assets/takeover/art/images/403.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj403.src="assets/takeover/art/images/403.png";
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

function shape3731(ctx,ctrans,frame,ratio,time){
	var pathData="M 792 -14 L 790 -15 786 -14 791 -14 792 -14 M 621 -6 L 620 -6 616 -9 618 -8 621 -6 M 832 -16 L 844 4 810 40 Q 775 74 775 93 L 783 110 790 128 777 158 Q 764 188 764 206 764 239 787 286 804 321 829 339 L 816 405 802 405 799 405 799 411 798 415 793 414 715 413 704 413 701 413 698 412 688 412 671 409 671 406 669 406 655 402 652 403 654 405 617 397 606 392 604 390 Q 601 387 598 387 L 597 393 596 394 Q 563 396 436 441 L 438 445 438 446 Q 411 459 375 482 L 342 504 307 488 307 487 Q 305 482 300 482 L 295 482 291 480 284 476 283 476 279 474 211 482 176 497 171 493 181 476 Q 181 441 127 458 L 122 461 102 428 Q 77 392 57 385 L 15 387 -24 398 Q -50 402 -62 413 L -80 410 -101 413 -122 416 Q -189 377 -179 355 -179 324 -188 296 -201 252 -249 238 -250 225 -261 214 -279 196 -315 193 L -305 181 -277 188 -234 188 -178 174 -124 165 Q -104 165 -78 153 L -83 148 -81 143 -87 139 -75 125 -68 128 -39 119 -4 112 10 108 Q 11 105 19 102 L 85 96 90 99 134 91 146 89 136 98 136 101 139 102 163 88 169 83 182 79 182 80 186 77 183 74 183 71 187 68 197 61 198 61 200 59 203 57 214 50 226 40 239 40 308 25 312 27 Q 296 18 296 8 L 298 -2 313 2 376 20 381 22 384 23 386 23 388 23 401 25 467 25 473 23 498 25 500 26 503 26 508 25 508 22 527 7 531 6 545 2 598 1 Q 611 4 612 9 L 673 4 679 9 685 7 691 9 691 11 695 15 Q 713 15 759 -5 L 810 -26 812 -26 824 -28 832 -16 M 627 25 L 614 26 606 22 599 22 586 24 578 35 Q 565 46 546 47 L 539 47 546 57 546 62 562 65 567 65 561 61 560 57 Q 558 46 575 47 586 32 629 26 L 627 25 M 656 50 L 649 53 659 51 657 50 656 50 M 495 53 L 472 57 467 62 478 62 500 62 495 54 495 53 M 421 40 L 416 39 389 40 385 39 376 36 357 39 334 36 331 37 342 43 Q 346 47 342 57 L 324 72 340 80 373 108 Q 390 130 400 158 439 181 451 198 L 460 209 Q 475 209 485 221 491 230 486 244 L 486 246 496 266 498 264 Q 509 251 508 243 505 229 491 227 L 488 215 Q 485 198 458 172 463 143 458 120 455 108 440 89 L 430 78 454 67 462 54 Q 460 44 421 40 M 521 334 L 525 329 516 332 521 334 M 448 427 Q 472 427 472 406 472 384 447 386 422 387 422 406 L 427 419 Q 434 427 448 427 M 548 470 L 547 475 546 475 548 470 M 654 429 L 653 429 652 427 654 429 M 671 395 L 673 397 675 393 672 394 671 395 M 544 461 L 545 458 548 455 545 461 544 461 M 250 53 L 247 54 250 54 251 53 250 53 M 186 51 L 188 51 189 52 186 51 M 113 114 L 100 115 91 113 84 114 72 118 71 129 60 141 46 146 39 147 51 155 54 160 70 161 74 160 67 156 64 152 Q 59 146 67 143 L 74 141 Q 77 126 115 114 L 113 114 M 31 51 L 31 49 39 46 42 48 31 51 M 1 158 L 0 158 -20 165 -22 170 -12 170 9 165 1 158 M 154 133 L 153 134 148 138 157 135 154 133";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 810 210 Q 816 262 803 288 790 314 758 332 718 366 664 374 L 572 365 561 361 560 362 553 372 Q 543 378 531 380 L 513 382 518 378 448 382 441 382 433 380 435 382 438 384 436 392 422 404 Q 400 412 393 404 L 392 403 390 402 386 404 368 412 287 437 276 437 271 443 248 458 Q 211 472 165 472 121 471 109 460 L 98 449 86 444 80 440 66 434 59 428 32 413 -16 382 -61 335 -95 320 Q -109 309 -109 284 -109 272 -103 271 L -98 263 Q -119 191 -63 188 L 4 184 Q 37 162 59 157 L 71 155 76 154 95 146 Q 121 136 142 137 L 175 125 180 125 181 120 199 107 194 108 188 108 Q 205 90 226 87 L 227 85 Q 266 57 321 62 L 340 65 Q 370 70 385 84 L 390 88 Q 404 93 419 100 473 125 495 143 L 508 155 Q 521 154 536 167 L 548 191 549 193 Q 592 236 602 263 L 600 236 601 234 Q 610 219 608 210 604 195 591 193 L 588 180 Q 582 158 551 125 L 534 109 533 104 Q 529 88 505 77 L 517 75 522 75 526 72 596 48 Q 653 30 700 46 738 58 743 78 L 744 83 761 99 Q 792 133 798 155 L 801 167 Q 814 169 818 184 820 193 811 209 L 810 210 M 176 146 L 179 147 179 146 176 146";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 823 83 Q 803 98 769 102 724 107 695 102 671 95 664 83 650 50 735 36 821 22 835 54 842 69 823 83 M 832 198 L 799 228 797 231 783 234 733 228 727 225 722 230 Q 703 248 646 254 L 574 248 575 249 583 259 Q 585 263 579 269 573 277 560 278 542 281 526 267 L 512 253 Q 507 244 517 246 L 533 250 541 246 554 241 567 243 548 218 Q 541 203 571 190 L 510 182 Q 478 172 474 163 L 471 150 Q 449 146 431 127 420 104 469 93 L 481 92 Q 476 77 517 67 560 57 567 72 L 558 91 Q 544 106 531 108 L 529 108 529 109 532 120 545 115 571 113 568 111 Q 558 92 596 86 L 599 85 589 77 Q 582 62 608 62 631 64 638 76 641 84 632 87 L 640 94 641 109 633 120 645 130 647 147 649 152 Q 652 161 644 165 L 634 167 621 179 638 181 702 188 Q 718 193 726 201 L 807 184 829 191 832 198 M 819 130 Q 813 166 841 183 L 762 180 Q 711 174 704 158 698 146 710 131 728 109 784 102 L 830 99 819 130 M 844 319 L 792 309 773 292 772 283 753 287 696 282 Q 682 277 677 270 670 252 727 240 778 229 792 247 L 793 246 Q 795 261 822 276 L 856 286 847 293 Q 834 307 844 319 M 745 63 L 740 67 747 67 770 62 771 60 771 59 745 63 M 485 214 Q 471 228 427 233 383 238 356 225 L 335 209 331 196 318 198 Q 286 203 267 188 L 254 172 Q 248 161 295 156 336 152 349 172 L 395 163 Q 473 157 490 193 495 204 485 214 M 540 156 L 550 157 547 154 541 156 540 156 M 541 351 Q 527 319 609 299 690 278 704 309 711 324 698 340 683 365 629 371 L 590 370 Q 548 364 541 351 M 510 283 Q 505 293 489 295 L 465 295 Q 480 301 484 312 490 324 484 331 472 342 426 348 389 351 363 339 L 341 322 Q 328 294 400 289 L 403 289 379 282 367 271 Q 359 253 393 253 427 253 434 269 437 274 432 279 430 287 420 288 L 446 291 437 283 Q 431 271 468 262 504 254 511 271 L 510 283 M 424 323 L 428 323 429 320 423 321 424 323 M 426 385 Q 423 377 465 362 508 348 516 368 519 374 510 383 500 393 481 396 443 400 426 385 M 402 100 Q 407 109 396 121 383 135 353 139 316 143 291 130 277 125 271 117 258 87 324 81 389 73 402 100 M 216 242 L 189 240 178 232 Q 170 223 188 212 201 201 218 219 L 227 230 Q 228 238 216 242 M 24 191 L 24 188 22 187 3 195 0 200 24 191 M 80 206 Q 68 224 41 233 L -22 243 Q -46 240 -59 228 -86 195 -20 167 46 141 76 172 89 188 80 206 M 106 210 Q 92 193 126 181 160 170 175 188 182 193 179 203 175 215 152 223 L 128 219 106 210 M 142 225 Q 158 230 174 248 187 261 186 276 185 295 151 306 L 73 317 Q 26 319 13 303 1 290 5 273 10 246 55 231 110 213 142 225 M 138 319 L 146 329 Q 168 354 118 372 93 380 72 372 L 65 370 64 377 Q 56 398 10 414 -29 426 -58 415 L -54 418 -45 425 Q -61 417 -85 419 L -86 419 -76 413 -65 412 -92 388 Q -106 372 -87 356 L -144 355 -170 348 Q -177 335 -191 330 L -193 326 -214 322 -234 313 -240 308 Q -260 284 -223 267 L -212 263 Q -224 247 -194 232 L -148 230 Q -143 235 -147 251 -151 269 -163 273 L -164 272 -163 275 Q -158 278 -156 284 L -146 279 -125 273 -128 272 Q -146 252 -116 240 L -114 239 Q -123 238 -127 230 -141 216 -118 214 -96 212 -86 224 -78 232 -85 236 L -74 242 -66 258 -66 272 Q -57 275 -51 282 L -42 298 -38 303 Q -31 312 -36 318 L -43 322 -49 337 -34 336 26 335 52 345 Q 65 335 115 315 L 138 319 M 97 485 L 98 484 98 485 97 485 M 73 387 L 133 386 Q 138 372 153 366 L 249 360 Q 286 368 298 380 310 394 290 417 270 438 240 447 L 163 452 140 435 133 427 118 433 68 437 Q 52 433 44 425 29 408 73 387 M 224 322 L 213 315 Q 192 292 229 278 L 280 281 Q 285 287 283 296 280 312 257 319 L 224 322 M 310 458 Q 302 459 297 451 288 443 318 415 346 388 367 412 387 435 350 447 L 310 458 M -167 360 L -155 371 Q -146 382 -150 393 -154 404 -172 414 -166 388 -166 369 L -167 360 M -130 324 L -120 324 -125 320 -130 323 -130 324";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 141 90 L 124 98 89 96 141 90 M 90 114 L 108 114 111 112 131 112 139 113 141 115 134 118 Q 113 125 97 118 L 90 114 M 409 39 L 413 38 415 38 452 36 461 36 Q 477 38 481 46 484 52 472 65 457 79 429 83 L 378 81 367 73 Q 355 46 409 39 M 498 39 Q 501 43 510 43 L 524 38 529 43 Q 532 51 518 52 L 501 51 493 46 Q 491 41 498 39 M 610 27 L 646 21 648 21 676 19 689 22 693 24 Q 701 39 650 46 625 48 610 31 L 610 27 M 885 9 L 887 9 894 15 885 9 M 898 32 L 881 50 865 62 829 69 749 63 Q 731 57 727 48 722 41 742 29 763 15 788 12 L 790 14 842 16 Q 893 20 896 29 L 898 32 M 825 113 L 821 113 810 111 809 109 Q 806 102 818 101 L 828 101 825 113 M 813 210 Q 797 224 767 228 L 702 223 684 208 Q 667 173 740 171 812 168 822 190 828 198 813 210 M 841 314 Q 833 324 811 326 783 330 760 326 737 322 735 314 722 287 781 282 834 277 845 295 837 305 841 314 M 836 365 L 831 361 Q 827 351 852 349 877 346 881 356 883 361 877 364 L 863 369 836 365 M 751 77 L 746 86 724 95 Q 701 98 696 83 690 72 701 72 L 729 70 Q 748 67 751 77 M 651 75 Q 648 66 665 65 680 64 683 72 688 81 670 83 L 655 79 651 75 M 612 111 Q 593 114 589 104 585 98 601 94 617 92 622 101 626 110 612 111 M 634 151 Q 652 148 657 158 660 165 644 167 619 169 620 160 L 619 154 634 151 M 642 138 Q 628 107 693 100 759 93 768 114 774 126 758 136 747 145 727 150 L 724 151 706 153 656 150 642 138 M 609 229 Q 580 244 541 249 L 468 243 449 228 Q 442 214 448 208 460 195 518 188 L 607 186 Q 628 190 631 198 639 213 609 229 M 783 161 L 768 158 766 155 Q 761 145 776 142 793 140 797 149 801 159 783 161 M 517 79 L 502 71 Q 497 58 532 54 599 46 604 61 608 67 600 71 L 548 84 517 79 M 413 115 Q 408 123 385 125 L 351 120 344 112 Q 338 102 372 98 405 93 411 104 L 413 115 M 484 93 Q 545 94 553 109 556 115 526 125 L 495 134 448 130 435 120 Q 423 92 484 93 M 417 240 L 384 247 Q 357 251 354 242 353 239 363 230 376 222 388 220 L 414 223 422 230 Q 426 236 417 240 M 452 177 Q 438 193 399 198 L 323 193 298 180 Q 295 173 319 157 L 360 135 422 138 Q 454 148 457 155 462 165 452 177 M 555 178 Q 499 185 487 157 481 147 536 137 590 128 597 145 600 151 592 162 580 176 555 178 M 585 357 Q 611 354 616 364 L 617 371 598 377 Q 566 380 560 370 558 362 585 357 M 519 278 L 490 271 Q 513 243 526 268 530 277 519 278 M 471 320 Q 455 289 530 281 605 272 619 301 623 311 609 321 595 334 562 338 L 492 335 Q 474 329 471 320 M 450 277 L 416 277 410 269 Q 404 256 432 249 458 243 465 256 473 275 450 277 M 428 428 L 424 429 Q 407 430 406 423 403 415 410 415 419 416 428 424 L 427 427 428 428 M 420 405 L 391 397 Q 389 393 402 385 L 384 378 Q 375 387 355 394 L 321 391 311 380 Q 287 352 329 339 333 336 336 336 L 333 334 319 319 Q 306 294 367 288 426 281 438 303 452 333 386 341 L 393 356 Q 407 347 439 341 504 329 522 367 L 524 383 Q 519 397 496 399 L 427 392 420 405 M 580 396 L 551 403 565 397 580 396 M 792 351 Q 804 377 760 382 L 686 377 Q 652 370 649 361 641 346 712 338 782 329 792 351 M 770 274 Q 740 277 739 263 732 248 757 245 781 240 787 255 L 787 265 Q 783 273 770 274 M 721 266 Q 714 277 696 279 L 622 281 Q 600 277 596 268 583 241 647 230 710 219 725 251 727 256 721 266 M 702 317 Q 706 326 694 327 L 658 329 Q 651 329 649 322 645 314 671 309 697 305 702 317 M 344 74 L 338 77 Q 325 78 321 69 317 62 332 62 347 62 349 67 L 344 74 M 336 98 L 302 96 296 92 Q 293 85 317 83 340 81 344 88 L 342 95 336 98 M 237 70 Q 259 64 265 79 L 264 89 259 99 261 99 257 100 Q 229 104 220 88 215 78 237 70 M 218 197 Q 218 206 202 211 L 176 210 166 204 Q 147 185 175 179 200 173 209 184 L 218 197 M 244 143 L 227 132 Q 221 117 270 112 317 109 321 120 324 126 304 141 283 157 270 153 L 244 143 M 340 232 L 334 231 330 230 Q 325 230 315 240 305 243 286 222 282 211 311 209 340 208 348 224 351 230 340 232 M 148 83 L 144 83 125 86 144 80 147 82 148 83 M 17 135 L 63 132 116 136 Q 125 145 121 158 115 177 77 189 L 6 195 Q -13 190 -21 181 -28 173 -17 158 -5 141 14 135 L 17 135 M 14 219 L 0 232 Q -18 238 -31 223 -40 213 -32 210 L -9 204 Q 6 200 13 209 L 14 219 M 99 233 L 93 238 81 238 79 235 Q 74 228 84 225 L 97 226 99 233 M 176 142 Q 181 150 173 156 161 155 154 146 146 138 158 136 169 135 176 142 M 126 202 Q 143 198 153 210 161 219 144 226 L 126 224 117 218 Q 106 205 126 202 M 102 367 L 43 372 19 359 Q -12 323 51 310 112 298 132 319 140 329 133 342 126 359 102 367 M 117 286 Q 99 267 162 246 L 243 248 Q 253 259 243 273 233 290 203 300 L 133 303 Q 120 297 117 286 M 82 294 L 70 293 63 290 Q 55 280 68 276 L 89 279 Q 97 290 82 294 M 12 297 L -33 299 -51 290 Q -78 259 -26 242 27 225 48 246 58 258 49 272 L 30 289 26 292 12 297 M 81 415 Q 80 429 67 433 L 3 445 Q -19 445 -26 435 -51 409 -1 387 47 366 78 399 L 81 415 M 128 418 Q 103 425 95 410 82 394 102 387 121 380 132 393 L 138 405 Q 137 413 128 418 M 143 372 Q 120 345 186 323 251 300 280 332 290 345 281 360 271 377 236 388 203 399 172 388 153 382 143 372 M 144 474 Q 123 473 116 465 90 437 141 424 186 410 205 431 217 458 189 467 L 144 474 M 132 487 Q 166 481 182 494 L 176 497 Q 160 489 132 487 M 380 272 L 365 277 343 273 Q 338 258 353 251 369 245 378 263 L 380 272 M 294 268 L 301 274 304 284 Q 306 293 297 295 L 264 296 251 289 Q 241 279 265 271 L 294 268 M 291 397 Q 300 407 285 412 L 260 415 271 418 266 420 259 420 257 416 260 415 Q 251 414 247 409 237 397 259 393 L 291 397 M 228 448 Q 223 443 238 434 L 259 432 259 442 249 452 Q 234 457 228 448 M 403 420 Q 413 432 411 445 410 465 372 477 336 489 307 478 L 284 465 Q 264 442 320 419 378 393 403 420 M -127 183 L -124 182 Q -73 176 -73 163 L -73 157 Q -64 158 -62 161 -48 176 -90 190 -108 195 -127 183 M -222 203 L -200 201 -195 204 Q -188 212 -200 216 L -216 217 -225 213 Q -230 206 -222 203 M -188 244 L -206 237 Q -216 225 -187 215 L -121 213 Q -116 218 -121 224 L -159 246 -188 244 M -74 221 Q -82 212 -66 208 -53 204 -48 212 -38 222 -53 226 L -69 225 -74 221 M -234 235 Q -240 253 -263 261 L -287 267 -291 264 -324 250 -327 249 Q -331 239 -324 231 -316 222 -296 215 L -236 214 Q -230 221 -234 235 M -209 264 Q -156 256 -142 272 -136 277 -158 293 L -180 306 -223 309 -240 298 Q -263 271 -209 264 M -261 301 L -262 294 -260 298 -261 301 M -91 266 Q -106 271 -114 261 -119 255 -108 249 -95 244 -87 253 -78 262 -91 266 M -63 310 L -51 304 Q -37 299 -28 309 -21 315 -34 319 -55 326 -59 315 L -63 310 M -30 355 Q -17 370 -34 392 L -73 419 -85 419 -113 425 -158 424 -172 415 Q -165 393 -166 374 L -134 360 -58 346 Q -37 346 -30 355 M -83 322 Q -86 339 -107 345 -151 361 -176 332 -185 322 -143 304 L -85 303 Q -81 309 -83 322";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 526 -7 L 525 -5 499 -5 500 -6 526 -7";
	ctx.fillStyle=tocolor(ctrans.apply([186,120,54,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 183 42 L 187 51 177 53 170 53 155 54 124 77 121 75 121 69 139 54 139 53 98 56 82 55 79 51 80 49 92 46 109 42 117 42 135 44 157 40 160 39 180 42 183 42 M 69 84 L 58 79 62 77 Q 86 67 86 72 L 77 79 69 84 M 34 88 L 36 89 49 97 36 99 33 98 25 97 0 94 -27 99 -30 98 -30 93 Q -16 86 0 86 L 34 88 M -84 140 L -87 145 -92 146 -103 143 -129 140 -158 138 -166 134 -237 140 -242 137 -241 134 -160 125 -139 106 -132 101 -141 101 -147 98 -157 93 -156 89 -139 89 -151 87 -151 82 -146 81 -115 81 -106 83 -103 86 -100 89 -107 93 -106 94 -127 112 -141 129 -140 130 -89 133 Q -84 134 -84 138 L -84 140 M 713 11 L 714 12 713 15 711 15 706 16 693 10 690 9 Q 691 5 679 4 L 667 -7 639 -26 634 -26 635 -22 633 -22 606 -26 586 -32 582 -32 583 -31 584 -26 591 -19 590 -18 585 -22 588 -10 588 -7 587 -6 586 -3 583 3 582 3 576 4 553 4 551 5 549 1 548 0 579 -1 579 -6 545 -7 555 -8 574 -11 568 -34 569 -35 Q 552 -39 552 -47 L 559 -56 567 -64 562 -70 563 -72 Q 573 -74 573 -65 L 570 -56 558 -47 Q 559 -44 568 -41 L 563 -48 576 -41 578 -39 600 -35 638 -33 656 -50 Q 678 -65 691 -56 L 689 -56 Q 649 -43 647 -28 L 688 -5 713 11 M 522 2 L 520 7 516 7 516 3 Q 504 9 496 3 491 -1 485 -14 L 478 -33 479 -36 491 -22 498 -5 499 -5 498 -4 501 2 522 2 M 355 -35 L 360 -42 379 -41 387 -39 393 -40 388 -40 374 -42 374 -46 409 -46 Q 413 -43 420 -43 L 420 -39 414 -38 407 -40 395 -33 383 -33 380 -35 355 -35 M 349 -50 L 344 -43 332 -65 334 -68 345 -55 349 -50 M 340 -38 L 330 -21 329 -21 325 -26 340 -38 M 311 -13 L 312 -12 311 -3 308 9 302 12 298 11 298 4 311 -13 M 259 32 L 259 37 234 43 226 34 231 34 247 31 259 31 259 32 M 693 -55 L 693 -56 708 -75 751 -86 759 -86 763 -83 763 -84 741 -100 Q 722 -112 722 -115 L 723 -118 Q 773 -92 772 -78 L 767 -76 755 -80 716 -72 Q 707 -71 703 -64 L 693 -55 M 442 444 Q 436 446 429 450 L 416 445 416 443 430 440 442 444 M 595 392 L 607 389 Q 615 389 652 403 L 665 408 613 396 Q 605 394 602 400 L 598 401 Q 590 401 590 397 L 595 392 M 690 469 L 692 467 693 468 690 469 M 342 504 L 340 503 349 500 342 504 M 246 522 L 244 522 244 521 246 522";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 183 42 L 180 32 173 -1 172 -3 157 -18 116 -18 49 -26 49 -31 55 -32 146 -32 163 -33 171 -29 170 -27 165 -27 169 -26 177 -24 181 -20 180 -18 169 -18 175 -14 176 -15 177 -17 184 -19 189 -21 197 -18 199 -18 200 -21 203 -22 Q 204 -29 209 -26 L 210 -24 235 -32 270 -41 294 -42 289 -39 309 -34 320 -27 323 -27 325 -26 329 -21 330 -21 340 -38 343 -42 344 -43 349 -50 360 -66 380 -89 Q 384 -85 387 -86 L 392 -92 432 -92 448 -90 449 -87 447 -84 Q 394 -81 380 -71 371 -64 361 -43 L 360 -42 355 -35 331 2 341 3 359 13 379 20 384 22 391 21 454 21 458 20 491 20 500 25 508 25 514 21 520 7 522 2 525 -5 526 -7 531 -17 532 -20 538 -34 523 -45 512 -58 483 -80 484 -82 Q 500 -79 526 -62 L 548 -45 551 -39 547 -22 543 -13 545 -7 548 0 549 1 551 5 553 4 576 4 582 3 583 3 586 -3 588 -3 611 -2 613 2 611 6 613 10 666 3 658 -7 642 -16 635 -22 634 -26 639 -26 667 -7 679 4 Q 691 5 690 9 L 689 10 693 10 706 16 711 15 714 16 713 15 714 12 713 11 732 5 781 -7 Q 792 -8 810 -16 L 823 -17 831 -11 831 -6 785 9 748 20 703 33 697 29 693 24 689 22 676 19 671 18 667 17 648 21 646 21 610 27 596 28 588 28 587 28 547 36 540 34 524 38 510 43 Q 501 43 498 39 L 498 35 485 36 461 36 452 36 415 38 413 38 409 39 400 39 367 41 Q 350 41 348 34 L 326 41 Q 321 41 322 38 L 324 36 315 37 316 38 Q 316 58 265 58 L 239 59 233 54 231 54 Q 220 60 206 69 L 206 70 205 70 188 82 165 101 154 111 151 113 144 116 141 115 139 113 131 112 111 112 108 114 90 114 57 113 47 113 45 112 44 110 -20 131 -63 146 -81 149 -85 147 -87 145 -84 140 -51 124 Q -23 111 -3 104 L -6 102 25 97 33 98 36 99 49 97 36 89 34 88 Q 8 71 8 67 L 12 58 48 74 58 79 69 84 84 93 82 95 89 96 124 98 141 90 183 67 192 59 187 51 183 42 M 311 -13 L 277 -35 251 -26 215 -14 211 -3 Q 208 2 208 9 L 209 15 226 34 234 43 259 37 259 32 301 25 302 25 305 24 308 9 311 -3 312 -12 311 -13 M 532 9 L 532 7 531 7 529 11 532 9 M 328 20 L 322 17 322 18 320 17 319 21 328 20 M -73 157 L -73 163 Q -73 176 -124 182 L -127 183 -191 195 -195 200 -200 201 -222 203 -238 204 -241 203 -272 203 -289 199 -294 193 -277 182 -226 182 -223 181 -200 181 -150 168 -81 154 Q -75 154 -73 157";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3732(ctx,ctrans,frame,ratio,time){
	var pathData="M 191 -13 L 241 -19 243 3 Q 240 22 220 22 L 180 20 178 8 Q 178 -7 191 -13 M 404 -4 L 447 2 423 6 411 6 402 14 397 16 397 17 396 22 411 20 410 19 Q 408 11 426 10 441 9 445 16 L 467 12 464 12 455 11 457 9 454 0 Q 454 -27 494 -28 533 -31 533 -8 533 4 510 9 L 515 9 531 6 545 2 598 1 Q 611 4 612 9 L 673 4 679 9 Q 694 4 711 2 L 717 -1 715 -3 732 -13 743 -17 749 -24 759 -33 748 -35 Q 732 -39 727 -43 L 727 -49 727 -52 734 -56 735 -54 732 -51 729 -48 731 -43 753 -44 777 -38 782 -35 808 -27 812 -26 824 -28 832 -16 844 4 810 40 Q 775 74 775 93 L 783 110 790 128 777 158 Q 764 188 764 206 764 239 787 286 804 321 829 339 L 816 405 802 405 799 405 799 411 789 430 Q 775 445 749 450 L 749 446 Q 749 411 704 413 682 414 671 422 L 670 416 671 406 669 406 655 402 652 403 655 409 653 414 658 418 655 420 654 420 655 424 648 441 599 450 598 448 610 443 600 435 592 427 595 420 Q 576 427 573 442 L 535 440 Q 503 445 488 461 L 483 462 Q 458 448 403 475 372 501 334 513 L 316 501 305 499 293 502 293 503 289 513 282 513 Q 268 513 262 519 L 241 524 Q 214 524 183 501 L 171 493 181 476 Q 181 441 127 458 L 122 461 102 428 Q 77 392 57 385 L 15 387 -24 398 Q -50 402 -62 413 L -80 410 -101 413 -122 416 Q -189 377 -179 355 -179 324 -188 296 -201 252 -249 238 -250 225 -261 214 -279 196 -315 193 -302 181 -291 155 L -290 154 -284 148 Q -270 138 -249 130 -248 129 -250 127 L -262 125 -276 120 -279 116 -276 116 Q -273 117 -271 120 L -250 116 -238 127 Q -234 132 -241 140 L -219 140 Q -204 130 -166 123 L -152 123 -139 123 -133 118 -131 115 -141 108 -142 103 -146 102 -153 89 -149 89 -132 97 -97 89 Q -70 101 -70 102 -65 108 -72 113 L -94 122 -106 123 -110 130 -114 135 -113 135 Q -111 137 -112 141 L -99 137 -100 135 Q -105 128 -89 125 L -68 128 -39 119 -4 112 10 108 Q 11 104 22 101 L 30 100 Q 21 100 12 84 L 11 84 4 78 Q -4 67 12 67 L 14 67 19 62 31 51 30 46 30 42 57 59 Q 67 68 67 78 67 94 47 99 L 72 94 Q 87 95 90 99 L 146 88 154 90 182 79 182 80 186 77 183 74 184 70 175 67 164 67 162 77 153 77 152 68 151 64 Q 150 56 141 56 L 120 55 118 45 Q 118 28 142 28 165 27 165 50 L 165 56 Q 172 51 181 47 L 188 51 189 52 198 61 203 57 205 49 210 41 239 40 308 25 312 27 Q 296 18 296 8 296 -21 345 -20 383 -19 392 -1 L 404 -4 M 601 -36 Q 601 -44 622 -52 L 630 -54 638 -52 673 -46 677 -39 677 -35 Q 677 -22 685 -16 L 677 -9 675 -7 Q 668 -1 653 -1 L 644 0 641 -1 Q 621 -1 612 -13 L 611 -16 604 -18 604 -19 601 -36 M 544 -16 L 540 -23 Q 539 -30 545 -32 L 552 -17 553 -16 544 -16 M 792 -14 L 790 -15 786 -14 791 -14 792 -14 M 649 53 L 659 51 657 50 656 50 649 53 M 627 25 L 614 26 606 22 599 22 586 24 578 35 Q 565 46 546 47 L 539 47 546 57 546 62 562 65 567 65 561 61 560 57 Q 558 46 575 47 586 32 629 26 L 627 25 M 495 53 L 472 57 467 62 478 62 500 62 495 54 495 53 M 421 40 L 416 39 389 40 385 39 376 36 357 39 334 36 331 37 342 43 Q 346 47 342 57 L 324 72 340 80 373 108 Q 390 130 400 158 439 181 451 198 L 460 209 Q 475 209 485 221 491 230 486 244 L 486 246 496 266 498 264 Q 509 251 508 243 505 229 491 227 L 488 215 Q 485 198 458 172 463 143 458 120 455 108 440 89 L 430 78 454 67 462 54 Q 460 44 421 40 M 516 332 L 521 334 525 329 516 332 M 422 406 L 427 419 Q 434 427 448 427 472 427 472 406 472 384 447 386 422 387 422 406 M 671 395 L 673 397 675 393 672 394 671 395 M 523 450 Q 540 445 555 450 L 568 463 Q 565 478 531 478 L 514 475 508 466 513 457 523 450 M 665 427 L 664 428 662 427 665 427 M 646 417 L 642 416 646 418 646 417 M 251 53 L 250 53 247 54 250 54 251 53 M 113 114 L 100 115 91 113 84 114 72 118 71 129 60 141 46 146 39 147 51 155 54 160 70 161 74 160 67 156 64 152 Q 59 146 67 143 L 74 141 Q 77 126 115 114 L 113 114 M 143 74 L 142 75 Q 139 83 125 85 L 85 82 113 82 Q 129 82 143 74 M 0 158 L -20 165 -22 170 -12 170 9 165 1 158 0 158 M 153 134 L 148 138 157 135 154 133 153 134";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 810 210 Q 816 262 803 288 790 314 758 332 718 366 664 374 L 572 365 561 361 560 362 553 372 Q 543 378 531 380 L 513 382 518 378 448 382 441 382 433 380 435 382 438 384 436 392 422 404 Q 400 412 393 404 L 392 403 390 402 386 404 368 412 287 437 276 437 271 443 248 458 Q 211 472 165 472 121 471 109 460 L 98 449 86 444 80 440 66 434 59 428 32 413 -16 382 -61 335 -95 320 Q -109 309 -109 284 -109 272 -103 271 L -98 263 Q -119 191 -63 188 L 4 184 Q 37 162 59 157 L 71 155 76 154 95 146 Q 121 136 142 137 L 175 125 180 125 181 120 199 107 194 108 188 108 Q 205 90 226 87 L 227 85 Q 266 57 321 62 L 340 65 Q 370 70 385 84 L 390 88 Q 404 93 419 100 473 125 495 143 L 508 155 Q 521 154 536 167 L 548 191 549 193 Q 592 236 602 263 L 600 236 601 234 Q 610 219 608 210 604 195 591 193 L 588 180 Q 582 158 551 125 L 534 109 533 104 Q 529 88 505 77 L 517 75 522 75 526 72 596 48 Q 653 30 700 46 738 58 743 78 L 744 83 761 99 Q 792 133 798 155 L 801 167 Q 814 169 818 184 820 193 811 209 L 810 210 M 176 146 L 179 147 179 146 176 146";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 823 83 Q 803 98 769 102 724 107 695 102 671 95 664 83 650 50 735 36 821 22 835 54 842 69 823 83 M 832 198 L 799 228 797 231 783 234 733 228 727 225 722 230 Q 703 248 646 254 L 574 248 575 249 583 259 Q 585 263 579 269 573 277 560 278 542 281 526 267 L 512 253 Q 507 244 517 246 L 533 250 541 246 554 241 567 243 548 218 Q 541 203 571 190 L 510 182 Q 478 172 474 163 L 471 150 Q 449 146 431 127 420 104 469 93 L 481 92 Q 476 77 517 67 560 57 567 72 L 558 91 Q 544 106 531 108 L 529 108 529 109 532 120 545 115 571 113 568 111 Q 558 92 596 86 L 599 85 589 77 Q 582 62 608 62 631 64 638 76 641 84 632 87 L 640 94 641 109 633 120 645 130 647 147 649 152 Q 652 161 644 165 L 634 167 621 179 638 181 702 188 Q 718 193 726 201 L 807 184 829 191 832 198 M 819 130 Q 813 166 841 183 L 762 180 Q 711 174 704 158 698 146 710 131 728 109 784 102 L 830 99 819 130 M 844 319 L 792 309 773 292 772 283 753 287 696 282 Q 682 277 677 270 670 252 727 240 778 229 792 247 L 793 246 Q 795 261 822 276 L 856 286 847 293 Q 834 307 844 319 M 740 67 L 747 67 770 62 771 60 771 59 745 63 740 67 M 485 214 Q 471 228 427 233 383 238 356 225 L 335 209 331 196 318 198 Q 286 203 267 188 L 254 172 Q 248 161 295 156 336 152 349 172 L 395 163 Q 473 157 490 193 495 204 485 214 M 550 157 L 547 154 541 156 540 156 550 157 M 541 351 Q 527 319 609 299 690 278 704 309 711 324 698 340 683 365 629 371 L 590 370 Q 548 364 541 351 M 510 283 Q 505 293 489 295 L 465 295 Q 480 301 484 312 490 324 484 331 472 342 426 348 389 351 363 339 L 341 322 Q 328 294 400 289 L 403 289 379 282 367 271 Q 359 253 393 253 427 253 434 269 437 274 432 279 430 287 420 288 L 446 291 437 283 Q 431 271 468 262 504 254 511 271 L 510 283 M 428 323 L 429 320 423 321 424 323 428 323 M 426 385 Q 423 377 465 362 508 348 516 368 519 374 510 383 500 393 481 396 443 400 426 385 M 402 100 Q 407 109 396 121 383 135 353 139 316 143 291 130 277 125 271 117 258 87 324 81 389 73 402 100 M 216 242 L 189 240 178 232 Q 170 223 188 212 201 201 218 219 L 227 230 Q 228 238 216 242 M 24 188 L 22 187 3 195 0 200 24 191 24 188 M 80 206 Q 68 224 41 233 L -22 243 Q -46 240 -59 228 -86 195 -20 167 46 141 76 172 89 188 80 206 M 126 181 Q 160 170 175 188 182 193 179 203 175 215 152 223 L 128 219 106 210 Q 92 193 126 181 M 142 225 Q 158 230 174 248 187 261 186 276 185 295 151 306 L 73 317 Q 26 319 13 303 1 290 5 273 10 246 55 231 110 213 142 225 M 138 319 L 146 329 Q 168 354 118 372 93 380 72 372 L 65 370 64 377 Q 56 398 10 414 -29 426 -58 415 L -54 418 -45 425 Q -61 417 -85 419 L -86 419 -76 413 -65 412 -92 388 Q -106 372 -87 356 L -144 355 -170 348 Q -177 335 -191 330 L -193 326 -214 322 -234 313 -240 308 Q -260 284 -223 267 L -212 263 Q -224 247 -194 232 L -148 230 Q -143 235 -147 251 -151 269 -163 273 L -164 272 -163 275 Q -158 278 -156 284 L -146 279 -125 273 -128 272 Q -146 252 -116 240 L -114 239 Q -123 238 -127 230 -141 216 -118 214 -96 212 -86 224 -78 232 -85 236 L -74 242 -66 258 -66 272 Q -57 275 -51 282 L -42 298 -38 303 Q -31 312 -36 318 L -43 322 -49 337 -34 336 26 335 52 345 Q 65 335 115 315 L 138 319 M 97 485 L 98 484 98 485 97 485 M 44 425 Q 29 408 73 387 L 133 386 Q 138 372 153 366 L 249 360 Q 286 368 298 380 310 394 290 417 270 438 240 447 L 163 452 140 435 133 427 118 433 68 437 Q 52 433 44 425 M 280 281 Q 285 287 283 296 280 312 257 319 L 224 322 213 315 Q 192 292 229 278 L 280 281 M 310 458 Q 302 459 297 451 288 443 318 415 346 388 367 412 387 435 350 447 L 310 458 M -155 371 Q -146 382 -150 393 -154 404 -172 414 -166 388 -166 369 L -167 360 -155 371 M -130 323 L -130 324 -120 324 -125 320 -130 323";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 885 9 L 887 9 894 15 885 9 M 898 32 L 881 50 865 62 829 69 749 63 Q 731 57 727 48 722 41 742 29 763 15 788 12 L 790 14 842 16 Q 893 20 896 29 L 898 32 M 825 113 L 821 113 810 111 809 109 Q 806 102 818 101 L 828 101 825 113 M 813 210 Q 797 224 767 228 L 702 223 684 208 Q 667 173 740 171 812 168 822 190 828 198 813 210 M 841 314 Q 833 324 811 326 783 330 760 326 737 322 735 314 722 287 781 282 834 277 845 295 837 305 841 314 M 836 365 L 831 361 Q 827 351 852 349 877 346 881 356 883 361 877 364 L 863 369 836 365 M 746 86 L 724 95 Q 701 98 696 83 690 72 701 72 L 729 70 Q 748 67 751 77 L 746 86 M 693 24 Q 701 39 650 46 625 48 610 31 607 24 624 21 L 678 19 Q 692 20 693 24 M 651 75 Q 648 66 665 65 680 64 683 72 688 81 670 83 L 655 79 651 75 M 612 111 Q 593 114 589 104 585 98 601 94 617 92 622 101 626 110 612 111 M 619 154 L 634 151 Q 652 148 657 158 660 165 644 167 619 169 620 160 L 619 154 M 642 138 Q 628 107 693 100 759 93 768 114 774 126 758 136 747 145 727 150 L 724 151 706 153 656 150 642 138 M 609 229 Q 580 244 541 249 L 468 243 449 228 Q 442 214 448 208 460 195 518 188 L 607 186 Q 628 190 631 198 639 213 609 229 M 783 161 L 768 158 766 155 Q 761 145 776 142 793 140 797 149 801 159 783 161 M 517 79 L 502 71 Q 497 58 532 54 599 46 604 61 608 67 600 71 L 548 84 517 79 M 529 43 Q 532 51 518 52 L 501 51 493 46 Q 490 39 508 36 525 35 529 43 M 413 115 Q 408 123 385 125 L 351 120 344 112 Q 338 102 372 98 405 93 411 104 L 413 115 M 484 93 Q 545 94 553 109 556 115 526 125 L 495 134 448 130 435 120 Q 423 92 484 93 M 429 83 L 378 81 367 73 Q 355 45 415 38 474 30 481 46 484 52 472 65 457 79 429 83 M 417 240 L 384 247 Q 357 251 354 242 353 239 363 230 376 222 388 220 L 414 223 422 230 Q 426 236 417 240 M 452 177 Q 438 193 399 198 L 323 193 298 180 Q 295 173 319 157 L 360 135 422 138 Q 454 148 457 155 462 165 452 177 M 555 178 Q 499 185 487 157 481 147 536 137 590 128 597 145 600 151 592 162 580 176 555 178 M 585 357 Q 611 354 616 364 L 617 371 598 377 Q 566 380 560 370 558 362 585 357 M 519 278 L 490 271 Q 513 243 526 268 530 277 519 278 M 471 320 Q 455 289 530 281 605 272 619 301 623 311 609 321 595 334 562 338 L 492 335 Q 474 329 471 320 M 450 277 L 416 277 410 269 Q 404 256 432 249 458 243 465 256 473 275 450 277 M 427 392 L 420 405 391 397 Q 389 393 402 385 L 384 378 Q 375 387 355 394 L 321 391 311 380 Q 287 352 329 339 333 336 336 336 L 333 334 319 319 Q 306 294 367 288 426 281 438 303 452 333 386 341 L 393 356 Q 407 347 439 341 504 329 522 367 L 524 383 Q 519 397 496 399 L 427 392 M 428 424 L 427 427 428 428 424 429 Q 407 430 406 423 403 415 410 415 419 416 428 424 M 565 397 L 584 399 582 405 570 409 Q 548 412 552 405 549 401 565 397 M 792 351 Q 804 377 760 382 L 686 377 Q 652 370 649 361 641 346 712 338 782 329 792 351 M 739 263 Q 732 248 757 245 781 240 787 255 L 787 265 Q 783 273 770 274 740 277 739 263 M 721 266 Q 714 277 696 279 L 622 281 Q 600 277 596 268 583 241 647 230 710 219 725 251 727 256 721 266 M 702 317 Q 706 326 694 327 L 658 329 Q 651 329 649 322 645 314 671 309 697 305 702 317 M 349 67 L 344 74 338 77 Q 325 78 321 69 317 62 332 62 347 62 349 67 M 336 98 L 302 96 296 92 Q 293 85 317 83 340 81 344 88 L 342 95 336 98 M 265 79 L 264 89 259 99 261 99 257 100 Q 229 104 220 88 215 78 237 70 259 64 265 79 M 218 197 Q 218 206 202 211 L 176 210 166 204 Q 147 185 175 179 200 173 209 184 L 218 197 M 227 132 Q 221 117 270 112 317 109 321 120 324 126 304 141 283 157 270 153 L 244 143 227 132 M 340 232 L 334 231 330 230 Q 325 230 315 240 305 243 286 222 282 211 311 209 340 208 348 224 351 230 340 232 M 153 99 Q 150 113 134 118 113 125 97 118 L 84 109 Q 61 83 102 78 141 73 149 83 L 153 99 M 17 135 L 63 132 116 136 Q 125 145 121 158 115 177 77 189 L 6 195 Q -13 190 -21 181 -28 173 -17 158 -5 141 14 135 L 17 135 M 14 219 L 0 232 Q -18 238 -31 223 -40 213 -32 210 L -9 204 Q 6 200 13 209 L 14 219 M 99 233 L 93 238 81 238 79 235 Q 74 228 84 225 L 97 226 99 233 M 176 142 Q 181 150 173 156 161 155 154 146 146 138 158 136 169 135 176 142 M 117 218 Q 106 205 126 202 143 198 153 210 161 219 144 226 L 126 224 117 218 M 102 367 L 43 372 19 359 Q -12 323 51 310 112 298 132 319 140 329 133 342 126 359 102 367 M 117 286 Q 99 267 162 246 L 243 248 Q 253 259 243 273 233 290 203 300 L 133 303 Q 120 297 117 286 M 70 293 L 63 290 Q 55 280 68 276 L 89 279 Q 97 290 82 294 L 70 293 M 26 292 L 12 297 -33 299 -51 290 Q -78 259 -26 242 27 225 48 246 58 258 49 272 L 30 289 26 292 M 3 445 Q -19 445 -26 435 -51 409 -1 387 47 366 78 399 L 81 415 Q 80 429 67 433 L 3 445 M 143 372 Q 120 345 186 323 251 300 280 332 290 345 281 360 271 377 236 388 203 399 172 388 153 382 143 372 M 132 393 L 138 405 Q 137 413 128 418 103 425 95 410 82 394 102 387 121 380 132 393 M 144 474 Q 123 473 116 465 90 437 141 424 186 410 205 431 217 458 189 467 L 144 474 M 380 272 L 365 277 343 273 Q 338 258 353 251 369 245 378 263 L 380 272 M 264 296 L 251 289 Q 241 279 265 271 L 294 268 301 274 304 284 Q 306 293 297 295 L 264 296 M 291 397 Q 300 407 285 412 L 260 415 271 418 266 420 259 420 257 416 260 415 Q 251 414 247 409 237 397 259 393 L 291 397 M 228 448 Q 223 443 238 434 L 259 432 259 442 249 452 Q 234 457 228 448 M 264 489 L 264 498 254 505 Q 240 509 230 505 L 223 502 Q 214 491 236 485 255 480 264 489 M 403 420 Q 413 432 411 445 410 465 372 477 336 489 307 478 L 284 465 Q 264 442 320 419 378 393 403 420 M 188 503 Q 172 490 132 487 169 480 184 496 L 188 503 M -200 216 L -216 217 -225 213 Q -231 204 -216 201 -203 195 -195 204 -188 212 -200 216 M -123 168 L -78 156 -62 161 Q -48 176 -90 190 -110 196 -130 180 -137 172 -123 168 M -159 246 L -188 244 -206 237 Q -216 225 -187 215 L -121 213 Q -116 218 -121 224 L -159 246 M -66 208 Q -53 204 -48 212 -38 222 -53 226 L -69 225 -74 221 Q -82 212 -66 208 M -236 214 Q -230 221 -234 235 -240 253 -263 261 L -287 267 -291 264 Q -307 254 -327 249 -335 228 -296 215 L -236 214 M -260 298 L -261 301 -262 294 -260 298 M -209 264 Q -156 256 -142 272 -136 277 -158 293 L -180 306 -223 309 -240 298 Q -263 271 -209 264 M -91 266 Q -106 271 -114 261 -119 255 -108 249 -95 244 -87 253 -78 262 -91 266 M -63 310 L -51 304 Q -37 299 -28 309 -21 315 -34 319 -55 326 -59 315 L -63 310 M -30 355 Q -17 370 -34 392 L -73 419 -85 419 -113 425 -158 424 -172 415 Q -165 393 -166 374 L -134 360 -58 346 Q -37 346 -30 355 M -83 322 Q -86 339 -107 345 -151 361 -176 332 -185 322 -143 304 L -85 303 Q -81 309 -83 322";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 36 68 L 39 71 46 84 55 92 55 91 53 77 Q 52 69 36 68 M 605 -16 L 601 -23 Q 601 -59 640 -53 679 -48 679 -27 L 677 -20 668 -13 Q 659 -13 657 -25 L 659 -26 667 -24 665 -30 652 -30 650 -25 643 -22 Q 638 -22 641 -23 L 640 -26 640 -29 629 -19 Q 622 -11 616 -11 610 -11 605 -16 M 309 -11 Q 318 -23 344 -23 398 -22 404 15 L 462 12 461 10 458 1 Q 463 -31 483 -31 L 509 -35 Q 520 -35 531 -23 L 541 -5 539 3 555 3 553 -4 561 -8 625 2 645 1 726 -15 Q 753 -22 754 -35 761 -56 782 -47 L 826 -30 827 -25 Q 827 -19 807 -17 777 -15 753 -1 702 27 699 27 693 27 691 19 L 664 24 628 25 597 22 591 18 522 21 Q 515 21 515 14 L 526 -5 521 -13 510 -20 489 -14 Q 492 -6 485 6 L 478 15 480 18 482 34 478 36 472 32 458 28 Q 449 28 441 34 L 421 39 398 34 385 26 387 22 390 17 382 5 Q 369 -7 340 -7 326 -7 319 7 L 330 15 335 20 334 25 319 26 320 29 322 30 328 40 325 43 Q 305 37 278 50 246 65 230 65 L 213 62 210 67 214 77 205 86 199 83 168 98 115 115 110 113 106 111 84 109 58 112 56 113 58 116 56 118 Q 33 120 -3 134 -37 147 -74 149 L -104 149 -120 131 Q -140 131 -168 147 -196 163 -206 163 L -211 161 -215 158 -234 163 -252 157 -256 146 -271 172 Q -280 191 -286 191 L -297 186 -301 178 Q -301 170 -284 149 -266 126 -254 126 -243 126 -241 135 L -242 147 -233 147 -187 129 -139 116 Q -138 91 -116 85 -94 79 -93 106 -75 106 -75 115 -75 117 -82 119 L -101 132 -100 133 -89 135 -36 113 Q 3 98 22 98 L 29 99 30 103 28 108 31 108 31 106 Q 31 103 34 98 11 85 11 75 41 44 56 57 L 65 75 72 88 120 89 192 71 191 69 Q 178 55 158 63 L 146 49 Q 109 54 114 43 114 17 154 34 L 201 59 210 49 211 49 Q 217 42 247 35 L 301 26 305 26 303 12 Q 303 -4 309 -11 M 213 -26 Q 243 -31 243 -5 L 238 3 228 -5 215 -9 Q 200 -9 200 7 L 210 7 211 12 210 17 Q 208 21 199 21 183 21 183 2 183 -21 213 -26";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj405=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/405.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj405,"assets/takeover/art/images/405.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj405.src="assets/takeover/art/images/405.png";
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

function shape3733(ctx,ctrans,frame,ratio,time){
	var pathData="M 616 -28 L 622 -23 656 -26 662 -24 672 -23 707 -16 768 -15 772 -12 796 -9 838 -14 841 -14 820 8 Q 785 42 785 61 L 793 78 800 96 787 126 Q 774 156 774 174 774 207 797 254 814 289 839 307 L 827 371 822 371 763 361 723 358 717 357 671 354 624 363 Q 609 363 601 375 L 601 376 586 380 558 392 Q 494 398 494 416 L 495 422 490 429 Q 468 419 426 437 L 383 432 331 423 319 422 290 417 Q 239 417 239 448 L 248 461 252 471 256 481 254 492 252 492 251 492 Q 224 492 193 469 L 181 461 191 444 Q 191 409 137 426 L 132 429 112 396 Q 87 360 67 353 L 25 355 -14 366 Q -40 370 -52 381 L -70 378 -91 381 -112 384 Q -179 345 -169 323 -169 292 -178 264 -191 220 -239 206 -240 193 -251 182 -264 169 -287 164 L -305 161 -294 149 -278 143 -260 136 -234 140 -208 135 -207 135 -164 144 -85 137 Q -49 129 -49 114 -49 104 -56 103 L -56 101 -53 100 -41 100 -33 104 -6 104 34 98 47 90 54 90 65 95 66 96 75 101 79 101 70 109 56 114 49 115 61 123 64 128 80 129 84 128 77 124 74 120 Q 69 114 77 111 L 84 109 89 101 137 101 Q 206 73 206 59 L 199 49 196 46 196 45 193 42 194 38 187 36 186 35 245 17 252 19 322 19 334 12 352 11 Q 356 15 352 25 L 334 40 350 48 383 76 Q 400 98 410 126 449 149 461 166 L 470 177 Q 485 177 495 189 501 198 496 212 L 496 214 506 234 508 232 Q 519 219 518 211 515 197 501 195 L 498 183 Q 495 166 468 140 473 111 468 88 465 76 450 57 L 440 46 464 35 472 22 462 14 467 14 Q 524 14 577 -10 L 616 -28 M 580 -28 L 581 -29 582 -29 580 -28 M 637 -7 L 624 -6 Q 619 -7 616 -10 L 609 -10 596 -8 588 3 Q 575 14 556 15 L 549 15 556 25 556 30 572 33 577 33 571 29 570 25 Q 568 14 585 15 596 0 639 -6 L 637 -7 M 852 -26 L 839 -28 800 -22 844 -30 852 -33 854 -28 852 -26 M 669 19 L 667 18 666 18 659 21 669 19 M 482 25 L 477 30 488 30 510 30 505 22 505 21 482 25 M 458 1 L 452 1 436 -3 455 0 458 1 M 433 8 L 431 8 427 7 430 7 433 8 M 531 302 L 535 297 526 300 531 302 M 437 387 Q 444 395 458 395 482 395 482 374 482 352 457 354 432 355 432 374 L 437 387 M 804 380 L 809 381 808 383 804 380 M 260 21 L 257 22 260 22 261 21 260 21 M 163 102 L 158 106 167 103 164 101 163 102 M 19 88 L 15 89 17 88 19 88 M 10 126 L -10 133 -12 138 -2 138 19 133 11 126 10 126";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 813 256 Q 800 282 768 300 728 334 674 342 L 582 333 571 329 570 330 563 340 541 348 523 350 528 346 458 350 451 350 443 348 445 350 448 352 446 360 432 372 Q 410 380 403 372 L 402 371 400 370 396 372 378 380 297 405 286 405 281 411 273 418 Q 253 421 245 431 L 175 440 Q 131 439 119 428 L 108 417 96 412 90 408 76 402 69 396 42 381 -6 350 -51 303 -85 288 Q -99 277 -99 252 -99 240 -93 239 L -88 231 Q -109 159 -53 156 L 14 152 Q 47 130 69 125 L 81 123 86 122 105 114 Q 131 104 152 105 L 185 93 190 93 191 88 209 75 204 76 198 76 Q 215 58 236 55 L 237 53 Q 276 25 331 30 L 350 33 Q 380 38 395 52 L 400 56 429 68 Q 483 93 505 111 L 518 123 Q 531 122 546 135 L 558 159 559 161 Q 602 204 612 231 L 610 204 611 202 Q 620 187 618 178 614 163 601 161 L 598 148 Q 592 126 561 93 L 544 77 543 72 Q 539 56 515 45 L 527 43 532 43 536 40 606 16 Q 663 -2 710 14 748 26 753 46 L 754 51 771 67 Q 802 101 808 123 L 811 135 Q 824 137 828 152 830 161 821 177 L 820 178 Q 826 230 813 256 M 189 114 L 186 114 189 115 189 114";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 833 51 Q 813 66 779 70 734 75 705 70 681 63 674 51 660 18 745 4 831 -10 845 22 852 37 833 51 M 842 166 L 809 196 807 199 793 202 743 196 737 193 732 198 Q 713 216 656 222 L 584 216 585 217 593 227 Q 595 231 589 237 583 245 570 246 552 249 536 235 L 522 221 Q 517 212 527 214 L 543 218 551 214 Q 557 209 564 209 L 577 211 558 186 Q 551 171 581 158 L 520 150 Q 488 140 484 131 L 481 118 Q 459 114 441 95 430 72 479 61 L 491 60 Q 486 45 527 35 570 25 577 40 L 568 59 Q 554 74 541 76 L 539 76 539 77 542 88 555 83 581 81 578 79 Q 568 60 606 54 L 609 53 599 45 Q 592 30 618 30 641 32 648 44 651 52 642 55 L 650 62 651 77 643 88 655 98 657 115 659 120 Q 662 129 654 133 L 644 135 631 147 648 149 712 156 Q 728 161 736 169 L 817 152 839 159 842 166 M 851 151 L 772 148 Q 721 142 714 126 708 114 720 99 738 77 794 70 L 840 67 829 98 Q 823 134 851 151 M 866 254 L 857 261 Q 844 275 854 287 L 802 277 783 260 782 251 763 255 706 250 687 238 Q 680 220 737 208 788 197 802 215 L 803 214 Q 805 229 832 244 L 866 254 M 780 30 L 781 28 781 27 755 31 750 35 757 35 780 30 M 406 89 Q 393 103 363 107 326 111 301 98 L 281 85 Q 268 55 334 49 399 41 412 68 417 77 406 89 M 442 247 Q 440 255 430 256 L 456 259 447 251 Q 441 239 478 230 514 222 521 239 524 245 520 251 515 261 499 263 L 475 263 Q 490 269 494 280 500 292 494 299 482 310 436 316 399 319 373 307 L 351 290 Q 338 262 410 257 L 413 257 389 250 377 239 Q 369 221 403 221 437 221 444 237 447 242 442 247 M 437 201 L 366 193 345 177 341 164 328 166 Q 296 171 277 156 268 150 264 140 258 129 305 124 346 120 359 140 L 405 131 Q 483 125 500 161 505 172 495 182 481 196 437 201 M 550 124 L 560 125 557 122 551 124 550 124 M 551 319 Q 537 287 619 267 700 246 714 277 721 292 708 308 693 333 639 339 L 600 338 Q 558 332 551 319 M 520 351 Q 510 361 491 364 453 368 436 353 433 345 475 330 518 316 526 336 529 342 520 351 M 438 291 L 439 288 433 289 434 291 438 291 M 226 210 L 199 208 188 200 Q 180 191 198 180 211 169 228 187 L 237 198 226 210 M 65 199 L 152 193 Q 168 198 184 216 197 229 196 244 195 263 161 274 L 83 285 Q 36 287 23 271 11 258 15 241 20 214 65 199 M 51 201 L -12 211 Q -36 208 -49 196 -76 163 -10 135 56 109 86 140 99 156 90 174 78 192 51 201 M 32 155 L 13 163 10 168 34 159 34 156 32 155 M 189 171 Q 185 183 162 191 L 138 187 116 178 Q 102 161 136 149 170 138 185 156 192 161 189 171 M 148 287 L 156 297 Q 178 322 128 340 103 348 82 340 L 75 338 74 345 Q 66 366 20 382 -19 394 -48 383 L -44 386 -35 393 -75 387 -76 387 -66 381 -55 380 -82 356 Q -96 340 -77 324 L -134 323 -160 316 Q -167 303 -181 298 L -183 294 -204 290 -224 281 -230 276 Q -250 252 -213 235 L -202 231 Q -214 215 -184 200 L -138 198 Q -133 203 -137 219 -141 237 -153 241 L -154 240 -153 243 Q -148 246 -146 252 L -136 247 -115 241 -118 240 Q -136 220 -106 208 L -104 207 -117 198 Q -131 184 -108 182 -86 180 -76 192 -68 200 -75 204 L -64 210 -56 226 -56 240 Q -47 243 -41 250 L -32 266 -28 271 Q -21 280 -26 286 L -33 290 -39 305 -24 304 36 303 62 313 Q 75 303 125 283 L 148 287 M 163 334 L 259 328 Q 296 336 308 348 320 362 300 385 280 406 250 415 L 173 420 Q 159 414 150 403 L 143 395 128 401 78 405 Q 62 401 54 393 39 376 83 355 L 143 354 Q 148 340 163 334 M 108 453 L 107 453 108 452 108 453 M 223 283 Q 202 260 239 246 L 290 249 Q 295 255 293 264 290 280 267 287 L 234 290 223 283 M 331 423 L 320 422 308 420 307 419 Q 298 411 328 383 356 356 377 380 397 403 360 415 L 333 423 331 423 M -110 292 L -115 288 -120 291 -120 292 -110 292 M -157 328 L -145 339 Q -136 350 -140 361 -144 372 -162 382 -156 356 -156 337 L -157 328";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 875 -23 L 895 -15 896 -12 896 -9 906 -3 908 0 891 18 875 30 839 37 759 31 753 29 774 29 802 35 838 29 Q 851 25 856 21 L 867 19 Q 891 16 891 6 L 885 1 824 9 783 2 759 -2 753 -4 751 -7 Q 746 -14 741 -10 L 739 -11 727 -15 852 -18 875 -23 M 752 29 L 737 16 Q 734 12 740 7 L 743 8 746 13 746 21 752 29 M 704 -1 Q 698 9 660 14 637 16 623 2 L 645 -1 659 2 673 5 685 2 699 -1 704 -1 M 546 22 Q 609 14 614 29 618 35 610 39 L 558 52 527 47 Q 515 45 512 39 L 512 38 531 27 546 22 M 355 59 L 352 63 346 66 312 64 306 60 Q 303 53 327 51 L 333 51 Q 339 57 355 59 M 273 43 L 275 47 274 57 269 67 271 67 267 68 Q 239 72 230 56 246 47 273 43 M 182 107 L 186 110 Q 191 118 183 124 171 123 164 114 L 162 112 182 107 M 64 164 L 16 163 -5 154 5 151 43 160 61 159 64 164 M -56 176 Q -43 172 -38 180 -28 190 -43 194 L -59 193 -64 189 -65 180 -56 176 M -274 152 L -300 155 Q -309 155 -309 144 -309 135 -297 130 L -260 133 -162 137 -117 140 Q -92 140 -71 119 -53 102 -51 85 L -47 88 -27 97 -20 97 -11 103 55 113 126 107 122 116 117 130 116 127 115 127 67 141 15 134 Q 7 122 -2 120 L 0 118 -7 119 -9 119 -13 119 -26 119 -49 112 -51 122 -53 122 -53 125 -54 127 -53 128 -53 144 -53 145 Q -61 152 -80 158 L -90 160 -95 158 -114 152 -120 148 -122 146 -186 147 -221 145 -271 150 -274 152 M 26 87 L 50 82 71 86 35 87 26 87 M 272 5 L 311 3 Q 334 3 352 15 370 27 424 27 500 27 547 -8 L 576 -32 587 -36 Q 588 -41 595 -42 L 603 -41 637 -40 660 -26 686 -17 683 -16 678 -18 666 -18 631 -18 615 -19 609 -19 601 -10 571 -5 542 2 498 30 380 37 351 34 347 24 Q 341 17 318 17 248 17 212 44 L 207 45 207 48 205 49 175 86 158 92 174 65 176 61 176 58 Q 182 38 202 25 217 19 242 12 L 272 5 M 895 -23 L 897 -23 904 -17 895 -23 M 831 81 L 820 79 819 77 Q 816 70 828 69 L 838 69 835 81 831 81 M 823 178 Q 807 192 777 196 L 712 191 694 176 Q 677 141 750 139 822 136 832 158 838 166 823 178 M 873 337 L 846 333 841 329 Q 837 319 862 317 887 314 891 324 893 329 887 332 L 873 337 M 851 282 Q 843 292 821 294 793 298 770 294 747 290 745 282 732 255 791 250 844 245 855 263 847 273 851 282 M 806 378 L 801 382 792 385 740 374 Q 645 374 557 404 L 442 449 387 449 357 439 351 439 343 440 334 438 312 437 310 437 332 426 327 418 Q 295 422 271 437 247 452 247 468 L 248 477 251 480 266 476 Q 264 450 290 443 285 445 280 450 267 462 267 473 L 276 488 Q 276 500 260 500 248 500 244 488 234 487 229 469 L 226 449 Q 226 434 246 423 L 249 422 238 416 Q 233 411 248 402 L 269 400 269 410 266 416 293 411 Q 301 399 330 387 388 361 413 388 L 421 405 410 390 Q 395 374 377 378 L 377 385 412 430 425 421 425 420 Q 457 418 483 405 527 384 554 377 L 562 375 562 373 Q 559 369 575 365 L 594 367 617 359 651 353 Q 580 368 548 391 L 556 392 641 372 748 355 Q 768 355 783 367 L 806 378 M 693 345 Q 662 338 659 329 651 314 722 306 792 297 802 319 812 341 783 348 L 693 345 M 739 38 Q 758 35 761 45 L 756 54 734 63 Q 711 66 706 51 700 40 711 40 L 739 38 M 716 121 L 666 118 Q 656 114 652 106 638 75 703 68 769 61 778 82 784 94 768 104 L 737 118 734 119 716 121 M 786 110 Q 803 108 807 117 811 127 793 129 L 778 126 776 123 Q 771 113 786 110 M 675 33 Q 690 32 693 40 698 49 680 51 L 665 47 661 43 Q 658 34 675 33 M 622 79 Q 603 82 599 72 595 66 611 62 627 60 632 69 636 78 622 79 M 644 119 Q 662 116 667 126 670 133 654 135 629 137 630 128 L 629 122 644 119 M 619 197 Q 590 212 551 217 L 478 211 459 196 Q 452 182 458 176 470 163 528 156 L 617 154 Q 638 158 641 166 649 181 619 197 M 731 234 Q 724 245 706 247 L 632 249 Q 610 245 606 236 593 209 657 198 720 187 735 219 737 224 731 234 M 749 231 Q 742 216 767 213 791 208 797 223 L 797 233 Q 793 241 780 242 750 245 749 231 M 607 113 Q 610 119 602 130 590 144 565 146 509 153 497 125 491 115 546 105 600 96 607 113 M 536 93 L 505 102 458 98 445 88 Q 433 60 494 61 555 62 563 77 566 83 536 93 M 423 83 Q 418 91 395 93 L 361 88 354 80 Q 348 70 382 66 415 61 421 72 L 423 83 M 467 123 Q 472 133 462 145 448 161 409 166 L 333 161 Q 311 154 308 148 305 141 329 125 351 109 370 103 L 432 106 Q 464 116 467 123 M 420 237 Q 414 224 442 217 468 211 475 224 483 243 460 245 L 426 245 420 237 M 427 208 L 394 215 Q 367 219 364 210 363 207 373 198 386 190 398 188 L 424 191 432 198 Q 436 204 427 208 M 529 246 L 500 239 Q 523 211 536 236 540 245 529 246 M 534 351 Q 529 365 506 367 L 437 360 430 373 401 365 Q 399 361 412 353 L 394 346 365 362 331 359 321 348 Q 297 320 339 307 343 304 346 304 L 343 302 329 287 Q 316 262 377 256 436 249 448 271 462 301 396 309 L 403 324 Q 417 315 449 309 514 297 532 335 L 534 351 M 595 325 Q 621 322 626 332 L 627 339 608 345 Q 576 348 570 338 568 330 595 325 M 481 288 Q 465 257 540 249 615 240 629 269 633 279 619 289 605 302 572 306 L 502 303 Q 484 297 481 288 M 437 395 L 438 396 434 397 Q 417 398 416 391 413 383 420 383 429 384 438 392 L 437 395 M 681 277 Q 707 273 712 285 716 294 704 295 L 668 297 659 290 Q 655 282 681 277 M 314 109 Q 293 125 280 121 L 254 111 237 100 Q 231 85 280 80 327 77 331 88 334 94 314 109 M 212 179 L 186 178 176 172 Q 157 153 185 147 210 141 219 152 L 228 165 Q 228 174 212 179 M 253 241 Q 243 258 213 268 L 143 271 Q 130 265 127 254 109 235 172 214 L 253 216 Q 263 227 253 241 M 311 242 L 314 252 Q 316 261 307 263 L 274 264 261 257 Q 251 247 275 239 L 304 236 311 242 M 344 199 L 340 198 Q 335 198 325 208 315 211 296 190 292 179 321 177 350 176 358 192 361 198 350 200 L 344 199 M 375 245 L 353 241 Q 348 226 363 219 379 213 388 231 L 390 240 375 245 M 23 177 L 24 187 10 200 Q -8 206 -21 191 -30 181 -22 178 L 1 172 Q 16 168 23 177 M 59 240 L 40 257 36 260 22 265 -23 267 -41 258 Q -68 227 -16 210 37 193 58 214 68 226 59 240 M 99 247 Q 107 258 92 262 L 80 261 73 258 Q 65 248 78 244 92 239 99 247 M 94 193 L 107 194 109 201 103 206 91 206 89 203 Q 84 196 94 193 M 127 186 Q 116 173 136 170 153 166 163 178 171 187 154 194 L 136 192 127 186 M 112 335 L 53 340 Q 38 336 29 327 -2 291 61 278 122 266 142 287 150 297 143 310 136 327 112 335 M 142 361 L 148 373 138 386 Q 113 393 105 378 92 362 112 355 131 348 142 361 M 196 291 Q 261 268 290 300 300 313 291 328 281 345 246 356 213 367 182 356 163 350 153 340 130 313 196 291 M 88 367 L 91 383 Q 90 397 77 401 L 13 413 Q -9 413 -16 403 -41 377 9 355 57 334 88 367 M 194 464 L 198 471 Q 182 458 142 455 179 448 194 464 M 154 442 Q 133 441 126 433 100 405 151 392 196 378 215 399 227 426 199 435 L 154 442 M 301 365 Q 310 375 295 380 L 270 383 281 386 276 388 269 388 267 384 270 383 Q 261 382 257 377 247 365 269 361 L 301 365 M 247 453 L 244 457 245 458 247 453 M -190 184 L -206 185 -215 181 Q -221 172 -206 169 -193 163 -185 172 -178 180 -190 184 M -196 205 Q -206 193 -177 183 L -111 181 Q -106 186 -111 192 -116 200 -149 214 L -178 212 Q -189 211 -196 205 M -132 240 Q -126 245 -148 261 L -170 274 -213 277 -230 266 Q -253 239 -199 232 -146 224 -132 240 M -3 145 L -1 146 5 150 Q -3 150 -3 145 M -81 234 Q -96 239 -104 229 -109 223 -98 217 -85 212 -77 221 -68 230 -81 234 M -281 232 Q -297 222 -317 217 -325 196 -286 183 L -226 182 Q -220 189 -224 203 -230 221 -253 229 L -277 235 -281 232 M -251 269 L -252 262 -250 266 -251 269 M -24 287 Q -45 294 -49 283 L -53 278 -41 272 Q -27 267 -18 277 -11 283 -24 287 M -73 290 Q -76 307 -97 313 -141 329 -166 300 -175 290 -133 272 L -75 271 Q -71 277 -73 290 M -24 360 Q -40 376 -63 387 L -75 387 -103 393 -148 392 -162 383 Q -155 361 -156 342 L -124 328 -48 314 Q -27 314 -20 323 -7 338 -24 360";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 753 29 L 752 29 746 21 746 13 743 8 740 7 737 5 704 -1 699 -1 685 2 673 5 659 2 645 -1 623 2 587 10 546 22 531 27 512 38 489 46 425 55 367 59 355 59 Q 339 57 333 51 L 326 39 310 39 273 43 Q 246 47 230 56 L 218 65 Q 201 95 182 107 L 162 112 161 112 Q 147 113 143 119 L 142 139 123 157 Q 103 169 81 169 L 64 164 61 159 43 160 5 151 -5 154 -15 157 Q -28 157 -23 137 L -34 135 Q -34 148 -42 162 L -56 176 -65 180 -79 182 -99 177 -119 169 -175 164 -193 158 -209 155 -241 159 -275 163 -280 160 -274 152 -271 150 -221 145 -186 147 -178 149 -116 152 -114 152 -95 158 -90 160 -80 163 Q -58 163 -53 145 L -53 144 -53 128 -53 125 -53 122 -51 122 -26 119 -13 119 -11 120 -9 119 -7 119 -4 119 -2 120 Q 7 122 15 134 L 67 141 115 127 116 127 117 130 122 116 126 107 Q 143 103 153 96 L 158 92 175 86 205 49 207 48 Q 210 45 212 44 248 17 318 17 341 17 347 24 L 351 34 380 37 498 30 542 2 571 -5 601 -10 609 -13 631 -18 666 -18 677 -15 683 -16 686 -17 719 -15 727 -15 739 -11 741 -10 Q 746 -14 751 -7 L 753 -4 759 -2 783 2 824 9 885 1 891 6 Q 891 16 867 19 L 856 21 Q 851 25 838 29 L 802 35 774 29 753 29 M -3 145 Q -3 150 5 150 L -1 146 -3 145";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 71 86 Q 105 82 122 72 L 152 40 Q 191 -7 366 -8 L 366 -13 450 -28 Q 540 -46 566 -61 L 628 -58 687 -46 816 -45 882 -43 Q 885 -46 885 -33 L 875 -23 852 -18 727 -15 719 -15 686 -17 660 -26 637 -40 603 -41 595 -42 586 -43 576 -32 547 -8 Q 500 27 424 27 370 27 352 15 334 3 311 3 L 272 5 Q 226 9 202 25 182 38 176 58 L 176 61 174 65 158 92 153 96 Q 143 103 126 107 L 55 113 -11 103 -20 97 Q -28 92 -35 90 -37 98 -37 85 -37 75 -30 75 L 26 87 35 87 71 86 M -297 130 L -315 123 Q -306 112 -292 108 L -260 102 -166 99 -120 105 -95 103 -86 88 -85 85 Q -110 79 -110 64 -110 45 -80 50 -51 55 -51 80 L -51 85 Q -53 102 -71 119 -92 140 -117 140 L -162 137 -260 133 -297 130 M 783 348 Q 803 356 815 371 L 816 375 807 378 806 378 783 367 Q 768 355 748 355 L 641 372 556 392 548 391 Q 580 368 651 353 L 672 348 693 345 783 348 M 310 437 L 291 442 290 443 Q 264 450 266 476 L 251 480 248 477 247 468 Q 247 452 271 437 295 422 327 418 L 332 426 310 437 M 421 405 L 425 420 425 421 412 430 377 385 377 378 Q 395 374 410 390 L 421 405";
	ctx.fillStyle=tocolor(ctrans.apply([240,243,244,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3734(ctx,ctrans,frame,ratio,time){
	var pathData="M 397 -11 L 409 -14 452 -8 428 -4 416 -4 407 4 402 6 402 7 401 12 416 10 415 9 Q 413 1 431 0 446 -1 450 6 L 472 2 469 2 460 1 462 -1 Q 459 -6 459 -10 459 -37 499 -38 538 -41 538 -18 538 -6 515 -1 L 520 -1 536 -4 550 -8 603 -9 617 -1 678 -6 684 -1 716 -8 722 -11 720 -13 Q 719 -17 737 -23 L 748 -27 754 -34 764 -43 753 -45 Q 737 -49 732 -53 L 732 -59 732 -62 739 -66 740 -64 737 -61 734 -58 736 -53 758 -54 782 -48 787 -45 813 -37 817 -36 829 -38 837 -26 849 -6 815 30 Q 780 64 780 83 L 788 100 795 118 782 148 Q 769 178 769 196 769 229 792 276 809 311 834 329 L 821 395 807 395 804 395 804 401 794 420 Q 780 435 754 440 L 754 436 Q 754 401 709 403 687 404 676 412 L 675 406 676 396 674 396 Q 663 397 660 392 L 657 393 660 399 658 404 663 408 660 410 659 410 660 414 653 431 604 440 603 438 615 433 605 425 597 417 Q 597 414 600 410 581 417 578 432 L 540 430 Q 508 435 493 451 L 488 452 Q 463 438 408 465 377 491 339 503 L 321 491 310 489 298 492 298 493 294 503 287 503 Q 273 503 267 509 L 246 514 Q 219 514 188 491 L 176 483 186 466 Q 186 431 132 448 L 127 451 107 418 Q 82 382 62 375 L 20 377 -19 388 Q -45 392 -57 403 L -75 400 -96 403 -117 406 Q -184 367 -174 345 -174 314 -183 286 -196 242 -244 228 -245 215 -256 204 -274 186 -310 183 -297 171 -286 145 L -285 144 -279 138 Q -265 128 -244 120 -243 119 -245 117 L -257 115 -271 110 -274 106 -271 106 -266 110 -245 106 -233 117 Q -229 122 -236 130 L -214 130 Q -199 120 -161 113 L -147 113 -134 113 -128 108 -126 105 -136 98 -137 93 -141 92 -148 79 -144 79 Q -135 82 -127 87 L -92 79 -65 92 Q -60 98 -67 103 L -89 112 -101 113 -105 120 -109 125 -108 125 Q -106 127 -107 131 L -94 127 -95 125 Q -100 118 -84 115 L -63 118 -34 109 1 102 15 98 Q 16 94 27 91 L 35 90 Q 26 90 17 74 L 16 74 9 68 Q 1 57 17 57 L 19 57 24 52 36 41 35 36 35 32 62 49 Q 72 58 72 68 72 84 52 89 L 77 84 Q 92 85 95 89 L 151 78 159 80 Q 171 73 187 69 L 187 70 191 67 188 64 189 60 180 57 169 57 167 67 158 67 157 58 156 54 Q 155 46 146 46 L 125 45 123 35 Q 123 18 147 18 170 17 170 40 L 170 46 186 37 193 41 194 42 203 51 208 47 210 39 215 31 244 30 313 15 317 17 Q 301 8 301 -2 301 -31 350 -30 388 -29 397 -11 M 183 -2 Q 183 -17 196 -23 L 246 -29 248 -7 Q 245 12 225 12 L 185 10 183 -2 M 550 -42 Q 551 -34 557 -27 L 558 -26 549 -26 545 -33 Q 544 -40 550 -42 M 643 -62 L 678 -56 682 -49 682 -45 Q 682 -32 690 -26 L 682 -19 680 -17 Q 673 -11 658 -11 L 649 -10 646 -11 Q 626 -11 617 -23 L 616 -26 609 -28 609 -29 606 -46 Q 606 -54 627 -62 L 635 -64 643 -62 M 797 -24 L 795 -25 791 -24 796 -24 797 -24 M 619 16 L 611 12 604 12 591 14 583 25 Q 570 36 551 37 L 544 37 551 47 551 52 567 55 572 55 566 51 565 47 Q 563 36 580 37 591 22 634 16 L 632 15 619 16 M 662 40 L 661 40 654 43 664 41 662 40 M 459 57 L 467 44 Q 465 34 426 30 L 421 29 394 30 390 29 381 26 362 29 339 26 336 27 347 33 Q 351 37 347 47 L 329 62 345 70 378 98 Q 395 120 405 148 444 171 456 188 L 465 199 Q 480 199 490 211 496 220 491 234 L 491 236 501 256 503 254 Q 514 241 513 233 510 219 496 217 L 493 205 Q 490 188 463 162 468 133 463 110 460 98 445 79 L 435 68 Q 449 65 459 57 M 472 52 L 483 52 505 52 500 44 500 43 477 47 472 52 M 521 322 L 526 324 530 319 521 322 M 477 396 Q 477 374 452 376 427 377 427 396 L 432 409 Q 439 417 453 417 477 417 477 396 M 678 387 L 680 383 677 384 676 385 678 387 M 536 468 L 519 465 Q 513 461 513 456 L 518 447 Q 523 442 528 440 545 435 560 440 L 573 453 Q 570 468 536 468 M 670 417 L 669 418 667 417 670 417 M 651 408 L 651 407 647 406 651 408 M 255 44 L 256 43 255 43 252 44 255 44 M 105 105 L 96 103 89 104 77 108 76 119 65 131 51 136 44 137 Q 51 140 56 145 L 59 150 75 151 79 150 72 146 69 142 Q 64 136 72 133 L 79 131 Q 82 116 120 104 L 118 104 105 105 M 148 64 L 147 65 Q 144 73 130 75 L 90 72 118 72 Q 134 72 148 64 M 6 148 L 5 148 -15 155 -17 160 -7 160 14 155 6 148 M 162 125 L 159 123 158 124 153 128 162 125";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 815 200 Q 821 252 808 278 795 304 763 322 723 356 669 364 L 577 355 566 351 565 352 558 362 536 370 518 372 523 368 453 372 446 372 438 370 440 372 443 374 441 382 427 394 Q 405 402 398 394 L 397 393 395 392 391 394 373 402 292 427 281 427 276 433 253 448 170 462 Q 126 461 114 450 L 103 439 91 434 85 430 71 424 64 418 37 403 -11 372 -56 325 -90 310 Q -104 299 -104 274 -104 262 -98 261 L -93 253 Q -114 181 -58 178 L 9 174 Q 42 152 64 147 L 76 145 81 144 100 136 Q 126 126 147 127 L 180 115 185 115 186 110 204 97 199 98 193 98 Q 210 80 231 77 L 232 75 Q 271 47 326 52 L 345 55 Q 375 60 390 74 L 395 78 Q 409 83 424 90 478 115 500 133 L 513 145 Q 526 144 541 157 550 166 553 181 L 554 183 Q 597 226 607 253 L 605 226 606 224 Q 615 209 613 200 609 185 596 183 L 593 170 Q 587 148 556 115 L 539 99 538 94 Q 534 78 510 67 L 522 65 527 65 531 62 601 38 Q 658 20 705 36 743 48 748 68 L 749 73 766 89 Q 797 123 803 145 L 806 157 Q 819 159 823 174 825 183 816 199 L 815 200 M 181 136 L 184 137 184 136 181 136";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 828 73 Q 808 88 774 92 729 97 700 92 676 85 669 73 655 40 740 26 826 12 840 44 847 59 828 73 M 837 188 Q 816 201 804 218 L 802 221 788 224 738 218 732 215 727 220 Q 708 238 651 244 L 579 238 580 239 588 249 584 259 Q 578 267 565 268 547 271 531 257 L 517 243 Q 512 234 522 236 L 538 240 546 236 559 231 572 233 553 208 Q 546 193 576 180 L 515 172 Q 483 162 479 153 L 476 140 Q 454 136 436 117 425 94 474 83 L 486 82 Q 481 67 522 57 565 47 572 62 L 563 81 Q 549 96 536 98 L 534 98 534 99 537 110 550 105 576 103 573 101 Q 563 82 601 76 L 604 75 594 67 Q 587 52 613 52 636 54 643 66 646 74 637 77 642 79 645 84 L 646 99 638 110 650 120 652 137 654 142 Q 657 151 649 155 L 639 157 626 169 643 171 707 178 Q 723 183 731 191 L 812 174 834 181 837 188 M 846 173 L 767 170 Q 716 164 709 148 703 136 715 121 733 99 789 92 L 835 89 824 120 Q 818 156 846 173 M 852 283 Q 839 297 849 309 L 797 299 Q 785 293 778 282 L 777 273 758 277 701 272 682 260 Q 675 242 732 230 783 219 797 237 L 798 236 Q 800 251 827 266 L 861 276 Q 855 279 852 283 M 745 57 L 752 57 775 52 776 50 776 49 750 53 745 57 M 490 204 Q 476 218 432 223 388 228 361 215 344 208 340 199 L 336 186 323 188 Q 291 193 272 178 263 172 259 162 253 151 300 146 341 142 354 162 L 400 153 Q 478 147 495 183 500 194 490 204 M 545 146 L 555 147 552 144 546 146 545 146 M 546 341 Q 532 309 614 289 695 268 709 299 716 314 703 330 688 355 634 361 L 595 360 Q 553 354 546 341 M 515 273 Q 510 283 494 285 L 470 285 489 302 Q 495 314 489 321 477 332 431 338 394 341 368 329 L 346 312 Q 333 284 405 279 L 408 279 384 272 372 261 Q 364 243 398 243 432 243 439 259 442 264 437 269 L 425 278 451 281 442 273 Q 436 261 473 252 509 244 516 261 L 515 273 M 434 310 L 428 311 429 313 433 313 434 310 M 431 375 Q 428 367 470 352 513 338 521 358 524 364 515 373 505 383 486 386 448 390 431 375 M 276 107 Q 263 77 329 71 394 63 407 90 412 99 401 111 388 125 358 129 321 133 296 120 L 276 107 M 221 232 L 194 230 183 222 Q 175 213 193 202 206 191 223 209 L 232 220 Q 233 228 221 232 M 5 190 L 29 181 29 178 27 177 8 185 5 190 M 85 196 Q 73 214 46 223 L -17 233 Q -41 230 -54 218 -81 185 -15 157 51 131 81 162 94 178 85 196 M 111 200 Q 97 183 131 171 165 160 180 178 187 183 184 193 180 205 157 213 L 133 209 111 200 M 179 238 Q 192 251 191 266 190 285 156 296 L 78 307 Q 31 309 18 293 6 280 10 263 15 236 60 221 L 147 215 Q 163 220 179 238 M 143 309 L 151 319 Q 173 344 123 362 98 370 77 362 L 70 360 69 367 Q 61 388 15 404 -24 416 -53 405 L -49 408 Q -43 412 -40 415 -56 407 -80 409 L -81 409 -71 403 -60 402 -87 378 Q -101 362 -82 346 L -139 345 -165 338 Q -172 325 -186 320 L -188 316 -209 312 -229 303 -235 298 Q -255 274 -218 257 L -207 253 Q -219 237 -189 222 L -143 220 Q -138 225 -142 241 -146 259 -158 263 L -159 262 -158 265 Q -153 268 -151 274 L -141 269 -120 263 -123 262 Q -141 242 -111 230 L -109 229 Q -118 228 -122 220 -136 206 -113 204 -91 202 -81 214 -73 222 -80 226 L -69 232 -61 248 -61 262 Q -52 265 -46 272 L -37 288 -33 293 Q -26 302 -31 308 L -38 312 -44 327 -29 326 31 325 57 335 Q 70 325 120 305 L 143 309 M 78 377 L 138 376 Q 143 362 158 356 L 254 350 Q 291 358 303 370 315 384 295 407 275 428 245 437 L 168 442 145 425 138 417 123 423 73 427 Q 57 423 49 415 34 398 78 377 M 102 475 L 103 474 103 475 102 475 M 262 309 L 229 312 218 305 Q 197 282 234 268 L 285 271 Q 290 277 288 286 285 302 262 309 M 315 448 Q 307 449 302 441 293 433 323 405 351 378 372 402 392 425 355 437 L 315 448 M -162 350 L -150 361 Q -141 372 -145 383 L -167 404 Q -161 378 -161 359 L -162 350 M -125 313 L -125 314 -115 314 -120 310 -125 313";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 892 -1 L 899 5 890 -1 892 -1 M 870 52 L 834 59 754 53 Q 736 47 732 38 727 31 747 19 768 5 793 2 L 795 4 847 6 Q 898 10 901 19 L 903 22 886 40 870 52 M 823 91 L 833 91 830 103 826 103 815 101 814 99 Q 811 92 823 91 M 818 200 Q 802 214 772 218 L 707 213 689 198 Q 672 163 745 161 817 158 827 180 833 188 818 200 M 816 316 Q 788 320 765 316 742 312 740 304 727 277 786 272 839 267 850 285 842 295 846 304 838 314 816 316 M 841 355 L 836 351 Q 832 341 857 339 882 336 886 346 888 351 882 354 L 868 359 841 355 M 751 76 Q 742 83 729 85 706 88 701 73 695 62 706 62 L 734 60 Q 753 57 756 67 L 751 76 M 698 14 Q 706 29 655 36 630 38 615 21 612 14 629 11 L 683 9 Q 697 10 698 14 M 617 101 Q 598 104 594 94 590 88 606 84 622 82 627 91 631 100 617 101 M 660 69 L 656 65 Q 653 56 670 55 685 54 688 62 693 71 675 73 L 660 69 M 624 144 L 639 141 Q 657 138 662 148 665 155 649 157 624 159 625 150 L 624 144 M 614 219 Q 585 234 546 239 L 473 233 454 218 Q 447 204 453 198 465 185 523 178 L 612 176 Q 633 180 636 188 644 203 614 219 M 647 128 Q 633 97 698 90 764 83 773 104 779 116 763 126 752 135 732 140 L 729 141 711 143 661 140 Q 651 136 647 128 M 802 139 Q 806 149 788 151 L 773 148 771 145 Q 766 135 781 132 798 130 802 139 M 792 245 L 792 255 Q 788 263 775 264 745 267 744 253 737 238 762 235 786 230 792 245 M 730 241 Q 732 246 726 256 719 267 701 269 L 627 271 Q 605 267 601 258 588 231 652 220 715 209 730 241 M 531 115 L 500 124 453 120 Q 443 115 440 110 428 82 489 83 550 84 558 99 561 105 531 115 M 534 33 Q 537 41 523 42 L 506 41 498 36 Q 495 29 513 26 530 25 534 33 M 522 69 Q 510 67 507 61 502 48 537 44 604 36 609 51 613 57 605 61 L 553 74 522 69 M 418 105 Q 413 113 390 115 L 356 110 349 102 Q 343 92 377 88 410 83 416 94 L 418 105 M 434 73 L 383 71 372 63 Q 360 35 420 28 479 20 486 36 489 42 477 55 462 69 434 73 M 422 230 L 389 237 Q 362 241 359 232 358 229 368 220 381 212 393 210 L 419 213 427 220 Q 431 226 422 230 M 462 145 Q 467 155 457 167 443 183 404 188 L 328 183 Q 306 176 303 170 300 163 324 147 346 131 365 125 L 427 128 Q 459 138 462 145 M 470 246 Q 478 265 455 267 L 421 267 415 259 Q 409 246 437 239 463 233 470 246 M 560 168 Q 504 175 492 147 486 137 541 127 595 118 602 135 605 141 597 152 585 166 560 168 M 565 360 Q 563 352 590 347 616 344 621 354 L 622 361 603 367 Q 571 370 565 360 M 524 268 L 495 261 Q 518 233 531 258 535 267 524 268 M 476 310 Q 460 279 535 271 610 262 624 291 628 301 614 311 600 324 567 328 L 497 325 Q 479 319 476 310 M 425 395 L 396 387 Q 394 383 407 375 L 389 368 360 384 326 381 316 370 Q 292 342 334 329 L 341 326 338 324 324 309 Q 311 284 372 278 431 271 443 293 457 323 391 331 L 398 346 Q 412 337 444 331 509 319 527 357 L 529 373 Q 524 387 501 389 L 432 382 425 395 M 429 419 Q 412 420 411 413 408 405 415 405 424 406 433 414 L 432 417 433 418 429 419 M 416 435 Q 415 455 377 467 341 479 312 468 L 289 455 Q 269 432 325 409 383 383 408 410 418 422 416 435 M 570 387 L 589 389 587 395 575 399 Q 553 402 557 395 554 391 570 387 M 797 341 Q 809 367 765 372 L 691 367 Q 657 360 654 351 646 336 717 328 787 319 797 341 M 707 307 Q 711 316 699 317 L 663 319 Q 656 319 654 312 650 304 676 299 702 295 707 307 M 337 52 Q 352 52 354 57 L 349 64 343 67 Q 330 68 326 59 322 52 337 52 M 347 85 L 341 88 307 86 301 82 Q 298 75 322 73 345 71 349 78 L 347 85 M 270 69 L 269 79 264 89 266 89 262 90 Q 234 94 225 78 220 68 242 60 264 54 270 69 M 275 102 Q 322 99 326 110 329 116 309 131 288 147 275 143 L 249 133 232 122 Q 226 107 275 102 M 223 187 Q 223 196 207 201 L 181 200 171 194 Q 152 175 180 169 205 163 214 174 L 223 187 M 345 222 L 339 221 335 220 Q 330 220 320 230 310 233 291 212 287 201 316 199 345 198 353 214 356 220 345 222 M 139 108 Q 118 115 102 108 L 89 99 Q 66 73 107 68 146 63 154 73 L 158 89 Q 155 103 139 108 M 11 185 Q -8 180 -16 171 -23 163 -12 148 0 131 19 125 L 22 125 68 122 121 126 Q 130 135 126 148 120 167 82 179 L 11 185 M 5 222 Q -13 228 -26 213 -35 203 -27 200 L -4 194 Q 11 190 18 199 L 19 209 5 222 M 89 215 L 102 216 104 223 98 228 86 228 84 225 Q 79 218 89 215 M 178 146 Q 166 145 159 136 151 128 163 126 174 125 181 132 186 140 178 146 M 131 192 Q 148 188 158 200 166 209 149 216 L 131 214 122 208 Q 111 195 131 192 M 122 276 Q 104 257 167 236 L 248 238 Q 258 249 248 263 238 280 208 290 L 138 293 Q 125 287 122 276 M 138 332 Q 131 349 107 357 L 48 362 Q 33 358 24 349 -7 313 56 300 117 288 137 309 145 319 138 332 M 191 313 Q 256 290 285 322 295 335 286 350 276 367 241 378 208 389 177 378 158 372 148 362 125 335 191 313 M 94 269 Q 102 280 87 284 L 75 283 68 280 Q 60 270 73 266 87 261 94 269 M 31 282 L 17 287 -28 289 -46 280 Q -73 249 -21 232 32 215 53 236 63 248 54 262 L 35 279 31 282 M 8 435 Q -14 435 -21 425 -46 399 4 377 52 356 83 389 L 86 405 Q 85 419 72 423 L 8 435 M 133 408 Q 108 415 100 400 87 384 107 377 126 370 137 383 L 143 395 133 408 M 121 455 Q 95 427 146 414 191 400 210 421 222 448 194 457 L 149 464 Q 128 463 121 455 M 193 493 Q 177 480 137 477 174 470 189 486 L 193 493 M 370 267 Q 352 269 348 263 343 248 358 241 374 235 383 253 L 385 262 370 267 M 309 274 Q 311 283 302 285 L 269 286 256 279 Q 246 269 270 261 L 299 258 306 264 309 274 M 290 402 L 265 405 276 408 271 410 264 410 262 406 265 405 Q 256 404 252 399 242 387 264 383 L 296 387 Q 305 397 290 402 M 264 432 L 254 442 Q 239 447 233 438 228 433 243 424 L 264 422 264 432 M 241 475 Q 260 470 269 479 L 269 488 Q 266 493 259 495 245 499 235 495 L 228 492 Q 219 481 241 475 M -118 158 L -73 146 Q -60 147 -57 151 -43 166 -85 180 -105 186 -125 170 -132 162 -118 158 M -195 206 L -211 207 Q -216 204 -220 203 -226 194 -211 191 -198 185 -190 194 -183 202 -195 206 M -183 234 L -201 227 Q -211 215 -182 205 L -116 203 Q -111 208 -116 214 -121 222 -154 236 L -183 234 M -61 198 Q -48 194 -43 202 -33 212 -48 216 L -64 215 -69 211 Q -77 202 -61 198 M -82 243 Q -73 252 -86 256 -101 261 -109 251 -114 245 -103 239 -90 234 -82 243 M -291 205 L -231 204 Q -225 211 -229 225 -235 243 -258 251 L -282 257 -286 254 Q -302 244 -322 239 -330 218 -291 205 M -255 288 L -256 291 -257 284 -255 288 M -204 254 Q -151 246 -137 262 -131 267 -153 283 L -175 296 -218 299 -235 288 Q -258 261 -204 254 M -78 312 Q -81 329 -102 335 -146 351 -171 322 -180 312 -138 294 L -80 293 Q -76 299 -78 312 M -25 345 Q -12 360 -29 382 -45 398 -68 409 L -80 409 -108 415 -153 414 -167 405 Q -160 383 -161 364 L -129 350 -53 336 Q -32 336 -25 345 M -54 305 L -58 300 -46 294 Q -32 289 -23 299 -16 305 -29 309 -50 316 -54 305";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 41 58 L 44 61 51 74 60 82 60 81 58 67 Q 57 59 41 58 M 655 -35 Q 653 -32 648 -32 643 -32 646 -33 L 645 -36 645 -39 634 -29 Q 627 -21 621 -21 615 -21 610 -26 L 606 -33 Q 606 -69 645 -63 684 -58 684 -37 L 682 -30 Q 679 -23 673 -23 664 -23 662 -35 L 664 -36 672 -34 670 -40 657 -40 655 -35 M 345 -17 Q 331 -17 324 -3 L 335 5 340 10 339 15 324 16 325 19 327 20 333 30 330 33 Q 310 27 283 40 251 55 235 55 L 218 52 215 57 219 67 210 76 204 73 173 88 Q 134 105 120 105 L 115 103 111 101 89 99 63 102 61 103 63 106 61 108 Q 38 110 2 124 -32 137 -69 139 L -99 139 -115 121 Q -135 121 -163 137 -191 153 -201 153 L -206 151 -210 148 -229 153 Q -242 153 -247 147 L -251 136 -266 162 Q -275 181 -281 181 L -292 176 -296 168 -279 139 Q -261 116 -249 116 -238 116 -236 125 L -237 137 -228 137 -182 119 Q -159 111 -134 106 -133 81 -111 75 -89 69 -88 96 -70 96 -70 105 -70 107 -77 109 -86 112 -96 122 L -95 123 -84 125 -31 103 Q 8 88 27 88 L 34 89 35 93 33 98 36 98 36 96 39 88 Q 16 75 16 65 46 34 61 47 L 70 65 77 78 125 79 197 61 196 59 Q 183 45 163 53 L 151 39 Q 114 44 119 33 119 7 159 24 L 206 49 215 39 216 39 Q 222 32 252 25 L 306 16 310 16 308 2 Q 308 -14 314 -21 323 -33 349 -33 403 -32 409 5 L 467 2 466 0 463 -9 Q 468 -41 488 -41 L 514 -45 Q 525 -45 536 -33 L 546 -15 544 -7 560 -7 558 -14 Q 560 -18 566 -18 L 630 -8 650 -9 731 -25 Q 758 -32 759 -45 766 -66 787 -57 L 831 -40 832 -35 Q 832 -29 812 -27 782 -25 758 -11 L 704 17 Q 698 17 696 9 L 669 14 633 15 602 12 596 8 527 11 Q 520 11 520 4 L 531 -15 526 -23 515 -30 494 -24 Q 497 -16 490 -4 L 483 5 485 8 487 24 483 26 477 22 463 18 446 24 426 29 403 24 390 16 392 12 395 7 387 -5 Q 374 -17 345 -17 M 205 -3 L 215 -3 216 2 215 7 Q 213 11 204 11 188 11 188 -8 188 -31 218 -36 248 -41 248 -15 L 243 -7 233 -15 220 -19 Q 205 -19 205 -3";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function sprite3735(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3731",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3732",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3733",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3734",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

function shape3736(ctx,ctrans,frame,ratio,time){
	var pathData="M 36 -11 L 105 -18 108 -18 110 -19 147 -24 158 -18 173 -4 214 27 214 28 222 28 227 27 239 30 Q 243 30 243 27 L 242 24 240 23 292 7 303 3 305 4 305 9 Q 305 17 315 24 330 34 364 34 L 413 21 435 15 468 4 468 5 490 4 520 7 571 7 573 8 579 5 588 6 591 13 636 -16 638 -17 639 -18 656 -30 673 -26 726 -16 778 -2 767 12 741 24 749 37 Q 760 59 760 74 760 102 749 135 769 168 769 188 L 769 202 Q 782 206 782 222 L 768 245 766 248 757 289 757 290 Q 785 293 785 310 785 322 771 333 L 769 335 774 356 784 365 777 372 781 403 779 409 756 440 671 450 637 457 617 458 601 448 540 411 536 411 536 414 526 408 525 410 Q 525 415 531 418 L 480 414 Q 473 416 468 421 L 462 421 462 430 456 433 434 437 379 452 367 453 Q 326 426 300 414 L 301 411 295 406 283 407 280 406 280 408 270 409 261 406 248 406 229 414 228 412 211 415 180 414 179 420 182 423 179 424 151 432 129 435 113 432 84 420 46 391 24 385 25 382 24 358 28 321 10 310 Q 3 302 3 292 3 273 30 266 L 28 263 Q 16 236 16 221 L 21 187 16 175 Q 16 168 25 166 L 9 142 Q 9 137 12 133 7 125 7 114 7 102 42 101 L 41 97 25 102 Q 15 102 0 80 0 74 4 73 L 0 64 Q 0 51 27 48 L 25 37 28 30 Q 13 26 12 12 12 4 23 -1 L 36 -11 M 513 24 L 500 24 493 20 486 18 473 20 462 32 Q 446 45 427 45 L 420 45 425 55 424 62 439 66 444 67 439 61 439 56 Q 439 45 456 46 471 30 515 25 L 513 24 M 529 58 L 539 56 537 55 536 55 529 58 M 731 348 L 746 360 759 357 755 343 731 348 M 376 49 L 376 48 352 52 346 57 357 58 379 58 376 49 M 77 81 L 70 85 54 93 56 97 57 97 69 93 79 83 77 81 M 42 325 L 41 362 Q 43 350 62 343 49 335 49 328 L 46 326 42 325 M 193 444 L 191 441 194 444 193 444";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 744 146 Q 769 184 769 207 L 769 221 Q 782 225 782 241 L 768 264 766 267 Q 758 321 736 346 715 371 674 384 621 415 560 415 L 546 415 540 411 536 411 536 414 526 408 525 410 526 412 Q 493 407 461 393 L 449 387 448 387 448 388 438 397 412 403 Q 382 403 384 393 L 384 390 351 392 246 386 235 383 224 386 185 392 Q 134 392 90 375 49 361 49 346 L 50 334 46 326 45 320 37 311 38 304 28 282 Q 16 255 16 240 16 223 25 185 L 9 161 Q 9 147 35 127 49 116 57 116 L 69 112 Q 127 44 187 60 223 63 254 79 L 336 74 357 77 385 77 439 85 483 86 488 86 494 84 577 69 Q 645 58 692 81 730 99 730 120 L 730 126 744 146 M 462 51 Q 446 64 427 64 399 64 385 41 L 387 30 412 22 434 16 Q 475 19 475 33 L 462 51 M 461 104 L 462 106 464 104 461 104 M 267 49 Q 267 29 299 31 331 33 331 44 331 65 295 65 268 65 267 49 M 25 121 Q 15 121 0 99 0 86 22 92 43 97 43 109 43 121 25 121 M 270 409 L 261 406 248 406 229 414 228 412 210 415 204 415 Q 201 412 201 405 201 389 241 391 280 393 280 403 L 279 408 270 409";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 669 99 Q 713 99 713 120 713 128 702 136 687 147 658 147 652 147 638 135 L 625 120 Q 625 100 669 99 M 658 178 Q 658 194 646 206 627 224 585 224 L 499 211 Q 452 197 452 178 452 162 470 147 498 124 556 124 626 124 648 145 658 155 658 178 M 680 174 L 676 163 Q 676 152 702 147 727 142 727 163 L 725 176 Q 721 184 704 184 686 184 680 174 M 733 240 L 723 255 Q 707 269 677 269 653 269 643 261 637 256 637 251 637 223 685 222 733 221 733 240 M 541 122 L 470 111 Q 448 102 448 86 448 46 538 42 628 37 628 76 628 93 603 108 576 122 541 122 M 536 79 L 560 77 563 74 563 73 536 74 529 77 536 79 M 415 86 L 419 95 413 112 401 124 407 138 401 157 401 163 Q 401 173 391 177 L 380 179 361 191 379 194 Q 419 204 436 213 L 454 229 541 222 Q 556 227 559 233 L 560 243 Q 560 274 496 274 465 274 449 261 L 445 257 437 263 Q 411 280 353 280 298 280 281 257 274 247 274 225 274 206 309 197 276 194 251 178 226 163 226 153 L 230 137 Q 209 129 199 105 199 78 252 72 L 265 71 Q 267 53 312 48 358 42 358 60 L 340 80 Q 320 96 306 96 L 304 96 304 97 302 109 317 108 343 108 340 105 Q 340 82 380 80 L 382 80 Q 376 75 376 68 376 50 401 55 425 60 425 74 425 84 415 86 M 463 331 L 442 333 Q 405 333 388 320 376 312 376 302 376 282 438 275 493 269 499 292 515 280 533 281 592 279 633 304 664 324 664 339 664 355 624 370 L 548 383 Q 491 383 470 364 460 354 460 341 L 463 331 M 608 415 Q 601 412 601 405 601 394 653 377 704 361 704 390 704 417 657 417 L 608 415 M 214 212 Q 193 226 150 226 104 226 83 207 70 197 70 186 L 72 172 58 172 Q 25 172 13 153 7 145 7 133 7 119 54 120 96 121 100 146 L 149 141 Q 228 145 228 190 228 201 214 212 M 294 154 L 302 156 301 152 295 153 294 154 M 118 108 Q 80 108 61 90 L 49 72 Q 49 36 117 37 184 37 184 70 184 81 169 93 149 108 118 108 M 158 302 Q 169 311 169 324 169 340 160 347 144 358 96 358 59 358 38 339 25 326 25 317 25 283 97 287 L 99 287 79 276 73 262 Q 73 240 106 244 139 249 139 269 L 133 281 Q 127 288 117 289 L 142 295 136 285 Q 136 270 175 266 214 261 214 282 L 207 295 Q 198 306 182 306 L 158 302 M 105 329 L 108 330 112 327 105 327 105 329 M 162 410 Q 147 421 126 421 89 421 79 402 79 392 127 381 174 370 174 394 174 401 162 410 M 258 297 Q 239 297 229 279 L 222 261 Q 222 249 230 253 L 244 260 253 256 268 253 Q 281 253 286 265 L 289 277 281 288 Q 271 297 258 297 M 269 409 L 261 406 248 406 247 407 245 406 Q 207 393 207 377 207 339 296 327 384 314 384 351 384 370 366 386 344 408 301 412 L 301 411 295 406 283 407 280 406 280 407 269 409";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 731 -5 L 735 -5 Q 778 3 778 16 L 767 31 Q 753 43 731 43 705 43 696 31 L 691 18 Q 691 -2 710 -5 L 725 -4 731 -5 M 617 26 L 651 33 Q 700 45 700 55 700 65 685 76 661 92 614 92 564 92 539 76 524 65 524 54 524 45 549 33 559 28 570 26 L 584 27 582 30 588 27 600 27 617 26 M 502 21 L 502 22 Q 502 40 450 40 L 432 37 476 14 Q 478 18 489 20 L 502 21 M 370 93 L 381 91 Q 397 90 397 100 L 397 104 391 102 368 97 368 96 370 93 M 417 119 Q 434 109 468 110 535 110 535 136 535 150 515 160 L 479 171 475 172 457 172 Q 423 172 409 161 401 155 401 146 L 403 135 Q 406 125 417 119 M 368 69 L 334 72 306 61 Q 295 56 295 50 L 296 50 351 49 355 50 365 49 368 49 374 50 376 50 378 51 368 69 M 269 39 L 268 39 Q 246 54 217 54 184 54 170 45 163 40 163 35 163 26 168 19 L 189 37 191 39 192 39 197 43 197 44 213 49 217 49 218 49 224 48 230 47 232 46 262 36 268 34 269 39 M 50 14 Q 60 16 60 28 L 54 38 46 49 47 50 42 51 Q 14 51 12 31 12 23 21 19 L 23 19 50 14 M 300 18 L 304 15 306 15 315 24 324 29 300 25 298 21 300 18 M 727 76 Q 727 65 740 68 752 70 752 78 752 87 736 90 727 86 727 76 M 641 235 Q 583 235 570 215 563 205 568 194 568 171 648 170 727 169 727 198 727 210 704 222 678 235 641 235 M 629 131 Q 629 116 650 118 670 121 670 135 670 147 648 147 637 147 632 139 L 629 131 M 688 133 Q 688 110 718 112 748 115 748 128 L 745 142 Q 738 151 717 151 699 151 692 142 L 688 133 M 760 239 L 755 251 737 258 705 249 697 239 Q 697 226 728 226 752 226 758 233 L 760 239 M 536 90 L 526 100 Q 514 108 500 108 478 108 478 90 478 78 489 77 L 517 80 Q 536 80 536 90 M 439 75 Q 439 64 456 65 472 67 472 75 472 87 453 87 442 87 439 80 L 439 75 M 482 197 Q 554 204 554 231 554 241 535 253 513 266 483 266 439 266 421 252 409 244 409 232 409 190 482 197 M 590 127 Q 602 127 602 133 L 598 139 588 141 577 138 577 135 Q 577 127 590 127 M 547 179 Q 547 192 529 192 L 515 187 514 182 Q 514 170 531 169 547 169 547 179 M 520 283 Q 520 251 604 250 688 249 688 287 688 302 666 314 641 326 597 326 554 326 533 307 520 295 520 283 M 596 359 L 589 349 Q 589 334 616 338 643 342 643 352 643 364 624 364 L 598 360 604 365 598 367 592 364 592 359 596 359 M 471 330 Q 529 332 529 356 517 386 481 386 L 432 378 Q 412 371 412 361 412 328 471 330 M 420 304 Q 408 317 391 317 L 317 308 Q 297 301 297 290 297 258 364 253 430 248 430 288 L 420 304 M 490 300 L 485 312 Q 478 320 464 320 434 320 439 303 439 285 465 284 490 283 490 300 M 308 406 L 307 403 Q 307 386 379 386 451 384 451 411 L 450 421 430 424 Q 426 425 421 435 L 416 442 406 442 400 442 387 441 339 419 308 406 M 572 384 L 553 390 Q 535 390 535 380 535 374 558 370 580 366 580 375 L 572 384 M 578 415 L 577 413 Q 577 386 654 380 731 375 731 408 731 422 719 434 L 703 444 704 442 Q 694 432 689 432 683 431 671 439 L 617 442 628 451 622 450 609 446 585 421 578 415 M 676 449 L 671 450 662 452 652 452 642 452 676 449 M 785 329 Q 785 341 771 352 751 368 709 368 683 368 677 355 L 677 342 Q 677 309 731 308 785 307 785 329 M 784 384 L 762 399 742 383 Q 742 378 763 375 784 374 784 384 M 208 96 Q 208 63 268 73 327 83 327 100 327 108 294 116 L 259 122 Q 228 122 215 111 208 104 208 96 M 298 131 Q 355 128 355 149 L 341 166 Q 323 181 298 181 241 181 241 147 241 135 298 131 M 372 162 L 388 160 Q 406 160 407 171 407 179 390 179 364 179 370 168 L 372 162 M 364 214 Q 364 232 328 247 292 260 252 260 205 260 184 244 172 234 172 223 172 207 181 200 198 187 258 187 L 344 197 Q 364 204 364 214 M 148 24 L 140 32 132 35 Q 118 35 118 24 118 14 133 17 148 19 148 24 M 127 56 L 120 58 88 52 84 46 Q 84 38 109 39 133 40 133 49 L 127 56 M 121 76 Q 121 64 156 64 190 63 190 76 L 187 90 Q 180 97 156 97 134 97 125 87 L 121 76 M 186 116 Q 214 133 214 140 214 153 199 165 177 182 137 182 93 182 65 166 46 155 46 147 46 140 77 124 106 109 127 105 154 98 186 116 M 0 83 Q 0 65 49 66 97 68 97 83 97 90 70 104 43 119 31 114 L 11 99 0 83 M 16 194 Q 16 181 46 183 75 185 75 206 L 64 213 59 212 54 210 36 220 Q 25 220 16 194 M 73 227 Q 73 223 87 215 103 206 115 206 132 206 140 213 L 145 222 Q 145 230 135 234 L 100 237 Q 73 237 73 227 M 115 266 Q 115 249 145 245 175 242 175 258 175 280 151 280 L 118 276 Q 115 273 115 266 M 151 333 Q 151 295 228 295 304 295 304 330 304 342 287 352 266 365 232 365 188 365 166 352 151 343 151 333 M 10 329 Q 3 321 3 311 3 281 65 281 127 281 127 310 127 345 59 345 24 345 10 329 M 68 269 Q 49 269 49 261 49 244 68 238 87 232 87 255 L 85 264 68 269 M 122 425 L 109 422 96 417 77 409 52 396 46 391 44 390 40 384 Q 40 359 111 353 181 346 181 393 L 176 411 175 410 170 410 Q 149 410 135 421 L 131 424 122 425 M 220 409 L 217 402 Q 217 392 246 391 L 261 392 261 398 245 400 220 409 M 194 444 L 193 444 192 442 194 444 M 324 359 Q 324 348 352 347 379 346 379 360 379 370 367 370 L 330 368 Q 324 367 324 359 M 218 291 Q 208 291 193 278 229 250 229 280 229 291 218 291";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 24 -1 L 24 -6 56 -18 53 -20 Q 36 -31 17 -45 L 17 -50 Q 36 -61 75 -36 L 89 -27 111 -33 171 -45 181 -41 Q 192 -41 192 -50 L 183 -69 198 -68 204 -63 211 -51 220 -45 188 -35 169 -31 168 -31 172 -39 171 -43 167 -44 154 -27 142 -23 117 -24 72 -18 42 -10 Q 38 -2 26 -1 L 24 -1 M 180 -74 L 179 -75 179 -79 195 -73 180 -74 M 225 -38 L 225 -37 225 -36 221 -36 225 -38 M 223 -34 L 180 -21 173 -19 183 -23 200 -29 201 -29 223 -34 M 170 -18 L 164 -14 181 -2 214 25 258 3 321 -25 314 -37 315 -41 271 -41 275 -48 321 -48 319 -43 320 -43 320 -41 323 -19 287 -6 Q 252 8 252 13 L 253 17 254 17 244 22 Q 213 39 213 42 L 214 46 217 49 213 49 197 44 197 43 192 39 Q 197 39 206 46 L 210 45 194 26 172 7 152 -12 154 -13 170 -18 M 326 -38 L 334 -31 339 -25 342 -27 369 -38 352 -46 352 -50 365 -48 368 -45 376 -37 374 -37 372 -36 363 -31 Q 349 -21 337 -17 L 337 -26 330 -26 329 -24 326 -38 M 393 -42 L 427 -31 462 -17 468 -21 466 -23 475 -31 489 -39 475 -44 469 -46 456 -51 447 -61 453 -66 456 -67 452 -72 460 -68 464 -68 469 -63 470 -63 492 -55 493 -55 Q 499 -61 510 -51 L 556 -56 548 -51 552 -50 553 -47 552 -42 505 -45 505 -43 505 -42 502 -36 485 -5 524 -3 574 5 575 5 596 -13 626 -34 Q 602 -42 596 -45 L 629 -42 634 -40 632 -36 632 -35 629 -35 634 -31 Q 627 -29 627 -26 L 628 -25 612 -14 606 -11 584 5 576 8 570 5 488 5 488 4 402 -36 393 -42 M 656 -42 L 695 -62 700 -57 Q 700 -47 680 -34 L 675 -31 720 -16 720 -14 701 -19 672 -26 662 -29 663 -30 Q 663 -35 653 -34 L 652 -35 657 -42 656 -42 M 663 -21 L 633 3 628 7 631 8 634 15 Q 634 24 617 26 L 600 27 588 27 582 30 584 27 570 26 568 25 551 25 514 21 502 21 489 20 Q 478 18 476 14 L 432 37 401 51 400 52 393 63 370 93 368 96 368 97 391 102 397 104 400 107 398 111 417 118 417 119 Q 406 125 403 135 L 398 139 393 139 392 136 Q 392 133 398 128 L 403 120 381 112 367 108 357 106 354 105 Q 328 129 318 129 L 313 125 Q 313 120 336 107 L 342 97 353 94 357 93 356 89 368 69 378 51 376 50 374 50 368 49 365 49 355 50 351 49 296 50 295 50 290 45 Q 273 45 269 39 L 268 34 262 36 232 46 232 45 231 44 260 30 295 18 297 19 300 18 298 21 292 24 300 25 324 29 328 29 364 29 Q 370 19 397 4 L 420 -7 438 2 468 12 478 11 478 12 515 15 543 15 544 20 550 20 552 19 568 17 574 21 Q 572 25 577 25 L 591 17 626 -6 653 -23 656 -23 663 -21 M 128 -3 L 140 4 136 5 130 2 130 0 128 -3 M 370 -25 L 372 -29 373 -28 370 -25 M 405 15 L 404 17 406 16 405 15 M 475 424 L 489 417 490 418 486 422 475 424 M 487 413 Q 465 418 441 434 403 458 389 458 L 382 458 380 463 315 432 Q 315 422 295 415 L 261 406 248 406 229 414 255 402 Q 243 401 200 420 L 188 422 188 423 167 427 150 432 141 433 143 429 138 429 130 435 120 433 122 425 131 424 135 421 Q 149 410 170 410 L 175 410 176 411 177 412 190 415 220 409 245 400 261 398 261 392 261 389 Q 270 390 308 406 L 339 419 387 441 397 447 Q 397 442 400 442 L 411 444 416 442 421 435 Q 426 425 430 424 L 450 421 479 409 Q 483 407 487 413 M 428 447 L 434 443 446 438 428 447 M 454 472 L 463 463 463 464 454 473 454 472 M 462 475 L 460 478 459 477 462 475 M 503 480 L 503 479 512 469 503 480 M 578 415 L 585 421 609 446 622 450 631 457 632 458 614 458 Q 583 428 566 428 552 418 539 413 L 528 399 Q 531 394 539 394 L 537 387 Q 553 392 578 415 M 628 451 L 617 442 671 439 Q 683 431 689 432 694 432 704 442 L 703 444 700 447 676 449 642 452 637 452 628 451 M 561 472 L 561 473 560 473 561 472 M 638 464 L 639 464 641 466 635 465 638 464 M 679 489 L 678 489 679 489 M 651 476 L 648 477 642 477 651 476 M 618 476 L 617 476 615 474 618 476 M 730 478 L 732 476 734 475 730 478 M 46 399 L 46 403 44 402 43 403 40 400 46 399 M 8 426 L 12 430 8 426 M 12 441 L 16 445 13 449 10 445 12 441 M 93 481 L 92 481 92 479 94 481 93 481 M 90 477 L 87 473 88 473 91 477 90 477 M 134 450 L 133 455 129 455 129 454 134 450 M 125 448 L 126 449 125 449 124 449 124 448 125 448 M 176 471 L 176 472 167 482 166 482 176 471 M 234 422 L 238 419 233 420 252 414 253 414 247 417 234 422 M 238 471 L 229 484 227 485 238 471 M 247 461 L 241 468 243 464 245 462 247 461 M 337 483 L 336 482 338 482 337 483 M 637 523 L 636 529 635 529 633 516 637 523 M 614 524 L 615 525 616 528 614 527 614 524 M 624 521 L 627 519 630 530 629 530 625 530 624 521";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 24 -1 L 26 -1 Q 38 -2 42 -10 L 72 -18 117 -24 142 -23 154 -27 167 -44 171 -43 172 -39 168 -31 169 -31 188 -35 220 -45 204 -63 198 -68 183 -69 173 -70 172 -73 175 -79 174 -73 180 -74 195 -73 214 -63 Q 229 -50 229 -41 L 225 -38 221 -36 225 -36 226 -36 223 -34 201 -29 200 -29 183 -23 173 -19 170 -18 154 -13 152 -12 172 7 194 26 210 45 206 46 Q 197 39 192 39 L 191 39 189 37 168 19 166 17 138 -8 135 -7 128 -5 126 -5 128 -3 130 0 130 2 124 5 84 10 54 13 50 14 23 19 21 19 Q 15 18 17 14 L 17 13 19 11 16 4 24 -1 M 320 -43 L 325 -43 326 -38 329 -24 330 -26 337 -26 337 -17 Q 349 -21 363 -31 L 372 -36 374 -37 376 -37 368 -45 365 -48 360 -59 363 -64 361 -68 361 -75 376 -75 401 -87 403 -88 387 -98 387 -104 388 -104 Q 390 -99 399 -93 L 407 -83 402 -83 387 -75 368 -69 393 -42 402 -36 488 4 488 5 570 5 576 8 584 5 606 -11 612 -14 628 -25 627 -26 Q 627 -29 634 -31 L 629 -35 632 -35 632 -36 634 -40 629 -42 617 -49 Q 608 -55 608 -59 L 609 -66 615 -80 616 -90 622 -91 651 -88 651 -85 646 -84 625 -86 621 -88 616 -59 624 -59 631 -58 632 -53 629 -50 636 -48 641 -50 656 -42 657 -42 652 -35 653 -34 Q 663 -35 663 -30 L 662 -29 672 -26 701 -19 720 -14 731 -10 731 -5 725 -4 710 -5 689 -11 668 -20 663 -21 656 -23 653 -23 626 -6 591 17 577 25 Q 572 25 574 21 L 568 17 552 19 550 20 544 20 543 15 515 15 478 12 478 11 468 12 438 2 420 -7 413 -11 Q 381 -21 373 -28 L 372 -29 370 -25 370 -24 331 0 334 3 306 15 304 15 300 18 297 19 295 18 260 30 231 44 232 45 232 46 230 47 224 48 218 49 217 49 214 46 213 42 Q 213 39 244 22 L 254 17 253 17 252 13 Q 252 8 287 -6 L 323 -19 320 -41 320 -43 M 489 417 L 475 424 446 438 434 443 428 447 406 458 407 461 402 466 391 468 394 478 382 485 369 480 365 475 Q 351 478 343 488 L 321 503 332 511 332 513 324 514 Q 320 514 317 508 L 315 502 Q 315 498 318 497 L 324 497 333 490 Q 339 483 345 483 345 467 364 467 L 378 475 381 470 380 464 380 463 382 458 389 458 Q 403 458 441 434 465 418 487 413 L 512 409 497 413 489 417 M 614 458 L 616 460 614 462 624 465 625 466 625 468 Q 637 475 637 485 L 618 498 597 514 595 515 592 510 610 495 627 481 Q 627 475 604 464 L 584 452 571 449 571 448 573 447 581 448 576 442 530 410 532 410 539 413 Q 552 418 566 428 583 428 614 458 M 124 449 L 115 457 115 458 120 453 126 457 125 461 130 468 135 478 132 483 113 479 Q 103 494 63 513 L 82 517 96 525 95 527 53 513 Q 74 498 90 492 L 102 481 Q 108 473 113 473 L 122 477 129 477 121 466 116 464 108 458 Q 108 453 118 445 L 119 443 88 426 88 422 91 422 Q 97 422 107 429 L 130 435 138 429 143 429 141 433 139 435 147 433 150 432 167 427 188 423 196 422 200 420 Q 243 401 255 402 L 229 414 204 424 191 428 233 420 238 419 234 422 191 434 148 440 161 441 160 442 142 442 161 446 155 448 142 446 134 444 134 445 137 445 135 447 126 447 125 448 124 448 124 449";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj409=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/409.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj409,"assets/takeover/art/images/409.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj409.src="assets/takeover/art/images/409.png";
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

function shape3737(ctx,ctrans,frame,ratio,time){
	var pathData="M 42 -17 Q 56 -30 71 -26 L 108 -18 118 -23 163 -34 165 -39 155 -44 145 -51 145 -56 148 -56 150 -51 172 -50 175 -36 164 -24 185 -19 246 -25 259 -23 Q 267 -20 270 -20 L 280 -24 284 -26 280 -37 282 -42 280 -44 282 -58 286 -58 296 -47 334 -47 351 -27 342 -17 314 -12 302 -13 291 -5 286 -2 286 -1 284 5 299 4 298 2 Q 298 -7 316 -7 332 -7 334 1 L 368 -3 405 -3 421 -5 436 -9 490 -6 502 3 563 3 568 7 601 2 609 -1 607 -4 Q 607 -9 626 -14 L 638 -17 645 -26 657 -35 647 -39 Q 626 -46 626 -55 626 -59 637 -63 L 638 -61 634 -59 631 -55 632 -49 654 -49 Q 667 -49 676 -40 L 680 -36 704 -25 708 -24 735 -24 741 -23 Q 778 -15 778 -3 L 767 12 741 24 749 37 Q 760 59 760 74 760 102 749 135 769 168 769 188 L 769 202 Q 782 206 782 222 L 768 245 766 248 757 289 757 290 Q 785 293 785 310 785 322 771 333 L 769 335 774 356 784 365 777 372 781 403 779 409 754 441 734 458 737 475 729 488 706 500 716 501 719 502 722 506 703 506 700 497 Q 700 488 721 476 L 713 468 662 472 650 476 653 488 647 500 622 509 616 503 634 484 604 481 574 472 567 470 541 463 494 453 487 451 477 459 476 460 479 467 478 472 472 473 Q 460 473 458 468 L 446 472 457 486 448 495 415 484 393 484 388 478 Q 388 473 394 470 L 384 466 366 465 364 462 365 460 363 460 355 466 345 468 Q 359 481 355 495 L 355 497 370 493 Q 372 490 375 490 L 395 504 385 511 Q 379 511 376 506 L 358 509 343 508 Q 351 492 333 479 L 331 478 331 482 330 491 328 492 324 480 322 473 296 462 276 457 251 462 243 463 226 472 219 483 Q 212 491 205 491 L 201 489 Q 201 487 198 487 L 193 488 187 490 178 490 172 484 Q 189 479 211 466 L 177 465 153 475 Q 130 482 130 484 L 124 493 145 491 129 500 109 508 105 503 106 500 87 500 65 495 64 488 Q 64 471 93 472 L 105 473 95 459 60 459 Q 43 455 43 436 L 39 431 21 425 Q 16 422 16 415 16 406 22 390 L 25 382 24 358 28 321 10 310 Q 3 302 3 292 3 273 30 266 L 28 263 Q 16 236 16 221 L 21 187 16 175 Q 16 168 25 166 L 9 142 Q 9 137 12 133 7 125 7 114 7 102 42 101 L 41 97 25 102 Q 15 102 0 80 0 74 4 73 L 0 64 Q 0 51 27 48 L 25 37 28 30 Q 13 26 12 12 12 4 23 -1 L 42 -17 M 452 -49 Q 466 -47 466 -38 L 464 -31 453 -29 439 -30 437 -39 Q 437 -50 452 -49 M 490 -56 L 487 -60 496 -71 Q 506 -80 512 -81 L 508 -75 502 -63 512 -56 527 -59 Q 539 -59 542 -51 577 -56 577 -25 L 577 -23 568 -11 Q 559 -4 544 -4 515 -4 507 -23 L 506 -25 497 -31 487 -42 490 -46 493 -51 490 -56 M 539 56 L 537 55 536 55 529 58 539 56 M 513 24 L 500 24 493 20 486 18 473 20 462 32 Q 446 45 427 45 L 420 45 425 55 424 62 439 66 444 67 439 61 439 56 Q 439 45 456 46 471 30 515 25 L 513 24 M 505 475 L 547 481 550 490 547 499 519 504 Q 506 504 499 497 L 494 488 Q 494 482 505 475 M 759 357 L 755 343 731 348 746 360 759 357 M 379 58 L 376 49 376 48 352 52 346 57 357 58 379 58 M 77 81 L 70 85 54 93 56 97 57 97 69 93 79 83 77 81 M 46 326 L 42 325 41 362 Q 43 350 62 343 49 335 49 328 L 46 326 M 272 472 L 306 467 307 476 303 487 286 495 265 495 256 484 Q 256 478 272 472";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 744 146 Q 769 184 769 207 L 769 221 Q 782 225 782 241 L 768 264 766 267 Q 758 321 736 346 715 371 674 384 621 415 560 415 509 415 461 393 L 449 387 448 387 448 388 438 397 412 403 Q 382 403 384 393 L 384 390 351 392 246 386 235 383 224 386 185 392 Q 134 392 90 375 49 361 49 346 L 50 334 46 326 45 320 37 311 38 304 28 282 Q 16 255 16 240 16 223 25 185 L 9 161 Q 9 147 35 127 49 116 57 116 L 69 112 Q 127 44 187 60 223 63 254 79 L 336 74 357 77 385 77 439 85 483 86 488 86 494 84 577 69 Q 645 58 692 81 730 99 730 120 L 730 126 744 146 M 461 104 L 462 106 464 104 461 104";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 462 51 Q 446 64 427 64 399 64 385 41 385 11 430 15 475 18 475 33 L 462 51 M 299 31 Q 331 33 331 44 331 65 295 65 268 65 267 49 267 29 299 31 M 25 121 Q 15 121 0 99 0 86 22 92 43 97 43 109 43 121 25 121 M 270 415 Q 258 424 238 424 212 424 204 415 201 412 201 405 201 389 241 391 280 393 280 403 L 270 415";
	ctx.fillStyle=tocolor(ctrans.apply([155,128,104,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 669 99 Q 713 99 713 120 713 128 702 136 687 147 658 147 652 147 638 135 L 625 120 Q 625 100 669 99 M 676 163 Q 676 152 702 147 727 142 727 163 L 725 176 Q 721 184 704 184 686 184 680 174 L 676 163 M 658 178 Q 658 194 646 206 627 224 585 224 L 499 211 Q 452 197 452 178 452 162 470 147 498 124 556 124 626 124 648 145 658 155 658 178 M 733 240 L 723 255 Q 707 269 677 269 653 269 643 261 637 256 637 251 637 223 685 222 733 221 733 240 M 529 77 L 536 79 560 77 563 74 563 73 536 74 529 77 M 541 122 L 470 111 Q 448 102 448 86 448 46 538 42 628 37 628 76 628 93 603 108 576 122 541 122 M 415 86 L 419 95 413 112 401 124 407 138 401 157 401 163 Q 401 173 391 177 L 380 179 361 191 379 194 Q 419 204 436 213 L 454 229 541 222 Q 556 227 559 233 L 560 243 Q 560 274 496 274 465 274 449 261 L 445 257 437 263 Q 411 280 353 280 298 280 281 257 274 247 274 225 274 206 309 197 276 194 251 178 226 163 226 153 L 230 137 Q 209 129 199 105 199 78 252 72 L 265 71 Q 267 53 312 48 358 42 358 60 L 340 80 Q 320 96 306 96 L 304 96 304 97 302 109 317 108 343 108 340 105 Q 340 82 380 80 L 382 80 Q 376 75 376 68 376 50 401 55 425 60 425 74 425 84 415 86 M 460 341 L 463 331 442 333 Q 405 333 388 320 376 312 376 302 376 282 438 275 493 269 499 292 515 280 533 281 592 279 633 304 664 324 664 339 664 355 624 370 L 548 383 Q 491 383 470 364 460 354 460 341 M 608 415 Q 601 412 601 405 601 394 653 377 704 361 704 390 704 417 657 417 L 608 415 M 214 212 Q 193 226 150 226 104 226 83 207 70 197 70 186 L 72 172 58 172 Q 25 172 13 153 7 145 7 133 7 119 54 120 96 121 100 146 L 149 141 Q 228 145 228 190 228 201 214 212 M 295 153 L 294 154 302 156 301 152 295 153 M 184 70 Q 184 81 169 93 149 108 118 108 80 108 61 90 L 49 72 Q 49 36 117 37 184 37 184 70 M 158 302 Q 169 311 169 324 169 340 160 347 144 358 96 358 59 358 38 339 25 326 25 317 25 283 97 287 L 99 287 79 276 73 262 Q 73 240 106 244 139 249 139 269 L 133 281 Q 127 288 117 289 L 142 295 136 285 Q 136 270 175 266 214 261 214 282 L 207 295 Q 198 306 182 306 L 158 302 M 105 327 L 105 329 108 330 112 327 105 327 M 162 410 Q 147 421 126 421 89 421 79 402 79 392 127 381 174 370 174 394 174 401 162 410 M 286 265 L 289 277 281 288 Q 271 297 258 297 239 297 229 279 L 222 261 Q 222 249 230 253 L 244 260 253 256 268 253 Q 281 253 286 265 M 245 406 Q 207 393 207 377 207 339 296 327 384 314 384 351 384 370 366 386 339 412 283 412 283 419 245 406";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 767 31 Q 753 43 731 43 705 43 696 31 L 691 18 Q 691 -12 735 -5 778 3 778 16 L 767 31 M 740 68 Q 752 70 752 78 752 87 736 90 727 86 727 76 727 65 740 68 M 614 92 Q 564 92 539 76 524 65 524 54 524 45 549 33 575 21 601 21 L 601 23 651 33 Q 700 45 700 55 700 65 685 76 661 92 614 92 M 641 235 Q 583 235 570 215 563 205 568 194 568 171 648 170 727 169 727 198 727 210 704 222 678 235 641 235 M 648 147 Q 637 147 632 139 L 629 131 Q 629 116 650 118 670 121 670 135 670 147 648 147 M 688 133 Q 688 110 718 112 748 115 748 128 L 745 142 Q 738 151 717 151 699 151 692 142 L 688 133 M 758 233 L 760 239 755 251 737 258 705 249 697 239 Q 697 226 728 226 752 226 758 233 M 526 100 Q 514 108 500 108 478 108 478 90 478 78 489 77 L 517 80 Q 536 80 536 90 L 526 100 M 502 22 Q 502 40 450 40 425 40 419 20 419 10 436 10 L 490 13 502 22 M 439 75 Q 439 64 456 65 472 67 472 75 472 87 453 87 442 87 439 80 L 439 75 M 475 172 L 457 172 Q 423 172 409 161 401 155 401 146 401 109 468 110 535 110 535 136 535 150 515 160 L 479 171 475 172 M 482 197 Q 554 204 554 231 554 241 535 253 513 266 483 266 439 266 421 252 409 244 409 232 409 190 482 197 M 602 133 L 598 139 588 141 577 138 577 135 Q 577 127 590 127 602 127 602 133 M 547 179 Q 547 192 529 192 L 515 187 514 182 Q 514 170 531 169 547 169 547 179 M 520 283 Q 520 251 604 250 688 249 688 287 688 302 666 314 641 326 597 326 554 326 533 307 520 295 520 283 M 596 359 L 589 349 Q 589 334 616 338 643 342 643 352 643 364 624 364 L 598 360 604 365 598 367 592 364 592 359 596 359 M 471 330 Q 529 332 529 356 517 386 481 386 L 432 378 Q 412 371 412 361 412 328 471 330 M 420 304 Q 408 317 391 317 L 317 308 Q 297 301 297 290 297 258 364 253 430 248 430 288 L 420 304 M 485 312 Q 478 320 464 320 434 320 439 303 439 285 465 284 490 283 490 300 L 485 312 M 485 428 Q 485 415 511 416 536 418 536 430 L 529 438 512 441 Q 495 441 488 434 L 485 428 M 406 442 Q 367 442 335 427 307 414 307 403 307 386 379 386 451 384 451 411 451 442 406 442 M 577 413 Q 577 386 654 380 731 375 731 408 731 422 719 434 700 452 652 452 606 452 587 432 L 577 413 M 553 390 Q 535 390 535 380 535 374 558 370 580 366 580 375 L 572 384 553 390 M 785 329 Q 785 341 771 352 751 368 709 368 683 368 677 355 L 677 342 Q 677 309 731 308 785 307 785 329 M 742 383 Q 742 378 763 375 784 374 784 384 L 762 399 742 383 M 334 21 Q 334 31 318 31 L 302 27 298 21 Q 298 12 316 12 334 12 334 21 M 383 112 Q 364 112 364 100 364 92 381 91 397 90 397 100 397 112 383 112 M 334 72 L 306 61 Q 295 56 295 49 295 35 331 35 400 35 400 52 L 391 63 334 72 M 268 73 Q 327 83 327 100 327 108 294 116 L 259 122 Q 228 122 215 111 208 104 208 96 208 63 268 73 M 217 54 Q 184 54 170 45 163 40 163 35 163 1 225 1 286 -1 286 18 L 268 39 Q 246 54 217 54 M 241 147 Q 241 135 298 131 355 128 355 149 L 341 166 Q 323 181 298 181 241 181 241 147 M 364 214 Q 364 232 328 247 292 260 252 260 205 260 184 244 172 234 172 223 172 207 181 200 198 187 258 187 L 344 197 Q 364 204 364 214 M 372 162 L 388 160 Q 406 160 407 171 407 179 390 179 364 179 370 168 L 372 162 M 127 56 L 120 58 88 52 84 46 Q 84 38 109 39 133 40 133 49 L 127 56 M 118 24 Q 118 14 133 17 148 19 148 24 L 140 32 132 35 Q 118 35 118 24 M 121 76 Q 121 64 156 64 190 63 190 76 L 187 90 Q 180 97 156 97 134 97 125 87 L 121 76 M 186 116 Q 214 133 214 140 214 153 199 165 177 182 137 182 93 182 65 166 46 155 46 147 46 140 77 124 106 109 127 105 154 98 186 116 M 54 38 L 46 49 47 50 42 51 Q 14 51 12 31 12 18 36 14 60 10 60 28 L 54 38 M 0 83 Q 0 65 49 66 97 68 97 83 97 90 70 104 43 119 31 114 L 11 99 0 83 M 16 194 Q 16 181 46 183 75 185 75 206 L 64 213 59 212 54 210 36 220 Q 25 220 16 194 M 73 227 Q 73 223 87 215 103 206 115 206 132 206 140 213 L 145 222 Q 145 230 135 234 L 100 237 Q 73 237 73 227 M 151 333 Q 151 295 228 295 304 295 304 330 304 342 287 352 266 365 232 365 188 365 166 352 151 343 151 333 M 118 276 Q 115 273 115 266 115 249 145 245 175 242 175 258 175 280 151 280 L 118 276 M 85 264 L 68 269 Q 49 269 49 261 49 244 68 238 87 232 87 255 L 85 264 M 3 311 Q 3 281 65 281 127 281 127 310 127 345 59 345 24 345 10 329 3 321 3 311 M 40 384 Q 40 359 111 353 181 346 181 393 L 175 412 Q 164 427 140 427 117 427 77 409 40 391 40 384 M 63 447 L 61 449 62 450 57 451 Q 40 451 43 441 43 432 50 434 58 435 63 447 M 324 359 Q 324 348 352 347 379 346 379 360 379 370 367 370 L 330 368 Q 324 367 324 359 M 218 291 Q 208 291 193 278 229 250 229 280 229 291 218 291 M 222 446 L 208 449 Q 186 449 192 441 192 435 209 434 226 431 226 440 L 222 446 M 250 415 Q 217 415 217 402 217 392 246 391 274 390 274 403 L 271 411 250 415";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 99 -8 Q 97 -9 97 -9 L 87 -10 77 -12 61 -15 37 0 20 13 13 12 12 9 Q 12 3 66 -31 L 93 -23 104 -18 129 -27 168 -36 170 -33 167 -29 168 -25 174 -24 218 -34 218 -38 224 -38 233 -36 247 -33 268 -20 280 -28 280 -40 279 -51 Q 279 -61 284 -61 L 288 -55 Q 289 -50 308 -51 L 328 -46 344 -38 350 -26 Q 350 -19 343 -19 339 -19 337 -22 L 320 -13 306 -11 293 -6 286 1 295 3 299 0 307 -4 310 -7 Q 318 -12 320 -7 L 359 -2 374 -5 399 -8 421 -4 445 -9 478 -9 503 3 513 1 548 1 576 7 609 1 605 -4 638 -17 651 -27 Q 652 -34 660 -37 L 665 -37 666 -34 649 -14 Q 631 -1 619 -2 L 620 0 602 11 576 17 546 11 513 11 502 13 486 8 476 1 446 1 421 6 407 4 398 2 376 5 359 8 339 5 320 1 316 2 298 13 Q 279 13 279 5 L 280 3 279 0 282 -8 294 -14 285 -17 277 -14 277 -10 274 -9 262 -14 245 -20 209 -17 210 -14 Q 210 -8 200 -8 L 171 -15 157 -21 132 -18 112 -12 106 -7 101 -8 99 -8 M 296 -23 L 316 -22 326 -23 331 -31 331 -34 312 -36 295 -40 296 -23 M 497 -69 Q 502 -75 510 -60 L 561 -48 574 -44 578 -40 578 -31 575 -30 571 -35 558 -38 544 -39 539 -46 510 -51 Q 505 -51 504 -54 L 502 -60 500 -60 498 -35 493 -35 492 -50 Q 492 -64 497 -69 M 633 -46 L 649 -53 658 -53 Q 671 -53 688 -39 705 -26 716 -26 L 751 -29 Q 764 -29 779 -4 L 773 2 756 -13 742 -13 738 -11 729 -11 709 -18 686 -24 671 -34 660 -44 651 -44 648 -42 634 -42 633 -46";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function shape3738(ctx,ctrans,frame,ratio,time){
	var pathData="M 151 -13 L 181 -21 195 -12 Q 216 2 238 2 L 254 2 300 7 354 -1 Q 381 -9 389 -14 L 427 -9 507 -20 511 -21 566 -21 571 -18 582 -21 603 -20 Q 662 -20 698 -51 L 707 -47 711 -46 739 -46 745 -45 Q 782 -37 782 -27 L 771 -14 Q 760 -6 745 -3 L 753 9 Q 763 28 763 42 763 66 752 95 771 124 771 142 L 771 155 Q 784 158 784 172 784 182 770 193 L 767 196 758 233 Q 786 235 786 250 786 262 772 271 L 770 273 774 292 Q 784 294 784 299 L 777 306 781 333 779 339 753 367 745 375 722 372 Q 676 374 639 391 624 396 616 404 L 602 403 572 394 565 392 563 392 Q 555 381 534 375 L 410 366 Q 375 369 354 390 L 352 390 342 391 346 395 320 399 318 395 292 386 286 385 247 376 Q 195 376 149 394 L 133 402 125 406 125 407 Q 120 408 116 412 L 80 414 72 419 59 415 58 408 Q 58 393 88 394 L 100 395 90 383 54 383 Q 38 379 38 362 L 35 359 16 353 Q 11 350 11 344 L 17 322 20 314 19 294 25 261 6 250 Q -1 244 -1 234 -1 218 27 212 L 25 209 Q 13 185 13 171 L 18 141 13 131 Q 13 124 22 123 L 7 102 10 93 Q 5 87 5 77 5 68 28 66 L 24 66 Q 13 66 -2 46 L 2 41 -2 32 Q -1 21 27 18 L 25 9 28 2 Q 12 -1 11 -14 11 -21 22 -25 L 35 -33 51 -19 Q 73 -3 103 -3 L 114 -5 149 -12 151 -13 M 495 -6 L 488 -8 475 -6 464 4 Q 447 15 429 15 L 422 15 427 25 425 30 440 34 444 35 440 30 441 26 Q 441 15 458 16 473 2 518 -2 L 516 -3 503 -3 495 -6 M 539 25 L 538 25 531 27 541 26 539 25 M 731 284 L 746 296 759 293 755 280 731 284 M 359 27 L 380 27 377 19 377 18 354 22 348 26 359 27 M 68 51 L 52 58 54 61 55 61 67 58 78 49 75 47 68 51 M 41 65 L 40 61 31 66 41 65 M 37 297 Q 39 286 57 280 46 273 46 266 L 43 265 39 265 37 297";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 35 -33 L 27 -41 48 -32 49 -31 Q 71 -17 116 -17 146 -17 172 -31 L 175 -30 177 -26 170 -24 151 -13 149 -12 114 -5 103 -3 Q 73 -3 51 -19 L 35 -33";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 781 170 L 781 183 Q 794 186 793 201 793 209 779 220 L 777 223 Q 769 271 746 294 725 315 684 328 630 355 569 355 518 355 469 335 L 457 329 456 329 456 330 Q 456 334 445 339 L 420 344 Q 389 344 391 335 L 391 332 359 334 253 328 242 327 230 328 192 334 Q 140 334 96 319 54 307 54 294 L 55 282 52 276 51 270 44 263 45 256 35 236 Q 22 213 22 200 24 185 33 151 L 16 129 Q 16 117 44 99 57 90 65 90 L 78 86 Q 137 26 197 40 232 42 264 57 L 347 52 367 55 396 55 450 61 494 62 499 62 506 61 589 47 Q 657 38 704 58 743 74 743 93 L 743 98 756 116 Q 781 150 781 170 M 473 31 Q 457 43 438 43 410 43 397 23 397 -4 442 -1 487 2 487 15 L 473 31 M 473 80 L 475 78 472 78 473 80 M 277 30 Q 278 12 310 14 343 15 343 26 342 44 305 44 278 44 277 30 M 8 74 Q 8 62 31 68 51 73 51 83 51 93 34 93 24 93 8 74 M 244 362 L 210 355 Q 207 352 207 345 207 331 248 333 286 335 286 344 L 277 355 244 362";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 715 107 Q 698 117 670 117 L 650 106 637 93 Q 637 75 682 74 726 74 726 93 726 100 715 107 M 615 82 Q 588 94 552 94 L 481 85 Q 459 77 459 62 460 27 550 24 641 19 640 54 640 69 615 82 M 687 131 Q 687 122 714 117 739 112 739 131 L 737 142 Q 733 150 716 150 697 150 691 140 L 687 131 M 653 218 L 647 209 Q 648 185 696 184 745 183 744 200 L 734 213 Q 718 225 687 225 L 653 218 M 657 169 Q 638 185 596 185 L 510 173 Q 462 161 462 144 462 130 480 117 510 96 568 96 638 96 659 115 670 124 670 144 670 158 657 169 M 547 57 L 572 55 575 52 575 51 547 52 540 55 547 57 M 426 62 L 430 71 424 86 412 96 418 108 411 125 411 131 Q 411 140 401 143 L 389 145 370 156 388 158 445 175 464 189 551 184 Q 567 187 570 193 L 570 202 Q 570 230 506 230 474 230 458 218 L 454 215 445 219 Q 420 234 362 234 312 234 293 219 L 294 221 297 233 289 242 Q 279 250 266 250 247 250 237 234 L 229 218 Q 229 207 238 211 L 252 217 261 214 276 211 289 215 Q 282 205 283 186 283 169 318 161 285 158 260 144 234 131 234 122 234 114 240 108 218 101 208 79 208 56 262 50 L 275 49 Q 277 33 322 29 369 24 368 40 L 351 58 Q 330 72 316 72 L 314 72 314 73 312 83 327 82 354 82 351 79 Q 351 59 390 58 L 392 58 Q 386 53 386 46 386 30 412 35 436 40 436 52 436 61 426 62 M 542 235 Q 602 234 643 256 675 274 674 287 674 301 633 314 596 327 557 327 499 327 478 310 468 300 468 289 468 285 471 280 L 450 281 Q 413 281 397 270 384 264 384 254 384 236 446 231 503 225 509 246 525 234 542 235 M 714 332 Q 714 357 667 357 L 617 355 Q 610 352 610 345 610 336 663 321 714 307 714 332 M 304 122 L 303 123 311 124 310 122 304 122 M 222 174 Q 202 187 158 187 112 187 91 170 78 161 78 152 L 80 139 65 139 Q 33 139 20 122 14 115 15 105 15 92 62 93 105 93 108 116 L 157 111 Q 237 115 237 155 237 165 222 174 M 178 69 Q 158 82 126 82 89 82 69 66 L 57 50 Q 58 18 126 19 195 19 194 48 194 58 178 69 M 80 218 Q 80 200 113 203 146 207 146 225 L 140 235 Q 134 242 124 243 L 149 249 143 239 Q 143 226 183 222 221 218 221 236 L 214 249 Q 206 258 190 258 L 165 254 Q 176 263 176 274 175 288 166 295 L 102 304 Q 64 304 44 287 32 276 32 267 32 237 104 241 L 106 241 Q 93 238 86 232 L 80 218 M 112 277 L 111 279 114 280 119 277 112 277 M 168 350 Q 152 360 131 360 94 360 85 344 85 334 133 325 180 314 180 336 180 343 168 350 M 304 277 Q 392 265 391 297 391 314 373 328 347 352 290 352 290 359 252 346 213 335 213 321 213 287 304 277";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 30 -35 L 29 -36 32 -38 34 -37 34 -38 27 -46 Q 27 -51 35 -49 36 -41 43 -35 L 30 -35 M 530 -36 L 576 -24 589 -23 653 -33 680 -42 684 -43 695 -51 751 -48 Q 762 -49 779 -37 L 795 -22 790 -17 Q 785 -17 780 -22 L 776 -29 749 -37 724 -41 719 -42 719 -41 Q 719 -35 673 -24 L 623 -15 618 -18 Q 580 -7 552 -24 L 530 -36 M 612 5 L 614 5 614 7 665 15 Q 714 26 712 35 712 44 697 54 674 68 626 68 576 68 550 54 535 44 535 34 536 26 562 15 L 566 14 605 21 Q 616 21 616 13 L 612 5 M 500 18 L 462 22 459 22 473 18 500 18 M 426 -3 L 413 -7 392 -14 383 -9 377 -10 364 -7 340 -1 261 7 256 7 294 -4 299 -4 360 -12 365 -14 400 -15 Q 409 -15 421 -6 423 -5 426 -3 M 363 18 Q 412 20 411 32 L 402 42 345 50 316 41 309 36 306 32 305 30 306 27 361 18 363 18 M 266 28 L 226 34 Q 194 34 180 26 L 173 17 176 6 210 15 266 28 M 150 2 L 158 8 150 14 142 17 Q 127 17 127 8 L 128 6 143 2 150 2 M 95 30 L 94 27 Q 94 20 119 21 143 22 142 30 L 136 36 128 38 122 38 117 34 95 30 M 58 26 L 54 30 55 30 50 31 Q 22 31 21 14 21 2 46 -1 L 50 -1 54 1 69 9 69 11 68 12 58 26 M 105 -5 L 95 -5 92 -6 85 -6 78 -6 77 -7 56 -14 113 -6 105 -5 M 135 -10 L 149 -18 164 -26 166 -26 172 -29 177 -30 Q 177 -30 179 -29 L 196 -11 198 -9 189 -12 180 -17 172 -14 164 -15 135 -10 M 476 -2 L 492 -11 516 -25 541 -12 521 -9 497 -2 476 -2 M 781 14 Q 767 25 745 25 719 25 709 14 704 9 704 2 704 -24 749 -18 792 -11 792 0 L 781 14 M 753 46 Q 764 48 764 56 764 63 749 66 740 62 740 54 740 44 753 46 M 729 121 Q 710 121 703 112 L 700 105 Q 700 84 731 86 761 89 761 100 L 757 112 Q 750 121 729 121 M 610 109 L 599 111 589 108 589 106 Q 589 99 602 99 614 99 614 105 L 610 109 M 641 103 Q 641 90 663 91 683 93 683 106 682 117 659 117 648 117 644 109 L 641 103 M 698 241 Q 698 254 677 265 L 606 276 Q 564 276 542 259 529 249 529 237 529 209 614 208 698 207 698 241 M 771 199 L 765 209 Q 760 216 748 216 728 216 716 207 L 707 199 Q 708 187 740 187 763 187 770 193 L 771 199 M 716 184 L 651 195 Q 593 195 581 177 574 169 579 158 579 138 659 137 739 137 739 162 739 172 716 184 M 512 82 Q 489 82 489 66 489 56 500 55 L 528 58 Q 547 58 547 66 L 537 75 Q 525 82 512 82 M 483 53 Q 483 63 464 63 L 450 58 450 53 Q 450 43 467 44 483 46 483 53 M 479 84 Q 546 84 546 107 545 120 525 128 L 489 138 485 139 467 139 419 129 Q 411 124 411 116 412 83 479 84 M 419 192 Q 419 155 492 161 565 168 565 191 564 201 544 211 523 222 492 222 447 222 430 210 418 203 419 192 M 558 145 Q 558 156 539 156 L 525 153 525 148 Q 525 137 541 137 558 137 558 145 M 598 296 Q 598 282 625 286 652 290 652 298 652 310 633 310 L 606 306 613 311 606 312 601 310 601 305 604 305 598 296 M 88 419 L 68 417 67 414 78 413 73 410 117 399 156 389 167 384 Q 188 375 194 375 L 251 365 277 365 316 378 325 388 346 380 364 373 342 365 Q 314 354 314 344 314 328 386 328 459 328 459 351 L 459 354 476 354 484 353 504 353 515 356 520 356 541 362 577 372 610 379 595 370 586 353 Q 586 328 664 324 741 319 741 348 L 734 365 Q 753 366 753 373 L 746 377 737 377 728 380 724 381 730 373 688 381 611 391 609 391 597 388 601 391 549 386 537 382 479 364 460 365 390 378 363 386 350 391 337 401 334 402 326 407 325 405 328 401 316 389 301 376 259 376 251 376 235 376 Q 187 381 141 401 L 88 419 M 581 328 L 562 332 Q 543 332 543 324 543 318 567 314 589 312 589 319 L 581 328 M 473 270 Q 443 270 447 255 447 239 474 238 499 237 499 252 L 494 264 Q 487 270 473 270 M 440 322 Q 420 315 420 307 420 278 479 280 537 281 537 302 525 328 489 328 L 440 322 M 781 298 Q 761 313 719 313 692 313 686 301 L 686 290 Q 687 261 742 260 796 259 795 279 795 289 781 298 M 772 341 L 752 327 Q 752 322 773 319 794 318 794 328 L 772 341 M 429 256 Q 417 267 400 267 L 325 260 Q 305 253 305 244 305 216 372 211 439 206 439 242 L 429 256 M 260 49 L 278 51 Q 337 60 337 75 337 82 304 90 L 269 94 Q 238 94 224 85 217 78 217 72 L 217 70 230 63 260 49 M 192 70 L 165 73 Q 143 73 134 63 L 130 54 Q 130 43 165 43 200 42 200 54 L 200 57 Q 193 62 192 70 M 374 75 Q 374 68 391 67 408 66 408 75 408 86 393 86 374 86 374 75 M 365 119 L 351 134 Q 332 147 307 147 250 147 250 117 251 106 308 103 365 100 365 119 M 225 245 Q 215 245 201 233 L 237 234 Q 237 245 225 245 M 379 136 L 381 130 398 128 Q 416 128 417 138 417 145 400 145 373 145 379 136 M 336 205 L 260 217 Q 212 217 192 203 179 194 180 185 180 170 190 164 206 153 267 153 L 354 161 Q 373 168 373 176 373 192 336 205 M 207 133 Q 186 148 145 148 101 148 72 134 53 124 53 117 54 110 86 96 L 136 79 Q 163 74 196 90 223 105 223 110 L 207 133 M 19 74 L 8 60 Q 8 44 57 45 106 46 106 60 L 79 78 Q 51 92 40 88 L 19 74 M 61 172 L 44 182 Q 33 182 24 158 24 147 53 149 83 151 83 169 83 175 71 175 L 66 174 Q 65 172 61 172 M 94 213 L 92 220 74 225 Q 55 225 55 218 55 203 74 198 95 192 94 213 M 95 177 L 123 169 148 175 153 184 142 194 107 197 Q 80 197 81 187 L 95 177 M 122 222 Q 122 207 152 203 183 201 183 216 183 234 158 234 L 125 232 Q 122 229 122 222 M 157 281 Q 158 249 236 249 312 249 311 280 311 290 294 298 273 311 239 311 195 311 172 298 157 291 157 281 M 145 365 Q 122 365 83 349 46 333 46 328 46 305 117 299 188 294 188 335 L 181 352 Q 169 365 145 365 M 9 263 Q 9 235 71 235 134 235 134 262 133 293 64 293 30 293 15 279 9 271 9 263 M 66 386 L 61 387 Q 45 387 47 377 47 370 54 372 L 67 383 65 385 66 386 M 386 306 Q 386 314 374 314 L 337 313 Q 331 312 331 305 331 296 360 295 386 294 386 306 M 281 344 L 278 351 257 355 Q 223 355 223 344 223 334 253 333 281 332 281 344 M 324 395 L 323 395 324 396 324 395";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 597 -1 L 612 5 616 13 Q 616 21 605 21 L 566 14 562 14 529 18 500 18 473 18 459 22 456 22 404 14 392 5 393 0 416 1 429 -2 430 -2 456 2 476 -2 497 -2 525 -3 553 -8 597 -1 M 383 -9 L 390 -1 Q 390 10 363 18 L 361 18 306 27 302 29 306 32 309 36 313 45 312 46 286 44 275 38 275 31 276 28 274 28 266 28 210 15 176 6 150 2 143 2 128 6 120 7 121 8 121 11 105 11 Q 98 11 87 18 L 74 29 95 30 117 34 122 38 131 46 131 47 Q 131 50 125 50 L 108 44 69 43 Q 57 43 57 29 L 58 26 68 12 69 11 71 10 69 9 54 1 50 -1 40 -14 41 -17 56 -14 61 -10 Q 70 -2 81 -2 L 105 -5 113 -6 120 -6 135 -10 164 -15 172 -14 189 -12 198 -9 Q 220 7 250 7 L 256 7 261 7 340 -1 364 -7 377 -10 383 -9 M 217 70 L 195 82 191 74 192 70 Q 193 62 200 57 208 49 223 45 255 34 267 45 L 260 49 230 63 217 70";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 30 -35 L 43 -35 86 -31 Q 121 -31 137 -39 L 160 -48 Q 190 -47 206 -33 222 -20 250 -20 L 292 -26 364 -33 426 -28 443 -23 Q 468 -23 481 -34 L 501 -45 530 -36 552 -24 Q 580 -7 618 -18 L 623 -15 611 -3 597 -1 553 -8 546 -10 541 -12 516 -25 492 -11 476 -2 456 2 430 -2 426 -3 Q 423 -5 421 -6 409 -15 400 -15 L 365 -14 294 -4 256 7 250 7 Q 220 7 198 -9 L 196 -11 179 -29 178 -30 177 -30 172 -29 164 -26 149 -18 135 -10 120 -6 113 -6 56 -14 41 -17 -5 -30 30 -35 M 724 381 Q 692 418 629 418 L 510 408 426 398 398 396 Q 409 383 425 377 L 481 370 522 381 549 386 601 391 609 391 611 391 688 381 730 373 724 381 M 325 405 Q 316 413 313 411 L 237 403 117 436 80 433 43 426 88 419 141 401 Q 187 381 235 376 L 251 376 259 376 301 376 316 389 328 401 325 405";
	ctx.fillStyle=tocolor(ctrans.apply([240,243,244,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

var imageObj411=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/411.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj411,"assets/takeover/art/images/411.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj411.src="assets/takeover/art/images/411.png";
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

function shape3739(ctx,ctrans,frame,ratio,time){
	var pathData="M 42 -37 Q 56 -50 71 -46 L 108 -38 118 -43 163 -54 165 -59 155 -64 145 -71 145 -76 148 -76 150 -71 172 -70 175 -56 164 -44 185 -39 246 -45 259 -43 Q 267 -40 270 -40 L 280 -44 284 -46 280 -57 282 -62 280 -64 282 -78 286 -78 296 -67 334 -67 351 -47 342 -37 314 -32 302 -33 291 -25 286 -22 286 -21 284 -15 299 -16 298 -18 Q 298 -27 316 -27 332 -27 334 -19 L 368 -23 405 -23 421 -25 436 -29 490 -26 502 -17 563 -17 568 -13 601 -18 609 -21 607 -24 Q 607 -29 626 -34 L 638 -37 645 -46 657 -55 647 -59 Q 626 -66 626 -75 626 -79 637 -83 L 638 -81 634 -79 631 -75 632 -69 654 -69 Q 667 -69 676 -60 L 680 -56 704 -45 708 -44 735 -44 741 -43 Q 778 -35 778 -23 778 -18 767 -8 756 1 741 4 L 749 17 Q 760 39 760 54 760 82 749 115 769 148 769 168 L 769 182 Q 782 186 782 202 L 768 225 766 228 757 269 757 270 Q 785 273 785 290 785 302 771 313 L 769 315 774 336 784 345 777 352 781 383 779 389 754 421 734 438 737 455 729 468 706 480 716 481 719 482 722 486 703 486 700 477 Q 700 468 721 456 L 713 448 662 452 650 456 653 468 647 480 622 489 616 483 634 464 604 461 574 452 567 450 541 443 494 433 487 431 477 439 476 440 479 447 478 452 472 453 Q 460 453 458 448 L 446 452 457 466 448 475 415 464 393 464 388 458 Q 388 453 394 450 L 384 446 366 445 364 442 365 440 363 440 355 446 345 448 Q 359 461 355 475 L 355 477 370 473 Q 372 470 375 470 L 395 484 385 491 Q 379 491 376 486 L 358 489 343 488 Q 351 472 333 459 L 331 458 331 462 330 471 328 472 324 460 322 453 296 442 276 437 251 442 243 443 226 452 219 463 Q 212 471 205 471 L 201 469 Q 201 467 198 467 L 193 468 187 470 178 470 172 464 Q 189 459 211 446 L 177 445 153 455 Q 130 462 130 464 L 124 473 145 471 129 480 109 488 105 483 106 480 87 480 65 475 64 468 Q 64 451 93 452 L 105 453 95 439 60 439 Q 43 435 43 416 L 39 411 21 405 Q 16 402 16 395 16 386 22 370 L 25 362 24 338 28 301 10 290 Q 3 282 3 272 3 253 30 246 L 28 243 Q 16 216 16 201 L 21 167 16 155 Q 16 148 25 146 L 9 122 Q 9 117 12 113 7 105 7 94 7 82 42 81 L 41 77 25 82 Q 15 82 0 60 0 54 4 53 L 0 44 Q 0 31 27 28 L 25 17 28 10 Q 13 6 12 -8 12 -16 23 -21 L 42 -37 M 490 -66 L 493 -71 490 -76 487 -80 496 -91 Q 506 -100 512 -101 L 508 -95 502 -83 512 -76 527 -79 Q 539 -79 542 -71 577 -76 577 -45 L 577 -43 568 -31 Q 559 -24 544 -24 515 -24 507 -43 L 506 -45 497 -51 487 -62 490 -66 M 437 -59 Q 437 -70 452 -69 466 -67 466 -58 L 464 -51 453 -49 439 -50 437 -59 M 539 36 L 537 35 536 35 529 38 539 36 M 513 4 L 500 4 493 0 486 -2 473 0 462 12 Q 446 25 427 25 L 420 25 425 35 424 42 439 46 444 47 439 41 439 36 Q 439 25 456 26 471 10 515 5 L 513 4 M 494 468 Q 494 462 505 455 L 547 461 550 470 547 479 519 484 Q 506 484 499 477 L 494 468 M 731 328 L 746 340 759 337 755 323 731 328 M 352 32 L 346 37 357 38 379 38 376 29 376 28 352 32 M 69 73 L 79 63 77 61 70 65 54 73 56 77 57 77 69 73 M 46 306 L 42 305 41 342 Q 43 330 62 323 49 315 49 308 L 46 306 M 265 475 L 256 464 Q 256 458 272 452 L 306 447 307 456 303 467 286 475 265 475";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 744 126 Q 769 164 769 187 L 769 201 Q 782 205 782 221 L 768 244 766 247 Q 758 301 736 326 715 351 674 364 621 395 560 395 509 395 461 373 L 449 367 448 367 448 368 438 377 412 383 Q 382 383 384 373 L 384 370 351 372 246 366 235 363 224 366 185 372 Q 134 372 90 355 49 341 49 326 L 50 314 46 306 45 300 37 291 38 284 28 262 Q 16 235 16 220 16 203 25 165 L 9 141 Q 9 127 35 107 49 96 57 96 L 69 92 Q 127 24 187 40 223 43 254 59 L 336 54 357 57 385 57 439 65 483 66 488 66 494 64 577 49 Q 645 38 692 61 730 79 730 100 L 730 106 744 126 M 461 84 L 462 86 464 84 461 84 M 462 31 Q 446 44 427 44 399 44 385 21 385 -9 430 -5 475 -2 475 13 L 462 31 M 267 29 Q 267 9 299 11 331 13 331 24 331 45 295 45 268 45 267 29 M 0 79 Q 0 66 22 72 43 77 43 89 43 101 25 101 15 101 0 79 M 270 395 Q 258 404 238 404 212 404 204 395 201 392 201 385 201 369 241 371 280 373 280 383 L 270 395";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 625 100 Q 625 80 669 79 713 79 713 100 713 108 702 116 687 127 658 127 652 127 638 115 L 625 100 M 676 143 Q 676 132 702 127 727 122 727 143 L 725 156 Q 721 164 704 164 686 164 680 154 L 676 143 M 646 186 Q 627 204 585 204 L 499 191 Q 452 177 452 158 452 142 470 127 498 104 556 104 626 104 648 125 658 135 658 158 658 174 646 186 M 637 231 Q 637 203 685 202 733 201 733 220 L 723 235 Q 707 249 677 249 653 249 643 241 637 236 637 231 M 529 57 L 536 59 560 57 563 54 563 53 536 54 529 57 M 541 102 L 470 91 Q 448 82 448 66 448 26 538 22 628 17 628 56 628 73 603 88 576 102 541 102 M 419 75 L 413 92 401 104 407 118 401 137 401 143 Q 401 153 391 157 L 380 159 361 171 379 174 Q 419 184 436 193 L 454 209 541 202 Q 556 207 559 213 L 560 223 Q 560 254 496 254 465 254 449 241 L 445 237 437 243 Q 411 260 353 260 298 260 281 237 274 227 274 205 274 186 309 177 276 174 251 158 226 143 226 133 L 230 117 Q 209 109 199 85 199 58 252 52 L 265 51 Q 267 33 312 28 358 22 358 40 L 340 60 Q 320 76 306 76 L 304 76 304 77 302 89 317 88 343 88 340 85 Q 340 62 380 60 L 382 60 Q 376 55 376 48 376 30 401 35 425 40 425 54 425 64 415 66 L 419 75 M 533 261 Q 592 259 633 284 664 304 664 319 664 335 624 350 L 548 363 Q 491 363 470 344 460 334 460 321 L 463 311 442 313 Q 405 313 388 300 376 292 376 282 376 262 438 255 493 249 499 272 515 260 533 261 M 657 397 L 608 395 Q 601 392 601 385 601 374 653 357 704 341 704 370 704 397 657 397 M 295 133 L 294 134 302 136 301 132 295 133 M 253 236 L 268 233 Q 281 233 286 245 L 289 257 281 268 Q 271 277 258 277 239 277 229 259 L 222 241 Q 222 229 230 233 L 244 240 253 236 M 214 192 Q 193 206 150 206 104 206 83 187 70 177 70 166 L 72 152 58 152 Q 25 152 13 133 7 125 7 113 7 99 54 100 96 101 100 126 L 149 121 Q 228 125 228 170 228 181 214 192 M 184 50 Q 184 61 169 73 149 88 118 88 80 88 61 70 L 49 52 Q 49 16 117 17 184 17 184 50 M 106 224 Q 139 229 139 249 L 133 261 Q 127 268 117 269 L 142 275 136 265 Q 136 250 175 246 214 241 214 262 L 207 275 Q 198 286 182 286 L 158 282 Q 169 291 169 304 169 320 160 327 144 338 96 338 59 338 38 319 25 306 25 297 25 263 97 267 L 99 267 79 256 73 242 Q 73 220 106 224 M 105 307 L 105 309 108 310 112 307 105 307 M 162 390 Q 147 401 126 401 89 401 79 382 79 372 127 361 174 350 174 374 174 381 162 390 M 366 366 Q 339 392 283 392 283 399 245 386 207 373 207 357 207 319 296 307 384 294 384 331 384 350 366 366";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 286 -2 L 268 19 Q 246 34 217 34 184 34 170 25 163 20 163 15 163 -19 225 -19 286 -21 286 -2 M 490 -7 L 502 2 Q 502 20 450 20 425 20 419 0 419 -10 436 -10 L 490 -7 M 778 -4 L 767 11 Q 753 23 731 23 705 23 696 11 L 691 -2 Q 691 -32 735 -25 778 -17 778 -4 M 748 108 L 745 122 Q 738 131 717 131 699 131 692 122 L 688 113 Q 688 90 718 92 748 95 748 108 M 727 56 Q 727 45 740 48 752 50 752 58 752 67 736 70 727 66 727 56 M 700 35 Q 700 45 685 56 661 72 614 72 564 72 539 56 524 45 524 34 524 25 549 13 575 1 601 1 L 601 3 651 13 Q 700 25 700 35 M 670 115 Q 670 127 648 127 637 127 632 119 L 629 111 Q 629 96 650 98 670 101 670 115 M 641 215 Q 583 215 570 195 563 185 568 174 568 151 648 150 727 149 727 178 727 190 704 202 678 215 641 215 M 697 219 Q 697 206 728 206 752 206 758 213 L 760 219 755 231 737 238 705 229 697 219 M 526 80 Q 514 88 500 88 478 88 478 70 478 58 489 57 L 517 60 Q 536 60 536 70 L 526 80 M 577 118 L 577 115 Q 577 107 590 107 602 107 602 113 L 598 119 588 121 577 118 M 472 55 Q 472 67 453 67 442 67 439 60 L 439 55 Q 439 44 456 45 472 47 472 55 M 475 152 L 457 152 Q 423 152 409 141 401 135 401 126 401 89 468 90 535 90 535 116 535 130 515 140 L 479 151 475 152 M 409 212 Q 409 170 482 177 554 184 554 211 554 221 535 233 513 246 483 246 439 246 421 232 409 224 409 212 M 514 162 Q 514 150 531 149 547 149 547 159 547 172 529 172 L 515 167 514 162 M 520 263 Q 520 231 604 230 688 229 688 267 688 282 666 294 641 306 597 306 554 306 533 287 520 275 520 263 M 535 360 Q 535 354 558 350 580 346 580 355 L 572 364 553 370 Q 535 370 535 360 M 592 339 L 596 339 589 329 Q 589 314 616 318 643 322 643 332 643 344 624 344 L 598 340 604 345 598 347 592 344 592 339 M 485 292 Q 478 300 464 300 434 300 439 283 439 265 465 264 490 263 490 280 L 485 292 M 420 284 Q 408 297 391 297 L 317 288 Q 297 281 297 270 297 238 364 233 430 228 430 268 L 420 284 M 412 341 Q 412 308 471 310 529 312 529 336 517 366 481 366 L 432 358 Q 412 351 412 341 M 485 408 Q 485 395 511 396 536 398 536 410 L 529 418 512 421 Q 495 421 488 414 L 485 408 M 406 422 Q 367 422 335 407 307 394 307 383 307 366 379 366 451 364 451 391 451 422 406 422 M 577 393 Q 577 366 654 360 731 355 731 388 731 402 719 414 700 432 652 432 606 432 587 412 L 577 393 M 763 355 Q 784 354 784 364 L 762 379 742 363 Q 742 358 763 355 M 785 309 Q 785 321 771 332 751 348 709 348 683 348 677 335 L 677 322 Q 677 289 731 288 785 287 785 309 M 391 43 L 334 52 306 41 Q 295 36 295 29 295 15 331 15 400 15 400 32 L 391 43 M 318 11 L 302 7 298 1 Q 298 -8 316 -8 334 -8 334 1 334 11 318 11 M 397 80 Q 397 92 383 92 364 92 364 80 364 72 381 71 397 70 397 80 M 268 53 Q 327 63 327 80 327 88 294 96 L 259 102 Q 228 102 215 91 208 84 208 76 208 43 268 53 M 241 127 Q 241 115 298 111 355 108 355 129 L 341 146 Q 323 161 298 161 241 161 241 127 M 364 194 Q 364 212 328 227 292 240 252 240 205 240 184 224 172 214 172 203 172 187 181 180 198 167 258 167 L 344 177 Q 364 184 364 194 M 372 142 L 388 140 Q 406 140 407 151 407 159 390 159 364 159 370 148 L 372 142 M 190 56 L 187 70 Q 180 77 156 77 134 77 125 67 L 121 56 Q 121 44 156 44 190 43 190 56 M 133 29 L 127 36 120 38 88 32 84 26 Q 84 18 109 19 133 20 133 29 M 132 15 Q 118 15 118 4 118 -6 133 -3 148 -1 148 4 L 140 12 132 15 M 186 96 Q 214 113 214 120 214 133 199 145 177 162 137 162 93 162 65 146 46 135 46 127 46 120 77 104 106 89 127 85 154 78 186 96 M 54 18 L 46 29 47 30 42 31 Q 14 31 12 11 12 -2 36 -6 60 -10 60 8 L 54 18 M 11 79 L 0 63 Q 0 45 49 46 97 48 97 63 97 70 70 84 43 99 31 94 L 11 79 M 46 163 Q 75 165 75 186 L 64 193 59 192 54 190 36 200 Q 25 200 16 174 16 161 46 163 M 85 244 L 68 249 Q 49 249 49 241 49 224 68 218 87 212 87 235 L 85 244 M 73 207 Q 73 203 87 195 103 186 115 186 132 186 140 193 L 145 202 Q 145 210 135 214 L 100 217 Q 73 217 73 207 M 175 238 Q 175 260 151 260 L 118 256 Q 115 253 115 246 115 229 145 225 175 222 175 238 M 151 313 Q 151 275 228 275 304 275 304 310 304 322 287 332 266 345 232 345 188 345 166 332 151 323 151 313 M 65 261 Q 127 261 127 290 127 325 59 325 24 325 10 309 3 301 3 291 3 261 65 261 M 63 427 L 61 429 62 430 57 431 Q 40 431 43 421 43 412 50 414 58 415 63 427 M 175 392 Q 164 407 140 407 117 407 77 389 40 371 40 364 40 339 111 333 181 326 181 373 L 175 392 M 324 339 Q 324 328 352 327 379 326 379 340 379 350 367 350 L 330 348 Q 324 347 324 339 M 218 271 Q 208 271 193 258 229 230 229 260 229 271 218 271 M 222 426 L 208 429 Q 186 429 192 421 192 415 209 414 226 411 226 420 L 222 426 M 271 391 L 250 395 Q 217 395 217 382 217 372 246 371 274 370 274 383 L 271 391";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 20 -7 L 13 -8 12 -11 Q 12 -17 66 -51 L 93 -43 104 -38 129 -47 168 -56 170 -53 167 -49 168 -45 174 -44 218 -54 218 -58 224 -58 233 -56 247 -53 268 -40 280 -48 280 -60 279 -71 Q 279 -81 284 -81 L 288 -75 Q 289 -70 308 -71 L 328 -66 344 -58 350 -46 Q 350 -39 343 -39 339 -39 337 -42 L 320 -33 306 -31 293 -26 286 -19 295 -17 299 -20 307 -24 310 -27 Q 318 -32 320 -27 L 359 -22 374 -25 399 -28 421 -24 445 -29 478 -29 503 -17 513 -19 548 -19 576 -13 609 -19 605 -24 638 -37 651 -47 Q 652 -54 660 -57 L 665 -57 666 -54 649 -34 Q 631 -21 619 -22 L 620 -20 Q 620 -13 602 -9 595 -3 576 -3 L 546 -9 513 -9 502 -7 Q 495 -7 486 -12 L 476 -19 446 -19 421 -14 407 -16 398 -18 376 -15 359 -12 339 -15 320 -19 316 -18 298 -7 Q 279 -7 279 -15 L 280 -17 279 -20 282 -28 294 -34 285 -37 277 -34 277 -30 274 -29 262 -34 245 -40 209 -37 210 -34 Q 210 -28 200 -28 L 171 -35 157 -41 132 -38 112 -32 106 -27 101 -28 99 -28 97 -29 87 -30 77 -32 61 -35 37 -20 20 -7 M 296 -43 L 316 -42 326 -43 331 -51 331 -54 312 -56 295 -60 296 -43 M 497 -89 Q 502 -95 510 -80 L 561 -68 574 -64 578 -60 578 -51 575 -50 571 -55 558 -58 544 -59 539 -66 510 -71 Q 505 -71 504 -74 L 502 -80 500 -80 498 -55 493 -55 492 -70 Q 492 -84 497 -89 M 633 -66 L 649 -73 658 -73 Q 671 -73 688 -59 705 -46 716 -46 L 751 -49 Q 764 -49 779 -24 L 773 -18 756 -33 742 -33 738 -31 729 -31 709 -38 686 -44 671 -54 660 -64 651 -64 648 -62 634 -62 633 -66";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function sprite3740(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3736",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3737",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3738",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3739",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj413=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/413.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj413,"assets/takeover/art/images/413.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj413.src="assets/takeover/art/images/413.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj418,"assets/takeover/art/images/418.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj418.src="assets/takeover/art/images/418.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj420,"assets/takeover/art/images/420.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj420.src="assets/takeover/art/images/420.png";
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

var imageObj422=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/422.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj422,"assets/takeover/art/images/422.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj422.src="assets/takeover/art/images/422.png";
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

function shape1958(ctx,ctrans,frame,ratio,time){
	var pathData="M 593 -8 L 618 -13 639 -16 694 -9 Q 716 1 716 9 L 709 16 Q 699 18 693 29 681 53 666 53 L 648 48 641 40 625 41 Q 619 43 619 48 619 56 629 64 627 62 608 72 L 606 82 597 94 Q 576 106 569 102 L 565 101 Q 567 114 557 124 L 576 162 555 183 Q 534 198 526 198 L 524 198 Q 518 180 491 187 L 477 174 Q 455 150 445 150 L 421 154 Q 411 159 414 169 L 419 185 Q 419 196 402 204 L 402 209 401 209 405 238 404 242 406 255 420 257 426 260 421 265 383 292 376 296 427 303 Q 439 302 443 316 446 330 433 342 L 364 378 340 402 336 407 349 408 357 409 368 417 367 419 333 451 341 463 324 474 300 478 291 488 Q 283 495 272 495 L 149 482 Q 119 471 116 449 L 112 447 98 451 Q 72 451 38 410 38 400 52 392 L 54 391 46 378 Q 45 372 47 367 L 52 356 61 348 63 338 67 331 84 343 Q 102 325 119 320 L 145 319 172 318 183 315 183 312 183 311 Q 183 302 186 295 L 187 292 193 292 198 292 218 277 234 278 246 250 Q 257 206 300 203 L 302 193 337 163 355 162 356 150 301 140 260 160 Q 272 133 269 122 265 104 279 96 294 87 294 78 L 290 66 286 52 Q 286 26 333 15 L 394 15 418 19 Q 436 19 460 7 482 -5 488 -15 L 564 -15 575 -11 593 -8";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 491 47 L 496 50 445 67 Q 403 81 403 87 L 411 98 431 106 435 107 425 113 Q 408 113 400 102 L 395 87 Q 395 73 426 64 L 481 47 491 47 M 372 160 L 389 159 390 165 Q 393 175 388 193 L 383 212 398 213 Q 392 219 394 230 L 384 226 Q 370 220 368 214 367 208 375 195 L 378 169 372 160";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 607 -6 L 627 -7 638 -13 663 -13 668 -7 Q 668 0 660 -1 L 638 0 636 4 618 5 Q 552 5 528 -9 L 450 7 434 16 416 25 398 21 340 27 306 35 298 52 302 75 301 90 Q 296 99 278 105 L 276 106 292 117 311 117 322 131 324 135 Q 340 132 346 135 351 137 352 149 L 301 140 257 161 256 160 256 135 Q 257 119 261 112 L 260 106 Q 260 101 275 93 L 290 81 287 53 288 38 303 22 342 14 383 9 416 13 455 -4 Q 497 -21 536 -18 L 607 -6 M 296 196 L 300 195 337 163 368 161 364 163 Q 367 177 355 184 343 192 307 205 L 251 223 Q 241 247 248 272 L 261 276 243 281 227 294 179 317 182 325 178 334 203 334 217 353 213 370 219 369 220 370 219 371 Q 226 367 235 364 240 354 249 351 L 264 348 264 347 268 346 268 347 285 345 292 346 301 339 312 330 319 331 298 353 280 351 273 353 280 365 308 373 293 393 288 394 272 398 275 396 274 395 283 383 284 381 269 365 266 355 257 358 Q 248 361 245 365 L 241 372 Q 228 373 216 383 L 207 395 200 396 200 397 201 398 215 405 Q 226 411 231 428 L 247 423 Q 270 414 285 414 L 309 417 254 431 245 439 231 443 223 438 212 439 188 400 163 402 151 395 151 394 144 383 127 394 114 394 105 402 98 403 90 404 89 405 86 406 Q 76 399 60 398 L 78 425 92 440 111 434 120 435 Q 120 460 140 468 L 167 472 171 469 173 470 174 473 181 473 Q 205 475 214 486 L 205 493 154 487 151 487 Q 131 512 117 551 106 580 98 580 79 580 79 521 L 68 522 64 501 56 500 Q 48 514 48 523 L 43 524 Q 32 460 32 442 L 36 433 35 425 29 417 Q 29 402 48 383 L 47 380 48 380 56 361 57 357 Q 71 332 78 326 L 138 309 166 309 169 308 169 307 Q 169 299 177 293 L 177 292 193 292 198 292 218 277 221 277 216 281 205 291 203 292 203 295 Q 231 279 238 256 L 241 225 246 219 280 204 296 196 M 188 301 L 182 300 177 306 195 299 195 297 188 301 M 123 366 L 118 361 118 360 Q 84 368 69 376 L 68 377 63 384 70 384 72 384 84 381 Q 94 379 97 392 L 102 393 131 372 147 368 155 374 159 385 177 385 192 386 202 362 202 346 159 346 149 350 137 360 123 366 M 172 319 L 169 320 154 325 137 320 83 336 Q 74 342 64 367 L 75 362 Q 104 343 130 347 141 338 156 335 L 163 335 174 324 172 319 M 55 399 L 43 418 64 430 84 440 71 426 55 399 M 219 431 L 222 431 219 419 207 416 219 431";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 45 441 L 51 469 43 482 35 458 31 433 35 415 45 441";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 358 168 L 355 169 352 167 346 171 344 162 348 157 344 151 335 143 349 145 355 147 358 154 358 168";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 478 44 Q 469 54 433 64 399 73 389 88 L 410 101 404 105 Q 390 105 384 98 L 380 90 Q 380 73 413 63 L 478 44 M 274 215 L 318 202 372 161 Q 378 161 380 167 371 170 369 172 L 364 180 341 196 310 209 281 220 259 225 247 231 245 230 Q 252 222 274 215 M 143 325 L 134 325 114 326 95 330 79 337 78 337 106 322 152 322 167 320 160 318 160 316 Q 176 315 196 304 L 222 288 228 288 229 292 224 293 Q 219 293 199 307 L 174 319 Q 173 327 153 327 L 143 326 143 325 M 201 359 L 192 403 189 403 188 388 Q 188 352 197 346 L 201 359 M 285 269 L 283 272 285 291 281 294 277 286 275 278 265 281 246 284 240 282 252 272 256 268 Q 256 265 259 266 L 261 266 278 268 278 265 282 265 283 269 285 269";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
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

function sprite1959(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1958",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj424=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/424.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj424,"assets/takeover/art/images/424.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj424.src="assets/takeover/art/images/424.png";
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

function shape1966(ctx,ctrans,frame,ratio,time){
	var pathData="M 1139 -181 L 1148 -197 1149 -195 1141 -180 1139 -181";
	ctx.fillStyle=tocolor(ctrans.apply([102,102,102,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 533 -128 L 538 -134 549 -140 568 -146 596 -143 608 -141 628 -149 633 -144 Q 642 -137 656 -134 L 666 -132 694 -104 712 -92 Q 713 -84 729 -76 L 734 -74 750 -65 758 -56 748 -44 727 -33 702 -19 680 -11 673 -4 670 1 670 5 Q 661 17 642 21 L 607 32 601 35 603 56 603 70 598 85 607 91 621 99 639 101 645 110 Q 654 106 660 116 L 664 128 Q 664 134 644 143 620 154 592 154 L 563 171 533 181 518 210 518 229 Q 518 255 534 300 L 533 304 526 308 517 304 504 317 Q 492 325 485 325 L 468 321 460 325 431 330 426 329 423 335 Q 415 346 399 346 L 390 344 Q 378 355 378 366 L 373 389 353 403 349 405 344 405 325 411 316 419 302 423 286 418 281 420 270 422 257 411 Q 255 405 238 402 222 392 222 374 L 222 371 Q 215 358 215 346 215 333 233 310 244 296 254 289 261 295 275 295 312 295 345 259 L 372 219 Q 334 238 327 249 L 322 252 308 237 307 223 Q 307 205 324 197 342 189 396 184 L 410 172 445 112 Q 468 85 493 84 L 478 82 Q 494 48 506 35 L 533 8 Q 544 -4 544 -11 544 -29 526 -35 483 -48 476 -52 L 467 -56 467 -57 Q 467 -69 520 -103 L 521 -104 531 -117 533 -128 M 502 139 L 513 129 519 115 502 139 M 318 214 L 331 207 319 213 318 214 M 294 380 L 293 380 292 381 294 380 M 376 198 L 379 198 382 196 376 196 376 198";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 607 -67 L 595 -76 580 -78 579 -81 597 -83 607 -75 Q 630 -74 632 -66 634 -57 639 -56 L 655 -59 662 -63 666 -70 655 -91 663 -104 667 -105 699 -98 702 -99 Q 710 -93 718 -90 737 -82 758 -56 L 724 -76 708 -88 700 -87 666 -94 Q 661 -94 661 -90 L 672 -71 687 -70 688 -65 687 -62 686 -62 664 -61 659 -53 634 -49 622 -66 607 -67";
	ctx.fillStyle=tocolor(ctrans.apply([155,133,100,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 670 -5 Q 698 -15 706 -20 L 719 -31 730 -38 739 -47 Q 741 -53 758 -56 L 778 -28 Q 800 6 824 14 L 825 40 818 115 Q 818 142 829 183 L 821 205 Q 814 225 814 240 L 818 266 823 286 816 336 Q 816 346 823 362 L 826 391 835 447 828 486 Q 821 504 821 518 L 822 538 830 567 833 582 Q 774 605 792 668 L 792 673 772 688 Q 764 702 770 717 L 770 730 Q 655 728 620 838 L 613 832 612 830 Q 528 804 492 865 L 470 839 424 789 374 739 332 689 292 640 Q 270 620 245 609 L 245 588 246 581 234 413 239 399 242 407 243 404 258 408 Q 269 412 273 417 L 281 419 295 414 316 410 333 401 347 396 360 394 369 387 370 371 375 350 373 350 364 355 336 355 334 350 339 345 381 334 407 335 410 331 Q 412 326 425 320 L 434 316 438 310 429 305 407 302 402 294 Q 420 257 428 254 L 363 249 Q 372 236 404 241 432 245 441 253 L 429 262 421 271 414 293 440 299 Q 449 301 449 311 L 449 314 463 318 483 322 503 317 Q 507 306 517 299 L 527 293 506 240 Q 506 234 515 232 L 513 221 516 203 513 200 498 195 487 204 452 209 431 200 484 195 489 187 503 185 514 189 519 192 Q 523 183 529 181 L 570 166 Q 579 155 591 152 L 621 151 633 144 650 139 661 121 622 108 Q 594 99 594 88 L 604 64 Q 594 50 594 44 L 594 42 586 42 Q 575 42 563 30 L 536 32 530 28 531 25 553 20 Q 572 20 581 32 L 595 33 602 30 606 26 Q 623 13 652 14 647 5 670 -5";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 584 -178 Q 592 -176 592 -169 592 -161 568 -161 551 -161 551 -172 L 553 -179 584 -178";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 619 139 L 644 130 Q 651 123 656 124 662 125 662 133 662 260 641 471 L 638 577 Q 638 638 645 678 L 653 777 637 799 637 744 635 740 Q 612 736 613 715 L 614 684 Q 602 687 602 671 L 604 659 604 527 599 485 607 387 605 344 592 289 580 269 567 245 562 195 562 172 Q 565 159 575 157 L 595 151 619 139 M 750 -56 L 758 -47 749 -31 748 40 751 54 755 70 756 103 753 130 753 213 736 377 724 520 Q 724 556 730 591 L 736 632 730 676 725 720 725 734 708 739 699 557 702 491 706 426 700 332 704 270 708 206 Q 708 179 694 143 680 107 680 46 691 -36 703 -36 731 -36 750 -56 M 499 832 Q 497 791 475 709 452 620 452 557 L 455 520 458 481 445 408 Q 432 347 432 327 430 313 439 313 L 489 320 513 301 Q 520 294 529 296 L 510 436 500 472 492 507 492 581 Q 492 696 507 773 L 515 818 506 823 499 832 M 716 480 L 716 455 715 482 716 480 M 630 706 L 629 690 628 690 629 709 630 706 M 248 416 Q 248 405 259 405 L 289 421 Q 299 405 321 399 344 394 350 386 L 380 368 382 384 377 431 372 477 376 526 365 563 Q 354 587 354 599 L 359 705 359 721 332 689 292 640 265 620 262 511 Q 248 436 248 416";
	ctx.fillStyle=tocolor(ctrans.apply([148,118,99,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 404 -43 L 393 -35 385 -42 377 -52 Q 377 -60 395 -60 L 409 -60 413 -52 404 -43 M 643 -50 L 629 -48 628 -51 644 -58 651 -54 Q 654 -51 656 -51 660 -51 668 -58 L 681 -65 682 -61 673 -49 656 -45 643 -50 M 667 -91 L 667 -90 672 -75 684 -73 687 -70 686 -68 671 -66 665 -70 661 -90 663 -98 689 -95 694 -90 689 -86 679 -91 667 -91 M 478 -140 Q 464 -140 464 -150 L 469 -156 484 -158 489 -146 Q 489 -140 478 -140 M 459 212 L 454 217 451 214 Q 456 203 466 203 477 204 484 197 489 191 494 192 L 516 197 511 202 Q 496 196 490 202 L 483 213 459 212 M 448 88 Q 464 99 464 105 464 131 423 131 L 380 120 Q 358 109 358 100 358 95 372 86 390 75 411 75 430 75 448 88 M 452 17 L 440 22 Q 409 22 409 13 409 -9 431 -5 453 0 453 13 L 452 17 M 525 37 Q 540 22 560 26 577 30 580 44 L 567 36 Q 557 27 547 27 L 526 39 525 37 M 434 252 L 436 252 436 251 437 254 430 269 Q 423 282 423 288 L 425 293 Q 441 292 444 299 L 445 310 443 310 438 301 425 301 Q 415 298 415 288 415 271 434 252 M 249 269 L 236 279 215 263 Q 215 252 235 249 255 246 255 257 L 249 269 M 326 343 L 328 337 356 332 Q 357 328 360 327 L 394 324 Q 392 328 395 330 L 364 334 Q 353 345 329 345 L 326 343 M 161 308 Q 198 308 198 329 198 335 186 342 L 160 349 Q 124 334 124 328 124 308 161 308 M 324 232 L 350 222 370 215 364 204 Q 364 187 383 194 402 201 402 221 L 401 234 390 243 377 246 Q 381 261 375 280 367 302 353 302 339 302 339 290 339 283 349 273 L 345 272 Q 312 277 312 251 L 312 242 324 232 M 286 174 L 254 165 Q 244 157 244 148 244 128 285 136 326 145 326 160 326 174 286 174";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 499 832 L 506 823 515 818 Q 535 807 570 807 L 607 812 617 822 Q 617 831 605 837 567 832 530 856 L 505 873 498 877 487 882 Q 466 882 460 862 L 454 843 435 840 Q 421 840 408 849 L 392 857 378 855 Q 367 733 367 676 367 640 385 662 402 683 402 728 L 402 752 Q 411 730 437 763 L 474 822 489 834 494 839 499 832";
	ctx.fillStyle=tocolor(ctrans.apply([138,109,91,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
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

function sprite1967(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape1966",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
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

function shape3765(ctx,ctrans,frame,ratio,time){
	var pathData="M 93 -64 L 98 -61 125 -59 Q 150 -51 159 -40 L 183 -43 Q 155 -56 174 -71 189 -82 205 -84 317 -25 359 -20 L 372 2 372 8 375 8 386 5 403 -4 445 -5 Q 465 0 480 24 L 506 16 513 31 525 31 Q 549 33 543 42 L 542 42 541 44 547 43 548 43 Q 544 41 547 35 526 27 539 10 L 542 7 541 7 527 11 526 11 536 7 536 3 544 3 544 5 545 3 647 -4 680 -11 688 0 684 17 Q 665 40 605 40 L 588 43 572 45 617 50 660 45 667 43 688 39 Q 702 40 699 48 L 722 52 752 48 791 58 Q 805 66 797 75 L 792 81 794 83 Q 767 89 770 124 770 138 800 153 829 167 830 172 L 822 182 Q 814 193 814 201 815 210 837 225 L 859 236 849 241 834 249 842 238 814 237 805 236 812 244 820 258 Q 805 271 808 279 L 803 282 Q 811 286 812 293 L 812 307 808 312 783 330 Q 763 343 734 336 L 725 336 Q 715 347 690 351 L 704 362 758 354 781 358 779 362 Q 776 374 782 386 L 772 391 772 392 Q 773 406 758 421 740 437 702 444 L 684 437 624 418 Q 609 410 596 408 L 579 404 Q 575 404 570 409 L 557 416 525 437 484 442 443 421 Q 405 402 405 398 L 407 394 399 393 359 387 328 408 322 405 Q 320 405 319 407 L 280 391 207 369 Q 180 363 145 346 115 332 105 333 L 101 336 98 338 73 331 Q 78 323 91 318 67 313 55 303 L 48 292 46 287 -25 290 -43 285 -63 303 -64 303 -71 304 -109 282 -173 247 -111 237 -94 236 Q -133 223 -122 212 L -137 210 Q -178 206 -194 192 L -241 184 -261 188 -316 184 -315 182 -338 167 -223 161 Q -189 159 -171 170 -154 181 -134 180 -94 177 -87 155 -82 144 -87 132 -38 125 -19 106 L -2 78 Q 53 80 69 57 75 48 74 26 72 0 48 -23 L 45 -25 Q 46 -34 37 -43 L 54 -47 Q 71 -50 82 -56 L 88 -60 93 -64 M 162 -91 L 130 -89 Q 111 -95 122 -105 L 135 -109 152 -109 165 -95 162 -91 M 395 -30 L 409 -30 411 -31 414 -27 400 -27 396 -29 395 -30 M 494 -53 L 506 -49 504 -48 494 -53 M 472 -40 L 457 -47 452 -49 457 -50 472 -40 M 550 -51 L 552 -49 549 -50 549 -51 550 -51 M 533 -33 L 530 -34 520 -40 533 -33 M 738 -43 L 740 -48 744 -44 740 -39 738 -43 M 762 -3 Q 777 1 778 6 L 778 12 Q 768 22 745 19 725 17 732 6 L 746 -1 762 -3 M 802 22 Q 796 37 818 53 783 46 797 28 L 802 22 M 471 0 L 507 13 501 13 Q 494 14 471 0 M 476 360 L 473 356 468 353 452 345 440 347 397 355 Q 403 367 435 373 474 379 475 387 L 511 385 506 385 491 370 479 370 Q 472 366 475 361 L 476 360 M 589 343 L 591 341 589 340 585 339 567 347 574 350 Q 599 365 619 370 L 626 362 Q 578 356 589 343 M 551 365 L 549 370 533 377 547 387 577 386 562 373 551 365 M 494 455 L 488 458 480 453 494 455 M 551 472 L 585 486 582 486 575 482 555 474 551 472 M 809 326 L 814 325 806 329 809 326 M 683 299 L 680 301 Q 664 322 626 320 L 624 320 Q 628 325 620 331 L 619 332 645 331 662 323 687 315 689 306 700 300 683 299 M 639 362 L 642 365 647 367 648 367 653 368 654 363 639 362 M 691 486 L 685 482 697 482 693 485 691 486 M 733 416 L 745 412 755 397 733 402 733 416 M 54 241 L 55 235 17 232 8 229 Q -6 238 -36 236 L -37 237 -42 240 Q -25 245 -22 251 L 32 252 Q 45 255 52 261 L 54 259 54 241 M 174 76 L 181 69 187 67 195 61 169 74 171 79 174 76 M 175 412 L 194 423 194 424 175 412 M 344 338 Q 326 332 320 327 L 280 316 276 315 Q 284 323 295 328 L 300 330 344 338 M 274 296 L 275 295 272 297 274 296 M 303 449 L 303 450 301 448 303 449 M -91 44 L -91 47 -92 47 -94 44 -91 44 M -191 233 L -233 216 Q -239 210 -235 207 L -174 205 Q -153 212 -167 230 L -191 233 M -244 344 L -253 341 -256 336 -244 343 -244 344";
	ctx.fillStyle=tocolor(ctrans.apply([211,169,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 208 -16 L 330 -9 Q 368 4 373 31 L 374 36 377 36 396 32 424 34 435 42 429 41 Q 457 48 476 65 L 480 67 482 72 484 70 Q 483 67 486 67 491 64 499 62 L 527 58 Q 551 62 544 70 L 543 71 543 73 549 72 570 73 659 86 667 91 679 88 717 86 Q 761 90 790 106 816 124 805 136 L 795 147 794 154 790 160 Q 795 166 790 169 L 786 176 780 196 760 233 714 283 713 306 667 336 640 343 626 346 Q 528 403 489 387 457 380 440 363 L 366 361 353 358 351 357 326 355 Q 295 352 282 344 L 245 340 240 339 233 342 200 344 205 346 208 348 153 349 150 349 145 346 Q 115 332 105 333 L 101 336 98 338 Q 83 339 63 325 L 51 322 50 320 Q 39 306 51 292 L 56 287 56 267 Q 61 231 77 211 L 84 198 Q 76 194 88 180 L 117 158 121 157 Q 162 113 196 89 L 157 109 152 109 Q 124 116 111 125 89 135 93 142 L 76 152 Q 47 168 13 202 L 0 221 -9 223 Q -30 236 -34 253 L -42 250 -48 248 -55 248 -135 238 Q -198 231 -201 203 -206 180 -178 164 L -171 160 -155 142 -93 91 -75 81 Q -79 76 -58 64 -44 57 -17 49 L -12 49 Q 63 11 114 -3 L 208 -16 M 274 325 L 276 325 277 324 274 325";
	ctx.fillStyle=tocolor(ctrans.apply([224,182,112,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 116 -11 L 103 9 91 15 109 18 Q 140 27 141 41 L 136 58 59 63 Q 9 54 26 36 46 21 46 3 48 -6 38 -15 L 56 -19 Q 83 -23 94 -36 115 -25 116 -11 M 315 -1 Q 323 -8 341 12 360 31 346 43 310 71 225 59 139 47 174 19 191 5 224 -2 270 -16 315 -1 M 840 95 L 839 95 840 94 840 95 M 852 207 L 845 204 827 229 Q 813 247 776 253 803 257 814 272 L 822 287 Q 806 299 810 307 L 805 310 814 321 814 335 810 341 Q 790 365 739 365 L 727 364 Q 712 380 669 381 621 383 635 367 639 361 664 351 693 339 708 341 L 710 339 720 329 706 330 682 328 682 330 Q 666 350 628 348 L 626 348 621 359 Q 610 374 591 369 573 363 584 351 590 342 602 341 L 603 332 620 318 Q 631 312 639 309 638 303 645 296 L 662 281 667 275 688 264 698 263 Q 711 257 724 254 L 712 249 Q 682 237 670 229 662 221 667 214 643 218 581 215 572 209 573 203 L 580 194 Q 602 168 661 172 689 175 693 187 L 694 191 706 186 Q 742 172 796 177 840 181 844 199 L 844 196 850 188 Q 848 199 868 205 L 869 205 867 206 852 207 M 919 239 Q 878 255 851 269 L 836 277 844 264 Q 855 254 872 247 L 919 239 M 740 116 L 731 125 751 127 Q 784 129 791 140 L 790 157 Q 775 175 713 176 658 176 671 156 L 630 163 Q 575 162 554 136 543 117 552 105 565 90 610 80 L 688 75 Q 743 78 749 97 L 740 116 M 657 43 Q 664 45 657 51 650 61 590 71 532 82 552 56 571 33 614 37 L 657 43 M 474 56 L 414 60 Q 364 57 388 39 394 34 414 30 435 26 453 30 484 40 474 56 M 448 114 L 439 133 Q 408 158 352 138 L 351 138 Q 357 143 355 150 L 346 162 Q 326 179 302 167 280 155 300 141 304 136 315 134 L 334 132 323 121 317 129 265 133 Q 230 128 249 113 256 108 268 105 L 300 103 316 111 Q 313 102 327 91 342 80 355 78 L 420 85 Q 450 95 448 114 M 423 245 L 418 254 Q 411 264 382 267 358 269 373 251 L 381 240 Q 393 234 407 234 425 236 423 245 M 440 173 Q 465 161 492 164 514 166 519 173 L 516 181 Q 496 207 450 204 407 201 420 185 L 440 173 M 476 220 Q 506 207 544 210 583 213 612 226 646 241 633 257 621 272 594 284 553 301 500 297 437 291 432 272 429 263 444 244 L 476 220 M 571 338 Q 542 372 458 370 374 368 400 334 413 318 447 308 L 511 301 Q 554 303 569 313 580 325 571 338 M 434 282 L 435 296 Q 419 313 378 310 340 307 355 289 360 281 374 277 396 268 423 269 L 434 282 M 492 339 L 461 338 458 340 458 341 483 341 492 339 M 760 291 L 753 287 751 291 758 292 760 291 M 381 103 L 377 104 383 105 384 104 381 103 M 234 111 L 224 126 Q 213 134 209 130 L 204 121 193 122 177 122 171 116 147 139 Q 130 154 92 154 114 163 121 180 128 199 118 205 L 100 217 Q 109 227 93 248 69 268 21 259 L 10 256 -51 261 Q -95 256 -76 243 -72 237 -44 231 L -1 228 0 228 1 228 14 219 1 217 -21 211 -21 213 Q -43 230 -77 221 L -79 222 Q -78 228 -86 231 -102 244 -118 235 -132 226 -120 215 L -100 209 -95 202 -75 190 Q -62 184 -53 184 L -45 172 Q -37 166 -22 159 L -17 155 Q -6 148 5 147 L 17 147 42 144 33 137 1 109 Q -2 100 3 92 L -75 78 -81 64 -73 59 -8 48 -1 45 11 48 Q 37 57 36 69 L 37 74 48 72 133 80 Q 172 92 172 110 L 173 108 183 98 200 92 227 90 Q 243 96 234 111 M 274 233 Q 302 239 295 256 L 279 273 228 271 Q 196 260 215 242 L 171 233 Q 109 211 151 177 162 170 183 165 L 250 170 Q 288 182 287 200 288 211 278 220 L 263 230 274 233 M 63 188 L 59 184 56 188 63 188 M 109 262 L 164 264 Q 196 273 194 291 L 187 309 Q 153 336 99 317 45 300 74 276 85 268 109 262 M -102 66 Q -72 78 -52 96 -27 118 -44 131 -59 143 -88 149 L -181 146 -216 133 -164 113 Q -107 88 -102 66 M -127 200 Q -166 231 -243 212 -322 193 -285 164 -268 151 -234 147 L -170 152 Q -133 163 -121 177 -113 190 -127 200 M -228 180 L -235 183 -211 188 -201 187 -206 184 -228 180";
	ctx.fillStyle=tocolor(ctrans.apply([228,192,133,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 90 -31 L 127 -30 Q 151 -24 161 -13 172 -3 161 5 129 30 83 13 40 -1 60 -19 79 -23 90 -31 M 132 -60 Q 112 -68 124 -76 L 137 -81 154 -80 167 -67 164 -62 132 -60 M 265 -44 L 271 -41 287 -26 Q 299 -8 287 -1 L 212 -6 Q 150 -22 176 -42 205 -65 242 -54 L 265 -44 M 345 5 L 346 6 363 17 361 22 326 23 Q 302 18 315 8 320 2 323 2 L 344 5 345 5 M 535 54 L 545 44 543 38 542 36 Q 540 31 533 30 L 538 26 539 26 546 33 558 24 560 24 600 30 688 25 689 28 685 46 Q 665 71 592 68 542 67 535 54 M 404 -8 L 396 -3 390 -9 395 -10 404 -8 M 851 174 Q 829 202 765 201 702 200 729 165 L 749 152 785 144 Q 830 147 845 156 860 164 851 174 M 816 353 L 808 357 811 354 816 353 M 858 266 L 815 266 743 250 Q 730 242 737 234 749 218 793 208 L 860 201 868 205 895 209 Q 918 217 923 226 L 922 237 Q 884 252 858 266 M 804 51 Q 798 66 820 81 785 74 799 57 L 804 51 M 780 33 L 779 39 Q 770 50 747 48 727 45 734 34 L 748 27 764 26 Q 779 28 780 33 M 798 104 Q 775 133 722 125 672 119 689 97 720 73 754 76 780 79 792 87 807 94 798 104 M 629 91 Q 633 95 629 100 617 113 597 108 573 102 581 94 588 83 608 85 L 629 91 626 85 632 85 637 88 632 92 629 91 M 697 79 L 671 85 Q 648 87 654 78 657 75 669 70 L 690 67 Q 707 68 697 79 M 644 163 Q 621 191 545 184 468 179 495 146 507 134 535 126 L 606 119 Q 643 122 649 141 652 152 644 163 M 665 181 Q 706 185 712 197 717 205 710 214 678 252 617 239 558 229 577 206 584 197 608 189 L 665 181 M 697 140 L 722 134 Q 749 137 733 151 719 168 695 165 671 165 684 151 L 697 140 M 508 44 L 515 60 490 65 492 76 534 75 Q 556 77 552 89 L 543 100 Q 521 128 470 125 L 463 124 461 126 450 142 Q 423 165 372 150 321 135 346 113 380 87 436 103 L 452 90 401 85 Q 339 73 382 38 389 31 405 24 L 447 23 Q 467 29 482 51 L 508 44 M 451 188 Q 444 200 416 197 393 195 393 189 L 396 183 Q 400 177 409 174 L 430 168 Q 449 170 453 179 L 451 188 M 500 196 Q 554 201 552 217 552 226 538 235 522 255 448 251 377 246 397 222 406 210 433 203 L 500 196 M 579 246 L 580 250 Q 570 260 556 259 540 259 546 250 558 239 574 240 582 241 579 246 M 601 262 L 606 262 623 263 Q 655 266 658 277 662 281 656 289 630 322 570 316 510 311 527 288 537 276 563 269 L 601 262 M 528 342 L 505 338 Q 487 336 496 328 L 511 320 538 315 Q 560 317 545 333 538 342 528 342 M 542 346 Q 550 336 566 338 576 338 574 344 L 573 349 Q 565 359 548 356 535 354 542 346 M 607 363 L 666 360 682 370 Q 688 374 685 382 674 394 639 391 579 386 591 370 596 365 607 363 M 484 278 Q 493 281 492 283 L 489 286 472 292 Q 460 291 465 287 L 472 281 484 278 M 438 285 Q 427 300 410 295 393 292 404 279 411 270 432 271 441 271 442 279 L 438 285 M 479 361 Q 472 368 442 376 L 387 383 387 381 350 369 Q 313 355 320 347 327 338 348 329 L 424 321 Q 470 325 480 341 487 351 479 361 M 477 389 Q 490 373 538 378 560 380 550 399 544 406 529 405 L 481 398 Q 474 393 477 389 M 775 267 Q 828 270 802 300 794 311 740 310 685 308 699 290 L 725 277 Q 751 265 775 267 M 799 334 Q 803 340 797 347 772 375 726 362 678 350 691 334 696 328 733 324 L 767 322 Q 796 323 799 334 M 677 279 Q 661 278 668 267 674 261 689 261 712 264 699 273 L 694 279 677 279 M 627 330 Q 634 319 649 321 665 323 658 333 L 636 339 Q 619 338 627 330 M 701 393 Q 731 382 759 382 L 783 387 781 390 Q 778 403 783 414 757 433 714 429 657 424 671 409 677 401 701 393 M 628 403 Q 636 395 650 395 L 662 400 661 406 Q 654 414 638 413 622 412 628 403 M 356 72 Q 358 82 348 90 314 119 251 100 188 80 221 54 233 45 257 42 L 313 45 Q 350 58 356 72 M 234 20 Q 238 23 231 29 L 198 31 Q 174 24 187 15 198 6 207 9 232 17 234 20 M 254 106 Q 263 107 263 121 207 134 236 110 L 254 106 M 301 174 Q 324 181 314 188 L 291 194 259 193 Q 245 190 246 182 L 250 174 Q 256 168 269 168 L 301 174 M 259 141 Q 281 123 300 129 L 323 141 315 148 Q 299 161 272 156 245 152 259 141 M 228 167 L 200 182 124 173 Q 74 158 62 144 53 134 64 126 78 113 121 111 L 197 119 Q 235 130 238 148 L 228 167 M 292 204 Q 299 197 308 201 L 312 204 312 206 338 202 Q 348 205 330 227 318 235 295 227 273 218 292 204 M 263 235 Q 268 247 261 253 L 214 262 154 265 Q 125 263 116 242 109 224 117 219 127 209 152 202 L 219 205 Q 254 217 263 235 M 366 169 Q 347 181 328 182 307 181 328 165 L 339 158 357 159 Q 371 163 366 169 M 189 86 Q 158 111 98 96 40 84 77 54 82 50 100 45 L 136 44 Q 176 54 189 69 199 78 189 86 M 83 42 Q 67 55 45 48 24 44 40 31 47 27 55 24 L 80 22 Q 104 31 83 42 M 41 101 Q 2 132 -50 109 -103 87 -78 68 -70 59 -42 56 L 14 58 Q 50 70 51 83 53 93 41 101 M 36 167 Q 65 161 84 167 133 182 100 206 L 39 204 Q -10 192 9 178 15 173 36 167 M 7 164 L -8 160 Q -24 156 -13 148 L 8 146 Q 29 152 15 159 L 7 164 M 87 240 L 81 251 Q 49 276 10 254 -30 233 -15 220 L 27 216 62 221 Q 86 228 87 240 M 200 279 L 241 281 244 298 239 313 182 312 Q 144 299 158 288 165 284 200 279 M 139 279 L 131 287 91 288 Q 64 281 76 269 85 262 89 261 L 124 262 Q 141 268 139 279 M 116 300 Q 136 307 136 314 L 134 319 108 318 Q 88 312 95 305 100 302 108 300 L 116 300 M 136 341 L 137 340 Q 139 337 152 332 L 169 327 170 325 173 326 Q 196 333 179 347 L 171 352 136 341 M 224 373 Q 229 368 242 362 264 353 283 354 307 356 307 367 L 302 378 284 393 280 391 224 373 M 13 316 L 14 318 10 317 7 315 13 316 M 4 314 L -1 320 -15 311 4 314 M -29 309 L -30 313 -29 317 -45 312 -46 311 -34 308 -29 309 M -58 305 L -59 304 -56 304 -58 305 M -62 300 L -56 290 Q -49 283 -23 278 L 33 280 Q 60 288 64 299 L 59 309 44 318 38 320 41 318 23 308 10 297 8 303 -18 299 -9 293 -8 293 -15 290 -28 297 -31 298 -60 299 -62 300 M 64 318 L 76 317 84 316 Q 92 319 87 324 L 74 325 64 318 M 387 271 L 386 279 Q 371 299 343 295 318 291 328 280 L 340 267 372 262 Q 388 263 387 271 M 310 326 Q 304 335 292 332 284 329 289 323 296 314 310 313 318 318 310 326 M -91 112 Q -102 123 -116 118 -131 114 -121 107 -108 97 -94 102 -84 105 -88 110 L -91 112 M -178 170 L -150 172 Q -131 178 -149 190 -159 200 -170 197 -175 195 -189 188 -206 184 -196 177 -192 174 -178 170 M -185 130 L -189 133 -204 135 -212 131 -193 123 -190 125 Q -183 128 -185 130 M -239 213 L -306 208 -308 214 -314 211 -313 210 -345 191 Q -374 170 -363 163 L -360 159 -322 152 -293 148 -259 155 Q -218 167 -213 187 -211 198 -220 205 L -239 213 M -157 203 L -131 199 Q -123 202 -126 207 L -130 211 -153 214 Q -166 210 -157 203 M -112 129 L -72 130 -69 131 -53 135 Q -25 143 -26 155 -24 161 -31 166 -67 196 -122 178 -178 162 -152 142 -138 131 -112 129 M -72 201 Q -61 194 -51 198 -34 203 -45 211 L -68 214 Q -82 211 -72 201 M -47 241 L -33 254 Q -29 259 -35 265 L -81 267 Q -136 251 -119 238 L -101 232 -47 241 M -383 174 L -383 181 -383 182 -386 180 -383 174 M -65 286 L -90 288 Q -103 283 -94 276 -86 269 -72 272 -62 275 -63 279 L -65 286";
	ctx.fillStyle=tocolor(ctrans.apply([253,226,147,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 265 -44 Q 170 -104 170 -109 169 -128 235 -96 L 264 -103 275 -114 291 -123 277 -157 Q 276 -162 282 -179 281 -198 303 -203 L 304 -202 295 -193 290 -182 Q 292 -170 284 -159 L 299 -138 302 -128 349 -135 387 -137 393 -130 387 -127 Q 433 -112 434 -100 L 433 -97 432 -97 428 -97 393 -116 380 -124 357 -116 309 -107 302 -107 292 -99 Q 281 -93 267 -90 L 265 -87 Q 271 -82 283 -76 L 289 -69 Q 363 -29 390 -9 L 396 -3 404 -8 426 -14 Q 456 -21 461 -14 L 486 -9 522 3 512 -58 507 -67 510 -73 508 -82 497 -92 504 -104 502 -112 Q 502 -121 505 -124 L 509 -110 Q 523 -123 523 -112 524 -100 546 -102 L 652 -96 647 -93 633 -92 612 -95 539 -94 Q 529 -93 524 -98 L 518 -106 513 -100 515 -93 525 -86 525 -77 533 -68 541 -58 536 -35 Q 537 -25 547 -18 L 554 -19 663 -10 Q 695 -5 702 5 L 717 9 721 7 726 5 770 7 Q 773 10 768 25 L 733 27 722 30 Q 707 31 699 24 L 696 21 688 25 600 30 560 24 558 24 539 17 540 19 538 26 533 30 Q 540 31 542 36 L 543 38 545 44 535 54 534 54 529 52 Q 526 49 524 49 L 508 44 476 27 437 2 406 11 407 15 397 22 387 18 376 24 363 17 346 6 345 5 271 -41 265 -44 M 529 -9 L 528 -10 530 -5 529 -9 M 540 12 L 542 10 540 7 539 9 532 5 531 4 532 9 538 14 540 12 M 416 406 Q 427 408 447 421 L 468 434 486 438 524 423 527 425 531 427 Q 546 426 559 413 L 570 400 571 400 Q 569 420 490 448 L 496 454 491 458 486 458 Q 495 479 518 486 541 494 543 515 L 534 523 Q 549 502 497 488 481 483 465 452 L 463 446 463 445 457 438 442 428 Q 423 416 416 406 M 171 352 L 216 369 224 373 Q 244 381 247 389 L 172 364 Q 126 348 113 335 L 60 334 47 328 37 339 20 350 1 355 -39 370 -42 353 -63 343 -107 340 -80 334 -48 339 Q -33 346 -32 357 L -22 357 25 326 37 320 13 316 7 315 4 314 -15 311 -29 309 -34 308 -46 311 -71 314 -96 311 -119 306 -142 309 -160 323 -217 331 -214 333 -212 338 -213 342 -221 335 -226 330 -226 327 -225 328 Q -171 323 -160 312 -149 299 -117 294 L -64 305 -58 305 -56 304 -59 304 -67 302 -62 300 -60 299 -31 298 -28 297 -15 290 -8 293 -9 293 -18 299 8 303 23 308 41 318 38 320 44 318 Q 55 315 64 318 L 74 325 87 324 129 327 Q 129 336 132 339 L 136 341 171 352 M -239 213 L -238 213 Q -178 221 -170 233 L -169 234 Q -162 237 -160 243 L -134 260 Q -100 281 -97 290 -136 274 -169 254 L -199 236 Q -224 225 -256 222 L -256 225 -308 215 -308 214 -306 208 -239 213";
	ctx.fillStyle=tocolor(ctrans.apply([203,139,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape3766(ctx,ctrans,frame,ratio,time){
	var pathData="M 95 -66 L 101 -69 106 -73 Q 108 -72 111 -70 L 138 -66 171 -45 195 -47 Q 168 -61 188 -75 218 -95 254 -82 285 -71 297 -51 L 301 -43 339 -33 Q 376 -18 380 10 L 380 16 383 16 394 14 412 6 454 7 Q 473 13 487 38 L 513 32 519 47 531 48 Q 556 51 548 60 L 547 60 546 62 552 61 553 61 Q 549 59 553 53 532 44 546 28 557 17 578 8 L 651 3 Q 693 8 696 27 L 691 44 Q 671 65 611 62 L 594 64 578 65 623 73 666 70 673 69 694 66 Q 708 68 704 75 L 727 81 757 79 Q 783 83 795 91 809 100 800 108 L 795 114 797 116 Q 770 121 770 156 770 170 799 186 827 202 827 207 L 819 217 Q 810 227 810 235 810 245 831 261 L 852 274 842 278 827 285 835 275 807 272 798 270 805 279 812 293 Q 796 305 799 313 L 794 316 802 327 801 341 797 346 771 363 722 366 713 365 Q 702 375 677 378 L 690 390 744 385 767 390 765 394 Q 761 406 766 418 L 756 423 756 424 Q 756 438 740 452 716 471 665 471 634 471 605 452 L 580 429 563 424 Q 556 424 539 440 522 456 465 456 L 426 433 389 407 391 403 383 402 344 393 Q 344 401 305 415 L 260 415 Q 221 406 196 389 L 192 385 189 384 184 380 186 380 176 367 161 368 103 355 Q 56 341 56 333 56 317 81 308 57 302 45 291 L 39 280 37 275 -34 273 -51 267 Q -74 292 -98 292 L -133 289 Q -136 300 -158 311 -187 325 -226 325 L -251 318 -268 301 Q -268 287 -259 282 -253 278 -218 265 L -191 265 -205 252 Q -205 212 -116 214 L -99 214 Q -137 199 -126 189 L -140 186 Q -181 179 -196 164 L -242 154 -263 156 -317 149 -316 147 -338 131 -223 132 Q -189 132 -172 144 -156 156 -136 156 -96 156 -87 134 -82 123 -86 111 -37 107 -16 89 L 2 63 Q 57 68 75 46 82 37 82 15 82 -11 58 -35 L 55 -37 Q 57 -46 48 -56 L 66 -58 95 -66 M 177 -96 Q 165 -87 145 -96 126 -103 138 -112 L 151 -115 168 -114 Q 181 -108 180 -100 L 177 -96 M 380 -43 Q 371 -48 371 -57 371 -86 408 -82 444 -78 444 -62 425 -38 407 -38 L 380 -43 M 296 -74 Q 278 -81 270 -87 288 -119 315 -122 L 353 -106 Q 365 -99 365 -88 L 364 -81 Q 358 -76 335 -74 L 296 -74 M 500 -34 L 492 -40 497 -46 527 -43 513 -30 Q 551 -18 551 1 L 543 14 545 15 Q 558 20 548 25 L 534 28 533 23 508 29 Q 501 29 476 12 450 -5 450 -16 450 -47 500 -34 M 405 -18 Q 388 -22 396 -27 L 407 -30 421 -29 Q 438 -21 426 -19 L 405 -18 M 665 -24 Q 665 -50 714 -52 762 -56 762 -31 L 755 -13 Q 747 -2 735 0 L 686 0 Q 665 -9 665 -24 M 602 -13 L 570 -18 Q 561 -23 561 -37 561 -48 598 -51 635 -55 635 -32 635 -21 631 -18 L 602 -13 M 786 39 L 785 44 Q 775 54 752 49 732 46 740 36 745 32 754 30 L 770 29 Q 785 33 786 39 M 809 56 Q 802 70 823 88 788 79 803 62 L 809 56 M 543 461 L 548 453 573 452 588 456 605 456 Q 615 459 624 473 L 632 490 624 497 611 503 545 506 Q 521 506 521 477 521 469 530 465 L 543 461 M 537 383 L 534 388 Q 528 394 518 394 L 531 405 562 406 547 392 537 383 M 476 469 Q 488 479 473 489 457 499 433 499 L 410 495 Q 402 492 402 483 402 476 427 470 L 476 469 M 459 370 L 455 366 439 357 427 359 384 364 Q 389 376 421 384 459 393 459 401 L 495 401 491 400 476 385 465 384 Q 458 379 461 375 L 462 374 459 370 M 577 364 L 579 362 577 361 573 359 555 366 561 370 Q 585 386 605 392 605 388 612 385 565 376 577 364 M 802 359 L 794 363 797 360 802 359 M 651 348 L 676 342 679 333 Q 681 330 690 328 L 673 326 670 327 Q 653 347 615 343 L 613 343 Q 617 348 608 354 L 607 355 633 355 651 348 M 640 494 Q 651 487 671 490 L 677 504 Q 678 515 656 515 L 627 503 Q 637 495 640 494 M 634 391 L 639 393 640 388 625 386 628 389 633 391 634 391 M 717 431 L 716 445 728 442 739 428 717 431 M 332 344 Q 314 337 309 331 281 327 270 318 L 266 317 284 331 289 333 Q 307 343 332 344 M 87 424 L 79 426 62 421 Q 52 416 52 407 52 394 62 388 65 349 133 371 L 203 403 Q 203 412 188 416 L 191 427 189 433 182 436 145 426 139 426 133 424 109 429 87 424 M 29 389 Q 47 394 47 404 L 38 413 17 421 -5 406 -23 388 -21 381 -19 379 -4 379 29 389 M 56 354 L 52 363 Q 45 371 32 371 L -13 367 Q -28 363 -28 352 -28 332 14 334 56 337 56 354 M 47 247 L 48 228 49 222 12 217 3 214 -41 218 -42 219 -48 222 -28 234 25 238 45 249 47 247 M 186 65 L 192 63 200 58 174 69 175 74 179 71 186 65 M 266 297 L 263 299 265 298 266 297 M 396 437 L 399 450 396 469 365 469 318 452 302 439 Q 302 432 315 426 L 380 426 396 437 M 257 469 L 223 461 Q 203 451 203 441 203 409 244 419 285 429 285 459 L 281 468 257 469 M -84 23 L -85 26 -86 26 -87 23 -84 23 M -196 205 Q -216 194 -236 186 -242 180 -238 177 L -177 179 Q -156 187 -171 204 L -196 205 M -67 332 Q -83 341 -101 341 L -128 332 Q -142 322 -142 312 L -139 301 Q -53 302 -53 317 L -67 332";
	ctx.fillStyle=tocolor(ctrans.apply([177,132,75,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 124 -11 L 218 -18 Q 296 -22 339 -4 376 11 380 39 L 380 44 383 44 402 41 430 45 441 53 435 52 Q 462 61 480 79 L 484 81 486 86 488 84 490 81 503 77 531 75 Q 556 80 548 88 L 547 89 546 91 552 90 574 93 Q 645 103 662 111 L 670 116 682 114 720 114 Q 764 121 792 139 816 158 805 170 L 794 180 793 187 788 193 Q 793 199 788 202 L 783 208 776 228 754 265 705 312 703 334 Q 692 348 655 362 L 628 367 613 369 Q 511 420 473 401 442 392 426 375 L 353 368 340 364 338 363 313 360 Q 282 355 270 346 L 233 340 228 338 221 341 188 341 193 343 196 345 141 343 138 343 Q 70 343 45 318 L 39 308 Q 29 293 42 280 L 47 275 48 255 Q 56 219 74 200 L 82 187 Q 74 183 87 170 93 161 117 150 L 121 149 Q 164 107 200 86 181 93 160 103 L 155 103 Q 126 108 113 116 90 125 94 132 85 135 76 141 46 155 10 187 L -5 205 -14 207 Q -35 218 -40 235 L -48 232 -54 229 -61 229 -140 214 Q -202 203 -204 175 -207 152 -178 138 L -171 134 -154 117 Q -118 86 -89 70 L -71 61 Q -74 56 -53 45 L -11 33 -6 33 Q 72 0 124 -11 M 263 327 L 265 327 266 326 263 327";
	ctx.fillStyle=tocolor(ctrans.apply([170,132,89,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 66 -30 Q 94 -33 106 -45 126 -33 126 -19 123 -10 112 0 L 100 6 117 10 Q 148 21 148 35 149 44 142 51 119 65 64 51 15 39 33 22 53 9 55 -9 57 -18 48 -28 L 66 -30 M 842 130 L 842 131 841 131 842 130 M 840 240 L 821 265 Q 806 282 769 285 795 291 805 307 L 812 322 Q 796 333 799 341 L 794 344 802 355 801 369 797 375 Q 776 398 725 395 L 713 393 Q 697 408 654 406 606 406 621 390 625 385 651 376 L 695 369 698 367 708 358 694 358 670 354 670 356 Q 653 375 615 371 L 613 371 608 382 Q 596 396 577 390 560 383 571 371 578 363 590 363 L 591 354 609 341 629 333 Q 628 327 635 320 L 653 306 659 301 Q 667 292 680 291 L 690 291 717 283 705 278 664 255 Q 657 247 662 239 L 577 235 Q 568 228 569 222 L 577 214 Q 600 189 659 197 687 201 690 214 L 691 218 703 213 793 210 Q 837 217 840 235 L 840 232 846 224 Q 844 235 863 243 L 864 243 862 244 847 244 840 240 M 842 306 L 827 313 836 301 Q 847 291 865 285 L 912 280 842 306 M 662 76 Q 655 86 594 92 535 99 557 75 578 53 620 59 L 663 68 Q 670 70 662 76 M 692 102 Q 746 108 751 127 L 741 146 732 154 751 157 Q 784 161 790 173 794 181 788 190 772 207 711 204 656 201 670 181 L 629 186 Q 574 182 555 154 544 135 554 123 568 109 614 102 659 96 692 102 M 479 70 Q 469 76 419 70 369 64 394 48 400 43 421 40 L 459 43 Q 490 54 479 70 M 439 144 Q 407 167 352 144 L 351 144 Q 357 149 354 156 L 345 168 301 170 Q 279 157 300 144 L 316 138 336 137 324 125 318 133 266 134 Q 231 127 251 113 258 108 271 106 289 101 303 106 L 318 115 Q 316 106 330 96 346 86 359 84 384 81 423 95 452 107 449 126 448 138 439 144 M 417 195 L 438 184 Q 463 174 490 178 512 182 516 189 L 513 197 Q 491 221 446 216 403 210 417 195 M 539 227 Q 579 233 607 249 640 266 626 281 613 295 585 305 L 490 312 Q 427 303 424 283 421 274 437 256 450 243 471 233 L 539 227 M 559 358 Q 527 390 444 383 360 375 388 343 402 328 436 320 L 501 317 Q 543 322 559 333 569 345 559 358 M 411 265 Q 403 274 374 275 350 276 366 259 L 375 248 401 244 Q 419 247 416 256 L 411 265 M 425 293 L 425 307 Q 408 323 368 318 330 313 346 296 351 288 366 285 L 415 280 425 293 M 445 354 L 470 355 479 354 473 353 449 351 445 353 445 354 M 744 318 L 741 322 748 323 750 322 744 318 M 349 18 Q 367 38 352 49 314 75 230 58 146 40 182 15 200 2 233 -3 L 324 3 Q 332 -3 349 18 M 379 112 L 385 113 386 112 383 111 379 112 M 236 110 L 225 124 210 127 206 118 195 118 179 117 173 111 148 133 Q 130 146 92 144 114 154 119 172 125 191 115 197 L 96 207 Q 105 218 87 238 61 257 14 245 L 3 242 -58 243 Q -101 234 -82 222 -77 217 -49 212 -16 208 -6 212 L -5 212 -4 212 10 204 -3 201 -25 194 -25 196 Q -48 212 -81 201 L -83 201 -91 210 -123 212 Q -136 202 -124 192 L -103 187 -98 180 -77 170 -55 165 -46 154 -23 142 -17 138 5 132 17 133 42 131 33 123 Q 11 106 3 94 1 85 6 77 L -71 58 -76 44 -67 39 -2 32 5 30 17 34 Q 42 44 41 56 L 41 61 52 60 Q 92 55 138 73 176 87 175 105 L 176 103 186 94 204 89 Q 220 86 231 89 246 96 236 110 M 269 234 Q 296 243 288 259 L 271 275 Q 258 285 220 270 189 257 209 239 L 166 228 Q 106 202 150 171 161 164 182 161 212 156 249 170 286 184 284 202 284 213 273 221 L 258 230 269 234 M 53 176 L 60 176 56 172 53 176 M 102 254 L 157 259 Q 188 270 185 288 185 298 177 305 L 89 308 Q 35 288 66 266 78 258 102 254 M -49 77 Q -25 101 -43 113 -59 124 -88 128 L -180 119 -214 104 -161 88 Q -103 66 -97 45 -68 58 -49 77 M -130 177 L -246 181 Q -324 158 -285 131 -267 119 -233 117 L -170 126 Q -133 139 -122 154 -115 167 -130 177 M -229 150 L -236 153 -213 159 -203 159 -208 156 -229 150";
	ctx.fillStyle=tocolor(ctrans.apply([201,165,97,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 101 -40 L 138 -37 171 -18 Q 181 -7 170 0 L 92 3 Q 49 -14 70 -30 L 101 -40 M 168 -85 Q 181 -80 180 -72 L 177 -67 Q 165 -60 145 -67 126 -76 138 -83 L 151 -87 168 -85 M 297 -23 Q 308 -5 296 2 280 14 221 -8 161 -28 188 -46 218 -67 254 -54 285 -43 297 -23 M 890 249 Q 912 258 917 268 L 915 278 Q 876 291 849 303 L 807 301 Q 754 291 736 280 723 272 731 264 744 249 788 242 L 855 238 863 243 890 249 M 848 210 Q 825 237 761 232 698 227 727 194 L 748 182 784 176 Q 829 182 843 192 858 201 848 210 M 786 66 L 785 71 Q 775 82 752 78 732 74 740 64 745 60 754 58 L 770 58 Q 785 60 786 66 M 809 85 Q 802 99 823 116 788 107 803 91 L 809 85 M 795 120 Q 809 128 800 137 775 165 723 154 673 145 691 124 724 102 757 107 783 111 795 120 M 635 108 L 640 112 635 115 632 114 631 123 Q 619 135 599 129 576 122 584 114 592 104 611 107 L 632 114 629 108 635 108 M 701 106 L 674 111 Q 651 111 658 103 661 100 673 96 L 694 94 Q 711 96 701 106 M 691 73 Q 669 96 597 89 522 83 546 56 L 548 54 534 57 Q 529 53 536 44 L 540 43 545 44 552 51 578 37 651 31 Q 693 37 696 55 L 691 73 M 697 167 L 722 163 Q 749 167 732 180 717 196 693 192 669 190 683 177 L 697 167 M 708 225 Q 713 233 705 243 671 278 611 262 552 248 573 225 581 217 605 210 L 662 206 Q 703 212 708 225 M 643 187 Q 618 213 542 202 465 192 494 161 507 149 535 143 L 607 141 Q 644 146 649 165 651 176 643 187 M 555 107 L 545 118 Q 521 144 471 138 L 464 137 462 139 Q 460 149 450 154 L 371 157 Q 322 139 348 119 383 95 438 114 L 455 102 404 94 Q 343 78 388 46 L 412 34 454 35 Q 473 42 487 65 L 513 60 519 76 494 80 495 91 537 92 Q 560 96 555 107 M 405 10 Q 388 7 396 2 L 407 -2 421 0 Q 438 7 426 10 L 405 10 M 496 211 Q 550 219 547 235 546 245 532 253 514 272 441 263 370 254 392 230 402 219 429 214 L 496 211 M 450 191 L 448 200 Q 440 211 412 207 390 203 390 197 L 393 191 Q 398 186 407 183 L 428 179 Q 447 182 450 191 M 573 266 L 573 270 Q 563 280 548 278 532 277 539 268 551 258 568 260 576 262 573 266 M 599 284 L 616 286 Q 647 291 650 302 L 647 314 Q 619 345 559 336 499 327 517 305 528 294 555 288 L 594 284 599 284 M 533 351 Q 525 360 515 359 L 492 354 Q 475 351 484 343 486 341 499 336 L 527 333 Q 548 336 533 351 M 554 357 Q 564 358 562 364 L 560 369 534 374 Q 521 371 529 364 537 354 554 357 M 483 298 L 480 301 Q 473 307 462 306 450 304 456 300 457 296 463 295 L 475 293 Q 484 296 483 298 M 433 291 L 429 297 Q 417 311 400 305 384 301 395 289 403 280 424 282 433 283 433 291 M 467 355 Q 474 365 465 375 458 381 427 388 L 372 391 372 389 336 375 Q 300 359 308 351 315 343 337 335 L 413 332 Q 458 338 467 355 M 461 403 Q 475 388 523 395 545 399 534 417 527 424 512 422 L 465 412 Q 458 406 461 403 M 593 385 Q 609 381 652 385 L 668 396 Q 673 401 670 408 658 420 624 415 564 406 577 391 582 386 593 385 M 755 354 Q 784 356 787 368 L 784 380 Q 757 407 712 391 665 376 679 361 L 721 354 755 354 M 729 340 Q 675 335 690 318 696 313 716 306 L 767 299 Q 819 306 792 334 L 729 340 M 668 305 Q 652 303 660 293 666 287 681 288 704 292 691 301 687 304 685 306 L 668 305 M 638 345 Q 654 348 646 358 L 624 363 Q 607 361 615 353 623 343 638 345 M 634 419 L 646 425 645 431 621 436 Q 605 434 612 426 620 418 634 419 M 654 434 L 685 420 744 413 767 419 765 422 Q 761 435 766 446 739 464 696 457 640 449 654 434 M 802 387 L 794 391 797 388 802 387 M 323 12 L 332 7 352 11 Q 379 20 368 29 L 333 28 Q 310 21 323 12 M 351 96 Q 315 123 254 100 192 76 227 52 239 44 263 43 L 319 49 Q 355 64 360 78 362 89 351 96 M 257 106 Q 265 108 265 122 208 131 238 109 248 102 257 106 M 205 28 Q 182 20 195 11 L 216 7 242 19 Q 246 23 238 28 228 34 205 28 M 299 177 Q 322 185 311 191 L 288 196 256 193 Q 242 189 244 181 L 248 174 Q 255 168 268 169 L 299 177 M 301 132 Q 321 139 323 145 L 315 152 Q 298 164 271 157 245 151 259 141 282 125 301 132 M 227 165 L 198 179 Q 171 182 123 165 74 147 62 132 54 122 65 114 81 102 124 103 166 104 199 116 236 129 238 147 L 227 165 M 288 206 L 305 204 308 207 308 209 334 207 Q 344 210 325 231 L 290 229 Q 269 219 288 206 M 258 235 Q 262 248 254 254 L 207 260 147 259 Q 118 256 111 233 105 215 113 210 124 201 149 196 L 216 203 Q 250 217 258 235 M 364 176 Q 345 187 326 186 305 184 327 169 L 338 163 356 165 Q 370 170 364 176 M 143 37 Q 182 50 194 65 203 75 193 82 161 105 102 87 44 71 83 44 L 107 36 143 37 M 88 12 Q 112 22 90 32 73 44 51 36 30 30 47 18 L 62 12 Q 76 8 88 12 M 55 71 Q 56 81 44 88 L -48 91 Q -99 65 -73 48 -64 40 -36 38 L 19 44 Q 54 58 55 71 M 35 154 L 83 157 Q 131 174 97 196 L 35 191 Q -13 176 7 163 L 35 154 M 6 149 L -9 144 Q -24 139 -13 132 L 8 131 Q 29 138 14 144 L 6 149 M 82 229 L 75 240 Q 41 264 3 239 -35 215 -19 203 L 23 202 57 209 Q 82 217 82 229 M 123 280 L 83 279 Q 55 270 68 259 79 252 83 252 L 117 255 Q 134 262 131 272 L 123 280 M 126 307 L 124 312 98 309 Q 79 302 86 296 L 99 292 107 292 Q 127 300 126 307 M 141 326 L 158 322 159 320 162 321 Q 185 330 167 343 L 130 348 Q 107 343 126 333 128 330 141 326 M 192 276 L 233 281 235 298 229 312 172 308 Q 135 293 150 283 L 192 276 M 65 306 L 74 306 Q 85 310 73 317 66 323 55 317 46 312 51 308 L 65 306 M 49 297 Q 15 320 -34 301 -85 285 -65 272 -57 265 -31 262 L 25 267 Q 51 277 54 288 L 49 297 M 377 288 Q 361 307 334 301 309 295 320 285 L 332 273 364 270 Q 380 272 379 280 L 377 288 M 278 325 Q 286 317 300 317 307 322 299 330 292 338 281 335 273 331 278 325 M 293 370 L 288 381 Q 263 408 229 395 197 383 208 373 L 229 361 270 356 Q 294 359 293 370 M -89 91 Q -100 101 -114 96 -129 91 -118 84 -105 75 -91 81 -81 85 -85 89 L -89 91 M -68 111 L -52 116 Q -25 126 -26 138 -25 144 -32 149 -70 176 -123 155 -178 136 -151 117 -137 107 -111 107 L -71 110 -68 111 M -183 103 L -187 106 -203 107 -210 103 -191 96 -188 98 Q -181 101 -183 103 M -129 184 L -133 187 -157 189 Q -169 184 -160 178 L -134 175 Q -126 179 -129 184 M -151 165 Q -162 175 -172 171 L -191 161 Q -208 156 -197 149 L -179 144 -151 147 Q -132 154 -151 165 M -171 232 L -196 233 -236 215 -238 205 -177 207 Q -156 215 -171 232 M -106 210 L -53 222 -39 236 Q -36 242 -42 248 L -88 247 Q -142 227 -124 215 L -106 210 M -75 181 L -54 179 Q -37 185 -49 192 L -72 194 Q -86 190 -75 181 M -321 117 L -292 115 -259 124 Q -218 138 -215 158 -213 169 -223 176 -232 184 -263 184 L -317 176 -316 175 -346 154 Q -374 132 -363 125 L -359 122 -321 117 M -384 142 L -384 143 -387 141 -383 135 -384 142 M -71 260 L -73 267 Q -83 273 -98 267 -111 262 -102 255 L -79 253 -71 260";
	ctx.fillStyle=tocolor(ctrans.apply([215,182,140,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 679 47 L 684 39 683 33 673 26 610 21 Q 606 21 593 36 L 575 50 Q 545 32 545 22 545 14 550 14 L 553 15 562 25 593 8 Q 618 -7 660 -1 L 681 15 696 32 695 43 686 53 Q 679 53 679 47 M 797 104 L 796 106 798 107 797 104 M 819 162 L 814 171 807 162 802 167 797 163 801 154 781 111 744 105 Q 739 106 733 101 L 727 94 727 91 717 91 717 102 712 102 711 100 705 84 707 80 728 80 726 79 724 74 725 70 Q 778 74 797 85 811 93 811 110 L 804 120 805 129 819 162 M 704 -17 L 698 -16 Q 694 -16 692 -22 L 690 -29 668 -27 Q 661 -29 661 -35 661 -52 716 -63 771 -74 771 -36 L 770 -27 763 -25 759 -27 746 -45 734 -34 703 -27 704 -17 M 611 -38 L 622 -37 616 -39 611 -38 M 597 -42 L 589 -35 582 -37 581 -42 Q 581 -62 612 -58 643 -54 643 -31 643 -22 634 -22 603 -22 597 -42 M 367 -65 Q 382 -64 391 -78 400 -93 418 -94 L 441 -77 453 -60 452 -54 447 -53 440 -55 431 -62 433 -62 441 -61 441 -62 425 -73 384 -56 Q 376 -56 367 -65 M 290 -99 L 285 -110 Q 285 -118 326 -122 L 352 -108 Q 361 -102 361 -92 361 -83 354 -83 L 340 -87 330 -92 331 -93 350 -92 350 -95 343 -101 325 -101 315 -95 305 -92 Q 296 -92 290 -99 M 199 -61 L 198 -65 Q 198 -92 241 -88 285 -84 311 -50 320 -38 340 -33 L 375 -24 Q 394 -15 405 12 L 429 3 Q 439 -7 449 -7 L 456 -6 456 -12 Q 456 -47 506 -42 556 -36 556 -6 L 556 2 548 12 538 5 544 -4 542 -11 531 -19 Q 476 -19 472 -10 L 468 -3 Q 480 0 488 10 499 23 499 33 499 41 493 41 L 487 39 481 22 Q 471 8 450 8 L 434 19 Q 417 30 398 30 L 383 6 Q 369 -19 328 -19 303 -19 298 -31 291 -51 236 -73 L 221 -73 213 -66 Q 207 -60 203 -60 L 199 -61 M 74 -44 L 76 -59 Q 84 -70 113 -70 L 149 -65 Q 165 -60 165 -55 L 164 -50 178 -59 183 -57 Q 179 -38 163 -38 L 131 -44 92 -50 86 -47 Q 90 -39 75 -29 L 74 -44";
	ctx.fillStyle=tocolor(ctrans.apply([115,131,48,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape3767(ctx,ctrans,frame,ratio,time){
	var pathData="M 89 -60 L 86 -62 Q 88 -71 79 -81 L 97 -83 126 -91 Q 149 -75 174 -75 L 196 -77 202 -70 226 -72 213 -81 228 -88 249 -106 195 -95 184 -96 Q 212 -112 280 -127 299 -122 324 -103 L 366 -73 Q 363 -70 354 -70 344 -70 322 -84 L 328 -76 332 -68 358 -62 368 -53 Q 377 -37 385 -31 396 -21 411 -17 L 411 -15 411 -9 414 -9 425 -11 430 -13 440 -13 485 -18 486 -18 Q 504 -12 518 13 L 531 10 533 10 545 10 550 22 562 23 Q 587 26 579 35 L 578 35 577 37 583 36 584 36 Q 580 34 584 28 564 20 576 5 L 592 -1 Q 610 -9 614 -18 L 682 -22 712 -15 714 -14 718 -11 727 2 722 19 Q 702 40 642 37 L 625 39 609 40 654 48 697 45 704 44 725 41 Q 739 43 735 50 L 758 56 788 54 Q 814 58 826 66 840 75 831 83 L 826 89 828 91 Q 801 96 801 131 801 145 830 161 858 177 858 182 L 850 192 Q 841 202 841 210 841 220 862 236 L 883 249 873 253 858 260 866 250 838 247 829 245 836 254 843 268 Q 827 280 830 288 L 825 291 833 302 832 316 828 321 Q 818 332 802 338 L 753 341 744 340 Q 733 350 708 353 L 721 365 775 360 798 365 796 369 Q 792 381 797 393 L 787 398 787 399 Q 787 413 771 427 747 446 696 446 665 446 636 427 L 611 404 594 399 Q 587 399 570 415 553 431 496 431 L 457 408 420 382 422 378 414 377 375 368 Q 375 376 336 390 L 296 390 Q 288 385 272 380 250 372 242 373 L 231 367 Q 226 355 217 355 L 207 342 192 343 163 338 143 332 142 333 134 330 107 321 102 319 87 308 Q 87 292 112 283 88 277 76 266 L 70 255 68 250 -3 248 -20 242 Q -43 267 -67 267 L -102 264 -110 276 -119 274 -138 254 -168 235 -174 227 Q -174 187 -85 189 L -68 189 Q -106 174 -95 164 L -109 161 Q -150 154 -165 139 L -211 129 -232 131 -286 124 -285 122 -307 106 -192 107 Q -158 107 -141 119 -125 131 -105 131 -65 131 -56 109 -51 98 -55 86 -6 82 15 64 L 33 38 Q 88 43 106 21 113 12 113 -10 113 -36 89 -60 M 142 -265 L 140 -265 141 -266 142 -265 M 255 -108 L 280 -108 285 -107 289 -105 273 -112 255 -108 M 454 -62 L 536 -57 Q 552 -52 552 -33 552 -17 545 -17 533 -17 527 -29 L 521 -45 469 -54 416 -61 454 -62 M 840 31 Q 833 45 854 63 819 54 834 37 L 840 31 M 833 334 L 825 338 828 335 833 334 M 595 457 L 589 455 591 452 594 452 595 457 M 458 334 L 415 339 Q 420 351 452 359 490 368 490 376 L 526 376 522 375 507 360 496 359 Q 489 354 492 350 L 493 349 490 345 486 341 470 332 458 334 M 586 341 L 592 345 Q 616 361 636 367 636 363 643 360 596 351 608 339 L 610 337 608 336 604 334 586 341 M 565 363 L 549 369 562 380 593 381 578 367 568 358 565 363 M 721 303 L 704 301 701 302 Q 684 322 646 318 L 644 318 Q 648 323 639 329 L 638 330 664 330 682 323 707 317 Q 706 313 710 308 712 305 721 303 M 671 363 L 656 361 659 364 664 366 665 366 670 368 671 363 M 770 403 L 748 406 747 420 759 417 770 403 M 315 306 L 320 308 Q 338 318 363 319 L 340 306 Q 312 302 301 293 L 297 292 315 306 M 37 371 L 17 354 21 354 25 358 37 371 M 56 213 L 76 224 78 222 79 203 80 197 43 192 34 189 -10 193 -11 194 -17 197 Q 0 203 3 209 L 56 213 M 217 40 L 223 38 231 33 205 44 206 49 210 46 217 40 M 294 274 L 296 273 297 272 294 274 M -248 -630 L -250 -632 -248 -640 -248 -630 M 250 434 L 274 443 254 436 250 434 M -53 -2 L -54 1 -55 1 -56 -2 -53 -2 M -144 -271 L -142 -278 -139 -277 -140 -262 -152 -260 -144 -271 M -140 179 L -165 180 -205 161 Q -211 155 -207 152 L -146 154 Q -125 162 -140 179 M -70 278 L -79 279 -86 277 -70 278";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 249 -43 Q 327 -47 370 -29 407 -14 411 14 L 411 19 414 19 433 16 461 20 472 28 466 27 Q 493 36 511 54 L 515 56 517 61 519 59 521 56 534 52 562 50 Q 587 55 579 63 L 578 64 577 66 583 65 605 68 Q 676 78 693 86 L 701 91 713 89 751 89 Q 795 96 823 114 847 133 836 145 L 825 155 824 162 819 168 Q 824 174 819 177 L 814 183 807 203 785 240 736 287 734 309 Q 723 323 686 337 L 659 342 644 344 Q 542 395 504 376 473 367 457 350 L 384 343 371 339 369 338 344 335 Q 313 330 301 321 L 264 315 259 313 252 316 219 316 224 318 227 320 172 318 169 318 Q 101 318 76 293 L 70 283 Q 60 268 73 255 L 78 250 79 230 Q 87 194 105 175 L 113 162 Q 105 158 118 145 124 136 148 125 L 152 124 Q 195 82 231 61 L 191 78 186 78 Q 157 83 144 91 121 100 125 107 L 107 116 Q 77 130 41 162 L 26 180 17 182 Q -4 193 -9 210 L -17 207 -23 204 -30 204 -109 189 Q -171 178 -173 150 -176 127 -147 113 L -140 109 -123 92 Q -87 61 -58 45 L -40 36 Q -43 31 -22 20 L 20 8 25 8 Q 103 -25 155 -36 L 249 -43 M 297 301 L 294 302 296 302 297 301";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 157 -44 Q 154 -35 143 -25 L 131 -19 148 -15 Q 179 -4 179 10 180 19 173 26 150 40 95 26 46 14 64 -3 84 -16 86 -34 88 -43 79 -53 L 97 -55 Q 125 -58 137 -70 157 -58 157 -44 M 355 -22 Q 363 -28 380 -7 398 13 383 24 345 50 261 33 177 15 213 -10 231 -23 264 -28 L 355 -22 M 873 106 L 872 106 873 105 873 106 M 819 165 Q 803 182 742 179 687 176 701 156 L 660 161 Q 605 157 586 129 575 110 585 98 599 84 645 77 690 71 723 77 777 83 782 102 L 772 121 763 129 782 132 Q 815 136 821 148 825 156 819 165 M 894 218 L 895 218 893 219 878 219 871 215 852 240 Q 837 257 800 260 826 266 836 282 L 843 297 Q 827 308 830 316 L 825 319 833 330 832 344 828 350 Q 807 373 756 370 L 744 368 Q 728 383 685 381 637 381 652 365 L 682 351 726 344 729 342 739 333 725 333 701 329 701 331 Q 684 350 646 346 L 644 346 639 357 Q 627 371 608 365 591 358 602 346 609 338 621 338 620 334 622 329 L 640 316 660 308 Q 659 302 666 295 L 684 281 690 276 Q 698 267 711 266 L 721 266 748 258 736 253 695 230 Q 688 222 693 214 L 608 210 Q 599 203 600 197 L 608 189 Q 631 164 690 172 718 176 721 189 L 722 193 734 188 824 185 Q 868 192 871 210 L 871 207 877 199 Q 875 210 894 218 M 896 260 L 943 255 873 281 858 288 867 276 Q 878 266 896 260 M 693 51 Q 686 61 625 67 566 74 588 50 609 28 651 34 L 694 43 Q 701 45 693 51 M 425 23 Q 431 18 452 15 L 490 18 Q 521 29 510 45 500 51 450 45 400 39 425 23 M 417 87 L 414 86 410 87 416 88 417 87 M 470 119 Q 438 142 383 119 L 382 119 Q 388 124 385 131 L 376 143 332 145 Q 310 132 331 119 336 114 347 113 L 367 112 355 100 349 108 297 109 Q 262 102 282 88 289 83 302 81 320 76 334 81 L 349 90 Q 347 81 361 71 377 61 390 59 415 56 454 70 483 82 480 101 479 113 470 119 M 502 208 L 570 202 Q 610 208 638 224 671 241 657 256 L 616 280 521 287 Q 458 278 455 258 452 249 468 231 481 218 502 208 M 447 231 L 442 240 Q 434 249 405 250 381 251 397 234 L 406 223 432 219 Q 450 222 447 231 M 469 159 L 521 153 Q 543 157 547 164 L 544 172 Q 522 196 477 191 434 185 448 170 L 469 159 M 590 333 Q 558 365 475 358 391 350 419 318 433 303 467 295 L 532 292 Q 574 297 590 308 600 320 590 333 M 480 326 L 476 328 476 329 501 330 510 329 504 328 480 326 M 456 268 L 456 282 Q 439 298 399 293 361 288 377 271 382 263 397 260 L 446 255 Q 451 256 456 268 M 779 298 L 781 297 775 293 772 297 779 298 M 226 93 L 210 92 204 86 179 108 Q 161 121 123 119 145 129 150 147 156 166 146 172 L 127 182 Q 136 193 118 213 92 232 45 220 L 34 217 -27 218 Q -70 209 -51 197 -46 192 -18 187 15 183 25 187 L 26 187 27 187 41 179 28 176 6 169 6 171 Q -17 187 -50 176 L -52 176 Q -52 182 -60 185 L -92 187 Q -105 177 -93 167 -82 161 -72 162 L -67 155 -46 145 -24 140 -15 129 8 117 14 113 Q 25 107 36 107 L 48 108 73 106 64 98 34 69 Q 32 60 37 52 L -40 33 -45 19 -36 14 29 7 36 5 48 9 Q 73 19 72 31 L 72 36 83 35 Q 123 30 169 48 207 62 206 80 L 207 78 Q 211 71 217 69 L 235 64 Q 251 61 262 64 277 71 267 85 L 256 99 241 102 237 93 226 93 M 280 145 Q 317 159 315 177 315 188 304 196 L 289 205 300 209 Q 327 218 319 234 L 302 250 251 245 Q 220 232 240 214 L 197 203 Q 137 177 181 146 192 139 213 136 243 131 280 145 M 87 147 L 84 151 91 151 87 147 M 188 234 Q 219 245 216 263 216 273 208 280 L 120 283 Q 66 263 97 241 109 233 133 229 L 188 234 M -18 52 Q 6 76 -12 88 -28 99 -57 103 L -149 94 -183 79 -130 63 Q -72 41 -66 20 -37 33 -18 52 M -139 101 Q -102 114 -91 129 -84 142 -99 152 L -215 156 Q -293 133 -254 106 -236 94 -202 92 -168 91 -139 101 M -198 125 L -205 128 -182 134 -172 134 -177 131 -198 125";
	ctx.fillStyle=tocolor(ctrans.apply([184,197,199,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 803 85 Q 818 89 826 95 840 103 831 112 806 140 754 129 704 120 722 99 749 81 776 81 L 797 85 803 85 M 708 58 L 628 64 Q 553 58 577 31 L 579 29 565 32 564 26 594 28 603 26 645 29 651 28 666 30 678 29 690 38 708 58 M 395 -9 Q 407 -2 399 4 L 364 3 Q 341 -4 354 -13 L 363 -18 372 -17 389 -10 395 -9 M 331 -43 Q 338 -29 327 -23 311 -11 252 -33 206 -48 211 -62 L 223 -65 Q 254 -72 262 -79 L 255 -79 270 -81 277 -78 275 -78 331 -43 M 183 -57 L 202 -43 Q 212 -32 201 -25 L 123 -22 Q 80 -39 101 -55 L 115 -57 164 -51 Q 169 -51 172 -54 L 173 -55 176 -56 183 -57 M 89 -96 L 82 -100 Q 97 -107 118 -94 133 -85 150 -81 L 130 -81 110 -85 102 -89 101 -89 89 -96 M 93 -13 Q 107 -17 119 -13 143 -3 121 7 104 19 82 11 61 5 78 -7 L 93 -13 M 257 -99 L 285 -103 Q 303 -103 343 -74 384 -44 430 -43 L 482 -43 512 -33 Q 525 -29 525 -21 L 525 -20 Q 497 -43 399 -43 372 -43 340 -64 L 305 -90 Q 284 -105 257 -99 M 567 -5 L 564 -8 566 -11 Q 569 -6 574 -6 L 623 -18 Q 659 -27 704 -17 729 -18 752 9 L 771 32 Q 761 27 752 19 736 5 720 0 L 714 -1 690 -7 688 -7 662 -12 638 -8 630 -8 Q 609 -8 596 0 L 587 5 Q 575 2 567 -5 M 777 36 L 794 32 800 34 801 35 795 40 793 41 792 41 777 36 M 241 -94 L 204 -86 204 -87 241 -94 M 247 -18 L 273 -6 Q 277 -2 269 3 259 9 236 3 213 -5 226 -14 L 247 -18 M 834 66 L 840 60 Q 833 74 854 91 819 82 834 66 M 886 213 L 894 218 921 224 948 243 946 253 880 278 838 276 Q 785 266 767 255 754 247 762 239 775 224 819 217 L 886 213 M 874 167 Q 889 176 879 185 856 212 792 207 729 202 758 169 L 779 157 815 151 Q 860 157 874 167 M 833 362 L 825 366 828 363 833 362 M 815 355 Q 788 382 743 366 696 351 710 336 L 752 329 786 329 Q 815 331 818 343 821 349 815 355 M 724 43 L 715 34 722 40 724 42 724 43 M 732 81 L 705 86 Q 682 86 689 78 692 75 704 71 L 725 69 Q 742 71 732 81 M 642 82 L 663 89 660 83 666 83 671 87 666 90 663 89 662 98 Q 650 110 630 104 607 97 615 89 623 79 642 82 M 693 181 Q 734 187 739 200 744 208 736 218 702 253 642 237 583 223 604 200 612 192 636 185 L 693 181 M 674 162 Q 649 188 573 177 496 167 525 136 538 124 566 118 L 638 116 Q 675 121 680 140 682 151 674 162 M 724 167 Q 700 165 714 152 L 728 142 753 138 Q 780 142 763 155 748 171 724 167 M 525 55 L 526 66 568 67 Q 591 71 586 82 L 576 93 Q 552 119 502 113 L 495 112 493 114 Q 491 124 481 129 L 402 132 Q 353 114 379 94 414 70 469 89 L 486 77 435 69 Q 374 53 419 21 L 443 9 485 10 Q 504 17 518 40 L 544 35 550 51 525 55 M 481 166 L 479 175 Q 471 186 443 182 421 178 421 172 L 424 166 438 158 459 154 Q 478 157 481 166 M 423 205 Q 433 194 460 189 L 527 186 Q 581 194 578 210 577 220 563 228 545 247 472 238 401 229 423 205 M 599 235 Q 607 237 604 241 L 604 245 Q 594 255 579 253 563 252 570 243 582 233 599 235 M 511 276 L 493 281 Q 481 279 487 275 L 494 270 506 268 514 273 511 276 M 523 329 Q 506 326 515 318 L 530 311 558 308 Q 579 311 564 326 556 335 546 334 L 523 329 M 591 344 L 565 349 Q 552 346 560 339 568 329 585 332 595 333 593 339 L 591 344 M 548 280 Q 559 269 586 263 L 625 259 630 259 647 261 Q 678 266 681 277 L 678 289 Q 650 320 590 311 530 302 548 280 M 460 272 Q 448 286 431 280 415 276 426 264 434 255 455 257 464 258 464 266 L 460 272 M 408 263 Q 392 282 365 276 340 270 351 260 L 363 248 395 245 Q 411 247 410 255 L 408 263 M 379 355 L 367 350 Q 331 334 339 326 L 368 310 444 307 Q 489 313 498 330 505 340 496 350 L 458 363 439 366 Q 402 348 379 355 M 543 397 L 496 387 Q 489 381 492 378 506 363 554 370 572 373 568 386 554 389 543 397 M 643 402 L 643 401 Q 651 393 665 394 L 677 400 676 406 654 411 648 406 643 402 M 727 432 Q 671 424 685 409 692 402 716 395 L 775 388 798 394 796 397 Q 792 410 797 421 L 786 427 786 426 Q 784 412 774 412 L 747 425 728 432 727 432 M -171 176 L -146 182 Q -125 190 -140 207 L -156 210 -165 183 -171 176 M -25 264 L -33 264 Q -46 255 -34 247 -26 240 0 237 L 56 242 Q 82 252 85 263 L 80 272 71 266 49 263 39 261 -16 261 -25 264 M 89 282 L 96 281 105 281 Q 116 285 104 292 L 100 295 92 286 89 282 M 237 352 L 239 348 260 336 301 331 Q 325 334 324 345 L 319 356 Q 294 383 260 370 L 252 367 Q 235 359 237 352 M 721 293 Q 727 288 747 281 774 271 798 274 850 281 823 309 L 760 315 Q 706 310 721 293 M 722 276 L 716 281 699 280 Q 683 278 691 268 697 262 712 263 735 267 722 276 M 646 328 Q 654 318 669 320 685 323 677 333 L 655 338 Q 638 336 646 328 M 624 360 Q 640 356 683 360 687 365 699 371 704 376 701 383 689 395 655 390 595 381 608 366 L 624 360 M 382 71 L 285 75 Q 223 51 258 27 270 19 294 18 L 350 24 Q 386 39 391 53 393 64 382 71 M 354 120 L 346 127 Q 329 139 302 132 276 126 290 116 313 100 332 107 L 354 120 M 269 122 L 258 140 229 154 Q 202 157 154 140 105 122 93 107 85 97 96 89 112 77 155 78 197 79 230 91 267 104 269 122 M 288 81 Q 296 83 296 97 239 106 269 84 279 77 288 81 M 224 57 Q 192 80 133 62 75 46 114 19 L 138 11 174 12 Q 213 25 225 40 234 50 224 57 M 299 144 L 330 152 Q 353 160 342 166 L 319 171 287 168 Q 273 164 275 156 L 279 149 Q 286 143 299 144 M 289 210 Q 293 223 285 229 L 238 235 178 234 Q 149 231 142 208 136 190 144 185 155 176 180 171 L 247 178 Q 281 192 289 210 M 387 140 Q 401 145 395 151 376 162 357 161 336 159 358 144 L 369 138 387 140 M 336 179 L 339 182 339 184 365 182 Q 375 185 356 206 L 321 204 Q 300 194 319 181 L 336 179 M 39 106 Q 60 113 45 119 L 37 124 22 119 Q 7 114 18 107 L 39 106 M 75 63 L -17 66 Q -68 40 -42 23 -33 15 -5 13 L 50 19 Q 85 33 86 46 87 56 75 63 M 66 129 L 114 132 Q 162 149 128 171 L 66 166 Q 18 151 38 138 L 66 129 M 54 177 L 88 184 Q 113 192 113 204 L 106 215 Q 72 239 34 214 -4 190 12 178 L 54 177 M 148 230 Q 165 237 162 247 L 154 255 114 254 Q 86 245 99 234 L 114 227 148 230 M 189 297 L 190 295 193 296 Q 216 305 198 318 L 161 323 Q 138 318 157 308 159 305 172 301 L 189 297 M 155 287 L 129 284 Q 110 277 117 271 L 130 267 138 267 Q 158 275 157 282 L 155 287 M 330 305 Q 323 313 312 310 304 306 309 300 317 292 331 292 338 297 330 305 M 266 273 L 260 287 203 283 Q 166 268 181 258 L 223 251 264 256 266 273 M -60 56 Q -50 60 -54 64 L -58 66 Q -69 76 -83 71 -98 66 -87 59 L -60 56 M -37 86 L -21 91 Q 6 101 5 113 L -1 124 Q -39 151 -92 130 -147 111 -120 92 -106 82 -80 82 L -40 85 -37 86 M -172 82 L -179 78 -160 71 -157 73 Q -150 76 -152 78 L -156 81 -172 82 M -120 122 Q -101 129 -120 140 -131 150 -141 146 L -160 136 Q -177 131 -166 124 L -148 119 -120 122 M -129 153 L -103 150 Q -95 154 -98 159 L -102 162 -126 164 Q -138 159 -129 153 M -192 151 Q -201 159 -232 159 L -286 151 -285 150 -315 129 Q -343 107 -332 100 L -328 97 -290 92 -261 90 -228 99 Q -187 113 -184 133 -182 144 -192 151 M -41 169 Q -55 165 -44 156 L -23 154 Q -6 160 -18 167 L -41 169 M -71 230 L -48 228 Q -39 231 -40 235 L -42 242 Q -52 248 -67 242 -80 237 -71 230 M -93 190 L -75 185 -22 197 -8 211 Q -5 217 -11 223 L -57 222 Q -111 202 -93 190 M -356 116 L -352 110 -353 117 -353 118 -356 116";
	ctx.fillStyle=tocolor(ctrans.apply([204,216,218,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 88 -129 L 87 -125 Q 122 -88 152 -81 L 150 -81 Q 133 -85 118 -94 97 -107 82 -100 L 89 -96 81 -98 74 -97 72 -98 58 -106 70 -113 88 -110 84 -120 88 -129 M 195 -85 Q 225 -95 266 -123 L 270 -123 Q 289 -123 308 -106 L 311 -105 Q 326 -90 355 -74 L 382 -64 398 -60 405 -58 436 -54 454 -55 Q 512 -54 526 -35 L 538 -23 537 -20 544 -20 567 -15 605 -24 611 -26 628 -28 630 -28 685 -28 Q 719 -33 761 -3 L 766 6 Q 770 14 795 22 818 30 818 40 L 818 43 802 40 795 40 801 35 800 34 794 32 777 36 771 32 752 9 Q 729 -18 704 -17 659 -27 623 -18 L 574 -6 Q 569 -6 566 -11 L 564 -8 567 -5 554 -5 540 0 529 -17 525 -20 525 -21 Q 525 -29 512 -33 L 482 -43 430 -43 Q 384 -44 343 -74 303 -103 285 -103 L 257 -99 250 -97 241 -94 204 -87 204 -86 195 -85 M 559 26 L 546 30 532 29 537 29 559 26 M 511 22 L 500 13 487 -4 504 12 511 22 M 680 436 L 683 437 727 432 728 432 747 425 774 412 Q 784 412 786 426 L 786 427 Q 785 441 748 454 L 683 466 Q 660 466 643 444 625 422 589 422 560 422 548 435 536 448 521 448 486 448 448 416 411 384 401 384 377 384 343 397 L 300 409 Q 240 409 216 385 191 358 134 354 105 351 78 322 L 69 305 Q 54 290 13 290 L -29 295 -83 299 -131 290 -134 294 -138 297 Q -146 297 -156 276 L -157 273 -159 271 -173 245 Q -190 232 -239 210 L -240 207 Q -240 184 -191 210 L -193 205 -161 222 -151 238 -137 258 Q -117 272 -64 272 L -42 270 -55 269 -33 266 -25 264 -16 261 39 261 49 263 -1 264 Q 68 268 95 307 119 342 196 340 L 241 368 287 393 296 389 301 382 296 382 Q 291 386 286 386 278 386 264 376 L 300 380 335 368 367 359 366 360 370 362 Q 431 369 460 389 L 469 396 481 405 505 424 525 424 545 404 597 396 Q 620 396 644 423 668 449 690 449 L 706 444 703 439 683 440 680 436 M -209 173 L -211 167 -194 168 -191 172 -187 178 Q -196 174 -209 173 M -212 161 L -212 159 -200 163 -212 161";
	ctx.fillStyle=tocolor(ctrans.apply([221,228,230,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 818 43 L 821 44 793 41 795 40 802 40 818 43 M 829 64 L 829 66 Q 829 83 803 85 L 797 85 776 81 749 73 709 59 708 58 690 38 678 29 Q 691 27 692 19 L 708 25 722 33 726 33 726 34 728 43 Q 732 51 743 51 L 759 48 Q 792 66 821 66 L 829 64 M 562 26 L 559 26 537 29 532 29 511 22 504 12 487 -4 476 -6 395 -9 389 -10 372 -17 363 -23 331 -43 275 -78 277 -78 332 -50 362 -36 372 -25 Q 378 -18 387 -18 503 -15 524 7 537 20 562 26 M 211 -62 L 183 -57 176 -56 173 -55 174 -58 239 -74 255 -79 262 -79 Q 254 -72 223 -65 L 211 -62 M 540 0 L 554 -5 567 -5 Q 575 2 587 5 L 559 8 Q 545 8 540 0 M 638 -8 L 662 -12 688 -7 677 -4 669 -1 656 -4 638 -8 M 724 42 L 722 40 715 34 724 43 727 44 724 42 M 651 28 L 645 29 603 26 605 25 637 22 647 26 651 28";
	ctx.fillStyle=tocolor(ctrans.apply([157,176,179,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 88 -129 L 88 -131 91 -129 115 -111 Q 138 -95 163 -95 187 -95 218 -108 L 221 -109 237 -117 254 -125 266 -123 Q 225 -95 195 -85 L 152 -81 Q 122 -88 87 -125 L 88 -129 M 454 -55 L 445 -55 Q 404 -55 394 -66 L 423 -65 476 -71 525 -67 Q 541 -62 548 -49 552 -41 583 -41 L 617 -45 Q 767 -45 769 -3 L 765 0 761 -3 Q 719 -33 685 -28 L 630 -28 628 -28 611 -26 605 -24 567 -15 544 -20 538 -23 526 -35 Q 512 -54 454 -55 M 439 366 Q 470 381 509 412 522 412 541 398 L 543 397 Q 554 389 568 386 L 585 384 Q 619 384 643 402 L 648 406 654 411 680 436 683 440 703 439 706 444 690 449 Q 668 449 644 423 620 396 597 396 L 545 404 525 424 505 424 481 405 469 396 460 389 Q 431 369 370 362 L 366 360 367 359 368 359 Q 373 356 379 355 402 348 439 366 M -193 205 L -250 177 Q -244 171 -232 171 L -209 173 Q -196 174 -187 178 L -191 172 -193 168 -194 168 -211 167 -213 167 -221 164 -221 160 -212 161 -200 163 Q -180 166 -171 176 L -165 183 -156 210 -154 218 -130 250 Q -113 264 -55 269 L -42 270 -64 272 Q -117 272 -137 258 L -151 238 -159 224 -161 222 -193 205 M 80 272 L 89 282 92 286 100 295 116 307 146 323 194 335 228 345 237 352 Q 235 359 252 367 L 264 376 Q 278 386 286 386 291 386 296 382 L 301 382 296 389 287 393 241 368 196 340 Q 119 342 95 307 68 268 -1 264 L 49 263 71 266 80 272";
	ctx.fillStyle=tocolor(ctrans.apply([240,243,244,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 152 -81 L 195 -85 204 -86 241 -94 250 -97 257 -99 Q 284 -105 305 -90 L 340 -64 Q 372 -43 399 -43 497 -43 525 -20 L 529 -17 540 0 Q 545 8 559 8 L 587 5 596 0 Q 609 -8 630 -8 L 638 -8 656 -4 669 -1 677 -4 688 -7 690 -7 714 -1 720 0 Q 736 5 752 19 761 27 771 32 L 777 36 792 41 793 41 821 44 832 44 841 46 842 52 834 61 829 64 821 66 Q 792 66 759 48 L 743 51 Q 732 51 728 43 L 726 34 726 33 722 33 708 25 692 19 Q 691 27 678 29 L 666 30 651 28 647 26 637 22 605 25 603 26 594 28 564 26 562 26 Q 537 20 524 7 503 -15 387 -18 378 -18 372 -25 L 362 -36 332 -50 277 -78 270 -81 255 -79 239 -74 174 -58 173 -55 172 -54 Q 169 -51 164 -51 L 115 -57 93 -64 Q 55 -76 55 -84 L 61 -93 74 -97 81 -98 89 -96 101 -89 102 -89 110 -85 130 -81 150 -81 152 -81";
	ctx.fillStyle=tocolor(ctrans.apply([132,155,157,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function shape3768(ctx,ctrans,frame,ratio,time){
	var pathData="M 177 -139 Q 190 -133 189 -125 L 186 -121 Q 174 -112 154 -121 135 -128 147 -137 L 160 -140 177 -139 M 389 -68 Q 380 -73 380 -82 380 -111 417 -107 453 -103 453 -87 434 -63 416 -63 L 389 -68 M 324 -147 L 362 -131 Q 374 -124 374 -113 L 373 -106 344 -99 305 -99 Q 287 -106 279 -112 297 -144 324 -147 M 91 -10 Q 91 -36 67 -60 L 64 -62 Q 66 -71 57 -81 L 75 -83 104 -91 110 -94 115 -98 120 -95 147 -91 180 -70 204 -72 Q 177 -86 197 -100 227 -120 263 -107 294 -96 306 -76 L 310 -68 348 -58 Q 385 -43 389 -15 L 389 -9 392 -9 403 -11 421 -19 463 -18 Q 482 -12 496 13 L 522 7 528 22 540 23 Q 565 26 557 35 L 556 35 555 37 561 36 562 36 Q 558 34 562 28 541 19 555 3 L 587 -17 660 -22 Q 702 -17 705 2 L 700 19 Q 680 40 620 37 L 603 39 587 40 632 48 675 45 682 44 703 41 Q 717 43 713 50 L 736 56 766 54 Q 792 58 804 66 818 75 809 83 L 804 89 806 91 Q 779 96 779 131 779 145 808 161 L 836 182 828 192 Q 819 202 819 210 819 220 840 236 L 861 249 851 253 836 260 844 250 816 247 807 245 814 254 821 268 Q 805 280 808 288 L 803 291 811 302 810 316 806 321 780 338 731 341 722 340 Q 711 350 686 353 L 699 365 753 360 776 365 774 369 Q 770 381 775 393 L 765 398 765 399 Q 765 413 749 427 725 446 674 446 643 446 614 427 L 589 404 572 399 Q 565 399 548 415 531 431 474 431 L 435 408 Q 398 386 398 382 L 400 378 392 377 353 368 Q 353 376 314 390 L 269 390 Q 230 381 205 364 L 201 360 198 359 193 355 195 355 185 342 170 343 112 330 Q 65 316 65 308 65 292 90 283 66 277 54 266 L 48 255 46 250 -25 248 -42 242 Q -65 267 -89 267 L -124 264 Q -127 275 -149 286 -178 300 -217 300 L -242 293 -259 276 Q -259 262 -250 257 L -209 240 -182 240 -196 227 Q -196 187 -107 189 L -90 189 Q -128 174 -117 164 L -131 161 Q -172 154 -187 139 L -233 129 -254 131 -308 124 -307 122 -329 106 -214 107 Q -180 107 -163 119 -147 131 -127 131 -87 131 -78 109 -73 98 -77 86 -28 82 -7 64 L 11 38 Q 66 43 84 21 91 12 91 -10 M 506 -71 L 536 -68 522 -55 Q 560 -43 560 -24 L 552 -11 554 -10 Q 567 -5 557 0 L 543 3 542 -2 517 4 485 -13 Q 459 -30 459 -41 459 -72 509 -59 L 501 -65 506 -71 M 435 -44 L 414 -43 Q 397 -47 405 -52 L 416 -55 430 -54 Q 447 -46 435 -44 M 744 -25 L 695 -25 Q 674 -34 674 -49 674 -75 723 -77 771 -81 771 -56 L 764 -38 Q 756 -27 744 -25 M 570 -62 Q 570 -73 607 -76 644 -80 644 -57 L 640 -43 611 -38 579 -43 Q 570 -48 570 -62 M 832 63 Q 797 54 812 37 L 818 31 Q 811 45 832 63 M 761 24 Q 741 21 749 11 754 7 763 5 L 779 4 Q 794 8 795 14 L 794 19 Q 784 29 761 24 M 557 428 L 582 427 597 431 614 431 Q 624 434 633 448 L 641 465 633 472 620 478 554 481 Q 530 481 530 452 530 444 539 440 L 552 436 557 428 M 419 470 Q 411 467 411 458 411 451 436 445 L 485 444 Q 497 454 482 464 466 474 442 474 L 419 470 M 405 412 L 408 425 405 444 374 444 327 427 311 414 Q 311 407 324 401 L 389 401 405 412 M 471 349 L 468 345 464 341 448 332 436 334 393 339 Q 398 351 430 359 468 368 468 376 L 504 376 500 375 485 360 474 359 Q 467 354 470 350 L 471 349 M 582 334 L 564 341 570 345 Q 594 361 614 367 614 363 621 360 574 351 586 339 L 588 337 586 336 582 334 M 546 358 L 543 363 527 369 540 380 571 381 556 367 546 358 M 806 335 L 811 334 803 338 806 335 M 699 303 L 682 301 679 302 Q 662 322 624 318 L 622 318 Q 626 323 617 329 L 616 330 642 330 660 323 685 317 688 308 Q 690 305 699 303 M 636 478 L 649 469 680 465 686 479 Q 687 490 665 490 659 490 636 478 M 634 361 L 637 364 642 366 643 366 648 368 649 363 634 361 M 725 420 L 737 417 748 403 726 406 725 420 M 341 319 Q 323 312 318 306 290 302 279 293 L 275 292 293 306 298 308 341 319 M 96 399 L 88 401 71 396 Q 61 391 61 382 61 369 71 363 74 324 142 346 177 358 212 378 212 387 197 391 L 200 402 198 408 191 411 Q 176 413 154 401 L 148 401 142 399 118 404 96 399 M 5 354 L 38 364 Q 56 369 56 379 L 47 388 26 396 4 381 -14 363 -12 356 -10 354 5 354 M 65 329 L 61 338 Q 54 346 41 346 L -4 342 Q -19 338 -19 327 -19 307 23 309 65 312 65 329 M 34 213 L 54 224 56 222 57 203 58 197 21 192 12 189 -32 193 -33 194 -39 197 -19 209 34 213 M 183 44 L 184 49 188 46 195 40 201 38 209 33 183 44 M 272 274 L 274 273 275 272 272 274 M 266 444 Q 251 444 232 436 212 426 212 416 212 384 253 394 294 404 294 434 L 290 443 266 444 M -75 -2 L -76 1 -77 1 -78 -2 -75 -2 M -162 179 L -187 180 Q -207 169 -227 161 -233 155 -229 152 L -168 154 Q -147 162 -162 179 M -58 307 L -92 316 -119 307 Q -133 297 -133 287 L -130 276 Q -44 277 -44 292 L -58 307";
	ctx.fillStyle=tocolor(ctrans.apply([152,118,120,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 133 -36 L 227 -43 Q 305 -47 348 -29 385 -14 389 14 L 389 19 392 19 411 16 439 20 450 28 444 27 Q 471 36 489 54 L 493 56 495 61 497 59 499 56 512 52 540 50 Q 565 55 557 63 L 556 64 555 66 561 65 583 68 Q 654 78 671 86 L 679 91 691 89 729 89 Q 773 96 801 114 825 133 814 145 L 803 155 802 162 797 168 Q 802 174 797 177 L 792 183 785 203 763 240 714 287 712 309 Q 701 323 664 337 L 637 342 622 344 Q 520 395 482 376 451 367 435 350 L 362 343 349 339 347 338 322 335 Q 291 330 279 321 L 242 315 237 313 230 316 197 316 202 318 205 320 150 318 147 318 Q 79 318 54 293 L 48 283 Q 38 268 51 255 L 56 250 57 230 Q 65 194 83 175 L 91 162 Q 83 158 96 145 102 136 126 125 L 130 124 Q 173 82 209 61 190 68 169 78 L 164 78 Q 135 83 122 91 99 100 103 107 L 85 116 Q 55 130 19 162 L 4 180 -5 182 Q -26 193 -31 210 L -39 207 -45 204 -52 204 -131 189 Q -193 178 -195 150 -198 127 -169 113 -164 111 -162 109 L -145 92 -80 45 -62 36 Q -65 31 -44 20 L -2 8 3 8 Q 81 -25 133 -36 M 275 301 L 272 302 274 302 275 301";
	ctx.fillStyle=tocolor(ctrans.apply([155,139,163,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 64 -34 Q 66 -43 57 -53 L 75 -55 Q 103 -58 115 -70 135 -58 135 -44 132 -35 121 -25 L 109 -19 126 -15 Q 157 -4 157 10 158 19 151 26 128 40 73 26 24 14 42 -3 62 -16 64 -34 M 333 -22 Q 341 -28 358 -7 376 13 361 24 323 50 239 33 155 15 191 -10 209 -23 242 -28 L 333 -22 M 851 105 L 851 106 850 106 851 105 M 856 219 L 849 215 830 240 Q 815 257 778 260 804 266 814 282 L 821 297 Q 805 308 808 316 L 803 319 811 330 810 344 806 350 Q 785 373 734 370 L 722 368 Q 706 383 663 381 615 381 630 365 634 360 660 351 L 704 344 707 342 717 333 703 333 679 329 679 331 Q 662 350 624 346 L 622 346 Q 626 350 617 357 605 371 586 365 569 358 580 346 587 338 599 338 L 600 329 618 316 638 308 Q 637 302 644 295 L 662 281 668 276 Q 676 267 689 266 L 699 266 726 258 714 253 Q 685 239 673 230 666 222 671 214 L 586 210 Q 577 203 578 197 L 586 189 Q 609 164 668 172 696 176 699 189 L 700 193 712 188 802 185 Q 846 192 849 210 L 849 207 855 199 Q 853 210 872 218 L 873 218 871 219 856 219 M 851 281 L 836 288 845 276 Q 856 266 874 260 L 921 255 Q 879 269 851 281 M 750 121 L 741 129 760 132 Q 793 136 799 148 803 156 797 165 781 182 720 179 665 176 679 156 L 638 161 Q 583 157 564 129 553 110 563 98 577 84 623 77 668 71 701 77 755 83 760 102 760 111 750 121 M 671 51 Q 664 61 603 67 544 74 566 50 587 28 629 34 L 672 43 Q 679 45 671 51 M 468 18 Q 499 29 488 45 478 51 428 45 378 39 403 23 L 430 15 468 18 M 458 101 Q 457 113 448 119 416 142 361 119 L 360 119 Q 366 124 363 131 L 354 143 310 145 Q 288 132 309 119 314 114 325 113 L 345 112 333 100 327 108 275 109 Q 240 102 260 88 267 83 280 81 298 76 312 81 L 327 90 Q 325 81 339 71 355 61 368 59 393 56 432 70 461 82 458 101 M 420 240 Q 412 249 383 250 359 251 375 234 L 384 223 410 219 Q 428 222 425 231 L 420 240 M 499 153 Q 521 157 525 164 L 522 172 Q 500 196 455 191 412 185 426 170 L 447 159 Q 472 149 499 153 M 480 208 L 548 202 Q 588 208 616 224 649 241 635 256 622 270 594 280 L 499 287 Q 436 278 433 258 430 249 446 231 459 218 480 208 M 568 308 Q 578 320 568 333 536 365 453 358 369 350 397 318 411 303 445 295 L 510 292 Q 552 297 568 308 M 434 268 L 434 282 Q 417 298 377 293 339 288 355 271 360 263 375 260 L 424 255 Q 429 256 434 268 M 454 329 L 479 330 488 329 482 328 458 326 454 328 454 329 M 753 293 L 750 297 757 298 759 297 753 293 M 395 87 L 392 86 388 87 394 88 395 87 M 234 99 L 219 102 215 93 204 93 188 92 182 86 157 108 Q 139 121 101 119 123 129 128 147 134 166 124 172 L 105 182 Q 114 193 96 213 70 232 23 220 L 12 217 -49 218 Q -92 209 -73 197 L -40 187 Q -7 183 3 187 L 4 187 5 187 19 179 6 176 -16 169 -16 171 Q -39 187 -72 176 L -74 176 -82 185 -114 187 Q -127 177 -115 167 -104 161 -94 162 L -89 155 -68 145 -46 140 -37 129 -14 117 -8 113 Q 3 107 14 107 L 26 108 51 106 42 98 12 69 Q 10 60 15 52 L -62 33 -67 19 -58 14 7 7 14 5 26 9 Q 51 19 50 31 L 50 36 61 35 Q 101 30 147 48 185 62 184 80 L 185 78 195 69 213 64 Q 229 61 240 64 255 71 245 85 L 234 99 M 218 214 L 175 203 Q 115 177 159 146 170 139 191 136 221 131 258 145 295 159 293 177 293 188 282 196 L 267 205 278 209 Q 305 218 297 234 L 280 250 229 245 Q 198 232 218 214 M 65 147 L 62 151 69 151 65 147 M 166 234 Q 197 245 194 263 194 273 186 280 L 98 283 Q 44 263 75 241 87 233 111 229 L 166 234 M -40 52 Q -16 76 -34 88 -50 99 -79 103 L -171 94 -205 79 -152 63 Q -94 41 -88 20 -59 33 -40 52 M -199 131 L -220 125 -227 128 -204 134 -194 134 -199 131 M -121 152 L -237 156 Q -315 133 -276 106 -258 94 -224 92 -190 91 -161 101 -124 114 -113 129 -106 142 -121 152";
	ctx.fillStyle=tocolor(ctrans.apply([173,168,176,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 71 -13 Q 85 -17 97 -13 121 -3 99 7 82 19 60 11 39 5 56 -7 L 71 -13 M 79 -55 L 110 -65 147 -62 Q 171 -55 180 -43 190 -32 179 -25 L 101 -22 Q 58 -39 79 -55 M 177 -110 Q 190 -105 189 -97 L 186 -92 Q 174 -85 154 -92 135 -101 147 -108 L 160 -112 177 -110 M 305 -23 Q 289 -11 230 -33 170 -53 197 -71 227 -92 263 -79 294 -68 306 -48 317 -30 305 -23 M 341 -18 L 361 -14 Q 388 -5 377 4 L 342 3 Q 319 -4 332 -13 L 341 -18 M 225 -18 L 251 -6 Q 255 -2 247 3 237 9 214 3 191 -5 204 -14 216 -22 225 -18 M 430 -25 Q 447 -18 435 -15 430 -12 414 -15 397 -18 405 -23 L 416 -27 430 -25 M 832 91 Q 797 82 812 66 L 818 60 Q 811 74 832 91 M 857 185 Q 834 212 770 207 707 202 736 169 742 164 757 157 L 793 151 Q 838 157 852 167 867 176 857 185 M 926 243 L 924 253 858 278 816 276 Q 763 266 745 255 732 247 740 239 753 224 797 217 L 864 213 872 218 899 224 Q 921 233 926 243 M 804 95 Q 818 103 809 112 784 140 732 129 682 120 700 99 733 77 766 82 792 86 804 95 M 795 41 L 794 46 Q 784 57 761 53 741 49 749 39 754 35 763 33 L 779 33 Q 794 35 795 41 M 705 30 L 700 48 Q 678 71 606 64 531 58 555 31 L 557 29 543 32 Q 538 28 545 19 L 549 18 554 19 561 26 Q 571 18 587 12 L 660 6 Q 702 12 705 30 M 638 83 L 644 83 649 87 644 90 641 89 640 98 Q 628 110 608 104 585 97 593 89 601 79 620 82 L 641 89 638 83 M 703 69 Q 720 71 710 81 L 683 86 Q 660 86 667 78 670 75 682 71 L 703 69 M 652 162 Q 627 188 551 177 474 167 503 136 516 124 544 118 L 616 116 Q 653 121 658 140 660 151 652 162 M 671 181 Q 712 187 717 200 722 208 714 218 680 253 620 237 561 223 582 200 590 192 614 185 L 671 181 M 706 142 L 731 138 Q 758 142 741 155 726 171 702 167 678 165 692 152 L 706 142 M 528 51 L 503 55 504 66 546 67 Q 569 71 564 82 L 554 93 Q 530 119 480 113 L 473 112 471 114 459 129 380 132 Q 331 114 357 94 392 70 447 89 454 83 464 77 L 413 69 Q 352 53 397 21 L 421 9 463 10 Q 482 17 496 40 L 522 35 528 51 M 459 166 L 457 175 Q 449 186 421 182 399 178 399 172 L 402 166 Q 407 161 416 158 L 437 154 Q 456 157 459 166 M 505 186 Q 559 194 556 210 555 220 541 228 523 247 450 238 379 229 401 205 411 194 438 189 L 505 186 M 577 235 Q 585 237 582 241 L 582 245 Q 572 255 557 253 541 252 548 243 560 233 577 235 M 603 259 L 608 259 625 261 Q 656 266 659 277 L 656 289 Q 628 320 568 311 508 302 526 280 537 269 564 263 L 603 259 M 538 339 Q 546 329 563 332 573 333 571 339 L 569 344 Q 560 353 543 349 530 346 538 339 M 524 334 L 501 329 Q 484 326 493 318 L 508 311 536 308 Q 557 311 542 326 534 335 524 334 M 602 360 Q 618 356 661 360 L 677 371 Q 682 376 679 383 667 395 633 390 573 381 586 366 591 361 602 360 M 492 273 L 489 276 471 281 Q 459 279 465 275 L 472 270 484 268 Q 493 271 492 273 M 442 266 L 438 272 Q 426 286 409 280 393 276 404 264 412 255 433 257 442 258 442 266 M 474 350 L 436 363 381 366 381 364 345 350 Q 309 334 317 326 324 318 346 310 L 422 307 Q 467 313 476 330 483 340 474 350 M 470 378 Q 484 363 532 370 554 374 543 392 L 521 397 474 387 Q 467 381 470 378 M 738 315 Q 684 310 699 293 705 288 725 281 752 271 776 274 828 281 801 309 L 738 315 M 796 343 L 793 355 Q 766 382 721 366 674 351 688 336 693 330 730 329 L 764 329 Q 793 331 796 343 M 806 363 L 811 362 803 366 806 363 M 694 281 L 677 280 Q 661 278 669 268 675 262 690 263 713 267 700 276 L 694 281 M 633 338 Q 616 336 624 328 632 318 647 320 663 323 655 333 L 633 338 M 621 401 Q 629 393 643 394 L 655 400 654 406 630 411 Q 614 409 621 401 M 663 409 L 694 395 753 388 776 394 774 397 Q 770 410 775 421 748 439 705 432 649 424 663 409 M 360 71 Q 324 98 263 75 201 51 236 27 248 19 272 18 L 328 24 Q 364 39 369 53 371 64 360 71 M 332 120 L 324 127 Q 307 139 280 132 254 126 268 116 291 100 310 107 330 114 332 120 M 247 122 L 236 140 207 154 Q 180 157 132 140 83 122 71 107 63 97 74 89 90 77 133 78 175 79 208 91 245 104 247 122 M 247 84 Q 257 77 266 81 274 83 274 97 217 106 247 84 M 277 144 L 308 152 Q 331 160 320 166 L 297 171 265 168 Q 251 164 253 156 L 257 149 Q 264 143 277 144 M 263 229 L 216 235 156 234 Q 127 231 120 208 114 190 122 185 133 176 158 171 L 225 178 Q 259 192 267 210 271 223 263 229 M 297 181 L 314 179 317 182 317 184 343 182 Q 353 185 334 206 L 299 204 Q 278 194 297 181 M 373 151 Q 354 162 335 161 314 159 336 144 L 347 138 365 140 Q 379 145 373 151 M 152 12 Q 191 25 203 40 212 50 202 57 170 80 111 62 53 46 92 19 L 116 11 152 12 M 23 119 L 15 124 0 119 Q -15 114 -4 107 L 17 106 Q 38 113 23 119 M 64 46 Q 65 56 53 63 L -39 66 Q -90 40 -64 23 -55 15 -27 13 L 28 19 Q 63 33 64 46 M 44 129 L 92 132 Q 140 149 106 171 L 44 166 Q -4 151 16 138 22 133 44 129 M 92 227 L 126 230 Q 143 237 140 247 L 132 255 92 254 Q 64 245 77 234 88 227 92 227 M 12 214 Q -26 190 -10 178 L 32 177 66 184 Q 91 192 91 204 L 84 215 Q 50 239 12 214 M 168 295 L 171 296 Q 194 305 176 318 L 139 323 Q 116 318 135 308 137 305 150 301 L 167 297 168 295 M 159 258 L 201 251 242 256 244 273 238 287 Q 219 299 181 283 144 268 159 258 M 133 287 L 107 284 Q 88 277 95 271 L 108 267 116 267 Q 136 275 135 282 L 133 287 M 58 272 L -25 276 Q -76 260 -56 247 -48 240 -22 237 L 34 242 Q 60 252 63 263 L 58 272 M 82 292 Q 75 298 64 292 55 287 60 283 L 74 281 83 281 Q 94 285 82 292 M 386 263 Q 370 282 343 276 318 270 329 260 L 341 248 373 245 Q 389 247 388 255 L 386 263 M 308 305 Q 301 313 290 310 282 306 287 300 295 292 309 292 316 297 308 305 M 279 331 Q 303 334 302 345 L 297 356 Q 272 383 238 370 206 358 217 348 L 238 336 279 331 M -59 86 L -43 91 Q -16 101 -17 113 L -23 124 Q -61 151 -114 130 -169 111 -142 92 -128 82 -102 82 L -62 85 -59 86 M -80 66 Q -91 76 -105 71 -120 66 -109 59 -96 50 -82 56 -72 60 -76 64 L -80 66 M -179 73 Q -172 76 -174 78 -174 81 -178 81 L -194 82 -201 78 -182 71 -179 73 M -142 122 Q -123 129 -142 140 -153 150 -163 146 L -182 136 Q -199 131 -188 124 L -170 119 -142 122 M -120 159 L -124 162 -148 164 Q -160 159 -151 153 L -125 150 Q -117 154 -120 159 M -187 208 L -227 190 Q -233 182 -229 180 L -168 182 Q -147 190 -162 207 L -187 208 M -40 167 L -63 169 Q -77 165 -66 156 L -45 154 Q -28 160 -40 167 M -64 242 Q -74 248 -89 242 -102 237 -93 230 L -70 228 -62 235 -64 242 M -33 223 L -79 222 Q -133 202 -115 190 L -97 185 -44 197 -30 211 Q -27 217 -33 223 M -250 99 Q -209 113 -206 133 -204 144 -214 151 -223 159 -254 159 L -308 151 -307 150 -337 129 Q -365 107 -354 100 L -350 97 -312 92 -283 90 -250 99 M -375 117 L -375 118 -378 116 -374 110 -375 117";
	ctx.fillStyle=tocolor(ctrans.apply([196,196,196,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 799 81 L 801 82 800 79 799 81 M 822 137 L 817 146 810 137 805 142 800 138 804 129 784 86 747 80 Q 742 81 736 76 L 730 69 730 66 720 66 720 77 715 77 714 75 708 59 710 55 731 55 729 54 727 49 728 45 Q 781 49 800 60 814 68 814 85 L 807 95 808 104 822 137 M 707 -42 L 701 -41 Q 697 -41 695 -47 L 693 -54 671 -52 Q 664 -54 664 -60 664 -77 719 -88 774 -99 774 -61 L 773 -52 766 -50 762 -52 749 -70 737 -59 706 -52 707 -42 M 625 -62 L 619 -64 614 -63 625 -62 M 548 -3 Q 548 -11 553 -11 L 556 -10 Q 559 0 565 0 L 596 -17 Q 621 -32 663 -26 L 684 -10 699 7 698 18 689 28 Q 682 28 682 22 L 687 14 686 8 Q 685 4 676 1 L 613 -4 596 11 578 25 Q 548 7 548 -3 M 585 -62 L 584 -67 Q 584 -87 615 -83 646 -79 646 -56 646 -47 637 -47 606 -47 600 -67 L 592 -60 585 -62 M 370 -90 Q 385 -89 394 -103 403 -118 421 -119 L 444 -102 456 -85 455 -79 450 -78 443 -80 434 -87 436 -87 444 -86 444 -87 428 -98 387 -81 Q 379 -81 370 -90 M 346 -126 L 328 -126 318 -120 308 -117 Q 299 -117 293 -124 L 288 -135 Q 288 -143 329 -147 L 355 -133 Q 364 -127 364 -117 364 -108 357 -108 L 343 -112 333 -117 334 -118 353 -117 353 -120 346 -126 M 202 -86 L 201 -90 Q 201 -117 244 -113 288 -109 314 -75 323 -63 343 -58 L 378 -49 Q 397 -40 408 -13 423 -13 432 -22 442 -32 452 -32 L 459 -31 459 -37 Q 459 -72 509 -67 559 -61 559 -31 L 559 -23 551 -13 541 -20 Q 547 -23 547 -29 L 545 -36 Q 541 -44 534 -44 L 475 -35 471 -28 Q 483 -25 491 -15 L 502 8 Q 502 16 496 16 L 490 14 Q 491 7 484 -3 474 -17 453 -17 L 437 -6 Q 420 5 401 5 L 386 -19 Q 372 -44 331 -44 306 -44 301 -56 294 -76 239 -98 L 224 -98 216 -91 206 -85 202 -86 M 77 -69 L 79 -84 Q 87 -95 116 -95 L 152 -90 168 -80 167 -75 181 -84 186 -82 Q 182 -63 166 -63 L 134 -69 95 -75 89 -72 Q 93 -64 78 -54 L 77 -69";
	ctx.fillStyle=tocolor(ctrans.apply([122,90,92,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite3769(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3765",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3766",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3767",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3768",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
}

var imageObj445=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/445.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj445,"assets/takeover/art/images/445.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj445.src="assets/takeover/art/images/445.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj447,"assets/takeover/art/images/447.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj447.src="assets/takeover/art/images/447.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj449,"assets/takeover/art/images/449.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj449.src="assets/takeover/art/images/449.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj451,"assets/takeover/art/images/451.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj451.src="assets/takeover/art/images/451.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj454,"assets/takeover/art/images/454.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj454.src="assets/takeover/art/images/454.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj456,"assets/takeover/art/images/456.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj456.src="assets/takeover/art/images/456.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj458,"assets/takeover/art/images/458.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj458.src="assets/takeover/art/images/458.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj460,"assets/takeover/art/images/460.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj460.src="assets/takeover/art/images/460.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj464,"assets/takeover/art/images/464.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj464.src="assets/takeover/art/images/464.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj466,"assets/takeover/art/images/466.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj466.src="assets/takeover/art/images/466.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj468,"assets/takeover/art/images/468.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj468.src="assets/takeover/art/images/468.png";
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
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj470,"assets/takeover/art/images/470.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj470.src="assets/takeover/art/images/470.png";
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

var imageObj3800=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/3800.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj3800,"assets/takeover/art/images/3800.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj3800.src="assets/takeover/art/images/3800.png";
function image3800(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 880 1500 880 1500 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0133333333333334,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3800);
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

function shape3801(ctx,ctrans,frame,ratio,time){
	var pathData="M 700 232 L -800 232 -800 -648 700 -648 700 232";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-800,-648);
	ctx.transform(1.0133333333333334,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3800);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj473=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/473.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj473,"assets/takeover/art/images/473.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj473.src="assets/takeover/art/images/473.png";
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

var imageObj3802=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/3802.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj3802,"assets/takeover/art/images/3802.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj3802.src="assets/takeover/art/images/3802.png";
function image3802(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 900 1480 900 1480 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0135135135135136,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3802);
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

function shape3803(ctx,ctrans,frame,ratio,time){
	var pathData="M 692 227 L -788 227 -788 -673 692 -673 692 227";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-788,-673);
	ctx.transform(1.0135135135135136,0,0,1.0222222222222221,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3802);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj475=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/475.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj475,"assets/takeover/art/images/475.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj475.src="assets/takeover/art/images/475.png";
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

var imageObj3804=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/3804.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj3804,"assets/takeover/art/images/3804.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj3804.src="assets/takeover/art/images/3804.png";
function image3804(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 940 1520 940 1520 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.013157894736842,0,0,1.0212765957446808,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3804);
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

function shape3805(ctx,ctrans,frame,ratio,time){
	var pathData="M 700 220 L -820 220 -820 -720 700 -720 700 220";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-820,-720);
	ctx.transform(1.013157894736842,0,0,1.0212765957446808,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3804);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj477=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/477.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj477,"assets/takeover/art/images/477.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj477.src="assets/takeover/art/images/477.png";
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

var imageObj3806=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/3806.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj3806,"assets/takeover/art/images/3806.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj3806.src="assets/takeover/art/images/3806.png";
function image3806(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 880 1500 880 1500 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0133333333333334,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3806);
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

function shape3807(ctx,ctrans,frame,ratio,time){
	var pathData="M 692 217 L -808 217 -808 -663 692 -663 692 217";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,-808,-663);
	ctx.transform(1.0133333333333334,0,0,1.0227272727272727,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj3806);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj479=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/479.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj479,"assets/takeover/art/images/479.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj479.src="assets/takeover/art/images/479.png";
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

function sprite3808(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 4;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape3801",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 1:
			place("shape3803",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 2:
			place("shape3805",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
		case 3:
			place("shape3807",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
			break;
	}
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

var imageObj4321=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/4321.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj4321,"assets/takeover/art/images/4321.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj4321.src="assets/takeover/art/images/4321.png";
function image4321(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1240 4440 1240 4440 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0045045045045045,0,0,1.0161290322580645,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4321);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

var imageObj4322=window.NativeAssetPacks?window.NativeAssetPacks.image("assets/takeover/art/images/4322.png"):document.createElement("img");
if(window.NativeAssetPacks)window.NativeAssetPacks.assign(imageObj4322,"assets/takeover/art/images/4322.png","assets/takeover/packs/map-2.pack?v=f684183f9ffbd304");else imageObj4322.src="assets/takeover/art/images/4322.png";
function image4322(ctx,ctrans,frame,ratio,time){
	var pathData="M 0 0 L 0 1140 6580 1140 6580 0 0 0";
	drawPath(ctx,pathData,false);
	ctx.save();
	ctx.clip();
	ctx.transform(20,0,0,20,0,0);
	ctx.transform(1.0030395136778116,0,0,1.0175438596491229,-0.5,-0.5);
	var fimg = ctrans.applyToImage(imageObj4322);
	var pat=ctx.createPattern(fimg,"repeat");
	ctx.fillStyle = pat;
	ctx.fillRect(-16384,-16384,32768,32768);
	ctx.restore();
}

function shape490(ctx,ctrans,frame,ratio,time){
	var pathData="M 169 -139 L 174 -144 194 -136 206 -138 234 -141 253 -135 269 -123 271 -112 282 -98 Q 335 -64 335 -52 L 335 -51 326 -47 276 -30 Q 258 -24 258 -6 258 1 269 13 L 296 40 Q 308 53 324 87 L 309 89 Q 326 90 342 103 L 354 93 Q 372 80 391 80 412 80 430 91 L 444 105 422 125 379 136 368 136 392 177 406 189 Q 460 194 478 202 495 210 495 228 L 494 242 490 247 490 256 Q 490 276 471 278 498 300 527 300 L 548 294 569 315 Q 587 338 587 351 L 580 376 580 379 Q 580 397 564 407 547 410 545 416 L 532 427 521 425 516 423 500 428 Q 490 428 486 424 L 477 416 Q 462 415 458 410 L 453 410 449 408 429 394 424 371 Q 424 360 412 349 L 403 351 Q 387 351 379 340 L 376 334 371 335 342 330 334 326 317 330 Q 310 330 298 322 L 285 309 276 313 Q 270 313 269 309 L 268 305 Q 284 260 284 234 L 284 215 269 186 239 176 Q 218 167 210 159 L 158 148 138 133 142 121 Q 148 111 157 115 L 163 106 181 104 195 96 204 90 Q 199 84 199 75 L 199 61 201 40 195 37 160 26 Q 141 22 132 10 L 132 6 129 1 122 -6 100 -14 Q 81 -22 75 -28 L 54 -39 Q 44 -45 44 -51 L 52 -60 68 -69 73 -71 Q 89 -79 90 -87 111 -98 136 -127 157 -130 169 -139 M 313 -141 Q 313 -152 318 -153 L 333 -151 338 -145 Q 338 -135 324 -135 313 -135 313 -141 M 251 -167 Q 251 -156 234 -156 210 -156 210 -164 L 218 -173 249 -174 251 -167 M 393 -55 L 407 -55 Q 425 -55 425 -47 L 417 -37 409 -30 398 -38 389 -47 393 -55 M 471 212 L 484 219 483 218 471 212 M 516 179 Q 476 179 476 165 476 150 517 141 558 133 558 153 L 548 170 516 179 M 587 268 L 566 284 553 274 547 262 Q 547 251 567 254 587 257 587 268 M 509 385 L 508 385 510 386 509 385 M 642 354 Q 628 354 616 347 L 604 334 Q 604 313 641 313 678 313 678 333 678 339 642 354 M 362 27 Q 353 27 350 22 L 349 18 Q 349 5 371 0 393 -4 393 18 393 27 362 27 M 289 134 L 300 144 283 120 289 134 M -337 -176 L -339 -175 -347 -190 -346 -192 -337 -176";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 44 -51 Q 65 -77 84 -85 92 -88 100 -94 L 103 -93 135 -100 Q 143 -100 147 -86 L 136 -65 140 -58 147 -54 163 -51 170 -61 Q 172 -69 195 -70 L 205 -78 223 -76 222 -73 207 -71 195 -62 180 -61 Q 172 -44 168 -44 L 143 -48 138 -56 116 -57 115 -57 114 -60 115 -65 130 -66 141 -85 136 -89 102 -82 94 -83 78 -71 44 -51";
	ctx.fillStyle=tocolor(ctrans.apply([131,112,84,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 44 -51 Q 61 -48 63 -42 65 -35 72 -33 L 83 -26 96 -15 Q 104 -10 132 0 155 10 150 19 179 18 196 31 L 200 35 207 38 221 37 Q 230 25 249 25 L 271 30 272 33 266 37 239 35 Q 227 47 216 47 L 208 47 208 49 198 69 208 93 Q 208 104 180 113 L 141 126 152 144 169 149 181 156 211 157 Q 223 160 232 171 237 177 273 186 L 283 197 288 194 Q 291 190 299 190 L 313 192 318 200 371 205 350 214 315 209 304 200 Q 294 200 289 205 L 286 208 289 226 287 237 Q 296 239 296 245 L 275 298 285 304 299 322 319 327 339 323 353 319 353 316 Q 353 306 362 304 L 388 298 381 276 373 267 361 258 Q 370 250 398 246 430 241 439 254 L 374 259 Q 382 262 400 299 L 395 307 373 310 364 315 368 321 377 325 Q 390 331 392 336 L 395 340 421 339 463 350 468 355 466 360 438 360 429 355 427 355 432 376 433 392 442 399 455 401 469 406 486 415 507 419 521 424 529 422 Q 533 417 544 413 L 559 409 560 412 563 404 568 418 556 586 557 593 557 614 Q 532 625 510 645 L 470 694 428 744 378 794 332 844 283 893 Q 268 902 232 941 L 204 974 196 963 Q 196 944 190 936 L 177 940 Q 167 940 163 886 L 161 867 135 852 112 835 105 835 86 834 62 813 57 796 41 795 36 789 27 764 15 738 6 731 -3 670 Q -3 658 5 659 L 2 654 12 649 Q 1 627 -18 625 -33 623 -33 607 L -28 572 -20 543 -19 523 Q -19 509 -26 491 L -33 452 -24 396 -21 367 Q -14 351 -14 341 L -21 291 -16 271 -12 245 Q -12 230 -19 210 L -27 188 Q -16 147 -16 120 L -23 45 -22 19 Q 2 11 24 -23 L 44 -51";
	ctx.fillStyle=tocolor(ctrans.apply([103,78,67,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 113 -81 L 108 -85 113 -90 139 -93 141 -85 137 -65 131 -61 116 -63 115 -65 118 -68 130 -70 135 -85 135 -86 123 -86 113 -81 M 120 -56 L 121 -60 134 -53 146 -46 151 -49 158 -53 174 -46 173 -43 159 -45 146 -40 129 -44 120 -56 M 407 335 L 408 329 442 332 446 337 474 342 476 348 473 350 Q 449 350 438 339 L 407 335 M 277 42 L 276 44 255 32 Q 245 32 235 41 L 222 49 Q 225 35 242 31 262 27 277 42 M 286 202 L 308 197 Q 313 196 318 202 325 209 336 208 346 208 351 219 L 348 222 343 217 319 218 312 207 Q 306 201 291 207 L 286 202 M 368 257 Q 387 276 387 293 387 303 377 306 L 364 306 359 315 357 315 Q 356 308 358 304 361 297 377 298 L 379 293 372 274 365 259 366 256 366 257 368 257";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 44 -42 L 52 -51 Q 71 -31 99 -31 111 -31 122 51 122 112 108 148 94 184 94 211 L 98 275 Q 97 296 102 337 L 96 431 100 496 103 562 90 814 84 815 78 814 77 725 72 681 66 637 72 596 78 525 66 382 49 218 49 135 46 108 47 75 51 59 54 45 53 -26 44 -42 M 422 373 L 452 391 Q 458 399 481 404 503 410 513 426 L 543 410 Q 554 410 554 421 L 540 516 537 625 510 645 470 694 443 726 443 710 448 604 437 568 Q 426 544 426 531 L 430 482 425 436 420 389 422 373 M 240 177 L 240 200 235 250 222 274 210 294 197 349 195 392 203 490 198 532 198 664 200 676 Q 200 692 188 689 185 697 189 720 190 741 167 745 L 165 749 165 844 158 847 Q 151 847 149 820 L 149 792 Q 149 723 157 683 164 643 164 582 L 161 476 Q 140 265 140 138 140 130 146 129 151 128 158 135 167 141 183 144 L 207 156 227 162 Q 237 164 240 177 M 86 485 L 87 487 86 460 86 485 M 370 332 L 357 413 344 486 347 525 350 562 Q 350 625 327 714 303 804 303 845 L 304 876 293 886 292 883 292 886 283 893 280 895 Q 280 854 295 778 310 701 310 586 L 310 512 302 477 292 441 273 301 Q 282 299 289 306 L 313 325 363 318 Q 372 318 370 332 M 173 695 L 172 711 173 714 174 695 173 695";
	ctx.fillStyle=tocolor(ctrans.apply([113,85,74,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite491(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape490",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
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

function shape494(ctx,ctrans,frame,ratio,time){
	var pathData="M 643 20 Q 635 20 635 15 L 638 9 Q 652 10 657 16 L 643 20 M -128 170 L -114 166 -113 169 Q -113 178 -135 189 L -145 182 -128 170";
	ctx.fillStyle=tocolor(ctrans.apply([212,178,130,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 632 82 L 623 97 582 103 542 100 537 94 Q 537 87 547 84 L 542 76 543 72 Q 573 52 599 59 619 64 632 82 M 821 179 L 846 211 845 240 813 247 Q 791 246 758 230 L 721 214 Q 704 213 652 247 628 290 577 288 538 286 513 263 488 239 477 238 464 238 457 256 L 460 261 463 268 Q 463 277 452 283 438 292 411 290 L 387 292 Q 372 292 356 277 L 338 262 Q 333 262 324 291 315 321 287 320 L 265 312 Q 255 303 248 303 244 303 200 325 L 171 334 127 340 105 335 87 331 72 335 72 339 78 345 82 351 Q 82 365 52 382 L 20 395 -2 400 Q -27 398 -56 371 L -86 334 Q -88 326 -126 300 -163 275 -163 266 -163 253 -138 246 L -126 244 -117 247 -116 248 -101 255 -97 255 -54 264 -45 265 -52 248 Q -52 232 -36 229 L -22 230 -21 229 -15 228 -11 225 -7 225 -5 224 11 227 31 226 32 230 62 234 92 238 137 227 142 197 141 183 147 183 151 185 148 180 Q 158 173 166 169 L 203 165 Q 210 155 225 161 L 243 169 306 168 331 173 347 180 355 201 Q 374 197 385 185 398 171 410 165 L 369 161 363 160 364 156 358 139 352 133 434 100 472 101 480 118 Q 483 128 500 129 L 527 126 594 129 608 141 646 146 669 144 680 135 644 128 640 120 Q 659 81 690 82 L 735 90 753 91 757 89 Q 767 111 786 130 L 799 142 Q 805 160 821 179 M 102 250 L 104 250 119 245 102 250 M 60 205 L 61 199 83 190 111 187 112 197 105 208 73 215 60 205 M 242 58 L 253 56 260 60 275 63 293 57 Q 299 55 299 75 L 292 87 277 97 267 90 252 88 Q 249 85 237 80 L 222 72 231 63 Q 236 57 242 58 M 602 67 Q 596 64 590 67 L 602 68 602 67 M -18 189 L -36 188 -48 180 -51 173 Q -51 156 -22 150 7 144 7 161 L -2 174 -18 189 M -23 247 L -22 245 -28 244 -23 247 M -39 247 L -31 244 -39 245 -39 247 M -20 178 L -17 175 -28 177 -20 178";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 818 181 L 823 181 833 193 814 192 794 165 773 154 Q 754 147 751 140 775 139 796 152 L 808 161 817 174 818 181";
	ctx.fillStyle=tocolor(ctrans.apply([139,118,90,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 840 263 L 840 466 Q 830 624 830 700 L 840 858 832 966 Q 798 925 730 927 653 931 613 977 600 971 584 967 525 947 490 989 431 939 345 969 L 337 972 Q 288 995 263 1042 L 140 1047 130 1059 120 1077 Q 87 1063 50 1062 -35 1058 -88 1109 L -92 1105 -92 1102 -97 1085 -92 1077 -92 441 -86 334 -77 334 -77 342 -77 343 -74 342 Q -69 342 -47 365 -26 387 4 389 14 389 17 383 L 22 372 55 373 74 363 61 351 58 342 Q 59 322 88 324 95 324 104 330 L 149 340 152 332 228 314 Q 217 312 217 304 L 218 300 Q 178 259 178 246 L 182 232 Q 188 233 188 239 L 187 251 197 261 207 272 Q 215 288 225 292 L 253 302 256 301 265 306 269 309 280 316 Q 290 317 302 310 L 315 294 Q 315 281 318 277 L 325 269 316 261 Q 300 245 287 245 271 243 258 226 245 211 251 203 L 260 211 267 221 281 226 300 233 Q 300 228 311 218 L 323 205 314 190 317 186 327 197 331 207 321 224 307 238 331 254 336 258 Q 343 259 356 273 L 388 274 399 271 412 274 424 278 429 276 452 274 443 266 442 255 Q 442 249 452 238 L 467 228 434 204 Q 434 199 449 188 L 472 176 467 163 Q 461 153 449 152 L 425 154 425 155 406 145 409 142 455 145 Q 479 151 489 181 487 182 468 190 453 196 448 201 L 451 204 Q 464 203 480 221 L 491 237 515 254 548 268 Q 566 274 572 280 L 597 281 640 248 619 232 Q 623 223 626 221 L 668 217 Q 671 211 689 206 L 667 202 Q 662 200 662 191 662 183 669 174 678 164 692 165 L 683 152 684 148 686 148 697 158 704 169 Q 704 176 690 177 675 180 672 191 715 196 729 204 L 744 210 Q 770 220 773 224 L 796 228 835 230 846 223 840 263";
	ctx.fillStyle=tocolor(ctrans.apply([108,85,70,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 127 329 L 120 330 116 331 117 327 115 326 114 326 113 325 127 329";
	ctx.fillStyle=tocolor(ctrans.apply([204,204,204,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 602 270 L 600 270 564 274 560 274 573 271 602 270";
	ctx.fillStyle=tocolor(ctrans.apply([115,115,115,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 816 226 L 814 227 806 231 795 228 769 212 Q 784 214 788 219 L 816 226 M 728 195 L 728 198 709 204 690 198 685 200 681 202 678 201 678 200 676 190 658 182 661 179 679 184 Q 710 135 710 165 L 697 184 730 190 728 195 M 630 245 L 639 246 639 252 631 256 630 254 629 249 630 245 M 624 223 L 623 225 630 235 627 237 614 233 613 227 Q 613 215 625 215 L 637 221 645 225 658 216 Q 668 206 674 208 L 675 212 663 225 Q 654 234 639 233 L 633 229 624 223 M 541 277 L 531 273 525 270 501 257 515 262 509 257 467 220 467 219 462 216 448 204 456 190 Q 464 180 471 183 L 458 203 478 216 473 207 490 219 495 229 509 249 540 264 560 274 564 274 600 270 602 270 618 265 608 272 Q 591 282 564 280 L 544 278 541 277 M 435 276 L 417 279 389 273 385 274 383 274 359 268 Q 354 268 347 273 L 333 260 308 235 314 221 322 206 318 203 324 202 328 217 321 234 325 244 326 243 328 242 Q 334 242 340 253 L 341 256 346 261 345 261 350 264 404 268 404 271 414 273 437 270 437 274 435 276 M 180 237 L 181 233 196 233 199 234 200 237 194 247 195 249 255 297 252 300 243 301 195 278 188 248 180 237 M 9 360 L 36 366 64 364 68 366 69 368 70 372 59 379 29 383 Q 5 371 5 364 L 6 361 9 360 M -83 348 L -93 331 -92 327 -90 327 -88 327 -87 324 Q -82 324 -78 330 L -64 353 -61 357 -40 369 -29 375 -28 375 Q -7 383 -7 390 L -11 395 -16 393 -16 388 -21 388 -21 391 Q -58 373 -75 356 L -75 355 -83 348";
	ctx.fillStyle=tocolor(ctrans.apply([223,197,162,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 806 231 L 814 227 816 226 827 222 837 222 838 228 833 234 Q 823 235 812 246 L 818 274 814 297 811 328 Q 811 352 801 358 792 366 792 379 L 805 455 Q 805 494 811 551 L 804 570 809 643 Q 809 744 780 727 L 780 830 Q 778 897 763 897 L 758 895 757 875 765 791 765 704 780 614 Q 780 597 766 561 L 749 516 742 463 734 412 Q 724 376 726 309 728 270 719 249 709 225 709 204 L 728 198 728 195 Q 744 197 767 211 L 769 212 795 228 802 231 806 231 M 785 245 L 785 246 791 250 792 248 785 245 M 731 220 L 730 220 731 229 732 229 733 225 731 220 M 541 277 L 544 278 564 280 Q 591 282 608 272 L 609 273 Q 604 297 564 292 L 569 329 563 356 563 453 555 501 548 549 548 627 547 633 544 637 545 734 544 799 Q 541 837 529 864 L 526 864 525 861 533 806 534 634 Q 528 624 530 583 L 530 538 526 479 528 450 530 450 530 351 Q 529 324 516 304 L 503 283 504 275 Q 507 269 520 269 L 531 274 541 277 M 385 274 L 389 273 417 279 435 276 442 277 Q 450 280 450 291 L 445 302 Q 460 306 463 318 L 464 338 455 372 Q 446 396 446 409 L 450 452 447 465 434 481 Q 454 483 454 565 L 450 616 447 669 448 675 450 682 450 782 448 859 Q 448 905 434 937 427 931 427 900 427 874 430 847 L 433 809 429 769 Q 425 754 428 714 L 427 675 426 666 421 617 426 579 415 514 398 434 Q 377 330 377 285 377 277 385 274 M 801 269 L 796 260 799 270 801 269 M 109 324 L 112 320 113 325 114 326 115 326 117 327 116 331 120 330 127 329 182 325 208 327 209 306 216 307 216 391 Q 233 453 233 539 L 230 569 230 641 Q 238 671 238 732 L 230 861 220 926 222 961 222 965 222 971 Q 222 987 203 985 L 203 1023 198 1040 198 1042 198 1045 155 1047 Q 136 965 128 821 L 128 767 Q 113 646 113 618 L 114 603 115 601 115 590 121 549 Q 121 476 109 449 98 422 98 374 L 103 329 104 325 109 326 109 324 M 787 693 L 785 692 785 710 787 710 787 693 M 143 887 L 142 867 138 847 Q 144 930 153 996 L 143 887 M 123 589 L 123 597 128 597 126 570 123 589 M 220 651 L 218 676 222 743 222 762 Q 220 781 213 780 L 208 776 207 822 213 893 221 815 227 731 Q 227 676 220 651 M 213 736 L 212 742 210 760 213 766 213 736 M 205 497 L 211 548 216 615 218 603 218 541 209 444 205 497 M 110 379 L 110 378 108 359 107 375 Q 107 411 115 437 L 110 379 M -83 348 L -75 355 -75 356 Q -58 373 -21 391 L -21 388 -16 388 -16 393 -14 501 Q -14 592 -17 620 L -17 793 Q -13 801 -13 824 L -18 1001 -29 1073 -40 1077 -46 979 -48 1016 -53 1016 -55 1014 -67 775 Q -60 707 -60 676 -60 629 -74 506 L -87 374 -83 348";
	ctx.fillStyle=tocolor(ctrans.apply([122,98,82,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
	var pathData="M 819 183 Q 813 179 811 167 806 157 778 153 L 773 144 802 151 821 179 825 183 819 183 M 109 324 L 109 326 104 325 103 329 83 326 Q 74 326 67 332 L 71 347 75 360 74 364 Q 61 344 61 337 L 61 331 62 329 62 326 63 326 109 324";
	ctx.fillStyle=tocolor(ctrans.apply([199,155,122,1]));
	drawPath(ctx,pathData,false);
	ctx.fill("evenodd");
}

function sprite495(ctx,ctrans,frame,ratio,time){
	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("shape494",canvas,ctx,[1.0,0.0,0.0,1.0,0.0,0.0],ctrans,1,0,0,time);
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

function sprite5976(ctx,ctrans,frame,ratio,time){
	ctx.save();

	var clips = [];
	var frame_cnt = 1;
	frame = frame % frame_cnt;
	switch(frame){
		case 0:
			place("sprite360",canvas,ctx,[-0.05,0.0,0.0,0.05,131.1,579.85],ctrans,1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[0.055912017822265625,0.0,0.0,0.055912017822265625,656.15,481.75],ctrans.merge(new cxform(32,37,27,0,230,218,230,256)),1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[0.05,0.0,0.0,0.05,532.0,618.9],ctrans.merge(new cxform(32,37,27,0,230,218,230,256)),1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[-0.05,0.0,0.0,0.05,149.5,413.7],ctrans,1,(0+time)%1,0,time);
			place("sprite360",canvas,ctx,[-0.009508514404296875,0.0,0.0,0.05,670.1,566.1],ctrans,1,(0+time)%1,0,time);
			clips.push({ctx:ctx,canvas:canvas});
			var ccanvas = createCanvas(canvas.width,canvas.height);
			var cctx = ccanvas.getContext("2d");
			enhanceContext(cctx);
			cctx.applyTransforms(ctx._matrix);
			canvas = ccanvas;
			ctx = cctx;
			place("shape5963",canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);
			clips[clips.length-1].clipCanvas = canvas;
			canvas = createCanvas(canvas.width,canvas.height);
			var nctx = canvas.getContext("2d");
			enhanceContext(nctx);
			nctx.applyTransforms(ctx._matrix);
			ctx = nctx;
			place("sprite5964",canvas,ctx,[0.05,0.0,0.0,0.05,142.4,213.0],ctrans,1,(0+time)%1,0,ownerTime(2));
			place("sprite5965",canvas,ctx,[0.05,0.0,0.0,0.05,326.45,147.85],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5966",canvas,ctx,[0.05,0.0,0.0,0.05,242.9,387.6],ctrans,1,(0+time)%1,0,ownerTime(1));
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
			place("sprite499",canvas,ctx,[0.05,0.0,0.0,0.05,32.3,237.05],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,738.65,326.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.05,0.0,0.0,0.05,736.9,177.9],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,737.25,344.35],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,737.25,365.35],ctrans,1,(0+time)%1,0,time);
			place("sprite1967",canvas,ctx,[0.05,0.0,0.0,0.05,699.55,409.3],ctrans,1,(0+time)%1,0,time);
			place("sprite495",canvas,ctx,[0.05,0.0,0.0,0.05,650.1,478.15],ctrans,1,(0+time)%1,0,time);
			place("sprite1967",canvas,ctx,[0.05,0.0,0.0,0.05,611.75,498.05],ctrans,1,(0+time)%1,0,time);
			place("sprite1965",canvas,ctx,[0.05,0.0,0.0,0.05,89.6,259.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1965",canvas,ctx,[0.05,0.0,0.0,0.05,88.45,272.0],ctrans,1,(0+time)%1,0,time);
			place("sprite491",canvas,ctx,[0.05,0.0,0.0,0.05,52.7,296.35],ctrans,1,(0+time)%1,0,time);
			place("sprite3924",canvas,ctx,[-0.05,0.0,0.0,0.05,34.0,353.25],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,14.0,395.75],ctrans,1,(0+time)%1,0,time);
			place("sprite1959",canvas,ctx,[0.05,0.0,0.0,0.05,32.95,370.45],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.05,0.0,0.0,0.05,686.3,465.05],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,687.45,447.75],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,687.45,428.75],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.05,0.0,0.0,0.05,734.2,383.45],ctrans,1,(0+time)%1,0,time);
			place("sprite511",canvas,ctx,[0.05,0.0,0.0,0.05,708.25,162.65],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.05,0.0,0.0,0.05,620.55,50.2],ctrans,1,(0+time)%1,0,time);
			place("sprite1953",canvas,ctx,[0.05,0.0,0.0,0.05,532.8,29.95],ctrans,1,(0+time)%1,0,time);
			place("sprite3922",canvas,ctx,[0.05,0.0,0.0,0.05,594.0,40.9],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.05,0.0,0.0,0.05,567.1,33.8],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,414.1,53.5],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,377.45,63.45],ctrans,1,(0+time)%1,0,time);
			place("sprite3928",canvas,ctx,[0.05,0.0,0.0,0.05,483.4,37.3],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,64.25,178.1],ctrans,1,(0+time)%1,0,time);
			place("sprite1965",canvas,ctx,[0.05,0.0,0.0,0.05,102.05,187.2],ctrans,1,(0+time)%1,0,time);
			place("sprite1959",canvas,ctx,[0.05,0.0,0.0,0.05,44.9,217.1],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,52.35,322.3],ctrans,1,(0+time)%1,0,time);
			place("sprite3918",canvas,ctx,[0.05,0.0,0.0,0.05,645.35,66.55],ctrans,1,(0+time)%1,0,time);
			place("sprite1959",canvas,ctx,[0.05,0.0,0.0,0.05,50.3,340.55],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,743.15,201.85],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,740.75,219.85],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,747.25,236.35],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,749.25,255.7],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,750.75,275.4],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,747.25,293.95],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,743.15,311.8],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.05,0.0,0.0,0.05,688.65,133.9],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.05,0.0,0.0,0.05,680.15,113.05],ctrans,1,(0+time)%1,0,time);
			place("sprite3930",canvas,ctx,[0.05,0.0,0.0,0.05,664.15,88.45],ctrans,1,(0+time)%1,0,time);
			place("sprite3928",canvas,ctx,[0.05,0.0,0.0,0.05,443.9,41.7],ctrans,1,(0+time)%1,0,time);
			place("sprite3928",canvas,ctx,[0.05,0.0,0.0,0.05,329.9,68.8],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,298.45,80.45],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,258.95,94.9],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,219.45,108.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,178.95,124.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,137.45,142.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1955",canvas,ctx,[0.05,0.0,0.0,0.05,101.4,160.1],ctrans,1,(0+time)%1,0,time);
			place("sprite1959",canvas,ctx,[0.05,0.0,0.0,0.05,62.95,200.6],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,-4.15,424.55],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,-22.55,451.55],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,-37.55,477.5],ctrans,1,(0+time)%1,0,time);
			place("sprite1963",canvas,ctx,[0.05,0.0,0.0,0.05,-49.15,500.5],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,602.1,512.6],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,598.1,528.6],ctrans,1,(0+time)%1,0,time);
			place("sprite493",canvas,ctx,[0.05,0.0,0.0,0.05,593.6,545.85],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,570.95,571.6],ctrans,1,(0+time)%1,0,time);
			place("sprite515",canvas,ctx,[-0.05,0.0,0.0,0.05,568.95,587.6],ctrans,1,(0+time)%1,0,time);
			var oldctx = ctx;
			var fcanvas = createCanvas(canvas.width,canvas.height);			var fctx = fcanvas.getContext("2d");
			enhanceContext(fctx);
			fctx.applyTransforms(ctx._matrix);
			ctx = fctx;
			place("sprite5968",canvas,ctx,[0.05,0.0,0.0,0.05,-25.0,0.0],ctrans,1,(0+time)%1,0,time);
			ctx = oldctx;
			var ms=ctx._matrix;
			ctx.setTransform(1,0,0,1,0,0);
			ctx.drawImage(fcanvas,0,0);
			ctx.applyTransforms(ms);
			place("sprite5969",canvas,ctx,[0.05,0.0,0.0,0.05,291.55,304.8],ctrans,1,(0+time)%1,0,ownerTime(1));
			place("sprite5970",canvas,ctx,[0.05,0.0,0.0,0.05,486.9,118.5],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5971",canvas,ctx,[0.05,0.0,0.0,0.05,209.5,215.1],ctrans,1,(0+time)%1,0,ownerTime(2));
			place("sprite5972",canvas,ctx,[0.05,0.0,0.0,0.05,172.6,464.3],ctrans,1,(0+time)%1,0,ownerTime(1));
			place("sprite5973",canvas,ctx,[0.05,0.0,0.0,0.05,548.3,150.9],ctrans,1,(0+time)%1,0,ownerTime(0));
			place("sprite5974",canvas,ctx,[0.05,0.0,0.0,0.05,34.9,217.8],ctrans,1,(0+time)%1,0,ownerTime(2));
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

const loaded=[imageObj357,imageObj362,imageObj364,imageObj366,imageObj368,imageObj371,imageObj373,imageObj375,imageObj377,imageObj380,imageObj3800,imageObj3802,imageObj3804,imageObj3806,imageObj382,imageObj384,imageObj386,imageObj389,imageObj391,imageObj393,imageObj395,imageObj399,imageObj401,imageObj403,imageObj405,imageObj409,imageObj411,imageObj413,imageObj418,imageObj420,imageObj422,imageObj424,imageObj4321,imageObj4322,imageObj445,imageObj447,imageObj449,imageObj451,imageObj454,imageObj456,imageObj458,imageObj460,imageObj464,imageObj466,imageObj468,imageObj470,imageObj473,imageObj475,imageObj477,imageObj479].map(im=>new Promise(resolve=>{if(im.complete&&im.naturalWidth)resolve();else{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true});}}));
Promise.all(loaded).then(()=>{window.NativeMaps[level]={draw(target,owners){ownerFrames=owners;const ctx=layerContext(target);try{sprite5976(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,0);}finally{canvas=null;}},drawGround(target,owners){groundOnly=true;try{this.draw(target,owners);}finally{groundOnly=false;}},objects:collectNativeObjects};window.dispatchEvent(new Event('native-map-ready'));});
})();