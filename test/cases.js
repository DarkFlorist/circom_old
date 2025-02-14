import { describe, it } from 'micro-should';
import { deepStrictEqual, rejects } from 'node:assert';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import compiler from '../index.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;

const assert = function(clause) { deepStrictEqual(true, clause) };

describe("Sum test", () => {
    it("Should compile a code with an undefined if", async () => {
        await compiler(path.join(__dirname, "circuits", "undefinedif.circom"));
    });
    it("Should compile a code with vars inside a for", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "forvariables.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": 111});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(114)));
        assert(witness[2].equals(bigInt(111)));

    });
    it("Should compile a code with an undefined if", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "mixvarsignal.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "i": 111});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(111*111)));
        assert(witness[2].equals(bigInt(111)));
    });
   it("Should assign signal ERROR", async () => {
        await rejects(() => compiler(path.join(__dirname, 'circuits', 'assignsignal.circom')), {
            message: /Cannot assign to a signal .*/,
        });
   });
    it("Should compile a code with compute", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "compute.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "x": 6});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(37)));
        assert(witness[2].equals(bigInt(6)));
    });
    it("Should compile a code with compute", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "inout.circom"));

        deepStrictEqual(cirDef.constraints.length, 1);
    });
});

it.runWhen(import.meta.url);
