import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAstraStars } from "./parse-astra";

describe("parseAstraStars", () => {
  it("空欄はASTRAなしとして扱う", () => {
    for (const value of [null, undefined, "", "  "]) {
      assert.equal(parseAstraStars(value), undefined);
    }
  });

  it("数値と文字列の単独ASTRAを配列にする", () => {
    assert.deepEqual(parseAstraStars(2), [2]);
    assert.deepEqual(parseAstraStars("4"), [4]);
  });

  it("カンマ区切りの複数ASTRAを読み取る", () => {
    assert.deepEqual(parseAstraStars("1,3"), [1, 3]);
    assert.deepEqual(parseAstraStars(" 3, 4 "), [3, 4]);
    assert.deepEqual(parseAstraStars("１，３"), [1, 3]);
  });

  it("範囲外、小数、空の要素、不正な区切りを拒否する", () => {
    for (const value of [0, 5, 1.5, "1,5", "1,,3", "1,", ",3", "1/3", "abc"]) {
      assert.throws(() => parseAstraStars(value), /ASTRAは1〜4の整数/);
    }
  });
});
