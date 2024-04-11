function sample6() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "The longest river in the world is the Nile River. Return the result as a boolean.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}