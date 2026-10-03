/**
 * Zstd shared loading and stream handling.
 *
 * Decompression is driven through the streaming API, which handles frames that
 * do not declare their decompressed size, concatenated frames and skippable
 * frames. Input is fed in small slices so that the amount of output can be
 * checked as it is produced, rather than after the whole input has expanded.
 *
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import { Zstd } from "@hpcc-js/wasm-zstd";
import OperationError from "../errors/OperationError.mjs";

// Ceiling on how much data we are prepared to regenerate, so that malformed or
// hostile input cannot exhaust memory.
const MAX_OUTPUT_SIZE = 512 * 1024 * 1024;

// How much compressed input is passed to the decoder at a time. A block header
// and a single RLE byte can regenerate a full 128KiB block, so this also bounds
// how far past MAX_OUTPUT_SIZE a single slice can take us (about 32MiB).
const INPUT_SLICE_SIZE = 1024;

/**
 * Returns a promise to the Zstd instance. The library only instantiates the
 * WASM module once, however many times this is called.
 *
 * @returns {Promise<Zstd>}
 */
export function zstdLoad() {
    return Zstd.load();
}

/**
 * Compresses data into a single Zstandard frame.
 *
 * @param {Zstd} zstd
 * @param {Uint8Array} data
 * @param {number} level
 * @returns {ArrayBuffer}
 */
export function compress(zstd, data, level) {
    let output;
    try {
        output = zstd.compress(data, level);
    } catch (err) {
        throw new OperationError(`Failed to compress: ${err.message}`);
    }
    return output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength);
}

/**
 * Decompresses a Zstandard stream, however many frames it holds and whether or
 * not those frames declare their decompressed size.
 *
 * @param {Zstd} zstd
 * @param {Uint8Array} data
 * @returns {ArrayBuffer}
 */
export function decompress(zstd, data) {
    const outputs = [];
    let totalSize = 0;

    zstd.resetDecompression();
    for (let offset = 0; offset < data.length; offset += INPUT_SLICE_SIZE) {
        let output;
        try {
            output = zstd.decompressChunk(data.subarray(offset, offset + INPUT_SLICE_SIZE));
        } catch (err) {
            if (/dictionary/i.test(err.message))
                throw new OperationError("Failed to decompress: the input was compressed with a dictionary, which is not supported.");
            throw new OperationError("Failed to decompress: the input is not valid Zstandard data.");
        }

        totalSize += output.length;
        if (totalSize > MAX_OUTPUT_SIZE)
            throw new OperationError("Failed to decompress: the input decompresses to more than 512MiB.");
        outputs.push(output);
    }

    try {
        zstd.decompressEnd();
    } catch (err) {
        throw new OperationError("Failed to decompress: the input ends part way through a Zstandard frame.");
    }

    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (const output of outputs) {
        result.set(output, offset);
        offset += output.length;
    }
    return result.buffer;
}
