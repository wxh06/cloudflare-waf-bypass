#![feature(test)]

use sha1::{Digest, Sha1};
use std::fmt::Write;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn work(input: &str) -> String {
    let mut i = 0;
    let mut result = String::with_capacity(27);
    loop {
        result.clear();
        write!(&mut result, "{}_{}", i, input).unwrap();
        let mut sha1 = Sha1::new();
        sha1.update(result.as_bytes());
        let hash = sha1.finalize();
        if hash[0] == 0 && hash[1] == 0 {
            break;
        }
        i += 1;
    }
    result
}

#[cfg(test)]
mod tests {
    extern crate test;
    use super::*;
    use test::Bencher;

    fn expect(result: &str) {
        let (_, input) = result.split_once("_").unwrap();
        assert_eq!(work(input), result);
    }

    #[test]
    fn test_6827c49af90e7bc15e58() {
        expect("183500_6827c49af90e7bc15e58");
    }
    #[test]
    fn test_4040e35ca300b6d7212c() {
        expect("208354_4040e35ca300b6d7212c");
    }

    #[bench]
    fn bench_0(b: &mut Bencher) {
        b.iter(|| work("f0c994b8e3c3ab239214"));
    }
    #[bench]
    fn bench_758464(b: &mut Bencher) {
        b.iter(|| work("4f18bbfc3f410e67c1c2"));
    }
}
