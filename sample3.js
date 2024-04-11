function sample3() {
  const apiKey = "###"; // Please set your API key.
  const q = "Return 10 randam texts as an array.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}