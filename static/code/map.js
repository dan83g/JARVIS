/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2061:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
  html2canvas 0.5.0-beta3 <http://html2canvas.hertzen.com>
  Copyright (c) 2016 Niklas von Hertzen

  Released under  License
*/
!function (e) {
  if (true) module.exports = e();else { var f; }
}(function () {
  var define, module, exports;
  return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = undefined;
          if (!u && a) return require(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }

        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }

      return n[o].exports;
    }

    var i = undefined;

    for (var o = 0; o < r.length; o++) s(r[o]);

    return s;
  }({
    1: [function (_dereq_, module, exports) {
      (function (global) {
        /*! http://mths.be/punycode v1.2.4 by @mathias */
        ;

        (function (root) {
          /** Detect free variables */
          var freeExports = typeof exports == 'object' && exports;
          var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;
          var freeGlobal = typeof global == 'object' && global;

          if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
            root = freeGlobal;
          }
          /**
           * The `punycode` object.
           * @name punycode
           * @type Object
           */


          var punycode,

          /** Highest positive signed 32-bit float value */
          maxInt = 2147483647,
              // aka. 0x7FFFFFFF or 2^31-1

          /** Bootstring parameters */
          base = 36,
              tMin = 1,
              tMax = 26,
              skew = 38,
              damp = 700,
              initialBias = 72,
              initialN = 128,
              // 0x80
          delimiter = '-',
              // '\x2D'

          /** Regular expressions */
          regexPunycode = /^xn--/,
              regexNonASCII = /[^ -~]/,
              // unprintable ASCII chars + non-ASCII chars
          regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g,
              // RFC 3490 separators

          /** Error messages */
          errors = {
            'overflow': 'Overflow: input needs wider integers to process',
            'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
            'invalid-input': 'Invalid input'
          },

          /** Convenience shortcuts */
          baseMinusTMin = base - tMin,
              floor = Math.floor,
              stringFromCharCode = String.fromCharCode,

          /** Temporary variable */
          key;
          /*--------------------------------------------------------------------------*/

          /**
           * A generic error utility function.
           * @private
           * @param {String} type The error type.
           * @returns {Error} Throws a `RangeError` with the applicable error message.
           */

          function error(type) {
            throw RangeError(errors[type]);
          }
          /**
           * A generic `Array#map` utility function.
           * @private
           * @param {Array} array The array to iterate over.
           * @param {Function} callback The function that gets called for every array
           * item.
           * @returns {Array} A new array of values returned by the callback function.
           */


          function map(array, fn) {
            var length = array.length;

            while (length--) {
              array[length] = fn(array[length]);
            }

            return array;
          }
          /**
           * A simple `Array#map`-like wrapper to work with domain name strings.
           * @private
           * @param {String} domain The domain name.
           * @param {Function} callback The function that gets called for every
           * character.
           * @returns {Array} A new string of characters returned by the callback
           * function.
           */


          function mapDomain(string, fn) {
            return map(string.split(regexSeparators), fn).join('.');
          }
          /**
           * Creates an array containing the numeric code points of each Unicode
           * character in the string. While JavaScript uses UCS-2 internally,
           * this function will convert a pair of surrogate halves (each of which
           * UCS-2 exposes as separate characters) into a single code point,
           * matching UTF-16.
           * @see `punycode.ucs2.encode`
           * @see <http://mathiasbynens.be/notes/javascript-encoding>
           * @memberOf punycode.ucs2
           * @name decode
           * @param {String} string The Unicode input string (UCS-2).
           * @returns {Array} The new array of code points.
           */


          function ucs2decode(string) {
            var output = [],
                counter = 0,
                length = string.length,
                value,
                extra;

            while (counter < length) {
              value = string.charCodeAt(counter++);

              if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);

                if ((extra & 0xFC00) == 0xDC00) {
                  // low surrogate
                  output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                  // unmatched surrogate; only append this code unit, in case the next
                  // code unit is the high surrogate of a surrogate pair
                  output.push(value);
                  counter--;
                }
              } else {
                output.push(value);
              }
            }

            return output;
          }
          /**
           * Creates a string based on an array of numeric code points.
           * @see `punycode.ucs2.decode`
           * @memberOf punycode.ucs2
           * @name encode
           * @param {Array} codePoints The array of numeric code points.
           * @returns {String} The new Unicode string (UCS-2).
           */


          function ucs2encode(array) {
            return map(array, function (value) {
              var output = '';

              if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
              }

              output += stringFromCharCode(value);
              return output;
            }).join('');
          }
          /**
           * Converts a basic code point into a digit/integer.
           * @see `digitToBasic()`
           * @private
           * @param {Number} codePoint The basic numeric code point value.
           * @returns {Number} The numeric value of a basic code point (for use in
           * representing integers) in the range `0` to `base - 1`, or `base` if
           * the code point does not represent a value.
           */


          function basicToDigit(codePoint) {
            if (codePoint - 48 < 10) {
              return codePoint - 22;
            }

            if (codePoint - 65 < 26) {
              return codePoint - 65;
            }

            if (codePoint - 97 < 26) {
              return codePoint - 97;
            }

            return base;
          }
          /**
           * Converts a digit/integer into a basic code point.
           * @see `basicToDigit()`
           * @private
           * @param {Number} digit The numeric value of a basic code point.
           * @returns {Number} The basic code point whose value (when used for
           * representing integers) is `digit`, which needs to be in the range
           * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
           * used; else, the lowercase form is used. The behavior is undefined
           * if `flag` is non-zero and `digit` has no uppercase form.
           */


          function digitToBasic(digit, flag) {
            //  0..25 map to ASCII a..z or A..Z
            // 26..35 map to ASCII 0..9
            return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
          }
          /**
           * Bias adaptation function as per section 3.4 of RFC 3492.
           * http://tools.ietf.org/html/rfc3492#section-3.4
           * @private
           */


          function adapt(delta, numPoints, firstTime) {
            var k = 0;
            delta = firstTime ? floor(delta / damp) : delta >> 1;
            delta += floor(delta / numPoints);

            for (;
            /* no initialization */
            delta > baseMinusTMin * tMax >> 1; k += base) {
              delta = floor(delta / baseMinusTMin);
            }

            return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
          }
          /**
           * Converts a Punycode string of ASCII-only symbols to a string of Unicode
           * symbols.
           * @memberOf punycode
           * @param {String} input The Punycode string of ASCII-only symbols.
           * @returns {String} The resulting string of Unicode symbols.
           */


          function decode(input) {
            // Don't use UCS-2
            var output = [],
                inputLength = input.length,
                out,
                i = 0,
                n = initialN,
                bias = initialBias,
                basic,
                j,
                index,
                oldi,
                w,
                k,
                digit,
                t,

            /** Cached calculation results */
            baseMinusT; // Handle the basic code points: let `basic` be the number of input code
            // points before the last delimiter, or `0` if there is none, then copy
            // the first basic code points to the output.

            basic = input.lastIndexOf(delimiter);

            if (basic < 0) {
              basic = 0;
            }

            for (j = 0; j < basic; ++j) {
              // if it's not a basic code point
              if (input.charCodeAt(j) >= 0x80) {
                error('not-basic');
              }

              output.push(input.charCodeAt(j));
            } // Main decoding loop: start just after the last delimiter if any basic code
            // points were copied; start at the beginning otherwise.


            for (index = basic > 0 ? basic + 1 : 0; index < inputLength;)
            /* no final expression */
            {
              // `index` is the index of the next character to be consumed.
              // Decode a generalized variable-length integer into `delta`,
              // which gets added to `i`. The overflow checking is easier
              // if we increase `i` as we go, then subtract off its starting
              // value at the end to obtain `delta`.
              for (oldi = i, w = 1, k = base;;
              /* no condition */
              k += base) {
                if (index >= inputLength) {
                  error('invalid-input');
                }

                digit = basicToDigit(input.charCodeAt(index++));

                if (digit >= base || digit > floor((maxInt - i) / w)) {
                  error('overflow');
                }

                i += digit * w;
                t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

                if (digit < t) {
                  break;
                }

                baseMinusT = base - t;

                if (w > floor(maxInt / baseMinusT)) {
                  error('overflow');
                }

                w *= baseMinusT;
              }

              out = output.length + 1;
              bias = adapt(i - oldi, out, oldi == 0); // `i` was supposed to wrap around from `out` to `0`,
              // incrementing `n` each time, so we'll fix that now:

              if (floor(i / out) > maxInt - n) {
                error('overflow');
              }

              n += floor(i / out);
              i %= out; // Insert `n` at position `i` of the output

              output.splice(i++, 0, n);
            }

            return ucs2encode(output);
          }
          /**
           * Converts a string of Unicode symbols to a Punycode string of ASCII-only
           * symbols.
           * @memberOf punycode
           * @param {String} input The string of Unicode symbols.
           * @returns {String} The resulting Punycode string of ASCII-only symbols.
           */


          function encode(input) {
            var n,
                delta,
                handledCPCount,
                basicLength,
                bias,
                j,
                m,
                q,
                k,
                t,
                currentValue,
                output = [],

            /** `inputLength` will hold the number of code points in `input`. */
            inputLength,

            /** Cached calculation results */
            handledCPCountPlusOne,
                baseMinusT,
                qMinusT; // Convert the input in UCS-2 to Unicode

            input = ucs2decode(input); // Cache the length

            inputLength = input.length; // Initialize the state

            n = initialN;
            delta = 0;
            bias = initialBias; // Handle the basic code points

            for (j = 0; j < inputLength; ++j) {
              currentValue = input[j];

              if (currentValue < 0x80) {
                output.push(stringFromCharCode(currentValue));
              }
            }

            handledCPCount = basicLength = output.length; // `handledCPCount` is the number of code points that have been handled;
            // `basicLength` is the number of basic code points.
            // Finish the basic string - if it is not empty - with a delimiter

            if (basicLength) {
              output.push(delimiter);
            } // Main encoding loop:


            while (handledCPCount < inputLength) {
              // All non-basic code points < n have been handled already. Find the next
              // larger one:
              for (m = maxInt, j = 0; j < inputLength; ++j) {
                currentValue = input[j];

                if (currentValue >= n && currentValue < m) {
                  m = currentValue;
                }
              } // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
              // but guard against overflow


              handledCPCountPlusOne = handledCPCount + 1;

              if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                error('overflow');
              }

              delta += (m - n) * handledCPCountPlusOne;
              n = m;

              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];

                if (currentValue < n && ++delta > maxInt) {
                  error('overflow');
                }

                if (currentValue == n) {
                  // Represent delta as a generalized variable-length integer
                  for (q = delta, k = base;;
                  /* no condition */
                  k += base) {
                    t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

                    if (q < t) {
                      break;
                    }

                    qMinusT = q - t;
                    baseMinusT = base - t;
                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                    q = floor(qMinusT / baseMinusT);
                  }

                  output.push(stringFromCharCode(digitToBasic(q, 0)));
                  bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                  delta = 0;
                  ++handledCPCount;
                }
              }

              ++delta;
              ++n;
            }

            return output.join('');
          }
          /**
           * Converts a Punycode string representing a domain name to Unicode. Only the
           * Punycoded parts of the domain name will be converted, i.e. it doesn't
           * matter if you call it on a string that has already been converted to
           * Unicode.
           * @memberOf punycode
           * @param {String} domain The Punycode domain name to convert to Unicode.
           * @returns {String} The Unicode representation of the given Punycode
           * string.
           */


          function toUnicode(domain) {
            return mapDomain(domain, function (string) {
              return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
            });
          }
          /**
           * Converts a Unicode string representing a domain name to Punycode. Only the
           * non-ASCII parts of the domain name will be converted, i.e. it doesn't
           * matter if you call it with a domain that's already in ASCII.
           * @memberOf punycode
           * @param {String} domain The domain name to convert, as a Unicode string.
           * @returns {String} The Punycode representation of the given domain name.
           */


          function toASCII(domain) {
            return mapDomain(domain, function (string) {
              return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
            });
          }
          /*--------------------------------------------------------------------------*/

          /** Define the public API */


          punycode = {
            /**
             * A string representing the current Punycode.js version number.
             * @memberOf punycode
             * @type String
             */
            'version': '1.2.4',

            /**
             * An object of methods to convert from JavaScript's internal character
             * representation (UCS-2) to Unicode code points, and back.
             * @see <http://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode
             * @type Object
             */
            'ucs2': {
              'decode': ucs2decode,
              'encode': ucs2encode
            },
            'decode': decode,
            'encode': encode,
            'toASCII': toASCII,
            'toUnicode': toUnicode
          };
          /** Expose `punycode` */
          // Some AMD build optimizers, like r.js, check for specific condition patterns
          // like the following:

          if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
            define('punycode', function () {
              return punycode;
            });
          } else if (freeExports && !freeExports.nodeType) {
            if (freeModule) {
              // in Node.js or RingoJS v0.8.0+
              freeModule.exports = punycode;
            } else {
              // in Narwhal or RingoJS v0.7.0-
              for (key in punycode) {
                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
              }
            }
          } else {
            // in Rhino or a web browser
            root.punycode = punycode;
          }
        })(this);
      }).call(this, typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}],
    2: [function (_dereq_, module, exports) {
      var log = _dereq_('./log');

      function restoreOwnerScroll(ownerDocument, x, y) {
        if (ownerDocument.defaultView && (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
          ownerDocument.defaultView.scrollTo(x, y);
        }
      }

      function cloneCanvasContents(canvas, clonedCanvas) {
        try {
          if (clonedCanvas) {
            clonedCanvas.width = canvas.width;
            clonedCanvas.height = canvas.height;
            clonedCanvas.getContext("2d").putImageData(canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height), 0, 0);
          }
        } catch (e) {
          log("Unable to copy canvas content from", canvas, e);
        }
      }

      function cloneNode(node, javascriptEnabled) {
        var clone = node.nodeType === 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
        var child = node.firstChild;

        while (child) {
          if (javascriptEnabled === true || child.nodeType !== 1 || child.nodeName !== 'SCRIPT') {
            clone.appendChild(cloneNode(child, javascriptEnabled));
          }

          child = child.nextSibling;
        }

        if (node.nodeType === 1) {
          clone._scrollTop = node.scrollTop;
          clone._scrollLeft = node.scrollLeft;

          if (node.nodeName === "CANVAS") {
            cloneCanvasContents(node, clone);
          } else if (node.nodeName === "TEXTAREA" || node.nodeName === "SELECT") {
            clone.value = node.value;
          }
        }

        return clone;
      }

      function initNode(node) {
        if (node.nodeType === 1) {
          node.scrollTop = node._scrollTop;
          node.scrollLeft = node._scrollLeft;
          var child = node.firstChild;

          while (child) {
            initNode(child);
            child = child.nextSibling;
          }
        }
      }

      module.exports = function (ownerDocument, containerDocument, width, height, options, x, y) {
        var documentElement = cloneNode(ownerDocument.documentElement, options.javascriptEnabled);
        var container = containerDocument.createElement("iframe");
        container.className = "html2canvas-container";
        container.style.visibility = "hidden";
        container.style.position = "fixed";
        container.style.left = "-10000px";
        container.style.top = "0px";
        container.style.border = "0";
        container.width = width;
        container.height = height;
        container.scrolling = "no"; // ios won't scroll without it

        containerDocument.body.appendChild(container);
        return new Promise(function (resolve) {
          var documentClone = container.contentWindow.document;
          /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
           if window url is about:blank, we can assign the url to current by writing onto the document
           */

          container.contentWindow.onload = container.onload = function () {
            var interval = setInterval(function () {
              if (documentClone.body.childNodes.length > 0) {
                initNode(documentClone.documentElement);
                clearInterval(interval);

                if (options.type === "view") {
                  container.contentWindow.scrollTo(x, y);

                  if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && (container.contentWindow.scrollY !== y || container.contentWindow.scrollX !== x)) {
                    documentClone.documentElement.style.top = -y + "px";
                    documentClone.documentElement.style.left = -x + "px";
                    documentClone.documentElement.style.position = 'absolute';
                  }
                }

                resolve(container);
              }
            }, 50);
          };

          documentClone.open();
          documentClone.write("<!DOCTYPE html><html></html>"); // Chrome scrolls the parent document for some reason after the write to the cloned window???

          restoreOwnerScroll(ownerDocument, x, y);
          documentClone.replaceChild(documentClone.adoptNode(documentElement), documentClone.documentElement);
          documentClone.close();
        });
      };
    }, {
      "./log": 13
    }],
    3: [function (_dereq_, module, exports) {
      // http://dev.w3.org/csswg/css-color/
      function Color(value) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = null;
        var result = this.fromArray(value) || this.namedColor(value) || this.rgb(value) || this.rgba(value) || this.hex6(value) || this.hex3(value);
      }

      Color.prototype.darken = function (amount) {
        var a = 1 - amount;
        return new Color([Math.round(this.r * a), Math.round(this.g * a), Math.round(this.b * a), this.a]);
      };

      Color.prototype.isTransparent = function () {
        return this.a === 0;
      };

      Color.prototype.isBlack = function () {
        return this.r === 0 && this.g === 0 && this.b === 0;
      };

      Color.prototype.fromArray = function (array) {
        if (Array.isArray(array)) {
          this.r = Math.min(array[0], 255);
          this.g = Math.min(array[1], 255);
          this.b = Math.min(array[2], 255);

          if (array.length > 3) {
            this.a = array[3];
          }
        }

        return Array.isArray(array);
      };

      var _hex3 = /^#([a-f0-9]{3})$/i;

      Color.prototype.hex3 = function (value) {
        var match = null;

        if ((match = value.match(_hex3)) !== null) {
          this.r = parseInt(match[1][0] + match[1][0], 16);
          this.g = parseInt(match[1][1] + match[1][1], 16);
          this.b = parseInt(match[1][2] + match[1][2], 16);
        }

        return match !== null;
      };

      var _hex6 = /^#([a-f0-9]{6})$/i;

      Color.prototype.hex6 = function (value) {
        var match = null;

        if ((match = value.match(_hex6)) !== null) {
          this.r = parseInt(match[1].substring(0, 2), 16);
          this.g = parseInt(match[1].substring(2, 4), 16);
          this.b = parseInt(match[1].substring(4, 6), 16);
        }

        return match !== null;
      };

      var _rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

      Color.prototype.rgb = function (value) {
        var match = null;

        if ((match = value.match(_rgb)) !== null) {
          this.r = Number(match[1]);
          this.g = Number(match[2]);
          this.b = Number(match[3]);
        }

        return match !== null;
      };

      var _rgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?\.?\d+)\s*\)$/;

      Color.prototype.rgba = function (value) {
        var match = null;

        if ((match = value.match(_rgba)) !== null) {
          this.r = Number(match[1]);
          this.g = Number(match[2]);
          this.b = Number(match[3]);
          this.a = Number(match[4]);
        }

        return match !== null;
      };

      Color.prototype.toString = function () {
        return this.a !== null && this.a !== 1 ? "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")" : "rgb(" + [this.r, this.g, this.b].join(",") + ")";
      };

      Color.prototype.namedColor = function (value) {
        value = value.toLowerCase();
        var color = colors[value];

        if (color) {
          this.r = color[0];
          this.g = color[1];
          this.b = color[2];
        } else if (value === "transparent") {
          this.r = this.g = this.b = this.a = 0;
          return true;
        }

        return !!color;
      };

      Color.prototype.isColor = true; // JSON.stringify([].slice.call($$('.named-color-table tr'), 1).map(function(row) { return [row.childNodes[3].textContent, row.childNodes[5].textContent.trim().split(",").map(Number)] }).reduce(function(data, row) {data[row[0]] = row[1]; return data}, {}))

      var colors = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
      };
      module.exports = Color;
    }, {}],
    4: [function (_dereq_, module, exports) {
      var Support = _dereq_('./support');

      var CanvasRenderer = _dereq_('./renderers/canvas');

      var ImageLoader = _dereq_('./imageloader');

      var NodeParser = _dereq_('./nodeparser');

      var NodeContainer = _dereq_('./nodecontainer');

      var log = _dereq_('./log');

      var utils = _dereq_('./utils');

      var createWindowClone = _dereq_('./clone');

      var loadUrlDocument = _dereq_('./proxy').loadUrlDocument;

      var getBounds = utils.getBounds;
      var html2canvasNodeAttribute = "data-html2canvas-node";
      var html2canvasCloneIndex = 0;

      function html2canvas(nodeList, options) {
        var index = html2canvasCloneIndex++;
        options = options || {};

        if (options.logging) {
          log.options.logging = true;
          log.options.start = Date.now();
        }

        options.async = typeof options.async === "undefined" ? true : options.async;
        options.allowTaint = typeof options.allowTaint === "undefined" ? false : options.allowTaint;
        options.removeContainer = typeof options.removeContainer === "undefined" ? true : options.removeContainer;
        options.javascriptEnabled = typeof options.javascriptEnabled === "undefined" ? false : options.javascriptEnabled;
        options.imageTimeout = typeof options.imageTimeout === "undefined" ? 10000 : options.imageTimeout;
        options.renderer = typeof options.renderer === "function" ? options.renderer : CanvasRenderer;
        options.strict = !!options.strict;

        if (typeof nodeList === "string") {
          if (typeof options.proxy !== "string") {
            return Promise.reject("Proxy must be used when rendering url");
          }

          var width = options.width != null ? options.width : window.innerWidth;
          var height = options.height != null ? options.height : window.innerHeight;
          return loadUrlDocument(absoluteUrl(nodeList), options.proxy, document, width, height, options).then(function (container) {
            return renderWindow(container.contentWindow.document.documentElement, container, options, width, height);
          });
        }

        var node = (nodeList === undefined ? [document.documentElement] : nodeList.length ? nodeList : [nodeList])[0];
        node.setAttribute(html2canvasNodeAttribute + index, index);
        return renderDocument(node.ownerDocument, options, node.ownerDocument.defaultView.innerWidth, node.ownerDocument.defaultView.innerHeight, index).then(function (canvas) {
          if (typeof options.onrendered === "function") {
            log("options.onrendered is deprecated, html2canvas returns a Promise containing the canvas");
            options.onrendered(canvas);
          }

          return canvas;
        });
      }

      html2canvas.CanvasRenderer = CanvasRenderer;
      html2canvas.NodeContainer = NodeContainer;
      html2canvas.log = log;
      html2canvas.utils = utils;
      var html2canvasExport = typeof document === "undefined" || typeof Object.create !== "function" || typeof document.createElement("canvas").getContext !== "function" ? function () {
        return Promise.reject("No canvas support");
      } : html2canvas;
      module.exports = html2canvasExport;

      if (typeof define === 'function' && define.amd) {
        define('html2canvas', [], function () {
          return html2canvasExport;
        });
      }

      function renderDocument(document, options, windowWidth, windowHeight, html2canvasIndex) {
        return createWindowClone(document, document, windowWidth, windowHeight, options, document.defaultView.pageXOffset, document.defaultView.pageYOffset).then(function (container) {
          log("Document cloned");
          var attributeName = html2canvasNodeAttribute + html2canvasIndex;
          var selector = "[" + attributeName + "='" + html2canvasIndex + "']";
          document.querySelector(selector).removeAttribute(attributeName);
          var clonedWindow = container.contentWindow;
          var node = clonedWindow.document.querySelector(selector);
          var oncloneHandler = typeof options.onclone === "function" ? Promise.resolve(options.onclone(clonedWindow.document)) : Promise.resolve(true);
          return oncloneHandler.then(function () {
            return renderWindow(node, container, options, windowWidth, windowHeight);
          });
        });
      }

      function renderWindow(node, container, options, windowWidth, windowHeight) {
        var clonedWindow = container.contentWindow;
        var support = new Support(clonedWindow.document);
        var imageLoader = new ImageLoader(options, support);
        var bounds = getBounds(node);
        var width = options.type === "view" ? windowWidth : documentWidth(clonedWindow.document);
        var height = options.type === "view" ? windowHeight : documentHeight(clonedWindow.document);
        var renderer = new options.renderer(width, height, imageLoader, options, document);
        var parser = new NodeParser(node, renderer, support, imageLoader, options);
        return parser.ready.then(function () {
          log("Finished rendering");
          var canvas;

          if (options.type === "view") {
            canvas = crop(renderer.canvas, {
              width: renderer.canvas.width,
              height: renderer.canvas.height,
              top: 0,
              left: 0,
              x: 0,
              y: 0
            });
          } else if (node === clonedWindow.document.body || node === clonedWindow.document.documentElement || options.canvas != null) {
            canvas = renderer.canvas;
          } else {
            canvas = crop(renderer.canvas, {
              width: options.width != null ? options.width : bounds.width,
              height: options.height != null ? options.height : bounds.height,
              top: bounds.top,
              left: bounds.left,
              x: 0,
              y: 0
            });
          }

          cleanupContainer(container, options);
          return canvas;
        });
      }

      function cleanupContainer(container, options) {
        if (options.removeContainer) {
          container.parentNode.removeChild(container);
          log("Cleaned up container");
        }
      }

      function crop(canvas, bounds) {
        var croppedCanvas = document.createElement("canvas");
        var x1 = Math.min(canvas.width - 1, Math.max(0, bounds.left));
        var x2 = Math.min(canvas.width, Math.max(1, bounds.left + bounds.width));
        var y1 = Math.min(canvas.height - 1, Math.max(0, bounds.top));
        var y2 = Math.min(canvas.height, Math.max(1, bounds.top + bounds.height));
        croppedCanvas.width = bounds.width;
        croppedCanvas.height = bounds.height;
        var width = x2 - x1;
        var height = y2 - y1;
        log("Cropping canvas at:", "left:", bounds.left, "top:", bounds.top, "width:", width, "height:", height);
        log("Resulting crop with width", bounds.width, "and height", bounds.height, "with x", x1, "and y", y1);
        croppedCanvas.getContext("2d").drawImage(canvas, x1, y1, width, height, bounds.x, bounds.y, width, height);
        return croppedCanvas;
      }

      function documentWidth(doc) {
        return Math.max(Math.max(doc.body.scrollWidth, doc.documentElement.scrollWidth), Math.max(doc.body.offsetWidth, doc.documentElement.offsetWidth), Math.max(doc.body.clientWidth, doc.documentElement.clientWidth));
      }

      function documentHeight(doc) {
        return Math.max(Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight), Math.max(doc.body.offsetHeight, doc.documentElement.offsetHeight), Math.max(doc.body.clientHeight, doc.documentElement.clientHeight));
      }

      function absoluteUrl(url) {
        var link = document.createElement("a");
        link.href = url;
        link.href = link.href;
        return link;
      }
    }, {
      "./clone": 2,
      "./imageloader": 11,
      "./log": 13,
      "./nodecontainer": 14,
      "./nodeparser": 15,
      "./proxy": 16,
      "./renderers/canvas": 20,
      "./support": 22,
      "./utils": 26
    }],
    5: [function (_dereq_, module, exports) {
      var log = _dereq_('./log');

      var smallImage = _dereq_('./utils').smallImage;

      function DummyImageContainer(src) {
        this.src = src;
        log("DummyImageContainer for", src);

        if (!this.promise || !this.image) {
          log("Initiating DummyImageContainer");
          DummyImageContainer.prototype.image = new Image();
          var image = this.image;
          DummyImageContainer.prototype.promise = new Promise(function (resolve, reject) {
            image.onload = resolve;
            image.onerror = reject;
            image.src = smallImage();

            if (image.complete === true) {
              resolve(image);
            }
          });
        }
      }

      module.exports = DummyImageContainer;
    }, {
      "./log": 13,
      "./utils": 26
    }],
    6: [function (_dereq_, module, exports) {
      var smallImage = _dereq_('./utils').smallImage;

      function Font(family, size) {
        var container = document.createElement('div'),
            img = document.createElement('img'),
            span = document.createElement('span'),
            sampleText = 'Hidden Text',
            baseline,
            middle;
        container.style.visibility = "hidden";
        container.style.fontFamily = family;
        container.style.fontSize = size;
        container.style.margin = 0;
        container.style.padding = 0;
        document.body.appendChild(container);
        img.src = smallImage();
        img.width = 1;
        img.height = 1;
        img.style.margin = 0;
        img.style.padding = 0;
        img.style.verticalAlign = "baseline";
        span.style.fontFamily = family;
        span.style.fontSize = size;
        span.style.margin = 0;
        span.style.padding = 0;
        span.appendChild(document.createTextNode(sampleText));
        container.appendChild(span);
        container.appendChild(img);
        baseline = img.offsetTop - span.offsetTop + 1;
        container.removeChild(span);
        container.appendChild(document.createTextNode(sampleText));
        container.style.lineHeight = "normal";
        img.style.verticalAlign = "super";
        middle = img.offsetTop - container.offsetTop + 1;
        document.body.removeChild(container);
        this.baseline = baseline;
        this.lineWidth = 1;
        this.middle = middle;
      }

      module.exports = Font;
    }, {
      "./utils": 26
    }],
    7: [function (_dereq_, module, exports) {
      var Font = _dereq_('./font');

      function FontMetrics() {
        this.data = {};
      }

      FontMetrics.prototype.getMetrics = function (family, size) {
        if (this.data[family + "-" + size] === undefined) {
          this.data[family + "-" + size] = new Font(family, size);
        }

        return this.data[family + "-" + size];
      };

      module.exports = FontMetrics;
    }, {
      "./font": 6
    }],
    8: [function (_dereq_, module, exports) {
      var utils = _dereq_('./utils');

      var getBounds = utils.getBounds;

      var loadUrlDocument = _dereq_('./proxy').loadUrlDocument;

      function FrameContainer(container, sameOrigin, options) {
        this.image = null;
        this.src = container;
        var self = this;
        var bounds = getBounds(container);
        this.promise = (!sameOrigin ? this.proxyLoad(options.proxy, bounds, options) : new Promise(function (resolve) {
          if (container.contentWindow.document.URL === "about:blank" || container.contentWindow.document.documentElement == null) {
            container.contentWindow.onload = container.onload = function () {
              resolve(container);
            };
          } else {
            resolve(container);
          }
        })).then(function (container) {
          var html2canvas = _dereq_('./core');

          return html2canvas(container.contentWindow.document.documentElement, {
            type: 'view',
            width: container.width,
            height: container.height,
            proxy: options.proxy,
            javascriptEnabled: options.javascriptEnabled,
            removeContainer: options.removeContainer,
            allowTaint: options.allowTaint,
            imageTimeout: options.imageTimeout / 2
          });
        }).then(function (canvas) {
          return self.image = canvas;
        });
      }

      FrameContainer.prototype.proxyLoad = function (proxy, bounds, options) {
        var container = this.src;
        return loadUrlDocument(container.src, proxy, container.ownerDocument, bounds.width, bounds.height, options);
      };

      module.exports = FrameContainer;
    }, {
      "./core": 4,
      "./proxy": 16,
      "./utils": 26
    }],
    9: [function (_dereq_, module, exports) {
      function GradientContainer(imageData) {
        this.src = imageData.value;
        this.colorStops = [];
        this.type = null;
        this.x0 = 0.5;
        this.y0 = 0.5;
        this.x1 = 0.5;
        this.y1 = 0.5;
        this.promise = Promise.resolve(true);
      }

      GradientContainer.TYPES = {
        LINEAR: 1,
        RADIAL: 2
      }; // TODO: support hsl[a], negative %/length values
      // TODO: support <angle> (e.g. -?\d{1,3}(?:\.\d+)deg, etc. : https://developer.mozilla.org/docs/Web/CSS/angle )

      GradientContainer.REGEXP_COLORSTOP = /^\s*(rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[0-9\.]+)?\s*\)|[a-z]{3,20}|#[a-f0-9]{3,6})(?:\s+(\d{1,3}(?:\.\d+)?)(%|px)?)?(?:\s|$)/i;
      module.exports = GradientContainer;
    }, {}],
    10: [function (_dereq_, module, exports) {
      function ImageContainer(src, cors) {
        this.src = src;
        this.image = new Image();
        var self = this;
        this.tainted = null;
        this.promise = new Promise(function (resolve, reject) {
          self.image.onload = resolve;
          self.image.onerror = reject;

          if (cors) {
            self.image.crossOrigin = "anonymous";
          }

          self.image.src = src;

          if (self.image.complete === true) {
            resolve(self.image);
          }
        });
      }

      module.exports = ImageContainer;
    }, {}],
    11: [function (_dereq_, module, exports) {
      var log = _dereq_('./log');

      var ImageContainer = _dereq_('./imagecontainer');

      var DummyImageContainer = _dereq_('./dummyimagecontainer');

      var ProxyImageContainer = _dereq_('./proxyimagecontainer');

      var FrameContainer = _dereq_('./framecontainer');

      var SVGContainer = _dereq_('./svgcontainer');

      var SVGNodeContainer = _dereq_('./svgnodecontainer');

      var LinearGradientContainer = _dereq_('./lineargradientcontainer');

      var WebkitGradientContainer = _dereq_('./webkitgradientcontainer');

      var bind = _dereq_('./utils').bind;

      function ImageLoader(options, support) {
        this.link = null;
        this.options = options;
        this.support = support;
        this.origin = this.getOrigin(window.location.href);
      }

      ImageLoader.prototype.findImages = function (nodes) {
        var images = [];
        nodes.reduce(function (imageNodes, container) {
          switch (container.node.nodeName) {
            case "IMG":
              return imageNodes.concat([{
                args: [container.node.src],
                method: "url"
              }]);

            case "svg":
            case "IFRAME":
              return imageNodes.concat([{
                args: [container.node],
                method: container.node.nodeName
              }]);
          }

          return imageNodes;
        }, []).forEach(this.addImage(images, this.loadImage), this);
        return images;
      };

      ImageLoader.prototype.findBackgroundImage = function (images, container) {
        container.parseBackgroundImages().filter(this.hasImageBackground).forEach(this.addImage(images, this.loadImage), this);
        return images;
      };

      ImageLoader.prototype.addImage = function (images, callback) {
        return function (newImage) {
          newImage.args.forEach(function (image) {
            if (!this.imageExists(images, image)) {
              images.splice(0, 0, callback.call(this, newImage));
              log('Added image #' + images.length, typeof image === "string" ? image.substring(0, 100) : image);
            }
          }, this);
        };
      };

      ImageLoader.prototype.hasImageBackground = function (imageData) {
        return imageData.method !== "none";
      };

      ImageLoader.prototype.loadImage = function (imageData) {
        if (imageData.method === "url") {
          var src = imageData.args[0];

          if (this.isSVG(src) && !this.support.svg && !this.options.allowTaint) {
            return new SVGContainer(src);
          } else if (src.match(/data:image\/.*;base64,/i)) {
            return new ImageContainer(src.replace(/url\(['"]{0,}|['"]{0,}\)$/ig, ''), false);
          } else if (this.isSameOrigin(src) || this.options.allowTaint === true || this.isSVG(src)) {
            return new ImageContainer(src, false);
          } else if (this.support.cors && !this.options.allowTaint && this.options.useCORS) {
            return new ImageContainer(src, true);
          } else if (this.options.proxy) {
            return new ProxyImageContainer(src, this.options.proxy);
          } else {
            return new DummyImageContainer(src);
          }
        } else if (imageData.method === "linear-gradient") {
          return new LinearGradientContainer(imageData);
        } else if (imageData.method === "gradient") {
          return new WebkitGradientContainer(imageData);
        } else if (imageData.method === "svg") {
          return new SVGNodeContainer(imageData.args[0], this.support.svg);
        } else if (imageData.method === "IFRAME") {
          return new FrameContainer(imageData.args[0], this.isSameOrigin(imageData.args[0].src), this.options);
        } else {
          return new DummyImageContainer(imageData);
        }
      };

      ImageLoader.prototype.isSVG = function (src) {
        return src.substring(src.length - 3).toLowerCase() === "svg" || SVGContainer.prototype.isInline(src);
      };

      ImageLoader.prototype.imageExists = function (images, src) {
        return images.some(function (image) {
          return image.src === src;
        });
      };

      ImageLoader.prototype.isSameOrigin = function (url) {
        return this.getOrigin(url) === this.origin;
      };

      ImageLoader.prototype.getOrigin = function (url) {
        var link = this.link || (this.link = document.createElement("a"));
        link.href = url;
        link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/

        return link.protocol + link.hostname + link.port;
      };

      ImageLoader.prototype.getPromise = function (container) {
        return this.timeout(container, this.options.imageTimeout)['catch'](function () {
          var dummy = new DummyImageContainer(container.src);
          return dummy.promise.then(function (image) {
            container.image = image;
          });
        });
      };

      ImageLoader.prototype.get = function (src) {
        var found = null;
        return this.images.some(function (img) {
          return (found = img).src === src;
        }) ? found : null;
      };

      ImageLoader.prototype.fetch = function (nodes) {
        this.images = nodes.reduce(bind(this.findBackgroundImage, this), this.findImages(nodes));
        this.images.forEach(function (image, index) {
          image.promise.then(function () {
            log("Succesfully loaded image #" + (index + 1), image);
          }, function (e) {
            log("Failed loading image #" + (index + 1), image, e);
          });
        });
        this.ready = Promise.all(this.images.map(this.getPromise, this));
        log("Finished searching images");
        return this;
      };

      ImageLoader.prototype.timeout = function (container, timeout) {
        var timer;
        var promise = Promise.race([container.promise, new Promise(function (res, reject) {
          timer = setTimeout(function () {
            log("Timed out loading image", container);
            reject(container);
          }, timeout);
        })]).then(function (container) {
          clearTimeout(timer);
          return container;
        });
        promise['catch'](function () {
          clearTimeout(timer);
        });
        return promise;
      };

      module.exports = ImageLoader;
    }, {
      "./dummyimagecontainer": 5,
      "./framecontainer": 8,
      "./imagecontainer": 10,
      "./lineargradientcontainer": 12,
      "./log": 13,
      "./proxyimagecontainer": 17,
      "./svgcontainer": 23,
      "./svgnodecontainer": 24,
      "./utils": 26,
      "./webkitgradientcontainer": 27
    }],
    12: [function (_dereq_, module, exports) {
      var GradientContainer = _dereq_('./gradientcontainer');

      var Color = _dereq_('./color');

      function LinearGradientContainer(imageData) {
        GradientContainer.apply(this, arguments);
        this.type = GradientContainer.TYPES.LINEAR;
        var hasDirection = LinearGradientContainer.REGEXP_DIRECTION.test(imageData.args[0]) || !GradientContainer.REGEXP_COLORSTOP.test(imageData.args[0]);

        if (hasDirection) {
          imageData.args[0].split(/\s+/).reverse().forEach(function (position, index) {
            switch (position) {
              case "left":
                this.x0 = 0;
                this.x1 = 1;
                break;

              case "top":
                this.y0 = 0;
                this.y1 = 1;
                break;

              case "right":
                this.x0 = 1;
                this.x1 = 0;
                break;

              case "bottom":
                this.y0 = 1;
                this.y1 = 0;
                break;

              case "to":
                var y0 = this.y0;
                var x0 = this.x0;
                this.y0 = this.y1;
                this.x0 = this.x1;
                this.x1 = x0;
                this.y1 = y0;
                break;

              case "center":
                break;
              // centered by default
              // Firefox internally converts position keywords to percentages:
              // http://www.w3.org/TR/2010/WD-CSS2-20101207/colors.html#propdef-background-position

              default:
                // percentage or absolute length
                // TODO: support absolute start point positions (e.g., use bounds to convert px to a ratio)
                var ratio = parseFloat(position, 10) * 1e-2;

                if (isNaN(ratio)) {
                  // invalid or unhandled value
                  break;
                }

                if (index === 0) {
                  this.y0 = ratio;
                  this.y1 = 1 - this.y0;
                } else {
                  this.x0 = ratio;
                  this.x1 = 1 - this.x0;
                }

                break;
            }
          }, this);
        } else {
          this.y0 = 0;
          this.y1 = 1;
        }

        this.colorStops = imageData.args.slice(hasDirection ? 1 : 0).map(function (colorStop) {
          var colorStopMatch = colorStop.match(GradientContainer.REGEXP_COLORSTOP);
          var value = +colorStopMatch[2];
          var unit = value === 0 ? "%" : colorStopMatch[3]; // treat "0" as "0%"

          return {
            color: new Color(colorStopMatch[1]),
            // TODO: support absolute stop positions (e.g., compute gradient line length & convert px to ratio)
            stop: unit === "%" ? value / 100 : null
          };
        });

        if (this.colorStops[0].stop === null) {
          this.colorStops[0].stop = 0;
        }

        if (this.colorStops[this.colorStops.length - 1].stop === null) {
          this.colorStops[this.colorStops.length - 1].stop = 1;
        } // calculates and fills-in explicit stop positions when omitted from rule


        this.colorStops.forEach(function (colorStop, index) {
          if (colorStop.stop === null) {
            this.colorStops.slice(index).some(function (find, count) {
              if (find.stop !== null) {
                colorStop.stop = (find.stop - this.colorStops[index - 1].stop) / (count + 1) + this.colorStops[index - 1].stop;
                return true;
              } else {
                return false;
              }
            }, this);
          }
        }, this);
      }

      LinearGradientContainer.prototype = Object.create(GradientContainer.prototype); // TODO: support <angle> (e.g. -?\d{1,3}(?:\.\d+)deg, etc. : https://developer.mozilla.org/docs/Web/CSS/angle )

      LinearGradientContainer.REGEXP_DIRECTION = /^\s*(?:to|left|right|top|bottom|center|\d{1,3}(?:\.\d+)?%?)(?:\s|$)/i;
      module.exports = LinearGradientContainer;
    }, {
      "./color": 3,
      "./gradientcontainer": 9
    }],
    13: [function (_dereq_, module, exports) {
      var logger = function () {
        if (logger.options.logging && window.console && window.console.log) {
          Function.prototype.bind.call(window.console.log, window.console).apply(window.console, [Date.now() - logger.options.start + "ms", "html2canvas:"].concat([].slice.call(arguments, 0)));
        }
      };

      logger.options = {
        logging: false
      };
      module.exports = logger;
    }, {}],
    14: [function (_dereq_, module, exports) {
      var Color = _dereq_('./color');

      var utils = _dereq_('./utils');

      var getBounds = utils.getBounds;
      var parseBackgrounds = utils.parseBackgrounds;
      var offsetBounds = utils.offsetBounds;

      function NodeContainer(node, parent) {
        this.node = node;
        this.parent = parent;
        this.stack = null;
        this.bounds = null;
        this.borders = null;
        this.clip = [];
        this.backgroundClip = [];
        this.offsetBounds = null;
        this.visible = null;
        this.computedStyles = null;
        this.colors = {};
        this.styles = {};
        this.backgroundImages = null;
        this.transformData = null;
        this.transformMatrix = null;
        this.isPseudoElement = false;
        this.opacity = null;
      }

      NodeContainer.prototype.cloneTo = function (stack) {
        stack.visible = this.visible;
        stack.borders = this.borders;
        stack.bounds = this.bounds;
        stack.clip = this.clip;
        stack.backgroundClip = this.backgroundClip;
        stack.computedStyles = this.computedStyles;
        stack.styles = this.styles;
        stack.backgroundImages = this.backgroundImages;
        stack.opacity = this.opacity;
      };

      NodeContainer.prototype.getOpacity = function () {
        return this.opacity === null ? this.opacity = this.cssFloat('opacity') : this.opacity;
      };

      NodeContainer.prototype.assignStack = function (stack) {
        this.stack = stack;
        stack.children.push(this);
      };

      NodeContainer.prototype.isElementVisible = function () {
        return this.node.nodeType === Node.TEXT_NODE ? this.parent.visible : this.css('display') !== "none" && this.css('visibility') !== "hidden" && !this.node.hasAttribute("data-html2canvas-ignore") && (this.node.nodeName !== "INPUT" || this.node.getAttribute("type") !== "hidden");
      };

      NodeContainer.prototype.css = function (attribute) {
        if (!this.computedStyles) {
          this.computedStyles = this.isPseudoElement ? this.parent.computedStyle(this.before ? ":before" : ":after") : this.computedStyle(null);
        }

        return this.styles[attribute] || (this.styles[attribute] = this.computedStyles[attribute]);
      };

      NodeContainer.prototype.prefixedCss = function (attribute) {
        var prefixes = ["webkit", "moz", "ms", "o"];
        var value = this.css(attribute);

        if (value === undefined) {
          prefixes.some(function (prefix) {
            value = this.css(prefix + attribute.substr(0, 1).toUpperCase() + attribute.substr(1));
            return value !== undefined;
          }, this);
        }

        return value === undefined ? null : value;
      };

      NodeContainer.prototype.computedStyle = function (type) {
        return this.node.ownerDocument.defaultView.getComputedStyle(this.node, type);
      };

      NodeContainer.prototype.cssInt = function (attribute) {
        var value = parseInt(this.css(attribute), 10);
        return isNaN(value) ? 0 : value; // borders in old IE are throwing 'medium' for demo.html
      };

      NodeContainer.prototype.color = function (attribute) {
        return this.colors[attribute] || (this.colors[attribute] = new Color(this.css(attribute)));
      };

      NodeContainer.prototype.cssFloat = function (attribute) {
        var value = parseFloat(this.css(attribute));
        return isNaN(value) ? 0 : value;
      };

      NodeContainer.prototype.fontWeight = function () {
        var weight = this.css("fontWeight");

        switch (parseInt(weight, 10)) {
          case 401:
            weight = "bold";
            break;

          case 400:
            weight = "normal";
            break;
        }

        return weight;
      };

      NodeContainer.prototype.parseClip = function () {
        var matches = this.css('clip').match(this.CLIP);

        if (matches) {
          return {
            top: parseInt(matches[1], 10),
            right: parseInt(matches[2], 10),
            bottom: parseInt(matches[3], 10),
            left: parseInt(matches[4], 10)
          };
        }

        return null;
      };

      NodeContainer.prototype.parseBackgroundImages = function () {
        return this.backgroundImages || (this.backgroundImages = parseBackgrounds(this.css("backgroundImage")));
      };

      NodeContainer.prototype.cssList = function (property, index) {
        var value = (this.css(property) || '').split(',');
        value = value[index || 0] || value[0] || 'auto';
        value = value.trim().split(' ');

        if (value.length === 1) {
          value = [value[0], isPercentage(value[0]) ? 'auto' : value[0]];
        }

        return value;
      };

      NodeContainer.prototype.parseBackgroundSize = function (bounds, image, index) {
        var size = this.cssList("backgroundSize", index);
        var width, height;

        if (isPercentage(size[0])) {
          width = bounds.width * parseFloat(size[0]) / 100;
        } else if (/contain|cover/.test(size[0])) {
          var targetRatio = bounds.width / bounds.height,
              currentRatio = image.width / image.height;
          return targetRatio < currentRatio ^ size[0] === 'contain' ? {
            width: bounds.height * currentRatio,
            height: bounds.height
          } : {
            width: bounds.width,
            height: bounds.width / currentRatio
          };
        } else {
          width = parseInt(size[0], 10);
        }

        if (size[0] === 'auto' && size[1] === 'auto') {
          height = image.height;
        } else if (size[1] === 'auto') {
          height = width / image.width * image.height;
        } else if (isPercentage(size[1])) {
          height = bounds.height * parseFloat(size[1]) / 100;
        } else {
          height = parseInt(size[1], 10);
        }

        if (size[0] === 'auto') {
          width = height / image.height * image.width;
        }

        return {
          width: width,
          height: height
        };
      };

      NodeContainer.prototype.parseBackgroundPosition = function (bounds, image, index, backgroundSize) {
        var position = this.cssList('backgroundPosition', index);
        var left, top;

        if (isPercentage(position[0])) {
          left = (bounds.width - (backgroundSize || image).width) * (parseFloat(position[0]) / 100);
        } else {
          left = parseInt(position[0], 10);
        }

        if (position[1] === 'auto') {
          top = left / image.width * image.height;
        } else if (isPercentage(position[1])) {
          top = (bounds.height - (backgroundSize || image).height) * parseFloat(position[1]) / 100;
        } else {
          top = parseInt(position[1], 10);
        }

        if (position[0] === 'auto') {
          left = top / image.height * image.width;
        }

        return {
          left: left,
          top: top
        };
      };

      NodeContainer.prototype.parseBackgroundRepeat = function (index) {
        return this.cssList("backgroundRepeat", index)[0];
      };

      NodeContainer.prototype.parseTextShadows = function () {
        var textShadow = this.css("textShadow");
        var results = [];

        if (textShadow && textShadow !== 'none') {
          var shadows = textShadow.match(this.TEXT_SHADOW_PROPERTY);

          for (var i = 0; shadows && i < shadows.length; i++) {
            var s = shadows[i].match(this.TEXT_SHADOW_VALUES);
            results.push({
              color: new Color(s[0]),
              offsetX: s[1] ? parseFloat(s[1].replace('px', '')) : 0,
              offsetY: s[2] ? parseFloat(s[2].replace('px', '')) : 0,
              blur: s[3] ? s[3].replace('px', '') : 0
            });
          }
        }

        return results;
      };

      NodeContainer.prototype.parseTransform = function () {
        if (!this.transformData) {
          if (this.hasTransform()) {
            var offset = this.parseBounds();
            var origin = this.prefixedCss("transformOrigin").split(" ").map(removePx).map(asFloat);
            origin[0] += offset.left;
            origin[1] += offset.top;
            this.transformData = {
              origin: origin,
              matrix: this.parseTransformMatrix()
            };
          } else {
            this.transformData = {
              origin: [0, 0],
              matrix: [1, 0, 0, 1, 0, 0]
            };
          }
        }

        return this.transformData;
      };

      NodeContainer.prototype.parseTransformMatrix = function () {
        if (!this.transformMatrix) {
          var transform = this.prefixedCss("transform");
          var matrix = transform ? parseMatrix(transform.match(this.MATRIX_PROPERTY)) : null;
          this.transformMatrix = matrix ? matrix : [1, 0, 0, 1, 0, 0];
        }

        return this.transformMatrix;
      };

      NodeContainer.prototype.parseBounds = function () {
        return this.bounds || (this.bounds = this.hasTransform() ? offsetBounds(this.node) : getBounds(this.node));
      };

      NodeContainer.prototype.hasTransform = function () {
        return this.parseTransformMatrix().join(",") !== "1,0,0,1,0,0" || this.parent && this.parent.hasTransform();
      };

      NodeContainer.prototype.getValue = function () {
        var value = this.node.value || "";

        if (this.node.tagName === "SELECT") {
          value = selectionValue(this.node);
        } else if (this.node.type === "password") {
          value = Array(value.length + 1).join('\u2022'); // jshint ignore:line
        }

        return value.length === 0 ? this.node.placeholder || "" : value;
      };

      NodeContainer.prototype.MATRIX_PROPERTY = /(matrix|matrix3d)\((.+)\)/;
      NodeContainer.prototype.TEXT_SHADOW_PROPERTY = /((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g;
      NodeContainer.prototype.TEXT_SHADOW_VALUES = /(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g;
      NodeContainer.prototype.CLIP = /^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/;

      function selectionValue(node) {
        var option = node.options[node.selectedIndex || 0];
        return option ? option.text || "" : "";
      }

      function parseMatrix(match) {
        if (match && match[1] === "matrix") {
          return match[2].split(",").map(function (s) {
            return parseFloat(s.trim());
          });
        } else if (match && match[1] === "matrix3d") {
          var matrix3d = match[2].split(",").map(function (s) {
            return parseFloat(s.trim());
          });
          return [matrix3d[0], matrix3d[1], matrix3d[4], matrix3d[5], matrix3d[12], matrix3d[13]];
        }
      }

      function isPercentage(value) {
        return value.toString().indexOf("%") !== -1;
      }

      function removePx(str) {
        return str.replace("px", "");
      }

      function asFloat(str) {
        return parseFloat(str);
      }

      module.exports = NodeContainer;
    }, {
      "./color": 3,
      "./utils": 26
    }],
    15: [function (_dereq_, module, exports) {
      var log = _dereq_('./log');

      var punycode = _dereq_('punycode');

      var NodeContainer = _dereq_('./nodecontainer');

      var TextContainer = _dereq_('./textcontainer');

      var PseudoElementContainer = _dereq_('./pseudoelementcontainer');

      var FontMetrics = _dereq_('./fontmetrics');

      var Color = _dereq_('./color');

      var StackingContext = _dereq_('./stackingcontext');

      var utils = _dereq_('./utils');

      var bind = utils.bind;
      var getBounds = utils.getBounds;
      var parseBackgrounds = utils.parseBackgrounds;
      var offsetBounds = utils.offsetBounds;

      function NodeParser(element, renderer, support, imageLoader, options) {
        log("Starting NodeParser");
        this.renderer = renderer;
        this.options = options;
        this.range = null;
        this.support = support;
        this.renderQueue = [];
        this.stack = new StackingContext(true, 1, element.ownerDocument, null);
        var parent = new NodeContainer(element, null);

        if (options.background) {
          renderer.rectangle(0, 0, renderer.width, renderer.height, new Color(options.background));
        }

        if (element === element.ownerDocument.documentElement) {
          // http://www.w3.org/TR/css3-background/#special-backgrounds
          var canvasBackground = new NodeContainer(parent.color('backgroundColor').isTransparent() ? element.ownerDocument.body : element.ownerDocument.documentElement, null);
          renderer.rectangle(0, 0, renderer.width, renderer.height, canvasBackground.color('backgroundColor'));
        }

        parent.visibile = parent.isElementVisible();
        this.createPseudoHideStyles(element.ownerDocument);
        this.disableAnimations(element.ownerDocument);
        this.nodes = flatten([parent].concat(this.getChildren(parent)).filter(function (container) {
          return container.visible = container.isElementVisible();
        }).map(this.getPseudoElements, this));
        this.fontMetrics = new FontMetrics();
        log("Fetched nodes, total:", this.nodes.length);
        log("Calculate overflow clips");
        this.calculateOverflowClips();
        log("Start fetching images");
        this.images = imageLoader.fetch(this.nodes.filter(isElement));
        this.ready = this.images.ready.then(bind(function () {
          log("Images loaded, starting parsing");
          log("Creating stacking contexts");
          this.createStackingContexts();
          log("Sorting stacking contexts");
          this.sortStackingContexts(this.stack);
          this.parse(this.stack);
          log("Render queue created with " + this.renderQueue.length + " items");
          return new Promise(bind(function (resolve) {
            if (!options.async) {
              this.renderQueue.forEach(this.paint, this);
              resolve();
            } else if (typeof options.async === "function") {
              options.async.call(this, this.renderQueue, resolve);
            } else if (this.renderQueue.length > 0) {
              this.renderIndex = 0;
              this.asyncRenderer(this.renderQueue, resolve);
            } else {
              resolve();
            }
          }, this));
        }, this));
      }

      NodeParser.prototype.calculateOverflowClips = function () {
        this.nodes.forEach(function (container) {
          if (isElement(container)) {
            if (isPseudoElement(container)) {
              container.appendToDOM();
            }

            container.borders = this.parseBorders(container);
            var clip = container.css('overflow') === "hidden" ? [container.borders.clip] : [];
            var cssClip = container.parseClip();

            if (cssClip && ["absolute", "fixed"].indexOf(container.css('position')) !== -1) {
              clip.push([["rect", container.bounds.left + cssClip.left, container.bounds.top + cssClip.top, cssClip.right - cssClip.left, cssClip.bottom - cssClip.top]]);
            }

            container.clip = hasParentClip(container) ? container.parent.clip.concat(clip) : clip;
            container.backgroundClip = container.css('overflow') !== "hidden" ? container.clip.concat([container.borders.clip]) : container.clip;

            if (isPseudoElement(container)) {
              container.cleanDOM();
            }
          } else if (isTextNode(container)) {
            container.clip = hasParentClip(container) ? container.parent.clip : [];
          }

          if (!isPseudoElement(container)) {
            container.bounds = null;
          }
        }, this);
      };

      function hasParentClip(container) {
        return container.parent && container.parent.clip.length;
      }

      NodeParser.prototype.asyncRenderer = function (queue, resolve, asyncTimer) {
        asyncTimer = asyncTimer || Date.now();
        this.paint(queue[this.renderIndex++]);

        if (queue.length === this.renderIndex) {
          resolve();
        } else if (asyncTimer + 20 > Date.now()) {
          this.asyncRenderer(queue, resolve, asyncTimer);
        } else {
          setTimeout(bind(function () {
            this.asyncRenderer(queue, resolve);
          }, this), 0);
        }
      };

      NodeParser.prototype.createPseudoHideStyles = function (document) {
        this.createStyles(document, '.' + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + ':before { content: "" !important; display: none !important; }' + '.' + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER + ':after { content: "" !important; display: none !important; }');
      };

      NodeParser.prototype.disableAnimations = function (document) {
        this.createStyles(document, '* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; ' + '-webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}');
      };

      NodeParser.prototype.createStyles = function (document, styles) {
        var hidePseudoElements = document.createElement('style');
        hidePseudoElements.innerHTML = styles;
        document.body.appendChild(hidePseudoElements);
      };

      NodeParser.prototype.getPseudoElements = function (container) {
        var nodes = [[container]];

        if (container.node.nodeType === Node.ELEMENT_NODE) {
          var before = this.getPseudoElement(container, ":before");
          var after = this.getPseudoElement(container, ":after");

          if (before) {
            nodes.push(before);
          }

          if (after) {
            nodes.push(after);
          }
        }

        return flatten(nodes);
      };

      function toCamelCase(str) {
        return str.replace(/(\-[a-z])/g, function (match) {
          return match.toUpperCase().replace('-', '');
        });
      }

      NodeParser.prototype.getPseudoElement = function (container, type) {
        var style = container.computedStyle(type);

        if (!style || !style.content || style.content === "none" || style.content === "-moz-alt-content" || style.display === "none") {
          return null;
        }

        var content = stripQuotes(style.content);
        var isImage = content.substr(0, 3) === 'url';
        var pseudoNode = document.createElement(isImage ? 'img' : 'html2canvaspseudoelement');
        var pseudoContainer = new PseudoElementContainer(pseudoNode, container, type);

        for (var i = style.length - 1; i >= 0; i--) {
          var property = toCamelCase(style.item(i));
          pseudoNode.style[property] = style[property];
        }

        pseudoNode.className = PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER;

        if (isImage) {
          pseudoNode.src = parseBackgrounds(content)[0].args[0];
          return [pseudoContainer];
        } else {
          var text = document.createTextNode(content);
          pseudoNode.appendChild(text);
          return [pseudoContainer, new TextContainer(text, pseudoContainer)];
        }
      };

      NodeParser.prototype.getChildren = function (parentContainer) {
        return flatten([].filter.call(parentContainer.node.childNodes, renderableNode).map(function (node) {
          var container = [node.nodeType === Node.TEXT_NODE ? new TextContainer(node, parentContainer) : new NodeContainer(node, parentContainer)].filter(nonIgnoredElement);
          return node.nodeType === Node.ELEMENT_NODE && container.length && node.tagName !== "TEXTAREA" ? container[0].isElementVisible() ? container.concat(this.getChildren(container[0])) : [] : container;
        }, this));
      };

      NodeParser.prototype.newStackingContext = function (container, hasOwnStacking) {
        var stack = new StackingContext(hasOwnStacking, container.getOpacity(), container.node, container.parent);
        container.cloneTo(stack);
        var parentStack = hasOwnStacking ? stack.getParentStack(this) : stack.parent.stack;
        parentStack.contexts.push(stack);
        container.stack = stack;
      };

      NodeParser.prototype.createStackingContexts = function () {
        this.nodes.forEach(function (container) {
          if (isElement(container) && (this.isRootElement(container) || hasOpacity(container) || isPositionedForStacking(container) || this.isBodyWithTransparentRoot(container) || container.hasTransform())) {
            this.newStackingContext(container, true);
          } else if (isElement(container) && (isPositioned(container) && zIndex0(container) || isInlineBlock(container) || isFloating(container))) {
            this.newStackingContext(container, false);
          } else {
            container.assignStack(container.parent.stack);
          }
        }, this);
      };

      NodeParser.prototype.isBodyWithTransparentRoot = function (container) {
        return container.node.nodeName === "BODY" && container.parent.color('backgroundColor').isTransparent();
      };

      NodeParser.prototype.isRootElement = function (container) {
        return container.parent === null;
      };

      NodeParser.prototype.sortStackingContexts = function (stack) {
        stack.contexts.sort(zIndexSort(stack.contexts.slice(0)));
        stack.contexts.forEach(this.sortStackingContexts, this);
      };

      NodeParser.prototype.parseTextBounds = function (container) {
        return function (text, index, textList) {
          if (container.parent.css("textDecoration").substr(0, 4) !== "none" || text.trim().length !== 0) {
            if (this.support.rangeBounds && !container.parent.hasTransform()) {
              var offset = textList.slice(0, index).join("").length;
              return this.getRangeBounds(container.node, offset, text.length);
            } else if (container.node && typeof container.node.data === "string") {
              var replacementNode = container.node.splitText(text.length);
              var bounds = this.getWrapperBounds(container.node, container.parent.hasTransform());
              container.node = replacementNode;
              return bounds;
            }
          } else if (!this.support.rangeBounds || container.parent.hasTransform()) {
            container.node = container.node.splitText(text.length);
          }

          return {};
        };
      };

      NodeParser.prototype.getWrapperBounds = function (node, transform) {
        var wrapper = node.ownerDocument.createElement('html2canvaswrapper');
        var parent = node.parentNode,
            backupText = node.cloneNode(true);
        wrapper.appendChild(node.cloneNode(true));
        parent.replaceChild(wrapper, node);
        var bounds = transform ? offsetBounds(wrapper) : getBounds(wrapper);
        parent.replaceChild(backupText, wrapper);
        return bounds;
      };

      NodeParser.prototype.getRangeBounds = function (node, offset, length) {
        var range = this.range || (this.range = node.ownerDocument.createRange());
        range.setStart(node, offset);
        range.setEnd(node, offset + length);
        return range.getBoundingClientRect();
      };

      function ClearTransform() {}

      NodeParser.prototype.parse = function (stack) {
        // http://www.w3.org/TR/CSS21/visuren.html#z-index
        var negativeZindex = stack.contexts.filter(negativeZIndex); // 2. the child stacking contexts with negative stack levels (most negative first).

        var descendantElements = stack.children.filter(isElement);
        var descendantNonFloats = descendantElements.filter(not(isFloating));
        var nonInlineNonPositionedDescendants = descendantNonFloats.filter(not(isPositioned)).filter(not(inlineLevel)); // 3 the in-flow, non-inline-level, non-positioned descendants.

        var nonPositionedFloats = descendantElements.filter(not(isPositioned)).filter(isFloating); // 4. the non-positioned floats.

        var inFlow = descendantNonFloats.filter(not(isPositioned)).filter(inlineLevel); // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.

        var stackLevel0 = stack.contexts.concat(descendantNonFloats.filter(isPositioned)).filter(zIndex0); // 6. the child stacking contexts with stack level 0 and the positioned descendants with stack level 0.

        var text = stack.children.filter(isTextNode).filter(hasText);
        var positiveZindex = stack.contexts.filter(positiveZIndex); // 7. the child stacking contexts with positive stack levels (least positive first).

        negativeZindex.concat(nonInlineNonPositionedDescendants).concat(nonPositionedFloats).concat(inFlow).concat(stackLevel0).concat(text).concat(positiveZindex).forEach(function (container) {
          this.renderQueue.push(container);

          if (isStackingContext(container)) {
            this.parse(container);
            this.renderQueue.push(new ClearTransform());
          }
        }, this);
      };

      NodeParser.prototype.paint = function (container) {
        try {
          if (container instanceof ClearTransform) {
            this.renderer.ctx.restore();
          } else if (isTextNode(container)) {
            if (isPseudoElement(container.parent)) {
              container.parent.appendToDOM();
            }

            this.paintText(container);

            if (isPseudoElement(container.parent)) {
              container.parent.cleanDOM();
            }
          } else {
            this.paintNode(container);
          }
        } catch (e) {
          log(e);

          if (this.options.strict) {
            throw e;
          }
        }
      };

      NodeParser.prototype.paintNode = function (container) {
        if (isStackingContext(container)) {
          this.renderer.setOpacity(container.opacity);
          this.renderer.ctx.save();

          if (container.hasTransform()) {
            this.renderer.setTransform(container.parseTransform());
          }
        }

        if (container.node.nodeName === "INPUT" && container.node.type === "checkbox") {
          this.paintCheckbox(container);
        } else if (container.node.nodeName === "INPUT" && container.node.type === "radio") {
          this.paintRadio(container);
        } else {
          this.paintElement(container);
        }
      };

      NodeParser.prototype.paintElement = function (container) {
        var bounds = container.parseBounds();
        this.renderer.clip(container.backgroundClip, function () {
          this.renderer.renderBackground(container, bounds, container.borders.borders.map(getWidth));
        }, this);
        this.renderer.clip(container.clip, function () {
          this.renderer.renderBorders(container.borders.borders);
        }, this);
        this.renderer.clip(container.backgroundClip, function () {
          switch (container.node.nodeName) {
            case "svg":
            case "IFRAME":
              var imgContainer = this.images.get(container.node);

              if (imgContainer) {
                this.renderer.renderImage(container, bounds, container.borders, imgContainer);
              } else {
                log("Error loading <" + container.node.nodeName + ">", container.node);
              }

              break;

            case "IMG":
              var imageContainer = this.images.get(container.node.src);

              if (imageContainer) {
                this.renderer.renderImage(container, bounds, container.borders, imageContainer);
              } else {
                log("Error loading <img>", container.node.src);
              }

              break;

            case "CANVAS":
              this.renderer.renderImage(container, bounds, container.borders, {
                image: container.node
              });
              break;

            case "SELECT":
            case "INPUT":
            case "TEXTAREA":
              this.paintFormValue(container);
              break;
          }
        }, this);
      };

      NodeParser.prototype.paintCheckbox = function (container) {
        var b = container.parseBounds();
        var size = Math.min(b.width, b.height);
        var bounds = {
          width: size - 1,
          height: size - 1,
          top: b.top,
          left: b.left
        };
        var r = [3, 3];
        var radius = [r, r, r, r];
        var borders = [1, 1, 1, 1].map(function (w) {
          return {
            color: new Color('#A5A5A5'),
            width: w
          };
        });
        var borderPoints = calculateCurvePoints(bounds, radius, borders);
        this.renderer.clip(container.backgroundClip, function () {
          this.renderer.rectangle(bounds.left + 1, bounds.top + 1, bounds.width - 2, bounds.height - 2, new Color("#DEDEDE"));
          this.renderer.renderBorders(calculateBorders(borders, bounds, borderPoints, radius));

          if (container.node.checked) {
            this.renderer.font(new Color('#424242'), 'normal', 'normal', 'bold', size - 3 + "px", 'arial');
            this.renderer.text("\u2714", bounds.left + size / 6, bounds.top + size - 1);
          }
        }, this);
      };

      NodeParser.prototype.paintRadio = function (container) {
        var bounds = container.parseBounds();
        var size = Math.min(bounds.width, bounds.height) - 2;
        this.renderer.clip(container.backgroundClip, function () {
          this.renderer.circleStroke(bounds.left + 1, bounds.top + 1, size, new Color('#DEDEDE'), 1, new Color('#A5A5A5'));

          if (container.node.checked) {
            this.renderer.circle(Math.ceil(bounds.left + size / 4) + 1, Math.ceil(bounds.top + size / 4) + 1, Math.floor(size / 2), new Color('#424242'));
          }
        }, this);
      };

      NodeParser.prototype.paintFormValue = function (container) {
        var value = container.getValue();

        if (value.length > 0) {
          var document = container.node.ownerDocument;
          var wrapper = document.createElement('html2canvaswrapper');
          var properties = ['lineHeight', 'textAlign', 'fontFamily', 'fontWeight', 'fontSize', 'color', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'width', 'height', 'borderLeftStyle', 'borderTopStyle', 'borderLeftWidth', 'borderTopWidth', 'boxSizing', 'whiteSpace', 'wordWrap'];
          properties.forEach(function (property) {
            try {
              wrapper.style[property] = container.css(property);
            } catch (e) {
              // Older IE has issues with "border"
              log("html2canvas: Parse: Exception caught in renderFormValue: " + e.message);
            }
          });
          var bounds = container.parseBounds();
          wrapper.style.position = "fixed";
          wrapper.style.left = bounds.left + "px";
          wrapper.style.top = bounds.top + "px";
          wrapper.textContent = value;
          document.body.appendChild(wrapper);
          this.paintText(new TextContainer(wrapper.firstChild, container));
          document.body.removeChild(wrapper);
        }
      };

      NodeParser.prototype.paintText = function (container) {
        container.applyTextTransform();
        var characters = punycode.ucs2.decode(container.node.data);
        var textList = (!this.options.letterRendering || noLetterSpacing(container)) && !hasUnicode(container.node.data) ? getWords(characters) : characters.map(function (character) {
          return punycode.ucs2.encode([character]);
        });
        var weight = container.parent.fontWeight();
        var size = container.parent.css('fontSize');
        var family = container.parent.css('fontFamily');
        var shadows = container.parent.parseTextShadows();
        this.renderer.font(container.parent.color('color'), container.parent.css('fontStyle'), container.parent.css('fontVariant'), weight, size, family);

        if (shadows.length) {
          // TODO: support multiple text shadows
          this.renderer.fontShadow(shadows[0].color, shadows[0].offsetX, shadows[0].offsetY, shadows[0].blur);
        } else {
          this.renderer.clearShadow();
        }

        this.renderer.clip(container.parent.clip, function () {
          textList.map(this.parseTextBounds(container), this).forEach(function (bounds, index) {
            if (bounds) {
              this.renderer.text(textList[index], bounds.left, bounds.bottom);
              this.renderTextDecoration(container.parent, bounds, this.fontMetrics.getMetrics(family, size));
            }
          }, this);
        }, this);
      };

      NodeParser.prototype.renderTextDecoration = function (container, bounds, metrics) {
        switch (container.css("textDecoration").split(" ")[0]) {
          case "underline":
            // Draws a line at the baseline of the font
            // TODO As some browsers display the line as more than 1px if the font-size is big, need to take that into account both in position and size
            this.renderer.rectangle(bounds.left, Math.round(bounds.top + metrics.baseline + metrics.lineWidth), bounds.width, 1, container.color("color"));
            break;

          case "overline":
            this.renderer.rectangle(bounds.left, Math.round(bounds.top), bounds.width, 1, container.color("color"));
            break;

          case "line-through":
            // TODO try and find exact position for line-through
            this.renderer.rectangle(bounds.left, Math.ceil(bounds.top + metrics.middle + metrics.lineWidth), bounds.width, 1, container.color("color"));
            break;
        }
      };

      var borderColorTransforms = {
        inset: [["darken", 0.60], ["darken", 0.10], ["darken", 0.10], ["darken", 0.60]]
      };

      NodeParser.prototype.parseBorders = function (container) {
        var nodeBounds = container.parseBounds();
        var radius = getBorderRadiusData(container);
        var borders = ["Top", "Right", "Bottom", "Left"].map(function (side, index) {
          var style = container.css('border' + side + 'Style');
          var color = container.color('border' + side + 'Color');

          if (style === "inset" && color.isBlack()) {
            color = new Color([255, 255, 255, color.a]); // this is wrong, but
          }

          var colorTransform = borderColorTransforms[style] ? borderColorTransforms[style][index] : null;
          return {
            width: container.cssInt('border' + side + 'Width'),
            color: colorTransform ? color[colorTransform[0]](colorTransform[1]) : color,
            args: null
          };
        });
        var borderPoints = calculateCurvePoints(nodeBounds, radius, borders);
        return {
          clip: this.parseBackgroundClip(container, borderPoints, borders, radius, nodeBounds),
          borders: calculateBorders(borders, nodeBounds, borderPoints, radius)
        };
      };

      function calculateBorders(borders, nodeBounds, borderPoints, radius) {
        return borders.map(function (border, borderSide) {
          if (border.width > 0) {
            var bx = nodeBounds.left;
            var by = nodeBounds.top;
            var bw = nodeBounds.width;
            var bh = nodeBounds.height - borders[2].width;

            switch (borderSide) {
              case 0:
                // top border
                bh = borders[0].width;
                border.args = drawSide({
                  c1: [bx, by],
                  c2: [bx + bw, by],
                  c3: [bx + bw - borders[1].width, by + bh],
                  c4: [bx + borders[3].width, by + bh]
                }, radius[0], radius[1], borderPoints.topLeftOuter, borderPoints.topLeftInner, borderPoints.topRightOuter, borderPoints.topRightInner);
                break;

              case 1:
                // right border
                bx = nodeBounds.left + nodeBounds.width - borders[1].width;
                bw = borders[1].width;
                border.args = drawSide({
                  c1: [bx + bw, by],
                  c2: [bx + bw, by + bh + borders[2].width],
                  c3: [bx, by + bh],
                  c4: [bx, by + borders[0].width]
                }, radius[1], radius[2], borderPoints.topRightOuter, borderPoints.topRightInner, borderPoints.bottomRightOuter, borderPoints.bottomRightInner);
                break;

              case 2:
                // bottom border
                by = by + nodeBounds.height - borders[2].width;
                bh = borders[2].width;
                border.args = drawSide({
                  c1: [bx + bw, by + bh],
                  c2: [bx, by + bh],
                  c3: [bx + borders[3].width, by],
                  c4: [bx + bw - borders[3].width, by]
                }, radius[2], radius[3], borderPoints.bottomRightOuter, borderPoints.bottomRightInner, borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner);
                break;

              case 3:
                // left border
                bw = borders[3].width;
                border.args = drawSide({
                  c1: [bx, by + bh + borders[2].width],
                  c2: [bx, by],
                  c3: [bx + bw, by + borders[0].width],
                  c4: [bx + bw, by + bh]
                }, radius[3], radius[0], borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner, borderPoints.topLeftOuter, borderPoints.topLeftInner);
                break;
            }
          }

          return border;
        });
      }

      NodeParser.prototype.parseBackgroundClip = function (container, borderPoints, borders, radius, bounds) {
        var backgroundClip = container.css('backgroundClip'),
            borderArgs = [];

        switch (backgroundClip) {
          case "content-box":
          case "padding-box":
            parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftInner, borderPoints.topRightInner, bounds.left + borders[3].width, bounds.top + borders[0].width);
            parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightInner, borderPoints.bottomRightInner, bounds.left + bounds.width - borders[1].width, bounds.top + borders[0].width);
            parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightInner, borderPoints.bottomLeftInner, bounds.left + bounds.width - borders[1].width, bounds.top + bounds.height - borders[2].width);
            parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftInner, borderPoints.topLeftInner, bounds.left + borders[3].width, bounds.top + bounds.height - borders[2].width);
            break;

          default:
            parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftOuter, borderPoints.topRightOuter, bounds.left, bounds.top);
            parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightOuter, borderPoints.bottomRightOuter, bounds.left + bounds.width, bounds.top);
            parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightOuter, borderPoints.bottomLeftOuter, bounds.left + bounds.width, bounds.top + bounds.height);
            parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftOuter, borderPoints.topLeftOuter, bounds.left, bounds.top + bounds.height);
            break;
        }

        return borderArgs;
      };

      function getCurvePoints(x, y, r1, r2) {
        var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
        var ox = r1 * kappa,
            // control point offset horizontal
        oy = r2 * kappa,
            // control point offset vertical
        xm = x + r1,
            // x-middle
        ym = y + r2; // y-middle

        return {
          topLeft: bezierCurve({
            x: x,
            y: ym
          }, {
            x: x,
            y: ym - oy
          }, {
            x: xm - ox,
            y: y
          }, {
            x: xm,
            y: y
          }),
          topRight: bezierCurve({
            x: x,
            y: y
          }, {
            x: x + ox,
            y: y
          }, {
            x: xm,
            y: ym - oy
          }, {
            x: xm,
            y: ym
          }),
          bottomRight: bezierCurve({
            x: xm,
            y: y
          }, {
            x: xm,
            y: y + oy
          }, {
            x: x + ox,
            y: ym
          }, {
            x: x,
            y: ym
          }),
          bottomLeft: bezierCurve({
            x: xm,
            y: ym
          }, {
            x: xm - ox,
            y: ym
          }, {
            x: x,
            y: y + oy
          }, {
            x: x,
            y: y
          })
        };
      }

      function calculateCurvePoints(bounds, borderRadius, borders) {
        var x = bounds.left,
            y = bounds.top,
            width = bounds.width,
            height = bounds.height,
            tlh = borderRadius[0][0] < width / 2 ? borderRadius[0][0] : width / 2,
            tlv = borderRadius[0][1] < height / 2 ? borderRadius[0][1] : height / 2,
            trh = borderRadius[1][0] < width / 2 ? borderRadius[1][0] : width / 2,
            trv = borderRadius[1][1] < height / 2 ? borderRadius[1][1] : height / 2,
            brh = borderRadius[2][0] < width / 2 ? borderRadius[2][0] : width / 2,
            brv = borderRadius[2][1] < height / 2 ? borderRadius[2][1] : height / 2,
            blh = borderRadius[3][0] < width / 2 ? borderRadius[3][0] : width / 2,
            blv = borderRadius[3][1] < height / 2 ? borderRadius[3][1] : height / 2;
        var topWidth = width - trh,
            rightHeight = height - brv,
            bottomWidth = width - brh,
            leftHeight = height - blv;
        return {
          topLeftOuter: getCurvePoints(x, y, tlh, tlv).topLeft.subdivide(0.5),
          topLeftInner: getCurvePoints(x + borders[3].width, y + borders[0].width, Math.max(0, tlh - borders[3].width), Math.max(0, tlv - borders[0].width)).topLeft.subdivide(0.5),
          topRightOuter: getCurvePoints(x + topWidth, y, trh, trv).topRight.subdivide(0.5),
          topRightInner: getCurvePoints(x + Math.min(topWidth, width + borders[3].width), y + borders[0].width, topWidth > width + borders[3].width ? 0 : trh - borders[3].width, trv - borders[0].width).topRight.subdivide(0.5),
          bottomRightOuter: getCurvePoints(x + bottomWidth, y + rightHeight, brh, brv).bottomRight.subdivide(0.5),
          bottomRightInner: getCurvePoints(x + Math.min(bottomWidth, width - borders[3].width), y + Math.min(rightHeight, height + borders[0].width), Math.max(0, brh - borders[1].width), brv - borders[2].width).bottomRight.subdivide(0.5),
          bottomLeftOuter: getCurvePoints(x, y + leftHeight, blh, blv).bottomLeft.subdivide(0.5),
          bottomLeftInner: getCurvePoints(x + borders[3].width, y + leftHeight, Math.max(0, blh - borders[3].width), blv - borders[2].width).bottomLeft.subdivide(0.5)
        };
      }

      function bezierCurve(start, startControl, endControl, end) {
        var lerp = function (a, b, t) {
          return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
          };
        };

        return {
          start: start,
          startControl: startControl,
          endControl: endControl,
          end: end,
          subdivide: function (t) {
            var ab = lerp(start, startControl, t),
                bc = lerp(startControl, endControl, t),
                cd = lerp(endControl, end, t),
                abbc = lerp(ab, bc, t),
                bccd = lerp(bc, cd, t),
                dest = lerp(abbc, bccd, t);
            return [bezierCurve(start, ab, abbc, dest), bezierCurve(dest, bccd, cd, end)];
          },
          curveTo: function (borderArgs) {
            borderArgs.push(["bezierCurve", startControl.x, startControl.y, endControl.x, endControl.y, end.x, end.y]);
          },
          curveToReversed: function (borderArgs) {
            borderArgs.push(["bezierCurve", endControl.x, endControl.y, startControl.x, startControl.y, start.x, start.y]);
          }
        };
      }

      function drawSide(borderData, radius1, radius2, outer1, inner1, outer2, inner2) {
        var borderArgs = [];

        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", outer1[1].start.x, outer1[1].start.y]);
          outer1[1].curveTo(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c1[0], borderData.c1[1]]);
        }

        if (radius2[0] > 0 || radius2[1] > 0) {
          borderArgs.push(["line", outer2[0].start.x, outer2[0].start.y]);
          outer2[0].curveTo(borderArgs);
          borderArgs.push(["line", inner2[0].end.x, inner2[0].end.y]);
          inner2[0].curveToReversed(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c2[0], borderData.c2[1]]);
          borderArgs.push(["line", borderData.c3[0], borderData.c3[1]]);
        }

        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", inner1[1].end.x, inner1[1].end.y]);
          inner1[1].curveToReversed(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c4[0], borderData.c4[1]]);
        }

        return borderArgs;
      }

      function parseCorner(borderArgs, radius1, radius2, corner1, corner2, x, y) {
        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", corner1[0].start.x, corner1[0].start.y]);
          corner1[0].curveTo(borderArgs);
          corner1[1].curveTo(borderArgs);
        } else {
          borderArgs.push(["line", x, y]);
        }

        if (radius2[0] > 0 || radius2[1] > 0) {
          borderArgs.push(["line", corner2[0].start.x, corner2[0].start.y]);
        }
      }

      function negativeZIndex(container) {
        return container.cssInt("zIndex") < 0;
      }

      function positiveZIndex(container) {
        return container.cssInt("zIndex") > 0;
      }

      function zIndex0(container) {
        return container.cssInt("zIndex") === 0;
      }

      function inlineLevel(container) {
        return ["inline", "inline-block", "inline-table"].indexOf(container.css("display")) !== -1;
      }

      function isStackingContext(container) {
        return container instanceof StackingContext;
      }

      function hasText(container) {
        return container.node.data.trim().length > 0;
      }

      function noLetterSpacing(container) {
        return /^(normal|none|0px)$/.test(container.parent.css("letterSpacing"));
      }

      function getBorderRadiusData(container) {
        return ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map(function (side) {
          var value = container.css('border' + side + 'Radius');
          var arr = value.split(" ");

          if (arr.length <= 1) {
            arr[1] = arr[0];
          }

          return arr.map(asInt);
        });
      }

      function renderableNode(node) {
        return node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE;
      }

      function isPositionedForStacking(container) {
        var position = container.css("position");
        var zIndex = ["absolute", "relative", "fixed"].indexOf(position) !== -1 ? container.css("zIndex") : "auto";
        return zIndex !== "auto";
      }

      function isPositioned(container) {
        return container.css("position") !== "static";
      }

      function isFloating(container) {
        return container.css("float") !== "none";
      }

      function isInlineBlock(container) {
        return ["inline-block", "inline-table"].indexOf(container.css("display")) !== -1;
      }

      function not(callback) {
        var context = this;
        return function () {
          return !callback.apply(context, arguments);
        };
      }

      function isElement(container) {
        return container.node.nodeType === Node.ELEMENT_NODE;
      }

      function isPseudoElement(container) {
        return container.isPseudoElement === true;
      }

      function isTextNode(container) {
        return container.node.nodeType === Node.TEXT_NODE;
      }

      function zIndexSort(contexts) {
        return function (a, b) {
          return a.cssInt("zIndex") + contexts.indexOf(a) / contexts.length - (b.cssInt("zIndex") + contexts.indexOf(b) / contexts.length);
        };
      }

      function hasOpacity(container) {
        return container.getOpacity() < 1;
      }

      function asInt(value) {
        return parseInt(value, 10);
      }

      function getWidth(border) {
        return border.width;
      }

      function nonIgnoredElement(nodeContainer) {
        return nodeContainer.node.nodeType !== Node.ELEMENT_NODE || ["SCRIPT", "HEAD", "TITLE", "OBJECT", "BR", "OPTION"].indexOf(nodeContainer.node.nodeName) === -1;
      }

      function flatten(arrays) {
        return [].concat.apply([], arrays);
      }

      function stripQuotes(content) {
        var first = content.substr(0, 1);
        return first === content.substr(content.length - 1) && first.match(/'|"/) ? content.substr(1, content.length - 2) : content;
      }

      function getWords(characters) {
        var words = [],
            i = 0,
            onWordBoundary = false,
            word;

        while (characters.length) {
          if (isWordBoundary(characters[i]) === onWordBoundary) {
            word = characters.splice(0, i);

            if (word.length) {
              words.push(punycode.ucs2.encode(word));
            }

            onWordBoundary = !onWordBoundary;
            i = 0;
          } else {
            i++;
          }

          if (i >= characters.length) {
            word = characters.splice(0, i);

            if (word.length) {
              words.push(punycode.ucs2.encode(word));
            }
          }
        }

        return words;
      }

      function isWordBoundary(characterCode) {
        return [32, // <space>
        13, // \r
        10, // \n
        9, // \t
        45 // -
        ].indexOf(characterCode) !== -1;
      }

      function hasUnicode(string) {
        return /[^\u0000-\u00ff]/.test(string);
      }

      module.exports = NodeParser;
    }, {
      "./color": 3,
      "./fontmetrics": 7,
      "./log": 13,
      "./nodecontainer": 14,
      "./pseudoelementcontainer": 18,
      "./stackingcontext": 21,
      "./textcontainer": 25,
      "./utils": 26,
      "punycode": 1
    }],
    16: [function (_dereq_, module, exports) {
      var XHR = _dereq_('./xhr');

      var utils = _dereq_('./utils');

      var log = _dereq_('./log');

      var createWindowClone = _dereq_('./clone');

      var decode64 = utils.decode64;

      function Proxy(src, proxyUrl, document) {
        var supportsCORS = ('withCredentials' in new XMLHttpRequest());

        if (!proxyUrl) {
          return Promise.reject("No proxy configured");
        }

        var callback = createCallback(supportsCORS);
        var url = createProxyUrl(proxyUrl, src, callback);
        return supportsCORS ? XHR(url) : jsonp(document, url, callback).then(function (response) {
          return decode64(response.content);
        });
      }

      var proxyCount = 0;

      function ProxyURL(src, proxyUrl, document) {
        var supportsCORSImage = ('crossOrigin' in new Image());
        var callback = createCallback(supportsCORSImage);
        var url = createProxyUrl(proxyUrl, src, callback);
        return supportsCORSImage ? Promise.resolve(url) : jsonp(document, url, callback).then(function (response) {
          return "data:" + response.type + ";base64," + response.content;
        });
      }

      function jsonp(document, url, callback) {
        return new Promise(function (resolve, reject) {
          var s = document.createElement("script");

          var cleanup = function () {
            delete window.html2canvas.proxy[callback];
            document.body.removeChild(s);
          };

          window.html2canvas.proxy[callback] = function (response) {
            cleanup();
            resolve(response);
          };

          s.src = url;

          s.onerror = function (e) {
            cleanup();
            reject(e);
          };

          document.body.appendChild(s);
        });
      }

      function createCallback(useCORS) {
        return !useCORS ? "html2canvas_" + Date.now() + "_" + ++proxyCount + "_" + Math.round(Math.random() * 100000) : "";
      }

      function createProxyUrl(proxyUrl, src, callback) {
        return proxyUrl + "?url=" + encodeURIComponent(src) + (callback.length ? "&callback=html2canvas.proxy." + callback : "");
      }

      function documentFromHTML(src) {
        return function (html) {
          var parser = new DOMParser(),
              doc;

          try {
            doc = parser.parseFromString(html, "text/html");
          } catch (e) {
            log("DOMParser not supported, falling back to createHTMLDocument");
            doc = document.implementation.createHTMLDocument("");

            try {
              doc.open();
              doc.write(html);
              doc.close();
            } catch (ee) {
              log("createHTMLDocument write not supported, falling back to document.body.innerHTML");
              doc.body.innerHTML = html; // ie9 doesnt support writing to documentElement
            }
          }

          var b = doc.querySelector("base");

          if (!b || !b.href.host) {
            var base = doc.createElement("base");
            base.href = src;
            doc.head.insertBefore(base, doc.head.firstChild);
          }

          return doc;
        };
      }

      function loadUrlDocument(src, proxy, document, width, height, options) {
        return new Proxy(src, proxy, window.document).then(documentFromHTML(src)).then(function (doc) {
          return createWindowClone(doc, document, width, height, options, 0, 0);
        });
      }

      exports.Proxy = Proxy;
      exports.ProxyURL = ProxyURL;
      exports.loadUrlDocument = loadUrlDocument;
    }, {
      "./clone": 2,
      "./log": 13,
      "./utils": 26,
      "./xhr": 28
    }],
    17: [function (_dereq_, module, exports) {
      var ProxyURL = _dereq_('./proxy').ProxyURL;

      function ProxyImageContainer(src, proxy) {
        var link = document.createElement("a");
        link.href = src;
        src = link.href;
        this.src = src;
        this.image = new Image();
        var self = this;
        this.promise = new Promise(function (resolve, reject) {
          self.image.crossOrigin = "Anonymous";
          self.image.onload = resolve;
          self.image.onerror = reject;
          new ProxyURL(src, proxy, document).then(function (url) {
            self.image.src = url;
          })['catch'](reject);
        });
      }

      module.exports = ProxyImageContainer;
    }, {
      "./proxy": 16
    }],
    18: [function (_dereq_, module, exports) {
      var NodeContainer = _dereq_('./nodecontainer');

      function PseudoElementContainer(node, parent, type) {
        NodeContainer.call(this, node, parent);
        this.isPseudoElement = true;
        this.before = type === ":before";
      }

      PseudoElementContainer.prototype.cloneTo = function (stack) {
        PseudoElementContainer.prototype.cloneTo.call(this, stack);
        stack.isPseudoElement = true;
        stack.before = this.before;
      };

      PseudoElementContainer.prototype = Object.create(NodeContainer.prototype);

      PseudoElementContainer.prototype.appendToDOM = function () {
        if (this.before) {
          this.parent.node.insertBefore(this.node, this.parent.node.firstChild);
        } else {
          this.parent.node.appendChild(this.node);
        }

        this.parent.node.className += " " + this.getHideClass();
      };

      PseudoElementContainer.prototype.cleanDOM = function () {
        this.node.parentNode.removeChild(this.node);
        this.parent.node.className = this.parent.node.className.replace(this.getHideClass(), "");
      };

      PseudoElementContainer.prototype.getHideClass = function () {
        return this["PSEUDO_HIDE_ELEMENT_CLASS_" + (this.before ? "BEFORE" : "AFTER")];
      };

      PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = "___html2canvas___pseudoelement_before";
      PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER = "___html2canvas___pseudoelement_after";
      module.exports = PseudoElementContainer;
    }, {
      "./nodecontainer": 14
    }],
    19: [function (_dereq_, module, exports) {
      var log = _dereq_('./log');

      function Renderer(width, height, images, options, document) {
        this.width = width;
        this.height = height;
        this.images = images;
        this.options = options;
        this.document = document;
      }

      Renderer.prototype.renderImage = function (container, bounds, borderData, imageContainer) {
        var paddingLeft = container.cssInt('paddingLeft'),
            paddingTop = container.cssInt('paddingTop'),
            paddingRight = container.cssInt('paddingRight'),
            paddingBottom = container.cssInt('paddingBottom'),
            borders = borderData.borders;
        var width = bounds.width - (borders[1].width + borders[3].width + paddingLeft + paddingRight);
        var height = bounds.height - (borders[0].width + borders[2].width + paddingTop + paddingBottom);
        this.drawImage(imageContainer, 0, 0, imageContainer.image.width || width, imageContainer.image.height || height, bounds.left + paddingLeft + borders[3].width, bounds.top + paddingTop + borders[0].width, width, height);
      };

      Renderer.prototype.renderBackground = function (container, bounds, borderData) {
        if (bounds.height > 0 && bounds.width > 0) {
          this.renderBackgroundColor(container, bounds);
          this.renderBackgroundImage(container, bounds, borderData);
        }
      };

      Renderer.prototype.renderBackgroundColor = function (container, bounds) {
        var color = container.color("backgroundColor");

        if (!color.isTransparent()) {
          this.rectangle(bounds.left, bounds.top, bounds.width, bounds.height, color);
        }
      };

      Renderer.prototype.renderBorders = function (borders) {
        borders.forEach(this.renderBorder, this);
      };

      Renderer.prototype.renderBorder = function (data) {
        if (!data.color.isTransparent() && data.args !== null) {
          this.drawShape(data.args, data.color);
        }
      };

      Renderer.prototype.renderBackgroundImage = function (container, bounds, borderData) {
        var backgroundImages = container.parseBackgroundImages();
        backgroundImages.reverse().forEach(function (backgroundImage, index, arr) {
          switch (backgroundImage.method) {
            case "url":
              var image = this.images.get(backgroundImage.args[0]);

              if (image) {
                this.renderBackgroundRepeating(container, bounds, image, arr.length - (index + 1), borderData);
              } else {
                log("Error loading background-image", backgroundImage.args[0]);
              }

              break;

            case "linear-gradient":
            case "gradient":
              var gradientImage = this.images.get(backgroundImage.value);

              if (gradientImage) {
                this.renderBackgroundGradient(gradientImage, bounds, borderData);
              } else {
                log("Error loading background-image", backgroundImage.args[0]);
              }

              break;

            case "none":
              break;

            default:
              log("Unknown background-image type", backgroundImage.args[0]);
          }
        }, this);
      };

      Renderer.prototype.renderBackgroundRepeating = function (container, bounds, imageContainer, index, borderData) {
        var size = container.parseBackgroundSize(bounds, imageContainer.image, index);
        var position = container.parseBackgroundPosition(bounds, imageContainer.image, index, size);
        var repeat = container.parseBackgroundRepeat(index);

        switch (repeat) {
          case "repeat-x":
          case "repeat no-repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + borderData[3], bounds.top + position.top + borderData[0], 99999, size.height, borderData);
            break;

          case "repeat-y":
          case "no-repeat repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + position.left + borderData[3], bounds.top + borderData[0], size.width, 99999, borderData);
            break;

          case "no-repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + position.left + borderData[3], bounds.top + position.top + borderData[0], size.width, size.height, borderData);
            break;

          default:
            this.renderBackgroundRepeat(imageContainer, position, size, {
              top: bounds.top,
              left: bounds.left
            }, borderData[3], borderData[0]);
            break;
        }
      };

      module.exports = Renderer;
    }, {
      "./log": 13
    }],
    20: [function (_dereq_, module, exports) {
      var Renderer = _dereq_('../renderer');

      var LinearGradientContainer = _dereq_('../lineargradientcontainer');

      var log = _dereq_('../log');

      function CanvasRenderer(width, height) {
        Renderer.apply(this, arguments);
        this.canvas = this.options.canvas || this.document.createElement("canvas");

        if (!this.options.canvas) {
          this.canvas.width = width;
          this.canvas.height = height;
        }

        this.ctx = this.canvas.getContext("2d");
        this.taintCtx = this.document.createElement("canvas").getContext("2d");
        this.ctx.textBaseline = "bottom";
        this.variables = {};
        log("Initialized CanvasRenderer with size", width, "x", height);
      }

      CanvasRenderer.prototype = Object.create(Renderer.prototype);

      CanvasRenderer.prototype.setFillStyle = function (fillStyle) {
        this.ctx.fillStyle = typeof fillStyle === "object" && !!fillStyle.isColor ? fillStyle.toString() : fillStyle;
        return this.ctx;
      };

      CanvasRenderer.prototype.rectangle = function (left, top, width, height, color) {
        this.setFillStyle(color).fillRect(left, top, width, height);
      };

      CanvasRenderer.prototype.circle = function (left, top, size, color) {
        this.setFillStyle(color);
        this.ctx.beginPath();
        this.ctx.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      };

      CanvasRenderer.prototype.circleStroke = function (left, top, size, color, stroke, strokeColor) {
        this.circle(left, top, size, color);
        this.ctx.strokeStyle = strokeColor.toString();
        this.ctx.stroke();
      };

      CanvasRenderer.prototype.drawShape = function (shape, color) {
        this.shape(shape);
        this.setFillStyle(color).fill();
      };

      CanvasRenderer.prototype.taints = function (imageContainer) {
        if (imageContainer.tainted === null) {
          this.taintCtx.drawImage(imageContainer.image, 0, 0);

          try {
            this.taintCtx.getImageData(0, 0, 1, 1);
            imageContainer.tainted = false;
          } catch (e) {
            this.taintCtx = document.createElement("canvas").getContext("2d");
            imageContainer.tainted = true;
          }
        }

        return imageContainer.tainted;
      };

      CanvasRenderer.prototype.drawImage = function (imageContainer, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!this.taints(imageContainer) || this.options.allowTaint) {
          this.ctx.drawImage(imageContainer.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
      };

      CanvasRenderer.prototype.clip = function (shapes, callback, context) {
        this.ctx.save();
        shapes.filter(hasEntries).forEach(function (shape) {
          this.shape(shape).clip();
        }, this);
        callback.call(context);
        this.ctx.restore();
      };

      CanvasRenderer.prototype.shape = function (shape) {
        this.ctx.beginPath();
        shape.forEach(function (point, index) {
          if (point[0] === "rect") {
            this.ctx.rect.apply(this.ctx, point.slice(1));
          } else {
            this.ctx[index === 0 ? "moveTo" : point[0] + "To"].apply(this.ctx, point.slice(1));
          }
        }, this);
        this.ctx.closePath();
        return this.ctx;
      };

      CanvasRenderer.prototype.font = function (color, style, variant, weight, size, family) {
        this.setFillStyle(color).font = [style, variant, weight, size, family].join(" ").split(",")[0];
      };

      CanvasRenderer.prototype.fontShadow = function (color, offsetX, offsetY, blur) {
        this.setVariable("shadowColor", color.toString()).setVariable("shadowOffsetY", offsetX).setVariable("shadowOffsetX", offsetY).setVariable("shadowBlur", blur);
      };

      CanvasRenderer.prototype.clearShadow = function () {
        this.setVariable("shadowColor", "rgba(0,0,0,0)");
      };

      CanvasRenderer.prototype.setOpacity = function (opacity) {
        this.ctx.globalAlpha = opacity;
      };

      CanvasRenderer.prototype.setTransform = function (transform) {
        this.ctx.translate(transform.origin[0], transform.origin[1]);
        this.ctx.transform.apply(this.ctx, transform.matrix);
        this.ctx.translate(-transform.origin[0], -transform.origin[1]);
      };

      CanvasRenderer.prototype.setVariable = function (property, value) {
        if (this.variables[property] !== value) {
          this.variables[property] = this.ctx[property] = value;
        }

        return this;
      };

      CanvasRenderer.prototype.text = function (text, left, bottom) {
        this.ctx.fillText(text, left, bottom);
      };

      CanvasRenderer.prototype.backgroundRepeatShape = function (imageContainer, backgroundPosition, size, bounds, left, top, width, height, borderData) {
        var shape = [["line", Math.round(left), Math.round(top)], ["line", Math.round(left + width), Math.round(top)], ["line", Math.round(left + width), Math.round(height + top)], ["line", Math.round(left), Math.round(height + top)]];
        this.clip([shape], function () {
          this.renderBackgroundRepeat(imageContainer, backgroundPosition, size, bounds, borderData[3], borderData[0]);
        }, this);
      };

      CanvasRenderer.prototype.renderBackgroundRepeat = function (imageContainer, backgroundPosition, size, bounds, borderLeft, borderTop) {
        var offsetX = Math.round(bounds.left + backgroundPosition.left + borderLeft),
            offsetY = Math.round(bounds.top + backgroundPosition.top + borderTop);
        this.setFillStyle(this.ctx.createPattern(this.resizeImage(imageContainer, size), "repeat"));
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
      };

      CanvasRenderer.prototype.renderBackgroundGradient = function (gradientImage, bounds) {
        if (gradientImage instanceof LinearGradientContainer) {
          var gradient = this.ctx.createLinearGradient(bounds.left + bounds.width * gradientImage.x0, bounds.top + bounds.height * gradientImage.y0, bounds.left + bounds.width * gradientImage.x1, bounds.top + bounds.height * gradientImage.y1);
          gradientImage.colorStops.forEach(function (colorStop) {
            gradient.addColorStop(colorStop.stop, colorStop.color.toString());
          });
          this.rectangle(bounds.left, bounds.top, bounds.width, bounds.height, gradient);
        }
      };

      CanvasRenderer.prototype.resizeImage = function (imageContainer, size) {
        var image = imageContainer.image;

        if (image.width === size.width && image.height === size.height) {
          return image;
        }

        var ctx,
            canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size.width, size.height);
        return canvas;
      };

      function hasEntries(array) {
        return array.length > 0;
      }

      module.exports = CanvasRenderer;
    }, {
      "../lineargradientcontainer": 12,
      "../log": 13,
      "../renderer": 19
    }],
    21: [function (_dereq_, module, exports) {
      var NodeContainer = _dereq_('./nodecontainer');

      function StackingContext(hasOwnStacking, opacity, element, parent) {
        NodeContainer.call(this, element, parent);
        this.ownStacking = hasOwnStacking;
        this.contexts = [];
        this.children = [];
        this.opacity = (this.parent ? this.parent.stack.opacity : 1) * opacity;
      }

      StackingContext.prototype = Object.create(NodeContainer.prototype);

      StackingContext.prototype.getParentStack = function (context) {
        var parentStack = this.parent ? this.parent.stack : null;
        return parentStack ? parentStack.ownStacking ? parentStack : parentStack.getParentStack(context) : context.stack;
      };

      module.exports = StackingContext;
    }, {
      "./nodecontainer": 14
    }],
    22: [function (_dereq_, module, exports) {
      function Support(document) {
        this.rangeBounds = this.testRangeBounds(document);
        this.cors = this.testCORS();
        this.svg = this.testSVG();
      }

      Support.prototype.testRangeBounds = function (document) {
        var range,
            testElement,
            rangeBounds,
            rangeHeight,
            support = false;

        if (document.createRange) {
          range = document.createRange();

          if (range.getBoundingClientRect) {
            testElement = document.createElement('boundtest');
            testElement.style.height = "123px";
            testElement.style.display = "block";
            document.body.appendChild(testElement);
            range.selectNode(testElement);
            rangeBounds = range.getBoundingClientRect();
            rangeHeight = rangeBounds.height;

            if (rangeHeight === 123) {
              support = true;
            }

            document.body.removeChild(testElement);
          }
        }

        return support;
      };

      Support.prototype.testCORS = function () {
        return typeof new Image().crossOrigin !== "undefined";
      };

      Support.prototype.testSVG = function () {
        var img = new Image();
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";

        try {
          ctx.drawImage(img, 0, 0);
          canvas.toDataURL();
        } catch (e) {
          return false;
        }

        return true;
      };

      module.exports = Support;
    }, {}],
    23: [function (_dereq_, module, exports) {
      var XHR = _dereq_('./xhr');

      var decode64 = _dereq_('./utils').decode64;

      function SVGContainer(src) {
        this.src = src;
        this.image = null;
        var self = this;
        this.promise = this.hasFabric().then(function () {
          return self.isInline(src) ? Promise.resolve(self.inlineFormatting(src)) : XHR(src);
        }).then(function (svg) {
          return new Promise(function (resolve) {
            window.html2canvas.svg.fabric.loadSVGFromString(svg, self.createCanvas.call(self, resolve));
          });
        });
      }

      SVGContainer.prototype.hasFabric = function () {
        return !window.html2canvas.svg || !window.html2canvas.svg.fabric ? Promise.reject(new Error("html2canvas.svg.js is not loaded, cannot render svg")) : Promise.resolve();
      };

      SVGContainer.prototype.inlineFormatting = function (src) {
        return /^data:image\/svg\+xml;base64,/.test(src) ? this.decode64(this.removeContentType(src)) : this.removeContentType(src);
      };

      SVGContainer.prototype.removeContentType = function (src) {
        return src.replace(/^data:image\/svg\+xml(;base64)?,/, '');
      };

      SVGContainer.prototype.isInline = function (src) {
        return /^data:image\/svg\+xml/i.test(src);
      };

      SVGContainer.prototype.createCanvas = function (resolve) {
        var self = this;
        return function (objects, options) {
          var canvas = new window.html2canvas.svg.fabric.StaticCanvas('c');
          self.image = canvas.lowerCanvasEl;
          canvas.setWidth(options.width).setHeight(options.height).add(window.html2canvas.svg.fabric.util.groupSVGElements(objects, options)).renderAll();
          resolve(canvas.lowerCanvasEl);
        };
      };

      SVGContainer.prototype.decode64 = function (str) {
        return typeof window.atob === "function" ? window.atob(str) : decode64(str);
      };

      module.exports = SVGContainer;
    }, {
      "./utils": 26,
      "./xhr": 28
    }],
    24: [function (_dereq_, module, exports) {
      var SVGContainer = _dereq_('./svgcontainer');

      function SVGNodeContainer(node, _native) {
        this.src = node;
        this.image = null;
        var self = this;
        this.promise = _native ? new Promise(function (resolve, reject) {
          self.image = new Image();
          self.image.onload = resolve;
          self.image.onerror = reject;
          self.image.src = "data:image/svg+xml," + new XMLSerializer().serializeToString(node);

          if (self.image.complete === true) {
            resolve(self.image);
          }
        }) : this.hasFabric().then(function () {
          return new Promise(function (resolve) {
            window.html2canvas.svg.fabric.parseSVGDocument(node, self.createCanvas.call(self, resolve));
          });
        });
      }

      SVGNodeContainer.prototype = Object.create(SVGContainer.prototype);
      module.exports = SVGNodeContainer;
    }, {
      "./svgcontainer": 23
    }],
    25: [function (_dereq_, module, exports) {
      var NodeContainer = _dereq_('./nodecontainer');

      function TextContainer(node, parent) {
        NodeContainer.call(this, node, parent);
      }

      TextContainer.prototype = Object.create(NodeContainer.prototype);

      TextContainer.prototype.applyTextTransform = function () {
        this.node.data = this.transform(this.parent.css("textTransform"));
      };

      TextContainer.prototype.transform = function (transform) {
        var text = this.node.data;

        switch (transform) {
          case "lowercase":
            return text.toLowerCase();

          case "capitalize":
            return text.replace(/(^|\s|:|-|\(|\))([a-z])/g, capitalize);

          case "uppercase":
            return text.toUpperCase();

          default:
            return text;
        }
      };

      function capitalize(m, p1, p2) {
        if (m.length > 0) {
          return p1 + p2.toUpperCase();
        }
      }

      module.exports = TextContainer;
    }, {
      "./nodecontainer": 14
    }],
    26: [function (_dereq_, module, exports) {
      exports.smallImage = function smallImage() {
        return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      };

      exports.bind = function (callback, context) {
        return function () {
          return callback.apply(context, arguments);
        };
      };
      /*
       * base64-arraybuffer
       * https://github.com/niklasvh/base64-arraybuffer
       *
       * Copyright (c) 2012 Niklas von Hertzen
       * Licensed under the MIT license.
       */


      exports.decode64 = function (base64) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var len = base64.length,
            i,
            encoded1,
            encoded2,
            encoded3,
            encoded4,
            byte1,
            byte2,
            byte3;
        var output = "";

        for (i = 0; i < len; i += 4) {
          encoded1 = chars.indexOf(base64[i]);
          encoded2 = chars.indexOf(base64[i + 1]);
          encoded3 = chars.indexOf(base64[i + 2]);
          encoded4 = chars.indexOf(base64[i + 3]);
          byte1 = encoded1 << 2 | encoded2 >> 4;
          byte2 = (encoded2 & 15) << 4 | encoded3 >> 2;
          byte3 = (encoded3 & 3) << 6 | encoded4;

          if (encoded3 === 64) {
            output += String.fromCharCode(byte1);
          } else if (encoded4 === 64 || encoded4 === -1) {
            output += String.fromCharCode(byte1, byte2);
          } else {
            output += String.fromCharCode(byte1, byte2, byte3);
          }
        }

        return output;
      };

      exports.getBounds = function (node) {
        if (node.getBoundingClientRect) {
          var clientRect = node.getBoundingClientRect();
          var width = node.offsetWidth == null ? clientRect.width : node.offsetWidth;
          return {
            top: clientRect.top,
            bottom: clientRect.bottom || clientRect.top + clientRect.height,
            right: clientRect.left + width,
            left: clientRect.left,
            width: width,
            height: node.offsetHeight == null ? clientRect.height : node.offsetHeight
          };
        }

        return {};
      };

      exports.offsetBounds = function (node) {
        var parent = node.offsetParent ? exports.offsetBounds(node.offsetParent) : {
          top: 0,
          left: 0
        };
        return {
          top: node.offsetTop + parent.top,
          bottom: node.offsetTop + node.offsetHeight + parent.top,
          right: node.offsetLeft + parent.left + node.offsetWidth,
          left: node.offsetLeft + parent.left,
          width: node.offsetWidth,
          height: node.offsetHeight
        };
      };

      exports.parseBackgrounds = function (backgroundImage) {
        var whitespace = ' \r\n\t',
            method,
            definition,
            prefix,
            prefix_i,
            block,
            results = [],
            mode = 0,
            numParen = 0,
            quote,
            args;

        var appendResult = function () {
          if (method) {
            if (definition.substr(0, 1) === '"') {
              definition = definition.substr(1, definition.length - 2);
            }

            if (definition) {
              args.push(definition);
            }

            if (method.substr(0, 1) === '-' && (prefix_i = method.indexOf('-', 1) + 1) > 0) {
              prefix = method.substr(0, prefix_i);
              method = method.substr(prefix_i);
            }

            results.push({
              prefix: prefix,
              method: method.toLowerCase(),
              value: block,
              args: args,
              image: null
            });
          }

          args = [];
          method = prefix = definition = block = '';
        };

        args = [];
        method = prefix = definition = block = '';
        backgroundImage.split("").forEach(function (c) {
          if (mode === 0 && whitespace.indexOf(c) > -1) {
            return;
          }

          switch (c) {
            case '"':
              if (!quote) {
                quote = c;
              } else if (quote === c) {
                quote = null;
              }

              break;

            case '(':
              if (quote) {
                break;
              } else if (mode === 0) {
                mode = 1;
                block += c;
                return;
              } else {
                numParen++;
              }

              break;

            case ')':
              if (quote) {
                break;
              } else if (mode === 1) {
                if (numParen === 0) {
                  mode = 0;
                  block += c;
                  appendResult();
                  return;
                } else {
                  numParen--;
                }
              }

              break;

            case ',':
              if (quote) {
                break;
              } else if (mode === 0) {
                appendResult();
                return;
              } else if (mode === 1) {
                if (numParen === 0 && !method.match(/^url$/i)) {
                  args.push(definition);
                  definition = '';
                  block += c;
                  return;
                }
              }

              break;
          }

          block += c;

          if (mode === 0) {
            method += c;
          } else {
            definition += c;
          }
        });
        appendResult();
        return results;
      };
    }, {}],
    27: [function (_dereq_, module, exports) {
      var GradientContainer = _dereq_('./gradientcontainer');

      function WebkitGradientContainer(imageData) {
        GradientContainer.apply(this, arguments);
        this.type = imageData.args[0] === "linear" ? GradientContainer.TYPES.LINEAR : GradientContainer.TYPES.RADIAL;
      }

      WebkitGradientContainer.prototype = Object.create(GradientContainer.prototype);
      module.exports = WebkitGradientContainer;
    }, {
      "./gradientcontainer": 9
    }],
    28: [function (_dereq_, module, exports) {
      function XHR(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url);

          xhr.onload = function () {
            if (xhr.status === 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(xhr.statusText));
            }
          };

          xhr.onerror = function () {
            reject(new Error("Network Error"));
          };

          xhr.send();
        });
      }

      module.exports = XHR;
    }, {}]
  }, {}, [4])(4);
});

/***/ }),

/***/ 2079:
/***/ (() => {

L.Control.Basemaps = L.Control.extend({
  _map: null,
  includes: L.Evented ? L.Evented.prototype : L.Mixin.Event,
  options: {
    position: "bottomleft",
    tileX: 0,
    tileY: 0,
    tileZ: 0,
    layers: [] // list of basemap layer objects, first in list is default and added to map with this control

  },
  basemap: null,
  onAdd: function (map) {
    this._map = map;
    var container = L.DomUtil.create("div", "basemaps leaflet-control closed"); // disable events

    L.DomEvent.disableClickPropagation(container);

    if (!L.Browser.touch) {
      L.DomEvent.disableScrollPropagation(container);
    }

    this.options.basemaps.forEach(function (d, i) {
      var basemapClass = "basemap";

      if (i === 0) {
        this.basemap = d;

        this._map.addLayer(d);

        basemapClass += " active alt";
      } //  else if (i === 1) {
      //     basemapClass += " alt";
      // }


      var url;

      if (d.options.iconURL) {
        url = d.options.iconURL;
      } else {
        var coords = {
          x: this.options.tileX,
          y: this.options.tileY
        };
        url = L.Util.template(d._url, L.extend({
          s: d._getSubdomain(coords),
          x: coords.x,
          y: d.options.tms ? d._globalTileRange.max.y - coords.y : coords.y,
          z: this.options.tileZ
        }, d.options));

        if (d instanceof L.TileLayer.WMS) {
          // d may not yet be initialized, yet functions below expect ._map to be set
          d._map = map; // unfortunately, calling d.getTileUrl() does not work due to scope issues
          // have to replicate some of the logic from L.TileLayer.WMS
          // adapted from L.TileLayer.WMS::onAdd

          var crs = d.options.crs || map.options.crs;
          var wmsParams = L.extend({}, d.wmsParams);
          var wmsVersion = parseFloat(wmsParams.version);
          var projectionKey = wmsVersion >= 1.3 ? "crs" : "srs";
          wmsParams[projectionKey] = crs.code; // adapted from L.TileLayer.WMS::getTileUrl

          var coords2 = L.point(coords);
          coords2.z = this.options.tileZ;

          var tileBounds = d._tileCoordsToBounds(coords2);

          var nw = crs.project(tileBounds.getNorthWest());
          var se = crs.project(tileBounds.getSouthEast());
          var bbox = (wmsVersion >= 1.3 && crs === L.CRS.EPSG4326 ? [se.y, nw.x, nw.y, se.x] : [nw.x, se.y, se.x, nw.y]).join(",");
          url += L.Util.getParamString(wmsParams, url, d.options.uppercase) + (d.options.uppercase ? "&BBOX=" : "&bbox=") + bbox;
        }
      }

      var basemapNode = L.DomUtil.create("div", basemapClass, container);
      var imgNode = L.DomUtil.create("img", null, basemapNode);
      imgNode.src = url;

      if (d.options && d.options.label) {
        imgNode.title = d.options.label;
      }

      L.DomEvent.on(basemapNode, "click", function () {
        // intercept open click on mobile devices and show options
        if (this.options.basemaps.length > 2 && L.Browser.mobile) {
          if (L.DomUtil.hasClass(container, "closed")) {
            L.DomUtil.removeClass(container, "closed");
            return;
          }
        } //if different, remove previous basemap, and add new one


        if (d != this.basemap) {
          map.removeLayer(this.basemap);
          map.addLayer(d);
          d.bringToBack();
          map.fire("baselayerchange", d);
          this.basemap = d;
          L.DomUtil.removeClass(container.getElementsByClassName("basemap active")[0], "active");
          L.DomUtil.addClass(basemapNode, "active");
          var altIdx = (i + 0) % this.options.basemaps.length;
          L.DomUtil.removeClass(container.getElementsByClassName("basemap alt")[0], "alt");
          L.DomUtil.addClass(container.getElementsByClassName("basemap")[altIdx], "alt");
          L.DomUtil.addClass(container, "closed");
        }
      }, this);
    }, this);

    if (this.options.basemaps.length > 2 && !L.Browser.mobile) {
      L.DomEvent.on(container, "mouseenter", function () {
        L.DomUtil.removeClass(container, "closed");
      }, this);
      L.DomEvent.on(container, "mouseleave", function () {
        L.DomUtil.addClass(container, "closed");
      }, this);
    }

    this._container = container;
    return this._container;
  }
});

L.control.basemaps = function (options) {
  return new L.Control.Basemaps(options);
};

/***/ }),

/***/ 3864:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	Name					Data passed			   Description

	Managed Events:
	 search:locationfound	{latlng, title, layer} fired after moved and show markerLocation
	 search:expanded		{}					   fired after control was expanded
	 search:collapsed		{}					   fired after control was collapsed
 	 search:cancel			{}					   fired after cancel button clicked

	Public methods:
	 setLayer()				L.LayerGroup()         set layer search at runtime
	 showAlert()            'Text message'         show alert message
	 searchText()			'Text searched'        search text by external code
*/
//TODO implement can do research on multiple sources layers and remote		
//TODO history: false,		//show latest searches in tooltip		
//FIXME option condition problem {autoCollapse: true, markerLocation: true} not show location
//FIXME option condition problem {autoCollapse: false }
//
//TODO here insert function  search inputText FIRST in _recordsCache keys and if not find results.. 
//  run one of callbacks search(sourceData,jsonpUrl or options.layer) and run this.showTooltip
//
//TODO change structure of _recordsCache
//	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
//	in this mode every record can have a free structure of attributes, only 'loc' is required
//TODO important optimization!!! always append data in this._recordsCache
//  now _recordsCache content is emptied and replaced with new data founded
//  always appending data on _recordsCache give the possibility of caching ajax, jsonp and layersearch!
//
//TODO here insert function  search inputText FIRST in _recordsCache keys and if not find results.. 
//  run one of callbacks search(sourceData,jsonpUrl or options.layer) and run this.showTooltip
//
//TODO change structure of _recordsCache
//	like this: _recordsCache = {"text-key1": {loc:[lat,lng], ..other attributes.. }, {"text-key2": {loc:[lat,lng]}...}, ...}
//	in this way every record can have a free structure of attributes, only 'loc' is required
(function (factory) {
  if (true) {
    //AMD
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(5243)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(function (L) {
  L.Control.Search = L.Control.extend({
    includes: L.version[0] === '1' ? L.Evented.prototype : L.Mixin.Events,
    options: {
      url: '',
      //url for search by ajax request, ex: "search.php?q={s}". Can be function to returns string for dynamic parameter setting
      layer: null,
      //layer where search markers(is a L.LayerGroup)				
      sourceData: null,
      //function to fill _recordsCache, passed searching text by first param and callback in second				
      //TODO implements uniq option 'sourceData' to recognizes source type: url,array,callback or layer				
      jsonpParam: null,
      //jsonp param name for search by jsonp service, ex: "callback"
      propertyLoc: 'loc',
      //field for remapping location, using array: ['latname','lonname'] for select double fields(ex. ['lat','lon'] ) support dotted format: 'prop.subprop.title'
      propertyName: 'title',
      //property in marker.options(or feature.properties for vector layer) trough filter elements in layer,
      formatData: null,
      //callback for reformat all data from source to indexed data object
      filterData: null,
      //callback for filtering data from text searched, params: textSearch, allRecords
      moveToLocation: null,
      //callback run on location found, params: latlng, title, map
      buildTip: null,
      //function to return row tip html node(or html string), receive text tooltip in first param
      container: '',
      //container id to insert Search Control		
      zoom: null,
      //default zoom level for move to location
      minLength: 1,
      //minimal text length for autocomplete
      initial: true,
      //search elements only by initial text
      casesensitive: false,
      //search elements in case sensitive text
      autoType: true,
      //complete input with first suggested result and select this filled-in text.
      delayType: 400,
      //delay while typing for show tooltip
      tooltipLimit: -1,
      //limit max results to show in tooltip. -1 for no limit, 0 for no results
      tipAutoSubmit: true,
      //auto map panTo when click on tooltip
      firstTipSubmit: false,
      //auto select first result con enter click
      autoResize: true,
      //autoresize on input change
      collapsed: true,
      //collapse search control at startup
      autoCollapse: false,
      //collapse search control after submit(on button or on tips if enabled tipAutoSubmit)
      autoCollapseTime: 1200,
      //delay for autoclosing alert and collapse after blur
      textErr: 'Location not found',
      //error message
      textCancel: 'Cancel',
      //title in cancel button		
      textPlaceholder: 'Search...',
      //placeholder value			
      hideMarkerOnCollapse: false,
      //remove circle and marker on search control collapsed		
      position: 'topleft',
      marker: {
        //custom L.Marker or false for hide
        icon: false,
        //custom L.Icon for maker location or false for hide
        animate: true,
        //animate a circle over location found
        circle: {
          //draw a circle in location found
          radius: 10,
          weight: 3,
          color: '#e03',
          stroke: true,
          fill: false
        }
      }
    },
    _getPath: function (obj, prop) {
      var parts = prop.split('.'),
          last = parts.pop(),
          len = parts.length,
          cur = parts[0],
          i = 1;
      if (len > 0) while ((obj = obj[cur]) && i < len) cur = parts[i++];
      if (obj) return obj[last];
    },
    _isObject: function (obj) {
      return Object.prototype.toString.call(obj) === "[object Object]";
    },
    initialize: function (options) {
      L.Util.setOptions(this, options || {});
      this._inputMinSize = this.options.textPlaceholder ? this.options.textPlaceholder.length : 10;
      this._layer = this.options.layer || new L.LayerGroup();
      this._filterData = this.options.filterData || this._defaultFilterData;
      this._formatData = this.options.formatData || this._defaultFormatData;
      this._moveToLocation = this.options.moveToLocation || this._defaultMoveToLocation;
      this._autoTypeTmp = this.options.autoType; //useful for disable autoType temporarily in delete/backspace keydown

      this._countertips = 0; //number of tips items

      this._recordsCache = {}; //key,value table! to store locations! format: key,latlng

      this._curReq = null;
    },
    onAdd: function (map) {
      this._map = map;
      this._container = L.DomUtil.create('div', 'leaflet-control-search');
      this._input = this._createInput(this.options.textPlaceholder, 'search-input');
      this._tooltip = this._createTooltip('search-tooltip');
      this._cancel = this._createCancel(this.options.textCancel, 'search-cancel');
      this._button = this._createButton(this.options.textPlaceholder, 'search-button');
      this._alert = this._createAlert('search-alert');
      if (this.options.collapsed === false) this.expand(this.options.collapsed);

      if (this.options.marker) {
        if (this.options.marker instanceof L.Marker || this.options.marker instanceof L.CircleMarker) this._markerSearch = this.options.marker;else if (this._isObject(this.options.marker)) this._markerSearch = new L.Control.Search.Marker([0, 0], this.options.marker);
        this._markerSearch._isMarkerSearch = true;
      }

      this.setLayer(this._layer);
      map.on({
        // 		'layeradd': this._onLayerAddRemove,
        // 		'layerremove': this._onLayerAddRemove
        'resize': this._handleAutoresize
      }, this);
      return this._container;
    },
    addTo: function (map) {
      if (this.options.container) {
        this._container = this.onAdd(map);
        this._wrapper = L.DomUtil.get(this.options.container);
        this._wrapper.style.position = 'relative';

        this._wrapper.appendChild(this._container);
      } else L.Control.prototype.addTo.call(this, map);

      return this;
    },
    onRemove: function (map) {
      this._recordsCache = {}; // map.off({
      // 		'layeradd': this._onLayerAddRemove,
      // 		'layerremove': this._onLayerAddRemove
      // 	}, this);
    },
    // _onLayerAddRemove: function(e) {
    // 	//without this, run setLayer also for each Markers!! to optimize!
    // 	if(e.layer instanceof L.LayerGroup)
    // 		if( L.stamp(e.layer) != L.stamp(this._layer) )
    // 			this.setLayer(e.layer);
    // },
    setLayer: function (layer) {
      //set search layer at runtime
      //this.options.layer = layer; //setting this, run only this._recordsFromLayer()
      this._layer = layer;

      this._layer.addTo(this._map);

      return this;
    },
    showAlert: function (text) {
      var self = this;
      text = text || this.options.textErr;
      this._alert.style.display = 'block';
      this._alert.innerHTML = text;
      clearTimeout(this.timerAlert);
      this.timerAlert = setTimeout(function () {
        self.hideAlert();
      }, this.options.autoCollapseTime);
      return this;
    },
    hideAlert: function () {
      this._alert.style.display = 'none';
      return this;
    },
    cancel: function () {
      this._input.value = '';

      this._handleKeypress({
        keyCode: 8
      }); //simulate backspace keypress


      this._input.size = this._inputMinSize;

      this._input.focus();

      this._cancel.style.display = 'none';

      this._hideTooltip();

      this.fire('search:cancel');
      return this;
    },
    expand: function (toggle) {
      toggle = typeof toggle === 'boolean' ? toggle : true;
      this._input.style.display = 'block';
      L.DomUtil.addClass(this._container, 'search-exp');

      if (toggle !== false) {
        this._input.focus();

        this._map.on('dragstart click', this.collapse, this);
      }

      this.fire('search:expanded');
      return this;
    },
    collapse: function () {
      this._hideTooltip();

      this.cancel();
      this._alert.style.display = 'none';

      this._input.blur();

      if (this.options.collapsed) {
        this._input.style.display = 'none';
        this._cancel.style.display = 'none';
        L.DomUtil.removeClass(this._container, 'search-exp');

        if (this.options.hideMarkerOnCollapse) {
          this._map.removeLayer(this._markerSearch);
        }

        this._map.off('dragstart click', this.collapse, this);
      }

      this.fire('search:collapsed');
      return this;
    },
    collapseDelayed: function () {
      //collapse after delay, used on_input blur
      var self = this;
      if (!this.options.autoCollapse) return this;
      clearTimeout(this.timerCollapse);
      this.timerCollapse = setTimeout(function () {
        self.collapse();
      }, this.options.autoCollapseTime);
      return this;
    },
    collapseDelayedStop: function () {
      clearTimeout(this.timerCollapse);
      return this;
    },
    ////start DOM creations
    _createAlert: function (className) {
      var alert = L.DomUtil.create('div', className, this._container);
      alert.style.display = 'none';
      L.DomEvent.on(alert, 'click', L.DomEvent.stop, this).on(alert, 'click', this.hideAlert, this);
      return alert;
    },
    _createInput: function (text, className) {
      var self = this;
      var label = L.DomUtil.create('label', className, this._container);
      var input = L.DomUtil.create('input', className, this._container);
      input.type = 'text';
      input.size = this._inputMinSize;
      input.value = '';
      input.autocomplete = 'off';
      input.autocorrect = 'off';
      input.autocapitalize = 'off';
      input.placeholder = text;
      input.style.display = 'none';
      input.role = 'search';
      input.id = input.role + input.type + input.size;
      label.htmlFor = input.id;
      label.style.display = 'none';
      label.value = text;
      L.DomEvent.disableClickPropagation(input).on(input, 'keyup', this._handleKeypress, this).on(input, 'paste', function (e) {
        setTimeout(function (e) {
          self._handleKeypress(e);
        }, 10, e);
      }, this).on(input, 'blur', this.collapseDelayed, this).on(input, 'focus', this.collapseDelayedStop, this);
      return input;
    },
    _createCancel: function (title, className) {
      var cancel = L.DomUtil.create('a', className, this._container);
      cancel.href = '#';
      cancel.title = title;
      cancel.style.display = 'none';
      cancel.innerHTML = "<span>&otimes;</span>"; //imageless(see css)

      L.DomEvent.on(cancel, 'click', L.DomEvent.stop, this).on(cancel, 'click', this.cancel, this);
      return cancel;
    },
    _createButton: function (title, className) {
      var button = L.DomUtil.create('a', className, this._container);
      button.href = '#';
      button.title = title;
      L.DomEvent.on(button, 'click', L.DomEvent.stop, this).on(button, 'click', this._handleSubmit, this).on(button, 'focus', this.collapseDelayedStop, this).on(button, 'blur', this.collapseDelayed, this);
      return button;
    },
    _createTooltip: function (className) {
      var self = this;
      var tool = L.DomUtil.create('ul', className, this._container);
      tool.style.display = 'none';
      L.DomEvent.disableClickPropagation(tool).on(tool, 'blur', this.collapseDelayed, this).on(tool, 'mousewheel', function (e) {
        self.collapseDelayedStop();
        L.DomEvent.stopPropagation(e); //disable zoom map
      }, this).on(tool, 'mouseover', function (e) {
        self.collapseDelayedStop();
      }, this);
      return tool;
    },
    _createTip: function (text, val) {
      //val is object in recordCache, usually is Latlng
      var tip;

      if (this.options.buildTip) {
        tip = this.options.buildTip.call(this, text, val); //custom tip node or html string

        if (typeof tip === 'string') {
          var tmpNode = L.DomUtil.create('div');
          tmpNode.innerHTML = tip;
          tip = tmpNode.firstChild;
        }
      } else {
        tip = L.DomUtil.create('li', '');
        tip.innerHTML = text;
      }

      L.DomUtil.addClass(tip, 'search-tip');
      tip._text = text; //value replaced in this._input and used by _autoType

      if (this.options.tipAutoSubmit) L.DomEvent.disableClickPropagation(tip).on(tip, 'click', L.DomEvent.stop, this).on(tip, 'click', function (e) {
        this._input.value = text;

        this._handleAutoresize();

        this._input.focus();

        this._hideTooltip();

        this._handleSubmit();
      }, this);
      return tip;
    },
    //////end DOM creations
    _getUrl: function (text) {
      return typeof this.options.url === 'function' ? this.options.url(text) : this.options.url;
    },
    _defaultFilterData: function (text, records) {
      var I,
          icase,
          regSearch,
          frecords = {};
      text = text.replace(/[.*+?^${}()|[\]\\]/g, ''); //sanitize remove all special characters

      if (text === '') return [];
      I = this.options.initial ? '^' : ''; //search only initial text

      icase = !this.options.casesensitive ? 'i' : undefined;
      regSearch = new RegExp(I + text, icase); //TODO use .filter or .map

      for (var key in records) {
        if (regSearch.test(key)) frecords[key] = records[key];
      }

      return frecords;
    },
    showTooltip: function (records) {
      this._countertips = 0;
      this._tooltip.innerHTML = '';
      this._tooltip.currentSelection = -1; //inizialized for _handleArrowSelect()

      if (this.options.tooltipLimit) {
        for (var key in records) //fill tooltip
        {
          if (this._countertips === this.options.tooltipLimit) break;
          this._countertips++;

          this._tooltip.appendChild(this._createTip(key, records[key]));
        }
      }

      if (this._countertips > 0) {
        this._tooltip.style.display = 'block';
        if (this._autoTypeTmp) this._autoType();
        this._autoTypeTmp = this.options.autoType; //reset default value
      } else this._hideTooltip();

      this._tooltip.scrollTop = 0;
      return this._countertips;
    },
    _hideTooltip: function () {
      this._tooltip.style.display = 'none';
      this._tooltip.innerHTML = '';
      return 0;
    },
    _defaultFormatData: function (json) {
      //default callback for format data to indexed data
      var self = this,
          propName = this.options.propertyName,
          propLoc = this.options.propertyLoc,
          i,
          jsonret = {};
      if (L.Util.isArray(propLoc)) for (i in json) jsonret[self._getPath(json[i], propName)] = L.latLng(json[i][propLoc[0]], json[i][propLoc[1]]);else for (i in json) jsonret[self._getPath(json[i], propName)] = L.latLng(self._getPath(json[i], propLoc)); //TODO throw new Error("propertyName '"+propName+"' not found in JSON data");

      return jsonret;
    },
    _recordsFromJsonp: function (text, callAfter) {
      //extract searched records from remote jsonp service
      L.Control.Search.callJsonp = callAfter;
      var script = L.DomUtil.create('script', 'leaflet-search-jsonp', document.getElementsByTagName('body')[0]),
          url = L.Util.template(this._getUrl(text) + '&' + this.options.jsonpParam + '=L.Control.Search.callJsonp', {
        s: text
      }); //parsing url
      //rnd = '&_='+Math.floor(Math.random()*10000);
      //TODO add rnd param or randomize callback name! in recordsFromJsonp

      script.type = 'text/javascript';
      script.src = url;
      return {
        abort: function () {
          script.parentNode.removeChild(script);
        }
      };
    },
    _recordsFromAjax: function (text, callAfter) {
      //Ajax request
      if (window.XMLHttpRequest === undefined) {
        window.XMLHttpRequest = function () {
          try {
            return new ActiveXObject("Microsoft.XMLHTTP.6.0");
          } catch (e1) {
            try {
              return new ActiveXObject("Microsoft.XMLHTTP.3.0");
            } catch (e2) {
              throw new Error("XMLHttpRequest is not supported");
            }
          }
        };
      }

      var IE8or9 = L.Browser.ie && !window.atob && document.querySelector,
          request = IE8or9 ? new XDomainRequest() : new XMLHttpRequest(),
          url = L.Util.template(this._getUrl(text), {
        s: text
      }); //rnd = '&_='+Math.floor(Math.random()*10000);
      //TODO add rnd param or randomize callback name! in recordsFromAjax			

      request.open("GET", url);

      request.onload = function () {
        callAfter(JSON.parse(request.responseText));
      };

      request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
          this.onload();
        }
      };

      request.send();
      return request;
    },
    _searchInLayer: function (layer, retRecords, propName) {
      var self = this,
          loc;
      if (layer instanceof L.Control.Search.Marker) return;

      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        if (self._getPath(layer.options, propName)) {
          loc = layer.getLatLng();
          loc.layer = layer;
          retRecords[self._getPath(layer.options, propName)] = loc;
        } else if (self._getPath(layer.feature.properties, propName)) {
          loc = layer.getLatLng();
          loc.layer = layer;
          retRecords[self._getPath(layer.feature.properties, propName)] = loc;
        } else {
          //throw new Error("propertyName '"+propName+"' not found in marker"); 
          console.warn("propertyName '" + propName + "' not found in marker");
        }
      } else if (layer instanceof L.Path || layer instanceof L.Polyline || layer instanceof L.Polygon) {
        if (self._getPath(layer.options, propName)) {
          loc = layer.getBounds().getCenter();
          loc.layer = layer;
          retRecords[self._getPath(layer.options, propName)] = loc;
        } else if (self._getPath(layer.feature.properties, propName)) {
          loc = layer.getBounds().getCenter();
          loc.layer = layer;
          retRecords[self._getPath(layer.feature.properties, propName)] = loc;
        } else {
          //throw new Error("propertyName '"+propName+"' not found in shape"); 
          console.warn("propertyName '" + propName + "' not found in shape");
        }
      } else if (layer.hasOwnProperty('feature')) //GeoJSON
        {
          if (layer.feature.properties.hasOwnProperty(propName)) {
            if (layer.getLatLng && typeof layer.getLatLng === 'function') {
              loc = layer.getLatLng();
              loc.layer = layer;
              retRecords[layer.feature.properties[propName]] = loc;
            } else if (layer.getBounds && typeof layer.getBounds === 'function') {
              loc = layer.getBounds().getCenter();
              loc.layer = layer;
              retRecords[layer.feature.properties[propName]] = loc;
            } else {
              console.warn("Unknown type of Layer");
            }
          } else {
            //throw new Error("propertyName '"+propName+"' not found in feature");
            console.warn("propertyName '" + propName + "' not found in feature");
          }
        } else if (layer instanceof L.LayerGroup) {
        layer.eachLayer(function (layer) {
          self._searchInLayer(layer, retRecords, propName);
        });
      }
    },
    _recordsFromLayer: function () {
      //return table: key,value from layer
      var self = this,
          retRecords = {},
          propName = this.options.propertyName;

      this._layer.eachLayer(function (layer) {
        self._searchInLayer(layer, retRecords, propName);
      });

      return retRecords;
    },
    _autoType: function () {
      //TODO implements autype without selection(useful for mobile device)
      var start = this._input.value.length,
          firstRecord = this._tooltip.firstChild ? this._tooltip.firstChild._text : '',
          end = firstRecord.length;

      if (firstRecord.indexOf(this._input.value) === 0) {
        // If prefix match
        this._input.value = firstRecord;

        this._handleAutoresize();

        if (this._input.createTextRange) {
          var selRange = this._input.createTextRange();

          selRange.collapse(true);
          selRange.moveStart('character', start);
          selRange.moveEnd('character', end);
          selRange.select();
        } else if (this._input.setSelectionRange) {
          this._input.setSelectionRange(start, end);
        } else if (this._input.selectionStart) {
          this._input.selectionStart = start;
          this._input.selectionEnd = end;
        }
      }
    },
    _hideAutoType: function () {
      // deselect text:
      var sel;

      if ((sel = this._input.selection) && sel.empty) {
        sel.empty();
      } else if (this._input.createTextRange) {
        sel = this._input.createTextRange();
        sel.collapse(true);
        var end = this._input.value.length;
        sel.moveStart('character', end);
        sel.moveEnd('character', end);
        sel.select();
      } else {
        if (this._input.getSelection) {
          this._input.getSelection().removeAllRanges();
        }

        this._input.selectionStart = this._input.selectionEnd;
      }
    },
    _handleKeypress: function (e) {
      //run _input keyup event
      var self = this;

      switch (e.keyCode) {
        case 27:
          //Esc
          this.collapse();
          break;

        case 13:
          //Enter
          if (this._countertips == 1 || this.options.firstTipSubmit && this._countertips > 0) {
            if (this._tooltip.currentSelection == -1) {
              this._handleArrowSelect(1);
            }
          }

          this._handleSubmit(); //do search


          break;

        case 38:
          //Up
          this._handleArrowSelect(-1);

          break;

        case 40:
          //Down
          this._handleArrowSelect(1);

          break;

        case 8: //Backspace

        case 45: //Insert

        case 46:
          //Delete
          this._autoTypeTmp = false; //disable temporarily autoType

          break;

        case 37: //Left

        case 39: //Right

        case 16: //Shift

        case 17: //Ctrl

        case 35: //End

        case 36:
          //Home
          break;

        default:
          //All keys
          if (this._input.value.length) this._cancel.style.display = 'block';else this._cancel.style.display = 'none';

          if (this._input.value.length >= this.options.minLength) {
            clearTimeout(this.timerKeypress); //cancel last search request while type in				

            this.timerKeypress = setTimeout(function () {
              //delay before request, for limit jsonp/ajax request
              self._fillRecordsCache();
            }, this.options.delayType);
          } else this._hideTooltip();

      }

      this._handleAutoresize();
    },
    searchText: function (text) {
      var code = text.charCodeAt(text.length);
      this._input.value = text;
      this._input.style.display = 'block';
      L.DomUtil.addClass(this._container, 'search-exp');
      this._autoTypeTmp = false;

      this._handleKeypress({
        keyCode: code
      });
    },
    _fillRecordsCache: function () {
      var self = this,
          inputText = this._input.value,
          records;
      if (this._curReq && this._curReq.abort) this._curReq.abort(); //abort previous requests

      L.DomUtil.addClass(this._container, 'search-load');

      if (this.options.layer) {
        //TODO _recordsFromLayer must return array of objects, formatted from _formatData
        this._recordsCache = this._recordsFromLayer();
        records = this._filterData(this._input.value, this._recordsCache);
        this.showTooltip(records);
        L.DomUtil.removeClass(this._container, 'search-load');
      } else {
        if (this.options.sourceData) this._retrieveData = this.options.sourceData;else if (this.options.url) //jsonp or ajax
          this._retrieveData = this.options.jsonpParam ? this._recordsFromJsonp : this._recordsFromAjax;
        this._curReq = this._retrieveData.call(this, inputText, function (data) {
          self._recordsCache = self._formatData.call(self, data); //TODO refact!

          if (self.options.sourceData) records = self._filterData(self._input.value, self._recordsCache);else records = self._recordsCache;
          self.showTooltip(records);
          L.DomUtil.removeClass(self._container, 'search-load');
        });
      }
    },
    _handleAutoresize: function () {
      var maxWidth;

      if (this._input.style.maxWidth !== this._map._container.offsetWidth) {
        maxWidth = this._map._container.clientWidth; // other side margin + padding + width border + width search-button + width search-cancel

        maxWidth -= 10 + 20 + 1 + 30 + 22;
        this._input.style.maxWidth = maxWidth.toString() + 'px';
      }

      if (this.options.autoResize && this._container.offsetWidth + 20 < this._map._container.offsetWidth) {
        this._input.size = this._input.value.length < this._inputMinSize ? this._inputMinSize : this._input.value.length;
      }
    },
    _handleArrowSelect: function (velocity) {
      var searchTips = this._tooltip.hasChildNodes() ? this._tooltip.childNodes : [];

      for (i = 0; i < searchTips.length; i++) L.DomUtil.removeClass(searchTips[i], 'search-tip-select');

      if (velocity == 1 && this._tooltip.currentSelection >= searchTips.length - 1) {
        // If at end of list.
        L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
      } else if (velocity == -1 && this._tooltip.currentSelection <= 0) {
        // Going back up to the search box.
        this._tooltip.currentSelection = -1;
      } else if (this._tooltip.style.display != 'none') {
        this._tooltip.currentSelection += velocity;
        L.DomUtil.addClass(searchTips[this._tooltip.currentSelection], 'search-tip-select');
        this._input.value = searchTips[this._tooltip.currentSelection]._text; // scroll:

        var tipOffsetTop = searchTips[this._tooltip.currentSelection].offsetTop;

        if (tipOffsetTop + searchTips[this._tooltip.currentSelection].clientHeight >= this._tooltip.scrollTop + this._tooltip.clientHeight) {
          this._tooltip.scrollTop = tipOffsetTop - this._tooltip.clientHeight + searchTips[this._tooltip.currentSelection].clientHeight;
        } else if (tipOffsetTop <= this._tooltip.scrollTop) {
          this._tooltip.scrollTop = tipOffsetTop;
        }
      }
    },
    _handleSubmit: function () {
      //button and tooltip click and enter submit
      this._hideAutoType();

      this.hideAlert();

      this._hideTooltip();

      if (this._input.style.display == 'none') //on first click show _input only
        this.expand();else {
        if (this._input.value === '') //hide _input only
          this.collapse();else {
          var loc = this._getLocation(this._input.value);

          if (loc === false) this.showAlert();else {
            this.showLocation(loc, this._input.value);
            this.fire('search:locationfound', {
              latlng: loc,
              text: this._input.value,
              layer: loc.layer ? loc.layer : null
            });
          }
        }
      }
    },
    _getLocation: function (key) {
      //extract latlng from _recordsCache
      if (this._recordsCache.hasOwnProperty(key)) return this._recordsCache[key]; //then after use .loc attribute
      else return false;
    },
    _defaultMoveToLocation: function (latlng, title, map) {
      if (this.options.zoom) this._map.setView(latlng, this.options.zoom);else this._map.panTo(latlng);
    },
    showLocation: function (latlng, title) {
      //set location on map from _recordsCache
      var self = this;

      self._map.once('moveend zoomend', function (e) {
        if (self._markerSearch) {
          self._markerSearch.addTo(self._map).setLatLng(latlng);
        }
      });

      self._moveToLocation(latlng, title, self._map); //FIXME autoCollapse option hide self._markerSearch before visualized!!


      if (self.options.autoCollapse) self.collapse();
      return self;
    }
  });
  L.Control.Search.Marker = L.Marker.extend({
    includes: L.version[0] === '1' ? L.Evented.prototype : L.Mixin.Events,
    options: {
      icon: new L.Icon.Default(),
      animate: true,
      circle: {
        radius: 10,
        weight: 3,
        color: '#e03',
        stroke: true,
        fill: false
      }
    },
    initialize: function (latlng, options) {
      L.setOptions(this, options);
      if (options.icon === true) options.icon = new L.Icon.Default();
      L.Marker.prototype.initialize.call(this, latlng, options);
      if (L.Control.Search.prototype._isObject(this.options.circle)) this._circleLoc = new L.CircleMarker(latlng, this.options.circle);
    },
    onAdd: function (map) {
      L.Marker.prototype.onAdd.call(this, map);

      if (this._circleLoc) {
        map.addLayer(this._circleLoc);
        if (this.options.animate) this.animate();
      }
    },
    onRemove: function (map) {
      L.Marker.prototype.onRemove.call(this, map);
      if (this._circleLoc) map.removeLayer(this._circleLoc);
    },
    setLatLng: function (latlng) {
      L.Marker.prototype.setLatLng.call(this, latlng);
      if (this._circleLoc) this._circleLoc.setLatLng(latlng);
      return this;
    },
    _initIcon: function () {
      if (this.options.icon) L.Marker.prototype._initIcon.call(this);
    },
    _removeIcon: function () {
      if (this.options.icon) L.Marker.prototype._removeIcon.call(this);
    },
    animate: function () {
      //TODO refact animate() more smooth! like this: http://goo.gl/DDlRs
      if (this._circleLoc) {
        var circle = this._circleLoc,
            tInt = 200,
            //time interval
        ss = 5,
            //frames
        mr = parseInt(circle._radius / ss),
            oldrad = this.options.circle.radius,
            newrad = circle._radius * 2,
            acc = 0;
        circle._timerAnimLoc = setInterval(function () {
          acc += 0.5;
          mr += acc; //adding acceleration

          newrad -= mr;
          circle.setRadius(newrad);

          if (newrad < oldrad) {
            clearInterval(circle._timerAnimLoc);
            circle.setRadius(oldrad); //reset radius
            //if(typeof afterAnimCall == 'function')
            //afterAnimCall();
            //TODO use create event 'animateEnd' in L.Control.Search.Marker 
          }
        }, tInt);
      }

      return this;
    }
  });
  L.Map.addInitHook(function () {
    if (this.options.searchControl) {
      this.searchControl = L.control.search(this.options.searchControl);
      this.addControl(this.searchControl);
    }
  });

  L.control.search = function (options) {
    return new L.Control.Search(options);
  };

  return L.Control.Search;
});

/***/ }),

/***/ 9651:
/***/ (() => {

/*! leaflet.coordinates 07-12-2016 */
L.Control.Coordinates = L.Control.extend({
  options: {
    position: "bottomright",
    decimals: 4,
    decimalSeperator: ".",
    labelTemplateLat: "Lat: {y}",
    labelTemplateLng: "Lng: {x}",
    labelFormatterLat: void 0,
    labelFormatterLng: void 0,
    enableUserInput: !0,
    useDMS: !1,
    useLatLngOrder: !1,
    centerUserCoordinates: !1,
    markerType: L.marker,
    markerProps: {}
  },
  onAdd: function (a) {
    this._map = a;
    var b = "leaflet-control-coordinates",
        c = this._container = L.DomUtil.create("div", b),
        d = this.options;
    this._labelcontainer = L.DomUtil.create("div", "uiElement label", c), this._label = L.DomUtil.create("span", "labelFirst", this._labelcontainer), this._inputcontainer = L.DomUtil.create("div", "uiElement input uiHidden", c);
    var e, f;
    return d.useLatLngOrder ? (f = L.DomUtil.create("span", "", this._inputcontainer), this._inputY = this._createInput("inputY", this._inputcontainer), e = L.DomUtil.create("span", "", this._inputcontainer), this._inputX = this._createInput("inputX", this._inputcontainer)) : (e = L.DomUtil.create("span", "", this._inputcontainer), this._inputX = this._createInput("inputX", this._inputcontainer), f = L.DomUtil.create("span", "", this._inputcontainer), this._inputY = this._createInput("inputY", this._inputcontainer)), e.innerHTML = d.labelTemplateLng.replace("{x}", ""), f.innerHTML = d.labelTemplateLat.replace("{y}", ""), L.DomEvent.on(this._inputX, "keyup", this._handleKeypress, this), L.DomEvent.on(this._inputY, "keyup", this._handleKeypress, this), a.on("mousemove", this._update, this), a.on("dragstart", this.collapse, this), a.whenReady(this._update, this), this._showsCoordinates = !0, d.enableUserInput && L.DomEvent.addListener(this._container, "click", this._switchUI, this), c;
  },
  _createInput: function (a, b) {
    var c = L.DomUtil.create("input", a, b);
    return c.type = "text", L.DomEvent.disableClickPropagation(c), c;
  },
  _clearMarker: function () {
    this._map.removeLayer(this._marker);
  },
  _handleKeypress: function (a) {
    switch (a.keyCode) {
      case 27:
        this.collapse();
        break;

      case 13:
        this._handleSubmit(), this.collapse();
        break;

      default:
        this._handleSubmit();

    }
  },
  _handleSubmit: function () {
    var a = L.NumberFormatter.createValidNumber(this._inputX.value, this.options.decimalSeperator),
        b = L.NumberFormatter.createValidNumber(this._inputY.value, this.options.decimalSeperator);

    if (void 0 !== a && void 0 !== b) {
      var c = this._marker;
      c || (c = this._marker = this._createNewMarker(), c.on("click", this._clearMarker, this));
      var d = new L.LatLng(b, a);
      c.setLatLng(d), c.addTo(this._map), this.options.centerUserCoordinates && this._map.setView(d, this._map.getZoom());
    }
  },
  expand: function () {
    this._showsCoordinates = !1, this._map.off("mousemove", this._update, this), L.DomEvent.addListener(this._container, "mousemove", L.DomEvent.stop), L.DomEvent.removeListener(this._container, "click", this._switchUI, this), L.DomUtil.addClass(this._labelcontainer, "uiHidden"), L.DomUtil.removeClass(this._inputcontainer, "uiHidden");
  },
  _createCoordinateLabel: function (a) {
    var b,
        c,
        d = this.options;
    return d.customLabelFcn ? d.customLabelFcn(a, d) : (b = d.labelFormatterLng ? d.labelFormatterLng(a.lng) : L.Util.template(d.labelTemplateLng, {
      x: this._getNumber(a.lng, d)
    }), c = d.labelFormatterLat ? d.labelFormatterLat(a.lat) : L.Util.template(d.labelTemplateLat, {
      y: this._getNumber(a.lat, d)
    }), d.useLatLngOrder ? c + " " + b : b + " " + c);
  },
  _getNumber: function (a, b) {
    var c;
    return c = b.useDMS ? L.NumberFormatter.toDMS(a) : L.NumberFormatter.round(a, b.decimals, b.decimalSeperator);
  },
  collapse: function () {
    if (!this._showsCoordinates) {
      this._map.on("mousemove", this._update, this), this._showsCoordinates = !0;
      this.options;

      if (L.DomEvent.addListener(this._container, "click", this._switchUI, this), L.DomEvent.removeListener(this._container, "mousemove", L.DomEvent.stop), L.DomUtil.addClass(this._inputcontainer, "uiHidden"), L.DomUtil.removeClass(this._labelcontainer, "uiHidden"), this._marker) {
        var a = this._createNewMarker(),
            b = this._marker.getLatLng();

        a.setLatLng(b);
        var c = L.DomUtil.create("div", ""),
            d = L.DomUtil.create("div", "", c);
        d.innerHTML = this._ordinateLabel(b);
        var e = L.DomUtil.create("a", "", c);
        e.innerHTML = "Remove", e.href = "#";
        var f = L.DomEvent.stopPropagation;
        L.DomEvent.on(e, "click", f).on(e, "mousedown", f).on(e, "dblclick", f).on(e, "click", L.DomEvent.preventDefault).on(e, "click", function () {
          this._map.removeLayer(a);
        }, this), a.bindPopup(c), a.addTo(this._map), this._map.removeLayer(this._marker), this._marker = null;
      }
    }
  },
  _switchUI: function (a) {
    L.DomEvent.stop(a), L.DomEvent.stopPropagation(a), L.DomEvent.preventDefault(a), this._showsCoordinates ? this.expand() : this.collapse();
  },
  onRemove: function (a) {
    a.off("mousemove", this._update, this);
  },
  _update: function (a) {
    var b = a.latlng,
        c = this.options;
    b && (b = b.wrap(), this._currentPos = b, this._inputY.value = L.NumberFormatter.round(b.lat, c.decimals, c.decimalSeperator), this._inputX.value = L.NumberFormatter.round(b.lng, c.decimals, c.decimalSeperator), this._label.innerHTML = this._createCoordinateLabel(b));
  },
  _createNewMarker: function () {
    return this.options.markerType(null, this.options.markerProps);
  }
}), L.control.coordinates = function (a) {
  return new L.Control.Coordinates(a);
}, L.Map.mergeOptions({
  coordinateControl: !1
}), L.Map.addInitHook(function () {
  this.options.coordinateControl && (this.coordinateControl = new L.Control.Coordinates(), this.addControl(this.coordinateControl));
}), L.NumberFormatter = {
  round: function (a, b, c) {
    var d = L.Util.formatNum(a, b) + "",
        e = d.split(".");

    if (e[1]) {
      for (var f = b - e[1].length; f > 0; f--) e[1] += "0";

      d = e.join(c || ".");
    }

    return d;
  },
  toDMS: function (a) {
    var b = Math.floor(Math.abs(a)),
        c = 60 * (Math.abs(a) - b),
        d = Math.floor(c),
        e = 60 * (c - d),
        f = Math.round(e);
    60 == f && (d++, f = "00"), 60 == d && (b++, d = "00"), 10 > f && (f = "0" + f), 10 > d && (d = "0" + d);
    var g = "";
    return 0 > a && (g = "-"), "" + g + b + "&deg; " + d + "' " + f + "''";
  },
  createValidNumber: function (a, b) {
    if (a && a.length > 0) {
      var c = a.split(b || ".");

      try {
        var d = Number(c.join("."));
        return isNaN(d) ? void 0 : d;
      } catch (e) {
        return void 0;
      }
    }

    return void 0;
  }
};

/***/ }),

/***/ 5373:
/***/ (() => {

/*
 Leaflet.draw 1.0.4, a plugin that adds drawing and editing tools to Leaflet powered maps.
 (c) 2012-2017, Jacob Toye, Jon West, Smartrak, Leaflet

 https://github.com/Leaflet/Leaflet.draw
 http://leafletjs.com
 */
!function (t, e, i) {
  function o(t, e) {
    for (; (t = t.parentElement) && !t.classList.contains(e););

    return t;
  }

  L.drawVersion = "1.0.4", L.Draw = {}, L.drawLocal = {
    draw: {
      toolbar: {
        actions: {
          title: "Cancel drawing",
          text: "Cancel"
        },
        finish: {
          title: "Finish drawing",
          text: "Finish"
        },
        undo: {
          title: "Delete last point drawn",
          text: "Delete last point"
        },
        buttons: {
          polyline: "Draw a polyline",
          polygon: "Draw a polygon",
          rectangle: "Draw a rectangle",
          circle: "Draw a circle",
          marker: "Draw a marker",
          circlemarker: "Draw a circlemarker"
        }
      },
      handlers: {
        circle: {
          tooltip: {
            start: "Click and drag to draw circle."
          },
          radius: "Radius"
        },
        circlemarker: {
          tooltip: {
            start: "Click map to place circle marker."
          }
        },
        marker: {
          tooltip: {
            start: "Click map to place marker."
          }
        },
        polygon: {
          tooltip: {
            start: "Click to start drawing shape.",
            cont: "Click to continue drawing shape.",
            end: "Click first point to close this shape."
          }
        },
        polyline: {
          error: "<strong>Error:</strong> shape edges cannot cross!",
          tooltip: {
            start: "Click to start drawing line.",
            cont: "Click to continue drawing line.",
            end: "Click last point to finish line."
          }
        },
        rectangle: {
          tooltip: {
            start: "Click and drag to draw rectangle."
          }
        },
        simpleshape: {
          tooltip: {
            end: "Release mouse to finish drawing."
          }
        }
      }
    },
    edit: {
      toolbar: {
        actions: {
          save: {
            title: "Save changes",
            text: "Save"
          },
          cancel: {
            title: "Cancel editing, discards all changes",
            text: "Cancel"
          },
          clearAll: {
            title: "Clear all layers",
            text: "Clear All"
          }
        },
        buttons: {
          edit: "Edit layers",
          editDisabled: "No layers to edit",
          remove: "Delete layers",
          removeDisabled: "No layers to delete"
        }
      },
      handlers: {
        edit: {
          tooltip: {
            text: "Drag handles or markers to edit features.",
            subtext: "Click cancel to undo changes."
          }
        },
        remove: {
          tooltip: {
            text: "Click on a feature to remove."
          }
        }
      }
    }
  }, L.Draw.Event = {}, L.Draw.Event.CREATED = "draw:created", L.Draw.Event.EDITED = "draw:edited", L.Draw.Event.DELETED = "draw:deleted", L.Draw.Event.DRAWSTART = "draw:drawstart", L.Draw.Event.DRAWSTOP = "draw:drawstop", L.Draw.Event.DRAWVERTEX = "draw:drawvertex", L.Draw.Event.EDITSTART = "draw:editstart", L.Draw.Event.EDITMOVE = "draw:editmove", L.Draw.Event.EDITRESIZE = "draw:editresize", L.Draw.Event.EDITVERTEX = "draw:editvertex", L.Draw.Event.EDITSTOP = "draw:editstop", L.Draw.Event.DELETESTART = "draw:deletestart", L.Draw.Event.DELETESTOP = "draw:deletestop", L.Draw.Event.TOOLBAROPENED = "draw:toolbaropened", L.Draw.Event.TOOLBARCLOSED = "draw:toolbarclosed", L.Draw.Event.MARKERCONTEXT = "draw:markercontext", L.Draw = L.Draw || {}, L.Draw.Feature = L.Handler.extend({
    initialize: function (t, e) {
      this._map = t, this._container = t._container, this._overlayPane = t._panes.overlayPane, this._popupPane = t._panes.popupPane, e && e.shapeOptions && (e.shapeOptions = L.Util.extend({}, this.options.shapeOptions, e.shapeOptions)), L.setOptions(this, e);
      var i = L.version.split(".");
      1 === parseInt(i[0], 10) && parseInt(i[1], 10) >= 2 ? L.Draw.Feature.include(L.Evented.prototype) : L.Draw.Feature.include(L.Mixin.Events);
    },
    enable: function () {
      this._enabled || (L.Handler.prototype.enable.call(this), this.fire("enabled", {
        handler: this.type
      }), this._map.fire(L.Draw.Event.DRAWSTART, {
        layerType: this.type
      }));
    },
    disable: function () {
      this._enabled && (L.Handler.prototype.disable.call(this), this._map.fire(L.Draw.Event.DRAWSTOP, {
        layerType: this.type
      }), this.fire("disabled", {
        handler: this.type
      }));
    },
    addHooks: function () {
      var t = this._map;
      t && (L.DomUtil.disableTextSelection(), t.getContainer().focus(), this._tooltip = new L.Draw.Tooltip(this._map), L.DomEvent.on(this._container, "keyup", this._cancelDrawing, this));
    },
    removeHooks: function () {
      this._map && (L.DomUtil.enableTextSelection(), this._tooltip.dispose(), this._tooltip = null, L.DomEvent.off(this._container, "keyup", this._cancelDrawing, this));
    },
    setOptions: function (t) {
      L.setOptions(this, t);
    },
    _fireCreatedEvent: function (t) {
      this._map.fire(L.Draw.Event.CREATED, {
        layer: t,
        layerType: this.type
      });
    },
    _cancelDrawing: function (t) {
      27 === t.keyCode && (this._map.fire("draw:canceled", {
        layerType: this.type
      }), this.disable());
    }
  }), L.Draw.Polyline = L.Draw.Feature.extend({
    statics: {
      TYPE: "polyline"
    },
    Poly: L.Polyline,
    options: {
      allowIntersection: !0,
      repeatMode: !1,
      drawError: {
        color: "#b00b00",
        timeout: 2500
      },
      icon: new L.DivIcon({
        iconSize: new L.Point(8, 8),
        className: "leaflet-div-icon leaflet-editing-icon"
      }),
      touchIcon: new L.DivIcon({
        iconSize: new L.Point(20, 20),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-touch-icon"
      }),
      guidelineDistance: 20,
      maxGuideLineLength: 4e3,
      shapeOptions: {
        stroke: !0,
        color: "#3388ff",
        weight: 4,
        opacity: .5,
        fill: !1,
        clickable: !0
      },
      metric: !0,
      feet: !0,
      nautic: !1,
      showLength: !0,
      zIndexOffset: 2e3,
      factor: 1,
      maxPoints: 0
    },
    initialize: function (t, e) {
      L.Browser.touch && (this.options.icon = this.options.touchIcon), this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error, e && e.drawError && (e.drawError = L.Util.extend({}, this.options.drawError, e.drawError)), this.type = L.Draw.Polyline.TYPE, L.Draw.Feature.prototype.initialize.call(this, t, e);
    },
    addHooks: function () {
      L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._markers = [], this._markerGroup = new L.LayerGroup(), this._map.addLayer(this._markerGroup), this._poly = new L.Polyline([], this.options.shapeOptions), this._tooltip.updateContent(this._getTooltipText()), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40]
        }),
        opacity: 0,
        zIndexOffset: this.options.zIndexOffset
      })), this._mouseMarker.on("mouseout", this._onMouseOut, this).on("mousemove", this._onMouseMove, this).on("mousedown", this._onMouseDown, this).on("mouseup", this._onMouseUp, this).addTo(this._map), this._map.on("mouseup", this._onMouseUp, this).on("mousemove", this._onMouseMove, this).on("zoomlevelschange", this._onZoomEnd, this).on("touchstart", this._onTouch, this).on("zoomend", this._onZoomEnd, this));
    },
    removeHooks: function () {
      L.Draw.Feature.prototype.removeHooks.call(this), this._clearHideErrorTimeout(), this._cleanUpShape(), this._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers, this._map.removeLayer(this._poly), delete this._poly, this._mouseMarker.off("mousedown", this._onMouseDown, this).off("mouseout", this._onMouseOut, this).off("mouseup", this._onMouseUp, this).off("mousemove", this._onMouseMove, this), this._map.removeLayer(this._mouseMarker), delete this._mouseMarker, this._clearGuides(), this._map.off("mouseup", this._onMouseUp, this).off("mousemove", this._onMouseMove, this).off("zoomlevelschange", this._onZoomEnd, this).off("zoomend", this._onZoomEnd, this).off("touchstart", this._onTouch, this).off("click", this._onTouch, this);
    },
    deleteLastVertex: function () {
      if (!(this._markers.length <= 1)) {
        var t = this._markers.pop(),
            e = this._poly,
            i = e.getLatLngs(),
            o = i.splice(-1, 1)[0];

        this._poly.setLatLngs(i), this._markerGroup.removeLayer(t), e.getLatLngs().length < 2 && this._map.removeLayer(e), this._vertexChanged(o, !1);
      }
    },
    addVertex: function (t) {
      if (this._markers.length >= 2 && !this.options.allowIntersection && this._poly.newLatLngIntersects(t)) return void this._showErrorTooltip();
      this._errorShown && this._hideErrorTooltip(), this._markers.push(this._createMarker(t)), this._poly.addLatLng(t), 2 === this._poly.getLatLngs().length && this._map.addLayer(this._poly), this._vertexChanged(t, !0);
    },
    completeShape: function () {
      this._markers.length <= 1 || !this._shapeIsValid() || (this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable());
    },
    _finishShape: function () {
      var t = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs(),
          e = this._poly.newLatLngIntersects(t[t.length - 1]);

      if (!this.options.allowIntersection && e || !this._shapeIsValid()) return void this._showErrorTooltip();
      this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable();
    },
    _shapeIsValid: function () {
      return !0;
    },
    _onZoomEnd: function () {
      null !== this._markers && this._updateGuide();
    },
    _onMouseMove: function (t) {
      var e = this._map.mouseEventToLayerPoint(t.originalEvent),
          i = this._map.layerPointToLatLng(e);

      this._currentLatLng = i, this._updateTooltip(i), this._updateGuide(e), this._mouseMarker.setLatLng(i), L.DomEvent.preventDefault(t.originalEvent);
    },
    _vertexChanged: function (t, e) {
      this._map.fire(L.Draw.Event.DRAWVERTEX, {
        layers: this._markerGroup
      }), this._updateFinishHandler(), this._updateRunningMeasure(t, e), this._clearGuides(), this._updateTooltip();
    },
    _onMouseDown: function (t) {
      if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
        this._onMouseMove(t), this._clickHandled = !0, this._disableNewMarkers();
        var e = t.originalEvent,
            i = e.clientX,
            o = e.clientY;

        this._startPoint.call(this, i, o);
      }
    },
    _startPoint: function (t, e) {
      this._mouseDownOrigin = L.point(t, e);
    },
    _onMouseUp: function (t) {
      var e = t.originalEvent,
          i = e.clientX,
          o = e.clientY;
      this._endPoint.call(this, i, o, t), this._clickHandled = null;
    },
    _endPoint: function (e, i, o) {
      if (this._mouseDownOrigin) {
        var a = L.point(e, i).distanceTo(this._mouseDownOrigin),
            n = this._calculateFinishDistance(o.latlng);

        this.options.maxPoints > 1 && this.options.maxPoints == this._markers.length + 1 ? (this.addVertex(o.latlng), this._finishShape()) : n < 10 && L.Browser.touch ? this._finishShape() : Math.abs(a) < 9 * (t.devicePixelRatio || 1) && this.addVertex(o.latlng), this._enableNewMarkers();
      }

      this._mouseDownOrigin = null;
    },
    _onTouch: function (t) {
      var e,
          i,
          o = t.originalEvent;
      !o.touches || !o.touches[0] || this._clickHandled || this._touchHandled || this._disableMarkers || (e = o.touches[0].clientX, i = o.touches[0].clientY, this._disableNewMarkers(), this._touchHandled = !0, this._startPoint.call(this, e, i), this._endPoint.call(this, e, i, t), this._touchHandled = null), this._clickHandled = null;
    },
    _onMouseOut: function () {
      this._tooltip && this._tooltip._onMouseOut.call(this._tooltip);
    },
    _calculateFinishDistance: function (t) {
      var e;

      if (this._markers.length > 0) {
        var i;
        if (this.type === L.Draw.Polyline.TYPE) i = this._markers[this._markers.length - 1];else {
          if (this.type !== L.Draw.Polygon.TYPE) return 1 / 0;
          i = this._markers[0];
        }

        var o = this._map.latLngToContainerPoint(i.getLatLng()),
            a = new L.Marker(t, {
          icon: this.options.icon,
          zIndexOffset: 2 * this.options.zIndexOffset
        }),
            n = this._map.latLngToContainerPoint(a.getLatLng());

        e = o.distanceTo(n);
      } else e = 1 / 0;

      return e;
    },
    _updateFinishHandler: function () {
      var t = this._markers.length;
      t > 1 && this._markers[t - 1].on("click", this._finishShape, this), t > 2 && this._markers[t - 2].off("click", this._finishShape, this);
    },
    _createMarker: function (t) {
      var e = new L.Marker(t, {
        icon: this.options.icon,
        zIndexOffset: 2 * this.options.zIndexOffset
      });
      return this._markerGroup.addLayer(e), e;
    },
    _updateGuide: function (t) {
      var e = this._markers ? this._markers.length : 0;
      e > 0 && (t = t || this._map.latLngToLayerPoint(this._currentLatLng), this._clearGuides(), this._drawGuide(this._map.latLngToLayerPoint(this._markers[e - 1].getLatLng()), t));
    },
    _updateTooltip: function (t) {
      var e = this._getTooltipText();

      t && this._tooltip.updatePosition(t), this._errorShown || this._tooltip.updateContent(e);
    },
    _drawGuide: function (t, e) {
      var i,
          o,
          a,
          n = Math.floor(Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2))),
          s = this.options.guidelineDistance,
          r = this.options.maxGuideLineLength,
          l = n > r ? n - r : s;

      for (this._guidesContainer || (this._guidesContainer = L.DomUtil.create("div", "leaflet-draw-guides", this._overlayPane)); l < n; l += this.options.guidelineDistance) i = l / n, o = {
        x: Math.floor(t.x * (1 - i) + i * e.x),
        y: Math.floor(t.y * (1 - i) + i * e.y)
      }, a = L.DomUtil.create("div", "leaflet-draw-guide-dash", this._guidesContainer), a.style.backgroundColor = this._errorShown ? this.options.drawError.color : this.options.shapeOptions.color, L.DomUtil.setPosition(a, o);
    },
    _updateGuideColor: function (t) {
      if (this._guidesContainer) for (var e = 0, i = this._guidesContainer.childNodes.length; e < i; e++) this._guidesContainer.childNodes[e].style.backgroundColor = t;
    },
    _clearGuides: function () {
      if (this._guidesContainer) for (; this._guidesContainer.firstChild;) this._guidesContainer.removeChild(this._guidesContainer.firstChild);
    },
    _getTooltipText: function () {
      var t,
          e,
          i = this.options.showLength;
      return 0 === this._markers.length ? t = {
        text: L.drawLocal.draw.handlers.polyline.tooltip.start
      } : (e = i ? this._getMeasurementString() : "", t = 1 === this._markers.length ? {
        text: L.drawLocal.draw.handlers.polyline.tooltip.cont,
        subtext: e
      } : {
        text: L.drawLocal.draw.handlers.polyline.tooltip.end,
        subtext: e
      }), t;
    },
    _updateRunningMeasure: function (t, e) {
      var i,
          o,
          a = this._markers.length;
      1 === this._markers.length ? this._measurementRunningTotal = 0 : (i = a - (e ? 2 : 1), o = L.GeometryUtil.isVersion07x() ? t.distanceTo(this._markers[i].getLatLng()) * (this.options.factor || 1) : this._map.distance(t, this._markers[i].getLatLng()) * (this.options.factor || 1), this._measurementRunningTotal += o * (e ? 1 : -1));
    },
    _getMeasurementString: function () {
      var t,
          e = this._currentLatLng,
          i = this._markers[this._markers.length - 1].getLatLng();

      return t = L.GeometryUtil.isVersion07x() ? i && e && e.distanceTo ? this._measurementRunningTotal + e.distanceTo(i) * (this.options.factor || 1) : this._measurementRunningTotal || 0 : i && e ? this._measurementRunningTotal + this._map.distance(e, i) * (this.options.factor || 1) : this._measurementRunningTotal || 0, L.GeometryUtil.readableDistance(t, this.options.metric, this.options.feet, this.options.nautic, this.options.precision);
    },
    _showErrorTooltip: function () {
      this._errorShown = !0, this._tooltip.showAsError().updateContent({
        text: this.options.drawError.message
      }), this._updateGuideColor(this.options.drawError.color), this._poly.setStyle({
        color: this.options.drawError.color
      }), this._clearHideErrorTimeout(), this._hideErrorTimeout = setTimeout(L.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
    },
    _hideErrorTooltip: function () {
      this._errorShown = !1, this._clearHideErrorTimeout(), this._tooltip.removeError().updateContent(this._getTooltipText()), this._updateGuideColor(this.options.shapeOptions.color), this._poly.setStyle({
        color: this.options.shapeOptions.color
      });
    },
    _clearHideErrorTimeout: function () {
      this._hideErrorTimeout && (clearTimeout(this._hideErrorTimeout), this._hideErrorTimeout = null);
    },
    _disableNewMarkers: function () {
      this._disableMarkers = !0;
    },
    _enableNewMarkers: function () {
      setTimeout(function () {
        this._disableMarkers = !1;
      }.bind(this), 50);
    },
    _cleanUpShape: function () {
      this._markers.length > 1 && this._markers[this._markers.length - 1].off("click", this._finishShape, this);
    },
    _fireCreatedEvent: function () {
      var t = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);

      L.Draw.Feature.prototype._fireCreatedEvent.call(this, t);
    }
  }), L.Draw.Polygon = L.Draw.Polyline.extend({
    statics: {
      TYPE: "polygon"
    },
    Poly: L.Polygon,
    options: {
      showArea: !1,
      showLength: !1,
      shapeOptions: {
        stroke: !0,
        color: "#3388ff",
        weight: 4,
        opacity: .5,
        fill: !0,
        fillColor: null,
        fillOpacity: .2,
        clickable: !0
      },
      metric: !0,
      feet: !0,
      nautic: !1,
      precision: {}
    },
    initialize: function (t, e) {
      L.Draw.Polyline.prototype.initialize.call(this, t, e), this.type = L.Draw.Polygon.TYPE;
    },
    _updateFinishHandler: function () {
      var t = this._markers.length;
      1 === t && this._markers[0].on("click", this._finishShape, this), t > 2 && (this._markers[t - 1].on("dblclick", this._finishShape, this), t > 3 && this._markers[t - 2].off("dblclick", this._finishShape, this));
    },
    _getTooltipText: function () {
      var t, e;
      return 0 === this._markers.length ? t = L.drawLocal.draw.handlers.polygon.tooltip.start : this._markers.length < 3 ? (t = L.drawLocal.draw.handlers.polygon.tooltip.cont, e = this._getMeasurementString()) : (t = L.drawLocal.draw.handlers.polygon.tooltip.end, e = this._getMeasurementString()), {
        text: t,
        subtext: e
      };
    },
    _getMeasurementString: function () {
      var t = this._area,
          e = "";
      return t || this.options.showLength ? (this.options.showLength && (e = L.Draw.Polyline.prototype._getMeasurementString.call(this)), t && (e += "<br>" + L.GeometryUtil.readableArea(t, this.options.metric, this.options.precision)), e) : null;
    },
    _shapeIsValid: function () {
      return this._markers.length >= 3;
    },
    _vertexChanged: function (t, e) {
      var i;
      !this.options.allowIntersection && this.options.showArea && (i = this._poly.getLatLngs(), this._area = L.GeometryUtil.geodesicArea(i)), L.Draw.Polyline.prototype._vertexChanged.call(this, t, e);
    },
    _cleanUpShape: function () {
      var t = this._markers.length;
      t > 0 && (this._markers[0].off("click", this._finishShape, this), t > 2 && this._markers[t - 1].off("dblclick", this._finishShape, this));
    }
  }), L.SimpleShape = {}, L.Draw.SimpleShape = L.Draw.Feature.extend({
    options: {
      repeatMode: !1
    },
    initialize: function (t, e) {
      this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end, L.Draw.Feature.prototype.initialize.call(this, t, e);
    },
    addHooks: function () {
      L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._mapDraggable = this._map.dragging.enabled(), this._mapDraggable && this._map.dragging.disable(), this._container.style.cursor = "crosshair", this._tooltip.updateContent({
        text: this._initialLabelText
      }), this._map.on("mousedown", this._onMouseDown, this).on("mousemove", this._onMouseMove, this).on("touchstart", this._onMouseDown, this).on("touchmove", this._onMouseMove, this), e.addEventListener("touchstart", L.DomEvent.preventDefault, {
        passive: !1
      }));
    },
    removeHooks: function () {
      L.Draw.Feature.prototype.removeHooks.call(this), this._map && (this._mapDraggable && this._map.dragging.enable(), this._container.style.cursor = "", this._map.off("mousedown", this._onMouseDown, this).off("mousemove", this._onMouseMove, this).off("touchstart", this._onMouseDown, this).off("touchmove", this._onMouseMove, this), L.DomEvent.off(e, "mouseup", this._onMouseUp, this), L.DomEvent.off(e, "touchend", this._onMouseUp, this), e.removeEventListener("touchstart", L.DomEvent.preventDefault), this._shape && (this._map.removeLayer(this._shape), delete this._shape)), this._isDrawing = !1;
    },
    _getTooltipText: function () {
      return {
        text: this._endLabelText
      };
    },
    _onMouseDown: function (t) {
      this._isDrawing = !0, this._startLatLng = t.latlng, L.DomEvent.on(e, "mouseup", this._onMouseUp, this).on(e, "touchend", this._onMouseUp, this).preventDefault(t.originalEvent);
    },
    _onMouseMove: function (t) {
      var e = t.latlng;
      this._tooltip.updatePosition(e), this._isDrawing && (this._tooltip.updateContent(this._getTooltipText()), this._drawShape(e));
    },
    _onMouseUp: function () {
      this._shape && this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable();
    }
  }), L.Draw.Rectangle = L.Draw.SimpleShape.extend({
    statics: {
      TYPE: "rectangle"
    },
    options: {
      shapeOptions: {
        stroke: !0,
        color: "#3388ff",
        weight: 4,
        opacity: .5,
        fill: !0,
        fillColor: null,
        fillOpacity: .2,
        clickable: !0
      },
      showArea: !0,
      metric: !0
    },
    initialize: function (t, e) {
      this.type = L.Draw.Rectangle.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.rectangle.tooltip.start, L.Draw.SimpleShape.prototype.initialize.call(this, t, e);
    },
    disable: function () {
      this._enabled && (this._isCurrentlyTwoClickDrawing = !1, L.Draw.SimpleShape.prototype.disable.call(this));
    },
    _onMouseUp: function (t) {
      if (!this._shape && !this._isCurrentlyTwoClickDrawing) return void (this._isCurrentlyTwoClickDrawing = !0);
      this._isCurrentlyTwoClickDrawing && !o(t.target, "leaflet-pane") || L.Draw.SimpleShape.prototype._onMouseUp.call(this);
    },
    _drawShape: function (t) {
      this._shape ? this._shape.setBounds(new L.LatLngBounds(this._startLatLng, t)) : (this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, t), this.options.shapeOptions), this._map.addLayer(this._shape));
    },
    _fireCreatedEvent: function () {
      var t = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);

      L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, t);
    },
    _getTooltipText: function () {
      var t,
          e,
          i,
          o = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
          a = this._shape,
          n = this.options.showArea;

      return a && (t = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs(), e = L.GeometryUtil.geodesicArea(t), i = n ? L.GeometryUtil.readableArea(e, this.options.metric) : ""), {
        text: o.text,
        subtext: i
      };
    }
  }), L.Draw.Marker = L.Draw.Feature.extend({
    statics: {
      TYPE: "marker"
    },
    options: {
      icon: new L.Icon.Default(),
      repeatMode: !1,
      zIndexOffset: 2e3
    },
    initialize: function (t, e) {
      this.type = L.Draw.Marker.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.marker.tooltip.start, L.Draw.Feature.prototype.initialize.call(this, t, e);
    },
    addHooks: function () {
      L.Draw.Feature.prototype.addHooks.call(this), this._map && (this._tooltip.updateContent({
        text: this._initialLabelText
      }), this._mouseMarker || (this._mouseMarker = L.marker(this._map.getCenter(), {
        icon: L.divIcon({
          className: "leaflet-mouse-marker",
          iconAnchor: [20, 20],
          iconSize: [40, 40]
        }),
        opacity: 0,
        zIndexOffset: this.options.zIndexOffset
      })), this._mouseMarker.on("click", this._onClick, this).addTo(this._map), this._map.on("mousemove", this._onMouseMove, this), this._map.on("click", this._onTouch, this));
    },
    removeHooks: function () {
      L.Draw.Feature.prototype.removeHooks.call(this), this._map && (this._map.off("click", this._onClick, this).off("click", this._onTouch, this), this._marker && (this._marker.off("click", this._onClick, this), this._map.removeLayer(this._marker), delete this._marker), this._mouseMarker.off("click", this._onClick, this), this._map.removeLayer(this._mouseMarker), delete this._mouseMarker, this._map.off("mousemove", this._onMouseMove, this));
    },
    _onMouseMove: function (t) {
      var e = t.latlng;
      this._tooltip.updatePosition(e), this._mouseMarker.setLatLng(e), this._marker ? (e = this._mouseMarker.getLatLng(), this._marker.setLatLng(e)) : (this._marker = this._createMarker(e), this._marker.on("click", this._onClick, this), this._map.on("click", this._onClick, this).addLayer(this._marker));
    },
    _createMarker: function (t) {
      return new L.Marker(t, {
        icon: this.options.icon,
        zIndexOffset: this.options.zIndexOffset
      });
    },
    _onClick: function () {
      this._fireCreatedEvent(), this.disable(), this.options.repeatMode && this.enable();
    },
    _onTouch: function (t) {
      this._onMouseMove(t), this._onClick();
    },
    _fireCreatedEvent: function () {
      var t = new L.Marker.Touch(this._marker.getLatLng(), {
        icon: this.options.icon
      });

      L.Draw.Feature.prototype._fireCreatedEvent.call(this, t);
    }
  }), L.Draw.CircleMarker = L.Draw.Marker.extend({
    statics: {
      TYPE: "circlemarker"
    },
    options: {
      stroke: !0,
      color: "#3388ff",
      weight: 4,
      opacity: .5,
      fill: !0,
      fillColor: null,
      fillOpacity: .2,
      clickable: !0,
      zIndexOffset: 2e3
    },
    initialize: function (t, e) {
      this.type = L.Draw.CircleMarker.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.circlemarker.tooltip.start, L.Draw.Feature.prototype.initialize.call(this, t, e);
    },
    _fireCreatedEvent: function () {
      var t = new L.CircleMarker(this._marker.getLatLng(), this.options);

      L.Draw.Feature.prototype._fireCreatedEvent.call(this, t);
    },
    _createMarker: function (t) {
      return new L.CircleMarker(t, this.options);
    }
  }), L.Draw.Circle = L.Draw.SimpleShape.extend({
    statics: {
      TYPE: "circle"
    },
    options: {
      shapeOptions: {
        stroke: !0,
        color: "#3388ff",
        weight: 4,
        opacity: .5,
        fill: !0,
        fillColor: null,
        fillOpacity: .2,
        clickable: !0
      },
      showRadius: !0,
      metric: !0,
      feet: !0,
      nautic: !1
    },
    initialize: function (t, e) {
      this.type = L.Draw.Circle.TYPE, this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start, L.Draw.SimpleShape.prototype.initialize.call(this, t, e);
    },
    _drawShape: function (t) {
      if (L.GeometryUtil.isVersion07x()) var e = this._startLatLng.distanceTo(t);else var e = this._map.distance(this._startLatLng, t);
      this._shape ? this._shape.setRadius(e) : (this._shape = new L.Circle(this._startLatLng, e, this.options.shapeOptions), this._map.addLayer(this._shape));
    },
    _fireCreatedEvent: function () {
      var t = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);

      L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, t);
    },
    _onMouseMove: function (t) {
      var e,
          i = t.latlng,
          o = this.options.showRadius,
          a = this.options.metric;

      if (this._tooltip.updatePosition(i), this._isDrawing) {
        this._drawShape(i), e = this._shape.getRadius().toFixed(1);
        var n = "";
        o && (n = L.drawLocal.draw.handlers.circle.radius + ": " + L.GeometryUtil.readableDistance(e, a, this.options.feet, this.options.nautic)), this._tooltip.updateContent({
          text: this._endLabelText,
          subtext: n
        });
      }
    }
  }), L.Edit = L.Edit || {}, L.Edit.Marker = L.Handler.extend({
    initialize: function (t, e) {
      this._marker = t, L.setOptions(this, e);
    },
    addHooks: function () {
      var t = this._marker;
      t.dragging.enable(), t.on("dragend", this._onDragEnd, t), this._toggleMarkerHighlight();
    },
    removeHooks: function () {
      var t = this._marker;
      t.dragging.disable(), t.off("dragend", this._onDragEnd, t), this._toggleMarkerHighlight();
    },
    _onDragEnd: function (t) {
      var e = t.target;
      e.edited = !0, this._map.fire(L.Draw.Event.EDITMOVE, {
        layer: e
      });
    },
    _toggleMarkerHighlight: function () {
      var t = this._marker._icon;
      t && (t.style.display = "none", L.DomUtil.hasClass(t, "leaflet-edit-marker-selected") ? (L.DomUtil.removeClass(t, "leaflet-edit-marker-selected"), this._offsetMarker(t, -4)) : (L.DomUtil.addClass(t, "leaflet-edit-marker-selected"), this._offsetMarker(t, 4)), t.style.display = "");
    },
    _offsetMarker: function (t, e) {
      var i = parseInt(t.style.marginTop, 10) - e,
          o = parseInt(t.style.marginLeft, 10) - e;
      t.style.marginTop = i + "px", t.style.marginLeft = o + "px";
    }
  }), L.Marker.addInitHook(function () {
    L.Edit.Marker && (this.editing = new L.Edit.Marker(this), this.options.editable && this.editing.enable());
  }), L.Edit = L.Edit || {}, L.Edit.Poly = L.Handler.extend({
    initialize: function (t) {
      this.latlngs = [t._latlngs], t._holes && (this.latlngs = this.latlngs.concat(t._holes)), this._poly = t, this._poly.on("revert-edited", this._updateLatLngs, this);
    },
    _defaultShape: function () {
      return L.Polyline._flat ? L.Polyline._flat(this._poly._latlngs) ? this._poly._latlngs : this._poly._latlngs[0] : this._poly._latlngs;
    },
    _eachVertexHandler: function (t) {
      for (var e = 0; e < this._verticesHandlers.length; e++) t(this._verticesHandlers[e]);
    },
    addHooks: function () {
      this._initHandlers(), this._eachVertexHandler(function (t) {
        t.addHooks();
      });
    },
    removeHooks: function () {
      this._eachVertexHandler(function (t) {
        t.removeHooks();
      });
    },
    updateMarkers: function () {
      this._eachVertexHandler(function (t) {
        t.updateMarkers();
      });
    },
    _initHandlers: function () {
      this._verticesHandlers = [];

      for (var t = 0; t < this.latlngs.length; t++) this._verticesHandlers.push(new L.Edit.PolyVerticesEdit(this._poly, this.latlngs[t], this._poly.options.poly));
    },
    _updateLatLngs: function (t) {
      this.latlngs = [t.layer._latlngs], t.layer._holes && (this.latlngs = this.latlngs.concat(t.layer._holes));
    }
  }), L.Edit.PolyVerticesEdit = L.Handler.extend({
    options: {
      icon: new L.DivIcon({
        iconSize: new L.Point(8, 8),
        className: "leaflet-div-icon leaflet-editing-icon"
      }),
      touchIcon: new L.DivIcon({
        iconSize: new L.Point(20, 20),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-touch-icon"
      }),
      drawError: {
        color: "#b00b00",
        timeout: 1e3
      }
    },
    initialize: function (t, e, i) {
      L.Browser.touch && (this.options.icon = this.options.touchIcon), this._poly = t, i && i.drawError && (i.drawError = L.Util.extend({}, this.options.drawError, i.drawError)), this._latlngs = e, L.setOptions(this, i);
    },
    _defaultShape: function () {
      return L.Polyline._flat ? L.Polyline._flat(this._latlngs) ? this._latlngs : this._latlngs[0] : this._latlngs;
    },
    addHooks: function () {
      var t = this._poly,
          e = t._path;
      t instanceof L.Polygon || (t.options.fill = !1, t.options.editing && (t.options.editing.fill = !1)), e && t.options.editing && t.options.editing.className && (t.options.original.className && t.options.original.className.split(" ").forEach(function (t) {
        L.DomUtil.removeClass(e, t);
      }), t.options.editing.className.split(" ").forEach(function (t) {
        L.DomUtil.addClass(e, t);
      })), t.setStyle(t.options.editing), this._poly._map && (this._map = this._poly._map, this._markerGroup || this._initMarkers(), this._poly._map.addLayer(this._markerGroup));
    },
    removeHooks: function () {
      var t = this._poly,
          e = t._path;
      e && t.options.editing && t.options.editing.className && (t.options.editing.className.split(" ").forEach(function (t) {
        L.DomUtil.removeClass(e, t);
      }), t.options.original.className && t.options.original.className.split(" ").forEach(function (t) {
        L.DomUtil.addClass(e, t);
      })), t.setStyle(t.options.original), t._map && (t._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers);
    },
    updateMarkers: function () {
      this._markerGroup.clearLayers(), this._initMarkers();
    },
    _initMarkers: function () {
      this._markerGroup || (this._markerGroup = new L.LayerGroup()), this._markers = [];

      var t,
          e,
          i,
          o,
          a = this._defaultShape();

      for (t = 0, i = a.length; t < i; t++) o = this._createMarker(a[t], t), o.on("click", this._onMarkerClick, this), o.on("contextmenu", this._onContextMenu, this), this._markers.push(o);

      var n, s;

      for (t = 0, e = i - 1; t < i; e = t++) (0 !== t || L.Polygon && this._poly instanceof L.Polygon) && (n = this._markers[e], s = this._markers[t], this._createMiddleMarker(n, s), this._updatePrevNext(n, s));
    },
    _createMarker: function (t, e) {
      var i = new L.Marker.Touch(t, {
        draggable: !0,
        icon: this.options.icon
      });
      return i._origLatLng = t, i._index = e, i.on("dragstart", this._onMarkerDragStart, this).on("drag", this._onMarkerDrag, this).on("dragend", this._fireEdit, this).on("touchmove", this._onTouchMove, this).on("touchend", this._fireEdit, this).on("MSPointerMove", this._onTouchMove, this).on("MSPointerUp", this._fireEdit, this), this._markerGroup.addLayer(i), i;
    },
    _onMarkerDragStart: function () {
      this._poly.fire("editstart");
    },
    _spliceLatLngs: function () {
      var t = this._defaultShape(),
          e = [].splice.apply(t, arguments);

      return this._poly._convertLatLngs(t, !0), this._poly.redraw(), e;
    },
    _removeMarker: function (t) {
      var e = t._index;
      this._markerGroup.removeLayer(t), this._markers.splice(e, 1), this._spliceLatLngs(e, 1), this._updateIndexes(e, -1), t.off("dragstart", this._onMarkerDragStart, this).off("drag", this._onMarkerDrag, this).off("dragend", this._fireEdit, this).off("touchmove", this._onMarkerDrag, this).off("touchend", this._fireEdit, this).off("click", this._onMarkerClick, this).off("MSPointerMove", this._onTouchMove, this).off("MSPointerUp", this._fireEdit, this);
    },
    _fireEdit: function () {
      this._poly.edited = !0, this._poly.fire("edit"), this._poly._map.fire(L.Draw.Event.EDITVERTEX, {
        layers: this._markerGroup,
        poly: this._poly
      });
    },
    _onMarkerDrag: function (t) {
      var e = t.target,
          i = this._poly,
          o = L.LatLngUtil.cloneLatLng(e._origLatLng);

      if (L.extend(e._origLatLng, e._latlng), i.options.poly) {
        var a = i._map._editTooltip;

        if (!i.options.poly.allowIntersection && i.intersects()) {
          L.extend(e._origLatLng, o), e.setLatLng(o);
          var n = i.options.color;
          i.setStyle({
            color: this.options.drawError.color
          }), a && a.updateContent({
            text: L.drawLocal.draw.handlers.polyline.error
          }), setTimeout(function () {
            i.setStyle({
              color: n
            }), a && a.updateContent({
              text: L.drawLocal.edit.handlers.edit.tooltip.text,
              subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
            });
          }, 1e3);
        }
      }

      e._middleLeft && e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev, e)), e._middleRight && e._middleRight.setLatLng(this._getMiddleLatLng(e, e._next)), this._poly._bounds._southWest = L.latLng(1 / 0, 1 / 0), this._poly._bounds._northEast = L.latLng(-1 / 0, -1 / 0);

      var s = this._poly.getLatLngs();

      this._poly._convertLatLngs(s, !0), this._poly.redraw(), this._poly.fire("editdrag");
    },
    _onMarkerClick: function (t) {
      var e = L.Polygon && this._poly instanceof L.Polygon ? 4 : 3,
          i = t.target;
      this._defaultShape().length < e || (this._removeMarker(i), this._updatePrevNext(i._prev, i._next), i._middleLeft && this._markerGroup.removeLayer(i._middleLeft), i._middleRight && this._markerGroup.removeLayer(i._middleRight), i._prev && i._next ? this._createMiddleMarker(i._prev, i._next) : i._prev ? i._next || (i._prev._middleRight = null) : i._next._middleLeft = null, this._fireEdit());
    },
    _onContextMenu: function (t) {
      var e = t.target;
      this._poly;
      this._poly._map.fire(L.Draw.Event.MARKERCONTEXT, {
        marker: e,
        layers: this._markerGroup,
        poly: this._poly
      }), L.DomEvent.stopPropagation;
    },
    _onTouchMove: function (t) {
      var e = this._map.mouseEventToLayerPoint(t.originalEvent.touches[0]),
          i = this._map.layerPointToLatLng(e),
          o = t.target;

      L.extend(o._origLatLng, i), o._middleLeft && o._middleLeft.setLatLng(this._getMiddleLatLng(o._prev, o)), o._middleRight && o._middleRight.setLatLng(this._getMiddleLatLng(o, o._next)), this._poly.redraw(), this.updateMarkers();
    },
    _updateIndexes: function (t, e) {
      this._markerGroup.eachLayer(function (i) {
        i._index > t && (i._index += e);
      });
    },
    _createMiddleMarker: function (t, e) {
      var i,
          o,
          a,
          n = this._getMiddleLatLng(t, e),
          s = this._createMarker(n);

      s.setOpacity(.6), t._middleRight = e._middleLeft = s, o = function () {
        s.off("touchmove", o, this);
        var a = e._index;
        s._index = a, s.off("click", i, this).on("click", this._onMarkerClick, this), n.lat = s.getLatLng().lat, n.lng = s.getLatLng().lng, this._spliceLatLngs(a, 0, n), this._markers.splice(a, 0, s), s.setOpacity(1), this._updateIndexes(a, 1), e._index++, this._updatePrevNext(t, s), this._updatePrevNext(s, e), this._poly.fire("editstart");
      }, a = function () {
        s.off("dragstart", o, this), s.off("dragend", a, this), s.off("touchmove", o, this), this._createMiddleMarker(t, s), this._createMiddleMarker(s, e);
      }, i = function () {
        o.call(this), a.call(this), this._fireEdit();
      }, s.on("click", i, this).on("dragstart", o, this).on("dragend", a, this).on("touchmove", o, this), this._markerGroup.addLayer(s);
    },
    _updatePrevNext: function (t, e) {
      t && (t._next = e), e && (e._prev = t);
    },
    _getMiddleLatLng: function (t, e) {
      var i = this._poly._map,
          o = i.project(t.getLatLng()),
          a = i.project(e.getLatLng());
      return i.unproject(o._add(a)._divideBy(2));
    }
  }), L.Polyline.addInitHook(function () {
    this.editing || (L.Edit.Poly && (this.editing = new L.Edit.Poly(this), this.options.editable && this.editing.enable()), this.on("add", function () {
      this.editing && this.editing.enabled() && this.editing.addHooks();
    }), this.on("remove", function () {
      this.editing && this.editing.enabled() && this.editing.removeHooks();
    }));
  }), L.Edit = L.Edit || {}, L.Edit.SimpleShape = L.Handler.extend({
    options: {
      moveIcon: new L.DivIcon({
        iconSize: new L.Point(8, 8),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-move"
      }),
      resizeIcon: new L.DivIcon({
        iconSize: new L.Point(8, 8),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"
      }),
      touchMoveIcon: new L.DivIcon({
        iconSize: new L.Point(20, 20),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon"
      }),
      touchResizeIcon: new L.DivIcon({
        iconSize: new L.Point(20, 20),
        className: "leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon"
      })
    },
    initialize: function (t, e) {
      L.Browser.touch && (this.options.moveIcon = this.options.touchMoveIcon, this.options.resizeIcon = this.options.touchResizeIcon), this._shape = t, L.Util.setOptions(this, e);
    },
    addHooks: function () {
      var t = this._shape;
      this._shape._map && (this._map = this._shape._map, t.setStyle(t.options.editing), t._map && (this._map = t._map, this._markerGroup || this._initMarkers(), this._map.addLayer(this._markerGroup)));
    },
    removeHooks: function () {
      var t = this._shape;

      if (t.setStyle(t.options.original), t._map) {
        this._unbindMarker(this._moveMarker);

        for (var e = 0, i = this._resizeMarkers.length; e < i; e++) this._unbindMarker(this._resizeMarkers[e]);

        this._resizeMarkers = null, this._map.removeLayer(this._markerGroup), delete this._markerGroup;
      }

      this._map = null;
    },
    updateMarkers: function () {
      this._markerGroup.clearLayers(), this._initMarkers();
    },
    _initMarkers: function () {
      this._markerGroup || (this._markerGroup = new L.LayerGroup()), this._createMoveMarker(), this._createResizeMarker();
    },
    _createMoveMarker: function () {},
    _createResizeMarker: function () {},
    _createMarker: function (t, e) {
      var i = new L.Marker.Touch(t, {
        draggable: !0,
        icon: e,
        zIndexOffset: 10
      });
      return this._bindMarker(i), this._markerGroup.addLayer(i), i;
    },
    _bindMarker: function (t) {
      t.on("dragstart", this._onMarkerDragStart, this).on("drag", this._onMarkerDrag, this).on("dragend", this._onMarkerDragEnd, this).on("touchstart", this._onTouchStart, this).on("touchmove", this._onTouchMove, this).on("MSPointerMove", this._onTouchMove, this).on("touchend", this._onTouchEnd, this).on("MSPointerUp", this._onTouchEnd, this);
    },
    _unbindMarker: function (t) {
      t.off("dragstart", this._onMarkerDragStart, this).off("drag", this._onMarkerDrag, this).off("dragend", this._onMarkerDragEnd, this).off("touchstart", this._onTouchStart, this).off("touchmove", this._onTouchMove, this).off("MSPointerMove", this._onTouchMove, this).off("touchend", this._onTouchEnd, this).off("MSPointerUp", this._onTouchEnd, this);
    },
    _onMarkerDragStart: function (t) {
      t.target.setOpacity(0), this._shape.fire("editstart");
    },
    _fireEdit: function () {
      this._shape.edited = !0, this._shape.fire("edit");
    },
    _onMarkerDrag: function (t) {
      var e = t.target,
          i = e.getLatLng();
      e === this._moveMarker ? this._move(i) : this._resize(i), this._shape.redraw(), this._shape.fire("editdrag");
    },
    _onMarkerDragEnd: function (t) {
      t.target.setOpacity(1), this._fireEdit();
    },
    _onTouchStart: function (t) {
      if (L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, t), "function" == typeof this._getCorners) {
        var e = this._getCorners(),
            i = t.target,
            o = i._cornerIndex;

        i.setOpacity(0), this._oppositeCorner = e[(o + 2) % 4], this._toggleCornerMarkers(0, o);
      }

      this._shape.fire("editstart");
    },
    _onTouchMove: function (t) {
      var e = this._map.mouseEventToLayerPoint(t.originalEvent.touches[0]),
          i = this._map.layerPointToLatLng(e);

      return t.target === this._moveMarker ? this._move(i) : this._resize(i), this._shape.redraw(), !1;
    },
    _onTouchEnd: function (t) {
      t.target.setOpacity(1), this.updateMarkers(), this._fireEdit();
    },
    _move: function () {},
    _resize: function () {}
  }), L.Edit = L.Edit || {}, L.Edit.Rectangle = L.Edit.SimpleShape.extend({
    _createMoveMarker: function () {
      var t = this._shape.getBounds(),
          e = t.getCenter();

      this._moveMarker = this._createMarker(e, this.options.moveIcon);
    },
    _createResizeMarker: function () {
      var t = this._getCorners();

      this._resizeMarkers = [];

      for (var e = 0, i = t.length; e < i; e++) this._resizeMarkers.push(this._createMarker(t[e], this.options.resizeIcon)), this._resizeMarkers[e]._cornerIndex = e;
    },
    _onMarkerDragStart: function (t) {
      L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, t);

      var e = this._getCorners(),
          i = t.target,
          o = i._cornerIndex;

      this._oppositeCorner = e[(o + 2) % 4], this._toggleCornerMarkers(0, o);
    },
    _onMarkerDragEnd: function (t) {
      var e,
          i,
          o = t.target;
      o === this._moveMarker && (e = this._shape.getBounds(), i = e.getCenter(), o.setLatLng(i)), this._toggleCornerMarkers(1), this._repositionCornerMarkers(), L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, t);
    },
    _move: function (t) {
      for (var e, i = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs(), o = this._shape.getBounds(), a = o.getCenter(), n = [], s = 0, r = i.length; s < r; s++) e = [i[s].lat - a.lat, i[s].lng - a.lng], n.push([t.lat + e[0], t.lng + e[1]]);

      this._shape.setLatLngs(n), this._repositionCornerMarkers(), this._map.fire(L.Draw.Event.EDITMOVE, {
        layer: this._shape
      });
    },
    _resize: function (t) {
      var e;
      this._shape.setBounds(L.latLngBounds(t, this._oppositeCorner)), e = this._shape.getBounds(), this._moveMarker.setLatLng(e.getCenter()), this._map.fire(L.Draw.Event.EDITRESIZE, {
        layer: this._shape
      });
    },
    _getCorners: function () {
      var t = this._shape.getBounds();

      return [t.getNorthWest(), t.getNorthEast(), t.getSouthEast(), t.getSouthWest()];
    },
    _toggleCornerMarkers: function (t) {
      for (var e = 0, i = this._resizeMarkers.length; e < i; e++) this._resizeMarkers[e].setOpacity(t);
    },
    _repositionCornerMarkers: function () {
      for (var t = this._getCorners(), e = 0, i = this._resizeMarkers.length; e < i; e++) this._resizeMarkers[e].setLatLng(t[e]);
    }
  }), L.Rectangle.addInitHook(function () {
    L.Edit.Rectangle && (this.editing = new L.Edit.Rectangle(this), this.options.editable && this.editing.enable());
  }), L.Edit = L.Edit || {}, L.Edit.CircleMarker = L.Edit.SimpleShape.extend({
    _createMoveMarker: function () {
      var t = this._shape.getLatLng();

      this._moveMarker = this._createMarker(t, this.options.moveIcon);
    },
    _createResizeMarker: function () {
      this._resizeMarkers = [];
    },
    _move: function (t) {
      if (this._resizeMarkers.length) {
        var e = this._getResizeMarkerPoint(t);

        this._resizeMarkers[0].setLatLng(e);
      }

      this._shape.setLatLng(t), this._map.fire(L.Draw.Event.EDITMOVE, {
        layer: this._shape
      });
    }
  }), L.CircleMarker.addInitHook(function () {
    L.Edit.CircleMarker && (this.editing = new L.Edit.CircleMarker(this), this.options.editable && this.editing.enable()), this.on("add", function () {
      this.editing && this.editing.enabled() && this.editing.addHooks();
    }), this.on("remove", function () {
      this.editing && this.editing.enabled() && this.editing.removeHooks();
    });
  }), L.Edit = L.Edit || {}, L.Edit.Circle = L.Edit.CircleMarker.extend({
    _createResizeMarker: function () {
      var t = this._shape.getLatLng(),
          e = this._getResizeMarkerPoint(t);

      this._resizeMarkers = [], this._resizeMarkers.push(this._createMarker(e, this.options.resizeIcon));
    },
    _getResizeMarkerPoint: function (t) {
      var e = this._shape._radius * Math.cos(Math.PI / 4),
          i = this._map.project(t);

      return this._map.unproject([i.x + e, i.y - e]);
    },
    _resize: function (t) {
      var e = this._moveMarker.getLatLng();

      L.GeometryUtil.isVersion07x() ? radius = e.distanceTo(t) : radius = this._map.distance(e, t), this._shape.setRadius(radius), this._map.editTooltip && this._map._editTooltip.updateContent({
        text: L.drawLocal.edit.handlers.edit.tooltip.subtext + "<br />" + L.drawLocal.edit.handlers.edit.tooltip.text,
        subtext: L.drawLocal.draw.handlers.circle.radius + ": " + L.GeometryUtil.readableDistance(radius, !0, this.options.feet, this.options.nautic)
      }), this._shape.setRadius(radius), this._map.fire(L.Draw.Event.EDITRESIZE, {
        layer: this._shape
      });
    }
  }), L.Circle.addInitHook(function () {
    L.Edit.Circle && (this.editing = new L.Edit.Circle(this), this.options.editable && this.editing.enable());
  }), L.Map.mergeOptions({
    touchExtend: !0
  }), L.Map.TouchExtend = L.Handler.extend({
    initialize: function (t) {
      this._map = t, this._container = t._container, this._pane = t._panes.overlayPane;
    },
    addHooks: function () {
      L.DomEvent.on(this._container, "touchstart", this._onTouchStart, this), L.DomEvent.on(this._container, "touchend", this._onTouchEnd, this), L.DomEvent.on(this._container, "touchmove", this._onTouchMove, this), this._detectIE() ? (L.DomEvent.on(this._container, "MSPointerDown", this._onTouchStart, this), L.DomEvent.on(this._container, "MSPointerUp", this._onTouchEnd, this), L.DomEvent.on(this._container, "MSPointerMove", this._onTouchMove, this), L.DomEvent.on(this._container, "MSPointerCancel", this._onTouchCancel, this)) : (L.DomEvent.on(this._container, "touchcancel", this._onTouchCancel, this), L.DomEvent.on(this._container, "touchleave", this._onTouchLeave, this));
    },
    removeHooks: function () {
      L.DomEvent.off(this._container, "touchstart", this._onTouchStart, this), L.DomEvent.off(this._container, "touchend", this._onTouchEnd, this), L.DomEvent.off(this._container, "touchmove", this._onTouchMove, this), this._detectIE() ? (L.DomEvent.off(this._container, "MSPointerDown", this._onTouchStart, this), L.DomEvent.off(this._container, "MSPointerUp", this._onTouchEnd, this), L.DomEvent.off(this._container, "MSPointerMove", this._onTouchMove, this), L.DomEvent.off(this._container, "MSPointerCancel", this._onTouchCancel, this)) : (L.DomEvent.off(this._container, "touchcancel", this._onTouchCancel, this), L.DomEvent.off(this._container, "touchleave", this._onTouchLeave, this));
    },
    _touchEvent: function (t, e) {
      var i = {};

      if (void 0 !== t.touches) {
        if (!t.touches.length) return;
        i = t.touches[0];
      } else {
        if ("touch" !== t.pointerType) return;
        if (i = t, !this._filterClick(t)) return;
      }

      var o = this._map.mouseEventToContainerPoint(i),
          a = this._map.mouseEventToLayerPoint(i),
          n = this._map.layerPointToLatLng(a);

      this._map.fire(e, {
        latlng: n,
        layerPoint: a,
        containerPoint: o,
        pageX: i.pageX,
        pageY: i.pageY,
        originalEvent: t
      });
    },
    _filterClick: function (t) {
      var e = t.timeStamp || t.originalEvent.timeStamp,
          i = L.DomEvent._lastClick && e - L.DomEvent._lastClick;
      return i && i > 100 && i < 500 || t.target._simulatedClick && !t._simulated ? (L.DomEvent.stop(t), !1) : (L.DomEvent._lastClick = e, !0);
    },
    _onTouchStart: function (t) {
      if (this._map._loaded) {
        this._touchEvent(t, "touchstart");
      }
    },
    _onTouchEnd: function (t) {
      if (this._map._loaded) {
        this._touchEvent(t, "touchend");
      }
    },
    _onTouchCancel: function (t) {
      if (this._map._loaded) {
        var e = "touchcancel";
        this._detectIE() && (e = "pointercancel"), this._touchEvent(t, e);
      }
    },
    _onTouchLeave: function (t) {
      if (this._map._loaded) {
        this._touchEvent(t, "touchleave");
      }
    },
    _onTouchMove: function (t) {
      if (this._map._loaded) {
        this._touchEvent(t, "touchmove");
      }
    },
    _detectIE: function () {
      var e = t.navigator.userAgent,
          i = e.indexOf("MSIE ");
      if (i > 0) return parseInt(e.substring(i + 5, e.indexOf(".", i)), 10);

      if (e.indexOf("Trident/") > 0) {
        var o = e.indexOf("rv:");
        return parseInt(e.substring(o + 3, e.indexOf(".", o)), 10);
      }

      var a = e.indexOf("Edge/");
      return a > 0 && parseInt(e.substring(a + 5, e.indexOf(".", a)), 10);
    }
  }), L.Map.addInitHook("addHandler", "touchExtend", L.Map.TouchExtend), L.Marker.Touch = L.Marker.extend({
    _initInteraction: function () {
      return this.addInteractiveTarget ? L.Marker.prototype._initInteraction.apply(this) : this._initInteractionLegacy();
    },
    _initInteractionLegacy: function () {
      if (this.options.clickable) {
        var t = this._icon,
            e = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu", "touchstart", "touchend", "touchmove"];
        this._detectIE ? e.concat(["MSPointerDown", "MSPointerUp", "MSPointerMove", "MSPointerCancel"]) : e.concat(["touchcancel"]), L.DomUtil.addClass(t, "leaflet-clickable"), L.DomEvent.on(t, "click", this._onMouseClick, this), L.DomEvent.on(t, "keypress", this._onKeyPress, this);

        for (var i = 0; i < e.length; i++) L.DomEvent.on(t, e[i], this._fireMouseEvent, this);

        L.Handler.MarkerDrag && (this.dragging = new L.Handler.MarkerDrag(this), this.options.draggable && this.dragging.enable());
      }
    },
    _detectIE: function () {
      var e = t.navigator.userAgent,
          i = e.indexOf("MSIE ");
      if (i > 0) return parseInt(e.substring(i + 5, e.indexOf(".", i)), 10);

      if (e.indexOf("Trident/") > 0) {
        var o = e.indexOf("rv:");
        return parseInt(e.substring(o + 3, e.indexOf(".", o)), 10);
      }

      var a = e.indexOf("Edge/");
      return a > 0 && parseInt(e.substring(a + 5, e.indexOf(".", a)), 10);
    }
  }), L.LatLngUtil = {
    cloneLatLngs: function (t) {
      for (var e = [], i = 0, o = t.length; i < o; i++) Array.isArray(t[i]) ? e.push(L.LatLngUtil.cloneLatLngs(t[i])) : e.push(this.cloneLatLng(t[i]));

      return e;
    },
    cloneLatLng: function (t) {
      return L.latLng(t.lat, t.lng);
    }
  }, function () {
    var t = {
      km: 2,
      ha: 2,
      m: 0,
      mi: 2,
      ac: 2,
      yd: 0,
      ft: 0,
      nm: 2
    };
    L.GeometryUtil = L.extend(L.GeometryUtil || {}, {
      geodesicArea: function (t) {
        var e,
            i,
            o = t.length,
            a = 0,
            n = Math.PI / 180;

        if (o > 2) {
          for (var s = 0; s < o; s++) e = t[s], i = t[(s + 1) % o], a += (i.lng - e.lng) * n * (2 + Math.sin(e.lat * n) + Math.sin(i.lat * n));

          a = 6378137 * a * 6378137 / 2;
        }

        return Math.abs(a);
      },
      formattedNumber: function (t, e) {
        var i = parseFloat(t).toFixed(e),
            o = L.drawLocal.format && L.drawLocal.format.numeric,
            a = o && o.delimiters,
            n = a && a.thousands,
            s = a && a.decimal;

        if (n || s) {
          var r = i.split(".");
          i = n ? r[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + n) : r[0], s = s || ".", r.length > 1 && (i = i + s + r[1]);
        }

        return i;
      },
      readableArea: function (e, i, o) {
        var a,
            n,
            o = L.Util.extend({}, t, o);
        return i ? (n = ["ha", "m"], type = typeof i, "string" === type ? n = [i] : "boolean" !== type && (n = i), a = e >= 1e6 && -1 !== n.indexOf("km") ? L.GeometryUtil.formattedNumber(1e-6 * e, o.km) + " км²" : e >= 1e4 && -1 !== n.indexOf("ha") ? L.GeometryUtil.formattedNumber(1e-4 * e, o.ha) + " ha" : L.GeometryUtil.formattedNumber(e, o.m) + " м²") : (e /= .836127, a = e >= 3097600 ? L.GeometryUtil.formattedNumber(e / 3097600, o.mi) + " mi²" : e >= 4840 ? L.GeometryUtil.formattedNumber(e / 4840, o.ac) + " acres" : L.GeometryUtil.formattedNumber(e, o.yd) + " yd²"), a;
      },
      readableDistance: function (e, i, o, a, n) {
        var s,
            n = L.Util.extend({}, t, n);

        switch (i ? "string" == typeof i ? i : "metric" : o ? "feet" : a ? "nauticalMile" : "yards") {
          case "metric":
            s = e > 1e3 ? L.GeometryUtil.formattedNumber(e / 1e3, n.km) + " км" : L.GeometryUtil.formattedNumber(e, n.m) + " м";
            break;

          case "feet":
            e *= 3.28083, s = L.GeometryUtil.formattedNumber(e, n.ft) + " ft";
            break;

          case "nauticalMile":
            e *= .53996, s = L.GeometryUtil.formattedNumber(e / 1e3, n.nm) + " nm";
            break;

          case "yards":
          default:
            e *= 1.09361, s = e > 1760 ? L.GeometryUtil.formattedNumber(e / 1760, n.mi) + " miles" : L.GeometryUtil.formattedNumber(e, n.yd) + " yd";
        }

        return s;
      },
      isVersion07x: function () {
        var t = L.version.split(".");
        return 0 === parseInt(t[0], 10) && 7 === parseInt(t[1], 10);
      }
    });
  }(), L.Util.extend(L.LineUtil, {
    segmentsIntersect: function (t, e, i, o) {
      return this._checkCounterclockwise(t, i, o) !== this._checkCounterclockwise(e, i, o) && this._checkCounterclockwise(t, e, i) !== this._checkCounterclockwise(t, e, o);
    },
    _checkCounterclockwise: function (t, e, i) {
      return (i.y - t.y) * (e.x - t.x) > (e.y - t.y) * (i.x - t.x);
    }
  }), L.Polyline.include({
    intersects: function () {
      var t,
          e,
          i,
          o = this._getProjectedPoints(),
          a = o ? o.length : 0;

      if (this._tooFewPointsForIntersection()) return !1;

      for (t = a - 1; t >= 3; t--) if (e = o[t - 1], i = o[t], this._lineSegmentsIntersectsRange(e, i, t - 2)) return !0;

      return !1;
    },
    newLatLngIntersects: function (t, e) {
      return !!this._map && this.newPointIntersects(this._map.latLngToLayerPoint(t), e);
    },
    newPointIntersects: function (t, e) {
      var i = this._getProjectedPoints(),
          o = i ? i.length : 0,
          a = i ? i[o - 1] : null,
          n = o - 2;

      return !this._tooFewPointsForIntersection(1) && this._lineSegmentsIntersectsRange(a, t, n, e ? 1 : 0);
    },
    _tooFewPointsForIntersection: function (t) {
      var e = this._getProjectedPoints(),
          i = e ? e.length : 0;

      return i += t || 0, !e || i <= 3;
    },
    _lineSegmentsIntersectsRange: function (t, e, i, o) {
      var a,
          n,
          s = this._getProjectedPoints();

      o = o || 0;

      for (var r = i; r > o; r--) if (a = s[r - 1], n = s[r], L.LineUtil.segmentsIntersect(t, e, a, n)) return !0;

      return !1;
    },
    _getProjectedPoints: function () {
      if (!this._defaultShape) return this._originalPoints;

      for (var t = [], e = this._defaultShape(), i = 0; i < e.length; i++) t.push(this._map.latLngToLayerPoint(e[i]));

      return t;
    }
  }), L.Polygon.include({
    intersects: function () {
      var t,
          e,
          i,
          o,
          a = this._getProjectedPoints();

      return !this._tooFewPointsForIntersection() && (!!L.Polyline.prototype.intersects.call(this) || (t = a.length, e = a[0], i = a[t - 1], o = t - 2, this._lineSegmentsIntersectsRange(i, e, o, 1)));
    }
  }), L.Control.Draw = L.Control.extend({
    options: {
      position: "topleft",
      draw: {},
      edit: !1
    },
    initialize: function (t) {
      if (L.version < "0.7") throw new Error("Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. Download latest from https://github.com/Leaflet/Leaflet/");
      L.Control.prototype.initialize.call(this, t);
      var e;
      this._toolbars = {}, L.DrawToolbar && this.options.draw && (e = new L.DrawToolbar(this.options.draw), this._toolbars[L.DrawToolbar.TYPE] = e, this._toolbars[L.DrawToolbar.TYPE].on("enable", this._toolbarEnabled, this)), L.EditToolbar && this.options.edit && (e = new L.EditToolbar(this.options.edit), this._toolbars[L.EditToolbar.TYPE] = e, this._toolbars[L.EditToolbar.TYPE].on("enable", this._toolbarEnabled, this)), L.toolbar = this;
    },
    onAdd: function (t) {
      var e,
          i = L.DomUtil.create("div", "leaflet-draw"),
          o = !1;

      for (var a in this._toolbars) this._toolbars.hasOwnProperty(a) && (e = this._toolbars[a].addToolbar(t)) && (o || (L.DomUtil.hasClass(e, "leaflet-draw-toolbar-top") || L.DomUtil.addClass(e.childNodes[0], "leaflet-draw-toolbar-top"), o = !0), i.appendChild(e));

      return i;
    },
    onRemove: function () {
      for (var t in this._toolbars) this._toolbars.hasOwnProperty(t) && this._toolbars[t].removeToolbar();
    },
    setDrawingOptions: function (t) {
      for (var e in this._toolbars) this._toolbars[e] instanceof L.DrawToolbar && this._toolbars[e].setOptions(t);
    },
    _toolbarEnabled: function (t) {
      var e = t.target;

      for (var i in this._toolbars) this._toolbars[i] !== e && this._toolbars[i].disable();
    }
  }), L.Map.mergeOptions({
    drawControlTooltips: !0,
    drawControl: !1
  }), L.Map.addInitHook(function () {
    this.options.drawControl && (this.drawControl = new L.Control.Draw(), this.addControl(this.drawControl));
  }), L.Toolbar = L.Class.extend({
    initialize: function (t) {
      L.setOptions(this, t), this._modes = {}, this._actionButtons = [], this._activeMode = null;
      var e = L.version.split(".");
      1 === parseInt(e[0], 10) && parseInt(e[1], 10) >= 2 ? L.Toolbar.include(L.Evented.prototype) : L.Toolbar.include(L.Mixin.Events);
    },
    enabled: function () {
      return null !== this._activeMode;
    },
    disable: function () {
      this.enabled() && this._activeMode.handler.disable();
    },
    addToolbar: function (t) {
      var e,
          i = L.DomUtil.create("div", "leaflet-draw-section"),
          o = 0,
          a = this._toolbarClass || "",
          n = this.getModeHandlers(t);

      for (this._toolbarContainer = L.DomUtil.create("div", "leaflet-draw-toolbar leaflet-bar"), this._map = t, e = 0; e < n.length; e++) n[e].enabled && this._initModeHandler(n[e].handler, this._toolbarContainer, o++, a, n[e].title);

      if (o) return this._lastButtonIndex = --o, this._actionsContainer = L.DomUtil.create("ul", "leaflet-draw-actions"), i.appendChild(this._toolbarContainer), i.appendChild(this._actionsContainer), i;
    },
    removeToolbar: function () {
      for (var t in this._modes) this._modes.hasOwnProperty(t) && (this._disposeButton(this._modes[t].button, this._modes[t].handler.enable, this._modes[t].handler), this._modes[t].handler.disable(), this._modes[t].handler.off("enabled", this._handlerActivated, this).off("disabled", this._handlerDeactivated, this));

      this._modes = {};

      for (var e = 0, i = this._actionButtons.length; e < i; e++) this._disposeButton(this._actionButtons[e].button, this._actionButtons[e].callback, this);

      this._actionButtons = [], this._actionsContainer = null;
    },
    _initModeHandler: function (t, e, i, o, a) {
      var n = t.type;
      this._modes[n] = {}, this._modes[n].handler = t, this._modes[n].button = this._createButton({
        type: n,
        title: a,
        className: o + "-" + n,
        container: e,
        callback: this._modes[n].handler.enable,
        context: this._modes[n].handler
      }), this._modes[n].buttonIndex = i, this._modes[n].handler.on("enabled", this._handlerActivated, this).on("disabled", this._handlerDeactivated, this);
    },
    _detectIOS: function () {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !t.MSStream;
    },
    _createButton: function (t) {
      var e = L.DomUtil.create("a", t.className || "", t.container),
          i = L.DomUtil.create("span", "sr-only", t.container);
      e.href = "#", e.appendChild(i), t.title && (e.title = t.title, i.innerHTML = t.title), t.text && (e.innerHTML = t.text, i.innerHTML = t.text);
      var o = this._detectIOS() ? "touchstart" : "click";
      return L.DomEvent.on(e, "click", L.DomEvent.stopPropagation).on(e, "mousedown", L.DomEvent.stopPropagation).on(e, "dblclick", L.DomEvent.stopPropagation).on(e, "touchstart", L.DomEvent.stopPropagation).on(e, "click", L.DomEvent.preventDefault).on(e, o, t.callback, t.context), e;
    },
    _disposeButton: function (t, e) {
      var i = this._detectIOS() ? "touchstart" : "click";
      L.DomEvent.off(t, "click", L.DomEvent.stopPropagation).off(t, "mousedown", L.DomEvent.stopPropagation).off(t, "dblclick", L.DomEvent.stopPropagation).off(t, "touchstart", L.DomEvent.stopPropagation).off(t, "click", L.DomEvent.preventDefault).off(t, i, e);
    },
    _handlerActivated: function (t) {
      this.disable(), this._activeMode = this._modes[t.handler], L.DomUtil.addClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled"), this._showActionsToolbar(), this.fire("enable");
    },
    _handlerDeactivated: function () {
      this._hideActionsToolbar(), L.DomUtil.removeClass(this._activeMode.button, "leaflet-draw-toolbar-button-enabled"), this._activeMode = null, this.fire("disable");
    },
    _createActions: function (t) {
      var e,
          i,
          o,
          a,
          n = this._actionsContainer,
          s = this.getActions(t),
          r = s.length;

      for (i = 0, o = this._actionButtons.length; i < o; i++) this._disposeButton(this._actionButtons[i].button, this._actionButtons[i].callback);

      for (this._actionButtons = []; n.firstChild;) n.removeChild(n.firstChild);

      for (var l = 0; l < r; l++) "enabled" in s[l] && !s[l].enabled || (e = L.DomUtil.create("li", "", n), a = this._createButton({
        title: s[l].title,
        text: s[l].text,
        container: e,
        callback: s[l].callback,
        context: s[l].context
      }), this._actionButtons.push({
        button: a,
        callback: s[l].callback
      }));
    },
    _showActionsToolbar: function () {
      var t = this._activeMode.buttonIndex,
          e = this._lastButtonIndex,
          i = this._activeMode.button.offsetTop - 1;
      this._createActions(this._activeMode.handler), this._actionsContainer.style.top = i + "px", 0 === t && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-notop"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-top")), t === e && (L.DomUtil.addClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom"), L.DomUtil.addClass(this._actionsContainer, "leaflet-draw-actions-bottom")), this._actionsContainer.style.display = "block", this._map.fire(L.Draw.Event.TOOLBAROPENED);
    },
    _hideActionsToolbar: function () {
      this._actionsContainer.style.display = "none", L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-notop"), L.DomUtil.removeClass(this._toolbarContainer, "leaflet-draw-toolbar-nobottom"), L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-top"), L.DomUtil.removeClass(this._actionsContainer, "leaflet-draw-actions-bottom"), this._map.fire(L.Draw.Event.TOOLBARCLOSED);
    }
  }), L.Draw = L.Draw || {}, L.Draw.Tooltip = L.Class.extend({
    initialize: function (t) {
      this._map = t, this._popupPane = t._panes.popupPane, this._visible = !1, this._container = t.options.drawControlTooltips ? L.DomUtil.create("div", "leaflet-draw-tooltip", this._popupPane) : null, this._singleLineLabel = !1, this._map.on("mouseout", this._onMouseOut, this);
    },
    dispose: function () {
      this._map.off("mouseout", this._onMouseOut, this), this._container && (this._popupPane.removeChild(this._container), this._container = null);
    },
    updateContent: function (t) {
      return this._container ? (t.subtext = t.subtext || "", 0 !== t.subtext.length || this._singleLineLabel ? t.subtext.length > 0 && this._singleLineLabel && (L.DomUtil.removeClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !1) : (L.DomUtil.addClass(this._container, "leaflet-draw-tooltip-single"), this._singleLineLabel = !0), this._container.innerHTML = (t.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + t.subtext + "</span><br />" : "") + "<span>" + t.text + "</span>", t.text || t.subtext ? (this._visible = !0, this._container.style.visibility = "inherit") : (this._visible = !1, this._container.style.visibility = "hidden"), this) : this;
    },
    updatePosition: function (t) {
      var e = this._map.latLngToLayerPoint(t),
          i = this._container;

      return this._container && (this._visible && (i.style.visibility = "inherit"), L.DomUtil.setPosition(i, e)), this;
    },
    showAsError: function () {
      return this._container && L.DomUtil.addClass(this._container, "leaflet-error-draw-tooltip"), this;
    },
    removeError: function () {
      return this._container && L.DomUtil.removeClass(this._container, "leaflet-error-draw-tooltip"), this;
    },
    _onMouseOut: function () {
      this._container && (this._container.style.visibility = "hidden");
    }
  }), L.DrawToolbar = L.Toolbar.extend({
    statics: {
      TYPE: "draw"
    },
    options: {
      polyline: {},
      polygon: {},
      rectangle: {},
      circle: {},
      marker: {},
      circlemarker: {}
    },
    initialize: function (t) {
      for (var e in this.options) this.options.hasOwnProperty(e) && t[e] && (t[e] = L.extend({}, this.options[e], t[e]));

      this._toolbarClass = "leaflet-draw-draw", L.Toolbar.prototype.initialize.call(this, t);
    },
    getModeHandlers: function (t) {
      return [{
        enabled: this.options.polyline,
        handler: new L.Draw.Polyline(t, this.options.polyline),
        title: L.drawLocal.draw.toolbar.buttons.polyline
      }, {
        enabled: this.options.polygon,
        handler: new L.Draw.Polygon(t, this.options.polygon),
        title: L.drawLocal.draw.toolbar.buttons.polygon
      }, {
        enabled: this.options.rectangle,
        handler: new L.Draw.Rectangle(t, this.options.rectangle),
        title: L.drawLocal.draw.toolbar.buttons.rectangle
      }, {
        enabled: this.options.circle,
        handler: new L.Draw.Circle(t, this.options.circle),
        title: L.drawLocal.draw.toolbar.buttons.circle
      }, {
        enabled: this.options.marker,
        handler: new L.Draw.Marker(t, this.options.marker),
        title: L.drawLocal.draw.toolbar.buttons.marker
      }, {
        enabled: this.options.circlemarker,
        handler: new L.Draw.CircleMarker(t, this.options.circlemarker),
        title: L.drawLocal.draw.toolbar.buttons.circlemarker
      }];
    },
    getActions: function (t) {
      return [{
        enabled: t.completeShape,
        title: L.drawLocal.draw.toolbar.finish.title,
        text: L.drawLocal.draw.toolbar.finish.text,
        callback: t.completeShape,
        context: t
      }, {
        enabled: t.deleteLastVertex,
        title: L.drawLocal.draw.toolbar.undo.title,
        text: L.drawLocal.draw.toolbar.undo.text,
        callback: t.deleteLastVertex,
        context: t
      }, {
        title: L.drawLocal.draw.toolbar.actions.title,
        text: L.drawLocal.draw.toolbar.actions.text,
        callback: this.disable,
        context: this
      }];
    },
    setOptions: function (t) {
      L.setOptions(this, t);

      for (var e in this._modes) this._modes.hasOwnProperty(e) && t.hasOwnProperty(e) && this._modes[e].handler.setOptions(t[e]);
    }
  }), L.EditToolbar = L.Toolbar.extend({
    statics: {
      TYPE: "edit"
    },
    options: {
      edit: {
        selectedPathOptions: {
          dashArray: "10, 10",
          fill: !0,
          fillColor: "#fe57a1",
          fillOpacity: .1,
          maintainColor: !1
        }
      },
      remove: {},
      poly: null,
      featureGroup: null
    },
    initialize: function (t) {
      t.edit && (void 0 === t.edit.selectedPathOptions && (t.edit.selectedPathOptions = this.options.edit.selectedPathOptions), t.edit.selectedPathOptions = L.extend({}, this.options.edit.selectedPathOptions, t.edit.selectedPathOptions)), t.remove && (t.remove = L.extend({}, this.options.remove, t.remove)), t.poly && (t.poly = L.extend({}, this.options.poly, t.poly)), this._toolbarClass = "leaflet-draw-edit", L.Toolbar.prototype.initialize.call(this, t), this._selectedFeatureCount = 0;
    },
    getModeHandlers: function (t) {
      var e = this.options.featureGroup;
      return [{
        enabled: this.options.edit,
        handler: new L.EditToolbar.Edit(t, {
          featureGroup: e,
          selectedPathOptions: this.options.edit.selectedPathOptions,
          poly: this.options.poly
        }),
        title: L.drawLocal.edit.toolbar.buttons.edit
      }, {
        enabled: this.options.remove,
        handler: new L.EditToolbar.Delete(t, {
          featureGroup: e
        }),
        title: L.drawLocal.edit.toolbar.buttons.remove
      }];
    },
    getActions: function (t) {
      var e = [{
        title: L.drawLocal.edit.toolbar.actions.save.title,
        text: L.drawLocal.edit.toolbar.actions.save.text,
        callback: this._save,
        context: this
      }, {
        title: L.drawLocal.edit.toolbar.actions.cancel.title,
        text: L.drawLocal.edit.toolbar.actions.cancel.text,
        callback: this.disable,
        context: this
      }];
      return t.removeAllLayers && e.push({
        title: L.drawLocal.edit.toolbar.actions.clearAll.title,
        text: L.drawLocal.edit.toolbar.actions.clearAll.text,
        callback: this._clearAllLayers,
        context: this
      }), e;
    },
    addToolbar: function (t) {
      var e = L.Toolbar.prototype.addToolbar.call(this, t);
      return this._checkDisabled(), this.options.featureGroup.on("layeradd layerremove", this._checkDisabled, this), e;
    },
    removeToolbar: function () {
      this.options.featureGroup.off("layeradd layerremove", this._checkDisabled, this), L.Toolbar.prototype.removeToolbar.call(this);
    },
    disable: function () {
      this.enabled() && (this._activeMode.handler.revertLayers(), L.Toolbar.prototype.disable.call(this));
    },
    _save: function () {
      this._activeMode.handler.save(), this._activeMode && this._activeMode.handler.disable();
    },
    _clearAllLayers: function () {
      this._activeMode.handler.removeAllLayers(), this._activeMode && this._activeMode.handler.disable();
    },
    _checkDisabled: function () {
      var t,
          e = this.options.featureGroup,
          i = 0 !== e.getLayers().length;
      this.options.edit && (t = this._modes[L.EditToolbar.Edit.TYPE].button, i ? L.DomUtil.removeClass(t, "leaflet-disabled") : L.DomUtil.addClass(t, "leaflet-disabled"), t.setAttribute("title", i ? L.drawLocal.edit.toolbar.buttons.edit : L.drawLocal.edit.toolbar.buttons.editDisabled)), this.options.remove && (t = this._modes[L.EditToolbar.Delete.TYPE].button, i ? L.DomUtil.removeClass(t, "leaflet-disabled") : L.DomUtil.addClass(t, "leaflet-disabled"), t.setAttribute("title", i ? L.drawLocal.edit.toolbar.buttons.remove : L.drawLocal.edit.toolbar.buttons.removeDisabled));
    }
  }), L.EditToolbar.Edit = L.Handler.extend({
    statics: {
      TYPE: "edit"
    },
    initialize: function (t, e) {
      if (L.Handler.prototype.initialize.call(this, t), L.setOptions(this, e), this._featureGroup = e.featureGroup, !(this._featureGroup instanceof L.FeatureGroup)) throw new Error("options.featureGroup must be a L.FeatureGroup");
      this._uneditedLayerProps = {}, this.type = L.EditToolbar.Edit.TYPE;
      var i = L.version.split(".");
      1 === parseInt(i[0], 10) && parseInt(i[1], 10) >= 2 ? L.EditToolbar.Edit.include(L.Evented.prototype) : L.EditToolbar.Edit.include(L.Mixin.Events);
    },
    enable: function () {
      !this._enabled && this._hasAvailableLayers() && (this.fire("enabled", {
        handler: this.type
      }), this._map.fire(L.Draw.Event.EDITSTART, {
        handler: this.type
      }), L.Handler.prototype.enable.call(this), this._featureGroup.on("layeradd", this._enableLayerEdit, this).on("layerremove", this._disableLayerEdit, this));
    },
    disable: function () {
      this._enabled && (this._featureGroup.off("layeradd", this._enableLayerEdit, this).off("layerremove", this._disableLayerEdit, this), L.Handler.prototype.disable.call(this), this._map.fire(L.Draw.Event.EDITSTOP, {
        handler: this.type
      }), this.fire("disabled", {
        handler: this.type
      }));
    },
    addHooks: function () {
      var t = this._map;
      t && (t.getContainer().focus(), this._featureGroup.eachLayer(this._enableLayerEdit, this), this._tooltip = new L.Draw.Tooltip(this._map), this._tooltip.updateContent({
        text: L.drawLocal.edit.handlers.edit.tooltip.text,
        subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
      }), t._editTooltip = this._tooltip, this._updateTooltip(), this._map.on("mousemove", this._onMouseMove, this).on("touchmove", this._onMouseMove, this).on("MSPointerMove", this._onMouseMove, this).on(L.Draw.Event.EDITVERTEX, this._updateTooltip, this));
    },
    removeHooks: function () {
      this._map && (this._featureGroup.eachLayer(this._disableLayerEdit, this), this._uneditedLayerProps = {}, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove", this._onMouseMove, this).off("touchmove", this._onMouseMove, this).off("MSPointerMove", this._onMouseMove, this).off(L.Draw.Event.EDITVERTEX, this._updateTooltip, this));
    },
    revertLayers: function () {
      this._featureGroup.eachLayer(function (t) {
        this._revertLayer(t);
      }, this);
    },
    save: function () {
      var t = new L.LayerGroup();
      this._featureGroup.eachLayer(function (e) {
        e.edited && (t.addLayer(e), e.edited = !1);
      }), this._map.fire(L.Draw.Event.EDITED, {
        layers: t
      });
    },
    _backupLayer: function (t) {
      var e = L.Util.stamp(t);
      this._uneditedLayerProps[e] || (t instanceof L.Polyline || t instanceof L.Polygon || t instanceof L.Rectangle ? this._uneditedLayerProps[e] = {
        latlngs: L.LatLngUtil.cloneLatLngs(t.getLatLngs())
      } : t instanceof L.Circle ? this._uneditedLayerProps[e] = {
        latlng: L.LatLngUtil.cloneLatLng(t.getLatLng()),
        radius: t.getRadius()
      } : (t instanceof L.Marker || t instanceof L.CircleMarker) && (this._uneditedLayerProps[e] = {
        latlng: L.LatLngUtil.cloneLatLng(t.getLatLng())
      }));
    },
    _getTooltipText: function () {
      return {
        text: L.drawLocal.edit.handlers.edit.tooltip.text,
        subtext: L.drawLocal.edit.handlers.edit.tooltip.subtext
      };
    },
    _updateTooltip: function () {
      this._tooltip.updateContent(this._getTooltipText());
    },
    _revertLayer: function (t) {
      var e = L.Util.stamp(t);
      t.edited = !1, this._uneditedLayerProps.hasOwnProperty(e) && (t instanceof L.Polyline || t instanceof L.Polygon || t instanceof L.Rectangle ? t.setLatLngs(this._uneditedLayerProps[e].latlngs) : t instanceof L.Circle ? (t.setLatLng(this._uneditedLayerProps[e].latlng), t.setRadius(this._uneditedLayerProps[e].radius)) : (t instanceof L.Marker || t instanceof L.CircleMarker) && t.setLatLng(this._uneditedLayerProps[e].latlng), t.fire("revert-edited", {
        layer: t
      }));
    },
    _enableLayerEdit: function (t) {
      var e,
          i,
          o = t.layer || t.target || t;
      this._backupLayer(o), this.options.poly && (i = L.Util.extend({}, this.options.poly), o.options.poly = i), this.options.selectedPathOptions && (e = L.Util.extend({}, this.options.selectedPathOptions), e.maintainColor && (e.color = o.options.color, e.fillColor = o.options.fillColor), o.options.original = L.extend({}, o.options), o.options.editing = e), o instanceof L.Marker ? (o.editing && o.editing.enable(), o.dragging.enable(), o.on("dragend", this._onMarkerDragEnd).on("touchmove", this._onTouchMove, this).on("MSPointerMove", this._onTouchMove, this).on("touchend", this._onMarkerDragEnd, this).on("MSPointerUp", this._onMarkerDragEnd, this)) : o.editing.enable();
    },
    _disableLayerEdit: function (t) {
      var e = t.layer || t.target || t;
      e.edited = !1, e.editing && e.editing.disable(), delete e.options.editing, delete e.options.original, this._selectedPathOptions && (e instanceof L.Marker ? this._toggleMarkerHighlight(e) : (e.setStyle(e.options.previousOptions), delete e.options.previousOptions)), e instanceof L.Marker ? (e.dragging.disable(), e.off("dragend", this._onMarkerDragEnd, this).off("touchmove", this._onTouchMove, this).off("MSPointerMove", this._onTouchMove, this).off("touchend", this._onMarkerDragEnd, this).off("MSPointerUp", this._onMarkerDragEnd, this)) : e.editing.disable();
    },
    _onMouseMove: function (t) {
      this._tooltip.updatePosition(t.latlng);
    },
    _onMarkerDragEnd: function (t) {
      var e = t.target;
      e.edited = !0, this._map.fire(L.Draw.Event.EDITMOVE, {
        layer: e
      });
    },
    _onTouchMove: function (t) {
      var e = t.originalEvent.changedTouches[0],
          i = this._map.mouseEventToLayerPoint(e),
          o = this._map.layerPointToLatLng(i);

      t.target.setLatLng(o);
    },
    _hasAvailableLayers: function () {
      return 0 !== this._featureGroup.getLayers().length;
    }
  }), L.EditToolbar.Delete = L.Handler.extend({
    statics: {
      TYPE: "remove"
    },
    initialize: function (t, e) {
      if (L.Handler.prototype.initialize.call(this, t), L.Util.setOptions(this, e), this._deletableLayers = this.options.featureGroup, !(this._deletableLayers instanceof L.FeatureGroup)) throw new Error("options.featureGroup must be a L.FeatureGroup");
      this.type = L.EditToolbar.Delete.TYPE;
      var i = L.version.split(".");
      1 === parseInt(i[0], 10) && parseInt(i[1], 10) >= 2 ? L.EditToolbar.Delete.include(L.Evented.prototype) : L.EditToolbar.Delete.include(L.Mixin.Events);
    },
    enable: function () {
      !this._enabled && this._hasAvailableLayers() && (this.fire("enabled", {
        handler: this.type
      }), this._map.fire(L.Draw.Event.DELETESTART, {
        handler: this.type
      }), L.Handler.prototype.enable.call(this), this._deletableLayers.on("layeradd", this._enableLayerDelete, this).on("layerremove", this._disableLayerDelete, this));
    },
    disable: function () {
      this._enabled && (this._deletableLayers.off("layeradd", this._enableLayerDelete, this).off("layerremove", this._disableLayerDelete, this), L.Handler.prototype.disable.call(this), this._map.fire(L.Draw.Event.DELETESTOP, {
        handler: this.type
      }), this.fire("disabled", {
        handler: this.type
      }));
    },
    addHooks: function () {
      var t = this._map;
      t && (t.getContainer().focus(), this._deletableLayers.eachLayer(this._enableLayerDelete, this), this._deletedLayers = new L.LayerGroup(), this._tooltip = new L.Draw.Tooltip(this._map), this._tooltip.updateContent({
        text: L.drawLocal.edit.handlers.remove.tooltip.text
      }), this._map.on("mousemove", this._onMouseMove, this));
    },
    removeHooks: function () {
      this._map && (this._deletableLayers.eachLayer(this._disableLayerDelete, this), this._deletedLayers = null, this._tooltip.dispose(), this._tooltip = null, this._map.off("mousemove", this._onMouseMove, this));
    },
    revertLayers: function () {
      this._deletedLayers.eachLayer(function (t) {
        this._deletableLayers.addLayer(t), t.fire("revert-deleted", {
          layer: t
        });
      }, this);
    },
    save: function () {
      this._map.fire(L.Draw.Event.DELETED, {
        layers: this._deletedLayers
      });
    },
    removeAllLayers: function () {
      this._deletableLayers.eachLayer(function (t) {
        this._removeLayer({
          layer: t
        });
      }, this), this.save();
    },
    _enableLayerDelete: function (t) {
      (t.layer || t.target || t).on("click", this._removeLayer, this);
    },
    _disableLayerDelete: function (t) {
      var e = t.layer || t.target || t;
      e.off("click", this._removeLayer, this), this._deletedLayers.removeLayer(e);
    },
    _removeLayer: function (t) {
      var e = t.layer || t.target || t;
      this._deletableLayers.removeLayer(e), this._deletedLayers.addLayer(e), e.fire("deleted");
    },
    _onMouseMove: function (t) {
      this._tooltip.updatePosition(t.latlng);
    },
    _hasAvailableLayers: function () {
      return 0 !== this._deletableLayers.getLayers().length;
    }
  });
}(window, document);

/***/ }),

/***/ 9250:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _html2canvas__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2061);
/* harmony import */ var _html2canvas__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_html2canvas__WEBPACK_IMPORTED_MODULE_0__);
// const html2canvas = require('./html2canvas.js');


(function (L, undefined) {
  L.Map.addInitHook(function () {
    this.whenReady(function () {
      L.Map.mergeOptions({
        preferCanvas: true
      });

      if (!('exportError' in this)) {
        this.exportError = {
          wrongBeginSelector: 'Селектор JQuery не имеет начальной скобки (',
          wrongEndSelector: 'Селектор JQuery не заканчивается скобкой )',
          jqueryNotAvailable: 'В опциях используется JQuery селектор, но JQuery не подключен.Подключите JQuery или используйте DOM-селекторы .class, #id или DOM-элементы',
          popupWindowBlocked: 'Окно печати было заблокировано браузером. Пожалуйста разрешите всплывающие окна на этой странице',
          emptyFilename: 'При выгрузке карты в виде файла не указано его имя'
        };
      }

      this.supportedCanvasMimeTypes = function () {
        if ('_supportedCanvasMimeTypes' in this) {
          return this._supportedCanvasMimeTypes;
        }

        var mimeTypes = {
          PNG: 'image/png',
          JPEG: 'image/jpeg',
          JPG: 'image/jpg',
          GIF: 'image/gif',
          BMP: 'image/bmp',
          TIFF: 'image/tiff',
          XICON: 'image/x-icon',
          SVG: 'image/svg+xml',
          WEBP: 'image/webp'
        };
        var canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas = document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
        this._supportedCanvasMimeTypes = {};

        for (var type in mimeTypes) {
          var mimeType = mimeTypes[type];
          var data = canvas.toDataURL(mimeType);
          var actualType = data.replace(/^data:([^;]*).*/, '$1');

          if (mimeType === actualType) {
            this._supportedCanvasMimeTypes[type] = mimeType;
          }
        }

        document.body.removeChild(canvas);
        return this._supportedCanvasMimeTypes;
      };

      this.export = function (options) {
        var caption = {};
        var exclude = [];
        var format = 'image/png';
        options = options || {
          caption: {},
          exclude: []
        };

        if ('caption' in options) {
          caption = options['caption'];

          if ('position' in caption) {
            var position = caption.position;

            if (!Array.isArray(position)) {
              position = [0, 0];
            }

            if (position.length != 2) {
              if (position.length === 0) {
                position[0] = 0;
              }

              if (position.length === 1) {
                position[1] = 0;
              }
            }

            if (typeof position[0] !== 'number') {
              if (typeof position[0] === 'string') {
                position[0] = parseInt(position[0]);

                if (isNaN(position[0])) {
                  position[0] = 0;
                }
              }
            }

            if (typeof position[1] !== 'number') {
              if (typeof position[1] === 'string') {
                position[1] = parseInt(position[1]);

                if (isNaN(position[1])) {
                  position[1] = 0;
                }
              }
            }

            caption.position = position;
          }
        }

        if ('exclude' in options && Array.isArray(options['exclude'])) {
          exclude = options['exclude'];
        }

        if ('format' in options) {
          format = options['format'];
        }

        var afterRender = options.afterRender;

        if (typeof afterRender !== 'function') {
          afterRender = function (result) {
            return result;
          };
        }

        var afterExport = options.afterExport;

        if (typeof afterExport !== 'function') {
          afterExport = function (result) {
            return result;
          };
        }

        var container = options.container || this._container;
        var hide = [];

        for (var i = 0; i < exclude.length; i++) {
          var selector = exclude[i];

          switch (typeof selector) {
            // DOM element.
            case 'object':
              if ('tagName' in selector) {
                hide.push(selector);
              }

              break;
            // Selector

            case 'string':
              var type = selector.substr(0, 1);

              switch (type) {
                // Class selector.
                case '.':
                  var elements = container.getElementsByClassName(selector.substr(1));

                  for (var j = 0; j < elements.length; j++) {
                    hide.push(elements.item(j));
                  }

                  break;
                // Id selector.

                case '#':
                  var element = container.getElementById(selector.substr(1));

                  if (element) {
                    hide.push(element);
                  }

                  break;
                // JQuery.

                case '$':
                  var jQuerySelector = selector.trim().substr(1);

                  if (jQuerySelector.substr(0, 1) !== '(') {
                    throw new Error(this.exportError.wrongBeginSelector);
                  }

                  jQuerySelector = jQuerySelector.substr(1);

                  if (jQuerySelector.substr(-1) !== ')') {
                    throw new Error(this.exportError.wrongEndSelector);
                  }

                  jQuerySelector = jQuerySelector.substr(0, jQuerySelector.length - 1);

                  if (typeof jQuery !== 'undefined') {
                    var elements = $(jQuerySelector, container);

                    for (var j = 0; j < elements.length; j++) {
                      hide.push(elements[i]);
                    }
                  } else {
                    throw new Error(this.exportError.jqueryNotAvailable);
                  }

              }

          }
        } // Hide excluded elements.


        for (var i = 0; i < hide.length; i++) {
          hide[i].setAttribute('data-html2canvas-ignore', 'true');
        }

        var _this = this;

        return _html2canvas__WEBPACK_IMPORTED_MODULE_0___default()(container, {
          useCORS: true
        }).then(afterRender).then(function (canvas) {
          // Show excluded elements.
          for (var i = 0; i < hide.length; i++) {
            hide[i].removeAttribute('data-html2canvas-ignore');
          }

          if ('text' in caption && caption.text) {
            var x, y;

            if ('position' in caption) {
              x = caption.position[0];
              y = caption.position[1];
            } else {
              x = 0;
              y = 0;
            }

            var ctx = canvas.getContext('2d');

            if ('font' in caption) {
              ctx.font = caption.font;
            }

            if ('fillStyle' in caption) {
              ctx.fillStyle = caption.fillStyle;
            }

            ctx.fillText(caption.text, x, y);
          }

          var ret = format === 'canvas' ? canvas : {
            data: canvas.toDataURL(format),
            width: canvas.width,
            height: canvas.height,
            type: format
          };
          return ret;
        }, function (reason) {
          var newReason = reason;
          alert(reason);
        }).then(afterExport);
      };

      this.printExport = function (options) {
        options = options || {};
        var exportMethod = options.export || this.export;

        var _this = this;

        return exportMethod(options).then(function (result) {
          var printWindow = window.open('', '_blank');

          if (printWindow) {
            var printDocument = printWindow.document;
            printDocument.write('<html><head><title>' + (options.text ? options.text : '') + '</title></head><body onload=\'window.print(); window.close();\'></body></html>');
            var img = printDocument.createElement('img');
            img.height = result.height;
            img.width = result.width;
            img.src = result.data;
            printDocument.body.appendChild(img);
            printDocument.close();
            printWindow.focus();
          } else {
            throw new Error(_this.exportError.popupWindowBlocked);
          }

          return result;
        });
      };

      this.downloadExport = function (options) {
        options = options || {};

        if (!('fileName' in options)) {
          throw new Error(this.exportError.emptyFilename);
        }

        var exportMethod = options.export || this.export;
        var fileName = options.fileName;
        delete options.fileName;

        var _this = this;

        return exportMethod(options).then(function (result) {
          var fileData = atob(result.data.split(',')[1]);
          var arrayBuffer = new ArrayBuffer(fileData.length);
          var view = new Uint8Array(arrayBuffer);

          for (var i = 0; i < fileData.length; i++) {
            view[i] = fileData.charCodeAt(i) & 0xff;
          }

          var blob;

          if (typeof Blob === 'function') {
            blob = new Blob([arrayBuffer], {
              type: 'application/octet-stream'
            });
          } else {
            var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder)();
            blobBuilder.append(arrayBuffer);
            blob = blobBuilder.getBlob('application/octet-stream');
          }

          if (window.navigator.msSaveOrOpenBlob) {
            // IE can not open blob and data links, but has special method for downloading blobs as files.
            window.navigator.msSaveBlob(blob, fileName);
          } else {
            var blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
            var downloadLink = document.createElement('a');
            downloadLink.style = 'display: none';
            downloadLink.download = fileName;
            downloadLink.href = blobUrl; // IE requires link to be added into body.

            document.body.appendChild(downloadLink); // Emit click to download image.

            downloadLink.click(); // Delete appended link.

            document.body.removeChild(downloadLink);
          }

          return result;
        });
      };
    });
  });
})(L);

/***/ }),

/***/ 752:
/***/ (() => {

/**
*  Create a Canvas as ImageOverlay to draw the Lat/Lon Graticule,
*  and show the axis tick label on the edge of the map.
*  Author: lanwei@cloudybay.com.tw
*/
L.LatLngGraticule = L.Layer.extend({
  options: {
    showLabel: true,
    opacity: 1,
    weight: 0.8,
    color: '#aaa',
    font: '12px Verdana',
    lngLineCurved: 0,
    latLineCurved: 0,
    zoomInterval: [{
      start: 2,
      end: 2,
      interval: 40
    }, {
      start: 3,
      end: 3,
      interval: 20
    }, {
      start: 4,
      end: 4,
      interval: 10
    }, {
      start: 5,
      end: 7,
      interval: 5
    }, {
      start: 8,
      end: 20,
      interval: 1
    }]
  },
  initialize: function (options) {
    L.setOptions(this, options);
    var defaultFontName = 'Verdana';

    var _ff = this.options.font.split(' ');

    if (_ff.length < 2) {
      this.options.font += ' ' + defaultFontName;
    }

    if (!this.options.fontColor) {
      this.options.fontColor = this.options.color;
    }

    if (this.options.zoomInterval) {
      if (this.options.zoomInterval.latitude) {
        this.options.latInterval = this.options.zoomInterval.latitude;

        if (!this.options.zoomInterval.longitude) {
          this.options.lngInterval = this.options.zoomInterval.latitude;
        }
      }

      if (this.options.zoomInterval.longitude) {
        this.options.lngInterval = this.options.zoomInterval.longitude;

        if (!this.options.zoomInterval.latitude) {
          this.options.latInterval = this.options.zoomInterval.longitude;
        }
      }

      if (!this.options.latInterval) {
        this.options.latInterval = this.options.zoomInterval;
      }

      if (!this.options.lngInterval) {
        this.options.lngInterval = this.options.zoomInterval;
      }
    }
  },
  onAdd: function (map) {
    this._map = map;

    if (!this._container) {
      this._initCanvas();
    }

    map._panes.overlayPane.appendChild(this._container);

    map.on('viewreset', this._reset, this);
    map.on('move', this._reset, this);
    map.on('moveend', this._reset, this); // 		if (map.options.zoomAnimation && L.Browser.any3d) {
    // 			map.on('zoom', this._animateZoom, this);
    // 		}

    this._reset();
  },
  onRemove: function (map) {
    map.getPanes().overlayPane.removeChild(this._container);
    map.off('viewreset', this._reset, this);
    map.off('move', this._reset, this);
    map.off('moveend', this._reset, this); // 		if (map.options.zoomAnimation) {
    // 			map.off('zoom', this._animateZoom, this);
    // 		}
  },
  addTo: function (map) {
    map.addLayer(this);
    return this;
  },
  setOpacity: function (opacity) {
    this.options.opacity = opacity;

    this._updateOpacity();

    return this;
  },
  bringToFront: function () {
    if (this._canvas) {
      this._map._panes.overlayPane.appendChild(this._canvas);
    }

    return this;
  },
  bringToBack: function () {
    var pane = this._map._panes.overlayPane;

    if (this._canvas) {
      pane.insertBefore(this._canvas, pane.firstChild);
    }

    return this;
  },
  getAttribution: function () {
    return this.options.attribution;
  },
  _initCanvas: function () {
    this._container = L.DomUtil.create('div', 'leaflet-image-layer');
    this._canvas = L.DomUtil.create('canvas', '');

    if (this._map.options.zoomAnimation && L.Browser.any3d) {
      L.DomUtil.addClass(this._canvas, 'leaflet-zoom-animated');
    } else {
      L.DomUtil.addClass(this._canvas, 'leaflet-zoom-hide');
    }

    this._updateOpacity();

    this._container.appendChild(this._canvas);

    L.extend(this._canvas, {
      onselectstart: L.Util.falseFn,
      onmousemove: L.Util.falseFn,
      onload: L.bind(this._onCanvasLoad, this)
    });
  },
  // 	_animateZoom: function (e) {
  // 		var map = this._map,
  // 			container = this._container,
  // 			canvas = this._canvas,
  // 			zoom = map.getZoom(),
  // 			center = map.getCenter(),
  // 			scale = map.getZoomScale(zoom),
  // 			nw = map.containerPointToLatLng([0, 0]),
  // 			se = map.containerPointToLatLng([canvas.width, canvas.height]),
  //
  // 			topLeft = map._latLngToNewLayerPoint(nw, zoom, center),
  // 			size = map._latLngToNewLayerPoint(se, zoom, center)._subtract(topLeft),
  // 			origin = topLeft._add(size._multiplyBy((1 / 2) * (1 - 1 / scale)));
  //
  // 		L.DomUtil.setTransform(container, origin, scale);
  // 	},
  _reset: function () {
    var container = this._container,
        canvas = this._canvas,
        size = this._map.getSize(),
        lt = this._map.containerPointToLayerPoint([0, 0]);

    L.DomUtil.setPosition(container, lt);
    container.style.width = size.x + 'px';
    container.style.height = size.y + 'px';
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.width = size.x + 'px';
    canvas.style.height = size.y + 'px';

    this.__calcInterval();

    this.__draw(true);
  },
  _onCanvasLoad: function () {
    this.fire('load');
  },
  _updateOpacity: function () {
    L.DomUtil.setOpacity(this._canvas, this.options.opacity);
  },
  __format_lat: function (lat) {
    if (this.options.latFormatTickLabel) {
      return this.options.latFormatTickLabel(lat);
    } // todo: format type of float


    if (lat < 0) {
      return '' + lat * -1 + 'Ю.Ш.'; //S
    } else if (lat > 0) {
      return '' + lat + 'С.Ш.'; //N
    }

    return '' + lat;
  },
  __format_lng: function (lng) {
    if (this.options.lngFormatTickLabel) {
      return this.options.lngFormatTickLabel(lng);
    } // todo: format type of float


    if (lng > 180) {
      return '' + (360 - lng) + 'З.Д.';
    } else if (lng > 0 && lng < 180) {
      return '' + lng + 'В.Д.';
    } else if (lng < 0 && lng > -180) {
      return '' + lng * -1 + 'З.Д.';
    } else if (lng == -180) {
      return '' + lng * -1;
    } else if (lng < -180) {
      return '' + (360 + lng) + 'З.Д.';
    }

    return '' + lng;
  },
  __calcInterval: function () {
    var zoom = this._map.getZoom();

    if (this._currZoom != zoom) {
      this._currLngInterval = 0;
      this._currLatInterval = 0;
      this._currZoom = zoom;
    }

    var interv;

    if (!this._currLngInterval) {
      try {
        for (var idx in this.options.lngInterval) {
          var dict = this.options.lngInterval[idx];

          if (dict.start <= zoom) {
            if (dict.end && dict.end >= zoom) {
              this._currLngInterval = dict.interval;
              break;
            }
          }
        }
      } catch (e) {
        this._currLngInterval = 0;
      }
    }

    if (!this._currLatInterval) {
      try {
        for (var idx in this.options.latInterval) {
          var dict = this.options.latInterval[idx];

          if (dict.start <= zoom) {
            if (dict.end && dict.end >= zoom) {
              this._currLatInterval = dict.interval;
              break;
            }
          }
        }
      } catch (e) {
        this._currLatInterval = 0;
      }
    }
  },
  __draw: function (label) {
    function _parse_px_to_int(txt) {
      if (txt.length > 2) {
        if (txt.charAt(txt.length - 2) == 'p') {
          txt = txt.substr(0, txt.length - 2);
        }
      }

      try {
        return parseInt(txt, 10);
      } catch (e) {}

      return 0;
    }

    ;
    var canvas = this._canvas,
        map = this._map,
        curvedLon = this.options.lngLineCurved,
        curvedLat = this.options.latLineCurved;

    if (L.Browser.canvas && map) {
      if (!this._currLngInterval || !this._currLatInterval) {
        this.__calcInterval();
      }

      var latInterval = this._currLatInterval,
          lngInterval = this._currLngInterval;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = this.options.weight;
      ctx.strokeStyle = this.options.color;
      ctx.fillStyle = this.options.fontColor;

      if (this.options.font) {
        ctx.font = this.options.font;
      }

      var txtWidth = ctx.measureText('0').width;
      var txtHeight = 12;

      try {
        var _font_size = ctx.font.split(' ')[0];
        txtHeight = _parse_px_to_int(_font_size);
      } catch (e) {}

      var ww = canvas.width,
          hh = canvas.height;
      var lt = map.containerPointToLatLng(L.point(0, 0));
      var rt = map.containerPointToLatLng(L.point(ww, 0));
      var rb = map.containerPointToLatLng(L.point(ww, hh));
      var _lat_b = rb.lat,
          _lat_t = lt.lat;
      var _lon_l = lt.lng,
          _lon_r = rt.lng;

      var _point_per_lat = (_lat_t - _lat_b) / (hh * 0.2);

      if (_point_per_lat < 1) {
        _point_per_lat = 1;
      }

      if (_lat_b < -90) {
        _lat_b = -90;
      } else {
        _lat_b = parseInt(_lat_b - _point_per_lat, 10);
      }

      if (_lat_t > 90) {
        _lat_t = 90;
      } else {
        _lat_t = parseInt(_lat_t + _point_per_lat, 10);
      }

      var _point_per_lon = (_lon_r - _lon_l) / (ww * 0.2);

      if (_point_per_lon < 1) {
        _point_per_lon = 1;
      }

      if (_lon_l > 0 && _lon_r < 0) {
        _lon_r += 360;
      }

      _lon_r = parseInt(_lon_r + _point_per_lon, 10);
      _lon_l = parseInt(_lon_l - _point_per_lon, 10);
      var ll,
          latstr,
          lngstr,
          _lon_delta = 0.5;

      function __draw_lat_line(self, lat_tick) {
        ll = map.latLngToContainerPoint(L.latLng(lat_tick, _lon_l));
        latstr = self.__format_lat(lat_tick);
        txtWidth = ctx.measureText(latstr).width;

        if (curvedLat) {
          if (typeof curvedLat == 'number') {
            _lon_delta = curvedLat;
          }

          var __lon_left = _lon_l,
              __lon_right = _lon_r;

          if (ll.x > 0) {
            var __lon_left = map.containerPointToLatLng(L.point(0, ll.y));

            __lon_left = __lon_left.lng - _point_per_lon;
            ll.x = 0;
          }

          var rr = map.latLngToContainerPoint(L.latLng(lat_tick, __lon_right));

          if (rr.x < ww) {
            __lon_right = map.containerPointToLatLng(L.point(ww, rr.y));
            __lon_right = __lon_right.lng + _point_per_lon;

            if (__lon_left > 0 && __lon_right < 0) {
              __lon_right += 360;
            }
          }

          ctx.beginPath();
          ctx.moveTo(ll.x, ll.y);
          var _prev_p = null;

          for (var j = __lon_left; j <= __lon_right; j += _lon_delta) {
            rr = map.latLngToContainerPoint(L.latLng(lat_tick, j));
            ctx.lineTo(rr.x, rr.y);

            if (self.options.showLabel && label && _prev_p != null) {
              if (_prev_p.x < 0 && rr.x >= 0) {
                var _s = (rr.x - 0) / (rr.x - _prev_p.x);

                var _y = rr.y - (rr.y - _prev_p.y) * _s;

                ctx.fillText(latstr, 0, _y + txtHeight / 2);
              } else if (_prev_p.x <= ww - txtWidth && rr.x > ww - txtWidth) {
                var _s = (rr.x - ww) / (rr.x - _prev_p.x);

                var _y = rr.y - (rr.y - _prev_p.y) * _s;

                ctx.fillText(latstr, ww - txtWidth, _y + txtHeight / 2 - 2);
              }
            }

            _prev_p = {
              x: rr.x,
              y: rr.y,
              lon: j,
              lat: i
            };
          }

          ctx.stroke();
        } else {
          var __lon_right = _lon_r;
          var rr = map.latLngToContainerPoint(L.latLng(lat_tick, __lon_right));

          if (curvedLon) {
            __lon_right = map.containerPointToLatLng(L.point(0, rr.y));
            __lon_right = __lon_right.lng;
            rr = map.latLngToContainerPoint(L.latLng(lat_tick, __lon_right));

            var __lon_left = map.containerPointToLatLng(L.point(ww, rr.y));

            __lon_left = __lon_left.lng;
            ll = map.latLngToContainerPoint(L.latLng(lat_tick, __lon_left));
          }

          ctx.beginPath();
          ctx.moveTo(ll.x + 1, ll.y);
          ctx.lineTo(rr.x - 1, rr.y);
          ctx.stroke();

          if (self.options.showLabel && label) {
            var _yy = ll.y + txtHeight / 2 - 2;

            ctx.fillText(latstr, 0, _yy);
            ctx.fillText(latstr, ww - txtWidth, _yy);
          }
        }
      }

      ;

      if (latInterval > 0) {
        for (var i = latInterval; i <= _lat_t; i += latInterval) {
          if (i >= _lat_b) {
            __draw_lat_line(this, i);
          }
        }

        for (var i = 0; i >= _lat_b; i -= latInterval) {
          if (i <= _lat_t) {
            __draw_lat_line(this, i);
          }
        }
      }

      function __draw_lon_line(self, lon_tick) {
        lngstr = self.__format_lng(lon_tick);
        txtWidth = ctx.measureText(lngstr).width;
        var bb = map.latLngToContainerPoint(L.latLng(_lat_b, lon_tick));

        if (curvedLon) {
          if (typeof curvedLon == 'number') {
            _lat_delta = curvedLon;
          }

          ctx.beginPath();
          ctx.moveTo(bb.x, bb.y);
          var _prev_p = null;

          for (var j = _lat_b; j < _lat_t; j += _lat_delta) {
            var tt = map.latLngToContainerPoint(L.latLng(j, lon_tick));
            ctx.lineTo(tt.x, tt.y);

            if (self.options.showLabel && label && _prev_p != null) {
              if (_prev_p.y > 8 && tt.y <= 8) {
                ctx.fillText(lngstr, tt.x - txtWidth / 2, txtHeight);
              } else if (_prev_p.y >= hh && tt.y < hh) {
                ctx.fillText(lngstr, tt.x - txtWidth / 2, hh - 2);
              }
            }

            _prev_p = {
              x: tt.x,
              y: tt.y,
              lon: lon_tick,
              lat: j
            };
          }

          ctx.stroke();
        } else {
          var __lat_top = _lat_t;
          var tt = map.latLngToContainerPoint(L.latLng(__lat_top, lon_tick));

          if (curvedLat) {
            __lat_top = map.containerPointToLatLng(L.point(tt.x, 0));
            __lat_top = __lat_top.lat;

            if (__lat_top > 90) {
              __lat_top = 90;
            }

            tt = map.latLngToContainerPoint(L.latLng(__lat_top, lon_tick));

            var __lat_bottom = map.containerPointToLatLng(L.point(bb.x, hh));

            __lat_bottom = __lat_bottom.lat;

            if (__lat_bottom < -90) {
              __lat_bottom = -90;
            }

            bb = map.latLngToContainerPoint(L.latLng(__lat_bottom, lon_tick));
          }

          ctx.beginPath();
          ctx.moveTo(tt.x, tt.y + 1);
          ctx.lineTo(bb.x, bb.y - 1);
          ctx.stroke();

          if (self.options.showLabel && label) {
            ctx.fillText(lngstr, tt.x - txtWidth / 2, txtHeight + 1);
            ctx.fillText(lngstr, bb.x - txtWidth / 2, hh - 3);
          }
        }
      }

      ;

      if (lngInterval > 0) {
        for (var i = lngInterval; i <= _lon_r; i += lngInterval) {
          if (i >= _lon_l) {
            __draw_lon_line(this, i);
          }
        }

        for (var i = 0; i >= _lon_l; i -= lngInterval) {
          if (i <= _lon_r) {
            __draw_lon_line(this, i);
          }
        }
      }
    }
  }
});

L.latlngGraticule = function (options) {
  return new L.LatLngGraticule(options);
};

/***/ }),

/***/ 7984:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1667);
/* harmony import */ var _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _images_layers_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7515);
/* harmony import */ var _images_layers_2x_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6788);
/* harmony import */ var _images_marker_icon_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(2599);
// Imports






var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_layers_png__WEBPACK_IMPORTED_MODULE_3__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_layers_2x_png__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_marker_icon_png__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/* required styles */\r\n\r\n.leaflet-pane,\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-tile-container,\r\n.leaflet-pane > svg,\r\n.leaflet-pane > canvas,\r\n.leaflet-zoom-box,\r\n.leaflet-image-layer,\r\n.leaflet-layer {\r\n\tposition: absolute;\r\n\tleft: 0;\r\n\ttop: 0;\r\n\t}\r\n.leaflet-container {\r\n\toverflow: hidden;\r\n\t}\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\t-webkit-user-select: none;\r\n\t   -moz-user-select: none;\r\n\t        user-select: none;\r\n\t  -webkit-user-drag: none;\r\n\t}\r\n/* Prevents IE11 from highlighting tiles in blue */\r\n.leaflet-tile::selection {\r\n\tbackground: transparent;\r\n}\r\n/* Safari renders non-retina tile on retina better with this, but Chrome is worse */\r\n.leaflet-safari .leaflet-tile {\r\n\timage-rendering: -webkit-optimize-contrast;\r\n\t}\r\n/* hack that prevents hw layers \"stretching\" when loading new tiles */\r\n.leaflet-safari .leaflet-tile-container {\r\n\twidth: 1600px;\r\n\theight: 1600px;\r\n\t-webkit-transform-origin: 0 0;\r\n\t}\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\tdisplay: block;\r\n\t}\r\n/* .leaflet-container svg: reset svg max-width decleration shipped in Joomla! (joomla.org) 3.x */\r\n/* .leaflet-container img: map is broken in FF if you have max-width: 100% on tiles */\r\n.leaflet-container .leaflet-overlay-pane svg,\r\n.leaflet-container .leaflet-marker-pane img,\r\n.leaflet-container .leaflet-shadow-pane img,\r\n.leaflet-container .leaflet-tile-pane img,\r\n.leaflet-container img.leaflet-image-layer,\r\n.leaflet-container .leaflet-tile {\r\n\tmax-width: none !important;\r\n\tmax-height: none !important;\r\n\t}\r\n\r\n.leaflet-container.leaflet-touch-zoom {\r\n\t-ms-touch-action: pan-x pan-y;\r\n\ttouch-action: pan-x pan-y;\r\n\t}\r\n.leaflet-container.leaflet-touch-drag {\r\n\t-ms-touch-action: pinch-zoom;\r\n\t/* Fallback for FF which doesn't support pinch-zoom */\r\n\ttouch-action: none;\r\n\ttouch-action: pinch-zoom;\r\n}\r\n.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {\r\n\t-ms-touch-action: none;\r\n\ttouch-action: none;\r\n}\r\n.leaflet-container {\r\n\t-webkit-tap-highlight-color: transparent;\r\n}\r\n.leaflet-container a {\r\n\t-webkit-tap-highlight-color: rgba(51, 181, 229, 0.4);\r\n}\r\n.leaflet-tile {\r\n\tfilter: inherit;\r\n\tvisibility: hidden;\r\n\t}\r\n.leaflet-tile-loaded {\r\n\tvisibility: inherit;\r\n\t}\r\n.leaflet-zoom-box {\r\n\twidth: 0;\r\n\theight: 0;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\tz-index: 800;\r\n\t}\r\n/* workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=888319 */\r\n.leaflet-overlay-pane svg {\r\n\t-moz-user-select: none;\r\n\t}\r\n\r\n.leaflet-pane         { z-index: 400; }\r\n\r\n.leaflet-tile-pane    { z-index: 200; }\r\n.leaflet-overlay-pane { z-index: 400; }\r\n.leaflet-shadow-pane  { z-index: 500; }\r\n.leaflet-marker-pane  { z-index: 600; }\r\n.leaflet-tooltip-pane   { z-index: 650; }\r\n.leaflet-popup-pane   { z-index: 700; }\r\n\r\n.leaflet-map-pane canvas { z-index: 100; }\r\n.leaflet-map-pane svg    { z-index: 200; }\r\n\r\n.leaflet-vml-shape {\r\n\twidth: 1px;\r\n\theight: 1px;\r\n\t}\r\n.lvml {\r\n\tbehavior: url(#default#VML);\r\n\tdisplay: inline-block;\r\n\tposition: absolute;\r\n\t}\r\n\r\n\r\n/* control positioning */\r\n\r\n.leaflet-control {\r\n\tposition: relative;\r\n\tz-index: 800;\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-top,\r\n.leaflet-bottom {\r\n\tposition: absolute;\r\n\tz-index: 1000;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-top {\r\n\ttop: 0;\r\n\t}\r\n.leaflet-right {\r\n\tright: 0;\r\n\t}\r\n.leaflet-bottom {\r\n\tbottom: 0;\r\n\t}\r\n.leaflet-left {\r\n\tleft: 0;\r\n\t}\r\n.leaflet-control {\r\n\tfloat: left;\r\n\tclear: both;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tfloat: right;\r\n\t}\r\n.leaflet-top .leaflet-control {\r\n\tmargin-top: 10px;\r\n\t}\r\n.leaflet-bottom .leaflet-control {\r\n\tmargin-bottom: 10px;\r\n\t}\r\n.leaflet-left .leaflet-control {\r\n\tmargin-left: 10px;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tmargin-right: 10px;\r\n\t}\r\n\r\n\r\n/* zoom and fade animations */\r\n\r\n.leaflet-fade-anim .leaflet-tile {\r\n\twill-change: opacity;\r\n\t}\r\n.leaflet-fade-anim .leaflet-popup {\r\n\topacity: 0;\r\n\t-webkit-transition: opacity 0.2s linear;\r\n\t   -moz-transition: opacity 0.2s linear;\r\n\t        transition: opacity 0.2s linear;\r\n\t}\r\n.leaflet-fade-anim .leaflet-map-pane .leaflet-popup {\r\n\topacity: 1;\r\n\t}\r\n.leaflet-zoom-animated {\r\n\t-webkit-transform-origin: 0 0;\r\n\t    -ms-transform-origin: 0 0;\r\n\t        transform-origin: 0 0;\r\n\t}\r\n.leaflet-zoom-anim .leaflet-zoom-animated {\r\n\twill-change: transform;\r\n\t}\r\n.leaflet-zoom-anim .leaflet-zoom-animated {\r\n\t-webkit-transition: -webkit-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t   -moz-transition:    -moz-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t        transition:         transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t}\r\n.leaflet-zoom-anim .leaflet-tile,\r\n.leaflet-pan-anim .leaflet-tile {\r\n\t-webkit-transition: none;\r\n\t   -moz-transition: none;\r\n\t        transition: none;\r\n\t}\r\n\r\n.leaflet-zoom-anim .leaflet-zoom-hide {\r\n\tvisibility: hidden;\r\n\t}\r\n\r\n\r\n/* cursors */\r\n\r\n.leaflet-interactive {\r\n\tcursor: pointer;\r\n\t}\r\n.leaflet-grab {\r\n\tcursor: -webkit-grab;\r\n\tcursor:    -moz-grab;\r\n\tcursor:         grab;\r\n\t}\r\n.leaflet-crosshair,\r\n.leaflet-crosshair .leaflet-interactive {\r\n\tcursor: crosshair;\r\n\t}\r\n.leaflet-popup-pane,\r\n.leaflet-control {\r\n\tcursor: auto;\r\n\t}\r\n.leaflet-dragging .leaflet-grab,\r\n.leaflet-dragging .leaflet-grab .leaflet-interactive,\r\n.leaflet-dragging .leaflet-marker-draggable {\r\n\tcursor: move;\r\n\tcursor: -webkit-grabbing;\r\n\tcursor:    -moz-grabbing;\r\n\tcursor:         grabbing;\r\n\t}\r\n\r\n/* marker & overlays interactivity */\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-image-layer,\r\n.leaflet-pane > svg path,\r\n.leaflet-tile-container {\r\n\tpointer-events: none;\r\n\t}\r\n\r\n.leaflet-marker-icon.leaflet-interactive,\r\n.leaflet-image-layer.leaflet-interactive,\r\n.leaflet-pane > svg path.leaflet-interactive,\r\nsvg.leaflet-image-layer.leaflet-interactive path {\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n\r\n/* visual tweaks */\r\n\r\n.leaflet-container {\r\n\tbackground: #ddd;\r\n\toutline: 0;\r\n\t}\r\n.leaflet-container a {\r\n\tcolor: #0078A8;\r\n\t}\r\n.leaflet-container a.leaflet-active {\r\n\toutline: 2px solid orange;\r\n\t}\r\n.leaflet-zoom-box {\r\n\tborder: 2px dotted #38f;\r\n\tbackground: rgba(255,255,255,0.5);\r\n\t}\r\n\r\n\r\n/* general typography */\r\n.leaflet-container {\r\n\tfont: 12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif;\r\n\t}\r\n\r\n\r\n/* general toolbar styles */\r\n\r\n.leaflet-bar {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.65);\r\n\tborder-radius: 4px;\r\n\t}\r\n.leaflet-bar a,\r\n.leaflet-bar a:hover {\r\n\tbackground-color: #fff;\r\n\tborder-bottom: 1px solid #ccc;\r\n\twidth: 26px;\r\n\theight: 26px;\r\n\tline-height: 26px;\r\n\tdisplay: block;\r\n\ttext-align: center;\r\n\ttext-decoration: none;\r\n\tcolor: black;\r\n\t}\r\n.leaflet-bar a,\r\n.leaflet-control-layers-toggle {\r\n\tbackground-position: 50% 50%;\r\n\tbackground-repeat: no-repeat;\r\n\tdisplay: block;\r\n\t}\r\n.leaflet-bar a:hover {\r\n\tbackground-color: #f4f4f4;\r\n\t}\r\n.leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 4px;\r\n\tborder-top-right-radius: 4px;\r\n\t}\r\n.leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 4px;\r\n\tborder-bottom-right-radius: 4px;\r\n\tborder-bottom: none;\r\n\t}\r\n.leaflet-bar a.leaflet-disabled {\r\n\tcursor: default;\r\n\tbackground-color: #f4f4f4;\r\n\tcolor: #bbb;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-bar a {\r\n\twidth: 30px;\r\n\theight: 30px;\r\n\tline-height: 30px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 2px;\r\n\tborder-top-right-radius: 2px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 2px;\r\n\tborder-bottom-right-radius: 2px;\r\n\t}\r\n\r\n/* zoom control */\r\n\r\n.leaflet-control-zoom-in,\r\n.leaflet-control-zoom-out {\r\n\tfont: bold 18px 'Lucida Console', Monaco, monospace;\r\n\ttext-indent: 1px;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {\r\n\tfont-size: 22px;\r\n\t}\r\n\r\n\r\n/* layers control */\r\n\r\n.leaflet-control-layers {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.4);\r\n\tbackground: #fff;\r\n\tborder-radius: 5px;\r\n\t}\r\n.leaflet-control-layers-toggle {\r\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\r\n\twidth: 36px;\r\n\theight: 36px;\r\n\t}\r\n.leaflet-retina .leaflet-control-layers-toggle {\r\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\r\n\tbackground-size: 26px 26px;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers-toggle {\r\n\twidth: 44px;\r\n\theight: 44px;\r\n\t}\r\n.leaflet-control-layers .leaflet-control-layers-list,\r\n.leaflet-control-layers-expanded .leaflet-control-layers-toggle {\r\n\tdisplay: none;\r\n\t}\r\n.leaflet-control-layers-expanded .leaflet-control-layers-list {\r\n\tdisplay: block;\r\n\tposition: relative;\r\n\t}\r\n.leaflet-control-layers-expanded {\r\n\tpadding: 6px 10px 6px 6px;\r\n\tcolor: #333;\r\n\tbackground: #fff;\r\n\t}\r\n.leaflet-control-layers-scrollbar {\r\n\toverflow-y: scroll;\r\n\toverflow-x: hidden;\r\n\tpadding-right: 5px;\r\n\t}\r\n.leaflet-control-layers-selector {\r\n\tmargin-top: 2px;\r\n\tposition: relative;\r\n\ttop: 1px;\r\n\t}\r\n.leaflet-control-layers label {\r\n\tdisplay: block;\r\n\t}\r\n.leaflet-control-layers-separator {\r\n\theight: 0;\r\n\tborder-top: 1px solid #ddd;\r\n\tmargin: 5px -10px 5px -6px;\r\n\t}\r\n\r\n/* Default icon URLs */\r\n.leaflet-default-icon-path {\r\n\tbackground-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\r\n\t}\r\n\r\n\r\n/* attribution and scale controls */\r\n\r\n.leaflet-container .leaflet-control-attribution {\r\n\tbackground: #fff;\r\n\tbackground: rgba(255, 255, 255, 0.7);\r\n\tmargin: 0;\r\n\t}\r\n.leaflet-control-attribution,\r\n.leaflet-control-scale-line {\r\n\tpadding: 0 5px;\r\n\tcolor: #333;\r\n\t}\r\n.leaflet-control-attribution a {\r\n\ttext-decoration: none;\r\n\t}\r\n.leaflet-control-attribution a:hover {\r\n\ttext-decoration: underline;\r\n\t}\r\n.leaflet-container .leaflet-control-attribution,\r\n.leaflet-container .leaflet-control-scale {\r\n\tfont-size: 11px;\r\n\t}\r\n.leaflet-left .leaflet-control-scale {\r\n\tmargin-left: 5px;\r\n\t}\r\n.leaflet-bottom .leaflet-control-scale {\r\n\tmargin-bottom: 5px;\r\n\t}\r\n.leaflet-control-scale-line {\r\n\tborder: 2px solid #777;\r\n\tborder-top: none;\r\n\tline-height: 1.1;\r\n\tpadding: 2px 5px 1px;\r\n\tfont-size: 11px;\r\n\twhite-space: nowrap;\r\n\toverflow: hidden;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\r\n\tbackground: #fff;\r\n\tbackground: rgba(255, 255, 255, 0.5);\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child) {\r\n\tborder-top: 2px solid #777;\r\n\tborder-bottom: none;\r\n\tmargin-top: -2px;\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child):not(:last-child) {\r\n\tborder-bottom: 2px solid #777;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-attribution,\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tbox-shadow: none;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tborder: 2px solid rgba(0,0,0,0.2);\r\n\tbackground-clip: padding-box;\r\n\t}\r\n\r\n\r\n/* popup */\r\n\r\n.leaflet-popup {\r\n\tposition: absolute;\r\n\ttext-align: center;\r\n\tmargin-bottom: 20px;\r\n\t}\r\n.leaflet-popup-content-wrapper {\r\n\tpadding: 1px;\r\n\ttext-align: left;\r\n\tborder-radius: 12px;\r\n\t}\r\n.leaflet-popup-content {\r\n\tmargin: 13px 19px;\r\n\tline-height: 1.4;\r\n\t}\r\n.leaflet-popup-content p {\r\n\tmargin: 18px 0;\r\n\t}\r\n.leaflet-popup-tip-container {\r\n\twidth: 40px;\r\n\theight: 20px;\r\n\tposition: absolute;\r\n\tleft: 50%;\r\n\tmargin-left: -20px;\r\n\toverflow: hidden;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-popup-tip {\r\n\twidth: 17px;\r\n\theight: 17px;\r\n\tpadding: 1px;\r\n\r\n\tmargin: -10px auto 0;\r\n\r\n\t-webkit-transform: rotate(45deg);\r\n\t   -moz-transform: rotate(45deg);\r\n\t    -ms-transform: rotate(45deg);\r\n\t        transform: rotate(45deg);\r\n\t}\r\n.leaflet-popup-content-wrapper,\r\n.leaflet-popup-tip {\r\n\tbackground: white;\r\n\tcolor: #333;\r\n\tbox-shadow: 0 3px 14px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button {\r\n\tposition: absolute;\r\n\ttop: 0;\r\n\tright: 0;\r\n\tpadding: 4px 4px 0 0;\r\n\tborder: none;\r\n\ttext-align: center;\r\n\twidth: 18px;\r\n\theight: 14px;\r\n\tfont: 16px/14px Tahoma, Verdana, sans-serif;\r\n\tcolor: #c3c3c3;\r\n\ttext-decoration: none;\r\n\tfont-weight: bold;\r\n\tbackground: transparent;\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button:hover {\r\n\tcolor: #999;\r\n\t}\r\n.leaflet-popup-scrolled {\r\n\toverflow: auto;\r\n\tborder-bottom: 1px solid #ddd;\r\n\tborder-top: 1px solid #ddd;\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-popup-content-wrapper {\r\n\t-ms-zoom: 1;\r\n\t}\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\twidth: 24px;\r\n\tmargin: 0 auto;\r\n\r\n\t-ms-filter: \"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)\";\r\n\tfilter: progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678);\r\n\t}\r\n.leaflet-oldie .leaflet-popup-tip-container {\r\n\tmargin-top: -1px;\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-control-zoom,\r\n.leaflet-oldie .leaflet-control-layers,\r\n.leaflet-oldie .leaflet-popup-content-wrapper,\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\tborder: 1px solid #999;\r\n\t}\r\n\r\n\r\n/* div icon */\r\n\r\n.leaflet-div-icon {\r\n\tbackground: #fff;\r\n\tborder: 1px solid #666;\r\n\t}\r\n\r\n\r\n/* Tooltip */\r\n/* Base styles for the element that has a tooltip */\r\n.leaflet-tooltip {\r\n\tposition: absolute;\r\n\tpadding: 6px;\r\n\tbackground-color: #fff;\r\n\tborder: 1px solid #fff;\r\n\tborder-radius: 3px;\r\n\tcolor: #222;\r\n\twhite-space: nowrap;\r\n\t-webkit-user-select: none;\r\n\t-moz-user-select: none;\r\n\t-ms-user-select: none;\r\n\tuser-select: none;\r\n\tpointer-events: none;\r\n\tbox-shadow: 0 1px 3px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-tooltip.leaflet-clickable {\r\n\tcursor: pointer;\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-tooltip-top:before,\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\tposition: absolute;\r\n\tpointer-events: none;\r\n\tborder: 6px solid transparent;\r\n\tbackground: transparent;\r\n\tcontent: \"\";\r\n\t}\r\n\r\n/* Directions */\r\n\r\n.leaflet-tooltip-bottom {\r\n\tmargin-top: 6px;\r\n}\r\n.leaflet-tooltip-top {\r\n\tmargin-top: -6px;\r\n}\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-top:before {\r\n\tleft: 50%;\r\n\tmargin-left: -6px;\r\n\t}\r\n.leaflet-tooltip-top:before {\r\n\tbottom: 0;\r\n\tmargin-bottom: -12px;\r\n\tborder-top-color: #fff;\r\n\t}\r\n.leaflet-tooltip-bottom:before {\r\n\ttop: 0;\r\n\tmargin-top: -12px;\r\n\tmargin-left: -6px;\r\n\tborder-bottom-color: #fff;\r\n\t}\r\n.leaflet-tooltip-left {\r\n\tmargin-left: -6px;\r\n}\r\n.leaflet-tooltip-right {\r\n\tmargin-left: 6px;\r\n}\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\ttop: 50%;\r\n\tmargin-top: -6px;\r\n\t}\r\n.leaflet-tooltip-left:before {\r\n\tright: 0;\r\n\tmargin-right: -12px;\r\n\tborder-left-color: #fff;\r\n\t}\r\n.leaflet-tooltip-right:before {\r\n\tleft: 0;\r\n\tmargin-left: -12px;\r\n\tborder-right-color: #fff;\r\n\t}\r\n", "",{"version":3,"sources":["webpack://./node_modules/leaflet/dist/leaflet.css"],"names":[],"mappings":"AAAA,oBAAoB;;AAEpB;;;;;;;;;;CAUC,kBAAkB;CAClB,OAAO;CACP,MAAM;CACN;AACD;CACC,gBAAgB;CAChB;AACD;;;CAGC,yBAAyB;IACtB,sBAAsB;SACjB,iBAAiB;GACvB,uBAAuB;CACzB;AACD,kDAAkD;AAClD;CACC,uBAAuB;AACxB;AACA,mFAAmF;AACnF;CACC,0CAA0C;CAC1C;AACD,qEAAqE;AACrE;CACC,aAAa;CACb,cAAc;CACd,6BAA6B;CAC7B;AACD;;CAEC,cAAc;CACd;AACD,gGAAgG;AAChG,qFAAqF;AACrF;;;;;;CAMC,0BAA0B;CAC1B,2BAA2B;CAC3B;;AAED;CACC,6BAA6B;CAC7B,yBAAyB;CACzB;AACD;CACC,4BAA4B;CAC5B,qDAAqD;CACrD,kBAAkB;CAClB,wBAAwB;AACzB;AACA;CACC,sBAAsB;CACtB,kBAAkB;AACnB;AACA;CACC,wCAAwC;AACzC;AACA;CACC,oDAAoD;AACrD;AACA;CACC,eAAe;CACf,kBAAkB;CAClB;AACD;CACC,mBAAmB;CACnB;AACD;CACC,QAAQ;CACR,SAAS;CACT,2BAA2B;MACtB,sBAAsB;CAC3B,YAAY;CACZ;AACD,uEAAuE;AACvE;CACC,sBAAsB;CACtB;;AAED,wBAAwB,YAAY,EAAE;;AAEtC,wBAAwB,YAAY,EAAE;AACtC,wBAAwB,YAAY,EAAE;AACtC,wBAAwB,YAAY,EAAE;AACtC,wBAAwB,YAAY,EAAE;AACtC,0BAA0B,YAAY,EAAE;AACxC,wBAAwB,YAAY,EAAE;;AAEtC,2BAA2B,YAAY,EAAE;AACzC,2BAA2B,YAAY,EAAE;;AAEzC;CACC,UAAU;CACV,WAAW;CACX;AACD;CACC,2BAA2B;CAC3B,qBAAqB;CACrB,kBAAkB;CAClB;;;AAGD,wBAAwB;;AAExB;CACC,kBAAkB;CAClB,YAAY;CACZ,8BAA8B,EAAE,8BAA8B;CAC9D,oBAAoB;CACpB;AACD;;CAEC,kBAAkB;CAClB,aAAa;CACb,oBAAoB;CACpB;AACD;CACC,MAAM;CACN;AACD;CACC,QAAQ;CACR;AACD;CACC,SAAS;CACT;AACD;CACC,OAAO;CACP;AACD;CACC,WAAW;CACX,WAAW;CACX;AACD;CACC,YAAY;CACZ;AACD;CACC,gBAAgB;CAChB;AACD;CACC,mBAAmB;CACnB;AACD;CACC,iBAAiB;CACjB;AACD;CACC,kBAAkB;CAClB;;;AAGD,6BAA6B;;AAE7B;CACC,oBAAoB;CACpB;AACD;CACC,UAAU;CACV,uCAAuC;IACpC,oCAAoC;SAC/B,+BAA+B;CACvC;AACD;CACC,UAAU;CACV;AACD;CACC,6BAA6B;KACzB,yBAAyB;SACrB,qBAAqB;CAC7B;AACD;CACC,sBAAsB;CACtB;AACD;CACC,oEAAoE;IACjE,iEAAiE;SAC5D,4DAA4D;CACpE;AACD;;CAEC,wBAAwB;IACrB,qBAAqB;SAChB,gBAAgB;CACxB;;AAED;CACC,kBAAkB;CAClB;;;AAGD,YAAY;;AAEZ;CACC,eAAe;CACf;AACD;CACC,oBAAoB;CACpB,oBAAoB;CACpB,oBAAoB;CACpB;AACD;;CAEC,iBAAiB;CACjB;AACD;;CAEC,YAAY;CACZ;AACD;;;CAGC,YAAY;CACZ,wBAAwB;CACxB,wBAAwB;CACxB,wBAAwB;CACxB;;AAED,oCAAoC;AACpC;;;;;CAKC,oBAAoB;CACpB;;AAED;;;;CAIC,8BAA8B,EAAE,8BAA8B;CAC9D,oBAAoB;CACpB;;AAED,kBAAkB;;AAElB;CACC,gBAAgB;CAChB,UAAU;CACV;AACD;CACC,cAAc;CACd;AACD;CACC,yBAAyB;CACzB;AACD;CACC,uBAAuB;CACvB,iCAAiC;CACjC;;;AAGD,uBAAuB;AACvB;CACC,6DAA6D;CAC7D;;;AAGD,2BAA2B;;AAE3B;CACC,sCAAsC;CACtC,kBAAkB;CAClB;AACD;;CAEC,sBAAsB;CACtB,6BAA6B;CAC7B,WAAW;CACX,YAAY;CACZ,iBAAiB;CACjB,cAAc;CACd,kBAAkB;CAClB,qBAAqB;CACrB,YAAY;CACZ;AACD;;CAEC,4BAA4B;CAC5B,4BAA4B;CAC5B,cAAc;CACd;AACD;CACC,yBAAyB;CACzB;AACD;CACC,2BAA2B;CAC3B,4BAA4B;CAC5B;AACD;CACC,8BAA8B;CAC9B,+BAA+B;CAC/B,mBAAmB;CACnB;AACD;CACC,eAAe;CACf,yBAAyB;CACzB,WAAW;CACX;;AAED;CACC,WAAW;CACX,YAAY;CACZ,iBAAiB;CACjB;AACD;CACC,2BAA2B;CAC3B,4BAA4B;CAC5B;AACD;CACC,8BAA8B;CAC9B,+BAA+B;CAC/B;;AAED,iBAAiB;;AAEjB;;CAEC,mDAAmD;CACnD,gBAAgB;CAChB;;AAED;CACC,eAAe;CACf;;;AAGD,mBAAmB;;AAEnB;CACC,qCAAqC;CACrC,gBAAgB;CAChB,kBAAkB;CAClB;AACD;CACC,yDAAwC;CACxC,WAAW;CACX,YAAY;CACZ;AACD;CACC,yDAA2C;CAC3C,0BAA0B;CAC1B;AACD;CACC,WAAW;CACX,YAAY;CACZ;AACD;;CAEC,aAAa;CACb;AACD;CACC,cAAc;CACd,kBAAkB;CAClB;AACD;CACC,yBAAyB;CACzB,WAAW;CACX,gBAAgB;CAChB;AACD;CACC,kBAAkB;CAClB,kBAAkB;CAClB,kBAAkB;CAClB;AACD;CACC,eAAe;CACf,kBAAkB;CAClB,QAAQ;CACR;AACD;CACC,cAAc;CACd;AACD;CACC,SAAS;CACT,0BAA0B;CAC1B,0BAA0B;CAC1B;;AAED,sBAAsB;AACtB;CACC,yDAA6C;CAC7C;;;AAGD,mCAAmC;;AAEnC;CACC,gBAAgB;CAChB,oCAAoC;CACpC,SAAS;CACT;AACD;;CAEC,cAAc;CACd,WAAW;CACX;AACD;CACC,qBAAqB;CACrB;AACD;CACC,0BAA0B;CAC1B;AACD;;CAEC,eAAe;CACf;AACD;CACC,gBAAgB;CAChB;AACD;CACC,kBAAkB;CAClB;AACD;CACC,sBAAsB;CACtB,gBAAgB;CAChB,gBAAgB;CAChB,oBAAoB;CACpB,eAAe;CACf,mBAAmB;CACnB,gBAAgB;CAChB,2BAA2B;MACtB,sBAAsB;;CAE3B,gBAAgB;CAChB,oCAAoC;CACpC;AACD;CACC,0BAA0B;CAC1B,mBAAmB;CACnB,gBAAgB;CAChB;AACD;CACC,6BAA6B;CAC7B;;AAED;;;CAGC,gBAAgB;CAChB;AACD;;CAEC,iCAAiC;CACjC,4BAA4B;CAC5B;;;AAGD,UAAU;;AAEV;CACC,kBAAkB;CAClB,kBAAkB;CAClB,mBAAmB;CACnB;AACD;CACC,YAAY;CACZ,gBAAgB;CAChB,mBAAmB;CACnB;AACD;CACC,iBAAiB;CACjB,gBAAgB;CAChB;AACD;CACC,cAAc;CACd;AACD;CACC,WAAW;CACX,YAAY;CACZ,kBAAkB;CAClB,SAAS;CACT,kBAAkB;CAClB,gBAAgB;CAChB,oBAAoB;CACpB;AACD;CACC,WAAW;CACX,YAAY;CACZ,YAAY;;CAEZ,oBAAoB;;CAEpB,gCAAgC;IAC7B,6BAA6B;KAC5B,4BAA4B;SACxB,wBAAwB;CAChC;AACD;;CAEC,iBAAiB;CACjB,WAAW;CACX,sCAAsC;CACtC;AACD;CACC,kBAAkB;CAClB,MAAM;CACN,QAAQ;CACR,oBAAoB;CACpB,YAAY;CACZ,kBAAkB;CAClB,WAAW;CACX,YAAY;CACZ,2CAA2C;CAC3C,cAAc;CACd,qBAAqB;CACrB,iBAAiB;CACjB,uBAAuB;CACvB;AACD;CACC,WAAW;CACX;AACD;CACC,cAAc;CACd,6BAA6B;CAC7B,0BAA0B;CAC1B;;AAED;CACC,WAAW;CACX;AACD;CACC,WAAW;CACX,cAAc;;CAEd,uHAAuH;CACvH,iHAAiH;CACjH;AACD;CACC,gBAAgB;CAChB;;AAED;;;;CAIC,sBAAsB;CACtB;;;AAGD,aAAa;;AAEb;CACC,gBAAgB;CAChB,sBAAsB;CACtB;;;AAGD,YAAY;AACZ,mDAAmD;AACnD;CACC,kBAAkB;CAClB,YAAY;CACZ,sBAAsB;CACtB,sBAAsB;CACtB,kBAAkB;CAClB,WAAW;CACX,mBAAmB;CACnB,yBAAyB;CACzB,sBAAsB;CACtB,qBAAqB;CACrB,iBAAiB;CACjB,oBAAoB;CACpB,qCAAqC;CACrC;AACD;CACC,eAAe;CACf,oBAAoB;CACpB;AACD;;;;CAIC,kBAAkB;CAClB,oBAAoB;CACpB,6BAA6B;CAC7B,uBAAuB;CACvB,WAAW;CACX;;AAED,eAAe;;AAEf;CACC,eAAe;AAChB;AACA;CACC,gBAAgB;AACjB;AACA;;CAEC,SAAS;CACT,iBAAiB;CACjB;AACD;CACC,SAAS;CACT,oBAAoB;CACpB,sBAAsB;CACtB;AACD;CACC,MAAM;CACN,iBAAiB;CACjB,iBAAiB;CACjB,yBAAyB;CACzB;AACD;CACC,iBAAiB;AAClB;AACA;CACC,gBAAgB;AACjB;AACA;;CAEC,QAAQ;CACR,gBAAgB;CAChB;AACD;CACC,QAAQ;CACR,mBAAmB;CACnB,uBAAuB;CACvB;AACD;CACC,OAAO;CACP,kBAAkB;CAClB,wBAAwB;CACxB","sourcesContent":["/* required styles */\r\n\r\n.leaflet-pane,\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-tile-container,\r\n.leaflet-pane > svg,\r\n.leaflet-pane > canvas,\r\n.leaflet-zoom-box,\r\n.leaflet-image-layer,\r\n.leaflet-layer {\r\n\tposition: absolute;\r\n\tleft: 0;\r\n\ttop: 0;\r\n\t}\r\n.leaflet-container {\r\n\toverflow: hidden;\r\n\t}\r\n.leaflet-tile,\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\t-webkit-user-select: none;\r\n\t   -moz-user-select: none;\r\n\t        user-select: none;\r\n\t  -webkit-user-drag: none;\r\n\t}\r\n/* Prevents IE11 from highlighting tiles in blue */\r\n.leaflet-tile::selection {\r\n\tbackground: transparent;\r\n}\r\n/* Safari renders non-retina tile on retina better with this, but Chrome is worse */\r\n.leaflet-safari .leaflet-tile {\r\n\timage-rendering: -webkit-optimize-contrast;\r\n\t}\r\n/* hack that prevents hw layers \"stretching\" when loading new tiles */\r\n.leaflet-safari .leaflet-tile-container {\r\n\twidth: 1600px;\r\n\theight: 1600px;\r\n\t-webkit-transform-origin: 0 0;\r\n\t}\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow {\r\n\tdisplay: block;\r\n\t}\r\n/* .leaflet-container svg: reset svg max-width decleration shipped in Joomla! (joomla.org) 3.x */\r\n/* .leaflet-container img: map is broken in FF if you have max-width: 100% on tiles */\r\n.leaflet-container .leaflet-overlay-pane svg,\r\n.leaflet-container .leaflet-marker-pane img,\r\n.leaflet-container .leaflet-shadow-pane img,\r\n.leaflet-container .leaflet-tile-pane img,\r\n.leaflet-container img.leaflet-image-layer,\r\n.leaflet-container .leaflet-tile {\r\n\tmax-width: none !important;\r\n\tmax-height: none !important;\r\n\t}\r\n\r\n.leaflet-container.leaflet-touch-zoom {\r\n\t-ms-touch-action: pan-x pan-y;\r\n\ttouch-action: pan-x pan-y;\r\n\t}\r\n.leaflet-container.leaflet-touch-drag {\r\n\t-ms-touch-action: pinch-zoom;\r\n\t/* Fallback for FF which doesn't support pinch-zoom */\r\n\ttouch-action: none;\r\n\ttouch-action: pinch-zoom;\r\n}\r\n.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {\r\n\t-ms-touch-action: none;\r\n\ttouch-action: none;\r\n}\r\n.leaflet-container {\r\n\t-webkit-tap-highlight-color: transparent;\r\n}\r\n.leaflet-container a {\r\n\t-webkit-tap-highlight-color: rgba(51, 181, 229, 0.4);\r\n}\r\n.leaflet-tile {\r\n\tfilter: inherit;\r\n\tvisibility: hidden;\r\n\t}\r\n.leaflet-tile-loaded {\r\n\tvisibility: inherit;\r\n\t}\r\n.leaflet-zoom-box {\r\n\twidth: 0;\r\n\theight: 0;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\tz-index: 800;\r\n\t}\r\n/* workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=888319 */\r\n.leaflet-overlay-pane svg {\r\n\t-moz-user-select: none;\r\n\t}\r\n\r\n.leaflet-pane         { z-index: 400; }\r\n\r\n.leaflet-tile-pane    { z-index: 200; }\r\n.leaflet-overlay-pane { z-index: 400; }\r\n.leaflet-shadow-pane  { z-index: 500; }\r\n.leaflet-marker-pane  { z-index: 600; }\r\n.leaflet-tooltip-pane   { z-index: 650; }\r\n.leaflet-popup-pane   { z-index: 700; }\r\n\r\n.leaflet-map-pane canvas { z-index: 100; }\r\n.leaflet-map-pane svg    { z-index: 200; }\r\n\r\n.leaflet-vml-shape {\r\n\twidth: 1px;\r\n\theight: 1px;\r\n\t}\r\n.lvml {\r\n\tbehavior: url(#default#VML);\r\n\tdisplay: inline-block;\r\n\tposition: absolute;\r\n\t}\r\n\r\n\r\n/* control positioning */\r\n\r\n.leaflet-control {\r\n\tposition: relative;\r\n\tz-index: 800;\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-top,\r\n.leaflet-bottom {\r\n\tposition: absolute;\r\n\tz-index: 1000;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-top {\r\n\ttop: 0;\r\n\t}\r\n.leaflet-right {\r\n\tright: 0;\r\n\t}\r\n.leaflet-bottom {\r\n\tbottom: 0;\r\n\t}\r\n.leaflet-left {\r\n\tleft: 0;\r\n\t}\r\n.leaflet-control {\r\n\tfloat: left;\r\n\tclear: both;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tfloat: right;\r\n\t}\r\n.leaflet-top .leaflet-control {\r\n\tmargin-top: 10px;\r\n\t}\r\n.leaflet-bottom .leaflet-control {\r\n\tmargin-bottom: 10px;\r\n\t}\r\n.leaflet-left .leaflet-control {\r\n\tmargin-left: 10px;\r\n\t}\r\n.leaflet-right .leaflet-control {\r\n\tmargin-right: 10px;\r\n\t}\r\n\r\n\r\n/* zoom and fade animations */\r\n\r\n.leaflet-fade-anim .leaflet-tile {\r\n\twill-change: opacity;\r\n\t}\r\n.leaflet-fade-anim .leaflet-popup {\r\n\topacity: 0;\r\n\t-webkit-transition: opacity 0.2s linear;\r\n\t   -moz-transition: opacity 0.2s linear;\r\n\t        transition: opacity 0.2s linear;\r\n\t}\r\n.leaflet-fade-anim .leaflet-map-pane .leaflet-popup {\r\n\topacity: 1;\r\n\t}\r\n.leaflet-zoom-animated {\r\n\t-webkit-transform-origin: 0 0;\r\n\t    -ms-transform-origin: 0 0;\r\n\t        transform-origin: 0 0;\r\n\t}\r\n.leaflet-zoom-anim .leaflet-zoom-animated {\r\n\twill-change: transform;\r\n\t}\r\n.leaflet-zoom-anim .leaflet-zoom-animated {\r\n\t-webkit-transition: -webkit-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t   -moz-transition:    -moz-transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t        transition:         transform 0.25s cubic-bezier(0,0,0.25,1);\r\n\t}\r\n.leaflet-zoom-anim .leaflet-tile,\r\n.leaflet-pan-anim .leaflet-tile {\r\n\t-webkit-transition: none;\r\n\t   -moz-transition: none;\r\n\t        transition: none;\r\n\t}\r\n\r\n.leaflet-zoom-anim .leaflet-zoom-hide {\r\n\tvisibility: hidden;\r\n\t}\r\n\r\n\r\n/* cursors */\r\n\r\n.leaflet-interactive {\r\n\tcursor: pointer;\r\n\t}\r\n.leaflet-grab {\r\n\tcursor: -webkit-grab;\r\n\tcursor:    -moz-grab;\r\n\tcursor:         grab;\r\n\t}\r\n.leaflet-crosshair,\r\n.leaflet-crosshair .leaflet-interactive {\r\n\tcursor: crosshair;\r\n\t}\r\n.leaflet-popup-pane,\r\n.leaflet-control {\r\n\tcursor: auto;\r\n\t}\r\n.leaflet-dragging .leaflet-grab,\r\n.leaflet-dragging .leaflet-grab .leaflet-interactive,\r\n.leaflet-dragging .leaflet-marker-draggable {\r\n\tcursor: move;\r\n\tcursor: -webkit-grabbing;\r\n\tcursor:    -moz-grabbing;\r\n\tcursor:         grabbing;\r\n\t}\r\n\r\n/* marker & overlays interactivity */\r\n.leaflet-marker-icon,\r\n.leaflet-marker-shadow,\r\n.leaflet-image-layer,\r\n.leaflet-pane > svg path,\r\n.leaflet-tile-container {\r\n\tpointer-events: none;\r\n\t}\r\n\r\n.leaflet-marker-icon.leaflet-interactive,\r\n.leaflet-image-layer.leaflet-interactive,\r\n.leaflet-pane > svg path.leaflet-interactive,\r\nsvg.leaflet-image-layer.leaflet-interactive path {\r\n\tpointer-events: visiblePainted; /* IE 9-10 doesn't have auto */\r\n\tpointer-events: auto;\r\n\t}\r\n\r\n/* visual tweaks */\r\n\r\n.leaflet-container {\r\n\tbackground: #ddd;\r\n\toutline: 0;\r\n\t}\r\n.leaflet-container a {\r\n\tcolor: #0078A8;\r\n\t}\r\n.leaflet-container a.leaflet-active {\r\n\toutline: 2px solid orange;\r\n\t}\r\n.leaflet-zoom-box {\r\n\tborder: 2px dotted #38f;\r\n\tbackground: rgba(255,255,255,0.5);\r\n\t}\r\n\r\n\r\n/* general typography */\r\n.leaflet-container {\r\n\tfont: 12px/1.5 \"Helvetica Neue\", Arial, Helvetica, sans-serif;\r\n\t}\r\n\r\n\r\n/* general toolbar styles */\r\n\r\n.leaflet-bar {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.65);\r\n\tborder-radius: 4px;\r\n\t}\r\n.leaflet-bar a,\r\n.leaflet-bar a:hover {\r\n\tbackground-color: #fff;\r\n\tborder-bottom: 1px solid #ccc;\r\n\twidth: 26px;\r\n\theight: 26px;\r\n\tline-height: 26px;\r\n\tdisplay: block;\r\n\ttext-align: center;\r\n\ttext-decoration: none;\r\n\tcolor: black;\r\n\t}\r\n.leaflet-bar a,\r\n.leaflet-control-layers-toggle {\r\n\tbackground-position: 50% 50%;\r\n\tbackground-repeat: no-repeat;\r\n\tdisplay: block;\r\n\t}\r\n.leaflet-bar a:hover {\r\n\tbackground-color: #f4f4f4;\r\n\t}\r\n.leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 4px;\r\n\tborder-top-right-radius: 4px;\r\n\t}\r\n.leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 4px;\r\n\tborder-bottom-right-radius: 4px;\r\n\tborder-bottom: none;\r\n\t}\r\n.leaflet-bar a.leaflet-disabled {\r\n\tcursor: default;\r\n\tbackground-color: #f4f4f4;\r\n\tcolor: #bbb;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-bar a {\r\n\twidth: 30px;\r\n\theight: 30px;\r\n\tline-height: 30px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:first-child {\r\n\tborder-top-left-radius: 2px;\r\n\tborder-top-right-radius: 2px;\r\n\t}\r\n.leaflet-touch .leaflet-bar a:last-child {\r\n\tborder-bottom-left-radius: 2px;\r\n\tborder-bottom-right-radius: 2px;\r\n\t}\r\n\r\n/* zoom control */\r\n\r\n.leaflet-control-zoom-in,\r\n.leaflet-control-zoom-out {\r\n\tfont: bold 18px 'Lucida Console', Monaco, monospace;\r\n\ttext-indent: 1px;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-zoom-in, .leaflet-touch .leaflet-control-zoom-out  {\r\n\tfont-size: 22px;\r\n\t}\r\n\r\n\r\n/* layers control */\r\n\r\n.leaflet-control-layers {\r\n\tbox-shadow: 0 1px 5px rgba(0,0,0,0.4);\r\n\tbackground: #fff;\r\n\tborder-radius: 5px;\r\n\t}\r\n.leaflet-control-layers-toggle {\r\n\tbackground-image: url(images/layers.png);\r\n\twidth: 36px;\r\n\theight: 36px;\r\n\t}\r\n.leaflet-retina .leaflet-control-layers-toggle {\r\n\tbackground-image: url(images/layers-2x.png);\r\n\tbackground-size: 26px 26px;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers-toggle {\r\n\twidth: 44px;\r\n\theight: 44px;\r\n\t}\r\n.leaflet-control-layers .leaflet-control-layers-list,\r\n.leaflet-control-layers-expanded .leaflet-control-layers-toggle {\r\n\tdisplay: none;\r\n\t}\r\n.leaflet-control-layers-expanded .leaflet-control-layers-list {\r\n\tdisplay: block;\r\n\tposition: relative;\r\n\t}\r\n.leaflet-control-layers-expanded {\r\n\tpadding: 6px 10px 6px 6px;\r\n\tcolor: #333;\r\n\tbackground: #fff;\r\n\t}\r\n.leaflet-control-layers-scrollbar {\r\n\toverflow-y: scroll;\r\n\toverflow-x: hidden;\r\n\tpadding-right: 5px;\r\n\t}\r\n.leaflet-control-layers-selector {\r\n\tmargin-top: 2px;\r\n\tposition: relative;\r\n\ttop: 1px;\r\n\t}\r\n.leaflet-control-layers label {\r\n\tdisplay: block;\r\n\t}\r\n.leaflet-control-layers-separator {\r\n\theight: 0;\r\n\tborder-top: 1px solid #ddd;\r\n\tmargin: 5px -10px 5px -6px;\r\n\t}\r\n\r\n/* Default icon URLs */\r\n.leaflet-default-icon-path {\r\n\tbackground-image: url(images/marker-icon.png);\r\n\t}\r\n\r\n\r\n/* attribution and scale controls */\r\n\r\n.leaflet-container .leaflet-control-attribution {\r\n\tbackground: #fff;\r\n\tbackground: rgba(255, 255, 255, 0.7);\r\n\tmargin: 0;\r\n\t}\r\n.leaflet-control-attribution,\r\n.leaflet-control-scale-line {\r\n\tpadding: 0 5px;\r\n\tcolor: #333;\r\n\t}\r\n.leaflet-control-attribution a {\r\n\ttext-decoration: none;\r\n\t}\r\n.leaflet-control-attribution a:hover {\r\n\ttext-decoration: underline;\r\n\t}\r\n.leaflet-container .leaflet-control-attribution,\r\n.leaflet-container .leaflet-control-scale {\r\n\tfont-size: 11px;\r\n\t}\r\n.leaflet-left .leaflet-control-scale {\r\n\tmargin-left: 5px;\r\n\t}\r\n.leaflet-bottom .leaflet-control-scale {\r\n\tmargin-bottom: 5px;\r\n\t}\r\n.leaflet-control-scale-line {\r\n\tborder: 2px solid #777;\r\n\tborder-top: none;\r\n\tline-height: 1.1;\r\n\tpadding: 2px 5px 1px;\r\n\tfont-size: 11px;\r\n\twhite-space: nowrap;\r\n\toverflow: hidden;\r\n\t-moz-box-sizing: border-box;\r\n\t     box-sizing: border-box;\r\n\r\n\tbackground: #fff;\r\n\tbackground: rgba(255, 255, 255, 0.5);\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child) {\r\n\tborder-top: 2px solid #777;\r\n\tborder-bottom: none;\r\n\tmargin-top: -2px;\r\n\t}\r\n.leaflet-control-scale-line:not(:first-child):not(:last-child) {\r\n\tborder-bottom: 2px solid #777;\r\n\t}\r\n\r\n.leaflet-touch .leaflet-control-attribution,\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tbox-shadow: none;\r\n\t}\r\n.leaflet-touch .leaflet-control-layers,\r\n.leaflet-touch .leaflet-bar {\r\n\tborder: 2px solid rgba(0,0,0,0.2);\r\n\tbackground-clip: padding-box;\r\n\t}\r\n\r\n\r\n/* popup */\r\n\r\n.leaflet-popup {\r\n\tposition: absolute;\r\n\ttext-align: center;\r\n\tmargin-bottom: 20px;\r\n\t}\r\n.leaflet-popup-content-wrapper {\r\n\tpadding: 1px;\r\n\ttext-align: left;\r\n\tborder-radius: 12px;\r\n\t}\r\n.leaflet-popup-content {\r\n\tmargin: 13px 19px;\r\n\tline-height: 1.4;\r\n\t}\r\n.leaflet-popup-content p {\r\n\tmargin: 18px 0;\r\n\t}\r\n.leaflet-popup-tip-container {\r\n\twidth: 40px;\r\n\theight: 20px;\r\n\tposition: absolute;\r\n\tleft: 50%;\r\n\tmargin-left: -20px;\r\n\toverflow: hidden;\r\n\tpointer-events: none;\r\n\t}\r\n.leaflet-popup-tip {\r\n\twidth: 17px;\r\n\theight: 17px;\r\n\tpadding: 1px;\r\n\r\n\tmargin: -10px auto 0;\r\n\r\n\t-webkit-transform: rotate(45deg);\r\n\t   -moz-transform: rotate(45deg);\r\n\t    -ms-transform: rotate(45deg);\r\n\t        transform: rotate(45deg);\r\n\t}\r\n.leaflet-popup-content-wrapper,\r\n.leaflet-popup-tip {\r\n\tbackground: white;\r\n\tcolor: #333;\r\n\tbox-shadow: 0 3px 14px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button {\r\n\tposition: absolute;\r\n\ttop: 0;\r\n\tright: 0;\r\n\tpadding: 4px 4px 0 0;\r\n\tborder: none;\r\n\ttext-align: center;\r\n\twidth: 18px;\r\n\theight: 14px;\r\n\tfont: 16px/14px Tahoma, Verdana, sans-serif;\r\n\tcolor: #c3c3c3;\r\n\ttext-decoration: none;\r\n\tfont-weight: bold;\r\n\tbackground: transparent;\r\n\t}\r\n.leaflet-container a.leaflet-popup-close-button:hover {\r\n\tcolor: #999;\r\n\t}\r\n.leaflet-popup-scrolled {\r\n\toverflow: auto;\r\n\tborder-bottom: 1px solid #ddd;\r\n\tborder-top: 1px solid #ddd;\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-popup-content-wrapper {\r\n\t-ms-zoom: 1;\r\n\t}\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\twidth: 24px;\r\n\tmargin: 0 auto;\r\n\r\n\t-ms-filter: \"progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)\";\r\n\tfilter: progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678);\r\n\t}\r\n.leaflet-oldie .leaflet-popup-tip-container {\r\n\tmargin-top: -1px;\r\n\t}\r\n\r\n.leaflet-oldie .leaflet-control-zoom,\r\n.leaflet-oldie .leaflet-control-layers,\r\n.leaflet-oldie .leaflet-popup-content-wrapper,\r\n.leaflet-oldie .leaflet-popup-tip {\r\n\tborder: 1px solid #999;\r\n\t}\r\n\r\n\r\n/* div icon */\r\n\r\n.leaflet-div-icon {\r\n\tbackground: #fff;\r\n\tborder: 1px solid #666;\r\n\t}\r\n\r\n\r\n/* Tooltip */\r\n/* Base styles for the element that has a tooltip */\r\n.leaflet-tooltip {\r\n\tposition: absolute;\r\n\tpadding: 6px;\r\n\tbackground-color: #fff;\r\n\tborder: 1px solid #fff;\r\n\tborder-radius: 3px;\r\n\tcolor: #222;\r\n\twhite-space: nowrap;\r\n\t-webkit-user-select: none;\r\n\t-moz-user-select: none;\r\n\t-ms-user-select: none;\r\n\tuser-select: none;\r\n\tpointer-events: none;\r\n\tbox-shadow: 0 1px 3px rgba(0,0,0,0.4);\r\n\t}\r\n.leaflet-tooltip.leaflet-clickable {\r\n\tcursor: pointer;\r\n\tpointer-events: auto;\r\n\t}\r\n.leaflet-tooltip-top:before,\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\tposition: absolute;\r\n\tpointer-events: none;\r\n\tborder: 6px solid transparent;\r\n\tbackground: transparent;\r\n\tcontent: \"\";\r\n\t}\r\n\r\n/* Directions */\r\n\r\n.leaflet-tooltip-bottom {\r\n\tmargin-top: 6px;\r\n}\r\n.leaflet-tooltip-top {\r\n\tmargin-top: -6px;\r\n}\r\n.leaflet-tooltip-bottom:before,\r\n.leaflet-tooltip-top:before {\r\n\tleft: 50%;\r\n\tmargin-left: -6px;\r\n\t}\r\n.leaflet-tooltip-top:before {\r\n\tbottom: 0;\r\n\tmargin-bottom: -12px;\r\n\tborder-top-color: #fff;\r\n\t}\r\n.leaflet-tooltip-bottom:before {\r\n\ttop: 0;\r\n\tmargin-top: -12px;\r\n\tmargin-left: -6px;\r\n\tborder-bottom-color: #fff;\r\n\t}\r\n.leaflet-tooltip-left {\r\n\tmargin-left: -6px;\r\n}\r\n.leaflet-tooltip-right {\r\n\tmargin-left: 6px;\r\n}\r\n.leaflet-tooltip-left:before,\r\n.leaflet-tooltip-right:before {\r\n\ttop: 50%;\r\n\tmargin-top: -6px;\r\n\t}\r\n.leaflet-tooltip-left:before {\r\n\tright: 0;\r\n\tmargin-right: -12px;\r\n\tborder-left-color: #fff;\r\n\t}\r\n.leaflet-tooltip-right:before {\r\n\tleft: 0;\r\n\tmargin-left: -12px;\r\n\tborder-right-color: #fff;\r\n\t}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5405:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".basemaps {\n    padding: 4px;\n}\n.basemaps.closed .basemap {\n    display: none;\n}\n.basemaps.closed .basemap.alt {\n    display: inline-block;\n}\n.basemaps.closed .basemap.alt h4 {\n    display: none;\n}\n\n.basemap {\n    display: inline-block; /* todo: flexbox? */\n    cursor: pointer;\n}\n.basemap.active img {\n    border-color: orange;\n    box-shadow: 2px 2px 4px #000;\n}\n.basemap img {\n    width: 64px;\n    border: 2px solid #FFF;\n    margin: 0 2px;\n    border-radius: 40px;\n    box-shadow: 0 1px 5px rgba(0,0,0,0.65)\n}", "",{"version":3,"sources":["webpack://./src/map/plugins/leaflet-basemaps.css"],"names":[],"mappings":"AAAA;IACI,YAAY;AAChB;AACA;IACI,aAAa;AACjB;AACA;IACI,qBAAqB;AACzB;AACA;IACI,aAAa;AACjB;;AAEA;IACI,qBAAqB,EAAE,mBAAmB;IAC1C,eAAe;AACnB;AACA;IACI,oBAAoB;IACpB,4BAA4B;AAChC;AACA;IACI,WAAW;IACX,sBAAsB;IACtB,aAAa;IACb,mBAAmB;IACnB;AACJ","sourcesContent":[".basemaps {\n    padding: 4px;\n}\n.basemaps.closed .basemap {\n    display: none;\n}\n.basemaps.closed .basemap.alt {\n    display: inline-block;\n}\n.basemaps.closed .basemap.alt h4 {\n    display: none;\n}\n\n.basemap {\n    display: inline-block; /* todo: flexbox? */\n    cursor: pointer;\n}\n.basemap.active img {\n    border-color: orange;\n    box-shadow: 2px 2px 4px #000;\n}\n.basemap img {\n    width: 64px;\n    border: 2px solid #FFF;\n    margin: 0 2px;\n    border-radius: 40px;\n    box-shadow: 0 1px 5px rgba(0,0,0,0.65)\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5706:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1667);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _images_loader_gif__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(9419);
/* harmony import */ var _images_search_icon_png__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(9297);
// Imports





var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_loader_gif__WEBPACK_IMPORTED_MODULE_3__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_search_icon_png__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, " \n.leaflet-container .leaflet-control-search {\n\tposition:relative;\n\tfloat:left;\n\tbackground:#fff;\n\tcolor:#1978cf;\n\tborder: 2px solid rgba(0,0,0,0.2);\n\tbackground-clip: padding-box;\n\t-moz-border-radius: 4px;\n\t-webkit-border-radius: 4px;\n\tborder-radius: 4px;\n\tbackground-color: rgba(255, 255, 255, 0.8);\n\tz-index:1000;\t\n\tmargin-left: 10px;\n\tmargin-top: 10px;\n}\n.leaflet-control-search.search-exp {/*expanded*/\n\tbackground: #fff;\n\tborder: 2px solid rgba(0,0,0,0.2);\n\tbackground-clip: padding-box;\t\n}\n.leaflet-control-search .search-input {\n\tdisplay:block;\n\tfloat:left;\n\tbackground: #fff;\n\tborder:1px solid #666;\n\tborder-radius:2px;\n\theight:22px;\n\tpadding:0 20px 0 2px;\n\tmargin:4px 0 4px 4px;\n}\n.leaflet-control-search.search-load .search-input {\n\tbackground: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ") no-repeat center right #fff;\n}\n.leaflet-control-search.search-load .search-cancel {\n\tvisibility:hidden;\n}\n.leaflet-control-search .search-cancel {\n\tdisplay:block;\n\twidth:22px;\n\theight:22px;\n\tposition:absolute;\n\tright:28px;\n\tmargin:6px 0;\n\tbackground: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") no-repeat 0 -46px;\n\ttext-decoration:none;\n\tfilter: alpha(opacity=80);\n\topacity: 0.8;\t\t\n}\n.leaflet-control-search .search-cancel:hover {\n\tfilter: alpha(opacity=100);\n\topacity: 1;\n}\n.leaflet-control-search .search-cancel span {\n\tdisplay:none;/* comment for cancel button imageless */\n\tfont-size:18px;\n\tline-height:20px;\n\tcolor:#ccc;\n\tfont-weight:bold;\n}\n.leaflet-control-search .search-cancel:hover span {\n\tcolor:#aaa;\n}\n.leaflet-control-search .search-button {\n\tdisplay:block;\n\tfloat:left;\n\twidth:30px;\n\theight:30px;\t\n\tbackground: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") no-repeat 4px 4px #fff;\n\tborder-radius:4px;\n}\n.leaflet-control-search .search-button:hover {\n\tbackground: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ") no-repeat 4px -20px #fafafa;\n}\n.leaflet-control-search .search-tooltip {\n\tposition:absolute;\n\ttop:100%;\n\tleft:0;\n\tfloat:left;\n\tlist-style: none;\n\tpadding-left: 0;\n\tmin-width:120px;\n\tmax-height:122px;\n\tbox-shadow: 1px 1px 6px rgba(0,0,0,0.4);\n\tbackground-color: rgba(0, 0, 0, 0.25);\n\tz-index:1010;\n\toverflow-y:auto;\n\toverflow-x:hidden;\n\tcursor: pointer;\n}\n.leaflet-control-search .search-tip {\n\tmargin:2px;\n\tpadding:2px 4px;\n\tdisplay:block;\n\tcolor:black;\n\tbackground: #eee;\n\tborder-radius:.25em;\n\ttext-decoration:none;\t\n\twhite-space:nowrap;\n\tvertical-align:center;\n}\n.leaflet-control-search .search-button:hover {\n\tbackground-color: #f4f4f4;\n}\n.leaflet-control-search .search-tip-select,\n.leaflet-control-search .search-tip:hover {\n\tbackground-color: #fff;\n}\n.leaflet-control-search .search-alert {\n\tcursor:pointer;\n\tclear:both;\n\tfont-size:.75em;\n\tmargin-bottom:5px;\n\tpadding:0 .25em;\n\tcolor:#e00;\n\tfont-weight:bold;\n\tborder-radius:.25em;\n}\n\n\n", "",{"version":3,"sources":["webpack://./src/map/plugins/leaflet-search.css"],"names":[],"mappings":";AACA;CACC,iBAAiB;CACjB,UAAU;CACV,eAAe;CACf,aAAa;CACb,iCAAiC;CACjC,4BAA4B;CAC5B,uBAAuB;CACvB,0BAA0B;CAC1B,kBAAkB;CAClB,0CAA0C;CAC1C,YAAY;CACZ,iBAAiB;CACjB,gBAAgB;AACjB;AACA,oCAAoC,WAAW;CAC9C,gBAAgB;CAChB,iCAAiC;CACjC,4BAA4B;AAC7B;AACA;CACC,aAAa;CACb,UAAU;CACV,gBAAgB;CAChB,qBAAqB;CACrB,iBAAiB;CACjB,WAAW;CACX,oBAAoB;CACpB,oBAAoB;AACrB;AACA;CACC,+EAAgE;AACjE;AACA;CACC,iBAAiB;AAClB;AACA;CACC,aAAa;CACb,UAAU;CACV,WAAW;CACX,iBAAiB;CACjB,UAAU;CACV,YAAY;CACZ,qEAA2D;CAC3D,oBAAoB;CACpB,yBAAyB;CACzB,YAAY;AACb;AACA;CACC,0BAA0B;CAC1B,UAAU;AACX;AACA;CACC,YAAY,CAAC,wCAAwC;CACrD,cAAc;CACd,gBAAgB;CAChB,UAAU;CACV,gBAAgB;AACjB;AACA;CACC,UAAU;AACX;AACA;CACC,aAAa;CACb,UAAU;CACV,UAAU;CACV,WAAW;CACX,0EAAgE;CAChE,iBAAiB;AAClB;AACA;CACC,+EAAqE;AACtE;AACA;CACC,iBAAiB;CACjB,QAAQ;CACR,MAAM;CACN,UAAU;CACV,gBAAgB;CAChB,eAAe;CACf,eAAe;CACf,gBAAgB;CAChB,uCAAuC;CACvC,qCAAqC;CACrC,YAAY;CACZ,eAAe;CACf,iBAAiB;CACjB,eAAe;AAChB;AACA;CACC,UAAU;CACV,eAAe;CACf,aAAa;CACb,WAAW;CACX,gBAAgB;CAChB,mBAAmB;CACnB,oBAAoB;CACpB,kBAAkB;CAClB,qBAAqB;AACtB;AACA;CACC,yBAAyB;AAC1B;AACA;;CAEC,sBAAsB;AACvB;AACA;CACC,cAAc;CACd,UAAU;CACV,eAAe;CACf,iBAAiB;CACjB,eAAe;CACf,UAAU;CACV,gBAAgB;CAChB,mBAAmB;AACpB","sourcesContent":[" \n.leaflet-container .leaflet-control-search {\n\tposition:relative;\n\tfloat:left;\n\tbackground:#fff;\n\tcolor:#1978cf;\n\tborder: 2px solid rgba(0,0,0,0.2);\n\tbackground-clip: padding-box;\n\t-moz-border-radius: 4px;\n\t-webkit-border-radius: 4px;\n\tborder-radius: 4px;\n\tbackground-color: rgba(255, 255, 255, 0.8);\n\tz-index:1000;\t\n\tmargin-left: 10px;\n\tmargin-top: 10px;\n}\n.leaflet-control-search.search-exp {/*expanded*/\n\tbackground: #fff;\n\tborder: 2px solid rgba(0,0,0,0.2);\n\tbackground-clip: padding-box;\t\n}\n.leaflet-control-search .search-input {\n\tdisplay:block;\n\tfloat:left;\n\tbackground: #fff;\n\tborder:1px solid #666;\n\tborder-radius:2px;\n\theight:22px;\n\tpadding:0 20px 0 2px;\n\tmargin:4px 0 4px 4px;\n}\n.leaflet-control-search.search-load .search-input {\n\tbackground: url('images/loader.gif') no-repeat center right #fff;\n}\n.leaflet-control-search.search-load .search-cancel {\n\tvisibility:hidden;\n}\n.leaflet-control-search .search-cancel {\n\tdisplay:block;\n\twidth:22px;\n\theight:22px;\n\tposition:absolute;\n\tright:28px;\n\tmargin:6px 0;\n\tbackground: url('images/search-icon.png') no-repeat 0 -46px;\n\ttext-decoration:none;\n\tfilter: alpha(opacity=80);\n\topacity: 0.8;\t\t\n}\n.leaflet-control-search .search-cancel:hover {\n\tfilter: alpha(opacity=100);\n\topacity: 1;\n}\n.leaflet-control-search .search-cancel span {\n\tdisplay:none;/* comment for cancel button imageless */\n\tfont-size:18px;\n\tline-height:20px;\n\tcolor:#ccc;\n\tfont-weight:bold;\n}\n.leaflet-control-search .search-cancel:hover span {\n\tcolor:#aaa;\n}\n.leaflet-control-search .search-button {\n\tdisplay:block;\n\tfloat:left;\n\twidth:30px;\n\theight:30px;\t\n\tbackground: url('images/search-icon.png') no-repeat 4px 4px #fff;\n\tborder-radius:4px;\n}\n.leaflet-control-search .search-button:hover {\n\tbackground: url('images/search-icon.png') no-repeat 4px -20px #fafafa;\n}\n.leaflet-control-search .search-tooltip {\n\tposition:absolute;\n\ttop:100%;\n\tleft:0;\n\tfloat:left;\n\tlist-style: none;\n\tpadding-left: 0;\n\tmin-width:120px;\n\tmax-height:122px;\n\tbox-shadow: 1px 1px 6px rgba(0,0,0,0.4);\n\tbackground-color: rgba(0, 0, 0, 0.25);\n\tz-index:1010;\n\toverflow-y:auto;\n\toverflow-x:hidden;\n\tcursor: pointer;\n}\n.leaflet-control-search .search-tip {\n\tmargin:2px;\n\tpadding:2px 4px;\n\tdisplay:block;\n\tcolor:black;\n\tbackground: #eee;\n\tborder-radius:.25em;\n\ttext-decoration:none;\t\n\twhite-space:nowrap;\n\tvertical-align:center;\n}\n.leaflet-control-search .search-button:hover {\n\tbackground-color: #f4f4f4;\n}\n.leaflet-control-search .search-tip-select,\n.leaflet-control-search .search-tip:hover {\n\tbackground-color: #fff;\n}\n.leaflet-control-search .search-alert {\n\tcursor:pointer;\n\tclear:both;\n\tfont-size:.75em;\n\tmargin-bottom:5px;\n\tpadding:0 .25em;\n\tcolor:#e00;\n\tfont-weight:bold;\n\tborder-radius:.25em;\n}\n\n\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 7345:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".leaflet-control-coordinates{background-color:#D8D8D8;background-color:rgba(255,255,255,.8);cursor:pointer}.leaflet-control-coordinates,.leaflet-control-coordinates .uiElement input{-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px}.leaflet-control-coordinates .uiElement{margin:4px}.leaflet-control-coordinates .uiElement .labelFirst{margin-right:4px}.leaflet-control-coordinates .uiHidden{display:none}.leaflet-control-coordinates .uiElement.label{color:inherit;font-weight:inherit;font-size:inherit;padding:0;display:inherit}", "",{"version":3,"sources":["webpack://./src/map/plugins/leaflet.coordinates.css"],"names":[],"mappings":"AAAA,6BAA6B,wBAAwB,CAAC,qCAAqC,CAAC,cAAc,CAAC,2EAA2E,yBAAyB,CAAC,sBAAsB,CAAC,iBAAiB,CAAC,wCAAwC,UAAU,CAAC,oDAAoD,gBAAgB,CAAC,uCAAuC,YAAY,CAAC,8CAA8C,aAAa,CAAC,mBAAmB,CAAC,iBAAiB,CAAC,SAAS,CAAC,eAAe","sourcesContent":[".leaflet-control-coordinates{background-color:#D8D8D8;background-color:rgba(255,255,255,.8);cursor:pointer}.leaflet-control-coordinates,.leaflet-control-coordinates .uiElement input{-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px}.leaflet-control-coordinates .uiElement{margin:4px}.leaflet-control-coordinates .uiElement .labelFirst{margin-right:4px}.leaflet-control-coordinates .uiHidden{display:none}.leaflet-control-coordinates .uiElement.label{color:inherit;font-weight:inherit;font-size:inherit;padding:0;display:inherit}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 567:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1667);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _images_spritesheet_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(8747);
/* harmony import */ var _images_spritesheet_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4298);
/* harmony import */ var _images_spritesheet_2x_png__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4984);
// Imports






var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_spritesheet_png__WEBPACK_IMPORTED_MODULE_3__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_spritesheet_svg__WEBPACK_IMPORTED_MODULE_4__/* .default */ .Z);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(_images_spritesheet_2x_png__WEBPACK_IMPORTED_MODULE_5__/* .default */ .Z);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".leaflet-draw-section{position:relative}.leaflet-draw-toolbar{margin-top:12px}.leaflet-draw-toolbar-top{margin-top:0}.leaflet-draw-toolbar-notop a:first-child{border-top-right-radius:0}.leaflet-draw-toolbar-nobottom a:last-child{border-bottom-right-radius:0}.leaflet-draw-toolbar a{background-image:url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");background-image:linear-gradient(transparent,transparent),url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");background-repeat:no-repeat;background-size:300px 30px;background-clip:padding-box}.leaflet-retina .leaflet-draw-toolbar a{background-image:url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");background-image:linear-gradient(transparent,transparent),url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ")}\n.leaflet-draw a{display:block;text-align:center;text-decoration:none}.leaflet-draw a .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.leaflet-draw-actions{display:none;list-style:none;margin:0;padding:0;position:absolute;left:26px;top:0;white-space:nowrap}.leaflet-touch .leaflet-draw-actions{left:32px}.leaflet-right .leaflet-draw-actions{right:26px;left:auto}.leaflet-touch .leaflet-right .leaflet-draw-actions{right:32px;left:auto}.leaflet-draw-actions li{display:inline-block}\n.leaflet-draw-actions li:first-child a{border-left:0}.leaflet-draw-actions li:last-child a{-webkit-border-radius:0 4px 4px 0;border-radius:0 4px 4px 0}.leaflet-right .leaflet-draw-actions li:last-child a{-webkit-border-radius:0;border-radius:0}.leaflet-right .leaflet-draw-actions li:first-child a{-webkit-border-radius:4px 0 0 4px;border-radius:4px 0 0 4px}.leaflet-draw-actions a{background-color:#919187;border-left:1px solid #AAA;color:#FFF;font:11px/19px \"Helvetica Neue\",Arial,Helvetica,sans-serif;line-height:28px;text-decoration:none;padding-left:10px;padding-right:10px;height:28px}\n.leaflet-touch .leaflet-draw-actions a{font-size:12px;line-height:30px;height:30px}.leaflet-draw-actions-bottom{margin-top:0}.leaflet-draw-actions-top{margin-top:1px}.leaflet-draw-actions-top a,.leaflet-draw-actions-bottom a{height:27px;line-height:27px}.leaflet-draw-actions a:hover{background-color:#a0a098}.leaflet-draw-actions-top.leaflet-draw-actions-bottom a{height:26px;line-height:26px}.leaflet-draw-toolbar .leaflet-draw-draw-polyline{background-position:-2px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polyline{background-position:0 -1px}\n.leaflet-draw-toolbar .leaflet-draw-draw-polygon{background-position:-31px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon{background-position:-29px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-rectangle{background-position:-62px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-rectangle{background-position:-60px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-circle{background-position:-92px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circle{background-position:-90px -1px}\n.leaflet-draw-toolbar .leaflet-draw-draw-marker{background-position:-122px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-marker{background-position:-120px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-circlemarker{background-position:-273px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circlemarker{background-position:-271px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-edit{background-position:-152px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit{background-position:-150px -1px}\n.leaflet-draw-toolbar .leaflet-draw-edit-remove{background-position:-182px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove{background-position:-180px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled{background-position:-212px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled{background-position:-210px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled{background-position:-242px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled{background-position:-240px -2px}\n.leaflet-mouse-marker{background-color:#fff;cursor:crosshair}.leaflet-draw-tooltip{background:#363636;background:rgba(0,0,0,0.5);border:1px solid transparent;-webkit-border-radius:4px;border-radius:4px;color:#fff;font:12px/18px \"Helvetica Neue\",Arial,Helvetica,sans-serif;margin-left:20px;margin-top:-21px;padding:4px 8px;position:absolute;visibility:hidden;white-space:nowrap;z-index:6}.leaflet-draw-tooltip:before{border-right:6px solid black;border-right-color:rgba(0,0,0,0.5);border-top:6px solid transparent;border-bottom:6px solid transparent;content:\"\";position:absolute;top:7px;left:-7px}\n.leaflet-error-draw-tooltip{background-color:#f2dede;border:1px solid #e6b6bd;color:#b94a48}.leaflet-error-draw-tooltip:before{border-right-color:#e6b6bd}.leaflet-draw-tooltip-single{margin-top:-12px}.leaflet-draw-tooltip-subtext{color:#f8d5e4}.leaflet-draw-guide-dash{font-size:1%;opacity:.6;position:absolute;width:5px;height:5px}.leaflet-edit-marker-selected{background-color:rgba(254,87,161,0.1);border:4px dashed rgba(254,87,161,0.6);-webkit-border-radius:4px;border-radius:4px;box-sizing:content-box}\n.leaflet-edit-move{cursor:move}.leaflet-edit-resize{cursor:pointer}.leaflet-oldie .leaflet-draw-toolbar{border:1px solid #999}", "",{"version":3,"sources":["webpack://./src/map/plugins/leaflet.draw.css"],"names":[],"mappings":"AAAA,sBAAsB,iBAAiB,CAAC,sBAAsB,eAAe,CAAC,0BAA0B,YAAY,CAAC,0CAA0C,yBAAyB,CAAC,4CAA4C,4BAA4B,CAAC,wBAAwB,wDAA8C,CAAC,iGAAuF,CAAC,2BAA2B,CAAC,0BAA0B,CAAC,2BAA2B,CAAC,wCAAwC,wDAAiD,CAAC,iGAAuF;AACrqB,gBAAgB,aAAa,CAAC,iBAAiB,CAAC,oBAAoB,CAAC,yBAAyB,iBAAiB,CAAC,SAAS,CAAC,UAAU,CAAC,SAAS,CAAC,WAAW,CAAC,eAAe,CAAC,kBAAkB,CAAC,QAAQ,CAAC,sBAAsB,YAAY,CAAC,eAAe,CAAC,QAAQ,CAAC,SAAS,CAAC,iBAAiB,CAAC,SAAS,CAAC,KAAK,CAAC,kBAAkB,CAAC,qCAAqC,SAAS,CAAC,qCAAqC,UAAU,CAAC,SAAS,CAAC,oDAAoD,UAAU,CAAC,SAAS,CAAC,yBAAyB,oBAAoB;AACjiB,uCAAuC,aAAa,CAAC,sCAAsC,iCAAiC,CAAC,yBAAyB,CAAC,qDAAqD,uBAAuB,CAAC,eAAe,CAAC,sDAAsD,iCAAiC,CAAC,yBAAyB,CAAC,wBAAwB,wBAAwB,CAAC,0BAA0B,CAAC,UAAU,CAAC,0DAA0D,CAAC,gBAAgB,CAAC,oBAAoB,CAAC,iBAAiB,CAAC,kBAAkB,CAAC,WAAW;AAC9kB,uCAAuC,cAAc,CAAC,gBAAgB,CAAC,WAAW,CAAC,6BAA6B,YAAY,CAAC,0BAA0B,cAAc,CAAC,2DAA2D,WAAW,CAAC,gBAAgB,CAAC,8BAA8B,wBAAwB,CAAC,wDAAwD,WAAW,CAAC,gBAAgB,CAAC,kDAAkD,6BAA6B,CAAC,iEAAiE,0BAA0B;AACrjB,iDAAiD,8BAA8B,CAAC,gEAAgE,8BAA8B,CAAC,mDAAmD,8BAA8B,CAAC,kEAAkE,8BAA8B,CAAC,gDAAgD,8BAA8B,CAAC,+DAA+D,8BAA8B;AAC9gB,gDAAgD,+BAA+B,CAAC,+DAA+D,+BAA+B,CAAC,sDAAsD,+BAA+B,CAAC,qEAAqE,+BAA+B,CAAC,8CAA8C,+BAA+B,CAAC,6DAA6D,+BAA+B;AACphB,gDAAgD,+BAA+B,CAAC,+DAA+D,+BAA+B,CAAC,+DAA+D,+BAA+B,CAAC,8EAA8E,+BAA+B,CAAC,iEAAiE,+BAA+B,CAAC,gFAAgF,+BAA+B;AAC5kB,sBAAsB,qBAAqB,CAAC,gBAAgB,CAAC,sBAAsB,kBAAkB,CAAC,0BAA0B,CAAC,4BAA4B,CAAC,yBAAyB,CAAC,iBAAiB,CAAC,UAAU,CAAC,0DAA0D,CAAC,gBAAgB,CAAC,gBAAgB,CAAC,eAAe,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,kBAAkB,CAAC,SAAS,CAAC,6BAA6B,4BAA4B,CAAC,kCAAkC,CAAC,gCAAgC,CAAC,mCAAmC,CAAC,UAAU,CAAC,iBAAiB,CAAC,OAAO,CAAC,SAAS;AACnlB,4BAA4B,wBAAwB,CAAC,wBAAwB,CAAC,aAAa,CAAC,mCAAmC,0BAA0B,CAAC,6BAA6B,gBAAgB,CAAC,8BAA8B,aAAa,CAAC,yBAAyB,YAAY,CAAC,UAAU,CAAC,iBAAiB,CAAC,SAAS,CAAC,UAAU,CAAC,8BAA8B,qCAAqC,CAAC,sCAAsC,CAAC,yBAAyB,CAAC,iBAAiB,CAAC,sBAAsB;AACzf,mBAAmB,WAAW,CAAC,qBAAqB,cAAc,CAAC,qCAAqC,qBAAqB","sourcesContent":[".leaflet-draw-section{position:relative}.leaflet-draw-toolbar{margin-top:12px}.leaflet-draw-toolbar-top{margin-top:0}.leaflet-draw-toolbar-notop a:first-child{border-top-right-radius:0}.leaflet-draw-toolbar-nobottom a:last-child{border-bottom-right-radius:0}.leaflet-draw-toolbar a{background-image:url('images/spritesheet.png');background-image:linear-gradient(transparent,transparent),url('images/spritesheet.svg');background-repeat:no-repeat;background-size:300px 30px;background-clip:padding-box}.leaflet-retina .leaflet-draw-toolbar a{background-image:url('images/spritesheet-2x.png');background-image:linear-gradient(transparent,transparent),url('images/spritesheet.svg')}\n.leaflet-draw a{display:block;text-align:center;text-decoration:none}.leaflet-draw a .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.leaflet-draw-actions{display:none;list-style:none;margin:0;padding:0;position:absolute;left:26px;top:0;white-space:nowrap}.leaflet-touch .leaflet-draw-actions{left:32px}.leaflet-right .leaflet-draw-actions{right:26px;left:auto}.leaflet-touch .leaflet-right .leaflet-draw-actions{right:32px;left:auto}.leaflet-draw-actions li{display:inline-block}\n.leaflet-draw-actions li:first-child a{border-left:0}.leaflet-draw-actions li:last-child a{-webkit-border-radius:0 4px 4px 0;border-radius:0 4px 4px 0}.leaflet-right .leaflet-draw-actions li:last-child a{-webkit-border-radius:0;border-radius:0}.leaflet-right .leaflet-draw-actions li:first-child a{-webkit-border-radius:4px 0 0 4px;border-radius:4px 0 0 4px}.leaflet-draw-actions a{background-color:#919187;border-left:1px solid #AAA;color:#FFF;font:11px/19px \"Helvetica Neue\",Arial,Helvetica,sans-serif;line-height:28px;text-decoration:none;padding-left:10px;padding-right:10px;height:28px}\n.leaflet-touch .leaflet-draw-actions a{font-size:12px;line-height:30px;height:30px}.leaflet-draw-actions-bottom{margin-top:0}.leaflet-draw-actions-top{margin-top:1px}.leaflet-draw-actions-top a,.leaflet-draw-actions-bottom a{height:27px;line-height:27px}.leaflet-draw-actions a:hover{background-color:#a0a098}.leaflet-draw-actions-top.leaflet-draw-actions-bottom a{height:26px;line-height:26px}.leaflet-draw-toolbar .leaflet-draw-draw-polyline{background-position:-2px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polyline{background-position:0 -1px}\n.leaflet-draw-toolbar .leaflet-draw-draw-polygon{background-position:-31px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-polygon{background-position:-29px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-rectangle{background-position:-62px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-rectangle{background-position:-60px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-circle{background-position:-92px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circle{background-position:-90px -1px}\n.leaflet-draw-toolbar .leaflet-draw-draw-marker{background-position:-122px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-marker{background-position:-120px -1px}.leaflet-draw-toolbar .leaflet-draw-draw-circlemarker{background-position:-273px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-draw-circlemarker{background-position:-271px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-edit{background-position:-152px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit{background-position:-150px -1px}\n.leaflet-draw-toolbar .leaflet-draw-edit-remove{background-position:-182px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove{background-position:-180px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled{background-position:-212px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-disabled{background-position:-210px -1px}.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled{background-position:-242px -2px}.leaflet-touch .leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-disabled{background-position:-240px -2px}\n.leaflet-mouse-marker{background-color:#fff;cursor:crosshair}.leaflet-draw-tooltip{background:#363636;background:rgba(0,0,0,0.5);border:1px solid transparent;-webkit-border-radius:4px;border-radius:4px;color:#fff;font:12px/18px \"Helvetica Neue\",Arial,Helvetica,sans-serif;margin-left:20px;margin-top:-21px;padding:4px 8px;position:absolute;visibility:hidden;white-space:nowrap;z-index:6}.leaflet-draw-tooltip:before{border-right:6px solid black;border-right-color:rgba(0,0,0,0.5);border-top:6px solid transparent;border-bottom:6px solid transparent;content:\"\";position:absolute;top:7px;left:-7px}\n.leaflet-error-draw-tooltip{background-color:#f2dede;border:1px solid #e6b6bd;color:#b94a48}.leaflet-error-draw-tooltip:before{border-right-color:#e6b6bd}.leaflet-draw-tooltip-single{margin-top:-12px}.leaflet-draw-tooltip-subtext{color:#f8d5e4}.leaflet-draw-guide-dash{font-size:1%;opacity:.6;position:absolute;width:5px;height:5px}.leaflet-edit-marker-selected{background-color:rgba(254,87,161,0.1);border:4px dashed rgba(254,87,161,0.6);-webkit-border-radius:4px;border-radius:4px;box-sizing:content-box}\n.leaflet-edit-move{cursor:move}.leaflet-edit-resize{cursor:pointer}.leaflet-oldie .leaflet-draw-toolbar{border:1px solid #999}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 5426:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4015);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3645);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/* .webix_multiview {\r\n    height: auto!important;\r\n} */\r\n\r\n.webix_padding_0 {\r\n    padding: 0!important;\r\n}\r\n\r\n/* all */\r\n.width_100_percent {\r\n    width: 100%!important;    \r\n}\r\n.heigth_100_percent {\r\n    height: 100%!important;\r\n}\r\n.z_max {\r\n    z-index: 10000;\r\n}\r\n/* scrollbar */\r\n::-webkit-scrollbar {\r\n    width: 6px;\r\n    height: 6px;\r\n}\r\n::-webkit-scrollbar-track {\r\n    background: #f1f1f1;\r\n}\r\n::-webkit-scrollbar-thumb {\r\n    background: #CCC;\r\n}\r\n::-webkit-scrollbar-thumb:hover {\r\n    background: #999;\r\n}\r\n\r\n.htmltable .webix_template{\r\n    padding: 0!important;\r\n}\r\n\r\n.header_label {\r\n    padding-top: 6px;\r\n\twhite-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    max-width: 460;\r\n}\r\n.css_icon{\r\n    padding-top: 3px;\r\n}\r\n.webix_rating_point{\r\n    cursor:pointer;\r\n}\r\n.webix_rating_selected{\r\n    color:gold;\r\n}\r\n.webix_table_checkbox{\r\n    color: #767779;\r\n    background-color: #767779;\r\n    background: #767779;\r\n}\r\n.webix_dtable .webix_ss_filter input, .webix_dtable .webix_ss_filter select {\r\n    border-radius: 0px;\r\n    height: 20px;    \r\n}\r\n.webix_search {\r\n    margin-left: 0px;\r\n    margin-top: 155px;\r\n    z-index: 4;\r\n}\r\n.smoked{\r\n    text-shadow:0 1px 25px whitesmoke;\r\n}\r\n.webix_popup {\r\n    z-index: 10001!important;\r\n}\r\n.compact .webix_list_item.webix_selected{\r\n    background: #c7c7c7!important;\r\n} \r\n.compact .webix_list_item:not(.webix_selected):hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.compact .webix_list_item:hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.compact .webix_cell.webix_row_select{\r\n    background: #c7c7c7!important;\r\n}\r\n\r\n/* tabview */\r\n.compact .webix_item_tab:not(.webix_selected):hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :    -moz-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :     -ms-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :         linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n}\r\n\r\n/* button */\r\n.compact .webix_el_button.blue button:hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :    -moz-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :     -ms-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :         linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n}\r\n\r\n/* Templates */\r\n.webix_template {\r\n    padding: 0px;\r\n}\r\n\r\n/* HTML tables */\r\ntable.sortable th:not(.sorttable_sorted):not(.sorttable_sorted_reverse):not(.sorttable_nosort):after { \r\n    content: \" \\25B4\\25BE\" \r\n}\t\t\t\t\r\naudio::-webkit-media-controls-enclosure {\r\n    background-color: transparent;\r\n}\t  \r\naudio::-webkit-media-controls-panel {\r\n  background-color: transparent;  \r\n}\r\ntable.sortable{\r\n    margin: 0px;\r\n    width: 100%;\r\n    border: 1px solid #888888;\r\n    /* border-style: double; */\r\n    border-spacing: 0px;\r\n    border-collapse: separate;\r\n}\t\r\ntable.sortable td {\r\n    padding: 3px;\r\n    border: 1px solid #888888;\r\n    white-space:pre;     \r\n}\t\r\ntable.sortable tr {\r\n    background-color:#C8DBEE;\r\n}\t\t\t\t\t\r\n/* table.sortable tr:hover {\r\n    background-color: #FFCF8B\r\n} */\r\ntable.sortable th {\r\n    background-color:#9BB9E0;\r\n    font-weight: bold;\r\n    cursor: default;\r\n    text-align: \"center\";\r\n    border: 1px solid #888888;\r\n}\r\ntable.sortable th:not(.sorttable_sorted):not(.sorttable_sorted_reverse):not(.sorttable_nosort):after { \r\n    content: \" \\25B4\\25BE\" \r\n}\r\n\r\n.form_custom{\r\n    margin:\"auto\" !important;\r\n    background-color: rgb(149, 164, 196)\r\n}\r\n\r\n.divError{\r\n    position: absolute;\r\n    left: 50%;\r\n    margin-top: 50px;\r\n    margin-left: -200px;\r\n    width: 400px;\r\n    height: 500px;    \r\n}\r\n\r\n.webix_hcell input[type=checkbox], .webix_table_checkbox {\r\n    margin-bottom: 2px;\r\n    margin-top: 100%!important;\r\n}\r\n\r\n.webix_hcell.webix_ss_filter{\r\n    height: auto!important;\r\n}\r\n\r\n.webix_form.formStyle {\r\n    background: rgb(148, 195, 248);\r\n    background: -moz-linear-gradient(top, rgb(188, 210, 233) 0% , rgb(148, 195, 248) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(188, 210, 233)), color-stop(1, rgb(148, 195, 248)));\r\n    border:1px solid  rgb(24, 27, 32);\r\n    border-radius: 20px; -webkit-border-radius: 20px;-moz-border-radius: 20px;\r\n    box-shadow: inset 0px 1px 1px  rgb(148, 195, 248);\r\n    -webkit-box-shadow: inset 0px 1px 1px  rgb(148, 195, 248);\r\n    color:#FFFFFF;\r\n    font-size: 15px;  \r\n}\r\n\r\n.dtstyle .webix_overlay {\r\n    margin-top: 100px;\r\n}\r\n\r\n.dtstyle {\r\n    margin-left: 1px!important;\r\n}\r\n\r\n.webix_overlay {\r\n    margin-top: 200px;\r\n    color: #0f75c9;\r\n}\r\n\r\n.blink {\r\n    animation-direction: alternate;\r\n    animation-duration: 0.4s;\r\n    animation-iteration-count: infinite;\r\n    animation-name: color_change;\r\n}\r\n@keyframes color_change {\r\n    0% {\r\n        background: #d6b9ca;\r\n    }\r\n    25% {\r\n        background: #d68ab5;\r\n    }\r\n    50% {\r\n        background: #d665a5;\r\n    }\r\n    75% {\r\n        background: #d43891;\r\n    }\r\n    100% {\r\n        background: #d41a82;\r\n    }\r\n}\r\n\r\ntextarea {\r\n    width: 300px;\r\n    height: 100px;    \r\n}\r\n\r\n.result_panel{\r\n  padding: 6px 8px;\r\n  font: 14px/16px Arial, Helvetica, sans-serif;\r\n  background: white;\r\n  background: rgba(255,255,255,0.6);\r\n  box-shadow: 0 0 15px rgba(0,0,0,0.2);\r\n  border-radius: 5px;\r\n  visibility: hidden;\r\n  max-width: 400px;    \r\n  max-height: 500px;\r\n  overflow-x: auto;\r\n  opacity: 0.6;\r\n}\r\n\r\n.webix_tree_item.webix_selected, .webix_sidebar .webix_tree_item.webix_selected span{\r\n    background-color: #d6d6d6!important;\r\n}\r\n\r\n/* DARK */\r\n.dark .webix_list_item.webix_selected{\r\n    background: #c7c7c7!important;\r\n} \r\n\r\n.dark .webix_list_item:not(.webix_selected):hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.dark .webix_list_item:hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.dark .webix_cell.webix_row_select{\r\n    background: #c7c7c7!important;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button{\r\n    background: rgb(87, 91, 95);\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(212, 216, 221);\r\n    border-radius: 4px; -webkit-border-radius: 4px;-moz-border-radius: 4px;\r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#ffffff;\r\n    font-size: 15px;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button:active{\r\n    background: rgb(87, 91, 95) !important;\r\n}\r\n\r\n.dark .webix_input_icon.wxi-calendar, .dark .webix_input_icon.wxi-menu-down{\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(212, 216, 221);    \r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#ffffff;\r\n    height: 25px!important;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button:hover, .dark .webix_input_icon.wxi-calendar:hover, .dark .webix_input_icon.wxi-menu-down:hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* tabview */\r\n.dark .webix_item_tab:not(.webix_selected):hover {\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n.dark .webix_after_all_tabs{\r\n    background:  rgb(114, 117, 119);\r\n}\r\n\r\n.dark .webix_item_tab.webix_selected{\r\n    background: rgb(87, 91, 95);\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(87, 91, 95);    \r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#FFFFFF;\r\n    font-size: 15px;    \r\n}\r\n\r\n/* toolbar */\r\n.dark .webix_toolbar{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* webix_accordionitem_label */\r\n.dark .webix_accordionitem_header{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* window */\r\n.dark .webix_win_head{\r\n    border-bottom: 2px solid rgb(58, 65, 71);\r\n}\r\n\r\n/* menu */\r\n.dark .webix_tree_item.webix_selected{\r\n    background: rgb(113, 126, 139);\r\n}\r\n\r\n.dark .webix_tree_item.webix_selected span{\r\n    background: rgb(113, 126, 139);\r\n}\r\n\r\n/* datatable */\r\n.dark .webix_ss_header td{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_ss_header{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_dd_drag_column{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_ss_vscroll_header{\r\n    background : #ced2d4!important;\r\n    border: 1px solid #a0a2a3;\r\n}\r\n\r\n.dark .webix_switch_on{\r\n    background-color: #767779;\r\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;;GAEG;;AAEH;IACI,oBAAoB;AACxB;;AAEA,QAAQ;AACR;IACI,qBAAqB;AACzB;AACA;IACI,sBAAsB;AAC1B;AACA;IACI,cAAc;AAClB;AACA,cAAc;AACd;IACI,UAAU;IACV,WAAW;AACf;AACA;IACI,mBAAmB;AACvB;AACA;IACI,gBAAgB;AACpB;AACA;IACI,gBAAgB;AACpB;;AAEA;IACI,oBAAoB;AACxB;;AAEA;IACI,gBAAgB;CACnB,mBAAmB;IAChB,uBAAuB;IACvB,cAAc;AAClB;AACA;IACI,gBAAgB;AACpB;AACA;IACI,cAAc;AAClB;AACA;IACI,UAAU;AACd;AACA;IACI,cAAc;IACd,yBAAyB;IACzB,mBAAmB;AACvB;AACA;IACI,kBAAkB;IAClB,YAAY;AAChB;AACA;IACI,gBAAgB;IAChB,iBAAiB;IACjB,UAAU;AACd;AACA;IACI,iCAAiC;AACrC;AACA;IACI,wBAAwB;AAC5B;AACA;IACI,6BAA6B;AACjC;AACA;IACI,6BAA6B;AACjC;AACA;IACI,6BAA6B;AACjC;AACA;IACI,6BAA6B;AACjC;;AAEA,YAAY;AACZ;IACI,wFAAwF;IACxF,wFAAwF;IACxF,wFAAwF;IACxF,wFAAwF;AAC5F;;AAEA,WAAW;AACX;IACI,wFAAwF;IACxF,wFAAwF;IACxF,wFAAwF;IACxF,wFAAwF;AAC5F;;AAEA,cAAc;AACd;IACI,YAAY;AAChB;;AAEA,gBAAgB;AAChB;IACI;AACJ;AACA;IACI,6BAA6B;AACjC;AACA;EACE,6BAA6B;AAC/B;AACA;IACI,WAAW;IACX,WAAW;IACX,yBAAyB;IACzB,0BAA0B;IAC1B,mBAAmB;IACnB,yBAAyB;AAC7B;AACA;IACI,YAAY;IACZ,yBAAyB;IACzB,eAAe;AACnB;AACA;IACI,wBAAwB;AAC5B;AACA;;GAEG;AACH;IACI,wBAAwB;IACxB,iBAAiB;IACjB,eAAe;IACf,oBAAoB;IACpB,yBAAyB;AAC7B;AACA;IACI;AACJ;;AAEA;IACI,wBAAwB;IACxB;AACJ;;AAEA;IACI,kBAAkB;IAClB,SAAS;IACT,gBAAgB;IAChB,mBAAmB;IACnB,YAAY;IACZ,aAAa;AACjB;;AAEA;IACI,kBAAkB;IAClB,0BAA0B;AAC9B;;AAEA;IACI,sBAAsB;AAC1B;;AAEA;IACI,8BAA8B;IAC9B,sFAAsF;IACtF,gIAAgI;IAChI,iCAAiC;IACjC,mBAAmB,EAAE,2BAA2B,CAAC,wBAAwB;IACzE,iDAAiD;IACjD,yDAAyD;IACzD,aAAa;IACb,eAAe;AACnB;;AAEA;IACI,iBAAiB;AACrB;;AAEA;IACI,0BAA0B;AAC9B;;AAEA;IACI,iBAAiB;IACjB,cAAc;AAClB;;AAEA;IACI,8BAA8B;IAC9B,wBAAwB;IACxB,mCAAmC;IACnC,4BAA4B;AAChC;AACA;IACI;QACI,mBAAmB;IACvB;IACA;QACI,mBAAmB;IACvB;IACA;QACI,mBAAmB;IACvB;IACA;QACI,mBAAmB;IACvB;IACA;QACI,mBAAmB;IACvB;AACJ;;AAEA;IACI,YAAY;IACZ,aAAa;AACjB;;AAEA;EACE,gBAAgB;EAChB,4CAA4C;EAC5C,iBAAiB;EACjB,iCAAiC;EACjC,oCAAoC;EACpC,kBAAkB;EAClB,kBAAkB;EAClB,gBAAgB;EAChB,iBAAiB;EACjB,gBAAgB;EAChB,YAAY;AACd;;AAEA;IACI,mCAAmC;AACvC;;AAEA,SAAS;AACT;IACI,6BAA6B;AACjC;;AAEA;IACI,6BAA6B;AACjC;AACA;IACI,6BAA6B;AACjC;AACA;IACI,6BAA6B;AACjC;;AAEA;IACI,2BAA2B;IAC3B,gFAAgF;IAChF,0HAA0H;IAC1H,mCAAmC;IACnC,kBAAkB,EAAE,0BAA0B,CAAC,uBAAuB;IACtE,2BAA2B;IAC3B,qCAAqC;IACrC,6CAA6C;IAC7C,aAAa;IACb,eAAe;AACnB;;AAEA;IACI,sCAAsC;AAC1C;;AAEA;IACI,gFAAgF;IAChF,0HAA0H;IAC1H,mCAAmC;IACnC,2BAA2B;IAC3B,qCAAqC;IACrC,6CAA6C;IAC7C,aAAa;IACb,sBAAsB;AAC1B;;AAEA;IACI,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;AAClG;;AAEA,YAAY;AACZ;IACI,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;AAClG;;AAEA;IACI,+BAA+B;AACnC;;AAEA;IACI,2BAA2B;IAC3B,gFAAgF;IAChF,0HAA0H;IAC1H,gCAAgC;IAChC,2BAA2B;IAC3B,qCAAqC;IACrC,6CAA6C;IAC7C,aAAa;IACb,eAAe;AACnB;;AAEA,YAAY;AACZ;IACI,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;AAClG;;AAEA,8BAA8B;AAC9B;IACI,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;IAC9F,8FAA8F;AAClG;;AAEA,WAAW;AACX;IACI,wCAAwC;AAC5C;;AAEA,SAAS;AACT;IACI,8BAA8B;AAClC;;AAEA;IACI,8BAA8B;AAClC;;AAEA,cAAc;AACd;IACI,8BAA8B;IAC9B,gCAAgC;IAChC,+BAA+B;AACnC;;AAEA;IACI,8BAA8B;IAC9B,gCAAgC;IAChC,+BAA+B;AACnC;;AAEA;IACI,8BAA8B;IAC9B,gCAAgC;IAChC,+BAA+B;AACnC;;AAEA;IACI,8BAA8B;IAC9B,yBAAyB;AAC7B;;AAEA;IACI,yBAAyB;AAC7B","sourcesContent":["/* .webix_multiview {\r\n    height: auto!important;\r\n} */\r\n\r\n.webix_padding_0 {\r\n    padding: 0!important;\r\n}\r\n\r\n/* all */\r\n.width_100_percent {\r\n    width: 100%!important;    \r\n}\r\n.heigth_100_percent {\r\n    height: 100%!important;\r\n}\r\n.z_max {\r\n    z-index: 10000;\r\n}\r\n/* scrollbar */\r\n::-webkit-scrollbar {\r\n    width: 6px;\r\n    height: 6px;\r\n}\r\n::-webkit-scrollbar-track {\r\n    background: #f1f1f1;\r\n}\r\n::-webkit-scrollbar-thumb {\r\n    background: #CCC;\r\n}\r\n::-webkit-scrollbar-thumb:hover {\r\n    background: #999;\r\n}\r\n\r\n.htmltable .webix_template{\r\n    padding: 0!important;\r\n}\r\n\r\n.header_label {\r\n    padding-top: 6px;\r\n\twhite-space: nowrap;\r\n    text-overflow: ellipsis;\r\n    max-width: 460;\r\n}\r\n.css_icon{\r\n    padding-top: 3px;\r\n}\r\n.webix_rating_point{\r\n    cursor:pointer;\r\n}\r\n.webix_rating_selected{\r\n    color:gold;\r\n}\r\n.webix_table_checkbox{\r\n    color: #767779;\r\n    background-color: #767779;\r\n    background: #767779;\r\n}\r\n.webix_dtable .webix_ss_filter input, .webix_dtable .webix_ss_filter select {\r\n    border-radius: 0px;\r\n    height: 20px;    \r\n}\r\n.webix_search {\r\n    margin-left: 0px;\r\n    margin-top: 155px;\r\n    z-index: 4;\r\n}\r\n.smoked{\r\n    text-shadow:0 1px 25px whitesmoke;\r\n}\r\n.webix_popup {\r\n    z-index: 10001!important;\r\n}\r\n.compact .webix_list_item.webix_selected{\r\n    background: #c7c7c7!important;\r\n} \r\n.compact .webix_list_item:not(.webix_selected):hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.compact .webix_list_item:hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.compact .webix_cell.webix_row_select{\r\n    background: #c7c7c7!important;\r\n}\r\n\r\n/* tabview */\r\n.compact .webix_item_tab:not(.webix_selected):hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :    -moz-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :     -ms-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :         linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n}\r\n\r\n/* button */\r\n.compact .webix_el_button.blue button:hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :    -moz-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :     -ms-linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n    background-image :         linear-gradient(bottom,rgb(46, 129, 184), rgb(48, 158, 231) );\r\n}\r\n\r\n/* Templates */\r\n.webix_template {\r\n    padding: 0px;\r\n}\r\n\r\n/* HTML tables */\r\ntable.sortable th:not(.sorttable_sorted):not(.sorttable_sorted_reverse):not(.sorttable_nosort):after { \r\n    content: \" \\25B4\\25BE\" \r\n}\t\t\t\t\r\naudio::-webkit-media-controls-enclosure {\r\n    background-color: transparent;\r\n}\t  \r\naudio::-webkit-media-controls-panel {\r\n  background-color: transparent;  \r\n}\r\ntable.sortable{\r\n    margin: 0px;\r\n    width: 100%;\r\n    border: 1px solid #888888;\r\n    /* border-style: double; */\r\n    border-spacing: 0px;\r\n    border-collapse: separate;\r\n}\t\r\ntable.sortable td {\r\n    padding: 3px;\r\n    border: 1px solid #888888;\r\n    white-space:pre;     \r\n}\t\r\ntable.sortable tr {\r\n    background-color:#C8DBEE;\r\n}\t\t\t\t\t\r\n/* table.sortable tr:hover {\r\n    background-color: #FFCF8B\r\n} */\r\ntable.sortable th {\r\n    background-color:#9BB9E0;\r\n    font-weight: bold;\r\n    cursor: default;\r\n    text-align: \"center\";\r\n    border: 1px solid #888888;\r\n}\r\ntable.sortable th:not(.sorttable_sorted):not(.sorttable_sorted_reverse):not(.sorttable_nosort):after { \r\n    content: \" \\25B4\\25BE\" \r\n}\r\n\r\n.form_custom{\r\n    margin:\"auto\" !important;\r\n    background-color: rgb(149, 164, 196)\r\n}\r\n\r\n.divError{\r\n    position: absolute;\r\n    left: 50%;\r\n    margin-top: 50px;\r\n    margin-left: -200px;\r\n    width: 400px;\r\n    height: 500px;    \r\n}\r\n\r\n.webix_hcell input[type=checkbox], .webix_table_checkbox {\r\n    margin-bottom: 2px;\r\n    margin-top: 100%!important;\r\n}\r\n\r\n.webix_hcell.webix_ss_filter{\r\n    height: auto!important;\r\n}\r\n\r\n.webix_form.formStyle {\r\n    background: rgb(148, 195, 248);\r\n    background: -moz-linear-gradient(top, rgb(188, 210, 233) 0% , rgb(148, 195, 248) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(188, 210, 233)), color-stop(1, rgb(148, 195, 248)));\r\n    border:1px solid  rgb(24, 27, 32);\r\n    border-radius: 20px; -webkit-border-radius: 20px;-moz-border-radius: 20px;\r\n    box-shadow: inset 0px 1px 1px  rgb(148, 195, 248);\r\n    -webkit-box-shadow: inset 0px 1px 1px  rgb(148, 195, 248);\r\n    color:#FFFFFF;\r\n    font-size: 15px;  \r\n}\r\n\r\n.dtstyle .webix_overlay {\r\n    margin-top: 100px;\r\n}\r\n\r\n.dtstyle {\r\n    margin-left: 1px!important;\r\n}\r\n\r\n.webix_overlay {\r\n    margin-top: 200px;\r\n    color: #0f75c9;\r\n}\r\n\r\n.blink {\r\n    animation-direction: alternate;\r\n    animation-duration: 0.4s;\r\n    animation-iteration-count: infinite;\r\n    animation-name: color_change;\r\n}\r\n@keyframes color_change {\r\n    0% {\r\n        background: #d6b9ca;\r\n    }\r\n    25% {\r\n        background: #d68ab5;\r\n    }\r\n    50% {\r\n        background: #d665a5;\r\n    }\r\n    75% {\r\n        background: #d43891;\r\n    }\r\n    100% {\r\n        background: #d41a82;\r\n    }\r\n}\r\n\r\ntextarea {\r\n    width: 300px;\r\n    height: 100px;    \r\n}\r\n\r\n.result_panel{\r\n  padding: 6px 8px;\r\n  font: 14px/16px Arial, Helvetica, sans-serif;\r\n  background: white;\r\n  background: rgba(255,255,255,0.6);\r\n  box-shadow: 0 0 15px rgba(0,0,0,0.2);\r\n  border-radius: 5px;\r\n  visibility: hidden;\r\n  max-width: 400px;    \r\n  max-height: 500px;\r\n  overflow-x: auto;\r\n  opacity: 0.6;\r\n}\r\n\r\n.webix_tree_item.webix_selected, .webix_sidebar .webix_tree_item.webix_selected span{\r\n    background-color: #d6d6d6!important;\r\n}\r\n\r\n/* DARK */\r\n.dark .webix_list_item.webix_selected{\r\n    background: #c7c7c7!important;\r\n} \r\n\r\n.dark .webix_list_item:not(.webix_selected):hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.dark .webix_list_item:hover{\r\n    background: #c7c7c7!important;\r\n}\r\n.dark .webix_cell.webix_row_select{\r\n    background: #c7c7c7!important;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button{\r\n    background: rgb(87, 91, 95);\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(212, 216, 221);\r\n    border-radius: 4px; -webkit-border-radius: 4px;-moz-border-radius: 4px;\r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#ffffff;\r\n    font-size: 15px;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button:active{\r\n    background: rgb(87, 91, 95) !important;\r\n}\r\n\r\n.dark .webix_input_icon.wxi-calendar, .dark .webix_input_icon.wxi-menu-down{\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(212, 216, 221);    \r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#ffffff;\r\n    height: 25px!important;\r\n}\r\n\r\n.dark .webix_el_button:not(.webix_transparent) .webix_button:hover, .dark .webix_input_icon.wxi-calendar:hover, .dark .webix_input_icon.wxi-menu-down:hover{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* tabview */\r\n.dark .webix_item_tab:not(.webix_selected):hover {\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n.dark .webix_after_all_tabs{\r\n    background:  rgb(114, 117, 119);\r\n}\r\n\r\n.dark .webix_item_tab.webix_selected{\r\n    background: rgb(87, 91, 95);\r\n    background: -moz-linear-gradient(top, rgb(58, 65, 71) 0% , rgb(87, 91, 95) 100%);\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0,rgb(58, 65, 71)), color-stop(1, rgb(87, 91, 95)));\r\n    border:1px solid rgb(87, 91, 95);    \r\n    text-shadow: 0 -1px #22272c;\r\n    box-shadow: inset 0px 1px 1px #899097;\r\n    -webkit-box-shadow: inset 0px 1px 1px #899097;\r\n    color:#FFFFFF;\r\n    font-size: 15px;    \r\n}\r\n\r\n/* toolbar */\r\n.dark .webix_toolbar{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* webix_accordionitem_label */\r\n.dark .webix_accordionitem_header{\r\n    background-image : -webkit-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :    -moz-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :     -ms-linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n    background-image :         linear-gradient(bottom,rgb(58, 65, 71), rgb(87, 93, 97) )!important;\r\n}\r\n\r\n/* window */\r\n.dark .webix_win_head{\r\n    border-bottom: 2px solid rgb(58, 65, 71);\r\n}\r\n\r\n/* menu */\r\n.dark .webix_tree_item.webix_selected{\r\n    background: rgb(113, 126, 139);\r\n}\r\n\r\n.dark .webix_tree_item.webix_selected span{\r\n    background: rgb(113, 126, 139);\r\n}\r\n\r\n/* datatable */\r\n.dark .webix_ss_header td{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_ss_header{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_dd_drag_column{\r\n    background : #ced2d4!important;\r\n    border-bottom: 1px solid #a0a2a3;\r\n    border-right: 1px solid #a0a2a3;    \r\n}\r\n\r\n.dark .webix_ss_vscroll_header{\r\n    background : #ced2d4!important;\r\n    border: 1px solid #a0a2a3;\r\n}\r\n\r\n.dark .webix_switch_on{\r\n    background-color: #767779;\r\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 3645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ 4015:
/***/ ((module) => {

"use strict";


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ 1667:
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  } // eslint-disable-next-line no-underscore-dangle, no-param-reassign


  url = url && url.__esModule ? url.default : url;

  if (typeof url !== "string") {
    return url;
  } // If url is already wrapped in quotes, remove them


  if (/^['"].*['"]$/.test(url)) {
    // eslint-disable-next-line no-param-reassign
    url = url.slice(1, -1);
  }

  if (options.hash) {
    // eslint-disable-next-line no-param-reassign
    url += options.hash;
  } // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls


  if (/["'() \t\n]/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }

  return url;
};

/***/ }),

/***/ 6788:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/8f2c4d11474275fbc1614b9098334eae.png");

/***/ }),

/***/ 7515:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/416d91365b44e4b4f4777663e6f009f3.png");

/***/ }),

/***/ 2599:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/2b3e1faf89f94a4835397e7a43b4f77d.png");

/***/ }),

/***/ 9419:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/42e88a566f5f3c20f5563dc1dd6828da.gif");

/***/ }),

/***/ 9297:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/b110a6248f50f33e02d1774dad7019e6.png");

/***/ }),

/***/ 4984:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/7ea3a6d428136b87ab95ee89b6e956e7.png");

/***/ }),

/***/ 8747:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/ef32ea2bdf63ba132b4ced047203650d.png");

/***/ }),

/***/ 4298:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "../images/0783f1b848c4a1056fbcf127ba6d68f0.svg");

/***/ }),

/***/ 5243:
/***/ (function(__unused_webpack_module, exports) {

/* @preserve
 * Leaflet 1.7.1, a JS library for interactive maps. http://leafletjs.com
 * (c) 2010-2019 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */

(function (global, factory) {
   true ? factory(exports) :
  0;
}(this, (function (exports) { 'use strict';

  var version = "1.7.1";

  /*
   * @namespace Util
   *
   * Various utility functions, used by Leaflet internally.
   */

  // @function extend(dest: Object, src?: Object): Object
  // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
  function extend(dest) {
  	var i, j, len, src;

  	for (j = 1, len = arguments.length; j < len; j++) {
  		src = arguments[j];
  		for (i in src) {
  			dest[i] = src[i];
  		}
  	}
  	return dest;
  }

  // @function create(proto: Object, properties?: Object): Object
  // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
  var create = Object.create || (function () {
  	function F() {}
  	return function (proto) {
  		F.prototype = proto;
  		return new F();
  	};
  })();

  // @function bind(fn: Function, …): Function
  // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
  // Has a `L.bind()` shortcut.
  function bind(fn, obj) {
  	var slice = Array.prototype.slice;

  	if (fn.bind) {
  		return fn.bind.apply(fn, slice.call(arguments, 1));
  	}

  	var args = slice.call(arguments, 2);

  	return function () {
  		return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
  	};
  }

  // @property lastId: Number
  // Last unique ID used by [`stamp()`](#util-stamp)
  var lastId = 0;

  // @function stamp(obj: Object): Number
  // Returns the unique ID of an object, assigning it one if it doesn't have it.
  function stamp(obj) {
  	/*eslint-disable */
  	obj._leaflet_id = obj._leaflet_id || ++lastId;
  	return obj._leaflet_id;
  	/* eslint-enable */
  }

  // @function throttle(fn: Function, time: Number, context: Object): Function
  // Returns a function which executes function `fn` with the given scope `context`
  // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
  // `fn` will be called no more than one time per given amount of `time`. The arguments
  // received by the bound function will be any arguments passed when binding the
  // function, followed by any arguments passed when invoking the bound function.
  // Has an `L.throttle` shortcut.
  function throttle(fn, time, context) {
  	var lock, args, wrapperFn, later;

  	later = function () {
  		// reset lock and call if queued
  		lock = false;
  		if (args) {
  			wrapperFn.apply(context, args);
  			args = false;
  		}
  	};

  	wrapperFn = function () {
  		if (lock) {
  			// called too soon, queue to call later
  			args = arguments;

  		} else {
  			// call and lock until later
  			fn.apply(context, arguments);
  			setTimeout(later, time);
  			lock = true;
  		}
  	};

  	return wrapperFn;
  }

  // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
  // Returns the number `num` modulo `range` in such a way so it lies within
  // `range[0]` and `range[1]`. The returned value will be always smaller than
  // `range[1]` unless `includeMax` is set to `true`.
  function wrapNum(x, range, includeMax) {
  	var max = range[1],
  	    min = range[0],
  	    d = max - min;
  	return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
  }

  // @function falseFn(): Function
  // Returns a function which always returns `false`.
  function falseFn() { return false; }

  // @function formatNum(num: Number, digits?: Number): Number
  // Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
  function formatNum(num, digits) {
  	var pow = Math.pow(10, (digits === undefined ? 6 : digits));
  	return Math.round(num * pow) / pow;
  }

  // @function trim(str: String): String
  // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
  function trim(str) {
  	return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  // @function splitWords(str: String): String[]
  // Trims and splits the string on whitespace and returns the array of parts.
  function splitWords(str) {
  	return trim(str).split(/\s+/);
  }

  // @function setOptions(obj: Object, options: Object): Object
  // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
  function setOptions(obj, options) {
  	if (!Object.prototype.hasOwnProperty.call(obj, 'options')) {
  		obj.options = obj.options ? create(obj.options) : {};
  	}
  	for (var i in options) {
  		obj.options[i] = options[i];
  	}
  	return obj.options;
  }

  // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
  // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
  // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
  // be appended at the end. If `uppercase` is `true`, the parameter names will
  // be uppercased (e.g. `'?A=foo&B=bar'`)
  function getParamString(obj, existingUrl, uppercase) {
  	var params = [];
  	for (var i in obj) {
  		params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
  	}
  	return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
  }

  var templateRe = /\{ *([\w_-]+) *\}/g;

  // @function template(str: String, data: Object): String
  // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
  // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
  // `('Hello foo, bar')`. You can also specify functions instead of strings for
  // data values — they will be evaluated passing `data` as an argument.
  function template(str, data) {
  	return str.replace(templateRe, function (str, key) {
  		var value = data[key];

  		if (value === undefined) {
  			throw new Error('No value provided for variable ' + str);

  		} else if (typeof value === 'function') {
  			value = value(data);
  		}
  		return value;
  	});
  }

  // @function isArray(obj): Boolean
  // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
  var isArray = Array.isArray || function (obj) {
  	return (Object.prototype.toString.call(obj) === '[object Array]');
  };

  // @function indexOf(array: Array, el: Object): Number
  // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
  function indexOf(array, el) {
  	for (var i = 0; i < array.length; i++) {
  		if (array[i] === el) { return i; }
  	}
  	return -1;
  }

  // @property emptyImageUrl: String
  // Data URI string containing a base64-encoded empty GIF image.
  // Used as a hack to free memory from unused images on WebKit-powered
  // mobile devices (by setting image `src` to this string).
  var emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

  // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

  function getPrefixed(name) {
  	return window['webkit' + name] || window['moz' + name] || window['ms' + name];
  }

  var lastTime = 0;

  // fallback for IE 7-8
  function timeoutDefer(fn) {
  	var time = +new Date(),
  	    timeToCall = Math.max(0, 16 - (time - lastTime));

  	lastTime = time + timeToCall;
  	return window.setTimeout(fn, timeToCall);
  }

  var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
  var cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
  		getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };

  // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
  // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
  // `context` if given. When `immediate` is set, `fn` is called immediately if
  // the browser doesn't have native support for
  // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
  // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
  function requestAnimFrame(fn, context, immediate) {
  	if (immediate && requestFn === timeoutDefer) {
  		fn.call(context);
  	} else {
  		return requestFn.call(window, bind(fn, context));
  	}
  }

  // @function cancelAnimFrame(id: Number): undefined
  // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
  function cancelAnimFrame(id) {
  	if (id) {
  		cancelFn.call(window, id);
  	}
  }

  var Util = ({
    extend: extend,
    create: create,
    bind: bind,
    lastId: lastId,
    stamp: stamp,
    throttle: throttle,
    wrapNum: wrapNum,
    falseFn: falseFn,
    formatNum: formatNum,
    trim: trim,
    splitWords: splitWords,
    setOptions: setOptions,
    getParamString: getParamString,
    template: template,
    isArray: isArray,
    indexOf: indexOf,
    emptyImageUrl: emptyImageUrl,
    requestFn: requestFn,
    cancelFn: cancelFn,
    requestAnimFrame: requestAnimFrame,
    cancelAnimFrame: cancelAnimFrame
  });

  // @class Class
  // @aka L.Class

  // @section
  // @uninheritable

  // Thanks to John Resig and Dean Edwards for inspiration!

  function Class() {}

  Class.extend = function (props) {

  	// @function extend(props: Object): Function
  	// [Extends the current class](#class-inheritance) given the properties to be included.
  	// Returns a Javascript function that is a class constructor (to be called with `new`).
  	var NewClass = function () {

  		// call the constructor
  		if (this.initialize) {
  			this.initialize.apply(this, arguments);
  		}

  		// call all constructor hooks
  		this.callInitHooks();
  	};

  	var parentProto = NewClass.__super__ = this.prototype;

  	var proto = create(parentProto);
  	proto.constructor = NewClass;

  	NewClass.prototype = proto;

  	// inherit parent's statics
  	for (var i in this) {
  		if (Object.prototype.hasOwnProperty.call(this, i) && i !== 'prototype' && i !== '__super__') {
  			NewClass[i] = this[i];
  		}
  	}

  	// mix static properties into the class
  	if (props.statics) {
  		extend(NewClass, props.statics);
  		delete props.statics;
  	}

  	// mix includes into the prototype
  	if (props.includes) {
  		checkDeprecatedMixinEvents(props.includes);
  		extend.apply(null, [proto].concat(props.includes));
  		delete props.includes;
  	}

  	// merge options
  	if (proto.options) {
  		props.options = extend(create(proto.options), props.options);
  	}

  	// mix given properties into the prototype
  	extend(proto, props);

  	proto._initHooks = [];

  	// add method for calling all hooks
  	proto.callInitHooks = function () {

  		if (this._initHooksCalled) { return; }

  		if (parentProto.callInitHooks) {
  			parentProto.callInitHooks.call(this);
  		}

  		this._initHooksCalled = true;

  		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
  			proto._initHooks[i].call(this);
  		}
  	};

  	return NewClass;
  };


  // @function include(properties: Object): this
  // [Includes a mixin](#class-includes) into the current class.
  Class.include = function (props) {
  	extend(this.prototype, props);
  	return this;
  };

  // @function mergeOptions(options: Object): this
  // [Merges `options`](#class-options) into the defaults of the class.
  Class.mergeOptions = function (options) {
  	extend(this.prototype.options, options);
  	return this;
  };

  // @function addInitHook(fn: Function): this
  // Adds a [constructor hook](#class-constructor-hooks) to the class.
  Class.addInitHook = function (fn) { // (Function) || (String, args...)
  	var args = Array.prototype.slice.call(arguments, 1);

  	var init = typeof fn === 'function' ? fn : function () {
  		this[fn].apply(this, args);
  	};

  	this.prototype._initHooks = this.prototype._initHooks || [];
  	this.prototype._initHooks.push(init);
  	return this;
  };

  function checkDeprecatedMixinEvents(includes) {
  	if (typeof L === 'undefined' || !L || !L.Mixin) { return; }

  	includes = isArray(includes) ? includes : [includes];

  	for (var i = 0; i < includes.length; i++) {
  		if (includes[i] === L.Mixin.Events) {
  			console.warn('Deprecated include of L.Mixin.Events: ' +
  				'this property will be removed in future releases, ' +
  				'please inherit from L.Evented instead.', new Error().stack);
  		}
  	}
  }

  /*
   * @class Evented
   * @aka L.Evented
   * @inherits Class
   *
   * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
   *
   * @example
   *
   * ```js
   * map.on('click', function(e) {
   * 	alert(e.latlng);
   * } );
   * ```
   *
   * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
   *
   * ```js
   * function onClick(e) { ... }
   *
   * map.on('click', onClick);
   * map.off('click', onClick);
   * ```
   */

  var Events = {
  	/* @method on(type: String, fn: Function, context?: Object): this
  	 * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
  	 *
  	 * @alternative
  	 * @method on(eventMap: Object): this
  	 * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  	 */
  	on: function (types, fn, context) {

  		// types can be a map of types/handlers
  		if (typeof types === 'object') {
  			for (var type in types) {
  				// we don't process space-separated events here for performance;
  				// it's a hot path since Layer uses the on(obj) syntax
  				this._on(type, types[type], fn);
  			}

  		} else {
  			// types can be a string of space-separated words
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._on(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	/* @method off(type: String, fn?: Function, context?: Object): this
  	 * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
  	 *
  	 * @alternative
  	 * @method off(eventMap: Object): this
  	 * Removes a set of type/listener pairs.
  	 *
  	 * @alternative
  	 * @method off: this
  	 * Removes all listeners to all events on the object. This includes implicitly attached events.
  	 */
  	off: function (types, fn, context) {

  		if (!types) {
  			// clear all listeners if called without arguments
  			delete this._events;

  		} else if (typeof types === 'object') {
  			for (var type in types) {
  				this._off(type, types[type], fn);
  			}

  		} else {
  			types = splitWords(types);

  			for (var i = 0, len = types.length; i < len; i++) {
  				this._off(types[i], fn, context);
  			}
  		}

  		return this;
  	},

  	// attach listener (without syntactic sugar now)
  	_on: function (type, fn, context) {
  		this._events = this._events || {};

  		/* get/init listeners for type */
  		var typeListeners = this._events[type];
  		if (!typeListeners) {
  			typeListeners = [];
  			this._events[type] = typeListeners;
  		}

  		if (context === this) {
  			// Less memory footprint.
  			context = undefined;
  		}
  		var newListener = {fn: fn, ctx: context},
  		    listeners = typeListeners;

  		// check if fn already there
  		for (var i = 0, len = listeners.length; i < len; i++) {
  			if (listeners[i].fn === fn && listeners[i].ctx === context) {
  				return;
  			}
  		}

  		listeners.push(newListener);
  	},

  	_off: function (type, fn, context) {
  		var listeners,
  		    i,
  		    len;

  		if (!this._events) { return; }

  		listeners = this._events[type];

  		if (!listeners) {
  			return;
  		}

  		if (!fn) {
  			// Set all removed listeners to noop so they are not called if remove happens in fire
  			for (i = 0, len = listeners.length; i < len; i++) {
  				listeners[i].fn = falseFn;
  			}
  			// clear all listeners for a type if function isn't specified
  			delete this._events[type];
  			return;
  		}

  		if (context === this) {
  			context = undefined;
  		}

  		if (listeners) {

  			// find fn and remove it
  			for (i = 0, len = listeners.length; i < len; i++) {
  				var l = listeners[i];
  				if (l.ctx !== context) { continue; }
  				if (l.fn === fn) {

  					// set the removed listener to noop so that's not called if remove happens in fire
  					l.fn = falseFn;

  					if (this._firingCount) {
  						/* copy array in case events are being fired */
  						this._events[type] = listeners = listeners.slice();
  					}
  					listeners.splice(i, 1);

  					return;
  				}
  			}
  		}
  	},

  	// @method fire(type: String, data?: Object, propagate?: Boolean): this
  	// Fires an event of the specified type. You can optionally provide an data
  	// object — the first argument of the listener function will contain its
  	// properties. The event can optionally be propagated to event parents.
  	fire: function (type, data, propagate) {
  		if (!this.listens(type, propagate)) { return this; }

  		var event = extend({}, data, {
  			type: type,
  			target: this,
  			sourceTarget: data && data.sourceTarget || this
  		});

  		if (this._events) {
  			var listeners = this._events[type];

  			if (listeners) {
  				this._firingCount = (this._firingCount + 1) || 1;
  				for (var i = 0, len = listeners.length; i < len; i++) {
  					var l = listeners[i];
  					l.fn.call(l.ctx || this, event);
  				}

  				this._firingCount--;
  			}
  		}

  		if (propagate) {
  			// propagate the event to parents (set with addEventParent)
  			this._propagateEvent(event);
  		}

  		return this;
  	},

  	// @method listens(type: String): Boolean
  	// Returns `true` if a particular event type has any listeners attached to it.
  	listens: function (type, propagate) {
  		var listeners = this._events && this._events[type];
  		if (listeners && listeners.length) { return true; }

  		if (propagate) {
  			// also check parents for listeners if event propagates
  			for (var id in this._eventParents) {
  				if (this._eventParents[id].listens(type, propagate)) { return true; }
  			}
  		}
  		return false;
  	},

  	// @method once(…): this
  	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  	once: function (types, fn, context) {

  		if (typeof types === 'object') {
  			for (var type in types) {
  				this.once(type, types[type], fn);
  			}
  			return this;
  		}

  		var handler = bind(function () {
  			this
  			    .off(types, fn, context)
  			    .off(types, handler, context);
  		}, this);

  		// add a listener that's executed once and removed after that
  		return this
  		    .on(types, fn, context)
  		    .on(types, handler, context);
  	},

  	// @method addEventParent(obj: Evented): this
  	// Adds an event parent - an `Evented` that will receive propagated events
  	addEventParent: function (obj) {
  		this._eventParents = this._eventParents || {};
  		this._eventParents[stamp(obj)] = obj;
  		return this;
  	},

  	// @method removeEventParent(obj: Evented): this
  	// Removes an event parent, so it will stop receiving propagated events
  	removeEventParent: function (obj) {
  		if (this._eventParents) {
  			delete this._eventParents[stamp(obj)];
  		}
  		return this;
  	},

  	_propagateEvent: function (e) {
  		for (var id in this._eventParents) {
  			this._eventParents[id].fire(e.type, extend({
  				layer: e.target,
  				propagatedFrom: e.target
  			}, e), true);
  		}
  	}
  };

  // aliases; we should ditch those eventually

  // @method addEventListener(…): this
  // Alias to [`on(…)`](#evented-on)
  Events.addEventListener = Events.on;

  // @method removeEventListener(…): this
  // Alias to [`off(…)`](#evented-off)

  // @method clearAllEventListeners(…): this
  // Alias to [`off()`](#evented-off)
  Events.removeEventListener = Events.clearAllEventListeners = Events.off;

  // @method addOneTimeEventListener(…): this
  // Alias to [`once(…)`](#evented-once)
  Events.addOneTimeEventListener = Events.once;

  // @method fireEvent(…): this
  // Alias to [`fire(…)`](#evented-fire)
  Events.fireEvent = Events.fire;

  // @method hasEventListeners(…): Boolean
  // Alias to [`listens(…)`](#evented-listens)
  Events.hasEventListeners = Events.listens;

  var Evented = Class.extend(Events);

  /*
   * @class Point
   * @aka L.Point
   *
   * Represents a point with `x` and `y` coordinates in pixels.
   *
   * @example
   *
   * ```js
   * var point = L.point(200, 300);
   * ```
   *
   * All Leaflet methods and options that accept `Point` objects also accept them in a simple Array form (unless noted otherwise), so these lines are equivalent:
   *
   * ```js
   * map.panBy([200, 300]);
   * map.panBy(L.point(200, 300));
   * ```
   *
   * Note that `Point` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Point(x, y, round) {
  	// @property x: Number; The `x` coordinate of the point
  	this.x = (round ? Math.round(x) : x);
  	// @property y: Number; The `y` coordinate of the point
  	this.y = (round ? Math.round(y) : y);
  }

  var trunc = Math.trunc || function (v) {
  	return v > 0 ? Math.floor(v) : Math.ceil(v);
  };

  Point.prototype = {

  	// @method clone(): Point
  	// Returns a copy of the current point.
  	clone: function () {
  		return new Point(this.x, this.y);
  	},

  	// @method add(otherPoint: Point): Point
  	// Returns the result of addition of the current and the given points.
  	add: function (point) {
  		// non-destructive, returns a new point
  		return this.clone()._add(toPoint(point));
  	},

  	_add: function (point) {
  		// destructive, used directly for performance in situations where it's safe to modify existing point
  		this.x += point.x;
  		this.y += point.y;
  		return this;
  	},

  	// @method subtract(otherPoint: Point): Point
  	// Returns the result of subtraction of the given point from the current.
  	subtract: function (point) {
  		return this.clone()._subtract(toPoint(point));
  	},

  	_subtract: function (point) {
  		this.x -= point.x;
  		this.y -= point.y;
  		return this;
  	},

  	// @method divideBy(num: Number): Point
  	// Returns the result of division of the current point by the given number.
  	divideBy: function (num) {
  		return this.clone()._divideBy(num);
  	},

  	_divideBy: function (num) {
  		this.x /= num;
  		this.y /= num;
  		return this;
  	},

  	// @method multiplyBy(num: Number): Point
  	// Returns the result of multiplication of the current point by the given number.
  	multiplyBy: function (num) {
  		return this.clone()._multiplyBy(num);
  	},

  	_multiplyBy: function (num) {
  		this.x *= num;
  		this.y *= num;
  		return this;
  	},

  	// @method scaleBy(scale: Point): Point
  	// Multiply each coordinate of the current point by each coordinate of
  	// `scale`. In linear algebra terms, multiply the point by the
  	// [scaling matrix](https://en.wikipedia.org/wiki/Scaling_%28geometry%29#Matrix_representation)
  	// defined by `scale`.
  	scaleBy: function (point) {
  		return new Point(this.x * point.x, this.y * point.y);
  	},

  	// @method unscaleBy(scale: Point): Point
  	// Inverse of `scaleBy`. Divide each coordinate of the current point by
  	// each coordinate of `scale`.
  	unscaleBy: function (point) {
  		return new Point(this.x / point.x, this.y / point.y);
  	},

  	// @method round(): Point
  	// Returns a copy of the current point with rounded coordinates.
  	round: function () {
  		return this.clone()._round();
  	},

  	_round: function () {
  		this.x = Math.round(this.x);
  		this.y = Math.round(this.y);
  		return this;
  	},

  	// @method floor(): Point
  	// Returns a copy of the current point with floored coordinates (rounded down).
  	floor: function () {
  		return this.clone()._floor();
  	},

  	_floor: function () {
  		this.x = Math.floor(this.x);
  		this.y = Math.floor(this.y);
  		return this;
  	},

  	// @method ceil(): Point
  	// Returns a copy of the current point with ceiled coordinates (rounded up).
  	ceil: function () {
  		return this.clone()._ceil();
  	},

  	_ceil: function () {
  		this.x = Math.ceil(this.x);
  		this.y = Math.ceil(this.y);
  		return this;
  	},

  	// @method trunc(): Point
  	// Returns a copy of the current point with truncated coordinates (rounded towards zero).
  	trunc: function () {
  		return this.clone()._trunc();
  	},

  	_trunc: function () {
  		this.x = trunc(this.x);
  		this.y = trunc(this.y);
  		return this;
  	},

  	// @method distanceTo(otherPoint: Point): Number
  	// Returns the cartesian distance between the current and the given points.
  	distanceTo: function (point) {
  		point = toPoint(point);

  		var x = point.x - this.x,
  		    y = point.y - this.y;

  		return Math.sqrt(x * x + y * y);
  	},

  	// @method equals(otherPoint: Point): Boolean
  	// Returns `true` if the given point has the same coordinates.
  	equals: function (point) {
  		point = toPoint(point);

  		return point.x === this.x &&
  		       point.y === this.y;
  	},

  	// @method contains(otherPoint: Point): Boolean
  	// Returns `true` if both coordinates of the given point are less than the corresponding current point coordinates (in absolute values).
  	contains: function (point) {
  		point = toPoint(point);

  		return Math.abs(point.x) <= Math.abs(this.x) &&
  		       Math.abs(point.y) <= Math.abs(this.y);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point for debugging purposes.
  	toString: function () {
  		return 'Point(' +
  		        formatNum(this.x) + ', ' +
  		        formatNum(this.y) + ')';
  	}
  };

  // @factory L.point(x: Number, y: Number, round?: Boolean)
  // Creates a Point object with the given `x` and `y` coordinates. If optional `round` is set to true, rounds the `x` and `y` values.

  // @alternative
  // @factory L.point(coords: Number[])
  // Expects an array of the form `[x, y]` instead.

  // @alternative
  // @factory L.point(coords: Object)
  // Expects a plain object of the form `{x: Number, y: Number}` instead.
  function toPoint(x, y, round) {
  	if (x instanceof Point) {
  		return x;
  	}
  	if (isArray(x)) {
  		return new Point(x[0], x[1]);
  	}
  	if (x === undefined || x === null) {
  		return x;
  	}
  	if (typeof x === 'object' && 'x' in x && 'y' in x) {
  		return new Point(x.x, x.y);
  	}
  	return new Point(x, y, round);
  }

  /*
   * @class Bounds
   * @aka L.Bounds
   *
   * Represents a rectangular area in pixel coordinates.
   *
   * @example
   *
   * ```js
   * var p1 = L.point(10, 10),
   * p2 = L.point(40, 60),
   * bounds = L.bounds(p1, p2);
   * ```
   *
   * All Leaflet methods that accept `Bounds` objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * otherBounds.intersects([[10, 10], [40, 60]]);
   * ```
   *
   * Note that `Bounds` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function Bounds(a, b) {
  	if (!a) { return; }

  	var points = b ? [a, b] : a;

  	for (var i = 0, len = points.length; i < len; i++) {
  		this.extend(points[i]);
  	}
  }

  Bounds.prototype = {
  	// @method extend(point: Point): this
  	// Extends the bounds to contain the given point.
  	extend: function (point) { // (Point)
  		point = toPoint(point);

  		// @property min: Point
  		// The top left corner of the rectangle.
  		// @property max: Point
  		// The bottom right corner of the rectangle.
  		if (!this.min && !this.max) {
  			this.min = point.clone();
  			this.max = point.clone();
  		} else {
  			this.min.x = Math.min(point.x, this.min.x);
  			this.max.x = Math.max(point.x, this.max.x);
  			this.min.y = Math.min(point.y, this.min.y);
  			this.max.y = Math.max(point.y, this.max.y);
  		}
  		return this;
  	},

  	// @method getCenter(round?: Boolean): Point
  	// Returns the center point of the bounds.
  	getCenter: function (round) {
  		return new Point(
  		        (this.min.x + this.max.x) / 2,
  		        (this.min.y + this.max.y) / 2, round);
  	},

  	// @method getBottomLeft(): Point
  	// Returns the bottom-left point of the bounds.
  	getBottomLeft: function () {
  		return new Point(this.min.x, this.max.y);
  	},

  	// @method getTopRight(): Point
  	// Returns the top-right point of the bounds.
  	getTopRight: function () { // -> Point
  		return new Point(this.max.x, this.min.y);
  	},

  	// @method getTopLeft(): Point
  	// Returns the top-left point of the bounds (i.e. [`this.min`](#bounds-min)).
  	getTopLeft: function () {
  		return this.min; // left, top
  	},

  	// @method getBottomRight(): Point
  	// Returns the bottom-right point of the bounds (i.e. [`this.max`](#bounds-max)).
  	getBottomRight: function () {
  		return this.max; // right, bottom
  	},

  	// @method getSize(): Point
  	// Returns the size of the given bounds
  	getSize: function () {
  		return this.max.subtract(this.min);
  	},

  	// @method contains(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle contains the given one.
  	// @alternative
  	// @method contains(point: Point): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) {
  		var min, max;

  		if (typeof obj[0] === 'number' || obj instanceof Point) {
  			obj = toPoint(obj);
  		} else {
  			obj = toBounds(obj);
  		}

  		if (obj instanceof Bounds) {
  			min = obj.min;
  			max = obj.max;
  		} else {
  			min = max = obj;
  		}

  		return (min.x >= this.min.x) &&
  		       (max.x <= this.max.x) &&
  		       (min.y >= this.min.y) &&
  		       (max.y <= this.max.y);
  	},

  	// @method intersects(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds
  	// intersect if they have at least one point in common.
  	intersects: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
  		    yIntersects = (max2.y >= min.y) && (min2.y <= max.y);

  		return xIntersects && yIntersects;
  	},

  	// @method overlaps(otherBounds: Bounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds
  	// overlap if their intersection is an area.
  	overlaps: function (bounds) { // (Bounds) -> Boolean
  		bounds = toBounds(bounds);

  		var min = this.min,
  		    max = this.max,
  		    min2 = bounds.min,
  		    max2 = bounds.max,
  		    xOverlaps = (max2.x > min.x) && (min2.x < max.x),
  		    yOverlaps = (max2.y > min.y) && (min2.y < max.y);

  		return xOverlaps && yOverlaps;
  	},

  	isValid: function () {
  		return !!(this.min && this.max);
  	}
  };


  // @factory L.bounds(corner1: Point, corner2: Point)
  // Creates a Bounds object from two corners coordinate pairs.
  // @alternative
  // @factory L.bounds(points: Point[])
  // Creates a Bounds object from the given array of points.
  function toBounds(a, b) {
  	if (!a || a instanceof Bounds) {
  		return a;
  	}
  	return new Bounds(a, b);
  }

  /*
   * @class LatLngBounds
   * @aka L.LatLngBounds
   *
   * Represents a rectangular geographical area on a map.
   *
   * @example
   *
   * ```js
   * var corner1 = L.latLng(40.712, -74.227),
   * corner2 = L.latLng(40.774, -74.125),
   * bounds = L.latLngBounds(corner1, corner2);
   * ```
   *
   * All Leaflet methods that accept LatLngBounds objects also accept them in a simple Array form (unless noted otherwise), so the bounds example above can be passed like this:
   *
   * ```js
   * map.fitBounds([
   * 	[40.712, -74.227],
   * 	[40.774, -74.125]
   * ]);
   * ```
   *
   * Caution: if the area crosses the antimeridian (often confused with the International Date Line), you must specify corners _outside_ the [-180, 180] degrees longitude range.
   *
   * Note that `LatLngBounds` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLngBounds(corner1, corner2) { // (LatLng, LatLng) or (LatLng[])
  	if (!corner1) { return; }

  	var latlngs = corner2 ? [corner1, corner2] : corner1;

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		this.extend(latlngs[i]);
  	}
  }

  LatLngBounds.prototype = {

  	// @method extend(latlng: LatLng): this
  	// Extend the bounds to contain the given point

  	// @alternative
  	// @method extend(otherBounds: LatLngBounds): this
  	// Extend the bounds to contain the given bounds
  	extend: function (obj) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLng) {
  			sw2 = obj;
  			ne2 = obj;

  		} else if (obj instanceof LatLngBounds) {
  			sw2 = obj._southWest;
  			ne2 = obj._northEast;

  			if (!sw2 || !ne2) { return this; }

  		} else {
  			return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
  		}

  		if (!sw && !ne) {
  			this._southWest = new LatLng(sw2.lat, sw2.lng);
  			this._northEast = new LatLng(ne2.lat, ne2.lng);
  		} else {
  			sw.lat = Math.min(sw2.lat, sw.lat);
  			sw.lng = Math.min(sw2.lng, sw.lng);
  			ne.lat = Math.max(ne2.lat, ne.lat);
  			ne.lng = Math.max(ne2.lng, ne.lng);
  		}

  		return this;
  	},

  	// @method pad(bufferRatio: Number): LatLngBounds
  	// Returns bounds created by extending or retracting the current bounds by a given ratio in each direction.
  	// For example, a ratio of 0.5 extends the bounds by 50% in each direction.
  	// Negative values will retract the bounds.
  	pad: function (bufferRatio) {
  		var sw = this._southWest,
  		    ne = this._northEast,
  		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
  		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;

  		return new LatLngBounds(
  		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
  		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer));
  	},

  	// @method getCenter(): LatLng
  	// Returns the center point of the bounds.
  	getCenter: function () {
  		return new LatLng(
  		        (this._southWest.lat + this._northEast.lat) / 2,
  		        (this._southWest.lng + this._northEast.lng) / 2);
  	},

  	// @method getSouthWest(): LatLng
  	// Returns the south-west point of the bounds.
  	getSouthWest: function () {
  		return this._southWest;
  	},

  	// @method getNorthEast(): LatLng
  	// Returns the north-east point of the bounds.
  	getNorthEast: function () {
  		return this._northEast;
  	},

  	// @method getNorthWest(): LatLng
  	// Returns the north-west point of the bounds.
  	getNorthWest: function () {
  		return new LatLng(this.getNorth(), this.getWest());
  	},

  	// @method getSouthEast(): LatLng
  	// Returns the south-east point of the bounds.
  	getSouthEast: function () {
  		return new LatLng(this.getSouth(), this.getEast());
  	},

  	// @method getWest(): Number
  	// Returns the west longitude of the bounds
  	getWest: function () {
  		return this._southWest.lng;
  	},

  	// @method getSouth(): Number
  	// Returns the south latitude of the bounds
  	getSouth: function () {
  		return this._southWest.lat;
  	},

  	// @method getEast(): Number
  	// Returns the east longitude of the bounds
  	getEast: function () {
  		return this._northEast.lng;
  	},

  	// @method getNorth(): Number
  	// Returns the north latitude of the bounds
  	getNorth: function () {
  		return this._northEast.lat;
  	},

  	// @method contains(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle contains the given one.

  	// @alternative
  	// @method contains (latlng: LatLng): Boolean
  	// Returns `true` if the rectangle contains the given point.
  	contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
  		if (typeof obj[0] === 'number' || obj instanceof LatLng || 'lat' in obj) {
  			obj = toLatLng(obj);
  		} else {
  			obj = toLatLngBounds(obj);
  		}

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2, ne2;

  		if (obj instanceof LatLngBounds) {
  			sw2 = obj.getSouthWest();
  			ne2 = obj.getNorthEast();
  		} else {
  			sw2 = ne2 = obj;
  		}

  		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
  		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);
  	},

  	// @method intersects(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle intersects the given bounds. Two bounds intersect if they have at least one point in common.
  	intersects: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
  		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng);

  		return latIntersects && lngIntersects;
  	},

  	// @method overlaps(otherBounds: LatLngBounds): Boolean
  	// Returns `true` if the rectangle overlaps the given bounds. Two bounds overlap if their intersection is an area.
  	overlaps: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		var sw = this._southWest,
  		    ne = this._northEast,
  		    sw2 = bounds.getSouthWest(),
  		    ne2 = bounds.getNorthEast(),

  		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
  		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng);

  		return latOverlaps && lngOverlaps;
  	},

  	// @method toBBoxString(): String
  	// Returns a string with bounding box coordinates in a 'southwest_lng,southwest_lat,northeast_lng,northeast_lat' format. Useful for sending requests to web services that return geo data.
  	toBBoxString: function () {
  		return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
  	},

  	// @method equals(otherBounds: LatLngBounds, maxMargin?: Number): Boolean
  	// Returns `true` if the rectangle is equivalent (within a small margin of error) to the given bounds. The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (bounds, maxMargin) {
  		if (!bounds) { return false; }

  		bounds = toLatLngBounds(bounds);

  		return this._southWest.equals(bounds.getSouthWest(), maxMargin) &&
  		       this._northEast.equals(bounds.getNorthEast(), maxMargin);
  	},

  	// @method isValid(): Boolean
  	// Returns `true` if the bounds are properly initialized.
  	isValid: function () {
  		return !!(this._southWest && this._northEast);
  	}
  };

  // TODO International date line?

  // @factory L.latLngBounds(corner1: LatLng, corner2: LatLng)
  // Creates a `LatLngBounds` object by defining two diagonally opposite corners of the rectangle.

  // @alternative
  // @factory L.latLngBounds(latlngs: LatLng[])
  // Creates a `LatLngBounds` object defined by the geographical points it contains. Very useful for zooming the map to fit a particular set of locations with [`fitBounds`](#map-fitbounds).
  function toLatLngBounds(a, b) {
  	if (a instanceof LatLngBounds) {
  		return a;
  	}
  	return new LatLngBounds(a, b);
  }

  /* @class LatLng
   * @aka L.LatLng
   *
   * Represents a geographical point with a certain latitude and longitude.
   *
   * @example
   *
   * ```
   * var latlng = L.latLng(50.5, 30.5);
   * ```
   *
   * All Leaflet methods that accept LatLng objects also accept them in a simple Array form and simple object form (unless noted otherwise), so these lines are equivalent:
   *
   * ```
   * map.panTo([50, 30]);
   * map.panTo({lon: 30, lat: 50});
   * map.panTo({lat: 50, lng: 30});
   * map.panTo(L.latLng(50, 30));
   * ```
   *
   * Note that `LatLng` does not inherit from Leaflet's `Class` object,
   * which means new classes can't inherit from it, and new methods
   * can't be added to it with the `include` function.
   */

  function LatLng(lat, lng, alt) {
  	if (isNaN(lat) || isNaN(lng)) {
  		throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
  	}

  	// @property lat: Number
  	// Latitude in degrees
  	this.lat = +lat;

  	// @property lng: Number
  	// Longitude in degrees
  	this.lng = +lng;

  	// @property alt: Number
  	// Altitude in meters (optional)
  	if (alt !== undefined) {
  		this.alt = +alt;
  	}
  }

  LatLng.prototype = {
  	// @method equals(otherLatLng: LatLng, maxMargin?: Number): Boolean
  	// Returns `true` if the given `LatLng` point is at the same position (within a small margin of error). The margin of error can be overridden by setting `maxMargin` to a small number.
  	equals: function (obj, maxMargin) {
  		if (!obj) { return false; }

  		obj = toLatLng(obj);

  		var margin = Math.max(
  		        Math.abs(this.lat - obj.lat),
  		        Math.abs(this.lng - obj.lng));

  		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin);
  	},

  	// @method toString(): String
  	// Returns a string representation of the point (for debugging purposes).
  	toString: function (precision) {
  		return 'LatLng(' +
  		        formatNum(this.lat, precision) + ', ' +
  		        formatNum(this.lng, precision) + ')';
  	},

  	// @method distanceTo(otherLatLng: LatLng): Number
  	// Returns the distance (in meters) to the given `LatLng` calculated using the [Spherical Law of Cosines](https://en.wikipedia.org/wiki/Spherical_law_of_cosines).
  	distanceTo: function (other) {
  		return Earth.distance(this, toLatLng(other));
  	},

  	// @method wrap(): LatLng
  	// Returns a new `LatLng` object with the longitude wrapped so it's always between -180 and +180 degrees.
  	wrap: function () {
  		return Earth.wrapLatLng(this);
  	},

  	// @method toBounds(sizeInMeters: Number): LatLngBounds
  	// Returns a new `LatLngBounds` object in which each boundary is `sizeInMeters/2` meters apart from the `LatLng`.
  	toBounds: function (sizeInMeters) {
  		var latAccuracy = 180 * sizeInMeters / 40075017,
  		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat);

  		return toLatLngBounds(
  		        [this.lat - latAccuracy, this.lng - lngAccuracy],
  		        [this.lat + latAccuracy, this.lng + lngAccuracy]);
  	},

  	clone: function () {
  		return new LatLng(this.lat, this.lng, this.alt);
  	}
  };



  // @factory L.latLng(latitude: Number, longitude: Number, altitude?: Number): LatLng
  // Creates an object representing a geographical point with the given latitude and longitude (and optionally altitude).

  // @alternative
  // @factory L.latLng(coords: Array): LatLng
  // Expects an array of the form `[Number, Number]` or `[Number, Number, Number]` instead.

  // @alternative
  // @factory L.latLng(coords: Object): LatLng
  // Expects an plain object of the form `{lat: Number, lng: Number}` or `{lat: Number, lng: Number, alt: Number}` instead.

  function toLatLng(a, b, c) {
  	if (a instanceof LatLng) {
  		return a;
  	}
  	if (isArray(a) && typeof a[0] !== 'object') {
  		if (a.length === 3) {
  			return new LatLng(a[0], a[1], a[2]);
  		}
  		if (a.length === 2) {
  			return new LatLng(a[0], a[1]);
  		}
  		return null;
  	}
  	if (a === undefined || a === null) {
  		return a;
  	}
  	if (typeof a === 'object' && 'lat' in a) {
  		return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt);
  	}
  	if (b === undefined) {
  		return null;
  	}
  	return new LatLng(a, b, c);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.Base
   * Object that defines coordinate reference systems for projecting
   * geographical points into pixel (screen) coordinates and back (and to
   * coordinates in other units for [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services). See
   * [spatial reference system](http://en.wikipedia.org/wiki/Coordinate_reference_system).
   *
   * Leaflet defines the most usual CRSs by default. If you want to use a
   * CRS not defined by default, take a look at the
   * [Proj4Leaflet](https://github.com/kartena/Proj4Leaflet) plugin.
   *
   * Note that the CRS instances do not inherit from Leaflet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.
   */

  var CRS = {
  	// @method latLngToPoint(latlng: LatLng, zoom: Number): Point
  	// Projects geographical coordinates into pixel coordinates for a given zoom.
  	latLngToPoint: function (latlng, zoom) {
  		var projectedPoint = this.projection.project(latlng),
  		    scale = this.scale(zoom);

  		return this.transformation._transform(projectedPoint, scale);
  	},

  	// @method pointToLatLng(point: Point, zoom: Number): LatLng
  	// The inverse of `latLngToPoint`. Projects pixel coordinates on a given
  	// zoom into geographical coordinates.
  	pointToLatLng: function (point, zoom) {
  		var scale = this.scale(zoom),
  		    untransformedPoint = this.transformation.untransform(point, scale);

  		return this.projection.unproject(untransformedPoint);
  	},

  	// @method project(latlng: LatLng): Point
  	// Projects geographical coordinates into coordinates in units accepted for
  	// this CRS (e.g. meters for EPSG:3857, for passing it to WMS services).
  	project: function (latlng) {
  		return this.projection.project(latlng);
  	},

  	// @method unproject(point: Point): LatLng
  	// Given a projected coordinate returns the corresponding LatLng.
  	// The inverse of `project`.
  	unproject: function (point) {
  		return this.projection.unproject(point);
  	},

  	// @method scale(zoom: Number): Number
  	// Returns the scale used when transforming projected coordinates into
  	// pixel coordinates for a particular zoom. For example, it returns
  	// `256 * 2^zoom` for Mercator-based CRS.
  	scale: function (zoom) {
  		return 256 * Math.pow(2, zoom);
  	},

  	// @method zoom(scale: Number): Number
  	// Inverse of `scale()`, returns the zoom level corresponding to a scale
  	// factor of `scale`.
  	zoom: function (scale) {
  		return Math.log(scale / 256) / Math.LN2;
  	},

  	// @method getProjectedBounds(zoom: Number): Bounds
  	// Returns the projection's bounds scaled and transformed for the provided `zoom`.
  	getProjectedBounds: function (zoom) {
  		if (this.infinite) { return null; }

  		var b = this.projection.bounds,
  		    s = this.scale(zoom),
  		    min = this.transformation.transform(b.min, s),
  		    max = this.transformation.transform(b.max, s);

  		return new Bounds(min, max);
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates.

  	// @property code: String
  	// Standard code name of the CRS passed into WMS services (e.g. `'EPSG:3857'`)
  	//
  	// @property wrapLng: Number[]
  	// An array of two numbers defining whether the longitude (horizontal) coordinate
  	// axis wraps around a given range and how. Defaults to `[-180, 180]` in most
  	// geographical CRSs. If `undefined`, the longitude axis does not wrap around.
  	//
  	// @property wrapLat: Number[]
  	// Like `wrapLng`, but for the latitude (vertical) axis.

  	// wrapLng: [min, max],
  	// wrapLat: [min, max],

  	// @property infinite: Boolean
  	// If true, the coordinate space will be unbounded (infinite in both axes)
  	infinite: false,

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where lat and lng has been wrapped according to the
  	// CRS's `wrapLat` and `wrapLng` properties, if they are outside the CRS's bounds.
  	wrapLatLng: function (latlng) {
  		var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
  		    lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
  		    alt = latlng.alt;

  		return new LatLng(lat, lng, alt);
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring
  	// that its center is within the CRS's bounds.
  	// Only accepts actual `L.LatLngBounds` instances, not arrays.
  	wrapLatLngBounds: function (bounds) {
  		var center = bounds.getCenter(),
  		    newCenter = this.wrapLatLng(center),
  		    latShift = center.lat - newCenter.lat,
  		    lngShift = center.lng - newCenter.lng;

  		if (latShift === 0 && lngShift === 0) {
  			return bounds;
  		}

  		var sw = bounds.getSouthWest(),
  		    ne = bounds.getNorthEast(),
  		    newSw = new LatLng(sw.lat - latShift, sw.lng - lngShift),
  		    newNe = new LatLng(ne.lat - latShift, ne.lng - lngShift);

  		return new LatLngBounds(newSw, newNe);
  	}
  };

  /*
   * @namespace CRS
   * @crs L.CRS.Earth
   *
   * Serves as the base for CRS that are global such that they cover the earth.
   * Can only be used as the base for other CRS and cannot be used directly,
   * since it does not have a `code`, `projection` or `transformation`. `distance()` returns
   * meters.
   */

  var Earth = extend({}, CRS, {
  	wrapLng: [-180, 180],

  	// Mean Earth Radius, as recommended for use by
  	// the International Union of Geodesy and Geophysics,
  	// see http://rosettacode.org/wiki/Haversine_formula
  	R: 6371000,

  	// distance between two geographical points using spherical law of cosines approximation
  	distance: function (latlng1, latlng2) {
  		var rad = Math.PI / 180,
  		    lat1 = latlng1.lat * rad,
  		    lat2 = latlng2.lat * rad,
  		    sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2),
  		    sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2),
  		    a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon,
  		    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  		return this.R * c;
  	}
  });

  /*
   * @namespace Projection
   * @projection L.Projection.SphericalMercator
   *
   * Spherical Mercator projection — the most common projection for online maps,
   * used by almost all free and commercial tile providers. Assumes that Earth is
   * a sphere. Used by the `EPSG:3857` CRS.
   */

  var earthRadius = 6378137;

  var SphericalMercator = {

  	R: earthRadius,
  	MAX_LATITUDE: 85.0511287798,

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    max = this.MAX_LATITUDE,
  		    lat = Math.max(Math.min(max, latlng.lat), -max),
  		    sin = Math.sin(lat * d);

  		return new Point(
  			this.R * latlng.lng * d,
  			this.R * Math.log((1 + sin) / (1 - sin)) / 2);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI;

  		return new LatLng(
  			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
  			point.x * d / this.R);
  	},

  	bounds: (function () {
  		var d = earthRadius * Math.PI;
  		return new Bounds([-d, -d], [d, d]);
  	})()
  };

  /*
   * @class Transformation
   * @aka L.Transformation
   *
   * Represents an affine transformation: a set of coefficients `a`, `b`, `c`, `d`
   * for transforming a point of a form `(x, y)` into `(a*x + b, c*y + d)` and doing
   * the reverse. Used by Leaflet in its projections code.
   *
   * @example
   *
   * ```js
   * var transformation = L.transformation(2, 5, -1, 10),
   * 	p = L.point(1, 2),
   * 	p2 = transformation.transform(p), //  L.point(7, 8)
   * 	p3 = transformation.untransform(p2); //  L.point(1, 2)
   * ```
   */


  // factory new L.Transformation(a: Number, b: Number, c: Number, d: Number)
  // Creates a `Transformation` object with the given coefficients.
  function Transformation(a, b, c, d) {
  	if (isArray(a)) {
  		// use array properties
  		this._a = a[0];
  		this._b = a[1];
  		this._c = a[2];
  		this._d = a[3];
  		return;
  	}
  	this._a = a;
  	this._b = b;
  	this._c = c;
  	this._d = d;
  }

  Transformation.prototype = {
  	// @method transform(point: Point, scale?: Number): Point
  	// Returns a transformed point, optionally multiplied by the given scale.
  	// Only accepts actual `L.Point` instances, not arrays.
  	transform: function (point, scale) { // (Point, Number) -> Point
  		return this._transform(point.clone(), scale);
  	},

  	// destructive transform (faster)
  	_transform: function (point, scale) {
  		scale = scale || 1;
  		point.x = scale * (this._a * point.x + this._b);
  		point.y = scale * (this._c * point.y + this._d);
  		return point;
  	},

  	// @method untransform(point: Point, scale?: Number): Point
  	// Returns the reverse transformation of the given point, optionally divided
  	// by the given scale. Only accepts actual `L.Point` instances, not arrays.
  	untransform: function (point, scale) {
  		scale = scale || 1;
  		return new Point(
  		        (point.x / scale - this._b) / this._a,
  		        (point.y / scale - this._d) / this._c);
  	}
  };

  // factory L.transformation(a: Number, b: Number, c: Number, d: Number)

  // @factory L.transformation(a: Number, b: Number, c: Number, d: Number)
  // Instantiates a Transformation object with the given coefficients.

  // @alternative
  // @factory L.transformation(coefficients: Array): Transformation
  // Expects an coefficients array of the form
  // `[a: Number, b: Number, c: Number, d: Number]`.

  function toTransformation(a, b, c, d) {
  	return new Transformation(a, b, c, d);
  }

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3857
   *
   * The most common CRS for online maps, used by almost all free and commercial
   * tile providers. Uses Spherical Mercator projection. Set in by default in
   * Map's `crs` option.
   */

  var EPSG3857 = extend({}, Earth, {
  	code: 'EPSG:3857',
  	projection: SphericalMercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * SphericalMercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  var EPSG900913 = extend({}, EPSG3857, {
  	code: 'EPSG:900913'
  });

  // @namespace SVG; @section
  // There are several static functions which can be called without instantiating L.SVG:

  // @function create(name: String): SVGElement
  // Returns a instance of [SVGElement](https://developer.mozilla.org/docs/Web/API/SVGElement),
  // corresponding to the class name passed. For example, using 'line' will return
  // an instance of [SVGLineElement](https://developer.mozilla.org/docs/Web/API/SVGLineElement).
  function svgCreate(name) {
  	return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  // @function pointsToPath(rings: Point[], closed: Boolean): String
  // Generates a SVG path string for multiple rings, with each ring turning
  // into "M..L..L.." instructions
  function pointsToPath(rings, closed) {
  	var str = '',
  	i, j, len, len2, points, p;

  	for (i = 0, len = rings.length; i < len; i++) {
  		points = rings[i];

  		for (j = 0, len2 = points.length; j < len2; j++) {
  			p = points[j];
  			str += (j ? 'L' : 'M') + p.x + ' ' + p.y;
  		}

  		// closes the ring for polygons; "x" is VML syntax
  		str += closed ? (svg ? 'z' : 'x') : '';
  	}

  	// SVG complains about empty path strings
  	return str || 'M0 0';
  }

  /*
   * @namespace Browser
   * @aka L.Browser
   *
   * A namespace with static properties for browser/feature detection used by Leaflet internally.
   *
   * @example
   *
   * ```js
   * if (L.Browser.ielt9) {
   *   alert('Upgrade your browser, dude!');
   * }
   * ```
   */

  var style$1 = document.documentElement.style;

  // @property ie: Boolean; `true` for all Internet Explorer versions (not Edge).
  var ie = 'ActiveXObject' in window;

  // @property ielt9: Boolean; `true` for Internet Explorer versions less than 9.
  var ielt9 = ie && !document.addEventListener;

  // @property edge: Boolean; `true` for the Edge web browser.
  var edge = 'msLaunchUri' in navigator && !('documentMode' in document);

  // @property webkit: Boolean;
  // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
  var webkit = userAgentContains('webkit');

  // @property android: Boolean
  // `true` for any browser running on an Android platform.
  var android = userAgentContains('android');

  // @property android23: Boolean; `true` for browsers running on Android 2 or Android 3.
  var android23 = userAgentContains('android 2') || userAgentContains('android 3');

  /* See https://stackoverflow.com/a/17961266 for details on detecting stock Android */
  var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10); // also matches AppleWebKit
  // @property androidStock: Boolean; `true` for the Android stock browser (i.e. not Chrome)
  var androidStock = android && userAgentContains('Google') && webkitVer < 537 && !('AudioNode' in window);

  // @property opera: Boolean; `true` for the Opera browser
  var opera = !!window.opera;

  // @property chrome: Boolean; `true` for the Chrome browser.
  var chrome = !edge && userAgentContains('chrome');

  // @property gecko: Boolean; `true` for gecko-based browsers like Firefox.
  var gecko = userAgentContains('gecko') && !webkit && !opera && !ie;

  // @property safari: Boolean; `true` for the Safari browser.
  var safari = !chrome && userAgentContains('safari');

  var phantom = userAgentContains('phantom');

  // @property opera12: Boolean
  // `true` for the Opera browser supporting CSS transforms (version 12 or later).
  var opera12 = 'OTransition' in style$1;

  // @property win: Boolean; `true` when the browser is running in a Windows platform
  var win = navigator.platform.indexOf('Win') === 0;

  // @property ie3d: Boolean; `true` for all Internet Explorer versions supporting CSS transforms.
  var ie3d = ie && ('transition' in style$1);

  // @property webkit3d: Boolean; `true` for webkit-based browsers supporting CSS transforms.
  var webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23;

  // @property gecko3d: Boolean; `true` for gecko-based browsers supporting CSS transforms.
  var gecko3d = 'MozPerspective' in style$1;

  // @property any3d: Boolean
  // `true` for all browsers supporting CSS transforms.
  var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;

  // @property mobile: Boolean; `true` for all browsers running in a mobile device.
  var mobile = typeof orientation !== 'undefined' || userAgentContains('mobile');

  // @property mobileWebkit: Boolean; `true` for all webkit-based browsers in a mobile device.
  var mobileWebkit = mobile && webkit;

  // @property mobileWebkit3d: Boolean
  // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
  var mobileWebkit3d = mobile && webkit3d;

  // @property msPointer: Boolean
  // `true` for browsers implementing the Microsoft touch events model (notably IE10).
  var msPointer = !window.PointerEvent && window.MSPointerEvent;

  // @property pointer: Boolean
  // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
  var pointer = !!(window.PointerEvent || msPointer);

  // @property touch: Boolean
  // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
  // This does not necessarily mean that the browser is running in a computer with
  // a touchscreen, it only means that the browser is capable of understanding
  // touch events.
  var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
  		(window.DocumentTouch && document instanceof window.DocumentTouch));

  // @property mobileOpera: Boolean; `true` for the Opera browser in a mobile device.
  var mobileOpera = mobile && opera;

  // @property mobileGecko: Boolean
  // `true` for gecko-based browsers running in a mobile device.
  var mobileGecko = mobile && gecko;

  // @property retina: Boolean
  // `true` for browsers on a high-resolution "retina" screen or on any screen when browser's display zoom is more than 100%.
  var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

  // @property passiveEvents: Boolean
  // `true` for browsers that support passive events.
  var passiveEvents = (function () {
  	var supportsPassiveOption = false;
  	try {
  		var opts = Object.defineProperty({}, 'passive', {
  			get: function () { // eslint-disable-line getter-return
  				supportsPassiveOption = true;
  			}
  		});
  		window.addEventListener('testPassiveEventSupport', falseFn, opts);
  		window.removeEventListener('testPassiveEventSupport', falseFn, opts);
  	} catch (e) {
  		// Errors can safely be ignored since this is only a browser support test.
  	}
  	return supportsPassiveOption;
  }());

  // @property canvas: Boolean
  // `true` when the browser supports [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
  var canvas = (function () {
  	return !!document.createElement('canvas').getContext;
  }());

  // @property svg: Boolean
  // `true` when the browser supports [SVG](https://developer.mozilla.org/docs/Web/SVG).
  var svg = !!(document.createElementNS && svgCreate('svg').createSVGRect);

  // @property vml: Boolean
  // `true` if the browser supports [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language).
  var vml = !svg && (function () {
  	try {
  		var div = document.createElement('div');
  		div.innerHTML = '<v:shape adj="1"/>';

  		var shape = div.firstChild;
  		shape.style.behavior = 'url(#default#VML)';

  		return shape && (typeof shape.adj === 'object');

  	} catch (e) {
  		return false;
  	}
  }());


  function userAgentContains(str) {
  	return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
  }

  var Browser = ({
    ie: ie,
    ielt9: ielt9,
    edge: edge,
    webkit: webkit,
    android: android,
    android23: android23,
    androidStock: androidStock,
    opera: opera,
    chrome: chrome,
    gecko: gecko,
    safari: safari,
    phantom: phantom,
    opera12: opera12,
    win: win,
    ie3d: ie3d,
    webkit3d: webkit3d,
    gecko3d: gecko3d,
    any3d: any3d,
    mobile: mobile,
    mobileWebkit: mobileWebkit,
    mobileWebkit3d: mobileWebkit3d,
    msPointer: msPointer,
    pointer: pointer,
    touch: touch,
    mobileOpera: mobileOpera,
    mobileGecko: mobileGecko,
    retina: retina,
    passiveEvents: passiveEvents,
    canvas: canvas,
    svg: svg,
    vml: vml
  });

  /*
   * Extends L.DomEvent to provide touch support for Internet Explorer and Windows-based devices.
   */


  var POINTER_DOWN =   msPointer ? 'MSPointerDown'   : 'pointerdown';
  var POINTER_MOVE =   msPointer ? 'MSPointerMove'   : 'pointermove';
  var POINTER_UP =     msPointer ? 'MSPointerUp'     : 'pointerup';
  var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';

  var _pointers = {};
  var _pointerDocListener = false;

  // Provides a touch events wrapper for (ms)pointer events.
  // ref http://www.w3.org/TR/pointerevents/ https://www.w3.org/Bugs/Public/show_bug.cgi?id=22890

  function addPointerListener(obj, type, handler, id) {
  	if (type === 'touchstart') {
  		_addPointerStart(obj, handler, id);

  	} else if (type === 'touchmove') {
  		_addPointerMove(obj, handler, id);

  	} else if (type === 'touchend') {
  		_addPointerEnd(obj, handler, id);
  	}

  	return this;
  }

  function removePointerListener(obj, type, id) {
  	var handler = obj['_leaflet_' + type + id];

  	if (type === 'touchstart') {
  		obj.removeEventListener(POINTER_DOWN, handler, false);

  	} else if (type === 'touchmove') {
  		obj.removeEventListener(POINTER_MOVE, handler, false);

  	} else if (type === 'touchend') {
  		obj.removeEventListener(POINTER_UP, handler, false);
  		obj.removeEventListener(POINTER_CANCEL, handler, false);
  	}

  	return this;
  }

  function _addPointerStart(obj, handler, id) {
  	var onDown = bind(function (e) {
  		// IE10 specific: MsTouch needs preventDefault. See #2000
  		if (e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
  			preventDefault(e);
  		}

  		_handlePointer(e, handler);
  	});

  	obj['_leaflet_touchstart' + id] = onDown;
  	obj.addEventListener(POINTER_DOWN, onDown, false);

  	// need to keep track of what pointers and how many are active to provide e.touches emulation
  	if (!_pointerDocListener) {
  		// we listen document as any drags that end by moving the touch off the screen get fired there
  		document.addEventListener(POINTER_DOWN, _globalPointerDown, true);
  		document.addEventListener(POINTER_MOVE, _globalPointerMove, true);
  		document.addEventListener(POINTER_UP, _globalPointerUp, true);
  		document.addEventListener(POINTER_CANCEL, _globalPointerUp, true);

  		_pointerDocListener = true;
  	}
  }

  function _globalPointerDown(e) {
  	_pointers[e.pointerId] = e;
  }

  function _globalPointerMove(e) {
  	if (_pointers[e.pointerId]) {
  		_pointers[e.pointerId] = e;
  	}
  }

  function _globalPointerUp(e) {
  	delete _pointers[e.pointerId];
  }

  function _handlePointer(e, handler) {
  	e.touches = [];
  	for (var i in _pointers) {
  		e.touches.push(_pointers[i]);
  	}
  	e.changedTouches = [e];

  	handler(e);
  }

  function _addPointerMove(obj, handler, id) {
  	var onMove = function (e) {
  		// don't fire touch moves when mouse isn't down
  		if ((e.pointerType === (e.MSPOINTER_TYPE_MOUSE || 'mouse')) && e.buttons === 0) {
  			return;
  		}

  		_handlePointer(e, handler);
  	};

  	obj['_leaflet_touchmove' + id] = onMove;
  	obj.addEventListener(POINTER_MOVE, onMove, false);
  }

  function _addPointerEnd(obj, handler, id) {
  	var onUp = function (e) {
  		_handlePointer(e, handler);
  	};

  	obj['_leaflet_touchend' + id] = onUp;
  	obj.addEventListener(POINTER_UP, onUp, false);
  	obj.addEventListener(POINTER_CANCEL, onUp, false);
  }

  /*
   * Extends the event handling code with double tap support for mobile browsers.
   */

  var _touchstart = msPointer ? 'MSPointerDown' : pointer ? 'pointerdown' : 'touchstart';
  var _touchend = msPointer ? 'MSPointerUp' : pointer ? 'pointerup' : 'touchend';
  var _pre = '_leaflet_';

  // inspired by Zepto touch code by Thomas Fuchs
  function addDoubleTapListener(obj, handler, id) {
  	var last, touch$$1,
  	    doubleTap = false,
  	    delay = 250;

  	function onTouchStart(e) {

  		if (pointer) {
  			if (!e.isPrimary) { return; }
  			if (e.pointerType === 'mouse') { return; } // mouse fires native dblclick
  		} else if (e.touches.length > 1) {
  			return;
  		}

  		var now = Date.now(),
  		    delta = now - (last || now);

  		touch$$1 = e.touches ? e.touches[0] : e;
  		doubleTap = (delta > 0 && delta <= delay);
  		last = now;
  	}

  	function onTouchEnd(e) {
  		if (doubleTap && !touch$$1.cancelBubble) {
  			if (pointer) {
  				if (e.pointerType === 'mouse') { return; }
  				// work around .type being readonly with MSPointer* events
  				var newTouch = {},
  				    prop, i;

  				for (i in touch$$1) {
  					prop = touch$$1[i];
  					newTouch[i] = prop && prop.bind ? prop.bind(touch$$1) : prop;
  				}
  				touch$$1 = newTouch;
  			}
  			touch$$1.type = 'dblclick';
  			touch$$1.button = 0;
  			handler(touch$$1);
  			last = null;
  		}
  	}

  	obj[_pre + _touchstart + id] = onTouchStart;
  	obj[_pre + _touchend + id] = onTouchEnd;
  	obj[_pre + 'dblclick' + id] = handler;

  	obj.addEventListener(_touchstart, onTouchStart, passiveEvents ? {passive: false} : false);
  	obj.addEventListener(_touchend, onTouchEnd, passiveEvents ? {passive: false} : false);

  	// On some platforms (notably, chrome<55 on win10 + touchscreen + mouse),
  	// the browser doesn't fire touchend/pointerup events but does fire
  	// native dblclicks. See #4127.
  	// Edge 14 also fires native dblclicks, but only for pointerType mouse, see #5180.
  	obj.addEventListener('dblclick', handler, false);

  	return this;
  }

  function removeDoubleTapListener(obj, id) {
  	var touchstart = obj[_pre + _touchstart + id],
  	    touchend = obj[_pre + _touchend + id],
  	    dblclick = obj[_pre + 'dblclick' + id];

  	obj.removeEventListener(_touchstart, touchstart, passiveEvents ? {passive: false} : false);
  	obj.removeEventListener(_touchend, touchend, passiveEvents ? {passive: false} : false);
  	obj.removeEventListener('dblclick', dblclick, false);

  	return this;
  }

  /*
   * @namespace DomUtil
   *
   * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
   * tree, used by Leaflet internally.
   *
   * Most functions expecting or returning a `HTMLElement` also work for
   * SVG elements. The only difference is that classes refer to CSS classes
   * in HTML and SVG classes in SVG.
   */


  // @property TRANSFORM: String
  // Vendor-prefixed transform style name (e.g. `'webkitTransform'` for WebKit).
  var TRANSFORM = testProp(
  	['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

  // webkitTransition comes first because some browser versions that drop vendor prefix don't do
  // the same for the transitionend event, in particular the Android 4.1 stock browser

  // @property TRANSITION: String
  // Vendor-prefixed transition style name.
  var TRANSITION = testProp(
  	['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

  // @property TRANSITION_END: String
  // Vendor-prefixed transitionend event name.
  var TRANSITION_END =
  	TRANSITION === 'webkitTransition' || TRANSITION === 'OTransition' ? TRANSITION + 'End' : 'transitionend';


  // @function get(id: String|HTMLElement): HTMLElement
  // Returns an element given its DOM id, or returns the element itself
  // if it was passed directly.
  function get(id) {
  	return typeof id === 'string' ? document.getElementById(id) : id;
  }

  // @function getStyle(el: HTMLElement, styleAttrib: String): String
  // Returns the value for a certain style attribute on an element,
  // including computed values or values set through CSS.
  function getStyle(el, style) {
  	var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

  	if ((!value || value === 'auto') && document.defaultView) {
  		var css = document.defaultView.getComputedStyle(el, null);
  		value = css ? css[style] : null;
  	}
  	return value === 'auto' ? null : value;
  }

  // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
  // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
  function create$1(tagName, className, container) {
  	var el = document.createElement(tagName);
  	el.className = className || '';

  	if (container) {
  		container.appendChild(el);
  	}
  	return el;
  }

  // @function remove(el: HTMLElement)
  // Removes `el` from its parent element
  function remove(el) {
  	var parent = el.parentNode;
  	if (parent) {
  		parent.removeChild(el);
  	}
  }

  // @function empty(el: HTMLElement)
  // Removes all of `el`'s children elements from `el`
  function empty(el) {
  	while (el.firstChild) {
  		el.removeChild(el.firstChild);
  	}
  }

  // @function toFront(el: HTMLElement)
  // Makes `el` the last child of its parent, so it renders in front of the other children.
  function toFront(el) {
  	var parent = el.parentNode;
  	if (parent && parent.lastChild !== el) {
  		parent.appendChild(el);
  	}
  }

  // @function toBack(el: HTMLElement)
  // Makes `el` the first child of its parent, so it renders behind the other children.
  function toBack(el) {
  	var parent = el.parentNode;
  	if (parent && parent.firstChild !== el) {
  		parent.insertBefore(el, parent.firstChild);
  	}
  }

  // @function hasClass(el: HTMLElement, name: String): Boolean
  // Returns `true` if the element's class attribute contains `name`.
  function hasClass(el, name) {
  	if (el.classList !== undefined) {
  		return el.classList.contains(name);
  	}
  	var className = getClass(el);
  	return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
  }

  // @function addClass(el: HTMLElement, name: String)
  // Adds `name` to the element's class attribute.
  function addClass(el, name) {
  	if (el.classList !== undefined) {
  		var classes = splitWords(name);
  		for (var i = 0, len = classes.length; i < len; i++) {
  			el.classList.add(classes[i]);
  		}
  	} else if (!hasClass(el, name)) {
  		var className = getClass(el);
  		setClass(el, (className ? className + ' ' : '') + name);
  	}
  }

  // @function removeClass(el: HTMLElement, name: String)
  // Removes `name` from the element's class attribute.
  function removeClass(el, name) {
  	if (el.classList !== undefined) {
  		el.classList.remove(name);
  	} else {
  		setClass(el, trim((' ' + getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
  	}
  }

  // @function setClass(el: HTMLElement, name: String)
  // Sets the element's class.
  function setClass(el, name) {
  	if (el.className.baseVal === undefined) {
  		el.className = name;
  	} else {
  		// in case of SVG element
  		el.className.baseVal = name;
  	}
  }

  // @function getClass(el: HTMLElement): String
  // Returns the element's class.
  function getClass(el) {
  	// Check if the element is an SVGElementInstance and use the correspondingElement instead
  	// (Required for linked SVG elements in IE11.)
  	if (el.correspondingElement) {
  		el = el.correspondingElement;
  	}
  	return el.className.baseVal === undefined ? el.className : el.className.baseVal;
  }

  // @function setOpacity(el: HTMLElement, opacity: Number)
  // Set the opacity of an element (including old IE support).
  // `opacity` must be a number from `0` to `1`.
  function setOpacity(el, value) {
  	if ('opacity' in el.style) {
  		el.style.opacity = value;
  	} else if ('filter' in el.style) {
  		_setOpacityIE(el, value);
  	}
  }

  function _setOpacityIE(el, value) {
  	var filter = false,
  	    filterName = 'DXImageTransform.Microsoft.Alpha';

  	// filters collection throws an error if we try to retrieve a filter that doesn't exist
  	try {
  		filter = el.filters.item(filterName);
  	} catch (e) {
  		// don't set opacity to 1 if we haven't already set an opacity,
  		// it isn't needed and breaks transparent pngs.
  		if (value === 1) { return; }
  	}

  	value = Math.round(value * 100);

  	if (filter) {
  		filter.Enabled = (value !== 100);
  		filter.Opacity = value;
  	} else {
  		el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
  	}
  }

  // @function testProp(props: String[]): String|false
  // Goes through the array of style names and returns the first name
  // that is a valid style name for an element. If no such name is found,
  // it returns false. Useful for vendor-prefixed styles like `transform`.
  function testProp(props) {
  	var style = document.documentElement.style;

  	for (var i = 0; i < props.length; i++) {
  		if (props[i] in style) {
  			return props[i];
  		}
  	}
  	return false;
  }

  // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
  // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
  // and optionally scaled by `scale`. Does not have an effect if the
  // browser doesn't support 3D CSS transforms.
  function setTransform(el, offset, scale) {
  	var pos = offset || new Point(0, 0);

  	el.style[TRANSFORM] =
  		(ie3d ?
  			'translate(' + pos.x + 'px,' + pos.y + 'px)' :
  			'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
  		(scale ? ' scale(' + scale + ')' : '');
  }

  // @function setPosition(el: HTMLElement, position: Point)
  // Sets the position of `el` to coordinates specified by `position`,
  // using CSS translate or top/left positioning depending on the browser
  // (used by Leaflet internally to position its layers).
  function setPosition(el, point) {

  	/*eslint-disable */
  	el._leaflet_pos = point;
  	/* eslint-enable */

  	if (any3d) {
  		setTransform(el, point);
  	} else {
  		el.style.left = point.x + 'px';
  		el.style.top = point.y + 'px';
  	}
  }

  // @function getPosition(el: HTMLElement): Point
  // Returns the coordinates of an element previously positioned with setPosition.
  function getPosition(el) {
  	// this method is only used for elements previously positioned using setPosition,
  	// so it's safe to cache the position for performance

  	return el._leaflet_pos || new Point(0, 0);
  }

  // @function disableTextSelection()
  // Prevents the user from generating `selectstart` DOM events, usually generated
  // when the user drags the mouse through a page with text. Used internally
  // by Leaflet to override the behaviour of any click-and-drag interaction on
  // the map. Affects drag interactions on the whole document.

  // @function enableTextSelection()
  // Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
  var disableTextSelection;
  var enableTextSelection;
  var _userSelect;
  if ('onselectstart' in document) {
  	disableTextSelection = function () {
  		on(window, 'selectstart', preventDefault);
  	};
  	enableTextSelection = function () {
  		off(window, 'selectstart', preventDefault);
  	};
  } else {
  	var userSelectProperty = testProp(
  		['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

  	disableTextSelection = function () {
  		if (userSelectProperty) {
  			var style = document.documentElement.style;
  			_userSelect = style[userSelectProperty];
  			style[userSelectProperty] = 'none';
  		}
  	};
  	enableTextSelection = function () {
  		if (userSelectProperty) {
  			document.documentElement.style[userSelectProperty] = _userSelect;
  			_userSelect = undefined;
  		}
  	};
  }

  // @function disableImageDrag()
  // As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
  // for `dragstart` DOM events, usually generated when the user drags an image.
  function disableImageDrag() {
  	on(window, 'dragstart', preventDefault);
  }

  // @function enableImageDrag()
  // Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
  function enableImageDrag() {
  	off(window, 'dragstart', preventDefault);
  }

  var _outlineElement, _outlineStyle;
  // @function preventOutline(el: HTMLElement)
  // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
  // of the element `el` invisible. Used internally by Leaflet to prevent
  // focusable elements from displaying an outline when the user performs a
  // drag interaction on them.
  function preventOutline(element) {
  	while (element.tabIndex === -1) {
  		element = element.parentNode;
  	}
  	if (!element.style) { return; }
  	restoreOutline();
  	_outlineElement = element;
  	_outlineStyle = element.style.outline;
  	element.style.outline = 'none';
  	on(window, 'keydown', restoreOutline);
  }

  // @function restoreOutline()
  // Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
  function restoreOutline() {
  	if (!_outlineElement) { return; }
  	_outlineElement.style.outline = _outlineStyle;
  	_outlineElement = undefined;
  	_outlineStyle = undefined;
  	off(window, 'keydown', restoreOutline);
  }

  // @function getSizedParentNode(el: HTMLElement): HTMLElement
  // Finds the closest parent node which size (width and height) is not null.
  function getSizedParentNode(element) {
  	do {
  		element = element.parentNode;
  	} while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
  	return element;
  }

  // @function getScale(el: HTMLElement): Object
  // Computes the CSS scale currently applied on the element.
  // Returns an object with `x` and `y` members as horizontal and vertical scales respectively,
  // and `boundingClientRect` as the result of [`getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
  function getScale(element) {
  	var rect = element.getBoundingClientRect(); // Read-only in old browsers.

  	return {
  		x: rect.width / element.offsetWidth || 1,
  		y: rect.height / element.offsetHeight || 1,
  		boundingClientRect: rect
  	};
  }

  var DomUtil = ({
    TRANSFORM: TRANSFORM,
    TRANSITION: TRANSITION,
    TRANSITION_END: TRANSITION_END,
    get: get,
    getStyle: getStyle,
    create: create$1,
    remove: remove,
    empty: empty,
    toFront: toFront,
    toBack: toBack,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    setClass: setClass,
    getClass: getClass,
    setOpacity: setOpacity,
    testProp: testProp,
    setTransform: setTransform,
    setPosition: setPosition,
    getPosition: getPosition,
    disableTextSelection: disableTextSelection,
    enableTextSelection: enableTextSelection,
    disableImageDrag: disableImageDrag,
    enableImageDrag: enableImageDrag,
    preventOutline: preventOutline,
    restoreOutline: restoreOutline,
    getSizedParentNode: getSizedParentNode,
    getScale: getScale
  });

  /*
   * @namespace DomEvent
   * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
   */

  // Inspired by John Resig, Dean Edwards and YUI addEvent implementations.

  // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Adds a listener function (`fn`) to a particular DOM event type of the
  // element `el`. You can optionally specify the context of the listener
  // (object the `this` keyword will point to). You can also pass several
  // space-separated types (e.g. `'click dblclick'`).

  // @alternative
  // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
  // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function on(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			addOne(obj, type, types[type], fn);
  		}
  	} else {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			addOne(obj, types[i], fn, context);
  		}
  	}

  	return this;
  }

  var eventsKey = '_leaflet_events';

  // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
  // Removes a previously added listener function.
  // Note that if you passed a custom context to on, you must pass the same
  // context to `off` in order to remove the listener.

  // @alternative
  // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
  // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  function off(obj, types, fn, context) {

  	if (typeof types === 'object') {
  		for (var type in types) {
  			removeOne(obj, type, types[type], fn);
  		}
  	} else if (types) {
  		types = splitWords(types);

  		for (var i = 0, len = types.length; i < len; i++) {
  			removeOne(obj, types[i], fn, context);
  		}
  	} else {
  		for (var j in obj[eventsKey]) {
  			removeOne(obj, j, obj[eventsKey][j]);
  		}
  		delete obj[eventsKey];
  	}

  	return this;
  }

  function browserFiresNativeDblClick() {
  	// See https://github.com/w3c/pointerevents/issues/171
  	if (pointer) {
  		return !(edge || safari);
  	}
  }

  var mouseSubst = {
  	mouseenter: 'mouseover',
  	mouseleave: 'mouseout',
  	wheel: !('onwheel' in window) && 'mousewheel'
  };

  function addOne(obj, type, fn, context) {
  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : '');

  	if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

  	var handler = function (e) {
  		return fn.call(context || obj, e || window.event);
  	};

  	var originalHandler = handler;

  	if (pointer && type.indexOf('touch') === 0) {
  		// Needs DomEvent.Pointer.js
  		addPointerListener(obj, type, handler, id);

  	} else if (touch && (type === 'dblclick') && !browserFiresNativeDblClick()) {
  		addDoubleTapListener(obj, handler, id);

  	} else if ('addEventListener' in obj) {

  		if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' ||  type === 'mousewheel') {
  			obj.addEventListener(mouseSubst[type] || type, handler, passiveEvents ? {passive: false} : false);

  		} else if (type === 'mouseenter' || type === 'mouseleave') {
  			handler = function (e) {
  				e = e || window.event;
  				if (isExternalTarget(obj, e)) {
  					originalHandler(e);
  				}
  			};
  			obj.addEventListener(mouseSubst[type], handler, false);

  		} else {
  			obj.addEventListener(type, originalHandler, false);
  		}

  	} else if ('attachEvent' in obj) {
  		obj.attachEvent('on' + type, handler);
  	}

  	obj[eventsKey] = obj[eventsKey] || {};
  	obj[eventsKey][id] = handler;
  }

  function removeOne(obj, type, fn, context) {

  	var id = type + stamp(fn) + (context ? '_' + stamp(context) : ''),
  	    handler = obj[eventsKey] && obj[eventsKey][id];

  	if (!handler) { return this; }

  	if (pointer && type.indexOf('touch') === 0) {
  		removePointerListener(obj, type, id);

  	} else if (touch && (type === 'dblclick') && !browserFiresNativeDblClick()) {
  		removeDoubleTapListener(obj, id);

  	} else if ('removeEventListener' in obj) {

  		obj.removeEventListener(mouseSubst[type] || type, handler, false);

  	} else if ('detachEvent' in obj) {
  		obj.detachEvent('on' + type, handler);
  	}

  	obj[eventsKey][id] = null;
  }

  // @function stopPropagation(ev: DOMEvent): this
  // Stop the given event from propagation to parent elements. Used inside the listener functions:
  // ```js
  // L.DomEvent.on(div, 'click', function (ev) {
  // 	L.DomEvent.stopPropagation(ev);
  // });
  // ```
  function stopPropagation(e) {

  	if (e.stopPropagation) {
  		e.stopPropagation();
  	} else if (e.originalEvent) {  // In case of Leaflet event.
  		e.originalEvent._stopped = true;
  	} else {
  		e.cancelBubble = true;
  	}
  	skipped(e);

  	return this;
  }

  // @function disableScrollPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'wheel'` events (plus browser variants).
  function disableScrollPropagation(el) {
  	addOne(el, 'wheel', stopPropagation);
  	return this;
  }

  // @function disableClickPropagation(el: HTMLElement): this
  // Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
  // `'mousedown'` and `'touchstart'` events (plus browser variants).
  function disableClickPropagation(el) {
  	on(el, 'mousedown touchstart dblclick', stopPropagation);
  	addOne(el, 'click', fakeStop);
  	return this;
  }

  // @function preventDefault(ev: DOMEvent): this
  // Prevents the default action of the DOM Event `ev` from happening (such as
  // following a link in the href of the a element, or doing a POST request
  // with page reload when a `<form>` is submitted).
  // Use it inside listener functions.
  function preventDefault(e) {
  	if (e.preventDefault) {
  		e.preventDefault();
  	} else {
  		e.returnValue = false;
  	}
  	return this;
  }

  // @function stop(ev: DOMEvent): this
  // Does `stopPropagation` and `preventDefault` at the same time.
  function stop(e) {
  	preventDefault(e);
  	stopPropagation(e);
  	return this;
  }

  // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
  // Gets normalized mouse position from a DOM event relative to the
  // `container` (border excluded) or to the whole page if not specified.
  function getMousePosition(e, container) {
  	if (!container) {
  		return new Point(e.clientX, e.clientY);
  	}

  	var scale = getScale(container),
  	    offset = scale.boundingClientRect; // left and top  values are in page scale (like the event clientX/Y)

  	return new Point(
  		// offset.left/top values are in page scale (like clientX/Y),
  		// whereas clientLeft/Top (border width) values are the original values (before CSS scale applies).
  		(e.clientX - offset.left) / scale.x - container.clientLeft,
  		(e.clientY - offset.top) / scale.y - container.clientTop
  	);
  }

  // Chrome on Win scrolls double the pixels as in other platforms (see #4538),
  // and Firefox scrolls device pixels, not CSS pixels
  var wheelPxFactor =
  	(win && chrome) ? 2 * window.devicePixelRatio :
  	gecko ? window.devicePixelRatio : 1;

  // @function getWheelDelta(ev: DOMEvent): Number
  // Gets normalized wheel delta from a wheel DOM event, in vertical
  // pixels scrolled (negative if scrolling down).
  // Events from pointing devices without precise scrolling are mapped to
  // a best guess of 60 pixels.
  function getWheelDelta(e) {
  	return (edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
  	       (e.deltaY && e.deltaMode === 0) ? -e.deltaY / wheelPxFactor : // Pixels
  	       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
  	       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
  	       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
  	       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
  	       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
  	       e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
  	       0;
  }

  var skipEvents = {};

  function fakeStop(e) {
  	// fakes stopPropagation by setting a special event flag, checked/reset with skipped(e)
  	skipEvents[e.type] = true;
  }

  function skipped(e) {
  	var events = skipEvents[e.type];
  	// reset when checking, as it's only used in map container and propagates outside of the map
  	skipEvents[e.type] = false;
  	return events;
  }

  // check if element really left/entered the event target (for mouseenter/mouseleave)
  function isExternalTarget(el, e) {

  	var related = e.relatedTarget;

  	if (!related) { return true; }

  	try {
  		while (related && (related !== el)) {
  			related = related.parentNode;
  		}
  	} catch (err) {
  		return false;
  	}
  	return (related !== el);
  }

  var DomEvent = ({
    on: on,
    off: off,
    stopPropagation: stopPropagation,
    disableScrollPropagation: disableScrollPropagation,
    disableClickPropagation: disableClickPropagation,
    preventDefault: preventDefault,
    stop: stop,
    getMousePosition: getMousePosition,
    getWheelDelta: getWheelDelta,
    fakeStop: fakeStop,
    skipped: skipped,
    isExternalTarget: isExternalTarget,
    addListener: on,
    removeListener: off
  });

  /*
   * @class PosAnimation
   * @aka L.PosAnimation
   * @inherits Evented
   * Used internally for panning animations, utilizing CSS3 Transitions for modern browsers and a timer fallback for IE6-9.
   *
   * @example
   * ```js
   * var fx = new L.PosAnimation();
   * fx.run(el, [300, 500], 0.5);
   * ```
   *
   * @constructor L.PosAnimation()
   * Creates a `PosAnimation` object.
   *
   */

  var PosAnimation = Evented.extend({

  	// @method run(el: HTMLElement, newPos: Point, duration?: Number, easeLinearity?: Number)
  	// Run an animation of a given element to a new position, optionally setting
  	// duration in seconds (`0.25` by default) and easing linearity factor (3rd
  	// argument of the [cubic bezier curve](http://cubic-bezier.com/#0,0,.5,1),
  	// `0.5` by default).
  	run: function (el, newPos, duration, easeLinearity) {
  		this.stop();

  		this._el = el;
  		this._inProgress = true;
  		this._duration = duration || 0.25;
  		this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);

  		this._startPos = getPosition(el);
  		this._offset = newPos.subtract(this._startPos);
  		this._startTime = +new Date();

  		// @event start: Event
  		// Fired when the animation starts
  		this.fire('start');

  		this._animate();
  	},

  	// @method stop()
  	// Stops the animation (if currently running).
  	stop: function () {
  		if (!this._inProgress) { return; }

  		this._step(true);
  		this._complete();
  	},

  	_animate: function () {
  		// animation loop
  		this._animId = requestAnimFrame(this._animate, this);
  		this._step();
  	},

  	_step: function (round) {
  		var elapsed = (+new Date()) - this._startTime,
  		    duration = this._duration * 1000;

  		if (elapsed < duration) {
  			this._runFrame(this._easeOut(elapsed / duration), round);
  		} else {
  			this._runFrame(1);
  			this._complete();
  		}
  	},

  	_runFrame: function (progress, round) {
  		var pos = this._startPos.add(this._offset.multiplyBy(progress));
  		if (round) {
  			pos._round();
  		}
  		setPosition(this._el, pos);

  		// @event step: Event
  		// Fired continuously during the animation.
  		this.fire('step');
  	},

  	_complete: function () {
  		cancelAnimFrame(this._animId);

  		this._inProgress = false;
  		// @event end: Event
  		// Fired when the animation ends.
  		this.fire('end');
  	},

  	_easeOut: function (t) {
  		return 1 - Math.pow(1 - t, this._easeOutPower);
  	}
  });

  /*
   * @class Map
   * @aka L.Map
   * @inherits Evented
   *
   * The central class of the API — it is used to create a map on a page and manipulate it.
   *
   * @example
   *
   * ```js
   * // initialize the map on the "map" div with a given center and zoom
   * var map = L.map('map', {
   * 	center: [51.505, -0.09],
   * 	zoom: 13
   * });
   * ```
   *
   */

  var Map = Evented.extend({

  	options: {
  		// @section Map State Options
  		// @option crs: CRS = L.CRS.EPSG3857
  		// The [Coordinate Reference System](#crs) to use. Don't change this if you're not
  		// sure what it means.
  		crs: EPSG3857,

  		// @option center: LatLng = undefined
  		// Initial geographic center of the map
  		center: undefined,

  		// @option zoom: Number = undefined
  		// Initial map zoom level
  		zoom: undefined,

  		// @option minZoom: Number = *
  		// Minimum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the lowest of their `minZoom` options will be used instead.
  		minZoom: undefined,

  		// @option maxZoom: Number = *
  		// Maximum zoom level of the map.
  		// If not specified and at least one `GridLayer` or `TileLayer` is in the map,
  		// the highest of their `maxZoom` options will be used instead.
  		maxZoom: undefined,

  		// @option layers: Layer[] = []
  		// Array of layers that will be added to the map initially
  		layers: [],

  		// @option maxBounds: LatLngBounds = null
  		// When this option is set, the map restricts the view to the given
  		// geographical bounds, bouncing the user back if the user tries to pan
  		// outside the view. To set the restriction dynamically, use
  		// [`setMaxBounds`](#map-setmaxbounds) method.
  		maxBounds: undefined,

  		// @option renderer: Renderer = *
  		// The default method for drawing vector layers on the map. `L.SVG`
  		// or `L.Canvas` by default depending on browser support.
  		renderer: undefined,


  		// @section Animation Options
  		// @option zoomAnimation: Boolean = true
  		// Whether the map zoom animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		zoomAnimation: true,

  		// @option zoomAnimationThreshold: Number = 4
  		// Won't animate zoom if the zoom difference exceeds this value.
  		zoomAnimationThreshold: 4,

  		// @option fadeAnimation: Boolean = true
  		// Whether the tile fade animation is enabled. By default it's enabled
  		// in all browsers that support CSS3 Transitions except Android.
  		fadeAnimation: true,

  		// @option markerZoomAnimation: Boolean = true
  		// Whether markers animate their zoom with the zoom animation, if disabled
  		// they will disappear for the length of the animation. By default it's
  		// enabled in all browsers that support CSS3 Transitions except Android.
  		markerZoomAnimation: true,

  		// @option transform3DLimit: Number = 2^23
  		// Defines the maximum size of a CSS translation transform. The default
  		// value should not be changed unless a web browser positions layers in
  		// the wrong place after doing a large `panBy`.
  		transform3DLimit: 8388608, // Precision limit of a 32-bit float

  		// @section Interaction Options
  		// @option zoomSnap: Number = 1
  		// Forces the map's zoom level to always be a multiple of this, particularly
  		// right after a [`fitBounds()`](#map-fitbounds) or a pinch-zoom.
  		// By default, the zoom level snaps to the nearest integer; lower values
  		// (e.g. `0.5` or `0.1`) allow for greater granularity. A value of `0`
  		// means the zoom level will not be snapped after `fitBounds` or a pinch-zoom.
  		zoomSnap: 1,

  		// @option zoomDelta: Number = 1
  		// Controls how much the map's zoom level will change after a
  		// [`zoomIn()`](#map-zoomin), [`zoomOut()`](#map-zoomout), pressing `+`
  		// or `-` on the keyboard, or using the [zoom controls](#control-zoom).
  		// Values smaller than `1` (e.g. `0.5`) allow for greater granularity.
  		zoomDelta: 1,

  		// @option trackResize: Boolean = true
  		// Whether the map automatically handles browser window resize to update itself.
  		trackResize: true
  	},

  	initialize: function (id, options) { // (HTMLElement or String, Object)
  		options = setOptions(this, options);

  		// Make sure to assign internal flags at the beginning,
  		// to avoid inconsistent state in some edge cases.
  		this._handlers = [];
  		this._layers = {};
  		this._zoomBoundLayers = {};
  		this._sizeChanged = true;

  		this._initContainer(id);
  		this._initLayout();

  		// hack for https://github.com/Leaflet/Leaflet/issues/1980
  		this._onResize = bind(this._onResize, this);

  		this._initEvents();

  		if (options.maxBounds) {
  			this.setMaxBounds(options.maxBounds);
  		}

  		if (options.zoom !== undefined) {
  			this._zoom = this._limitZoom(options.zoom);
  		}

  		if (options.center && options.zoom !== undefined) {
  			this.setView(toLatLng(options.center), options.zoom, {reset: true});
  		}

  		this.callInitHooks();

  		// don't animate on browsers without hardware-accelerated transitions or old Android/Opera
  		this._zoomAnimated = TRANSITION && any3d && !mobileOpera &&
  				this.options.zoomAnimation;

  		// zoom transitions run with the same duration for all layers, so if one of transitionend events
  		// happens after starting zoom animation (propagating to the map pane), we know that it ended globally
  		if (this._zoomAnimated) {
  			this._createAnimProxy();
  			on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
  		}

  		this._addLayers(this.options.layers);
  	},


  	// @section Methods for modifying map state

  	// @method setView(center: LatLng, zoom: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) with the given
  	// animation options.
  	setView: function (center, zoom, options) {

  		zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
  		center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
  		options = options || {};

  		this._stop();

  		if (this._loaded && !options.reset && options !== true) {

  			if (options.animate !== undefined) {
  				options.zoom = extend({animate: options.animate}, options.zoom);
  				options.pan = extend({animate: options.animate, duration: options.duration}, options.pan);
  			}

  			// try animating pan or zoom
  			var moved = (this._zoom !== zoom) ?
  				this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom, options.zoom) :
  				this._tryAnimatedPan(center, options.pan);

  			if (moved) {
  				// prevent resize handler call, the view will refresh after animation anyway
  				clearTimeout(this._sizeTimer);
  				return this;
  			}
  		}

  		// animation didn't start, just reset the map view
  		this._resetView(center, zoom);

  		return this;
  	},

  	// @method setZoom(zoom: Number, options?: Zoom/pan options): this
  	// Sets the zoom of the map.
  	setZoom: function (zoom, options) {
  		if (!this._loaded) {
  			this._zoom = zoom;
  			return this;
  		}
  		return this.setView(this.getCenter(), zoom, {zoom: options});
  	},

  	// @method zoomIn(delta?: Number, options?: Zoom options): this
  	// Increases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomIn: function (delta, options) {
  		delta = delta || (any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom + delta, options);
  	},

  	// @method zoomOut(delta?: Number, options?: Zoom options): this
  	// Decreases the zoom of the map by `delta` ([`zoomDelta`](#map-zoomdelta) by default).
  	zoomOut: function (delta, options) {
  		delta = delta || (any3d ? this.options.zoomDelta : 1);
  		return this.setZoom(this._zoom - delta, options);
  	},

  	// @method setZoomAround(latlng: LatLng, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified geographical point on the map
  	// stationary (e.g. used internally for scroll zoom and double-click zoom).
  	// @alternative
  	// @method setZoomAround(offset: Point, zoom: Number, options: Zoom options): this
  	// Zooms the map while keeping a specified pixel on the map (relative to the top-left corner) stationary.
  	setZoomAround: function (latlng, zoom, options) {
  		var scale = this.getZoomScale(zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

  		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
  		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

  		return this.setView(newCenter, zoom, {zoom: options});
  	},

  	_getBoundsCenterZoom: function (bounds, options) {

  		options = options || {};
  		bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),

  		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

  		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

  		if (zoom === Infinity) {
  			return {
  				center: bounds.getCenter(),
  				zoom: zoom
  			};
  		}

  		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

  		    swPoint = this.project(bounds.getSouthWest(), zoom),
  		    nePoint = this.project(bounds.getNorthEast(), zoom),
  		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

  		return {
  			center: center,
  			zoom: zoom
  		};
  	},

  	// @method fitBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets a map view that contains the given geographical bounds with the
  	// maximum zoom level possible.
  	fitBounds: function (bounds, options) {

  		bounds = toLatLngBounds(bounds);

  		if (!bounds.isValid()) {
  			throw new Error('Bounds are not valid.');
  		}

  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.setView(target.center, target.zoom, options);
  	},

  	// @method fitWorld(options?: fitBounds options): this
  	// Sets a map view that mostly contains the whole world with the maximum
  	// zoom level possible.
  	fitWorld: function (options) {
  		return this.fitBounds([[-90, -180], [90, 180]], options);
  	},

  	// @method panTo(latlng: LatLng, options?: Pan options): this
  	// Pans the map to a given center.
  	panTo: function (center, options) { // (LatLng)
  		return this.setView(center, this._zoom, {pan: options});
  	},

  	// @method panBy(offset: Point, options?: Pan options): this
  	// Pans the map by a given number of pixels (animated).
  	panBy: function (offset, options) {
  		offset = toPoint(offset).round();
  		options = options || {};

  		if (!offset.x && !offset.y) {
  			return this.fire('moveend');
  		}
  		// If we pan too far, Chrome gets issues with tiles
  		// and makes them disappear or appear in the wrong place (slightly offset) #2602
  		if (options.animate !== true && !this.getSize().contains(offset)) {
  			this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
  			return this;
  		}

  		if (!this._panAnim) {
  			this._panAnim = new PosAnimation();

  			this._panAnim.on({
  				'step': this._onPanTransitionStep,
  				'end': this._onPanTransitionEnd
  			}, this);
  		}

  		// don't fire movestart if animating inertia
  		if (!options.noMoveStart) {
  			this.fire('movestart');
  		}

  		// animate pan unless animate: false specified
  		if (options.animate !== false) {
  			addClass(this._mapPane, 'leaflet-pan-anim');

  			var newPos = this._getMapPanePos().subtract(offset).round();
  			this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
  		} else {
  			this._rawPanBy(offset);
  			this.fire('move').fire('moveend');
  		}

  		return this;
  	},

  	// @method flyTo(latlng: LatLng, zoom?: Number, options?: Zoom/pan options): this
  	// Sets the view of the map (geographical center and zoom) performing a smooth
  	// pan-zoom animation.
  	flyTo: function (targetCenter, targetZoom, options) {

  		options = options || {};
  		if (options.animate === false || !any3d) {
  			return this.setView(targetCenter, targetZoom, options);
  		}

  		this._stop();

  		var from = this.project(this.getCenter()),
  		    to = this.project(targetCenter),
  		    size = this.getSize(),
  		    startZoom = this._zoom;

  		targetCenter = toLatLng(targetCenter);
  		targetZoom = targetZoom === undefined ? startZoom : targetZoom;

  		var w0 = Math.max(size.x, size.y),
  		    w1 = w0 * this.getZoomScale(startZoom, targetZoom),
  		    u1 = (to.distanceTo(from)) || 1,
  		    rho = 1.42,
  		    rho2 = rho * rho;

  		function r(i) {
  			var s1 = i ? -1 : 1,
  			    s2 = i ? w1 : w0,
  			    t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
  			    b1 = 2 * s2 * rho2 * u1,
  			    b = t1 / b1,
  			    sq = Math.sqrt(b * b + 1) - b;

  			    // workaround for floating point precision bug when sq = 0, log = -Infinite,
  			    // thus triggering an infinite loop in flyTo
  			    var log = sq < 0.000000001 ? -18 : Math.log(sq);

  			return log;
  		}

  		function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }
  		function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }
  		function tanh(n) { return sinh(n) / cosh(n); }

  		var r0 = r(0);

  		function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }
  		function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

  		function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

  		var start = Date.now(),
  		    S = (r(1) - r0) / rho,
  		    duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

  		function frame() {
  			var t = (Date.now() - start) / duration,
  			    s = easeOut(t) * S;

  			if (t <= 1) {
  				this._flyToFrame = requestAnimFrame(frame, this);

  				this._move(
  					this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
  					this.getScaleZoom(w0 / w(s), startZoom),
  					{flyTo: true});

  			} else {
  				this
  					._move(targetCenter, targetZoom)
  					._moveEnd(true);
  			}
  		}

  		this._moveStart(true, options.noMoveStart);

  		frame.call(this);
  		return this;
  	},

  	// @method flyToBounds(bounds: LatLngBounds, options?: fitBounds options): this
  	// Sets the view of the map with a smooth animation like [`flyTo`](#map-flyto),
  	// but takes a bounds parameter like [`fitBounds`](#map-fitbounds).
  	flyToBounds: function (bounds, options) {
  		var target = this._getBoundsCenterZoom(bounds, options);
  		return this.flyTo(target.center, target.zoom, options);
  	},

  	// @method setMaxBounds(bounds: LatLngBounds): this
  	// Restricts the map view to the given bounds (see the [maxBounds](#map-maxbounds) option).
  	setMaxBounds: function (bounds) {
  		bounds = toLatLngBounds(bounds);

  		if (!bounds.isValid()) {
  			this.options.maxBounds = null;
  			return this.off('moveend', this._panInsideMaxBounds);
  		} else if (this.options.maxBounds) {
  			this.off('moveend', this._panInsideMaxBounds);
  		}

  		this.options.maxBounds = bounds;

  		if (this._loaded) {
  			this._panInsideMaxBounds();
  		}

  		return this.on('moveend', this._panInsideMaxBounds);
  	},

  	// @method setMinZoom(zoom: Number): this
  	// Sets the lower limit for the available zoom levels (see the [minZoom](#map-minzoom) option).
  	setMinZoom: function (zoom) {
  		var oldZoom = this.options.minZoom;
  		this.options.minZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() < this.options.minZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method setMaxZoom(zoom: Number): this
  	// Sets the upper limit for the available zoom levels (see the [maxZoom](#map-maxzoom) option).
  	setMaxZoom: function (zoom) {
  		var oldZoom = this.options.maxZoom;
  		this.options.maxZoom = zoom;

  		if (this._loaded && oldZoom !== zoom) {
  			this.fire('zoomlevelschange');

  			if (this.getZoom() > this.options.maxZoom) {
  				return this.setZoom(zoom);
  			}
  		}

  		return this;
  	},

  	// @method panInsideBounds(bounds: LatLngBounds, options?: Pan options): this
  	// Pans the map to the closest view that would lie inside the given bounds (if it's not already), controlling the animation using the options specific, if any.
  	panInsideBounds: function (bounds, options) {
  		this._enforcingBounds = true;
  		var center = this.getCenter(),
  		    newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));

  		if (!center.equals(newCenter)) {
  			this.panTo(newCenter, options);
  		}

  		this._enforcingBounds = false;
  		return this;
  	},

  	// @method panInside(latlng: LatLng, options?: options): this
  	// Pans the map the minimum amount to make the `latlng` visible. Use
  	// `padding`, `paddingTopLeft` and `paddingTopRight` options to fit
  	// the display to more restricted bounds, like [`fitBounds`](#map-fitbounds).
  	// If `latlng` is already within the (optionally padded) display bounds,
  	// the map will not be panned.
  	panInside: function (latlng, options) {
  		options = options || {};

  		var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
  		    paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
  		    center = this.getCenter(),
  		    pixelCenter = this.project(center),
  		    pixelPoint = this.project(latlng),
  		    pixelBounds = this.getPixelBounds(),
  		    halfPixelBounds = pixelBounds.getSize().divideBy(2),
  		    paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]);

  		if (!paddedBounds.contains(pixelPoint)) {
  			this._enforcingBounds = true;
  			var diff = pixelCenter.subtract(pixelPoint),
  			    newCenter = toPoint(pixelPoint.x + diff.x, pixelPoint.y + diff.y);

  			if (pixelPoint.x < paddedBounds.min.x || pixelPoint.x > paddedBounds.max.x) {
  				newCenter.x = pixelCenter.x - diff.x;
  				if (diff.x > 0) {
  					newCenter.x += halfPixelBounds.x - paddingTL.x;
  				} else {
  					newCenter.x -= halfPixelBounds.x - paddingBR.x;
  				}
  			}
  			if (pixelPoint.y < paddedBounds.min.y || pixelPoint.y > paddedBounds.max.y) {
  				newCenter.y = pixelCenter.y - diff.y;
  				if (diff.y > 0) {
  					newCenter.y += halfPixelBounds.y - paddingTL.y;
  				} else {
  					newCenter.y -= halfPixelBounds.y - paddingBR.y;
  				}
  			}
  			this.panTo(this.unproject(newCenter), options);
  			this._enforcingBounds = false;
  		}
  		return this;
  	},

  	// @method invalidateSize(options: Zoom/pan options): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default. If `options.pan` is `false`, panning will not occur.
  	// If `options.debounceMoveend` is `true`, it will delay `moveend` event so
  	// that it doesn't happen often even if the method is called many
  	// times in a row.

  	// @alternative
  	// @method invalidateSize(animate: Boolean): this
  	// Checks if the map container size changed and updates the map if so —
  	// call it after you've changed the map size dynamically, also animating
  	// pan by default.
  	invalidateSize: function (options) {
  		if (!this._loaded) { return this; }

  		options = extend({
  			animate: false,
  			pan: true
  		}, options === true ? {animate: true} : options);

  		var oldSize = this.getSize();
  		this._sizeChanged = true;
  		this._lastCenter = null;

  		var newSize = this.getSize(),
  		    oldCenter = oldSize.divideBy(2).round(),
  		    newCenter = newSize.divideBy(2).round(),
  		    offset = oldCenter.subtract(newCenter);

  		if (!offset.x && !offset.y) { return this; }

  		if (options.animate && options.pan) {
  			this.panBy(offset);

  		} else {
  			if (options.pan) {
  				this._rawPanBy(offset);
  			}

  			this.fire('move');

  			if (options.debounceMoveend) {
  				clearTimeout(this._sizeTimer);
  				this._sizeTimer = setTimeout(bind(this.fire, this, 'moveend'), 200);
  			} else {
  				this.fire('moveend');
  			}
  		}

  		// @section Map state change events
  		// @event resize: ResizeEvent
  		// Fired when the map is resized.
  		return this.fire('resize', {
  			oldSize: oldSize,
  			newSize: newSize
  		});
  	},

  	// @section Methods for modifying map state
  	// @method stop(): this
  	// Stops the currently running `panTo` or `flyTo` animation, if any.
  	stop: function () {
  		this.setZoom(this._limitZoom(this._zoom));
  		if (!this.options.zoomSnap) {
  			this.fire('viewreset');
  		}
  		return this._stop();
  	},

  	// @section Geolocation methods
  	// @method locate(options?: Locate options): this
  	// Tries to locate the user using the Geolocation API, firing a [`locationfound`](#map-locationfound)
  	// event with location data on success or a [`locationerror`](#map-locationerror) event on failure,
  	// and optionally sets the map view to the user's location with respect to
  	// detection accuracy (or to the world view if geolocation failed).
  	// Note that, if your page doesn't use HTTPS, this method will fail in
  	// modern browsers ([Chrome 50 and newer](https://sites.google.com/a/chromium.org/dev/Home/chromium-security/deprecating-powerful-features-on-insecure-origins))
  	// See `Locate options` for more details.
  	locate: function (options) {

  		options = this._locateOptions = extend({
  			timeout: 10000,
  			watch: false
  			// setView: false
  			// maxZoom: <Number>
  			// maximumAge: 0
  			// enableHighAccuracy: false
  		}, options);

  		if (!('geolocation' in navigator)) {
  			this._handleGeolocationError({
  				code: 0,
  				message: 'Geolocation not supported.'
  			});
  			return this;
  		}

  		var onResponse = bind(this._handleGeolocationResponse, this),
  		    onError = bind(this._handleGeolocationError, this);

  		if (options.watch) {
  			this._locationWatchId =
  			        navigator.geolocation.watchPosition(onResponse, onError, options);
  		} else {
  			navigator.geolocation.getCurrentPosition(onResponse, onError, options);
  		}
  		return this;
  	},

  	// @method stopLocate(): this
  	// Stops watching location previously initiated by `map.locate({watch: true})`
  	// and aborts resetting the map view if map.locate was called with
  	// `{setView: true}`.
  	stopLocate: function () {
  		if (navigator.geolocation && navigator.geolocation.clearWatch) {
  			navigator.geolocation.clearWatch(this._locationWatchId);
  		}
  		if (this._locateOptions) {
  			this._locateOptions.setView = false;
  		}
  		return this;
  	},

  	_handleGeolocationError: function (error) {
  		var c = error.code,
  		    message = error.message ||
  		            (c === 1 ? 'permission denied' :
  		            (c === 2 ? 'position unavailable' : 'timeout'));

  		if (this._locateOptions.setView && !this._loaded) {
  			this.fitWorld();
  		}

  		// @section Location events
  		// @event locationerror: ErrorEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method) failed.
  		this.fire('locationerror', {
  			code: c,
  			message: 'Geolocation error: ' + message + '.'
  		});
  	},

  	_handleGeolocationResponse: function (pos) {
  		var lat = pos.coords.latitude,
  		    lng = pos.coords.longitude,
  		    latlng = new LatLng(lat, lng),
  		    bounds = latlng.toBounds(pos.coords.accuracy * 2),
  		    options = this._locateOptions;

  		if (options.setView) {
  			var zoom = this.getBoundsZoom(bounds);
  			this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
  		}

  		var data = {
  			latlng: latlng,
  			bounds: bounds,
  			timestamp: pos.timestamp
  		};

  		for (var i in pos.coords) {
  			if (typeof pos.coords[i] === 'number') {
  				data[i] = pos.coords[i];
  			}
  		}

  		// @event locationfound: LocationEvent
  		// Fired when geolocation (using the [`locate`](#map-locate) method)
  		// went successfully.
  		this.fire('locationfound', data);
  	},

  	// TODO Appropriate docs section?
  	// @section Other Methods
  	// @method addHandler(name: String, HandlerClass: Function): this
  	// Adds a new `Handler` to the map, given its name and constructor function.
  	addHandler: function (name, HandlerClass) {
  		if (!HandlerClass) { return this; }

  		var handler = this[name] = new HandlerClass(this);

  		this._handlers.push(handler);

  		if (this.options[name]) {
  			handler.enable();
  		}

  		return this;
  	},

  	// @method remove(): this
  	// Destroys the map and clears all related event listeners.
  	remove: function () {

  		this._initEvents(true);
  		this.off('moveend', this._panInsideMaxBounds);

  		if (this._containerId !== this._container._leaflet_id) {
  			throw new Error('Map container is being reused by another instance');
  		}

  		try {
  			// throws error in IE6-8
  			delete this._container._leaflet_id;
  			delete this._containerId;
  		} catch (e) {
  			/*eslint-disable */
  			this._container._leaflet_id = undefined;
  			/* eslint-enable */
  			this._containerId = undefined;
  		}

  		if (this._locationWatchId !== undefined) {
  			this.stopLocate();
  		}

  		this._stop();

  		remove(this._mapPane);

  		if (this._clearControlPos) {
  			this._clearControlPos();
  		}
  		if (this._resizeRequest) {
  			cancelAnimFrame(this._resizeRequest);
  			this._resizeRequest = null;
  		}

  		this._clearHandlers();

  		if (this._loaded) {
  			// @section Map state change events
  			// @event unload: Event
  			// Fired when the map is destroyed with [remove](#map-remove) method.
  			this.fire('unload');
  		}

  		var i;
  		for (i in this._layers) {
  			this._layers[i].remove();
  		}
  		for (i in this._panes) {
  			remove(this._panes[i]);
  		}

  		this._layers = [];
  		this._panes = [];
  		delete this._mapPane;
  		delete this._renderer;

  		return this;
  	},

  	// @section Other Methods
  	// @method createPane(name: String, container?: HTMLElement): HTMLElement
  	// Creates a new [map pane](#map-pane) with the given name if it doesn't exist already,
  	// then returns it. The pane is created as a child of `container`, or
  	// as a child of the main map pane if not set.
  	createPane: function (name, container) {
  		var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
  		    pane = create$1('div', className, container || this._mapPane);

  		if (name) {
  			this._panes[name] = pane;
  		}
  		return pane;
  	},

  	// @section Methods for Getting Map State

  	// @method getCenter(): LatLng
  	// Returns the geographical center of the map view
  	getCenter: function () {
  		this._checkIfLoaded();

  		if (this._lastCenter && !this._moved()) {
  			return this._lastCenter;
  		}
  		return this.layerPointToLatLng(this._getCenterLayerPoint());
  	},

  	// @method getZoom(): Number
  	// Returns the current zoom level of the map view
  	getZoom: function () {
  		return this._zoom;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the geographical bounds visible in the current map view
  	getBounds: function () {
  		var bounds = this.getPixelBounds(),
  		    sw = this.unproject(bounds.getBottomLeft()),
  		    ne = this.unproject(bounds.getTopRight());

  		return new LatLngBounds(sw, ne);
  	},

  	// @method getMinZoom(): Number
  	// Returns the minimum zoom level of the map (if set in the `minZoom` option of the map or of any layers), or `0` by default.
  	getMinZoom: function () {
  		return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
  	},

  	// @method getMaxZoom(): Number
  	// Returns the maximum zoom level of the map (if set in the `maxZoom` option of the map or of any layers).
  	getMaxZoom: function () {
  		return this.options.maxZoom === undefined ?
  			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
  			this.options.maxZoom;
  	},

  	// @method getBoundsZoom(bounds: LatLngBounds, inside?: Boolean, padding?: Point): Number
  	// Returns the maximum zoom level on which the given bounds fit to the map
  	// view in its entirety. If `inside` (optional) is set to `true`, the method
  	// instead returns the minimum zoom level on which the map view fits into
  	// the given bounds in its entirety.
  	getBoundsZoom: function (bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
  		bounds = toLatLngBounds(bounds);
  		padding = toPoint(padding || [0, 0]);

  		var zoom = this.getZoom() || 0,
  		    min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    nw = bounds.getNorthWest(),
  		    se = bounds.getSouthEast(),
  		    size = this.getSize().subtract(padding),
  		    boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
  		    snap = any3d ? this.options.zoomSnap : 1,
  		    scalex = size.x / boundsSize.x,
  		    scaley = size.y / boundsSize.y,
  		    scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

  		zoom = this.getScaleZoom(scale, zoom);

  		if (snap) {
  			zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
  			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
  		}

  		return Math.max(min, Math.min(max, zoom));
  	},

  	// @method getSize(): Point
  	// Returns the current size of the map container (in pixels).
  	getSize: function () {
  		if (!this._size || this._sizeChanged) {
  			this._size = new Point(
  				this._container.clientWidth || 0,
  				this._container.clientHeight || 0);

  			this._sizeChanged = false;
  		}
  		return this._size.clone();
  	},

  	// @method getPixelBounds(): Bounds
  	// Returns the bounds of the current map view in projected pixel
  	// coordinates (sometimes useful in layer and overlay implementations).
  	getPixelBounds: function (center, zoom) {
  		var topLeftPoint = this._getTopLeftPoint(center, zoom);
  		return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
  	},

  	// TODO: Check semantics - isn't the pixel origin the 0,0 coord relative to
  	// the map pane? "left point of the map layer" can be confusing, specially
  	// since there can be negative offsets.
  	// @method getPixelOrigin(): Point
  	// Returns the projected pixel coordinates of the top left point of
  	// the map layer (useful in custom layer and overlay implementations).
  	getPixelOrigin: function () {
  		this._checkIfLoaded();
  		return this._pixelOrigin;
  	},

  	// @method getPixelWorldBounds(zoom?: Number): Bounds
  	// Returns the world's bounds in pixel coordinates for zoom level `zoom`.
  	// If `zoom` is omitted, the map's current zoom level is used.
  	getPixelWorldBounds: function (zoom) {
  		return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
  	},

  	// @section Other Methods

  	// @method getPane(pane: String|HTMLElement): HTMLElement
  	// Returns a [map pane](#map-pane), given its name or its HTML element (its identity).
  	getPane: function (pane) {
  		return typeof pane === 'string' ? this._panes[pane] : pane;
  	},

  	// @method getPanes(): Object
  	// Returns a plain object containing the names of all [panes](#map-pane) as keys and
  	// the panes as values.
  	getPanes: function () {
  		return this._panes;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the map.
  	getContainer: function () {
  		return this._container;
  	},


  	// @section Conversion Methods

  	// @method getZoomScale(toZoom: Number, fromZoom: Number): Number
  	// Returns the scale factor to be applied to a map transition from zoom level
  	// `fromZoom` to `toZoom`. Used internally to help with zoom animations.
  	getZoomScale: function (toZoom, fromZoom) {
  		// TODO replace with universal implementation after refactoring projections
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		return crs.scale(toZoom) / crs.scale(fromZoom);
  	},

  	// @method getScaleZoom(scale: Number, fromZoom: Number): Number
  	// Returns the zoom level that the map would end up at, if it is at `fromZoom`
  	// level and everything is scaled by a factor of `scale`. Inverse of
  	// [`getZoomScale`](#map-getZoomScale).
  	getScaleZoom: function (scale, fromZoom) {
  		var crs = this.options.crs;
  		fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
  		var zoom = crs.zoom(scale * crs.scale(fromZoom));
  		return isNaN(zoom) ? Infinity : zoom;
  	},

  	// @method project(latlng: LatLng, zoom: Number): Point
  	// Projects a geographical coordinate `LatLng` according to the projection
  	// of the map's CRS, then scales it according to `zoom` and the CRS's
  	// `Transformation`. The result is pixel coordinate relative to
  	// the CRS origin.
  	project: function (latlng, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
  	},

  	// @method unproject(point: Point, zoom: Number): LatLng
  	// Inverse of [`project`](#map-project).
  	unproject: function (point, zoom) {
  		zoom = zoom === undefined ? this._zoom : zoom;
  		return this.options.crs.pointToLatLng(toPoint(point), zoom);
  	},

  	// @method layerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding geographical coordinate (for the current zoom level).
  	layerPointToLatLng: function (point) {
  		var projectedPoint = toPoint(point).add(this.getPixelOrigin());
  		return this.unproject(projectedPoint);
  	},

  	// @method latLngToLayerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the [origin pixel](#map-getpixelorigin).
  	latLngToLayerPoint: function (latlng) {
  		var projectedPoint = this.project(toLatLng(latlng))._round();
  		return projectedPoint._subtract(this.getPixelOrigin());
  	},

  	// @method wrapLatLng(latlng: LatLng): LatLng
  	// Returns a `LatLng` where `lat` and `lng` has been wrapped according to the
  	// map's CRS's `wrapLat` and `wrapLng` properties, if they are outside the
  	// CRS's bounds.
  	// By default this means longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees.
  	wrapLatLng: function (latlng) {
  		return this.options.crs.wrapLatLng(toLatLng(latlng));
  	},

  	// @method wrapLatLngBounds(bounds: LatLngBounds): LatLngBounds
  	// Returns a `LatLngBounds` with the same size as the given one, ensuring that
  	// its center is within the CRS's bounds.
  	// By default this means the center longitude is wrapped around the dateline so its
  	// value is between -180 and +180 degrees, and the majority of the bounds
  	// overlaps the CRS's bounds.
  	wrapLatLngBounds: function (latlng) {
  		return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
  	},

  	// @method distance(latlng1: LatLng, latlng2: LatLng): Number
  	// Returns the distance between two geographical coordinates according to
  	// the map's CRS. By default this measures distance in meters.
  	distance: function (latlng1, latlng2) {
  		return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
  	},

  	// @method containerPointToLayerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the map container, returns the corresponding
  	// pixel coordinate relative to the [origin pixel](#map-getpixelorigin).
  	containerPointToLayerPoint: function (point) { // (Point)
  		return toPoint(point).subtract(this._getMapPanePos());
  	},

  	// @method layerPointToContainerPoint(point: Point): Point
  	// Given a pixel coordinate relative to the [origin pixel](#map-getpixelorigin),
  	// returns the corresponding pixel coordinate relative to the map container.
  	layerPointToContainerPoint: function (point) { // (Point)
  		return toPoint(point).add(this._getMapPanePos());
  	},

  	// @method containerPointToLatLng(point: Point): LatLng
  	// Given a pixel coordinate relative to the map container, returns
  	// the corresponding geographical coordinate (for the current zoom level).
  	containerPointToLatLng: function (point) {
  		var layerPoint = this.containerPointToLayerPoint(toPoint(point));
  		return this.layerPointToLatLng(layerPoint);
  	},

  	// @method latLngToContainerPoint(latlng: LatLng): Point
  	// Given a geographical coordinate, returns the corresponding pixel coordinate
  	// relative to the map container.
  	latLngToContainerPoint: function (latlng) {
  		return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
  	},

  	// @method mouseEventToContainerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to the
  	// map container where the event took place.
  	mouseEventToContainerPoint: function (e) {
  		return getMousePosition(e, this._container);
  	},

  	// @method mouseEventToLayerPoint(ev: MouseEvent): Point
  	// Given a MouseEvent object, returns the pixel coordinate relative to
  	// the [origin pixel](#map-getpixelorigin) where the event took place.
  	mouseEventToLayerPoint: function (e) {
  		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
  	},

  	// @method mouseEventToLatLng(ev: MouseEvent): LatLng
  	// Given a MouseEvent object, returns geographical coordinate where the
  	// event took place.
  	mouseEventToLatLng: function (e) { // (MouseEvent)
  		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
  	},


  	// map initialization methods

  	_initContainer: function (id) {
  		var container = this._container = get(id);

  		if (!container) {
  			throw new Error('Map container not found.');
  		} else if (container._leaflet_id) {
  			throw new Error('Map container is already initialized.');
  		}

  		on(container, 'scroll', this._onScroll, this);
  		this._containerId = stamp(container);
  	},

  	_initLayout: function () {
  		var container = this._container;

  		this._fadeAnimated = this.options.fadeAnimation && any3d;

  		addClass(container, 'leaflet-container' +
  			(touch ? ' leaflet-touch' : '') +
  			(retina ? ' leaflet-retina' : '') +
  			(ielt9 ? ' leaflet-oldie' : '') +
  			(safari ? ' leaflet-safari' : '') +
  			(this._fadeAnimated ? ' leaflet-fade-anim' : ''));

  		var position = getStyle(container, 'position');

  		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
  			container.style.position = 'relative';
  		}

  		this._initPanes();

  		if (this._initControlPos) {
  			this._initControlPos();
  		}
  	},

  	_initPanes: function () {
  		var panes = this._panes = {};
  		this._paneRenderers = {};

  		// @section
  		//
  		// Panes are DOM elements used to control the ordering of layers on the map. You
  		// can access panes with [`map.getPane`](#map-getpane) or
  		// [`map.getPanes`](#map-getpanes) methods. New panes can be created with the
  		// [`map.createPane`](#map-createpane) method.
  		//
  		// Every map has the following default panes that differ only in zIndex.
  		//
  		// @pane mapPane: HTMLElement = 'auto'
  		// Pane that contains all other map panes

  		this._mapPane = this.createPane('mapPane', this._container);
  		setPosition(this._mapPane, new Point(0, 0));

  		// @pane tilePane: HTMLElement = 200
  		// Pane for `GridLayer`s and `TileLayer`s
  		this.createPane('tilePane');
  		// @pane overlayPane: HTMLElement = 400
  		// Pane for overlay shadows (e.g. `Marker` shadows)
  		this.createPane('shadowPane');
  		// @pane shadowPane: HTMLElement = 500
  		// Pane for vectors (`Path`s, like `Polyline`s and `Polygon`s), `ImageOverlay`s and `VideoOverlay`s
  		this.createPane('overlayPane');
  		// @pane markerPane: HTMLElement = 600
  		// Pane for `Icon`s of `Marker`s
  		this.createPane('markerPane');
  		// @pane tooltipPane: HTMLElement = 650
  		// Pane for `Tooltip`s.
  		this.createPane('tooltipPane');
  		// @pane popupPane: HTMLElement = 700
  		// Pane for `Popup`s.
  		this.createPane('popupPane');

  		if (!this.options.markerZoomAnimation) {
  			addClass(panes.markerPane, 'leaflet-zoom-hide');
  			addClass(panes.shadowPane, 'leaflet-zoom-hide');
  		}
  	},


  	// private methods that modify map state

  	// @section Map state change events
  	_resetView: function (center, zoom) {
  		setPosition(this._mapPane, new Point(0, 0));

  		var loading = !this._loaded;
  		this._loaded = true;
  		zoom = this._limitZoom(zoom);

  		this.fire('viewprereset');

  		var zoomChanged = this._zoom !== zoom;
  		this
  			._moveStart(zoomChanged, false)
  			._move(center, zoom)
  			._moveEnd(zoomChanged);

  		// @event viewreset: Event
  		// Fired when the map needs to redraw its content (this usually happens
  		// on map zoom or load). Very useful for creating custom overlays.
  		this.fire('viewreset');

  		// @event load: Event
  		// Fired when the map is initialized (when its center and zoom are set
  		// for the first time).
  		if (loading) {
  			this.fire('load');
  		}
  	},

  	_moveStart: function (zoomChanged, noMoveStart) {
  		// @event zoomstart: Event
  		// Fired when the map zoom is about to change (e.g. before zoom animation).
  		// @event movestart: Event
  		// Fired when the view of the map starts changing (e.g. user starts dragging the map).
  		if (zoomChanged) {
  			this.fire('zoomstart');
  		}
  		if (!noMoveStart) {
  			this.fire('movestart');
  		}
  		return this;
  	},

  	_move: function (center, zoom, data) {
  		if (zoom === undefined) {
  			zoom = this._zoom;
  		}
  		var zoomChanged = this._zoom !== zoom;

  		this._zoom = zoom;
  		this._lastCenter = center;
  		this._pixelOrigin = this._getNewPixelOrigin(center);

  		// @event zoom: Event
  		// Fired repeatedly during any change in zoom level, including zoom
  		// and fly animations.
  		if (zoomChanged || (data && data.pinch)) {	// Always fire 'zoom' if pinching because #3530
  			this.fire('zoom', data);
  		}

  		// @event move: Event
  		// Fired repeatedly during any movement of the map, including pan and
  		// fly animations.
  		return this.fire('move', data);
  	},

  	_moveEnd: function (zoomChanged) {
  		// @event zoomend: Event
  		// Fired when the map has changed, after any animations.
  		if (zoomChanged) {
  			this.fire('zoomend');
  		}

  		// @event moveend: Event
  		// Fired when the center of the map stops changing (e.g. user stopped
  		// dragging the map).
  		return this.fire('moveend');
  	},

  	_stop: function () {
  		cancelAnimFrame(this._flyToFrame);
  		if (this._panAnim) {
  			this._panAnim.stop();
  		}
  		return this;
  	},

  	_rawPanBy: function (offset) {
  		setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
  	},

  	_getZoomSpan: function () {
  		return this.getMaxZoom() - this.getMinZoom();
  	},

  	_panInsideMaxBounds: function () {
  		if (!this._enforcingBounds) {
  			this.panInsideBounds(this.options.maxBounds);
  		}
  	},

  	_checkIfLoaded: function () {
  		if (!this._loaded) {
  			throw new Error('Set map center and zoom first.');
  		}
  	},

  	// DOM event handling

  	// @section Interaction events
  	_initEvents: function (remove$$1) {
  		this._targets = {};
  		this._targets[stamp(this._container)] = this;

  		var onOff = remove$$1 ? off : on;

  		// @event click: MouseEvent
  		// Fired when the user clicks (or taps) the map.
  		// @event dblclick: MouseEvent
  		// Fired when the user double-clicks (or double-taps) the map.
  		// @event mousedown: MouseEvent
  		// Fired when the user pushes the mouse button on the map.
  		// @event mouseup: MouseEvent
  		// Fired when the user releases the mouse button on the map.
  		// @event mouseover: MouseEvent
  		// Fired when the mouse enters the map.
  		// @event mouseout: MouseEvent
  		// Fired when the mouse leaves the map.
  		// @event mousemove: MouseEvent
  		// Fired while the mouse moves over the map.
  		// @event contextmenu: MouseEvent
  		// Fired when the user pushes the right mouse button on the map, prevents
  		// default browser context menu from showing if there are listeners on
  		// this event. Also fired on mobile when the user holds a single touch
  		// for a second (also called long press).
  		// @event keypress: KeyboardEvent
  		// Fired when the user presses a key from the keyboard that produces a character value while the map is focused.
  		// @event keydown: KeyboardEvent
  		// Fired when the user presses a key from the keyboard while the map is focused. Unlike the `keypress` event,
  		// the `keydown` event is fired for keys that produce a character value and for keys
  		// that do not produce a character value.
  		// @event keyup: KeyboardEvent
  		// Fired when the user releases a key from the keyboard while the map is focused.
  		onOff(this._container, 'click dblclick mousedown mouseup ' +
  			'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

  		if (this.options.trackResize) {
  			onOff(window, 'resize', this._onResize, this);
  		}

  		if (any3d && this.options.transform3DLimit) {
  			(remove$$1 ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
  		}
  	},

  	_onResize: function () {
  		cancelAnimFrame(this._resizeRequest);
  		this._resizeRequest = requestAnimFrame(
  		        function () { this.invalidateSize({debounceMoveend: true}); }, this);
  	},

  	_onScroll: function () {
  		this._container.scrollTop  = 0;
  		this._container.scrollLeft = 0;
  	},

  	_onMoveEnd: function () {
  		var pos = this._getMapPanePos();
  		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
  			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
  			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
  			this._resetView(this.getCenter(), this.getZoom());
  		}
  	},

  	_findEventTargets: function (e, type) {
  		var targets = [],
  		    target,
  		    isHover = type === 'mouseout' || type === 'mouseover',
  		    src = e.target || e.srcElement,
  		    dragging = false;

  		while (src) {
  			target = this._targets[stamp(src)];
  			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
  				// Prevent firing click after you just dragged an object.
  				dragging = true;
  				break;
  			}
  			if (target && target.listens(type, true)) {
  				if (isHover && !isExternalTarget(src, e)) { break; }
  				targets.push(target);
  				if (isHover) { break; }
  			}
  			if (src === this._container) { break; }
  			src = src.parentNode;
  		}
  		if (!targets.length && !dragging && !isHover && isExternalTarget(src, e)) {
  			targets = [this];
  		}
  		return targets;
  	},

  	_handleDOMEvent: function (e) {
  		if (!this._loaded || skipped(e)) { return; }

  		var type = e.type;

  		if (type === 'mousedown' || type === 'keypress' || type === 'keyup' || type === 'keydown') {
  			// prevents outline when clicking on keyboard-focusable element
  			preventOutline(e.target || e.srcElement);
  		}

  		this._fireDOMEvent(e, type);
  	},

  	_mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

  	_fireDOMEvent: function (e, type, targets) {

  		if (e.type === 'click') {
  			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
  			// @event preclick: MouseEvent
  			// Fired before mouse click on the map (sometimes useful when you
  			// want something to happen on click before any existing click
  			// handlers start running).
  			var synth = extend({}, e);
  			synth.type = 'preclick';
  			this._fireDOMEvent(synth, synth.type, targets);
  		}

  		if (e._stopped) { return; }

  		// Find the layer the event is propagating from and its parents.
  		targets = (targets || []).concat(this._findEventTargets(e, type));

  		if (!targets.length) { return; }

  		var target = targets[0];
  		if (type === 'contextmenu' && target.listens(type, true)) {
  			preventDefault(e);
  		}

  		var data = {
  			originalEvent: e
  		};

  		if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
  			var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
  			data.containerPoint = isMarker ?
  				this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
  			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
  			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
  		}

  		for (var i = 0; i < targets.length; i++) {
  			targets[i].fire(type, data, true);
  			if (data.originalEvent._stopped ||
  				(targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1)) { return; }
  		}
  	},

  	_draggableMoved: function (obj) {
  		obj = obj.dragging && obj.dragging.enabled() ? obj : this;
  		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
  	},

  	_clearHandlers: function () {
  		for (var i = 0, len = this._handlers.length; i < len; i++) {
  			this._handlers[i].disable();
  		}
  	},

  	// @section Other Methods

  	// @method whenReady(fn: Function, context?: Object): this
  	// Runs the given function `fn` when the map gets initialized with
  	// a view (center and zoom) and at least one layer, or immediately
  	// if it's already initialized, optionally passing a function context.
  	whenReady: function (callback, context) {
  		if (this._loaded) {
  			callback.call(context || this, {target: this});
  		} else {
  			this.on('load', callback, context);
  		}
  		return this;
  	},


  	// private methods for getting map state

  	_getMapPanePos: function () {
  		return getPosition(this._mapPane) || new Point(0, 0);
  	},

  	_moved: function () {
  		var pos = this._getMapPanePos();
  		return pos && !pos.equals([0, 0]);
  	},

  	_getTopLeftPoint: function (center, zoom) {
  		var pixelOrigin = center && zoom !== undefined ?
  			this._getNewPixelOrigin(center, zoom) :
  			this.getPixelOrigin();
  		return pixelOrigin.subtract(this._getMapPanePos());
  	},

  	_getNewPixelOrigin: function (center, zoom) {
  		var viewHalf = this.getSize()._divideBy(2);
  		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
  	},

  	_latLngToNewLayerPoint: function (latlng, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return this.project(latlng, zoom)._subtract(topLeft);
  	},

  	_latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
  		var topLeft = this._getNewPixelOrigin(center, zoom);
  		return toBounds([
  			this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
  			this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
  		]);
  	},

  	// layer point of the current center
  	_getCenterLayerPoint: function () {
  		return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
  	},

  	// offset of the specified place to the current center in pixels
  	_getCenterOffset: function (latlng) {
  		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
  	},

  	// adjust center for view to get inside bounds
  	_limitCenter: function (center, zoom, bounds) {

  		if (!bounds) { return center; }

  		var centerPoint = this.project(center, zoom),
  		    viewHalf = this.getSize().divideBy(2),
  		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
  		    offset = this._getBoundsOffset(viewBounds, bounds, zoom);

  		// If offset is less than a pixel, ignore.
  		// This prevents unstable projections from getting into
  		// an infinite loop of tiny offsets.
  		if (offset.round().equals([0, 0])) {
  			return center;
  		}

  		return this.unproject(centerPoint.add(offset), zoom);
  	},

  	// adjust offset for view to get inside bounds
  	_limitOffset: function (offset, bounds) {
  		if (!bounds) { return offset; }

  		var viewBounds = this.getPixelBounds(),
  		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

  		return offset.add(this._getBoundsOffset(newBounds, bounds));
  	},

  	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
  	_getBoundsOffset: function (pxBounds, maxBounds, zoom) {
  		var projectedMaxBounds = toBounds(
  		        this.project(maxBounds.getNorthEast(), zoom),
  		        this.project(maxBounds.getSouthWest(), zoom)
  		    ),
  		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
  		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

  		    dx = this._rebound(minOffset.x, -maxOffset.x),
  		    dy = this._rebound(minOffset.y, -maxOffset.y);

  		return new Point(dx, dy);
  	},

  	_rebound: function (left, right) {
  		return left + right > 0 ?
  			Math.round(left - right) / 2 :
  			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
  	},

  	_limitZoom: function (zoom) {
  		var min = this.getMinZoom(),
  		    max = this.getMaxZoom(),
  		    snap = any3d ? this.options.zoomSnap : 1;
  		if (snap) {
  			zoom = Math.round(zoom / snap) * snap;
  		}
  		return Math.max(min, Math.min(max, zoom));
  	},

  	_onPanTransitionStep: function () {
  		this.fire('move');
  	},

  	_onPanTransitionEnd: function () {
  		removeClass(this._mapPane, 'leaflet-pan-anim');
  		this.fire('moveend');
  	},

  	_tryAnimatedPan: function (center, options) {
  		// difference between the new and current centers in pixels
  		var offset = this._getCenterOffset(center)._trunc();

  		// don't animate too far unless animate: true specified in options
  		if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }

  		this.panBy(offset, options);

  		return true;
  	},

  	_createAnimProxy: function () {

  		var proxy = this._proxy = create$1('div', 'leaflet-proxy leaflet-zoom-animated');
  		this._panes.mapPane.appendChild(proxy);

  		this.on('zoomanim', function (e) {
  			var prop = TRANSFORM,
  			    transform = this._proxy.style[prop];

  			setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

  			// workaround for case when transform is the same and so transitionend event is not fired
  			if (transform === this._proxy.style[prop] && this._animatingZoom) {
  				this._onZoomTransitionEnd();
  			}
  		}, this);

  		this.on('load moveend', this._animMoveEnd, this);

  		this._on('unload', this._destroyAnimProxy, this);
  	},

  	_destroyAnimProxy: function () {
  		remove(this._proxy);
  		this.off('load moveend', this._animMoveEnd, this);
  		delete this._proxy;
  	},

  	_animMoveEnd: function () {
  		var c = this.getCenter(),
  		    z = this.getZoom();
  		setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
  	},

  	_catchTransitionEnd: function (e) {
  		if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
  			this._onZoomTransitionEnd();
  		}
  	},

  	_nothingToAnimate: function () {
  		return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
  	},

  	_tryAnimatedZoom: function (center, zoom, options) {

  		if (this._animatingZoom) { return true; }

  		options = options || {};

  		// don't animate if disabled, not supported or zoom difference is too large
  		if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() ||
  		        Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

  		// offset is the pixel coords of the zoom origin relative to the current center
  		var scale = this.getZoomScale(zoom),
  		    offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

  		// don't animate if the zoom origin isn't within one screen from the current center, unless forced
  		if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

  		requestAnimFrame(function () {
  			this
  			    ._moveStart(true, false)
  			    ._animateZoom(center, zoom, true);
  		}, this);

  		return true;
  	},

  	_animateZoom: function (center, zoom, startAnim, noUpdate) {
  		if (!this._mapPane) { return; }

  		if (startAnim) {
  			this._animatingZoom = true;

  			// remember what center/zoom to set after animation
  			this._animateToCenter = center;
  			this._animateToZoom = zoom;

  			addClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		// @section Other Events
  		// @event zoomanim: ZoomAnimEvent
  		// Fired at least once per zoom animation. For continuous zoom, like pinch zooming, fired once per frame during zoom.
  		this.fire('zoomanim', {
  			center: center,
  			zoom: zoom,
  			noUpdate: noUpdate
  		});

  		// Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
  		setTimeout(bind(this._onZoomTransitionEnd, this), 250);
  	},

  	_onZoomTransitionEnd: function () {
  		if (!this._animatingZoom) { return; }

  		if (this._mapPane) {
  			removeClass(this._mapPane, 'leaflet-zoom-anim');
  		}

  		this._animatingZoom = false;

  		this._move(this._animateToCenter, this._animateToZoom);

  		// This anim frame should prevent an obscure iOS webkit tile loading race condition.
  		requestAnimFrame(function () {
  			this._moveEnd(true);
  		}, this);
  	}
  });

  // @section

  // @factory L.map(id: String, options?: Map options)
  // Instantiates a map object given the DOM ID of a `<div>` element
  // and optionally an object literal with `Map options`.
  //
  // @alternative
  // @factory L.map(el: HTMLElement, options?: Map options)
  // Instantiates a map object given an instance of a `<div>` HTML element
  // and optionally an object literal with `Map options`.
  function createMap(id, options) {
  	return new Map(id, options);
  }

  /*
   * @class Control
   * @aka L.Control
   * @inherits Class
   *
   * L.Control is a base class for implementing map controls. Handles positioning.
   * All other controls extend from this class.
   */

  var Control = Class.extend({
  	// @section
  	// @aka Control options
  	options: {
  		// @option position: String = 'topright'
  		// The position of the control (one of the map corners). Possible values are `'topleft'`,
  		// `'topright'`, `'bottomleft'` or `'bottomright'`
  		position: 'topright'
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	/* @section
  	 * Classes extending L.Control will inherit the following methods:
  	 *
  	 * @method getPosition: string
  	 * Returns the position of the control.
  	 */
  	getPosition: function () {
  		return this.options.position;
  	},

  	// @method setPosition(position: string): this
  	// Sets the position of the control.
  	setPosition: function (position) {
  		var map = this._map;

  		if (map) {
  			map.removeControl(this);
  		}

  		this.options.position = position;

  		if (map) {
  			map.addControl(this);
  		}

  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTMLElement that contains the control.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method addTo(map: Map): this
  	// Adds the control to the given map.
  	addTo: function (map) {
  		this.remove();
  		this._map = map;

  		var container = this._container = this.onAdd(map),
  		    pos = this.getPosition(),
  		    corner = map._controlCorners[pos];

  		addClass(container, 'leaflet-control');

  		if (pos.indexOf('bottom') !== -1) {
  			corner.insertBefore(container, corner.firstChild);
  		} else {
  			corner.appendChild(container);
  		}

  		this._map.on('unload', this.remove, this);

  		return this;
  	},

  	// @method remove: this
  	// Removes the control from the map it is currently active on.
  	remove: function () {
  		if (!this._map) {
  			return this;
  		}

  		remove(this._container);

  		if (this.onRemove) {
  			this.onRemove(this._map);
  		}

  		this._map.off('unload', this.remove, this);
  		this._map = null;

  		return this;
  	},

  	_refocusOnMap: function (e) {
  		// if map exists and event is not a keyboard event
  		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
  			this._map.getContainer().focus();
  		}
  	}
  });

  var control = function (options) {
  	return new Control(options);
  };

  /* @section Extension methods
   * @uninheritable
   *
   * Every control should extend from `L.Control` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): HTMLElement
   * Should return the container DOM element for the control and add listeners on relevant map events. Called on [`control.addTo(map)`](#control-addTo).
   *
   * @method onRemove(map: Map)
   * Optional method. Should contain all clean up code that removes the listeners previously added in [`onAdd`](#control-onadd). Called on [`control.remove()`](#control-remove).
   */

  /* @namespace Map
   * @section Methods for Layers and Controls
   */
  Map.include({
  	// @method addControl(control: Control): this
  	// Adds the given control to the map
  	addControl: function (control) {
  		control.addTo(this);
  		return this;
  	},

  	// @method removeControl(control: Control): this
  	// Removes the given control from the map
  	removeControl: function (control) {
  		control.remove();
  		return this;
  	},

  	_initControlPos: function () {
  		var corners = this._controlCorners = {},
  		    l = 'leaflet-',
  		    container = this._controlContainer =
  		            create$1('div', l + 'control-container', this._container);

  		function createCorner(vSide, hSide) {
  			var className = l + vSide + ' ' + l + hSide;

  			corners[vSide + hSide] = create$1('div', className, container);
  		}

  		createCorner('top', 'left');
  		createCorner('top', 'right');
  		createCorner('bottom', 'left');
  		createCorner('bottom', 'right');
  	},

  	_clearControlPos: function () {
  		for (var i in this._controlCorners) {
  			remove(this._controlCorners[i]);
  		}
  		remove(this._controlContainer);
  		delete this._controlCorners;
  		delete this._controlContainer;
  	}
  });

  /*
   * @class Control.Layers
   * @aka L.Control.Layers
   * @inherits Control
   *
   * The layers control gives users the ability to switch between different base layers and switch overlays on/off (check out the [detailed example](http://leafletjs.com/examples/layers-control/)). Extends `Control`.
   *
   * @example
   *
   * ```js
   * var baseLayers = {
   * 	"Mapbox": mapbox,
   * 	"OpenStreetMap": osm
   * };
   *
   * var overlays = {
   * 	"Marker": marker,
   * 	"Roads": roadsLayer
   * };
   *
   * L.control.layers(baseLayers, overlays).addTo(map);
   * ```
   *
   * The `baseLayers` and `overlays` parameters are object literals with layer names as keys and `Layer` objects as values:
   *
   * ```js
   * {
   *     "<someName1>": layer1,
   *     "<someName2>": layer2
   * }
   * ```
   *
   * The layer names can contain HTML, which allows you to add additional styling to the items:
   *
   * ```js
   * {"<img src='my-layer-icon' /> <span class='my-layer-item'>My Layer</span>": myLayer}
   * ```
   */

  var Layers = Control.extend({
  	// @section
  	// @aka Control.Layers options
  	options: {
  		// @option collapsed: Boolean = true
  		// If `true`, the control will be collapsed into an icon and expanded on mouse hover or touch.
  		collapsed: true,
  		position: 'topright',

  		// @option autoZIndex: Boolean = true
  		// If `true`, the control will assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off.
  		autoZIndex: true,

  		// @option hideSingleBase: Boolean = false
  		// If `true`, the base layers in the control will be hidden when there is only one.
  		hideSingleBase: false,

  		// @option sortLayers: Boolean = false
  		// Whether to sort the layers. When `false`, layers will keep the order
  		// in which they were added to the control.
  		sortLayers: false,

  		// @option sortFunction: Function = *
  		// A [compare function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
  		// that will be used for sorting the layers, when `sortLayers` is `true`.
  		// The function receives both the `L.Layer` instances and their names, as in
  		// `sortFunction(layerA, layerB, nameA, nameB)`.
  		// By default, it sorts layers alphabetically by their name.
  		sortFunction: function (layerA, layerB, nameA, nameB) {
  			return nameA < nameB ? -1 : (nameB < nameA ? 1 : 0);
  		}
  	},

  	initialize: function (baseLayers, overlays, options) {
  		setOptions(this, options);

  		this._layerControlInputs = [];
  		this._layers = [];
  		this._lastZIndex = 0;
  		this._handlingClick = false;

  		for (var i in baseLayers) {
  			this._addLayer(baseLayers[i], i);
  		}

  		for (i in overlays) {
  			this._addLayer(overlays[i], i, true);
  		}
  	},

  	onAdd: function (map) {
  		this._initLayout();
  		this._update();

  		this._map = map;
  		map.on('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.on('add remove', this._onLayerChange, this);
  		}

  		return this._container;
  	},

  	addTo: function (map) {
  		Control.prototype.addTo.call(this, map);
  		// Trigger expand after Layers Control has been inserted into DOM so that is now has an actual height.
  		return this._expandIfNotCollapsed();
  	},

  	onRemove: function () {
  		this._map.off('zoomend', this._checkDisabledLayers, this);

  		for (var i = 0; i < this._layers.length; i++) {
  			this._layers[i].layer.off('add remove', this._onLayerChange, this);
  		}
  	},

  	// @method addBaseLayer(layer: Layer, name: String): this
  	// Adds a base layer (radio button entry) with the given name to the control.
  	addBaseLayer: function (layer, name) {
  		this._addLayer(layer, name);
  		return (this._map) ? this._update() : this;
  	},

  	// @method addOverlay(layer: Layer, name: String): this
  	// Adds an overlay (checkbox entry) with the given name to the control.
  	addOverlay: function (layer, name) {
  		this._addLayer(layer, name, true);
  		return (this._map) ? this._update() : this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Remove the given layer from the control.
  	removeLayer: function (layer) {
  		layer.off('add remove', this._onLayerChange, this);

  		var obj = this._getLayer(stamp(layer));
  		if (obj) {
  			this._layers.splice(this._layers.indexOf(obj), 1);
  		}
  		return (this._map) ? this._update() : this;
  	},

  	// @method expand(): this
  	// Expand the control container if collapsed.
  	expand: function () {
  		addClass(this._container, 'leaflet-control-layers-expanded');
  		this._section.style.height = null;
  		var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
  		if (acceptableHeight < this._section.clientHeight) {
  			addClass(this._section, 'leaflet-control-layers-scrollbar');
  			this._section.style.height = acceptableHeight + 'px';
  		} else {
  			removeClass(this._section, 'leaflet-control-layers-scrollbar');
  		}
  		this._checkDisabledLayers();
  		return this;
  	},

  	// @method collapse(): this
  	// Collapse the control container if expanded.
  	collapse: function () {
  		removeClass(this._container, 'leaflet-control-layers-expanded');
  		return this;
  	},

  	_initLayout: function () {
  		var className = 'leaflet-control-layers',
  		    container = this._container = create$1('div', className),
  		    collapsed = this.options.collapsed;

  		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
  		container.setAttribute('aria-haspopup', true);

  		disableClickPropagation(container);
  		disableScrollPropagation(container);

  		var section = this._section = create$1('section', className + '-list');

  		if (collapsed) {
  			this._map.on('click', this.collapse, this);

  			if (!android) {
  				on(container, {
  					mouseenter: this.expand,
  					mouseleave: this.collapse
  				}, this);
  			}
  		}

  		var link = this._layersLink = create$1('a', className + '-toggle', container);
  		link.href = '#';
  		link.title = 'Layers';

  		if (touch) {
  			on(link, 'click', stop);
  			on(link, 'click', this.expand, this);
  		} else {
  			on(link, 'focus', this.expand, this);
  		}

  		if (!collapsed) {
  			this.expand();
  		}

  		this._baseLayersList = create$1('div', className + '-base', section);
  		this._separator = create$1('div', className + '-separator', section);
  		this._overlaysList = create$1('div', className + '-overlays', section);

  		container.appendChild(section);
  	},

  	_getLayer: function (id) {
  		for (var i = 0; i < this._layers.length; i++) {

  			if (this._layers[i] && stamp(this._layers[i].layer) === id) {
  				return this._layers[i];
  			}
  		}
  	},

  	_addLayer: function (layer, name, overlay) {
  		if (this._map) {
  			layer.on('add remove', this._onLayerChange, this);
  		}

  		this._layers.push({
  			layer: layer,
  			name: name,
  			overlay: overlay
  		});

  		if (this.options.sortLayers) {
  			this._layers.sort(bind(function (a, b) {
  				return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
  			}, this));
  		}

  		if (this.options.autoZIndex && layer.setZIndex) {
  			this._lastZIndex++;
  			layer.setZIndex(this._lastZIndex);
  		}

  		this._expandIfNotCollapsed();
  	},

  	_update: function () {
  		if (!this._container) { return this; }

  		empty(this._baseLayersList);
  		empty(this._overlaysList);

  		this._layerControlInputs = [];
  		var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

  		for (i = 0; i < this._layers.length; i++) {
  			obj = this._layers[i];
  			this._addItem(obj);
  			overlaysPresent = overlaysPresent || obj.overlay;
  			baseLayersPresent = baseLayersPresent || !obj.overlay;
  			baseLayersCount += !obj.overlay ? 1 : 0;
  		}

  		// Hide base layers section if there's only one layer.
  		if (this.options.hideSingleBase) {
  			baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
  			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
  		}

  		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

  		return this;
  	},

  	_onLayerChange: function (e) {
  		if (!this._handlingClick) {
  			this._update();
  		}

  		var obj = this._getLayer(stamp(e.target));

  		// @namespace Map
  		// @section Layer events
  		// @event baselayerchange: LayersControlEvent
  		// Fired when the base layer is changed through the [layers control](#control-layers).
  		// @event overlayadd: LayersControlEvent
  		// Fired when an overlay is selected through the [layers control](#control-layers).
  		// @event overlayremove: LayersControlEvent
  		// Fired when an overlay is deselected through the [layers control](#control-layers).
  		// @namespace Control.Layers
  		var type = obj.overlay ?
  			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
  			(e.type === 'add' ? 'baselayerchange' : null);

  		if (type) {
  			this._map.fire(type, obj);
  		}
  	},

  	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
  	_createRadioElement: function (name, checked) {

  		var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
  				name + '"' + (checked ? ' checked="checked"' : '') + '/>';

  		var radioFragment = document.createElement('div');
  		radioFragment.innerHTML = radioHtml;

  		return radioFragment.firstChild;
  	},

  	_addItem: function (obj) {
  		var label = document.createElement('label'),
  		    checked = this._map.hasLayer(obj.layer),
  		    input;

  		if (obj.overlay) {
  			input = document.createElement('input');
  			input.type = 'checkbox';
  			input.className = 'leaflet-control-layers-selector';
  			input.defaultChecked = checked;
  		} else {
  			input = this._createRadioElement('leaflet-base-layers_' + stamp(this), checked);
  		}

  		this._layerControlInputs.push(input);
  		input.layerId = stamp(obj.layer);

  		on(input, 'click', this._onInputClick, this);

  		var name = document.createElement('span');
  		name.innerHTML = ' ' + obj.name;

  		// Helps from preventing layer control flicker when checkboxes are disabled
  		// https://github.com/Leaflet/Leaflet/issues/2771
  		var holder = document.createElement('div');

  		label.appendChild(holder);
  		holder.appendChild(input);
  		holder.appendChild(name);

  		var container = obj.overlay ? this._overlaysList : this._baseLayersList;
  		container.appendChild(label);

  		this._checkDisabledLayers();
  		return label;
  	},

  	_onInputClick: function () {
  		var inputs = this._layerControlInputs,
  		    input, layer;
  		var addedLayers = [],
  		    removedLayers = [];

  		this._handlingClick = true;

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;

  			if (input.checked) {
  				addedLayers.push(layer);
  			} else if (!input.checked) {
  				removedLayers.push(layer);
  			}
  		}

  		// Bugfix issue 2318: Should remove all old layers before readding new ones
  		for (i = 0; i < removedLayers.length; i++) {
  			if (this._map.hasLayer(removedLayers[i])) {
  				this._map.removeLayer(removedLayers[i]);
  			}
  		}
  		for (i = 0; i < addedLayers.length; i++) {
  			if (!this._map.hasLayer(addedLayers[i])) {
  				this._map.addLayer(addedLayers[i]);
  			}
  		}

  		this._handlingClick = false;

  		this._refocusOnMap();
  	},

  	_checkDisabledLayers: function () {
  		var inputs = this._layerControlInputs,
  		    input,
  		    layer,
  		    zoom = this._map.getZoom();

  		for (var i = inputs.length - 1; i >= 0; i--) {
  			input = inputs[i];
  			layer = this._getLayer(input.layerId).layer;
  			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
  			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom);

  		}
  	},

  	_expandIfNotCollapsed: function () {
  		if (this._map && !this.options.collapsed) {
  			this.expand();
  		}
  		return this;
  	},

  	_expand: function () {
  		// Backward compatibility, remove me in 1.1.
  		return this.expand();
  	},

  	_collapse: function () {
  		// Backward compatibility, remove me in 1.1.
  		return this.collapse();
  	}

  });


  // @factory L.control.layers(baselayers?: Object, overlays?: Object, options?: Control.Layers options)
  // Creates a layers control with the given layers. Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. Note that all base layers should be passed in the base layers object, but only one should be added to the map during map instantiation.
  var layers = function (baseLayers, overlays, options) {
  	return new Layers(baseLayers, overlays, options);
  };

  /*
   * @class Control.Zoom
   * @aka L.Control.Zoom
   * @inherits Control
   *
   * A basic zoom control with two buttons (zoom in and zoom out). It is put on the map by default unless you set its [`zoomControl` option](#map-zoomcontrol) to `false`. Extends `Control`.
   */

  var Zoom = Control.extend({
  	// @section
  	// @aka Control.Zoom options
  	options: {
  		position: 'topleft',

  		// @option zoomInText: String = '+'
  		// The text set on the 'zoom in' button.
  		zoomInText: '+',

  		// @option zoomInTitle: String = 'Zoom in'
  		// The title set on the 'zoom in' button.
  		zoomInTitle: 'Zoom in',

  		// @option zoomOutText: String = '&#x2212;'
  		// The text set on the 'zoom out' button.
  		zoomOutText: '&#x2212;',

  		// @option zoomOutTitle: String = 'Zoom out'
  		// The title set on the 'zoom out' button.
  		zoomOutTitle: 'Zoom out'
  	},

  	onAdd: function (map) {
  		var zoomName = 'leaflet-control-zoom',
  		    container = create$1('div', zoomName + ' leaflet-bar'),
  		    options = this.options;

  		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
  		        zoomName + '-in',  container, this._zoomIn);
  		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
  		        zoomName + '-out', container, this._zoomOut);

  		this._updateDisabled();
  		map.on('zoomend zoomlevelschange', this._updateDisabled, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  	},

  	disable: function () {
  		this._disabled = true;
  		this._updateDisabled();
  		return this;
  	},

  	enable: function () {
  		this._disabled = false;
  		this._updateDisabled();
  		return this;
  	},

  	_zoomIn: function (e) {
  		if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
  			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_zoomOut: function (e) {
  		if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
  			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
  		}
  	},

  	_createButton: function (html, title, className, container, fn) {
  		var link = create$1('a', className, container);
  		link.innerHTML = html;
  		link.href = '#';
  		link.title = title;

  		/*
  		 * Will force screen readers like VoiceOver to read this as "Zoom in - button"
  		 */
  		link.setAttribute('role', 'button');
  		link.setAttribute('aria-label', title);

  		disableClickPropagation(link);
  		on(link, 'click', stop);
  		on(link, 'click', fn, this);
  		on(link, 'click', this._refocusOnMap, this);

  		return link;
  	},

  	_updateDisabled: function () {
  		var map = this._map,
  		    className = 'leaflet-disabled';

  		removeClass(this._zoomInButton, className);
  		removeClass(this._zoomOutButton, className);

  		if (this._disabled || map._zoom === map.getMinZoom()) {
  			addClass(this._zoomOutButton, className);
  		}
  		if (this._disabled || map._zoom === map.getMaxZoom()) {
  			addClass(this._zoomInButton, className);
  		}
  	}
  });

  // @namespace Map
  // @section Control options
  // @option zoomControl: Boolean = true
  // Whether a [zoom control](#control-zoom) is added to the map by default.
  Map.mergeOptions({
  	zoomControl: true
  });

  Map.addInitHook(function () {
  	if (this.options.zoomControl) {
  		// @section Controls
  		// @property zoomControl: Control.Zoom
  		// The default zoom control (only available if the
  		// [`zoomControl` option](#map-zoomcontrol) was `true` when creating the map).
  		this.zoomControl = new Zoom();
  		this.addControl(this.zoomControl);
  	}
  });

  // @namespace Control.Zoom
  // @factory L.control.zoom(options: Control.Zoom options)
  // Creates a zoom control
  var zoom = function (options) {
  	return new Zoom(options);
  };

  /*
   * @class Control.Scale
   * @aka L.Control.Scale
   * @inherits Control
   *
   * A simple scale control that shows the scale of the current center of screen in metric (m/km) and imperial (mi/ft) systems. Extends `Control`.
   *
   * @example
   *
   * ```js
   * L.control.scale().addTo(map);
   * ```
   */

  var Scale = Control.extend({
  	// @section
  	// @aka Control.Scale options
  	options: {
  		position: 'bottomleft',

  		// @option maxWidth: Number = 100
  		// Maximum width of the control in pixels. The width is set dynamically to show round values (e.g. 100, 200, 500).
  		maxWidth: 100,

  		// @option metric: Boolean = True
  		// Whether to show the metric scale line (m/km).
  		metric: true,

  		// @option imperial: Boolean = True
  		// Whether to show the imperial scale line (mi/ft).
  		imperial: true

  		// @option updateWhenIdle: Boolean = false
  		// If `true`, the control is updated on [`moveend`](#map-moveend), otherwise it's always up-to-date (updated on [`move`](#map-move)).
  	},

  	onAdd: function (map) {
  		var className = 'leaflet-control-scale',
  		    container = create$1('div', className),
  		    options = this.options;

  		this._addScales(options, className + '-line', container);

  		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  		map.whenReady(this._update, this);

  		return container;
  	},

  	onRemove: function (map) {
  		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
  	},

  	_addScales: function (options, className, container) {
  		if (options.metric) {
  			this._mScale = create$1('div', className, container);
  		}
  		if (options.imperial) {
  			this._iScale = create$1('div', className, container);
  		}
  	},

  	_update: function () {
  		var map = this._map,
  		    y = map.getSize().y / 2;

  		var maxMeters = map.distance(
  			map.containerPointToLatLng([0, y]),
  			map.containerPointToLatLng([this.options.maxWidth, y]));

  		this._updateScales(maxMeters);
  	},

  	_updateScales: function (maxMeters) {
  		if (this.options.metric && maxMeters) {
  			this._updateMetric(maxMeters);
  		}
  		if (this.options.imperial && maxMeters) {
  			this._updateImperial(maxMeters);
  		}
  	},

  	_updateMetric: function (maxMeters) {
  		var meters = this._getRoundNum(maxMeters),
  		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

  		this._updateScale(this._mScale, label, meters / maxMeters);
  	},

  	_updateImperial: function (maxMeters) {
  		var maxFeet = maxMeters * 3.2808399,
  		    maxMiles, miles, feet;

  		if (maxFeet > 5280) {
  			maxMiles = maxFeet / 5280;
  			miles = this._getRoundNum(maxMiles);
  			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles);

  		} else {
  			feet = this._getRoundNum(maxFeet);
  			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet);
  		}
  	},

  	_updateScale: function (scale, text, ratio) {
  		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px';
  		scale.innerHTML = text;
  	},

  	_getRoundNum: function (num) {
  		var pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
  		    d = num / pow10;

  		d = d >= 10 ? 10 :
  		    d >= 5 ? 5 :
  		    d >= 3 ? 3 :
  		    d >= 2 ? 2 : 1;

  		return pow10 * d;
  	}
  });


  // @factory L.control.scale(options?: Control.Scale options)
  // Creates an scale control with the given options.
  var scale = function (options) {
  	return new Scale(options);
  };

  /*
   * @class Control.Attribution
   * @aka L.Control.Attribution
   * @inherits Control
   *
   * The attribution control allows you to display attribution data in a small text box on a map. It is put on the map by default unless you set its [`attributionControl` option](#map-attributioncontrol) to `false`, and it fetches attribution texts from layers with the [`getAttribution` method](#layer-getattribution) automatically. Extends Control.
   */

  var Attribution = Control.extend({
  	// @section
  	// @aka Control.Attribution options
  	options: {
  		position: 'bottomright',

  		// @option prefix: String = 'Leaflet'
  		// The HTML text shown before the attributions. Pass `false` to disable.
  		prefix: '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
  	},

  	initialize: function (options) {
  		setOptions(this, options);

  		this._attributions = {};
  	},

  	onAdd: function (map) {
  		map.attributionControl = this;
  		this._container = create$1('div', 'leaflet-control-attribution');
  		disableClickPropagation(this._container);

  		// TODO ugly, refactor
  		for (var i in map._layers) {
  			if (map._layers[i].getAttribution) {
  				this.addAttribution(map._layers[i].getAttribution());
  			}
  		}

  		this._update();

  		return this._container;
  	},

  	// @method setPrefix(prefix: String): this
  	// Sets the text before the attributions.
  	setPrefix: function (prefix) {
  		this.options.prefix = prefix;
  		this._update();
  		return this;
  	},

  	// @method addAttribution(text: String): this
  	// Adds an attribution text (e.g. `'Vector data &copy; Mapbox'`).
  	addAttribution: function (text) {
  		if (!text) { return this; }

  		if (!this._attributions[text]) {
  			this._attributions[text] = 0;
  		}
  		this._attributions[text]++;

  		this._update();

  		return this;
  	},

  	// @method removeAttribution(text: String): this
  	// Removes an attribution text.
  	removeAttribution: function (text) {
  		if (!text) { return this; }

  		if (this._attributions[text]) {
  			this._attributions[text]--;
  			this._update();
  		}

  		return this;
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		var attribs = [];

  		for (var i in this._attributions) {
  			if (this._attributions[i]) {
  				attribs.push(i);
  			}
  		}

  		var prefixAndAttribs = [];

  		if (this.options.prefix) {
  			prefixAndAttribs.push(this.options.prefix);
  		}
  		if (attribs.length) {
  			prefixAndAttribs.push(attribs.join(', '));
  		}

  		this._container.innerHTML = prefixAndAttribs.join(' | ');
  	}
  });

  // @namespace Map
  // @section Control options
  // @option attributionControl: Boolean = true
  // Whether a [attribution control](#control-attribution) is added to the map by default.
  Map.mergeOptions({
  	attributionControl: true
  });

  Map.addInitHook(function () {
  	if (this.options.attributionControl) {
  		new Attribution().addTo(this);
  	}
  });

  // @namespace Control.Attribution
  // @factory L.control.attribution(options: Control.Attribution options)
  // Creates an attribution control.
  var attribution = function (options) {
  	return new Attribution(options);
  };

  Control.Layers = Layers;
  Control.Zoom = Zoom;
  Control.Scale = Scale;
  Control.Attribution = Attribution;

  control.layers = layers;
  control.zoom = zoom;
  control.scale = scale;
  control.attribution = attribution;

  /*
  	L.Handler is a base class for handler classes that are used internally to inject
  	interaction features like dragging to classes like Map and Marker.
  */

  // @class Handler
  // @aka L.Handler
  // Abstract class for map interaction handlers

  var Handler = Class.extend({
  	initialize: function (map) {
  		this._map = map;
  	},

  	// @method enable(): this
  	// Enables the handler
  	enable: function () {
  		if (this._enabled) { return this; }

  		this._enabled = true;
  		this.addHooks();
  		return this;
  	},

  	// @method disable(): this
  	// Disables the handler
  	disable: function () {
  		if (!this._enabled) { return this; }

  		this._enabled = false;
  		this.removeHooks();
  		return this;
  	},

  	// @method enabled(): Boolean
  	// Returns `true` if the handler is enabled
  	enabled: function () {
  		return !!this._enabled;
  	}

  	// @section Extension methods
  	// Classes inheriting from `Handler` must implement the two following methods:
  	// @method addHooks()
  	// Called when the handler is enabled, should add event hooks.
  	// @method removeHooks()
  	// Called when the handler is disabled, should remove the event hooks added previously.
  });

  // @section There is static function which can be called without instantiating L.Handler:
  // @function addTo(map: Map, name: String): this
  // Adds a new Handler to the given map with the given name.
  Handler.addTo = function (map, name) {
  	map.addHandler(name, this);
  	return this;
  };

  var Mixin = {Events: Events};

  /*
   * @class Draggable
   * @aka L.Draggable
   * @inherits Evented
   *
   * A class for making DOM elements draggable (including touch support).
   * Used internally for map and marker dragging. Only works for elements
   * that were positioned with [`L.DomUtil.setPosition`](#domutil-setposition).
   *
   * @example
   * ```js
   * var draggable = new L.Draggable(elementToDrag);
   * draggable.enable();
   * ```
   */

  var START = touch ? 'touchstart mousedown' : 'mousedown';
  var END = {
  	mousedown: 'mouseup',
  	touchstart: 'touchend',
  	pointerdown: 'touchend',
  	MSPointerDown: 'touchend'
  };
  var MOVE = {
  	mousedown: 'mousemove',
  	touchstart: 'touchmove',
  	pointerdown: 'touchmove',
  	MSPointerDown: 'touchmove'
  };


  var Draggable = Evented.extend({

  	options: {
  		// @section
  		// @aka Draggable options
  		// @option clickTolerance: Number = 3
  		// The max number of pixels a user can shift the mouse pointer during a click
  		// for it to be considered a valid click (as opposed to a mouse drag).
  		clickTolerance: 3
  	},

  	// @constructor L.Draggable(el: HTMLElement, dragHandle?: HTMLElement, preventOutline?: Boolean, options?: Draggable options)
  	// Creates a `Draggable` object for moving `el` when you start dragging the `dragHandle` element (equals `el` itself by default).
  	initialize: function (element, dragStartTarget, preventOutline$$1, options) {
  		setOptions(this, options);

  		this._element = element;
  		this._dragStartTarget = dragStartTarget || element;
  		this._preventOutline = preventOutline$$1;
  	},

  	// @method enable()
  	// Enables the dragging ability
  	enable: function () {
  		if (this._enabled) { return; }

  		on(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = true;
  	},

  	// @method disable()
  	// Disables the dragging ability
  	disable: function () {
  		if (!this._enabled) { return; }

  		// If we're currently dragging this draggable,
  		// disabling it counts as first ending the drag.
  		if (Draggable._dragging === this) {
  			this.finishDrag();
  		}

  		off(this._dragStartTarget, START, this._onDown, this);

  		this._enabled = false;
  		this._moved = false;
  	},

  	_onDown: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }

  		this._moved = false;

  		if (hasClass(this._element, 'leaflet-zoom-anim')) { return; }

  		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }
  		Draggable._dragging = this;  // Prevent dragging multiple objects at once.

  		if (this._preventOutline) {
  			preventOutline(this._element);
  		}

  		disableImageDrag();
  		disableTextSelection();

  		if (this._moving) { return; }

  		// @event down: Event
  		// Fired when a drag is about to start.
  		this.fire('down');

  		var first = e.touches ? e.touches[0] : e,
  		    sizedParent = getSizedParentNode(this._element);

  		this._startPoint = new Point(first.clientX, first.clientY);

  		// Cache the scale, so that we can continuously compensate for it during drag (_onMove).
  		this._parentScale = getScale(sizedParent);

  		on(document, MOVE[e.type], this._onMove, this);
  		on(document, END[e.type], this._onUp, this);
  	},

  	_onMove: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }

  		if (e.touches && e.touches.length > 1) {
  			this._moved = true;
  			return;
  		}

  		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
  		    offset = new Point(first.clientX, first.clientY)._subtract(this._startPoint);

  		if (!offset.x && !offset.y) { return; }
  		if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) { return; }

  		// We assume that the parent container's position, border and scale do not change for the duration of the drag.
  		// Therefore there is no need to account for the position and border (they are eliminated by the subtraction)
  		// and we can use the cached value for the scale.
  		offset.x /= this._parentScale.x;
  		offset.y /= this._parentScale.y;

  		preventDefault(e);

  		if (!this._moved) {
  			// @event dragstart: Event
  			// Fired when a drag starts
  			this.fire('dragstart');

  			this._moved = true;
  			this._startPos = getPosition(this._element).subtract(offset);

  			addClass(document.body, 'leaflet-dragging');

  			this._lastTarget = e.target || e.srcElement;
  			// IE and Edge do not give the <use> element, so fetch it
  			// if necessary
  			if (window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance) {
  				this._lastTarget = this._lastTarget.correspondingUseElement;
  			}
  			addClass(this._lastTarget, 'leaflet-drag-target');
  		}

  		this._newPos = this._startPos.add(offset);
  		this._moving = true;

  		cancelAnimFrame(this._animRequest);
  		this._lastEvent = e;
  		this._animRequest = requestAnimFrame(this._updatePosition, this, true);
  	},

  	_updatePosition: function () {
  		var e = {originalEvent: this._lastEvent};

  		// @event predrag: Event
  		// Fired continuously during dragging *before* each corresponding
  		// update of the element's position.
  		this.fire('predrag', e);
  		setPosition(this._element, this._newPos);

  		// @event drag: Event
  		// Fired continuously during dragging.
  		this.fire('drag', e);
  	},

  	_onUp: function (e) {
  		// Ignore simulated events, since we handle both touch and
  		// mouse explicitly; otherwise we risk getting duplicates of
  		// touch events, see #4315.
  		// Also ignore the event if disabled; this happens in IE11
  		// under some circumstances, see #3666.
  		if (e._simulated || !this._enabled) { return; }
  		this.finishDrag();
  	},

  	finishDrag: function () {
  		removeClass(document.body, 'leaflet-dragging');

  		if (this._lastTarget) {
  			removeClass(this._lastTarget, 'leaflet-drag-target');
  			this._lastTarget = null;
  		}

  		for (var i in MOVE) {
  			off(document, MOVE[i], this._onMove, this);
  			off(document, END[i], this._onUp, this);
  		}

  		enableImageDrag();
  		enableTextSelection();

  		if (this._moved && this._moving) {
  			// ensure drag is not fired after dragend
  			cancelAnimFrame(this._animRequest);

  			// @event dragend: DragEndEvent
  			// Fired when the drag ends.
  			this.fire('dragend', {
  				distance: this._newPos.distanceTo(this._startPos)
  			});
  		}

  		this._moving = false;
  		Draggable._dragging = false;
  	}

  });

  /*
   * @namespace LineUtil
   *
   * Various utility functions for polyline points processing, used by Leaflet internally to make polylines lightning-fast.
   */

  // Simplify polyline with vertex reduction and Douglas-Peucker simplification.
  // Improves rendering performance dramatically by lessening the number of points to draw.

  // @function simplify(points: Point[], tolerance: Number): Point[]
  // Dramatically reduces the number of points in a polyline while retaining
  // its shape and returns a new array of simplified points, using the
  // [Douglas-Peucker algorithm](http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm).
  // Used for a huge performance boost when processing/displaying Leaflet polylines for
  // each zoom level and also reducing visual noise. tolerance affects the amount of
  // simplification (lesser value means higher quality but slower and with more points).
  // Also released as a separated micro-library [Simplify.js](http://mourner.github.com/simplify-js/).
  function simplify(points, tolerance) {
  	if (!tolerance || !points.length) {
  		return points.slice();
  	}

  	var sqTolerance = tolerance * tolerance;

  	    // stage 1: vertex reduction
  	    points = _reducePoints(points, sqTolerance);

  	    // stage 2: Douglas-Peucker simplification
  	    points = _simplifyDP(points, sqTolerance);

  	return points;
  }

  // @function pointToSegmentDistance(p: Point, p1: Point, p2: Point): Number
  // Returns the distance between point `p` and segment `p1` to `p2`.
  function pointToSegmentDistance(p, p1, p2) {
  	return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
  }

  // @function closestPointOnSegment(p: Point, p1: Point, p2: Point): Number
  // Returns the closest point from a point `p` on a segment `p1` to `p2`.
  function closestPointOnSegment(p, p1, p2) {
  	return _sqClosestPointOnSegment(p, p1, p2);
  }

  // Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
  function _simplifyDP(points, sqTolerance) {

  	var len = points.length,
  	    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
  	    markers = new ArrayConstructor(len);

  	    markers[0] = markers[len - 1] = 1;

  	_simplifyDPStep(points, markers, sqTolerance, 0, len - 1);

  	var i,
  	    newPoints = [];

  	for (i = 0; i < len; i++) {
  		if (markers[i]) {
  			newPoints.push(points[i]);
  		}
  	}

  	return newPoints;
  }

  function _simplifyDPStep(points, markers, sqTolerance, first, last) {

  	var maxSqDist = 0,
  	index, i, sqDist;

  	for (i = first + 1; i <= last - 1; i++) {
  		sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);

  		if (sqDist > maxSqDist) {
  			index = i;
  			maxSqDist = sqDist;
  		}
  	}

  	if (maxSqDist > sqTolerance) {
  		markers[index] = 1;

  		_simplifyDPStep(points, markers, sqTolerance, first, index);
  		_simplifyDPStep(points, markers, sqTolerance, index, last);
  	}
  }

  // reduce points that are too close to each other to a single point
  function _reducePoints(points, sqTolerance) {
  	var reducedPoints = [points[0]];

  	for (var i = 1, prev = 0, len = points.length; i < len; i++) {
  		if (_sqDist(points[i], points[prev]) > sqTolerance) {
  			reducedPoints.push(points[i]);
  			prev = i;
  		}
  	}
  	if (prev < len - 1) {
  		reducedPoints.push(points[len - 1]);
  	}
  	return reducedPoints;
  }

  var _lastCode;

  // @function clipSegment(a: Point, b: Point, bounds: Bounds, useLastCode?: Boolean, round?: Boolean): Point[]|Boolean
  // Clips the segment a to b by rectangular bounds with the
  // [Cohen-Sutherland algorithm](https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm)
  // (modifying the segment points directly!). Used by Leaflet to only show polyline
  // points that are on the screen or near, increasing performance.
  function clipSegment(a, b, bounds, useLastCode, round) {
  	var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds),
  	    codeB = _getBitCode(b, bounds),

  	    codeOut, p, newCode;

  	    // save 2nd code to avoid calculating it on the next segment
  	    _lastCode = codeB;

  	while (true) {
  		// if a,b is inside the clip window (trivial accept)
  		if (!(codeA | codeB)) {
  			return [a, b];
  		}

  		// if a,b is outside the clip window (trivial reject)
  		if (codeA & codeB) {
  			return false;
  		}

  		// other cases
  		codeOut = codeA || codeB;
  		p = _getEdgeIntersection(a, b, codeOut, bounds, round);
  		newCode = _getBitCode(p, bounds);

  		if (codeOut === codeA) {
  			a = p;
  			codeA = newCode;
  		} else {
  			b = p;
  			codeB = newCode;
  		}
  	}
  }

  function _getEdgeIntersection(a, b, code, bounds, round) {
  	var dx = b.x - a.x,
  	    dy = b.y - a.y,
  	    min = bounds.min,
  	    max = bounds.max,
  	    x, y;

  	if (code & 8) { // top
  		x = a.x + dx * (max.y - a.y) / dy;
  		y = max.y;

  	} else if (code & 4) { // bottom
  		x = a.x + dx * (min.y - a.y) / dy;
  		y = min.y;

  	} else if (code & 2) { // right
  		x = max.x;
  		y = a.y + dy * (max.x - a.x) / dx;

  	} else if (code & 1) { // left
  		x = min.x;
  		y = a.y + dy * (min.x - a.x) / dx;
  	}

  	return new Point(x, y, round);
  }

  function _getBitCode(p, bounds) {
  	var code = 0;

  	if (p.x < bounds.min.x) { // left
  		code |= 1;
  	} else if (p.x > bounds.max.x) { // right
  		code |= 2;
  	}

  	if (p.y < bounds.min.y) { // bottom
  		code |= 4;
  	} else if (p.y > bounds.max.y) { // top
  		code |= 8;
  	}

  	return code;
  }

  // square distance (to avoid unnecessary Math.sqrt calls)
  function _sqDist(p1, p2) {
  	var dx = p2.x - p1.x,
  	    dy = p2.y - p1.y;
  	return dx * dx + dy * dy;
  }

  // return closest point on segment or distance to that point
  function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
  	var x = p1.x,
  	    y = p1.y,
  	    dx = p2.x - x,
  	    dy = p2.y - y,
  	    dot = dx * dx + dy * dy,
  	    t;

  	if (dot > 0) {
  		t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

  		if (t > 1) {
  			x = p2.x;
  			y = p2.y;
  		} else if (t > 0) {
  			x += dx * t;
  			y += dy * t;
  		}
  	}

  	dx = p.x - x;
  	dy = p.y - y;

  	return sqDist ? dx * dx + dy * dy : new Point(x, y);
  }


  // @function isFlat(latlngs: LatLng[]): Boolean
  // Returns true if `latlngs` is a flat array, false is nested.
  function isFlat(latlngs) {
  	return !isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined');
  }

  function _flat(latlngs) {
  	console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.');
  	return isFlat(latlngs);
  }

  var LineUtil = ({
    simplify: simplify,
    pointToSegmentDistance: pointToSegmentDistance,
    closestPointOnSegment: closestPointOnSegment,
    clipSegment: clipSegment,
    _getEdgeIntersection: _getEdgeIntersection,
    _getBitCode: _getBitCode,
    _sqClosestPointOnSegment: _sqClosestPointOnSegment,
    isFlat: isFlat,
    _flat: _flat
  });

  /*
   * @namespace PolyUtil
   * Various utility functions for polygon geometries.
   */

  /* @function clipPolygon(points: Point[], bounds: Bounds, round?: Boolean): Point[]
   * Clips the polygon geometry defined by the given `points` by the given bounds (using the [Sutherland-Hodgman algorithm](https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm)).
   * Used by Leaflet to only show polygon points that are on the screen or near, increasing
   * performance. Note that polygon points needs different algorithm for clipping
   * than polyline, so there's a separate method for it.
   */
  function clipPolygon(points, bounds, round) {
  	var clippedPoints,
  	    edges = [1, 4, 2, 8],
  	    i, j, k,
  	    a, b,
  	    len, edge, p;

  	for (i = 0, len = points.length; i < len; i++) {
  		points[i]._code = _getBitCode(points[i], bounds);
  	}

  	// for each edge (left, bottom, right, top)
  	for (k = 0; k < 4; k++) {
  		edge = edges[k];
  		clippedPoints = [];

  		for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
  			a = points[i];
  			b = points[j];

  			// if a is inside the clip window
  			if (!(a._code & edge)) {
  				// if b is outside the clip window (a->b goes out of screen)
  				if (b._code & edge) {
  					p = _getEdgeIntersection(b, a, edge, bounds, round);
  					p._code = _getBitCode(p, bounds);
  					clippedPoints.push(p);
  				}
  				clippedPoints.push(a);

  			// else if b is inside the clip window (a->b enters the screen)
  			} else if (!(b._code & edge)) {
  				p = _getEdgeIntersection(b, a, edge, bounds, round);
  				p._code = _getBitCode(p, bounds);
  				clippedPoints.push(p);
  			}
  		}
  		points = clippedPoints;
  	}

  	return points;
  }

  var PolyUtil = ({
    clipPolygon: clipPolygon
  });

  /*
   * @namespace Projection
   * @section
   * Leaflet comes with a set of already defined Projections out of the box:
   *
   * @projection L.Projection.LonLat
   *
   * Equirectangular, or Plate Carree projection — the most simple projection,
   * mostly used by GIS enthusiasts. Directly maps `x` as longitude, and `y` as
   * latitude. Also suitable for flat worlds, e.g. game maps. Used by the
   * `EPSG:4326` and `Simple` CRS.
   */

  var LonLat = {
  	project: function (latlng) {
  		return new Point(latlng.lng, latlng.lat);
  	},

  	unproject: function (point) {
  		return new LatLng(point.y, point.x);
  	},

  	bounds: new Bounds([-180, -90], [180, 90])
  };

  /*
   * @namespace Projection
   * @projection L.Projection.Mercator
   *
   * Elliptical Mercator projection — more complex than Spherical Mercator. Assumes that Earth is an ellipsoid. Used by the EPSG:3395 CRS.
   */

  var Mercator = {
  	R: 6378137,
  	R_MINOR: 6356752.314245179,

  	bounds: new Bounds([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),

  	project: function (latlng) {
  		var d = Math.PI / 180,
  		    r = this.R,
  		    y = latlng.lat * d,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    con = e * Math.sin(y);

  		var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
  		y = -r * Math.log(Math.max(ts, 1E-10));

  		return new Point(latlng.lng * d * r, y);
  	},

  	unproject: function (point) {
  		var d = 180 / Math.PI,
  		    r = this.R,
  		    tmp = this.R_MINOR / r,
  		    e = Math.sqrt(1 - tmp * tmp),
  		    ts = Math.exp(-point.y / r),
  		    phi = Math.PI / 2 - 2 * Math.atan(ts);

  		for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
  			con = e * Math.sin(phi);
  			con = Math.pow((1 - con) / (1 + con), e / 2);
  			dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
  			phi += dphi;
  		}

  		return new LatLng(phi * d, point.x * d / r);
  	}
  };

  /*
   * @class Projection

   * An object with methods for projecting geographical coordinates of the world onto
   * a flat surface (and back). See [Map projection](http://en.wikipedia.org/wiki/Map_projection).

   * @property bounds: Bounds
   * The bounds (specified in CRS units) where the projection is valid

   * @method project(latlng: LatLng): Point
   * Projects geographical coordinates into a 2D point.
   * Only accepts actual `L.LatLng` instances, not arrays.

   * @method unproject(point: Point): LatLng
   * The inverse of `project`. Projects a 2D point into a geographical location.
   * Only accepts actual `L.Point` instances, not arrays.

   * Note that the projection instances do not inherit from Leaflet's `Class` object,
   * and can't be instantiated. Also, new classes can't inherit from them,
   * and methods can't be added to them with the `include` function.

   */

  var index = ({
    LonLat: LonLat,
    Mercator: Mercator,
    SphericalMercator: SphericalMercator
  });

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG3395
   *
   * Rarely used by some commercial tile providers. Uses Elliptical Mercator projection.
   */
  var EPSG3395 = extend({}, Earth, {
  	code: 'EPSG:3395',
  	projection: Mercator,

  	transformation: (function () {
  		var scale = 0.5 / (Math.PI * Mercator.R);
  		return toTransformation(scale, 0.5, -scale, 0.5);
  	}())
  });

  /*
   * @namespace CRS
   * @crs L.CRS.EPSG4326
   *
   * A common CRS among GIS enthusiasts. Uses simple Equirectangular projection.
   *
   * Leaflet 1.0.x complies with the [TMS coordinate scheme for EPSG:4326](https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification#global-geodetic),
   * which is a breaking change from 0.7.x behaviour.  If you are using a `TileLayer`
   * with this CRS, ensure that there are two 256x256 pixel tiles covering the
   * whole earth at zoom level zero, and that the tile coordinate origin is (-180,+90),
   * or (-180,-90) for `TileLayer`s with [the `tms` option](#tilelayer-tms) set.
   */

  var EPSG4326 = extend({}, Earth, {
  	code: 'EPSG:4326',
  	projection: LonLat,
  	transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
  });

  /*
   * @namespace CRS
   * @crs L.CRS.Simple
   *
   * A simple CRS that maps longitude and latitude into `x` and `y` directly.
   * May be used for maps of flat surfaces (e.g. game maps). Note that the `y`
   * axis should still be inverted (going from bottom to top). `distance()` returns
   * simple euclidean distance.
   */

  var Simple = extend({}, CRS, {
  	projection: LonLat,
  	transformation: toTransformation(1, 0, -1, 0),

  	scale: function (zoom) {
  		return Math.pow(2, zoom);
  	},

  	zoom: function (scale) {
  		return Math.log(scale) / Math.LN2;
  	},

  	distance: function (latlng1, latlng2) {
  		var dx = latlng2.lng - latlng1.lng,
  		    dy = latlng2.lat - latlng1.lat;

  		return Math.sqrt(dx * dx + dy * dy);
  	},

  	infinite: true
  });

  CRS.Earth = Earth;
  CRS.EPSG3395 = EPSG3395;
  CRS.EPSG3857 = EPSG3857;
  CRS.EPSG900913 = EPSG900913;
  CRS.EPSG4326 = EPSG4326;
  CRS.Simple = Simple;

  /*
   * @class Layer
   * @inherits Evented
   * @aka L.Layer
   * @aka ILayer
   *
   * A set of methods from the Layer base class that all Leaflet layers use.
   * Inherits all methods, options and events from `L.Evented`.
   *
   * @example
   *
   * ```js
   * var layer = L.marker(latlng).addTo(map);
   * layer.addTo(map);
   * layer.remove();
   * ```
   *
   * @event add: Event
   * Fired after the layer is added to a map
   *
   * @event remove: Event
   * Fired after the layer is removed from a map
   */


  var Layer = Evented.extend({

  	// Classes extending `L.Layer` will inherit the following options:
  	options: {
  		// @option pane: String = 'overlayPane'
  		// By default the layer will be added to the map's [overlay pane](#map-overlaypane). Overriding this option will cause the layer to be placed on another pane by default.
  		pane: 'overlayPane',

  		// @option attribution: String = null
  		// String to be shown in the attribution control, e.g. "© OpenStreetMap contributors". It describes the layer data and is often a legal obligation towards copyright holders and tile providers.
  		attribution: null,

  		bubblingMouseEvents: true
  	},

  	/* @section
  	 * Classes extending `L.Layer` will inherit the following methods:
  	 *
  	 * @method addTo(map: Map|LayerGroup): this
  	 * Adds the layer to the given map or layer group.
  	 */
  	addTo: function (map) {
  		map.addLayer(this);
  		return this;
  	},

  	// @method remove: this
  	// Removes the layer from the map it is currently active on.
  	remove: function () {
  		return this.removeFrom(this._map || this._mapToAdd);
  	},

  	// @method removeFrom(map: Map): this
  	// Removes the layer from the given map
  	//
  	// @alternative
  	// @method removeFrom(group: LayerGroup): this
  	// Removes the layer from the given `LayerGroup`
  	removeFrom: function (obj) {
  		if (obj) {
  			obj.removeLayer(this);
  		}
  		return this;
  	},

  	// @method getPane(name? : String): HTMLElement
  	// Returns the `HTMLElement` representing the named pane on the map. If `name` is omitted, returns the pane for this layer.
  	getPane: function (name) {
  		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane);
  	},

  	addInteractiveTarget: function (targetEl) {
  		this._map._targets[stamp(targetEl)] = this;
  		return this;
  	},

  	removeInteractiveTarget: function (targetEl) {
  		delete this._map._targets[stamp(targetEl)];
  		return this;
  	},

  	// @method getAttribution: String
  	// Used by the `attribution control`, returns the [attribution option](#gridlayer-attribution).
  	getAttribution: function () {
  		return this.options.attribution;
  	},

  	_layerAdd: function (e) {
  		var map = e.target;

  		// check in case layer gets added and then removed before the map is ready
  		if (!map.hasLayer(this)) { return; }

  		this._map = map;
  		this._zoomAnimated = map._zoomAnimated;

  		if (this.getEvents) {
  			var events = this.getEvents();
  			map.on(events, this);
  			this.once('remove', function () {
  				map.off(events, this);
  			}, this);
  		}

  		this.onAdd(map);

  		if (this.getAttribution && map.attributionControl) {
  			map.attributionControl.addAttribution(this.getAttribution());
  		}

  		this.fire('add');
  		map.fire('layeradd', {layer: this});
  	}
  });

  /* @section Extension methods
   * @uninheritable
   *
   * Every layer should extend from `L.Layer` and (re-)implement the following methods.
   *
   * @method onAdd(map: Map): this
   * Should contain code that creates DOM elements for the layer, adds them to `map panes` where they should belong and puts listeners on relevant map events. Called on [`map.addLayer(layer)`](#map-addlayer).
   *
   * @method onRemove(map: Map): this
   * Should contain all clean up code that removes the layer's elements from the DOM and removes listeners previously added in [`onAdd`](#layer-onadd). Called on [`map.removeLayer(layer)`](#map-removelayer).
   *
   * @method getEvents(): Object
   * This optional method should return an object like `{ viewreset: this._reset }` for [`addEventListener`](#evented-addeventlistener). The event handlers in this object will be automatically added and removed from the map with your layer.
   *
   * @method getAttribution(): String
   * This optional method should return a string containing HTML to be shown on the `Attribution control` whenever the layer is visible.
   *
   * @method beforeAdd(map: Map): this
   * Optional method. Called on [`map.addLayer(layer)`](#map-addlayer), before the layer is added to the map, before events are initialized, without waiting until the map is in a usable state. Use for early initialization only.
   */


  /* @namespace Map
   * @section Layer events
   *
   * @event layeradd: LayerEvent
   * Fired when a new layer is added to the map.
   *
   * @event layerremove: LayerEvent
   * Fired when some layer is removed from the map
   *
   * @section Methods for Layers and Controls
   */
  Map.include({
  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the map
  	addLayer: function (layer) {
  		if (!layer._layerAdd) {
  			throw new Error('The provided object is not a Layer.');
  		}

  		var id = stamp(layer);
  		if (this._layers[id]) { return this; }
  		this._layers[id] = layer;

  		layer._mapToAdd = this;

  		if (layer.beforeAdd) {
  			layer.beforeAdd(this);
  		}

  		this.whenReady(layer._layerAdd, layer);

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the map.
  	removeLayer: function (layer) {
  		var id = stamp(layer);

  		if (!this._layers[id]) { return this; }

  		if (this._loaded) {
  			layer.onRemove(this);
  		}

  		if (layer.getAttribution && this.attributionControl) {
  			this.attributionControl.removeAttribution(layer.getAttribution());
  		}

  		delete this._layers[id];

  		if (this._loaded) {
  			this.fire('layerremove', {layer: layer});
  			layer.fire('remove');
  		}

  		layer._map = layer._mapToAdd = null;

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the map
  	hasLayer: function (layer) {
  		return !!layer && (stamp(layer) in this._layers);
  	},

  	/* @method eachLayer(fn: Function, context?: Object): this
  	 * Iterates over the layers of the map, optionally specifying context of the iterator function.
  	 * ```
  	 * map.eachLayer(function(layer){
  	 *     layer.bindPopup('Hello');
  	 * });
  	 * ```
  	 */
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	_addLayers: function (layers) {
  		layers = layers ? (isArray(layers) ? layers : [layers]) : [];

  		for (var i = 0, len = layers.length; i < len; i++) {
  			this.addLayer(layers[i]);
  		}
  	},

  	_addZoomLimit: function (layer) {
  		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
  			this._zoomBoundLayers[stamp(layer)] = layer;
  			this._updateZoomLevels();
  		}
  	},

  	_removeZoomLimit: function (layer) {
  		var id = stamp(layer);

  		if (this._zoomBoundLayers[id]) {
  			delete this._zoomBoundLayers[id];
  			this._updateZoomLevels();
  		}
  	},

  	_updateZoomLevels: function () {
  		var minZoom = Infinity,
  		    maxZoom = -Infinity,
  		    oldZoomSpan = this._getZoomSpan();

  		for (var i in this._zoomBoundLayers) {
  			var options = this._zoomBoundLayers[i].options;

  			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom);
  			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom);
  		}

  		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom;
  		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom;

  		// @section Map state change events
  		// @event zoomlevelschange: Event
  		// Fired when the number of zoomlevels on the map is changed due
  		// to adding or removing a layer.
  		if (oldZoomSpan !== this._getZoomSpan()) {
  			this.fire('zoomlevelschange');
  		}

  		if (this.options.maxZoom === undefined && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
  			this.setZoom(this._layersMaxZoom);
  		}
  		if (this.options.minZoom === undefined && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
  			this.setZoom(this._layersMinZoom);
  		}
  	}
  });

  /*
   * @class LayerGroup
   * @aka L.LayerGroup
   * @inherits Layer
   *
   * Used to group several layers and handle them as one. If you add it to the map,
   * any layers added or removed from the group will be added/removed on the map as
   * well. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.layerGroup([marker1, marker2])
   * 	.addLayer(polyline)
   * 	.addTo(map);
   * ```
   */

  var LayerGroup = Layer.extend({

  	initialize: function (layers, options) {
  		setOptions(this, options);

  		this._layers = {};

  		var i, len;

  		if (layers) {
  			for (i = 0, len = layers.length; i < len; i++) {
  				this.addLayer(layers[i]);
  			}
  		}
  	},

  	// @method addLayer(layer: Layer): this
  	// Adds the given layer to the group.
  	addLayer: function (layer) {
  		var id = this.getLayerId(layer);

  		this._layers[id] = layer;

  		if (this._map) {
  			this._map.addLayer(layer);
  		}

  		return this;
  	},

  	// @method removeLayer(layer: Layer): this
  	// Removes the given layer from the group.
  	// @alternative
  	// @method removeLayer(id: Number): this
  	// Removes the layer with the given internal ID from the group.
  	removeLayer: function (layer) {
  		var id = layer in this._layers ? layer : this.getLayerId(layer);

  		if (this._map && this._layers[id]) {
  			this._map.removeLayer(this._layers[id]);
  		}

  		delete this._layers[id];

  		return this;
  	},

  	// @method hasLayer(layer: Layer): Boolean
  	// Returns `true` if the given layer is currently added to the group.
  	// @alternative
  	// @method hasLayer(id: Number): Boolean
  	// Returns `true` if the given internal ID is currently added to the group.
  	hasLayer: function (layer) {
  		if (!layer) { return false; }
  		var layerId = typeof layer === 'number' ? layer : this.getLayerId(layer);
  		return layerId in this._layers;
  	},

  	// @method clearLayers(): this
  	// Removes all the layers from the group.
  	clearLayers: function () {
  		return this.eachLayer(this.removeLayer, this);
  	},

  	// @method invoke(methodName: String, …): this
  	// Calls `methodName` on every layer contained in this group, passing any
  	// additional parameters. Has no effect if the layers contained do not
  	// implement `methodName`.
  	invoke: function (methodName) {
  		var args = Array.prototype.slice.call(arguments, 1),
  		    i, layer;

  		for (i in this._layers) {
  			layer = this._layers[i];

  			if (layer[methodName]) {
  				layer[methodName].apply(layer, args);
  			}
  		}

  		return this;
  	},

  	onAdd: function (map) {
  		this.eachLayer(map.addLayer, map);
  	},

  	onRemove: function (map) {
  		this.eachLayer(map.removeLayer, map);
  	},

  	// @method eachLayer(fn: Function, context?: Object): this
  	// Iterates over the layers of the group, optionally specifying context of the iterator function.
  	// ```js
  	// group.eachLayer(function (layer) {
  	// 	layer.bindPopup('Hello');
  	// });
  	// ```
  	eachLayer: function (method, context) {
  		for (var i in this._layers) {
  			method.call(context, this._layers[i]);
  		}
  		return this;
  	},

  	// @method getLayer(id: Number): Layer
  	// Returns the layer with the given internal ID.
  	getLayer: function (id) {
  		return this._layers[id];
  	},

  	// @method getLayers(): Layer[]
  	// Returns an array of all the layers added to the group.
  	getLayers: function () {
  		var layers = [];
  		this.eachLayer(layers.push, layers);
  		return layers;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Calls `setZIndex` on every layer contained in this group, passing the z-index.
  	setZIndex: function (zIndex) {
  		return this.invoke('setZIndex', zIndex);
  	},

  	// @method getLayerId(layer: Layer): Number
  	// Returns the internal ID for a layer
  	getLayerId: function (layer) {
  		return stamp(layer);
  	}
  });


  // @factory L.layerGroup(layers?: Layer[], options?: Object)
  // Create a layer group, optionally given an initial set of layers and an `options` object.
  var layerGroup = function (layers, options) {
  	return new LayerGroup(layers, options);
  };

  /*
   * @class FeatureGroup
   * @aka L.FeatureGroup
   * @inherits LayerGroup
   *
   * Extended `LayerGroup` that makes it easier to do the same thing to all its member layers:
   *  * [`bindPopup`](#layer-bindpopup) binds a popup to all of the layers at once (likewise with [`bindTooltip`](#layer-bindtooltip))
   *  * Events are propagated to the `FeatureGroup`, so if the group has an event
   * handler, it will handle events from any of the layers. This includes mouse events
   * and custom events.
   *  * Has `layeradd` and `layerremove` events
   *
   * @example
   *
   * ```js
   * L.featureGroup([marker1, marker2, polyline])
   * 	.bindPopup('Hello world!')
   * 	.on('click', function() { alert('Clicked on a member of the group!'); })
   * 	.addTo(map);
   * ```
   */

  var FeatureGroup = LayerGroup.extend({

  	addLayer: function (layer) {
  		if (this.hasLayer(layer)) {
  			return this;
  		}

  		layer.addEventParent(this);

  		LayerGroup.prototype.addLayer.call(this, layer);

  		// @event layeradd: LayerEvent
  		// Fired when a layer is added to this `FeatureGroup`
  		return this.fire('layeradd', {layer: layer});
  	},

  	removeLayer: function (layer) {
  		if (!this.hasLayer(layer)) {
  			return this;
  		}
  		if (layer in this._layers) {
  			layer = this._layers[layer];
  		}

  		layer.removeEventParent(this);

  		LayerGroup.prototype.removeLayer.call(this, layer);

  		// @event layerremove: LayerEvent
  		// Fired when a layer is removed from this `FeatureGroup`
  		return this.fire('layerremove', {layer: layer});
  	},

  	// @method setStyle(style: Path options): this
  	// Sets the given path options to each layer of the group that has a `setStyle` method.
  	setStyle: function (style) {
  		return this.invoke('setStyle', style);
  	},

  	// @method bringToFront(): this
  	// Brings the layer group to the top of all other layers
  	bringToFront: function () {
  		return this.invoke('bringToFront');
  	},

  	// @method bringToBack(): this
  	// Brings the layer group to the back of all other layers
  	bringToBack: function () {
  		return this.invoke('bringToBack');
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the LatLngBounds of the Feature Group (created from bounds and coordinates of its children).
  	getBounds: function () {
  		var bounds = new LatLngBounds();

  		for (var id in this._layers) {
  			var layer = this._layers[id];
  			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
  		}
  		return bounds;
  	}
  });

  // @factory L.featureGroup(layers?: Layer[], options?: Object)
  // Create a feature group, optionally given an initial set of layers and an `options` object.
  var featureGroup = function (layers, options) {
  	return new FeatureGroup(layers, options);
  };

  /*
   * @class Icon
   * @aka L.Icon
   *
   * Represents an icon to provide when creating a marker.
   *
   * @example
   *
   * ```js
   * var myIcon = L.icon({
   *     iconUrl: 'my-icon.png',
   *     iconRetinaUrl: 'my-icon@2x.png',
   *     iconSize: [38, 95],
   *     iconAnchor: [22, 94],
   *     popupAnchor: [-3, -76],
   *     shadowUrl: 'my-icon-shadow.png',
   *     shadowRetinaUrl: 'my-icon-shadow@2x.png',
   *     shadowSize: [68, 95],
   *     shadowAnchor: [22, 94]
   * });
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * `L.Icon.Default` extends `L.Icon` and is the blue icon Leaflet uses for markers by default.
   *
   */

  var Icon = Class.extend({

  	/* @section
  	 * @aka Icon options
  	 *
  	 * @option iconUrl: String = null
  	 * **(required)** The URL to the icon image (absolute or relative to your script path).
  	 *
  	 * @option iconRetinaUrl: String = null
  	 * The URL to a retina sized version of the icon image (absolute or relative to your
  	 * script path). Used for Retina screen devices.
  	 *
  	 * @option iconSize: Point = null
  	 * Size of the icon image in pixels.
  	 *
  	 * @option iconAnchor: Point = null
  	 * The coordinates of the "tip" of the icon (relative to its top left corner). The icon
  	 * will be aligned so that this point is at the marker's geographical location. Centered
  	 * by default if size is specified, also can be set in CSS with negative margins.
  	 *
  	 * @option popupAnchor: Point = [0, 0]
  	 * The coordinates of the point from which popups will "open", relative to the icon anchor.
  	 *
  	 * @option tooltipAnchor: Point = [0, 0]
  	 * The coordinates of the point from which tooltips will "open", relative to the icon anchor.
  	 *
  	 * @option shadowUrl: String = null
  	 * The URL to the icon shadow image. If not specified, no shadow image will be created.
  	 *
  	 * @option shadowRetinaUrl: String = null
  	 *
  	 * @option shadowSize: Point = null
  	 * Size of the shadow image in pixels.
  	 *
  	 * @option shadowAnchor: Point = null
  	 * The coordinates of the "tip" of the shadow (relative to its top left corner) (the same
  	 * as iconAnchor if not specified).
  	 *
  	 * @option className: String = ''
  	 * A custom class name to assign to both icon and shadow images. Empty by default.
  	 */

  	options: {
  		popupAnchor: [0, 0],
  		tooltipAnchor: [0, 0]
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	// @method createIcon(oldIcon?: HTMLElement): HTMLElement
  	// Called internally when the icon has to be shown, returns a `<img>` HTML element
  	// styled according to the options.
  	createIcon: function (oldIcon) {
  		return this._createIcon('icon', oldIcon);
  	},

  	// @method createShadow(oldIcon?: HTMLElement): HTMLElement
  	// As `createIcon`, but for the shadow beneath it.
  	createShadow: function (oldIcon) {
  		return this._createIcon('shadow', oldIcon);
  	},

  	_createIcon: function (name, oldIcon) {
  		var src = this._getIconUrl(name);

  		if (!src) {
  			if (name === 'icon') {
  				throw new Error('iconUrl not set in Icon options (see the docs).');
  			}
  			return null;
  		}

  		var img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null);
  		this._setIconStyles(img, name);

  		return img;
  	},

  	_setIconStyles: function (img, name) {
  		var options = this.options;
  		var sizeOption = options[name + 'Size'];

  		if (typeof sizeOption === 'number') {
  			sizeOption = [sizeOption, sizeOption];
  		}

  		var size = toPoint(sizeOption),
  		    anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
  		            size && size.divideBy(2, true));

  		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

  		if (anchor) {
  			img.style.marginLeft = (-anchor.x) + 'px';
  			img.style.marginTop  = (-anchor.y) + 'px';
  		}

  		if (size) {
  			img.style.width  = size.x + 'px';
  			img.style.height = size.y + 'px';
  		}
  	},

  	_createImg: function (src, el) {
  		el = el || document.createElement('img');
  		el.src = src;
  		return el;
  	},

  	_getIconUrl: function (name) {
  		return retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url'];
  	}
  });


  // @factory L.icon(options: Icon options)
  // Creates an icon instance with the given options.
  function icon(options) {
  	return new Icon(options);
  }

  /*
   * @miniclass Icon.Default (Icon)
   * @aka L.Icon.Default
   * @section
   *
   * A trivial subclass of `Icon`, represents the icon to use in `Marker`s when
   * no icon is specified. Points to the blue marker image distributed with Leaflet
   * releases.
   *
   * In order to customize the default icon, just change the properties of `L.Icon.Default.prototype.options`
   * (which is a set of `Icon options`).
   *
   * If you want to _completely_ replace the default icon, override the
   * `L.Marker.prototype.options.icon` with your own icon instead.
   */

  var IconDefault = Icon.extend({

  	options: {
  		iconUrl:       'marker-icon.png',
  		iconRetinaUrl: 'marker-icon-2x.png',
  		shadowUrl:     'marker-shadow.png',
  		iconSize:    [25, 41],
  		iconAnchor:  [12, 41],
  		popupAnchor: [1, -34],
  		tooltipAnchor: [16, -28],
  		shadowSize:  [41, 41]
  	},

  	_getIconUrl: function (name) {
  		if (!IconDefault.imagePath) {	// Deprecated, backwards-compatibility only
  			IconDefault.imagePath = this._detectIconPath();
  		}

  		// @option imagePath: String
  		// `Icon.Default` will try to auto-detect the location of the
  		// blue icon images. If you are placing these images in a non-standard
  		// way, set this option to point to the right path.
  		return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
  	},

  	_detectIconPath: function () {
  		var el = create$1('div',  'leaflet-default-icon-path', document.body);
  		var path = getStyle(el, 'background-image') ||
  		           getStyle(el, 'backgroundImage');	// IE8

  		document.body.removeChild(el);

  		if (path === null || path.indexOf('url') !== 0) {
  			path = '';
  		} else {
  			path = path.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, '');
  		}

  		return path;
  	}
  });

  /*
   * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
   */


  /* @namespace Marker
   * @section Interaction handlers
   *
   * Interaction handlers are properties of a marker instance that allow you to control interaction behavior in runtime, enabling or disabling certain features such as dragging (see `Handler` methods). Example:
   *
   * ```js
   * marker.dragging.disable();
   * ```
   *
   * @property dragging: Handler
   * Marker dragging handler (by both mouse and touch). Only valid when the marker is on the map (Otherwise set [`marker.options.draggable`](#marker-draggable)).
   */

  var MarkerDrag = Handler.extend({
  	initialize: function (marker) {
  		this._marker = marker;
  	},

  	addHooks: function () {
  		var icon = this._marker._icon;

  		if (!this._draggable) {
  			this._draggable = new Draggable(icon, icon, true);
  		}

  		this._draggable.on({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).enable();

  		addClass(icon, 'leaflet-marker-draggable');
  	},

  	removeHooks: function () {
  		this._draggable.off({
  			dragstart: this._onDragStart,
  			predrag: this._onPreDrag,
  			drag: this._onDrag,
  			dragend: this._onDragEnd
  		}, this).disable();

  		if (this._marker._icon) {
  			removeClass(this._marker._icon, 'leaflet-marker-draggable');
  		}
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	_adjustPan: function (e) {
  		var marker = this._marker,
  		    map = marker._map,
  		    speed = this._marker.options.autoPanSpeed,
  		    padding = this._marker.options.autoPanPadding,
  		    iconPos = getPosition(marker._icon),
  		    bounds = map.getPixelBounds(),
  		    origin = map.getPixelOrigin();

  		var panBounds = toBounds(
  			bounds.min._subtract(origin).add(padding),
  			bounds.max._subtract(origin).subtract(padding)
  		);

  		if (!panBounds.contains(iconPos)) {
  			// Compute incremental movement
  			var movement = toPoint(
  				(Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds.max.x - panBounds.max.x) -
  				(Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds.min.x - panBounds.min.x),

  				(Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds.max.y - panBounds.max.y) -
  				(Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds.min.y - panBounds.min.y)
  			).multiplyBy(speed);

  			map.panBy(movement, {animate: false});

  			this._draggable._newPos._add(movement);
  			this._draggable._startPos._add(movement);

  			setPosition(marker._icon, this._draggable._newPos);
  			this._onDrag(e);

  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDragStart: function () {
  		// @section Dragging events
  		// @event dragstart: Event
  		// Fired when the user starts dragging the marker.

  		// @event movestart: Event
  		// Fired when the marker starts moving (because of dragging).

  		this._oldLatLng = this._marker.getLatLng();

  		// When using ES6 imports it could not be set when `Popup` was not imported as well
  		this._marker.closePopup && this._marker.closePopup();

  		this._marker
  			.fire('movestart')
  			.fire('dragstart');
  	},

  	_onPreDrag: function (e) {
  		if (this._marker.options.autoPan) {
  			cancelAnimFrame(this._panRequest);
  			this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
  		}
  	},

  	_onDrag: function (e) {
  		var marker = this._marker,
  		    shadow = marker._shadow,
  		    iconPos = getPosition(marker._icon),
  		    latlng = marker._map.layerPointToLatLng(iconPos);

  		// update shadow position
  		if (shadow) {
  			setPosition(shadow, iconPos);
  		}

  		marker._latlng = latlng;
  		e.latlng = latlng;
  		e.oldLatLng = this._oldLatLng;

  		// @event drag: Event
  		// Fired repeatedly while the user drags the marker.
  		marker
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_onDragEnd: function (e) {
  		// @event dragend: DragEndEvent
  		// Fired when the user stops dragging the marker.

  		 cancelAnimFrame(this._panRequest);

  		// @event moveend: Event
  		// Fired when the marker stops moving (because of dragging).
  		delete this._oldLatLng;
  		this._marker
  		    .fire('moveend')
  		    .fire('dragend', e);
  	}
  });

  /*
   * @class Marker
   * @inherits Interactive layer
   * @aka L.Marker
   * L.Marker is used to display clickable/draggable icons on the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * L.marker([50.5, 30.5]).addTo(map);
   * ```
   */

  var Marker = Layer.extend({

  	// @section
  	// @aka Marker options
  	options: {
  		// @option icon: Icon = *
  		// Icon instance to use for rendering the marker.
  		// See [Icon documentation](#L.Icon) for details on how to customize the marker icon.
  		// If not specified, a common instance of `L.Icon.Default` is used.
  		icon: new IconDefault(),

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option keyboard: Boolean = true
  		// Whether the marker can be tabbed to with a keyboard and clicked by pressing enter.
  		keyboard: true,

  		// @option title: String = ''
  		// Text for the browser tooltip that appear on marker hover (no tooltip by default).
  		title: '',

  		// @option alt: String = ''
  		// Text for the `alt` attribute of the icon image (useful for accessibility).
  		alt: '',

  		// @option zIndexOffset: Number = 0
  		// By default, marker images zIndex is set automatically based on its latitude. Use this option if you want to put the marker on top of all others (or below), specifying a high value like `1000` (or high negative value, respectively).
  		zIndexOffset: 0,

  		// @option opacity: Number = 1.0
  		// The opacity of the marker.
  		opacity: 1,

  		// @option riseOnHover: Boolean = false
  		// If `true`, the marker will get on top of others when you hover the mouse over it.
  		riseOnHover: false,

  		// @option riseOffset: Number = 250
  		// The z-index offset used for the `riseOnHover` feature.
  		riseOffset: 250,

  		// @option pane: String = 'markerPane'
  		// `Map pane` where the markers icon will be added.
  		pane: 'markerPane',

  		// @option shadowPane: String = 'shadowPane'
  		// `Map pane` where the markers shadow will be added.
  		shadowPane: 'shadowPane',

  		// @option bubblingMouseEvents: Boolean = false
  		// When `true`, a mouse event on this marker will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: false,

  		// @section Draggable marker options
  		// @option draggable: Boolean = false
  		// Whether the marker is draggable with mouse/touch or not.
  		draggable: false,

  		// @option autoPan: Boolean = false
  		// Whether to pan the map when dragging this marker near its edge or not.
  		autoPan: false,

  		// @option autoPanPadding: Point = Point(50, 50)
  		// Distance (in pixels to the left/right and to the top/bottom) of the
  		// map edge to start panning the map.
  		autoPanPadding: [50, 50],

  		// @option autoPanSpeed: Number = 10
  		// Number of pixels the map should pan by.
  		autoPanSpeed: 10
  	},

  	/* @section
  	 *
  	 * In addition to [shared layer methods](#Layer) like `addTo()` and `remove()` and [popup methods](#Popup) like bindPopup() you can also use the following methods:
  	 */

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

  		if (this._zoomAnimated) {
  			map.on('zoomanim', this._animateZoom, this);
  		}

  		this._initIcon();
  		this.update();
  	},

  	onRemove: function (map) {
  		if (this.dragging && this.dragging.enabled()) {
  			this.options.draggable = true;
  			this.dragging.removeHooks();
  		}
  		delete this.dragging;

  		if (this._zoomAnimated) {
  			map.off('zoomanim', this._animateZoom, this);
  		}

  		this._removeIcon();
  		this._removeShadow();
  	},

  	getEvents: function () {
  		return {
  			zoom: this.update,
  			viewreset: this.update
  		};
  	},

  	// @method getLatLng: LatLng
  	// Returns the current geographical position of the marker.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Changes the marker position to the given point.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.update();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#marker-setlatlng) or by [dragging](#marker-dragging). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method setZIndexOffset(offset: Number): this
  	// Changes the [zIndex offset](#marker-zindexoffset) of the marker.
  	setZIndexOffset: function (offset) {
  		this.options.zIndexOffset = offset;
  		return this.update();
  	},

  	// @method getIcon: Icon
  	// Returns the current icon used by the marker
  	getIcon: function () {
  		return this.options.icon;
  	},

  	// @method setIcon(icon: Icon): this
  	// Changes the marker icon.
  	setIcon: function (icon) {

  		this.options.icon = icon;

  		if (this._map) {
  			this._initIcon();
  			this.update();
  		}

  		if (this._popup) {
  			this.bindPopup(this._popup, this._popup.options);
  		}

  		return this;
  	},

  	getElement: function () {
  		return this._icon;
  	},

  	update: function () {

  		if (this._icon && this._map) {
  			var pos = this._map.latLngToLayerPoint(this._latlng).round();
  			this._setPos(pos);
  		}

  		return this;
  	},

  	_initIcon: function () {
  		var options = this.options,
  		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		var icon = options.icon.createIcon(this._icon),
  		    addIcon = false;

  		// if we're not reusing the icon, remove the old one and init new one
  		if (icon !== this._icon) {
  			if (this._icon) {
  				this._removeIcon();
  			}
  			addIcon = true;

  			if (options.title) {
  				icon.title = options.title;
  			}

  			if (icon.tagName === 'IMG') {
  				icon.alt = options.alt || '';
  			}
  		}

  		addClass(icon, classToAdd);

  		if (options.keyboard) {
  			icon.tabIndex = '0';
  		}

  		this._icon = icon;

  		if (options.riseOnHover) {
  			this.on({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		var newShadow = options.icon.createShadow(this._shadow),
  		    addShadow = false;

  		if (newShadow !== this._shadow) {
  			this._removeShadow();
  			addShadow = true;
  		}

  		if (newShadow) {
  			addClass(newShadow, classToAdd);
  			newShadow.alt = '';
  		}
  		this._shadow = newShadow;


  		if (options.opacity < 1) {
  			this._updateOpacity();
  		}


  		if (addIcon) {
  			this.getPane().appendChild(this._icon);
  		}
  		this._initInteraction();
  		if (newShadow && addShadow) {
  			this.getPane(options.shadowPane).appendChild(this._shadow);
  		}
  	},

  	_removeIcon: function () {
  		if (this.options.riseOnHover) {
  			this.off({
  				mouseover: this._bringToFront,
  				mouseout: this._resetZIndex
  			});
  		}

  		remove(this._icon);
  		this.removeInteractiveTarget(this._icon);

  		this._icon = null;
  	},

  	_removeShadow: function () {
  		if (this._shadow) {
  			remove(this._shadow);
  		}
  		this._shadow = null;
  	},

  	_setPos: function (pos) {

  		if (this._icon) {
  			setPosition(this._icon, pos);
  		}

  		if (this._shadow) {
  			setPosition(this._shadow, pos);
  		}

  		this._zIndex = pos.y + this.options.zIndexOffset;

  		this._resetZIndex();
  	},

  	_updateZIndex: function (offset) {
  		if (this._icon) {
  			this._icon.style.zIndex = this._zIndex + offset;
  		}
  	},

  	_animateZoom: function (opt) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

  		this._setPos(pos);
  	},

  	_initInteraction: function () {

  		if (!this.options.interactive) { return; }

  		addClass(this._icon, 'leaflet-interactive');

  		this.addInteractiveTarget(this._icon);

  		if (MarkerDrag) {
  			var draggable = this.options.draggable;
  			if (this.dragging) {
  				draggable = this.dragging.enabled();
  				this.dragging.disable();
  			}

  			this.dragging = new MarkerDrag(this);

  			if (draggable) {
  				this.dragging.enable();
  			}
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the opacity of the marker.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		if (this._map) {
  			this._updateOpacity();
  		}

  		return this;
  	},

  	_updateOpacity: function () {
  		var opacity = this.options.opacity;

  		if (this._icon) {
  			setOpacity(this._icon, opacity);
  		}

  		if (this._shadow) {
  			setOpacity(this._shadow, opacity);
  		}
  	},

  	_bringToFront: function () {
  		this._updateZIndex(this.options.riseOffset);
  	},

  	_resetZIndex: function () {
  		this._updateZIndex(0);
  	},

  	_getPopupAnchor: function () {
  		return this.options.icon.options.popupAnchor;
  	},

  	_getTooltipAnchor: function () {
  		return this.options.icon.options.tooltipAnchor;
  	}
  });


  // factory L.marker(latlng: LatLng, options? : Marker options)

  // @factory L.marker(latlng: LatLng, options? : Marker options)
  // Instantiates a Marker object given a geographical point and optionally an options object.
  function marker(latlng, options) {
  	return new Marker(latlng, options);
  }

  /*
   * @class Path
   * @aka L.Path
   * @inherits Interactive layer
   *
   * An abstract class that contains options and constants shared between vector
   * overlays (Polygon, Polyline, Circle). Do not use it directly. Extends `Layer`.
   */

  var Path = Layer.extend({

  	// @section
  	// @aka Path options
  	options: {
  		// @option stroke: Boolean = true
  		// Whether to draw stroke along the path. Set it to `false` to disable borders on polygons or circles.
  		stroke: true,

  		// @option color: String = '#3388ff'
  		// Stroke color
  		color: '#3388ff',

  		// @option weight: Number = 3
  		// Stroke width in pixels
  		weight: 3,

  		// @option opacity: Number = 1.0
  		// Stroke opacity
  		opacity: 1,

  		// @option lineCap: String= 'round'
  		// A string that defines [shape to be used at the end](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linecap) of the stroke.
  		lineCap: 'round',

  		// @option lineJoin: String = 'round'
  		// A string that defines [shape to be used at the corners](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-linejoin) of the stroke.
  		lineJoin: 'round',

  		// @option dashArray: String = null
  		// A string that defines the stroke [dash pattern](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dasharray). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashArray: null,

  		// @option dashOffset: String = null
  		// A string that defines the [distance into the dash pattern to start the dash](https://developer.mozilla.org/docs/Web/SVG/Attribute/stroke-dashoffset). Doesn't work on `Canvas`-powered layers in [some old browsers](https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/setLineDash#Browser_compatibility).
  		dashOffset: null,

  		// @option fill: Boolean = depends
  		// Whether to fill the path with color. Set it to `false` to disable filling on polygons or circles.
  		fill: false,

  		// @option fillColor: String = *
  		// Fill color. Defaults to the value of the [`color`](#path-color) option
  		fillColor: null,

  		// @option fillOpacity: Number = 0.2
  		// Fill opacity.
  		fillOpacity: 0.2,

  		// @option fillRule: String = 'evenodd'
  		// A string that defines [how the inside of a shape](https://developer.mozilla.org/docs/Web/SVG/Attribute/fill-rule) is determined.
  		fillRule: 'evenodd',

  		// className: '',

  		// Option inherited from "Interactive layer" abstract class
  		interactive: true,

  		// @option bubblingMouseEvents: Boolean = true
  		// When `true`, a mouse event on this path will trigger the same event on the map
  		// (unless [`L.DomEvent.stopPropagation`](#domevent-stoppropagation) is used).
  		bubblingMouseEvents: true
  	},

  	beforeAdd: function (map) {
  		// Renderer is set here because we need to call renderer.getEvents
  		// before this.getEvents.
  		this._renderer = map.getRenderer(this);
  	},

  	onAdd: function () {
  		this._renderer._initPath(this);
  		this._reset();
  		this._renderer._addPath(this);
  	},

  	onRemove: function () {
  		this._renderer._removePath(this);
  	},

  	// @method redraw(): this
  	// Redraws the layer. Sometimes useful after you changed the coordinates that the path uses.
  	redraw: function () {
  		if (this._map) {
  			this._renderer._updatePath(this);
  		}
  		return this;
  	},

  	// @method setStyle(style: Path options): this
  	// Changes the appearance of a Path based on the options in the `Path options` object.
  	setStyle: function (style) {
  		setOptions(this, style);
  		if (this._renderer) {
  			this._renderer._updateStyle(this);
  			if (this.options.stroke && style && Object.prototype.hasOwnProperty.call(style, 'weight')) {
  				this._updateBounds();
  			}
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all path layers.
  	bringToFront: function () {
  		if (this._renderer) {
  			this._renderer._bringToFront(this);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all path layers.
  	bringToBack: function () {
  		if (this._renderer) {
  			this._renderer._bringToBack(this);
  		}
  		return this;
  	},

  	getElement: function () {
  		return this._path;
  	},

  	_reset: function () {
  		// defined in child classes
  		this._project();
  		this._update();
  	},

  	_clickTolerance: function () {
  		// used when doing hit detection for Canvas layers
  		return (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance;
  	}
  });

  /*
   * @class CircleMarker
   * @aka L.CircleMarker
   * @inherits Path
   *
   * A circle of a fixed size with radius specified in pixels. Extends `Path`.
   */

  var CircleMarker = Path.extend({

  	// @section
  	// @aka CircleMarker options
  	options: {
  		fill: true,

  		// @option radius: Number = 10
  		// Radius of the circle marker, in pixels
  		radius: 10
  	},

  	initialize: function (latlng, options) {
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);
  		this._radius = this.options.radius;
  	},

  	// @method setLatLng(latLng: LatLng): this
  	// Sets the position of a circle marker to a new location.
  	setLatLng: function (latlng) {
  		var oldLatLng = this._latlng;
  		this._latlng = toLatLng(latlng);
  		this.redraw();

  		// @event move: Event
  		// Fired when the marker is moved via [`setLatLng`](#circlemarker-setlatlng). Old and new coordinates are included in event arguments as `oldLatLng`, `latlng`.
  		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
  	},

  	// @method getLatLng(): LatLng
  	// Returns the current geographical position of the circle marker
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle marker. Units are in pixels.
  	setRadius: function (radius) {
  		this.options.radius = this._radius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of the circle
  	getRadius: function () {
  		return this._radius;
  	},

  	setStyle : function (options) {
  		var radius = options && options.radius || this._radius;
  		Path.prototype.setStyle.call(this, options);
  		this.setRadius(radius);
  		return this;
  	},

  	_project: function () {
  		this._point = this._map.latLngToLayerPoint(this._latlng);
  		this._updateBounds();
  	},

  	_updateBounds: function () {
  		var r = this._radius,
  		    r2 = this._radiusY || r,
  		    w = this._clickTolerance(),
  		    p = [r + w, r2 + w];
  		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p));
  	},

  	_update: function () {
  		if (this._map) {
  			this._updatePath();
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updateCircle(this);
  	},

  	_empty: function () {
  		return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
  	}
  });


  // @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
  // Instantiates a circle marker object given a geographical point, and an optional options object.
  function circleMarker(latlng, options) {
  	return new CircleMarker(latlng, options);
  }

  /*
   * @class Circle
   * @aka L.Circle
   * @inherits CircleMarker
   *
   * A class for drawing circle overlays on a map. Extends `CircleMarker`.
   *
   * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion).
   *
   * @example
   *
   * ```js
   * L.circle([50.5, 30.5], {radius: 200}).addTo(map);
   * ```
   */

  var Circle = CircleMarker.extend({

  	initialize: function (latlng, options, legacyOptions) {
  		if (typeof options === 'number') {
  			// Backwards compatibility with 0.7.x factory (latlng, radius, options?)
  			options = extend({}, legacyOptions, {radius: options});
  		}
  		setOptions(this, options);
  		this._latlng = toLatLng(latlng);

  		if (isNaN(this.options.radius)) { throw new Error('Circle radius cannot be NaN'); }

  		// @section
  		// @aka Circle options
  		// @option radius: Number; Radius of the circle, in meters.
  		this._mRadius = this.options.radius;
  	},

  	// @method setRadius(radius: Number): this
  	// Sets the radius of a circle. Units are in meters.
  	setRadius: function (radius) {
  		this._mRadius = radius;
  		return this.redraw();
  	},

  	// @method getRadius(): Number
  	// Returns the current radius of a circle. Units are in meters.
  	getRadius: function () {
  		return this._mRadius;
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		var half = [this._radius, this._radiusY || this._radius];

  		return new LatLngBounds(
  			this._map.layerPointToLatLng(this._point.subtract(half)),
  			this._map.layerPointToLatLng(this._point.add(half)));
  	},

  	setStyle: Path.prototype.setStyle,

  	_project: function () {

  		var lng = this._latlng.lng,
  		    lat = this._latlng.lat,
  		    map = this._map,
  		    crs = map.options.crs;

  		if (crs.distance === Earth.distance) {
  			var d = Math.PI / 180,
  			    latR = (this._mRadius / Earth.R) / d,
  			    top = map.project([lat + latR, lng]),
  			    bottom = map.project([lat - latR, lng]),
  			    p = top.add(bottom).divideBy(2),
  			    lat2 = map.unproject(p).lat,
  			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
  			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;

  			if (isNaN(lngR) || lngR === 0) {
  				lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
  			}

  			this._point = p.subtract(map.getPixelOrigin());
  			this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
  			this._radiusY = p.y - top.y;

  		} else {
  			var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));

  			this._point = map.latLngToLayerPoint(this._latlng);
  			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
  		}

  		this._updateBounds();
  	}
  });

  // @factory L.circle(latlng: LatLng, options?: Circle options)
  // Instantiates a circle object given a geographical point, and an options object
  // which contains the circle radius.
  // @alternative
  // @factory L.circle(latlng: LatLng, radius: Number, options?: Circle options)
  // Obsolete way of instantiating a circle, for compatibility with 0.7.x code.
  // Do not use in new applications or plugins.
  function circle(latlng, options, legacyOptions) {
  	return new Circle(latlng, options, legacyOptions);
  }

  /*
   * @class Polyline
   * @aka L.Polyline
   * @inherits Path
   *
   * A class for drawing polyline overlays on a map. Extends `Path`.
   *
   * @example
   *
   * ```js
   * // create a red polyline from an array of LatLng points
   * var latlngs = [
   * 	[45.51, -122.68],
   * 	[37.77, -122.43],
   * 	[34.04, -118.2]
   * ];
   *
   * var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polyline
   * map.fitBounds(polyline.getBounds());
   * ```
   *
   * You can also pass a multi-dimensional array to represent a `MultiPolyline` shape:
   *
   * ```js
   * // create a red polyline from an array of arrays of LatLng points
   * var latlngs = [
   * 	[[45.51, -122.68],
   * 	 [37.77, -122.43],
   * 	 [34.04, -118.2]],
   * 	[[40.78, -73.91],
   * 	 [41.83, -87.62],
   * 	 [32.76, -96.72]]
   * ];
   * ```
   */


  var Polyline = Path.extend({

  	// @section
  	// @aka Polyline options
  	options: {
  		// @option smoothFactor: Number = 1.0
  		// How much to simplify the polyline on each zoom level. More means
  		// better performance and smoother look, and less means more accurate representation.
  		smoothFactor: 1.0,

  		// @option noClip: Boolean = false
  		// Disable polyline clipping.
  		noClip: false
  	},

  	initialize: function (latlngs, options) {
  		setOptions(this, options);
  		this._setLatLngs(latlngs);
  	},

  	// @method getLatLngs(): LatLng[]
  	// Returns an array of the points in the path, or nested arrays of points in case of multi-polyline.
  	getLatLngs: function () {
  		return this._latlngs;
  	},

  	// @method setLatLngs(latlngs: LatLng[]): this
  	// Replaces all the points in the polyline with the given array of geographical points.
  	setLatLngs: function (latlngs) {
  		this._setLatLngs(latlngs);
  		return this.redraw();
  	},

  	// @method isEmpty(): Boolean
  	// Returns `true` if the Polyline has no LatLngs.
  	isEmpty: function () {
  		return !this._latlngs.length;
  	},

  	// @method closestLayerPoint(p: Point): Point
  	// Returns the point closest to `p` on the Polyline.
  	closestLayerPoint: function (p) {
  		var minDistance = Infinity,
  		    minPoint = null,
  		    closest = _sqClosestPointOnSegment,
  		    p1, p2;

  		for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
  			var points = this._parts[j];

  			for (var i = 1, len = points.length; i < len; i++) {
  				p1 = points[i - 1];
  				p2 = points[i];

  				var sqDist = closest(p, p1, p2, true);

  				if (sqDist < minDistance) {
  					minDistance = sqDist;
  					minPoint = closest(p, p1, p2);
  				}
  			}
  		}
  		if (minPoint) {
  			minPoint.distance = Math.sqrt(minDistance);
  		}
  		return minPoint;
  	},

  	// @method getCenter(): LatLng
  	// Returns the center ([centroid](http://en.wikipedia.org/wiki/Centroid)) of the polyline.
  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}

  		var i, halfDist, segDist, dist, p1, p2, ratio,
  		    points = this._rings[0],
  		    len = points.length;

  		if (!len) { return null; }

  		// polyline centroid algorithm; only uses the first ring if there are multiple

  		for (i = 0, halfDist = 0; i < len - 1; i++) {
  			halfDist += points[i].distanceTo(points[i + 1]) / 2;
  		}

  		// The line is so small in the current view that all points are on the same pixel.
  		if (halfDist === 0) {
  			return this._map.layerPointToLatLng(points[0]);
  		}

  		for (i = 0, dist = 0; i < len - 1; i++) {
  			p1 = points[i];
  			p2 = points[i + 1];
  			segDist = p1.distanceTo(p2);
  			dist += segDist;

  			if (dist > halfDist) {
  				ratio = (dist - halfDist) / segDist;
  				return this._map.layerPointToLatLng([
  					p2.x - ratio * (p2.x - p1.x),
  					p2.y - ratio * (p2.y - p1.y)
  				]);
  			}
  		}
  	},

  	// @method getBounds(): LatLngBounds
  	// Returns the `LatLngBounds` of the path.
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method addLatLng(latlng: LatLng, latlngs?: LatLng[]): this
  	// Adds a given point to the polyline. By default, adds to the first ring of
  	// the polyline in case of a multi-polyline, but can be overridden by passing
  	// a specific ring as a LatLng array (that you can earlier access with [`getLatLngs`](#polyline-getlatlngs)).
  	addLatLng: function (latlng, latlngs) {
  		latlngs = latlngs || this._defaultShape();
  		latlng = toLatLng(latlng);
  		latlngs.push(latlng);
  		this._bounds.extend(latlng);
  		return this.redraw();
  	},

  	_setLatLngs: function (latlngs) {
  		this._bounds = new LatLngBounds();
  		this._latlngs = this._convertLatLngs(latlngs);
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
  	},

  	// recursively convert latlngs input into actual LatLng instances; calculate bounds along the way
  	_convertLatLngs: function (latlngs) {
  		var result = [],
  		    flat = isFlat(latlngs);

  		for (var i = 0, len = latlngs.length; i < len; i++) {
  			if (flat) {
  				result[i] = toLatLng(latlngs[i]);
  				this._bounds.extend(result[i]);
  			} else {
  				result[i] = this._convertLatLngs(latlngs[i]);
  			}
  		}

  		return result;
  	},

  	_project: function () {
  		var pxBounds = new Bounds();
  		this._rings = [];
  		this._projectLatlngs(this._latlngs, this._rings, pxBounds);

  		if (this._bounds.isValid() && pxBounds.isValid()) {
  			this._rawPxBounds = pxBounds;
  			this._updateBounds();
  		}
  	},

  	_updateBounds: function () {
  		var w = this._clickTolerance(),
  		    p = new Point(w, w);
  		this._pxBounds = new Bounds([
  			this._rawPxBounds.min.subtract(p),
  			this._rawPxBounds.max.add(p)
  		]);
  	},

  	// recursively turns latlngs into a set of rings with projected coordinates
  	_projectLatlngs: function (latlngs, result, projectedBounds) {
  		var flat = latlngs[0] instanceof LatLng,
  		    len = latlngs.length,
  		    i, ring;

  		if (flat) {
  			ring = [];
  			for (i = 0; i < len; i++) {
  				ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
  				projectedBounds.extend(ring[i]);
  			}
  			result.push(ring);
  		} else {
  			for (i = 0; i < len; i++) {
  				this._projectLatlngs(latlngs[i], result, projectedBounds);
  			}
  		}
  	},

  	// clip polyline by renderer bounds so that we have less to render for performance
  	_clipPoints: function () {
  		var bounds = this._renderer._bounds;

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		var parts = this._parts,
  		    i, j, k, len, len2, segment, points;

  		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
  			points = this._rings[i];

  			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
  				segment = clipSegment(points[j], points[j + 1], bounds, j, true);

  				if (!segment) { continue; }

  				parts[k] = parts[k] || [];
  				parts[k].push(segment[0]);

  				// if segment goes out of screen, or it's the last one, it's the end of the line part
  				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
  					parts[k].push(segment[1]);
  					k++;
  				}
  			}
  		}
  	},

  	// simplify each clipped part of the polyline for performance
  	_simplifyPoints: function () {
  		var parts = this._parts,
  		    tolerance = this.options.smoothFactor;

  		for (var i = 0, len = parts.length; i < len; i++) {
  			parts[i] = simplify(parts[i], tolerance);
  		}
  	},

  	_update: function () {
  		if (!this._map) { return; }

  		this._clipPoints();
  		this._simplifyPoints();
  		this._updatePath();
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p, closed) {
  		var i, j, k, len, len2, part,
  		    w = this._clickTolerance();

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// hit detection for polylines
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				if (!closed && (j === 0)) { continue; }

  				if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
  					return true;
  				}
  			}
  		}
  		return false;
  	}
  });

  // @factory L.polyline(latlngs: LatLng[], options?: Polyline options)
  // Instantiates a polyline object given an array of geographical points and
  // optionally an options object. You can create a `Polyline` object with
  // multiple separate lines (`MultiPolyline`) by passing an array of arrays
  // of geographic points.
  function polyline(latlngs, options) {
  	return new Polyline(latlngs, options);
  }

  // Retrocompat. Allow plugins to support Leaflet versions before and after 1.1.
  Polyline._flat = _flat;

  /*
   * @class Polygon
   * @aka L.Polygon
   * @inherits Polyline
   *
   * A class for drawing polygon overlays on a map. Extends `Polyline`.
   *
   * Note that points you pass when creating a polygon shouldn't have an additional last point equal to the first one — it's better to filter out such points.
   *
   *
   * @example
   *
   * ```js
   * // create a red polygon from an array of LatLng points
   * var latlngs = [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]];
   *
   * var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);
   *
   * // zoom the map to the polygon
   * map.fitBounds(polygon.getBounds());
   * ```
   *
   * You can also pass an array of arrays of latlngs, with the first array representing the outer shape and the other arrays representing holes in the outer shape:
   *
   * ```js
   * var latlngs = [
   *   [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *   [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   * ];
   * ```
   *
   * Additionally, you can pass a multi-dimensional array to represent a MultiPolygon shape.
   *
   * ```js
   * var latlngs = [
   *   [ // first polygon
   *     [[37, -109.05],[41, -109.03],[41, -102.05],[37, -102.04]], // outer ring
   *     [[37.29, -108.58],[40.71, -108.58],[40.71, -102.50],[37.29, -102.50]] // hole
   *   ],
   *   [ // second polygon
   *     [[41, -111.03],[45, -111.04],[45, -104.05],[41, -104.05]]
   *   ]
   * ];
   * ```
   */

  var Polygon = Polyline.extend({

  	options: {
  		fill: true
  	},

  	isEmpty: function () {
  		return !this._latlngs.length || !this._latlngs[0].length;
  	},

  	getCenter: function () {
  		// throws error when not yet added to map as this center calculation requires projected coordinates
  		if (!this._map) {
  			throw new Error('Must add layer to map before using getCenter()');
  		}

  		var i, j, p1, p2, f, area, x, y, center,
  		    points = this._rings[0],
  		    len = points.length;

  		if (!len) { return null; }

  		// polygon centroid algorithm; only uses the first ring if there are multiple

  		area = x = y = 0;

  		for (i = 0, j = len - 1; i < len; j = i++) {
  			p1 = points[i];
  			p2 = points[j];

  			f = p1.y * p2.x - p2.y * p1.x;
  			x += (p1.x + p2.x) * f;
  			y += (p1.y + p2.y) * f;
  			area += f * 3;
  		}

  		if (area === 0) {
  			// Polygon is so small that all points are on same pixel.
  			center = points[0];
  		} else {
  			center = [x / area, y / area];
  		}
  		return this._map.layerPointToLatLng(center);
  	},

  	_convertLatLngs: function (latlngs) {
  		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
  		    len = result.length;

  		// remove last point if it equals first one
  		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
  			result.pop();
  		}
  		return result;
  	},

  	_setLatLngs: function (latlngs) {
  		Polyline.prototype._setLatLngs.call(this, latlngs);
  		if (isFlat(this._latlngs)) {
  			this._latlngs = [this._latlngs];
  		}
  	},

  	_defaultShape: function () {
  		return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
  	},

  	_clipPoints: function () {
  		// polygons need a different clipping algorithm so we redefine that

  		var bounds = this._renderer._bounds,
  		    w = this.options.weight,
  		    p = new Point(w, w);

  		// increase clip padding by stroke width to avoid stroke on clip edges
  		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p));

  		this._parts = [];
  		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
  			return;
  		}

  		if (this.options.noClip) {
  			this._parts = this._rings;
  			return;
  		}

  		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
  			clipped = clipPolygon(this._rings[i], bounds, true);
  			if (clipped.length) {
  				this._parts.push(clipped);
  			}
  		}
  	},

  	_updatePath: function () {
  		this._renderer._updatePoly(this, true);
  	},

  	// Needed by the `Canvas` renderer for interactivity
  	_containsPoint: function (p) {
  		var inside = false,
  		    part, p1, p2, i, j, k, len, len2;

  		if (!this._pxBounds || !this._pxBounds.contains(p)) { return false; }

  		// ray casting algorithm for detecting if point is in polygon
  		for (i = 0, len = this._parts.length; i < len; i++) {
  			part = this._parts[i];

  			for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
  				p1 = part[j];
  				p2 = part[k];

  				if (((p1.y > p.y) !== (p2.y > p.y)) && (p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x)) {
  					inside = !inside;
  				}
  			}
  		}

  		// also check if it's on polygon stroke
  		return inside || Polyline.prototype._containsPoint.call(this, p, true);
  	}

  });


  // @factory L.polygon(latlngs: LatLng[], options?: Polyline options)
  function polygon(latlngs, options) {
  	return new Polygon(latlngs, options);
  }

  /*
   * @class GeoJSON
   * @aka L.GeoJSON
   * @inherits FeatureGroup
   *
   * Represents a GeoJSON object or an array of GeoJSON objects. Allows you to parse
   * GeoJSON data and display it on the map. Extends `FeatureGroup`.
   *
   * @example
   *
   * ```js
   * L.geoJSON(data, {
   * 	style: function (feature) {
   * 		return {color: feature.properties.color};
   * 	}
   * }).bindPopup(function (layer) {
   * 	return layer.feature.properties.description;
   * }).addTo(map);
   * ```
   */

  var GeoJSON = FeatureGroup.extend({

  	/* @section
  	 * @aka GeoJSON options
  	 *
  	 * @option pointToLayer: Function = *
  	 * A `Function` defining how GeoJSON points spawn Leaflet layers. It is internally
  	 * called when data is added, passing the GeoJSON point feature and its `LatLng`.
  	 * The default is to spawn a default `Marker`:
  	 * ```js
  	 * function(geoJsonPoint, latlng) {
  	 * 	return L.marker(latlng);
  	 * }
  	 * ```
  	 *
  	 * @option style: Function = *
  	 * A `Function` defining the `Path options` for styling GeoJSON lines and polygons,
  	 * called internally when data is added.
  	 * The default value is to not override any defaults:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return {}
  	 * }
  	 * ```
  	 *
  	 * @option onEachFeature: Function = *
  	 * A `Function` that will be called once for each created `Feature`, after it has
  	 * been created and styled. Useful for attaching events and popups to features.
  	 * The default is to do nothing with the newly created layers:
  	 * ```js
  	 * function (feature, layer) {}
  	 * ```
  	 *
  	 * @option filter: Function = *
  	 * A `Function` that will be used to decide whether to include a feature or not.
  	 * The default is to include all features:
  	 * ```js
  	 * function (geoJsonFeature) {
  	 * 	return true;
  	 * }
  	 * ```
  	 * Note: dynamically changing the `filter` option will have effect only on newly
  	 * added data. It will _not_ re-evaluate already included features.
  	 *
  	 * @option coordsToLatLng: Function = *
  	 * A `Function` that will be used for converting GeoJSON coordinates to `LatLng`s.
  	 * The default is the `coordsToLatLng` static method.
  	 *
  	 * @option markersInheritOptions: Boolean = false
  	 * Whether default Markers for "Point" type Features inherit from group options.
  	 */

  	initialize: function (geojson, options) {
  		setOptions(this, options);

  		this._layers = {};

  		if (geojson) {
  			this.addData(geojson);
  		}
  	},

  	// @method addData( <GeoJSON> data ): this
  	// Adds a GeoJSON object to the layer.
  	addData: function (geojson) {
  		var features = isArray(geojson) ? geojson : geojson.features,
  		    i, len, feature;

  		if (features) {
  			for (i = 0, len = features.length; i < len; i++) {
  				// only add this if geometry or geometries are set and not null
  				feature = features[i];
  				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
  					this.addData(feature);
  				}
  			}
  			return this;
  		}

  		var options = this.options;

  		if (options.filter && !options.filter(geojson)) { return this; }

  		var layer = geometryToLayer(geojson, options);
  		if (!layer) {
  			return this;
  		}
  		layer.feature = asFeature(geojson);

  		layer.defaultOptions = layer.options;
  		this.resetStyle(layer);

  		if (options.onEachFeature) {
  			options.onEachFeature(geojson, layer);
  		}

  		return this.addLayer(layer);
  	},

  	// @method resetStyle( <Path> layer? ): this
  	// Resets the given vector layer's style to the original GeoJSON style, useful for resetting style after hover events.
  	// If `layer` is omitted, the style of all features in the current layer is reset.
  	resetStyle: function (layer) {
  		if (layer === undefined) {
  			return this.eachLayer(this.resetStyle, this);
  		}
  		// reset any custom styles
  		layer.options = extend({}, layer.defaultOptions);
  		this._setLayerStyle(layer, this.options.style);
  		return this;
  	},

  	// @method setStyle( <Function> style ): this
  	// Changes styles of GeoJSON vector layers with the given style function.
  	setStyle: function (style) {
  		return this.eachLayer(function (layer) {
  			this._setLayerStyle(layer, style);
  		}, this);
  	},

  	_setLayerStyle: function (layer, style) {
  		if (layer.setStyle) {
  			if (typeof style === 'function') {
  				style = style(layer.feature);
  			}
  			layer.setStyle(style);
  		}
  	}
  });

  // @section
  // There are several static functions which can be called without instantiating L.GeoJSON:

  // @function geometryToLayer(featureData: Object, options?: GeoJSON options): Layer
  // Creates a `Layer` from a given GeoJSON feature. Can use a custom
  // [`pointToLayer`](#geojson-pointtolayer) and/or [`coordsToLatLng`](#geojson-coordstolatlng)
  // functions if provided as options.
  function geometryToLayer(geojson, options) {

  	var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
  	    coords = geometry ? geometry.coordinates : null,
  	    layers = [],
  	    pointToLayer = options && options.pointToLayer,
  	    _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng,
  	    latlng, latlngs, i, len;

  	if (!coords && !geometry) {
  		return null;
  	}

  	switch (geometry.type) {
  	case 'Point':
  		latlng = _coordsToLatLng(coords);
  		return _pointToLayer(pointToLayer, geojson, latlng, options);

  	case 'MultiPoint':
  		for (i = 0, len = coords.length; i < len; i++) {
  			latlng = _coordsToLatLng(coords[i]);
  			layers.push(_pointToLayer(pointToLayer, geojson, latlng, options));
  		}
  		return new FeatureGroup(layers);

  	case 'LineString':
  	case 'MultiLineString':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, _coordsToLatLng);
  		return new Polyline(latlngs, options);

  	case 'Polygon':
  	case 'MultiPolygon':
  		latlngs = coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, _coordsToLatLng);
  		return new Polygon(latlngs, options);

  	case 'GeometryCollection':
  		for (i = 0, len = geometry.geometries.length; i < len; i++) {
  			var layer = geometryToLayer({
  				geometry: geometry.geometries[i],
  				type: 'Feature',
  				properties: geojson.properties
  			}, options);

  			if (layer) {
  				layers.push(layer);
  			}
  		}
  		return new FeatureGroup(layers);

  	default:
  		throw new Error('Invalid GeoJSON object.');
  	}
  }

  function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
  	return pointToLayerFn ?
  		pointToLayerFn(geojson, latlng) :
  		new Marker(latlng, options && options.markersInheritOptions && options);
  }

  // @function coordsToLatLng(coords: Array): LatLng
  // Creates a `LatLng` object from an array of 2 numbers (longitude, latitude)
  // or 3 numbers (longitude, latitude, altitude) used in GeoJSON for points.
  function coordsToLatLng(coords) {
  	return new LatLng(coords[1], coords[0], coords[2]);
  }

  // @function coordsToLatLngs(coords: Array, levelsDeep?: Number, coordsToLatLng?: Function): Array
  // Creates a multidimensional array of `LatLng`s from a GeoJSON coordinates array.
  // `levelsDeep` specifies the nesting level (0 is for an array of points, 1 for an array of arrays of points, etc., 0 by default).
  // Can use a custom [`coordsToLatLng`](#geojson-coordstolatlng) function.
  function coordsToLatLngs(coords, levelsDeep, _coordsToLatLng) {
  	var latlngs = [];

  	for (var i = 0, len = coords.length, latlng; i < len; i++) {
  		latlng = levelsDeep ?
  			coordsToLatLngs(coords[i], levelsDeep - 1, _coordsToLatLng) :
  			(_coordsToLatLng || coordsToLatLng)(coords[i]);

  		latlngs.push(latlng);
  	}

  	return latlngs;
  }

  // @function latLngToCoords(latlng: LatLng, precision?: Number): Array
  // Reverse of [`coordsToLatLng`](#geojson-coordstolatlng)
  function latLngToCoords(latlng, precision) {
  	precision = typeof precision === 'number' ? precision : 6;
  	return latlng.alt !== undefined ?
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] :
  		[formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
  }

  // @function latLngsToCoords(latlngs: Array, levelsDeep?: Number, closed?: Boolean): Array
  // Reverse of [`coordsToLatLngs`](#geojson-coordstolatlngs)
  // `closed` determines whether the first point should be appended to the end of the array to close the feature, only used when `levelsDeep` is 0. False by default.
  function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
  	var coords = [];

  	for (var i = 0, len = latlngs.length; i < len; i++) {
  		coords.push(levelsDeep ?
  			latLngsToCoords(latlngs[i], levelsDeep - 1, closed, precision) :
  			latLngToCoords(latlngs[i], precision));
  	}

  	if (!levelsDeep && closed) {
  		coords.push(coords[0]);
  	}

  	return coords;
  }

  function getFeature(layer, newGeometry) {
  	return layer.feature ?
  		extend({}, layer.feature, {geometry: newGeometry}) :
  		asFeature(newGeometry);
  }

  // @function asFeature(geojson: Object): Object
  // Normalize GeoJSON geometries/features into GeoJSON features.
  function asFeature(geojson) {
  	if (geojson.type === 'Feature' || geojson.type === 'FeatureCollection') {
  		return geojson;
  	}

  	return {
  		type: 'Feature',
  		properties: {},
  		geometry: geojson
  	};
  }

  var PointToGeoJSON = {
  	toGeoJSON: function (precision) {
  		return getFeature(this, {
  			type: 'Point',
  			coordinates: latLngToCoords(this.getLatLng(), precision)
  		});
  	}
  };

  // @namespace Marker
  // @section Other methods
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the marker (as a GeoJSON `Point` Feature).
  Marker.include(PointToGeoJSON);

  // @namespace CircleMarker
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the circle marker (as a GeoJSON `Point` Feature).
  Circle.include(PointToGeoJSON);
  CircleMarker.include(PointToGeoJSON);


  // @namespace Polyline
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polyline (as a GeoJSON `LineString` or `MultiLineString` Feature).
  Polyline.include({
  	toGeoJSON: function (precision) {
  		var multi = !isFlat(this._latlngs);

  		var coords = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'LineString',
  			coordinates: coords
  		});
  	}
  });

  // @namespace Polygon
  // @method toGeoJSON(precision?: Number): Object
  // `precision` is the number of decimal places for coordinates.
  // The default value is 6 places.
  // Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the polygon (as a GeoJSON `Polygon` or `MultiPolygon` Feature).
  Polygon.include({
  	toGeoJSON: function (precision) {
  		var holes = !isFlat(this._latlngs),
  		    multi = holes && !isFlat(this._latlngs[0]);

  		var coords = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);

  		if (!holes) {
  			coords = [coords];
  		}

  		return getFeature(this, {
  			type: (multi ? 'Multi' : '') + 'Polygon',
  			coordinates: coords
  		});
  	}
  });


  // @namespace LayerGroup
  LayerGroup.include({
  	toMultiPoint: function (precision) {
  		var coords = [];

  		this.eachLayer(function (layer) {
  			coords.push(layer.toGeoJSON(precision).geometry.coordinates);
  		});

  		return getFeature(this, {
  			type: 'MultiPoint',
  			coordinates: coords
  		});
  	},

  	// @method toGeoJSON(precision?: Number): Object
  	// `precision` is the number of decimal places for coordinates.
  	// The default value is 6 places.
  	// Returns a [`GeoJSON`](http://en.wikipedia.org/wiki/GeoJSON) representation of the layer group (as a GeoJSON `FeatureCollection`, `GeometryCollection`, or `MultiPoint`).
  	toGeoJSON: function (precision) {

  		var type = this.feature && this.feature.geometry && this.feature.geometry.type;

  		if (type === 'MultiPoint') {
  			return this.toMultiPoint(precision);
  		}

  		var isGeometryCollection = type === 'GeometryCollection',
  		    jsons = [];

  		this.eachLayer(function (layer) {
  			if (layer.toGeoJSON) {
  				var json = layer.toGeoJSON(precision);
  				if (isGeometryCollection) {
  					jsons.push(json.geometry);
  				} else {
  					var feature = asFeature(json);
  					// Squash nested feature collections
  					if (feature.type === 'FeatureCollection') {
  						jsons.push.apply(jsons, feature.features);
  					} else {
  						jsons.push(feature);
  					}
  				}
  			}
  		});

  		if (isGeometryCollection) {
  			return getFeature(this, {
  				geometries: jsons,
  				type: 'GeometryCollection'
  			});
  		}

  		return {
  			type: 'FeatureCollection',
  			features: jsons
  		};
  	}
  });

  // @namespace GeoJSON
  // @factory L.geoJSON(geojson?: Object, options?: GeoJSON options)
  // Creates a GeoJSON layer. Optionally accepts an object in
  // [GeoJSON format](https://tools.ietf.org/html/rfc7946) to display on the map
  // (you can alternatively add it later with `addData` method) and an `options` object.
  function geoJSON(geojson, options) {
  	return new GeoJSON(geojson, options);
  }

  // Backward compatibility.
  var geoJson = geoJSON;

  /*
   * @class ImageOverlay
   * @aka L.ImageOverlay
   * @inherits Interactive layer
   *
   * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
   *
   * @example
   *
   * ```js
   * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
   * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
   * L.imageOverlay(imageUrl, imageBounds).addTo(map);
   * ```
   */

  var ImageOverlay = Layer.extend({

  	// @section
  	// @aka ImageOverlay options
  	options: {
  		// @option opacity: Number = 1.0
  		// The opacity of the image overlay.
  		opacity: 1,

  		// @option alt: String = ''
  		// Text for the `alt` attribute of the image (useful for accessibility).
  		alt: '',

  		// @option interactive: Boolean = false
  		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
  		interactive: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the image.
  		// If a String is provided, the image will have its crossOrigin attribute set to the String provided. This is needed if you want to access image pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false,

  		// @option errorOverlayUrl: String = ''
  		// URL to the overlay image to show in place of the overlay that failed to load.
  		errorOverlayUrl: '',

  		// @option zIndex: Number = 1
  		// The explicit [zIndex](https://developer.mozilla.org/docs/Web/CSS/CSS_Positioning/Understanding_z_index) of the overlay layer.
  		zIndex: 1,

  		// @option className: String = ''
  		// A custom class name to assign to the image. Empty by default.
  		className: ''
  	},

  	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
  		this._url = url;
  		this._bounds = toLatLngBounds(bounds);

  		setOptions(this, options);
  	},

  	onAdd: function () {
  		if (!this._image) {
  			this._initImage();

  			if (this.options.opacity < 1) {
  				this._updateOpacity();
  			}
  		}

  		if (this.options.interactive) {
  			addClass(this._image, 'leaflet-interactive');
  			this.addInteractiveTarget(this._image);
  		}

  		this.getPane().appendChild(this._image);
  		this._reset();
  	},

  	onRemove: function () {
  		remove(this._image);
  		if (this.options.interactive) {
  			this.removeInteractiveTarget(this._image);
  		}
  	},

  	// @method setOpacity(opacity: Number): this
  	// Sets the opacity of the overlay.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._image) {
  			this._updateOpacity();
  		}
  		return this;
  	},

  	setStyle: function (styleOpts) {
  		if (styleOpts.opacity) {
  			this.setOpacity(styleOpts.opacity);
  		}
  		return this;
  	},

  	// @method bringToFront(): this
  	// Brings the layer to the top of all overlays.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._image);
  		}
  		return this;
  	},

  	// @method bringToBack(): this
  	// Brings the layer to the bottom of all overlays.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._image);
  		}
  		return this;
  	},

  	// @method setUrl(url: String): this
  	// Changes the URL of the image.
  	setUrl: function (url) {
  		this._url = url;

  		if (this._image) {
  			this._image.src = url;
  		}
  		return this;
  	},

  	// @method setBounds(bounds: LatLngBounds): this
  	// Update the bounds that this ImageOverlay covers
  	setBounds: function (bounds) {
  		this._bounds = toLatLngBounds(bounds);

  		if (this._map) {
  			this._reset();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._reset,
  			viewreset: this._reset
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @method setZIndex(value: Number): this
  	// Changes the [zIndex](#imageoverlay-zindex) of the image overlay.
  	setZIndex: function (value) {
  		this.options.zIndex = value;
  		this._updateZIndex();
  		return this;
  	},

  	// @method getBounds(): LatLngBounds
  	// Get the bounds that this ImageOverlay covers
  	getBounds: function () {
  		return this._bounds;
  	},

  	// @method getElement(): HTMLElement
  	// Returns the instance of [`HTMLImageElement`](https://developer.mozilla.org/docs/Web/API/HTMLImageElement)
  	// used by this overlay.
  	getElement: function () {
  		return this._image;
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'IMG';
  		var img = this._image = wasElementSupplied ? this._url : create$1('img');

  		addClass(img, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(img, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(img, this.options.className); }

  		img.onselectstart = falseFn;
  		img.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the ImageOverlay layer has loaded its image
  		img.onload = bind(this.fire, this, 'load');
  		img.onerror = bind(this._overlayOnError, this, 'error');

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			img.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		if (this.options.zIndex) {
  			this._updateZIndex();
  		}

  		if (wasElementSupplied) {
  			this._url = img.src;
  			return;
  		}

  		img.src = this._url;
  		img.alt = this.options.alt;
  	},

  	_animateZoom: function (e) {
  		var scale = this._map.getZoomScale(e.zoom),
  		    offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;

  		setTransform(this._image, offset, scale);
  	},

  	_reset: function () {
  		var image = this._image,
  		    bounds = new Bounds(
  		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
  		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
  		    size = bounds.getSize();

  		setPosition(image, bounds.min);

  		image.style.width  = size.x + 'px';
  		image.style.height = size.y + 'px';
  	},

  	_updateOpacity: function () {
  		setOpacity(this._image, this.options.opacity);
  	},

  	_updateZIndex: function () {
  		if (this._image && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._image.style.zIndex = this.options.zIndex;
  		}
  	},

  	_overlayOnError: function () {
  		// @event error: Event
  		// Fired when the ImageOverlay layer fails to load its image
  		this.fire('error');

  		var errorUrl = this.options.errorOverlayUrl;
  		if (errorUrl && this._url !== errorUrl) {
  			this._url = errorUrl;
  			this._image.src = errorUrl;
  		}
  	}
  });

  // @factory L.imageOverlay(imageUrl: String, bounds: LatLngBounds, options?: ImageOverlay options)
  // Instantiates an image overlay object given the URL of the image and the
  // geographical bounds it is tied to.
  var imageOverlay = function (url, bounds, options) {
  	return new ImageOverlay(url, bounds, options);
  };

  /*
   * @class VideoOverlay
   * @aka L.VideoOverlay
   * @inherits ImageOverlay
   *
   * Used to load and display a video player over specific bounds of the map. Extends `ImageOverlay`.
   *
   * A video overlay uses the [`<video>`](https://developer.mozilla.org/docs/Web/HTML/Element/video)
   * HTML5 element.
   *
   * @example
   *
   * ```js
   * var videoUrl = 'https://www.mapbox.com/bites/00188/patricia_nasa.webm',
   * 	videoBounds = [[ 32, -130], [ 13, -100]];
   * L.videoOverlay(videoUrl, videoBounds ).addTo(map);
   * ```
   */

  var VideoOverlay = ImageOverlay.extend({

  	// @section
  	// @aka VideoOverlay options
  	options: {
  		// @option autoplay: Boolean = true
  		// Whether the video starts playing automatically when loaded.
  		autoplay: true,

  		// @option loop: Boolean = true
  		// Whether the video will loop back to the beginning when played.
  		loop: true,

  		// @option keepAspectRatio: Boolean = true
  		// Whether the video will save aspect ratio after the projection.
  		// Relevant for supported browsers. Browser compatibility- https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
  		keepAspectRatio: true,

  		// @option muted: Boolean = false
  		// Whether the video starts on mute when loaded.
  		muted: false
  	},

  	_initImage: function () {
  		var wasElementSupplied = this._url.tagName === 'VIDEO';
  		var vid = this._image = wasElementSupplied ? this._url : create$1('video');

  		addClass(vid, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(vid, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(vid, this.options.className); }

  		vid.onselectstart = falseFn;
  		vid.onmousemove = falseFn;

  		// @event load: Event
  		// Fired when the video has finished loading the first frame
  		vid.onloadeddata = bind(this.fire, this, 'load');

  		if (wasElementSupplied) {
  			var sourceElements = vid.getElementsByTagName('source');
  			var sources = [];
  			for (var j = 0; j < sourceElements.length; j++) {
  				sources.push(sourceElements[j].src);
  			}

  			this._url = (sourceElements.length > 0) ? sources : [vid.src];
  			return;
  		}

  		if (!isArray(this._url)) { this._url = [this._url]; }

  		if (!this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(vid.style, 'objectFit')) {
  			vid.style['objectFit'] = 'fill';
  		}
  		vid.autoplay = !!this.options.autoplay;
  		vid.loop = !!this.options.loop;
  		vid.muted = !!this.options.muted;
  		for (var i = 0; i < this._url.length; i++) {
  			var source = create$1('source');
  			source.src = this._url[i];
  			vid.appendChild(source);
  		}
  	}

  	// @method getElement(): HTMLVideoElement
  	// Returns the instance of [`HTMLVideoElement`](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement)
  	// used by this overlay.
  });


  // @factory L.videoOverlay(video: String|Array|HTMLVideoElement, bounds: LatLngBounds, options?: VideoOverlay options)
  // Instantiates an image overlay object given the URL of the video (or array of URLs, or even a video element) and the
  // geographical bounds it is tied to.

  function videoOverlay(video, bounds, options) {
  	return new VideoOverlay(video, bounds, options);
  }

  /*
   * @class SVGOverlay
   * @aka L.SVGOverlay
   * @inherits ImageOverlay
   *
   * Used to load, display and provide DOM access to an SVG file over specific bounds of the map. Extends `ImageOverlay`.
   *
   * An SVG overlay uses the [`<svg>`](https://developer.mozilla.org/docs/Web/SVG/Element/svg) element.
   *
   * @example
   *
   * ```js
   * var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
   * svgElement.setAttribute('xmlns', "http://www.w3.org/2000/svg");
   * svgElement.setAttribute('viewBox', "0 0 200 200");
   * svgElement.innerHTML = '<rect width="200" height="200"/><rect x="75" y="23" width="50" height="50" style="fill:red"/><rect x="75" y="123" width="50" height="50" style="fill:#0013ff"/>';
   * var svgElementBounds = [ [ 32, -130 ], [ 13, -100 ] ];
   * L.svgOverlay(svgElement, svgElementBounds).addTo(map);
   * ```
   */

  var SVGOverlay = ImageOverlay.extend({
  	_initImage: function () {
  		var el = this._image = this._url;

  		addClass(el, 'leaflet-image-layer');
  		if (this._zoomAnimated) { addClass(el, 'leaflet-zoom-animated'); }
  		if (this.options.className) { addClass(el, this.options.className); }

  		el.onselectstart = falseFn;
  		el.onmousemove = falseFn;
  	}

  	// @method getElement(): SVGElement
  	// Returns the instance of [`SVGElement`](https://developer.mozilla.org/docs/Web/API/SVGElement)
  	// used by this overlay.
  });


  // @factory L.svgOverlay(svg: String|SVGElement, bounds: LatLngBounds, options?: SVGOverlay options)
  // Instantiates an image overlay object given an SVG element and the geographical bounds it is tied to.
  // A viewBox attribute is required on the SVG element to zoom in and out properly.

  function svgOverlay(el, bounds, options) {
  	return new SVGOverlay(el, bounds, options);
  }

  /*
   * @class DivOverlay
   * @inherits Layer
   * @aka L.DivOverlay
   * Base model for L.Popup and L.Tooltip. Inherit from it for custom popup like plugins.
   */

  // @namespace DivOverlay
  var DivOverlay = Layer.extend({

  	// @section
  	// @aka DivOverlay options
  	options: {
  		// @option offset: Point = Point(0, 7)
  		// The offset of the popup position. Useful to control the anchor
  		// of the popup when opening it on some overlays.
  		offset: [0, 7],

  		// @option className: String = ''
  		// A custom CSS class name to assign to the popup.
  		className: '',

  		// @option pane: String = 'popupPane'
  		// `Map pane` where the popup will be added.
  		pane: 'popupPane'
  	},

  	initialize: function (options, source) {
  		setOptions(this, options);

  		this._source = source;
  	},

  	onAdd: function (map) {
  		this._zoomAnimated = map._zoomAnimated;

  		if (!this._container) {
  			this._initLayout();
  		}

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  		}

  		clearTimeout(this._removeTimeout);
  		this.getPane().appendChild(this._container);
  		this.update();

  		if (map._fadeAnimated) {
  			setOpacity(this._container, 1);
  		}

  		this.bringToFront();
  	},

  	onRemove: function (map) {
  		if (map._fadeAnimated) {
  			setOpacity(this._container, 0);
  			this._removeTimeout = setTimeout(bind(remove, undefined, this._container), 200);
  		} else {
  			remove(this._container);
  		}
  	},

  	// @namespace Popup
  	// @method getLatLng: LatLng
  	// Returns the geographical point of popup.
  	getLatLng: function () {
  		return this._latlng;
  	},

  	// @method setLatLng(latlng: LatLng): this
  	// Sets the geographical point where the popup will open.
  	setLatLng: function (latlng) {
  		this._latlng = toLatLng(latlng);
  		if (this._map) {
  			this._updatePosition();
  			this._adjustPan();
  		}
  		return this;
  	},

  	// @method getContent: String|HTMLElement
  	// Returns the content of the popup.
  	getContent: function () {
  		return this._content;
  	},

  	// @method setContent(htmlContent: String|HTMLElement|Function): this
  	// Sets the HTML content of the popup. If a function is passed the source layer will be passed to the function. The function should return a `String` or `HTMLElement` to be used in the popup.
  	setContent: function (content) {
  		this._content = content;
  		this.update();
  		return this;
  	},

  	// @method getElement: String|HTMLElement
  	// Returns the HTML container of the popup.
  	getElement: function () {
  		return this._container;
  	},

  	// @method update: null
  	// Updates the popup content, layout and position. Useful for updating the popup after something inside changed, e.g. image loaded.
  	update: function () {
  		if (!this._map) { return; }

  		this._container.style.visibility = 'hidden';

  		this._updateContent();
  		this._updateLayout();
  		this._updatePosition();

  		this._container.style.visibility = '';

  		this._adjustPan();
  	},

  	getEvents: function () {
  		var events = {
  			zoom: this._updatePosition,
  			viewreset: this._updatePosition
  		};

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}
  		return events;
  	},

  	// @method isOpen: Boolean
  	// Returns `true` when the popup is visible on the map.
  	isOpen: function () {
  		return !!this._map && this._map.hasLayer(this);
  	},

  	// @method bringToFront: this
  	// Brings this popup in front of other popups (in the same map pane).
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings this popup to the back of other popups (in the same map pane).
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  		}
  		return this;
  	},

  	_prepareOpen: function (parent, layer, latlng) {
  		if (!(layer instanceof Layer)) {
  			latlng = layer;
  			layer = parent;
  		}

  		if (layer instanceof FeatureGroup) {
  			for (var id in parent._layers) {
  				layer = parent._layers[id];
  				break;
  			}
  		}

  		if (!latlng) {
  			if (layer.getCenter) {
  				latlng = layer.getCenter();
  			} else if (layer.getLatLng) {
  				latlng = layer.getLatLng();
  			} else {
  				throw new Error('Unable to get source layer LatLng.');
  			}
  		}

  		// set overlay source to this layer
  		this._source = layer;

  		// update the overlay (content, layout, ect...)
  		this.update();

  		return latlng;
  	},

  	_updateContent: function () {
  		if (!this._content) { return; }

  		var node = this._contentNode;
  		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content;

  		if (typeof content === 'string') {
  			node.innerHTML = content;
  		} else {
  			while (node.hasChildNodes()) {
  				node.removeChild(node.firstChild);
  			}
  			node.appendChild(content);
  		}
  		this.fire('contentupdate');
  	},

  	_updatePosition: function () {
  		if (!this._map) { return; }

  		var pos = this._map.latLngToLayerPoint(this._latlng),
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (this._zoomAnimated) {
  			setPosition(this._container, pos.add(anchor));
  		} else {
  			offset = offset.add(pos).add(anchor);
  		}

  		var bottom = this._containerBottom = -offset.y,
  		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;

  		// bottom position the popup in case the height of the popup changes (images loading etc)
  		this._container.style.bottom = bottom + 'px';
  		this._container.style.left = left + 'px';
  	},

  	_getAnchor: function () {
  		return [0, 0];
  	}

  });

  /*
   * @class Popup
   * @inherits DivOverlay
   * @aka L.Popup
   * Used to open popups in certain places of the map. Use [Map.openPopup](#map-openpopup) to
   * open popups while making sure that only one popup is open at one time
   * (recommended for usability), or use [Map.addLayer](#map-addlayer) to open as many as you want.
   *
   * @example
   *
   * If you want to just bind a popup to marker click and then open it, it's really easy:
   *
   * ```js
   * marker.bindPopup(popupContent).openPopup();
   * ```
   * Path overlays like polylines also have a `bindPopup` method.
   * Here's a more complicated way to open a popup on a map:
   *
   * ```js
   * var popup = L.popup()
   * 	.setLatLng(latlng)
   * 	.setContent('<p>Hello world!<br />This is a nice popup.</p>')
   * 	.openOn(map);
   * ```
   */


  // @namespace Popup
  var Popup = DivOverlay.extend({

  	// @section
  	// @aka Popup options
  	options: {
  		// @option maxWidth: Number = 300
  		// Max width of the popup, in pixels.
  		maxWidth: 300,

  		// @option minWidth: Number = 50
  		// Min width of the popup, in pixels.
  		minWidth: 50,

  		// @option maxHeight: Number = null
  		// If set, creates a scrollable container of the given height
  		// inside a popup if its content exceeds it.
  		maxHeight: null,

  		// @option autoPan: Boolean = true
  		// Set it to `false` if you don't want the map to do panning animation
  		// to fit the opened popup.
  		autoPan: true,

  		// @option autoPanPaddingTopLeft: Point = null
  		// The margin between the popup and the top left corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingTopLeft: null,

  		// @option autoPanPaddingBottomRight: Point = null
  		// The margin between the popup and the bottom right corner of the map
  		// view after autopanning was performed.
  		autoPanPaddingBottomRight: null,

  		// @option autoPanPadding: Point = Point(5, 5)
  		// Equivalent of setting both top left and bottom right autopan padding to the same value.
  		autoPanPadding: [5, 5],

  		// @option keepInView: Boolean = false
  		// Set it to `true` if you want to prevent users from panning the popup
  		// off of the screen while it is open.
  		keepInView: false,

  		// @option closeButton: Boolean = true
  		// Controls the presence of a close button in the popup.
  		closeButton: true,

  		// @option autoClose: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the popup closing when another popup is opened.
  		autoClose: true,

  		// @option closeOnEscapeKey: Boolean = true
  		// Set it to `false` if you want to override the default behavior of
  		// the ESC key for closing of the popup.
  		closeOnEscapeKey: true,

  		// @option closeOnClick: Boolean = *
  		// Set it if you want to override the default behavior of the popup closing when user clicks
  		// on the map. Defaults to the map's [`closePopupOnClick`](#map-closepopuponclick) option.

  		// @option className: String = ''
  		// A custom CSS class name to assign to the popup.
  		className: ''
  	},

  	// @namespace Popup
  	// @method openOn(map: Map): this
  	// Adds the popup to the map and closes the previous one. The same as `map.openPopup(popup)`.
  	openOn: function (map) {
  		map.openPopup(this);
  		return this;
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupopen: PopupEvent
  		// Fired when a popup is opened in the map
  		map.fire('popupopen', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupopen: PopupEvent
  			// Fired when a popup bound to this layer is opened
  			this._source.fire('popupopen', {popup: this}, true);
  			// For non-path layers, we toggle the popup when clicking
  			// again the layer, so prevent the map to reopen it.
  			if (!(this._source instanceof Path)) {
  				this._source.on('preclick', stopPropagation);
  			}
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Popup events
  		// @event popupclose: PopupEvent
  		// Fired when a popup in the map is closed
  		map.fire('popupclose', {popup: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Popup events
  			// @event popupclose: PopupEvent
  			// Fired when a popup bound to this layer is closed
  			this._source.fire('popupclose', {popup: this}, true);
  			if (!(this._source instanceof Path)) {
  				this._source.off('preclick', stopPropagation);
  			}
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (this.options.closeOnClick !== undefined ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
  			events.preclick = this._close;
  		}

  		if (this.options.keepInView) {
  			events.moveend = this._adjustPan;
  		}

  		return events;
  	},

  	_close: function () {
  		if (this._map) {
  			this._map.closePopup(this);
  		}
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-popup',
  		    container = this._container = create$1('div',
  			prefix + ' ' + (this.options.className || '') +
  			' leaflet-zoom-animated');

  		var wrapper = this._wrapper = create$1('div', prefix + '-content-wrapper', container);
  		this._contentNode = create$1('div', prefix + '-content', wrapper);

  		disableClickPropagation(container);
  		disableScrollPropagation(this._contentNode);
  		on(container, 'contextmenu', stopPropagation);

  		this._tipContainer = create$1('div', prefix + '-tip-container', container);
  		this._tip = create$1('div', prefix + '-tip', this._tipContainer);

  		if (this.options.closeButton) {
  			var closeButton = this._closeButton = create$1('a', prefix + '-close-button', container);
  			closeButton.href = '#close';
  			closeButton.innerHTML = '&#215;';

  			on(closeButton, 'click', this._onCloseButtonClick, this);
  		}
  	},

  	_updateLayout: function () {
  		var container = this._contentNode,
  		    style = container.style;

  		style.width = '';
  		style.whiteSpace = 'nowrap';

  		var width = container.offsetWidth;
  		width = Math.min(width, this.options.maxWidth);
  		width = Math.max(width, this.options.minWidth);

  		style.width = (width + 1) + 'px';
  		style.whiteSpace = '';

  		style.height = '';

  		var height = container.offsetHeight,
  		    maxHeight = this.options.maxHeight,
  		    scrolledClass = 'leaflet-popup-scrolled';

  		if (maxHeight && height > maxHeight) {
  			style.height = maxHeight + 'px';
  			addClass(container, scrolledClass);
  		} else {
  			removeClass(container, scrolledClass);
  		}

  		this._containerWidth = this._container.offsetWidth;
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
  		    anchor = this._getAnchor();
  		setPosition(this._container, pos.add(anchor));
  	},

  	_adjustPan: function () {
  		if (!this.options.autoPan) { return; }
  		if (this._map._panAnim) { this._map._panAnim.stop(); }

  		var map = this._map,
  		    marginBottom = parseInt(getStyle(this._container, 'marginBottom'), 10) || 0,
  		    containerHeight = this._container.offsetHeight + marginBottom,
  		    containerWidth = this._containerWidth,
  		    layerPos = new Point(this._containerLeft, -containerHeight - this._containerBottom);

  		layerPos._add(getPosition(this._container));

  		var containerPos = map.layerPointToContainerPoint(layerPos),
  		    padding = toPoint(this.options.autoPanPadding),
  		    paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding),
  		    paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding),
  		    size = map.getSize(),
  		    dx = 0,
  		    dy = 0;

  		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
  			dx = containerPos.x + containerWidth - size.x + paddingBR.x;
  		}
  		if (containerPos.x - dx - paddingTL.x < 0) { // left
  			dx = containerPos.x - paddingTL.x;
  		}
  		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
  			dy = containerPos.y + containerHeight - size.y + paddingBR.y;
  		}
  		if (containerPos.y - dy - paddingTL.y < 0) { // top
  			dy = containerPos.y - paddingTL.y;
  		}

  		// @namespace Map
  		// @section Popup events
  		// @event autopanstart: Event
  		// Fired when the map starts autopanning when opening a popup.
  		if (dx || dy) {
  			map
  			    .fire('autopanstart')
  			    .panBy([dx, dy]);
  		}
  	},

  	_onCloseButtonClick: function (e) {
  		this._close();
  		stop(e);
  	},

  	_getAnchor: function () {
  		// Where should we anchor the popup on the source layer?
  		return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
  	}

  });

  // @namespace Popup
  // @factory L.popup(options?: Popup options, source?: Layer)
  // Instantiates a `Popup` object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the popup with a reference to the Layer to which it refers.
  var popup = function (options, source) {
  	return new Popup(options, source);
  };


  /* @namespace Map
   * @section Interaction Options
   * @option closePopupOnClick: Boolean = true
   * Set it to `false` if you don't want popups to close when user clicks the map.
   */
  Map.mergeOptions({
  	closePopupOnClick: true
  });


  // @namespace Map
  // @section Methods for Layers and Controls
  Map.include({
  	// @method openPopup(popup: Popup): this
  	// Opens the specified popup while closing the previously opened (to make sure only one is opened at one time for usability).
  	// @alternative
  	// @method openPopup(content: String|HTMLElement, latlng: LatLng, options?: Popup options): this
  	// Creates a popup with the specified content and options and opens it in the given point on a map.
  	openPopup: function (popup, latlng, options) {
  		if (!(popup instanceof Popup)) {
  			popup = new Popup(options).setContent(popup);
  		}

  		if (latlng) {
  			popup.setLatLng(latlng);
  		}

  		if (this.hasLayer(popup)) {
  			return this;
  		}

  		if (this._popup && this._popup.options.autoClose) {
  			this.closePopup();
  		}

  		this._popup = popup;
  		return this.addLayer(popup);
  	},

  	// @method closePopup(popup?: Popup): this
  	// Closes the popup previously opened with [openPopup](#map-openpopup) (or the given one).
  	closePopup: function (popup) {
  		if (!popup || popup === this._popup) {
  			popup = this._popup;
  			this._popup = null;
  		}
  		if (popup) {
  			this.removeLayer(popup);
  		}
  		return this;
  	}
  });

  /*
   * @namespace Layer
   * @section Popup methods example
   *
   * All layers share a set of methods convenient for binding popups to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindPopup('Hi There!').addTo(map);
   * layer.openPopup();
   * layer.closePopup();
   * ```
   *
   * Popups will also be automatically opened when the layer is clicked on and closed when the layer is removed from the map or another popup is opened.
   */

  // @section Popup methods
  Layer.include({

  	// @method bindPopup(content: String|HTMLElement|Function|Popup, options?: Popup options): this
  	// Binds a popup to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindPopup: function (content, options) {

  		if (content instanceof Popup) {
  			setOptions(content, options);
  			this._popup = content;
  			content._source = this;
  		} else {
  			if (!this._popup || options) {
  				this._popup = new Popup(options, this);
  			}
  			this._popup.setContent(content);
  		}

  		if (!this._popupHandlersAdded) {
  			this.on({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = true;
  		}

  		return this;
  	},

  	// @method unbindPopup(): this
  	// Removes the popup previously bound with `bindPopup`.
  	unbindPopup: function () {
  		if (this._popup) {
  			this.off({
  				click: this._openPopup,
  				keypress: this._onKeyPress,
  				remove: this.closePopup,
  				move: this._movePopup
  			});
  			this._popupHandlersAdded = false;
  			this._popup = null;
  		}
  		return this;
  	},

  	// @method openPopup(latlng?: LatLng): this
  	// Opens the bound popup at the specified `latlng` or at the default popup anchor if no `latlng` is passed.
  	openPopup: function (layer, latlng) {
  		if (this._popup && this._map) {
  			latlng = this._popup._prepareOpen(this, layer, latlng);

  			// open the popup on the map
  			this._map.openPopup(this._popup, latlng);
  		}

  		return this;
  	},

  	// @method closePopup(): this
  	// Closes the popup bound to this layer if it is open.
  	closePopup: function () {
  		if (this._popup) {
  			this._popup._close();
  		}
  		return this;
  	},

  	// @method togglePopup(): this
  	// Opens or closes the popup bound to this layer depending on its current state.
  	togglePopup: function (target) {
  		if (this._popup) {
  			if (this._popup._map) {
  				this.closePopup();
  			} else {
  				this.openPopup(target);
  			}
  		}
  		return this;
  	},

  	// @method isPopupOpen(): boolean
  	// Returns `true` if the popup bound to this layer is currently open.
  	isPopupOpen: function () {
  		return (this._popup ? this._popup.isOpen() : false);
  	},

  	// @method setPopupContent(content: String|HTMLElement|Popup): this
  	// Sets the content of the popup bound to this layer.
  	setPopupContent: function (content) {
  		if (this._popup) {
  			this._popup.setContent(content);
  		}
  		return this;
  	},

  	// @method getPopup(): Popup
  	// Returns the popup bound to this layer.
  	getPopup: function () {
  		return this._popup;
  	},

  	_openPopup: function (e) {
  		var layer = e.layer || e.target;

  		if (!this._popup) {
  			return;
  		}

  		if (!this._map) {
  			return;
  		}

  		// prevent map click
  		stop(e);

  		// if this inherits from Path its a vector and we can just
  		// open the popup at the new location
  		if (layer instanceof Path) {
  			this.openPopup(e.layer || e.target, e.latlng);
  			return;
  		}

  		// otherwise treat it like a marker and figure out
  		// if we should toggle it open/closed
  		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
  			this.closePopup();
  		} else {
  			this.openPopup(layer, e.latlng);
  		}
  	},

  	_movePopup: function (e) {
  		this._popup.setLatLng(e.latlng);
  	},

  	_onKeyPress: function (e) {
  		if (e.originalEvent.keyCode === 13) {
  			this._openPopup(e);
  		}
  	}
  });

  /*
   * @class Tooltip
   * @inherits DivOverlay
   * @aka L.Tooltip
   * Used to display small texts on top of map layers.
   *
   * @example
   *
   * ```js
   * marker.bindTooltip("my tooltip text").openTooltip();
   * ```
   * Note about tooltip offset. Leaflet takes two options in consideration
   * for computing tooltip offsetting:
   * - the `offset` Tooltip option: it defaults to [0, 0], and it's specific to one tooltip.
   *   Add a positive x offset to move the tooltip to the right, and a positive y offset to
   *   move it to the bottom. Negatives will move to the left and top.
   * - the `tooltipAnchor` Icon option: this will only be considered for Marker. You
   *   should adapt this value if you use a custom icon.
   */


  // @namespace Tooltip
  var Tooltip = DivOverlay.extend({

  	// @section
  	// @aka Tooltip options
  	options: {
  		// @option pane: String = 'tooltipPane'
  		// `Map pane` where the tooltip will be added.
  		pane: 'tooltipPane',

  		// @option offset: Point = Point(0, 0)
  		// Optional offset of the tooltip position.
  		offset: [0, 0],

  		// @option direction: String = 'auto'
  		// Direction where to open the tooltip. Possible values are: `right`, `left`,
  		// `top`, `bottom`, `center`, `auto`.
  		// `auto` will dynamically switch between `right` and `left` according to the tooltip
  		// position on the map.
  		direction: 'auto',

  		// @option permanent: Boolean = false
  		// Whether to open the tooltip permanently or only on mouseover.
  		permanent: false,

  		// @option sticky: Boolean = false
  		// If true, the tooltip will follow the mouse instead of being fixed at the feature center.
  		sticky: false,

  		// @option interactive: Boolean = false
  		// If true, the tooltip will listen to the feature events.
  		interactive: false,

  		// @option opacity: Number = 0.9
  		// Tooltip container opacity.
  		opacity: 0.9
  	},

  	onAdd: function (map) {
  		DivOverlay.prototype.onAdd.call(this, map);
  		this.setOpacity(this.options.opacity);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipopen: TooltipEvent
  		// Fired when a tooltip is opened in the map.
  		map.fire('tooltipopen', {tooltip: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipopen: TooltipEvent
  			// Fired when a tooltip bound to this layer is opened.
  			this._source.fire('tooltipopen', {tooltip: this}, true);
  		}
  	},

  	onRemove: function (map) {
  		DivOverlay.prototype.onRemove.call(this, map);

  		// @namespace Map
  		// @section Tooltip events
  		// @event tooltipclose: TooltipEvent
  		// Fired when a tooltip in the map is closed.
  		map.fire('tooltipclose', {tooltip: this});

  		if (this._source) {
  			// @namespace Layer
  			// @section Tooltip events
  			// @event tooltipclose: TooltipEvent
  			// Fired when a tooltip bound to this layer is closed.
  			this._source.fire('tooltipclose', {tooltip: this}, true);
  		}
  	},

  	getEvents: function () {
  		var events = DivOverlay.prototype.getEvents.call(this);

  		if (touch && !this.options.permanent) {
  			events.preclick = this._close;
  		}

  		return events;
  	},

  	_close: function () {
  		if (this._map) {
  			this._map.closeTooltip(this);
  		}
  	},

  	_initLayout: function () {
  		var prefix = 'leaflet-tooltip',
  		    className = prefix + ' ' + (this.options.className || '') + ' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

  		this._contentNode = this._container = create$1('div', className);
  	},

  	_updateLayout: function () {},

  	_adjustPan: function () {},

  	_setPosition: function (pos) {
  		var subX, subY,
  		    map = this._map,
  		    container = this._container,
  		    centerPoint = map.latLngToContainerPoint(map.getCenter()),
  		    tooltipPoint = map.layerPointToContainerPoint(pos),
  		    direction = this.options.direction,
  		    tooltipWidth = container.offsetWidth,
  		    tooltipHeight = container.offsetHeight,
  		    offset = toPoint(this.options.offset),
  		    anchor = this._getAnchor();

  		if (direction === 'top') {
  			subX = tooltipWidth / 2;
  			subY = tooltipHeight;
  		} else if (direction === 'bottom') {
  			subX = tooltipWidth / 2;
  			subY = 0;
  		} else if (direction === 'center') {
  			subX = tooltipWidth / 2;
  			subY = tooltipHeight / 2;
  		} else if (direction === 'right') {
  			subX = 0;
  			subY = tooltipHeight / 2;
  		} else if (direction === 'left') {
  			subX = tooltipWidth;
  			subY = tooltipHeight / 2;
  		} else if (tooltipPoint.x < centerPoint.x) {
  			direction = 'right';
  			subX = 0;
  			subY = tooltipHeight / 2;
  		} else {
  			direction = 'left';
  			subX = tooltipWidth + (offset.x + anchor.x) * 2;
  			subY = tooltipHeight / 2;
  		}

  		pos = pos.subtract(toPoint(subX, subY, true)).add(offset).add(anchor);

  		removeClass(container, 'leaflet-tooltip-right');
  		removeClass(container, 'leaflet-tooltip-left');
  		removeClass(container, 'leaflet-tooltip-top');
  		removeClass(container, 'leaflet-tooltip-bottom');
  		addClass(container, 'leaflet-tooltip-' + direction);
  		setPosition(container, pos);
  	},

  	_updatePosition: function () {
  		var pos = this._map.latLngToLayerPoint(this._latlng);
  		this._setPosition(pos);
  	},

  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;

  		if (this._container) {
  			setOpacity(this._container, opacity);
  		}
  	},

  	_animateZoom: function (e) {
  		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
  		this._setPosition(pos);
  	},

  	_getAnchor: function () {
  		// Where should we anchor the tooltip on the source layer?
  		return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
  	}

  });

  // @namespace Tooltip
  // @factory L.tooltip(options?: Tooltip options, source?: Layer)
  // Instantiates a Tooltip object given an optional `options` object that describes its appearance and location and an optional `source` object that is used to tag the tooltip with a reference to the Layer to which it refers.
  var tooltip = function (options, source) {
  	return new Tooltip(options, source);
  };

  // @namespace Map
  // @section Methods for Layers and Controls
  Map.include({

  	// @method openTooltip(tooltip: Tooltip): this
  	// Opens the specified tooltip.
  	// @alternative
  	// @method openTooltip(content: String|HTMLElement, latlng: LatLng, options?: Tooltip options): this
  	// Creates a tooltip with the specified content and options and open it.
  	openTooltip: function (tooltip, latlng, options) {
  		if (!(tooltip instanceof Tooltip)) {
  			tooltip = new Tooltip(options).setContent(tooltip);
  		}

  		if (latlng) {
  			tooltip.setLatLng(latlng);
  		}

  		if (this.hasLayer(tooltip)) {
  			return this;
  		}

  		return this.addLayer(tooltip);
  	},

  	// @method closeTooltip(tooltip?: Tooltip): this
  	// Closes the tooltip given as parameter.
  	closeTooltip: function (tooltip) {
  		if (tooltip) {
  			this.removeLayer(tooltip);
  		}
  		return this;
  	}

  });

  /*
   * @namespace Layer
   * @section Tooltip methods example
   *
   * All layers share a set of methods convenient for binding tooltips to it.
   *
   * ```js
   * var layer = L.Polygon(latlngs).bindTooltip('Hi There!').addTo(map);
   * layer.openTooltip();
   * layer.closeTooltip();
   * ```
   */

  // @section Tooltip methods
  Layer.include({

  	// @method bindTooltip(content: String|HTMLElement|Function|Tooltip, options?: Tooltip options): this
  	// Binds a tooltip to the layer with the passed `content` and sets up the
  	// necessary event listeners. If a `Function` is passed it will receive
  	// the layer as the first argument and should return a `String` or `HTMLElement`.
  	bindTooltip: function (content, options) {

  		if (content instanceof Tooltip) {
  			setOptions(content, options);
  			this._tooltip = content;
  			content._source = this;
  		} else {
  			if (!this._tooltip || options) {
  				this._tooltip = new Tooltip(options, this);
  			}
  			this._tooltip.setContent(content);

  		}

  		this._initTooltipInteractions();

  		if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
  			this.openTooltip();
  		}

  		return this;
  	},

  	// @method unbindTooltip(): this
  	// Removes the tooltip previously bound with `bindTooltip`.
  	unbindTooltip: function () {
  		if (this._tooltip) {
  			this._initTooltipInteractions(true);
  			this.closeTooltip();
  			this._tooltip = null;
  		}
  		return this;
  	},

  	_initTooltipInteractions: function (remove$$1) {
  		if (!remove$$1 && this._tooltipHandlersAdded) { return; }
  		var onOff = remove$$1 ? 'off' : 'on',
  		    events = {
  			remove: this.closeTooltip,
  			move: this._moveTooltip
  		    };
  		if (!this._tooltip.options.permanent) {
  			events.mouseover = this._openTooltip;
  			events.mouseout = this.closeTooltip;
  			if (this._tooltip.options.sticky) {
  				events.mousemove = this._moveTooltip;
  			}
  			if (touch) {
  				events.click = this._openTooltip;
  			}
  		} else {
  			events.add = this._openTooltip;
  		}
  		this[onOff](events);
  		this._tooltipHandlersAdded = !remove$$1;
  	},

  	// @method openTooltip(latlng?: LatLng): this
  	// Opens the bound tooltip at the specified `latlng` or at the default tooltip anchor if no `latlng` is passed.
  	openTooltip: function (layer, latlng) {
  		if (this._tooltip && this._map) {
  			latlng = this._tooltip._prepareOpen(this, layer, latlng);

  			// open the tooltip on the map
  			this._map.openTooltip(this._tooltip, latlng);

  			// Tooltip container may not be defined if not permanent and never
  			// opened.
  			if (this._tooltip.options.interactive && this._tooltip._container) {
  				addClass(this._tooltip._container, 'leaflet-clickable');
  				this.addInteractiveTarget(this._tooltip._container);
  			}
  		}

  		return this;
  	},

  	// @method closeTooltip(): this
  	// Closes the tooltip bound to this layer if it is open.
  	closeTooltip: function () {
  		if (this._tooltip) {
  			this._tooltip._close();
  			if (this._tooltip.options.interactive && this._tooltip._container) {
  				removeClass(this._tooltip._container, 'leaflet-clickable');
  				this.removeInteractiveTarget(this._tooltip._container);
  			}
  		}
  		return this;
  	},

  	// @method toggleTooltip(): this
  	// Opens or closes the tooltip bound to this layer depending on its current state.
  	toggleTooltip: function (target) {
  		if (this._tooltip) {
  			if (this._tooltip._map) {
  				this.closeTooltip();
  			} else {
  				this.openTooltip(target);
  			}
  		}
  		return this;
  	},

  	// @method isTooltipOpen(): boolean
  	// Returns `true` if the tooltip bound to this layer is currently open.
  	isTooltipOpen: function () {
  		return this._tooltip.isOpen();
  	},

  	// @method setTooltipContent(content: String|HTMLElement|Tooltip): this
  	// Sets the content of the tooltip bound to this layer.
  	setTooltipContent: function (content) {
  		if (this._tooltip) {
  			this._tooltip.setContent(content);
  		}
  		return this;
  	},

  	// @method getTooltip(): Tooltip
  	// Returns the tooltip bound to this layer.
  	getTooltip: function () {
  		return this._tooltip;
  	},

  	_openTooltip: function (e) {
  		var layer = e.layer || e.target;

  		if (!this._tooltip || !this._map) {
  			return;
  		}
  		this.openTooltip(layer, this._tooltip.options.sticky ? e.latlng : undefined);
  	},

  	_moveTooltip: function (e) {
  		var latlng = e.latlng, containerPoint, layerPoint;
  		if (this._tooltip.options.sticky && e.originalEvent) {
  			containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
  			layerPoint = this._map.containerPointToLayerPoint(containerPoint);
  			latlng = this._map.layerPointToLatLng(layerPoint);
  		}
  		this._tooltip.setLatLng(latlng);
  	}
  });

  /*
   * @class DivIcon
   * @aka L.DivIcon
   * @inherits Icon
   *
   * Represents a lightweight icon for markers that uses a simple `<div>`
   * element instead of an image. Inherits from `Icon` but ignores the `iconUrl` and shadow options.
   *
   * @example
   * ```js
   * var myIcon = L.divIcon({className: 'my-div-icon'});
   * // you can set .my-div-icon styles in CSS
   *
   * L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);
   * ```
   *
   * By default, it has a 'leaflet-div-icon' CSS class and is styled as a little white square with a shadow.
   */

  var DivIcon = Icon.extend({
  	options: {
  		// @section
  		// @aka DivIcon options
  		iconSize: [12, 12], // also can be set through CSS

  		// iconAnchor: (Point),
  		// popupAnchor: (Point),

  		// @option html: String|HTMLElement = ''
  		// Custom HTML code to put inside the div element, empty by default. Alternatively,
  		// an instance of `HTMLElement`.
  		html: false,

  		// @option bgPos: Point = [0, 0]
  		// Optional relative position of the background, in pixels
  		bgPos: null,

  		className: 'leaflet-div-icon'
  	},

  	createIcon: function (oldIcon) {
  		var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
  		    options = this.options;

  		if (options.html instanceof Element) {
  			empty(div);
  			div.appendChild(options.html);
  		} else {
  			div.innerHTML = options.html !== false ? options.html : '';
  		}

  		if (options.bgPos) {
  			var bgPos = toPoint(options.bgPos);
  			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
  		}
  		this._setIconStyles(div, 'icon');

  		return div;
  	},

  	createShadow: function () {
  		return null;
  	}
  });

  // @factory L.divIcon(options: DivIcon options)
  // Creates a `DivIcon` instance with the given options.
  function divIcon(options) {
  	return new DivIcon(options);
  }

  Icon.Default = IconDefault;

  /*
   * @class GridLayer
   * @inherits Layer
   * @aka L.GridLayer
   *
   * Generic class for handling a tiled grid of HTML elements. This is the base class for all tile layers and replaces `TileLayer.Canvas`.
   * GridLayer can be extended to create a tiled grid of HTML elements like `<canvas>`, `<img>` or `<div>`. GridLayer will handle creating and animating these DOM elements for you.
   *
   *
   * @section Synchronous usage
   * @example
   *
   * To create a custom layer, extend GridLayer and implement the `createTile()` method, which will be passed a `Point` object with the `x`, `y`, and `z` (zoom level) coordinates to draw your tile.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords){
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // get a canvas context and draw something on it using coords.x, coords.y and coords.z
   *         var ctx = tile.getContext('2d');
   *
   *         // return the tile so it can be rendered on screen
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section Asynchronous usage
   * @example
   *
   * Tile creation can also be asynchronous, this is useful when using a third-party drawing library. Once the tile is finished drawing it can be passed to the `done()` callback.
   *
   * ```js
   * var CanvasLayer = L.GridLayer.extend({
   *     createTile: function(coords, done){
   *         var error;
   *
   *         // create a <canvas> element for drawing
   *         var tile = L.DomUtil.create('canvas', 'leaflet-tile');
   *
   *         // setup tile width and height according to the options
   *         var size = this.getTileSize();
   *         tile.width = size.x;
   *         tile.height = size.y;
   *
   *         // draw something asynchronously and pass the tile to the done() callback
   *         setTimeout(function() {
   *             done(error, tile);
   *         }, 1000);
   *
   *         return tile;
   *     }
   * });
   * ```
   *
   * @section
   */


  var GridLayer = Layer.extend({

  	// @section
  	// @aka GridLayer options
  	options: {
  		// @option tileSize: Number|Point = 256
  		// Width and height of tiles in the grid. Use a number if width and height are equal, or `L.point(width, height)` otherwise.
  		tileSize: 256,

  		// @option opacity: Number = 1.0
  		// Opacity of the tiles. Can be used in the `createTile()` function.
  		opacity: 1,

  		// @option updateWhenIdle: Boolean = (depends)
  		// Load new tiles only when panning ends.
  		// `true` by default on mobile browsers, in order to avoid too many requests and keep smooth navigation.
  		// `false` otherwise in order to display new tiles _during_ panning, since it is easy to pan outside the
  		// [`keepBuffer`](#gridlayer-keepbuffer) option in desktop browsers.
  		updateWhenIdle: mobile,

  		// @option updateWhenZooming: Boolean = true
  		// By default, a smooth zoom animation (during a [touch zoom](#map-touchzoom) or a [`flyTo()`](#map-flyto)) will update grid layers every integer zoom level. Setting this option to `false` will update the grid layer only when the smooth animation ends.
  		updateWhenZooming: true,

  		// @option updateInterval: Number = 200
  		// Tiles will not update more than once every `updateInterval` milliseconds when panning.
  		updateInterval: 200,

  		// @option zIndex: Number = 1
  		// The explicit zIndex of the tile layer.
  		zIndex: 1,

  		// @option bounds: LatLngBounds = undefined
  		// If set, tiles will only be loaded inside the set `LatLngBounds`.
  		bounds: null,

  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = undefined
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: undefined,

  		// @option maxNativeZoom: Number = undefined
  		// Maximum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels higher than `maxNativeZoom` will be loaded
  		// from `maxNativeZoom` level and auto-scaled.
  		maxNativeZoom: undefined,

  		// @option minNativeZoom: Number = undefined
  		// Minimum zoom number the tile source has available. If it is specified,
  		// the tiles on all zoom levels lower than `minNativeZoom` will be loaded
  		// from `minNativeZoom` level and auto-scaled.
  		minNativeZoom: undefined,

  		// @option noWrap: Boolean = false
  		// Whether the layer is wrapped around the antimeridian. If `true`, the
  		// GridLayer will only be displayed once at low zoom levels. Has no
  		// effect when the [map CRS](#map-crs) doesn't wrap around. Can be used
  		// in combination with [`bounds`](#gridlayer-bounds) to prevent requesting
  		// tiles outside the CRS limits.
  		noWrap: false,

  		// @option pane: String = 'tilePane'
  		// `Map pane` where the grid layer will be added.
  		pane: 'tilePane',

  		// @option className: String = ''
  		// A custom class name to assign to the tile layer. Empty by default.
  		className: '',

  		// @option keepBuffer: Number = 2
  		// When panning the map, keep this many rows and columns of tiles before unloading them.
  		keepBuffer: 2
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  	},

  	onAdd: function () {
  		this._initContainer();

  		this._levels = {};
  		this._tiles = {};

  		this._resetView();
  		this._update();
  	},

  	beforeAdd: function (map) {
  		map._addZoomLimit(this);
  	},

  	onRemove: function (map) {
  		this._removeAllTiles();
  		remove(this._container);
  		map._removeZoomLimit(this);
  		this._container = null;
  		this._tileZoom = undefined;
  	},

  	// @method bringToFront: this
  	// Brings the tile layer to the top of all tile layers.
  	bringToFront: function () {
  		if (this._map) {
  			toFront(this._container);
  			this._setAutoZIndex(Math.max);
  		}
  		return this;
  	},

  	// @method bringToBack: this
  	// Brings the tile layer to the bottom of all tile layers.
  	bringToBack: function () {
  		if (this._map) {
  			toBack(this._container);
  			this._setAutoZIndex(Math.min);
  		}
  		return this;
  	},

  	// @method getContainer: HTMLElement
  	// Returns the HTML element that contains the tiles for this layer.
  	getContainer: function () {
  		return this._container;
  	},

  	// @method setOpacity(opacity: Number): this
  	// Changes the [opacity](#gridlayer-opacity) of the grid layer.
  	setOpacity: function (opacity) {
  		this.options.opacity = opacity;
  		this._updateOpacity();
  		return this;
  	},

  	// @method setZIndex(zIndex: Number): this
  	// Changes the [zIndex](#gridlayer-zindex) of the grid layer.
  	setZIndex: function (zIndex) {
  		this.options.zIndex = zIndex;
  		this._updateZIndex();

  		return this;
  	},

  	// @method isLoading: Boolean
  	// Returns `true` if any tile in the grid layer has not finished loading.
  	isLoading: function () {
  		return this._loading;
  	},

  	// @method redraw: this
  	// Causes the layer to clear all the tiles and request them again.
  	redraw: function () {
  		if (this._map) {
  			this._removeAllTiles();
  			this._update();
  		}
  		return this;
  	},

  	getEvents: function () {
  		var events = {
  			viewprereset: this._invalidateAll,
  			viewreset: this._resetView,
  			zoom: this._resetView,
  			moveend: this._onMoveEnd
  		};

  		if (!this.options.updateWhenIdle) {
  			// update tiles on move, but not more often than once per given interval
  			if (!this._onMove) {
  				this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
  			}

  			events.move = this._onMove;
  		}

  		if (this._zoomAnimated) {
  			events.zoomanim = this._animateZoom;
  		}

  		return events;
  	},

  	// @section Extension methods
  	// Layers extending `GridLayer` shall reimplement the following method.
  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, must be overridden by classes extending `GridLayer`.
  	// Returns the `HTMLElement` corresponding to the given `coords`. If the `done` callback
  	// is specified, it must be called when the tile has finished loading and drawing.
  	createTile: function () {
  		return document.createElement('div');
  	},

  	// @section
  	// @method getTileSize: Point
  	// Normalizes the [tileSize option](#gridlayer-tilesize) into a point. Used by the `createTile()` method.
  	getTileSize: function () {
  		var s = this.options.tileSize;
  		return s instanceof Point ? s : new Point(s, s);
  	},

  	_updateZIndex: function () {
  		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
  			this._container.style.zIndex = this.options.zIndex;
  		}
  	},

  	_setAutoZIndex: function (compare) {
  		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

  		var layers = this.getPane().children,
  		    edgeZIndex = -compare(-Infinity, Infinity); // -Infinity for max, Infinity for min

  		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

  			zIndex = layers[i].style.zIndex;

  			if (layers[i] !== this._container && zIndex) {
  				edgeZIndex = compare(edgeZIndex, +zIndex);
  			}
  		}

  		if (isFinite(edgeZIndex)) {
  			this.options.zIndex = edgeZIndex + compare(-1, 1);
  			this._updateZIndex();
  		}
  	},

  	_updateOpacity: function () {
  		if (!this._map) { return; }

  		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
  		if (ielt9) { return; }

  		setOpacity(this._container, this.options.opacity);

  		var now = +new Date(),
  		    nextFrame = false,
  		    willPrune = false;

  		for (var key in this._tiles) {
  			var tile = this._tiles[key];
  			if (!tile.current || !tile.loaded) { continue; }

  			var fade = Math.min(1, (now - tile.loaded) / 200);

  			setOpacity(tile.el, fade);
  			if (fade < 1) {
  				nextFrame = true;
  			} else {
  				if (tile.active) {
  					willPrune = true;
  				} else {
  					this._onOpaqueTile(tile);
  				}
  				tile.active = true;
  			}
  		}

  		if (willPrune && !this._noPrune) { this._pruneTiles(); }

  		if (nextFrame) {
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		}
  	},

  	_onOpaqueTile: falseFn,

  	_initContainer: function () {
  		if (this._container) { return; }

  		this._container = create$1('div', 'leaflet-layer ' + (this.options.className || ''));
  		this._updateZIndex();

  		if (this.options.opacity < 1) {
  			this._updateOpacity();
  		}

  		this.getPane().appendChild(this._container);
  	},

  	_updateLevels: function () {

  		var zoom = this._tileZoom,
  		    maxZoom = this.options.maxZoom;

  		if (zoom === undefined) { return undefined; }

  		for (var z in this._levels) {
  			z = Number(z);
  			if (this._levels[z].el.children.length || z === zoom) {
  				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
  				this._onUpdateLevel(z);
  			} else {
  				remove(this._levels[z].el);
  				this._removeTilesAtZoom(z);
  				this._onRemoveLevel(z);
  				delete this._levels[z];
  			}
  		}

  		var level = this._levels[zoom],
  		    map = this._map;

  		if (!level) {
  			level = this._levels[zoom] = {};

  			level.el = create$1('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
  			level.el.style.zIndex = maxZoom;

  			level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();
  			level.zoom = zoom;

  			this._setZoomTransform(level, map.getCenter(), map.getZoom());

  			// force the browser to consider the newly added element for transition
  			falseFn(level.el.offsetWidth);

  			this._onCreateLevel(level);
  		}

  		this._level = level;

  		return level;
  	},

  	_onUpdateLevel: falseFn,

  	_onRemoveLevel: falseFn,

  	_onCreateLevel: falseFn,

  	_pruneTiles: function () {
  		if (!this._map) {
  			return;
  		}

  		var key, tile;

  		var zoom = this._map.getZoom();
  		if (zoom > this.options.maxZoom ||
  			zoom < this.options.minZoom) {
  			this._removeAllTiles();
  			return;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			tile.retain = tile.current;
  		}

  		for (key in this._tiles) {
  			tile = this._tiles[key];
  			if (tile.current && !tile.active) {
  				var coords = tile.coords;
  				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
  					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2);
  				}
  			}
  		}

  		for (key in this._tiles) {
  			if (!this._tiles[key].retain) {
  				this._removeTile(key);
  			}
  		}
  	},

  	_removeTilesAtZoom: function (zoom) {
  		for (var key in this._tiles) {
  			if (this._tiles[key].coords.z !== zoom) {
  				continue;
  			}
  			this._removeTile(key);
  		}
  	},

  	_removeAllTiles: function () {
  		for (var key in this._tiles) {
  			this._removeTile(key);
  		}
  	},

  	_invalidateAll: function () {
  		for (var z in this._levels) {
  			remove(this._levels[z].el);
  			this._onRemoveLevel(Number(z));
  			delete this._levels[z];
  		}
  		this._removeAllTiles();

  		this._tileZoom = undefined;
  	},

  	_retainParent: function (x, y, z, minZoom) {
  		var x2 = Math.floor(x / 2),
  		    y2 = Math.floor(y / 2),
  		    z2 = z - 1,
  		    coords2 = new Point(+x2, +y2);
  		coords2.z = +z2;

  		var key = this._tileCoordsToKey(coords2),
  		    tile = this._tiles[key];

  		if (tile && tile.active) {
  			tile.retain = true;
  			return true;

  		} else if (tile && tile.loaded) {
  			tile.retain = true;
  		}

  		if (z2 > minZoom) {
  			return this._retainParent(x2, y2, z2, minZoom);
  		}

  		return false;
  	},

  	_retainChildren: function (x, y, z, maxZoom) {

  		for (var i = 2 * x; i < 2 * x + 2; i++) {
  			for (var j = 2 * y; j < 2 * y + 2; j++) {

  				var coords = new Point(i, j);
  				coords.z = z + 1;

  				var key = this._tileCoordsToKey(coords),
  				    tile = this._tiles[key];

  				if (tile && tile.active) {
  					tile.retain = true;
  					continue;

  				} else if (tile && tile.loaded) {
  					tile.retain = true;
  				}

  				if (z + 1 < maxZoom) {
  					this._retainChildren(i, j, z + 1, maxZoom);
  				}
  			}
  		}
  	},

  	_resetView: function (e) {
  		var animating = e && (e.pinch || e.flyTo);
  		this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
  	},

  	_animateZoom: function (e) {
  		this._setView(e.center, e.zoom, true, e.noUpdate);
  	},

  	_clampZoom: function (zoom) {
  		var options = this.options;

  		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
  			return options.minNativeZoom;
  		}

  		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
  			return options.maxNativeZoom;
  		}

  		return zoom;
  	},

  	_setView: function (center, zoom, noPrune, noUpdate) {
  		var tileZoom = Math.round(zoom);
  		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
  		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
  			tileZoom = undefined;
  		} else {
  			tileZoom = this._clampZoom(tileZoom);
  		}

  		var tileZoomChanged = this.options.updateWhenZooming && (tileZoom !== this._tileZoom);

  		if (!noUpdate || tileZoomChanged) {

  			this._tileZoom = tileZoom;

  			if (this._abortLoading) {
  				this._abortLoading();
  			}

  			this._updateLevels();
  			this._resetGrid();

  			if (tileZoom !== undefined) {
  				this._update(center);
  			}

  			if (!noPrune) {
  				this._pruneTiles();
  			}

  			// Flag to prevent _updateOpacity from pruning tiles during
  			// a zoom anim or a pinch gesture
  			this._noPrune = !!noPrune;
  		}

  		this._setZoomTransforms(center, zoom);
  	},

  	_setZoomTransforms: function (center, zoom) {
  		for (var i in this._levels) {
  			this._setZoomTransform(this._levels[i], center, zoom);
  		}
  	},

  	_setZoomTransform: function (level, center, zoom) {
  		var scale = this._map.getZoomScale(zoom, level.zoom),
  		    translate = level.origin.multiplyBy(scale)
  		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round();

  		if (any3d) {
  			setTransform(level.el, translate, scale);
  		} else {
  			setPosition(level.el, translate);
  		}
  	},

  	_resetGrid: function () {
  		var map = this._map,
  		    crs = map.options.crs,
  		    tileSize = this._tileSize = this.getTileSize(),
  		    tileZoom = this._tileZoom;

  		var bounds = this._map.getPixelWorldBounds(this._tileZoom);
  		if (bounds) {
  			this._globalTileRange = this._pxBoundsToTileRange(bounds);
  		}

  		this._wrapX = crs.wrapLng && !this.options.noWrap && [
  			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
  			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
  		];
  		this._wrapY = crs.wrapLat && !this.options.noWrap && [
  			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
  			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
  		];
  	},

  	_onMoveEnd: function () {
  		if (!this._map || this._map._animatingZoom) { return; }

  		this._update();
  	},

  	_getTiledPixelBounds: function (center) {
  		var map = this._map,
  		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
  		    scale = map.getZoomScale(mapZoom, this._tileZoom),
  		    pixelCenter = map.project(center, this._tileZoom).floor(),
  		    halfSize = map.getSize().divideBy(scale * 2);

  		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
  	},

  	// Private method to load tiles in the grid's active zoom level according to map bounds
  	_update: function (center) {
  		var map = this._map;
  		if (!map) { return; }
  		var zoom = this._clampZoom(map.getZoom());

  		if (center === undefined) { center = map.getCenter(); }
  		if (this._tileZoom === undefined) { return; }	// if out of minzoom/maxzoom

  		var pixelBounds = this._getTiledPixelBounds(center),
  		    tileRange = this._pxBoundsToTileRange(pixelBounds),
  		    tileCenter = tileRange.getCenter(),
  		    queue = [],
  		    margin = this.options.keepBuffer,
  		    noPruneRange = new Bounds(tileRange.getBottomLeft().subtract([margin, -margin]),
  		                              tileRange.getTopRight().add([margin, -margin]));

  		// Sanity check: panic if the tile range contains Infinity somewhere.
  		if (!(isFinite(tileRange.min.x) &&
  		      isFinite(tileRange.min.y) &&
  		      isFinite(tileRange.max.x) &&
  		      isFinite(tileRange.max.y))) { throw new Error('Attempted to load an infinite number of tiles'); }

  		for (var key in this._tiles) {
  			var c = this._tiles[key].coords;
  			if (c.z !== this._tileZoom || !noPruneRange.contains(new Point(c.x, c.y))) {
  				this._tiles[key].current = false;
  			}
  		}

  		// _update just loads more tiles. If the tile zoom level differs too much
  		// from the map's, let _setView reset levels and prune old tiles.
  		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return; }

  		// create a queue of coordinates to load tiles from
  		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
  			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
  				var coords = new Point(i, j);
  				coords.z = this._tileZoom;

  				if (!this._isValidTile(coords)) { continue; }

  				var tile = this._tiles[this._tileCoordsToKey(coords)];
  				if (tile) {
  					tile.current = true;
  				} else {
  					queue.push(coords);
  				}
  			}
  		}

  		// sort tile queue to load tiles in order of their distance to center
  		queue.sort(function (a, b) {
  			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
  		});

  		if (queue.length !== 0) {
  			// if it's the first batch of tiles to load
  			if (!this._loading) {
  				this._loading = true;
  				// @event loading: Event
  				// Fired when the grid layer starts loading tiles.
  				this.fire('loading');
  			}

  			// create DOM fragment to append tiles in one batch
  			var fragment = document.createDocumentFragment();

  			for (i = 0; i < queue.length; i++) {
  				this._addTile(queue[i], fragment);
  			}

  			this._level.el.appendChild(fragment);
  		}
  	},

  	_isValidTile: function (coords) {
  		var crs = this._map.options.crs;

  		if (!crs.infinite) {
  			// don't load tile if it's out of bounds and not wrapped
  			var bounds = this._globalTileRange;
  			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
  			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false; }
  		}

  		if (!this.options.bounds) { return true; }

  		// don't load tile if it doesn't intersect the bounds in options
  		var tileBounds = this._tileCoordsToBounds(coords);
  		return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
  	},

  	_keyToBounds: function (key) {
  		return this._tileCoordsToBounds(this._keyToTileCoords(key));
  	},

  	_tileCoordsToNwSe: function (coords) {
  		var map = this._map,
  		    tileSize = this.getTileSize(),
  		    nwPoint = coords.scaleBy(tileSize),
  		    sePoint = nwPoint.add(tileSize),
  		    nw = map.unproject(nwPoint, coords.z),
  		    se = map.unproject(sePoint, coords.z);
  		return [nw, se];
  	},

  	// converts tile coordinates to its geographical bounds
  	_tileCoordsToBounds: function (coords) {
  		var bp = this._tileCoordsToNwSe(coords),
  		    bounds = new LatLngBounds(bp[0], bp[1]);

  		if (!this.options.noWrap) {
  			bounds = this._map.wrapLatLngBounds(bounds);
  		}
  		return bounds;
  	},
  	// converts tile coordinates to key for the tile cache
  	_tileCoordsToKey: function (coords) {
  		return coords.x + ':' + coords.y + ':' + coords.z;
  	},

  	// converts tile cache key to coordinates
  	_keyToTileCoords: function (key) {
  		var k = key.split(':'),
  		    coords = new Point(+k[0], +k[1]);
  		coords.z = +k[2];
  		return coords;
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		remove(tile.el);

  		delete this._tiles[key];

  		// @event tileunload: TileEvent
  		// Fired when a tile is removed (e.g. when a tile goes off the screen).
  		this.fire('tileunload', {
  			tile: tile.el,
  			coords: this._keyToTileCoords(key)
  		});
  	},

  	_initTile: function (tile) {
  		addClass(tile, 'leaflet-tile');

  		var tileSize = this.getTileSize();
  		tile.style.width = tileSize.x + 'px';
  		tile.style.height = tileSize.y + 'px';

  		tile.onselectstart = falseFn;
  		tile.onmousemove = falseFn;

  		// update opacity on tiles in IE7-8 because of filter inheritance problems
  		if (ielt9 && this.options.opacity < 1) {
  			setOpacity(tile, this.options.opacity);
  		}

  		// without this hack, tiles disappear after zoom on Chrome for Android
  		// https://github.com/Leaflet/Leaflet/issues/2078
  		if (android && !android23) {
  			tile.style.WebkitBackfaceVisibility = 'hidden';
  		}
  	},

  	_addTile: function (coords, container) {
  		var tilePos = this._getTilePos(coords),
  		    key = this._tileCoordsToKey(coords);

  		var tile = this.createTile(this._wrapCoords(coords), bind(this._tileReady, this, coords));

  		this._initTile(tile);

  		// if createTile is defined with a second argument ("done" callback),
  		// we know that tile is async and will be ready later; otherwise
  		if (this.createTile.length < 2) {
  			// mark tile as ready, but delay one frame for opacity animation to happen
  			requestAnimFrame(bind(this._tileReady, this, coords, null, tile));
  		}

  		setPosition(tile, tilePos);

  		// save tile in cache
  		this._tiles[key] = {
  			el: tile,
  			coords: coords,
  			current: true
  		};

  		container.appendChild(tile);
  		// @event tileloadstart: TileEvent
  		// Fired when a tile is requested and starts loading.
  		this.fire('tileloadstart', {
  			tile: tile,
  			coords: coords
  		});
  	},

  	_tileReady: function (coords, err, tile) {
  		if (err) {
  			// @event tileerror: TileErrorEvent
  			// Fired when there is an error loading a tile.
  			this.fire('tileerror', {
  				error: err,
  				tile: tile,
  				coords: coords
  			});
  		}

  		var key = this._tileCoordsToKey(coords);

  		tile = this._tiles[key];
  		if (!tile) { return; }

  		tile.loaded = +new Date();
  		if (this._map._fadeAnimated) {
  			setOpacity(tile.el, 0);
  			cancelAnimFrame(this._fadeFrame);
  			this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
  		} else {
  			tile.active = true;
  			this._pruneTiles();
  		}

  		if (!err) {
  			addClass(tile.el, 'leaflet-tile-loaded');

  			// @event tileload: TileEvent
  			// Fired when a tile loads.
  			this.fire('tileload', {
  				tile: tile.el,
  				coords: coords
  			});
  		}

  		if (this._noTilesToLoad()) {
  			this._loading = false;
  			// @event load: Event
  			// Fired when the grid layer loaded all visible tiles.
  			this.fire('load');

  			if (ielt9 || !this._map._fadeAnimated) {
  				requestAnimFrame(this._pruneTiles, this);
  			} else {
  				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
  				// to trigger a pruning.
  				setTimeout(bind(this._pruneTiles, this), 250);
  			}
  		}
  	},

  	_getTilePos: function (coords) {
  		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
  	},

  	_wrapCoords: function (coords) {
  		var newCoords = new Point(
  			this._wrapX ? wrapNum(coords.x, this._wrapX) : coords.x,
  			this._wrapY ? wrapNum(coords.y, this._wrapY) : coords.y);
  		newCoords.z = coords.z;
  		return newCoords;
  	},

  	_pxBoundsToTileRange: function (bounds) {
  		var tileSize = this.getTileSize();
  		return new Bounds(
  			bounds.min.unscaleBy(tileSize).floor(),
  			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
  	},

  	_noTilesToLoad: function () {
  		for (var key in this._tiles) {
  			if (!this._tiles[key].loaded) { return false; }
  		}
  		return true;
  	}
  });

  // @factory L.gridLayer(options?: GridLayer options)
  // Creates a new instance of GridLayer with the supplied options.
  function gridLayer(options) {
  	return new GridLayer(options);
  }

  /*
   * @class TileLayer
   * @inherits GridLayer
   * @aka L.TileLayer
   * Used to load and display tile layers on the map. Note that most tile servers require attribution, which you can set under `Layer`. Extends `GridLayer`.
   *
   * @example
   *
   * ```js
   * L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);
   * ```
   *
   * @section URL template
   * @example
   *
   * A string of the following form:
   *
   * ```
   * 'http://{s}.somedomain.com/blabla/{z}/{x}/{y}{r}.png'
   * ```
   *
   * `{s}` means one of the available subdomains (used sequentially to help with browser parallel requests per domain limitation; subdomain values are specified in options; `a`, `b` or `c` by default, can be omitted), `{z}` — zoom level, `{x}` and `{y}` — tile coordinates. `{r}` can be used to add "&commat;2x" to the URL to load retina tiles.
   *
   * You can use custom keys in the template, which will be [evaluated](#util-template) from TileLayer options, like this:
   *
   * ```
   * L.tileLayer('http://{s}.somedomain.com/{foo}/{z}/{x}/{y}.png', {foo: 'bar'});
   * ```
   */


  var TileLayer = GridLayer.extend({

  	// @section
  	// @aka TileLayer options
  	options: {
  		// @option minZoom: Number = 0
  		// The minimum zoom level down to which this layer will be displayed (inclusive).
  		minZoom: 0,

  		// @option maxZoom: Number = 18
  		// The maximum zoom level up to which this layer will be displayed (inclusive).
  		maxZoom: 18,

  		// @option subdomains: String|String[] = 'abc'
  		// Subdomains of the tile service. Can be passed in the form of one string (where each letter is a subdomain name) or an array of strings.
  		subdomains: 'abc',

  		// @option errorTileUrl: String = ''
  		// URL to the tile image to show in place of the tile that failed to load.
  		errorTileUrl: '',

  		// @option zoomOffset: Number = 0
  		// The zoom number used in tile URLs will be offset with this value.
  		zoomOffset: 0,

  		// @option tms: Boolean = false
  		// If `true`, inverses Y axis numbering for tiles (turn this on for [TMS](https://en.wikipedia.org/wiki/Tile_Map_Service) services).
  		tms: false,

  		// @option zoomReverse: Boolean = false
  		// If set to true, the zoom number used in tile URLs will be reversed (`maxZoom - zoom` instead of `zoom`)
  		zoomReverse: false,

  		// @option detectRetina: Boolean = false
  		// If `true` and user is on a retina display, it will request four tiles of half the specified size and a bigger zoom level in place of one to utilize the high resolution.
  		detectRetina: false,

  		// @option crossOrigin: Boolean|String = false
  		// Whether the crossOrigin attribute will be added to the tiles.
  		// If a String is provided, all tiles will have their crossOrigin attribute set to the String provided. This is needed if you want to access tile pixel data.
  		// Refer to [CORS Settings](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) for valid String values.
  		crossOrigin: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		options = setOptions(this, options);

  		// detecting retina displays, adjusting tileSize and zoom levels
  		if (options.detectRetina && retina && options.maxZoom > 0) {

  			options.tileSize = Math.floor(options.tileSize / 2);

  			if (!options.zoomReverse) {
  				options.zoomOffset++;
  				options.maxZoom--;
  			} else {
  				options.zoomOffset--;
  				options.minZoom++;
  			}

  			options.minZoom = Math.max(0, options.minZoom);
  		}

  		if (typeof options.subdomains === 'string') {
  			options.subdomains = options.subdomains.split('');
  		}

  		// for https://github.com/Leaflet/Leaflet/issues/137
  		if (!android) {
  			this.on('tileunload', this._onTileRemove);
  		}
  	},

  	// @method setUrl(url: String, noRedraw?: Boolean): this
  	// Updates the layer's URL template and redraws it (unless `noRedraw` is set to `true`).
  	// If the URL does not change, the layer will not be redrawn unless
  	// the noRedraw parameter is set to false.
  	setUrl: function (url, noRedraw) {
  		if (this._url === url && noRedraw === undefined) {
  			noRedraw = true;
  		}

  		this._url = url;

  		if (!noRedraw) {
  			this.redraw();
  		}
  		return this;
  	},

  	// @method createTile(coords: Object, done?: Function): HTMLElement
  	// Called only internally, overrides GridLayer's [`createTile()`](#gridlayer-createtile)
  	// to return an `<img>` HTML element with the appropriate image URL given `coords`. The `done`
  	// callback is called when the tile has been loaded.
  	createTile: function (coords, done) {
  		var tile = document.createElement('img');

  		on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
  		on(tile, 'error', bind(this._tileOnError, this, done, tile));

  		if (this.options.crossOrigin || this.options.crossOrigin === '') {
  			tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
  		}

  		/*
  		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
  		 http://www.w3.org/TR/WCAG20-TECHS/H67
  		*/
  		tile.alt = '';

  		/*
  		 Set role="presentation" to force screen readers to ignore this
  		 https://www.w3.org/TR/wai-aria/roles#textalternativecomputation
  		*/
  		tile.setAttribute('role', 'presentation');

  		tile.src = this.getTileUrl(coords);

  		return tile;
  	},

  	// @section Extension methods
  	// @uninheritable
  	// Layers extending `TileLayer` might reimplement the following method.
  	// @method getTileUrl(coords: Object): String
  	// Called only internally, returns the URL for a tile given its coordinates.
  	// Classes extending `TileLayer` can override this function to provide custom tile URL naming schemes.
  	getTileUrl: function (coords) {
  		var data = {
  			r: retina ? '@2x' : '',
  			s: this._getSubdomain(coords),
  			x: coords.x,
  			y: coords.y,
  			z: this._getZoomForUrl()
  		};
  		if (this._map && !this._map.options.crs.infinite) {
  			var invertedY = this._globalTileRange.max.y - coords.y;
  			if (this.options.tms) {
  				data['y'] = invertedY;
  			}
  			data['-y'] = invertedY;
  		}

  		return template(this._url, extend(data, this.options));
  	},

  	_tileOnLoad: function (done, tile) {
  		// For https://github.com/Leaflet/Leaflet/issues/3332
  		if (ielt9) {
  			setTimeout(bind(done, this, null, tile), 0);
  		} else {
  			done(null, tile);
  		}
  	},

  	_tileOnError: function (done, tile, e) {
  		var errorUrl = this.options.errorTileUrl;
  		if (errorUrl && tile.getAttribute('src') !== errorUrl) {
  			tile.src = errorUrl;
  		}
  		done(e, tile);
  	},

  	_onTileRemove: function (e) {
  		e.tile.onload = null;
  	},

  	_getZoomForUrl: function () {
  		var zoom = this._tileZoom,
  		maxZoom = this.options.maxZoom,
  		zoomReverse = this.options.zoomReverse,
  		zoomOffset = this.options.zoomOffset;

  		if (zoomReverse) {
  			zoom = maxZoom - zoom;
  		}

  		return zoom + zoomOffset;
  	},

  	_getSubdomain: function (tilePoint) {
  		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
  		return this.options.subdomains[index];
  	},

  	// stops loading all tiles in the background layer
  	_abortLoading: function () {
  		var i, tile;
  		for (i in this._tiles) {
  			if (this._tiles[i].coords.z !== this._tileZoom) {
  				tile = this._tiles[i].el;

  				tile.onload = falseFn;
  				tile.onerror = falseFn;

  				if (!tile.complete) {
  					tile.src = emptyImageUrl;
  					remove(tile);
  					delete this._tiles[i];
  				}
  			}
  		}
  	},

  	_removeTile: function (key) {
  		var tile = this._tiles[key];
  		if (!tile) { return; }

  		// Cancels any pending http requests associated with the tile
  		// unless we're on Android's stock browser,
  		// see https://github.com/Leaflet/Leaflet/issues/137
  		if (!androidStock) {
  			tile.el.setAttribute('src', emptyImageUrl);
  		}

  		return GridLayer.prototype._removeTile.call(this, key);
  	},

  	_tileReady: function (coords, err, tile) {
  		if (!this._map || (tile && tile.getAttribute('src') === emptyImageUrl)) {
  			return;
  		}

  		return GridLayer.prototype._tileReady.call(this, coords, err, tile);
  	}
  });


  // @factory L.tilelayer(urlTemplate: String, options?: TileLayer options)
  // Instantiates a tile layer object given a `URL template` and optionally an options object.

  function tileLayer(url, options) {
  	return new TileLayer(url, options);
  }

  /*
   * @class TileLayer.WMS
   * @inherits TileLayer
   * @aka L.TileLayer.WMS
   * Used to display [WMS](https://en.wikipedia.org/wiki/Web_Map_Service) services as tile layers on the map. Extends `TileLayer`.
   *
   * @example
   *
   * ```js
   * var nexrad = L.tileLayer.wms("http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi", {
   * 	layers: 'nexrad-n0r-900913',
   * 	format: 'image/png',
   * 	transparent: true,
   * 	attribution: "Weather data © 2012 IEM Nexrad"
   * });
   * ```
   */

  var TileLayerWMS = TileLayer.extend({

  	// @section
  	// @aka TileLayer.WMS options
  	// If any custom options not documented here are used, they will be sent to the
  	// WMS server as extra parameters in each request URL. This can be useful for
  	// [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
  	defaultWmsParams: {
  		service: 'WMS',
  		request: 'GetMap',

  		// @option layers: String = ''
  		// **(required)** Comma-separated list of WMS layers to show.
  		layers: '',

  		// @option styles: String = ''
  		// Comma-separated list of WMS styles.
  		styles: '',

  		// @option format: String = 'image/jpeg'
  		// WMS image format (use `'image/png'` for layers with transparency).
  		format: 'image/jpeg',

  		// @option transparent: Boolean = false
  		// If `true`, the WMS service will return images with transparency.
  		transparent: false,

  		// @option version: String = '1.1.1'
  		// Version of the WMS service to use
  		version: '1.1.1'
  	},

  	options: {
  		// @option crs: CRS = null
  		// Coordinate Reference System to use for the WMS requests, defaults to
  		// map CRS. Don't change this if you're not sure what it means.
  		crs: null,

  		// @option uppercase: Boolean = false
  		// If `true`, WMS request parameter keys will be uppercase.
  		uppercase: false
  	},

  	initialize: function (url, options) {

  		this._url = url;

  		var wmsParams = extend({}, this.defaultWmsParams);

  		// all keys that are not TileLayer options go to WMS params
  		for (var i in options) {
  			if (!(i in this.options)) {
  				wmsParams[i] = options[i];
  			}
  		}

  		options = setOptions(this, options);

  		var realRetina = options.detectRetina && retina ? 2 : 1;
  		var tileSize = this.getTileSize();
  		wmsParams.width = tileSize.x * realRetina;
  		wmsParams.height = tileSize.y * realRetina;

  		this.wmsParams = wmsParams;
  	},

  	onAdd: function (map) {

  		this._crs = this.options.crs || map.options.crs;
  		this._wmsVersion = parseFloat(this.wmsParams.version);

  		var projectionKey = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
  		this.wmsParams[projectionKey] = this._crs.code;

  		TileLayer.prototype.onAdd.call(this, map);
  	},

  	getTileUrl: function (coords) {

  		var tileBounds = this._tileCoordsToNwSe(coords),
  		    crs = this._crs,
  		    bounds = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])),
  		    min = bounds.min,
  		    max = bounds.max,
  		    bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ?
  		    [min.y, min.x, max.y, max.x] :
  		    [min.x, min.y, max.x, max.y]).join(','),
  		    url = TileLayer.prototype.getTileUrl.call(this, coords);
  		return url +
  			getParamString(this.wmsParams, url, this.options.uppercase) +
  			(this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
  	},

  	// @method setParams(params: Object, noRedraw?: Boolean): this
  	// Merges an object with the new parameters and re-requests tiles on the current screen (unless `noRedraw` was set to true).
  	setParams: function (params, noRedraw) {

  		extend(this.wmsParams, params);

  		if (!noRedraw) {
  			this.redraw();
  		}

  		return this;
  	}
  });


  // @factory L.tileLayer.wms(baseUrl: String, options: TileLayer.WMS options)
  // Instantiates a WMS tile layer object given a base URL of the WMS service and a WMS parameters/options object.
  function tileLayerWMS(url, options) {
  	return new TileLayerWMS(url, options);
  }

  TileLayer.WMS = TileLayerWMS;
  tileLayer.wms = tileLayerWMS;

  /*
   * @class Renderer
   * @inherits Layer
   * @aka L.Renderer
   *
   * Base class for vector renderer implementations (`SVG`, `Canvas`). Handles the
   * DOM container of the renderer, its bounds, and its zoom animation.
   *
   * A `Renderer` works as an implicit layer group for all `Path`s - the renderer
   * itself can be added or removed to the map. All paths use a renderer, which can
   * be implicit (the map will decide the type of renderer and use it automatically)
   * or explicit (using the [`renderer`](#path-renderer) option of the path).
   *
   * Do not use this class directly, use `SVG` and `Canvas` instead.
   *
   * @event update: Event
   * Fired when the renderer updates its bounds, center and zoom, for example when
   * its map has moved
   */

  var Renderer = Layer.extend({

  	// @section
  	// @aka Renderer options
  	options: {
  		// @option padding: Number = 0.1
  		// How much to extend the clip area around the map view (relative to its size)
  		// e.g. 0.1 would be 10% of map view in each direction
  		padding: 0.1,

  		// @option tolerance: Number = 0
  		// How much to extend click tolerance round a path/object on the map
  		tolerance : 0
  	},

  	initialize: function (options) {
  		setOptions(this, options);
  		stamp(this);
  		this._layers = this._layers || {};
  	},

  	onAdd: function () {
  		if (!this._container) {
  			this._initContainer(); // defined by renderer implementations

  			if (this._zoomAnimated) {
  				addClass(this._container, 'leaflet-zoom-animated');
  			}
  		}

  		this.getPane().appendChild(this._container);
  		this._update();
  		this.on('update', this._updatePaths, this);
  	},

  	onRemove: function () {
  		this.off('update', this._updatePaths, this);
  		this._destroyContainer();
  	},

  	getEvents: function () {
  		var events = {
  			viewreset: this._reset,
  			zoom: this._onZoom,
  			moveend: this._update,
  			zoomend: this._onZoomEnd
  		};
  		if (this._zoomAnimated) {
  			events.zoomanim = this._onAnimZoom;
  		}
  		return events;
  	},

  	_onAnimZoom: function (ev) {
  		this._updateTransform(ev.center, ev.zoom);
  	},

  	_onZoom: function () {
  		this._updateTransform(this._map.getCenter(), this._map.getZoom());
  	},

  	_updateTransform: function (center, zoom) {
  		var scale = this._map.getZoomScale(zoom, this._zoom),
  		    position = getPosition(this._container),
  		    viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
  		    currentCenterPoint = this._map.project(this._center, zoom),
  		    destCenterPoint = this._map.project(center, zoom),
  		    centerOffset = destCenterPoint.subtract(currentCenterPoint),

  		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset);

  		if (any3d) {
  			setTransform(this._container, topLeftOffset, scale);
  		} else {
  			setPosition(this._container, topLeftOffset);
  		}
  	},

  	_reset: function () {
  		this._update();
  		this._updateTransform(this._center, this._zoom);

  		for (var id in this._layers) {
  			this._layers[id]._reset();
  		}
  	},

  	_onZoomEnd: function () {
  		for (var id in this._layers) {
  			this._layers[id]._project();
  		}
  	},

  	_updatePaths: function () {
  		for (var id in this._layers) {
  			this._layers[id]._update();
  		}
  	},

  	_update: function () {
  		// Update pixel bounds of renderer container (for positioning/sizing/clipping later)
  		// Subclasses are responsible of firing the 'update' event.
  		var p = this.options.padding,
  		    size = this._map.getSize(),
  		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();

  		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round());

  		this._center = this._map.getCenter();
  		this._zoom = this._map.getZoom();
  	}
  });

  /*
   * @class Canvas
   * @inherits Renderer
   * @aka L.Canvas
   *
   * Allows vector layers to be displayed with [`<canvas>`](https://developer.mozilla.org/docs/Web/API/Canvas_API).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](http://caniuse.com/#search=canvas), Canvas is not
   * available in all web browsers, notably IE8, and overlapping geometries might
   * not display properly in some edge cases.
   *
   * @example
   *
   * Use Canvas by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.canvas()
   * });
   * ```
   *
   * Use a Canvas renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.canvas({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var Canvas = Renderer.extend({
  	getEvents: function () {
  		var events = Renderer.prototype.getEvents.call(this);
  		events.viewprereset = this._onViewPreReset;
  		return events;
  	},

  	_onViewPreReset: function () {
  		// Set a flag so that a viewprereset+moveend+viewreset only updates&redraws once
  		this._postponeUpdatePaths = true;
  	},

  	onAdd: function () {
  		Renderer.prototype.onAdd.call(this);

  		// Redraw vectors since canvas is cleared upon removal,
  		// in case of removing the renderer itself from the map.
  		this._draw();
  	},

  	_initContainer: function () {
  		var container = this._container = document.createElement('canvas');

  		on(container, 'mousemove', this._onMouseMove, this);
  		on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  		on(container, 'mouseout', this._handleMouseOut, this);

  		this._ctx = container.getContext('2d');
  	},

  	_destroyContainer: function () {
  		cancelAnimFrame(this._redrawRequest);
  		delete this._ctx;
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  	},

  	_updatePaths: function () {
  		if (this._postponeUpdatePaths) { return; }

  		var layer;
  		this._redrawBounds = null;
  		for (var id in this._layers) {
  			layer = this._layers[id];
  			layer._update();
  		}
  		this._redraw();
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer.prototype._update.call(this);

  		var b = this._bounds,
  		    container = this._container,
  		    size = b.getSize(),
  		    m = retina ? 2 : 1;

  		setPosition(container, b.min);

  		// set canvas size (also clearing it); use double size on retina
  		container.width = m * size.x;
  		container.height = m * size.y;
  		container.style.width = size.x + 'px';
  		container.style.height = size.y + 'px';

  		if (retina) {
  			this._ctx.scale(2, 2);
  		}

  		// translate so we use the same path coordinates after canvas element moves
  		this._ctx.translate(-b.min.x, -b.min.y);

  		// Tell paths to redraw themselves
  		this.fire('update');
  	},

  	_reset: function () {
  		Renderer.prototype._reset.call(this);

  		if (this._postponeUpdatePaths) {
  			this._postponeUpdatePaths = false;
  			this._updatePaths();
  		}
  	},

  	_initPath: function (layer) {
  		this._updateDashArray(layer);
  		this._layers[stamp(layer)] = layer;

  		var order = layer._order = {
  			layer: layer,
  			prev: this._drawLast,
  			next: null
  		};
  		if (this._drawLast) { this._drawLast.next = order; }
  		this._drawLast = order;
  		this._drawFirst = this._drawFirst || this._drawLast;
  	},

  	_addPath: function (layer) {
  		this._requestRedraw(layer);
  	},

  	_removePath: function (layer) {
  		var order = layer._order;
  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			this._drawLast = prev;
  		}
  		if (prev) {
  			prev.next = next;
  		} else {
  			this._drawFirst = next;
  		}

  		delete layer._order;

  		delete this._layers[stamp(layer)];

  		this._requestRedraw(layer);
  	},

  	_updatePath: function (layer) {
  		// Redraw the union of the layer's old pixel
  		// bounds and the new pixel bounds.
  		this._extendRedrawBounds(layer);
  		layer._project();
  		layer._update();
  		// The redraw will extend the redraw bounds
  		// with the new pixel bounds.
  		this._requestRedraw(layer);
  	},

  	_updateStyle: function (layer) {
  		this._updateDashArray(layer);
  		this._requestRedraw(layer);
  	},

  	_updateDashArray: function (layer) {
  		if (typeof layer.options.dashArray === 'string') {
  			var parts = layer.options.dashArray.split(/[, ]+/),
  			    dashArray = [],
  			    dashValue,
  			    i;
  			for (i = 0; i < parts.length; i++) {
  				dashValue = Number(parts[i]);
  				// Ignore dash array containing invalid lengths
  				if (isNaN(dashValue)) { return; }
  				dashArray.push(dashValue);
  			}
  			layer.options._dashArray = dashArray;
  		} else {
  			layer.options._dashArray = layer.options.dashArray;
  		}
  	},

  	_requestRedraw: function (layer) {
  		if (!this._map) { return; }

  		this._extendRedrawBounds(layer);
  		this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
  	},

  	_extendRedrawBounds: function (layer) {
  		if (layer._pxBounds) {
  			var padding = (layer.options.weight || 0) + 1;
  			this._redrawBounds = this._redrawBounds || new Bounds();
  			this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
  			this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
  		}
  	},

  	_redraw: function () {
  		this._redrawRequest = null;

  		if (this._redrawBounds) {
  			this._redrawBounds.min._floor();
  			this._redrawBounds.max._ceil();
  		}

  		this._clear(); // clear layers in redraw bounds
  		this._draw(); // draw layers

  		this._redrawBounds = null;
  	},

  	_clear: function () {
  		var bounds = this._redrawBounds;
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.clearRect(bounds.min.x, bounds.min.y, size.x, size.y);
  		} else {
  			this._ctx.save();
  			this._ctx.setTransform(1, 0, 0, 1, 0, 0);
  			this._ctx.clearRect(0, 0, this._container.width, this._container.height);
  			this._ctx.restore();
  		}
  	},

  	_draw: function () {
  		var layer, bounds = this._redrawBounds;
  		this._ctx.save();
  		if (bounds) {
  			var size = bounds.getSize();
  			this._ctx.beginPath();
  			this._ctx.rect(bounds.min.x, bounds.min.y, size.x, size.y);
  			this._ctx.clip();
  		}

  		this._drawing = true;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (!bounds || (layer._pxBounds && layer._pxBounds.intersects(bounds))) {
  				layer._updatePath();
  			}
  		}

  		this._drawing = false;

  		this._ctx.restore();  // Restore state before clipping.
  	},

  	_updatePoly: function (layer, closed) {
  		if (!this._drawing) { return; }

  		var i, j, len2, p,
  		    parts = layer._parts,
  		    len = parts.length,
  		    ctx = this._ctx;

  		if (!len) { return; }

  		ctx.beginPath();

  		for (i = 0; i < len; i++) {
  			for (j = 0, len2 = parts[i].length; j < len2; j++) {
  				p = parts[i][j];
  				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
  			}
  			if (closed) {
  				ctx.closePath();
  			}
  		}

  		this._fillStroke(ctx, layer);

  		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
  	},

  	_updateCircle: function (layer) {

  		if (!this._drawing || layer._empty()) { return; }

  		var p = layer._point,
  		    ctx = this._ctx,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

  		if (s !== 1) {
  			ctx.save();
  			ctx.scale(1, s);
  		}

  		ctx.beginPath();
  		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

  		if (s !== 1) {
  			ctx.restore();
  		}

  		this._fillStroke(ctx, layer);
  	},

  	_fillStroke: function (ctx, layer) {
  		var options = layer.options;

  		if (options.fill) {
  			ctx.globalAlpha = options.fillOpacity;
  			ctx.fillStyle = options.fillColor || options.color;
  			ctx.fill(options.fillRule || 'evenodd');
  		}

  		if (options.stroke && options.weight !== 0) {
  			if (ctx.setLineDash) {
  				ctx.setLineDash(layer.options && layer.options._dashArray || []);
  			}
  			ctx.globalAlpha = options.opacity;
  			ctx.lineWidth = options.weight;
  			ctx.strokeStyle = options.color;
  			ctx.lineCap = options.lineCap;
  			ctx.lineJoin = options.lineJoin;
  			ctx.stroke();
  		}
  	},

  	// Canvas obviously doesn't have mouse events for individual drawn objects,
  	// so we emulate that by calculating what's under the mouse on mousemove/click manually

  	_onClick: function (e) {
  		var point = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point)) {
  				if (!(e.type === 'click' || e.type !== 'preclick') || !this._map._draggableMoved(layer)) {
  					clickedLayer = layer;
  				}
  			}
  		}
  		if (clickedLayer)  {
  			fakeStop(e);
  			this._fireEvent([clickedLayer], e);
  		}
  	},

  	_onMouseMove: function (e) {
  		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

  		var point = this._map.mouseEventToLayerPoint(e);
  		this._handleMouseHover(e, point);
  	},


  	_handleMouseOut: function (e) {
  		var layer = this._hoveredLayer;
  		if (layer) {
  			// if we're leaving the layer, fire mouseout
  			removeClass(this._container, 'leaflet-interactive');
  			this._fireEvent([layer], e, 'mouseout');
  			this._hoveredLayer = null;
  			this._mouseHoverThrottled = false;
  		}
  	},

  	_handleMouseHover: function (e, point) {
  		if (this._mouseHoverThrottled) {
  			return;
  		}

  		var layer, candidateHoveredLayer;

  		for (var order = this._drawFirst; order; order = order.next) {
  			layer = order.layer;
  			if (layer.options.interactive && layer._containsPoint(point)) {
  				candidateHoveredLayer = layer;
  			}
  		}

  		if (candidateHoveredLayer !== this._hoveredLayer) {
  			this._handleMouseOut(e);

  			if (candidateHoveredLayer) {
  				addClass(this._container, 'leaflet-interactive'); // change cursor
  				this._fireEvent([candidateHoveredLayer], e, 'mouseover');
  				this._hoveredLayer = candidateHoveredLayer;
  			}
  		}

  		if (this._hoveredLayer) {
  			this._fireEvent([this._hoveredLayer], e);
  		}

  		this._mouseHoverThrottled = true;
  		setTimeout(bind(function () {
  			this._mouseHoverThrottled = false;
  		}, this), 32);
  	},

  	_fireEvent: function (layers, e, type) {
  		this._map._fireDOMEvent(e, type || e.type, layers);
  	},

  	_bringToFront: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (next) {
  			next.prev = prev;
  		} else {
  			// Already last
  			return;
  		}
  		if (prev) {
  			prev.next = next;
  		} else if (next) {
  			// Update first entry unless this is the
  			// single entry
  			this._drawFirst = next;
  		}

  		order.prev = this._drawLast;
  		this._drawLast.next = order;

  		order.next = null;
  		this._drawLast = order;

  		this._requestRedraw(layer);
  	},

  	_bringToBack: function (layer) {
  		var order = layer._order;

  		if (!order) { return; }

  		var next = order.next;
  		var prev = order.prev;

  		if (prev) {
  			prev.next = next;
  		} else {
  			// Already first
  			return;
  		}
  		if (next) {
  			next.prev = prev;
  		} else if (prev) {
  			// Update last entry unless this is the
  			// single entry
  			this._drawLast = prev;
  		}

  		order.prev = null;

  		order.next = this._drawFirst;
  		this._drawFirst.prev = order;
  		this._drawFirst = order;

  		this._requestRedraw(layer);
  	}
  });

  // @factory L.canvas(options?: Renderer options)
  // Creates a Canvas renderer with the given options.
  function canvas$1(options) {
  	return canvas ? new Canvas(options) : null;
  }

  /*
   * Thanks to Dmitry Baranovsky and his Raphael library for inspiration!
   */


  var vmlCreate = (function () {
  	try {
  		document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml');
  		return function (name) {
  			return document.createElement('<lvml:' + name + ' class="lvml">');
  		};
  	} catch (e) {
  		return function (name) {
  			return document.createElement('<' + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
  		};
  	}
  })();


  /*
   * @class SVG
   *
   *
   * VML was deprecated in 2012, which means VML functionality exists only for backwards compatibility
   * with old versions of Internet Explorer.
   */

  // mixin to redefine some SVG methods to handle VML syntax which is similar but with some differences
  var vmlMixin = {

  	_initContainer: function () {
  		this._container = create$1('div', 'leaflet-vml-container');
  	},

  	_update: function () {
  		if (this._map._animatingZoom) { return; }
  		Renderer.prototype._update.call(this);
  		this.fire('update');
  	},

  	_initPath: function (layer) {
  		var container = layer._container = vmlCreate('shape');

  		addClass(container, 'leaflet-vml-shape ' + (this.options.className || ''));

  		container.coordsize = '1 1';

  		layer._path = vmlCreate('path');
  		container.appendChild(layer._path);

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		var container = layer._container;
  		this._container.appendChild(container);

  		if (layer.options.interactive) {
  			layer.addInteractiveTarget(container);
  		}
  	},

  	_removePath: function (layer) {
  		var container = layer._container;
  		remove(container);
  		layer.removeInteractiveTarget(container);
  		delete this._layers[stamp(layer)];
  	},

  	_updateStyle: function (layer) {
  		var stroke = layer._stroke,
  		    fill = layer._fill,
  		    options = layer.options,
  		    container = layer._container;

  		container.stroked = !!options.stroke;
  		container.filled = !!options.fill;

  		if (options.stroke) {
  			if (!stroke) {
  				stroke = layer._stroke = vmlCreate('stroke');
  			}
  			container.appendChild(stroke);
  			stroke.weight = options.weight + 'px';
  			stroke.color = options.color;
  			stroke.opacity = options.opacity;

  			if (options.dashArray) {
  				stroke.dashStyle = isArray(options.dashArray) ?
  				    options.dashArray.join(' ') :
  				    options.dashArray.replace(/( *, *)/g, ' ');
  			} else {
  				stroke.dashStyle = '';
  			}
  			stroke.endcap = options.lineCap.replace('butt', 'flat');
  			stroke.joinstyle = options.lineJoin;

  		} else if (stroke) {
  			container.removeChild(stroke);
  			layer._stroke = null;
  		}

  		if (options.fill) {
  			if (!fill) {
  				fill = layer._fill = vmlCreate('fill');
  			}
  			container.appendChild(fill);
  			fill.color = options.fillColor || options.color;
  			fill.opacity = options.fillOpacity;

  		} else if (fill) {
  			container.removeChild(fill);
  			layer._fill = null;
  		}
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point.round(),
  		    r = Math.round(layer._radius),
  		    r2 = Math.round(layer._radiusY || r);

  		this._setPath(layer, layer._empty() ? 'M0 0' :
  			'AL ' + p.x + ',' + p.y + ' ' + r + ',' + r2 + ' 0,' + (65535 * 360));
  	},

  	_setPath: function (layer, path) {
  		layer._path.v = path;
  	},

  	_bringToFront: function (layer) {
  		toFront(layer._container);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._container);
  	}
  };

  var create$2 = vml ? vmlCreate : svgCreate;

  /*
   * @class SVG
   * @inherits Renderer
   * @aka L.SVG
   *
   * Allows vector layers to be displayed with [SVG](https://developer.mozilla.org/docs/Web/SVG).
   * Inherits `Renderer`.
   *
   * Due to [technical limitations](http://caniuse.com/#search=svg), SVG is not
   * available in all web browsers, notably Android 2.x and 3.x.
   *
   * Although SVG is not available on IE7 and IE8, these browsers support
   * [VML](https://en.wikipedia.org/wiki/Vector_Markup_Language)
   * (a now deprecated technology), and the SVG renderer will fall back to VML in
   * this case.
   *
   * @example
   *
   * Use SVG by default for all paths in the map:
   *
   * ```js
   * var map = L.map('map', {
   * 	renderer: L.svg()
   * });
   * ```
   *
   * Use a SVG renderer with extra padding for specific vector geometries:
   *
   * ```js
   * var map = L.map('map');
   * var myRenderer = L.svg({ padding: 0.5 });
   * var line = L.polyline( coordinates, { renderer: myRenderer } );
   * var circle = L.circle( center, { renderer: myRenderer } );
   * ```
   */

  var SVG = Renderer.extend({

  	getEvents: function () {
  		var events = Renderer.prototype.getEvents.call(this);
  		events.zoomstart = this._onZoomStart;
  		return events;
  	},

  	_initContainer: function () {
  		this._container = create$2('svg');

  		// makes it possible to click through svg root; we'll reset it back in individual paths
  		this._container.setAttribute('pointer-events', 'none');

  		this._rootGroup = create$2('g');
  		this._container.appendChild(this._rootGroup);
  	},

  	_destroyContainer: function () {
  		remove(this._container);
  		off(this._container);
  		delete this._container;
  		delete this._rootGroup;
  		delete this._svgSize;
  	},

  	_onZoomStart: function () {
  		// Drag-then-pinch interactions might mess up the center and zoom.
  		// In this case, the easiest way to prevent this is re-do the renderer
  		//   bounds and padding when the zooming starts.
  		this._update();
  	},

  	_update: function () {
  		if (this._map._animatingZoom && this._bounds) { return; }

  		Renderer.prototype._update.call(this);

  		var b = this._bounds,
  		    size = b.getSize(),
  		    container = this._container;

  		// set size of svg-container if changed
  		if (!this._svgSize || !this._svgSize.equals(size)) {
  			this._svgSize = size;
  			container.setAttribute('width', size.x);
  			container.setAttribute('height', size.y);
  		}

  		// movement: update container viewBox so that we don't have to change coordinates of individual layers
  		setPosition(container, b.min);
  		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '));

  		this.fire('update');
  	},

  	// methods below are called by vector layers implementations

  	_initPath: function (layer) {
  		var path = layer._path = create$2('path');

  		// @namespace Path
  		// @option className: String = null
  		// Custom class name set on an element. Only for SVG renderer.
  		if (layer.options.className) {
  			addClass(path, layer.options.className);
  		}

  		if (layer.options.interactive) {
  			addClass(path, 'leaflet-interactive');
  		}

  		this._updateStyle(layer);
  		this._layers[stamp(layer)] = layer;
  	},

  	_addPath: function (layer) {
  		if (!this._rootGroup) { this._initContainer(); }
  		this._rootGroup.appendChild(layer._path);
  		layer.addInteractiveTarget(layer._path);
  	},

  	_removePath: function (layer) {
  		remove(layer._path);
  		layer.removeInteractiveTarget(layer._path);
  		delete this._layers[stamp(layer)];
  	},

  	_updatePath: function (layer) {
  		layer._project();
  		layer._update();
  	},

  	_updateStyle: function (layer) {
  		var path = layer._path,
  		    options = layer.options;

  		if (!path) { return; }

  		if (options.stroke) {
  			path.setAttribute('stroke', options.color);
  			path.setAttribute('stroke-opacity', options.opacity);
  			path.setAttribute('stroke-width', options.weight);
  			path.setAttribute('stroke-linecap', options.lineCap);
  			path.setAttribute('stroke-linejoin', options.lineJoin);

  			if (options.dashArray) {
  				path.setAttribute('stroke-dasharray', options.dashArray);
  			} else {
  				path.removeAttribute('stroke-dasharray');
  			}

  			if (options.dashOffset) {
  				path.setAttribute('stroke-dashoffset', options.dashOffset);
  			} else {
  				path.removeAttribute('stroke-dashoffset');
  			}
  		} else {
  			path.setAttribute('stroke', 'none');
  		}

  		if (options.fill) {
  			path.setAttribute('fill', options.fillColor || options.color);
  			path.setAttribute('fill-opacity', options.fillOpacity);
  			path.setAttribute('fill-rule', options.fillRule || 'evenodd');
  		} else {
  			path.setAttribute('fill', 'none');
  		}
  	},

  	_updatePoly: function (layer, closed) {
  		this._setPath(layer, pointsToPath(layer._parts, closed));
  	},

  	_updateCircle: function (layer) {
  		var p = layer._point,
  		    r = Math.max(Math.round(layer._radius), 1),
  		    r2 = Math.max(Math.round(layer._radiusY), 1) || r,
  		    arc = 'a' + r + ',' + r2 + ' 0 1,0 ';

  		// drawing a circle with two half-arcs
  		var d = layer._empty() ? 'M0 0' :
  			'M' + (p.x - r) + ',' + p.y +
  			arc + (r * 2) + ',0 ' +
  			arc + (-r * 2) + ',0 ';

  		this._setPath(layer, d);
  	},

  	_setPath: function (layer, path) {
  		layer._path.setAttribute('d', path);
  	},

  	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
  	_bringToFront: function (layer) {
  		toFront(layer._path);
  	},

  	_bringToBack: function (layer) {
  		toBack(layer._path);
  	}
  });

  if (vml) {
  	SVG.include(vmlMixin);
  }

  // @namespace SVG
  // @factory L.svg(options?: Renderer options)
  // Creates a SVG renderer with the given options.
  function svg$1(options) {
  	return svg || vml ? new SVG(options) : null;
  }

  Map.include({
  	// @namespace Map; @method getRenderer(layer: Path): Renderer
  	// Returns the instance of `Renderer` that should be used to render the given
  	// `Path`. It will ensure that the `renderer` options of the map and paths
  	// are respected, and that the renderers do exist on the map.
  	getRenderer: function (layer) {
  		// @namespace Path; @option renderer: Renderer
  		// Use this specific instance of `Renderer` for this path. Takes
  		// precedence over the map's [default renderer](#map-renderer).
  		var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;

  		if (!renderer) {
  			renderer = this._renderer = this._createRenderer();
  		}

  		if (!this.hasLayer(renderer)) {
  			this.addLayer(renderer);
  		}
  		return renderer;
  	},

  	_getPaneRenderer: function (name) {
  		if (name === 'overlayPane' || name === undefined) {
  			return false;
  		}

  		var renderer = this._paneRenderers[name];
  		if (renderer === undefined) {
  			renderer = this._createRenderer({pane: name});
  			this._paneRenderers[name] = renderer;
  		}
  		return renderer;
  	},

  	_createRenderer: function (options) {
  		// @namespace Map; @option preferCanvas: Boolean = false
  		// Whether `Path`s should be rendered on a `Canvas` renderer.
  		// By default, all `Path`s are rendered in a `SVG` renderer.
  		return (this.options.preferCanvas && canvas$1(options)) || svg$1(options);
  	}
  });

  /*
   * L.Rectangle extends Polygon and creates a rectangle when passed a LatLngBounds object.
   */

  /*
   * @class Rectangle
   * @aka L.Rectangle
   * @inherits Polygon
   *
   * A class for drawing rectangle overlays on a map. Extends `Polygon`.
   *
   * @example
   *
   * ```js
   * // define rectangle geographical bounds
   * var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
   *
   * // create an orange rectangle
   * L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(map);
   *
   * // zoom the map to the rectangle bounds
   * map.fitBounds(bounds);
   * ```
   *
   */


  var Rectangle = Polygon.extend({
  	initialize: function (latLngBounds, options) {
  		Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds), options);
  	},

  	// @method setBounds(latLngBounds: LatLngBounds): this
  	// Redraws the rectangle with the passed bounds.
  	setBounds: function (latLngBounds) {
  		return this.setLatLngs(this._boundsToLatLngs(latLngBounds));
  	},

  	_boundsToLatLngs: function (latLngBounds) {
  		latLngBounds = toLatLngBounds(latLngBounds);
  		return [
  			latLngBounds.getSouthWest(),
  			latLngBounds.getNorthWest(),
  			latLngBounds.getNorthEast(),
  			latLngBounds.getSouthEast()
  		];
  	}
  });


  // @factory L.rectangle(latLngBounds: LatLngBounds, options?: Polyline options)
  function rectangle(latLngBounds, options) {
  	return new Rectangle(latLngBounds, options);
  }

  SVG.create = create$2;
  SVG.pointsToPath = pointsToPath;

  GeoJSON.geometryToLayer = geometryToLayer;
  GeoJSON.coordsToLatLng = coordsToLatLng;
  GeoJSON.coordsToLatLngs = coordsToLatLngs;
  GeoJSON.latLngToCoords = latLngToCoords;
  GeoJSON.latLngsToCoords = latLngsToCoords;
  GeoJSON.getFeature = getFeature;
  GeoJSON.asFeature = asFeature;

  /*
   * L.Handler.BoxZoom is used to add shift-drag zoom interaction to the map
   * (zoom to a selected bounding box), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @option boxZoom: Boolean = true
  	// Whether the map can be zoomed to a rectangular area specified by
  	// dragging the mouse while pressing the shift key.
  	boxZoom: true
  });

  var BoxZoom = Handler.extend({
  	initialize: function (map) {
  		this._map = map;
  		this._container = map._container;
  		this._pane = map._panes.overlayPane;
  		this._resetStateTimeout = 0;
  		map.on('unload', this._destroy, this);
  	},

  	addHooks: function () {
  		on(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	removeHooks: function () {
  		off(this._container, 'mousedown', this._onMouseDown, this);
  	},

  	moved: function () {
  		return this._moved;
  	},

  	_destroy: function () {
  		remove(this._pane);
  		delete this._pane;
  	},

  	_resetState: function () {
  		this._resetStateTimeout = 0;
  		this._moved = false;
  	},

  	_clearDeferredResetState: function () {
  		if (this._resetStateTimeout !== 0) {
  			clearTimeout(this._resetStateTimeout);
  			this._resetStateTimeout = 0;
  		}
  	},

  	_onMouseDown: function (e) {
  		if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

  		// Clear the deferred resetState if it hasn't executed yet, otherwise it
  		// will interrupt the interaction and orphan a box element in the container.
  		this._clearDeferredResetState();
  		this._resetState();

  		disableTextSelection();
  		disableImageDrag();

  		this._startPoint = this._map.mouseEventToContainerPoint(e);

  		on(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseMove: function (e) {
  		if (!this._moved) {
  			this._moved = true;

  			this._box = create$1('div', 'leaflet-zoom-box', this._container);
  			addClass(this._container, 'leaflet-crosshair');

  			this._map.fire('boxzoomstart');
  		}

  		this._point = this._map.mouseEventToContainerPoint(e);

  		var bounds = new Bounds(this._point, this._startPoint),
  		    size = bounds.getSize();

  		setPosition(this._box, bounds.min);

  		this._box.style.width  = size.x + 'px';
  		this._box.style.height = size.y + 'px';
  	},

  	_finish: function () {
  		if (this._moved) {
  			remove(this._box);
  			removeClass(this._container, 'leaflet-crosshair');
  		}

  		enableTextSelection();
  		enableImageDrag();

  		off(document, {
  			contextmenu: stop,
  			mousemove: this._onMouseMove,
  			mouseup: this._onMouseUp,
  			keydown: this._onKeyDown
  		}, this);
  	},

  	_onMouseUp: function (e) {
  		if ((e.which !== 1) && (e.button !== 1)) { return; }

  		this._finish();

  		if (!this._moved) { return; }
  		// Postpone to next JS tick so internal click event handling
  		// still see it as "moved".
  		this._clearDeferredResetState();
  		this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);

  		var bounds = new LatLngBounds(
  		        this._map.containerPointToLatLng(this._startPoint),
  		        this._map.containerPointToLatLng(this._point));

  		this._map
  			.fitBounds(bounds)
  			.fire('boxzoomend', {boxZoomBounds: bounds});
  	},

  	_onKeyDown: function (e) {
  		if (e.keyCode === 27) {
  			this._finish();
  		}
  	}
  });

  // @section Handlers
  // @property boxZoom: Handler
  // Box (shift-drag with mouse) zoom handler.
  Map.addInitHook('addHandler', 'boxZoom', BoxZoom);

  /*
   * L.Handler.DoubleClickZoom is used to handle double-click zoom on the map, enabled by default.
   */

  // @namespace Map
  // @section Interaction Options

  Map.mergeOptions({
  	// @option doubleClickZoom: Boolean|String = true
  	// Whether the map can be zoomed in by double clicking on it and
  	// zoomed out by double clicking while holding shift. If passed
  	// `'center'`, double-click zoom will zoom to the center of the
  	//  view regardless of where the mouse was.
  	doubleClickZoom: true
  });

  var DoubleClickZoom = Handler.extend({
  	addHooks: function () {
  		this._map.on('dblclick', this._onDoubleClick, this);
  	},

  	removeHooks: function () {
  		this._map.off('dblclick', this._onDoubleClick, this);
  	},

  	_onDoubleClick: function (e) {
  		var map = this._map,
  		    oldZoom = map.getZoom(),
  		    delta = map.options.zoomDelta,
  		    zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

  		if (map.options.doubleClickZoom === 'center') {
  			map.setZoom(zoom);
  		} else {
  			map.setZoomAround(e.containerPoint, zoom);
  		}
  	}
  });

  // @section Handlers
  //
  // Map properties include interaction handlers that allow you to control
  // interaction behavior in runtime, enabling or disabling certain features such
  // as dragging or touch zoom (see `Handler` methods). For example:
  //
  // ```js
  // map.doubleClickZoom.disable();
  // ```
  //
  // @property doubleClickZoom: Handler
  // Double click zoom handler.
  Map.addInitHook('addHandler', 'doubleClickZoom', DoubleClickZoom);

  /*
   * L.Handler.MapDrag is used to make the map draggable (with panning inertia), enabled by default.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @option dragging: Boolean = true
  	// Whether the map be draggable with mouse/touch or not.
  	dragging: true,

  	// @section Panning Inertia Options
  	// @option inertia: Boolean = *
  	// If enabled, panning of the map will have an inertia effect where
  	// the map builds momentum while dragging and continues moving in
  	// the same direction for some time. Feels especially nice on touch
  	// devices. Enabled by default unless running on old Android devices.
  	inertia: !android23,

  	// @option inertiaDeceleration: Number = 3000
  	// The rate with which the inertial movement slows down, in pixels/second².
  	inertiaDeceleration: 3400, // px/s^2

  	// @option inertiaMaxSpeed: Number = Infinity
  	// Max speed of the inertial movement, in pixels/second.
  	inertiaMaxSpeed: Infinity, // px/s

  	// @option easeLinearity: Number = 0.2
  	easeLinearity: 0.2,

  	// TODO refactor, move to CRS
  	// @option worldCopyJump: Boolean = false
  	// With this option enabled, the map tracks when you pan to another "copy"
  	// of the world and seamlessly jumps to the original one so that all overlays
  	// like markers and vector layers are still visible.
  	worldCopyJump: false,

  	// @option maxBoundsViscosity: Number = 0.0
  	// If `maxBounds` is set, this option will control how solid the bounds
  	// are when dragging the map around. The default value of `0.0` allows the
  	// user to drag outside the bounds at normal speed, higher values will
  	// slow down map dragging outside bounds, and `1.0` makes the bounds fully
  	// solid, preventing the user from dragging outside the bounds.
  	maxBoundsViscosity: 0.0
  });

  var Drag = Handler.extend({
  	addHooks: function () {
  		if (!this._draggable) {
  			var map = this._map;

  			this._draggable = new Draggable(map._mapPane, map._container);

  			this._draggable.on({
  				dragstart: this._onDragStart,
  				drag: this._onDrag,
  				dragend: this._onDragEnd
  			}, this);

  			this._draggable.on('predrag', this._onPreDragLimit, this);
  			if (map.options.worldCopyJump) {
  				this._draggable.on('predrag', this._onPreDragWrap, this);
  				map.on('zoomend', this._onZoomEnd, this);

  				map.whenReady(this._onZoomEnd, this);
  			}
  		}
  		addClass(this._map._container, 'leaflet-grab leaflet-touch-drag');
  		this._draggable.enable();
  		this._positions = [];
  		this._times = [];
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-grab');
  		removeClass(this._map._container, 'leaflet-touch-drag');
  		this._draggable.disable();
  	},

  	moved: function () {
  		return this._draggable && this._draggable._moved;
  	},

  	moving: function () {
  		return this._draggable && this._draggable._moving;
  	},

  	_onDragStart: function () {
  		var map = this._map;

  		map._stop();
  		if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
  			var bounds = toLatLngBounds(this._map.options.maxBounds);

  			this._offsetLimit = toBounds(
  				this._map.latLngToContainerPoint(bounds.getNorthWest()).multiplyBy(-1),
  				this._map.latLngToContainerPoint(bounds.getSouthEast()).multiplyBy(-1)
  					.add(this._map.getSize()));

  			this._viscosity = Math.min(1.0, Math.max(0.0, this._map.options.maxBoundsViscosity));
  		} else {
  			this._offsetLimit = null;
  		}

  		map
  		    .fire('movestart')
  		    .fire('dragstart');

  		if (map.options.inertia) {
  			this._positions = [];
  			this._times = [];
  		}
  	},

  	_onDrag: function (e) {
  		if (this._map.options.inertia) {
  			var time = this._lastTime = +new Date(),
  			    pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;

  			this._positions.push(pos);
  			this._times.push(time);

  			this._prunePositions(time);
  		}

  		this._map
  		    .fire('move', e)
  		    .fire('drag', e);
  	},

  	_prunePositions: function (time) {
  		while (this._positions.length > 1 && time - this._times[0] > 50) {
  			this._positions.shift();
  			this._times.shift();
  		}
  	},

  	_onZoomEnd: function () {
  		var pxCenter = this._map.getSize().divideBy(2),
  		    pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);

  		this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
  		this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
  	},

  	_viscousLimit: function (value, threshold) {
  		return value - (value - threshold) * this._viscosity;
  	},

  	_onPreDragLimit: function () {
  		if (!this._viscosity || !this._offsetLimit) { return; }

  		var offset = this._draggable._newPos.subtract(this._draggable._startPos);

  		var limit = this._offsetLimit;
  		if (offset.x < limit.min.x) { offset.x = this._viscousLimit(offset.x, limit.min.x); }
  		if (offset.y < limit.min.y) { offset.y = this._viscousLimit(offset.y, limit.min.y); }
  		if (offset.x > limit.max.x) { offset.x = this._viscousLimit(offset.x, limit.max.x); }
  		if (offset.y > limit.max.y) { offset.y = this._viscousLimit(offset.y, limit.max.y); }

  		this._draggable._newPos = this._draggable._startPos.add(offset);
  	},

  	_onPreDragWrap: function () {
  		// TODO refactor to be able to adjust map pane position after zoom
  		var worldWidth = this._worldWidth,
  		    halfWidth = Math.round(worldWidth / 2),
  		    dx = this._initialWorldOffset,
  		    x = this._draggable._newPos.x,
  		    newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
  		    newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
  		    newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;

  		this._draggable._absPos = this._draggable._newPos.clone();
  		this._draggable._newPos.x = newX;
  	},

  	_onDragEnd: function (e) {
  		var map = this._map,
  		    options = map.options,

  		    noInertia = !options.inertia || this._times.length < 2;

  		map.fire('dragend', e);

  		if (noInertia) {
  			map.fire('moveend');

  		} else {
  			this._prunePositions(+new Date());

  			var direction = this._lastPos.subtract(this._positions[0]),
  			    duration = (this._lastTime - this._times[0]) / 1000,
  			    ease = options.easeLinearity,

  			    speedVector = direction.multiplyBy(ease / duration),
  			    speed = speedVector.distanceTo([0, 0]),

  			    limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
  			    limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),

  			    decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
  			    offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();

  			if (!offset.x && !offset.y) {
  				map.fire('moveend');

  			} else {
  				offset = map._limitOffset(offset, map.options.maxBounds);

  				requestAnimFrame(function () {
  					map.panBy(offset, {
  						duration: decelerationDuration,
  						easeLinearity: ease,
  						noMoveStart: true,
  						animate: true
  					});
  				});
  			}
  		}
  	}
  });

  // @section Handlers
  // @property dragging: Handler
  // Map dragging handler (by both mouse and touch).
  Map.addInitHook('addHandler', 'dragging', Drag);

  /*
   * L.Map.Keyboard is handling keyboard interaction with the map, enabled by default.
   */

  // @namespace Map
  // @section Keyboard Navigation Options
  Map.mergeOptions({
  	// @option keyboard: Boolean = true
  	// Makes the map focusable and allows users to navigate the map with keyboard
  	// arrows and `+`/`-` keys.
  	keyboard: true,

  	// @option keyboardPanDelta: Number = 80
  	// Amount of pixels to pan when pressing an arrow key.
  	keyboardPanDelta: 80
  });

  var Keyboard = Handler.extend({

  	keyCodes: {
  		left:    [37],
  		right:   [39],
  		down:    [40],
  		up:      [38],
  		zoomIn:  [187, 107, 61, 171],
  		zoomOut: [189, 109, 54, 173]
  	},

  	initialize: function (map) {
  		this._map = map;

  		this._setPanDelta(map.options.keyboardPanDelta);
  		this._setZoomDelta(map.options.zoomDelta);
  	},

  	addHooks: function () {
  		var container = this._map._container;

  		// make the container focusable by tabbing
  		if (container.tabIndex <= 0) {
  			container.tabIndex = '0';
  		}

  		on(container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.on({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	removeHooks: function () {
  		this._removeHooks();

  		off(this._map._container, {
  			focus: this._onFocus,
  			blur: this._onBlur,
  			mousedown: this._onMouseDown
  		}, this);

  		this._map.off({
  			focus: this._addHooks,
  			blur: this._removeHooks
  		}, this);
  	},

  	_onMouseDown: function () {
  		if (this._focused) { return; }

  		var body = document.body,
  		    docEl = document.documentElement,
  		    top = body.scrollTop || docEl.scrollTop,
  		    left = body.scrollLeft || docEl.scrollLeft;

  		this._map._container.focus();

  		window.scrollTo(left, top);
  	},

  	_onFocus: function () {
  		this._focused = true;
  		this._map.fire('focus');
  	},

  	_onBlur: function () {
  		this._focused = false;
  		this._map.fire('blur');
  	},

  	_setPanDelta: function (panDelta) {
  		var keys = this._panKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.left.length; i < len; i++) {
  			keys[codes.left[i]] = [-1 * panDelta, 0];
  		}
  		for (i = 0, len = codes.right.length; i < len; i++) {
  			keys[codes.right[i]] = [panDelta, 0];
  		}
  		for (i = 0, len = codes.down.length; i < len; i++) {
  			keys[codes.down[i]] = [0, panDelta];
  		}
  		for (i = 0, len = codes.up.length; i < len; i++) {
  			keys[codes.up[i]] = [0, -1 * panDelta];
  		}
  	},

  	_setZoomDelta: function (zoomDelta) {
  		var keys = this._zoomKeys = {},
  		    codes = this.keyCodes,
  		    i, len;

  		for (i = 0, len = codes.zoomIn.length; i < len; i++) {
  			keys[codes.zoomIn[i]] = zoomDelta;
  		}
  		for (i = 0, len = codes.zoomOut.length; i < len; i++) {
  			keys[codes.zoomOut[i]] = -zoomDelta;
  		}
  	},

  	_addHooks: function () {
  		on(document, 'keydown', this._onKeyDown, this);
  	},

  	_removeHooks: function () {
  		off(document, 'keydown', this._onKeyDown, this);
  	},

  	_onKeyDown: function (e) {
  		if (e.altKey || e.ctrlKey || e.metaKey) { return; }

  		var key = e.keyCode,
  		    map = this._map,
  		    offset;

  		if (key in this._panKeys) {
  			if (!map._panAnim || !map._panAnim._inProgress) {
  				offset = this._panKeys[key];
  				if (e.shiftKey) {
  					offset = toPoint(offset).multiplyBy(3);
  				}

  				map.panBy(offset);

  				if (map.options.maxBounds) {
  					map.panInsideBounds(map.options.maxBounds);
  				}
  			}
  		} else if (key in this._zoomKeys) {
  			map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);

  		} else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
  			map.closePopup();

  		} else {
  			return;
  		}

  		stop(e);
  	}
  });

  // @section Handlers
  // @section Handlers
  // @property keyboard: Handler
  // Keyboard navigation handler.
  Map.addInitHook('addHandler', 'keyboard', Keyboard);

  /*
   * L.Handler.ScrollWheelZoom is used by L.Map to enable mouse scroll wheel zoom on the map.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Mouse wheel options
  	// @option scrollWheelZoom: Boolean|String = true
  	// Whether the map can be zoomed by using the mouse wheel. If passed `'center'`,
  	// it will zoom to the center of the view regardless of where the mouse was.
  	scrollWheelZoom: true,

  	// @option wheelDebounceTime: Number = 40
  	// Limits the rate at which a wheel can fire (in milliseconds). By default
  	// user can't zoom via wheel more often than once per 40 ms.
  	wheelDebounceTime: 40,

  	// @option wheelPxPerZoomLevel: Number = 60
  	// How many scroll pixels (as reported by [L.DomEvent.getWheelDelta](#domevent-getwheeldelta))
  	// mean a change of one full zoom level. Smaller values will make wheel-zooming
  	// faster (and vice versa).
  	wheelPxPerZoomLevel: 60
  });

  var ScrollWheelZoom = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'wheel', this._onWheelScroll, this);

  		this._delta = 0;
  	},

  	removeHooks: function () {
  		off(this._map._container, 'wheel', this._onWheelScroll, this);
  	},

  	_onWheelScroll: function (e) {
  		var delta = getWheelDelta(e);

  		var debounce = this._map.options.wheelDebounceTime;

  		this._delta += delta;
  		this._lastMousePos = this._map.mouseEventToContainerPoint(e);

  		if (!this._startTime) {
  			this._startTime = +new Date();
  		}

  		var left = Math.max(debounce - (+new Date() - this._startTime), 0);

  		clearTimeout(this._timer);
  		this._timer = setTimeout(bind(this._performZoom, this), left);

  		stop(e);
  	},

  	_performZoom: function () {
  		var map = this._map,
  		    zoom = map.getZoom(),
  		    snap = this._map.options.zoomSnap || 0;

  		map._stop(); // stop panning and fly animations if any

  		// map the delta with a sigmoid function to -4..4 range leaning on -1..1
  		var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4),
  		    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
  		    d4 = snap ? Math.ceil(d3 / snap) * snap : d3,
  		    delta = map._limitZoom(zoom + (this._delta > 0 ? d4 : -d4)) - zoom;

  		this._delta = 0;
  		this._startTime = null;

  		if (!delta) { return; }

  		if (map.options.scrollWheelZoom === 'center') {
  			map.setZoom(zoom + delta);
  		} else {
  			map.setZoomAround(this._lastMousePos, zoom + delta);
  		}
  	}
  });

  // @section Handlers
  // @property scrollWheelZoom: Handler
  // Scroll wheel zoom handler.
  Map.addInitHook('addHandler', 'scrollWheelZoom', ScrollWheelZoom);

  /*
   * L.Map.Tap is used to enable mobile hacks like quick taps and long hold.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Touch interaction options
  	// @option tap: Boolean = true
  	// Enables mobile hacks for supporting instant taps (fixing 200ms click
  	// delay on iOS/Android) and touch holds (fired as `contextmenu` events).
  	tap: true,

  	// @option tapTolerance: Number = 15
  	// The max number of pixels a user can shift his finger during touch
  	// for it to be considered a valid tap.
  	tapTolerance: 15
  });

  var Tap = Handler.extend({
  	addHooks: function () {
  		on(this._map._container, 'touchstart', this._onDown, this);
  	},

  	removeHooks: function () {
  		off(this._map._container, 'touchstart', this._onDown, this);
  	},

  	_onDown: function (e) {
  		if (!e.touches) { return; }

  		preventDefault(e);

  		this._fireClick = true;

  		// don't simulate click or track longpress if more than 1 touch
  		if (e.touches.length > 1) {
  			this._fireClick = false;
  			clearTimeout(this._holdTimeout);
  			return;
  		}

  		var first = e.touches[0],
  		    el = first.target;

  		this._startPos = this._newPos = new Point(first.clientX, first.clientY);

  		// if touching a link, highlight it
  		if (el.tagName && el.tagName.toLowerCase() === 'a') {
  			addClass(el, 'leaflet-active');
  		}

  		// simulate long hold but setting a timeout
  		this._holdTimeout = setTimeout(bind(function () {
  			if (this._isTapValid()) {
  				this._fireClick = false;
  				this._onUp();
  				this._simulateEvent('contextmenu', first);
  			}
  		}, this), 1000);

  		this._simulateEvent('mousedown', first);

  		on(document, {
  			touchmove: this._onMove,
  			touchend: this._onUp
  		}, this);
  	},

  	_onUp: function (e) {
  		clearTimeout(this._holdTimeout);

  		off(document, {
  			touchmove: this._onMove,
  			touchend: this._onUp
  		}, this);

  		if (this._fireClick && e && e.changedTouches) {

  			var first = e.changedTouches[0],
  			    el = first.target;

  			if (el && el.tagName && el.tagName.toLowerCase() === 'a') {
  				removeClass(el, 'leaflet-active');
  			}

  			this._simulateEvent('mouseup', first);

  			// simulate click if the touch didn't move too much
  			if (this._isTapValid()) {
  				this._simulateEvent('click', first);
  			}
  		}
  	},

  	_isTapValid: function () {
  		return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
  	},

  	_onMove: function (e) {
  		var first = e.touches[0];
  		this._newPos = new Point(first.clientX, first.clientY);
  		this._simulateEvent('mousemove', first);
  	},

  	_simulateEvent: function (type, e) {
  		var simulatedEvent = document.createEvent('MouseEvents');

  		simulatedEvent._simulated = true;
  		e.target._simulatedClick = true;

  		simulatedEvent.initMouseEvent(
  		        type, true, true, window, 1,
  		        e.screenX, e.screenY,
  		        e.clientX, e.clientY,
  		        false, false, false, false, 0, null);

  		e.target.dispatchEvent(simulatedEvent);
  	}
  });

  // @section Handlers
  // @property tap: Handler
  // Mobile touch hacks (quick tap and touch hold) handler.
  if (touch && (!pointer || safari)) {
  	Map.addInitHook('addHandler', 'tap', Tap);
  }

  /*
   * L.Handler.TouchZoom is used by L.Map to add pinch zoom on supported mobile browsers.
   */

  // @namespace Map
  // @section Interaction Options
  Map.mergeOptions({
  	// @section Touch interaction options
  	// @option touchZoom: Boolean|String = *
  	// Whether the map can be zoomed by touch-dragging with two fingers. If
  	// passed `'center'`, it will zoom to the center of the view regardless of
  	// where the touch events (fingers) were. Enabled for touch-capable web
  	// browsers except for old Androids.
  	touchZoom: touch && !android23,

  	// @option bounceAtZoomLimits: Boolean = true
  	// Set it to false if you don't want the map to zoom beyond min/max zoom
  	// and then bounce back when pinch-zooming.
  	bounceAtZoomLimits: true
  });

  var TouchZoom = Handler.extend({
  	addHooks: function () {
  		addClass(this._map._container, 'leaflet-touch-zoom');
  		on(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	removeHooks: function () {
  		removeClass(this._map._container, 'leaflet-touch-zoom');
  		off(this._map._container, 'touchstart', this._onTouchStart, this);
  	},

  	_onTouchStart: function (e) {
  		var map = this._map;
  		if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }

  		var p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]);

  		this._centerPoint = map.getSize()._divideBy(2);
  		this._startLatLng = map.containerPointToLatLng(this._centerPoint);
  		if (map.options.touchZoom !== 'center') {
  			this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
  		}

  		this._startDist = p1.distanceTo(p2);
  		this._startZoom = map.getZoom();

  		this._moved = false;
  		this._zooming = true;

  		map._stop();

  		on(document, 'touchmove', this._onTouchMove, this);
  		on(document, 'touchend', this._onTouchEnd, this);

  		preventDefault(e);
  	},

  	_onTouchMove: function (e) {
  		if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

  		var map = this._map,
  		    p1 = map.mouseEventToContainerPoint(e.touches[0]),
  		    p2 = map.mouseEventToContainerPoint(e.touches[1]),
  		    scale = p1.distanceTo(p2) / this._startDist;

  		this._zoom = map.getScaleZoom(scale, this._startZoom);

  		if (!map.options.bounceAtZoomLimits && (
  			(this._zoom < map.getMinZoom() && scale < 1) ||
  			(this._zoom > map.getMaxZoom() && scale > 1))) {
  			this._zoom = map._limitZoom(this._zoom);
  		}

  		if (map.options.touchZoom === 'center') {
  			this._center = this._startLatLng;
  			if (scale === 1) { return; }
  		} else {
  			// Get delta from pinch to center, so centerLatLng is delta applied to initial pinchLatLng
  			var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
  			if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
  			this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
  		}

  		if (!this._moved) {
  			map._moveStart(true, false);
  			this._moved = true;
  		}

  		cancelAnimFrame(this._animRequest);

  		var moveFn = bind(map._move, map, this._center, this._zoom, {pinch: true, round: false});
  		this._animRequest = requestAnimFrame(moveFn, this, true);

  		preventDefault(e);
  	},

  	_onTouchEnd: function () {
  		if (!this._moved || !this._zooming) {
  			this._zooming = false;
  			return;
  		}

  		this._zooming = false;
  		cancelAnimFrame(this._animRequest);

  		off(document, 'touchmove', this._onTouchMove, this);
  		off(document, 'touchend', this._onTouchEnd, this);

  		// Pinch updates GridLayers' levels only when zoomSnap is off, so zoomSnap becomes noUpdate.
  		if (this._map.options.zoomAnimation) {
  			this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
  		} else {
  			this._map._resetView(this._center, this._map._limitZoom(this._zoom));
  		}
  	}
  });

  // @section Handlers
  // @property touchZoom: Handler
  // Touch zoom handler.
  Map.addInitHook('addHandler', 'touchZoom', TouchZoom);

  Map.BoxZoom = BoxZoom;
  Map.DoubleClickZoom = DoubleClickZoom;
  Map.Drag = Drag;
  Map.Keyboard = Keyboard;
  Map.ScrollWheelZoom = ScrollWheelZoom;
  Map.Tap = Tap;
  Map.TouchZoom = TouchZoom;

  exports.version = version;
  exports.Control = Control;
  exports.control = control;
  exports.Browser = Browser;
  exports.Evented = Evented;
  exports.Mixin = Mixin;
  exports.Util = Util;
  exports.Class = Class;
  exports.Handler = Handler;
  exports.extend = extend;
  exports.bind = bind;
  exports.stamp = stamp;
  exports.setOptions = setOptions;
  exports.DomEvent = DomEvent;
  exports.DomUtil = DomUtil;
  exports.PosAnimation = PosAnimation;
  exports.Draggable = Draggable;
  exports.LineUtil = LineUtil;
  exports.PolyUtil = PolyUtil;
  exports.Point = Point;
  exports.point = toPoint;
  exports.Bounds = Bounds;
  exports.bounds = toBounds;
  exports.Transformation = Transformation;
  exports.transformation = toTransformation;
  exports.Projection = index;
  exports.LatLng = LatLng;
  exports.latLng = toLatLng;
  exports.LatLngBounds = LatLngBounds;
  exports.latLngBounds = toLatLngBounds;
  exports.CRS = CRS;
  exports.GeoJSON = GeoJSON;
  exports.geoJSON = geoJSON;
  exports.geoJson = geoJson;
  exports.Layer = Layer;
  exports.LayerGroup = LayerGroup;
  exports.layerGroup = layerGroup;
  exports.FeatureGroup = FeatureGroup;
  exports.featureGroup = featureGroup;
  exports.ImageOverlay = ImageOverlay;
  exports.imageOverlay = imageOverlay;
  exports.VideoOverlay = VideoOverlay;
  exports.videoOverlay = videoOverlay;
  exports.SVGOverlay = SVGOverlay;
  exports.svgOverlay = svgOverlay;
  exports.DivOverlay = DivOverlay;
  exports.Popup = Popup;
  exports.popup = popup;
  exports.Tooltip = Tooltip;
  exports.tooltip = tooltip;
  exports.Icon = Icon;
  exports.icon = icon;
  exports.DivIcon = DivIcon;
  exports.divIcon = divIcon;
  exports.Marker = Marker;
  exports.marker = marker;
  exports.TileLayer = TileLayer;
  exports.tileLayer = tileLayer;
  exports.GridLayer = GridLayer;
  exports.gridLayer = gridLayer;
  exports.SVG = SVG;
  exports.svg = svg$1;
  exports.Renderer = Renderer;
  exports.Canvas = Canvas;
  exports.canvas = canvas$1;
  exports.Path = Path;
  exports.CircleMarker = CircleMarker;
  exports.circleMarker = circleMarker;
  exports.Circle = Circle;
  exports.circle = circle;
  exports.Polyline = Polyline;
  exports.polyline = polyline;
  exports.Polygon = Polygon;
  exports.polygon = polygon;
  exports.Rectangle = Rectangle;
  exports.rectangle = rectangle;
  exports.Map = Map;
  exports.map = createMap;

  var oldL = window.L;
  exports.noConflict = function() {
  	window.L = oldL;
  	return this;
  }

  // Always export us to window global (see #2364)
  window.L = exports;

})));
//# sourceMappingURL=leaflet-src.js.map


/***/ }),

/***/ 623:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_cjs_js_leaflet_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7984);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_leaflet_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_leaflet_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 5301:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_leaflet_basemaps_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5405);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_leaflet_basemaps_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_leaflet_basemaps_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 9407:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_leaflet_search_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5706);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_leaflet_search_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_leaflet_search_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 4490:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_leaflet_coordinates_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7345);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_leaflet_coordinates_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_leaflet_coordinates_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 1743:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_leaflet_draw_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(567);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_leaflet_draw_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_leaflet_draw_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 7654:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3379);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5426);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__/* .default */ .Z, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_1__/* .default.locals */ .Z.locals || {});

/***/ }),

/***/ 3379:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 9838:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Config = void 0;
const http_1 = __webpack_require__(488);
class Config {
    constructor() {
        this.username = "unknown";
        this.skin = "dark";
        this.errors_visible = true;
        //   
    }
    // implementation for this
    load_setting_sync() {
        // let webix_calback = function(data: any){
        //     try {
        //         // парсим входящие данные
        //         let oJson = JSON.parse(data);
        //         this.skin = oJson.data.skin;
        //         this.errors_visible = oJson.data.errors_visible;
        //         this.username = oJson.data.username;
        //         this.lastname = oJson.data.lastname;
        //         this.firstname = oJson.data.firstname;
        //         this.groups = oJson.data.groups;
        //         this.last_login = oJson.data.last_login;
        //     } catch (error) {
        //         webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
        //     }
        // }
        // webix.ajax().sync().get(
        //     full_url("user.settings"),
        //     webix_calback.bind(this)
        // );
        let set_attrs = function (data) {
            this.skin = data.data.skin;
            this.errors_visible = data.data.errors_visible;
            this.username = data.data.username;
            this.lastname = data.data.lastname;
            this.firstname = data.data.firstname;
            this.groups = data.data.groups;
            this.last_login = data.data.last_login;
        };
        http_1.Requests.get_sync(http_1.full_url("user.settings"), {}, set_attrs.bind(this));
    }
    // load_settings
    load_setting() {
        let promise = webix.ajax().get(http_1.full_url("user.settings"), function (data) {
            try {
                // парсим входящие данные
                let oJson = data.json();
                this.skin = oJson.data.skin;
                this.errors_visible = oJson.data.errors_visible;
            }
            catch (error) {
                webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
            }
        });
        // catch
        promise.catch(function (err) {
            try {
                let oJson = JSON.parse(err.responseText);
                if (oJson && oJson.message) {
                    webix.message(`Ошибка загрузки настроек пользователя: ${oJson.message}`, "error", 5000);
                }
            }
            catch (error) {
                webix.message(`Ошибка загрузки настроек пользователя: ${error}`, "error", 5000);
            }
        });
    }
    // savesettings
    save_settings(skin, errors_visible) {
        http_1.Requests.post_json(http_1.full_url("user.settings"), { 'skin': skin, 'errors_visible': errors_visible }, function (data) {
            let url = window.location.href + (!/nocache/.test(window.location.search) ? (window.location.search ? "&nocache=1" : "?nocache=1") : '');
            // reload current page
            window.location.href = url;
        });
    }
    // save queries
    save_queries(queries) {
        http_1.Requests.post_json(http_1.full_url("user.queries"), { 'queries': queries });
    }
    // load script
    dyn_load_css(filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}
exports.Config = Config;


/***/ }),

/***/ 7940:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.main_menu = exports.menu_button = void 0;
const windows_1 = __webpack_require__(8390);
function menu_button(CONFIG) {
    return {
        container: "menu",
        css: CONFIG.skin,
        cols: [
            {
                view: "button",
                type: "htmlbutton",
                tooltip: "Показать/скрыть меню",
                width: 38,
                label: "<span class='fas fa-bars'/>",
                click: function () {
                    if ($$("menu").config.hidden)
                        $$("menu").show();
                    else
                        $$("menu").hide();
                }
            }
        ]
    };
}
exports.menu_button = menu_button;
function main_menu(CONFIG) {
    return {
        view: "sidemenu",
        id: "menu",
        width: 250,
        zIndex: 5001,
        css: "css_sidemenu",
        position: "left",
        state: function (state) {
            var toolbarHeight = $$("toolbar") ? $$("toolbar").$height : 45;
            state.top = toolbarHeight;
            state.height -= toolbarHeight;
        },
        body: {
            rows: [
                { height: 5 },
                {
                    view: "list",
                    borderless: true,
                    scroll: false,
                    type: {
                        height: 28,
                    },
                    template: "<span class='css_icon fas #icon# fa-lg'/> <font size='3'> #value#</font>",
                    data: [
                        { id: "home", value: "Главная страница", icon: "fa-home" },
                        { id: "admin", value: "Админка", icon: "fa-cogs" },
                        { id: "settings", value: "Настройки", icon: "fa-user-cog" },
                        { id: "dtsearch", value: "dtSearch", icon: "fa-search" },
                        { id: "map", value: "Карта", icon: "fa-map" },
                    ],
                    on: {
                        onItemClick: function (id) {
                            switch (id) {
                                case "home": {
                                    webix.send("/", null, "GET", "");
                                    break;
                                }
                                case "admin": {
                                    webix.send("/admin/", null, "GET", "");
                                    break;
                                }
                                case "settings": {
                                    $$("menu").hide();
                                    if (!$$('windowUserConfig'))
                                        windows_1.showWindowUserConfig(CONFIG);
                                    break;
                                }
                                case "dtsearch": {
                                    webix.send("/dtsearch/", null, "GET", "");
                                    break;
                                }
                                case "map": {
                                    webix.send("/map/", null, "GET", "");
                                    break;
                                }
                            }
                        }
                    }
                },
            ]
        }
    };
}
exports.main_menu = main_menu;


/***/ }),

/***/ 6500:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.set_user_label = void 0;
function set_user_label(label, CONFIG) {
    label.setValue("<span class='fas fa-user header_label smoked'> " + ((CONFIG.firstname && CONFIG.lastname) ? CONFIG.firstname + " " + CONFIG.lastname : CONFIG.username) + "</span>");
}
exports.set_user_label = set_user_label;


/***/ }),

/***/ 488:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.full_url = exports.base_url = exports.Requests = void 0;
var success_handler = function (data) {
    try {
        var Json = data.json();
    }
    catch (err) {
        webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        return;
    }
    if (Json && Json.status && Json.status == "success")
        return Json.data;
    else
        webix.message("Сервер вернул ответ неустановленного вида", "error", 5000);
};
var success_xhr_handler = function (data) {
    try {
        var Json = JSON.parse(data);
    }
    catch (err) {
        webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        return;
    }
    if (Json && Json.status && Json.status == "success")
        return Json;
    else
        webix.message("Сервер вернул ответ неустановленного вида", "error", 5000);
};
var error_xhr_handler = function (error) {
    if (error instanceof Error) {
        console.log(error.message);
        webix.message(`Ошибка: ${error.message}`);
        return;
    }
    else if (error.status == 417) {
        try {
            let oJson = JSON.parse(error.responseText);
            if (oJson && oJson.message)
                webix.message(`Сервер вернул ошибку: <br>${oJson.message}`, "error", 5000);
        }
        catch (err) {
            webix.message(`Ошибка при попытке декодировать ответ сервера: <br>${err}`, "error", 5000);
        }
    }
    else {
        webix.message(`Ошибка сервера: ${error.status} (${error.statusText})`);
    }
};
exports.Requests = {
    get(url, params, success_callback, error_callback) {
        webix.ajax().get(url, params).then(function (data) {
            var result = success_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        }).catch(function (error) {
            error_xhr_handler(error);
            if (error_callback !== undefined)
                error_callback();
        });
    },
    get_sync(url, params, success_callback, error_callback) {
        webix.ajax().sync().get(url, params, function (data) {
            var result = success_xhr_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        });
    },
    post(url, params, success_callback, error_callback) {
        webix.ajax().post(url, params).then(function (data) {
            var result = success_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        }).catch(function (error) {
            error_xhr_handler(error);
            if (error_callback !== undefined)
                error_callback();
        });
    },
    post_json(url, params, success_callback, error_callback) {
        webix.ajax().headers({ "Content-type": "application/json" }).post(url, params).then(function (data) {
            var result = success_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        }).catch(function (error) {
            error_xhr_handler(error);
            if (error_callback !== undefined)
                error_callback();
        });
    },
    put(url, params, success_callback, error_callback) {
        webix.ajax().headers({ "Content-type": "application/json" }).put(url, params).then(function (data) {
            var result = success_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        }).catch(function (error) {
            error_xhr_handler(error);
            if (error_callback !== undefined)
                error_callback();
        });
    },
    delete(url, params, success_callback, error_callback) {
        webix.ajax().headers({ "Content-type": "application/json" }).del(url, params).then(function (data) {
            var result = success_handler(data);
            if (success_callback !== undefined)
                success_callback(result);
        }).catch(function (error) {
            error_xhr_handler(error);
            if (error_callback !== undefined)
                error_callback();
        });
    }
};
function base_url() {
    let site = document.location;
    return `${site.protocol}//${site.host}`;
}
exports.base_url = base_url;
function full_url(sub_url) {
    if (sub_url.substring(0, 1) != '/')
        return `${base_url()}/${sub_url}`;
    return `${base_url()}${sub_url}`;
}
exports.full_url = full_url;


/***/ }),

/***/ 1918:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.set_user_label = exports.menu_button = exports.main_menu = exports.CONFIG = void 0;
const controls_1 = __webpack_require__(7940);
Object.defineProperty(exports, "main_menu", ({ enumerable: true, get: function () { return controls_1.main_menu; } }));
Object.defineProperty(exports, "menu_button", ({ enumerable: true, get: function () { return controls_1.menu_button; } }));
const func_1 = __webpack_require__(6500);
Object.defineProperty(exports, "set_user_label", ({ enumerable: true, get: function () { return func_1.set_user_label; } }));
const config_1 = __webpack_require__(9838);
//загружаем настройки
var CONFIG = new config_1.Config();
exports.CONFIG = CONFIG;
CONFIG.load_setting_sync();
// динамически подгружаем скин
let user_skin = CONFIG.skin == 'dark' ? "compact" : CONFIG.skin;
CONFIG.dyn_load_css("/static/cdn/webix/6.4.0/skins/" + user_skin + ".min.css");


/***/ }),

/***/ 8390:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showWindowUserConfig = void 0;
const http_1 = __webpack_require__(488);
function showWindowUserConfig(CONFIG) {
    //отрисовываем window
    webix.ui({
        view: "window",
        css: CONFIG.skin,
        id: "windowUserConfig",
        width: 750,
        height: 600,
        position: "center",
        move: true,
        modal: true,
        zIndex: 10000,
        head: {
            view: "toolbar",
            cols: [
                {
                    view: "label",
                    label: "<i class='label_1 fas fa-cog fa-spin fa-lg' style='margin-top: 6px;margin-left: 6px;'></i><font class='label_1'></font>"
                },
                {},
                {
                    view: "button",
                    type: "htmlbutton",
                    width: 120,
                    label: "<span class='fa fa-check'> Сохранить</span>",
                    click: function () {
                        // сохраняем запросы
                        CONFIG.save_queries(webix.$$("datatableQueries").serialize());
                        // сохраняем настройки
                        CONFIG.save_settings(webix.$$("selectSkin").getValue(), Boolean(webix.$$("checkErrors").getValue()));
                    }
                },
                {
                    view: "button",
                    type: "htmlbutton",
                    label: '<span class="fa fa-times"> Закрыть</span>',
                    width: 100,
                    align: "right",
                    css: "bt_1",
                    click: "$$('windowUserConfig').close();"
                }
            ]
        },
        body: {
            cols: [
                {
                    view: "sidebar",
                    width: 140,
                    height: 500,
                    data: [
                        { id: "itemLook", value: " <i class='fas fa-user-cog' style='margin-left:10px;'></i> Внешний вид" },
                        { id: "itemQueries", value: " <i class='fas fa-tasks' style='margin-left:10px;'></i> Запросы" },
                    ],
                    on: {
                        onAfterSelect: function (id) {
                            switch (id) {
                                case "itemLook": {
                                    $$('formLook').show();
                                    $$('datatableQueries').hide();
                                    break;
                                }
                                case "itemQueries": {
                                    $$('datatableQueries').show();
                                    $$('formLook').hide();
                                    break;
                                }
                            }
                        }
                    }
                },
                {
                    rows: [
                        // lookform
                        {
                            view: "form",
                            id: "formLook",
                            width: 490,
                            elements: [
                                // skin
                                {
                                    view: "select",
                                    id: "selectSkin",
                                    label: "Тема",
                                    value: CONFIG.skin,
                                    width: 315,
                                    labelWidth: 160,
                                    options: [
                                        { id: "compact", value: "Синяя" },
                                        { id: "dark", value: "Темная" },
                                        { id: "flat", value: "Голубая" },
                                        { id: "contrast", value: "Контрастная" },
                                        { id: "material", value: "Современная" },
                                        { id: "mini", value: "Минималистичная" },
                                    ], labelAlign: "left"
                                },
                                // errors
                                {
                                    view: "checkbox",
                                    id: "checkErrors",
                                    label: "Отображать ошибки",
                                    width: 315,
                                    labelWidth: 160,
                                    value: Number(CONFIG.errors_visible),
                                },
                            ]
                        },
                        // datatable
                        {
                            view: "datatable",
                            id: 'datatableQueries',
                            width: 490,
                            hidden: true,
                            scroll: 'y',
                            select: "row",
                            checkboxRefresh: true,
                            type: {
                                checkbox(obj, common, value) {
                                    return `<div class="checkbox webix_inp_checkbox_border webix_el_group webix_checkbox_${value == true ? 1 : 0}"><button class="webix_custom_checkbox"></button></div>`;
                                }
                            },
                            columns: [
                                { id: "active", header: { content: "masterCheckbox", contentId: "active" }, template: "{common.checkbox()}", width: 40 },
                                { id: "typename", sort: "string", header: ["Тип", { content: "textFilter" }], width: 200 },
                                { id: "name", sort: "string", header: ["Запрос", { content: "textFilter" }], width: 250 },
                            ],
                            url: http_1.full_url("user.queries"),
                            onClick: {
                                checkbox: function (e, id) {
                                    const row = this.getItem(id.row);
                                    this.updateItem(id.row, { [id.column]: row[id.column] ? false : true });
                                }
                            },
                            on: {
                                onHeaderClick: function (header, event, target) {
                                    if (header.column == "active") {
                                        let control = this.getHeaderContent("active");
                                        let value = control.isChecked();
                                        this.eachRow(function (row) {
                                            this.updateItem(row, { [header.column]: value });
                                        });
                                    }
                                },
                                onBeforeLoad: function () {
                                    this.showOverlay("<i class='fas fa-cog fa-spin fa-4x'></i><br><br><font size='2'><b>Загрузка данных...</b></font>");
                                },
                                onAfterLoad: function () {
                                    if (!this.count())
                                        this.showOverlay("<i class='fas fa-ghost fa-4x'></i><br><br><font size='2'><b>Нет данных</b></font>");
                                    else
                                        this.hideOverlay();
                                },
                                onLoadError: function (text, xml, xhr) {
                                    try {
                                        let oJson = JSON.parse(text);
                                        if (oJson && oJson.error) {
                                            this.showOverlay("<i class='fas fa-skull-crossbones fa-4x'></i><br><br><font size='2'><b>Сервер вернул ошибку: <br>" + oJson.error + "</b></font>");
                                        }
                                    }
                                    catch (e) {
                                        this.showOverlay("<i class='fas fa-skull-crossbones fa-4x'></i><br><br><font size='2'><b>Ошибка при попытке декодировать ответ сервера: <br>" + e + "</b></font>");
                                    }
                                }
                            }
                        },
                    ]
                }
            ]
        }
    }).show();
}
exports.showWindowUserConfig = showWindowUserConfig;
;


/***/ }),

/***/ 5926:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.init_draw = exports.set_popup_content = void 0;
const L = __webpack_require__(5243);
function set_popup_content(aFeature) {
    var popup = aFeature.getPopup();
    var feature = aFeature.feature = aFeature.feature || {};
    feature.type = "Feature";
    feature.properties = feature.properties || {};
    var content = document.createElement("textarea");
    content.style.minWidth = '250px';
    content.addEventListener("keyup", function () {
        feature.properties.title = content.value;
        aFeature.options.title = content.value;
    });
    aFeature.on("popupopen", function () {
        if (feature.properties.title)
            content.value = feature.properties.title;
        popup.setContent(content);
        content.focus();
    });
}
exports.set_popup_content = set_popup_content;
function init_draw(MAP_CONFIG) {
    var draw_options = {
        position: 'topright',
        draw: {
            polyline: {
                metric: true,
                shapeOptions: {
                    color: '#f357a1',
                    weight: 2
                },
            },
            polygon: {
                metric: ['km', 'm'],
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                    color: '#cb59e2',
                    weight: 2,
                }
            },
            //выключаем круговые полигоны
            circle: false,
            circlemarker: {
                radius: 8,
                color: '#0000FF',
                weight: 2,
            },
            rectangle: {
                // единицы измерения
                metric: ['km', 'm'],
                shapeOptions: {
                    clickable: false,
                    weight: 2
                }
            },
            marker: false,
        },
        edit: {
            featureGroup: MAP_CONFIG.editable_layers,
            remove: true
        }
    };
    // полигоны   
    L.drawLocal.draw.toolbar.buttons.polyline = 'Линейный полигон';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Произвольный полигон';
    L.drawLocal.draw.toolbar.buttons.rectangle = 'Прямоугольный полигон';
    L.drawLocal.draw.toolbar.buttons.circle = 'Круглый полигон';
    L.drawLocal.draw.toolbar.buttons.circlemarker = 'Маркер';
    L.drawLocal.draw.toolbar.buttons.marker = 'Маркер';
    L.drawLocal.draw.toolbar.actions.text = "Отмена";
    L.drawLocal.draw.toolbar.finish.text = "Завершить";
    L.drawLocal.draw.toolbar.undo.text = "Удалить последнюю точку";
    //редакторы
    L.drawLocal.edit.toolbar.buttons.remove = 'Удалить все';
    L.drawLocal.edit.toolbar.buttons.removeDisabled = 'Нет элементов для удаления';
    L.drawLocal.edit.toolbar.buttons.edit = 'Редактировать';
    L.drawLocal.edit.toolbar.buttons.editDisabled = 'Нет элементов для редактриования';
    L.drawLocal.edit.toolbar.actions.save.text = "Сохранить";
    L.drawLocal.edit.toolbar.actions.cancel.text = "Отмена";
    L.drawLocal.edit.toolbar.actions.clearAll.text = "Очистить все";
    //handlers
    L.drawLocal.draw.handlers.marker.tooltip.start = "Нажмите на карту, чтобы поместить маркер";
    L.drawLocal.draw.handlers.polygon.tooltip.start = "Нажмите, чтобы начать рисовать";
    L.drawLocal.draw.handlers.polygon.tooltip.cont = "Нажмите, чтобы продолжить рисовать";
    L.drawLocal.draw.handlers.polygon.tooltip.end = "Нажмите на первую точку, чтобы завершить рисование";
    L.drawLocal.draw.handlers.polyline.tooltip.start = "Нажмите, чтобы начать рисовать линию";
    L.drawLocal.draw.handlers.polyline.tooltip.cont = "Нажмите, чтобы продолжить рисовать линию";
    L.drawLocal.draw.handlers.polyline.tooltip.end = "Нажмите на последнюю точку, чтобы завершить рисование";
    L.drawLocal.draw.handlers.polyline.error = "<strong>Ошибка</strong> Узлы фигур не могут пересекаться";
    L.drawLocal.draw.handlers.rectangle.tooltip.start = "Нажмите и двигайте мышь, чтобы нарисовать прямоугольник";
    L.drawLocal.edit.handlers.edit.tooltip.text = "Перетаскивай мышью для редактирования";
    L.drawLocal.edit.handlers.edit.tooltip.subtext = "Нажми Отмена, чтобы вернуть всё как было";
    L.drawLocal.edit.handlers.remove.tooltip.text = "Нажми на полигон для удаления";
    function onDrawFeatureAdd(e) {
        var type = e.layerType, layer = e.layer;
        layer.properties = {};
        layer.options.title = '';
        layer.bindPopup('', { minWidth: 250 });
        set_popup_content(layer);
        MAP_CONFIG.editable_layers.addLayer(layer);
        layer.openPopup();
    }
    ;
    var drawControl = new L.Control.Draw(draw_options);
    MAP_CONFIG.map.addControl(drawControl);
    MAP_CONFIG.map.on(L.Draw.Event.CREATED, onDrawFeatureAdd);
}
exports.init_draw = init_draw;
;


/***/ }),

/***/ 2422:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Geo = exports.UserLayers = void 0;
const http_1 = __webpack_require__(488);
exports.UserLayers = {
    load_all_layers(success_callback, error_callback) {
        http_1.Requests.get('/map/user.data', {}, success_callback.bind(this));
    },
    load_layer(layer_id, success_callback, error_callback) {
        http_1.Requests.post('/map/user.data', { id: layer_id }, success_callback.bind(this), error_callback.bind(this));
    },
    save_layer(layer_name, layer_list, layer_data, success_callback, error_callback) {
        let confirm_callback = () => { http_1.Requests.put('/map/user.data', { layername: layer_name, data: layer_data }, success_callback); };
        let searched_index = layer_list.map(item => item.value).indexOf(layer_name);
        if (searched_index >= 0)
            webix.confirm({ title: "Подтверждение", ok: "Да", cancel: "Нет", text: "Слой с таким названием уже существует, перезаписать?" }).then(confirm_callback).catch(error_callback);
        else
            confirm_callback();
    },
    delete_layer(layer_id, success_callback, error_callback) {
        let confirm_callback = () => { http_1.Requests.delete('/map/user.data', { id: layer_id }, success_callback, error_callback); };
        webix.confirm({ title: "Подтверждение", ok: "Да", cancel: "Нет", type: "confirm-warning", text: "Будет удален слой, продолжить?" }).then(confirm_callback).catch(error_callback);
    }
};
exports.Geo = {
    search_geoname(geo_object_name, success_callback, error_callback) {
        http_1.Requests.post_json('/map/geoname.search', { geoname: geo_object_name }, success_callback, error_callback);
    },
    search_coordinates_by_text(text_with_coordinates, success_callback, error_callback) {
        http_1.Requests.post_json('/map/coordinates.search', { coordinates: text_with_coordinates }, success_callback, error_callback);
    },
    search_coordinates_by_hash(coordinates_hash, success_callback, error_callback) {
        http_1.Requests.post_json('/map/coordinates.search', { coordinates_hash: coordinates_hash }, success_callback, error_callback);
    },
};


/***/ }),

/***/ 994:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.show_coordinates_window = exports.show_save_layer_window = void 0;
const service_1 = __webpack_require__(2422);
function show_save_layer_window(CONFIG, layer_list, currenat_layers, callback) {
    webix.ui({
        css: CONFIG.skin,
        view: "window",
        id: "windowSaveLayer",
        width: 650,
        position: "center",
        zIndex: 5000,
        move: true,
        head: {
            view: "toolbar", cols: [
                { view: "label", width: 150, label: "<i class='fas fa-database'></i> Сохранить слой" },
                {},
                { view: "button", type: "htmlbutton", label: '<span class="fa fa-times"></span>', width: 33, align: 'right', click: "$$('windowSaveLayer').close();" }
            ]
        },
        modal: true,
        body: {
            borderless: true,
            view: "form",
            id: "form_layer_save",
            elements: [
                { view: "text", id: "layer_text", name: "layer_text", label: "Название", width: 300, validate: "isNotEmpty", suggest: layer_list },
                {
                    view: "button", label: "Сохранить", type: "form",
                    click: function () {
                        if (!webix.$$("form_layer_save").validate()) {
                            webix.message("Корректно заполните форму", "error", 4000);
                            return;
                        }
                        let layer_name = webix.$$("layer_text").getValue();
                        service_1.UserLayers.save_layer(layer_name, layer_list, currenat_layers.toGeoJSON(), callback);
                        webix.$$('windowSaveLayer').close();
                    }
                }
            ]
        }
    }).show();
    webix.$$("layer_text").focus();
}
exports.show_save_layer_window = show_save_layer_window;
;
function show_coordinates_window(CONFIG, MAP_CONFIG, success_callback) {
    //отрисовываем window
    webix.ui({
        view: "window",
        id: "windowShowPoints",
        width: 650,
        css: CONFIG.skin,
        height: 410,
        position: "center",
        zIndex: 5000,
        move: true,
        head: {
            view: "toolbar", cols: [
                { view: "label", label: "<i class='fas fa-map-marker-alt fa-lg'></i><font class='label_1'>  Точки на карту </font>" },
                {},
                { view: "button", type: "htmlbutton", label: '<span class="fa fa-times"> Закрыть</span>', width: 100, align: 'right', css: "bt_1", click: "$$('windowShowPoints').close();" }
            ]
        },
        modal: true,
        body: {
            rows: [
                {
                    view: "textarea",
                    id: "pointsText",
                    placeholder: "<Введите текст с координатами>",
                    height: 300,
                    width: 650
                },
                {
                    view: "button", label: "Отобразить на карте", width: 200, align: "center",
                    click: function () {
                        if (success_callback !== undefined)
                            success_callback(webix.$$("pointsText").getValue());
                        webix.$$('windowShowPoints').close();
                    }
                }
            ]
        }
    }).show();
    webix.$$("pointsText").focus();
}
exports.show_coordinates_window = show_coordinates_window;
;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
__webpack_require__(623);
const index_1 = __webpack_require__(1918);
const windows_1 = __webpack_require__(994);
const draw_1 = __webpack_require__(5926);
const service_1 = __webpack_require__(2422);
const L = __webpack_require__(5243);
// export
__webpack_require__(9250);
// search
__webpack_require__(3864);
__webpack_require__(9407);
// draw
__webpack_require__(5373);
__webpack_require__(1743);
// graticule
__webpack_require__(752);
// basemaps
__webpack_require__(2079);
__webpack_require__(5301);
// coordinates
__webpack_require__(9651);
__webpack_require__(4490);
// style
__webpack_require__(7654);
// init base settings of WEBIX
webix.Date.startOnMonday = true;
webix.i18n.dateFormat = "%d.%m.%Y";
webix.i18n.fullDateFormat = "%d.%m.%Y %H:%i";
webix.i18n.setLocale("ru-RU");
var dateFormat = webix.Date.dateToStr("%d.%m.%Y %H:%i", false);
var dateFormatDownload = webix.Date.dateToStr("%d%m%Y_%H%i", false);
class MapPage {
    constructor(server_data) {
        //  public MAP_CONFIG: any
        this.MAP_CONFIG = {
            map: undefined,
            crs: L.CRS.EPSG3857,
            tiles: [],
            tilelayer: undefined,
            editable_layers: undefined,
            user_layers: [],
            info: undefined,
            current_mark: undefined,
            geoname: undefined,
            coordinates: undefined,
            basemaps: [],
        };
        this.MAP_CONFIG.geoname = server_data.geoname;
        this.MAP_CONFIG.coordinates_hash = server_data.coordinates_hash;
        this.MAP_CONFIG.tiles = server_data.tiles;
    }
    init() {
        // declare as globall
        window.closeInfoPanel = this.close_info_panel.bind(this);
        window.moveToPoint = this.move_to_point.bind(this);
        // main menu
        const main_menu = this.main_menu_view();
        // controls 
        const main_view = this.main_view();
        // set user to label
        index_1.set_user_label(webix.$$('labelUser'), index_1.CONFIG);
        // load_user_layers
        this.load_user_layers_list();
        // prepare tiles
        this.init_tiles();
        // init Map
        this.init_map();
        // init_basemaps
        this.init_basemaps();
        // init graticule
        this.init_graticule();
        // draw.js
        draw_1.init_draw(this.MAP_CONFIG);
        // coordinates
        this.init_coordinates();
        // search.js
        this.init_search();
        if (this.MAP_CONFIG.geoname)
            this.search_geo_object(this.MAP_CONFIG.geoname);
        if (this.MAP_CONFIG.coordinates_hash)
            this.search_coordinates(this.MAP_CONFIG.coordinates_hash, true);
    }
    button_start_spinning(view_index) {
        let button = webix.$$(view_index);
        button.define("label", "<i class='fas fa-spinner fa-spin'/>");
        button.refresh();
    }
    button_stop_spinning(view_index, icon_class_name) {
        let button = webix.$$(view_index);
        button.define("label", `<i class='fas ${icon_class_name}'/>`);
        button.refresh();
    }
    load_user_layers_list() {
        let success_callback = (data) => {
            let result_data = data !== null && data !== void 0 ? data : [];
            let select = webix.$$("select_layers");
            select.define("options", result_data);
            select.refresh();
            this.MAP_CONFIG.user_layers = result_data;
        };
        service_1.UserLayers.load_all_layers(success_callback.bind(this));
    }
    point_as_circle_marker(aFeature, latlng) {
        return L.circleMarker(latlng, { radius: 8, color: "#00F", weight: 2, });
    }
    feature_style(feature) {
        var _a;
        const styles = {
            'Polygon': { color: "#cb59e2", weight: 2 },
            'Point': { color: "#0000ff", weight: 2 },
            'LineString': { color: "#f357a1", weight: 2 }
        };
        return (_a = styles[feature.geometry.type]) !== null && _a !== void 0 ? _a : { color: "#cb59e2", weight: 2 };
    }
    on_each_feature_closure() {
        return function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.title) {
                layer.options.title = feature.properties.title;
                layer.bindPopup(feature.properties.title);
                draw_1.set_popup_content(layer);
                this.MAP_CONFIG.editable_layers.addLayer(layer);
            }
            else {
                layer.options.title = "";
                layer.bindPopup("");
                draw_1.set_popup_content(layer);
                this.MAP_CONFIG.editable_layers.addLayer(layer);
            }
        }.bind(this);
    }
    geojson_to_map(geo_json) {
        if (geo_json && geo_json.features) {
            let layer = L.geoJSON(geo_json.features, {
                onEachFeature: this.on_each_feature_closure(),
                style: this.feature_style,
                pointToLayer: this.point_as_circle_marker,
            }).addTo(this.MAP_CONFIG.map);
            if (geo_json.features.length > 1)
                this.MAP_CONFIG.map.fitBounds(layer.getBounds());
        }
    }
    download_map_as_image(caption, format, filename) {
        let download_options = {
            container: this.MAP_CONFIG.map._container,
            caption: {
                text: caption,
                font: '14px Arial',
                fillStyle: 'black',
                position: [10, 20]
            },
            // exclude: ['.leaflet-control-zoom', '.leaflet-control-attribution'],
            // formats: image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon, image/svg+xml, image/webp
            format: format,
            fileName: filename,
            afterRender: function (result) { return result; },
            afterExport: function (result) { return result; }
        };
        var promise = this.MAP_CONFIG.map.downloadExport(download_options);
        promise.then(function (result) {
            return result;
        });
    }
    move_to_point(aLat, aLon, aName) {
        if (this.MAP_CONFIG.current_mark != undefined)
            this.MAP_CONFIG.map.removeLayer(this.MAP_CONFIG.current_mark);
        this.MAP_CONFIG.map.flyTo([aLat, aLon], 8);
        this.MAP_CONFIG.current_mark = L.circleMarker([aLat, aLon], { radius: 8, color: "#00F", weight: 2, }).addTo(this.MAP_CONFIG.map);
        this.MAP_CONFIG.current_mark.bindPopup("<b>" + aName + "</b>").openPopup();
    }
    init_info_panel() {
        // search result panel
        this.MAP_CONFIG.info = L.control({ position: 'bottomright' });
        // redefine methods (вызов после обновления данных //config.info.update(text)
        this.MAP_CONFIG.info.update = function (text) {
            let result_panel = document.querySelector(".result_panel");
            if (!text)
                result_panel.style.visibility = "hidden";
            else {
                // this._div.innerHTML = text
                result_panel.innerHTML = text;
                result_panel.style.visibility = "visible";
            }
        };
        this.MAP_CONFIG.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'result_panel');
            return this._div;
        };
        this.MAP_CONFIG.info.addTo(this.MAP_CONFIG.map);
    }
    show_info_panel(geo_data) {
        if (!this.MAP_CONFIG.info)
            this.init_info_panel();
        let text = "<table height='100%' width='90%'><tr><td></td><td></td><td><a href='javascript:closeInfoPanel()'>Закрыть</a></td></tr>";
        for (var i in geo_data)
            text = `${text} <tr><td>${geo_data[i].obj}</td><td><a href='javascript:moveToPoint(${geo_data[i].lat}, ${geo_data[i].long}, "${geo_data[i].obj}<br>${geo_data[i].geoname}")'>${geo_data[i].geoname}</a></td><td>${geo_data[i].country}</td></tr>`;
        text = `${text} <tr><td></td><td></td><td><a href='javascript:closeInfoPanel()'>Закрыть</a></td></tr></table>`;
        this.MAP_CONFIG.info.update(text);
    }
    close_info_panel() {
        // remove marker
        if (this.MAP_CONFIG.current_mark)
            this.MAP_CONFIG.map.removeLayer(this.MAP_CONFIG.current_mark);
        // remove panel
        if (this.MAP_CONFIG.info) {
            this.MAP_CONFIG.map.removeControl(this.MAP_CONFIG.info);
            this.MAP_CONFIG.info = null;
        }
    }
    search_geo_object(geo_object_name) {
        if (!geo_object_name) {
            webix.message("Необходимо ввести название геообъекта", "info", 4000);
            return;
        }
        this.button_start_spinning('btnSearch');
        let success_callback = (data) => {
            this.show_info_panel(data);
            this.button_stop_spinning('btnSearch', 'fa-search');
        };
        let error_callback = () => {
            this.button_stop_spinning('btnSearch', 'fa-search');
        };
        service_1.Geo.search_geoname(geo_object_name, success_callback.bind(this), error_callback.bind(this));
    }
    search_coordinates(value, is_hash) {
        if (!is_hash && !value) {
            webix.message("Необходимо ввести текст с координатами", "info", 4000);
            return;
        }
        this.button_start_spinning('btnSearchCoordinates');
        let success_callback = (data) => {
            this.button_stop_spinning('btnSearchCoordinates', 'fa-map-marker-alt');
            if (Array.isArray(data) && data.length > 0) {
                let geoJsonLayer = L.geoJSON(data, { onEachFeature: this.on_each_feature_closure(),
                    style: this.feature_style,
                    pointToLayer: this.point_as_circle_marker,
                }).addTo(this.MAP_CONFIG.map);
                let bounds = geoJsonLayer.getBounds();
                if (data.length > 1)
                    this.MAP_CONFIG.map.fitBounds(bounds);
                else
                    this.MAP_CONFIG.map.setView([data[0]['geometry']['coordinates'][1], data[0]['geometry']['coordinates'][0]], 12);
            }
            else
                webix.message("Координат в тексте не обнаружено", "info", 5000);
        };
        let error_callback = () => {
            this.button_stop_spinning('btnSearchCoordinates', 'fa-map-marker-alt');
        };
        if (is_hash == true)
            service_1.Geo.search_coordinates_by_hash(value, success_callback.bind(this), error_callback.bind(this));
        else
            service_1.Geo.search_coordinates_by_text(value, success_callback.bind(this), error_callback.bind(this));
    }
    toolbar_view() {
        return {
            view: "toolbar",
            id: "toolbar",
            height: 35,
            css: 'width_100_percent z_max',
            cols: [
                { cols: [index_1.menu_button(index_1.CONFIG), {}], },
                { width: 30 },
                // markers to map
                { view: "button", id: "btnSearchCoordinates", type: "htmlbutton", label: "<i class='fas fa-map-marker-alt'/>", width: 30, tooltip: "Показать маркеры на карте", click: function (id, event) {
                        let callback = (data) => { this.search_coordinates(data, false); };
                        windows_1.show_coordinates_window(index_1.CONFIG, this.MAP_CONFIG, callback);
                    }.bind(this)
                },
                // save map as image
                { view: "button", type: "htmlbutton", label: "<i class='fas fa-image'/>", width: 30, tooltip: "Сохранить как изображение", click: function (id, event) {
                        // скрываем панель с результатами, иначе easyprint упадет
                        this.close_info_panel();
                        this.download_map_as_image(dateFormat(new Date()), "image/png", `Карта_${dateFormatDownload(new Date())}.png`);
                    }.bind(this)
                },
                { width: 30 },
                // search geonames
                { view: "text", id: "textSearch", width: 220, tooltip: "Поиск по геоименам объектов (Например: Эльбрус, Псков)", placeholder: "<Введите название>",
                    value: "", on: {
                        onEnter: function () {
                            this.search_geo_object(webix.$$("textSearch").getValue());
                        }.bind(this),
                    },
                },
                // run geoname search
                { view: "button", id: "btnSearch", type: "htmlbutton", label: "<i class='fas fa-search'/>", width: 30, tooltip: "Поиск", click: function (id, event) {
                        this.search_geo_object(webix.$$("textSearch").getValue());
                    }.bind(this),
                },
                { width: 30 },
                // user layers
                { view: "select", id: "select_layers", width: 180, tooltip: "Слои маркеров сохраненные в БД", options: [] },
                // load layer
                { view: "button", id: "btnLoad", type: "htmlbutton", label: "<i class='fas fa-upload'/>", width: 30, tooltip: "Загрузить слой маркеров из БД", click: function (id, event) {
                        let layer_id = Number(webix.$$("select_layers").getValue());
                        if (!layer_id) {
                            webix.message("Выберите слой для загрузки", "info", 4000);
                            return;
                        }
                        // start button spinner
                        this.button_start_spinning('btnLoad');
                        let success_callback = (data) => {
                            this.geojson_to_map(data);
                            this.button_stop_spinning('btnLoad', 'fa-upload');
                        };
                        let error_callback = () => { this.button_stop_spinning('btnLoad', 'fa-upload'); };
                        service_1.UserLayers.load_layer(layer_id, success_callback.bind(this), error_callback.bind(this));
                    }.bind(this)
                },
                // save layer
                { view: "button", id: "btnSave", type: "htmlbutton", label: "<i class='fas fa-download'/>", width: 30, tooltip: "Сохранить слой маркеров в БД", click: function (id, event) {
                        let success_callback = (data) => { this.load_user_layers_list(); };
                        windows_1.show_save_layer_window(index_1.CONFIG, this.MAP_CONFIG.user_layers, this.MAP_CONFIG.editable_layers, success_callback.bind(this));
                    }.bind(this)
                },
                // delete layer
                { view: "button", id: "btnDelete", type: "htmlbutton", label: "<i class='fas fa-times'/>", width: 30, tooltip: "Удалить слой маркеров из БД", click: function (id, event) {
                        let layer_id = Number(webix.$$("select_layers").getValue());
                        if (!layer_id) {
                            webix.message("Выберите слой для удаления", "info", 4000);
                            return;
                        }
                        // start button spinner
                        this.button_start_spinning('btnDelete');
                        let success_callback = (data) => {
                            // delete layer
                            let removeIndex = this.MAP_CONFIG.user_layers.map(item => item.id).indexOf(data.id);
                            ~removeIndex && this.MAP_CONFIG.user_layers.splice(removeIndex, 1);
                            // set select
                            let select = webix.$$("select_layers");
                            select.define("options", this.MAP_CONFIG.user_layers);
                            select.refresh();
                            // stop button spinner
                            this.button_stop_spinning('btnDelete', 'fa-times');
                        };
                        let error_callback = () => { this.button_stop_spinning('btnDelete', 'fa-times'); };
                        service_1.UserLayers.delete_layer(layer_id, success_callback.bind(this), error_callback.bind(this));
                    }.bind(this)
                },
                { width: 10 },
                // display username
                { view: "label", id: "labelUser", align: "right" },
            ],
        };
    }
    // map tempalte
    map_template_view() {
        return { view: "template", type: "clean", scroll: false, css: 'width_100_percent', template: "<div id='map' style='height: 100%; width: 100%'></div>" };
    }
    // main menu
    main_menu_view() {
        return webix.ui(index_1.main_menu(index_1.CONFIG));
    }
    // main view
    main_view() {
        var toolbar_main = this.toolbar_view();
        var map_template = this.map_template_view();
        return webix.ui({
            scroll: false,
            css: `${index_1.CONFIG.skin} width_100_percent`,
            rows: [toolbar_main, map_template]
        });
    }
    init_tiles() {
        let tiles = this.MAP_CONFIG.tiles;
        if (tiles && tiles[0].crs) {
            let crs = tiles[0].crs;
            this.MAP_CONFIG.crs = (crs == "EPSG3857") ? L.CRS.EPSG3857 : (crs == "EPSG3395") ? L.CRS.EPSG3395 : (crs == "EPSG4326") ? L.CRS.EPSG4326 : L.CRS.EPSG3857;
        }
        for (var i in tiles) {
            this.MAP_CONFIG.basemaps.push(L.tileLayer(tiles[i].url, {
                maxZoom: tiles[i].max_zoom,
                minZoom: tiles[i].min_zoom,
                label: tiles[i].name,
                attribution: tiles[i].name,
                crs: (tiles[i].crs == "EPSG3857") ? L.CRS.EPSG3857 : (tiles[i].crs == "EPSG3395") ? L.CRS.EPSG3395 : (tiles[i].crs == "EPSG4326") ? L.CRS.EPSG4326 : L.CRS.EPSG3857
            }));
        }
    }
    init_map() {
        this.MAP_CONFIG.map = new L.Map('map', {
            preferCanvas: true,
            downloadable: true,
            editable: true,
            center: new L.LatLng(57.8017, 28.2162),
            zoom: 12,
            crs: this.MAP_CONFIG.crs,
        });
        // click on map
        var popup = L.popup();
        let onMapClick = function (e) {
            popup
                .setLatLng(e.latlng)
                .setContent(e.latlng.toString())
                .openOn(this.MAP_CONFIG.map);
        };
        this.MAP_CONFIG.map.on('click', onMapClick.bind(this));
        // editable layer           
        this.MAP_CONFIG.editable_layers = new L.FeatureGroup();
        this.MAP_CONFIG.map.addLayer(this.MAP_CONFIG.editable_layers);
    }
    init_basemaps() {
        // init basemaps plugin
        this.MAP_CONFIG.map.addControl(L.control.basemaps({
            basemaps: this.MAP_CONFIG.basemaps,
            tileX: 0,
            tileY: 0,
            tileZ: 1 // tile zoom level
        }));
        // change map layer
        let onMapLayerChange = function (e) {
            let center = this.MAP_CONFIG.map.getCenter();
            this.MAP_CONFIG.tilelayer = e.layer;
            this.MAP_CONFIG.map.options.crs = e.options.crs;
            this.MAP_CONFIG.map.options.min_zoom = e.options.min_zoom;
            this.MAP_CONFIG.map.options.max_zoom = e.options.max_zoom;
            this.MAP_CONFIG.map.setView(center);
            this.MAP_CONFIG.map._resetView(this.MAP_CONFIG.map.getCenter(), this.MAP_CONFIG.map.getZoom(), true);
        };
        this.MAP_CONFIG.map.on('baselayerchange', onMapLayerChange.bind(this));
    }
    init_graticule() {
        //определяем координатную сетку
        L.latlngGraticule({
            showLabel: true,
            color: '#222',
            zoomInterval: [
                { start: 2, end: 3, interval: 30 },
                { start: 4, end: 4, interval: 10 },
                { start: 5, end: 7, interval: 5 },
                { start: 8, end: 18, interval: 1 }
            ]
        }).addTo(this.MAP_CONFIG.map);
    }
    init_coordinates() {
        L.control.coordinates({
            // position:"bootomright",
            decimals: 4,
            decimalSeperator: ".",
            labelTemplateLat: "Lat: {y}",
            labelTemplateLng: "Long: {x}",
            enableUserInput: false,
            useDMS: false,
            useLatLngOrder: true,
            //markerType: L.circlemarker,
            markerProps: {},
        }).addTo(this.MAP_CONFIG.map);
        L.control.coordinates({
            decimalSeperator: ".",
            labelTemplateLat: "Lat: {y}",
            labelTemplateLng: "Long: {x}",
            enableUserInput: false,
            useDMS: true,
            useLatLngOrder: true,
            markerProps: {},
        }).addTo(this.MAP_CONFIG.map);
    }
    init_search() {
        var searchControl = new L.Control.Search({
            layer: this.MAP_CONFIG.editable_layers,
            position: 'topright',
            marker: false,
            initial: false
        });
        searchControl.on('search:locationfound', function (e) {
            if (e.layer)
                e.layer.openPopup();
        }).on('search:collapsed', function (e) { });
        this.MAP_CONFIG.map.addControl(searchControl);
    }
}
// init SearchPage
const map_page = new MapPage(server_data);
// init
map_page.init();

})();

/******/ })()
;
//# sourceMappingURL=map.js.map