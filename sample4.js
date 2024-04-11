function sample4() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "Think of 5 random animals and each size (meter), and return the result as JSON data with the format that the key and values are the name of the animal and the size, respectively.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}