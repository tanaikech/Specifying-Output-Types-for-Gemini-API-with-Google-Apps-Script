function sample1() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return one randam word.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}
