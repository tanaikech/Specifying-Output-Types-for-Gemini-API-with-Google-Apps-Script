function sample2() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return one randam number.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}