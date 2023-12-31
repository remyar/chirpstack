'use strict';

/**
 * Decode un float 16 a partir d'un int16
 * @param {*} binary 
 */
function decodeFloat16 (binary) {
    var exponent = (binary & 0x7C00) >> 10,
        fraction = binary & 0x03FF;
    return (binary >> 15 ? -1 : 1) * (
        exponent ?
        (
            exponent === 0x1F ?
            fraction ? NaN : Infinity :
            Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
        ) :
        6.103515625e-5 * (fraction / 0x400)
    );
};

/**
 * encode un double 64bits en un int16 (IEEE754)
 */
function encodeFloat16 (fval) {
    var floatView = new Float32Array(1);
    var int32View = new Int32Array(floatView.buffer);
        floatView[0] = fval;
        var fbits = int32View[0];
        var sign  = (fbits >> 16) & 0x8000;          // sign only
        var val   = ( fbits & 0x7fffffff ) + 0x1000; // rounded value
    
        if( val >= 0x47800000 ) {             // might be or become NaN/Inf
          if( ( fbits & 0x7fffffff ) >= 0x47800000 ) {
                                              // is or must become NaN/Inf
            if( val < 0x7f800000 ) {          // was value but too large
              return sign | 0x7c00;           // make it +/-Inf
            }
            return sign | 0x7c00 |            // remains +/-Inf or NaN
                ( fbits & 0x007fffff ) >> 13; // keep NaN (and Inf) bits
          }
          return sign | 0x7bff;               // unrounded not quite Inf
        }
        if( val >= 0x38800000 ) {             // remains normalized value
          return sign | val - 0x38000000 >> 13; // exp - 127 + 15
        }
        if( val < 0x33000000 )  {             // too small for subnormal
          return sign;                        // becomes +/-0
        }
        val = ( fbits & 0x7fffffff ) >> 23;   // tmp exp for subnormal calc
        return sign | ( ( fbits & 0x7fffff | 0x800000 ) // add subnormal bit
             + ( 0x800000 >>> val - 102 )     // round depending on cut off
             >> 126 - val );                  // div by 2^(1-(exp-127+15)) and >> 13 | exp=0
}


module.exports = {
    decodeFloat16: decodeFloat16,
    encodeFloat16: encodeFloat16
}