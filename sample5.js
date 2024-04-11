function sample5() {
  const apiKey = "###"; // Please set your API key.
  const q =
    "Return the current population of Kyoto, Osaka, Aichi, Fukuoka, Tokyo in Japan as JSON data with the format that the key and values are the prefecture name and the population, respectively.";

  const res = new Gemini(apiKey).run(q);
  console.log(res);
}